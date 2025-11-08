
import React, { useState } from 'react';

interface LockedScreenProps {
  userId: string;
  onUnlock: () => void;
  reason: string;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({ userId, onUnlock, reason }) => {
  const [inputId, setInputId] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId === userId) {
      onUnlock();
    } else {
      setError('Incorrect User ID. Please try again.');
      setInputId('');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-red-500 text-center w-full max-w-md mx-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.026a11.954 11.954 0 01-1.448 3.978A1.5 1.5 0 00.5 10c0 .343.12.658.32 1.002a11.954 11.954 0 011.448 3.978 11.954 11.954 0 017.834 3.03c.19.135.437.226.708.226s.518-.091.708-.226a11.954 11.954 0 017.834-3.03 11.954 11.954 0 011.448-3.978A1.5 1.5 0 0019.5 10a1.5 1.5 0 00-2.216-1.322 11.954 11.954 0 01-1.448-3.978A11.954 11.954 0 0110 1.944zM10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM10 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Exam Locked</h2>
        <p className="text-gray-300 mb-2">
          <span className="font-semibold">Reason:</span> {reason}
        </p>
        <p className="text-gray-400 text-sm mb-6">
          To resume, please enter your User ID. The exam timer is still running.
        </p>
        
        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter User ID to unlock"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
          >
            Unlock Exam
          </button>
        </form>
      </div>
    </div>
  );
};