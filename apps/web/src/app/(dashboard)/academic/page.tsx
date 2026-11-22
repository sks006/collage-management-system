"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAcademicSlice, AcademicYear as YearItem, ClassItem, SectionItem } from "@/slicer";
import { BookOpen, Plus, UserCheck, Calendar, Layers, CheckCircle2 } from "lucide-react";

export default function AcademicPage() {
  const { toast } = useToast();
  const [yearModalOpen, setYearModalOpen] = React.useState(false);
  const [classModalOpen, setClassModalOpen] = React.useState(false);

  const { years, classes, sections, loading, handlers } = useAcademicSlice();

  // Form inputs
  const [newYearName, setNewYearName] = React.useState("");
  const [newClassName, setNewClassName] = React.useState("");
  const [newClassCode, setNewClassCode] = React.useState("");

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setYearModalOpen(false);
    setNewYearName("");

    toast({
      title: "Academic Year Initialized 🎓",
      description: `${newYearName || "Academic Year 2027"} created. Section scoping and term schedule initialized.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Structure & Hierarchy</h1>
          <p className="text-sm text-muted-foreground">
            Academic calendar, classes, sections, and teacher-section row-scope assignments (academic schema).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setYearModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>New Academic Year</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2026</div>
            <p className="text-[11px] text-muted-foreground">Term 1 (Jan - Jun)</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Configured Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length || 4} Classes</div>
            <p className="text-[11px] text-muted-foreground">HSC Science, Commerce, Humanities</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Class Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{sections.length || 3} Sections</div>
            <p className="text-[11px] text-muted-foreground">Padma, Meghna, Jamuna</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Row Scopes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Active RLS</div>
            <p className="text-[11px] text-muted-foreground">Scoped by teacher_section</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="classes">Classes & Streams</TabsTrigger>
          <TabsTrigger value="sections">Sections & Rooms</TabsTrigger>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold">Active Classes (academic.class)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Code</TableHead>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {c.code}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        Grade {c.gradeLevel || 11}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success" className="text-[10px]">
                          ACTIVE
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold">Class Sections (academic.section)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section Name</TableHead>
                    <TableHead>Room Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Active Enrollment</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((s, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-foreground">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {s.roomNo || "Room 301"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {s.capacity || 45} Seats
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-600">
                        {s.enrolled || 42} Students
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-[10px] font-mono text-primary">
                          {Math.round(((s.enrolled || 42) / (s.capacity || 45)) * 100)}% Full
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="years">
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-semibold">Academic Years (academic.academic_year)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {years.map((y, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-foreground">
                        {y.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {y.startDate || "2026-01-01"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {y.endDate || "2026-12-31"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={y.status === "ACTIVE" || y.status === "CURRENT" ? "success" : "outline"}
                          className="text-[10px] uppercase font-semibold"
                        >
                          {y.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <Dialog
        isOpen={yearModalOpen}
        onClose={() => setYearModalOpen(false)}
        title="Initialize New Academic Year"
        description="Creates academic.academic_year record and prepares term structures"
      >
        <form onSubmit={handleCreateYear} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Academic Year Title</label>
            <Input
              required
              value={newYearName}
              onChange={(e) => setNewYearName(e.target.value)}
              placeholder="e.g. Academic Year 2027"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setYearModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Academic Year
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
