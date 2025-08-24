import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all circles for a user (as member or admin)
export const getUserCircles = query({
  args: {
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.authUserId) {
      return []
    }

    // Get circles where user is a member
    const membershipRecords = await ctx.db
      .query('circle_members')
      .withIndex('user', (q) => q.eq('userId', args.authUserId!))
      .collect()

    const circleIds = membershipRecords.map(m => m.circleId)

    // Get the actual circle data
    const circles = []
    for (const circleId of circleIds) {
      const circle = await ctx.db
        .query('circles')
        .withIndex('id', (q) => q.eq('id', circleId))
        .first()
      
      if (circle) {
        // Get all members for this circle
        const memberRecords = await ctx.db
          .query('circle_members')
          .withIndex('circle', (q) => q.eq('circleId', circleId))
          .collect()

        // Get user data for each member
        const members = []
        for (const memberRecord of memberRecords) {
          const user = await ctx.db
            .query('users')
            .withIndex('authUserId', (q) => q.eq('authUserId', memberRecord.userId))
            .first()
          
          if (user) {
            members.push({
              authUserId: user.authUserId,
              email: user.email,
              name: user.name,
              avatar: user.avatar,
              karmaLevel: user.karmaLevel,
              tasksCompleted: user.tasksCompleted,
              tasksAssigned: user.tasksAssigned,
            })
          }
        }

        circles.push({
          ...circle,
          members,
        })
      }
    }

    return circles
  },
})

// Create a new circle
export const createCircle = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    color: v.string(),
    adminId: v.string(),
    assignmentPermissions: v.union(v.literal('admin-only'), v.literal('all-members')),
  },
  handler: async (ctx, args) => {
    const circleId = crypto.randomUUID()
    const now = Date.now()

    // Create the circle
    await ctx.db.insert('circles', {
      id: circleId,
      name: args.name,
      description: args.description,
      color: args.color,
      adminId: args.adminId,
      assignmentPermissions: args.assignmentPermissions,
      createdAt: now,
      updatedAt: now,
    })

    // Add the creator as an admin member
    await ctx.db.insert('circle_members', {
      circleId,
      userId: args.adminId,
      role: 'admin',
      joinedAt: now,
    })

    return circleId
  },
})

// Update circle
export const updateCircle = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    assignmentPermissions: v.optional(v.union(v.literal('admin-only'), v.literal('all-members'))),
    adminId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    // Check if user is admin of this circle
    const circle = await ctx.db
      .query('circles')
      .withIndex('id', (q) => q.eq('id', args.id))
      .first()

    if (!circle) {
      throw new Error('Circle not found')
    }

    if (circle.adminId !== args.adminId) {
      throw new Error('Not authorized to update this circle')
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.color !== undefined) updates.color = args.color
    if (args.assignmentPermissions !== undefined) updates.assignmentPermissions = args.assignmentPermissions

    await ctx.db.patch(circle._id, updates)

    return args.id
  },
})

// Delete circle
export const deleteCircle = mutation({
  args: {
    id: v.string(),
    adminId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    // Check if user is admin of this circle
    const circle = await ctx.db
      .query('circles')
      .withIndex('id', (q) => q.eq('id', args.id))
      .first()

    if (!circle) {
      throw new Error('Circle not found')
    }

    if (circle.adminId !== args.adminId) {
      throw new Error('Not authorized to delete this circle')
    }

    // Delete all memberships
    const memberships = await ctx.db
      .query('circle_members')
      .withIndex('circle', (q) => q.eq('circleId', args.id))
      .collect()

    for (const membership of memberships) {
      await ctx.db.delete(membership._id)
    }

    // Delete the circle
    await ctx.db.delete(circle._id)

    return args.id
  },
})

// Add member to circle
export const addMemberToCircle = mutation({
  args: {
    circleId: v.string(),
    userId: v.string(),
    requesterId: v.string(), // User making the request
  },
  handler: async (ctx, args) => {
    // Check if circle exists
    const circle = await ctx.db
      .query('circles')
      .withIndex('id', (q) => q.eq('id', args.circleId))
      .first()

    if (!circle) {
      throw new Error('Circle not found')
    }

    // Check if requester is admin
    if (circle.adminId !== args.requesterId) {
      throw new Error('Not authorized to add members to this circle')
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('circle_members')
      .withIndex('circle_user', (q) => q.eq('circleId', args.circleId).eq('userId', args.userId))
      .first()

    if (existingMembership) {
      throw new Error('User is already a member of this circle')
    }

    // Add member
    await ctx.db.insert('circle_members', {
      circleId: args.circleId,
      userId: args.userId,
      role: 'member',
      joinedAt: Date.now(),
    })

    return args.circleId
  },
})

// Remove member from circle
export const removeMemberFromCircle = mutation({
  args: {
    circleId: v.string(),
    userId: v.string(),
    requesterId: v.string(), // User making the request
  },
  handler: async (ctx, args) => {
    // Check if circle exists
    const circle = await ctx.db
      .query('circles')
      .withIndex('id', (q) => q.eq('id', args.circleId))
      .first()

    if (!circle) {
      throw new Error('Circle not found')
    }

    // Check if requester is admin or removing themselves
    if (circle.adminId !== args.requesterId && args.requesterId !== args.userId) {
      throw new Error('Not authorized to remove this member')
    }

    // Cannot remove the admin
    if (args.userId === circle.adminId) {
      throw new Error('Cannot remove the circle admin')
    }

    // Find and remove membership
    const membership = await ctx.db
      .query('circle_members')
      .withIndex('circle_user', (q) => q.eq('circleId', args.circleId).eq('userId', args.userId))
      .first()

    if (!membership) {
      throw new Error('User is not a member of this circle')
    }

    await ctx.db.delete(membership._id)

    return args.circleId
  },
})