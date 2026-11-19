import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PayrollService } from "../services/payroll.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { createPayrollRunSchema } from "@sms/shared";

@ApiTags("Payroll")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payroll")
export class PayrollController {
  constructor(private service: PayrollService) {}

  @Post("runs")
  @Roles("FINANCE", "ADMIN")
  @ApiOperation({ summary: "Create draft monthly payroll run" })
  async createRun(
    @Body(new ZodValidationPipe(createPayrollRunSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createRun(dto.month, user.id);
  }

  @Post("runs/:id/approve")
  @Roles("PRINCIPAL", "ADMIN")
  @ApiOperation({ summary: "Approve payroll run with Maker-Checker gate" })
  async approveRun(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.approveRun(id, user.id, user.roles[0]);
  }

  @Get("runs/:id/lines")
  @Roles("FINANCE", "ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Get immutable payroll lines for run" })
  async getLines(@Param("id") id: string) {
    return this.service.getRunLines(id);
  }
}
