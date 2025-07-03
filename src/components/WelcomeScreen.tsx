import React from 'react';
import { CreateIcon, JoinIcon } from './icons';

interface WelcomeScreenProps {
  setView: (view: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setView }) => (
  <div className="text-center">
    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
      Do You Even <span className="text-indigo-400">Know Me?</span>
    </h1>
    <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
      Create a quiz about yourself, share it with friends, and find out who's a true friend and who's just... there.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={() => setView('create')}
        className="flex items-center justify-center bg-indigo-600 text-white font-bold text-lg py-4 px-8 rounded-xl hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg shadow-indigo-600/30"
        aria-label="Create your quiz"
      >
        <CreateIcon /> Create Your Quiz
      </button>
      <button
        onClick={() => setView('join')}
        className="flex items-center justify-center bg-slate-700 text-white font-bold text-lg py-4 px-8 rounded-xl hover:bg-slate-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg shadow-slate-700/30"
        aria-label="Join a friend's quiz"
      >
        <JoinIcon /> Join a Friend's Quiz
      </button>
    </div>
    <div className="mt-8">
      <button
        onClick={() => setView('admin')}
        className="text-slate-400 hover:text-white text-sm underline"
        aria-label="Access admin panel"
      >
        Admin Panel
      </button>
    </div>
  </div>
);

export default WelcomeScreen; 