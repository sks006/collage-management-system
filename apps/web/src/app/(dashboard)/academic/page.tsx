import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AcademicPage() {
  const years = [
    { name: "Academic Year 2026", status: "CURRENT", term: "Term 1 (Jan - Jun)", classesCount: 12, sectionsCount: 36 },
    { name: "Academic Year 2025", status: "ARCHIVED", term: "Completed", classesCount: 12, sectionsCount: 36 },
  ];

  const classes = [
    { name: "Class 11 - Science", code: "C11-SCI", sections: ["A", "B", "C"], attendanceMode: "PER_PERIOD", students: 180 },
    { name: "Class 11 - Commerce", code: "C11-BUS", sections: ["A", "B"], attendanceMode: "DAILY", students: 120 },
    { name: "Class 12 - Science", code: "C12-SCI", sections: ["A", "B", "C"], attendanceMode: "PER_PERIOD", students: 175 },
    { name: "Class 12 - Humanities", code: "C12-HUM", sections: ["A", "B"], attendanceMode: "DAILY", students: 110 },
  ];

  const subjects = [
    { code: "101", nameEn: "Bangla 1st Paper", nameBn: "বাংলা ১ম পত্র", type: "COMPULSORY" },
    { code: "107", nameEn: "English 1st Paper", nameBn: "ইংরেজি ১ম পত্র", type: "COMPULSORY" },
    { code: "174", nameEn: "Physics", nameBn: "পদার্থবিজ্ঞান", type: "ELECTIVE" },
    { code: "176", nameEn: "Chemistry", nameBn: "রসায়ন", type: "ELECTIVE" },
    { code: "275", nameEn: "Information & Comm. Tech", nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি", type: "COMPULSORY" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Academic Structure</h1>
          <p className="text-muted-foreground">Manage years, terms, classes, sections, and teacher assignments.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Assign Teachers</Button>
          <Button>Create Academic Year</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {years.map((y) => (
          <Card key={y.name} className={y.status === "CURRENT" ? "border-primary/40" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">{y.name}</CardTitle>
              <Badge variant={y.status === "CURRENT" ? "default" : "secondary"}>{y.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{y.term}</p>
              <p className="text-xs text-muted-foreground mt-1">{y.classesCount} Classes | {y.sectionsCount} Sections</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classes & Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {classes.map((c) => (
                  <div key={c.code} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Sections: {c.sections.join(", ")} | {c.students} Students
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {c.attendanceMode}
                      </Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subjects Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {subjects.map((sub) => (
                  <div key={sub.code} className="py-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-muted-foreground">{sub.code}</span>
                      <Badge variant="secondary" className="text-[10px]">{sub.type}</Badge>
                    </div>
                    <div className="font-medium text-xs mt-0.5">{sub.nameEn}</div>
                    <div className="text-[11px] text-muted-foreground">{sub.nameBn}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
