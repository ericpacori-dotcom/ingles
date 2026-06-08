// src/screens/BookIndexScreen.jsx
import React from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';

export default function BookIndexScreen({ navigateTo, book }) {
  if (!book) {
    navigateTo('library');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 px-4 md:px-8 py-8 animate-fade-in-up">
      
      {/* CABECERA */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-[#2F6666] pb-6 max-w-3xl mx-auto">
        <button onClick={() => navigateTo('library')} className="p-2 text-gray-500 dark:text-[#EAE3D9] hover:bg-gray-200 dark:hover:bg-[#2F6666] rounded-full transition-colors shadow-sm bg-white dark:bg-[#2F6666]/50">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-[#EAE3D9]">{book.title}</h1>
          <p className="text-sm text-[#75A4A7] dark:text-[#F19C83] font-bold uppercase tracking-widest mt-1">
            {book.chapters.length} Capítulos disponibles
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* DESCRIPCIÓN DEL LIBRO */}
        <div className="bg-white dark:bg-[#2F6666]/20 border border-gray-200 dark:border-[#2F6666] rounded-3xl p-6 mb-8 shadow-sm">
          <p className="text-gray-600 dark:text-[#EAE3D9] font-medium leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* LISTA DE CAPÍTULOS */}
        <div className="bg-white dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] rounded-3xl overflow-hidden shadow-sm">
          {book.chapters.map((chapter, idx) => (
            <div 
              key={chapter.id}
              onClick={() => navigateTo('reader', { 
                id: chapter.id,
                title: chapter.chapterName, // Enviamos el nombre del capítulo al lector
                content: chapter.content    // Enviamos el texto del capítulo al lector
              })}
              className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#2F6666] hover:bg-gray-50 dark:hover:bg-[#2F6666]/50 cursor-pointer transition-colors group last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#75A4A7]/10 dark:bg-[#2F6666] flex items-center justify-center text-[#75A4A7] dark:text-[#F19C83] font-black group-hover:bg-[#FA8C7F] group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <span className="font-bold text-gray-800 dark:text-[#EAE3D9] group-hover:text-[#FA8C7F] dark:group-hover:text-white transition-colors">
                  {chapter.chapterName}
                </span>
              </div>
              <BookOpen className="w-5 h-5 text-gray-300 dark:text-gray-500 group-hover:text-[#FA8C7F] dark:group-hover:text-[#F19C83] transition-colors" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}