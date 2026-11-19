import { Injectable } from "@nestjs/common";
import { NoticeRepository } from "../repositories/notice.repository";
import { OutboxService } from "../../../shared/outbox/outbox.service";

@Injectable()
export class NoticeService {
  constructor(
    private repo: NoticeRepository,
    private outbox: OutboxService,
  ) {}

  async createNotice(dto: any, createdBy: string) {
    return this.repo.create({ ...dto, createdBy });
  }

  async getPublishedNotices() {
    return this.repo.findPublished();
  }

  async publishNotice(id: string) {
    const row = await this.repo.publish(id);
    await this.outbox.publish("SEND_NOTICE", { noticeId: id, audience: row.audience }, `notice_${id}`);
    return row;
  }
}
