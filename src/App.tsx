import './App.css';
import { pdfjs } from 'react-pdf';
import { Routes, Route } from 'react-router-dom';
import UploadScreen from './components/upload/UploadScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import AuthPage from './components/auth/AuthPage';
import { Toaster } from "@/components/ui/toaster"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <UploadScreen />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardScreen />
          }
        />
        <Route path="/settings" element={<SettingsScreen />} />
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
