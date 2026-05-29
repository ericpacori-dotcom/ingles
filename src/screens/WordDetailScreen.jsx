import React, { useState } from 'react';
import { ChevronLeft, BookOpenCheck, Volume2, Award, ArrowRight } from 'lucide-react';

export default function WordDetailScreen({ navigateTo, wordInfo }) {
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.85;
          window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button onClick={() => navigateTo('reader')} className="p-2 -ml-2 text-gray-500 hover:text-violet-600 rounded-full hover:bg-gray-100 flex items-center gap-1">
                    <ChevronLeft className="w-5 h-5" /> <span className="text-sm font-medium">Volver a leer</span>
                </button>
                <div className="flex items-center gap-2 text-violet-600 font-bold"><BookOpenCheck className="w-5 h-5" /> <span>Estudio Profundo</span></div>
                <div className="w-20"></div>
            </div>
            <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 text-center animate-fade-in-up">
                    <div className="text-6xl mb-4">{wordInfo.emoji}</div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{wordInfo.original}</h1>
                    <p className="text-xl text-violet-600 font-bold mb-6">{wordInfo.translation}</p>
                    <button onClick={() => playAudio(wordInfo.original)} className="mx-auto w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-violet-700"><Volume2 className="w-8 h-8" /></button>
                </div>
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Definición Extendida</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{wordInfo.explanation}</p>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-violet-500"><p className="text-gray-700 italic">"{wordInfo.example}"</p></div>
                </div>
            </div>
        </div>
    );
}