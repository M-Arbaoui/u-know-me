import React from 'react';
import BoldLogo from './BoldLogo';

interface WelcomeScreenProps {
  setView: (view: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <BoldLogo />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal-800 mb-4 leading-tight">
            Test Your Friendship
          </h1>
          <p className="text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
            Create personality quizzes and see how well your friends really know you. 
            It's time to separate the real ones from the fake ones! 😏
          </p>
        </div>

        {/* Main Options */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Take a Quiz */}
            <div 
              className="card hover:shadow-large transition-all duration-300 cursor-pointer group animate-slide-up"
              onClick={() => setView('join')}
              style={{ animationDelay: '200ms' }}
            >
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-powder-200 to-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-charcoal-800 mb-4">
                  Take a Quiz
                </h2>
                <p className="text-charcoal-600 mb-6 leading-relaxed">
                  Got a quiz code from a friend? Enter it and see how well you know them. 
                  No pressure, but your friendship might be on the line! 😅
                </p>
                <div className="btn-primary group-hover:scale-105 transition-transform">
                  <span className="mr-2">🚀</span>
                  Start Playing
                  <span className="ml-2">✨</span>
                </div>
              </div>
            </div>

            {/* Creator Space */}
            <div 
              className="card hover:shadow-large transition-all duration-300 cursor-pointer group animate-slide-up"
              onClick={() => setView('creator-login')}
              style={{ animationDelay: '400ms' }}
            >
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-lavender-200 to-coral-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">👑</span>
                </div>
                <h2 className="text-2xl font-bold text-charcoal-800 mb-4">
                  Creator Space
                </h2>
                <p className="text-charcoal-600 mb-6 leading-relaxed">
                  Create your own personality quizzes and see how your friends perform. 
                  Time to put them to the test! 😈
                </p>
                <div className="btn-secondary group-hover:scale-105 transition-transform">
                  <span className="mr-2">✨</span>
                  Access Creator Space
                  <span className="ml-2">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card mb-8">
          <h3 className="text-2xl font-bold text-charcoal-800 text-center mb-8">
            Why You'll Love This
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h4 className="font-bold text-charcoal-800 mb-2">Personality Tests</h4>
              <p className="text-charcoal-600 text-sm">
                Create quizzes that reveal the real you (or expose your friends' ignorance)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-powder-100 to-lavender-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-charcoal-800 mb-2">Detailed Results</h4>
              <p className="text-charcoal-600 text-sm">
                See exactly where your friends went wrong (and judge them accordingly)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-mauve-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h4 className="font-bold text-charcoal-800 mb-2">Social Fun</h4>
              <p className="text-charcoal-600 text-sm">
                Share results and challenge friends to beat your scores
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card">
          <h3 className="text-2xl font-bold text-charcoal-800 text-center mb-8">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold">
                1
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-2">Create</h4>
              <p className="text-charcoal-600 text-sm">
                Design your personality quiz with custom questions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-powder-400 to-lavender-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold">
                2
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-2">Share</h4>
              <p className="text-charcoal-600 text-sm">
                Send the quiz code to your friends
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-lavender-400 to-mauve-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold">
                3
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-2">Play</h4>
              <p className="text-charcoal-600 text-sm">
                Friends take the quiz and see how well they know you
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-coral-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold">
                4
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-2">Judge</h4>
              <p className="text-charcoal-600 text-sm">
                Review results and decide who stays in your life 😏
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-charcoal-500 text-sm">
            MADE BY v3lix.io
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 