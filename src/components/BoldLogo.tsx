import React from 'react';

interface BoldLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const BoldLogo: React.FC<BoldLogoProps> = ({ size = 'lg', animated = true }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} text-center`}>
      <div className="inline-flex items-center gap-2">
        <span className="bg-gradient-to-r from-teal-500 to-coral-500 bg-clip-text text-transparent">
          U
        </span>
        <span className="bg-gradient-to-r from-powder-500 to-lavender-500 bg-clip-text text-transparent">
          KNOW
        </span>
        <span className="bg-gradient-to-r from-mauve-500 to-teal-500 bg-clip-text text-transparent">
          ME
        </span>
        <span className={`ml-2 ${animated ? 'animate-bounce-gentle' : ''}`}>
          😏
        </span>
      </div>
      <div className="text-sm text-charcoal-500 font-normal mt-1">
        The Ultimate Friendship Test
      </div>
    </div>
  );
};

export default BoldLogo; 