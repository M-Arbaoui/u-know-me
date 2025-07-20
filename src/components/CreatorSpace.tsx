import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Loader from './Loader';
import { IoLogOutOutline } from 'react-icons/io5';
import { TbClipboardList, TbChartBar, TbDeviceAnalytics, TbTrash, TbEdit, TbEye, TbPlus, TbChevronLeft } from 'react-icons/tb';
import CopyButton from './CopyButton';

interface QuizData {
  id: string;
  title?: string;
  creatorName: string;
  questions: any[];
  createdAt: string;
  shortCode?: string;
}
interface QuizResult {
  id: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
  quizId: string;
}
interface CreatorSpaceProps {
  setView: (view: string) => void;
  db: any;
  goBack?: () => void;
}

const pastelBg = 'linear-gradient(120deg, #A2D2FF 0%, #CFFFE5 100%)';
const NAV = [
  { key: 'quizzes', label: 'My Quizzes', icon: <TbClipboardList /> },
  { key: 'results', label: 'Results', icon: <TbChartBar /> },
  { key: 'analytics', label: 'Analytics', icon: <TbDeviceAnalytics /> },
];

const CreatorSpace: React.FC<CreatorSpaceProps> = ({ setView, db }) => {
  const [viewMode, setViewMode] = useState<'quizzes' | 'results' | 'analytics'>('quizzes');
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [currentCreator, setCurrentCreator] = useState<string>('');
  const [error, setError] = useState('');

  // Fetch quizzes for this creator
  useEffect(() => {
    const creator = localStorage.getItem('currentCreator') || '';
    const creatorId = localStorage.getItem('creatorId') || '';
    setCurrentCreator(creator);
    if (!creatorId) {
      setError('Session expired. Please log in again.');
      setLoading(false);
        return;
    }
    setLoading(true);
    const fetch = async () => {
      try {
        const q = query(collection(db, 'quizzes'), where('creatorId', '==', creatorId));
        const snapshot = await getDocs(q);
        const quizzesList: QuizData[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizData));
        quizzesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setQuizzes(quizzesList);
      } catch (e) {
        setError('Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [db]);

  // Fetch results for selected quiz
  const fetchResults = async (quizId: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'quizAttempts'), where('quizId', '==', quizId));
      const snapshot = await getDocs(q);
      let resultsList: QuizResult[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
      resultsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setResults(resultsList);
      setSelectedQuiz(quizzes.find(q => q.id === quizId) || null);
      setViewMode('results');
    } catch (e) {
      setError('Failed to load results.');
    } finally {
      setLoading(false);
    }
  };

  // Edit quiz title
  const handleEditTitle = async (quizId: string, newTitle: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'quizzes', quizId), { title: newTitle });
      setQuizzes(qs => qs.map(q => q.id === quizId ? { ...q, title: newTitle } : q));
      setEditingQuizId(null);
    } catch (e) {
      setError('Failed to update title.');
    } finally {
      setLoading(false);
    }
  };

  // Inline question editing state
  const [editingQuestion, setEditingQuestion] = useState<{ quizId: string; questionIndex: number } | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  // For editing options and correct answer
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrect, setEditCorrect] = useState<number>(0);

  const handleEditQuestion = async (quizId: string, questionIndex: number) => {
    setLoading(true);
    try {
      const quiz = quizzes.find(q => q.id === quizId);
      if (!quiz) throw new Error('Quiz not found');
      const updatedQuestions = [...quiz.questions];
      if (updatedQuestions[questionIndex]) {
        updatedQuestions[questionIndex].question = editQuestionText;
        updatedQuestions[questionIndex].options = editOptions;
        updatedQuestions[questionIndex].correctAnswer = editCorrect;
      }
      await updateDoc(doc(db, 'quizzes', quizId), { questions: updatedQuestions });
      setQuizzes(qs => qs.map(q => q.id === quizId ? { ...q, questions: updatedQuestions } : q));
      setEditingQuestion(null);
      setEditQuestionText('');
      setEditOptions([]);
      setEditCorrect(0);
    } catch (e) {
      setError('Failed to update question.');
    } finally {
      setLoading(false);
    }
  };

  // Add/remove option handlers
  const handleAddOption = () => {
    if (editOptions.length < 6) setEditOptions([...editOptions, '']);
  };
  const handleRemoveOption = (idx: number) => {
    if (editOptions.length > 2) {
      const newOpts = editOptions.filter((_, i) => i !== idx);
      setEditOptions(newOpts);
      if (editCorrect >= newOpts.length) setEditCorrect(0);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Delete this quiz?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      setQuizzes(qs => qs.filter(q => q.id !== quizId));
      if (selectedQuiz?.id === quizId) setSelectedQuiz(null);
    } catch (e) {
      setError('Failed to delete quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('currentCreator');
    localStorage.removeItem('creatorId');
    setView('welcome');
  };

  if (loading) return <Loader text="Loading your Creator Space..." />;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5]">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center border-4 border-[#A2D2FF]">
        <h2 className="text-3xl font-bold text-[#232946] mb-4">Error</h2>
        <p className="text-[#3BB3FF] mb-6 text-center">{error}</p>
        <button className="px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#3BB3FF] text-[#232946] shadow-lg border-2 border-[#3BB3FF] hover:scale-105 hover:shadow-2xl transition-all duration-200" onClick={handleLogout}>Log In Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col relative" style={{ background: pastelBg }}>
        {/* Header */}
      <header className="w-full flex flex-col items-center pt-10 pb-4 relative z-10">
        <div className="flex flex-col items-center gap-2 bg-white/80 backdrop-blur-lg rounded-3xl px-8 py-6 shadow-2xl border-2 border-[#CFFFE5] relative">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 rounded-2xl shadow-lg mb-2 bg-white/80 object-contain" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#232946] font-fredoka drop-shadow-lg">Creator Space</h1>
          <p className="text-lg md:text-xl text-[#3BB3FF] font-quicksand">Welcome back, <span className="font-bold">{currentCreator}</span>!</p>
          <button onClick={handleLogout} className="absolute top-4 right-4 bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform" title="Logout">
            <IoLogOutOutline className="text-2xl" />
            </button>
        </div>
      </header>
      {/* Navigation Bar */}
      <nav className="w-full flex justify-center mt-8 mb-8 z-20">
        <div className="relative flex bg-white/80 backdrop-blur-lg border-2 border-[#CFFFE5] rounded-2xl shadow-lg overflow-hidden px-2 py-2 items-center max-w-xl w-full">
          <div className="absolute bottom-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-[#A2D2FF] to-[#CFFFE5] transition-all duration-300" style={{ width: '33.33%', transform: `translateX(${NAV.findIndex(tab => tab.key === viewMode) * 100}%)` }} />
          {NAV.map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as any)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300 ${viewMode === tab.key ? 'bg-white/90 text-sky-600 shadow-soft' : 'text-charcoal-600 hover:text-sky-700'}`}
              tabIndex={0}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full">
        <div className="relative rounded-3xl shadow-2xl p-10 max-w-5xl w-full bg-white/80 backdrop-blur-lg border-4 border-[#A2D2FF] mb-12 flex flex-col items-center justify-center" style={{ boxShadow: '0 16px 64px #a2d2ff55' }}>
          {/* Quizzes Tab */}
        {viewMode === 'quizzes' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#232946]">Your Quizzes <span className="text-base font-normal text-[#3BB3FF]">({quizzes.length})</span></h2>
                <button onClick={() => setView('create')} className="bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] text-white rounded-full p-3 shadow-lg hover:scale-105 transition-transform" title="Create Quiz"><TbPlus className="text-2xl" /></button>
              </div>
              {quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-28 h-28 bg-gradient-to-br from-lavender-200 to-powder-200 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce-gentle">
                    <span className="text-5xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#232946] mb-2">No quizzes yet!</h3>
                  <p className="text-[#3BB3FF] mb-8">Create your first quiz to get started.</p>
                  <button onClick={() => setView('create')} className="bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] text-white rounded-xl px-6 py-3 font-bold shadow-lg hover:scale-105 transition-transform text-lg">✨ Create Your First Quiz</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white/90 rounded-2xl border-2 border-[#CFFFE5] shadow-xl p-6 flex flex-col gap-3 relative">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-10 h-10 bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] rounded-xl flex items-center justify-center text-2xl">📝</span>
                        {editingQuizId === quiz.id ? (
                          <input
                            className="w-full px-3 py-2 rounded-lg border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white/90 text-[#232946] font-bold text-lg outline-none"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onBlur={() => handleEditTitle(quiz.id, editTitle)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEditTitle(quiz.id, editTitle); } }}
                            autoFocus
                          />
                        ) : (
                          <h3 className="font-bold text-xl truncate flex-1">{quiz.title || `Quiz #${quiz.id.slice(-6)}`}</h3>
                        )}
                        <button type="button" onClick={() => { setEditTitle(quiz.title || ''); setEditingQuizId(quiz.id); }} className="text-sky-500 p-2 rounded-lg" title="Edit Title"><TbEdit /></button>
                        <button type="button" onClick={() => handleDeleteQuiz(quiz.id)} className="text-rose-500 p-2 rounded-lg" title="Delete Quiz"><TbTrash /></button>
                      </div>
                      {/* Share Link */}
                      <div className="flex items-center gap-2 mb-2 bg-[#F6F9FF] rounded-lg px-3 py-2 border border-[#A2D2FF]">
                        {(() => {
                          const code = quiz.shortCode || quiz.id.slice(-6);
                          const shareUrl = `https://u-know-me1.vercel.app/join?code=${code}`;
                          return (
                            <>
                              <a
                                href={shareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#3BB3FF] font-mono text-xs underline hover:text-[#232946] transition-colors truncate"
                                title="Open join page with code"
                              >
                                {shareUrl}
                              </a>
                              <CopyButton textToCopy={shareUrl} size="sm" variant="ghost" label="Copy" />
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-[#3BB3FF] font-medium mb-2">
                        <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                        <span>{quiz.questions?.length || 0} questions</span>
                      </div>
                      {/* Questions List with inline editing */}
                      <div className="space-y-2 mt-2">
                        {quiz.questions && quiz.questions.map((question: any, qIndex: number) => {
                          const isEditing = editingQuestion && editingQuestion.quizId === quiz.id && editingQuestion.questionIndex === qIndex;
                          return (
                            <div key={qIndex} className="bg-[#F6F9FF] rounded-xl p-3 border border-[#A2D2FF] flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#3BB3FF]">Q{qIndex + 1}.</span>
                                {isEditing ? (
                                  <input
                                    className="w-full px-3 py-2 rounded-lg border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white/90 text-[#232946] font-medium text-base outline-none"
                                    value={editQuestionText}
                                    onChange={e => setEditQuestionText(e.target.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-[#232946] font-medium truncate max-w-xs">{question.question}</span>
                                )}
                                <button type="button" onClick={() => {
                                  setEditQuestionText(question.question);
                                  setEditOptions([...question.options]);
                                  setEditCorrect(typeof question.correctAnswer === 'number' ? question.correctAnswer : 0);
                                  setEditingQuestion({ quizId: quiz.id, questionIndex: qIndex });
                                }} className="text-sky-500 p-2 rounded-lg" title="Edit Question"><TbEdit /></button>
                              </div>
                              {isEditing && (
                                <div className="space-y-2 mt-2">
                                  <div className="font-bold text-[#3BB3FF]">Options:</div>
                                  {editOptions.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-${quiz.id}-${qIndex}`}
                                        checked={editCorrect === optIdx}
                                        onChange={() => setEditCorrect(optIdx)}
                                        className="w-5 h-5 text-[#3BB3FF] bg-white border-2 border-[#3BB3FF] focus:ring-[#3BB3FF]"
                                      />
                                      <input
                                        className="w-full px-3 py-2 rounded-lg border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white/90 text-[#232946] font-medium text-base outline-none"
                                        value={opt}
                                        onChange={e => {
                                          const newOpts = [...editOptions];
                                          newOpts[optIdx] = e.target.value;
                                          setEditOptions(newOpts);
                                        }}
                                      />
                                      <button type="button" onClick={() => handleRemoveOption(optIdx)} className="text-rose-500 p-2 rounded-lg" title="Remove Option" disabled={editOptions.length <= 2}>✕</button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={handleAddOption} className="mt-2 bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] text-[#232946] rounded-xl px-4 py-2 font-bold shadow hover:scale-105 transition-transform text-sm" disabled={editOptions.length >= 6}>+ Add Option</button>
                                  <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleEditQuestion(quiz.id, qIndex)} className="flex-1 bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] text-[#232946] rounded-xl px-4 py-2 font-bold shadow hover:scale-105 transition-transform">Save</button>
                                    <button onClick={() => setEditingQuestion(null)} className="flex-1 bg-white text-[#3BB3FF] border-2 border-[#3BB3FF] rounded-xl px-4 py-2 font-bold shadow hover:bg-[#A2D2FF]/20 transition-transform">Cancel</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => fetchResults(quiz.id)} className="flex-1 bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5] text-[#232946] rounded-xl px-4 py-2 font-bold shadow hover:scale-105 transition-transform flex items-center gap-2 justify-center"><TbEye /> Results</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
          {/* Results Tab */}
          {viewMode === 'results' && selectedQuiz && (
            <div className="w-full">
              <button onClick={() => setViewMode('quizzes')} className="mb-6 text-[#3BB3FF] font-bold flex items-center gap-2"><TbChevronLeft /> Back to Quizzes</button>
              <h2 className="text-2xl font-bold text-[#232946] mb-4">Results for: <span className="text-[#3BB3FF]">{selectedQuiz.title || `Quiz #${selectedQuiz.id.slice(-6)}`}</span></h2>
              {results.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-28 h-28 bg-gradient-to-br from-mauve-200 to-lavender-200 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce-gentle">
                    <span className="text-5xl">📭</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#232946] mb-2">No results yet!</h3>
                  <p className="text-[#3BB3FF] mb-8">Share your quiz code with friends to see results here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <div key={result.id} className="bg-white/80 rounded-2xl p-6 border-2 border-[#CFFFE5] shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-lavender-400 to-powder-400 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">{result.percentage === 100 ? '🏆' : result.percentage >= 75 ? '😎' : result.percentage >= 50 ? '👍' : result.percentage >= 25 ? '😬' : '💀'}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-[#232946] text-lg">{result.participantName || 'Anonymous'}</h4>
                          <p className="text-[#3BB3FF] text-sm">{new Date(result.createdAt).toLocaleDateString()} at {new Date(result.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-[#3BB3FF]">{result.score}/{result.totalQuestions} ({result.percentage}%)</span>
                        </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
          {/* Analytics Tab */}
        {viewMode === 'analytics' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-powder-50 to-lavender-50 rounded-2xl p-8 border-2 border-powder-200 flex flex-col items-center">
                <span className="text-4xl mb-2">📝</span>
                <h4 className="font-bold text-[#232946] mb-1">Total Quizzes</h4>
                <p className="text-3xl font-bold text-[#3BB3FF]">{quizzes.length}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-coral-50 rounded-2xl p-8 border-2 border-teal-200 flex flex-col items-center">
                <span className="text-4xl mb-2">👥</span>
                <h4 className="font-bold text-[#232946] mb-1">Total Attempts</h4>
                <p className="text-3xl font-bold text-[#2ED8B6]">{results.length}</p>
              </div>
              <div className="bg-gradient-to-br from-mauve-50 to-lavender-50 rounded-2xl p-8 border-2 border-mauve-200 flex flex-col items-center">
                <span className="text-4xl mb-2">🏆</span>
                <h4 className="font-bold text-[#232946] mb-1">Avg. Score</h4>
                <p className="text-3xl font-bold text-[#FF61A6]">{results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0}%</p>
                                    </div>
                                  </div>
                                )}
                              </div>
      </main>
    </div>
  );
};

export default CreatorSpace; 