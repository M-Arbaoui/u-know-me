import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-dreamy flex items-center justify-center animate-fade-in">
      <div className="card max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-teal-200 to-coral-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-coral-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-charcoal-800 mb-2">
          {text}
        </h2>
        
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse-gentle" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse-gentle" style={{ animationDelay: '200ms' }}></div>
          <div className="w-2 h-2 bg-powder-400 rounded-full animate-pulse-gentle" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader; 