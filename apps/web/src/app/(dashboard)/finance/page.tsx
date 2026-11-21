"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatBDT } from "@/lib/utils";
import { CreditCard, Plus, RefreshCw, CheckCircle2, ShieldCheck, DollarSign } from "lucide-react";

interface InvoiceItem {
  id: string;
  student: string;
  month: string;
  amount: number;
  status: "PAID" | "ISSUED" | "OVERDUE";
  method: string;
}

interface LedgerItem {
  id: string;
  account: string;
  party: string;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  source: string;
  time: string;
  status: "POSTED";
}

export default function FinancePage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([
    { id: "INV-2026-11-001", student: "Tanvir Hasan (DMC-2026-001)", month: "November 2026", amount: 3500, status: "PAID", method: "bKash MFS" },
    { id: "INV-2026-11-002", student: "Nusrat Jahan (DMC-2026-002)", month: "November 2026", amount: 3000, status: "PAID", method: "Nagad MFS" },
    { id: "INV-2026-11-003", student: "Sadman Sakib (DMC-2026-003)", month: "November 2026", amount: 3500, status: "ISSUED", method: "Unpaid" },
    { id: "INV-2026-11-004", student: "Mehnaz Akter (DMC-2026-004)", month: "November 2026", amount: 3000, status: "OVERDUE", method: "Unpaid" },
  ]);

  const [ledger, setLedger] = React.useState<LedgerItem[]>([
    { id: "TX-9901", account: "STUDENT_FEES", party: "Tanvir Hasan", amount: 3500, direction: "CREDIT", source: "PAYMENT (bKash IPN)", time: "10 mins ago", status: "POSTED" },
    { id: "TX-9902", account: "STUDENT_FEES", party: "Nusrat Jahan", amount: 3000, direction: "CREDIT", source: "PAYMENT (Nagad IPN)", time: "25 mins ago", status: "POSTED" },
    { id: "TX-9903", account: "WAIVER", party: "Anisur Rahman", amount: 1500, direction: "DEBIT", source: "WAIVER (Principal Approved)", time: "2 hours ago", status: "POSTED" },
    { id: "TX-9904", account: "PAYROLL", party: "Faculty Disbursement", amount: 1250000, direction: "DEBIT", source: "BEFTN Bank Batch", time: "Yesterday", status: "POSTED" },
  ]);

  const [feeSchedules, setFeeSchedules] = React.useState([
    { id: "1", name: "Class 11 Science Tuition", amount: 3500, frequency: "MONTHLY", class: "Class 11 - Science" },
    { id: "2", name: "Class 11 Commerce Tuition", amount: 3000, frequency: "MONTHLY", class: "Class 11 - Commerce" },
    { id: "3", name: "Term 1 Examination Fee", amount: 1500, frequency: "ONE_TIME", class: "All Classes" },
    { id: "4", name: "Transport Fee (Uttara Route)", amount: 2000, frequency: "MONTHLY", class: "Optional" },
  ]);

  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceItem | null>(null);
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [addFeeModalOpen, setAddFeeModalOpen] = React.useState(false);
  const [selectedMfs, setSelectedMfs] = React.useState("bKash");
  const [isGenerating, setIsGenerating] = React.useState(false);

  // New Fee Schedule state
  const [newFeeName, setNewFeeName] = React.useState("");
  const [newFeeAmount, setNewFeeAmount] = React.useState("");
  const [newFeeClass, setNewFeeClass] = React.useState("Class 11 - Science");

  const handlePayInvoice = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setPayModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice) return;

    // 1. Update invoice
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === selectedInvoice.id
          ? { ...i, status: "PAID", method: `${selectedMfs} MFS` }
          : i,
      ),
    );

    // 2. Post immutable ledger entry
    const newTxId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: LedgerItem = {
      id: newTxId,
      account: "STUDENT_FEES",
      party: selectedInvoice.student.split("(")[0]?.trim() || "Student",
      amount: selectedInvoice.amount,
      direction: "CREDIT",
      source: `PAYMENT (${selectedMfs} IPN)`,
      time: "Just now",
      status: "POSTED",
    };
    setLedger([newEntry, ...ledger]);
    setPayModalOpen(false);

    toast({
      title: "Payment Received & Posted to Ledger",
      description: `${formatBDT(selectedInvoice.amount)} collected via ${selectedMfs}. Immutable Tx: ${newTxId}. Digital receipt queued.`,
      type: "success",
    });
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const generatedCount = 148;
      toast({
        title: "Bulk Invoices Generated Successfully",
        description: `Created ${generatedCount} student invoices for December 2026. Idempotency keys stored.`,
        type: "success",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddFeeSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newFee = {
      id: String(feeSchedules.length + 1),
      name: newFeeName,
      amount: Number(newFeeAmount) || 2000,
      frequency: "MONTHLY",
      class: newFeeClass,
    };
    setFeeSchedules([...feeSchedules, newFee]);
    setAddFeeModalOpen(false);
    setNewFeeName("");
    setNewFeeAmount("");

    toast({
      title: "Fee Schedule Added",
      description: `${newFee.name} (${formatBDT(newFee.amount)}) mapped to ${newFee.class}.`,
      type: "success",
    });
  };

  const handleReconcile = () => {
    toast({
      title: "Settlement Reconciled (02:00 Job)",
      description: "Aggregator settlement batch compares 100% against finance.ledger_entry. 0 mismatches.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Fees & Immutable Ledger</h1>
          <p className="text-muted-foreground">Double-entry, append-only financial records and payment reconciliation.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReconcile} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reconcile</span>
          </Button>
          <Button onClick={handleGenerateInvoices} disabled={isGenerating} className="gap-1.5 text-xs">
            <DollarSign className="h-3.5 w-3.5" />
            <span>{isGenerating ? "Generating..." : "Generate Monthly Invoices"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Total Invoiced (Nov)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(5200000)}</div>
            <p className="text-[11px] text-muted-foreground">1,485 active invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Collected via MFS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatBDT(4250000)}</div>
            <p className="text-[11px] text-muted-foreground">bKash, Nagad, Rocket</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatBDT(950000)}</div>
            <p className="text-[11px] text-muted-foreground">271 unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Bank Reconciled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <p className="text-[11px] text-muted-foreground">Zero ledger drift</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Fee Schedules</CardTitle>
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => setAddFeeModalOpen(true)}>
                <Plus className="h-3 w-3" />
                <span>Add Fee</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {feeSchedules.map((fee) => (
                  <div key={fee.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{fee.name}</p>
                      <p className="text-[11px] text-muted-foreground">{fee.class} · {fee.frequency}</p>
                    </div>
                    <span className="font-bold text-foreground">{formatBDT(fee.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Student Invoices</CardTitle>
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
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-mono">{inv.id}</td>
                        <td className="px-3 py-2.5 font-medium">{inv.student}</td>
                        <td className="px-3 py-2.5 font-semibold">{formatBDT(inv.amount)}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "destructive" : "warning"}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {inv.status !== "PAID" ? (
                            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePayInvoice(inv)}>
                              Collect Fee
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">{inv.method}</span>
                          )}
                        </td>
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
            <CardTitle className="text-base font-semibold">Immutable Ledger Audit Trail</CardTitle>
            <Badge variant="outline" className="text-xs bg-muted font-mono">
              🔒 Invariant 8: Append-Only Trigger
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
                  <th className="px-3 py-2">Source / Ref</th>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans">
                {ledger.map((tx) => (
                  <tr key={tx.id} className="font-mono text-xs">
                    <td className="px-3 py-2.5 font-bold text-primary">{tx.id}</td>
                    <td className="px-3 py-2.5">{tx.account}</td>
                    <td className="px-3 py-2.5 font-sans">{tx.party}</td>
                    <td className="px-3 py-2.5 font-bold">{formatBDT(tx.amount)}</td>
                    <td className="px-3 py-2.5">
                      <span className={tx.direction === "CREDIT" ? "text-emerald-600 font-bold" : "text-blue-600 font-bold"}>
                        {tx.direction}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{tx.source}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{tx.time}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="success" className="text-[10px]">
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

      {/* Pay Invoice Dialog */}
      <Dialog
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        title="Collect Fee / MFS Payment Callback"
        description="Simulate online payment callback via Bangladeshi payment aggregator."
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
              <div>Invoice: <strong>{selectedInvoice.id}</strong></div>
              <div>Student: <strong>{selectedInvoice.student}</strong></div>
              <div>Payable Amount: <strong className="text-base text-primary">{formatBDT(selectedInvoice.amount)}</strong></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Payment Gateway / MFS Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {["bKash", "Nagad", "Rocket"].map((mfs) => (
                  <button
                    key={mfs}
                    type="button"
                    onClick={() => setSelectedMfs(mfs)}
                    className={`p-3 border rounded-lg text-center text-xs font-bold transition-all ${
                      selectedMfs === mfs ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {mfs}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmPayment} className="bg-emerald-600 hover:bg-emerald-700">
                Confirm {selectedMfs} Payment
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Fee Schedule Dialog */}
      <Dialog
        open={addFeeModalOpen}
        onOpenChange={setAddFeeModalOpen}
        title="Create New Fee Schedule"
        description="Define institutional tuition, examination, or transport fees."
      >
        <form onSubmit={handleAddFeeSchedule} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Fee Title</label>
            <Input
              required
              placeholder="e.g. Science Laboratory Fee"
              value={newFeeName}
              onChange={(e) => setNewFeeName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Amount (BDT)</label>
            <Input
              type="number"
              required
              placeholder="e.g. 2500"
              value={newFeeAmount}
              onChange={(e) => setNewFeeAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Class Assignment</label>
            <select
              value={newFeeClass}
              onChange={(e) => setNewFeeClass(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
            >
              <option value="Class 11 - Science">Class 11 - Science</option>
              <option value="Class 11 - Commerce">Class 11 - Commerce</option>
              <option value="Class 12 - Science">Class 12 - Science</option>
              <option value="All Classes">All Classes</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setAddFeeModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Fee Schedule</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
