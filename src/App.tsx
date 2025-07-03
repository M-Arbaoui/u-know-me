import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import Loader from './components/Loader';
import CustomModal from './components/CustomModal';
import WelcomeScreen from './components/WelcomeScreen';
import CreateQuiz from './components/CreateQuiz';
import ShareScreen from './components/ShareScreen';
import JoinQuiz from './components/JoinQuiz';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import AdminPanel from './components/AdminPanel';

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

const appId = 'u-know-me-d8a51';

// Initialize Firebase with error handling
let app, db, auth, analytics;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  analytics = getAnalytics(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  app = null;
  db = null;
  auth = null;
  analytics = null;
}

const App: React.FC = () => {
  const [view, setView] = useState('welcome');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initialAuth = async () => {
      if (!auth) {
        setIsAuthReady(true);
        return;
      }
      
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          const attemptSignIn = async () => {
            try {
              await signInAnonymously(auth);
            } catch (error) {
              console.error("Authentication failed:", error);
            } finally {
              setIsAuthReady(true);
            }
          };
          attemptSignIn();
        } else {
          setIsAuthReady(true);
        }
      });
    };
    initialAuth();
  }, []);

  const resetState = () => {
    setQuizId(null);
    setQuizData(null);
    setScore(0);
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
        return <CreateQuiz setView={handleSetView} setQuizId={setQuizId} appId={appId} db={db} />;
      case 'share':
        return <ShareScreen setView={handleSetView} quizId={quizId} />;
      case 'join':
        return <JoinQuiz setView={handleSetView} setQuizId={setQuizId} setQuizData={setQuizData} appId={appId} db={db} />;
      case 'quiz':
        return quizData ? <QuizScreen setView={handleSetView} quizData={quizData} setScore={setScore} /> : <Loader text="Loading quiz..." />;
      case 'results':
        return quizData && quizId ? <ResultsScreen setView={handleSetView} score={score} quizData={quizData} quizId={quizId} db={db} /> : <Loader />;
      case 'admin':
        return <AdminPanel setView={handleSetView} db={db} appId={appId} />;
      case 'welcome':
      default:
        return <WelcomeScreen setView={handleSetView} />;
    }
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen w-full font-sans flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="z-10 w-full">
        {renderView()}
      </div>
    </main>
  );
};

export default App;