# nano

<table width="100%">
	<tr>
		<td align="left" width="120">
			<div style="width:100px;height:100px;border-radius:24px;background:#748cf8;color:#fff;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:700;">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-icon lucide-message-circle"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
      </div>
		</td>
		<td align="right">
			<h1>nano</h1>
			<h3 style="margin-top: -10px;">A client-first chat application for the web.</h3>
		</td>
	</tr>
</table>

## Why?

- **Privacy**: chat state is handled by your own backend, with browser storage used for local persistence and fast restores.
- **Real-time**: Socket.IO keeps rooms, messages, and presence in sync.
- **Simple**: one monorepo covers the web app, API, shared utilities, and email templates.

## Features

The nano app supports:

- 💬&nbsp;Client-first chat rooms and direct messaging.
- ⚡&nbsp;Real-time updates with Socket.IO.
- 🔐&nbsp;Email/password and Google authentication.
- 💾&nbsp;Local message persistence for quick reloads and offline-friendly behavior.
- 🌗&nbsp;Dark mode support.
- 🧩&nbsp;Shared TypeScript utilities across web, API, and email packages.
- 🗂️&nbsp;Room creation, history, deletion, and leave flows.
- 🔎&nbsp;Modern search and navigation workflows in the web app.

## What's inside?

This monorepo includes the following apps and packages:

### Apps and Packages

- `apps/web`: Vite + React chat client with TanStack Router, React Query, and local state persistence
- `apps/api`: Hono API with Better Auth, Drizzle ORM, PostgreSQL, Redis, and Socket.IO
- `packages/shared`: shared helpers and compression utilities used by both apps
- `packages/email`: React Email templates and mailer helpers
- `packages/eslint-config`: shared ESLint configuration
- `packages/typescript-config`: shared TypeScript configuration presets

Each app and package is written in TypeScript.

### Utilities

This workspace also includes the core tooling needed for day-to-day development:

- Turbo for task orchestration
- TypeScript for static type checking
- ESLint for code linting
- Prettier for code formatting
- Docker Compose for local PostgreSQL and Redis

## Project Structure

- `apps/web/`: browser app and UI components
- `apps/api/`: server routes, auth, sockets, and database access
- `packages/email/`: email templates and mail transport
- `packages/shared/`: reusable utilities shared across the workspace
- `packages/eslint-config/`: centralized lint rules
- `packages/typescript-config/`: shared TypeScript config files

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- [pnpm](https://pnpm.io/) 8 or newer
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)

> **Note:** Docker is optional if you only want to work on the web UI, but it is required for the API, Postgres, and Redis.

### Setup

1. Clone the repository and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment files:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

   If you use social or email auth flows, make sure the web env file also includes `VITE_CLIENT_URL=http://localhost:3000`.

3. Start PostgreSQL and Redis:

   ```bash
   docker compose up -d
   ```

4. Start the workspace:

   ```bash
   pnpm dev
   ```

The web app will be available at [http://localhost:3000](http://localhost:3000) and the API will listen on [http://localhost:5000](http://localhost:5000).

If you want to run only one app while developing, use:

```bash
pnpm --filter web dev
pnpm --filter @nano/api dev
```

### Environment Variables

The API requires `DATABASE_URL` and `BETTER_AUTH_SECRET`. The local defaults in `apps/api/.env.example` are enough for development once Docker is running.

If you want Google sign-in, also provide `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

The web app reads `VITE_API_URL`, `VITE_SOCKET_URL`, and `VITE_CLIENT_URL` for API requests, socket connections, and auth callbacks.

### Local Email Development

If you are working on the email package, you can run the preview server from the package directory:

```bash
pnpm --filter @nano/email email:dev
```

## Contributing

This is the early development stage of this project if you find something missing or found a bug? Open an issue or start a discussion with the maintainers.

Want to contribute? Good places to start are chat UX, room management, auth flows, real-time syncing, performance, and shared utilities.

If you are adding a bigger change, review the repo structure first and keep the web and API contracts aligned.

Before opening a PR, run the workspace checks that apply to your change:

```bash
pnpm lint
pnpm build
```

Want to help with docs or workflow improvements? Open a PR with the smallest useful change.

## License

MIT License - see [LICENSE](LICENSE) for details.
