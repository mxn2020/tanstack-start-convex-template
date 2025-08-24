// src/db/schema.ts

import { z } from 'zod'

// Zod is necessary for client side parsing.

export const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  order: z.coerce.number(),
  columnId: z.string(),
  boardId: z.coerce.string(),
})

export const deleteItemSchema = itemSchema.pick({ id: true, boardId: true })

export const yallaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['community', 'assigned']),
  creatorId: z.string(),
  circleId: z.string(),
  assignedTo: z.array(z.string()).optional(),
  status: z.enum(['pending', 'accepted', 'completed', 'declined']),
  priority: z.number(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  completionImage: z.string().optional(),
  createdAt: z.date(),
})

export const voteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  yallaId: z.string(),
  value: z.number(), // 1 for upvote, -1 for downvote
  createdAt: z.date(),
})

export const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  circleId: z.string(),
  participants: z.array(z.string()),
  deadline: z.date(),
  completedBy: z.array(z.string()),
  createdAt: z.date(),
})

// Extended Yalla interface that includes votes array
export const yallaWithVotesSchema = yallaSchema.extend({
  votes: z.array(voteSchema),
})

export type Yalla = z.infer<typeof yallaSchema>
export type Vote = z.infer<typeof voteSchema>
export type Challenge = z.infer<typeof challengeSchema>
export type YallaWithVotes = z.infer<typeof yallaWithVotesSchema>
