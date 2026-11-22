import { Controller, Post, Body, Headers, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PaymentService } from "../services/payment.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { initiatePaymentSchema, ipnWebhookSchema } from "@sms/shared";

@ApiTags("Finance: Payments")
@Controller("finance/payments")
export class PaymentController {
  constructor(private service: PaymentService) {}

  @Post("initiate")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Post("webhook/bkash")
  @ApiOperation({ summary: "bKash IPN Webhook" })
  async handleBkashWebhook(
    @Body() body: any,
    @Headers("x-signature") signature?: string,
  ) {
    return this.service.handleBkashWebhook(body, signature);
  }

  @Post("webhook/nagad")
  @ApiOperation({ summary: "Nagad Payment Gateway Webhook" })
  async handleNagadWebhook(@Body() body: any) {
    return this.service.handleNagadWebhook(body);
  }

  @Post("webhook/sslcommerz")
  @ApiOperation({ summary: "SSLCommerz IPN Webhook" })
  async handleSslCommerzWebhook(@Body() body: any) {
    return this.service.handleSslCommerzWebhook(body);
  }
}
