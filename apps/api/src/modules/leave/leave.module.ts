import { Module } from "@nestjs/common";
import { LeaveController } from "./controllers/leave.controller";
import { LeaveService } from "./services/leave.service";
import { LeaveRepository } from "./repositories/leave.repository";

@Module({
  controllers: [LeaveController],
  providers: [LeaveService, LeaveRepository],
  exports: [LeaveService],
})
export class LeaveModule {}
