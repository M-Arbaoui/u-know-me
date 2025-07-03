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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMjQPxbbndf6ZpvSH7IO9XyLDsOjUai4M",
  authDomain: "u-know-me-d8a51.firebaseapp.com",
  projectId: "u-know-me-d8a51",
  storageBucket: "u-know-me-d8a51.firebasestorage.app",
  messagingSenderId: "599384550747",
  appId: "1:599384550747:web:afd4d9eecc60d18a773e7e",
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

  useEffect(() => {
    const initialAuth = async () => {
      if (!auth) {
        console.log('No auth available, skipping authentication');
        setIsAuthReady(true);
        return;
      }
      
      try {
        onAuthStateChanged(auth, (user) => {
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