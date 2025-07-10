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
import ResultsScreen from './components/ResultsScreen';
import CreatorLogin from './components/CreatorLogin';
import CreatorSpace from './components/CreatorSpace';
import DeveloperPanel from './components/DeveloperPanel';

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
          if (!user) {
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
          } else {
            console.log('User already signed in');
            setIsAuthReady(true);
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
    };
    window.addEventListener('keydown', handler);
    // Secret route: /dev
    if (window.location.pathname === '/dev') {
      setShowDev(true);
    }
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const resetState = () => {
    setQuizId(null);
    setParticipantName('');
    setQuizResults(null);
  };

  const handleSetView = (newView: string) => {
    if (newView === 'welcome') {
      resetState();
    }
    setView(newView);
  };

  const renderView = () => {
    if (!isAuthReady) {
      return <Loader text="Connecting to servers..." />;
    }
    if (showDev) {
      return <DeveloperPanel db={db} currentUser={currentUser} />;
    }
    switch (view) {
      case 'create':
        return <CreateQuiz setView={handleSetView} db={db} />;
      case 'join':
        return <JoinQuiz setView={handleSetView} setQuizId={setQuizId} setParticipantName={setParticipantName} db={db} />;
      case 'quiz':
        return quizId && participantName ? <QuizScreen setView={handleSetView} quizId={quizId} participantName={participantName} setQuizResults={setQuizResults} db={db} /> : <Loader text="Loading quiz..." />;
      case 'results':
        return quizResults ? <ResultsScreen setView={handleSetView} results={quizResults} /> : <Loader />;
      case 'creator-login':
        return <CreatorLogin setView={handleSetView} />;
      case 'creator-space':
        return <CreatorSpace setView={handleSetView} db={db} devMode={false} />;
      case 'admin':
      case 'developer':
        return <CreatorSpace setView={handleSetView} db={db} devMode={true} />;
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