import { Module } from "@nestjs/common";
import { PaymentController } from "./controllers/payment.controller";
import { InvoiceController } from "./controllers/invoice.controller";
import { LedgerController } from "./controllers/ledger.controller";
import { PaymentService } from "./services/payment.service";
import { InvoiceService } from "./services/invoice.service";
import { PaymentRepository } from "./repositories/payment.repository";
import { InvoiceRepository } from "./repositories/invoice.repository";
import { LedgerRepository } from "./repositories/ledger.repository";

@Module({
  controllers: [PaymentController, InvoiceController, LedgerController],
  providers: [
    PaymentService,
    InvoiceService,
    PaymentRepository,
    InvoiceRepository,
    LedgerRepository,
  ],
  exports: [PaymentService, InvoiceService, LedgerRepository],
})
export class FinanceModule {}
