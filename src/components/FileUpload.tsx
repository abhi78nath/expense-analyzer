import React from 'react';

interface FileUploadProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onParse: () => void;
  selectedFile: File | null;
  isParsing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, onParse, selectedFile, isParsing }) => {
  return (
    <div className="card">
      <input type="file" id="file-upload" onChange={onFileChange} accept=".pdf" />
      <label htmlFor="file-upload" className="file-upload-label">
        {selectedFile ? selectedFile.name : 'Select a PDF file'}
      </label>
      <button onClick={() => onParse()} disabled={!selectedFile || isParsing}>
        {isParsing ? 'Analysing...' : 'Analyse Expense'}
      </button>
    </div>
  );
};

export default FileUpload;
