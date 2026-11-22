import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PeriodCloseService } from "../services/period-close.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { periodCloseSchema } from "@sms/shared";

@ApiTags("Attendance: Period Close")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("attendance/close")
export class PeriodCloseController {
  constructor(private service: PeriodCloseService) {}

  @Get()
  @ApiOperation({ summary: "List period close records" })
  async list() {
    return this.service.list();
  }

  @Post()
  @Roles("ADMIN", "PRINCIPAL", "OFFICE")
  @ApiOperation({ summary: "Initiate monthly period close gate" })
  async initiate(
    @Body(new ZodValidationPipe(periodCloseSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.initiateClose(dto, user.id);
  }

  @Post(":id/approve")
  @Roles("PRINCIPAL", "ADMIN")
  @ApiOperation({ summary: "Approve period close with Maker-Checker enforcement" })
  async approve(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.approveClose(id, user.id, user.roles[0]);
  }
}
