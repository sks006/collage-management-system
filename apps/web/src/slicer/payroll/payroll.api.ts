import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { PayrollRunItem, PayrollLineItem } from "./payroll.types";

export class PayrollApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getRuns(): Promise<PayrollRunItem[]> {
    return this.transport.get<PayrollRunItem[]>("/payroll/runs");
  }

  async getLines(runId?: string): Promise<PayrollLineItem[]> {
    const query = runId ? `?runId=${runId}` : "";
    return this.transport.get<PayrollLineItem[]>(`/payroll/lines${query}`);
  }

  async computeRun(month: string): Promise<any> {
    return this.transport.post("/payroll/compute", { month });
  }

  async approveRun(runId: string): Promise<any> {
    return this.transport.post(`/payroll/runs/${runId}/approve`, {});
  }

  async dispatchBeftn(runId: string): Promise<any> {
    return this.transport.post(`/payroll/runs/${runId}/dispatch`, {});
  }
}

export const payrollApi = new PayrollApiService();
