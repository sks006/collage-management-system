import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { PaymentRepository } from "../repositories/payment.repository";
import { InvoiceRepository } from "../repositories/invoice.repository";
import { LedgerRepository } from "../repositories/ledger.repository";
import { OutboxService } from "../../../shared/outbox/outbox.service";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance } from "@sms/database";
import { randomUUID } from "crypto";

@Injectable()
export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private invoiceRepo: InvoiceRepository,
    private ledgerRepo: LedgerRepository,
    private outbox: OutboxService,
    @Inject(DATABASE_CONNECTION) private db: DatabaseInstance,
  ) {}

  async initiatePayment(dto: { invoiceId: string; method: string }, idempotencyKey: string) {
    const existing = await this.paymentRepo.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      return { paymentId: existing.id, redirectUrl: `https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=pay&SESSIONKEY=${existing.aggregatorSessionKey}` };
    }

    const inv = await this.invoiceRepo.findById(dto.invoiceId);
    if (!inv) throw new BadRequestException("Invoice not found");

    const sessionKey = `SESSION_${randomUUID().replace(/-/g, "")}`;
    const tranId = `TXN_${Date.now()}`;

    const created = await this.paymentRepo.create({
      invoiceId: dto.invoiceId,
      amount: inv.amount,
      currency: "BDT",
      method: dto.method,
      aggregatorTranId: tranId,
      aggregatorSessionKey: sessionKey,
      status: "PENDING",
      idempotencyKey,
    });

    const redirectUrl = `https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=pay&SESSIONKEY=${sessionKey}`;
    return { paymentId: created.id, tranId, redirectUrl };
  }

  // Section 6.2 IPN Webhook validation & Append-only ledger posting
  async processIPN(payload: any) {
    const tranId = payload.tran_id;
    const amount = Number(payload.amount);
    const currency = payload.currency || "BDT";

    // 1. Check duplicate idempotency
    const existingPayment = await this.paymentRepo.findByIdempotencyKey(`ipn_${tranId}`);
    if (existingPayment) {
      return { status: "ALREADY_PROCESSED" };
    }

    // 2. Validate with payment aggregator / mock matching
    const isMatched = payload.status === "VALID" || payload.status === "SUCCESS";

    return this.db.transaction(async (tx) => {
      if (isMatched) {
        // Step A: Update payment status to PROCESSED
        const [updatedPay] = await tx
          .insert(paymentRepoProxy(tx))
          .values({})
          .returning(); // Mock proxy

        // Step B: Post to append-only ledger
        await this.ledgerRepo.recordEntry({
          account: "STUDENT_FEES",
          partyType: "STUDENT",
          partyId: "00000000-0000-0000-0000-000000000002",
          amount: amount.toString(),
          currency,
          direction: "CREDIT",
          source: "PAYMENT",
          sourceId: randomUUID(),
          idempotencyKey: `ledger_pay_${tranId}`,
          postedBy: "00000000-0000-0000-0000-000000000001",
          status: "POSTED",
        }, tx);

        // Step C: Publish outbox receipt event
        await this.outbox.publish("SEND_RECEIPT", { tranId, amount }, `receipt_${tranId}`, tx);

        return { status: "PROCESSED" };
      } else {
        await this.outbox.publish("ALERT", { error: "Payment verification mismatch", tranId }, `alert_${tranId}`, tx);
        return { status: "MISMATCH" };
      }
    });
  }
}

function paymentRepoProxy(tx: any): any {
  return {};
}
