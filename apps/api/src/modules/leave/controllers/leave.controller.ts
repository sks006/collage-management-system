import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LeaveService } from "../services/leave.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { createLeaveRequestSchema, createCalendarDaySchema } from "@sms/shared";

@ApiTags("Leave & Calendar")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("leave")
export class LeaveController {
  constructor(private service: LeaveService) {}

  @Post("requests")
  @Roles("TEACHER", "OFFICE")
  @ApiOperation({ summary: "Staff submits leave application" })
  async submitRequest(
    @Body(new ZodValidationPipe(createLeaveRequestSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitRequest(dto, user.id);
  }

  @Post("requests/:id/approve")
  @Roles("PRINCIPAL", "ADMIN")
  @ApiOperation({ summary: "HR/Principal approves leave application" })
  async approveRequest(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.approveRequest(id, user.id, user.roles[0]);
  }

  @Get("calendar/:yearId")
  @ApiOperation({ summary: "Get official school calendar" })
  async getCalendar(@Param("yearId") yearId: string) {
    return this.service.getCalendar(yearId);
  }

  @Post("calendar")
  @Roles("ADMIN", "OFFICE")
  @ApiOperation({ summary: "Add calendar holiday or working day" })
  async addCalendarDay(@Body(new ZodValidationPipe(createCalendarDaySchema)) dto: any) {
    return this.service.addCalendarDay(dto);
  }
}
