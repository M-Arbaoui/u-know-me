import React from 'react';

export const CreateIcon: React.FC = () => (
  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
    <span className="text-white text-sm">✨</span>
  </div>
);

export const JoinIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <div className={`${className} bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center`}>
    <span className="text-white text-sm">🎮</span>
  </div>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
); 