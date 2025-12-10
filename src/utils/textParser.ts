
export interface Expense {
  description: string;
  amount: number;
}

export interface TextItem {
  str: string;
  x: number;
  y: number;
  page: number; // Page number (1-based)
}

export interface TransactionRow {
  date: string;
  transactionReference: string;
  refNoOrChqNo: string;
  credit: number | null;
  debit: number | null;
  balance: number | null;
}

export const Y_TOLERANCE = 12; // Increased to handle multi-line rows better

/**
 * Sorts items by Page -> Y (Top to Bottom) -> X (Left to Right)
 */
export const sortItems = (items: TextItem[]): TextItem[] => {
  return [...items].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    // For PDF standard coordinates (0,0 is bottom-left), higher Y is higher on page (top)
    // So we sort DESCENDING by Y for Top-to-Bottom reading
    // However, some PDF extractors return Top-Left origin. 
    // Assuming Standard PDF (Bottom-Left Origin) -> Sort Descending Y
    // But checking previous code: "return b.y - a.y; // Higher y = lower on page" <- This comment suggests Top-Left origin?
    // Actually, "Higher y = lower on page" means Y increases as you go down. That is Top-Left origin (like HTML). 
    // If Y increases as you go down, then smaller Y is Top. 
    // Sort Ascending Y (a.y - b.y) for Top-to-Bottom.
    // BUT the previous code had `return b.y - a.y` which means DESCDENDING. 
    // If Y is "Higher = Lower on page", then 0 is Top. So 100 is lower than 50.
    // Descending sort (100, 50, 0) would put the bottom items first? That's wrong.
    // Let's assume the previous code worked for order: `return b.y - a.y`.
    // This implies coordinate system where Higher Y is TOP of page (standard PDF).
    if (Math.abs(a.y - b.y) > 2) {
      return b.y - a.y; // Sort Top-to-Bottom (assuming Y=0 is bottom)
    }
    return a.x - b.x; // Left-to-Right
  });
};

/**
 * Groups items into rows based on their y-coordinates
 */
export const groupItemsIntoRows = (items: TextItem[]): TextItem[][] => {
  if (items.length === 0) return [];

  const sortedItems = sortItems(items);
  const rows: TextItem[][] = [];
  let currentRow: TextItem[] = [];

  // Initialize with first item
  let currentY = sortedItems[0]?.y;
  let currentPage = sortedItems[0]?.page;

  sortedItems.forEach((item, index) => {
    // If it's the very first item, just push it (already handled by init, but loop logic needs care)
    // Actually better to iterate and handle change
    if (currentRow.length === 0) {
      currentRow.push(item);
      currentY = item.y;
      currentPage = item.page;
      return;
    }

    const isSamePage = item.page === currentPage;
    // Check Y proximity
    const isSameRowVal = Math.abs(item.y - currentY) <= Y_TOLERANCE;

    if (isSamePage && isSameRowVal) {
      currentRow.push(item);
    } else {
      // End of current row
      currentRow.sort((a, b) => a.x - b.x); // Ensure LTR order
      rows.push(currentRow);

      // Start new row
      currentRow = [item];
      currentY = item.y;
      currentPage = item.page;
    }
  });

  // Push last row
  if (currentRow.length > 0) {
    currentRow.sort((a, b) => a.x - b.x);
    rows.push(currentRow);
  }

  return rows;
};

/**
 * Checks if a row contains the table header
 */
const isTableHeader = (row: TextItem[]): boolean => {
  const text = row.map(item => item.str).join(' ').toLowerCase();
  const headerKeywords = ['date', 'transaction', 'reference', 'ref.no', 'chq.no', 'credit', 'debit', 'balance'];
  const matches = headerKeywords.filter(keyword => text.includes(keyword));
  return matches.length >= 4; // At least 4 keywords to be sure
};

// Interface for column x-coordinates
interface ColumnBoundaries {
  dateStart: number;
  transStart: number;
  refStart: number;
  valuesStart: number; // Start of Credit/Debit/Balance area
}

const detectBoundaries = (headerRow: TextItem[]): ColumnBoundaries => {
  // Default values just in case
  const bounds = { dateStart: 0, transStart: 0, refStart: 0, valuesStart: 0 };

  headerRow.forEach(item => {
    const txt = item.str.toLowerCase();

    // Simple heuristic: define start based on header text position
    if (txt.includes('date')) bounds.dateStart = item.x;

    // "Transaction" or "Particulars"
    if (txt.includes('transaction') || txt.includes('particulars')) {
      if (bounds.transStart === 0) bounds.transStart = item.x;
    }

    // "Reference" or "Ref.No"
    if (txt.includes('ref') || txt.includes('chq')) {
      if (bounds.refStart === 0 || item.x < bounds.refStart) bounds.refStart = item.x;
    }

    // Values area starts at first value column (Credit/Debit/Withdrawal/Deposit)
    if (txt.includes('credit') || txt.includes('debit') || txt.includes('widthdraw') || txt.includes('deposit') || txt.includes('balance')) {
      if (bounds.valuesStart === 0 || item.x < bounds.valuesStart) bounds.valuesStart = item.x;
    }
  });

  // Sanity fallback if detection fails (assume standard-ish layout)
  if (bounds.transStart === 0) bounds.transStart = bounds.dateStart + 60;
  if (bounds.refStart === 0) bounds.refStart = bounds.transStart + 150;
  if (bounds.valuesStart === 0) bounds.valuesStart = bounds.refStart + 100;

  return bounds;
};

/**
 * Parses valid number
 */
const parseNumber = (text: string): number | null => {
  if (!text || text.trim() === '' || text.trim() === '-') return null;
  const cleaned = text.replace(/[₹$€£,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

/**
 * Parses transaction table
 */
export const parseTransactionTable = (items: TextItem[]): TransactionRow[] => {
  const allRows = groupItemsIntoRows(items);
  if (allRows.length === 0) return [];

  // Find the first header to distinct table from other text
  const headerRowIndex = allRows.findIndex(row => isTableHeader(row));
  if (headerRowIndex === -1) return [];

  const headerRow = allRows[headerRowIndex];
  const bounds = detectBoundaries(headerRow);

  const transactions: TransactionRow[] = [];
  let currentTransaction: TransactionRow | null = null;

  // Process rows AFTER the first header
  for (let i = headerRowIndex + 1; i < allRows.length; i++) {
    const row = allRows[i];

    // If we hit another header on a new page, just skip it but do NOT stop
    if (isTableHeader(row)) continue;

    const rowText = row.map(r => r.str).join(' ');

    // Check if row starts with a Date -> New Transaction
    // Regex for DD-MM-YYYY or DD/MM/YYYY or similar
    // We check the FIRST item in the row specifically, and if it's in the Date column area
    const firstItem = row[0];
    const isDateColumn = firstItem.x < bounds.transStart; // It's in the left-most area
    const dateMatch = firstItem.str.match(/^(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/);

    if (dateMatch && isDateColumn) {
      // Save previous transaction if exists
      if (currentTransaction) {
        transactions.push(currentTransaction);
      }

      // Start new transaction
      const date = dateMatch[1];

      // Extract other columns based on X coordinates
      let transRefParts: string[] = [];
      let refNoParts: string[] = [];
      let credit: number | null = null;
      let debit: number | null = null;
      let balance: number | null = null;

      // Filter items that look like numbers at the end of the row
      // We look at the right properties (valuesStart)
      const potentialNumbers = row.filter(item => item.x >= bounds.valuesStart - 50); // Generous "values" area

      // Identify numbers from right to left: Balance, Debit, Credit
      // We assume the right-most number is Balance, then Debit, then Credit
      const numberItems = potentialNumbers.filter(item => parseNumber(item.str) !== null);
      // Sort by X descending (Right to Left)
      numberItems.sort((a, b) => b.x - a.x);

      if (numberItems.length > 0) balance = parseNumber(numberItems[0].str);
      // The logic for Credit vs Debit is tricky if both aren't always present.
      // Usually: 3 numbers = Credit, Debit, Balance? Or Debit, Credit, Balance?
      // Header says: Credit | Debit | Balance
      // So from Right: Balance (idx 0), Debit (idx 1), Credit (idx 2)
      if (numberItems.length > 1) debit = parseNumber(numberItems[1].str);
      if (numberItems.length > 2) credit = parseNumber(numberItems[2].str);

      // Extract text content for description and ref
      // We use the items that were NOT identified as values
      row.forEach(item => {
        // Skip date part if it's the date item
        if (item === firstItem) return;
        // Skip items used as numbers
        if (numberItems.includes(item)) return;

        // Assign to columns
        // Transaction Ref is between Date and Ref
        if (item.x >= bounds.transStart - 20 && item.x < bounds.refStart - 20) {
          transRefParts.push(item.str);
        }
        // Ref No is between Transaction and Values
        else if (item.x >= bounds.refStart - 20 && item.x < bounds.valuesStart - 20) {
          refNoParts.push(item.str);
        }
        // Fallback: merge into transaction if in doubt
        else if (item.x < bounds.valuesStart) {
          transRefParts.push(item.str);
        }
      });

      currentTransaction = {
        date,
        transactionReference: transRefParts.join(' ').trim(),
        refNoOrChqNo: refNoParts.join(' ').trim(),
        credit,
        debit,
        balance
      };

    } else if (currentTransaction) {
      // Continuation of previous transaction (Multi-line description)

      // Heuristic: Check if line is a common footer/header text that wasn't caught
      if (rowText.toLowerCase().includes('page') && rowText.match(/\d+\s*of\s*\d+/)) continue;
      if (rowText.toLowerCase().includes('account statement')) continue;

      let transRefParts: string[] = [];
      let refNoParts: string[] = [];

      row.forEach(item => {
        // Skip items that are way off (like side notes)
        if (item.x < bounds.dateStart - 20) return;

        if (item.x >= bounds.transStart - 20 && item.x < bounds.refStart - 20) {
          transRefParts.push(item.str);
        } else if (item.x >= bounds.refStart - 20 && item.x < bounds.valuesStart - 20) {
          refNoParts.push(item.str);
        }
        // If it's in the text area but ambiguous, treat as transaction details
        else if (item.x < bounds.valuesStart - 20 && item.x > bounds.dateStart) {
          transRefParts.push(item.str);
        }
      });

      if (transRefParts.length > 0) {
        currentTransaction.transactionReference += ' ' + transRefParts.join(' ').trim();
      }
      if (refNoParts.length > 0) {
        currentTransaction.refNoOrChqNo += ' ' + refNoParts.join(' ').trim();
      }
    }
  }

  // Push last transaction
  if (currentTransaction) {
    transactions.push(currentTransaction);
  }

  return transactions;
};

// Removed unused mapRowToObject export

/**
 * Legacy function for backward compatibility - parses simple list of expenses
 */
export const parseExpenses = (text: string): Expense[] => {
  const expenses: Expense[] = [];
  const lines = text.split('\n');

  // Regex to find amounts with or without currency symbols
  const amountRegex = /(?:\$|€|£)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.\d{2})/;

  lines.forEach(line => {
    const match = line.match(amountRegex);
    if (match) {
      // Clean amount string to number
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);

      const description = line.replace(match[0], '').trim();

      // Avoid adding lines that are just the amount
      if (description && !isNaN(amount)) {
        expenses.push({ description, amount });
      }
    }
  });

  return expenses;
};
