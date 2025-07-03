import React from 'react';

interface SVGLogoProps {
  size?: number;
  className?: string;
}

const SVGLogo: React.FC<SVGLogoProps> = ({ size = 48, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle 
        cx="24" 
        cy="24" 
        r="22" 
        fill="url(#gradient1)" 
        stroke="url(#gradient2)" 
        strokeWidth="2"
      />
      
      {/* Question mark */}
      <path 
        d="M20 16C20 13.7909 21.7909 12 24 12C26.2091 12 28 13.7909 28 16C28 18.2091 26.2091 20 24 20C23.4477 20 23 20.4477 23 21V24" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <circle 
        cx="24" 
        cy="32" 
        r="1.5" 
        fill="white"
      />
      
      {/* Floating dots */}
      <circle cx="36" cy="12" r="2" fill="url(#gradient3)" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

export default SVGLogo; 