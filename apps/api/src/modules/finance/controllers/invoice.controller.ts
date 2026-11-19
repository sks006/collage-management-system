import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { InvoiceService } from "../services/invoice.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { bulkInvoiceSchema } from "@sms/shared";

@ApiTags("Finance: Invoices")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("finance/invoices")
export class InvoiceController {
  constructor(private service: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: "List student invoices" })
  async getInvoices(@Query("studentId") studentId?: string) {
    return this.service.getInvoices(studentId);
  }

  @Post("bulk")
  @Roles("FINANCE", "ADMIN")
  @ApiOperation({ summary: "Bulk generate monthly fee invoices" })
  async bulkGenerate(@Body(new ZodValidationPipe(bulkInvoiceSchema)) dto: any) {
    return this.service.generateBulkInvoices(dto);
  }
}
