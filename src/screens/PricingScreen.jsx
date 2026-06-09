import React, { useState } from 'react';
import { ChevronLeft, CheckCircle, CreditCard, Sparkles } from 'lucide-react';

export default function PricingScreen({ navigateTo }) {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <button onClick={() => navigateTo('landing')} className="flex items-center text-gray-500 dark:text-[#EAE3D9] hover:text-[#FA8C7F] dark:hover:text-[#F19C83] mb-6 md:mb-8 font-bold hover:-translate-x-1 transition-all text-sm md:text-base">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> Volver al inicio
        </button>
        
        <div className="text-center mb-8 md:mb-12">
          {/* NUEVO MENSAJE VISTOSO SOLICITADO */}
          <p className="text-sm md:text-base text-[#FA8C7F] dark:text-[#F19C83] font-black uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Suscríbete desde $2.99 y accede a todo
          </p>
          
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-[#EAE3D9] mb-3 md:mb-4 tracking-tight">Invierte en tu futuro</h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-[#EAE3D9]/70 px-2 font-medium">Desbloquea todos los niveles de lectura y mejora tu inglés hoy mismo.</p>
          
          <div className="flex justify-center mt-8">
            <div className="bg-gray-200 dark:bg-[#2F6666] p-1 rounded-xl flex space-x-1">
              <button onClick={() => setBilling('monthly')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-white dark:bg-[#323435] shadow-sm text-gray-900 dark:text-[#EAE3D9]' : 'text-gray-500 dark:text-[#EAE3D9]/60 hover:text-gray-900 dark:hover:text-white'}`}>Mensual</button>
              <button onClick={() => setBilling('annual')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center ${billing === 'annual' ? 'bg-white dark:bg-[#323435] shadow-sm text-gray-900 dark:text-[#EAE3D9]' : 'text-gray-500 dark:text-[#EAE3D9]/60 hover:text-gray-900 dark:hover:text-white'}`}>
                Anual <span className="ml-2 text-[10px] font-black uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">-20%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto mt-6 md:mt-8">
          
          {/* PLAN ESTÁNDAR */}
          <div className="bg-white dark:bg-[#2a2b2c] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-[#2F6666]/50 animate-scale-in delay-100 flex flex-col">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-[#EAE3D9] mb-1">Plan Estándar</h3>
            <p className="text-gray-500 dark:text-[#EAE3D9]/60 text-sm mb-6 font-medium">Acceso a biblioteca intermedia</p>
            <div className="mb-6">
              <span className="text-5xl font-black text-gray-900 dark:text-[#EAE3D9] tracking-tighter">${billing === 'monthly' ? '2.99' : '29.90'}</span>
              <span className="text-gray-500 dark:text-[#EAE3D9]/60 font-medium">/ {billing === 'monthly' ? 'mes' : 'año'}</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm text-gray-600 dark:text-[#EAE3D9]/80 font-medium flex-1">
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#75A4A7] dark:text-[#F19C83] mr-3 shrink-0" /> Historias nivel Básico e Intermedio</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#75A4A7] dark:text-[#F19C83] mr-3 shrink-0" /> Diccionario IA integrado</li>
            </ul>
            <button onClick={() => navigateTo('library')} className="w-full py-4 border-2 border-[#75A4A7] dark:border-[#F19C83] text-[#75A4A7] dark:text-[#F19C83] rounded-2xl font-black uppercase tracking-wider hover:bg-[#75A4A7]/10 dark:hover:bg-[#F19C83]/10 transition-all">
              Seleccionar Plan
            </button>
          </div>

          {/* PLAN PREMIUM */}
          <div className="bg-[#FA8C7F] dark:bg-[#F19C83] p-6 md:p-8 rounded-3xl shadow-xl text-white dark:text-[#323435] md:-translate-y-4 animate-scale-in delay-200 relative flex flex-col">
            <div className="absolute top-0 right-0 bg-yellow-400 dark:bg-yellow-300 text-yellow-900 text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl uppercase animate-pulse">Popular</div>
            <h3 className="text-xl md:text-2xl font-black mb-1">Plan Premium</h3>
            <p className="text-white/80 dark:text-[#323435]/80 text-sm mb-6 font-medium">Para aprendizaje acelerado y total</p>
            <div className="mb-6">
              <span className="text-5xl font-black tracking-tighter">${billing === 'monthly' ? '5.99' : '59.90'}</span>
              <span className="text-white/80 dark:text-[#323435]/80 font-medium">/ {billing === 'monthly' ? 'mes' : 'año'}</span>
            </div>
            <ul className="space-y-4 mb-8 text-sm text-white dark:text-[#323435] font-medium flex-1">
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-white dark:text-[#323435] mr-3 shrink-0" /> Biblioteca ilimitada (Todos los niveles)</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-white dark:text-[#323435] mr-3 shrink-0" /> Audios nativos y explicaciones premium</li>
            </ul>
            <button onClick={() => navigateTo('library')} className="w-full py-4 bg-white dark:bg-[#323435] text-[#FA8C7F] dark:text-[#F19C83] rounded-2xl font-black uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 shadow-sm transition-all">
              <CreditCard className="w-5 h-5" /> Pagar seguro
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}