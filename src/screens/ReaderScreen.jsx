import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Sparkles, X, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; 

const wordCacheV2 = new Map();
let audioMemoria = []; 

export default function ReaderScreen({ navigateTo, book, openWordDetail }) {
  const [selectedWordInfo, setSelectedWordInfo] = useState(null);
  const [displayedScript, setDisplayedScript] = useState(""); 
  const [playbackKey, setPlaybackKey] = useState(0); 
  
  // --- EL ESCUDO ASÍNCRONO ---
  // Guarda la palabra exacta que se está procesando actualmente
  const currentWordRef = useRef(null);
  
  useEffect(() => {
    let fallbackTimer;
    if (selectedWordInfo && !selectedWordInfo.isLoading) {
      fallbackTimer = setTimeout(() => {
        closeModal();
      }, 30000); 
    }
    return () => clearTimeout(fallbackTimer);
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

  const stopAndClearAudio = () => {
    if (window.closeModalTimeout) clearTimeout(window.closeModalTimeout);
    audioMemoria.forEach(u => {
      u.onend = null;
      u.onerror = null;
    });
    window.speechSynthesis.cancel(); 
    audioMemoria = []; 
  };

  const closeModal = () => {
    currentWordRef.current = null; // Cancelamos cualquier proceso en segundo plano inmediatamente
    stopAndClearAudio(); 
    setSelectedWordInfo(null); 
  };

  const playAudioSequence = (englishWord, spanishScript) => {
    if (!('speechSynthesis' in window)) return;
    
    stopAndClearAudio(); 

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

    audioMemoria.push(engUtterance, spaUtterance);

    engUtterance.onend = () => {
      setTimeout(() => {
        // Doble verificación: que la ventana no se haya cerrado durante el audio en inglés
        if (audioMemoria.length > 0) {
          window.speechSynthesis.speak(spaUtterance);
        }
      }, 400); 
    };

    engUtterance.onerror = () => {
      if (audioMemoria.length > 0) {
        window.speechSynthesis.speak(spaUtterance);
      }
    };

    spaUtterance.onend = () => {
      window.closeModalTimeout = setTimeout(() => {
        closeModal();
      }, 1500); 
    };
    
    spaUtterance.onerror = () => {
      window.closeModalTimeout = setTimeout(() => {
        closeModal();
      }, 1500);
    };

    window.speechSynthesis.speak(engUtterance);
  };

  const handleWordClick = async (word) => {
    if (!/^[a-zA-Z']+$/.test(word)) return;
    
    const cleanWord = word.toLowerCase().trim();
    
    stopAndClearAudio(); 
    
    // Registramos la palabra que se acaba de cliquear como la "activa"
    currentWordRef.current = cleanWord;

    setSelectedWordInfo({ original: word, isLoading: true });
    setPlaybackKey(Date.now()); 
    
    // CAPA 1: RAM Cache
    if (wordCacheV2.has(cleanWord)) {
      const cachedData = wordCacheV2.get(cleanWord);
      
      // Si el usuario ya cambió de palabra velozmente, abortamos
      if (currentWordRef.current !== cleanWord) return;

      setSelectedWordInfo({ 
        original: word,
        ...cachedData,
        isLoading: false 
      });
      playAudioSequence(word, cachedData.audioScript);
      return; 
    }

    try {
      // CAPA 2: FIREBASE Cloud Cache
      const wordRef = doc(db, "diccionario", cleanWord);
      const wordSnap = await getDoc(wordRef);

      // ESCUDO: ¿Se cerró la ventana mientras Firebase respondía?
      if (currentWordRef.current !== cleanWord) return;

      if (wordSnap.exists()) {
        const firebaseData = wordSnap.data();
        wordCacheV2.set(cleanWord, firebaseData);

        setSelectedWordInfo({ 
          original: word,
          ...firebaseData,
          isLoading: false 
        });
        playAudioSequence(word, firebaseData.audioScript);
        return; 
      }

      // CAPA 3: GEMINI AI
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey.length < 15) throw new Error("Llave inválida"); 

      const promptText = `
        Eres un tutor de inglés muy amigable y coloquial. El usuario tocó la palabra: "${cleanWord}".
        
        REGLAS ESTRICTAS:
        1. Todo en ESPAÑOL natural.
        2. NUNCA saludes ni te presentes. PROHIBIDO decir "Hola", "Qué tal", "Soy tu tutor". Ve directo al grano.
        3. "pronunciation": Escribe cómo se lee en español (ej. "gud" para good).
        4. "audioScript": Inicia inmediatamente con la explicación. Ejemplo: "Se pronuncia 'gud'. Significa bueno o bien, y se usa para hablar de algo positivo."
        
        Devuelve estrictamente este JSON puro:
        {
          "emoji": "1 solo emoji",
          "translation": "Traducción principal",
          "pronunciation": "Pronunciación figurada",
          "audioScript": "El guion conversacional directo y sin saludos"
        }
      `;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
      
      const aiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json" 
          }
        })
      });

      // ESCUDO: ¿El usuario cerró o cambió de palabra mientras Gemini pensaba?
      if (currentWordRef.current !== cleanWord) return;

      if (!aiResponse.ok) throw new Error("Fallo en la conexión");

      const aiData = await aiResponse.json();
      const textResponse = aiData.candidates[0].content.parts[0].text;
      const data = JSON.parse(textResponse);

      const estTime = Math.max(4, Math.ceil(data.audioScript.length / 13) + 2);
      const finalData = { ...data, estimatedTime: estTime };

      // --- ULTRA ESCUDO FINAL ANTES DE GUARDAR ---
      // Si la palabra ya no es la activa, NO se guarda en RAM ni en Firebase. Se descarta.
      if (currentWordRef.current !== cleanWord) return;

      wordCacheV2.set(cleanWord, finalData);

      // Ahora sí, guardamos en Firebase de forma 100% segura
      try {
        await setDoc(wordRef, finalData);
        console.log(`✅ ¡Guardado en Firebase! La palabra "${cleanWord}" ahora es global.`);
      } catch (fbError) {
        console.warn("No se pudo guardar en Firebase:", fbError);
      }

      setSelectedWordInfo({ 
        original: word,
        ...finalData,
        isLoading: false 
      });

      playAudioSequence(word, finalData.audioScript);

    } catch (error) {
      // Si fue una cancelación del usuario, morimos en silencio sin romper la pantalla
      if (currentWordRef.current !== cleanWord) return;

      console.error("Error general:", error);
      const errorMsg = "Parece que nos quedamos sin internet. Revisa tu conexión y vuelve a intentarlo.";
      
      setSelectedWordInfo({ 
        original: word,
        emoji: '🛑',
        translation: 'Sin conexión',
        pronunciation: 'Error',
        audioScript: errorMsg,
        estimatedTime: 5,
        isLoading: false 
      });
      playAudioSequence(word, errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col relative pb-24 md:pb-20">
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-2 py-2 md:px-4 md:py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-fade-in-up p-4 md:p-6" 
          onClick={closeModal}
        >
          <div 
            className="relative w-full max-w-[380px] h-[85vh] max-h-[650px] bg-white rounded-3xl md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden text-gray-800 animate-scale-in border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 z-30 bg-violet-100/50">
                {!selectedWordInfo.isLoading && (
                   <div 
                      key={playbackKey} 
                      className="h-full bg-violet-500 animate-story-progress rounded-r-full" 
                      style={{ animationDuration: `${selectedWordInfo.estimatedTime}s` }}>
                   </div>
                )}
            </div>

            <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-20">
              <span className="text-xs text-violet-600 font-black tracking-widest uppercase">Traducción</span>
              <button 
                onClick={closeModal}
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {selectedWordInfo.isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center p-6 relative mt-10">
                 <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-6" />
                 <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">
                   {selectedWordInfo.original}
                 </h2>
                 <p className="text-gray-500 text-sm tracking-widest font-bold animate-pulse uppercase">Preparando explicación...</p>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-start p-6 relative mt-16 overflow-y-auto pb-6 no-scrollbar">
                  
                  <div className="text-[60px] mb-2 leading-none text-center w-full">
                    {selectedWordInfo.emoji}
                  </div>
                  
                  <h2 className="text-4xl font-extrabold text-center text-violet-700 mb-2 tracking-tight capitalize w-full">
                    {selectedWordInfo.original}
                  </h2>

                  <div className="px-4 py-1.5 bg-teal-50 border border-teal-200 rounded-full mb-6 flex items-center gap-2 shadow-sm">
                       <Volume2 className="w-4 h-4 text-teal-600" /> 
                       <span className="text-sm text-teal-700 font-bold tracking-wide"> /{selectedWordInfo.pronunciation}/</span>
                  </div>
                  
                  <div className="bg-violet-50 border border-violet-200 px-6 py-4 rounded-2xl mb-8 w-full text-center shadow-sm">
                    <p className="text-3xl text-violet-800 font-black tracking-wide capitalize">
                      {selectedWordInfo.translation}
                    </p>
                  </div>

                  <div className="w-full bg-gray-50 rounded-2xl p-5 mt-auto relative shadow-inner border border-gray-200">
                    <div className="absolute -top-3 left-5 bg-violet-600 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                      <MessageCircle className="w-3 h-3" /> Tu tutor dice
                    </div>
                    <p className="text-[15px] text-gray-800 font-medium leading-relaxed mt-2 italic min-h-[80px]">
                      "{displayedScript}"<span className="animate-pulse font-bold text-violet-500">_</span>
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setDisplayedScript(""); 
                      setPlaybackKey(Date.now()); 
                      playAudioSequence(selectedWordInfo.original, selectedWordInfo.audioScript); 
                      
                      let i = 0;
                      const script = selectedWordInfo.audioScript;
                      const typingInterval = setInterval(() => {
                        setDisplayedScript(script.slice(0, i));
                        i++;
                        if (i > script.length) clearInterval(typingInterval);
                      }, 40);
                    }}
                    className="mt-6 w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                  >
                    <Volume2 className="w-5 h-5" /> Escuchar de Nuevo
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}