import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as academic from "./schema/academic";
import * as people from "./schema/people";
import * as attendance from "./schema/attendance";
import * as leave from "./schema/leave";
import * as finance from "./schema/finance";
import * as payroll from "./schema/payroll";
import * as notice from "./schema/notice";
import * as outbox from "./schema/outbox";
import * as audit from "./schema/audit";

export const schema = {
  ...academic,
  ...people,
  ...attendance,
  ...leave,
  ...finance,
  ...payroll,
  ...notice,
  ...outbox,
  ...audit,
};

export function createDbPool(connectionString?: string) {
  const connection = connectionString || process.env.DATABASE_URL || "postgresql://sms_api:sms_api_password@localhost:5432/sms";
  return new Pool({
    connectionString: connection,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export function createDb(pool?: Pool) {
  const p = pool || createDbPool();
  return drizzle(p, { schema });
}

export type DatabaseInstance = ReturnType<typeof createDb>;
