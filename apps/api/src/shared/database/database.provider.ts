import { Provider } from "@nestjs/common";
import { createDb, createDbPool } from "@sms/database";

export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useFactory: () => {
    const pool = createDbPool();
    return createDb(pool);
  },
};
