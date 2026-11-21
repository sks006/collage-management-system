"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { CalendarPlus, Check, X, Clock } from "lucide-react";

interface LeaveRequestItem {
  id: string;
  applicant: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approver: string;
}

export default function LeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);

  const [balances, setBalances] = React.useState([
    { type: "Casual Leave (CL)", remaining: 8, total: 12 },
    { type: "Medical Leave (ML)", remaining: 10, total: 14 },
    { type: "Earned Leave (EL)", remaining: 15, total: 20 },
  ]);

  const [requests, setRequests] = React.useState<LeaveRequestItem[]>([
    { id: "1", applicant: "Rahim Ahmed (Senior Teacher)", type: "Medical", from: "2026-11-25", to: "2026-11-27", days: 3, reason: "Viral fever and rest", status: "APPROVED", approver: "Principal" },
    { id: "2", applicant: "Fatima Begum (Lecturer, English)", type: "Casual", from: "2026-12-01", to: "2026-12-02", days: 2, reason: "Family wedding event", status: "PENDING", approver: "Pending" },
    { id: "3", applicant: "Kamal Hossain (Accountant)", type: "Casual", from: "2026-11-10", to: "2026-11-11", days: 2, reason: "Personal emergency", status: "APPROVED", approver: "Admin" },
  ]);

  // Form State
  const [leaveType, setLeaveType] = React.useState("Casual");
  const [startDate, setStartDate] = React.useState("2026-12-05");
  const [endDate, setEndDate] = React.useState("2026-12-06");
  const [reason, setReason] = React.useState("");

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: LeaveRequestItem = {
      id: Math.random().toString(36).substring(2, 9),
      applicant: `${user?.name || "Faculty Member"} (${user?.roles[0] || "Staff"})`,
      type: leaveType,
      from: startDate,
      to: endDate,
      days: 2,
      reason: reason || "Standard personal leave",
      status: "PENDING",
      approver: "Pending",
    };

    setRequests([newReq, ...requests]);
    setModalOpen(false);
    setReason("");

    toast({
      title: "Leave Application Submitted",
      description: `Your ${leaveType} leave request from ${startDate} to ${endDate} is sent for Principal approval.`,
      type: "success",
    });
  };

  const handleStatusChange = (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status: newStatus,
          approver: user?.name || "Dr. Rafiqul Islam (Principal)",
        };
      }),
    );

    toast({
      title: `Leave Application ${newStatus}`,
      description: `Application has been marked as ${newStatus}. Notification dispatched.`,
      type: newStatus === "APPROVED" ? "success" : "info",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Manage staff leave balances, applications, and approvals.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((b) => (
          <Card key={b.type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{b.type}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{b.remaining} days</div>
              <p className="text-xs text-muted-foreground mt-1">out of {b.total} days annual allocation</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{req.applicant}</span>
                    <Badge variant={req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "destructive" : "warning"}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {req.type} Leave · {req.from} to {req.to} ({req.days} days) · Reason: {req.reason}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Approver: <strong className="text-foreground">{req.approver}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1"
                        onClick={() => handleStatusChange(req.id, "APPROVED")}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 h-8 text-xs gap-1"
                        onClick={() => handleStatusChange(req.id, "REJECTED")}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Apply for Staff Leave"
        description="Submit your leave application for academic administration approval."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
            >
              <option value="Casual">Casual Leave (CL)</option>
              <option value="Medical">Medical Leave (ML)</option>
              <option value="Earned">Earned Leave (EL)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">From Date</label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">To Date</label>
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Reason for Absence</label>
            <Input
              type="text"
              required
              placeholder="e.g. Urgent family matter / Medical checkup"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
