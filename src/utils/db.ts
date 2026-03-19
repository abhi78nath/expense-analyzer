const DB_NAME = "ExpenseAnalyzerDB";
const DB_VERSION = 2;

// ─── Types ────────────────────────────────────────────────────

export interface StatementRecord {
    id: string;
    userId: string;
    fileName: string;
    uploadedAt: string;
    bankName: string;
    periodStart: string;
    periodEnd: string;
    totalCredit: number;
    totalDebit: number;
    currency: string;
}

export interface TransactionRecord {
    id: string;
    userId: string;
    statementId: string;
    date: string;
    description: string;
    amount: number;
    type: "credit" | "debit";
    tag: string | null;
    tagSource: "auto" | "manual";
    balance: number | null;
    rawText: string;
    note: string | null;
}

export interface TagRuleRecord {
    id: string;
    userId: string;
    tag: string;
    keywords: string[];
    matchType: "contains" | "regex";
    priority: number;
    source: "sheet" | "user";
    updatedAt: string;
}

export interface DashboardSummary {
    totalCredit: number;
    totalDebit: number;
    balance: number;
    byTag: Record<string, { credit: number; debit: number }>;
    byMonth: Record<string, { credit: number; debit: number }>;
}

export interface BackendTransaction {
    date: string;        // "DD-MM-YY"
    "transaction reference": string;
    "ref.no/chq.no": string;
    ref_keys: string[];
    category: string;
    tag: string;
    debit: number | null;
    credit: number | null;
    balance: number | null;
    pdf_id: string;
}

// ─── Singleton connection ─────────────────────────────────────
// initDB() is called once. Every helper re-uses the same connection.

let _db: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
    if (_db) return Promise.resolve(_db);

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const oldVersion = event.oldVersion;
            const txn = (event.target as IDBOpenDBRequest).transaction!;

            // v1 — create all three stores
            if (oldVersion < 1) {
                db.createObjectStore("statements", { keyPath: "id" });
                db.createObjectStore("transactions", { keyPath: "id" });
                db.createObjectStore("tag_rules", { keyPath: "id" });
            }

            // v2 — add userId indexes + compound indexes
            if (oldVersion < 2) {
                const stmtStore = txn.objectStore("statements");
                stmtStore.createIndex("by_user", "userId", { unique: false });

                const txStore = txn.objectStore("transactions");
                txStore.createIndex("by_user", "userId", { unique: false });
                txStore.createIndex("by_user_statementId", ["userId", "statementId"], { unique: false });
                txStore.createIndex("by_user_date", ["userId", "date"], { unique: false });
                txStore.createIndex("by_user_tag", ["userId", "tag"], { unique: false });

                const ruleStore = txn.objectStore("tag_rules");
                ruleStore.createIndex("by_user", "userId", { unique: false });
                ruleStore.createIndex("by_user_tag", ["userId", "tag"], { unique: false });
            }

            // if (oldVersion < 3) { ... future migrations here }
        };

        req.onsuccess = () => {
            _db = req.result;

            _db.onversionchange = () => {
                _db?.close();
                _db = null;
                console.warn("[db] Connection closed — another tab triggered a migration. Reload to reconnect.");
            };

            resolve(_db);
        };

        req.onerror = () => reject(req.error);
        req.onblocked = () => console.warn("[db] DB open blocked — close other tabs and retry.");
    });
}

// ─── Generic helpers ──────────────────────────────────────────

function promisify<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function waitTxn(t: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        t.oncomplete = () => resolve();
        t.onerror = () => reject(t.error);
    });
}

function getAllByIndex<T>(
    store: IDBObjectStore,
    indexName: string,
    key: IDBValidKey | IDBKeyRange
): Promise<T[]> {
    return promisify<T[]>(store.index(indexName).getAll(key));
}

// ─────────────────────────────────────────────────────────────
//  STATEMENTS
// ─────────────────────────────────────────────────────────────

export async function saveStatementRecord(record: StatementRecord): Promise<void> {
    if (!record.userId) {
        console.warn("[db] Cannot save statement — userId is empty");
        return;
    }
    const db = await initDB();
    const t = db.transaction("statements", "readwrite");
    t.objectStore("statements").put(record);
    await waitTxn(t);
}

export async function getStatementRecordsByUserId(userId: string): Promise<StatementRecord[]> {
    if (!userId) return [];
    const db = await initDB();
    const store = db.transaction("statements").objectStore("statements");
    return getAllByIndex<StatementRecord>(store, "by_user", IDBKeyRange.only(userId));
}

export async function getStatementRecord(id: string): Promise<StatementRecord | undefined> {
    const db = await initDB();
    return promisify<StatementRecord | undefined>(
        db.transaction("statements").objectStore("statements").get(id)
    );
}

/**
 * Deletes a statement AND all its transactions atomically.
 * IndexedDB has no cascade — we do it manually in one transaction.
 */
export async function deleteStatementRecord(userId: string, statementId: string): Promise<void> {
    const db = await initDB();
    const t = db.transaction(["statements", "transactions"], "readwrite");
    const txStore = t.objectStore("transactions");

    // Find all transaction keys belonging to this statement
    const keys = await promisify<IDBValidKey[]>(
        txStore
            .index("by_user_statementId")
            .getAllKeys(IDBKeyRange.only([userId, statementId]))
    );

    // Delete each transaction first (children before parent)
    keys.forEach((key) => txStore.delete(key));

    // Then delete the statement itself
    t.objectStore("statements").delete(statementId);

    await waitTxn(t);
}

/**
 * Checks if a statement for the same bank + period already exists.
 * Call this before saving to prevent duplicate uploads.
 */
export async function findDuplicateStatement(
    userId: string,
    bankName: string,
    periodStart: string,
    periodEnd: string
): Promise<StatementRecord | undefined> {
    const all = await getStatementRecordsByUserId(userId);
    return all.find(
        (s) =>
            s.bankName === bankName &&
            s.periodStart === periodStart &&
            s.periodEnd === periodEnd
    );
}

// ─────────────────────────────────────────────────────────────
//  TRANSACTIONS
// ─────────────────────────────────────────────────────────────

export async function saveTransactions(rows: TransactionRecord[]): Promise<void> {
    if (!rows.length) return;
    const db = await initDB();
    const t = db.transaction("transactions", "readwrite");
    const store = t.objectStore("transactions");
    rows.forEach((row) => store.put(row));
    await waitTxn(t);
}

export async function getAllTransactions(userId: string): Promise<TransactionRecord[]> {
    if (!userId) return [];
    const db = await initDB();
    const store = db.transaction("transactions").objectStore("transactions");
    return getAllByIndex<TransactionRecord>(store, "by_user", IDBKeyRange.only(userId));
}

export async function getTransactionsByStatement(
    userId: string,
    statementId: string
): Promise<TransactionRecord[]> {
    const db = await initDB();
    const store = db.transaction("transactions").objectStore("transactions");
    return getAllByIndex<TransactionRecord>(
        store,
        "by_user_statementId",
        IDBKeyRange.only([userId, statementId])
    );
}

export async function getTransactionsByDateRange(
    userId: string,
    from: string,
    to: string
): Promise<TransactionRecord[]> {
    const db = await initDB();
    const store = db.transaction("transactions").objectStore("transactions");
    return getAllByIndex<TransactionRecord>(
        store,
        "by_user_date",
        IDBKeyRange.bound([userId, from], [userId, to])
    );
}

export async function updateTransactionTag(
    userId: string,
    id: string,
    tag: string | null
): Promise<void> {
    const db = await initDB();
    const store = db.transaction("transactions", "readwrite").objectStore("transactions");
    const row = await promisify<TransactionRecord | undefined>(store.get(id));
    if (!row || row.userId !== userId) throw new Error(`Transaction ${id} not found for user`);
    await promisify(store.put({ ...row, tag, tagSource: "manual" }));
}

export async function updateTransactionNote(
    userId: string,
    id: string,
    note: string | null
): Promise<void> {
    const db = await initDB();
    const store = db.transaction("transactions", "readwrite").objectStore("transactions");
    const row = await promisify<TransactionRecord | undefined>(store.get(id));
    if (!row || row.userId !== userId) throw new Error(`Transaction ${id} not found for user`);
    await promisify(store.put({ ...row, note }));
}

// ─────────────────────────────────────────────────────────────
//  TAG RULES
// ─────────────────────────────────────────────────────────────

export async function getAllTagRules(userId: string): Promise<TagRuleRecord[]> {
    if (!userId) return [];
    const db = await initDB();
    const store = db.transaction("tag_rules").objectStore("tag_rules");
    return getAllByIndex<TagRuleRecord>(store, "by_user", IDBKeyRange.only(userId));
}

export async function saveTagRules(rules: TagRuleRecord[]): Promise<void> {
    if (!rules.length) return;
    const db = await initDB();
    const t = db.transaction("tag_rules", "readwrite");
    const store = t.objectStore("tag_rules");
    rules.forEach((r) => store.put(r));
    await waitTxn(t);
}

/**
 * Replaces all sheet-sourced rules for this user atomically.
 * User-defined rules are never touched.
 */
export async function syncSheetRules(
    userId: string,
    incoming: Omit<TagRuleRecord, "userId">[]
): Promise<void> {
    const existing = await getAllTagRules(userId);
    const sheetIds = existing.filter((r) => r.source === "sheet").map((r) => r.id);

    const db = await initDB();
    const t = db.transaction("tag_rules", "readwrite");
    const store = t.objectStore("tag_rules");

    sheetIds.forEach((id) => store.delete(id));
    incoming.forEach((r) => store.put({ ...r, userId, source: "sheet" }));

    await waitTxn(t);
}

export async function deleteTagRule(userId: string, id: string): Promise<void> {
    const db = await initDB();
    const store = db.transaction("tag_rules", "readwrite").objectStore("tag_rules");
    const rule = await promisify<TagRuleRecord | undefined>(store.get(id));
    if (!rule || rule.userId !== userId) throw new Error(`Rule ${id} not found for user`);
    await promisify(store.delete(id));
}

/**
 * Re-tags all auto-tagged transactions using current rules.
 * Manual tags are never overwritten.
 */
export async function reTagAutoTransactions(
    userId: string,
    rules: TagRuleRecord[]
): Promise<void> {
    const all = await getAllTransactions(userId);
    const auto = all.filter((r) => r.tagSource === "auto" || r.tag === null);
    if (!auto.length) return;

    const sorted = [...rules].sort((a, b) => b.priority - a.priority);
    const db = await initDB();
    const t = db.transaction("transactions", "readwrite");
    const store = t.objectStore("transactions");

    auto.forEach((row) => {
        const matched = sorted.find((rule) => matchesRule(row.rawText, rule));
        store.put({ ...row, tag: matched?.tag ?? null, tagSource: "auto" });
    });

    await waitTxn(t);
}

function matchesRule(text: string, rule: TagRuleRecord): boolean {
    const haystack = text.toLowerCase();
    if (rule.matchType === "regex") {
        return rule.keywords.some((kw) => {
            try { return new RegExp(kw, "i").test(haystack); }
            catch { return false; }
        });
    }
    return rule.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

// ─────────────────────────────────────────────────────────────
//  CLEAR USER DATA  (call on sign-out)
// ─────────────────────────────────────────────────────────────

export async function clearUserData(userId: string): Promise<void> {
    const db = await initDB();

    async function deleteFromStore(storeName: string, indexName: string) {
        const t = db.transaction(storeName, "readwrite");
        const store = t.objectStore(storeName);
        const keys = await promisify<IDBValidKey[]>(
            store.index(indexName).getAllKeys(IDBKeyRange.only(userId))
        );
        keys.forEach((key) => store.delete(key));
        await waitTxn(t);
    }

    await deleteFromStore("transactions", "by_user");
    await deleteFromStore("statements", "by_user");
    await deleteFromStore("tag_rules", "by_user");
}

// ─────────────────────────────────────────────────────────────
//  DASHBOARD AGGREGATES
// ─────────────────────────────────────────────────────────────

export async function computeDashboardSummary(
    userId: string,
    statementId?: string
): Promise<DashboardSummary> {
    const rows = statementId
        ? await getTransactionsByStatement(userId, statementId)
        : await getAllTransactions(userId);

    const summary: DashboardSummary = {
        totalCredit: 0,
        totalDebit: 0,
        balance: 0,
        byTag: {},
        byMonth: {},
    };

    for (const row of rows) {
        const isCredit = row.type === "credit";
        const amt = row.amount;
        const tag = row.tag ?? "Untagged";
        const month = row.date.slice(0, 7);

        if (isCredit) summary.totalCredit += amt;
        else summary.totalDebit += amt;

        if (!summary.byTag[tag]) summary.byTag[tag] = { credit: 0, debit: 0 };
        if (!summary.byMonth[month]) summary.byMonth[month] = { credit: 0, debit: 0 };

        if (isCredit) {
            summary.byTag[tag].credit += amt;
            summary.byMonth[month].credit += amt;
        } else {
            summary.byTag[tag].debit += amt;
            summary.byMonth[month].debit += amt;
        }
    }

    summary.balance = summary.totalCredit - summary.totalDebit;
    return summary;
}

export function mapToTransactionRecord(
    raw: BackendTransaction,
    userId: string,
    statementId: string
): TransactionRecord {
    return {
        id: crypto.randomUUID(),
        userId,
        statementId,
        date: parseDateToISO(raw.date),
        description: raw["transaction reference"],
        amount: raw.debit ?? raw.credit ?? 0,
        type: raw.debit !== null ? "debit" : "credit",
        tag: raw.tag ?? null,
        tagSource: "auto",
        balance: raw.balance ?? null,
        rawText: raw["transaction reference"],
        note: null,
    };
}

function parseDateToISO(dateStr: string): string {
    // "02-02-24" → "2024-02-02"
    const [dd, mm, yy] = dateStr.split("-");
    return `20${yy}-${mm}-${dd}`;
}