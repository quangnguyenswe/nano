---
description: Database schema conventions and patterns using Drizzle ORM and PostgreSQL. Use when working with database schemas (src/database/schemas/*), defining tables, creating migrations, or database model code. Triggers on Drizzle schema definition, database migrations, or ORM usage questions.
globs: apps/api/src/db/schemas/**/*
alwaysApply: false
---

# Database Schema Guidelines

This project uses Drizzle ORM with PostgreSQL. This document outlines schema conventions and best practices.

## Schema Definition

All schemas are defined in `apps/api/src/db/schemas/*.ts`. Each file should export a single table definition. For example, `auth.ts` defines the `authTable`:

```typescript
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);
```

## Naming Conventions

1. **Table names**: Use singular, lowercase with underscores: `user`, `session`, `account`
2. **Column names**: Use snake_case: `email`, `created_at`, `updated_at`
3. **Index names**: Format: `{table}_{column}_idx`
4. **Foreign key columns**: End with `_id`: `project_id`, `user_id`

```typescript
// Good: Consistent naming
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  providerId: text("provider_id").notNull(),
  scope: text("scope").notNull(),
});

// Bad: Inconsistent naming
export const workspaceUserTable = pgTable("WorkspaceUsers", {
  ID: text("ID").primaryKey(),
  workspace: text("workspace").notNull(),
  user: text("user").notNull(),
});
```

## Required Fields

Every table should include:

1. **Primary Key**: `id` field using nanoId
2. **Timestamps**: `created_at` and `updated_at` with proper defaults
3. **Foreign Keys**: Proper references with cascade options

```typescript
export const exampleTable = pgTable("example", {
  // Required: Primary key with uuid
  id: uuid("id").defaultRandom().primaryKey(),

  // Required: Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  // Foreign keys with cascade
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});
```

## ID Generation

Always use nanoId for primary keys:

```typescript
import { nanoid } from 'nanoid'

id: text("id")
  .$defaultFn(() => nanoid())
  .primaryKey(),
```

## Timestamps

Use consistent timestamp patterns:

```typescript
// Created timestamp (never changes)
createdAt: timestamp("created_at", { mode: "date" })
  .defaultNow()
  .notNull(),

// Updated timestamp (auto-updates on change)
updatedAt: timestamp("updated_at", { mode: "date" })
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull(),

// Optional timestamp (e.g., deleted_at)
deletedAt: timestamp("deleted_at", { mode: "date" }),
```

## Foreign Keys

Always specify cascade behavior:

```typescript
// Good: Explicit cascade behavior
userId: text("user_id")
  .notNull()
  .references(() => userTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

// Bad: Missing cascade options
userId: text("user_id").references(() => userTable.id),
```

### Cascade Options

- **`onDelete: "cascade"`**: Delete related records when parent is deleted
- **`onUpdate: "cascade"`**: Update foreign key when parent ID changes
- **`onDelete: "set null"`**: Set foreign key to null when parent is deleted (use nullable column)

## Indexes

Add indexes for frequently queried columns:

```typescript
export const taskTable = pgTable(
  "task",
  {
    // ... columns
    projectId: text("project_id").notNull(),
    userId: text("user_id"),
    status: text("status").notNull(),
  },
  (table) => [
    index("task_projectId_idx").on(table.projectId),
    index("task_userId_idx").on(table.userId),
    index("task_status_idx").on(table.status),
  ],
);
```

### When to Add Indexes

- Foreign key columns (always)
- Columns used in WHERE clauses frequently
- Columns used for sorting/ordering
- Composite indexes for multi-column queries

## Relations

Define relations in at the end of the schema file or in a separate relations file. Use Drizzle's `relations` function to specify relationships between tables:

```typescript
import { relations } from "drizzle-orm";
import { taskTable } from "./schema";
import { projectTable } from "./schema";

export const taskTableRelations = relations(taskTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [taskTable.projectId],
    references: [projectTable.id],
  }),
  labels: many(labelTable),
}));
```

## Data Types

Use appropriate PostgreSQL types:

```typescript
// Text (varchar)
title: text("title").notNull(),

// Optional text
description: text("description"),

// Boolean
isActive: boolean("is_active").default(true).notNull(),

// Integer
position: integer("position").default(0),

// Timestamp
createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

// JSON (if needed)
metadata: json("metadata").$type<{ key: string }>(),
```

## Default Values

Provide sensible defaults:

```typescript
// Boolean defaults
isActive: boolean("is_active").default(true).notNull(),

// Integer defaults
position: integer("position").default(0),

// Text defaults
status: text("status").notNull().default("to-do"),

// Timestamp defaults
createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
```

## Migrations

### Generating Migrations

After schema changes:

```bash
pnpm --filter @kaneo/api db:generate
```

This creates migration files in `apps/api/drizzle/`.

### Running Migrations

Migrations run automatically on API startup (see `apps/api/src/index.ts`):

```typescript
await migrate(db, {
  migrationsFolder: `${process.cwd()}/drizzle`,
});
```

### Migration Best Practices

1. **Never edit existing migrations**: Create new migrations for changes
2. **Test migrations**: Test both up and down migrations
3. **Backup first**: Always backup production data before migrations
4. **Review SQL**: Check generated SQL before applying

## Schema Export

Export all schemas and relations from `apps/api/src/db/schema.ts`:

```typescript
export const schema = {
  taskTable,
  projectTable,
  // ... all tables
  taskTableRelations,
  projectTableRelations,
  // ... all relations
};

const db = drizzle(pool, {
  schema: schema,
});
```

## Query Style

**Always use `db.select()` builder API. Never use `db.query.*` relational API** (`findMany`, `findFirst`, `with:`).

The relational API generates complex lateral joins with `json_build_array` that are fragile and hard to debug.

### Select Single Row

```typescript
// ✅ Good
const [result] = await this.db
  .select()
  .from(agents)
  .where(eq(agents.id, id))
  .limit(1);
return result;

// ❌ Bad: relational API
return this.db.query.agents.findFirst({
  where: eq(agents.id, id),
});
```

### Select with JOIN

```typescript
// ✅ Good: explicit select + leftJoin
const rows = await this.db
  .select({
    runId: agentEvalRunTopics.runId,
    score: agentEvalRunTopics.score,
    testCase: agentEvalTestCases,
    topic: topics,
  })
  .from(agentEvalRunTopics)
  .leftJoin(
    agentEvalTestCases,
    eq(agentEvalRunTopics.testCaseId, agentEvalTestCases.id),
  )
  .leftJoin(topics, eq(agentEvalRunTopics.topicId, topics.id))
  .where(eq(agentEvalRunTopics.runId, runId))
  .orderBy(asc(agentEvalRunTopics.createdAt));

// ❌ Bad: relational API with `with:`
return this.db.query.agentEvalRunTopics.findMany({
  where: eq(agentEvalRunTopics.runId, runId),
  with: { testCase: true, topic: true },
});
```

### Select with Aggregation

```typescript
// ✅ Good: select + leftJoin + groupBy
const rows = await this.db
  .select({
    id: agentEvalDatasets.id,
    name: agentEvalDatasets.name,
    testCaseCount: count(agentEvalTestCases.id).as("testCaseCount"),
  })
  .from(agentEvalDatasets)
  .leftJoin(
    agentEvalTestCases,
    eq(agentEvalDatasets.id, agentEvalTestCases.datasetId),
  )
  .groupBy(agentEvalDatasets.id);
```

### One-to-Many (Separate Queries)

When you need a parent record with its children, use two queries instead of relational `with:`:

```typescript
// ✅ Good: two simple queries
const [dataset] = await this.db
  .select()
  .from(agentEvalDatasets)
  .where(eq(agentEvalDatasets.id, id))
  .limit(1);

if (!dataset) return undefined;

const testCases = await this.db
  .select()
  .from(agentEvalTestCases)
  .where(eq(agentEvalTestCases.datasetId, id))
  .orderBy(asc(agentEvalTestCases.sortOrder));

return { ...dataset, testCases };
```

## Database Migrations

See the `db-migrations` skill for the detailed migration guide.
