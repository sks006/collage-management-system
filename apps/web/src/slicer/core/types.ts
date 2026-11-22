/**
 * Slicer Core Architecture Contracts
 * Adheres to Interface Segregation Principle (ISP) & Liskov Substitution Principle (LSP)
 */

export interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IHttpTransport {
  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
  post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
  put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
  patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T>;
  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
}
