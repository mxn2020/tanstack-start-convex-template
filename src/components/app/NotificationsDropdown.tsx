import { useRef, useEffect } from 'react';
import { Bell, X, Heart, Users, Zap, Trophy } from 'lucide-react';
import { useNotifications } from '~/hooks/useNotifications';
import { Notification } from '~/types';


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead: markAllAsReadHook,
    deleteNotification: deleteNotificationHook,
    isLoading,
  } = useNotifications();


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadHook();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationHook(notificationId);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'vote':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'assignment':
        return <Zap className="h-5 w-5 text-orange-500" />;
      case 'completion':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'invite':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-3xl shadow-2xl border-0 z-50 max-h-[80vh] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-6 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white">Notifications 🔔</h3>
            <p className="text-white/90 font-medium">
              {unreadCount > 0 ? `${unreadCount} new vibes waiting!` : 'You\'re all caught up! ✨'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-all transform hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 disabled:opacity-50"
          >
            Mark all as read ✅
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">🔕</div>
            <h3 className="text-2xl font-black text-purple-600 mb-2">All quiet, bestie!</h3>
            <p className="text-purple-500 font-medium">No notifications right now - time to drop some yallas! 🚀</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 rounded-2xl mb-2 transition-all transform hover:scale-[1.02] cursor-pointer ${
                  !notification.isRead
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`p-3 rounded-2xl shadow-lg ${
                    !notification.isRead ? 'bg-white' : 'bg-white/70'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-black text-lg ${
                          !notification.isRead ? 'text-purple-800' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm font-medium mt-1 ${
                          !notification.isRead ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-xs font-bold ${
                            !notification.isRead ? 'text-purple-500' : 'text-gray-500'
                          }`}>
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all transform hover:scale-110 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-purple-100 p-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <button className="w-full text-center text-purple-600 hover:text-purple-800 font-bold text-sm transition-colors">
            View all notifications 👀
          </button>
        </div>
      )}
    </div>
  );
}