import React, { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

export default function LandingPage({ navigateTo }) {
  // --- REFERENCIAS PARA LA MASCOTA ANIMADA ---
  const isJumpingRef = useRef(false);
  const svgRef = useRef(null);
  const bodyRef = useRef(null);
  const mouthRef = useRef(null);
  const pupilRefs = useRef([]);

  // --- LÓGICA DE MOVIMIENTO DE OJOS (Sigue el cursor/dedo) ---
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
      const offsetY = Math.sin(angle) * maxOffset * normalizedDistance;

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

  // --- LÓGICA DEL SALTO AL HACER CLIC ---
  const handleMascotClick = () => {
    if (isJumpingRef.current) return;
    isJumpingRef.current = true;

    if (bodyRef.current && mouthRef.current) {
      bodyRef.current.classList.remove('animate-float-mascot');
      void bodyRef.current.offsetWidth; // Forzar reinicio de animación
      bodyRef.current.style.animation = 'jumpMascot 0.6s ease-out';
      
      mouthRef.current.setAttribute('d', 'M180 235 Q 200 265 220 235');

      pupilRefs.current.forEach(group => {
        if (group) group.style.transform = `translate(0px, -5px)`;
      });

      setTimeout(() => {
        if (bodyRef.current && mouthRef.current) {
          bodyRef.current.style.animation = '';
          bodyRef.current.classList.add('animate-float-mascot');
          mouthRef.current.setAttribute('d', 'M185 240 Q 200 255 215 240');
        }
        isJumpingRef.current = false;
      }, 600);
    }
  };

  return (
    <div className="min-h-screen relative font-sans overflow-hidden">
      
      {/* ESTILOS CSS INYECTADOS PARA LA MASCOTA */}
      <style>{`
        @keyframes floatMascot {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        .animate-float-mascot {
            animation: floatMascot 4s ease-in-out infinite;
        }
        @keyframes shadowScaleMascot {
            0%, 100% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(0.8); opacity: 0.08; }
        }
        .animate-shadow-mascot {
            animation: shadowScaleMascot 4s ease-in-out infinite;
            transform-origin: 200px 350px;
        }
        @keyframes blinkMascot {
            0%, 46%, 48%, 100% { transform: scaleY(1); }
            47% { transform: scaleY(0.1); }
        }
        .animate-blink-mascot {
            animation: blinkMascot 5s infinite;
            transform-origin: 200px 190px;
        }
        @keyframes jumpMascot {
            0%, 100% { transform: translateY(0) scale(1); }
            30% { transform: translateY(10px) scale(1.05, 0.95); }
            60% { transform: translateY(-40px) scale(0.95, 1.05); }
            80% { transform: translateY(5px) scale(1.02, 0.98); }
        }
        .pupil-group {
            transition: transform 0.1s ease-out;
        }
        .mascot-mouth {
            transition: d 0.3s ease;
        }
      `}</style>

      {/* --- NAVEGACIÓN --- */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-6 relative z-10">
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => navigateTo('home')}>
          <div className="w-10 h-10 bg-[#FA8C7F] dark:bg-[#F19C83] rounded-xl flex items-center justify-center transform rotate-3 shadow-sm">
            <span className="text-white dark:text-[#323435] font-black text-2xl transform -rotate-3">d</span>
          </div>
          <span className="font-black text-2xl tracking-tight text-gray-900 dark:text-[#EAE3D9]">
            dili<span className="text-[#75A4A7] dark:text-[#F19C83]">ooo</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigateTo('login')} className="bg-gray-900 dark:bg-[#EAE3D9] text-white dark:text-[#323435] px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
            <User className="w-4 h-4" />
            <span className="hidden sm:block">Ingresar</span>
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="relative z-10 animate-fade-in-up">
          
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-[#EAE3D9] leading-tight mb-6">
            Domina el inglés <br />
            <span className="text-[#FA8C7F] dark:text-[#F19C83]">leyendo historias.</span>
          </h1>
          
          <p className="text-gray-600 dark:text-[#EAE3D9]/80 text-lg leading-relaxed mb-10 max-w-md font-medium">
            Toca cualquier palabra que no conozcas y tu tutor personal de IA te la explicará al instante, en tu idioma y de forma amigable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 z-20 relative">
            <button onClick={() => navigateTo('library')} className="bg-[#FA8C7F] dark:bg-[#F19C83] text-white dark:text-[#323435] px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 dark:hover:bg-[#BA6B41] transition-colors flex items-center justify-center shadow-md">
              Comenzar a leer
            </button>
          </div>
        </div>

        {/* --- SECCIÓN DE LA MASCOTA ANIMADA --- */}
        <div className="relative animate-fade-in-up delay-100 mt-4 md:mt-0 flex flex-col justify-center items-center">

          {/* Contenedor del SVG */}
          <div 
             className="relative w-full max-w-[380px] aspect-square cursor-pointer select-none" 
             style={{ WebkitTapHighlightColor: 'transparent' }}
             onClick={handleMascotClick}
          >
             <svg ref={svgRef} viewBox="0 0 400 400" width="100%" height="100%">
                 {/* Sombra base */}
                 <ellipse className="animate-shadow-mascot" cx="200" cy="350" rx="90" ry="12" fill="#1E293B" opacity="0.15" />
                 
                 <g ref={bodyRef} className="animate-float-mascot">
                     {/* Pies (Turquesa oscuro) */}
                     <g id="feet">
                         <ellipse cx="150" cy="315" rx="25" ry="15" fill="#2F6666" />
                         <ellipse cx="250" cy="315" rx="25" ry="15" fill="#2F6666" />
                     </g>

                     {/* Cuerpo (Turquesa principal) */}
                     <path d="M100 200 C 100 100, 300 100, 300 200 C 300 290, 260 320, 200 320 C 140 320, 100 290, 100 200 Z" fill="#75A4A7" />
                     
                     {/* Sombra interna (Turquesa oscuro) */}
                     <path d="M110 200 C 110 120, 290 120, 290 200 C 290 280, 250 305, 200 305 C 150 305, 110 280, 110 200 Z" fill="#2F6666" opacity="0.3"/>

                     {/* Ojos y pupilas que siguen al ratón */}
                     <g className="animate-blink-mascot">
                         <circle cx="135" cy="190" r="22" fill="#FFFFFF" />
                         <g className="pupil-group" ref={el => pupilRefs.current[0] = el}>
                             <circle cx="135" cy="190" r="10" fill="#323435" />
                             <circle cx="132" cy="186" r="3.5" fill="#FFFFFF" />
                         </g>

                         <circle cx="200" cy="190" r="22" fill="#FFFFFF" />
                         <g className="pupil-group" ref={el => pupilRefs.current[1] = el}>
                             <circle cx="200" cy="190" r="10" fill="#323435" />
                             <circle cx="197" cy="186" r="3.5" fill="#FFFFFF" />
                         </g>

                         <circle cx="265" cy="190" r="22" fill="#FFFFFF" />
                         <g className="pupil-group" ref={el => pupilRefs.current[2] = el}>
                             <circle cx="265" cy="190" r="10" fill="#323435" />
                             <circle cx="262" cy="186" r="3.5" fill="#FFFFFF" />
                         </g>
                     </g>

                     {/* Boca dinámica */}
                     <path ref={mouthRef} className="mascot-mouth" d="M185 240 Q 200 255 215 240" fill="none" stroke="#323435" strokeWidth="5" strokeLinecap="round" />
                     
                     {/* Mejillas (Coral/Salmón) */}
                     <ellipse cx="110" cy="220" rx="12" ry="6" fill="#FA8C7F" opacity="0.8" />
                     <ellipse cx="290" cy="220" rx="12" ry="6" fill="#FA8C7F" opacity="0.8" />
                 </g>
             </svg>
          </div>
        </div>
      </main>
    </div>
  );
}