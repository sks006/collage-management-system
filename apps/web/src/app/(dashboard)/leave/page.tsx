import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LeavePage() {
  const leaveBalances = [
    { type: "Casual Leave (CL)", remaining: 8, total: 12 },
    { type: "Medical Leave (ML)", remaining: 10, total: 14 },
    { type: "Earned Leave (EL)", remaining: 15, total: 20 },
  ];

  const recentApplications = [
    { id: "1", applicant: "Rahim Ahmed (Senior Teacher)", type: "Medical", from: "2026-11-25", to: "2026-11-27", status: "APPROVED", approver: "Principal" },
    { id: "2", applicant: "Fatima Begum (Lecturer, English)", type: "Casual", from: "2026-12-01", to: "2026-12-02", status: "PENDING", approver: "Pending" },
    { id: "3", applicant: "Kamal Hossain (Accountant)", type: "Casual", from: "2026-11-10", to: "2026-11-11", status: "APPROVED", approver: "Admin" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Manage staff leave balances, applications, and approvals.</p>
        </div>
        <Button>Apply for Leave</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaveBalances.map((b) => (
          <Card key={b.type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{b.type}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{b.remaining} days</div>
              <p className="text-xs text-muted-foreground">out of {b.total} days annual allocation</p>
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
            {recentApplications.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{req.applicant}</p>
                  <p className="text-xs text-muted-foreground">{req.type} Leave | {req.from} to {req.to}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={req.status === "APPROVED" ? "outline" : "secondary"}>
                    {req.status}
                  </Badge>
                  {req.status === "PENDING" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="ghost" className="text-destructive">Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
