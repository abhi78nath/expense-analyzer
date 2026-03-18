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

const DB_NAME = 'ExpenseAnalyzerDB';
const DB_VERSION = 1;
const STORE_NAME = 'statements';

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event);
            reject('Error opening IndexedDB');
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // We use 'id' as the primary key
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                // Create an index to query by userId later if needed
                store.createIndex('userId', 'userId', { unique: false });
            }
        };
    });
};

export const saveStatementRecord = async (record: StatementRecord): Promise<void> => {
    if (!record.userId) {
        console.warn('Cannot save statement record: userId is null or empty');
        return;
    }

    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(record);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error saving statement record:', event);
                reject('Error saving statement record');
            };
        });
    } catch (error) {
        console.error('Failed to initialize DB to save record:', error);
        throw error;
    }
};

export const getStatementRecordsByUserId = async (userId: string): Promise<StatementRecord[]> => {
    if (!userId) {
        return [];
    }

    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = (event) => {
                resolve((event.target as IDBRequest).result);
            };

            request.onerror = (event) => {
                console.error('Error fetching statement records:', event);
                reject('Error fetching statement records');
            };
        });
    } catch (error) {
        console.error('Failed to initialize DB to fetch records:', error);
        throw error;
    }
};

export const deleteStatementRecord = async (id: string): Promise<void> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error deleting statement record:', event);
                reject('Error deleting statement record');
            };
        });
    } catch (error) {
        console.error('Failed to initialize DB to delete record:', error);
        throw error;
    }
};
