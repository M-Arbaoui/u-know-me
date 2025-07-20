import { useState, useEffect } from 'react';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
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
  setView?: (view: string) => void;
}

export default function DeveloperPanel({ db, currentUser, setView }: DeveloperPanelProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [impersonate, setImpersonate] = useState<string | null>(null);
  const [firestoreQuizzes, setFirestoreQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [viewMode, setViewMode] = useState<'local' | 'firestore'>('local');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  
  const data = getAllLocalStorageData();
  const userIds = Object.keys(data);

  // Check if current user is dev
  const isDevUser = currentUser?.email === DEV_EMAIL;

  useEffect(() => {
    if (isDevUser && !unlocked) {
      setUnlocked(true);
    }
  }, [isDevUser, unlocked]);

  // Check for lockout
  useEffect(() => {
    if (lockoutTime && Date.now() < lockoutTime) {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutTime(null);
        setLoginAttempts(0);
      }
    }
  }, [lockoutTime]);

  const handlePasswordSubmit = () => {
    if (lockoutTime && Date.now() < lockoutTime) {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
      alert(`Account temporarily locked. Try again in ${remaining} seconds.`);
      return;
    }

    if (password === DEV_PASSWORD) {
      setUnlocked(true);
      setPassword('');
      setLoginAttempts(0);
      setLockoutTime(null);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        const lockoutDuration = 30 * 1000; // 30 seconds
        setLockoutTime(Date.now() + lockoutDuration);
        alert('Too many failed attempts. Account locked for 30 seconds.');
      } else {
        alert(`Incorrect password. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  const fetchFirestoreQuizzes = async () => {
    if (!db) return;
    
    setLoadingQuizzes(true);
    try {
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef);
      const snapshot = await getDocs(q);
      const quizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      
      quizzes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
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
        // Force re-render by updating a state
        setImpersonate(prev => prev);
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

  if (!unlocked) {
    const isLocked = Boolean(lockoutTime && Date.now() < lockoutTime);
    const remainingTime = isLocked ? Math.ceil((lockoutTime! - Date.now()) / 1000) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="relative max-w-md w-full mx-4">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl animate-pulse"></div>
          
          {/* Main Card */}
          <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/25">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-lg shadow-purple-500/50">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 neon-glow">Developer Access</h2>
              <p className="text-gray-300 text-sm">Enter the master key to access the chaos protocol</p>
            </div>

            {/* Lockout Warning */}
            {isLocked && (
              <div className="bg-red-900/50 border border-red-500/50 rounded-2xl p-4 mb-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-red-300 font-semibold">Account Temporarily Locked</p>
                    <p className="text-red-400 text-sm">Try again in {remainingTime} seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Form */}
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-purple-300 mb-3">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLocked}
                    className="w-full bg-gray-900/80 border-2 border-purple-500/50 rounded-2xl px-4 py-4 text-white text-center text-lg font-mono placeholder-gray-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all duration-300 disabled:opacity-50"
                    placeholder="••••••••••••"
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {loginAttempts > 0 && `${3 - loginAttempts} attempts remaining`}
                </p>
              </div>

              <button
                onClick={handlePasswordSubmit}
                disabled={!password.trim() || isLocked}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
              >
                <span className="mr-2">🚀</span>
                Unlock Developer Panel
                <span className="ml-2">⚡</span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div className="text-xs text-gray-400">
                  <p className="font-semibold text-yellow-300 mb-1">Security Notice</p>
                  <p>This panel contains sensitive system data. Unauthorized access is prohibited.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent neon-glow">
                Developer Admin Panel
              </h1>
              <p className="text-gray-400 text-sm">Advanced system management and monitoring</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {setView && (
              <button
                onClick={() => setView('migration')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔄 Migration
              </button>
            )}
            
            <div className="flex space-x-2 bg-gray-800/50 rounded-xl p-2 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('local')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  viewMode === 'local' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                📱 Local Data
              </button>
              <button
                onClick={() => setViewMode('firestore')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  viewMode === 'firestore' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                🔥 Firestore
              </button>
            </div>
            
            <button 
              onClick={() => setUnlocked(false)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔒 Lock Panel
            </button>
          </div>
        </div>

        {/* Enhanced Content */}
        {viewMode === 'local' && (
          <>
            {/* System Overview Card */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mb-8 border-2 border-purple-500/50 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="text-lg font-bold text-purple-300 mb-1">Total Users</h3>
                  <p className="text-3xl font-bold text-white">{userIds.length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 border border-blue-500/30">
                  <div className="text-3xl mb-3">👑</div>
                  <h3 className="text-lg font-bold text-blue-300 mb-1">Creators</h3>
                  <p className="text-3xl font-bold text-white">{getCreatorCredentials().length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl p-6 border border-green-500/30">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-bold text-green-300 mb-1">Data Size</h3>
                  <p className="text-3xl font-bold text-white">{JSON.stringify(data).length} B</p>
                </div>
              </div>
            </div>

            {/* Creator Accounts Section */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 mb-8 border-2 border-teal-500/50 shadow-2xl">
              <h2 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-3">
                <span className="text-3xl">👑</span>
                Creator Accounts
              </h2>
              {(() => {
                const creators = getCreatorCredentials();
                return creators.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.map((creator, index) => (
                      <div key={index} className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 p-6 rounded-2xl border border-teal-500/30 hover:border-teal-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-teal-200 text-lg">@{creator.username}</h3>
                          <span className="text-xs text-teal-400 bg-teal-900/60 px-3 py-1 rounded-full">
                            Creator #{index + 1}
                          </span>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">Username:</span>
                            <span className="text-sm text-white font-mono bg-gray-800/80 px-3 py-1 rounded-lg">
                              {creator.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">Password:</span>
                            <span className="text-sm text-white font-mono bg-gray-800/80 px-3 py-1 rounded-lg">
                              {creator.password}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CopyButton
                            textToCopy={`Username: ${creator.username}\nPassword: ${creator.password}`}
                            label="Copy Credentials"
                            variant="ghost"
                            size="sm"
                            className="bg-teal-700/80 hover:bg-teal-600 text-xs"
                          />
                          <button
                            className="bg-red-700/80 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition-all duration-300"
                            onClick={() => {
                              if (window.confirm(`Delete creator account "${creator.username}"?`)) {
                                localStorage.removeItem(`creator_${creator.username}`);
                                setImpersonate(prev => prev);
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
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👑</div>
                    <p className="text-teal-300 text-lg mb-2">No creator accounts found</p>
                    <p className="text-gray-400 text-sm">Creator accounts will appear here when users register</p>
                  </div>
                );
              })()}
            </div>

            {/* User Data Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {userIds.map((userId) => {
                const userData = data[userId];
                const stats = getUserStats(userData);
                return (
                  <div key={userId} className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 border-2 border-pink-500/50 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-pink-400">User ID: <span className="text-white">{userId}</span></h2>
                      <button
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-xs transition-all duration-300 transform hover:scale-105"
                        onClick={() => setImpersonate(userId)}
                      >
                        Impersonate
                      </button>
                    </div>
                    
                    <div className="text-gray-300 text-sm mb-4">{JSON.stringify(userData).length} bytes</div>
                    
                    {stats && (
                      <div className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <div className="text-purple-300 text-sm font-semibold mb-2">📊 Statistics:</div>
                        <div className="text-gray-200 text-sm space-y-1">
                          <div>Entries: {userData.quizzes?.length || 0}</div>
                          <div>Avg Correct: {stats.avgCorrect.toFixed(1)}%</div>
                          <div>Most Common Wrong: {stats.mostCommonWrong}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <CopyButton
                        textToCopy={JSON.stringify(userData, null, 2)}
                        label="Copy Data"
                        variant="ghost"
                        size="sm"
                        className="bg-purple-700/80 hover:bg-purple-600"
                      />
                      <button
                        className="bg-purple-700/80 text-white px-3 py-2 rounded-lg text-xs hover:bg-purple-600 transition-all duration-300"
                        onClick={() => {
                          if (window.confirm('Reset this user?')) {
                            localStorage.removeItem(userId);
                            setImpersonate(prev => prev);
                          }
                        }}
                      >
                        Reset
                      </button>
                      <button
                        className="bg-yellow-700/80 text-white px-3 py-2 rounded-lg text-xs hover:bg-yellow-600 transition-all duration-300"
                        onClick={() => {
                          const newVal = prompt('Edit raw data:', JSON.stringify(userData, null, 2));
                          if (newVal) {
                            try {
                              localStorage.setItem(userId, newVal);
                              setImpersonate(prev => prev);
                            } catch (e) {
                              alert('Invalid JSON!');
                            }
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-700/80 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition-all duration-300"
                        onClick={() => {
                          if (window.confirm('Delete this user?')) {
                            localStorage.removeItem(userId);
                            setImpersonate(prev => prev);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    <details className="mt-4">
                      <summary className="cursor-pointer text-purple-300 font-semibold hover:text-purple-200 transition-colors">
                        📄 Show Data
                      </summary>
                      <div className="relative mt-3">
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
                        <pre className="bg-black/60 p-4 rounded-xl text-xs mt-2 overflow-x-auto max-h-40 border border-gray-700/50">{JSON.stringify(userData, null, 2)}</pre>
                      </div>
                    </details>
                    
                    {userData?.quizzes && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-pink-300 font-semibold hover:text-pink-200 transition-colors">
                          📝 Show Quizzes
                        </summary>
                        <div className="mt-4 space-y-3">
                          {userData.quizzes.map((quiz: any, qidx: number) => (
                            <div key={qidx} className="bg-gray-800/50 p-4 rounded-xl border border-pink-700/50 relative">
                              <div className="absolute top-3 right-3 flex gap-2">
                                <CopyButton
                                  textToCopy={JSON.stringify(quiz, null, 2)}
                                  label=""
                                  variant="ghost"
                                  size="sm"
                                  showIcon={true}
                                  className="bg-black/60 hover:bg-black/80"
                                />
                                <button
                                  className="bg-red-700/80 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-all duration-300"
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
                              <div className="font-bold text-pink-200 mb-2">Quiz: {quiz.title || `Untitled #${qidx+1}`}</div>
                              <div className="text-xs text-gray-300 mb-3">Questions: {quiz.questions?.length || 0}</div>
                              <ul className="list-disc ml-6 space-y-1">
                                {quiz.questions?.map((q: any, i: number) => (
                                  <li key={i} className="text-sm">
                                    <span className="text-purple-200">Q{i+1}:</span> {q.text || q.question} <br/>
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
                      <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/80 to-pink-900/80 rounded-xl border border-purple-700/50">
                        <div className="text-pink-300 mb-3 font-semibold">🎭 Impersonating <span className="font-bold">{userId}</span></div>
                        <button
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                          onClick={() => setImpersonate(null)}
                        >
                          Stop Impersonating
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'firestore' && (
          <div className="space-y-8">
            {/* Firestore Overview */}
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  Firestore Quizzes
                </h2>
                <button
                  onClick={fetchFirestoreQuizzes}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  disabled={loadingQuizzes}
                >
                  {loadingQuizzes ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>
              <p className="text-gray-300 text-lg">{firestoreQuizzes.length} quiz(zes) found in Firestore.</p>
            </div>

            {loadingQuizzes ? (
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-purple-500/50 shadow-2xl">
                <div className="text-4xl mb-6 animate-spin">🔄</div>
                <p className="text-purple-300 text-xl">Loading Firestore data...</p>
              </div>
            ) : firestoreQuizzes.length === 0 ? (
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-purple-500/50 shadow-2xl">
                <div className="text-4xl mb-6">📭</div>
                <p className="text-purple-300 text-xl">No quizzes found in Firestore.</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {firestoreQuizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 border-2 border-pink-500/50 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-pink-400 mb-3">
                          Quiz: {quiz.title || `Untitled #${quiz.id.slice(-6)}`}
                        </h3>
                        <div className="text-gray-300 space-y-2">
                          <p><span className="text-purple-300 font-semibold">Creator:</span> {quiz.creatorName || 'Unknown'}</p>
                          <p><span className="text-purple-300 font-semibold">Quiz ID:</span> {quiz.id}</p>
                          <p><span className="text-purple-300 font-semibold">Created:</span> {new Date(quiz.createdAt).toLocaleString()}</p>
                          <p><span className="text-purple-300 font-semibold">Questions:</span> {quiz.questions?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CopyButton
                          textToCopy={JSON.stringify(quiz, null, 2)}
                          label="Copy Quiz"
                          variant="ghost"
                          size="sm"
                          className="bg-pink-700/80 hover:bg-pink-600"
                        />
                        <button
                          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                          onClick={() => {
                            if (window.confirm(`Delete quiz "${quiz.title || `Untitled #${quiz.id.slice(-6)}`}" from Firestore? This action cannot be undone.`)) {
                              deleteFirestoreQuiz(quiz.id);
                            }
                          }}
                        >
                          Delete Quiz
                        </button>
                      </div>
                    </div>

                    {quiz.questions && quiz.questions.length > 0 && (
                      <details className="mt-6">
                        <summary className="cursor-pointer text-pink-300 font-semibold text-lg hover:text-pink-200 transition-colors">
                          📝 Questions ({quiz.questions.length})
                        </summary>
                        <div className="mt-6 space-y-6">
                          {quiz.questions.map((question: any, qIndex: number) => (
                            <div key={qIndex} className="bg-gray-800/50 p-6 rounded-2xl border border-pink-700/50">
                              <div className="flex items-start justify-between mb-4">
                                <h4 className="font-semibold text-pink-200 text-lg">
                                  Q{qIndex + 1}: {question.question || question.text || 'Question text not found'}
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
                              
                              <div className="space-y-4">
                                {/* Question Text */}
                                <div className="p-4 bg-purple-900/40 border border-purple-500/50 rounded-xl">
                                  <div className="flex items-start gap-3">
                                    <span className="text-purple-400 text-xl font-bold">❓</span>
                                    <span className="text-purple-200 text-base font-semibold leading-relaxed">
                                      {question.question || question.text || 'Question text not found'}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-purple-300 font-semibold">Options:</p>
                                
                                <div className="grid gap-3">
                                  {question.options?.map((option: string, optIndex: number) => {
                                    const correctAnswerIndex = typeof question.correctAnswer === 'string' 
                                      ? question.options?.indexOf(question.correctAnswer)
                                      : question.correctAnswer;
                                    
                                    const isCorrect = optIndex === correctAnswerIndex;
                                    
                                    return (
                                      <div 
                                        key={optIndex} 
                                        className={`p-4 rounded-xl text-base transition-all duration-300 ${
                                          isCorrect
                                            ? 'bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-2 border-green-400 text-green-200 shadow-lg shadow-green-500/30 animate-pulse'
                                            : 'bg-gray-800/60 border border-gray-600 text-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-lg">{String.fromCharCode(65 + optIndex)}.</span>
                                            <span className="flex-1">{option}</span>
                                          </div>
                                          {isCorrect && (
                                            <div className="flex items-center gap-3">
                                              <span className="text-green-400 text-xl animate-bounce">✅</span>
                                              <span className="text-green-300 font-bold text-sm bg-green-900/60 px-3 py-1 rounded-full">
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

        {/* Enhanced Footer */}
        <div className="mt-16 text-center">
          <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl">
            <p className="text-purple-400 font-mono text-lg animate-pulse mb-2">
              🧠 Chaos Protocol Active ☠️
            </p>
            <p className="text-gray-500 text-sm">
              Advanced system monitoring and management interface
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 