import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Directory</h1>
          <p className="text-muted-foreground">Faculty and office staff members.</p>
        </div>
        <Button>Register Staff</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Faculty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Full directory listing.</p>
        </CardContent>
      </Card>
    </div>
  );
}
