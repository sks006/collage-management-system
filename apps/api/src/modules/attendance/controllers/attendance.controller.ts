import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AttendanceService } from "../services/attendance.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { attendanceBatchSchema, correctionRequestSchema } from "@sms/shared";

@ApiTags("Attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post("batch")
  @Roles("TEACHER", "ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Teacher submits roster attendance batch" })
  async markBatch(
    @Body(new ZodValidationPipe(attendanceBatchSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.markBatch(dto, user.id);
  }

  @Get("students/:id")
  @ApiOperation({ summary: "Get attendance log for student" })
  async getStudentAttendance(@Param("id") id: string) {
    return this.service.getStudentAttendance(id);
  }

  @Post("corrections")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Submit attendance correction request" })
  async submitCorrection(
    @Body(new ZodValidationPipe(correctionRequestSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitCorrection(dto, user.id);
  }
}
