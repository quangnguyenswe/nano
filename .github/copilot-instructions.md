# AI Coding Agent Instructions for Huddle

## Project Overview

**Huddle** is a monorepo chat application using TypeScript, Hono (backend), React + Vite (frontend), PostgreSQL, and real-time Socket.IO communication. The architecture separates concerns across frontend (`apps/web`), backend API (`apps/api`), and shared packages.

## Build & Execution

- **Monorepo Tool**: Turbo (workspace: pnpm, node modules not installed at root)
- **Dev Commands**:
  - `pnpm dev` — runs all apps simultaneously (API on `5000`, Web on `3000`)
  - `pnpm build` — builds both apps; API output in `dist/`
  - `pnpm lint` — lints with ESLint configured in `packages/eslint-config`
- **Database**: PostgreSQL (Docker Compose). Migrations via Drizzle (`pnpm db:push` in `apps/api`)
- **Key Files**: `turbo.json` defines task dependencies; `pnpm-workspace.yaml` defines package structure

## Architecture Patterns

### Backend (Hono + Better-Auth)

- **Framework**: Hono (lightweight web framework, similar to Express)
- **Location**: `apps/api/src/`
- **Auth**: Better-Auth library with Drizzle ORM adapter, email+password + OAuth (Discord/Google/Facebook)
- **Key Flow**:
  - Auth routes at `routes/auth.route.ts` (all auth endpoints routed to `better-auth`)
  - Database schema in `db/schema.ts` (Drizzle SQL builder)
  - Type-safe context via `shared/context.ts` (attaches user/session to Hono context)
- **Real-time**: Socket.IO server in `socket/` with room-based chat architecture
  - Authentication middleware in `socket/middleware/auth.ts` validates JWT from cookies
  - Handlers in `socket/handlers/` (connection, chat, message)
  - RoomManager in `socket/rooms/manager.ts` manages room subscriptions

### Frontend (React + Vite + TanStack)

- **Location**: `apps/web/src/`
- **Routing**: TanStack Router with file-based routing (`routes/` auto-generates `routeTree.gen.ts`)
  - Root layout: `routes/__root.tsx` wraps all routes
  - Protected routes use `_layout.tsx` middleware pattern
- **State**:
  - Global UI state: Zustand (`store/page.ts` for progress messages)
  - Server state: TanStack Query (react-query)
  - Auth state: `authClient` from Better-Auth (cookies stored via `lib/cookies.ts`)
- **Real-time**: Socket.IO client in `providers/socket.tsx` provides `useSocket()` hook
  - Socket connection requires auth token (validated server-side)
  - Emits/listens to room join/leave/message events
- **UI Components**: Radix UI + Tailwind in `components/ui/` (auto-generated shadcn-style components)
  - Forms use React Hook Form + Zod validation
  - Toast notifications via Sonner

### Data Flow Example: User Sends Message

1. User types in `ChatInput` → form submission
2. Frontend emits `message:send` via Socket.IO to backend
3. Backend `socket/handlers/message.ts` receives, validates, broadcasts to room
4. All connected clients in room receive update via `onMessageUpdate` listener
5. TanStack Query invalidates cache, UI re-renders

## Key Developer Workflows

### Adding API Endpoints

1. Create handler in `apps/api/src/controllers/` (if needed)
2. Add route in `apps/api/src/routes/` (register with Hono)
3. Add types to `packages/common/` if shared with frontend
4. Test with `curl` or REST client (check `apps/api/src/index.ts` for CORS origins)

### Database Changes

1. Update schema in `apps/api/src/db/schema.ts`
2. Run `pnpm db:generate` in `apps/api/` to create migration files
3. Run `pnpm db:push` to apply changes
4. Update TypeScript types if needed

### Adding Frontend Pages

1. Create `.tsx` file in `apps/web/src/routes/` (auto-routed by TanStack)
2. Export default component and `Route` object:
   ```tsx
   export const Route = createFileRoute("/new-page")({ component: PageName });
   ```
3. Use `useAuth()` hook from `providers/auth.tsx` for auth checks
4. Use `useSocket()` hook from `providers/socket.tsx` for real-time features

### Real-Time Chat Features

1. Client: Listen via `useSocket().onMessageUpdate()` or emit with `emitMessage()`
2. Server: Handle in `socket/handlers/` and use `RoomManager` to broadcast
3. Rooms managed by `currentChatflowId` (state in Socket context)

## Critical Conventions

### Naming & Structure

- **Components**: PascalCase (React), use TypeScript for props
- **Routes**: Kebab-case with `_` prefix for layout wrapping (e.g., `_layout/page.tsx`)
- **DB Queries**: Use Drizzle SQL builder (ORM in `db/index.ts`)
- **API Routes**: Nested under `/api/` base path (Hono middleware)

### Type Safety

- Better-Auth exports `User` and `Session` types from `better-auth/types`
- All Hono handlers typed with `<Context>` generic for variables
- Zod schemas for form validation (e.g., auth forms)
- TanStack Router requires exported `Route` in every route file

### Environment Variables

- **Frontend**: `VITE_API_URL` (Vite requires `VITE_` prefix)
- **Backend**: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGINS` (comma-separated)
- **Node**: Both use `dotenv`, `.env` files loaded on startup

### Common Patterns

- **Error Handling**: Hono uses middleware; Socket.IO errors logged via Winston (`logger.ts`)
- **Auth Checks**: Better-Auth validates in middleware; frontend checks `authClient.useSession()`
- **Responsive Design**: Tailwind + `use-mobile.ts` hook for mobile detection
- **Async State**: TanStack Query handles loading/error states via `useQuery()`

## Common Pitfalls

1. **Monorepo Installs**: Always run `pnpm install` at root, not per-package
2. **CORS**: Check `CORS_ORIGINS` env var in backend if frontend requests fail
3. **Socket Auth**: Ensure cookies are sent with credentials: `true` in Socket.IO client config
4. **Route Types**: TanStack Router requires explicit `Route` export; missing export breaks routing
5. **Database**: Schema changes require Drizzle migration; pushing without migration causes ORM errors

## File Reference Guide

- API setup: [apps/api/src/index.ts](apps/api/src/index.ts)
- Auth config: [apps/api/src/auth.ts](apps/api/src/auth.ts), [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts)
- Socket handlers: [apps/api/src/socket/handlers/](apps/api/src/socket/handlers/)
- Frontend router: [apps/web/src/routes/](apps/web/src/routes/)
- UI components: [apps/web/src/components/ui/](apps/web/src/components/ui/)
- Shared types: [packages/common/src/](packages/common/src/)
