import { Module } from "@nestjs/common";
import { OutboxConsumer } from "./shared/outbox-consumer";
import { NotificationProcessor } from "./processors/notification.processor";
import { PdfGenerationProcessor } from "./processors/pdf-generation.processor";
import { BeftnDispatchProcessor } from "./processors/beftn-dispatch.processor";
import { PaymentReconcileProcessor } from "./processors/payment-reconcile.processor";
import { PayrollComputeProcessor } from "./processors/payroll-compute.processor";

@Module({
  providers: [
    OutboxConsumer,
    NotificationProcessor,
    PdfGenerationProcessor,
    BeftnDispatchProcessor,
    PaymentReconcileProcessor,
    PayrollComputeProcessor,
  ],
})
export class WorkerModule {}
