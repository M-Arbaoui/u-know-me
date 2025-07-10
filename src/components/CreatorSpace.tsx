import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Loader from './Loader';
import CopyButton from './CopyButton';

interface QuizData {
  id: string;
  title?: string;
  creatorName: string;
  questions: any[];
  createdAt: string;
}

interface QuizResult {
  id: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
  quizId: string;
  answers: {
    questionIndex: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

interface CreatorSpaceProps {
  setView: (view: string) => void;
  db: any;
  devMode?: boolean;
}

const CreatorSpace: React.FC<CreatorSpaceProps> = ({ setView, db, devMode = false }) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [currentCreator, setCurrentCreator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'quizzes' | 'results' | 'analytics' | 'account'>('quizzes');
  
  // Account management state
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{quizId: string, questionIndex: number} | null>(null);

  useEffect(() => {
    if (devMode) {
      setCurrentCreator('Developer');
      fetchAllQuizzes();
    } else {
      const creator = localStorage.getItem('currentCreator');
      console.log('CreatorSpace: currentCreator from localStorage:', creator);
      if (!creator) {
        console.log('CreatorSpace: No creator found, redirecting to login');
        setView('creator-login');
        return;
      }
      setCurrentCreator(creator);
      console.log('CreatorSpace: Fetching quizzes for creator:', creator);
      fetchQuizzes(creator);
    }
  }, [devMode, setView]);

  // Add a refresh function that can be called manually
  const refreshQuizzes = () => {
    if (devMode) {
      fetchAllQuizzes();
    } else if (currentCreator) {
      console.log('CreatorSpace: Refreshing quizzes for:', currentCreator);
      fetchQuizzes(currentCreator);
    }
  };

  // Add useEffect to refresh when currentCreator changes
  useEffect(() => {
    if (currentCreator && !devMode) {
      console.log('CreatorSpace: currentCreator changed, refreshing quizzes:', currentCreator);
      fetchQuizzes(currentCreator);
    }
  }, [currentCreator, devMode]);

  const fetchAllQuizzes = async () => {
    setLoading(true);
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
      console.error('Error fetching all quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (creatorName: string) => {
    setLoading(true);
    try {
      console.log('CreatorSpace: Fetching quizzes for creator:', creatorName);
      const quizzesRef = collection(db, 'quizzes');
      const q = query(
        quizzesRef, 
        where('creatorName', '==', creatorName),
        orderBy('createdAt', 'desc')
      );
      console.log('CreatorSpace: Query created:', q);
      const snapshot = await getDocs(q);
      console.log('CreatorSpace: Snapshot size:', snapshot.size);
      const quizzesList: QuizData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizData));
      console.log('CreatorSpace: Found quizzes:', quizzesList);
      console.log('CreatorSpace: Quiz details:', quizzesList.map(q => ({ id: q.id, creatorName: q.creatorName, title: q.title })));
      setQuizzes(quizzesList);
    } catch (error) {
      console.error('CreatorSpace: Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (quizId: string) => {
    setLoadingResults(true);
    try {
      console.log('Fetching results for quiz:', quizId);
      const resultsRef = collection(db, 'quizAttempts');
      let q;
      if (devMode) {
        q = query(resultsRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(resultsRef, where('quizId', '==', quizId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      let resultsList: QuizResult[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizResult));
      if (devMode && quizId) {
        resultsList = resultsList.filter(r => r.quizId === quizId);
      }
      console.log('Found results:', resultsList);
      setResults(resultsList);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleQuizSelect = (quiz: QuizData) => {
    setSelectedQuiz(quiz);
    fetchResults(quiz.id);
    setViewMode('results');
  };

  const deleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(null);
          setResults([]);
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const updateQuizTitle = async (quizId: string, newTitle: string) => {
    if (!db) return;
    
    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        title: newTitle
      });
      console.log('Quiz title updated:', quizId);
      // Refresh quizzes
      if (devMode) {
        fetchAllQuizzes();
      } else {
        fetchQuizzes(currentCreator || '');
      }
      setEditingQuiz(null);
    } catch (error) {
      console.error('Error updating quiz title:', error);
      alert('Failed to update quiz title');
    }
  };

  const updateQuestion = async (quizId: string, questionIndex: number, updatedQuestion: any) => {
    if (!db) return;
    
    try {
      const quizRef = doc(db, 'quizzes', quizId);
      const quiz = quizzes.find(q => q.id === quizId);
      if (quiz) {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[questionIndex] = updatedQuestion;
        
        await updateDoc(quizRef, {
          questions: updatedQuestions
        });
        console.log('Question updated:', quizId, questionIndex);
        // Refresh quizzes
        if (devMode) {
          fetchAllQuizzes();
        } else {
          fetchQuizzes(currentCreator || '');
        }
        setEditingQuestion(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentCreator');
    setView('welcome');
  };

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage === 100) return '🏆';
    if (percentage >= 75) return '😎';
    if (percentage >= 50) return '👍';
    if (percentage >= 25) return '😬';
    return '💀';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage === 100) return 'text-teal-500';
    if (percentage >= 75) return 'text-coral-400';
    if (percentage >= 50) return 'text-powder-500';
    if (percentage >= 25) return 'text-mauve-500';
    return 'text-charcoal-400';
  };

  const getPerformanceBg = (percentage: number) => {
    if (percentage === 100) return 'bg-teal-50 border-teal-200';
    if (percentage >= 75) return 'bg-coral-50 border-coral-200';
    if (percentage >= 50) return 'bg-powder-50 border-powder-200';
    if (percentage >= 25) return 'bg-mauve-50 border-mauve-200';
    return 'bg-charcoal-50 border-charcoal-200';
  };

  if (loading) {
    return <Loader text="Loading your creator space..." />;
  }

  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-neon-teal">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-800">
                  {devMode ? '🔧 Developer Space' : 'Creator Space'}
                </h1>
                <p className="text-charcoal-600">
                  Welcome back, {currentCreator}! ✨
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              👋 Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card mb-6">
          <div className="flex space-x-2 bg-lavender-100 rounded-2xl p-2">
            <button
              onClick={() => setViewMode('quizzes')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                viewMode === 'quizzes' 
                  ? 'bg-white text-teal-600 shadow-soft' 
                  : 'text-charcoal-600 hover:text-charcoal-800'
              }`}
            >
              📝 My Quizzes
            </button>
            <button
              onClick={() => setViewMode('results')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                viewMode === 'results' 
                  ? 'bg-white text-teal-600 shadow-soft' 
                  : 'text-charcoal-600 hover:text-charcoal-800'
              }`}
            >
              📊 Results
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                viewMode === 'analytics' 
                  ? 'bg-white text-teal-600 shadow-soft' 
                  : 'text-charcoal-600 hover:text-charcoal-800'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setViewMode('account')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                viewMode === 'account' 
                  ? 'bg-white text-teal-600 shadow-soft' 
                  : 'text-charcoal-600 hover:text-charcoal-800'
              }`}
            >
              👤 Account
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'quizzes' && (
          <div className="space-y-6">
            <div className="card">
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-charcoal-800 mb-1">
                      Your Quizzes ({quizzes.length})
                    </h2>
                    <p className="text-charcoal-600">
                      Create and manage your personality quizzes
                    </p>
                  </div>
                  <button
                    onClick={refreshQuizzes}
                    className="btn-secondary text-sm"
                    title="Refresh quiz list"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-lavender-200 to-powder-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-800 mb-2">No quizzes yet!</h3>
                  <p className="text-charcoal-600 mb-6">Create your first quiz to get started.</p>
                  <button
                    onClick={() => setView('create')}
                    className="btn-primary"
                  >
                    ✨ Create Your First Quiz
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {quizzes.map((quiz, index) => (
                    <div 
                      key={quiz.id} 
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-lavender-200 hover:border-lavender-300 transition-all duration-300 hover:shadow-soft animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-powder-400 to-lavender-400 rounded-xl flex items-center justify-center">
                              <span className="text-lg">🎯</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-charcoal-800 text-lg">
                                Quiz #{quiz.id.slice(-6)}
                              </h4>
                              <p className="text-charcoal-600 text-sm">
                                {quiz.questions?.length || 0} questions • Created {new Date(quiz.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleQuizSelect(quiz)}
                              className="btn-secondary text-sm"
                            >
                              📊 View Results
                            </button>
                            <CopyButton
                              textToCopy={quiz.id}
                              label="Copy Code"
                              variant="accent"
                              size="sm"
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => deleteQuiz(quiz.id)}
                          className="text-coral-500 hover:text-coral-600 p-2 rounded-xl hover:bg-coral-50 transition-all duration-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'results' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-800 mb-1">
                    {selectedQuiz ? `Results for Quiz #${selectedQuiz.id.slice(-6)}` : 'Select a quiz to view results'}
                  </h2>
                  <p className="text-charcoal-600">
                    See how your friends performed
                  </p>
                </div>
                {selectedQuiz && (
                  <button
                    onClick={() => setViewMode('quizzes')}
                    className="btn-secondary text-sm"
                  >
                    ← Back to Quizzes
                  </button>
                )}
              </div>

              {!selectedQuiz ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-powder-200 to-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-800 mb-2">No quiz selected</h3>
                  <p className="text-charcoal-600">Choose a quiz from the "My Quizzes" tab to view results.</p>
                </div>
              ) : loadingResults ? (
                <Loader text="Loading results..." />
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-mauve-200 to-lavender-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                    <span className="text-4xl">📭</span>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-800 mb-2">No results yet!</h3>
                  <p className="text-charcoal-600 mb-6">Share your quiz code with friends to see results here.</p>
                  <CopyButton
                    textToCopy={selectedQuiz.id}
                    label="Copy Quiz Code"
                    variant="primary"
                    size="md"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div 
                      key={result.id} 
                      className={`${getPerformanceBg(result.percentage)} rounded-2xl p-6 border transition-all duration-300 hover:shadow-soft animate-slide-up`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-lavender-400 to-powder-400 rounded-2xl flex items-center justify-center">
                            <span className="text-xl">{getPerformanceEmoji(result.percentage)}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-charcoal-800 text-lg">
                              {result.participantName || 'Anonymous'}
                            </h4>
                            <p className="text-charcoal-600 text-sm">
                              {new Date(result.createdAt).toLocaleDateString()} at {new Date(result.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold mb-1">
                            {getPerformanceEmoji(result.percentage)}
                          </div>
                          <span className={`text-lg font-semibold ${getPerformanceColor(result.percentage)}`}>
                            {result.score}/{result.totalQuestions} ({result.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Detailed Results */}
                      {result.answers && result.answers.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-charcoal-800 mb-4">Question Details:</h5>
                          <div className="grid gap-3">
                            {result.answers.map((answer, index) => (
                              <div key={index} className="bg-white/60 rounded-xl p-4 border border-white/40">
                                <div className="flex justify-between items-center">
                                  <span className="text-charcoal-700 font-medium text-sm">
                                    Q{answer.questionIndex + 1}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                      answer.isCorrect 
                                        ? 'bg-teal-100 text-teal-700' 
                                        : 'bg-coral-100 text-coral-700'
                                    }`}>
                                      {answer.isCorrect ? '✓ Correct' : '✗ Wrong'}
                                    </span>
                                    <span className="text-charcoal-600 text-xs">
                                      Selected: {answer.selectedAnswer}
                                    </span>
                                    {!answer.isCorrect && (
                                      <span className="text-teal-600 text-xs font-medium">
                                        Correct: {answer.correctAnswer}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-charcoal-800 mb-6">Analytics Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-powder-50 to-lavender-50 rounded-2xl p-6 border border-powder-200">
                  <div className="text-3xl mb-3">📝</div>
                  <h4 className="font-bold text-charcoal-800 mb-1">Total Quizzes</h4>
                  <p className="text-3xl font-bold text-powder-600">{quizzes.length}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-coral-50 rounded-2xl p-6 border border-teal-200">
                  <div className="text-3xl mb-3">👥</div>
                  <h4 className="font-bold text-charcoal-800 mb-1">Total Attempts</h4>
                  <p className="text-3xl font-bold text-teal-600">
                    {quizzes.reduce((total, quiz) => {
                      const quizResults = results.filter(r => r.quizId === quiz.id);
                      return total + quizResults.length;
                    }, 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-mauve-50 to-lavender-50 rounded-2xl p-6 border border-mauve-200">
                  <div className="text-3xl mb-3">🏆</div>
                  <h4 className="font-bold text-charcoal-800 mb-1">Avg. Score</h4>
                  <p className="text-3xl font-bold text-mauve-600">
                    {results.length > 0 
                      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'account' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-800 mb-1">
                    Account Management
                  </h2>
                  <p className="text-charcoal-600">
                    Edit your quizzes and questions
                  </p>
                </div>
              </div>

              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-lavender-200 to-powder-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-800 mb-2">No quizzes to manage!</h3>
                  <p className="text-charcoal-600 mb-6">Create your first quiz to start managing your content.</p>
                  <button
                    onClick={() => setView('create')}
                    className="btn-primary"
                  >
                    ✨ Create Your First Quiz
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-lavender-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {editingQuiz === quiz.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                defaultValue={quiz.title || `Quiz #${quiz.id.slice(-6)}`}
                                className="bg-white/80 text-charcoal-800 px-3 py-2 rounded-lg border border-lavender-300 flex-1"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    updateQuizTitle(quiz.id, e.currentTarget.value);
                                  }
                                }}
                                onBlur={(e) => updateQuizTitle(quiz.id, e.target.value)}
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingQuiz(null)}
                                className="text-charcoal-400 hover:text-charcoal-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <h3 className="text-lg font-bold text-charcoal-800 mb-2">
                              {quiz.title || `Quiz #${quiz.id.slice(-6)}`}
                            </h3>
                          )}
                          <div className="text-sm text-charcoal-600 space-y-1">
                            <p><span className="text-charcoal-700">Created:</span> {new Date(quiz.createdAt).toLocaleString()}</p>
                            <p><span className="text-charcoal-700">Questions:</span> {quiz.questions?.length || 0}</p>
                            <p><span className="text-charcoal-700">Quiz ID:</span> <span className="font-mono text-xs">{quiz.id}</span></p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CopyButton
                            textToCopy={JSON.stringify(quiz, null, 2)}
                            label="Copy Quiz"
                            variant="accent"
                            size="sm"
                            className="text-sm"
                          />
                          <button
                            onClick={() => setEditingQuiz(quiz.id)}
                            className="btn-secondary text-sm"
                          >
                            Edit Title
                          </button>
                          <button
                            onClick={() => deleteQuiz(quiz.id)}
                            className="text-coral-500 hover:text-coral-600 p-2 rounded-xl hover:bg-coral-50 transition-all duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Questions */}
                      {quiz.questions && quiz.questions.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-charcoal-700 font-semibold hover:text-charcoal-800">
                            📝 Questions ({quiz.questions.length})
                          </summary>
                          <div className="mt-4 space-y-4">
                            {quiz.questions.map((question, qIndex) => (
                              <div key={qIndex} className="bg-lavender-50 p-4 rounded-lg border border-lavender-200">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-charcoal-800">
                                    Q{qIndex + 1}: {question.text}
                                  </h4>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditingQuestion({quizId: quiz.id, questionIndex: qIndex})}
                                      className="btn-secondary text-xs"
                                    >
                                      Edit
                                    </button>
                                    <CopyButton
                                      textToCopy={JSON.stringify(question, null, 2)}
                                      label=""
                                      variant="ghost"
                                      size="sm"
                                      showIcon={true}
                                      className="bg-white/60 hover:bg-white/80"
                                    />
                                  </div>
                                </div>
                                
                                {editingQuestion?.quizId === quiz.id && editingQuestion?.questionIndex === qIndex ? (
                                  <QuestionEditor
                                    question={question}
                                    onSave={(updatedQuestion) => updateQuestion(quiz.id, qIndex, updatedQuestion)}
                                    onCancel={() => setEditingQuestion(null)}
                                  />
                                ) : (
                                  <div className="space-y-2">
                                    <div className="p-3 bg-white/60 border border-lavender-300 rounded-lg">
                                      <div className="flex items-start gap-2">
                                        <span className="text-charcoal-600 text-lg font-bold">❓</span>
                                        <span className="text-charcoal-700 text-sm font-semibold leading-relaxed">
                                          {question.text}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-xs text-charcoal-600">Options:</p>
                                    <div className="grid gap-2">
                                      {question.options?.map((option: string, optIndex: number) => {
                                        const correctAnswerIndex = typeof question.correctAnswer === 'string' 
                                          ? question.options?.indexOf(question.correctAnswer)
                                          : question.correctAnswer;
                                        const isCorrect = optIndex === correctAnswerIndex;
                                        
                                        return (
                                          <div 
                                            key={optIndex} 
                                            className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                              isCorrect
                                                ? 'bg-teal-100 border-2 border-teal-300 text-teal-800'
                                                : 'bg-white/60 border border-lavender-300 text-charcoal-700'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold">{String.fromCharCode(65 + optIndex)}.</span>
                                                <span className="flex-1">{option}</span>
                                              </div>
                                              {isCorrect && (
                                                <div className="flex items-center gap-2">
                                                  <span className="text-teal-600 text-lg">✅</span>
                                                  <span className="text-teal-700 font-bold text-xs bg-teal-200 px-2 py-1 rounded-full">
                                                    CORRECT
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Question Editor Component
interface QuestionEditorProps {
  question: any;
  onSave: (question: any) => void;
  onCancel: () => void;
}

function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState({
    text: question.text || '',
    options: [...(question.options || [])],
    correctAnswer: question.correctAnswer || 0
  });

  const handleSave = () => {
    if (editedQuestion.text.trim() && editedQuestion.options.length >= 2) {
      onSave(editedQuestion);
    } else {
      alert('Please provide a question text and at least 2 options');
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const addOption = () => {
    setEditedQuestion({
      ...editedQuestion,
      options: [...editedQuestion.options, `Option ${editedQuestion.options.length + 1}`]
    });
  };

  const removeOption = (index: number) => {
    if (editedQuestion.options.length > 2) {
      const newOptions = editedQuestion.options.filter((_, i) => i !== index);
      setEditedQuestion({
        ...editedQuestion,
        options: newOptions,
        correctAnswer: editedQuestion.correctAnswer >= newOptions.length ? 0 : editedQuestion.correctAnswer
      });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
      <div>
        <label className="block text-sm font-semibold text-charcoal-700 mb-2">Question Text:</label>
        <textarea
          value={editedQuestion.text}
          onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
          className="w-full bg-white/80 text-charcoal-800 p-3 rounded-lg border border-lavender-300 resize-none"
          rows={3}
          placeholder="Enter your question..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal-700 mb-2">Options:</label>
        <div className="space-y-2">
          {editedQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={editedQuestion.correctAnswer === index}
                onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: index })}
                className="text-teal-500"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 bg-white/80 text-charcoal-800 p-2 rounded border border-lavender-300"
                placeholder={`Option ${index + 1}`}
              />
              {editedQuestion.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="text-coral-500 hover:text-coral-600 p-1 rounded text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          className="mt-2 bg-teal-100 text-teal-700 px-3 py-1 rounded text-xs hover:bg-teal-200"
        >
          + Add Option
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="btn-primary text-sm"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CreatorSpace; 