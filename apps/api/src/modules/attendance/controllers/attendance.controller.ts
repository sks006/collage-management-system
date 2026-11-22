import { Controller, Get, Post, Body, Param, Headers, UseGuards, UnauthorizedException } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AttendanceService } from "../services/attendance.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { attendanceBatchSchema, correctionRequestSchema } from "@sms/shared";

@ApiTags("Attendance")
@Controller("attendance")
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post("batch")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TEACHER", "ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Teacher submits roster attendance batch" })
  async markBatch(
    @Body(new ZodValidationPipe(attendanceBatchSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.markBatch(dto, user.id);
  }

  @Get("students/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get attendance log for student" })
  async getStudentAttendance(@Param("id") id: string) {
    return this.service.getStudentAttendance(id);
  }

  @Post("corrections")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Submit attendance correction request" })
  async submitCorrection(
    @Body(new ZodValidationPipe(correctionRequestSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitCorrection(dto, user.id);
  }

  @Post("device")
  @ApiOperation({ summary: "Ingest biometric device attendance punch with DEVICE_API_KEY" })
  async ingestDevicePunch(
    @Body() body: any,
    @Headers("x-device-api-key") apiKey?: string,
  ) {
    const configuredKey = process.env.DEVICE_API_KEY || "sms_device_secret_key";
    if (apiKey && apiKey !== configuredKey) {
      throw new UnauthorizedException("Invalid Device API Key");
    }
    return this.service.ingestDevicePunch(body);
  }
}
