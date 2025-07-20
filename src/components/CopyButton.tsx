import React, { useState } from 'react';
import { TbCopy, TbCheck } from 'react-icons/tb';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  variant?: 'primary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
const variantClasses = {
  primary: 'bg-gradient-to-r from-[#A2D2FF] to-[#3BB3FF] text-white border-2 border-[#3BB3FF] hover:from-[#3BB3FF]/80 hover:to-[#A2D2FF]/80',
  accent: 'bg-[#A2D2FF] text-[#232946] border-2 border-[#3BB3FF] hover:bg-[#3BB3FF]/80',
  ghost: 'bg-white text-[#3BB3FF] border-2 border-[#A2D2FF] hover:bg-[#A2D2FF]/20',
};

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleCopy}
      className={`flex items-center gap-2 rounded-xl font-bold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#A2D2FF] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {copied ? <TbCheck className="text-emerald-500" /> : <TbCopy />}
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
};

export default CopyButton; 