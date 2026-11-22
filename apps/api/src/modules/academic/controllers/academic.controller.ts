import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AcademicService } from "../services/academic.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { createAcademicYearSchema, createClassSchema, createSectionSchema, bulkTeacherAssignmentSchema } from "@sms/shared";

@ApiTags("Academic")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("academic")
export class AcademicController {
  constructor(private service: AcademicService) {}

  @Get("years")
  @ApiOperation({ summary: "List academic years" })
  async getYears() {
    return this.service.listYears();
  }

  @Post("years")
  @Roles("ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Create academic year" })
  async createYear(
    @Body(new ZodValidationPipe(createAcademicYearSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createYear(dto, user.id, user.roles[0]);
  }

  @Get("classes")
  @ApiOperation({ summary: "List all classes" })
  async getAllClasses() {
    return this.service.listClasses();
  }

  @Get("classes/:yearId")
  @ApiOperation({ summary: "List classes in academic year" })
  async getClasses(@Param("yearId") yearId: string) {
    return this.service.listClasses(yearId);
  }

  @Post("classes")
  @Roles("ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Create class" })
  async createClass(
    @Body(new ZodValidationPipe(createClassSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createClass(dto, user.id, user.roles[0]);
  }

  @Get("sections")
  @ApiOperation({ summary: "List all sections" })
  async getAllSections() {
    return this.service.listSections();
  }

  @Get("sections/:classId")
  @ApiOperation({ summary: "List sections in class" })
  async getSections(@Param("classId") classId: string) {
    return this.service.listSections(classId);
  }

  @Post("sections")
  @Roles("ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Create section" })
  async createSection(
    @Body(new ZodValidationPipe(createSectionSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createSection(dto, user.id, user.roles[0]);
  }

  @Post("teacher-assignments")
  @Roles("ADMIN", "PRINCIPAL")
  @ApiOperation({ summary: "Bulk assign teachers to sections" })
  async assignTeachers(@Body(new ZodValidationPipe(bulkTeacherAssignmentSchema)) dto: any) {
    return this.service.assignTeachers(dto.assignments);
  }
}
