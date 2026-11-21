import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";

export default function FinancePage() {
  const feeSchedules = [
    { id: "1", name: "Class 11 Science Tuition", amount: 3500, frequency: "MONTHLY", class: "Class 11 - Science" },
    { id: "2", name: "Class 11 Commerce Tuition", amount: 3000, frequency: "MONTHLY", class: "Class 11 - Commerce" },
    { id: "3", name: "Term 1 Examination Fee", amount: 1500, frequency: "ONE_TIME", class: "All Classes" },
    { id: "4", name: "Transport Fee (Uttara Route)", amount: 2000, frequency: "MONTHLY", class: "Optional" },
  ];

  const recentInvoices = [
    { id: "INV-2026-11-001", student: "Tanvir Hasan (DMC-2026-001)", month: "November 2026", amount: 3500, status: "PAID", method: "bKash" },
    { id: "INV-2026-11-002", student: "Nusrat Jahan (DMC-2026-002)", month: "November 2026", amount: 3000, status: "PAID", method: "Nagad" },
    { id: "INV-2026-11-003", student: "Sadman Sakib (DMC-2026-003)", month: "November 2026", amount: 3500, status: "ISSUED", method: "Pending" },
    { id: "INV-2026-11-004", student: "Mehnaz Akter (DMC-2026-004)", month: "November 2026", amount: 3000, status: "OVERDUE", method: "Unpaid" },
  ];

  const ledgerEntries = [
    { id: "TX-9901", account: "STUDENT_FEES", party: "Tanvir Hasan", amount: 3500, direction: "CREDIT", source: "PAYMENT (bKash)", time: "10 mins ago", status: "POSTED" },
    { id: "TX-9902", account: "STUDENT_FEES", party: "Nusrat Jahan", amount: 3000, direction: "CREDIT", source: "PAYMENT (Nagad)", time: "25 mins ago", status: "POSTED" },
    { id: "TX-9903", account: "WAIVER", party: "Anisur Rahman", amount: 1500, direction: "DEBIT", source: "WAIVER (Principal Approval)", time: "2 hours ago", status: "POSTED" },
    { id: "TX-9904", account: "PAYROLL", party: "Faculty Disbursement", amount: 1250000, direction: "DEBIT", source: "BEFTN Bank Batch", time: "Yesterday", status: "POSTED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Fees & Immutable Ledger</h1>
          <p className="text-muted-foreground">Double-entry, append-only financial records and payment reconciliation.</p>
        </div>
        <div className="space-x-3">
          <Button variant="outline">Generate Monthly Invoices</Button>
          <Button>Reconcile Settlement</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoiced (Nov)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(5200000)}</div>
            <p className="text-xs text-muted-foreground">1,485 invoices issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collected via MFS / Gateway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatBDT(4250000)}</div>
            <p className="text-xs text-muted-foreground">81.7% collection rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatBDT(950000)}</div>
            <p className="text-xs text-muted-foreground">271 unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bank Reconciled (02:00)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <p className="text-xs text-muted-foreground">0 settlement discrepancies</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Fee Schedules</CardTitle>
              <Button size="sm" variant="outline">Add Fee</Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {feeSchedules.map((fee) => (
                  <div key={fee.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-xs">{fee.name}</p>
                      <p className="text-[11px] text-muted-foreground">{fee.class} | {fee.frequency}</p>
                    </div>
                    <span className="font-semibold text-xs">{formatBDT(fee.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Student Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b uppercase">
                    <tr>
                      <th className="px-3 py-2">Invoice #</th>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-3 py-2.5 font-mono">{inv.id}</td>
                        <td className="px-3 py-2.5 font-medium">{inv.student}</td>
                        <td className="px-3 py-2.5 font-semibold">{formatBDT(inv.amount)}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={inv.status === "PAID" ? "outline" : inv.status === "OVERDUE" ? "destructive" : "secondary"}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{inv.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Immutable Ledger Audit Trail</CardTitle>
            <Badge variant="outline" className="text-xs bg-muted">
              🔒 Append-Only Trigger Enforced
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-muted/50 border-b uppercase">
                <tr>
                  <th className="px-3 py-2">Tx ID</th>
                  <th className="px-3 py-2">Account</th>
                  <th className="px-3 py-2">Party</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Direction</th>
                  <th className="px-3 py-2">Source / Reference</th>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans">
                {ledgerEntries.map((tx) => (
                  <tr key={tx.id} className="font-mono text-xs">
                    <td className="px-3 py-2.5 font-bold">{tx.id}</td>
                    <td className="px-3 py-2.5">{tx.account}</td>
                    <td className="px-3 py-2.5 font-sans">{tx.party}</td>
                    <td className="px-3 py-2.5 font-semibold">{formatBDT(tx.amount)}</td>
                    <td className="px-3 py-2.5">
                      <span className={tx.direction === "CREDIT" ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
                        {tx.direction}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{tx.source}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{tx.time}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-[10px] text-green-600">
                        {tx.status}
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
