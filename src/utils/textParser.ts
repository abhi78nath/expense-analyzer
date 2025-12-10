export interface Expense {
  description: string;
  amount: number;
}

export interface TextItem {
  str: string;
  x: number;
  y: number;
}

export interface TransactionRow {
  date: string;
  transactionReference: string;
  refNoOrChqNo: string;
  credit: number | null;
  debit: number | null;
  balance: number | null;
}

const Y_TOLERANCE = 3; // Pixels tolerance for grouping items into rows

/**
 * Groups items into rows based on their y-coordinates
 */
export const groupItemsIntoRows = (items: TextItem[]): TextItem[][] => {
  if (items.length === 0) return [];

  // Sort items by y-coordinate (top to bottom), then by x-coordinate (left to right)
  const sortedItems = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > Y_TOLERANCE) {
      return b.y - a.y; // Higher y = lower on page (top to bottom)
    }
    return a.x - b.x; // Left to right
  });

  const rows: TextItem[][] = [];
  let currentRow: TextItem[] = [];
  let currentY = sortedItems[0]?.y;

  sortedItems.forEach(item => {
    if (currentY === undefined || Math.abs(item.y - currentY) <= Y_TOLERANCE) {
      // Same row
      currentRow.push(item);
      currentY = item.y;
    } else {
      // New row
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [item];
      currentY = item.y;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

/**
 * Sorts items within a row by their x-coordinates (left to right)
 */
export const sortRowByColumns = (row: TextItem[]): TextItem[] => {
  return [...row].sort((a, b) => a.x - b.x);
};

/**
 * Checks if a row contains the table header
 */
const isTableHeader = (row: TextItem[]): boolean => {
  const text = row.map(item => item.str).join(' ').toLowerCase();
  const headerKeywords = ['date', 'transaction', 'reference', 'ref.no', 'chq.no', 'credit', 'debit', 'balance'];
  const matches = headerKeywords.filter(keyword => text.includes(keyword));
  return matches.length >= 5;
};

/**
 * Parses a number from text
 */
const parseNumber = (text: string): number | null => {
  if (!text || text.trim() === '' || text.trim() === '-') {
    return null;
  }
  const cleaned = text.replace(/[₹$€£,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

/**
 * Maps a row of text items into a TransactionRow object
 * Expected columns: Date, Transaction Reference, Ref.No./Chq.No., Credit, Debit, Balance
 */
export const mapRowToObject = (row: TextItem[]): TransactionRow | null => {
  // Sort row items by x-coordinate
  const sortedRow = sortRowByColumns(row);
  
  // Skip if we don't have enough items
  if (sortedRow.length < 3) {
    return null;
  }

  // Extract text values from sorted items
  const rowTexts = sortedRow.map(item => item.str.trim()).filter(str => str.length > 0);
  
  if (rowTexts.length === 0) {
    return null;
  }

  // Try to identify columns based on patterns
  // Date is usually first (format: DD-MM-YYYY or DD/MM/YYYY)
  const dateMatch = rowTexts[0].match(/^(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  if (!dateMatch) {
    return null; // Skip rows without dates
  }

  const date = dateMatch[1];
  
  // Last 3 columns are usually Credit, Debit, Balance (in that order)
  let credit: number | null = null;
  let debit: number | null = null;
  let balance: number | null = null;
  
  if (rowTexts.length >= 3) {
    balance = parseNumber(rowTexts[rowTexts.length - 1]);
    debit = parseNumber(rowTexts[rowTexts.length - 2]);
    credit = parseNumber(rowTexts[rowTexts.length - 3]);
  }

  // Middle columns are Transaction Reference and Ref.No./Chq.No.
  let transactionReference = '';
  let refNoOrChqNo = '';
  
  if (rowTexts.length >= 4) {
    // We have: Date, Transaction Reference, Ref.No./Chq.No., Credit, Debit, Balance
    // Or: Date, Transaction Reference (combined), Ref.No./Chq.No., Credit, Debit, Balance
    const middleStart = 1;
    const middleEnd = rowTexts.length - 3;
    
    if (middleEnd > middleStart) {
      // Transaction Reference might be multiple columns combined
      transactionReference = rowTexts.slice(middleStart, middleEnd - 1).join(' ').trim();
      refNoOrChqNo = rowTexts[middleEnd - 1] || '';
    } else if (middleEnd === middleStart) {
      transactionReference = rowTexts[middleStart] || '';
    }
  } else if (rowTexts.length === 3) {
    // Only Date, one middle column, and Balance
    transactionReference = rowTexts[1] || '';
  }

  return {
    date,
    transactionReference,
    refNoOrChqNo,
    credit,
    debit,
    balance
  };
};

/**
 * Parses transaction table from text items with positions
 */
export const parseTransactionTable = (items: TextItem[]): TransactionRow[] => {
  const rows = groupItemsIntoRows(items);
  
  if (rows.length === 0) {
    return [];
  }

  // Find header row
  let headerIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (isTableHeader(rows[i])) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return [];
  }

  // Parse data rows after header
  const transactionRows: TransactionRow[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    // Skip if this looks like another header
    if (isTableHeader(rows[i])) {
      break;
    }
    
    const row = mapRowToObject(rows[i]);
    if (row) {
      transactionRows.push(row);
    }
  }

  return transactionRows;
};

/**
 * Legacy function for backward compatibility
 */
export const parseExpenses = (text: string): Expense[] => {
  const expenses: Expense[] = [];
  const lines = text.split('\n');
  
  // Regex to find amounts with or without currency symbols
  const amountRegex = /(?:\$|€|£)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.\d{2})/;

  lines.forEach(line => {
    const match = line.match(amountRegex);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const description = line.replace(match[0], '').trim();
      
      // Avoid adding lines that are just the amount
      if (description) {
        expenses.push({ description, amount });
      }
    }
  });

  return expenses;
};
