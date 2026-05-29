import React from 'react';
import { User, BookOpen, Volume2, Award, Database } from 'lucide-react';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { mormonDatabase } from "../data/mormonData"; // Importamos los nuevos capítulos

export default function LandingPage({ navigateTo }) {

  const uploadToFirebase = async () => {
    try {
      alert("Subiendo capítulos del Libro de Mormón a Firebase. Por favor espera...");
      for (const book of mormonDatabase) {
        const { level, title, cover, description, content } = book;
        await addDoc(collection(db, "libros"), {
          level,
          title,
          cover,
          description,
          content
        });
      }
      alert("¡Éxito! Los capítulos se inyectaron a tu base de datos.");
    } catch (error) {
      console.error("Error subiendo datos:", error);
      alert("Hubo un error al subir. Revisa la consola.");
    }
  };

  return (
    <div className="bg-[#f3f4f8] min-h-screen relative overflow-hidden">
      <nav className="flex justify-between items-center px-4 md:px-8 py-3 md:py-5 bg-white shadow-sm relative z-10">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="font-bold text-xl text-violet-700 ml-4 hidden md:block">FluentSphere</span>
        </div>
        <ul className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
          <li className="text-violet-600 cursor-pointer">Home</li>
          <li className="cursor-pointer hover:text-violet-600">Courses</li>
          <li className="cursor-pointer hover:text-violet-600">Services</li>
          <li className="cursor-pointer hover:text-violet-600">Contact</li>
          <li className="cursor-pointer hover:text-violet-600">Blog</li>
        </ul>
        <div className="flex items-center gap-4">
          <button onClick={() => navigateTo('login')} className="bg-[#8b5cf6] text-white px-4 md:px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-violet-600 transition shadow-lg shadow-violet-200">
            <div className="bg-white rounded-full p-1 hidden sm:block"><User className="w-4 h-4 text-[#8b5cf6]" /></div>
            Log In
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-16 md:pb-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        <div className="absolute top-1/4 -left-16 w-32 h-64 border-[16px] border-white rounded-r-full hidden lg:block opacity-50 animate-fade-in-left delay-300"></div>
        <div className="relative z-10 animate-fade-in-left">
          <div className="flex items-center gap-2 mb-3 md:mb-4"><div className="w-1 h-4 bg-violet-600"></div><span className="uppercase text-[10px] md:text-xs font-bold text-gray-600 tracking-wider">About Us</span></div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1f2937] leading-[1.1] mb-4 md:mb-6">Best English <br /> <span className="text-[#8b5cf6]">Learning Center</span></h1>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-8 md:mb-10 max-w-md">Domina el inglés leyendo historias. Desde lo más básico y repetitivo hasta textos avanzados. Haz clic en cualquier palabra para traducir.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigateTo('pricing')} className="bg-[#8b5cf6] text-white px-8 py-3 rounded-sm font-medium hover:bg-violet-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-violet-200 hover:-translate-y-1"><div className="w-4 h-[2px] bg-white mr-2"></div> Start Reading</button>
            
            <button onClick={uploadToFirebase} className="bg-gray-800 text-white px-8 py-3 rounded-sm font-medium hover:bg-black transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1">
              <Database className="w-5 h-5" /> Inyectar a Firebase
            </button>
          </div>
        </div>
        <div className="relative animate-fade-in-right delay-100">
          <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 w-32 h-32 bg-[#8b5cf6] rounded-full z-20 animate-scale-in delay-300"></div>
          <div className="relative z-10 rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-auto sm:h-[500px] shadow-2xl"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Estudiante" className="w-full h-full object-cover"/></div>
        </div>
      </main>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-20 -mt-6 md:-mt-10 pb-16">
        <div className="grid md:grid-cols-3 shadow-2xl rounded-xl overflow-hidden bg-white animate-fade-in-up delay-200">
          <div className="p-5 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 flex gap-4 bg-white"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-violet-100 flex items-center justify-center"><BookOpen className="w-5 h-5 md:w-6 md:h-6 text-[#8b5cf6]" /></div><div><h3 className="font-bold text-gray-800 text-sm mb-1">Aprende Leyendo</h3><p className="text-[11px] md:text-xs text-gray-400">Textos categorizados.</p></div></div>
          <div className="p-5 md:p-8 bg-[#8b5cf6] text-white flex gap-4"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/40 flex items-center justify-center"><Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" /></div><div><h3 className="font-bold text-white text-sm mb-1">Audio Nativo</h3><p className="text-[11px] md:text-xs text-violet-100">Pronunciación exacta.</p></div></div>
          <div className="p-5 md:p-8 flex gap-4 bg-white"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-violet-100 flex items-center justify-center"><Award className="w-5 h-5 md:w-6 md:h-6 text-[#8b5cf6]" /></div><div><h3 className="font-bold text-gray-800 text-sm mb-1">Mejora Continua</h3><p className="text-[11px] md:text-xs text-gray-400">Sube de nivel.</p></div></div>
        </div>
      </div>
    </div>
  );
}