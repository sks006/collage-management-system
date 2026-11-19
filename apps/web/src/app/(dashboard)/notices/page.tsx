import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NoticesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Institutional Notices</h1>
          <p className="text-muted-foreground">Announcements and broadcast messages.</p>
        </div>
        <Button>Create Notice</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Notices delivered to students, guardians, and staff.</p>
        </CardContent>
      </Card>
    </div>
  );
}
