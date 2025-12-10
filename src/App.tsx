import { useState } from 'react';
import './App.css';
import { pdfjs } from 'react-pdf';
import FileUpload from './components/FileUpload';
import PdfDisplay from './components/PdfDisplay';
import PasswordPrompt from './components/PasswordPrompt';
import { parseExpenses, parseTransactionTable } from './utils/textParser';
import type { Expense, TransactionRow, TextItem } from './utils/textParser';

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
    if (selectedFile) {
      setIsParsing(true);
      setExtractedText('Parsing...');
      setNeedsPassword(false);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target && e.target.result) {
            try {
              const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
              const pdf = await pdfjs.getDocument({ data: typedArray, password }).promise;
              let text = '';
              const textItems: TextItem[] = [];

              // Process all pages in the PDF
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                textContent.items.forEach((item: any) => {
                  text += item.str + ' ';

                  // Extract position from transform matrix
                  // Transform matrix: [a, b, c, d, e, f] where e=x, f=y
                  const transform = item.transform || [1, 0, 0, 1, 0, 0];
                  const x = transform[4] || 0;
                  const y = transform[5] || 0;

                  textItems.push({
                    str: item.str,
                    x,
                    y,
                    page: pageNum // Include page number
                  });
                });
                text += '\n';
              }

              setExtractedText(text);

              // Parse transaction table using position data
              const transactions = parseTransactionTable(textItems);
              setTransactionRows(transactions);

              // Fallback to old parsing if no table found
              if (transactions.length === 0) {
                setExpenses(parseExpenses(text));
              } else {
                setExpenses([]);
              }
            } catch (error: any) {
              if (error.name === 'PasswordException') {
                setNeedsPassword(true);
                setExtractedText('This PDF is password protected. Please provide the password.');
              } else {
                console.error('Error parsing PDF:', error);
                setExtractedText('Failed to parse PDF.');
              }
            } finally {
              setIsParsing(false);
            }
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      } catch (error) {
        console.error('Error reading file:', error);
        setExtractedText('Failed to read file.');
        setIsParsing(false);
      }
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
