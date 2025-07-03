import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import Loader from './Loader';

interface AdminPanelProps {
  setView: (view: string) => void;
  db: any;
  appId: string;
}

interface QuizData {
  id: string;
  creatorName: string;
  questions: any[];
  createdAt?: any;
}

interface FeedbackData {
  id: string;
  feedback: string;
  rating: number;
  score: number;
  percentage: number;
  createdAt: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ setView, db, appId }) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const quizzesList: QuizData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizData));
      setQuizzes(quizzesList);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (quizId: string) => {
    setLoadingFeedback(true);
    try {
      const feedbackRef = collection(db, `quizzes/${quizId}/feedback`);
      const q = query(feedbackRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const feedbackList: FeedbackData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeedbackData));
      setFeedback(feedbackList);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleQuizSelect = (quiz: QuizData) => {
    setSelectedQuiz(quiz);
    fetchFeedback(quiz.id);
  };

  const deleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(null);
          setFeedback([]);
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  if (loading) {
    return <Loader text="Loading admin panel..." />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <button onClick={() => setView('welcome')} className="text-indigo-400 hover:text-indigo-300 mb-6" aria-label="Back to Home">
        &larr; Back to Home
      </button>
      
      <h2 className="text-4xl font-bold text-white mb-8">Admin Panel</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quizzes List */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-4">All Quizzes ({quizzes.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {quizzes.length === 0 ? (
              <p className="text-slate-400">No quizzes created yet.</p>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedQuiz?.id === quiz.id
                      ? 'bg-indigo-600 border-indigo-500'
                      : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                  }`}
                  onClick={() => handleQuizSelect(quiz)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{quiz.creatorName}</h4>
                      <p className="text-sm text-slate-300">{quiz.questions?.length || 0} questions</p>
                      <p className="text-xs text-slate-400">ID: {quiz.id}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuiz(quiz.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                      aria-label="Delete quiz"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-4">
            Feedback {selectedQuiz && `for ${selectedQuiz.creatorName}`}
          </h3>
          
          {!selectedQuiz ? (
            <p className="text-slate-400">Select a quiz to view feedback.</p>
          ) : loadingFeedback ? (
            <Loader text="Loading feedback..." />
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {feedback.length === 0 ? (
                <p className="text-slate-400">No feedback yet for this quiz.</p>
              ) : (
                feedback.map((item) => (
                  <div key={item.id} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Score: {item.score}/{selectedQuiz.questions?.length || 0} ({item.percentage}%)
                        </span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < item.rating ? 'text-yellow-400' : 'text-slate-600'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{item.feedback}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;