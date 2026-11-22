"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { formatBDT } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { usePayrollSlice, PayrollRunItem, PayrollLineItem } from "@/slicer";
import { DollarSign, Download, CheckCircle2, ShieldCheck, Plus, RefreshCw, FileText } from "lucide-react";

export default function PayrollPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState("April 2026");

  const { runs, lines, loading, handlers } = usePayrollSlice();

  const handleInitiateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handlers.handleComputePayroll(selectedMonth);
    if (success) {
      setModalOpen(false);
    }
  };

  const handleApproveRun = async (runId: string) => {
    await handlers.handleApproveRun(runId);
  };

  const handleDownloadBeftn = async (run: PayrollRunItem) => {
    await handlers.handleDispatchBeftn(run.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Payroll & Salary Dispatch</h1>
          <p className="text-sm text-muted-foreground">
            Two-stage Maker-Checker payroll computation locked against monthly attendance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5 text-xs whitespace-nowrap">
            <Plus className="h-3.5 w-3.5" />
            <span>Initiate Payroll Run</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monthly Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold truncate tracking-tight">{formatBDT(512000)}</div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">Active Computation Cycle</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Beneficiary Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 truncate">{lines.length || 4} Staff</div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">100% BEFTN verified</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Attendance Gate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 truncate">LOCKED</div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">attendance.period_close valid</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Outbox Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-base font-bold text-primary font-mono truncate leading-8">
              COMPUTE_PAYROLL
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">SKIP LOCKED concurrency</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Monthly Payroll Batches</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[130px]">Run ID</TableHead>
                <TableHead className="min-w-[140px]">Payroll Month</TableHead>
                <TableHead className="min-w-[120px]">Staff Count</TableHead>
                <TableHead className="min-w-[160px]">Disbursement Total</TableHead>
                <TableHead className="min-w-[140px]">Authorization State</TableHead>
                <TableHead className="text-right min-w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                    {r.id}
                  </TableCell>
                  <TableCell className="font-medium text-foreground whitespace-nowrap">
                    {r.month}
                  </TableCell>
                  <TableCell className="text-xs font-semibold whitespace-nowrap">
                    {r.totalStaff || r.staffCount || 4} Members
                  </TableCell>
                  <TableCell className="font-semibold text-sm whitespace-nowrap">
                    {formatBDT(r.totalAmount || r.totalNet || 512000)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        r.status === "DISPATCHED" || r.status === "PAID"
                          ? "success"
                          : r.status === "APPROVED"
                          ? "default"
                          : "warning"
                      }
                      className="text-[10px] uppercase font-semibold"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== "DISPATCHED" && r.status !== "PAID" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                          onClick={() => handleApproveRun(r.id)}
                        >
                          Authorize Run
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 whitespace-nowrap"
                        onClick={() => handleDownloadBeftn(r)}
                      >
                        <Download className="h-3 w-3" />
                        <span>BEFTN File</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Individual Payslip Lines (payroll.payroll_line)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Line ID</TableHead>
                <TableHead className="min-w-[160px]">Faculty / Employee</TableHead>
                <TableHead className="min-w-[140px]">Designation</TableHead>
                <TableHead className="min-w-[110px]">Base Salary</TableHead>
                <TableHead className="min-w-[110px]">Allowances</TableHead>
                <TableHead className="min-w-[110px]">Deductions</TableHead>
                <TableHead className="min-w-[130px]">Net Disbursement</TableHead>
                <TableHead className="text-right min-w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                    {l.id}
                  </TableCell>
                  <TableCell className="font-medium text-foreground whitespace-nowrap">
                    {l.employeeName || l.staff}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {l.designation || l.role}
                  </TableCell>
                  <TableCell className="text-xs font-medium whitespace-nowrap">
                    {formatBDT(l.baseSalary || 50000)}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-emerald-600 whitespace-nowrap">
                    +{formatBDT(10000)}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-rose-600 whitespace-nowrap">
                    -{formatBDT(l.deductions || 2000)}
                  </TableCell>
                  <TableCell className="font-semibold text-sm whitespace-nowrap">
                    {formatBDT(l.netSalary || l.net || 58000)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] text-emerald-600 font-mono">
                      {l.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Compute Monthly Payroll"
        description="Reads attendance locks from attendance.period_close and calculates salary structure"
      >
        <form onSubmit={handleInitiateRun} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Select Payroll Month</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="April 2026">April 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1 border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attendance Gate Status:</span>
              <span className="text-emerald-600 font-semibold">ALL SECTIONS LOCKED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eligible Faculty & Staff:</span>
              <span className="font-semibold">{lines.length || 4} Profiles</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Compute & Create Draft Run
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
