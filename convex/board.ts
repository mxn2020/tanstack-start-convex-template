// convex/board.ts

import invariant from 'tiny-invariant'
import { v } from 'convex/values'
import {
  type QueryCtx,
  internalMutation,
  mutation,
  query,
} from './_generated/server'
import schema, {
  deleteColumnSchema,
  deleteItemSchema,
  newColumnsSchema,
  updateBoardSchema,
  updateColumnSchema,
} from './schema'
import type { Doc, Id } from './_generated/dataModel'

export const seed = internalMutation(async (ctx) => {
  const allBoards = await ctx.db.query('boards').collect()
  if (allBoards.length > 0) {
    return
  }
  
  // Create a demo user first for the seed board
  await ctx.db.insert('users', {
    authUserId: 'demo-user-1',
    email: 'demo@example.com',
    name: 'Demo User',
    karmaLevel: 85,
    tasksCompleted: 23,
    tasksAssigned: 18,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  
  await ctx.db.insert('boards', {
    id: '1',
    name: 'First board',
    color: '#e0e0e0',
    createdBy: 'demo-user-1',
    createdAt: Date.now(),
  })
})

// Clear all boards (do this on a regular cadence for public examples)
export const clear = internalMutation(async (ctx) => {
  const allBoards = await ctx.db.query('boards').collect()
  for (const board of allBoards) {
    await ctx.db.delete(board._id)
  }
  
  // Ensure demo user exists for the cleared board
  const existingDemoUser = await ctx.db
    .query('users')
    .withIndex('authUserId', (q) => q.eq('authUserId', 'demo-user-1'))
    .first()
    
  if (!existingDemoUser) {
    await ctx.db.insert('users', {
      authUserId: 'demo-user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      karmaLevel: 85,
      tasksCompleted: 23,
      tasksAssigned: 18,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }
  
  await ctx.db.insert('boards', {
    id: '1',
    name: 'First board',
    color: '#e0e0e0',
    createdBy: 'demo-user-1',
    createdAt: Date.now(),
  })
})

function withoutSystemFields<T extends { _creationTime: number; _id: Id<any> }>(
  doc: T,
) {
  const { _id, _creationTime, ...rest } = doc
  return rest
}

async function getFullBoard(ctx: QueryCtx, id: string) {
  const board = withoutSystemFields(await ensureBoardExists(ctx, id))

  const [columns, items] = await Promise.all([
    ctx.db
      .query('columns')
      .withIndex('board', (q) => q.eq('boardId', board.id))
      .collect(),
    ctx.db
      .query('items')
      .withIndex('board', (q) => q.eq('boardId', board.id))
      .collect(),
  ])

  return {
    ...board,
    columns: columns.map(withoutSystemFields),
    items: items.map(withoutSystemFields),
  }
}

export const getBoards = query({
  args: { authUserId: v.optional(v.string()) },
  handler: async (ctx, { authUserId }) => {
    let boards
    if (authUserId) {
      // Get boards created by specific user
      boards = await ctx.db
        .query('boards')
        .withIndex('createdBy', (q) => q.eq('createdBy', authUserId))
        .collect()
    } else {
      // Get all boards (for backwards compatibility)
      boards = await ctx.db.query('boards').collect()
    }
    return await Promise.all(boards.map((b) => getFullBoard(ctx, b.id)))
  },
})

// Get all boards (public endpoint)
export const getAllBoards = query(async (ctx) => {
  const boards = await ctx.db.query('boards').collect()
  return await Promise.all(boards.map((b) => getFullBoard(ctx, b.id)))
})

// Get boards for a specific user
export const getUserBoards = query({
  args: { authUserId: v.string() },
  handler: async (ctx, { authUserId }) => {
    const boards = await ctx.db
      .query('boards')
      .withIndex('createdBy', (q) => q.eq('createdBy', authUserId))
      .collect()
    return await Promise.all(boards.map((b) => getFullBoard(ctx, b.id)))
  },
})

export const getBoard = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return await getFullBoard(ctx, id)
  },
})

async function ensureBoardExists(
  ctx: QueryCtx,
  boardId: string,
): Promise<Doc<'boards'>> {
  const board = await ctx.db
    .query('boards')
    .withIndex('id', (q) => q.eq('id', boardId))
    .unique()

  invariant(board, `missing board ${boardId}`)
  return board
}
async function ensureColumnExists(
  ctx: QueryCtx,
  columnId: string,
): Promise<Doc<'columns'>> {
  const column = await ctx.db
    .query('columns')
    .withIndex('id', (q) => q.eq('id', columnId))
    .unique()

  invariant(column, `missing column: ${columnId}`)
  return column
}
async function ensureItemExists(
  ctx: QueryCtx,
  itemId: string,
): Promise<Doc<'items'>> {
  const item = await ctx.db
    .query('items')
    .withIndex('id', (q) => q.eq('id', itemId))
    .unique()

  invariant(item, `missing item: ${itemId}`)
  return item
}

// Check if user has access to board (owner or collaborator)
async function ensureUserCanAccessBoard(
  ctx: QueryCtx,
  boardId: string,
  authUserId?: string,
): Promise<Doc<'boards'>> {
  const board = await ensureBoardExists(ctx, boardId)
  
  // For now, only check ownership. Later can add collaboration logic
  if (authUserId && board.createdBy && board.createdBy !== authUserId) {
    throw new Error(`Access denied: User ${authUserId} cannot access board ${boardId}`)
  }
  
  return board
}

// Create a new board
export const createBoard = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    authUserId: v.string(),
  },
  handler: async (ctx, { name, color, authUserId }) => {
    const boardId = crypto.randomUUID()
    
    await ctx.db.insert('boards', {
      id: boardId,
      name,
      color: color || '#e0e0e0',
      createdBy: authUserId,
      createdAt: Date.now(),
    })
    
    return boardId
  },
})

export const createColumn = mutation({
  args: {
    ...newColumnsSchema.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { boardId, name, authUserId }) => {
    await ensureUserCanAccessBoard(ctx, boardId, authUserId)

    const existingColumns = await ctx.db
      .query('columns')
      .withIndex('board', (q) => q.eq('boardId', boardId))
      .collect()

    ctx.db.insert('columns', {
      boardId,
      name,
      order: existingColumns.length + 1,
      id: crypto.randomUUID(),
    })
  },
})

export const createItem = mutation({
  args: {
    ...schema.tables.items.validator.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...item }) => {
    await ensureUserCanAccessBoard(ctx, item.boardId, authUserId)
    await ctx.db.insert('items', item)
  },
})

export const deleteItem = mutation({
  args: {
    ...deleteItemSchema.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { id, boardId, authUserId }) => {
    await ensureUserCanAccessBoard(ctx, boardId, authUserId)
    const item = await ensureItemExists(ctx, id)
    await ctx.db.delete(item._id)
  },
})

export const updateItem = mutation({
  args: {
    ...schema.tables.items.validator.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...newItem }) => {
    const { id, boardId } = newItem
    await ensureUserCanAccessBoard(ctx, boardId, authUserId)
    const item = await ensureItemExists(ctx, id)
    await ctx.db.patch(item._id, newItem)
  },
})

export const updateColumn = mutation({
  args: {
    ...updateColumnSchema.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...newColumn }) => {
    const { id, boardId } = newColumn
    await ensureUserCanAccessBoard(ctx, boardId, authUserId)
    const column = await ensureColumnExists(ctx, id)
    await ctx.db.patch(column._id, newColumn)
  },
})

export const updateBoard = mutation({
  args: {
    ...updateBoardSchema.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, ...boardUpdate }) => {
    const board = await ensureUserCanAccessBoard(ctx, boardUpdate.id, authUserId)
    await ctx.db.patch(board._id, boardUpdate)
  },
})

export const deleteColumn = mutation({
  args: {
    ...deleteColumnSchema.fields,
    authUserId: v.optional(v.string()),
  },
  handler: async (ctx, { boardId, id, authUserId }) => {
    await ensureUserCanAccessBoard(ctx, boardId, authUserId)
    const column = await ensureColumnExists(ctx, id)
    const items = await ctx.db
      .query('items')
      .withIndex('column', (q) => q.eq('columnId', id))
      .collect()
    await Promise.all(items.map((item) => ctx.db.delete(item._id)))
    await ctx.db.delete(column._id)
  },
})
