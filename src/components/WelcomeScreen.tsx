import React from 'react';
import { MdQuiz } from 'react-icons/md';
import { PiMagicWandBold } from 'react-icons/pi';

const mainCards = [
  {
    key: 'take-quiz',
    icon: <MdQuiz className="text-[#3BB3FF] text-5xl mb-3 drop-shadow-glow" />, emoji: '📝',
    title: 'Take a Quiz',
    desc: 'Join a friend’s quiz and see how well you really know them.',
    button: 'Take Quiz',
    onClick: (setView: (v: string) => void) => setView('join'),
    bg: 'bg-white/80',
    doodle: (
      <svg className="absolute -top-6 -left-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
        <path d="M32 8 Q40 24 56 16 Q48 32 56 48 Q40 40 32 56 Q24 40 8 48 Q16 32 8 16 Q24 24 32 8Z" stroke="#A2D2FF" strokeWidth="3" strokeLinejoin="round" fill="none" />
        <text x="28" y="36" fontSize="18" fill="#3BB3FF">?</text>
      </svg>
    ),
  },
  {
    key: 'create-quiz',
    icon: <PiMagicWandBold className="text-[#2ED8B6] text-5xl mb-3 drop-shadow-glow" />, emoji: '✨',
    title: 'Create a Quiz',
    desc: 'Make your own quiz and challenge your friends to guess your answers.',
    button: 'Create Quiz',
    onClick: (setView: (v: string) => void) => setView('creator-login'),
    bg: 'bg-white/80',
    doodle: (
      <svg className="absolute -bottom-6 -right-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
        <path d="M8 32 Q24 24 16 8 Q32 16 48 8 Q40 24 56 32 Q40 40 48 56 Q32 48 16 56 Q24 40 8 32Z" stroke="#2ED8B6" strokeWidth="3" strokeLinejoin="round" fill="none" />
        <text x="28" y="36" fontSize="18" fill="#2ED8B6">★</text>
      </svg>
    ),
  },
];

const WelcomeScreen: React.FC<{ setView: (view: string) => void }> = ({ setView }) => {
  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #A2D2FF 0%, #CFFFE5 100%)' }}>
      {/* Hand-drawn/doodle background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Floating stars, sparkles, question marks, wavy lines */}
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
>>>>>>> stable-before-redesign
      </div>
      {/* Centered Logo Header with hand-drawn ring/sparkles */}
      <header className="w-full flex flex-col items-center justify-center px-6 py-8 md:px-0 md:py-10 relative z-10">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Do You Even Know Me Logo"
            className="mx-auto shadow-xl animate-fade-in"
            style={{
              width: 160,
              height: 'auto',
              maxWidth: '70vw',
              borderRadius: '2.5rem',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 32px #b18fff33',
              padding: '1.5rem',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* Hand-drawn ring */}
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none" style={{ zIndex: -1 }} viewBox="0 0 192 192" fill="none">
            <ellipse cx="96" cy="96" rx="90" ry="70" stroke="#3BB3FF" strokeWidth="4" strokeDasharray="12 10" />
            <ellipse cx="96" cy="96" rx="70" ry="90" stroke="#2ED8B6" strokeWidth="2" strokeDasharray="8 14" />
            <text x="30" y="40" fontSize="28" fill="#FFD600" opacity="0.7">✨</text>
            <text x="140" y="160" fontSize="24" fill="#FF61A6" opacity="0.7">★</text>
          </svg>
        </div>
      </header>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-2 mb-12 px-4 relative z-10">
        <h1 className="font-fredoka text-4xl md:text-5xl font-extrabold text-[#232946] mb-4 tracking-tight animate-fade-in relative">
          How well do you know your friends?
          <svg className="absolute left-1/2 bottom-0 -translate-x-1/2" width="220" height="18" viewBox="0 0 220 18" fill="none">
            <path d="M10 10 Q60 18 110 10 Q160 2 210 10" stroke="#3BB3FF" strokeWidth="4" fill="none" />
          </svg>
        </h1>
        <p className="font-quicksand text-lg md:text-xl text-[#232946] mb-8 animate-fade-in relative" style={{ maxWidth: 480 }}>
          Take the ultimate friendship test or create your own quiz and challenge your crew.
          <svg className="absolute left-1/2 bottom-0 -translate-x-1/2" width="120" height="10" viewBox="0 0 120 10" fill="none">
            <path d="M10 5 Q60 12 110 5" stroke="#2ED8B6" strokeWidth="2" fill="none" />
          </svg>
        </p>
      </section>
      {/* Main Cards */}
      <section className="w-full flex flex-col md:flex-row items-center justify-center gap-10 px-4 mb-16 relative z-10">
        {mainCards.map((card, i) => (
          <div
            key={card.key}
            className={`relative rounded-3xl shadow-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-[#3BB3FF]/30 ${card.bg}`}
            style={{ minWidth: 260, maxWidth: 360, width: '100%', animationDelay: `${i * 120}ms`, border: '3px solid #CFFFE5', boxShadow: '0 8px 32px #a2d2ff33' }}
          >
            {card.doodle}
            {/* Remove the old emoji icon */}
            {card.icon}
            <div className="mb-2 font-fredoka text-2xl font-bold text-[#232946] text-center relative z-10">{card.title}</div>
            <div className="font-quicksand text-base text-[#232946] text-center opacity-80 mb-6 relative z-10">{card.desc}</div>
            <button
              className="mt-2 px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#E4C1F9] text-[#232946] shadow-lg border-2 border-[#A2D2FF] animate-bounce-in hover:scale-105 hover:shadow-2xl transition-all duration-200 outline-none focus:ring-4 focus:ring-[#A2D2FF]/40"
              style={{ textShadow: '0 2px 12px #fff8' }}
              onClick={() => card.onClick(setView)}
            >
              {card.button}
            </button>
          </div>
        ))}
      </section>
      {/* Footer */}
      <footer className="footer-minimal mt-auto mb-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg width="220" height="18" viewBox="0 0 220 18" fill="none">
            <path d="M10 10 Q60 18 110 10 Q160 2 210 10" stroke="#3BB3FF" strokeWidth="4" fill="none" />
          </svg>
          <a
            href="https://www.instagram.com/v3lix.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline font-bold hover:text-gray-700 transition-colors"
          >
            MADE BY v3lix.io
          </a>
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
        .drop-shadow-glow { filter: drop-shadow(0 0 12px #e4c1f9aa); }
      `}</style>
      {/* Custom Font Classes */}
      <style>{`
        .font-fredoka { font-family: 'Fredoka', 'Poppins', 'Arial Rounded MT Bold', Arial, sans-serif; }
        .font-quicksand { font-family: 'Quicksand', 'Inter', Arial, sans-serif; }
      `}</style>
    </div>
  );
};

export default WelcomeScreen; 
