import React, { useState } from 'react';
import type { Expense, TransactionRow } from '../utils/textParser';
import { exportToJson } from '../utils/exportJson';

interface PdfDisplayProps {
  extractedText: string;
  expenses: Expense[];
  transactionRows: TransactionRow[];
}

const PdfDisplay: React.FC<PdfDisplayProps> = ({ extractedText, expenses, transactionRows }) => {
  const [showRawText, setShowRawText] = useState(false);

  if (!extractedText) {
    return null;
  }

  const formatNumber = (value: number | null): string => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  const handleExportJson = () => {
    if (transactionRows.length > 0) {
      exportToJson(transactionRows, 'transactions.json');
    }
  };

  return (
    <div className="card">
      <h2>Extracted Transaction Table</h2>
      {transactionRows.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Transaction Reference</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Ref.No./Chq.No.</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Credit</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Debit</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactionRows.map((row, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.date}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.transactionReference}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.refNoOrChqNo}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(row.credit)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(row.debit)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatNumber(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleExportJson}
            className="export-json-btn"
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Export to JSON
          </button>
        </div>
      ) : expenses.length > 0 ? (
        <div>
          <h3>Extracted Expenses (Fallback)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{expense.description}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No transactions found. Please check if the PDF contains a table with the expected headers.</p>
      )}

      <button onClick={() => setShowRawText(!showRawText)} className="toggle-raw-text">
        {showRawText ? 'Hide' : 'Show'} Raw Text
      </button>

      {showRawText && (
        <div>
          <h3>Raw Extracted Text</h3>
          <pre style={{ maxHeight: '400px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PdfDisplay;
