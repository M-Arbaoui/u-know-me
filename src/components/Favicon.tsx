import React from 'react';

const Favicon: React.FC = () => {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle 
        cx="16" 
        cy="16" 
        r="15" 
        fill="url(#gradient1)" 
        stroke="url(#gradient2)" 
        strokeWidth="1"
      />
      
      {/* Left side - Known */}
      <circle 
        cx="12" 
        cy="16" 
        r="6" 
        fill="url(#gradient3)"
      />
      
      {/* Right side - Unknown */}
      <circle 
        cx="20" 
        cy="16" 
        r="6" 
        fill="url(#gradient4)"
      />
      
      {/* Center question mark */}
      <circle 
        cx="16" 
        cy="16" 
        r="3" 
        fill="url(#gradient5)"
        transform="rotate(12 16 16)"
      />
      <text 
        x="16" 
        y="18" 
        textAnchor="middle" 
        fill="white" 
        fontSize="8" 
        fontWeight="bold"
        transform="rotate(12 16 16)"
      >
        ?
      </text>
      
      {/* Floating dots */}
      <circle cx="26" cy="8" r="1.5" fill="url(#gradient6)" opacity="0.8" />
      <circle cx="8" cy="24" r="1" fill="url(#gradient7)" opacity="0.6" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Favicon; 