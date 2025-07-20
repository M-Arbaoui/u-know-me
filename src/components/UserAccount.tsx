import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import CopyButton from './CopyButton';

interface UserAccountProps {
  db?: any;
  currentUser?: any;
  setView: (view: string) => void;
}

interface QuizData {
  id: string;
  title: string;
  creatorName: string;
  createdAt: any;
  questions: Array<{
    text: string;
    options: string[];
    correctAnswer: number | string;
  }>;
}

export default function UserAccount({ db, currentUser, setView }: UserAccountProps) {
  const [userQuizzes, setUserQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{quizId: string, questionIndex: number} | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUserEmail(currentUser.email || 'Anonymous User');
      setUserName(currentUser.displayName || 'Anonymous User');
    }
    fetchUserQuizzes();
  }, [currentUser, db]);

  const fetchUserQuizzes = async () => {
    if (!db || !currentUser) return;
    
    setLoading(true);
    try {
      const quizzesRef = collection(db, 'quizzes');
      const q = query(
        quizzesRef, 
        where('creatorId', '==', currentUser.uid)
        // orderBy('createdAt', 'desc') // Temporarily removed
      );
      const snapshot = await getDocs(q);
      const quizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizData));
      
      // Sort manually in JavaScript instead of using orderBy
      quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setUserQuizzes(quizzes);
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!db) return;
    
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      console.log('Quiz deleted:', quizId);
      fetchUserQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  const updateQuizTitle = async (quizId: string, newTitle: string) => {
    if (!db) return;
    
    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        title: newTitle
      });
      console.log('Quiz title updated:', quizId);
      fetchUserQuizzes();
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
      const quiz = userQuizzes.find(q => q.id === quizId);
      if (quiz) {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[questionIndex] = updatedQuestion;
        
        await updateDoc(quizRef, {
          questions: updatedQuestions
        });
        console.log('Question updated:', quizId, questionIndex);
        fetchUserQuizzes();
        setEditingQuestion(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🔄</div>
          <p className="text-purple-300">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-400 neon-glow">👤 My Account</h1>
            <p className="text-gray-300 mt-2">Manage your quizzes and data</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('welcome')}
              className="bg-purple-700/80 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              ← Back to Home
            </button>
            <button 
              onClick={() => setView('create')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500"
            >
              + Create New Quiz
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="glass-card p-6 mb-8 border-2 border-purple-700 shadow-neon-glow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-200">{userName}</h2>
              <p className="text-gray-400">{userEmail}</p>
              <p className="text-sm text-purple-300 mt-1">
                {userQuizzes.length} quiz{userQuizzes.length !== 1 ? 'zes' : ''} created
              </p>
            </div>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-pink-400">📝 My Quizzes</h2>
          
          {userQuizzes.length === 0 ? (
            <div className="glass-card p-12 text-center border-2 border-purple-700">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">No quizzes yet</h3>
              <p className="text-gray-400 mb-6">Create your first quiz to get started!</p>
              <button 
                onClick={() => setView('create')}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-500 font-semibold"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {userQuizzes.map((quiz, index) => (
                <div key={quiz.id} className="glass-card border-2 border-pink-700 shadow-neon-glow-pink p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {editingQuiz === quiz.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={quiz.title}
                            className="bg-black/60 text-white px-3 py-2 rounded-lg border border-purple-500 flex-1"
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
                            className="text-gray-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-lg font-bold text-pink-400 mb-2">
                          {quiz.title || `Untitled Quiz #${index + 1}`}
                        </h3>
                      )}
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><span className="text-purple-300">Created:</span> {new Date(quiz.createdAt).toLocaleString()}</p>
                        <p><span className="text-purple-300">Questions:</span> {quiz.questions?.length || 0}</p>
                        <p><span className="text-purple-300">Quiz ID:</span> <span className="font-mono text-xs">{quiz.id}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <CopyButton
                        textToCopy={JSON.stringify(quiz, null, 2)}
                        label="Copy Quiz"
                        variant="ghost"
                        size="sm"
                        className="bg-pink-700/80 hover:bg-pink-600"
                      />
                      <button
                        onClick={() => setEditingQuiz(quiz.id)}
                        className="bg-yellow-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-600"
                      >
                        Edit Title
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete quiz "${quiz.title || `Untitled Quiz #${index + 1}`}"? This action cannot be undone.`)) {
                            deleteQuiz(quiz.id);
                          }
                        }}
                        className="bg-red-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Questions */}
                  {quiz.questions && quiz.questions.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-pink-300 font-semibold">
                        📝 Questions ({quiz.questions.length})
                      </summary>
                      <div className="mt-4 space-y-4">
                        {quiz.questions.map((question, qIndex) => (
                          <div key={qIndex} className="bg-black/40 p-4 rounded-lg border border-pink-700">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-pink-200">
                                Q{qIndex + 1}: {question.text}
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingQuestion({quizId: quiz.id, questionIndex: qIndex})}
                                  className="bg-yellow-700/80 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                                >
                                  Edit
                                </button>
                                <CopyButton
                                  textToCopy={JSON.stringify(question, null, 2)}
                                  label=""
                                  variant="ghost"
                                  size="sm"
                                  className="bg-black/60 hover:bg-black/80"
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
                                <div className="p-3 bg-purple-900/40 border border-purple-500/50 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <span className="text-purple-400 text-lg font-bold">❓</span>
                                    <span className="text-purple-200 text-sm font-semibold leading-relaxed">
                                      {question.text}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-purple-300">Options:</p>
                                <div className="grid gap-2">
                                  {question.options?.map((option, optIndex) => {
                                    const correctAnswerIndex = typeof question.correctAnswer === 'string' 
                                      ? question.options?.indexOf(question.correctAnswer)
                                      : question.correctAnswer;
                                    const isCorrect = optIndex === correctAnswerIndex;
                                    
                                    return (
                                      <div 
                                        key={optIndex} 
                                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                          isCorrect
                                            ? 'bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-2 border-green-400 text-green-200 shadow-lg shadow-green-500/30'
                                            : 'bg-gray-800/60 border border-gray-600 text-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold">{String.fromCharCode(65 + optIndex)}.</span>
                                            <span className="flex-1">{option}</span>
                                          </div>
                                          {isCorrect && (
                                            <div className="flex items-center gap-2">
                                              <span className="text-green-400 text-lg">✅</span>
                                              <span className="text-green-300 font-bold text-xs bg-green-900/60 px-2 py-1 rounded-full">
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
    </div>
  );
}

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
    <div className="space-y-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
      <div>
        <label className="block text-sm font-semibold text-yellow-300 mb-2">Question Text:</label>
        <textarea
          value={editedQuestion.text}
          onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
          className="w-full bg-black/60 text-white p-3 rounded-lg border border-yellow-500/50 resize-none"
          rows={3}
          placeholder="Enter your question..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-yellow-300 mb-2">Options:</label>
        <div className="space-y-2">
          {editedQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={editedQuestion.correctAnswer === index}
                onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: index })}
                className="text-yellow-500"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 bg-black/60 text-white p-2 rounded border border-gray-600"
                placeholder={`Option ${index + 1}`}
              />
              {editedQuestion.options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="bg-red-700/80 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          className="mt-2 bg-green-700/80 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
        >
          + Add Option
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 