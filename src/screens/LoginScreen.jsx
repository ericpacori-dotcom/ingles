import React from 'react';
import { X } from 'lucide-react';

export default function LoginScreen({ navigateTo }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Bienvenido de nuevo</h2>
          <button onClick={() => navigateTo('landing')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigateTo('library'); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-shadow" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-[#8b5cf6] text-white py-3 rounded-lg font-bold hover:bg-violet-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 mt-4">
            Iniciar Sesión
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes una cuenta? <span className="text-violet-600 font-bold cursor-pointer" onClick={() => navigateTo('pricing')}>Suscríbete aquí</span>
        </p>
      </div>
    </div>
  );
}