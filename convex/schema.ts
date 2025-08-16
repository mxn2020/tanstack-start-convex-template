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

  circles: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    color: v.string(),
    adminId: v.string(), // authUserId of the admin/creator
    assignmentPermissions: v.union(v.literal('admin-only'), v.literal('all-members')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('id', ['id'])
    .index('adminId', ['adminId']),

  circle_members: defineTable({
    circleId: v.string(),
    userId: v.string(), // authUserId
    role: v.union(v.literal('admin'), v.literal('member')),
    joinedAt: v.number(),
  })
    .index('circle', ['circleId'])
    .index('user', ['userId'])
    .index('circle_user', ['circleId', 'userId']),

  yallas: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('community'), v.literal('assigned')),
    creatorId: v.string(), // authUserId
    circleId: v.string(),
    assignedTo: v.optional(v.array(v.string())), // array of authUserIds
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('completed'), v.literal('declined')),
    priority: v.number(),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    completionImage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('id', ['id'])
    .index('creator', ['creatorId'])
    .index('circle', ['circleId'])
    .index('status', ['status'])
    .index('type', ['type']),

  votes: defineTable({
    id: v.string(),
    userId: v.string(), // authUserId
    yallaId: v.string(),
    value: v.number(), // 1 for upvote, -1 for downvote
    createdAt: v.number(),
  })
    .index('id', ['id'])
    .index('user', ['userId'])
    .index('yalla', ['yallaId'])
    .index('user_yalla', ['userId', 'yallaId']),

  challenges: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    circleId: v.string(),
    participants: v.array(v.string()), // array of authUserIds
    deadline: v.number(),
    completedBy: v.array(v.string()), // array of authUserIds
    createdAt: v.number(),
  })
    .index('id', ['id'])
    .index('circle', ['circleId'])
    .index('deadline', ['deadline']),

  notifications: defineTable({
    id: v.string(),
    userId: v.string(), // authUserId of recipient
    type: v.union(v.literal('vote'), v.literal('assignment'), v.literal('completion'), v.literal('invite'), v.literal('achievement'), v.literal('reminder')),
    title: v.string(),
    message: v.string(),
    emoji: v.string(),
    isRead: v.boolean(),
    actionUrl: v.optional(v.string()),
    entityType: v.optional(v.union(v.literal('yalla'), v.literal('circle'), v.literal('user'))),
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
const circle = schema.tables.circles.validator
const circleMember = schema.tables.circle_members.validator
const yalla = schema.tables.yallas.validator
const vote = schema.tables.votes.validator
const challenge = schema.tables.challenges.validator
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
export type Circle = Infer<typeof circle>
export type CircleMember = Infer<typeof circleMember>
export type Yalla = Infer<typeof yalla>
export type Vote = Infer<typeof vote>
export type Challenge = Infer<typeof challenge>
export type Notification = Infer<typeof notification>
