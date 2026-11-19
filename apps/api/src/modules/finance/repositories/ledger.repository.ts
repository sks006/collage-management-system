import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, ledgerEntry } from "@sms/database";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class LedgerRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  // Invariant 8: Append-only ledger. Only INSERT and SELECT.
  async recordEntry(data: typeof ledgerEntry.$inferInsert, tx?: any) {
    const client = tx || this.db;
    const [row] = await client.insert(ledgerEntry).values(data).returning();
    return row;
  }

  async findEntries(limit = 50) {
    return this.db.select().from(ledgerEntry).orderBy(desc(ledgerEntry.postedAt)).limit(limit);
  }

  async findByParty(partyId: string) {
    return this.db.select().from(ledgerEntry).where(eq(ledgerEntry.partyId, partyId));
  }
}
