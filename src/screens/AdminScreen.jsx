import React, { useState } from 'react';
import { ChevronLeft, CloudUpload, Loader2, Database, FileText } from 'lucide-react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminScreen({ navigateTo }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [level, setLevel] = useState("Intermedio");
  const [progressMessage, setProgressMessage] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!customTitle.trim()) {
      alert("Por favor, escribe un título para el libro antes de procesar el archivo.");
      return;
    }

    setFileName(file.name);
    setIsProcessing(false);
    setProgressMessage("Archivo cargado. Presiona 'Procesar e Inyectar' para comenzar.");
  };

  const processAndUpload = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setProgressMessage("Leyendo archivo de texto...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = event.target.result;

        // 1. LIMPIEZA DE CABECERAS Y LICENCIAS DE GUTENBERG
        setProgressMessage("Limpiando cabeceras y licencias de Gutenberg...");
        const startMatch = text.match(/\*\*\* START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/i);
        const endMatch = text.match(/\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/i);
        
        if (startMatch) {
          text = text.slice(startMatch.index + startMatch[0].length);
        }
        if (endMatch) {
          const endMatchCleaned = text.match(/\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/i);
          if (endMatchCleaned) {
            text = text.slice(0, endMatchCleaned.index);
          }
        }

        // 2. PROCESAMIENTO ESTRUCTURAL DE PÁRRAFOS
        setProgressMessage("Estructurando párrafos y arreglando saltos de línea...");
        const rawParagraphs = text.split(/\r?\n\s*\r?\n/);
        
        const cleanParagraphs = rawParagraphs
          .map(p => p.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim())
          .filter(p => p.length > 15);

        // 3. DETECTOR INTELIGENTE DE CAPÍTULOS EXPLÍCITOS
        // Buscamos si algún párrafo corto califica como un encabezado real de capítulo
        const chapterHeaderRegex = /^(?:CHAPTER|Chapter|CAPÍTULO|Capítulo)\s+([0-9a-zA-ZIVXLCDM]+|[a-zA-Z]+)/i;
        const hasExplicitChapters = cleanParagraphs.some(p => chapterHeaderRegex.test(p) && p.length < 80);

        if (hasExplicitChapters) {
          // --- RUTA A: EL LIBRO SÍ TIENE CAPÍTULOS ---
          let chaptersList = [];
          let currentChapterParagraphs = [];
          let currentChapterTitle = "Introduction"; // Por si hay texto antes del Capítulo 1

          for (const p of cleanParagraphs) {
            if (chapterHeaderRegex.test(p) && p.length < 80) {
              // Si ya veníamos acumulando texto de un capítulo previo, lo guardamos antes de cambiar
              if (currentChapterParagraphs.length > 0) {
                chaptersList.push({
                  title: currentChapterTitle,
                  paragraphs: currentChapterParagraphs
                });
              }
              currentChapterTitle = p; // Actualizamos al nuevo título de capítulo encontrado
              currentChapterParagraphs = [];
            } else {
              currentChapterParagraphs.push(p);
            }
          }
          // Guardamos el último capítulo del archivo
          if (currentChapterParagraphs.length > 0) {
            chaptersList.push({
              title: currentChapterTitle,
              paragraphs: currentChapterParagraphs
            });
          }

          const totalParts = chaptersList.length;
          setProgressMessage(`¡Estructura detectada! Subiendo ${totalParts} capítulos reales a Firebase...`);

          for (let i = 0; i < chaptersList.length; i++) {
            const ch = chaptersList[i];
            const partNumber = i + 1;
            const chunkContent = ch.paragraphs.join('\n\n');
            
            // Reemplazamos espacios del título para crear un ID seguro en Firestore
            const bookId = `gutenberg_${customTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ch_${partNumber}`;
            
            setProgressMessage(`Subiendo: ${ch.title} (${partNumber} de ${totalParts})...`);
            
            await setDoc(doc(db, "libros", bookId), {
              id: bookId,
              // Al unir el título comercial con el nombre real detectado, el carrusel lo agrupará perfecto
              title: `${customTitle.trim()} - ${ch.title}`,
              level: level,
              content: chunkContent
            });
          }

        } else {
          // --- RUTA B: RESPALDO SI EL LIBRO NO TIENE CAPÍTULOS ---
          // Cortamos de forma matemática en bloques estándar de 35 párrafos
          const chunkSize = 35;
          const totalParts = Math.ceil(cleanParagraphs.length / chunkSize);
          setProgressMessage(`Sin capítulos explícitos. Dividiendo en ${totalParts} partes automáticas...`);
          
          for (let i = 0; i < cleanParagraphs.length; i += chunkSize) {
            const partNumber = (i / chunkSize) + 1;
            const chunkContent = cleanParagraphs.slice(i, i + chunkSize).join('\n\n');
            const bookId = `gutenberg_${customTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_part_${partNumber}`;
            
            setProgressMessage(`Subiendo parte ${partNumber} de ${totalParts}...`);
            
            await setDoc(doc(db, "libros", bookId), {
              id: bookId,
              title: `${customTitle.trim()} - Part ${partNumber}`,
              level: level,
              content: chunkContent
            });
          }
        }

        setProgressMessage("");
        alert(`¡Espectacular! "${customTitle}" se procesó con éxito y ya está disponible en tu biblioteca.`);
        setFileName("");
        setCustomTitle("");
        navigateTo('library');

      } catch (err) {
        console.error(err);
        alert("Error al procesar el archivo: " + err.message);
      } finally {
        setIsProcessing(false);
      }
    };

    const fileInput = document.getElementById("gutenberg-file-input");
    if (fileInput && fileInput.files[0]) {
      reader.readAsText(fileInput.files[0]);
    } else {
      setIsProcessing(false);
      alert("No se pudo encontrar el archivo seleccionado.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 px-4 md:px-8 py-8 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-xl bg-white dark:bg-[#2a2b2c] border border-gray-200 dark:border-[#2F6666]/50 rounded-[32px] p-6 md:p-8 shadow-xl relative animate-fade-in-up">
        
        <button 
          onClick={() => navigateTo('library')} 
          className="absolute top-6 left-6 p-2.5 bg-gray-50 dark:bg-[#2F6666]/50 text-gray-500 dark:text-[#EAE3D9] hover:bg-gray-100 dark:hover:bg-[#B55B49] rounded-full transition-all border border-gray-100 dark:border-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center mt-8 mb-8">
          <Database className="w-14 h-14 mx-auto text-[#FA8C7F] dark:text-[#F19C83] mb-3 animate-pulse" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Procesador Inteligente TXT</h2>
          <p className="text-xs text-[#75A4A7] dark:text-[#F19C83] font-bold uppercase tracking-widest mt-1">Project Gutenberg Parser</p>
        </div>

        <div className="space-y-5">
          {/* CAMPO: TÍTULO DEL LIBRO */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Título Comercial del Libro</label>
            <input 
              type="text" 
              placeholder="Ej: Sherlock Holmes Adventures"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-gray-50 dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FA8C7F] transition-all"
            />
          </div>

          {/* CAMPO: SELECCIÓN DE NIVEL */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Nivel Pedagógico de Lectura</label>
            <div className="grid grid-cols-3 gap-3">
              {["Básico", "Intermedio", "Avanzado"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  disabled={isProcessing}
                  className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all
                    ${level === lvl 
                      ? 'bg-[#FA8C7F] text-white border-transparent shadow-md' 
                      : 'bg-gray-50 dark:bg-[#323435] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#2F6666] hover:bg-gray-100'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* ÁREA DE SOLTAR / SELECCIONAR ARCHIVO */}
          <div className="pt-2">
            <label className={`w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-colors cursor-pointer
              ${fileName 
                ? 'border-[#75A4A7] bg-[#75A4A7]/5' 
                : 'border-gray-300 dark:border-[#2F6666] bg-gray-50 dark:bg-[#323435] hover:bg-gray-100/70'}`}
            >
              <FileText className={`w-8 h-8 mb-2 ${fileName ? 'text-[#75A4A7]' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {fileName ? fileName : "Haga clic para seleccionar el archivo .txt"}
              </span>
              <span className="text-[10px] text-gray-400 mt-1">Formatos soportados: Plain Text (.txt)</span>
              <input 
                id="gutenberg-file-input"
                type="file" 
                accept=".txt" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isProcessing} 
              />
            </label>
          </div>

          {/* MENSAJES DE PROGRESO */}
          {progressMessage && (
            <div className="bg-amber-50 dark:bg-[#2F6666]/20 border border-amber-200/40 dark:border-transparent rounded-2xl p-4 text-center text-xs font-medium text-amber-700 dark:text-[#F19C83] animate-pulse">
              {progressMessage}
            </div>
          )}

          {/* BOTÓN DE ACCIÓN PRINCIPAL */}
          {fileName && !isProcessing && (
            <button
              onClick={() => processAndUpload(document.getElementById("gutenberg-file-input").files[0])}
              className="w-full bg-[#75A4A7] dark:bg-[#F19C83] text-white dark:text-[#323435] font-black uppercase tracking-wider py-4 rounded-2xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <CloudUpload className="w-4 h-4" /> Procesar e Inyectar a Firebase
            </button>
          )}

          {isProcessing && (
            <div className="w-full bg-gray-100 dark:bg-[#323435] text-gray-400 py-4 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 border border-transparent select-none">
              <Loader2 className="w-4 h-4 animate-spin text-[#FA8C7F]" /> Ejecutando Algoritmo...
            </div>
          )}

        </div>
      </div>
    </div>
  );
}