import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StudentService } from "../services/student.service";
import { JwtAuthGuard } from "../../../shared/guards/jwt.guard";
import { RolesGuard } from "../../../shared/guards/roles.guard";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../../../shared/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../shared/pipes/zod-validation.pipe";
import { createStudentSchema, createEnrollmentSchema } from "@sms/shared";

@ApiTags("Students")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("students")
export class StudentController {
  constructor(private service: StudentService) {}

  @Get()
  @ApiOperation({ summary: "List or search students" })
  async getStudents(@Query("limit") limit = 50, @Query("q") q?: string) {
    return this.service.getStudents(Number(limit), q);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get student details by ID" })
  async getStudentById(@Param("id") id: string) {
    return this.service.getStudentById(id);
  }

  @Post()
  @Roles("ADMIN", "OFFICE")
  @ApiOperation({ summary: "Create new student profile" })
  async createStudent(
    @Body(new ZodValidationPipe(createStudentSchema)) dto: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createStudent(dto, user.id, user.roles[0]);
  }

  @Post("import")
  @Roles("ADMIN", "OFFICE")
  @ApiOperation({ summary: "Bulk import students from CSV" })
  async importStudents(
    @Body() body: { students: any[] },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.importStudents(body.students || [], user.id, user.roles[0]);
  }

  @Post("enroll")
  @Roles("ADMIN", "OFFICE")
  @ApiOperation({ summary: "Enroll student into section" })
  async enrollStudent(@Body(new ZodValidationPipe(createEnrollmentSchema)) dto: any) {
    return this.service.enrollStudent(dto);
  }
}
