import React from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Animated Icon */}
      <div className={`${iconSizes[size]} relative group`}>
        {/* Main circle with gradient */}
        <div className="w-full h-full bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 rounded-full flex items-center justify-center shadow-glow group-hover:shadow-glow-purple transition-all duration-300 transform group-hover:scale-110">
          <span className="text-white font-black text-sm group-hover:rotate-12 transition-transform duration-300">?</span>
        </div>
        
        {/* Floating particles */}
        {animated && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full animate-bounce-gentle"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full animate-pulse-gentle"></div>
            <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-gradient-to-br from-white/60 to-white/40 rounded-full animate-pulse-gentle" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}
      </div>

      {/* Text with gradient */}
      <div className={`font-black ${sizeClasses[size]}`}>
        <span className="text-white">Do You Even </span>
        <span className="text-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
          Know Me?
        </span>
      </div>
    </div>
  );
};

export default AnimatedLogo; 