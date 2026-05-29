import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, BookMarked, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Importamos tu conexión a Firebase

export default function LibraryScreen({ navigateTo, openBook }) {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Esta función se ejecuta automáticamente al abrir la pantalla
  useEffect(() => {
    const fetchBooksFromFirebase = async () => {
      try {
        // Pedimos todos los documentos de la colección "libros"
        const querySnapshot = await getDocs(collection(db, "libros"));
        
        // Convertimos los datos de Firebase a un formato que React entienda
        const booksArray = querySnapshot.docs.map(doc => ({
          id: doc.id, // Firebase nos da un ID único y seguro
          ...doc.data()
        }));

        setBooks(booksArray);
        setIsLoading(false); // Apagamos la pantalla de carga
      } catch (error) {
        console.error("Error al descargar los libros:", error);
        setIsLoading(false);
      }
    };

    fetchBooksFromFirebase();
  }, []);

  // Función para re-asignar íconos según el nivel (ya que Firebase no guarda íconos)
  const getIconForLevel = (level) => {
    if (level === 'Básico') return <BookMarked className="w-5 h-5 text-blue-500" />;
    if (level === 'Intermedio') return <TrendingUp className="w-5 h-5 text-green-500" />;
    return <Sparkles className="w-5 h-5 text-orange-500" />;
  };

  // Pantalla de carga mientras trae los datos de internet
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Descargando libros de la nube...</h2>
      </div>
    );
  }

  const levels = [...new Set(books.map(book => book.level))];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm animate-fade-in-up sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-violet-700 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Mi Biblioteca en la Nube
          </h1>
          <button onClick={() => navigateTo('landing')} className="text-gray-500 hover:text-gray-700 text-xs md:text-sm bg-gray-100 px-3 py-1.5 rounded-full">Salir</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8 animate-fade-in-right">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Tu plan de estudio</h2>
          <p className="text-sm text-gray-500 mt-1">Estos libros están alojados en Firebase.</p>
        </div>
        
        {levels.map((levelName, sectionIndex) => (
          <div key={levelName} className={`mb-10 animate-fade-in-up delay-${(sectionIndex + 1) * 100}`}>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Nivel {levelName}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {books.filter(book => book.level === levelName).map((book) => (
                <div 
                  key={book.id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                  onClick={() => openBook(book)}
                >
                  <div className={`h-36 ${book.cover} border-b flex flex-col items-center justify-center p-6 text-center group relative overflow-hidden`}>
                    <div className="absolute top-3 right-3 bg-white/50 backdrop-blur rounded-full p-1.5 shadow-sm">
                      {getIconForLevel(book.level)}
                    </div>
                    <h3 className="font-bold text-xl group-hover:scale-105 transition-transform duration-300 z-10">{book.title}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px] mb-3">{book.description}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{book.level}</span>
                      <span className="text-sm font-bold text-[#8b5cf6] flex items-center gap-1 group-hover:gap-2 transition-all">Leer <ChevronLeft className="w-4 h-4 rotate-180" /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}