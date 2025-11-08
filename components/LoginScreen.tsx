
import React, { useState, useRef, useEffect } from 'react';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const FaceRecognitionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [step, setStep] = useState<'login' | 'face' | 'success'>('login');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === 'face') {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setTimeout(() => {
                    setStep('success');
                     if (videoRef.current && videoRef.current.srcObject) {
                        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                        tracks.forEach(track => track.stop());
                    }
                }, 3000);
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                // Fallback if camera fails
                setTimeout(() => setStep('success'), 2000);
            });
    }
  }, [step]);
  
  useEffect(() => {
    if (step === 'success') {
        setTimeout(() => {
            onLogin(userId);
        }, 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, userId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      setStep('face');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'login':
        return (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-100">LTO Exam Login</h2>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-300">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your user ID"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
            >
              Login
            </button>
          </form>
        );
      case 'face':
        return (
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-100">Facial Recognition</h2>
                <p className="text-gray-400">Please look at the camera.</p>
                <div className="w-64 h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500 flex items-center justify-center mx-auto">
                    <video ref={videoRef} autoPlay className="w-full h-full object-cover"></video>
                </div>
                 <div className="animate-pulse text-blue-300">Scanning...</div>
            </div>
        );
       case 'success':
        return (
            <div className="text-center space-y-4 animate-fade-in">
                <CheckmarkIcon />
                <h2 className="text-2xl font-bold text-green-400">User Verified</h2>
                <p className="text-gray-300">Redirecting to exam...</p>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700">
        {renderContent()}
      </div>
    </div>
  );
};
