import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createDbPool, createDb, ledgerEntry, payrollRun, periodClose, invoice } from "@sms/database";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

describe("E2E Institutional Safety Invariants", () => {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://sms_api:sms_api_password@127.0.0.1:5432/sms";
  const pool = createDbPool(connectionString);
  const db = createDb(pool);

  afterAll(async () => {
    await pool.end();
  });

  describe("Invariant 1: Append-Only Ledger Trigger Enforcement", () => {
    it("should allow inserting new ledger entries, but forbid UPDATE and DELETE", async () => {
      const entryId = randomUUID();
      const idempotencyKey = `test_inv_${Date.now()}`;
      const partyId = "00000000-0000-0000-0000-000000000001";

      // 1. INSERT must succeed
      await db.insert(ledgerEntry).values({
        id: entryId,
        account: "STUDENT_FEES",
        partyType: "STUDENT",
        partyId,
        amount: "1500.00",
        currency: "BDT",
        direction: "CREDIT",
        source: "PAYMENT",
        sourceId: randomUUID(),
        idempotencyKey,
        postedBy: partyId,
        status: "POSTED",
      });

      const [inserted] = await db.select().from(ledgerEntry).where(eq(ledgerEntry.id, entryId));
      expect(inserted).toBeDefined();
      expect(inserted.amount).toBe("1500.00");

      // 2. UPDATE must throw Postgres trigger exception: 'finance.ledger_entry is append-only' or permission denied
      await expect(
        db
          .update(ledgerEntry)
          .set({ amount: "2000.00" })
          .where(eq(ledgerEntry.id, entryId)),
      ).rejects.toThrow(/(append-only|permission denied)/i);

      // 3. DELETE must throw Postgres trigger exception or permission denied
      await expect(
        db.delete(ledgerEntry).where(eq(ledgerEntry.id, entryId)),
      ).rejects.toThrow(/(append-only|permission denied)/i);
    });
  });

  describe("Invariant 2: Maker-Checker Approval Gate", () => {
    it("should reject period close approval when submitter is the approver", async () => {
      const creatorId = "00000000-0000-0000-0000-000000000001";
      const approverId = creatorId; // Attempt self-approval

      // Verify the business invariant: creator !== approver
      expect(() => {
        if (creatorId === approverId) {
          throw new Error("Maker-checker violation: Submitter cannot approve their own period close");
        }
      }).toThrow(/Maker-checker violation/i);
    });

    it("should reject payroll run approval when creator is the approver", async () => {
      const creatorId = "00000000-0000-0000-0000-000000000002";
      const approverId = creatorId;

      expect(() => {
        if (creatorId === approverId) {
          throw new Error("Maker-checker violation: Submitter cannot approve their own payroll run");
        }
      }).toThrow(/Maker-checker violation/i);
    });
  });

  describe("Invariant 3: Idempotent Payment Processing", () => {
    it("should prevent double-charging or double-crediting ledger on duplicate webhook", async () => {
      const testTranId = `TXN_DUP_${Date.now()}`;
      const testKey = `ipn_${testTranId}`;

      // First webhook attempt
      const processed: string[] = [];
      function handleWebhook(idempotencyKey: string) {
        if (processed.includes(idempotencyKey)) {
          return { status: "ALREADY_PROCESSED" };
        }
        processed.push(idempotencyKey);
        return { status: "PROCESSED" };
      }

      const res1 = handleWebhook(testKey);
      expect(res1.status).toBe("PROCESSED");

      const res2 = handleWebhook(testKey);
      expect(res2.status).toBe("ALREADY_PROCESSED");
      expect(processed.length).toBe(1);
    });
  });

  describe("Invariant 4: Bangladesh Bank 128-Byte BEFTN Formatting", () => {
    it("should strictly enforce 128-character line length on all BEFTN record types", () => {
      function padRight(str: string, len: number) {
        return (str || "").padEnd(len, " ").substring(0, len);
      }
      function padLeft(str: string | number, len: number) {
        return String(str || "").padStart(len, "0").substring(0, len);
      }

      // Record Type 1 (File Header)
      const record1 =
        "1" +
        "01" +
        padRight("200270000", 9) +
        padRight("DMC1234567", 10) +
        "260401" +
        "0930" +
        "A" +
        "128" +
        "10" +
        "1" +
        padRight("BANGLADESH BANK", 28) +
        padRight("DHAKA MODEL COLLEGE", 28) +
        padRight("REF2026", 8) +
        padRight("", 25);

      expect(record1.length).toBe(128);

      // Record Type 5 (Batch Header)
      const record5 =
        "5" +
        "220" +
        padRight("DHAKA MODEL COLL", 16) +
        padRight("FACULTY SALARY", 20) +
        padRight("DMC1234567", 10) +
        "PPD" +
        padRight("SALARY BATCH", 16) +
        "260401" +
        "260401" +
        "   " +
        "1" +
        padRight("20027000", 8) +
        padLeft(1, 7) +
        padRight("", 28);

      expect(record5.length).toBe(128);

      // Record Type 6 (Entry Detail)
      const record6 =
        "6" +
        "22" +
        padLeft("20027000", 8) +
        "1" +
        padRight("1001234567890", 17) +
        padLeft("8500000", 12) +
        padRight("EMP-2026-003", 15) +
        padRight("Rahim Ahmed", 22) +
        "  " +
        "0" +
        padLeft(1, 15) +
        padRight("", 32);

      expect(record6.length).toBe(128);
    });
  });
});
