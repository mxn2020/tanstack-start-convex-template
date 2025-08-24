import { useMutation, useQuery } from '@tanstack/react-query'
import { useConvexMutation, convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { useSession } from '~/lib/auth-client'
import { Notification } from '~/types'
import toast from 'react-hot-toast'

export function useNotifications() {
  const { data: session } = useSession()

  // Get notifications
  const notificationsQuery = useQuery(
    convexQuery(api.notifications.getUserNotifications, {
      authUserId: session?.user?.id,
      limit: 50,
    })
  )

  // Get unread count
  const unreadCountQuery = useQuery(
    convexQuery(api.notifications.getUnreadCount, {
      authUserId: session?.user?.id,
    })
  )

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.markAsRead),
    onError: (error) => {
      console.error('Failed to mark notification as read:', error)
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.markAllAsRead),
    onSuccess: (count: number) => {
      if (count > 0) {
        toast.success(`Marked ${count} notifications as read`)
      }
    },
    onError: (error) => {
      toast.error('Failed to mark notifications as read')
      console.error('Failed to mark all as read:', error)
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.deleteNotification),
    onError: (error) => {
      toast.error('Failed to delete notification')
      console.error('Failed to delete notification:', error)
    },
  })

  // Create notification mutation (for testing/manual creation)
  const createNotificationMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.createNotification),
    onSuccess: () => {
      toast.success('Notification created!')
    },
    onError: (error) => {
      toast.error('Failed to create notification')
      console.error('Failed to create notification:', error)
    },
  })

  // Transform Convex data to match our types
  const notifications: Notification[] = (notificationsQuery.data || []).map(notification => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
    updatedAt: new Date(notification.updatedAt),
  }))

  const unreadCount = unreadCountQuery.data || 0

  const markAsRead = (notificationId: string) => {
    if (!session?.user?.id) return

    markAsReadMutation.mutate({
      notificationId,
      authUserId: session.user.id,
    })
  }

  const markAllAsRead = () => {
    if (!session?.user?.id) return

    markAllAsReadMutation.mutate({
      authUserId: session.user.id,
    })
  }

  const deleteNotification = (notificationId: string) => {
    if (!session?.user?.id) return

    deleteNotificationMutation.mutate({
      notificationId,
      authUserId: session.user.id,
    })
  }

  const createNotification = (notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt' | 'updatedAt'>) => {
    if (!session?.user?.id) return

    createNotificationMutation.mutate({
      userId: session.user.id,
      ...notification,
    })
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isCreating: createNotificationMutation.isPending,
  }
}

// Helper functions for creating specific notification types
export function useNotificationHelpers() {
  const createNotificationMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.createNotification),
  })

  const notifyYallaEventMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.notifyYallaEvent),
  })

  const notifyAchievementMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.notifyAchievement),
  })

  const notifyCircleInviteMutation = useMutation({
    mutationFn: useConvexMutation(api.notifications.notifyCircleInvite),
  })

  const notifyVote = (yallaId: string, triggeredBy: string, voterName: string, yallaTitle: string) => {
    notifyYallaEventMutation.mutate({
      type: 'vote',
      yallaId,
      triggeredBy,
      additionalData: {
        voterName,
        yallaTitle,
      },
    })
  }

  const notifyAssignment = (yallaId: string, triggeredBy: string, assignerName: string, yallaTitle: string) => {
    notifyYallaEventMutation.mutate({
      type: 'assignment',
      yallaId,
      triggeredBy,
      additionalData: {
        assignerName,
        yallaTitle,
      },
    })
  }

  const notifyCompletion = (yallaId: string, triggeredBy: string, completerName: string, yallaTitle: string) => {
    notifyYallaEventMutation.mutate({
      type: 'completion',
      yallaId,
      triggeredBy,
      additionalData: {
        completerName,
        yallaTitle,
      },
    })
  }

  const notifyAchievement = (userId: string, achievementType: string, title: string, message: string, emoji: string) => {
    notifyAchievementMutation.mutate({
      userId,
      achievementType,
      details: {
        title,
        message,
        emoji,
      },
    })
  }

  const notifyCircleInvite = (userId: string, circleId: string, circleName: string, inviterName: string) => {
    notifyCircleInviteMutation.mutate({
      userId,
      circleId,
      circleName,
      inviterName,
    })
  }

  return {
    notifyVote,
    notifyAssignment,
    notifyCompletion,
    notifyAchievement,
    notifyCircleInvite,
  }
}