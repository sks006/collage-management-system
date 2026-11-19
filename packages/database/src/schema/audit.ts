import { pgSchema, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const auditSchema = pgSchema("audit");

export const auditLog = auditSchema.table("log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  resourceIdx: index("audit_resource_idx").on(t.resourceType, t.resourceId),
  actorIdx: index("audit_actor_idx").on(t.actorId),
}));
