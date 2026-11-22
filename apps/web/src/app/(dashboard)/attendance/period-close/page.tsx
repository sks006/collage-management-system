"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAttendanceSlice } from "@/slicer";
import { Lock, Unlock, CheckCircle2, ShieldCheck, FileCheck, AlertTriangle } from "lucide-react";

export default function PeriodClosePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { periodCloses, loadingCloses, handlers } = useAttendanceSlice();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleApprove = async (closeId: string) => {
    setIsLoading(true);
    try {
      await handlers.handleApprovePeriodClose(closeId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>Monthly Period Close Gate</span>
            <Lock className="h-5 w-5 text-emerald-600" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Attendance freeze gate enforcing Invariant #2 (Maker $\neq$ Checker) before monthly payroll computation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
            Postgres Table: attendance.period_close
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Locked Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {periodCloses.filter((p) => p.status === "LOCKED").length}
            </div>
            <p className="text-[11px] text-muted-foreground">Immutable attendance</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Sign-off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {periodCloses.filter((p) => p.status === "PENDING_APPROVAL").length}
            </div>
            <p className="text-[11px] text-muted-foreground">Requires Principal</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Maker-Checker Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Enforced</div>
            <p className="text-[11px] text-muted-foreground">CHECK approved_by &lt;&gt; submitted_by</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Downstream Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">sms_payroll_reader</div>
            <p className="text-[11px] text-muted-foreground">Can only read locked periods</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Monthly Section Attendance Snapshots</CardTitle>
              <p className="text-xs text-muted-foreground">Class-wise monthly presence rate and lock authorization</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Snapshot ID</TableHead>
                <TableHead>Section & Month</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>Submitted By (Maker)</TableHead>
                <TableHead>Approved By (Checker)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodCloses.map((pc) => (
                <TableRow key={pc.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {pc.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{pc.sectionName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{pc.month}</div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {pc.totalDays} Days
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="font-mono text-emerald-600">
                      {pc.presentRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {pc.submittedBy}
                  </TableCell>
                  <TableCell className="text-xs">
                    {pc.approvedBy ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {pc.approvedBy}
                      </span>
                    ) : (
                      <span className="text-amber-600 italic">Pending Sign-off</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {pc.status === "LOCKED" ? (
                      <Badge variant="success" className="text-[10px] uppercase font-mono">
                        LOCKED
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isLoading}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApprove(pc.id)}
                      >
                        Approve & Lock
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
