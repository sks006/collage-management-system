export * from "./roles";
export * from "./events";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    cursor?: string;
    hasMore?: boolean;
    requestId?: string;
  };
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  requestId?: string;
  errors?: Array<{ field: string; message: string; code?: string }>;
}
