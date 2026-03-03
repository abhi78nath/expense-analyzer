import { useState } from 'react';
import './App.css';
import { pdfjs } from 'react-pdf';
import UploadScreen from './components/upload/UploadScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import { parsePdfWithPython } from './utils/api';
import type { TransactionRow } from './utils/textParser';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasResults, setHasResults] = useState<boolean>(false);

  const handleAnalyze = async (file: File, password?: string) => {
    setIsParsing(true);
    setErrorMessage('');
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
      setHasResults(true);
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

  const handleBackToUpload = () => {
    setHasResults(false);
    setTransactionRows([]);
    setErrorMessage('');
  };

  if (hasResults) {
    return (
      <DashboardScreen
        transactions={transactionRows}
        onBackToUpload={handleBackToUpload}
      />
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
