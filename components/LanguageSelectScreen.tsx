
import React from 'react';
import { Language } from '../types';

interface LanguageSelectScreenProps {
  onSelect: (language: Language) => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700 text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-100">Choose Exam Language</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onSelect('english')}
            className="w-full sm:w-auto flex-1 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            English
          </button>
          <button
            onClick={() => onSelect('tagalog')}
            className="w-full sm:w-auto flex-1 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-gray-900 bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-transform transform hover:scale-105"
          >
            Tagalog
          </button>
        </div>
      </div>
    </div>
  );
};
