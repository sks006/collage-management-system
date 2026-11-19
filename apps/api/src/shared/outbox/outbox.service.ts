import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../database/database.provider";
import { DatabaseInstance } from "@sms/database";
import { job } from "@sms/database";
import { OutboxEventType } from "@sms/shared";

@Injectable()
export class OutboxService {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async publish(
    type: OutboxEventType,
    payload: Record<string, any>,
    dedupeKey: string,
    tx?: any,
  ) {
    const client = tx || this.db;
    const [inserted] = await client
      .insert(job)
      .values({
        type,
        payload,
        dedupeKey,
        status: "PENDING",
      })
      .onConflictDoNothing({ target: job.dedupeKey })
      .returning();
    return inserted;
  }
}
