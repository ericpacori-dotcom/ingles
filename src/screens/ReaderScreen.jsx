import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, X, Volume2, ChevronUp, Loader2 } from 'lucide-react';

// --- EL TRUCO DE ORO: MEMORIA CACHÉ ---
// Un "Map" es como un diccionario interno súper rápido. 
// Al estar fuera del componente, no se borra aunque el usuario cambie de página, 
// solo se borra si recarga la pestaña por completo.
const wordCache = new Map();

export default function ReaderScreen({ navigateTo, book, openWordDetail }) {
  const [selectedWordInfo, setSelectedWordInfo] = useState(null);
  
  useEffect(() => {
    let timer;
    if (selectedWordInfo && !selectedWordInfo.isLoading) {
      timer = setTimeout(() => {
        setSelectedWordInfo(null);
      }, 8000); 
    }
    return () => clearTimeout(timer); 
  }, [selectedWordInfo]);

  if (!book) {
    navigateTo('library');
    return null;
  }

  const textTokens = book.content.split(/(\b[a-zA-Z']+\b)/);

  const handleWordClick = async (word) => {
    if (!/^[a-zA-Z']+$/.test(word)) return;
    
    const cleanWord = word.toLowerCase().trim();
    
    setSelectedWordInfo({ original: word, isLoading: true });
    playAudio(word);

    // 1. REVISAR LA MEMORIA ANTES DE GASTAR LÍMITES DE GOOGLE
    if (wordCache.has(cleanWord)) {
      console.log(`⚡ ¡Memoria Caché usada para "${cleanWord}"! (0 tokens gastados)`);
      const cachedData = wordCache.get(cleanWord);
      
      setSelectedWordInfo({ 
        original: word,
        emoji: cachedData.emoji,
        grammar: cachedData.grammar,
        translation: cachedData.translation,
        definition: cachedData.definition,
        example: cachedData.example,
        exampleTranslation: cachedData.exampleTranslation,
        isLoading: false 
      });
      
      return; // Detenemos la función aquí. ¡Respuesta instantánea!
    }

    // 2. SI LA PALABRA ES NUEVA, CONSULTAMOS A LA INTELIGENCIA ARTIFICIAL
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey.length < 15) {
        throw new Error("Llave inválida"); 
      }

      const promptText = `
        Eres un tutor de inglés ayudando con el "Libro de Mormón". Palabra: "${cleanWord}".
        REGLAS DE VELOCIDAD: 
        1. Todo 100% en ESPAÑOL.
        2. Sé EXTREMADAMENTE BREVE (máximo 15 palabras en la definición).
        Devuelve esto:
        {
          "emoji": "1 solo emoji",
          "grammar": "Tipo de palabra en español",
          "translation": "Traducción al español",
          "definition": "Si es del Libro de Mormón (personaje/lugar), di brevemente quién/qué es. Si es normal, definición coloquial muy corta.",
          "example": "Oración de ejemplo muy corta en inglés",
          "exampleTranslation": "Traducción al español"
        }
      `;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
      
      const aiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2, 
            responseMimeType: "application/json" 
          }
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error?.message || "Fallo en la conexión a Gemini");
      }

      const aiData = await aiResponse.json();
      const textResponse = aiData.candidates[0].content.parts[0].text;
      const data = JSON.parse(textResponse);

      // 3. GUARDAR LA RESPUESTA EN LA MEMORIA PARA LA PRÓXIMA VEZ
      wordCache.set(cleanWord, data);
      console.log(`🤖 "${cleanWord}" guardada en memoria caché para el futuro.`);

      setSelectedWordInfo({ 
        original: word,
        emoji: data.emoji,
        grammar: data.grammar,
        translation: data.translation,
        definition: data.definition,
        example: data.example,
        exampleTranslation: data.exampleTranslation,
        isLoading: false 
      });

    } catch (error) {
      console.error("Error de IA:", error);
      
      setSelectedWordInfo({ 
        original: word,
        emoji: '🛑',
        grammar: 'Error de conexión',
        translation: 'Sin respuesta',
        definition: 'Hubo un problema de conexión con el tutor inteligente. Verifica tu internet.',
        example: '',
        exampleTranslation: '',
        isLoading: false 
      });
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; 
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Tu navegador no soporta Text-to-Speech");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col relative pb-24 md:pb-20">
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-2 py-2 md:px-4 md:py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm animate-fade-in-up">
        <button onClick={() => navigateTo('library')} className="p-2 text-gray-500 hover:text-violet-600 rounded-full hover:bg-gray-100 hover:-translate-x-1 transition-all">
          <ChevronLeft className="w-6 h-6 md:w-6 md:h-6" />
        </button>
        <div className="text-center truncate px-2">
          <h2 className="font-bold text-gray-800 text-sm md:text-base truncate">{book.title}</h2>
          <p className="text-[10px] text-[#8b5cf6] font-bold uppercase tracking-widest">Nivel {book.level}</p>
        </div>
        <div className="w-10"></div> 
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-12 text-[17px] md:text-xl leading-relaxed text-gray-800 font-serif animate-fade-in-up delay-100">
        <p className="mb-6 whitespace-pre-wrap">
          {textTokens.map((token, index) => {
            const isWord = /^[a-zA-Z']+$/.test(token);
            if (isWord) {
              const isSelected = selectedWordInfo?.original === token;
              return (
                <span
                  key={index}
                  onClick={() => handleWordClick(token)}
                  className={`cursor-pointer transition-colors duration-200 rounded px-0.5 
                    ${isSelected ? 'bg-violet-200 text-violet-900 border-b-2 border-violet-500' : 'hover:bg-violet-100 hover:text-violet-700 active:bg-violet-300'}`}
                >
                  {token}
                </span>
              );
            }
            return <span key={index}>{token}</span>;
          })}
        </p>
        
        <div className="bg-violet-50 border-l-4 border-[#8b5cf6] p-3 md:p-4 text-xs md:text-sm text-gray-600 mt-8 md:mt-12 rounded-r animate-fade-in-up delay-300 shadow-sm">
          <strong>Tip de aprendizaje:</strong> Toca cualquier palabra o personaje para ver su contexto. Las palabras repetidas cargarán al instante.
        </div>

        <button 
          onClick={() => navigateTo('library')}
          className="mt-12 w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors animate-fade-in-up delay-400"
        >
          Finalizar lectura
        </button>
      </div>

      {selectedWordInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in-up p-0 md:p-6" 
          onClick={() => setSelectedWordInfo(null)}
        >
          <div 
            className="relative w-full h-full md:w-[380px] md:h-[750px] bg-[#09090b] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden text-white animate-scale-in border-0 md:border-[6px] md:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 md:top-4 left-2 right-2 flex gap-1 z-30">
              <div className="h-1.5 md:h-2 bg-white/30 rounded-full flex-1 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                {!selectedWordInfo.isLoading && (
                   <div className="h-full bg-white rounded-full animate-story-progress" style={{ animationDuration: '8s' }}></div>
                )}
              </div>
            </div>

            <div className="absolute top-6 md:top-8 left-4 right-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-white leading-tight drop-shadow-md">Guía de Estudio</h3>
                  <p className="text-[10px] text-violet-300 font-bold uppercase tracking-widest drop-shadow-md">Tutor Inteligente</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWordInfo(null)}
                className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {selectedWordInfo.isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center p-6 relative mt-10">
                 <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-6" />
                 <h2 className="text-2xl font-extrabold text-center text-white mb-2 tracking-tight drop-shadow-lg">
                   {selectedWordInfo.original}
                 </h2>
                 <p className="text-violet-300 text-sm tracking-widest font-bold animate-pulse uppercase">Analizando contexto...</p>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-start p-6 relative mt-20 overflow-y-auto pb-6 no-scrollbar">
                  
                  <div className="text-[70px] mb-2 leading-none animate-fade-in-up drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {selectedWordInfo.emoji}
                  </div>
                  
                  <h2 className="text-5xl font-extrabold text-center text-white mb-3 tracking-tight drop-shadow-lg break-words w-full">
                    {selectedWordInfo.original}
                  </h2>

                  {selectedWordInfo.grammar && (
                    <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-6">
                       <span className="text-xs text-gray-300 uppercase tracking-widest font-bold">{selectedWordInfo.grammar}</span>
                    </div>
                  )}
                  
                  <div className="bg-violet-600/40 border border-violet-400/50 px-6 py-2 rounded-2xl mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.3)] w-full text-center">
                    <p className="text-3xl text-violet-100 font-black tracking-wide capitalize drop-shadow-md">
                      {selectedWordInfo.translation}
                    </p>
                  </div>

                  <p className="text-sm text-gray-300 text-center font-medium mb-8 max-w-[95%] leading-relaxed">
                    {selectedWordInfo.definition}
                  </p>

                  <button 
                    onClick={() => playAudio(selectedWordInfo.original)}
                    className="w-16 h-16 mb-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all duration-300 group shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  >
                    <Volume2 className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                  </button>

                  {selectedWordInfo.example && (
                    <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mt-auto text-left">
                      <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Ejemplo
                      </p>
                      
                      <p className="text-[15px] text-white font-medium mb-2 leading-snug">
                        {selectedWordInfo.exampleTranslation}
                      </p>

                      <p className="text-xs text-gray-400 italic leading-snug border-l-2 border-white/20 pl-2">
                        "{selectedWordInfo.example}"
                      </p>
                    </div>
                  )}
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}