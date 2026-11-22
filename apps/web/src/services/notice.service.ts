import { apiClient } from "@/lib/api-client";

export interface NoticeDto {
  id: string;
  titleEn: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  body?: string;
  publishedAt?: string;
  targetRoles?: string[];
  audience?: any;
  priority: "HIGH" | "NORMAL" | "MEDIUM" | "URGENT";
  status?: "PUBLISHED" | "DRAFT";
}

export const noticeService = {
  getAll: (params?: Record<string, any>) =>
    apiClient<NoticeDto[]>("/notices", { params }),
  create: (payload: Partial<NoticeDto>) =>
    apiClient<NoticeDto>("/notices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
