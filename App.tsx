
import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LanguageSelectScreen } from './components/LanguageSelectScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { Screen, Language } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [userId, setUserId] = useState<string>('');
  const [language, setLanguage] = useState<Language>('english');
  const [finalScore, setFinalScore] = useState<number>(0);

  const handleLogin = (id: string) => {
    setUserId(id);
    setScreen('language');
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setScreen('exam');
  };

  const handleFinishExam = (score: number) => {
    setFinalScore(score);
    setScreen('results');
  };
  
  const handleRestart = () => {
      setUserId('');
      setFinalScore(0);
      setScreen('login');
  }

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'language':
        return <LanguageSelectScreen onSelect={handleLanguageSelect} />;
      case 'exam':
        return <ExamScreen language={language} userId={userId} onFinish={handleFinishExam} />;
      case 'results':
        return <ResultsScreen score={finalScore} totalQuestions={60} onRestart={handleRestart} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return <div className="dark">{renderScreen()}</div>;
};

export default App;
