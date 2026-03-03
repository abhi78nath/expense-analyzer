import { useState } from 'react';
import './App.css';
import { pdfjs } from 'react-pdf';
import UploadScreen from './components/upload/UploadScreen';
import PdfDisplay from './components/PdfDisplay';
import { parsePdfWithPython } from './utils/api';
import type { TransactionRow, Expense } from './utils/textParser';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasResults, setHasResults] = useState<boolean>(false);

  const handleAnalyze = async (file: File, password?: string) => {
    setIsParsing(true);
    setErrorMessage('');
    setExtractedText(password ? 'Analysing with password...' : 'Checking PDF protection...');
    setExpenses([]);
    setTransactionRows([]);

    try {
      // Proactive check: detect encryption via pdf.js
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer, password });

      try {
        await loadingTask.promise;
      } catch (pdfError: any) {
        if (
          pdfError.name === 'PasswordException' ||
          (pdfError.message && pdfError.message.toLowerCase().includes('password'))
        ) {
          setErrorMessage('This PDF is password protected. Please provide the correct password.');
          setIsParsing(false);
          return;
        }
        throw pdfError;
      }

      setExtractedText('PDF unlocked. Analysing with Python API...');

      const response = await parsePdfWithPython(file, password);

      const rows: TransactionRow[] = response.transactions.map((t: any) => ({
        date: String(t["date"] || ""),
        transactionReference: String(t["transaction reference"] || ""),
        refNoOrChqNo: String(t["ref.no/chq.no"] || ""),
        debit: typeof t["debit"] === "number" ? t["debit"] : null,
        credit: typeof t["credit"] === "number" ? t["credit"] : null,
        balance: typeof t["balance"] === "number" ? t["balance"] : null,
      }));

      setTransactionRows(rows);
      setExtractedText(`Successfully parsed ${rows.length} transactions.`);
      setHasResults(true);

      if (rows.length === 0) {
        setExtractedText('No transactions found in the PDF.');
      }
    } catch (error: any) {
      console.error('Error parsing PDF:', error);

      if (error.message?.includes('401') || error.message?.toLowerCase().includes('password')) {
        setErrorMessage('Password failed. Please try again.');
      } else {
        setErrorMessage(error.message || 'Failed to parse PDF.');
      }
    } finally {
      setIsParsing(false);
    }
  };

  if (hasResults) {
    return (
      <div className="container">
        <button
          onClick={() => {
            setHasResults(false);
            setTransactionRows([]);
            setExpenses([]);
            setExtractedText('');
            setErrorMessage('');
          }}
          className="mb-4 rounded-lg border border-[#334155] bg-[#1e293b] px-4 py-2 text-sm text-[#94a3b8] hover:bg-[#334155] transition-colors"
        >
          ← Upload another file
        </button>
        <PdfDisplay
          extractedText={extractedText}
          expenses={expenses}
          transactionRows={transactionRows}
        />
      </div>
    );
  }

  return (
    <UploadScreen
      onAnalyze={handleAnalyze}
      isLoading={isParsing}
      errorMessage={errorMessage}
    />
  );
}

export default App;
