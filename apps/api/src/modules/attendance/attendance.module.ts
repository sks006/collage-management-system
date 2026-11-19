import { Module } from "@nestjs/common";
import { AttendanceController } from "./controllers/attendance.controller";
import { PeriodCloseController } from "./controllers/period-close.controller";
import { AttendanceService } from "./services/attendance.service";
import { PeriodCloseService } from "./services/period-close.service";
import { AttendanceRepository } from "./repositories/attendance.repository";
import { PeriodCloseRepository } from "./repositories/period-close.repository";

@Module({
  controllers: [AttendanceController, PeriodCloseController],
  providers: [
    AttendanceService,
    PeriodCloseService,
    AttendanceRepository,
    PeriodCloseRepository,
  ],
  exports: [AttendanceService, PeriodCloseService],
})
export class AttendanceModule {}
