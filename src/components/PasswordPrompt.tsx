import React, { useState } from 'react';

interface PasswordPromptProps {
  onSubmit: (password: string) => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSubmit }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="card">
      <h2>Password Required</h2>
      <p>This PDF is password protected. Please enter the password to view its content.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter PDF password"
          className="password-input"
        />
        <button type="submit">Unlock</button>
      </form>
    </div>
  );
};

export default PasswordPrompt;
