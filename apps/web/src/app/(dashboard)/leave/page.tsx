"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
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
import { useLeaveSlice, LeaveRequestItem } from "@/slicer";
import { CalendarPlus, Check, X, Clock, CalendarDays } from "lucide-react";

export default function LeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const { requests, loading, handlers } = useLeaveSlice();

  // Form State
  const [leaveType, setLeaveType] = React.useState("CASUAL");
  const [startDate, setStartDate] = React.useState("2026-04-10");
  const [endDate, setEndDate] = React.useState("2026-04-12");
  const [reason, setReason] = React.useState("");

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handlers.handleApplyLeave({
      leaveType,
      from: startDate,
      to: endDate,
      days: 3,
      reason: reason || "Personal grounds",
    });

    if (success) {
      setModalOpen(false);
      setReason("");
    }
  };

  const handleApprove = async (id: string) => {
    await handlers.handleApproveLeave(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Leave & Substitution</h1>
          <p className="text-sm text-muted-foreground">
            Academic calendar-linked leave quotas (leave.leave_request) and substitution tracking.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
          <CalendarPlus className="h-3.5 w-3.5" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Casual Leave (CL)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">10 / 14</div>
            <p className="text-[11px] text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Medical Leave (ML)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">14 / 14</div>
            <p className="text-[11px] text-muted-foreground">Full entitlement</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {requests.filter((r) => r.status === "PENDING").length}
            </div>
            <p className="text-[11px] text-muted-foreground">Awaiting Principal action</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Class Substitution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Auto-Assigned</div>
            <p className="text-[11px] text-muted-foreground">Zero unattended classes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Staff Leave Applications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Faculty / Staff</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates & Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {r.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{r.staffName || r.applicant}</div>
                    <div className="text-xs text-muted-foreground">{r.designation}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline">{r.leaveType || r.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{r.startDate || r.from} to {r.endDate || r.to}</div>
                    <div className="text-muted-foreground font-mono">{r.days} Day(s)</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {r.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "destructive" : "warning"}
                      className="text-[10px] uppercase font-semibold"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "PENDING" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApprove(r.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {r.status === "APPROVED" && (
                      <span className="text-xs text-muted-foreground">
                        Approved by {r.approvedBy || "Principal"}
                      </span>
                    )}
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
        title="Submit Leave Application"
        description="Deducts from academic year quota upon Principal Maker-Checker authorization"
      >
        <form onSubmit={handleApplyLeave} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Leave Category</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="CASUAL">Casual Leave (CL)</option>
              <option value="MEDICAL">Medical Leave (ML)</option>
              <option value="EARNED">Earned Leave (EL)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Start Date</label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">End Date</label>
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Reason for Leave</label>
            <Input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Medical consultation and prescribed bed rest"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Application
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
