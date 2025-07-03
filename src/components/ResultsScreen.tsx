import React, { useState, useEffect } from 'react';

interface ResultsScreenProps {
  results: {
    score: number;
    totalQuestions: number;
    percentage: number;
    participantName: string;
    answers: {
      questionIndex: number;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[];
  };
  setView: (view: string) => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, setView }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateScore(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage === 100) return '🏆';
    if (percentage >= 75) return '😎';
    if (percentage >= 50) return '👍';
    if (percentage >= 25) return '😬';
    return '💀';
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage === 100) return 'text-teal-500';
    if (percentage >= 75) return 'text-coral-400';
    if (percentage >= 50) return 'text-powder-500';
    if (percentage >= 25) return 'text-mauve-500';
    return 'text-charcoal-400';
  };

  const getPerformanceBg = (percentage: number) => {
    if (percentage === 100) return 'bg-teal-50 border-teal-200';
    if (percentage >= 75) return 'bg-coral-50 border-coral-200';
    if (percentage >= 50) return 'bg-powder-50 border-powder-200';
    if (percentage >= 25) return 'bg-mauve-50 border-mauve-200';
    return 'bg-charcoal-50 border-charcoal-200';
  };

  const getResultComment = (percentage: number) => {
    if (percentage >= 50) {
      return "🔥 Nice! You actually know your friend pretty well. Friendship status: Safe!";
    } else {
      return "💀 Ouch! Did you even read their bio? That was a disaster. Friendship revoked!";
    }
  };

  const getPerformanceTitle = (percentage: number) => {
    if (percentage === 100) return "Mind Reader";
    if (percentage >= 75) return "Best Friend";
    if (percentage >= 50) return "Acquaintance";
    if (percentage >= 25) return "Stranger";
    return "Who are you?";
  };

  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-neon-teal">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-800">Quiz Complete!</h1>
                <p className="text-charcoal-600">Here's how you did</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-charcoal-600">Player</div>
              <div className="font-bold text-charcoal-800">{results.participantName}</div>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="card mb-6 animate-slide-up">
          <div className="text-center">
            <div className={`w-32 h-32 ${getPerformanceBg(results.percentage)} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle`}>
              <span className="text-6xl">{getPerformanceEmoji(results.percentage)}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-charcoal-800 mb-2">
              {getPerformanceTitle(results.percentage)}
            </h2>
            
            <div className="mb-6">
              <div className={`text-6xl font-bold mb-2 ${getPerformanceColor(results.percentage)} transition-all duration-1000 ${
                animateScore ? 'scale-110' : 'scale-100'
              }`}>
                {results.percentage}%
              </div>
              <div className="text-charcoal-600 text-lg">
                {results.score} out of {results.totalQuestions} correct
              </div>
            </div>

            <div className="bg-gradient-to-r from-lavender-50 to-powder-50 rounded-2xl p-6 border border-lavender-200 mb-6">
              <p className="text-charcoal-700 text-lg font-medium leading-relaxed">
                {getResultComment(results.percentage)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary group"
            >
              <span className="mr-2">📊</span>
              {showDetails ? 'Hide Details' : 'Show Details'}
              <span className="ml-2 group-hover:scale-110 transition-transform">
                {showDetails ? '👆' : '👇'}
              </span>
            </button>
            
            <button
              onClick={() => setView('welcome')}
              className="btn-primary group"
            >
              <span className="mr-2">🏠</span>
              Take Another Quiz
              <span className="ml-2 group-hover:scale-110 transition-transform">✨</span>
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <div className="card animate-slide-up">
            <h3 className="text-xl font-bold text-charcoal-800 mb-6 text-center">
              Question Breakdown
            </h3>
            
            <div className="space-y-4">
              {results.answers.map((answer, index) => (
                <div 
                  key={index} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-lavender-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        answer.isCorrect 
                          ? 'bg-teal-100 text-teal-700' 
                          : 'bg-coral-100 text-coral-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal-800">
                          Question {index + 1}
                        </h4>
                        <p className="text-charcoal-600 text-sm">
                          {answer.isCorrect ? 'Correct!' : 'Incorrect'}
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">
                      {answer.isCorrect ? '✅' : '❌'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-charcoal-600 w-20">Your Answer:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        answer.isCorrect 
                          ? 'bg-teal-100 text-teal-700' 
                          : 'bg-coral-100 text-coral-700'
                      }`}>
                        {answer.selectedAnswer}
                      </span>
                    </div>
                    
                    {!answer.isCorrect && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-charcoal-600 w-20">Correct Answer:</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
                          {answer.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="card">
          <div className="text-center">
            <h3 className="text-xl font-bold text-charcoal-800 mb-4">
              Share Your Results
            </h3>
            <p className="text-charcoal-600 mb-6">
              Challenge your friends to beat your score!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const text = `I got ${results.percentage}% on a personality quiz! Think you can do better? 🎯`;
                  navigator.share ? navigator.share({ text }) : navigator.clipboard.writeText(text);
                }}
                className="btn-accent group"
              >
                <span className="mr-2">📱</span>
                Share Results
                <span className="ml-2 group-hover:scale-110 transition-transform">🚀</span>
              </button>
              
              <button
                onClick={() => setView('welcome')}
                className="btn-secondary group"
              >
                <span className="mr-2">🎯</span>
                Create Your Own
                <span className="ml-2 group-hover:scale-110 transition-transform">✨</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen; 