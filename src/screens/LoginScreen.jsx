import React from 'react';
import { ChevronLeft, KeyRound, Mail, Sparkles } from 'lucide-react';

export default function LoginScreen({ navigateTo }) {
  
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigateTo('library'); // Simulación funcional existente
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 animate-fade-in-up">
      
      {/* CONTENEDOR FLOTANTE TIPO MODAL DILIOOO (Perfecto para Celulares) */}
      <div className="w-full max-w-[385px] h-auto bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-gray-100 p-6 md:p-8 flex flex-col relative overflow-hidden">
        
        {/* Línea decorativa superior de marca */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-rose-400 to-teal-400"></div>

        {/* Botón de Regresar */}
        <button 
          onClick={() => navigateTo('landing')} 
          className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* LOGO DE MARCA EN EL LOGIN */}
        <div className="flex flex-col items-center mt-6 mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-rose-400 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-100 mb-3 transform rotate-3">
            <span className="text-white font-black text-3xl transform -rotate-3">d</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bienvenido a diliooo</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Inicia sesión para continuar</p>
        </div>

        {/* FORMULARIO ALTAMENTE ACCESIBLE */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 flex-1 flex flex-col justify-center">
          
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="tu@correo.com" 
                defaultValue="estudiante@diliooo.com" // Preservado para testing rápido
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Contraseña</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                placeholder="••••••••" 
                defaultValue="123456" // Preservado para testing rápido
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-sm uppercase tracking-wider pt-4 mt-8"
          >
            <Sparkles className="w-4 h-4 text-rose-300" /> Ingresar con Éxito
          </button>
        </form>

        {/* Footer amigable */}
        <p className="text-center text-xs text-gray-400 font-medium mt-8">
          ¿No tienes una cuenta? <span className="text-violet-600 font-bold hover:underline cursor-pointer">Regístrate</span>
        </p>
      </div>
    </div>
  );
}