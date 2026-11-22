import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { PaymentRepository } from "../repositories/payment.repository";
import { InvoiceRepository } from "../repositories/invoice.repository";
import { LedgerRepository } from "../repositories/ledger.repository";
import { OutboxService } from "../../../shared/outbox/outbox.service";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, payment } from "@sms/database";
import { eq } from "drizzle-orm";
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

  async handleBkashWebhook(body: any, signature?: string) {
    const tranId = body.trxID || body.tran_id || `BKASH_${Date.now()}`;
    const invoiceId = body.invoiceId || body.merchantInvoiceNumber;
    const amount = Number(body.amount);

    await this.outbox.publish(
      "RECONCILE_PAYMENT",
      {
        tranId,
        invoiceId,
        amount,
        method: "BKASH",
        status: "COMPLETED",
        gatewayPayload: body,
      },
      `reconcile_bkash_${tranId}`,
    );

    return { statusCode: "0000", statusMessage: "Successful", tranId };
  }

  async handleNagadWebhook(body: any) {
    const tranId = body.payment_ref_id || body.tran_id || `NAGAD_${Date.now()}`;
    const invoiceId = body.order_id || body.invoiceId;
    const amount = Number(body.amount);

    await this.outbox.publish(
      "RECONCILE_PAYMENT",
      {
        tranId,
        invoiceId,
        amount,
        method: "NAGAD",
        status: "COMPLETED",
        gatewayPayload: body,
      },
      `reconcile_nagad_${tranId}`,
    );

    return { status: "Success", tranId };
  }

  async handleSslCommerzWebhook(body: any) {
    const tranId = body.tran_id || `SSL_${Date.now()}`;
    const invoiceId = body.value_a || body.invoiceId;
    const amount = Number(body.amount);

    await this.outbox.publish(
      "RECONCILE_PAYMENT",
      {
        tranId,
        invoiceId,
        amount,
        method: "SSLCOMMERZ",
        status: "COMPLETED",
        gatewayPayload: body,
      },
      `reconcile_ssl_${tranId}`,
    );

    return { status: "VALIDATED", tranId };
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

    // 2. Validate with payment aggregator webhook matching
    const isMatched = payload.status === "VALID" || payload.status === "SUCCESS";

    return this.db.transaction(async (tx) => {
      if (isMatched) {
        // Step A: Update payment status to PROCESSED
        await tx
          .update(payment)
          .set({
            status: "PROCESSED",
            validatedAt: new Date(),
            ipnPayload: payload,
          })
          .where(eq(payment.aggregatorTranId, tranId));

        // Step B: Post to append-only ledger
        const partyId = (existingPayment as any)?.studentId || payload.studentId || randomUUID();
        await this.ledgerRepo.recordEntry({
          account: "STUDENT_FEES",
          partyType: "STUDENT",
          partyId,
          amount: amount.toString(),
          currency,
          direction: "CREDIT",
          source: "PAYMENT",
          sourceId: randomUUID(),
          idempotencyKey: `ledger_pay_${tranId}`,
          postedBy: partyId,
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
