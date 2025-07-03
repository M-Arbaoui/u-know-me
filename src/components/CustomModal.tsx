import React from 'react';

interface CustomModalProps {
  title: string;
  message: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ title, message, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
    <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
      <div className="p-6">
        <h3 id="modal-title" className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p id="modal-desc" className="text-slate-300 mb-6">{message}</p>
        {children}
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
          aria-label="Close modal"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
);

export default CustomModal; 