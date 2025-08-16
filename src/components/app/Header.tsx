import { useState } from 'react';
import { User, Bell, Search, Plus, Sparkles, LogOut } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useSession, signOut } from '~/lib/auth-client';
import { CreateYallaModal } from '~/components/Yallas/CreateYallaModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useNotifications } from '~/hooks/useNotifications';

export function Header() {
  const location = useLocation();
  const session = useSession();
  const { unreadCount } = useNotifications();
  const [showCreateYalla, setShowCreateYalla] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Vibe Check', icon: '🔥' },
    { id: 'circles', path: '/circles', label: 'Squad', icon: '💫' },
    { id: 'yallas', path: '/yallas', label: 'Yallas', icon: '⚡' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">Yalla</span>
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                    location.pathname === item.path
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:text-yellow-300 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Find your vibe... 🔍"
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border-0 rounded-full focus:ring-4 focus:ring-yellow-300 focus:bg-white shadow-lg placeholder-purple-400 text-purple-800 font-medium"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
           <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-3 text-white hover:text-yellow-300 rounded-full hover:bg-white/20 transition-all transform hover:scale-110 relative"
              >
              <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-xs font-bold text-purple-800">{unreadCount}</span>
                  </div>
                )}
            </button>
              
              <NotificationsDropdown 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>
            
            <button 
              onClick={() => setShowCreateYalla(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-purple-800 px-6 py-3 rounded-full flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg font-bold"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Drop a Yalla</span>
            </button>
            
            {session.data && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{session.data.user.name || session.data.user.email}</div>
                  <div className="text-xs text-yellow-300 font-medium">✨ vibes</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-4 border-white">
                  <span className="text-xl">😎</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-3 text-white hover:text-red-300 rounded-full hover:bg-white/20 transition-all transform hover:scale-110"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white/10 backdrop-blur-sm">
        <nav className="flex justify-around py-2">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all transform hover:scale-105 ${
                location.pathname === item.path
                  ? 'text-yellow-300 bg-white/20 shadow-lg'
                  : 'text-white'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {showCreateYalla && (
        <CreateYallaModal 
          isOpen={showCreateYalla} 
          onClose={() => setShowCreateYalla(false)} 
        />
      )}
    </header>
  );
}
