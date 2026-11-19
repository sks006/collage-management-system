import { Module } from "@nestjs/common";
import { NoticeController } from "./controllers/notice.controller";
import { NoticeService } from "./services/notice.service";
import { NoticeRepository } from "./repositories/notice.repository";

@Module({
  controllers: [NoticeController],
  providers: [NoticeService, NoticeRepository],
  exports: [NoticeService],
})
export class NoticeModule {}
