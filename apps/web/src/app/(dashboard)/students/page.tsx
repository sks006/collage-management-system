import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-muted-foreground">Search and manage student profiles.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Import CSV</Button>
          <Button>Add Student</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registered Students</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Fast search powered by PostgreSQL pg_trgm indexes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
