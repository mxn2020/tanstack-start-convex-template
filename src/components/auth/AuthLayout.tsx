// src/components/auth/AuthLayout.tsx

import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <span className="text-3xl">🚀</span>
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight">Yalla</h1>
              <div className="flex items-center justify-center space-x-1">
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                <span className="text-yellow-300 text-sm font-bold">yalla.wtf</span>
                <Zap className="h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
          <p className="text-pink-200 text-lg font-medium">{subtitle}</p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-pink-200 text-sm font-medium">
            Made with 💜 for the squad that gets stuff done
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}