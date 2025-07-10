import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import CopyButton from './CopyButton';

const DEV_PASSWORD = 'dev2024!';
const DEV_EMAIL = 'dev@admin.com';

function getAllLocalStorageData() {
  const data: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    try {
      data[key] = JSON.parse(localStorage.getItem(key)!);
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

function getCreatorCredentials() {
  const creators: Array<{username: string, password: string}> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.startsWith('creator_')) {
      const username = key.replace('creator_', '');
      const password = localStorage.getItem(key) || '';
      creators.push({ username, password });
    }
  }
  return creators;
}

function getUserStats(userData: any) {
  if (!userData || !userData.quizzes) return null;
  const quizzes = userData.quizzes;
  let totalQuestions = 0;
  let totalCorrect = 0;
  let wrongAnswers: Record<string, number> = {};
  quizzes.forEach((quiz: any) => {
    quiz.questions.forEach((q: any) => {
      totalQuestions++;
      if (q.answeredCorrectly) totalCorrect++;
      if (!q.answeredCorrectly) {
        const wrong = q.userAnswer;
        wrongAnswers[wrong] = (wrongAnswers[wrong] || 0) + 1;
      }
    });
  });
  const avgCorrect = totalQuestions ? (totalCorrect / totalQuestions) * 100 : 0;
  const mostCommonWrong = Object.entries(wrongAnswers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  return { totalQuestions, totalCorrect, avgCorrect, mostCommonWrong };
}

interface DeveloperPanelProps {
  db?: any;
  currentUser?: any;
}

export default function DeveloperPanel({ db, currentUser }: DeveloperPanelProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [impersonate, setImpersonate] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [firestoreQuizzes, setFirestoreQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [viewMode, setViewMode] = useState<'local' | 'firestore'>('local');
  
  const data = getAllLocalStorageData();
  const userIds = Object.keys(data);

  // Check if current user is dev
  const isDevUser = currentUser?.email === DEV_EMAIL;

  useEffect(() => {
    if (isDevUser && !unlocked) {
      setUnlocked(true);
    }
  }, [isDevUser, unlocked]);

  const fetchFirestoreQuizzes = async () => {
    if (!db) return;
    
    setLoadingQuizzes(true);
    try {
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const quizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFirestoreQuizzes(quizzes);
    } catch (error) {
      console.error('Error fetching Firestore quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const deleteFirestoreQuiz = async (quizId: string) => {
    if (!db) return;
    
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      console.log('Quiz deleted from Firestore:', quizId);
      // Refresh the list
      fetchFirestoreQuizzes();
    } catch (error) {
      console.error('Error deleting quiz from Firestore:', error);
      alert('Failed to delete quiz from Firestore');
    }
  };

  const deleteLocalStorageQuiz = (userId: string, quizIndex: number) => {
    try {
      const userData = data[userId];
      if (userData?.quizzes) {
        userData.quizzes.splice(quizIndex, 1);
        localStorage.setItem(userId, JSON.stringify(userData));
        setRefresh(r => r + 1);
        console.log('Quiz deleted from localStorage for user:', userId);
      }
    } catch (error) {
      console.error('Error deleting quiz from localStorage:', error);
      alert('Failed to delete quiz from localStorage');
    }
  };

  useEffect(() => {
    if (unlocked && viewMode === 'firestore') {
      fetchFirestoreQuizzes();
    }
  }, [unlocked, viewMode, db]);

  // Dummy usage to suppress TS error
  if (typeof refresh === 'number' && refresh < 0) {
    console.log('refresh', refresh);
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-90">
        <div className="glass-card max-w-md w-full p-8 text-center border-2 border-purple-700 shadow-neon-glow">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 animate-pulse">Developer Access</h2>
          <p className="text-gray-300 mb-6">Enter the secret password to access the chaos protocol ☠️</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="glass-input w-full mb-4"
            placeholder="Dev password..."
          />
          <button
            className="gradient-button w-full py-2"
            onClick={() => setUnlocked(password === DEV_PASSWORD)}
          >
            Unlock
          </button>
          {password && password !== DEV_PASSWORD && (
            <div className="text-red-400 mt-2">Wrong password. Try again.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-purple-400 neon-glow">🧠 Developer Admin Panel</h1>
          <div className="flex gap-4">
            <div className="flex space-x-2 bg-purple-900/50 rounded-xl p-2">
              <button
                onClick={() => setViewMode('local')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'local' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                📱 Local Data
              </button>
              <button
                onClick={() => setViewMode('firestore')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'firestore' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                🔥 Firestore
              </button>
            </div>
            <button className="gradient-button px-6 py-2" onClick={() => setUnlocked(false)}>
              Lock Panel
            </button>
          </div>
        </div>

        {viewMode === 'local' && (
          <>
            <div className="glass-card p-6 mb-8 border-2 border-purple-700 shadow-neon-glow">
              <p className="text-lg text-pink-400 font-mono mb-2">{`Accessing brain of peasant #${userIds.length}...`}</p>
              <p className="text-gray-400 text-sm">{userIds.length} user(s) found in localStorage.</p>
            </div>

            {/* Creator Accounts Section */}
            <div className="glass-card p-6 mb-8 border-2 border-teal-700 shadow-neon-glow-teal">
              <h2 className="text-xl font-bold text-teal-400 mb-4">👑 Creator Accounts</h2>
              {(() => {
                const creators = getCreatorCredentials();
                return creators.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {creators.map((creator, index) => (
                      <div key={index} className="bg-black/40 p-4 rounded-lg border border-teal-700">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-teal-200">@{creator.username}</h3>
                          <span className="text-xs text-teal-400 bg-teal-900/60 px-2 py-1 rounded-full">
                            Creator #{index + 1}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Username:</span>
                            <span className="text-sm text-white font-mono bg-gray-800 px-2 py-1 rounded">
                              {creator.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Password:</span>
                            <span className="text-sm text-white font-mono bg-gray-800 px-2 py-1 rounded">
                              {creator.password}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <CopyButton
                            textToCopy={`Username: ${creator.username}\nPassword: ${creator.password}`}
                            label="Copy Credentials"
                            variant="ghost"
                            size="sm"
                            className="bg-teal-700/80 hover:bg-teal-600 text-xs"
                          />
                          <button
                            className="bg-red-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                            onClick={() => {
                              if (window.confirm(`Delete creator account "${creator.username}"?`)) {
                                localStorage.removeItem(`creator_${creator.username}`);
                                setRefresh(r => r + 1);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-4">👑</div>
                    <p className="text-teal-300">No creator accounts found.</p>
                    <p className="text-gray-400 text-sm mt-2">Creator accounts will appear here when users register.</p>
                  </div>
                );
              })()}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {userIds.map((userId) => {
                const userData = data[userId];
                const stats = getUserStats(userData);
                return (
                  <div key={userId} className="glass-card border-2 border-pink-700 shadow-neon-glow-pink p-6 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-pink-400">User ID: <span className="text-white">{userId}</span></h2>
                      <button
                        className="bg-pink-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-pink-600"
                        onClick={() => setImpersonate(userId)}
                      >Impersonate</button>
                    </div>
                    <div className="text-gray-300 text-sm mb-2">{JSON.stringify(userData).length} bytes</div>
                    {stats && (
                      <div className="mb-2">
                        <div className="text-purple-300 text-xs">Stats:</div>
                        <div className="text-gray-200 text-xs">
                          Entries: {userData.quizzes?.length || 0} | Avg Correct: {stats.avgCorrect.toFixed(1)}% | Most Common Wrong: {stats.mostCommonWrong}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mb-2">
                      <CopyButton
                        textToCopy={JSON.stringify(userData, null, 2)}
                        label="Copy Data"
                        variant="ghost"
                        size="sm"
                        className="bg-purple-700/80 hover:bg-purple-600"
                      />
                      <button
                        className="bg-purple-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-600"
                        onClick={() => {
                          if (window.confirm('Reset this user?')) {
                            localStorage.removeItem(userId);
                            setRefresh(r => r + 1);
                          }
                        }}
                      >Reset</button>
                      <button
                        className="bg-yellow-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-yellow-600"
                        onClick={() => {
                          const newVal = prompt('Edit raw data:', JSON.stringify(userData, null, 2));
                          if (newVal) {
                            try {
                              localStorage.setItem(userId, newVal);
                              setRefresh(r => r + 1);
                            } catch (e) {
                              alert('Invalid JSON!');
                            }
                          }
                        }}
                      >Edit</button>
                      <button
                        className="bg-red-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                        onClick={() => {
                          if (window.confirm('Delete this user?')) {
                            localStorage.removeItem(userId);
                            setRefresh(r => r + 1);
                          }
                        }}
                      >Delete</button>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-purple-300">Show Data</summary>
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <CopyButton
                            textToCopy={JSON.stringify(userData, null, 2)}
                            label=""
                            variant="ghost"
                            size="sm"
                            showIcon={true}
                            className="bg-black/60 hover:bg-black/80"
                          />
                        </div>
                        <pre className="bg-black/60 p-2 rounded-lg text-xs mt-2 overflow-x-auto max-h-40">{JSON.stringify(userData, null, 2)}</pre>
                      </div>
                    </details>
                    {userData?.quizzes && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-pink-300">Show Quizzes</summary>
                        <div className="mt-2 space-y-2">
                          {userData.quizzes.map((quiz: any, qidx: number) => (
                            <div key={qidx} className="bg-black/40 p-2 rounded-lg border border-pink-700 relative">
                              <div className="absolute top-2 right-2 flex gap-1">
                                <CopyButton
                                  textToCopy={JSON.stringify(quiz, null, 2)}
                                  label=""
                                  variant="ghost"
                                  size="sm"
                                  showIcon={true}
                                  className="bg-black/60 hover:bg-black/80"
                                />
                                <button
                                  className="bg-red-700/80 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                  onClick={() => {
                                    if (window.confirm(`Delete quiz "${quiz.title || `Untitled #${qidx+1}`}" from localStorage?`)) {
                                      deleteLocalStorageQuiz(userId, qidx);
                                    }
                                  }}
                                  title="Delete Quiz"
                                >
                                  🗑️
                                </button>
                              </div>
                              <div className="font-bold text-pink-200">Quiz: {quiz.title || `Untitled #${qidx+1}`}</div>
                              <div className="text-xs text-gray-300">Questions: {quiz.questions?.length || 0}</div>
                              <ul className="list-disc ml-6 mt-1">
                                {quiz.questions?.map((q: any, i: number) => (
                                  <li key={i} className="mb-1">
                                    <span className="text-purple-200">Q{i+1}:</span> {q.text} <br/>
                                    <span className="text-green-400">Correct:</span> {q.options?.[q.correctAnswer]}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {impersonate === userId && (
                      <div className="mt-4 p-4 bg-purple-900/80 rounded-lg border border-purple-700">
                        <div className="text-pink-300 mb-2">Impersonating <span className="font-bold">{userId}</span></div>
                        <button
                          className="gradient-button px-4 py-1"
                          onClick={() => setImpersonate(null)}
                        >Stop Impersonating</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'firestore' && (
          <div className="space-y-6">
            <div className="glass-card p-6 border-2 border-purple-700 shadow-neon-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-400">🔥 Firestore Quizzes</h2>
                <button
                  onClick={fetchFirestoreQuizzes}
                  className="bg-purple-700/80 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                  disabled={loadingQuizzes}
                >
                  {loadingQuizzes ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>
              <p className="text-gray-300 text-sm">{firestoreQuizzes.length} quiz(zes) found in Firestore.</p>
            </div>

            {loadingQuizzes ? (
              <div className="glass-card p-8 text-center border-2 border-purple-700">
                <div className="text-2xl mb-4">🔄</div>
                <p className="text-purple-300">Loading Firestore data...</p>
              </div>
            ) : firestoreQuizzes.length === 0 ? (
              <div className="glass-card p-8 text-center border-2 border-purple-700">
                <div className="text-2xl mb-4">📭</div>
                <p className="text-purple-300">No quizzes found in Firestore.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {firestoreQuizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-lavender-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-pink-400 mb-2">
                          Quiz: {quiz.title || `Untitled #${quiz.id.slice(-6)}`}
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="text-purple-300">Creator:</span> {quiz.creatorName || 'Unknown'}</p>
                          <p><span className="text-purple-300">Quiz ID:</span> {quiz.id}</p>
                          <p><span className="text-purple-300">Created:</span> {new Date(quiz.createdAt).toLocaleString()}</p>
                          <p><span className="text-purple-300">Questions:</span> {quiz.questions?.length || 0}</p>
                        </div>
                      </div>
                      <CopyButton
                        textToCopy={JSON.stringify(quiz, null, 2)}
                        label="Copy Quiz"
                        variant="ghost"
                        size="sm"
                        className="bg-pink-700/80 hover:bg-pink-600"
                      />
                      <button
                        className="bg-red-700/80 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                        onClick={() => {
                          if (window.confirm(`Delete quiz "${quiz.title || `Untitled #${quiz.id.slice(-6)}`}" from Firestore? This action cannot be undone.`)) {
                            deleteFirestoreQuiz(quiz.id);
                          }
                        }}
                      >
                        Delete Quiz
                      </button>
                    </div>

                    {quiz.questions && quiz.questions.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-pink-300 font-semibold">
                          📝 Questions ({quiz.questions.length})
                        </summary>
                        <div className="mt-4 space-y-4">
                          {quiz.questions.map((question: any, qIndex: number) => (
                            <div key={qIndex} className="bg-black/40 p-4 rounded-lg border border-pink-700">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-pink-200">
                                  Q{qIndex + 1}: {question.text}
                                </h4>
                                <CopyButton
                                  textToCopy={JSON.stringify(question, null, 2)}
                                  label=""
                                  variant="ghost"
                                  size="sm"
                                  showIcon={true}
                                  className="bg-black/60 hover:bg-black/80"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                {/* Debug Question Data */}
                                <div className="text-xs text-blue-400 mb-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
                                  Debug Question: {JSON.stringify(question)}
                                </div>
                                
                                {/* Question Text */}
                                <div className="p-3 bg-purple-900/40 border border-purple-500/50 rounded-lg mb-3">
                                  <div className="flex items-start gap-2">
                                    <span className="text-purple-400 text-lg font-bold">❓</span>
                                    <span className="text-purple-200 text-sm font-semibold leading-relaxed">
                                      {question.text || question.question || 'Question text not found'}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-purple-300">Options:</p>
                                
                                {/* Debug Info */}
                                <div className="text-xs text-yellow-400 mb-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                                  Debug: correctAnswer = {JSON.stringify(question.correctAnswer)} (type: {typeof question.correctAnswer})
                                </div>
                                
                                <div className="grid gap-2">
                                  {question.options?.map((option: string, optIndex: number) => {
                                    // Handle different possible formats of correctAnswer
                                    const correctAnswerIndex = typeof question.correctAnswer === 'string' 
                                      ? question.options?.indexOf(question.correctAnswer)
                                      : question.correctAnswer;
                                    
                                    const isCorrect = optIndex === correctAnswerIndex;
                                    
                                    return (
                                      <div 
                                        key={optIndex} 
                                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                          isCorrect
                                            ? 'bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-2 border-green-400 text-green-200 shadow-lg shadow-green-500/30 animate-pulse'
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
                                              <span className="text-green-400 text-lg animate-bounce">✅</span>
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
        )}

        <div className="mt-12 text-center text-purple-400 font-mono animate-pulse">
          Initiating chaos protocol ☠️<br/>
          <span className="text-xs text-gray-500">(dev-only jokes and messages enabled)</span>
        </div>
      </div>
    </div>
  );
} 