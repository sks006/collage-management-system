import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Payroll Runs</h1>
          <p className="text-muted-foreground">BEFTN electronic bank transfers & payslips.</p>
        </div>
        <Button>Initiate Payroll Run</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Payroll Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold">November 2026 Payroll Run</div>
                <div className="text-xs text-muted-foreground">248 staff · Read from locked period close</div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="success">DISPATCHED (BEFTN)</Badge>
                <Button size="sm" variant="outline">Download BEFTN</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
