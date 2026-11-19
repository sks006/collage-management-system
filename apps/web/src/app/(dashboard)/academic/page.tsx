import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcademicPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Academic Structure</h1>
          <p className="text-muted-foreground">Years, terms, classes, sections, and teacher assignments.</p>
        </div>
        <Button>Create Academic Year</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Academic Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Class 1 to 12 hierarchy mapping.</p>
        </CardContent>
      </Card>
    </div>
  );
}
