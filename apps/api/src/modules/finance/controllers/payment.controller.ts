import { Controller, Post, Body, Headers, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PaymentService } from "../services/payment.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { initiatePaymentSchema, ipnWebhookSchema } from "@sms/shared";

@ApiTags("Finance: Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("finance/payments")
export class PaymentController {
  constructor(private service: PaymentService) {}

  @Post("initiate")
  @Roles("ADMIN", "OFFICE", "FINANCE")
  @ApiOperation({ summary: "Initiate fee payment via aggregator" })
  async initiatePayment(
    @Body(new ZodValidationPipe(initiatePaymentSchema)) dto: any,
    @Headers("idempotency-key") idempotencyKey: string,
  ) {
    const key = idempotencyKey || `pay_${Date.now()}`;
    return this.service.initiatePayment(dto, key);
  }

  @Post("ipn")
  @ApiOperation({ summary: "Aggregator IPN Webhook callback" })
  async handleIPN(@Body(new ZodValidationPipe(ipnWebhookSchema)) payload: any) {
    return this.service.processIPN(payload);
  }
}
