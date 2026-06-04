import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, X, Volume2, Loader2, MessageCircle } from 'lucide-react';

const wordCacheV2 = new Map();
// --- LA CAJA FUERTE --- (Evita que el navegador corte el audio)
let audioMemoria = []; 

export default function ReaderScreen({ navigateTo, book, openWordDetail }) {
  const [selectedWordInfo, setSelectedWordInfo] = useState(null);
  const [displayedScript, setDisplayedScript] = useState(""); 
  
  useEffect(() => {
    let timer;
    if (selectedWordInfo && !selectedWordInfo.isLoading) {
      timer = setTimeout(() => {
        closeModal();
      }, 15000); 
    }
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [selectedWordInfo]);

  useEffect(() => {
    if (selectedWordInfo && !selectedWordInfo.isLoading && selectedWordInfo.audioScript) {
      setDisplayedScript(""); 
      let i = 0;
      const script = selectedWordInfo.audioScript;
      
      const typingInterval = setInterval(() => {
        setDisplayedScript(script.slice(0, i));
        i++;
        if (i > script.length) {
          clearInterval(typingInterval);
        }
      }, 40); 

      return () => clearInterval(typingInterval);
    }
  }, [selectedWordInfo]);

  if (!book) {
    navigateTo('library');
    return null;
  }

  const textTokens = book.content.split(/(\b[a-zA-Z']+\b)/);

  const closeModal = () => {
    setSelectedWordInfo(null);
    window.speechSynthesis.cancel(); 
    audioMemoria = []; // Vaciamos la caja fuerte al cerrar
  };

  // --- SISTEMA DE AUDIO ANTI-CORTES ---
  const playAudioSequence = (englishWord, spanishScript) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); 
    audioMemoria = []; // Limpiamos audios anteriores

    const engUtterance = new SpeechSynthesisUtterance(englishWord);
    engUtterance.lang = 'en-US';
    engUtterance.rate = 0.85;

    const spaUtterance = new SpeechSynthesisUtterance(spanishScript);
    spaUtterance.lang = 'es-MX'; 
    spaUtterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const googleSpanish = voices.find(v => v.name.includes('Google') && v.lang.includes('es'));
    if (googleSpanish) {
      spaUtterance.voice = googleSpanish;
    }

    // TRUCO: Guardamos los audios en la memoria global para que el navegador no los elimine
    audioMemoria.push(engUtterance);
    audioMemoria.push(spaUtterance);

    // Cuando termine el inglés...
    engUtterance.onend = () => {
      // Hacemos una pausa natural de 400 milisegundos antes del español
      setTimeout(() => {
        window.speechSynthesis.speak(spaUtterance);
      }, 400); 
    };

    // Si el inglés falla por alguna razón, pasa directo al español
    engUtterance.onerror = () => {
      window.speechSynthesis.speak(spaUtterance);
    };

    // ¡Que comience el show!
    window.speechSynthesis.speak(engUtterance);
  };

  const handleWordClick = async (word) => {
    if (!/^[a-zA-Z']+$/.test(word)) return;
    
    const cleanWord = word.toLowerCase().trim();
    setSelectedWordInfo({ original: word, isLoading: true });
    
    if (wordCacheV2.has(cleanWord)) {
      const cachedData = wordCacheV2.get(cleanWord);
      
      setSelectedWordInfo({ 
        original: word,
        emoji: cachedData.emoji,
        translation: cachedData.translation,
        pronunciation: cachedData.pronunciation,
        audioScript: cachedData.audioScript,
        isLoading: false 
      });
      
      playAudioSequence(word, cachedData.audioScript);
      return; 
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey.length < 15) {
        throw new Error("Llave inválida"); 
      }

      const promptText = `
        Eres un tutor de inglés muy amigable, cero técnico y muy coloquial. 
        El usuario tocó la palabra: "${cleanWord}" en un texto.
        
        REGLAS:
        1. Todo en ESPAÑOL natural.
        2. "pronunciation": Escribe cómo se lee en español (ej. "gud" para good).
        3. "audioScript": Crea un guion conversacional corto como un profesor amable. 
           Ejemplo: "Se pronuncia 'gud'. Significa bueno o bien, y se usa para hablar de algo positivo."
        
        Devuelve estrictamente este JSON puro:
        {
          "emoji": "1 solo emoji",
          "translation": "Traducción principal",
          "pronunciation": "Pronunciación figurada",
          "audioScript": "El guion amigable"
        }
      `;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
      
      const aiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json" 
          }
        })
      });

      if (!aiResponse.ok) throw new Error("Fallo en la conexión");

      const aiData = await aiResponse.json();
      const textResponse = aiData.candidates[0].content.parts[0].text;
      const data = JSON.parse(textResponse);

      wordCacheV2.set(cleanWord, data);

      setSelectedWordInfo({ 
        original: word,
        emoji: data.emoji,
        translation: data.translation,
        pronunciation: data.pronunciation,
        audioScript: data.audioScript,
        isLoading: false 
      });

      playAudioSequence(word, data.audioScript);

    } catch (error) {
      console.error("Error de IA:", error);
      const errorMsg = "Parece que nos quedamos sin internet. Revisa tu conexión y vuelve a intentarlo.";
      setSelectedWordInfo({ 
        original: word,
        emoji: '🛑',
        translation: 'Sin conexión',
        pronunciation: 'Error',
        audioScript: errorMsg,
        isLoading: false 
      });
      playAudioSequence(word, errorMsg);
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
      </div>

      {selectedWordInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in-up p-0 md:p-6" 
          onClick={closeModal}
        >
          <div 
            className="relative w-full h-full md:w-[380px] md:h-[650px] bg-[#09090b] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden text-white animate-scale-in border-0 md:border-[6px] md:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 md:top-4 left-2 right-2 flex gap-1 z-30">
              <div className="h-1.5 md:h-2 bg-white/30 rounded-full flex-1 overflow-hidden">
                {!selectedWordInfo.isLoading && (
                   <div className="h-full bg-white rounded-full animate-story-progress" style={{ animationDuration: '15s' }}></div>
                )}
              </div>
            </div>

            <div className="absolute top-6 md:top-8 left-4 right-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-white leading-tight">Tutor Activo</h3>
                  <p className="text-[10px] text-violet-300 font-bold uppercase tracking-widest">Escuchando...</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {selectedWordInfo.isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center p-6 relative mt-10">
                 <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-6" />
                 <h2 className="text-2xl font-extrabold text-center text-white mb-2 tracking-tight">
                   {selectedWordInfo.original}
                 </h2>
                 <p className="text-violet-300 text-sm tracking-widest font-bold animate-pulse uppercase">Preparando explicación...</p>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-start p-6 relative mt-24 overflow-y-auto pb-6 no-scrollbar">
                  
                  <div className="text-[60px] mb-2 leading-none animate-fade-in-up drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {selectedWordInfo.emoji}
                  </div>
                  
                  <h2 className="text-4xl font-extrabold text-center text-white mb-2 tracking-tight drop-shadow-lg">
                    {selectedWordInfo.original}
                  </h2>

                  <div className="px-4 py-1 bg-white/10 border border-white/20 rounded-full mb-6">
                     <span className="text-xs text-gray-300 uppercase tracking-widest font-bold flex items-center gap-2">
                       <Volume2 className="w-3 h-3" /> /{selectedWordInfo.pronunciation}/
                     </span>
                  </div>
                  
                  <div className="bg-violet-600/40 border border-violet-400/50 px-6 py-3 rounded-2xl mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.3)] w-full text-center">
                    <p className="text-2xl text-violet-100 font-black tracking-wide capitalize drop-shadow-md">
                      {selectedWordInfo.translation}
                    </p>
                  </div>

                  {/* CAJA DE SUBTÍTULOS ANIMADA */}
                  <div className="w-full bg-[#18181b] rounded-2xl p-5 border border-gray-700 mt-auto relative shadow-inner">
                    <div className="absolute -top-3 left-5 bg-violet-500 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                      <MessageCircle className="w-3 h-3" /> El tutor dice
                    </div>
                    <p className="text-[16px] text-gray-200 font-medium leading-relaxed mt-2 italic min-h-[80px]">
                      "{displayedScript}"<span className="animate-pulse">_</span>
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setDisplayedScript(""); 
                      playAudioSequence(selectedWordInfo.original, selectedWordInfo.audioScript); 
                      
                      let i = 0;
                      const script = selectedWordInfo.audioScript;
                      const typingInterval = setInterval(() => {
                        setDisplayedScript(script.slice(0, i));
                        i++;
                        if (i > script.length) clearInterval(typingInterval);
                      }, 40);
                    }}
                    className="mt-6 w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-5 h-5" /> Repetir Explicación
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}