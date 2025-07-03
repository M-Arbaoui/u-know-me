import React from 'react';

interface ThoughtBubbleLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  animated?: boolean;
  className?: string;
}

const ThoughtBubbleLogo: React.FC<ThoughtBubbleLogoProps> = ({ 
  size = 'md', 
  variant = 'full', 
  animated = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const ThoughtBubbleIcon = () => (
    <div className={`${iconSizes[size]} relative group`}>
      {/* Main thought bubble */}
      <div className="w-full h-full relative">
        {/* Bubble body */}
        <div className="w-full h-4/5 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
          <div className="w-3/4 h-3/4 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xs font-black">🤔</span>
          </div>
        </div>
        
        {/* Bubble tail */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/5 bg-gradient-to-br from-purple-600 to-pink-500 rounded-b-full"></div>
        
        {/* Small thought bubbles */}
        <div className="absolute -top-2 -right-2 w-1/3 h-1/3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">?</span>
        </div>
        <div className="absolute -top-1 -right-6 w-1/4 h-1/4 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">💭</span>
        </div>
      </div>
      
      {/* Floating elements */}
      {animated && (
        <>
          <div className="absolute -top-3 -left-3 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce-gentle"></div>
          <div className="absolute -bottom-3 -right-3 w-1.5 h-1.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse-gentle"></div>
        </>
      )}
    </div>
  );

  const ThoughtBubbleText = () => (
    <div className={`font-black ${sizeClasses[size]} ${className}`}>
      <div className="flex flex-col items-center">
        <div className="flex items-baseline space-x-1">
          <span className="text-white text-3xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight">Do</span>
          <span className="text-purple-400 text-2xl md:text-4xl lg:text-5xl xl:text-6xl tracking-wider">You</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-pink-400 text-2xl md:text-4xl lg:text-5xl xl:text-6xl tracking-wide">Even</span>
          <span className="text-blue-400 text-3xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight">Know</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-cyan-400 text-3xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight">Me?</span>
          <span className="text-yellow-400 text-lg md:text-2xl lg:text-3xl xl:text-4xl animate-bounce-gentle">✨</span>
        </div>
      </div>
    </div>
  );

  if (variant === 'icon') {
    return <ThoughtBubbleIcon />;
  }

  if (variant === 'text') {
    return <ThoughtBubbleText />;
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <ThoughtBubbleIcon />
      <ThoughtBubbleText />
    </div>
  );
};

export default ThoughtBubbleLogo; 