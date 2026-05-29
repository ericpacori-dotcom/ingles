import React, { useState } from 'react';
import { ChevronLeft, CheckCircle, CreditCard } from 'lucide-react';

export default function PricingScreen({ navigateTo }) {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <button onClick={() => navigateTo('landing')} className="flex items-center text-gray-500 hover:text-violet-600 mb-6 md:mb-8 font-medium hover:-translate-x-1 transition-transform text-sm md:text-base">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> Volver al inicio
        </button>
        
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Invierte en tu futuro</h2>
          <p className="text-sm md:text-base text-gray-500 px-2">Desbloquea todos los niveles de lectura y mejora tu inglés.</p>
          <div className="flex justify-center mt-8">
            <div className="bg-gray-200 p-1 rounded-lg flex space-x-1">
              <button onClick={() => setBilling('monthly')} className={`px-6 py-2 rounded-md text-sm font-medium transition ${billing === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Mensual</button>
              <button onClick={() => setBilling('annual')} className={`px-6 py-2 rounded-md text-sm font-medium transition ${billing === 'annual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Anual <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-20%</span></button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto mt-6 md:mt-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-scale-in delay-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Plan Estándar</h3>
            <p className="text-gray-500 text-sm mb-6">Acceso a biblioteca básica</p>
            <div className="mb-6"><span className="text-4xl font-extrabold text-gray-900">${billing === 'monthly' ? '9' : '86'}</span><span className="text-gray-500">/ {billing === 'monthly' ? 'mes' : 'año'}</span></div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-violet-500 mr-2" /> Historias nivel Básico e Intermedio</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-violet-500 mr-2" /> Diccionario integrado</li>
            </ul>
            <button onClick={() => navigateTo('library')} className="w-full py-3 border-2 border-[#8b5cf6] text-[#8b5cf6] rounded-lg font-bold hover:bg-violet-50 transition-all">Seleccionar Plan</button>
          </div>

          <div className="bg-[#8b5cf6] p-6 md:p-8 rounded-2xl shadow-xl text-white md:-translate-y-4 animate-scale-in delay-200">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase animate-pulse">Popular</div>
            <h3 className="text-lg md:text-xl font-bold mb-1">Plan Premium</h3>
            <p className="text-violet-200 text-sm mb-6">Para aprendizaje acelerado</p>
            <div className="mb-6"><span className="text-4xl font-extrabold">${billing === 'monthly' ? '19' : '182'}</span><span className="text-violet-200">/ {billing === 'monthly' ? 'mes' : 'año'}</span></div>
            <ul className="space-y-3 mb-8 text-sm text-white">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2" /> Biblioteca ilimitada</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 text-white mr-2" /> Audios nativos premium</li>
            </ul>
            <button onClick={() => navigateTo('library')} className="w-full py-3 bg-white text-[#8b5cf6] rounded-lg font-bold hover:bg-gray-100 flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Pagar seguro</button>
          </div>
        </div>
      </div>
    </div>
  );
}