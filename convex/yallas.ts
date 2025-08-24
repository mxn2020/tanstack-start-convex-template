import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get yallas for a user (created, assigned, or in their circles)
export const getUserYallas = query({
  args: {
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.authUserId) {
      return []
    }

    // Get user's circles
    const membershipRecords = await ctx.db
      .query('circle_members')
      .withIndex('user', (q) => q.eq('userId', args.authUserId!))
      .collect()

    const circleIds = membershipRecords.map(m => m.circleId)

    // Get yallas from user's circles
    const yallas = []
    for (const circleId of circleIds) {
      const circleYallas = await ctx.db
        .query('yallas')
        .withIndex('circle', (q) => q.eq('circleId', circleId))
        .collect()
      
      yallas.push(...circleYallas)
    }

    // Get votes for each yalla
    const yallasWithVotes = []
    for (const yalla of yallas) {
      const votes = await ctx.db
        .query('votes')
        .withIndex('yalla', (q) => q.eq('yallaId', yalla.id))
        .collect()

      yallasWithVotes.push({
        ...yalla,
        votes,
      })
    }

    return yallasWithVotes
  },
})

// Get yallas for a specific circle
export const getCircleYallas = query({
  args: {
    circleId: v.string(),
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.authUserId) {
      return []
    }

    // Check if user is a member of this circle
    const membership = await ctx.db
      .query('circle_members')
      .withIndex('circle_user', (q) => q.eq('circleId', args.circleId).eq('userId', args.authUserId!))
      .first()

    if (!membership) {
      throw new Error('Not authorized to view yallas for this circle')
    }

    // Get yallas for this circle
    const yallas = await ctx.db
      .query('yallas')
      .withIndex('circle', (q) => q.eq('circleId', args.circleId))
      .collect()

    // Get votes for each yalla
    const yallasWithVotes = []
    for (const yalla of yallas) {
      const votes = await ctx.db
        .query('votes')
        .withIndex('yalla', (q) => q.eq('yallaId', yalla.id))
        .collect()

      yallasWithVotes.push({
        ...yalla,
        votes,
      })
    }

    return yallasWithVotes
  },
})

// Create a new yalla
export const createYalla = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('community'), v.literal('assigned')),
    creatorId: v.string(),
    circleId: v.string(),
    assignedTo: v.optional(v.array(v.string())),
    priority: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    completionImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is a member of this circle
    const membership = await ctx.db
      .query('circle_members')
      .withIndex('circle_user', (q) => q.eq('circleId', args.circleId).eq('userId', args.creatorId))
      .first()

    if (!membership) {
      throw new Error('Not authorized to create yallas in this circle')
    }

    // Check assignment permissions
    const circle = await ctx.db
      .query('circles')
      .withIndex('id', (q) => q.eq('id', args.circleId))
      .first()

    if (!circle) {
      throw new Error('Circle not found')
    }

    if (args.type === 'assigned' && circle.assignmentPermissions === 'admin-only') {
      if (membership.role !== 'admin') {
        throw new Error('Only admins can create assigned yallas in this circle')
      }
    }

    const yallaId = crypto.randomUUID()
    const now = Date.now()

    await ctx.db.insert('yallas', {
      id: yallaId,
      title: args.title,
      description: args.description,
      type: args.type,
      creatorId: args.creatorId,
      circleId: args.circleId,
      assignedTo: args.assignedTo,
      status: 'pending',
      priority: args.priority || 1,
      dueDate: args.dueDate,
      completionImage: args.completionImage,
      createdAt: now,
      updatedAt: now,
    })

    return yallaId
  },
})

// Update yalla
export const updateYalla = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal('pending'), v.literal('accepted'), v.literal('completed'), v.literal('declined'))),
    completedAt: v.optional(v.number()),
    completionImage: v.optional(v.string()),
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const yalla = await ctx.db
      .query('yallas')
      .withIndex('id', (q) => q.eq('id', args.id))
      .first()

    if (!yalla) {
      throw new Error('Yalla not found')
    }

    // Check if user can update this yalla
    const canUpdate = yalla.creatorId === args.authUserId || 
                     (yalla.assignedTo && yalla.assignedTo.includes(args.authUserId))

    if (!canUpdate) {
      throw new Error('Not authorized to update this yalla')
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.status !== undefined) updates.status = args.status
    if (args.completedAt !== undefined) updates.completedAt = args.completedAt
    if (args.completionImage !== undefined) updates.completionImage = args.completionImage

    await ctx.db.patch(yalla._id, updates)

    return args.id
  },
})

// Delete yalla
export const deleteYalla = mutation({
  args: {
    id: v.string(),
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const yalla = await ctx.db
      .query('yallas')
      .withIndex('id', (q) => q.eq('id', args.id))
      .first()

    if (!yalla) {
      throw new Error('Yalla not found')
    }

    // Only creator can delete
    if (yalla.creatorId !== args.authUserId) {
      throw new Error('Not authorized to delete this yalla')
    }

    // Delete all votes for this yalla
    const votes = await ctx.db
      .query('votes')
      .withIndex('yalla', (q) => q.eq('yallaId', args.id))
      .collect()

    for (const vote of votes) {
      await ctx.db.delete(vote._id)
    }

    // Delete the yalla
    await ctx.db.delete(yalla._id)

    return args.id
  },
})

// Vote on a yalla
export const voteOnYalla = mutation({
  args: {
    yallaId: v.string(),
    userId: v.string(),
    value: v.number(), // 1 for upvote, -1 for downvote
  },
  handler: async (ctx, args) => {
    // Check if yalla exists and is community type
    const yalla = await ctx.db
      .query('yallas')
      .withIndex('id', (q) => q.eq('id', args.yallaId))
      .first()

    if (!yalla) {
      throw new Error('Yalla not found')
    }

    if (yalla.type !== 'community') {
      throw new Error('Can only vote on community yallas')
    }

    // Check if user is a member of the circle
    const membership = await ctx.db
      .query('circle_members')
      .withIndex('circle_user', (q) => q.eq('circleId', yalla.circleId).eq('userId', args.userId))
      .first()

    if (!membership) {
      throw new Error('Not authorized to vote on this yalla')
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query('votes')
      .withIndex('user_yalla', (q) => q.eq('userId', args.userId).eq('yallaId', args.yallaId))
      .first()

    if (existingVote) {
      // Update existing vote
      await ctx.db.patch(existingVote._id, {
        value: args.value,
      })
    } else {
      // Create new vote
      await ctx.db.insert('votes', {
        id: crypto.randomUUID(),
        userId: args.userId,
        yallaId: args.yallaId,
        value: args.value,
        createdAt: Date.now(),
      })
    }

    return args.yallaId
  },
})

// Remove vote from yalla
export const removeVote = mutation({
  args: {
    yallaId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query('votes')
      .withIndex('user_yalla', (q) => q.eq('userId', args.userId).eq('yallaId', args.yallaId))
      .first()

    if (vote) {
      await ctx.db.delete(vote._id)
    }

    return args.yallaId
  },
})

// Generate upload URL for yalla completion images
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

// Get URL for stored image
export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})