import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
// Remove analytics for now to avoid issues
// import { getAnalytics } from "firebase/analytics";
import Loader from './components/Loader';
import WelcomeScreen from './components/WelcomeScreen';
import CreateQuiz from './components/CreateQuiz';
import JoinQuiz from './components/JoinQuiz';
import QuizScreen from './components/QuizScreen';
import CreatorLogin from './components/CreatorLogin';
import CreatorSpace from './components/CreatorSpace';
import DeveloperPanel from './components/DeveloperPanel';
import MigrationUtility from './components/MigrationUtility';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCMjQPxbbndf6ZpvSH7IO9XyLDsOjUai4M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "u-know-me-d8a51.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "u-know-me-d8a51",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "u-know-me-d8a51.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "599384550747",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:599384550747:web:afd4d9eecc60d18a773e7e",
  measurementId: "G-5QZWR6KRQ8"
};

// Initialize Firebase with error handling
let app, db, auth;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  // Remove analytics for now
  // analytics = getAnalytics(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error("Firebase initialization failed:", error);
  app = null;
  db = null;
  auth = null;
}

const App: React.FC = () => {
  const [view, setView] = useState('welcome');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAccountSection, setShowAccountSection] = useState(false);
  
  // Quiz creation success state
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  
  // Navigation history for proper back navigation
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['welcome']);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // Prevent all accidental form submits from reloading the page
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'FORM') {
        e.preventDefault();
      }
    };
    window.addEventListener('submit', handler, true);
    return () => window.removeEventListener('submit', handler, true);
  }, []);

  useEffect(() => {
    const initialAuth = async () => {
      if (!auth) {
        console.log('No auth available, skipping authentication');
        setIsAuthReady(true);
        return;
      }
      try {
        onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          if (user) {
            // Always set creatorId in localStorage to Firebase UID
            localStorage.setItem('creatorId', user.uid);
            console.log('User already signed in');
            setIsAuthReady(true);
          } else {
            const attemptSignIn = async () => {
              try {
                await signInAnonymously(auth);
                console.log('Anonymous sign-in successful');
              } catch (error) {
                console.error("Authentication failed:", error);
              } finally {
                setIsAuthReady(true);
              }
            };
            attemptSignIn();
          }
        });
      } catch (error) {
        console.error('Auth state change error:', error);
        setIsAuthReady(true);
      }
    };
    initialAuth();
  }, []);

  useEffect(() => {
    // Keyboard shortcut: Ctrl+Shift+D or Cmd+Shift+D for dev panel
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        setShowDev(true);
      }
      // Escape key to go back
      if (e.key === 'Escape' && view !== 'welcome') {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handler);
    
    // Secret route: /dev
    if (window.location.pathname === '/dev') {
      setShowDev(true);
    }
    
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [view]);

  const resetState = () => {
    setQuizId(null);
    setParticipantName('');
    setQuizResults(null);
    setShowAccountSection(false);
    setCreatedQuizId(null);
  };

  const handleSetView = (newView: string) => {
    // Don't add to history if it's the same view
    if (newView === view) return;
    
    // Handle special case for creator-space with account section
    if (newView === 'creator-space-account') {
      setShowAccountSection(true);
      newView = 'creator-space';
    } else {
      setShowAccountSection(false);
    }
    
    // Add to navigation history
    const newHistory = [...navigationHistory.slice(0, currentHistoryIndex + 1), newView];
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    
    if (newView === 'welcome') {
      resetState();
    }
    setView(newView);
  };

  const goBack = () => {
    if (currentHistoryIndex > 0) {
      const previousView = navigationHistory[currentHistoryIndex - 1];
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setView(previousView);
    } else {
      // If no history, go to welcome
      setView('welcome');
      resetState();
    }
  };

  const renderView = () => {
    if (!isAuthReady) {
      return <Loader text="Connecting to servers..." />;
    }
    if (showDev) {
      return <DeveloperPanel db={db} currentUser={currentUser} setView={handleSetView} />;
    }
    switch (view) {
      case 'create':
        return <CreateQuiz setView={handleSetView} goBack={goBack} db={db} setCreatedQuizId={setCreatedQuizId} currentCreatedQuizId={createdQuizId} />;
      case 'join':
        return <JoinQuiz setView={handleSetView} goBack={goBack} setQuizId={setQuizId} setParticipantName={setParticipantName} db={db} preFilledQuizCode={quizId || undefined} />;
      case 'quiz':
        return quizId && participantName ? <QuizScreen setView={handleSetView} quizId={quizId} participantName={participantName} setQuizResults={setQuizResults} db={db} /> : <Loader text="Loading quiz..." />;
      case 'results':
        return <Loader />;
      case 'creator-login':
        return <CreatorLogin setView={handleSetView} goBack={goBack} />;
      case 'creator-space':
        return <CreatorSpace setView={handleSetView} goBack={goBack} db={db} />;
      case 'admin':
      case 'developer':
        return <CreatorSpace setView={handleSetView} goBack={goBack} db={db} />;
      case 'migration':
        return <MigrationUtility db={db} onComplete={() => handleSetView('welcome')} />;
      case 'welcome':
      default:
        return <WelcomeScreen setView={handleSetView} />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      {renderView()}
    </div>
  );
};

export default App;