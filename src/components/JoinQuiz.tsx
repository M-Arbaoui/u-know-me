import React, { useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import CustomModal from './CustomModal';
import Loader from './Loader';

interface JoinQuizProps {
  setView: (view: string) => void;
  setQuizId: (id: string) => void;
  setQuizData: (data: any) => void;
  appId: string;
  db: any;
}

const JoinQuiz: React.FC<JoinQuizProps> = ({ setView, setQuizId, setQuizData, appId, db }) => {
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  const handleJoin = async () => {
    if (!inputCode.trim()) {
      setError({ title: "No Code", message: "You need to enter a quiz code to join." });
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'quizzes', inputCode.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setQuizData(docSnap.data());
        setQuizId(inputCode.trim());
        setView('quiz');
      } else {
        setError({ title: "Not Found", message: "That quiz code doesn't exist. Check for typos or ask your friend for the code again." });
      }
    } catch (err) {
      console.error("Error joining quiz:", err);
      setError({ title: "Error", message: "Couldn't fetch the quiz. Please check your connection and the code." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader text="Finding quiz..." />;
  }

  return (
    <div className="max-w-md mx-auto text-center">
      {error && <CustomModal title={error.title} message={error.message} onClose={() => setError(null)} />}
      <button onClick={() => setView('welcome')} className="text-indigo-400 hover:text-indigo-300 mb-6" aria-label="Back to Home">&larr; Back to Home</button>
      <h2 className="text-4xl font-bold text-white mb-3">Join a Quiz</h2>
      <p className="text-slate-300 mb-8">Enter the code your friend gave you below.</p>
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Enter quiz code here"
          className="w-full text-center bg-slate-700 text-white p-4 rounded-lg border border-slate-600 mb-6 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Quiz code input"
        />
        <button
          onClick={handleJoin}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
          aria-label="Start the quiz"
        >
          Start The Judgment
        </button>
      </div>
    </div>
  );
};

export default JoinQuiz; 