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
    <div className="text-center max-w-lg mx-auto">
      <h2 className="text-4xl font-bold text-white mb-3">Quiz Created!</h2>
      <p className="text-slate-300 mb-8">Share this code with your friends. Let's see who dares to play.</p>
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        <p className="text-slate-400 mb-3 text-sm">Your unique Quiz Code:</p>
        <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg">
          <p className="text-2xl font-mono text-indigo-300 break-all flex-1 text-left" aria-label="Quiz code">{quizId}</p>
          <button
            onClick={copyToClipboard}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all"
            aria-label="Copy quiz code"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <button onClick={() => setView('welcome')} className="mt-8 text-indigo-400 hover:text-indigo-300" aria-label="Back to Home">
        &larr; Back to Home
      </button>
    </div>
  );
};

export default ShareScreen; 