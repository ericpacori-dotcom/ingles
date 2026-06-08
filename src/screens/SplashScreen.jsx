import React, { useEffect, useRef } from 'react';

export default function SplashScreen({ navigateTo }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Inyectar la fuente Nunito si no está presente en el documento
    if (!document.getElementById('nunito-font')) {
      const link = document.createElement('link');
      link.id = 'nunito-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&display=swap';
      document.head.appendChild(link);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let startTime = null;
    const animationDuration = 4000; // 4 segundos de splash screen

    // 2. Configurar el tamaño del canvas al 100% de la ventana
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 3. Función de aceleración (easing) para el efecto Pop-in
    function easeOutBack(x) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    // 4. Lógica de dibujo del Canvas (Más pequeño y fluido)
    const drawLogo = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Animación de escala de entrada
      let scaleProgress = Math.min(1, elapsed / 800); 
      let scale = easeOutBack(scaleProgress);

      // Transición de opacidad al final
      let alpha = 1;
      if (elapsed > animationDuration - 500) {
        alpha = Math.max(0, 1 - (elapsed - (animationDuration - 500)) / 500);
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // --- DETECCIÓN DE MODO OSCURO PARA COLORES ---
      const isDark = document.documentElement.classList.contains('dark');
      const colorCoralBox = isDark ? '#F19C83' : '#FA8C7F'; // Salmón suave o Coral
      const colorD = isDark ? '#323435' : '#ffffff';        // Carbón o Blanco
      const colorDili = isDark ? '#EAE3D9' : '#111827';     // Crema o Gris muy oscuro
      const colorOoo = isDark ? '#F19C83' : '#75A4A7';      // Salmón suave o Turquesa

      // --- CONFIGURACIÓN DE TAMAÑOS (REDUCIDOS) ---
      ctx.textBaseline = 'middle';
      const iconSize = 65;   // Reducido
      const iconRadius = 20; // Reducido
      const gap = 14;        // Reducido
      
      ctx.font = '900 65px Nunito, sans-serif'; // Reducido
      const w_dili = ctx.measureText('dili').width;
      const w_o = ctx.measureText('o').width;
      
      const totalWidth = iconSize + gap + w_dili + (w_o * 3);
      const startX = cx - (totalWidth / 2);

      // Dibujar caja del ícono
      ctx.fillStyle = colorCoralBox;
      ctx.beginPath();
      ctx.roundRect(startX, cy - iconSize/2, iconSize, iconSize, iconRadius);
      ctx.fill();

      // Dibujar la letra 'd' interior
      ctx.fillStyle = colorD;
      ctx.font = '900 50px Nunito, sans-serif'; // Reducido
      ctx.textAlign = 'center';
      ctx.fillText('d', startX + iconSize/2, cy + 3); 

      // Dibujar el texto 'dili'
      ctx.fillStyle = colorDili;
      ctx.textAlign = 'left';
      ctx.font = '900 65px Nunito, sans-serif'; // Reducido
      const diliX = startX + iconSize + gap;
      ctx.fillText('dili', diliX, cy + 3);

      // --- DIBUJAR LAS LETRAS 'O' CON ONDULACIÓN FLUIDA ---
      ctx.fillStyle = colorOoo;
      const baseOx = diliX + w_dili;

      for (let i = 0; i < 3; i++) {
        // Onda un poco más lenta y suave
        let wave = Math.sin((elapsed * 0.004) - (i * 0.6)); 
        // Entrada gradual del salto en lugar de hacerlo de golpe (Math.min/max)
        let bounceActive = Math.min(1, Math.max(0, (elapsed - 600) / 400));
        let yOffset = wave * 10 * bounceActive; 
        
        ctx.fillText('o', baseOx + (i * w_o), cy + 3 + yOffset);
      }

      ctx.restore();

      // --- Bucle de Animación ---
      if (elapsed < animationDuration) {
        animationFrameId = requestAnimationFrame(drawLogo);
      } else {
        // Redirigir a la aplicación principal al terminar
        navigateTo('landing');
      }
    };

    // Asegurarnos de que la fuente esté lista antes de empezar a dibujar
    document.fonts.ready.then(() => {
      animationFrameId = requestAnimationFrame(drawLogo);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [navigateTo]);

  return (
    // position fixed y z-[200] garantiza que cubra toda la pantalla como un verdadero splash screen
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}