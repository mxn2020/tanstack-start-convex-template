import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    authUserId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.authUserId) {
      return []
    }

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('user', (q) => q.eq('userId', args.authUserId!))
      .order('desc')
      .take(args.limit || 50)

    return notifications
  },
})

// Get unread notification count
export const getUnreadCount = query({
  args: {
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.authUserId) {
      return 0
    }

    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('user_read', (q) => q.eq('userId', args.authUserId!).eq('isRead', false))
      .collect()

    return unreadNotifications.length
  },
})

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal('vote'), v.literal('assignment'), v.literal('completion'), v.literal('invite'), v.literal('achievement'), v.literal('reminder')),
    title: v.string(),
    message: v.string(),
    emoji: v.string(),
    actionUrl: v.optional(v.string()),
    entityType: v.optional(v.union(v.literal('yalla'), v.literal('circle'), v.literal('user'))),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = crypto.randomUUID()
    const now = Date.now()

    await ctx.db.insert('notifications', {
      id: notificationId,
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      emoji: args.emoji,
      isRead: false,
      actionUrl: args.actionUrl,
      entityType: args.entityType,
      entityId: args.entityId,
      createdAt: now,
      updatedAt: now,
    })

    return notificationId
  },
})

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.string(),
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db
      .query('notifications')
      .withIndex('id', (q) => q.eq('id', args.notificationId))
      .first()

    if (!notification) {
      throw new Error('Notification not found')
    }

    // Check if user owns this notification
    if (notification.userId !== args.authUserId) {
      throw new Error('Not authorized to update this notification')
    }

    await ctx.db.patch(notification._id, {
      isRead: true,
      updatedAt: Date.now(),
    })

    return args.notificationId
  },
})

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('user_read', (q) => q.eq('userId', args.authUserId).eq('isRead', false))
      .collect()

    const now = Date.now()
    
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        updatedAt: now,
      })
    }

    return unreadNotifications.length
  },
})

// Delete a notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.string(),
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db
      .query('notifications')
      .withIndex('id', (q) => q.eq('id', args.notificationId))
      .first()

    if (!notification) {
      throw new Error('Notification not found')
    }

    // Check if user owns this notification
    if (notification.userId !== args.authUserId) {
      throw new Error('Not authorized to delete this notification')
    }

    await ctx.db.delete(notification._id)

    return args.notificationId
  },
})

// Helper function to create notifications for yalla events
export const notifyYallaEvent = mutation({
  args: {
    type: v.union(v.literal('vote'), v.literal('assignment'), v.literal('completion')),
    yallaId: v.string(),
    triggeredBy: v.string(), // authUserId of the person who triggered the event
    additionalData: v.optional(v.object({
      voterName: v.optional(v.string()),
      assignerName: v.optional(v.string()),
      completerName: v.optional(v.string()),
      yallaTitle: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get the yalla to determine who to notify
    const yalla = await ctx.db
      .query('yallas')
      .withIndex('id', (q) => q.eq('id', args.yallaId))
      .first()

    if (!yalla) {
      throw new Error('Yalla not found')
    }

    const now = Date.now()
    const notificationIds: string[] = []

    // Determine who to notify and what message to send
    let recipientIds: string[] = []
    let title = ''
    let message = ''
    let emoji = ''

    switch (args.type) {
      case 'vote':
        // Notify yalla creator about votes (unless they voted themselves)
        if (yalla.creatorId !== args.triggeredBy) {
          recipientIds = [yalla.creatorId]
          title = 'Your yalla is getting attention! 🔥'
          message = `${args.additionalData?.voterName || 'Someone'} voted on "${args.additionalData?.yallaTitle || yalla.title}"`
          emoji = '🔥'
        }
        break

      case 'assignment':
        // Notify assigned users
        if (yalla.assignedTo) {
          recipientIds = yalla.assignedTo.filter(userId => userId !== args.triggeredBy)
          title = 'New mission incoming! ⚡'
          message = `${args.additionalData?.assignerName || 'Someone'} assigned you "${args.additionalData?.yallaTitle || yalla.title}"`
          emoji = '⚡'
        }
        break

      case 'completion':
        // Notify circle members about completion (excluding the completer)
        const circleMembers = await ctx.db
          .query('circle_members')
          .withIndex('circle', (q) => q.eq('circleId', yalla.circleId))
          .collect()
        
        recipientIds = circleMembers
          .map(member => member.userId)
          .filter(userId => userId !== args.triggeredBy)
        
        title = 'Squad member crushed it! 💪'
        message = `${args.additionalData?.completerName || 'Someone'} completed "${args.additionalData?.yallaTitle || yalla.title}"`
        emoji = '🏆'
        break
    }

    // Create notifications for each recipient
    for (const recipientId of recipientIds) {
      const notificationId = crypto.randomUUID()
      
      await ctx.db.insert('notifications', {
        id: notificationId,
        userId: recipientId,
        type: args.type,
        title,
        message,
        emoji,
        isRead: false,
        actionUrl: `/yallas`, // Could be more specific like `/yallas/${args.yallaId}`
        entityType: 'yalla',
        entityId: args.yallaId,
        createdAt: now,
        updatedAt: now,
      })

      notificationIds.push(notificationId)
    }

    return notificationIds
  },
})

// Create achievement notification
export const notifyAchievement = mutation({
  args: {
    userId: v.string(),
    achievementType: v.string(),
    details: v.object({
      title: v.string(),
      message: v.string(),
      emoji: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const notificationId = crypto.randomUUID()
    const now = Date.now()

    await ctx.db.insert('notifications', {
      id: notificationId,
      userId: args.userId,
      type: 'achievement',
      title: args.details.title,
      message: args.details.message,
      emoji: args.details.emoji,
      isRead: false,
      entityType: 'user',
      entityId: args.userId,
      createdAt: now,
      updatedAt: now,
    })

    return notificationId
  },
})

// Create circle invite notification
export const notifyCircleInvite = mutation({
  args: {
    userId: v.string(),
    circleId: v.string(),
    circleName: v.string(),
    inviterName: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = crypto.randomUUID()
    const now = Date.now()

    await ctx.db.insert('notifications', {
      id: notificationId,
      userId: args.userId,
      type: 'invite',
      title: 'Welcome to the squad! 🎉',
      message: `${args.inviterName} added you to "${args.circleName}" circle - let's get productive!`,
      emoji: '💫',
      isRead: false,
      actionUrl: `/circles`,
      entityType: 'circle',
      entityId: args.circleId,
      createdAt: now,
      updatedAt: now,
    })

    return notificationId
  },
})