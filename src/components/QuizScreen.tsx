import React, { useState, useCallback } from 'react';

interface QuizScreenProps {
  setView: (view: string) => void;
  quizData: {
    creatorName: string;
    questions: {
      questionText: string;
      options: string[];
      correctAnswer: string;
    }[];
  };
  setScore: (score: number) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ setView, quizData, setScore }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [localScore, setLocalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleAnswerSelect = useCallback((option: string) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setLocalScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < quizData.questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setLocalScore(finalLocalScore => {
          const finalScore = finalLocalScore + (isCorrect ? 1 : 0);
          setScore(finalScore);
          setView('results');
          return finalLocalScore;
        });
      }
    }, 1500);
  }, [showFeedback, currentQuestion, currentQuestionIndex, quizData.questions.length, setScore, setView]);

  const getButtonClass = (option: string) => {
    if (!showFeedback) {
      return "bg-slate-700 hover:bg-slate-600";
    }
    if (option === currentQuestion.correctAnswer) {
      return "bg-green-600 scale-105";
    }
    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return "bg-red-600";
    }
    return "bg-slate-800 opacity-50";
  };

  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-indigo-300">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
            <p className="text-sm text-slate-400">Quiz by: <span className="font-bold text-slate-200">{quizData.creatorName}</span></p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5" aria-label="Progress bar">
            <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <p className="text-2xl md:text-3xl font-bold text-white mb-8 min-h-[100px] flex items-center">{currentQuestion.questionText}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
              className={`w-full p-4 rounded-lg text-white font-semibold text-left transition-all duration-300 ${getButtonClass(option)}`}
              aria-label={`Answer option: ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen; 