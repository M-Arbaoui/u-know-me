import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import Loader from './Loader';
import { FaArrowLeft, FaCheck, FaRocket, FaTimes } from 'react-icons/fa';
import { MdQuiz, MdTimer } from 'react-icons/md';
import { GiBrain, GiOnTarget } from 'react-icons/gi';
import { IoSparklesOutline } from 'react-icons/io5';

interface QuizScreenProps {
  quizId: string;
  participantName: string;
  setView: (view: string) => void;
  setQuizResults: (results: any) => void;
  db: any;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  id: string;
  creatorName: string;
  questions: Question[];
  createdAt: string;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ 
  quizId, 
  participantName, 
  setView, 
  setQuizResults, 
  db 
}) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (showTimer && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleAnswerSubmit();
    }
  }, [timeLeft, showTimer]);

  const fetchQuiz = async () => {
    try {
      const quizRef = collection(db, 'quizzes');
      const snapshot = await getDocs(query(quizRef, where('__name__', '==', quizId)));
      
      if (!snapshot.empty) {
        const quizData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QuizData;
        setQuiz(quizData);
        setSelectedAnswers(new Array(quizData.questions.length).fill(''));
      } else {
        alert('Quiz not found!');
        setView('join');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Error loading quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleAnswerSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const score = selectedAnswers.reduce((total, answer, index) => {
        return total + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
      }, 0);

      const percentage = Math.round((score / quiz.questions.length) * 100);

      const results = {
        quizId,
        participantName,
        score,
        totalQuestions: quiz.questions.length,
        percentage,
        createdAt: new Date().toISOString(),
        answers: selectedAnswers.map((answer, index) => ({
          questionIndex: index,
          selectedAnswer: answer,
          correctAnswer: quiz.questions[index].correctAnswer,
          isCorrect: answer === quiz.questions[index].correctAnswer
        }))
      };

      await addDoc(collection(db, 'quizAttempts'), results);
      setQuizResults(results);
      setView('results');
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Error saving results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading your quiz..." />;
  }

  if (!quiz) {
    return <Loader text="Quiz not found..." />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #A2D2FF 0%, #CFFFE5 100%)' }}>
      {/* Hand-drawn/doodle background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <span className="absolute left-8 top-10 text-4xl opacity-30 animate-float">⭐️</span>
        <span className="absolute right-12 top-24 text-3xl opacity-20 animate-float">✨</span>
        <span className="absolute left-1/2 top-1/3 text-5xl opacity-10 animate-float">?</span>
        <span className="absolute right-1/4 bottom-16 text-4xl opacity-20 animate-float">💧</span>
        <svg className="absolute left-1/4 bottom-8 w-32 h-8 opacity-20" viewBox="0 0 128 32" fill="none">
          <path d="M0 16 Q32 0 64 16 Q96 32 128 16" stroke="#3BB3FF" strokeWidth="3" fill="none" />
        </svg>
        <svg className="absolute right-1/4 top-8 w-32 h-8 opacity-20" viewBox="0 0 128 32" fill="none">
          <path d="M0 16 Q32 32 64 16 Q96 0 128 16" stroke="#2ED8B6" strokeWidth="3" fill="none" />
        </svg>
      </div>
      {/* Centered Logo Header with hand-drawn ring/sparkles */}
      <header className="w-full flex flex-col items-center justify-center px-6 py-8 md:px-0 md:py-10 relative z-10">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Do You Even Know Me Logo"
            className="mx-auto shadow-xl animate-fade-in"
            style={{
              width: 120,
              height: 'auto',
              maxWidth: '60vw',
              borderRadius: '2.5rem',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 32px #b18fff33',
              padding: '1.2rem',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* Hand-drawn ring */}
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none" style={{ zIndex: -1 }} viewBox="0 0 160 160" fill="none">
            <ellipse cx="80" cy="80" rx="75" ry="60" stroke="#3BB3FF" strokeWidth="4" strokeDasharray="12 10" />
            <ellipse cx="80" cy="80" rx="60" ry="75" stroke="#2ED8B6" strokeWidth="2" strokeDasharray="8 14" />
            <text x="20" y="30" fontSize="22" fill="#FFD600" opacity="0.7">✨</text>
            <text x="110" y="130" fontSize="18" fill="#FF61A6" opacity="0.7">★</text>
          </svg>
        </div>
      </header>
      {/* Main Quiz Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full">
        <div className="relative rounded-3xl shadow-2xl p-6 md:p-10 max-w-2xl w-full bg-white/95 flex flex-col items-center justify-center border-4 border-[#CFFFE5] mb-8" style={{ boxShadow: '0 12px 48px #a2d2ff55' }}>
          {/* Hand-drawn border doodle */}
          <svg className="absolute -top-6 -left-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 Q40 24 56 16 Q48 32 56 48 Q40 40 32 56 Q24 40 8 48 Q16 32 8 16 Q24 24 32 8Z" stroke="#A2D2FF" strokeWidth="3" strokeLinejoin="round" fill="none" />
            <text x="28" y="36" fontSize="18" fill="#3BB3FF">🔑</text>
          </svg>
          <svg className="absolute -bottom-6 -right-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
            <path d="M8 32 Q24 24 16 8 Q32 16 48 8 Q40 24 56 32 Q40 40 48 56 Q32 48 16 56 Q24 40 8 32Z" stroke="#2ED8B6" strokeWidth="3" strokeLinejoin="round" fill="none" />
            <text x="28" y="36" fontSize="18" fill="#2ED8B6">★</text>
          </svg>
          {/* --- Main Quiz Content --- */}
          <div className="w-full text-[#232946] font-quicksand">
        {/* Header */}
            <div className="card mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={() => setView('join')}
                    className="w-10 h-10 md:w-12 md:h-12 bg-dark-glass hover:bg-card-hover rounded-2xl flex items-center justify-center transition-all duration-300 soft-shadow border border-dark hover:border-sky"
                  >
                    <FaArrowLeft className="text-lg md:text-xl text-dark-primary" />
                  </button>
                  <div>
                    <h1 className="text-lg md:text-2xl font-bold text-dark-primary flex items-center gap-2 md:gap-3">
                      <GiOnTarget className="text-sky" />
                      <MdQuiz className="text-sky" />
                      <span className="hidden sm:inline">Quiz Time!</span>
                      <span className="sm:hidden">Quiz</span>
                    </h1>
                    <p className="text-dark-secondary text-sm md:text-base">Good luck, {participantName}! 😏</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Progress Indicator */}
                  <div className="text-center">
                    <div className="text-xs md:text-sm text-dark-muted mb-1">Progress</div>
                    <div className="text-base md:text-lg font-bold text-dark-primary">
                      {currentQuestionIndex + 1} / {quiz?.questions?.length || 0}
                    </div>
                  </div>
                  {/* Timer */}
                  {showTimer && (
                    <div className="text-center">
                      <div className="text-xs md:text-sm text-dark-muted mb-1">Time</div>
                      <div className="text-base md:text-lg font-bold flex items-center gap-1 md:gap-2 text-dark-primary">
                        <MdTimer className="text-lg md:text-xl" />
                        {timeLeft}
                      </div>
                    </div>
                  )}
              </div>
              </div>
            </div>
        {/* Progress Bar */}
            <div className="card mb-6 md:mb-8">
              <div className="progress-bar h-2 md:h-3 mb-3 md:mb-4">
                <div 
                  className="progress-fill transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
                ></div>
          </div>
              <div className="flex justify-between text-xs md:text-sm text-dark-secondary">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
        {/* Question Card */}
            <div className="card mb-6 md:mb-8 animate-slide-up">
          <div className="text-center mb-8">
                <div className="w-20 h-20 bg-sky/20 rounded-3xl flex items-center justify-center mx-auto mb-6 soft-shadow border border-sky/30">
                  <GiBrain className="text-3xl text-sky" />
            </div>
                <h2 className="text-xl md:text-2xl font-bold text-dark-primary mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>
              <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswers[currentQuestionIndex] !== ''}
                    className={`w-full p-4 md:p-6 rounded-2xl text-left transition-all duration-300 hover-lift ${
                  selectedAnswers[currentQuestionIndex] === option
                        ? 'bg-sky/20 border-2 border-sky text-sky'
                        : selectedAnswers[currentQuestionIndex] !== ''
                        ? 'bg-dark-glass border border-dark text-dark-secondary opacity-60'
                        : 'bg-dark-glass border border-dark hover:border-sky text-dark-primary hover:bg-card-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-base md:text-lg ${
                    selectedAnswers[currentQuestionIndex] === option
                          ? 'bg-sky text-dark-primary'
                          : 'bg-dark-muted text-dark-secondary'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                      <span className="text-base md:text-lg font-medium flex-1">{option}</span>
                  {selectedAnswers[currentQuestionIndex] === option && (
                        <FaCheck className="text-xl md:text-2xl ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Navigation */}
            <div className="flex justify-between gap-3">
          <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="btn-secondary flex items-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
                <FaArrowLeft />
                <span className="hidden sm:inline">Previous</span>
          </button>
              <div className="flex gap-2">
            <button
              onClick={handleAnswerSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-emerald to-emerald/80 text-dark-primary px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald/90 hover:to-emerald/70 transition-all duration-300 flex items-center gap-3"
            >
              {submitting ? (
                    <Loader text="Submitting..." />
              ) : (
                <>
                      <FaRocket />
                      Submit Quiz
                      <IoSparklesOutline />
                </>
              )}
            </button>
                <button
                  onClick={() => setView('join')}
                  className="btn-secondary flex items-center gap-2 text-sm md:text-base"
                >
                  <FaTimes />
                  <span className="hidden sm:inline">Exit Quiz</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              </div>
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                className="btn-primary flex items-center gap-2 text-sm md:text-base"
              >
                <span className="hidden sm:inline">Next Question</span>
                <span className="sm:hidden">Next</span>
                <FaRocket />
              </button>
        </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="footer-minimal mt-auto mb-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg width="220" height="18" viewBox="0 0 220 18" fill="none">
            <path d="M10 10 Q60 18 110 10 Q160 2 210 10" stroke="#3BB3FF" strokeWidth="4" fill="none" />
          </svg>
          <span>MADE BY v3lix.io</span>
      </div>
      </footer>
      {/* Custom Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700;900&family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet" />
      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 1.1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.8) translateY(40px); } 60% { opacity: 1; transform: scale(1.05) translateY(-8px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-bounce-in { animation: bounce-in 0.9s cubic-bezier(.4,0,.2,1) both; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
      {/* Custom Font Classes */}
      <style>{`
        .font-fredoka { font-family: 'Fredoka', 'Poppins', 'Arial Rounded MT Bold', Arial, sans-serif; }
        .font-quicksand { font-family: 'Quicksand', 'Inter', Arial, sans-serif; }
      `}</style>
    </div>
  );
};

export default QuizScreen; 