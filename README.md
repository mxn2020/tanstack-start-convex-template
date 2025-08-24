# TanStack Start + Convex Template

A production-ready template for building real-time full-stack React applications with TanStack Start and Convex, featuring a dual-branch setup for development and testing.

## 🚀 Features

- **TanStack Start**: Full-stack React framework with SSR
- **Convex**: Real-time backend database with automatic synchronization
- **TanStack Router**: Type-safe file-based routing  
- **TanStack Query**: Server state management with Convex integration
- **Real-time Updates**: Automatic data synchronization across clients
- **Zod**: Schema validation and type inference
- **Tailwind CSS v4**: Modern styling with CSS variables
- **TypeScript**: Full type safety
- **MSW**: Mock Service Worker for API development
- **Dual React Setup**: React 19 for development, React 18 for testing

## 📁 Project Structure

```
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema definitions
│   ├── board.ts           # Board operations (queries/mutations)
│   ├── crons.ts           # Scheduled functions
│   └── _generated/        # Auto-generated Convex APIs
├── src/
│   ├── components/        # Reusable UI components
│   ├── db/               # Client-side schemas (Zod)
│   ├── routes/           # File-based routing
│   ├── styles/           # Global styles and Tailwind
│   └── queries.ts        # TanStack Query + Convex integration
└── README.md
```

## 🔧 Quick Start

### Prerequisites

1. **Create Convex account**: Sign up at [convex.dev](https://convex.dev)
2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up Convex**:
   ```bash
   npx convex dev --once
   ```
   Follow the prompts to authenticate and create your project.

4. **Start development**:
   ```bash
   pnpm dev
   ```

### Development Workflow

- **Main branch**: React 19 for development with Convex
- **Test branch**: React 18 with comprehensive test suite via worktree

## 📊 Available Scripts

### Main Branch (Development)
```bash
pnpm dev              # Start Convex + Vite dev servers
pnpm dev:web          # Start only Vite dev server  
pnpm dev:db           # Start Convex dev with seed data
pnpm build            # Build for production
pnpm start            # Start production server
```

### Convex Commands
```bash
npx convex dev        # Start Convex development
npx convex deploy     # Deploy to production
npx convex dashboard  # Open Convex dashboard
```

### Test Branch (Testing)
```bash
pnpm test            # Run tests
pnpm test:ui         # Run tests with UI
pnpm test:coverage   # Run tests with coverage
```

## 🏗️ Architecture

### Real-time Data Flow

```
UI Components → TanStack Query → Convex Functions → Convex Database
     ↑                                    ↓
Real-time Updates ← WebSocket ← Convex Subscriptions
```

### Key Patterns

1. **Real-time Synchronization**: Convex provides automatic real-time updates
2. **Optimistic Updates**: Immediate UI feedback with automatic rollback
3. **Type Safety**: Full TypeScript with Convex + Zod validation
4. **Server Functions**: Type-safe backend queries and mutations
5. **SSR Ready**: Server-side rendering support

### Convex Integration

- **Queries**: Real-time data fetching with automatic updates
- **Mutations**: Type-safe data modifications
- **Subscriptions**: WebSocket-based live updates
- **File Storage**: Built-in file upload capabilities
- **Authentication**: Integrated auth system

## 📚 Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 19.x (main), 18.x (test) |
| TanStack Start | Full-stack framework | Latest |
| TanStack Router | Routing | Latest |
| TanStack Query | Client state + Convex | Latest |
| Convex | Real-time backend | Latest |
| TypeScript | Type safety | 5.x |
| Tailwind CSS | Styling | 4.x |
| Zod | Validation | 4.x |
| Vite | Build tool | 7.x |

## 🔄 Development Workflow

### 1. Schema Definition (Convex)
```typescript
// convex/schema.ts
export default defineSchema({
  boards: defineTable({
    title: v.string(),
    createdAt: v.number(),
  }),
});
```

### 2. Backend Functions (Convex)
```typescript
// convex/board.ts
export const getBoards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("boards").collect();
  },
});
```

### 3. Client Integration (TanStack Query)
```typescript
// src/queries.ts  
export const useBoardsQuery = () => {
  return useSuspenseQuery(convexQuery(api.board.getBoards, {}));
};
```

## 🧪 Testing Setup

The template includes a separate test worktree with:

- **Vitest**: Fast unit test runner
- **Testing Library**: React component testing
- **jsdom**: Browser environment simulation  
- **MSW**: API mocking for tests
- **Coverage reporting**: v8 provider

### Setting Up Test Environment

```bash
# Create test worktree manually (if needed)
git worktree add ../project-name-test test
```

## 🚀 Deployment

### Convex Deployment
```bash
npx convex deploy --prod
```

### Application Deployment
Ready for deployment on:
- **Vercel** (recommended)
- **Netlify**  
- **Railway**
- Any Node.js hosting platform

Build command: `pnpm build`
Output directory: `.tanstack/start/build`

## 🎯 Best Practices

### Real-time Architecture
- Use Convex queries for real-time data
- Implement optimistic updates for mutations
- Leverage automatic query invalidation
- Design for collaborative features

### Data Modeling
- Define clear Convex schemas
- Use Zod for client-side validation
- Implement proper relationships
- Consider query performance

### State Management
- Use TanStack Query + Convex for server state
- Minimize client-only state
- Leverage real-time subscriptions
- Cache strategically

## 📖 Learn More

- [Convex Documentation](https://docs.convex.dev)
- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router) 
- [TanStack Query Docs](https://tanstack.com/query)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)

## 📄 License

MIT License - feel free to use this template for your projects.

---

**Build real-time applications with confidence!** ⚡