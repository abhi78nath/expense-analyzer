import { useEffect } from 'react';
import './App.css';
import { pdfjs } from 'react-pdf';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import UploadScreen from './components/upload/UploadScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import AuthPage from './components/auth/AuthPage';
import { Toaster } from "@/components/ui/toaster"
import { useExpenseAnalysis } from './hooks/useExpenseAnalysis';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const {
    transactionRows,
    uploadedFiles,
    isParsing,
    errorMessage,
    handleAnalyze,
    handleBackToUpload
  } = useExpenseAnalysis();

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if /dashboard is accessed without data
  useEffect(() => {
    if (location.pathname === '/dashboard' && transactionRows.length === 0) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, transactionRows.length, navigate]);

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
        <Route path="/settings" element={<SettingsScreen onBack={handleBackToUpload} />} />
        <Route path="/login" element={<AuthPage mode="sign-in" />} />
        <Route path="/login/*" element={<AuthPage mode="sign-in" />} />
        <Route path="/signup" element={<AuthPage mode="sign-up" />} />
        <Route path="/signup/*" element={<AuthPage mode="sign-up" />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
