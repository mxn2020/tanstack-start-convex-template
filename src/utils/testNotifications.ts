// Test notification generators for demonstration
import { useNotifications } from '~/hooks/useNotifications';

export function useTestNotifications() {
  const { createNotification } = useNotifications();

  const generateSampleNotifications = () => {
    const sampleNotifications = [
      {
        type: 'vote' as const,
        title: 'Your yalla is on fire! 🔥',
        message: 'Sarah just upvoted "Organize weekend hiking trip" - it\'s gaining momentum!',
        emoji: '🔥',
        actionUrl: '/yallas',
        entityType: 'yalla' as const,
        entityId: 'sample-yalla-1',
      },
      {
        type: 'assignment' as const,
        title: 'New mission incoming! ⚡',
        message: 'Mom assigned you "Buy groceries for dinner party" - time to get shopping!',
        emoji: '🛒',
        actionUrl: '/yallas',
        entityType: 'yalla' as const,
        entityId: 'sample-yalla-2',
      },
      {
        type: 'completion' as const,
        title: 'Squad member crushed it! 💪',
        message: 'Alex completed "Clean the garage" with photo proof - what a legend!',
        emoji: '🏆',
        actionUrl: '/yallas',
        entityType: 'yalla' as const,
        entityId: 'sample-yalla-3',
      },
      {
        type: 'invite' as const,
        title: 'Welcome to the squad! 🎉',
        message: 'You\'ve been added to "Work Squad" circle - let\'s get productive!',
        emoji: '💫',
        actionUrl: '/circles',
        entityType: 'circle' as const,
        entityId: 'sample-circle-1',
      },
      {
        type: 'achievement' as const,
        title: 'Karma level up! ✨',
        message: 'You\'ve reached 85 karma points - you\'re officially a Yalla legend!',
        emoji: '🌟',
        entityType: 'user' as const,
        entityId: 'current-user',
      },
    ];

    // Create notifications one by one with small delays
    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => {
        createNotification(notification);
      }, index * 500); // 500ms delay between each notification
    });
  };

  return {
    generateSampleNotifications,
  };
}