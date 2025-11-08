
import React from 'react';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

const PASSING_SCORE = 48;

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, totalQuestions, onRestart }) => {
  const isPassed = score >= PASSING_SCORE;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
      <div className={`w-full max-w-lg bg-gray-900 p-8 rounded-xl shadow-2xl border-t-8 ${isPassed ? 'border-green-500' : 'border-red-500'} text-center space-y-6`}>
        <h2 className="text-4xl font-extrabold text-gray-100">Exam Results</h2>
        
        <div className="my-8">
          <p className="text-lg text-gray-400">Your Score</p>
          <p className="text-7xl font-bold text-white">
            {score}<span className="text-4xl text-gray-500">/{totalQuestions}</span>
          </p>
        </div>
        
        {isPassed ? (
          <div className="bg-green-500/20 text-green-300 p-4 rounded-lg">
            <h3 className="text-2xl font-bold">Congratulations! You Passed!</h3>
            <p>Passing score is {PASSING_SCORE}.</p>
          </div>
        ) : (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">
            <h3 className="text-2xl font-bold">Sorry, You Failed.</h3>
            <p>You need a score of {PASSING_SCORE} or higher to pass.</p>
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-transform transform hover:scale-105 mt-8"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
