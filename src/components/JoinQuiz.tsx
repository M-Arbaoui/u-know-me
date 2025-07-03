import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Loader from './Loader';

interface JoinQuizProps {
  setView: (view: string) => void;
  setQuizId: (id: string) => void;
  setParticipantName: (name: string) => void;
  db: any;
}

const JoinQuiz: React.FC<JoinQuizProps> = ({ 
  setView, 
  setQuizId, 
  setParticipantName, 
  db 
}) => {
  const [quizCode, setQuizCode] = useState('');
  const [participantName, setParticipantNameLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinQuiz = async () => {
    if (!quizCode.trim()) {
      setError('Please enter a quiz code!');
      return;
    }

    if (!participantName.trim()) {
      setError('Please enter your name!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const quizRef = collection(db, 'quizzes');
      const q = query(quizRef, where('__name__', '==', quizCode.trim()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setQuizId(quizCode.trim());
        setParticipantName(participantName.trim());
        setView('quiz');
      } else {
        setError('Quiz not found! Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error joining quiz:', error);
      setError('Error joining quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQuizCode(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  if (loading) {
    return <Loader text="Joining quiz..." />;
  }

  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('welcome')}
                className="w-10 h-10 bg-lavender-100 hover:bg-lavender-200 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-800">Join a Quiz</h1>
                <p className="text-charcoal-600">Enter the code to start playing</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-neon-teal">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="card animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-powder-200 to-lavender-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-charcoal-800 mb-2">Ready to Play?</h2>
            <p className="text-charcoal-600">Get the quiz code from your friend and enter it below</p>
          </div>

          <div className="space-y-6">
            {/* Quiz Code Input */}
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-3">
                Quiz Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                  placeholder="Enter quiz code..."
                  className="input-field w-full pr-12 text-center text-lg font-mono tracking-wider"
                  maxLength={20}
                />
                <button
                  onClick={handlePasteFromClipboard}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-lavender-100 hover:bg-lavender-200 rounded-lg flex items-center justify-center transition-all duration-200"
                  title="Paste from clipboard"
                >
                  📋
                </button>
              </div>
              <p className="text-xs text-charcoal-500 mt-2">
                The code should look something like: ABC123DEF456
              </p>
            </div>

            {/* Participant Name Input */}
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantNameLocal(e.target.value)}
                placeholder="Enter your name..."
                className="input-field w-full text-center text-lg font-semibold"
                maxLength={30}
              />
              <p className="text-xs text-charcoal-500 mt-2">
                This will be displayed to the quiz creator
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-coral-50 border border-coral-200 rounded-2xl p-4 animate-bounce-in">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-coral-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={handleJoinQuiz}
              disabled={!quizCode.trim() || !participantName.trim() || loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="mr-2">🚀</span>
              Join Quiz
              <span className="ml-2 group-hover:scale-110 transition-transform">✨</span>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="card">
          <div className="text-center">
            <h3 className="text-lg font-bold text-charcoal-800 mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gradient-to-br from-lavender-50 to-powder-50 rounded-2xl p-4 border border-lavender-200">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-charcoal-800 mb-1">Get the Code</h4>
                <p className="text-charcoal-600">
                  Ask your friend to share their quiz code with you
                </p>
              </div>
              <div className="bg-gradient-to-br from-powder-50 to-teal-50 rounded-2xl p-4 border border-powder-200">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-charcoal-800 mb-1">Start Playing</h4>
                <p className="text-charcoal-600">
                  Enter the code above and answer the questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Your Own */}
        <div className="text-center mt-6">
          <p className="text-charcoal-600 mb-4">Don't have a quiz code?</p>
          <button
            onClick={() => setView('creator-login')}
            className="btn-secondary group"
          >
            <span className="mr-2">✨</span>
            Create Your Own Quiz
            <span className="ml-2 group-hover:scale-110 transition-transform">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz; 