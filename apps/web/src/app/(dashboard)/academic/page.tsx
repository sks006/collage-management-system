"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { BookOpen, Plus, UserCheck, Calendar } from "lucide-react";

export default function AcademicPage() {
  const { toast } = useToast();
  const [yearModalOpen, setYearModalOpen] = React.useState(false);
  const [classModalOpen, setClassModalOpen] = React.useState(false);
  const [assignModalOpen, setAssignModalOpen] = React.useState(false);

  const [years, setYears] = React.useState([
    { name: "Academic Year 2026", status: "CURRENT", term: "Term 1 (Jan - Jun)", classesCount: 12, sectionsCount: 36 },
    { name: "Academic Year 2025", status: "ARCHIVED", term: "Completed", classesCount: 12, sectionsCount: 36 },
  ]);

  const [classes, setClasses] = React.useState([
    { name: "Class 11 - Science", code: "C11-SCI", sections: ["A", "B", "C"], attendanceMode: "PER_PERIOD", students: 180 },
    { name: "Class 11 - Commerce", code: "C11-BUS", sections: ["A", "B"], attendanceMode: "DAILY", students: 120 },
    { name: "Class 12 - Science", code: "C12-SCI", sections: ["A", "B", "C"], attendanceMode: "PER_PERIOD", students: 175 },
    { name: "Class 12 - Humanities", code: "C12-HUM", sections: ["A", "B"], attendanceMode: "DAILY", students: 110 },
  ]);

  const [subjects, setSubjects] = React.useState([
    { code: "101", nameEn: "Bangla 1st Paper", nameBn: "বাংলা ১ম পত্র", type: "COMPULSORY" },
    { code: "107", nameEn: "English 1st Paper", nameBn: "ইংরেজি ১ম পত্র", type: "COMPULSORY" },
    { code: "174", nameEn: "Physics", nameBn: "পদার্থবিজ্ঞান", type: "ELECTIVE" },
    { code: "176", nameEn: "Chemistry", nameBn: "রসায়ন", type: "ELECTIVE" },
    { code: "275", nameEn: "Information & Comm. Tech", nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি", type: "COMPULSORY" },
  ]);

  // Form inputs
  const [newYearName, setNewYearName] = React.useState("");
  const [newClassName, setNewClassName] = React.useState("");
  const [newClassCode, setNewClassCode] = React.useState("");
  const [newClassMode, setNewClassMode] = React.useState("PER_PERIOD");
  const [assignTeacher, setAssignTeacher] = React.useState("Rahim Ahmed (Physics)");
  const [assignSection, setAssignSection] = React.useState("Class 11 - Science (Section A)");

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    const newY = {
      name: newYearName || "Academic Year 2027",
      status: "DRAFT",
      term: "Term 1 (Planning)",
      classesCount: 12,
      sectionsCount: 36,
    };
    setYears([...years, newY]);
    setYearModalOpen(false);
    setNewYearName("");

    toast({
      title: "Academic Year Initialized",
      description: `${newY.name} created. Ready for class and term scheduling.`,
      type: "success",
    });
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newC = {
      name: newClassName,
      code: newClassCode || "NEW-CLS",
      sections: ["A"],
      attendanceMode: newClassMode,
      students: 0,
    };
    setClasses([...classes, newC]);
    setClassModalOpen(false);
    setNewClassName("");
    setNewClassCode("");

    toast({
      title: "Class Registered",
      description: `${newC.name} added with ${newC.attendanceMode} attendance mode.`,
      type: "success",
    });
  };

  const handleAssignTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignModalOpen(false);
    toast({
      title: "Teacher Assignment Recorded",
      description: `${assignTeacher} assigned to teach ${assignSection}. Row-level scope updated.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academic Structure</h1>
          <p className="text-muted-foreground">Manage years, terms, classes, sections, and teacher assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setAssignModalOpen(true)}>
            <UserCheck className="h-3.5 w-3.5" />
            <span>Assign Teachers</span>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setClassModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span>Add Class</span>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setYearModalOpen(true)}>
            <Calendar className="h-3.5 w-3.5" />
            <span>New Academic Year</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {years.map((y) => (
          <Card key={y.name} className={y.status === "CURRENT" ? "border-primary/50 shadow-sm" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">{y.name}</CardTitle>
              <Badge variant={y.status === "CURRENT" ? "default" : "secondary"}>{y.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{y.term}</p>
              <p className="text-xs text-muted-foreground mt-1">{y.classesCount} Classes · {y.sectionsCount} Sections</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Classes & Sections Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {classes.map((c) => (
                  <div key={c.code} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Sections: {c.sections.join(", ")} · {c.students} Students
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {c.attendanceMode}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toast({ title: `Class Settings: ${c.name}`, description: `Code: ${c.code} · Mode: ${c.attendanceMode}`, type: "info" })}>
                        Edit
                      </Button>
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
              <CardTitle className="text-base font-semibold">Curriculum Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {subjects.map((sub) => (
                  <div key={sub.code} className="py-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-muted-foreground font-semibold">{sub.code}</span>
                      <Badge variant="secondary" className="text-[10px]">{sub.type}</Badge>
                    </div>
                    <div className="font-semibold text-foreground mt-0.5">{sub.nameEn}</div>
                    <div className="text-[11px] text-muted-foreground font-bengali">{sub.nameBn}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Year Modal */}
      <Dialog open={yearModalOpen} onOpenChange={setYearModalOpen} title="Initialize New Academic Year">
        <form onSubmit={handleCreateYear} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Academic Year Title</label>
            <Input required placeholder="e.g. Academic Year 2027" value={newYearName} onChange={(e) => setNewYearName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setYearModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Year</Button>
          </div>
        </form>
      </Dialog>

      {/* Class Modal */}
      <Dialog open={classModalOpen} onOpenChange={setClassModalOpen} title="Add Institutional Class">
        <form onSubmit={handleAddClass} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Class Name</label>
            <Input required placeholder="e.g. Class 12 - Commerce" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Class Code</label>
            <Input required placeholder="e.g. C12-BUS" value={newClassCode} onChange={(e) => setNewClassCode(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Attendance Granularity</label>
            <select value={newClassMode} onChange={(e) => setNewClassMode(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background text-xs">
              <option value="PER_PERIOD">PER_PERIOD (High School / College)</option>
              <option value="DAILY">DAILY (Primary / Junior Section)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setClassModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Class</Button>
          </div>
        </form>
      </Dialog>

      {/* Assign Teacher Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen} title="Assign Faculty to Section">
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Teacher</label>
            <select value={assignTeacher} onChange={(e) => setAssignTeacher(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background text-xs">
              <option value="Rahim Ahmed (Physics)">Rahim Ahmed (Physics)</option>
              <option value="Fatima Begum (English)">Fatima Begum (English)</option>
              <option value="Dr. Rafiqul Islam (ICT)">Dr. Rafiqul Islam (ICT)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Class & Section</label>
            <select value={assignSection} onChange={(e) => setAssignSection(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background text-xs">
              <option value="Class 11 - Science (Section A)">Class 11 - Science (Section A)</option>
              <option value="Class 11 - Commerce (Section B)">Class 11 - Commerce (Section B)</option>
              <option value="Class 12 - Science (Section A)">Class 12 - Science (Section A)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit">Confirm Assignment</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
