import { Module } from "@nestjs/common";
import { StudentController } from "./controllers/student.controller";
import { StaffController } from "./controllers/staff.controller";
import { StudentService } from "./services/student.service";
import { StaffService } from "./services/staff.service";
import { StudentRepository } from "./repositories/student.repository";
import { StaffRepository } from "./repositories/staff.repository";

@Module({
  controllers: [StudentController, StaffController],
  providers: [StudentService, StaffService, StudentRepository, StaffRepository],
  exports: [StudentService, StaffService],
})
export class PeopleModule {}
