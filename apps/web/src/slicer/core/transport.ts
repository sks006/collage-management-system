import { apiClient } from "@/lib/api-client";
import { IHttpTransport } from "./types";

/**
 * Concrete implementation of IHttpTransport using the configured apiClient.
 * Adheres to Dependency Inversion Principle (DIP) & Single Responsibility Principle (SRP).
 */
export class DefaultHttpTransport implements IHttpTransport {
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return apiClient<T>(endpoint, {
      method: "GET",
      headers,
    });
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return apiClient<T>(endpoint, {
      method: "POST",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return apiClient<T>(endpoint, {
      method: "PUT",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return apiClient<T>(endpoint, {
      method: "PATCH",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return apiClient<T>(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

export const defaultTransport: IHttpTransport = new DefaultHttpTransport();
