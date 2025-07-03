import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import Loader from './Loader';

interface QuizResult {
  id: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
  quizId: string;
}

interface CreatorDashboardProps {
  setView: (view: string) => void;
  db: any;
  quizId?: string;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ setView, db, quizId }) => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizId] = useState<string | null>(quizId || null);

  useEffect(() => {
    if (selectedQuizId) {
      fetchResults(selectedQuizId);
    }
  }, [selectedQuizId]);

  const fetchResults = async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const resultsRef = collection(db, 'quizAttempts');
      const q = query(
        resultsRef, 
        where('quizId', '==', quizId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const resultsList: QuizResult[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizResult));
      setResults(resultsList);
    } catch (err) {
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage === 100) return '🏆';
    if (percentage >= 75) return '😎';
    if (percentage >= 50) return '👍';
    if (percentage >= 25) return '😬';
    return '💀';
  };

  const getPerformanceText = (percentage: number) => {
    if (percentage === 100) return 'Perfect!';
    if (percentage >= 75) return 'Great!';
    if (percentage >= 50) return 'Good';
    if (percentage >= 25) return 'Meh';
    return 'Ouch';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage === 100) return 'text-yellow-400';
    if (percentage >= 75) return 'text-green-400';
    if (percentage >= 50) return 'text-blue-400';
    if (percentage >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-4xl">
        <div className="card">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">📊 Quiz Results Dashboard</h2>
            <button
              onClick={() => setView('welcome')}
              className="text-primary-400 hover:text-primary-300"
              aria-label="Back to home"
            >
              ← Back to Home
            </button>
          </div>

          {loading ? (
            <Loader text="Loading quiz results..." />
          ) : error ? (
            <div className="text-center">
              <div className="text-red-400 mb-4">{error}</div>
              <button
                onClick={() => setView('welcome')}
                className="btn-primary"
              >
                Back to Home
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Results Yet!</h3>
              <p className="text-white/60 mb-6">
                Share your quiz code with friends to see their results here.
              </p>
              <button
                onClick={() => setView('welcome')}
                className="btn-primary"
              >
                Create Another Quiz
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Results ({results.length} attempts)
                </h3>
                <p className="text-white/60">
                  See how well your friends know you!
                </p>
              </div>

              <div className="grid gap-4">
                {results.map((result) => (
                  <div key={result.id} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          {result.participantName || 'Anonymous'}
                        </h4>
                        <p className="text-white/60 text-sm">
                          {new Date(result.createdAt).toLocaleDateString()} at {new Date(result.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl mb-1">
                          {getPerformanceEmoji(result.percentage)}
                        </div>
                        <span className={`text-sm font-semibold ${getPerformanceColor(result.percentage)}`}>
                          {getPerformanceText(result.percentage)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-400">
                            {result.score}/{result.totalQuestions}
                          </div>
                          <div className="text-sm text-white/60">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent-400">
                            {result.percentage}%
                          </div>
                          <div className="text-sm text-white/60">Percentage</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              result.percentage === 100 ? 'bg-yellow-400' :
                              result.percentage >= 75 ? 'bg-green-400' :
                              result.percentage >= 50 ? 'bg-blue-400' :
                              result.percentage >= 25 ? 'bg-orange-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setView('welcome')}
                  className="btn-primary"
                >
                  Create Another Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard; 