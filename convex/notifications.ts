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
    type: v.union(v.literal('assignment'), v.literal('completion'), v.literal('invite'), v.literal('achievement'), v.literal('reminder')),
    title: v.string(),
    message: v.string(),
    emoji: v.string(),
    actionUrl: v.optional(v.string()),
    entityType: v.optional(v.union(v.literal('board'), v.literal('item'), v.literal('user'))),
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

// Helper function to create notifications for task events
export const notifyTaskEvent = mutation({
  args: {
    type: v.union(v.literal('assignment'), v.literal('completion')),
    itemId: v.string(),
    boardId: v.string(),
    triggeredBy: v.string(), // authUserId of the person who triggered the event
    additionalData: v.optional(v.object({
      assignerName: v.optional(v.string()),
      completerName: v.optional(v.string()),
      itemTitle: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get the item to determine details
    const item = await ctx.db
      .query('items')
      .withIndex('id', (q) => q.eq('id', args.itemId))
      .first()

    if (!item) {
      throw new Error('Task not found')
    }

    // Get the board to determine board owner
    const board = await ctx.db
      .query('boards')
      .withIndex('id', (q) => q.eq('id', args.boardId))
      .first()

    if (!board) {
      throw new Error('Board not found')
    }

    const now = Date.now()
    const notificationIds: string[] = []

    // Determine who to notify and what message to send
    let recipientIds: string[] = []
    let title = ''
    let message = ''
    let emoji = ''

    switch (args.type) {
      case 'assignment':
        // For now, notify board owner (could be enhanced to support specific user assignment)
        if (board.createdBy && board.createdBy !== args.triggeredBy) {
          recipientIds = [board.createdBy]
          title = 'Task updated on your board 📝'
          message = `${args.additionalData?.assignerName || 'Someone'} updated "${args.additionalData?.itemTitle || item.title}"`
          emoji = '📝'
        }
        break

      case 'completion':
        // Notify board owner about task completion
        if (board.createdBy && board.createdBy !== args.triggeredBy) {
          recipientIds = [board.createdBy]
          title = 'Task completed! 🎉'
          message = `${args.additionalData?.completerName || 'Someone'} completed "${args.additionalData?.itemTitle || item.title}"`
          emoji = '✅'
        }
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
        actionUrl: `/boards/${args.boardId}`,
        entityType: 'item',
        entityId: args.itemId,
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

// Create board invite notification (for future collaboration features)
export const notifyBoardInvite = mutation({
  args: {
    userId: v.string(),
    boardId: v.string(),
    boardName: v.string(),
    inviterName: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = crypto.randomUUID()
    const now = Date.now()

    await ctx.db.insert('notifications', {
      id: notificationId,
      userId: args.userId,
      type: 'invite',
      title: 'Board invitation! 📋',
      message: `${args.inviterName} invited you to collaborate on "${args.boardName}"`,
      emoji: '📋',
      isRead: false,
      actionUrl: `/boards/${args.boardId}`,
      entityType: 'board',
      entityId: args.boardId,
      createdAt: now,
      updatedAt: now,
    })

    return notificationId
  },
})