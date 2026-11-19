import { pgSchema, uuid, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";

export const outboxSchema = pgSchema("outbox");

export const job = outboxSchema.table("job", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  dedupeKey: text("dedupe_key").unique().notNull(),
  status: text("status").default("PENDING").notNull(), // PENDING, CLAIMED, DONE, DEAD
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(5).notNull(),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).defaultNow().notNull(),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  lockedBy: text("locked_by"),
  lastError: text("last_error"),
  runAt: timestamp("run_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (t) => ({
  statusIdx: index("outbox_job_status_next_idx").on(t.status, t.nextAttemptAt),
}));
