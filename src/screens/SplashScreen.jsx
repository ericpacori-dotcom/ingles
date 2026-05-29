import React from 'react';
import { BookOpen } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-violet-600 text-white">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl animate-scale-in">
        <BookOpen className="w-12 h-12 text-violet-600 animate-pulse" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight animate-fade-in-up delay-100">FluentSphere</h1>
      <p className="mt-2 text-violet-200 animate-fade-in-up delay-200">Tu centro de aprendizaje interactivo</p>
    </div>
  );
}