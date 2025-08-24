// convex/schema.ts

import { defineSchema, defineTable } from 'convex/server'
import { type Infer, v } from 'convex/values'

const schema = defineSchema({
  users: defineTable({
    authUserId: v.string(), // Reference to Better Auth user ID
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    karmaLevel: v.number(),
    tasksCompleted: v.number(),
    tasksAssigned: v.number(),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()), // "light", "dark", "auto"
      notifications: v.optional(v.boolean()),
      language: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('authUserId', ['authUserId'])
    .index('email', ['email']),

  boards: defineTable({
    id: v.string(),
    name: v.string(),
    color: v.string(),
    createdBy: v.optional(v.string()), // authUserId of creator
    createdAt: v.optional(v.number()),
  }).index('id', ['id'])
    .index('createdBy', ['createdBy']),

  columns: defineTable({
    id: v.string(),
    boardId: v.string(),
    name: v.string(),
    order: v.number(),
  })
    .index('id', ['id'])
    .index('board', ['boardId']),

  items: defineTable({
    id: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    order: v.number(),
    columnId: v.string(),
    boardId: v.string(),
  })
    .index('id', ['id'])
    .index('column', ['columnId'])
    .index('board', ['boardId']),


  notifications: defineTable({
    id: v.string(),
    userId: v.string(), // authUserId of recipient
    type: v.union(v.literal('assignment'), v.literal('completion'), v.literal('invite'), v.literal('achievement'), v.literal('reminder')),
    title: v.string(),
    message: v.string(),
    emoji: v.string(),
    isRead: v.boolean(),
    actionUrl: v.optional(v.string()),
    entityType: v.optional(v.union(v.literal('board'), v.literal('item'), v.literal('user'))),
    entityId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('id', ['id'])
    .index('user', ['userId'])
    .index('user_read', ['userId', 'isRead'])
    .index('created', ['createdAt']),
})
export default schema

const user = schema.tables.users.validator
const board = schema.tables.boards.validator
const column = schema.tables.columns.validator
const item = schema.tables.items.validator
const notification = schema.tables.notifications.validator

export const updateBoardSchema = v.object({
  id: board.fields.id,
  name: v.optional(board.fields.name),
  color: v.optional(v.string()),
})

export const updateColumnSchema = v.object({
  id: column.fields.id,
  boardId: column.fields.boardId,
  name: v.optional(column.fields.name),
  order: v.optional(column.fields.order),
})

export const deleteItemSchema = v.object({
  id: item.fields.id,
  boardId: item.fields.boardId,
})
const { order, id, ...rest } = column.fields
export const newColumnsSchema = v.object(rest)
export const deleteColumnSchema = v.object({
  boardId: column.fields.boardId,
  id: column.fields.id,
})

export type User = Infer<typeof user>
export type Board = Infer<typeof board>
export type Column = Infer<typeof column>
export type Item = Infer<typeof item>
export type Notification = Infer<typeof notification>
