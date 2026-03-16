import { useState, useEffect } from 'react';
import './App.css';
import { pdfjs } from 'react-pdf';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setDateRange } from './shared/redux/features';
import UploadScreen from './components/upload/UploadScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import { parsePdfWithPython } from './utils/api';
import type { TransactionRow } from './utils/textParser';
import SettingsScreen from './components/settings/SettingsScreen';
import { Toaster } from "@/components/ui/toaster"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redirect to home if /dashboard is accessed without data
  useEffect(() => {
    if (location.pathname === '/dashboard' && transactionRows.length === 0) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, transactionRows.length, navigate]);

  const handleAnalyze = async (files: File[], password?: string, isAppend: boolean = false) => {
    setIsParsing(true);
    setErrorMessage('');

    if (!isAppend) {
      setTransactionRows([]);
      setUploadedFiles(files);
      dispatch(setDateRange(undefined));
    }

    try {
      // Check each file for password protection
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer, password });

        try {
          await loadingTask.promise;
        } catch (pdfError: any) {
          if (
            pdfError.name === 'PasswordException' ||
            (pdfError.message && pdfError.message.toLowerCase().includes('password'))
          ) {
            setErrorMessage(`File "${file.name}" is password protected. Please provide the correct password.`);
            setIsParsing(false);
            return false;
          }
          throw pdfError;
        }
      }

      const response = await parsePdfWithPython(files, password);

      const rows: TransactionRow[] = response.transactions.map((t: any) => ({
        date: String(t["date"] || ""),
        transactionReference: String(t["transaction reference"] || ""),
        refNoOrChqNo: String(t["ref.no/chq.no"] || ""),
        debit: typeof t["debit"] === "number" ? t["debit"] : null,
        credit: typeof t["credit"] === "number" ? t["credit"] : null,
        balance: typeof t["balance"] === "number" ? t["balance"] : null,
        tag: t["tag"] || "other"
      }));

      if (isAppend) {
        setTransactionRows(prev => [...prev, ...rows]);
        setUploadedFiles(prev => [...prev, ...files]);
      } else {
        setTransactionRows(rows);
        navigate('/dashboard');
      }
      return true;
    } catch (error: any) {
      console.error('Error parsing PDF:', error);
      if (error.message?.includes('401') || error.message?.toLowerCase().includes('password')) {
        setErrorMessage('Password failed for one or more files. Please try again.');
      } else {
        setErrorMessage(error.message || 'Failed to parse PDF(s).');
      }
      return false;
    } finally {
      setIsParsing(false);
    }
  };

  const handleBackToUpload = () => {
    setTransactionRows([]);
    setUploadedFiles([]);
    setErrorMessage('');
    dispatch(setDateRange(undefined));
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <UploadScreen
              onAnalyze={handleAnalyze}
              isLoading={isParsing}
              errorMessage={errorMessage}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardScreen
              transactions={transactionRows}
              uploadedFiles={uploadedFiles}
              onBackToUpload={handleBackToUpload}
              onAnalyze={handleAnalyze}
              isParsing={isParsing}
              errorMessage={errorMessage}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsScreen onBack={handleBackToUpload} />
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
