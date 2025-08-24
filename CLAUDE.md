# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev server**: `pnpm dev` - Starts Convex dev + Vite dev server on port 3000
- **Web only**: `pnpm dev:web` - Starts only Vite dev server
- **Database**: `pnpm dev:db` - Starts Convex dev with seed data
- **Build**: `pnpm build` - Builds the application and runs TypeScript check
- **Start**: `pnpm start` - Starts the production server

## Architecture Overview

This is a Trello-like kanban board application built with TanStack Start (full-stack React framework) and Convex (real-time backend). The architecture follows these key patterns:

### Core Technologies
- **TanStack Start**: Full-stack React framework with SSR
- **TanStack Router**: Type-safe file-based routing
- **TanStack Query**: Server state management with optimistic updates
- **Convex**: Real-time backend database and API
- **@convex-dev/react-query**: TanStack Query integration for Convex
- **Zod**: Schema validation and type inference
- **Tailwind CSS v4**: Modern styling with CSS variables
- **MSW**: Mock Service Worker for API mocking

### Application Structure

#### Backend Layer (`convex/`)
- `schema.ts`: Convex database schema definitions
- `board.ts`: Convex functions for board operations (queries and mutations)
- `crons.ts`: Scheduled functions and background jobs
- `_generated/`: Auto-generated Convex API and type definitions

#### Data Layer (`src/db/`)
- `schema.ts`: Zod schemas for client-side validation and type inference

#### Query Layer (`src/queries.ts`)
- Centralized query definitions using TanStack Query + Convex
- Real-time updates through Convex subscriptions
- Optimistic updates for all mutations (create/update/delete operations)

#### Routing (`src/routes/`)
- File-based routing with TanStack Router
- `__root.tsx`: Root layout with error boundaries, loading states, and global UI
- `index.tsx`: Homepage with board list
- `boards.$boardId.tsx`: Individual board view with drag-and-drop functionality

#### Components (`src/components/`)
- Modular UI components following React patterns
- Real-time updates through Convex queries
- Error boundaries and loading states built-in
- Form components with validation

### Key Architectural Patterns

1. **Real-time Updates**: Convex provides automatic real-time synchronization
2. **Optimistic Updates**: TanStack Query + Convex for immediate UI feedback
3. **Type Safety**: Full TypeScript coverage with Zod + Convex schema validation
4. **Error Handling**: Global error boundaries and toast notifications
5. **SSR Integration**: TanStack Router with server-side rendering support

### State Management Strategy
- **Server State**: TanStack Query + Convex for real-time server state
- **Real-time Subscriptions**: Convex queries automatically update on data changes
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **No separate client state management library needed**

### Database Schema (Convex)
- **boards**: Board entities with metadata
- **columns**: Column entities linked to boards
- **items**: Task/card entities linked to columns
- Real-time subscriptions and automatic updates

### Path Aliases
- `~/`: Maps to `src/` directory via tsconfig paths

## Convex Integration

### Development Workflow
1. **Start Convex**: `npx convex dev --once` (first time setup)
2. **Development**: `pnpm dev` (runs both Convex and Vite)
3. **Deploy**: `npx convex deploy` (production deployment)

### Key Convex Features
- **Real-time Database**: Automatic synchronization across clients
- **Server Functions**: Type-safe backend functions (queries/mutations)
- **File Storage**: Built-in file upload and storage
- **Authentication**: Integrated auth system
- **Cron Jobs**: Scheduled background tasks

### Convex Functions Structure
```typescript
// Query example
export const getBoardsQuery = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("boards").collect();
  },
});

// Mutation example  
export const createBoardMutation = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const boardId = await ctx.db.insert("boards", {
      title: args.title,
      createdAt: Date.now(),
    });
    return boardId;
  },
});
```

## Development Notes

- When unlocking a color card, implement a method to refresh and load/show color details without a page refresh (client-side update)
- Convex provides real-time updates automatically - leverage this for collaborative features
- Use Convex mutations for all data modifications to ensure real-time sync
- Always use Zod schemas for client-side validation before sending to Convex

## Important Instructions

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.