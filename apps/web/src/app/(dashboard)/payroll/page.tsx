import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";

export default function PayrollPage() {
  const runs = [
    { id: "RUN-2026-11", month: "November 2026", staffCount: 248, totalGross: 8420000, totalNet: 7950000, status: "DISPATCHED", maker: "Finance Officer (Kamal)", checker: "Principal (Dr. Rafiqul)" },
    { id: "RUN-2026-10", month: "October 2026", staffCount: 246, totalGross: 8350000, totalNet: 7890000, status: "PAID", maker: "Finance Officer (Kamal)", checker: "Principal (Dr. Rafiqul)" },
  ];

  const sampleLines = [
    { id: "LINE-001", staff: "Dr. Rafiqul Islam", role: "Principal", bank: "Sonali Bank", account: "•••• 4412", gross: 85000, deductions: 2500, net: 82500, status: "DISPATCHED" },
    { id: "LINE-002", staff: "Rahim Ahmed", role: "Senior Teacher (Physics)", bank: "Dutch-Bangla Bank", account: "•••• 8921", gross: 45000, deductions: 1200, net: 43800, status: "DISPATCHED" },
    { id: "LINE-003", staff: "Fatima Begum", role: "Lecturer (English)", bank: "BRAC Bank", account: "•••• 1120", gross: 38000, deductions: 0, net: 38000, status: "DISPATCHED" },
    { id: "LINE-004", staff: "Farhana Yasmin", role: "Office Executive", bank: "City Bank", account: "•••• 7745", gross: 28000, deductions: 800, net: 27200, status: "DISPATCHED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Payroll Runs</h1>
          <p className="text-muted-foreground">
            Two-stage Maker-Checker payroll computation locked against monthly attendance.
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Reconcile Bank Debit</Button>
          <Button>Initiate Payroll Run</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Monthly Net Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(7950000)}</div>
            <p className="text-xs text-muted-foreground">November 2026 Batch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dispatched Faculty & Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">248 / 248</div>
            <p className="text-xs text-muted-foreground">100% BEFTN routable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Lock Gate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">LOCKED</div>
            <p className="text-xs text-muted-foreground">Period Close approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No bank bouncebacks</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Payroll Batches</CardTitle>
            <Badge variant="outline" className="text-xs bg-muted">
              🛡️ Maker != Checker Constraint Enforced
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
                    {r.staffCount} staff | Net: <span className="font-medium text-foreground">{formatBDT(r.totalNet)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Maker: {r.maker} · Checker: {r.checker}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {r.status} (BEFTN)
                  </Badge>
                  <Button size="sm" variant="outline">Download BEFTN</Button>
                  <Button size="sm" variant="ghost">Generate Payslips</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Disbursement Detail Snapshot</CardTitle>
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
                {sampleLines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-3 py-2.5 font-medium">{line.staff}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{line.role}</td>
                    <td className="px-3 py-2.5">{line.bank} <span className="font-mono text-muted-foreground">{line.account}</span></td>
                    <td className="px-3 py-2.5 font-mono">{formatBDT(line.gross)}</td>
                    <td className="px-3 py-2.5 font-mono text-red-600">-{formatBDT(line.deductions)}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-green-700">{formatBDT(line.net)}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-[10px] text-green-600">
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
    </div>
  );
}
