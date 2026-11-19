import { Module, Global } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { OutboxModule } from "./outbox/outbox.module";
import { AuditModule } from "./audit/audit.module";
import { S3Module } from "./s3/s3.module";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { RolesGuard } from "./guards/roles.guard";

@Global()
@Module({
  imports: [DatabaseModule, RedisModule, OutboxModule, AuditModule, S3Module],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [DatabaseModule, RedisModule, OutboxModule, AuditModule, S3Module, JwtAuthGuard, RolesGuard],
})
export class SharedModule {}
