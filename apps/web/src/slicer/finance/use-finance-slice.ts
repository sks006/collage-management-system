import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { InvoiceItem, LedgerItem, CreateInvoiceInput, IFinanceHandlers } from "./finance.types";
import { financeApi, FinanceApiService } from "./finance.api";

export function useFinanceSlice(api: FinanceApiService = financeApi) {
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [ledger, setLedger] = React.useState<LedgerItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFinanceData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [invData, ledData] = await Promise.allSettled([
        api.getInvoices(),
        api.getLedger(),
      ]);

      if (invData.status === "fulfilled" && Array.isArray(invData.value)) {
        setInvoices(invData.value);
      }
      if (ledData.status === "fulfilled" && Array.isArray(ledData.value)) {
        setLedger(ledData.value);
      }
    } catch (err: any) {
      toast({
        title: "Finance Data Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  React.useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleCreateInvoice = async (input: CreateInvoiceInput): Promise<boolean> => {
    try {
      const created = await api.createInvoice(input);
      setInvoices((prev) => [created, ...prev]);
      toast({
        title: "Invoice Issued",
        description: `Generated tuition invoice for ৳${input.amount}.`,
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Invoice Generation Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleInitiatePayment = async (
    invoiceId: string,
    method: string,
  ): Promise<{ redirectUrl?: string } | null> => {
    try {
      const res = await api.initiatePayment(invoiceId, method);
      toast({
        title: "Payment Gateway Redirect",
        description: `Redirecting to secure ${method} checkout...`,
        type: "info",
      });
      return res;
    } catch (err: any) {
      toast({
        title: "Payment Initiation Failed",
        description: err.message,
        type: "error",
      });
      return null;
    }
  };

  const handlers: IFinanceHandlers = {
    handleCreateInvoice,
    handleInitiatePayment,
    handleRefresh: fetchFinanceData,
  };

  return {
    invoices,
    ledger,
    loading,
    handlers,
  };
}
