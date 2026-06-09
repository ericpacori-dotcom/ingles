import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginScreen({ navigateTo }) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // 1. Abre la ventana emergente de Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Verificamos si el usuario ya existe en nuestra base de datos
      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      // 3. Si es un usuario nuevo, lo guardamos con isPremium en falso
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          isPremium: false, 
          createdAt: new Date()
        });
      }
      
      // 4. Lo mandamos a la biblioteca
      navigateTo('library');
    } catch (error) {
      console.error("Error iniciando sesión con Google:", error);
      alert("La ventana de inicio de sesión se cerró o hubo un error. Intenta nuevamente.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 px-4 py-8">
      <div className="bg-white dark:bg-[#2a2b2c] p-6 md:p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-[#2F6666]/50 w-full max-w-md animate-scale-in relative">
        
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-[#EAE3D9] tracking-tight">Bienvenido de nuevo</h2>
          <button onClick={() => navigateTo('landing')} className="text-gray-400 dark:text-[#EAE3D9]/60 hover:text-[#FA8C7F] dark:hover:text-[#F19C83] transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigateTo('library'); }}>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-[#EAE3D9]/70 mb-2">Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] rounded-2xl focus:ring-2 focus:ring-[#FA8C7F] dark:focus:ring-[#F19C83] focus:outline-none text-sm font-medium text-gray-900 dark:text-white transition-all" 
              placeholder="tu@email.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-[#EAE3D9]/70 mb-2">Contraseña</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] rounded-2xl focus:ring-2 focus:ring-[#FA8C7F] dark:focus:ring-[#F19C83] focus:outline-none text-sm font-medium text-gray-900 dark:text-white transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full bg-[#75A4A7] dark:bg-[#F19C83] text-white dark:text-[#323435] py-4 rounded-2xl font-black uppercase tracking-wider hover:opacity-90 dark:hover:bg-[#BA6B41] transition-all duration-300 mt-2 shadow-md">
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#2F6666]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white dark:bg-[#2a2b2c] text-gray-400 dark:text-[#EAE3D9]/50 font-bold uppercase tracking-widest">O continúa con</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className={`mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-[#323435] border border-gray-200 dark:border-[#2F6666] text-gray-700 dark:text-[#EAE3D9] py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-sm
              ${isGoogleLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-[#2F6666]/50 hover:shadow-md'}`}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-[#F19C83]" />
            ) : (
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            )}
            <span>{isGoogleLoading ? "Conectando..." : "Google"}</span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-[#EAE3D9]/70 mt-8 font-medium">
          ¿No tienes una cuenta? <span className="text-[#FA8C7F] dark:text-[#F19C83] font-black cursor-pointer hover:underline" onClick={() => navigateTo('pricing')}>Suscríbete aquí</span>
        </p>

      </div>
    </div>
  );
}