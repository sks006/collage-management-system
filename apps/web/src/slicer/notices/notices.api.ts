import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { NoticeItem, CreateNoticeInput } from "./notices.types";

export class NoticeApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getNotices(): Promise<NoticeItem[]> {
    return this.transport.get<NoticeItem[]>("/notices");
  }

  async createNotice(input: CreateNoticeInput): Promise<NoticeItem> {
    return this.transport.post<NoticeItem>("/notices", input);
  }
}

export const noticeApi = new NoticeApiService();
