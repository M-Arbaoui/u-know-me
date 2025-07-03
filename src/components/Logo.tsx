import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full', className = '' }) => {
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

  const LogoIcon = () => (
    <div className={`${iconSizes[size]} relative`}>
      {/* Main circle */}
      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-glow">
        <span className="text-white font-black text-sm">?</span>
      </div>
      {/* Floating elements */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full animate-bounce-gentle"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full animate-pulse-gentle"></div>
    </div>
  );

  const LogoText = () => (
    <div className={`font-black ${sizeClasses[size]} ${className}`}>
      <span className="text-white">Do You Even </span>
      <span className="text-gradient">Know Me?</span>
    </div>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  );
};

export default Logo; 