import React from 'react';

export function Loader() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative">
        {/* Main spinning circle with gradient */}
        <div className="w-20 h-20 border-8 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full animate-spin">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-2xl animate-bounce">🚀</span>
            </div>
          </div>
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        {/* Loading text */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="text-lg font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
            Loading the vibes... ✨
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-4 right-0 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute bottom-0 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.4s' }}></div>
          <div className="absolute bottom-4 right-4 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '2.1s' }}></div>
        </div>
      </div>
    </div>
  );
}