import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Mail, Crown, BookOpen, LogOut, Loader2, Sparkles } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigateTo }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (user) => {
      try {
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);
        
        let premiumStatus = false;
        if (userSnap.exists()) {
          premiumStatus = userSnap.data().isPremium || false;
        }

        // Calculamos cuántos libros ha empezado leyendo el progreso guardado
        let booksCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
          if (localStorage.key(i).startsWith('diliooo_progress_')) {
            booksCount++;
          }
        }

        setUserData({
          name: user.displayName || 'Lector Diliooo',
          email: user.email,
          photoURL: user.photoURL,
          isPremium: premiumStatus,
          booksStarted: booksCount
        });
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        navigateTo('login');
      }
    });

    return () => unsubscribe();
  }, [navigateTo]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigateTo('landing');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#323435] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-10 h-10 text-[#FA8C7F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#323435] transition-colors duration-300 py-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigateTo('library')} className="p-3 bg-white dark:bg-[#2F6666] text-gray-500 dark:text-[#EAE3D9] hover:bg-gray-100 dark:hover:bg-[#B55B49] rounded-2xl transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-[#EAE3D9] tracking-tight">Mi Perfil</h1>
          <div className="w-11"></div> {/* Espaciador visual */}
        </div>

        {/* TARJETA DE PERFIL PRINCIPAL */}
        <div className="bg-white dark:bg-[#2a2b2c] p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-[#2F6666]/50 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt="Perfil" className="w-24 h-24 rounded-full shadow-md object-cover border-4 border-white dark:border-[#323435]" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#75A4A7] dark:bg-[#F19C83] flex items-center justify-center text-white dark:text-[#323435] text-4xl font-black shadow-md border-4 border-white dark:border-[#323435]">
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {userData?.isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-lg border-2 border-white dark:border-[#323435]">
                <Crown className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-black text-gray-900 dark:text-[#EAE3D9]">{userData?.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-[#EAE3D9]/60 mt-1 font-medium text-sm">
              <Mail className="w-4 h-4" /> {userData?.email}
            </div>
          </div>
        </div>

        {/* ESTADO DE SUSCRIPCIÓN */}
        {userData?.isPremium ? (
          <div className="bg-gradient-to-r from-[#FA8C7F] to-[#F19C83] p-6 rounded-[32px] shadow-lg mb-6 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Estado de cuenta</p>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                Premium Activo <Sparkles className="w-5 h-5" />
              </h3>
            </div>
            <Crown className="w-12 h-12 text-white/20" />
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-[#2F6666]/20 border border-gray-200 dark:border-[#2F6666]/50 p-6 rounded-[32px] mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-500 dark:text-[#EAE3D9]/60 text-xs font-black uppercase tracking-widest mb-1">Estado de cuenta</p>
              <h3 className="text-xl font-black text-gray-900 dark:text-[#EAE3D9]">Plan Básico (Gratis)</h3>
            </div>
            <button onClick={() => navigateTo('pricing')} className="w-full md:w-auto px-6 py-3.5 bg-[#FA8C7F] dark:bg-[#F19C83] text-white dark:text-[#323435] rounded-2xl font-black uppercase tracking-wider text-xs shadow-md hover:scale-105 transition-transform">
              Mejorar a Premium
            </button>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        <div className="bg-white dark:bg-[#2a2b2c] p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-[#2F6666]/50 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#75A4A7]/10 dark:bg-[#2F6666] flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[#75A4A7] dark:text-[#F19C83]" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-gray-900 dark:text-[#EAE3D9]">{userData?.booksStarted}</h4>
            <p className="text-sm font-medium text-gray-500 dark:text-[#EAE3D9]/60">Libros iniciados</p>
          </div>
        </div>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <button onClick={handleLogout} className="w-full py-4 bg-gray-100 dark:bg-[#2F6666]/50 text-gray-600 dark:text-[#EAE3D9] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-500/30">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>

      </div>
    </div>
  );
}