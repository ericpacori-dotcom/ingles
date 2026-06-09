import React, { useState, useEffect } from 'react';
import LandingPage from './screens/LandingPage';
import LoginScreen from './screens/LoginScreen';
import LibraryScreen from './screens/LibraryScreen';
import ReaderScreen from './screens/ReaderScreen';
import PricingScreen from './screens/PricingScreen';
import SplashScreen from './screens/SplashScreen';
import WordDetailScreen from './screens/WordDetailScreen';
import AdminScreen from './screens/AdminScreen'; 
// AÑADIMOS LA IMPORTACIÓN DEL PERFIL AQUÍ
import ProfileScreen from './screens/ProfileScreen'; 

import { Download, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('splash'); 
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeWordInfo, setActiveWordInfo] = useState(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 

  // --- LÓGICA INTELIGENTE PARA PWA (Soporta iOS y pruebas locales) ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBtn, setShowInstallBtn] = useState(true);

  // --- CONTROL REAL DEL BOTÓN "ATRÁS" DEL CELULAR Y WEB ---
  const navigateTo = (view, data = null, isBackNavigation = false) => {
    if (view === 'reader' && data) {
      setSelectedBook(data);
    }
    if (view === 'word-detail' && data) {
      setActiveWordInfo(data);
    }
    setCurrentView(view);

    if (!isBackNavigation) {
      window.history.pushState({ view, data }, '');
    }
  };

  useEffect(() => {
    window.history.replaceState({ view: 'splash', data: null }, '');

    const handlePopState = (event) => {
      if (event.state) {
        const { view, data } = event.state;
        navigateTo(view, data, true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- DETECCIÓN DE ENTORNO PWA ---
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneIpad = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIphoneIpad);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setShowInstallBtn(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      }
    } else if (isIOS) {
      alert("🍎 Para instalar en iPhone o iPad:\n\n1. Toca el ícono 'Compartir' (el cuadrito con la flecha hacia arriba) en tu navegador.\n2. Selecciona 'Agregar a inicio'.");
    } else {
      alert("💡 Modo de Prueba Local:\nPara que la instalación automática funcione, la app debe estar subida a internet con seguridad HTTPS (ej. Firebase Hosting). En este momento estás usando una red local.");
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const openWordDetail = (wordInfo) => {
    setActiveWordInfo(wordInfo);
    navigateTo('word-detail', wordInfo);
  };

  return (
    <div className="bg-[#fafafa] dark:bg-[#323435] min-h-screen relative text-gray-800 dark:text-[#EAE3D9] overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* --- BOTONES FLOTANTES (MODO OSCURO / SONIDO) --- */}
      {currentView !== 'splash' && currentView !== 'landing' && (
        <div className="fixed bottom-6 right-4 md:top-4 md:bottom-auto md:right-4 z-[100] flex md:flex-row flex-col items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3.5 md:p-3 bg-white dark:bg-[#2F6666] text-gray-800 dark:text-[#F19C83] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 dark:border-[#2F6666] hover:scale-105 transition-transform flex items-center justify-center backdrop-blur-md bg-opacity-90"
            title={isMuted ? "Activar Sonido" : "Silenciar Tutor"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3.5 md:p-3 bg-white dark:bg-[#2F6666] text-gray-800 dark:text-[#F19C83] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 dark:border-[#2F6666] hover:scale-105 transition-transform flex items-center justify-center backdrop-blur-md bg-opacity-90"
            title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* --- BOTÓN DE INSTALACIÓN PWA (¡Ahora solo en la Landing Page!) --- */}
      {showInstallBtn && currentView === 'landing' && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-[90] pointer-events-none">
          <button 
            onClick={handleInstallClick}
            className="pointer-events-auto bg-[#FA8C7F] dark:bg-[#F19C83] text-white dark:text-[#323435] font-black px-6 py-2.5 rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg border border-white/20 text-xs uppercase tracking-wider animate-bounce"
          >
            <Download className="w-4 h-4" /> Instalar App
          </button>
        </div>
      )}

      {/* --- ENRUTADOR --- */}
      <div className="relative z-10 pb-20 md:pb-0">
        {currentView === 'splash' && <SplashScreen navigateTo={navigateTo} />}
        {currentView === 'landing' && <LandingPage navigateTo={navigateTo} />}
        {currentView === 'login' && <LoginScreen navigateTo={navigateTo} />}
        {currentView === 'library' && <LibraryScreen navigateTo={navigateTo} />}
        {currentView === 'admin' && <AdminScreen navigateTo={navigateTo} />}
        {currentView === 'reader' && (
          <ReaderScreen 
            navigateTo={navigateTo} 
            book={selectedBook} 
            openWordDetail={openWordDetail} 
            isMuted={isMuted}
          />
        )}
        {currentView === 'pricing' && <PricingScreen navigateTo={navigateTo} />}
        
        {/* AÑADIMOS LA RUTA DEL PERFIL AQUÍ */}
        {currentView === 'profile' && <ProfileScreen navigateTo={navigateTo} />}
        
        {currentView === 'word-detail' && (
          <WordDetailScreen 
            navigateTo={navigateTo} 
            wordInfo={activeWordInfo} 
            bookContext={selectedBook} 
            isMuted={isMuted}
          />
        )}
      </div>
    </div>
  );
}