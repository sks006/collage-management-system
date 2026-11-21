"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { formatBDT } from "@/lib/utils";
import { DollarSign, Download, CheckCircle2, ShieldCheck, Plus, RefreshCw, FileText } from "lucide-react";

interface PayrollRunItem {
  id: string;
  month: string;
  staffCount: number;
  totalGross: number;
  totalNet: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "DISPATCHED" | "PAID";
  maker: string;
  checker: string;
}

export default function PayrollPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);

  const [runs, setRuns] = React.useState<PayrollRunItem[]>([
    {
      id: "RUN-2026-11",
      month: "November 2026",
      staffCount: 248,
      totalGross: 8420000,
      totalNet: 7950000,
      status: "DISPATCHED",
      maker: "Finance Officer (Kamal)",
      checker: "Principal (Dr. Rafiqul)",
    },
    {
      id: "RUN-2026-10",
      month: "October 2026",
      staffCount: 246,
      totalGross: 8350000,
      totalNet: 7890000,
      status: "PAID",
      maker: "Finance Officer (Kamal)",
      checker: "Principal (Dr. Rafiqul)",
    },
  ]);

  const [lines, setLines] = React.useState([
    { id: "LINE-001", staff: "Dr. Rafiqul Islam", role: "Principal", bank: "Sonali Bank", account: "•••• 4412", gross: 85000, deductions: 2500, net: 82500, status: "DISPATCHED" },
    { id: "LINE-002", staff: "Rahim Ahmed", role: "Senior Teacher (Physics)", bank: "Dutch-Bangla Bank", account: "•••• 8921", gross: 45000, deductions: 1200, net: 43800, status: "DISPATCHED" },
    { id: "LINE-003", staff: "Fatima Begum", role: "Lecturer (English)", bank: "BRAC Bank", account: "•••• 1120", gross: 38000, deductions: 0, net: 38000, status: "DISPATCHED" },
    { id: "LINE-004", staff: "Farhana Yasmin", role: "Office Executive", bank: "City Bank", account: "•••• 7745", gross: 28000, deductions: 800, net: 27200, status: "DISPATCHED" },
  ]);

  const handleInitiateRun = () => {
    const newRun: PayrollRunItem = {
      id: `RUN-2026-${Math.floor(100 + Math.random() * 900)}`,
      month: "December 2026",
      staffCount: 250,
      totalGross: 8500000,
      totalNet: 8020000,
      status: "PENDING_APPROVAL",
      maker: user?.name || "Finance Officer",
      checker: "Pending Sign-off",
    };

    setRuns([newRun, ...runs]);
    setModalOpen(false);

    toast({
      title: "Payroll Run Initiated",
      description: `December 2026 draft payroll run computed from attendance lock. Pending Principal Maker-Checker approval.`,
      type: "success",
    });
  };

  const handleApproveRun = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: "DISPATCHED",
              checker: user?.name || "Dr. Rafiqul Islam (Principal)",
            }
          : r,
      ),
    );

    toast({
      title: "Payroll Approved & Dispatched via BEFTN 🚀",
      description: `Disbursement authorized by ${user?.name || "Principal"}. Ledger entry posted and bank batch generated.`,
      type: "success",
    });
  };

  const handleDownloadBeftn = (run: PayrollRunItem) => {
    // Generate sample Bangladesh Bank standard BEFTN batch file
    const header = `101000000000000000000000DHAKA MODEL COLLEGE PAYROLL   ${run.month.replace(" ", "")}20261121\n`;
    const body = lines
      .map(
        (l) =>
          `206000000000000000000000${l.staff.padEnd(25, " ")}${String(l.net).padStart(10, "0")}00000000000000`,
      )
      .join("\n");
    const content = header + body;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BEFTN_${run.id}_BANGLADESH_BANK.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "BEFTN Batch File Downloaded",
      description: `Saved BEFTN_${run.id}_BANGLADESH_BANK.txt for commercial bank clearing upload.`,
      type: "success",
    });
  };

  const handleGeneratePayslips = () => {
    toast({
      title: "PDF Payslips Queued for Cloudflare R2",
      description: `Worker processor is rendering ${lines.length} encrypted payslips with digital institutional seal.`,
      type: "info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff Payroll Runs</h1>
          <p className="text-muted-foreground">
            Two-stage Maker-Checker payroll computation locked against monthly attendance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs gap-1.5" onClick={() => toast({ title: "Bank Debit Matched", description: "All ledger debits match commercial bank clearing balance.", type: "success" })}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reconcile Debit</span>
          </Button>
          <Button onClick={() => setModalOpen(true)} className="text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Initiate Payroll Run</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Monthly Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(7950000)}</div>
            <p className="text-[11px] text-muted-foreground">November 2026 Batch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Dispatched Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">248 / 248</div>
            <p className="text-[11px] text-muted-foreground">100% BEFTN routable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Attendance Gate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">LOCKED</div>
            <p className="text-[11px] text-muted-foreground">Period Close approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Failed Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-[11px] text-muted-foreground">Zero bank bouncebacks</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Payroll Batches</CardTitle>
            <Badge variant="outline" className="text-xs bg-muted font-mono">
              🛡️ Maker != Checker Constraint
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            {runs.map((r) => (
              <div key={r.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-base">{r.month}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {r.staffCount} staff | Net: <strong className="text-foreground">{formatBDT(r.totalNet)}</strong>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Maker: <span className="text-foreground">{r.maker}</span> · Checker: <span className="text-foreground">{r.checker}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={r.status === "DISPATCHED" || r.status === "PAID" ? "success" : "warning"}>
                    {r.status}
                  </Badge>

                  {r.status === "PENDING_APPROVAL" && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1" onClick={() => handleApproveRun(r.id)}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Approve & Dispatch</span>
                    </Button>
                  )}

                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handleDownloadBeftn(r)}>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download BEFTN</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={handleGeneratePayslips}>
                    <FileText className="h-3.5 w-3.5" />
                    <span>Payslips</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Disbursement Detail Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase">
                <tr>
                  <th className="px-3 py-2">Staff Member</th>
                  <th className="px-3 py-2">Designation</th>
                  <th className="px-3 py-2">Bank & Account</th>
                  <th className="px-3 py-2">Gross Pay</th>
                  <th className="px-3 py-2">Deductions</th>
                  <th className="px-3 py-2">Net Pay</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lines.map((line) => (
                  <tr key={line.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-medium">{line.staff}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{line.role}</td>
                    <td className="px-3 py-2.5">{line.bank} <span className="font-mono text-muted-foreground">{line.account}</span></td>
                    <td className="px-3 py-2.5 font-mono">{formatBDT(line.gross)}</td>
                    <td className="px-3 py-2.5 font-mono text-red-600">-{formatBDT(line.deductions)}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatBDT(line.net)}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="success" className="text-[10px]">
                        {line.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Initiate Run Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Initiate Monthly Payroll Run"
        description="Compute gross-to-net salaries from approved attendance period close."
      >
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg text-xs space-y-1.5">
            <div>Month: <strong>December 2026</strong></div>
            <div>Eligible Staff: <strong>250 active teachers and staff</strong></div>
            <div>Attendance Snapshot: <strong className="text-emerald-600">LOCKED & VERIFIED</strong></div>
          </div>
          <p className="text-xs text-muted-foreground">
            This action computes salary deductions for approved unpaid leaves and period lates according to Dhaka Model College HR policy.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleInitiateRun}>Confirm & Compute Payroll</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
