"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { Lock, Unlock, CheckCircle2, ShieldCheck, FileCheck } from "lucide-react";

export default function PeriodClosePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = React.useState<"PENDING_APPROVAL" | "APPROVED_LOCKED">("PENDING_APPROVAL");
  const [approvedBy, setApprovedBy] = React.useState<string | null>(null);
  const [approvedAt, setApprovedAt] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const approverName = user?.name || "Dr. Rafiqul Islam (Principal)";
      const now = new Date().toLocaleString();
      setStatus("APPROVED_LOCKED");
      setApprovedBy(approverName);
      setApprovedAt(now);
      toast({
        title: "Period Close APPROVED & LOCKED 🔒",
        description: `November 2026 attendance snapshot locked by ${approverName}. Payroll computation unblocked.`,
        type: "success",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStatus("PENDING_APPROVAL");
    setApprovedBy(null);
    setApprovedAt(null);
    toast({
      title: "Period Gate Reset",
      description: "Period status set back to PENDING_APPROVAL for testing.",
      type: "info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>Period Close Gate</span>
            {status === "APPROVED_LOCKED" ? (
              <Lock className="h-5 w-5 text-emerald-600" />
            ) : (
              <Unlock className="h-5 w-5 text-amber-500" />
            )}
          </h1>
          <p className="text-muted-foreground">
            Attendance freezing gate. Once locked, attendance cannot be mutated by late edits.
          </p>
        </div>
        <div className="flex gap-2">
          {status === "APPROVED_LOCKED" ? (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset to Pending
              </Button>
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <FileCheck className="h-4 w-4" />
                <span>Export Audit Certificate</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <ShieldCheck className="h-4 w-4" />
              {isLoading ? "Validating Constraints..." : "Approve & Lock Period"}
            </Button>
          )}
        </div>
      </div>

      <Card className={status === "APPROVED_LOCKED" ? "border-emerald-500/50" : "border-amber-500/50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Monthly Attendance Freezing Review</CardTitle>
            <Badge
              variant={status === "APPROVED_LOCKED" ? "success" : "warning"}
              className="text-xs font-mono px-3 py-1"
            >
              {status === "APPROVED_LOCKED" ? "LOCKED & FROZEN" : "PENDING_APPROVAL"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-lg bg-card">
            <div>
              <div className="text-xs text-muted-foreground">Academic Term & Month</div>
              <div className="font-bold text-base">November 2026 (Term 1)</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Recorded Periods</div>
              <div className="font-bold text-base text-foreground">3,485,210 Events</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Submitted By (Maker)</div>
              <div className="font-medium text-sm">HR Specialist (Farhana)</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Approved By (Checker)</div>
              <div className="font-semibold text-sm text-emerald-600">
                {approvedBy || "Pending Checker Sign-Off"}
              </div>
            </div>
          </div>

          {status === "APPROVED_LOCKED" ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Attendance Frozen at {approvedAt}</span>
              </div>
              <p>
                All period attendance events for November 2026 are cryptographically verified and immutable.
                Payroll engine is authorized to calculate salaries against this snapshot.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="font-bold text-sm">⚠️ Period Approval Gate Ready</div>
              <p>
                <strong>Security Invariant 9:</strong> Approving this snapshot freezes all period attendance records.
                Payroll physically reads only APPROVED period closes. Maker-checker constraint enforces approver ≠ submitter.
              </p>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Institutional Attendance Breakdown by Class
            </div>
            <div className="divide-y text-xs">
              <div className="px-4 py-2.5 flex justify-between">
                <span>Class 11 Science (Sections A, B, C)</span>
                <span className="font-semibold text-emerald-600">96.4% Attendance Rate · 0 Unmarked</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span>Class 11 Commerce (Sections A, B)</span>
                <span className="font-semibold text-emerald-600">94.8% Attendance Rate · 0 Unmarked</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span>Class 12 Science (Sections A, B, C)</span>
                <span className="font-semibold text-emerald-600">95.1% Attendance Rate · 0 Unmarked</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <span>Class 12 Humanities (Sections A, B)</span>
                <span className="font-semibold text-emerald-600">93.9% Attendance Rate · 0 Unmarked</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
