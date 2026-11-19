import { Module } from "@nestjs/common";
import { AcademicController } from "./controllers/academic.controller";
import { AcademicService } from "./services/academic.service";
import { AcademicRepository } from "./repositories/academic.repository";

@Module({
  controllers: [AcademicController],
  providers: [AcademicService, AcademicRepository],
  exports: [AcademicService, AcademicRepository],
})
export class AcademicModule {}
