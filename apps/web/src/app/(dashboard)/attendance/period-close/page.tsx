import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PeriodClosePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Period Close Gate 🔒</h1>
          <p className="text-muted-foreground">
            Attendance freezing gate. Once locked, attendance cannot be mutated by late edits.
          </p>
        </div>
        <Button variant="default">Approve & Lock Period</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Attendance Freezing Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg bg-card">
            <div>
              <div className="text-xs text-muted-foreground">Month</div>
              <div className="font-bold text-base">November 2026</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge variant="warning">PENDING_APPROVAL</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Submitted By</div>
              <div className="font-medium text-sm">HR Specialist (Office)</div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted text-xs text-muted-foreground">
            <strong>Security Invariant 9:</strong> Approving this snapshot freezes all period attendance records.
            Payroll physically reads only APPROVED period closes. Maker-checker constraint enforces approver ≠ submitter.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
