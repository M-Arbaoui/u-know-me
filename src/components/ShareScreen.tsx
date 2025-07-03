import React, { useState } from 'react';

interface ShareScreenProps {
  setView: (view: string) => void;
  quizId: string | null;
}

const ShareScreen: React.FC<ShareScreenProps> = ({ setView, quizId }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!quizId) return;
    try {
      await navigator.clipboard.writeText(quizId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="card text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Quiz Created Successfully!</h2>
            <p className="text-lg text-slate-600 mb-6">
              Share this code with your friends to see how well they know you!
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-sm text-slate-600 mb-2">Quiz Code</p>
            <div className="flex items-center justify-center space-x-3">
              <code className="text-2xl font-mono font-bold text-blue-600 bg-white px-4 py-2 rounded-lg border border-blue-200">
                {quizId}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                aria-label="Copy quiz code"
              >
                {isCopied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setView('creator-space')}
              className="btn-primary flex-1"
              aria-label="View quiz results"
            >
              📊 View Results
            </button>
            <button
              onClick={() => setView('welcome')}
              className="btn-secondary flex-1"
              aria-label="Create another quiz"
            >
              ✨ Create Another Quiz
            </button>
          </div>

          <div className="text-sm text-slate-500">
            <p>Your friends can join using the quiz code above</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareScreen; 