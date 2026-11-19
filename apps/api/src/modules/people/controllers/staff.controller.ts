import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StaffService } from "../services/staff.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { createStaffSchema } from "@sms/shared";

@ApiTags("Staff")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("staff")
export class StaffController {
  constructor(private service: StaffService) {}

  @Get()
  @ApiOperation({ summary: "List or search staff members" })
  async getStaff(@Query("limit") limit = 50, @Query("q") q?: string) {
    return this.service.getStaffList(Number(limit), q);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get staff details by ID" })
  async getStaffById(@Param("id") id: string) {
    return this.service.getStaffById(id);
  }

  @Post()
  @Roles("ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Register new staff member" })
  async createStaff(
    @Body(new ZodValidationPipe(createStaffSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createStaff(dto, user.id, user.roles[0]);
  }
}
