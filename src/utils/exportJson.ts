import type { TransactionRow } from './textParser';

/**
 * Exports transaction data to a JSON file with specified header keys
 */
export const exportToJson = (transactions: TransactionRow[], filename: string = 'transactions.json') => {
    // Map the data to use the exact header keys requested
    const formattedData = transactions.map(row => ({
        'Date': row.date,
        'Transaction': row.transactionReference,
        'Reference': row.transactionReference, // Same as Transaction
        'Ref.No./Chq.No.': row.refNoOrChqNo,
        'Credit': row.credit,
        'Debit': row.debit,
        'Balance': row.balance
    }));

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(formattedData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
