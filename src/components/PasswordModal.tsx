import React, { useState } from 'react';

interface PasswordModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // You can change this password to whatever you want
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-3">Admin Access</h3>
          <p className="text-slate-300 mb-6">Enter the admin password to continue.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Access Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal; 