export interface NoticeItem {
  id: string;
  titleEn: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  body?: string;
  publishedAt?: string;
  date?: string;
  targetRoles?: string[];
  audience?: any;
  priority: "HIGH" | "NORMAL" | "MEDIUM" | "URGENT";
  status?: "PUBLISHED" | "DRAFT";
}

export interface CreateNoticeInput {
  titleEn: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  body?: string;
  targetRoles: string[];
  priority: "HIGH" | "NORMAL" | "MEDIUM" | "URGENT";
}

export interface INoticeHandlers {
  handleCreateNotice: (input: CreateNoticeInput) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
}
