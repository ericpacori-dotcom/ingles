// Ruta: src/App.jsx
import React, { useState, useEffect } from 'react';

// Importamos todas nuestras pantallas separadas
import SplashScreen from './screens/SplashScreen';
import LandingPage from './screens/LandingPage';
import LoginScreen from './screens/LoginScreen';
import PricingScreen from './screens/PricingScreen';
import LibraryScreen from './screens/LibraryScreen';
import ReaderScreen from './screens/ReaderScreen';
import WordDetailScreen from './screens/WordDetailScreen';

export default function App() {
  const [currentView, setCurrentView] = useState('splash');
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [currentBook, setCurrentBook] = useState(null); 
  const [wordForDetail, setWordForDetail] = useState(null); 

  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(() => setCurrentView('landing'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const openBook = (book) => {
    setCurrentBook(book);
    navigateTo('reader');
  };

  const openWordDetail = (wordInfo) => {
      setWordForDetail(wordInfo);
      navigateTo('wordDetail');
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] font-sans text-gray-800">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes popUp { 0% { opacity: 0; transform: translateY(100%); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes storyProgress { from { width: 0%; } to { width: 100%; } }
        .animate-story-progress { animation: storyProgress linear forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in-left { animation: fadeInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in-right { animation: fadeInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-pop-up { animation: popUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      {!isPwaInstalled && currentView !== 'splash' && currentView !== 'reader' && (
        <div className="bg-violet-600 text-white text-sm py-2 px-4 flex justify-between items-center">
          <span>Instala nuestra Web App (PWA) para aprender offline.</span>
          <button 
            onClick={() => setIsPwaInstalled(true)}
            className="bg-white text-violet-600 px-3 py-1 rounded font-bold text-xs hover:bg-violet-50 transition"
          >
            Instalar App
          </button>
        </div>
      )}

      {currentView === 'splash' && <SplashScreen />}
      {currentView === 'landing' && <LandingPage navigateTo={navigateTo} />}
      {currentView === 'login' && <LoginScreen navigateTo={navigateTo} />}
      {currentView === 'pricing' && <PricingScreen navigateTo={navigateTo} />}
      {currentView === 'library' && <LibraryScreen navigateTo={navigateTo} openBook={openBook} />}
      {currentView === 'reader' && <ReaderScreen navigateTo={navigateTo} book={currentBook} openWordDetail={openWordDetail} />}
      {currentView === 'wordDetail' && <WordDetailScreen navigateTo={navigateTo} wordInfo={wordForDetail} />}
    </div>
  );
}