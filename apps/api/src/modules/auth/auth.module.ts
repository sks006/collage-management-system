import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { DatabaseModule } from "../../shared/database/database.module";
import { AuditModule } from "../../shared/audit/audit.module";
import { OutboxModule } from "../../shared/outbox/outbox.module";

@Module({
  imports: [DatabaseModule, AuditModule, OutboxModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
