import React, { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  showIcon?: boolean;
  onCopy?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  className = '',
  size = 'md',
  variant = 'primary',
  showIcon = true,
  onCopy
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      onCopy?.();
      
      // Reset after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white shadow-lg hover:shadow-xl',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white'
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95
        flex items-center justify-center gap-2
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      disabled={isCopied}
      aria-label={`Copy ${label}`}
    >
      {showIcon && (
        <span className={`${iconClasses[size]} transition-transform duration-300 ${isCopied ? 'rotate-12' : ''}`}>
          {isCopied ? '✅' : '📋'}
        </span>
      )}
      <span className="transition-all duration-300">
        {isCopied ? 'Copied!' : label}
      </span>
    </button>
  );
};

export default CopyButton; 