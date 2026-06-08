
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Sparkles, LogOut, Loader2, BookMarked, CloudUpload, Database } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// --- IMPORTAMOS TU NUEVO ARCHIVO CON LOS 18 CAPÍTULOS ---
import { libroDeMormon } from '../data/libroDeMormon';

// --- DICCIONARIO UNIVERSAL DE TÍTULOS ---
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

// --- MASCOTA LECTORA ---
const ReadingMascot = () => {
  const isJumpingRef = useRef(false);
  const svgRef = useRef(null);
  const bodyRef = useRef(null);
  const mouthRef = useRef(null);
  const pupilRefs = useRef([]);

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (isJumpingRef.current || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY; 
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 200);
      const maxOffset = 6;
      const normalizedDistance = distance / 200; 
      const offsetX = Math.cos(angle) * maxOffset * normalizedDistance;
      const offsetY = (Math.sin(angle) * maxOffset * normalizedDistance) - 3;
      pupilRefs.current.forEach(group => {
        if (group) group.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onMouseLeave = () => {
      pupilRefs.current.forEach(group => {
        if (group) group.style.transform = `translate(0px, 0px)`;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const handleMascotClick = () => {
    if (isJumpingRef.current) return;
    isJumpingRef.current = true;
    if (bodyRef.current && mouthRef.current) {
      bodyRef.current.classList.remove('animate-float-mascot');
      void bodyRef.current.offsetWidth; 
      bodyRef.current.style.animation = 'jumpMascot 0.6s ease-out';
      mouthRef.current.setAttribute('d', 'M180 235 Q 200 265 220 235');
      pupilRefs.current.forEach(group => {
        if (group) group.style.transform = `translate(0px, -8px)`;
      });
      setTimeout(() => {
        if (bodyRef.current && mouthRef.current) {
          bodyRef.current.style.animation = '';
          bodyRef.current.classList.add('animate-float-mascot');
          mouthRef.current.setAttribute('d', 'M185 240 Q 200 255 215 240');
        }
        isJumpingRef.current = false;
        pupilRefs.current.forEach(group => {
          if (group) group.style.transform = `translate(0px, 0px)`;
        });
      }, 600); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative mb-12">
      <style>{`
        @keyframes floatMascot { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float-mascot { animation: floatMascot 4s ease-in-out infinite; }
        @keyframes shadowScaleMascot { 0%, 100% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(0.8); opacity: 0.08; } }
        .animate-shadow-mascot { animation: shadowScaleMascot 4s ease-in-out infinite; transform-origin: 200px 350px; }
        @keyframes blinkMascot { 0%, 46%, 48%, 100% { transform: scaleY(1); } 47% { transform: scaleY(0.1); } }
        .animate-blink-mascot { animation: blinkMascot 5s infinite; transform-origin: 200px 190px; }
        @keyframes jumpMascot { 0%, 100% { transform: translateY(0) scale(1); } 30% { transform: translateY(10px) scale(1.05, 0.95); } 60% { transform: translateY(-40px) scale(0.95, 1.05); } 80% { transform: translateY(5px) scale(1.02, 0.98); } }
        .pupil-group { transition: transform 0.1s ease-out; }
        .mascot-mouth { transition: d 0.3s ease; }
        
        /* OCULTAR BARRA DE SCROLL EN EL CARRUSEL */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-white dark:bg-[#323435] text-gray-800 dark:text-[#EAE3D9] px-5 py-2.5 rounded-2xl shadow-lg border border-gray-100 dark:border-[#2F6666] mb-[-20px] z-20 text-sm font-black animate-bounce text-center">
        Elige un nivel para estudiar ✨
      </div>
      <div className="relative w-full max-w-[300px] aspect-square cursor-pointer select-none" style={{ WebkitTapHighlightColor: 'transparent' }} onClick={handleMascotClick}>
         <svg ref={svgRef} viewBox="0 0 400 400" width="100%" height="100%">
             <ellipse className="animate-shadow-mascot fill-gray-900 dark:fill-black opacity-15 dark:opacity-40" cx="200" cy="350" rx="90" ry="12" />
             <g ref={bodyRef} className="animate-float-mascot">
                 <g id="feet">
                     <ellipse className="fill-[#75A4A7] dark:fill-[#2F6666]" cx="150" cy="315" rx="25" ry="15" />
                     <ellipse className="fill-[#75A4A7] dark:fill-[#2F6666]" cx="250" cy="315" rx="25" ry="15" />
                 </g>
                 <path className="fill-[#75A4A7] dark:fill-[#2F6666]" d="M100 200 C 100 100, 300 100, 300 200 C 300 290, 260 320, 200 320 C 140 320, 100 290, 100 200 Z" />
                 <path className="fill-[#2F6666] dark:fill-[#1b3d3d] opacity-30 dark:opacity-50" d="M110 200 C 110 120, 290 120, 290 200 C 290 280, 250 305, 200 305 C 150 305, 110 280, 110 200 Z" />
                 <g className="animate-blink-mascot">
                     <circle className="fill-white dark:fill-[#EAE3D9]" cx="135" cy="190" r="22" />
                     <g className="pupil-group" ref={el => pupilRefs.current[0] = el}>
                         <circle className="fill-[#1E293B] dark:fill-[#323435]" cx="135" cy="196" r="10" />
                         <circle className="fill-white dark:fill-[#EAE3D9]" cx="132" cy="192" r="3.5" />
                     </g>
                     <circle className="fill-white dark:fill-[#EAE3D9]" cx="200" cy="190" r="22" />
                     <g className="pupil-group" ref={el => pupilRefs.current[1] = el}>
                         <circle className="fill-[#1E293B] dark:fill-[#323435]" cx="200" cy="196" r="10" />
                         <circle className="fill-white dark:fill-[#EAE3D9]" cx="197" cy="192" r="3.5" />
                     </g>
                     <circle className="fill-white dark:fill-[#EAE3D9]" cx="265" cy="190" r="22" />
                     <g className="pupil-group" ref={el => pupilRefs.current[2] = el}>
                         <circle className="fill-[#1E293B] dark:fill-[#323435]" cx="265" cy="196" r="10" />
                         <circle className="fill-white dark:fill-[#EAE3D9]" cx="262" cy="192" r="3.5" />
                     </g>
                 </g>
                 <path ref={mouthRef} className="mascot-mouth stroke-[#1E293B] dark:stroke-[#EAE3D9]" d="M185 240 Q 200 255 215 240" fill="none" strokeWidth="5" strokeLinecap="round" />
                 <ellipse className="fill-[#FA8C7F] dark:fill-[#F19C83] opacity-80" cx="110" cy="220" rx="12" ry="6" />
                 <ellipse className="fill-[#FA8C7F] dark:fill-[#F19C83] opacity-80" cx="290" cy="220" rx="12" ry="6" />
                 <g id="reading-accessories">
                     <path className="stroke-[#75A4A7] dark:stroke-[#2F6666]" d="M 125 240 Q 150 275 165 275" fill="none" strokeWidth="16" strokeLinecap="round" />
                     <path className="stroke-[#75A4A7] dark:stroke-[#2F6666]" d="M 275 240 Q 250 275 235 275" fill="none" strokeWidth="16" strokeLinecap="round" />
                     <rect className="fill-[#1E293B] dark:fill-[#1c1d1f]" x="165" y="240" width="70" height="85" rx="8" />
                     <g transform="translate(200, 246)">
                         <path className="stroke-[#75A4A7] dark:stroke-[#F19C83]" d="M -2 -3 L -2 4 M -2 1 Q 3 1, 3 -1 Q 3 -3, -2 -3" fill="none" strokeWidth="1.5" strokeLinecap="round" />
                     </g>
                     <rect className="fill-white dark:fill-[#EAE3D9]" x="170" y="252" width="60" height="68" rx="4" />
                     <line className="stroke-gray-300 dark:stroke-[#75A4A7]" x1="178" y1="267" x2="210" y2="267" strokeWidth="4" strokeLinecap="round" />
                     <line className="stroke-gray-300 dark:stroke-[#75A4A7]" x1="178" y1="282" x2="222" y2="282" strokeWidth="4" strokeLinecap="round" />
                     <line className="stroke-gray-300 dark:stroke-[#75A4A7]" x1="178" y1="297" x2="215" y2="297" strokeWidth="4" strokeLinecap="round" />
                     <line className="stroke-gray-300 dark:stroke-[#75A4A7]" x1="178" y1="312" x2="195" y2="312" strokeWidth="4" strokeLinecap="round" />
                     <circle className="fill-[#75A4A7] dark:fill-[#2F6666]" cx="165" cy="275" r="10" />
                     <circle className="fill-[#75A4A7] dark:fill-[#2F6666]" cx="235" cy="275" r="10" />
                 </g>
             </g>
         </svg>
      </div>
    </div>
  );
};

export default function LibraryScreen({ navigateTo }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState({});
  const [isInjecting, setIsInjecting] = useState(false); 

  // --- LÓGICA DE CARRUSEL ---
  const scrollCarousel = (direction, carouselId) => {
    const container = document.getElementById(carouselId);
    if (container) {
      // Desplaza el ancho aproximado de una tarjeta para que sea fluido
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 340;
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleInjectToFirebase = async () => {
    if (!window.confirm(`¿Quieres inyectar los ${libroDeMormon.chapters.length} capítulos a Firebase?`)) return;
    
    setIsInjecting(true);
    let count = 0;
    try {
      for (const cap of libroDeMormon.chapters) {
        const docRef = doc(db, "libros", cap.id);
        await setDoc(docRef, {
          id: cap.id,
          title: cap.chapterName,
          level: libroDeMormon.level,
          content: cap.content
        });
        count++;
      }
      alert(`¡Éxito! Se subieron ${count} capítulos a Firebase. La página se recargará.`);
      window.location.reload(); 
    } catch (error) {
      console.error("Error inyectando datos:", error);
      alert("ERROR: Firebase bloqueó la subida. Ve a la consola de Firebase > Firestore Database > Reglas (Rules) y asegúrate de que diga 'allow read, write: if true;'");
    } finally {
      setIsInjecting(false);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "libros"));
        const booksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const localMormonChapters = libroDeMormon.chapters.map(cap => ({
          id: cap.id,
          title: cap.chapterName,
          level: libroDeMormon.level,
          content: cap.content
        }));

        const firebaseIds = new Set(booksList.map(b => b.id));
        const missingLocals = localMormonChapters.filter(c => !firebaseIds.has(c.id));

        setBooks([...booksList, ...missingLocals]);

      } catch (error) {
        console.error("Error descargando libros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const toggleBook = (bookName) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookName]: !prev[bookName]
    }));
  };

  const sections = [
    { title: "Nivel Básico", key: "básico", color: "text-[#FA8C7F] dark:text-[#F19C83]" },
    { title: "Nivel Intermedio", key: "intermedio", color: "text-[#75A4A7] dark:text-[#75A4A7]" },
    { title: "Nivel Avanzado", key: "avanzado", color: "text-[#FA8C7F] dark:text-[#BA6B41]" }
  ];

  return (
    <div className="min-h-screen bg-transparent py-8 animate-fade-in-up w-full overflow-hidden">
      
      {/* CABECERA (Mantenemos los márgenes solo aquí para que el carrusel ocupe toda la pantalla a los lados) */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-[#2F6666] pb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Logo Diliooo */}
            <div className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => navigateTo('landing')}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FA8C7F] dark:bg-[#F19C83] rounded-xl flex items-center justify-center transform rotate-3 shadow-md">
                <span className="text-white dark:text-[#323435] font-black text-2xl sm:text-3xl transform -rotate-3">d</span>
              </div>
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-gray-900 dark:text-[#EAE3D9] hidden sm:block">
                dili<span className="text-[#75A4A7] dark:text-[#F19C83]">ooo</span>
              </span>
            </div>

            {/* Separador vertical y Título "Biblioteca" */}
            <div className="pl-3 sm:pl-4 border-l-2 border-gray-200 dark:border-[#2F6666]">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#EAE3D9] tracking-tight">Biblioteca</h1>
              <p className="text-xs text-[#75A4A7] dark:text-[#F19C83] font-bold uppercase tracking-widest mt-0.5 hidden sm:block">diliooo cloud</p>
            </div>
            
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo('admin')} 
              className="p-3 bg-white dark:bg-[#2F6666] hover:bg-gray-50 dark:hover:bg-[#B55B49] text-gray-500 dark:text-[#EAE3D9] rounded-2xl border border-gray-200 dark:border-[#2F6666] transition-all shadow-sm flex items-center gap-2 text-sm font-bold"
              title="Importar Libros API"
            >
              <Database className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
            </button>

            <button 
              onClick={handleInjectToFirebase} 
              disabled={isInjecting}
              className={`p-3 bg-white dark:bg-[#2F6666] text-[#75A4A7] dark:text-[#F19C83] rounded-2xl border border-gray-200 dark:border-[#2F6666] transition-all shadow-sm flex items-center gap-2 text-sm font-bold ${isInjecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-[#B55B49]'}`}
              title="Inyectar a Firebase"
            >
              {isInjecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              <span className="hidden sm:inline">{isInjecting ? 'Subiendo...' : 'Subir Local'}</span>
            </button>

            <button 
              onClick={() => navigateTo('landing')} 
              className="p-3 bg-white dark:bg-[#2F6666] hover:bg-gray-50 dark:hover:bg-[#B55B49] text-gray-500 dark:text-[#EAE3D9] rounded-2xl border border-gray-200 dark:border-[#2F6666] transition-all shadow-sm flex items-center gap-2 text-sm font-bold"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <ReadingMascot />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 w-full">
          <Loader2 className="w-12 h-12 text-[#FA8C7F] dark:text-[#F19C83] animate-spin mb-4" />
          <p className="text-[#75A4A7] dark:text-[#EAE3D9] font-bold tracking-wide text-sm uppercase animate-pulse">Sincronizando estantería...</p>
        </div>
      ) : (
        <div className="space-y-14 mt-4">
          {sections.map((section) => {
            const sectionBooksRaw = books.filter(book => book.level && book.level.toLowerCase().includes(section.key.toLowerCase()));
            
            const groupedBooks = sectionBooksRaw.reduce((acc, book) => {
              const parts = book.title.split(' - ');
              const rawBookName = parts.length > 1 ? parts[0].trim() : book.title;
              const rawChapterName = parts.length > 1 ? parts[1].trim() : 'Lectura Única';

              let bookName = translateTitle(rawBookName);
              let chapterName = translateTitle(rawChapterName);

              const mormonBooks = ["1 Nefi", "2 Nefi", "3 Nefi", "4 Nefi", "Jacob", "Enós", "Jarom", "Omni", "Palabras de Mormón", "Mosíah", "Alma", "Helamán", "Mormón", "Éter", "Moroni"];
              if (mormonBooks.includes(bookName)) {
                chapterName = `${bookName} - ${chapterName}`; 
                bookName = "El Libro de Mormón"; 
              }

              if (!acc[bookName]) {
                acc[bookName] = {
                  bookName,
                  description: bookName === "El Libro de Mormón" 
                    ? "Explora todos los relatos y enseñanzas de este volumen de escritura sagrada. Toca para desplegar los capítulos." 
                    : `Explora todos los relatos y enseñanzas de "${bookName}". Toca para desplegar las lecturas.`,
                  chapters: []
                };
              }
              acc[bookName].chapters.push({ ...book, chapterName });
              return acc;
            }, {});

            Object.values(groupedBooks).forEach(group => {
              group.chapters.sort((a, b) => {
                const numA = parseInt(a.title.match(/\d+$/)?.[0] || a.chapterName.match(/\d+/g)?.pop() || 0);
                const numB = parseInt(b.title.match(/\d+$/)?.[0] || b.chapterName.match(/\d+/g)?.pop() || 0);
                return numA - numB;
              });
            });

            const groupedArray = Object.values(groupedBooks);
            const carouselId = `carousel-${section.key}`;

            return (
              <div key={section.title} className="relative group/carousel w-full">
                {/* Título de la Sección */}
                <div className="max-w-6xl mx-auto px-4 md:px-8 mb-6 flex items-center justify-between">
                   <h2 className={`text-2xl font-black uppercase tracking-wider flex items-center gap-2 ${section.color}`}>
                     <Sparkles className="w-6 h-6" /> {section.title}
                   </h2>
                   
                   {/* Flechas de Navegación Desktop */}
                   {groupedArray.length > 0 && (
                     <div className="hidden md:flex items-center gap-2">
                       <button onClick={() => scrollCarousel('left', carouselId)} className="p-2 rounded-full bg-white dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2F6666] transition-colors shadow-sm">
                         <ChevronLeft className="w-5 h-5" />
                       </button>
                       <button onClick={() => scrollCarousel('right', carouselId)} className="p-2 rounded-full bg-white dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2F6666] transition-colors shadow-sm">
                         <ChevronRight className="w-5 h-5" />
                       </button>
                     </div>
                   )}
                </div>

                {groupedArray.length === 0 ? (
                  <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="bg-white dark:bg-[#2F6666]/30 border border-gray-100 dark:border-[#2F6666] rounded-3xl p-8 text-center shadow-sm">
                      <p className="text-gray-400 dark:text-[#EAE3D9]/50 font-medium">Nuevos libros de este nivel llegarán pronto.</p>
                    </div>
                  </div>
                ) : (
                  /* CARRUSEL CONTENEDOR */
                  <div 
                    id={carouselId}
                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 px-4 md:px-8 items-start"
                  >
                    {/* Espaciador invisible para mantener el margen izquierdo dentro del scroll */}
                    <div className="hidden md:block shrink-0 w-[calc((100vw-72rem)/2)] max-w-0"></div>

                    {groupedArray.map((group) => {
                      const isExpanded = expandedBooks[group.bookName];

                      return (
                        <div 
                          key={group.bookName}
                          /* Ajustamos el ancho para móvil (85vw) y escritorio (340px fijo), y evitamos que se encoja (shrink-0) */
                          className="shrink-0 snap-start w-[85vw] sm:w-[320px] md:w-[340px] bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-[#323435] dark:to-[#2a2b2c] rounded-3xl border border-gray-200 dark:border-[#2F6666] shadow-md transition-all duration-300 flex flex-col relative overflow-hidden"
                        >
                          <div 
                            onClick={() => toggleBook(group.bookName)}
                            className="p-6 cursor-pointer group"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <span className="px-3 py-1 bg-[#FA8C7F]/10 dark:bg-[#B55B49]/40 text-[#FA8C7F] dark:text-[#F19C83] rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                                {group.chapters.length} Lecturas
                              </span>
                              
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-100 dark:border-[#2F6666] 
                                ${isExpanded ? 'bg-[#FA8C7F] dark:bg-[#F19C83] rotate-90' : 'bg-gray-50 dark:bg-[#323435]'}`}
                              >
                                <ChevronRight className={`w-4 h-4 transition-colors ${isExpanded ? 'text-white dark:text-[#323435]' : 'text-gray-400 dark:text-[#EAE3D9]'}`} />
                              </div>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 dark:text-[#EAE3D9] group-hover:text-[#FA8C7F] dark:group-hover:text-[#F19C83] transition-colors mb-2 tracking-tight leading-tight">
                              {group.bookName}
                            </h3>
                            
                            <p className="text-gray-500 dark:text-[#EAE3D9]/70 text-sm leading-relaxed font-medium line-clamp-2">
                              {group.description}
                            </p>
                          </div>

                          {/* EL ACORDEÓN SE DESPLIEGA SIN ROMPER EL ANCHO */}
                          {isExpanded && (
                            <div className="bg-gray-50 dark:bg-[#2F6666]/30 border-t border-gray-100 dark:border-[#2F6666] animate-fade-in-up max-h-[300px] overflow-y-auto no-scrollbar">
                              {group.chapters.map((chapter, idx) => (
                                <div 
                                  key={chapter.id}
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigateTo('reader', chapter); 
                                  }}
                                  className="px-6 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-[#2F6666]/50 hover:bg-white dark:hover:bg-[#2F6666]/80 transition-colors cursor-pointer last:border-0 group/chapter"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#75A4A7] dark:text-[#F19C83] font-black text-sm opacity-60">
                                      {(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="font-bold text-gray-700 dark:text-[#EAE3D9] text-sm group-hover/chapter:text-[#FA8C7F] dark:group-hover/chapter:text-white transition-colors line-clamp-1">
                                      {chapter.chapterName}
                                    </span>
                                  </div>
                                  <BookOpen className="w-4 h-4 shrink-0 text-gray-300 dark:text-[#2F6666] group-hover/chapter:text-[#FA8C7F] dark:group-hover/chapter:text-[#F19C83] transition-colors" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Espaciador final */}
                    <div className="shrink-0 w-4 md:w-8"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}