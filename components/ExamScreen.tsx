
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Language, Answers } from '../types';
import { getExamQuestions } from '../services/questionService';
import { LockedScreen } from './LockedScreen';

declare const faceapi: any;

interface ExamScreenProps {
  language: Language;
  userId: string;
  onFinish: (score: number) => void;
}

const Timer: React.FC<{ timeLeft: number }> = ({ timeLeft }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeColor = timeLeft < 300 ? 'text-red-500' : 'text-gray-100';

    return (
        <div className={`text-2xl font-bold ${timeColor}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};

const ProctoringStatus: React.FC<{ status: string }> = ({ status }) => {
    let color = 'text-yellow-400';
    if (status === 'Active') color = 'text-green-400';
    if (status.includes('Error')) color = 'text-red-400';

    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className={`text-sm font-semibold ${color}`}>
                Proctoring: {status}
            </span>
        </div>
    );
}

export const ExamScreen: React.FC<ExamScreenProps> = ({ language, userId, onFinish }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [proctoringStatus, setProctoringStatus] = useState('Initializing...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const trackingIntervalRef = useRef<number | null>(null);
  const baselinePositionRef = useRef<{ position: { x: number; y: number; }; width: number; } | null>(null);
  const noFaceCounterRef = useRef<number>(0);

  const lockExam = useCallback((reason: string) => {
    console.warn(`Locking exam: ${reason}`);
    setLockReason(reason);
  }, []);

  const handleSubmit = useCallback(() => {
    if (trackingIntervalRef.current !== null) {
        clearInterval(trackingIntervalRef.current);
    }
     if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score++;
      }
    });
    onFinish(score);
  }, [answers, questions, onFinish]);

  // Load questions
  useEffect(() => {
    setQuestions(getExamQuestions(language));
  }, [language]);

  // Initialize Face API and Camera
  useEffect(() => {
    const initFaceApi = async () => {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
                faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
            ]);
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            } else {
                 throw new Error("Video element not found");
            }

        } catch (err) {
            console.error("Error initializing camera or FaceAPI:", err);
            setProctoringStatus('Error - Please allow camera access');
            // Lock if camera is denied
            setTimeout(() => lockExam('Camera access denied or failed.'), 3000);
        }
    };
    initFaceApi();
    
    return () => {
         if (trackingIntervalRef.current !== null) {
            clearInterval(trackingIntervalRef.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    }
  }, [lockExam]);
  
  // Start tracking when video is playing
  const handleVideoPlay = () => {
    setProctoringStatus('Calibrating...');
    trackingIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused) return;

        const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        if (detections) {
            noFaceCounterRef.current = 0;
            const { detection, landmarks } = detections;
            const noseBridge = landmarks.getNose()[0]; // Use top of nose bridge as a stable anchor point

            if (!baselinePositionRef.current) {
                baselinePositionRef.current = { position: noseBridge, width: detection.box.width };
                setProctoringStatus('Active');
            } else {
                const dx = noseBridge.x - baselinePositionRef.current.position.x;
                const dy = noseBridge.y - baselinePositionRef.current.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Normalize distance by the initial face width to be robust against camera distance
                const normalizedDistance = distance / baselinePositionRef.current.width;
                
                const MOVEMENT_THRESHOLD = 0.4; // Lock if head moves more than 40% of the face width

                if (normalizedDistance > MOVEMENT_THRESHOLD) {
                    lockExam('Excessive head/eye movement detected.');
                    if (trackingIntervalRef.current !== null) {
                        clearInterval(trackingIntervalRef.current);
                    }
                }
            }
        } else {
            noFaceCounterRef.current++;
            // If face is not detected for ~3 seconds (15 frames * 200ms)
            if (noFaceCounterRef.current > 15) {
                 lockExam('Face not detected or covered.');
                 if (trackingIntervalRef.current !== null) {
                    clearInterval(trackingIntervalRef.current);
                 }
            }
        }
    }, 200); // Check every 200ms
  };


  // Exam timer
  useEffect(() => {
    if(lockReason) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit, lockReason]);
  
  // Tab-out detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lockExam('Tabbed out of the exam.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lockExam]);

  // Random lock timer
  useEffect(() => {
    const minLockTime = 60 * 1000; // 1 minute in ms
    const maxLockTime = 120 * 1000; // 2 minutes in ms
    const randomTime = Math.floor(Math.random() * (maxLockTime - minLockTime + 1)) + minLockTime;

    const timer = setTimeout(() => {
        lockExam('Random security check.');
    }, randomTime);

    return () => clearTimeout(timer);
  }, [lockExam]);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading questions...</div>;
  }
  
  if (lockReason) {
      return <LockedScreen userId={userId} onUnlock={() => setLockReason(null)} reason={lockReason} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-100">
       <video ref={videoRef} onPlay={handleVideoPlay} autoPlay muted playsInline className="absolute top-0 left-0 w-24 h-24 opacity-0 -z-10"></video>
      {/* Left Dashboard */}
      <aside className="w-full md:w-1/4 lg:w-1/5 bg-gray-800 p-4 border-b-2 md:border-r-2 border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Questions</h2>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                currentQuestionIndex === index
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : answers[q.id]
                  ? 'bg-green-700 hover:bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-300">LTO Reviewer Exam</h1>
          <div className="flex flex-col items-end">
             <Timer timeLeft={timeLeft} />
             <ProctoringStatus status={proctoringStatus} />
          </div>
        </header>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1 flex flex-col">
          {currentQuestion && (
            <>
              <div className="mb-6">
                <p className="text-gray-400 font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <h3 className="text-lg md:text-xl font-medium">{currentQuestion.question}</h3>
                    {currentQuestion.image && (
                      <div className="mt-4 flex justify-center items-center bg-white p-4 rounded-lg min-h-56">
                        <img 
                          src={`assets/${currentQuestion.image}`} 
                          alt="Traffic sign related to the question" 
                          className="max-h-56 object-contain" 
                        />
                      </div>
                    )}
              </div>
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 has-[:checked]:bg-blue-900 has-[:checked]:ring-2 ring-blue-500 transition-all">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      className="h-5 w-5 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                    />
                    <span className="ml-4 text-base">{option}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        
         <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
          <div></div>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-8 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-2 rounded-md bg-green-600 hover:bg-green-500 transition-colors"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
