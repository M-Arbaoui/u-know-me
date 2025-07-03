import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-4" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" aria-label="Loading spinner"></div>
    <p className="text-lg text-slate-300">{text}</p>
  </div>
);

export default Loader; 