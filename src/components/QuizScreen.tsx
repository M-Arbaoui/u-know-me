import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import Loader from './Loader';

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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowTimer(false);
      setTimeLeft(30);
    } else {
      setShowTimer(true);
      setTimeLeft(30);
    }
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
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-neon-teal">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal-800">Personality Quiz</h1>
                <p className="text-charcoal-600">by {quiz.creatorName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-charcoal-600">Player</div>
              <div className="font-bold text-charcoal-800">{participantName}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-charcoal-700">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-charcoal-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-lavender-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-teal-400 to-coral-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        {showTimer && (
          <div className="card mb-6 animate-bounce-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <span className="text-2xl font-bold text-white">{timeLeft}</span>
              </div>
              <p className="text-charcoal-700 font-semibold">Time's almost up!</p>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="card mb-6 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-powder-200 to-lavender-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
              <span className="text-3xl">❓</span>
            </div>
            <h2 className="text-xl font-bold text-charcoal-800 mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-soft ${
                  selectedAnswers[currentQuestionIndex] === option
                    ? 'bg-gradient-to-r from-teal-50 to-coral-50 border-teal-300 shadow-neon-teal'
                    : 'bg-white/80 border-lavender-200 hover:border-lavender-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                    selectedAnswers[currentQuestionIndex] === option
                      ? 'bg-gradient-to-br from-teal-400 to-coral-400 text-white shadow-neon-teal'
                      : 'bg-lavender-100 text-charcoal-600 group-hover:bg-lavender-200'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-charcoal-700 font-medium flex-1">{option}</span>
                  {selectedAnswers[currentQuestionIndex] === option && (
                    <span className="text-2xl animate-bounce-in">✨</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setView('join')}
            className="btn-secondary"
          >
            ← Back
          </button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Question →
            </button>
          ) : (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswers[currentQuestionIndex] || submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <>
                  <span className="mr-2">⏳</span>
                  Calculating...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  See Results
                  <span className="ml-2 group-hover:scale-110 transition-transform">✨</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Counter */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-lavender-200">
            <span className="text-charcoal-600 text-sm">Question</span>
            <span className="font-bold text-charcoal-800">{currentQuestionIndex + 1}</span>
            <span className="text-charcoal-600 text-sm">of</span>
            <span className="font-bold text-charcoal-800">{quiz.questions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizScreen; 