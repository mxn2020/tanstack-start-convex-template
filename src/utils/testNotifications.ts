// Test notification generators for demonstration
import { useNotifications } from '~/hooks/useNotifications';

export function useTestNotifications() {
  const { createNotification } = useNotifications();

  const generateSampleNotifications = () => {
    const sampleNotifications = [
      {
        type: 'completion' as const,
        title: 'Task completed! 🎉',
        message: 'Sarah completed "Update project documentation" - great work!',
        emoji: '✅',
        actionUrl: '/boards',
        entityType: 'item' as const,
        entityId: 'sample-item-1',
      },
      {
        type: 'assignment' as const,
        title: 'New task assigned! 📝',
        message: 'You\'ve been assigned "Review design mockups" - time to dive in!',
        emoji: '📝',
        actionUrl: '/boards',
        entityType: 'item' as const,
        entityId: 'sample-item-2',
      },
      {
        type: 'reminder' as const,
        title: 'Task due soon ⏰',
        message: '"Prepare presentation slides" is due in 2 hours - don\'t forget!',
        emoji: '⏰',
        actionUrl: '/boards',
        entityType: 'item' as const,
        entityId: 'sample-item-3',
      },
      {
        type: 'achievement' as const,
        title: 'Productivity streak! ✨',
        message: 'You\'ve completed 5 tasks this week - keep up the momentum!',
        emoji: '🎆',
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