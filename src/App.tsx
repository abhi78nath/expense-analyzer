import { useState } from 'react';
import './App.css';
import { pdfjs } from 'react-pdf';
import FileUpload from './components/FileUpload';
import PdfDisplay from './components/PdfDisplay';
import PasswordPrompt from './components/PasswordPrompt';
import { parsePdfWithPython } from './utils/api';
import type { TransactionRow, Expense } from './utils/textParser';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setExtractedText('');
      setExpenses([]);
      setTransactionRows([]);
      setNeedsPassword(false);
    }
  };

  const handleParse = async (password?: string) => {
    if (!selectedFile) return;

    setIsParsing(true);
    setExtractedText(password ? 'Analysing with password...' : 'Checking PDF protection...');
    setExpenses([]);
    setTransactionRows([]);

    try {
      // Proactive check: Try to open the PDF with pdf.js to detect encryption
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer, password });

      try {
        await loadingTask.promise;
      } catch (pdfError: any) {
        if (pdfError.name === 'PasswordException' || (pdfError.message && pdfError.message.toLowerCase().includes('password'))) {
          setNeedsPassword(true);
          setExtractedText('This PDF is password protected. Please provide the password.');
          setIsParsing(false);
          return;
        }
        throw pdfError;
      }

      setNeedsPassword(false);
      setExtractedText('PDF unlocked. Analysing with Python API...');

      const response = await parsePdfWithPython(selectedFile, password);

      // Map the structured Python API response to our internal TransactionRow format
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

      if (rows.length === 0) {
        setExtractedText('No transactions found in the PDF.');
      }
    } catch (error: any) {
      console.error('Error parsing PDF:', error);

      if (error.message.includes('401') || error.message.toLowerCase().includes('password')) {
        setNeedsPassword(true);
        setExtractedText('Password failed. Please try again.');
      } else {
        setExtractedText(`Error: ${error.message || 'Failed to parse PDF.'}`);
      }
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="container">
      <h1>Expense Analyser</h1>
      <FileUpload
        onFileChange={handleFileChange}
        onParse={handleParse}
        selectedFile={selectedFile}
        isParsing={isParsing}
      />
      {needsPassword ? (
        <PasswordPrompt onSubmit={handleParse} />
      ) : (
        <PdfDisplay extractedText={extractedText} expenses={expenses} transactionRows={transactionRows} />
      )}
    </div>
  )
}

export default App
