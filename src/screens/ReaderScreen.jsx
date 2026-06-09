import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Sparkles, X, Volume2, VolumeX, Loader2, MessageCircle, Lightbulb, Bookmark } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { fetchWordExplanation, fetchParagraphSummary, fetchPhraseExplanation } from '../services/aiService'; 

const translateTitle = (text) => {
  if (!text) return '';
  const dictionary = {
    "Chapter": "Capítulo", "Part": "Parte", "Book": "Libro",
    "The Ancient Clock": "El Reloj Antiguo", "The Magic Tree": "El Árbol Mágico",
    "A New Friend": "Un Nuevo Amigo", "The Lost Letter": "La Carta Perdida",
    "The Boy Who Cried Wolf": "El Pastorcito Mentiroso", "Cinderella": "Cenicienta",
    "1 Nephi": "1 Nefi", "2 Nephi": "2 Nefi", "3 Nephi": "3 Nefi", "4 Nephi": "4 Nefi",
    "Words of Mormon": "Palabras de Mormón", "Mormon": "Mormón", "Ether": "Éter",
    "Mosiah": "Mosíah", "Helaman": "Helamán", "Jacob": "Jacob", "Enos": "Enós",
    "Jarom": "Jarom", "Omni": "Omni", "Moroni": "Moroni"
  };
  let translatedText = text;
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  sortedKeys.forEach(engWord => {
    const regex = new RegExp(`\\b${engWord}\\b`, "gi");
    translatedText = translatedText.replace(regex, dictionary[engWord]);
  });
  return translatedText;
};

const wordCacheV2 = new Map();
const contextCache = new Map(); 
let audioMemoria = []; 

export default function ReaderScreen({ navigateTo, book, openWordDetail, isMuted }) {
  const [selectedWordInfo, setSelectedWordInfo] = useState(null);
  const [pageContextInfo, setPageContextInfo] = useState(null); 
  const [displayedScript, setDisplayedScript] = useState(""); 
  const [playbackKey, setPlaybackKey] = useState(0); 
  const [savedParagraphIndex, setSavedParagraphIndex] = useState(null);

  const [customSelection, setCustomSelection] = useState({
    isSelecting: false, pIndex: null, startIndex: null, endIndex: null
  });

  const currentWordRef = useRef(null);
  const isMutedRef = useRef(isMuted);
  const paragraphRefs = useRef([]);
  const touchStartRef = useRef({ x: 0, y: 0, isScrolling: false, intentResolved: false });
  const scrollTimeout = useRef(null); // NUEVO: Control para el auto-guardado

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted) window.speechSynthesis.cancel();
  }, [isMuted]);

  // NUEVO: Lógica mejorada para leer el progreso
  useEffect(() => {
    if (book && book.id) {
      const savedVal = localStorage.getItem(`diliooo_progress_${book.id}`);
      if (savedVal !== null) {
        try {
          const parsed = JSON.parse(savedVal);
          setSavedParagraphIndex(parsed.pIndex);
        } catch (e) {
          setSavedParagraphIndex(parseInt(savedVal)); // Soporte para usuarios antiguos
        }
      }
    }
  }, [book]);

  const paragraphs = book ? book.content.split('\n').filter(p => p.trim() !== '') : [];

  // NUEVO: Sistema de Auto-Guardado en Silencio al hacer Scroll
  useEffect(() => {
    if (!book) return;

    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        const elements = paragraphRefs.current;
        let foundIndex = -1;
        for (let i = 0; i < elements.length; i++) {
          if (elements[i]) {
            const rect = elements[i].getBoundingClientRect();
            // Guarda el párrafo que esté pasando por la mitad superior de la pantalla
            if (rect.top >= 0 && rect.top <= window.innerHeight * 0.6) {
              foundIndex = i;
              break;
            }
          }
        }
        
        if (foundIndex !== -1 && paragraphs[foundIndex]) {
          const snippetText = paragraphs[foundIndex].replace(/<[^>]*>?/gm, '');
          const snippet = snippetText.substring(0, 50).trim() + '...';
          const progressData = {
            pIndex: foundIndex,
            snippet,
            title: book.chapterName || book.title,
            bookData: book
          };
          localStorage.setItem(`diliooo_progress_${book.id}`, JSON.stringify(progressData));
          localStorage.setItem('diliooo_last_read_v2', JSON.stringify(progressData)); // Global para el Inicio
        }
      }, 1000); // 1 segundo de pausa en el scroll para guardar
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [book, paragraphs]);
  
  useEffect(() => {
    let fallbackTimer;
    if (selectedWordInfo && !selectedWordInfo.isLoading) {
      fallbackTimer = setTimeout(() => closeModal(), 30000); 
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
        if (i > script.length) clearInterval(typingInterval);
      }, 40); 
      return () => clearInterval(typingInterval);
    }
  }, [selectedWordInfo]);

  if (!book) {
    navigateTo('library');
    return null;
  }

  const stopAndClearAudio = () => {
    if (window.closeModalTimeout) clearTimeout(window.closeModalTimeout);
    audioMemoria.forEach(u => { u.onend = null; u.onerror = null; });
    window.speechSynthesis.cancel(); 
    audioMemoria = []; 
  };

  const closeModal = () => {
    currentWordRef.current = null; 
    stopAndClearAudio(); 
    setSelectedWordInfo(null); 
    setPageContextInfo(null);
    setCustomSelection({ isSelecting: false, pIndex: null, startIndex: null, endIndex: null });
  };

  const scrollLastReadParagraph = () => {
    if (savedParagraphIndex !== null && paragraphRefs.current[savedParagraphIndex]) {
      paragraphRefs.current[savedParagraphIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSavedParagraphIndex(null);
    }
  };

  // NUEVO: Guardado manual mejorado
  const saveReadingProgress = (pIndex) => {
    const snippetText = paragraphs[pIndex];
    if (!snippetText) return;
    const snippet = snippetText.substring(0, 50).trim() + '...';
    const progressData = {
      pIndex, snippet, title: book.chapterName || book.title, bookData: book
    };
    localStorage.setItem(`diliooo_progress_${book.id}`, JSON.stringify(progressData));
    localStorage.setItem('diliooo_last_read_v2', JSON.stringify(progressData));
  };

  const playAudioSequence = (englishWord, spanishScript) => {
    if (!('speechSynthesis' in window) || isMutedRef.current) {
      window.closeModalTimeout = setTimeout(() => closeModal(), 5000);
      return; 
    }
    stopAndClearAudio(); 
    const engUtterance = new SpeechSynthesisUtterance(englishWord);
    engUtterance.lang = 'en-US'; engUtterance.rate = 0.85;
    const spaUtterance = new SpeechSynthesisUtterance(spanishScript);
    spaUtterance.lang = 'es-MX'; spaUtterance.rate = 0.95;
    
    const voices = window.speechSynthesis.getVoices();
    const googleSpanish = voices.find(v => v.name.includes('Google') && v.lang.includes('es'));
    if (googleSpanish) spaUtterance.voice = googleSpanish;

    audioMemoria.push(engUtterance, spaUtterance);
    engUtterance.onend = () => { setTimeout(() => { if (audioMemoria.length > 0 && !isMutedRef.current) window.speechSynthesis.speak(spaUtterance); }, 400); };
    engUtterance.onerror = () => { if (audioMemoria.length > 0 && !isMutedRef.current) window.speechSynthesis.speak(spaUtterance); };
    spaUtterance.onend = () => { window.closeModalTimeout = setTimeout(() => closeModal(), 1500); };
    spaUtterance.onerror = () => { window.closeModalTimeout = setTimeout(() => closeModal(), 1500); };
    window.speechSynthesis.speak(engUtterance);
  };

  const handlePointerDown = (pIndex, wIndex, e) => {
    if (e.touches) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, isScrolling: false, intentResolved: false };
    }
    setCustomSelection({ isSelecting: true, pIndex, startIndex: wIndex, endIndex: wIndex });
  };

  const handlePointerEnter = (pIndex, wIndex) => {
    if (customSelection.isSelecting && customSelection.pIndex === pIndex && !touchStartRef.current.isScrolling) {
      setCustomSelection(prev => ({ ...prev, endIndex: wIndex }));
    }
  };

  const handleTouchMove = (e) => {
    if (!customSelection.isSelecting) return;
    if (!e.touches || e.touches.length === 0) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    if (!touchStartRef.current.intentResolved) {
      if (deltaX > 8 || deltaY > 8) {
        touchStartRef.current.intentResolved = true;
        if (deltaY > deltaX * 1.5) {
          touchStartRef.current.isScrolling = true;
          setCustomSelection({ isSelecting: false, pIndex: null, startIndex: null, endIndex: null });
          return;
        } else {
          touchStartRef.current.isScrolling = false;
        }
      } else {
        return;
      }
    }

    if (touchStartRef.current.isScrolling) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.hasAttribute('data-windex')) {
      const wIndex = parseInt(element.getAttribute('data-windex'));
      const pIndex = parseInt(element.getAttribute('data-pindex'));
      if (customSelection.pIndex === pIndex) {
        setCustomSelection(prev => {
          if (prev.endIndex !== wIndex) return { ...prev, endIndex: wIndex };
          return prev;
        });
      }
    }
  };

  const endCustomSelection = async () => {
    if (!customSelection.isSelecting) return;
    const { pIndex, startIndex, endIndex } = customSelection;
    setCustomSelection(prev => ({ ...prev, isSelecting: false }));

    if (startIndex === null || endIndex === null) return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    const pTokens = paragraphs[pIndex].split(/(\b[a-zA-Z']+\b)/);
    
    let selectedPhrase = "";
    let wordsCount = 0;
    
    for (let i = minIndex; i <= maxIndex; i++) {
      selectedPhrase += pTokens[i];
      if (/^[a-zA-Z']+$/.test(pTokens[i])) wordsCount++;
    }

    if (wordsCount === 0) return;
    if (wordsCount > 15) { alert("Selección muy larga. Máximo 15 palabras para una mejor traducción."); return; }

    if (wordsCount > 1) {
      handlePhraseSubmit(selectedPhrase.trim(), pIndex, pTokens);
    } else {
      const word = pTokens.find((_, i) => i >= minIndex && i <= maxIndex && /^[a-zA-Z']+$/.test(pTokens[i]));
      if (word) handleWordClick(word, pTokens, pTokens.indexOf(word), pIndex);
    }
  };

  const handleWordClick = async (word, paragraphTokens, index, pIndex) => {
    saveReadingProgress(pIndex);
    const cleanWord = word.toLowerCase().trim();
    stopAndClearAudio(); 
    currentWordRef.current = cleanWord;
    setSelectedWordInfo({ original: word, isLoading: true });
    setPlaybackKey(Date.now()); 

    const start = Math.max(0, index - 15);
    const end = Math.min(paragraphTokens.length, index + 15);
    const sentenceContext = paragraphTokens.slice(start, end).join("").trim();
    const cacheKey = `${book.id}_p${pIndex}_w${index}_${cleanWord}`;

    try {
      const wordRef = doc(db, "traducciones_exactas", cacheKey);
      let firebaseData = wordCacheV2.get(cacheKey);
      
      if (!firebaseData) {
        const wordSnap = await getDoc(wordRef);
        if (wordSnap.exists()) {
          firebaseData = wordSnap.data();
          wordCacheV2.set(cacheKey, firebaseData);
        }
      }

      if (currentWordRef.current !== cleanWord) return;

      if (firebaseData) {
        const finalData = { ...firebaseData, original: word, isLoading: false };
        setSelectedWordInfo(finalData);
        playAudioSequence(firebaseData.expression || firebaseData.original, firebaseData.audioScript);
        return;
      }

      const newContextData = await fetchWordExplanation(cleanWord, sentenceContext);
      if (currentWordRef.current !== cleanWord) return;

      const estTime = Math.max(4, Math.ceil(newContextData.audioScript.length / 13) + 2);
      const finalContextData = { ...newContextData, estimatedTime: estTime };

      await setDoc(wordRef, finalContextData);
      wordCacheV2.set(cacheKey, finalContextData);

      setSelectedWordInfo({ original: word, ...finalContextData, isLoading: false });
      playAudioSequence(finalContextData.expression || finalContextData.original, finalContextData.audioScript);
    } catch (error) {
      if (currentWordRef.current !== cleanWord) return;
      const errorMsg = "Sin internet. Revisa tu conexión.";
      setSelectedWordInfo({ original: word, emoji: '🛑', translation: 'Error', pronunciation: 'N/A', audioScript: errorMsg, estimatedTime: 4, isLoading: false });
      playAudioSequence(word, errorMsg);
    }
  };

  const handlePhraseSubmit = async (phraseText, pIndex, pTokens) => {
    saveReadingProgress(pIndex);
    const paragraphContext = paragraphs[pIndex];
    const cleanPhrase = phraseText.toLowerCase().replace(/[^a-z0-9\s']/gi, '').replace(/\s+/g, ' ').trim();
    
    stopAndClearAudio();
    currentWordRef.current = cleanPhrase;
    setSelectedWordInfo({ original: phraseText, isLoading: true });
    setPlaybackKey(Date.now());

    const cacheKey = `${book.id}_p${pIndex}_phrase_${cleanPhrase.replace(/\s+/g, '_')}`;

    try {
      const phraseRef = doc(db, "traducciones_exactas", cacheKey);
      let firebaseData = wordCacheV2.get(cacheKey);
      
      if (!firebaseData) {
        const phraseSnap = await getDoc(phraseRef);
        if (phraseSnap.exists()) {
          firebaseData = phraseSnap.data();
          wordCacheV2.set(cacheKey, firebaseData);
        }
      }

      if (currentWordRef.current !== cleanPhrase) return;

      if (firebaseData) {
        const finalData = { ...firebaseData, original: phraseText, isLoading: false };
        setSelectedWordInfo(finalData);
        playAudioSequence(firebaseData.expression || phraseText, firebaseData.audioScript);
        return;
      }

      const newContextData = await fetchPhraseExplanation(cleanPhrase, paragraphContext);
      if (currentWordRef.current !== cleanPhrase) return;

      const estTime = Math.max(4, Math.ceil(newContextData.audioScript.length / 13) + 2);
      const finalContextData = { ...newContextData, estimatedTime: estTime };

      await setDoc(phraseRef, finalContextData);
      wordCacheV2.set(cacheKey, finalContextData);

      setSelectedWordInfo({ original: phraseText, ...finalContextData, isLoading: false });
      playAudioSequence(finalContextData.expression || phraseText, finalContextData.audioScript);
    } catch (error) {
      if (currentWordRef.current !== cleanPhrase) return;
      const errorMsg = "Sin internet. Revisa tu conexión.";
      setSelectedWordInfo({ original: phraseText, emoji: '🛑', translation: 'Error', pronunciation: 'N/A', audioScript: errorMsg, estimatedTime: 4, isLoading: false });
      playAudioSequence(phraseText, errorMsg);
    }
  };

  const handleExplainParagraph = async (paragraphText, pIndex) => {
    saveReadingProgress(pIndex);
    stopAndClearAudio();
    setPageContextInfo({ isLoading: true });
    const cacheKey = `${book.id}_p_${pIndex}`;

    try {
      const summaryRef = doc(db, "resumenes_parrafos", cacheKey);
      if (contextCache.has(cacheKey)) {
        setPageContextInfo({ text: contextCache.get(cacheKey), isLoading: false });
        return;
      }
      const summarySnap = await getDoc(summaryRef);
      if (summarySnap.exists()) {
        const text = summarySnap.data().texto;
        contextCache.set(cacheKey, text);
        setPageContextInfo({ text, isLoading: false });
        return;
      }

      const generatedSummary = await fetchParagraphSummary(paragraphText);
      await setDoc(summaryRef, { texto: generatedSummary });
      contextCache.set(cacheKey, generatedSummary);
      setPageContextInfo({ text: generatedSummary, isLoading: false });
    } catch (error) {
      setPageContextInfo({ text: "Lo siento, no pude cargar la explicación.", isLoading: false });
    }
  };

  const isSelectionFrozen = customSelection.isSelecting && touchStartRef.current.intentResolved && !touchStartRef.current.isScrolling;

  return (
    <div 
      className={`min-h-screen bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 flex flex-col relative pb-16 select-none ${isSelectionFrozen ? 'touch-none' : ''}`}
      onMouseUp={endCustomSelection}
      onTouchEnd={endCustomSelection}
      onMouseLeave={endCustomSelection}
      onTouchMove={handleTouchMove}
    >
      
      <div className="bg-white dark:bg-[#2F6666] border-b border-gray-200 dark:border-[#2F6666] px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
        <button onClick={() => navigateTo('library')} className="p-2 text-gray-500 dark:text-[#EAE3D9] hover:bg-gray-100 dark:hover:bg-[#B55B49] rounded-full transition-all shrink-0">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center truncate px-2 flex-1 overflow-hidden">
          <h2 className="font-bold text-gray-900 dark:text-[#EAE3D9] text-sm md:text-base truncate">
            {translateTitle(book.title)}
          </h2>
        </div>
        <div className="w-10 shrink-0"></div> 
      </div>

      {savedParagraphIndex !== null && (
        <div className="w-full flex justify-center mt-4 px-4 animate-fade-in-up absolute top-14 left-0 right-0 z-20">
          <button 
            onClick={scrollLastReadParagraph}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FA8C7F] dark:bg-[#F19C83] text-white dark:text-[#323435] font-black text-xs uppercase tracking-wider rounded-full shadow-lg border border-white/20 hover:scale-105 transition-transform"
          >
            <Bookmark className="w-4 h-4 fill-white dark:fill-[#323435]" /> Ir donde te quedaste
          </button>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-5 py-8 md:py-12 text-lg md:text-xl leading-relaxed text-gray-800 dark:text-[#EAE3D9] font-serif space-y-6 md:space-y-8 mt-4 overflow-x-hidden">
        {paragraphs.map((paragraphText, pIndex) => {
          const paragraphTokens = paragraphText.split(/(\b[a-zA-Z']+\b)/);
          
          return (
            <div 
              key={pIndex} 
              ref={el => paragraphRefs.current[pIndex] = el}
              className="w-full bg-white dark:bg-[#2a2b2c]/30 p-4 md:p-5 rounded-3xl border border-gray-200/60 dark:border-[#2F6666]/30 shadow-sm relative transition-all duration-300 hover:border-gray-300 dark:hover:border-[#2F6666]/80 overflow-hidden"
            >
              <p className="inline leading-[2.2] md:leading-loose tracking-wide break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere' }}>
                {paragraphTokens.map((token, index) => {
                  const isWord = /^[a-zA-Z']+$/.test(token);
                  
                  let isInCustomSelection = false;
                  if (customSelection.pIndex === pIndex && customSelection.startIndex !== null && customSelection.endIndex !== null) {
                    const min = Math.min(customSelection.startIndex, customSelection.endIndex);
                    const max = Math.max(customSelection.startIndex, customSelection.endIndex);
                    if (index >= min && index <= max) isInCustomSelection = true;
                  }

                  const isActivelySelectedWord = selectedWordInfo?.original === token && !customSelection.startIndex;

                  return (
                    <span
                      key={index}
                      data-pindex={pIndex}
                      data-windex={index}
                      onMouseDown={(e) => isWord && handlePointerDown(pIndex, index, e)}
                      onTouchStart={(e) => isWord && handlePointerDown(pIndex, index, e)}
                      onMouseEnter={() => isWord && handlePointerEnter(pIndex, index)}
                      className={`transition-colors duration-150 py-[2px]
                        ${isWord ? 'cursor-pointer' : ''} 
                        ${isInCustomSelection ? 'bg-[#FA8C7F]/30 dark:bg-[#F19C83]/40 text-[#FA8C7F] dark:text-[#F19C83] rounded-sm' : ''}
                        ${isActivelySelectedWord ? 'bg-[#FA8C7F] dark:bg-[#F19C83] text-white dark:text-[#323435] rounded-md px-1' : ''}
                        ${!isInCustomSelection && !isActivelySelectedWord && isWord ? 'hover:bg-gray-100 dark:hover:bg-[#2F6666] rounded-md px-[1px]' : ''}
                      `}
                    >
                      {token}
                    </span>
                  );
                })}
              </p>

              <button
                onClick={() => handleExplainParagraph(paragraphText, pIndex)}
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-[#2F6666]/40 hover:bg-amber-100 dark:hover:bg-[#BA6B41] text-amber-600 dark:text-[#F19C83] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all align-middle border border-amber-200/30 dark:border-transparent shadow-sm mt-3"
              >
                <Lightbulb className="w-3.5 h-3.5 animate-pulse" /> Idea
              </button>
            </div>
          );
        })}
      </div>

      {/* --- MODALES --- */}
      {pageContextInfo && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/60 p-4 backdrop-blur-sm" onClick={closeModal}>
            <div className="relative w-full max-w-[390px] bg-white dark:bg-[#323435] rounded-[32px] shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-[#2F6666] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
               <div className="absolute top-4 right-5">
                  <button onClick={closeModal} className="p-2 bg-gray-100 dark:bg-[#2F6666] rounded-full text-gray-500 dark:text-[#EAE3D9] hover:bg-gray-200 dark:hover:bg-[#B55B49]"><X className="w-4 h-4" /></button>
               </div>
               {pageContextInfo.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-12 h-12 text-[#FA8C7F] dark:text-[#F19C83] animate-spin mb-4" />
                    <p className="text-gray-400 dark:text-[#F19C83] text-xs font-bold uppercase tracking-widest text-center max-w-[220px]">Analizando este fragmento exacto...</p>
                  </div>
               ) : (
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-amber-500 dark:text-[#F19C83] mb-4 flex items-center gap-2">
                       <Lightbulb className="w-6 h-6 animate-pulse" /> Sentido del fragmento
                    </h2>
                    <p className="text-[15px] md:text-[16px] text-gray-700 dark:text-[#EAE3D9] font-medium leading-relaxed italic bg-gray-50 dark:bg-[#2F6666]/20 p-4 rounded-2xl border border-gray-100 dark:border-[#2F6666]/40">
                      "{pageContextInfo.text.trim()}"
                    </p>
                  </div>
               )}
            </div>
         </div>
      )}

      {selectedWordInfo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 dark:bg-black/60 p-4 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative w-full max-w-[360px] h-[80vh] max-h-[600px] bg-white dark:bg-[#323435] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#2F6666] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-[#2F6666] z-30">
                {!selectedWordInfo.isLoading && (
                   <div key={playbackKey} className="h-full bg-[#FA8C7F] dark:bg-[#F19C83] animate-story-progress rounded-r-full" style={{ animationDuration: `${selectedWordInfo.estimatedTime}s` }}></div>
                )}
            </div>

            <div className="absolute top-4 left-5 right-5 flex justify-between items-center z-20">
              <span className="px-3 py-1 bg-gray-100 dark:bg-[#2F6666] text-gray-500 dark:text-[#EAE3D9] rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm">
                {selectedWordInfo.grammar || 'Traducción'}
              </span>
              <button onClick={closeModal} className="p-2 bg-gray-100 dark:bg-[#2F6666] rounded-full text-gray-500 dark:text-[#EAE3D9] hover:bg-gray-200 dark:hover:bg-[#B55B49] shadow-sm"><X className="w-4 h-4" /></button>
            </div>

            {selectedWordInfo.isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center p-6 mt-10">
                 <Loader2 className="w-12 h-12 text-[#FA8C7F] dark:text-[#F19C83] animate-spin mb-4" />
                 <h2 className="text-xl md:text-2xl font-extrabold text-center text-gray-900 dark:text-[#EAE3D9] mb-2 px-4 line-clamp-3 leading-tight">{selectedWordInfo.original}</h2>
                 <p className="text-gray-400 dark:text-[#F19C83] text-xs font-bold uppercase tracking-widest text-center mt-2">Analizando el contexto...</p>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center p-6 mt-12 overflow-y-auto no-scrollbar">
                  
                  <div className="text-[56px] md:text-[64px] mb-4 leading-none text-center w-full">{selectedWordInfo.emoji}</div>
                  
                  <h2 className="text-2xl md:text-3xl font-black text-[#75A4A7] dark:text-[#F19C83] mb-3 tracking-tight capitalize text-center w-full px-2">
                    {selectedWordInfo.expression || selectedWordInfo.original}
                  </h2>

                  <div className="px-4 py-2 bg-[#75A4A7]/10 dark:bg-[#2F6666] dark:border dark:border-[#2F6666] rounded-full mb-6 flex items-center gap-2 max-w-[90%] overflow-hidden">
                       {isMuted ? <VolumeX className="w-4 h-4 text-[#75A4A7] dark:text-[#F19C83] shrink-0" /> : <Volume2 className="w-4 h-4 text-[#75A4A7] dark:text-[#F19C83] shrink-0" />}
                       <span className="text-xs md:text-sm text-[#75A4A7] dark:text-[#EAE3D9] font-bold truncate">/{selectedWordInfo.pronunciation}/</span>
                  </div>
                  
                  <div className="bg-[#FA8C7F]/10 dark:bg-[#B55B49]/40 border border-[#FA8C7F]/20 dark:border-[#B55B49] px-4 py-4 rounded-2xl mb-6 w-full text-center">
                    <p className="text-lg md:text-xl text-[#FA8C7F] dark:text-[#EAE3D9] font-black tracking-wide capitalize">
                      {selectedWordInfo.translation}
                    </p>
                  </div>

                  <div className="w-full bg-gray-50 dark:bg-[#2F6666] rounded-2xl p-4 md:p-5 mt-auto border border-gray-200 dark:border-[#2F6666]">
                    <div className="inline-flex items-center justify-center bg-[#75A4A7] dark:bg-[#BA6B41] text-white dark:text-[#EAE3D9] text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full gap-1.5 shadow-sm mb-3">
                      <MessageCircle className="w-3.5 h-3.5" /> Tu tutor dice
                    </div>
                    <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-[#EAE3D9] font-medium leading-relaxed italic min-h-[70px]">
                      "{displayedScript}"<span className="animate-pulse font-bold text-[#FA8C7F] dark:text-[#F19C83]">_</span>
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setDisplayedScript(""); 
                      setPlaybackKey(Date.now()); 
                      playAudioSequence(selectedWordInfo.expression || selectedWordInfo.original, selectedWordInfo.audioScript); 
                      
                      let i = 0;
                      const script = selectedWordInfo.audioScript;
                      const typingInterval = setInterval(() => {
                        setDisplayedScript(script.slice(0, i)); i++;
                        if (i > script.length) clearInterval(typingInterval);
                      }, 40);
                    }}
                    className={`mt-4 w-full py-3.5 md:py-4 text-white dark:text-[#323435] rounded-xl font-bold transition-opacity flex items-center justify-center gap-2 text-sm shadow-md
                      ${isMuted ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed opacity-80' : 'bg-[#75A4A7] dark:bg-[#F19C83] hover:opacity-90 dark:hover:bg-[#BA6B41]'}`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    {isMuted ? "Sonido Silenciado" : "Repetir Explicación"}
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}