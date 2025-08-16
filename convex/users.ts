// convex/users.ts

import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { User } from './schema'

// Create or update user from auth sync
export const createOrUpdateUser = mutation({
  args: {
    authUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    const now = Date.now()

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        updatedAt: now,
      })
      return existingUser._id
    } else {
      // Create new user with default karma and task values
      const userId = await ctx.db.insert('users', {
        authUserId: args.authUserId,
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        karmaLevel: 0,
        tasksCompleted: 0,
        tasksAssigned: 0,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
        },
        createdAt: now,
        updatedAt: now,
      })
      return userId
    }
  },
})

// Get user by auth ID
export const getUserByAuthId = query({
  args: { authUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()
  },
})

// Update user preferences
export const updatePreferences = mutation({
  args: {
    authUserId: v.string(),
    preferences: v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      language: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      preferences: {
        ...user.preferences,
        ...args.preferences,
      },
      updatedAt: Date.now(),
    })
  },
})

// Update user profile
export const updateProfile = mutation({
  args: {
    authUserId: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      avatar: args.avatar,
      updatedAt: Date.now(),
    })
  },
})

// Delete user (for account deletion)
export const deleteUser = mutation({
  args: { authUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (user) {
      await ctx.db.delete(user._id)
    }
  },
})

// Update user karma level
export const updateKarmaLevel = mutation({
  args: {
    authUserId: v.string(),
    karmaLevel: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      karmaLevel: args.karmaLevel,
      updatedAt: Date.now(),
    })
  },
})

// Update task completion count
export const updateTasksCompleted = mutation({
  args: {
    authUserId: v.string(),
    increment: v.optional(v.boolean()), // true to increment, false to set absolute value
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const newCount = args.increment 
      ? user.tasksCompleted + 1
      : args.count ?? user.tasksCompleted

    await ctx.db.patch(user._id, {
      tasksCompleted: newCount,
      updatedAt: Date.now(),
    })
  },
})

// Update task assignment count
export const updateTasksAssigned = mutation({
  args: {
    authUserId: v.string(),
    increment: v.optional(v.boolean()), // true to increment, false to set absolute value
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('authUserId', (q) => q.eq('authUserId', args.authUserId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const newCount = args.increment 
      ? user.tasksAssigned + 1
      : args.count ?? user.tasksAssigned

    await ctx.db.patch(user._id, {
      tasksAssigned: newCount,
      updatedAt: Date.now(),
    })
  },
})

// Get all users (for admin or collaboration features)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})