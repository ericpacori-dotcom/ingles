import React from 'react';
import { ChevronLeft, Bookmark, Volume2, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function WordDetailScreen({ navigateTo, wordInfo, bookContext }) {
  
  if (!wordInfo) {
    navigateTo('library');
    return null;
  }

  const playWordAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordInfo.original);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 max-w-2xl mx-auto animate-fade-in-up">
      
      {/* BOTÓN REGRESAR AL LECTOR */}
      <button 
        onClick={() => navigateTo('reader', bookContext)} 
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-violet-600 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm transition-all"
      >
        <ChevronLeft className="w-4 h-4" /> Volver a la lectura
      </button>

      {/* CONTENEDOR PRINCIPAL DETALLE DETALLADO (Estilo Diliooo Premium) */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 to-teal-400"></div>

        {/* Encabezado con Palabra y Tipo */}
        <div className="flex justify-between items-start mb-8 mt-4">
          <div>
            <div className="text-[55px] leading-none mb-2">{wordInfo.emoji || '✨'}</div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight capitalize mb-1">{wordInfo.original}</h1>
            <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-black rounded-full text-xs uppercase tracking-wider">
              {wordInfo.grammar || 'Vocabulario'}
            </span>
          </div>

          <button 
            onClick={() => alert("¡Guardado en tu cuaderno de estudio personal!")}
            className="p-3 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-2xl border border-violet-100 transition-all shadow-sm"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Sección de Traducción Principal */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-violet-500 font-black uppercase tracking-wider mb-0.5">Traducción Oficial</p>
            <p className="text-3xl text-violet-800 font-black tracking-wide capitalize">{wordInfo.translation}</p>
          </div>
          <button 
            onClick={playWordAudio}
            className="w-14 h-14 bg-white border-2 border-violet-200 rounded-2xl flex items-center justify-center hover:bg-violet-50 transition-all active:scale-95 shadow-sm group"
          >
            <Volume2 className="w-6 h-6 text-violet-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Significado Extendida y Consejos del Tutor */}
        <div className="space-y-6 border-t border-gray-100 pt-6">
          
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-500" /> Explicación del Tutor
            </h3>
            <p className="text-[16px] text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
              "{wordInfo.definition || 'Esta palabra tiene un significado contextual específico dentro de tu lectura actual.'}"
            </p>
          </div>

          {/* Sección de Ejemplos en Contexto Bilingües de Alta Legibilidad */}
          {wordInfo.example && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-500" /> Ejemplo Práctico de Estudio
              </h3>
              <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-inner space-y-2.5">
                <p className="text-[16px] text-gray-900 font-black leading-snug">
                  {wordInfo.exampleTranslation}
                </p>
                <p className="text-sm text-gray-400 italic leading-snug border-l-2 border-gray-200 pl-3">
                  "{wordInfo.example}"
                </p>
              </div>
            </div>
          )}

          {/* Tips Adicionales de Memorización */}
          <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl flex gap-3 text-sm text-teal-800 font-medium">
            <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            <p><strong>Tip diliooo:</strong> Al haber revisado esta palabra de forma extendida, la IA la priorizará en tus sesiones automáticas de repaso de vocabulario diario.</p>
          </div>

        </div>

      </div>
    </div>
  );
}