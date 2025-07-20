import React, { useState } from 'react';
import { FaArrowLeft, FaPaste } from 'react-icons/fa';

interface JoinQuizProps {
  setView: (view: string) => void;
  goBack: () => void;
  setQuizId: (id: string) => void;
  setParticipantName: (name: string) => void;
  db: any;
  preFilledQuizCode?: string;
}

const JoinQuiz: React.FC<JoinQuizProps> = ({ setView, goBack, setQuizId, setParticipantName, db, preFilledQuizCode }) => {
  const [quizCode, setQuizCode] = useState(preFilledQuizCode || '');
  const [participantName, setParticipantNameLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinQuiz = async () => {
    if (!quizCode.trim()) {
      setError('Please enter a quiz code');
      return;
    }
    if (!participantName.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const quizzesRef = db.collection('quizzes');
      const q = quizzesRef.where('shortCode', '==', quizCode.trim());
      const snapshot = await q.get();
      if (snapshot.empty) {
        setError('Quiz not found. Please check the code and try again.');
        return;
      }
      setQuizId(quizCode.trim());
      setParticipantName(participantName.trim());
      setView('quiz');
    } catch (error) {
      setError('Failed to join quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinQuiz();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQuizCode(text.trim());
    } catch (error) {
      setError('Could not read from clipboard. Please paste manually.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #A2D2FF 0%, #CFFFE5 100%)' }}>
      {/* Hand-drawn/doodle background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <span className="absolute left-8 top-10 text-4xl opacity-30 animate-float">⭐️</span>
        <span className="absolute right-12 top-24 text-3xl opacity-20 animate-float">✨</span>
        <span className="absolute left-1/2 top-1/3 text-5xl opacity-10 animate-float">?</span>
        <span className="absolute right-1/4 bottom-16 text-4xl opacity-20 animate-float">💧</span>
        <svg className="absolute left-1/4 bottom-8 w-32 h-8 opacity-20" viewBox="0 0 128 32" fill="none">
          <path d="M0 16 Q32 0 64 16 Q96 32 128 16" stroke="#3BB3FF" strokeWidth="3" fill="none" />
        </svg>
        <svg className="absolute right-1/4 top-8 w-32 h-8 opacity-20" viewBox="0 0 128 32" fill="none">
          <path d="M0 16 Q32 32 64 16 Q96 0 128 16" stroke="#2ED8B6" strokeWidth="3" fill="none" />
        </svg>
      </div>
      {/* Centered Logo Header with hand-drawn ring/sparkles */}
      <header className="w-full flex flex-col items-center justify-center px-6 py-8 md:px-0 md:py-10 relative z-10">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Do You Even Know Me Logo"
            className="mx-auto shadow-xl animate-fade-in"
            style={{
              width: 120,
              height: 'auto',
              maxWidth: '60vw',
              borderRadius: '2.5rem',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 32px #b18fff33',
              padding: '1.2rem',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* Hand-drawn ring */}
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none" style={{ zIndex: -1 }} viewBox="0 0 160 160" fill="none">
            <ellipse cx="80" cy="80" rx="75" ry="60" stroke="#3BB3FF" strokeWidth="4" strokeDasharray="12 10" />
            <ellipse cx="80" cy="80" rx="60" ry="75" stroke="#2ED8B6" strokeWidth="2" strokeDasharray="8 14" />
            <text x="20" y="30" fontSize="22" fill="#FFD600" opacity="0.7">✨</text>
            <text x="110" y="130" fontSize="18" fill="#FF61A6" opacity="0.7">★</text>
          </svg>
        </div>
      </header>
      {/* Join Quiz Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="relative rounded-3xl shadow-xl p-10 max-w-md w-full bg-white/80 flex flex-col items-center justify-center border-4 border-[#CFFFE5]" style={{ boxShadow: '0 8px 32px #a2d2ff33' }}>
          {/* Hand-drawn border doodle */}
          <svg className="absolute -top-6 -left-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 Q40 24 56 16 Q48 32 56 48 Q40 40 32 56 Q24 40 8 48 Q16 32 8 16 Q24 24 32 8Z" stroke="#A2D2FF" strokeWidth="3" strokeLinejoin="round" fill="none" />
            <text x="28" y="36" fontSize="18" fill="#3BB3FF">🔑</text>
          </svg>
          <svg className="absolute -bottom-6 -right-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
            <path d="M8 32 Q24 24 16 8 Q32 16 48 8 Q40 24 56 32 Q40 40 48 56 Q32 48 16 56 Q24 40 8 32Z" stroke="#2ED8B6" strokeWidth="3" strokeLinejoin="round" fill="none" />
            <text x="28" y="36" fontSize="18" fill="#2ED8B6">★</text>
          </svg>
          <h1 className="font-fredoka text-3xl font-extrabold text-[#232946] mb-2 tracking-tight animate-fade-in relative">
            Join Quiz
            <svg className="absolute left-1/2 bottom-0 -translate-x-1/2" width="120" height="10" viewBox="0 0 120 10" fill="none">
              <path d="M10 5 Q60 12 110 5" stroke="#2ED8B6" strokeWidth="2" fill="none" />
            </svg>
          </h1>
          <p className="font-quicksand text-base text-[#232946] mb-6 animate-fade-in relative" style={{ maxWidth: 320 }}>
            Enter a quiz code to test your friendship knowledge.
            <svg className="absolute left-1/2 bottom-0 -translate-x-1/2" width="80" height="8" viewBox="0 0 80 8" fill="none">
              <path d="M10 4 Q40 10 70 4" stroke="#A2D2FF" strokeWidth="2" fill="none" />
            </svg>
          </p>
          <div className="w-full flex flex-col gap-4 mt-4">
            <div className="relative">
              <input
                type="text"
                value={quizCode}
                onChange={e => setQuizCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="w-full px-5 py-4 rounded-xl border-2 border-[#A2D2FF] focus:border-[#2ED8B6] bg-white/90 text-[#232946] font-mono text-lg outline-none transition-all duration-200 text-center tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength={6}
                disabled={loading}
              />
              <button
                onClick={handlePasteFromClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#A2D2FF]/20 text-[#3BB3FF] hover:bg-[#A2D2FF]/40 p-2 rounded-lg transition-all duration-300"
                title="Paste from clipboard"
                type="button"
                disabled={loading}
              >
                <FaPaste className="text-lg" />
              </button>
            </div>
            <input
              type="text"
              value={participantName}
              onChange={e => setParticipantNameLocal(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-5 py-4 rounded-xl border-2 border-[#A2D2FF] focus:border-[#2ED8B6] bg-white/90 text-[#232946] font-quicksand text-lg outline-none transition-all duration-200"
              placeholder="Your Name"
              disabled={loading}
            />
            {error && <div className="text-rose-500 text-sm font-bold text-center mt-2 animate-fade-in">{error}</div>}
            <button
              onClick={handleJoinQuiz}
              disabled={loading}
              className="mt-2 px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#E4C1F9] text-[#232946] shadow-lg border-2 border-[#A2D2FF] animate-bounce-in hover:scale-105 hover:shadow-2xl transition-all duration-200 outline-none focus:ring-4 focus:ring-[#A2D2FF]/40"
              style={{ textShadow: '0 2px 12px #fff8' }}
            >
              {loading ? 'Joining Quiz...' : 'Start Quiz'}
            </button>
            <button
              onClick={goBack}
              className="mt-2 px-6 py-2 rounded-full font-bold text-base bg-white/80 text-[#232946] border-2 border-[#A2D2FF] hover:bg-[#A2D2FF]/20 transition-all duration-200 font-quicksand"
              type="button"
              disabled={loading}
            >
              <FaArrowLeft className="inline mr-2 align-middle" />Back
            </button>
          </div>
          <div className="mt-6 text-center text-[#232946] text-xs font-quicksand opacity-70">
            Ask your friend for their unique 6-digit quiz code to get started.
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="footer-minimal mt-auto mb-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg width="220" height="18" viewBox="0 0 220 18" fill="none">
            <path d="M10 10 Q60 18 110 10 Q160 2 210 10" stroke="#3BB3FF" strokeWidth="4" fill="none" />
          </svg>
          <span>MADE BY v3lix.io</span>
        </div>
      </footer>
      {/* Custom Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700;900&family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet" />
      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 1.1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.8) translateY(40px); } 60% { opacity: 1; transform: scale(1.05) translateY(-8px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-bounce-in { animation: bounce-in 0.9s cubic-bezier(.4,0,.2,1) both; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
      {/* Custom Font Classes */}
      <style>{`
        .font-fredoka { font-family: 'Fredoka', 'Poppins', 'Arial Rounded MT Bold', Arial, sans-serif; }
        .font-quicksand { font-family: 'Quicksand', 'Inter', Arial, sans-serif; }
      `}</style>
    </div>
  );
};

export default JoinQuiz; 