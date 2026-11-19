import { pgSchema, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const noticeSchema = pgSchema("notice");

export const notice = noticeSchema.table("notice", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: jsonb("audience").notNull(), // { roles: ["TEACHER", "PARENT"], classIds: [] }
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
