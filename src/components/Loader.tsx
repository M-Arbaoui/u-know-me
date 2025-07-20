import React from 'react';
import { IoSparklesOutline } from 'react-icons/io5';

interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'skeleton';
}

const Loader: React.FC<LoaderProps> = ({ 
  text = "Loading...", 
  size = 'md',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  if (variant === 'skeleton') {
  return (
      <div className="animate-pulse">
        <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#A2D2FF] shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#A2D2FF]/40 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-[#CFFFE5]/60 rounded mb-2"></div>
              <div className="h-3 bg-[#CFFFE5]/40 rounded w-2/3"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-[#A2D2FF]/30 rounded"></div>
            <div className="h-4 bg-[#A2D2FF]/20 rounded w-5/6"></div>
            <div className="h-4 bg-[#A2D2FF]/10 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#3BB3FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#2ED8B6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#FFD6E0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className={`text-[#3BB3FF] ${textSizes[size]} font-bold`}>{text}</p>
      </div>
    );
  }

  // Pastel, glassy, doodle-themed loader
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#A2D2FF] to-[#CFFFE5]">
      <div className="relative bg-white/80 rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center border-4 border-[#A2D2FF]">
        {/* Doodle SVGs */}
        <svg className="absolute -top-8 -left-8 w-16 h-16 opacity-40" viewBox="0 0 64 64" fill="none">
          <path d="M32 8 Q40 24 56 16 Q48 32 56 48 Q40 40 32 56 Q24 40 8 48 Q16 32 8 16 Q24 24 32 8Z" stroke="#A2D2FF" strokeWidth="3" fill="none" />
          <text x="28" y="36" fontSize="18" fill="#3BB3FF">★</text>
        </svg>
        <svg className="absolute -bottom-8 -right-8 w-16 h-16 opacity-40" viewBox="0 0 64 64" fill="none">
          <path d="M8 32 Q24 24 16 8 Q32 16 48 8 Q40 24 56 32 Q40 40 48 56 Q32 48 16 56 Q24 40 8 32Z" stroke="#2ED8B6" strokeWidth="3" fill="none" />
          <text x="28" y="36" fontSize="18" fill="#2ED8B6">✨</text>
        </svg>
        <div className="flex flex-col items-center gap-6 z-10">
          <div className={`relative ${sizeClasses[size]}`} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            {/* Glassy pastel spinner */}
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="#A2D2FF" strokeWidth="6" strokeDasharray="40 40" strokeLinecap="round" />
              <circle cx="32" cy="32" r="22" stroke="#FFD6E0" strokeWidth="4" strokeDasharray="24 40" strokeLinecap="round" />
              <circle cx="32" cy="32" r="16" stroke="#2ED8B6" strokeWidth="3" strokeDasharray="12 32" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <IoSparklesOutline className="text-[#3BB3FF] text-3xl animate-pulse" />
            </div>
          </div>
          <p className={`text-[#3BB3FF] ${textSizes[size]} font-bold text-center`}>{text}</p>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes spin-slow { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }
      `}</style>
    </div>
  );
};

export default Loader; 