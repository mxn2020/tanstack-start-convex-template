# Modern Full-Stack Template

A production-ready template for building modern full-stack applications with authentication, real-time features, and comprehensive tooling.

## 🚀 Tech Stack

### Core Framework
- **TanStack Start** - Full-stack React framework with SSR
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Powerful server state management
- **React 18/19** - Latest React features with concurrent rendering
- **TypeScript** - Full type safety across the stack
- **Vite** - Lightning-fast build tool

### Authentication & Database
- **Better Auth** - Modern authentication with multiple providers
- **Neon Database** - Serverless PostgreSQL for auth data
- **Prisma** - Type-safe database client and migrations
- **Convex** - Real-time backend database with automatic sync

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS with latest features
- **Lucide React** - Beautiful icon system
- **React Hot Toast** - Elegant notifications

### Development & Testing
- **Vitest** - Fast unit test runner
- **Testing Library** - React component testing
- **MSW** - API mocking for development/testing
- **ESLint + Prettier** - Code quality and formatting

## ✨ Key Features

### 🔐 Authentication System
- **Multiple Auth Providers**: Email/password, Google, GitHub, Apple, Twitter
- **Secure Session Management**: HTTP-only cookies with Better Auth
- **Password Reset Flow**: Complete forgot/reset password functionality
- **User Profile Management**: Update profile info and preferences
- **Automatic User Sync**: Auth data automatically synced between Neon and Convex

### 🔄 Real-time Features
- **Live Data Updates**: Automatic synchronization across all clients
- **Optimistic Updates**: Immediate UI feedback with rollback
- **WebSocket Integration**: Real-time collaboration built-in
- **Offline Support**: Graceful offline/online state handling

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind
- **Dark/Light Mode Ready**: Theme system built-in
- **Loading States**: Beautiful loading indicators and skeletons
- **Error Boundaries**: Comprehensive error handling
- **Accessibility**: WCAG compliant components

### 📊 Sample Application
- **Kanban Boards**: Drag-and-drop task management
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **Task Management**: Create, update, delete tasks and columns
- **Board Management**: Multiple boards per user
- **Notification System**: Task assignments and completions

## 📁 Project Structure

```
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   ├── app/             # App layout and navigation
│   │   └── Dashboard/       # Dashboard components
│   ├── routes/              # File-based routing
│   ├── lib/                 # Core utilities and configs
│   │   ├── auth-client.ts   # Better Auth client setup
│   │   ├── auth-server.ts   # Better Auth server setup
│   │   └── auth.ts          # Auth utilities
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   ├── types.ts             # Global TypeScript types
│   └── queries.ts           # TanStack Query definitions
├── convex/                  # Convex backend
│   ├── schema.ts           # Database schema
│   ├── board.ts            # Board-related functions
│   ├── users.ts            # User management
│   ├── notifications.ts    # Notification system
│   └── migrations/         # Database migrations
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma schema for auth
│   └── migrations/         # SQL migrations
└── docker-compose.yml      # Local PostgreSQL setup
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **pnpm** (recommended) or npm
- **Docker** (for local PostgreSQL)

### 1. Clone and Install
```bash
git clone <your-repo>
cd your-project
pnpm install
```

### 2. Environment Setup
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Convex
VITE_CONVEX_URL="your-convex-url"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# ... other providers
```

### 3. Database Setup
```bash
# Start local PostgreSQL (optional)
docker-compose up -d

# Run Prisma migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

### 4. Convex Setup
```bash
# Login to Convex and create project
npx convex dev --once

# This will prompt you to create/select a project
# Update VITE_CONVEX_URL in .env.local with the provided URL
```

### 5. Start Development
```bash
pnpm dev
```

Your app will be available at `http://localhost:3000`

## 📋 Available Scripts

### Development
```bash
pnpm dev              # Start both Convex and Vite dev servers
pnpm dev:web          # Start only Vite dev server
pnpm dev:db           # Start Convex dev with seed data
```

### Database
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:push          # Push schema without migration
pnpm db:reset         # Reset database
```

### Build & Deploy
```bash
pnpm build            # Build for production
pnpm start            # Start production server
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
```

### Convex
```bash
npx convex dev        # Start Convex development
npx convex deploy     # Deploy functions to production
npx convex dashboard  # Open Convex dashboard
```

## 🏗️ Architecture Overview

### Authentication Flow
```
User Signup/Login → Better Auth → Neon PostgreSQL → Webhook → Convex Sync
```

### Real-time Data Flow
```
UI Components → TanStack Query → Convex Functions → Convex Database
     ↑                                    ↓
Real-time Updates ← WebSocket ← Convex Subscriptions
```

### Key Patterns
1. **Dual Database Architecture**: Neon for auth, Convex for app data
2. **Automatic User Sync**: Users created in auth DB are auto-synced to Convex
3. **Optimistic Updates**: Immediate UI feedback with automatic rollback
4. **Type Safety**: End-to-end TypeScript with Zod validation
5. **Real-time by Default**: All data queries are live-updating

## 🌍 Deployment

### Recommended Platforms
- **Vercel** (recommended) - Perfect TanStack Start integration
- **Netlify** - Great for static + serverless
- **Railway** - Simple full-stack deployment

### Environment Variables for Production
```bash
# Update these for production
BETTER_AUTH_URL="https://your-domain.com"
VITE_BETTER_AUTH_URL="https://your-domain.com"
DATABASE_URL="your-production-db-url"
VITE_CONVEX_URL="your-production-convex-url"
```

### Deployment Steps
1. **Deploy Convex**: `npx convex deploy --prod`
2. **Deploy App**: Connect your repository to Vercel/Netlify
3. **Configure Environment**: Add production environment variables
4. **Run Migrations**: Ensure database is migrated in production

## 🔧 Configuration

### Better Auth Providers
Enable additional OAuth providers in `src/lib/auth-server.ts`:
```typescript
socialProviders: {
  google: { /* config */ },
  github: { /* config */ },
  apple: { /* config */ },
  twitter: { /* config */ },
}
```

### Convex Schema
Extend the database schema in `convex/schema.ts`:
```typescript
export default defineSchema({
  // Add your tables here
  yourTable: defineTable({
    // your fields
  }),
})
```

### Tailwind Theme
Customize your design system in `tailwind.config.js` and CSS custom properties.

## 🧪 Testing

### Unit Tests
```bash
pnpm test              # Run all tests
pnpm test:ui           # Run with UI
pnpm test:coverage     # Generate coverage report
```

### Test Structure
- **Component Tests**: `src/components/**/*.test.tsx`
- **Hook Tests**: `src/hooks/**/*.test.ts`
- **Integration Tests**: `src/test/integration/`
- **E2E Tests**: `src/test/e2e/` (add Playwright for E2E)

## 📚 Learning Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [Better Auth Documentation](https://better-auth.com)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)

## 🤝 Contributing

This template is designed to be a starting point for your projects. Feel free to:
- Remove features you don't need
- Add features specific to your use case
- Customize the styling and branding
- Extend the authentication providers
- Add more real-time features

## 📄 License

MIT License - Use this template freely for your projects!

---

**Ready to build something amazing? This template gives you everything you need to create modern, real-time, full-stack applications with confidence!** 🚀