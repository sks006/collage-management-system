"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useStudentSlice, StudentItem } from "@/slicer";
import { Search, UserPlus, Upload, Phone, CheckCircle2 } from "lucide-react";

export default function StudentsPage() {
  const { toast } = useToast();
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);

  const { students, allCount, loading, searchTerm, handlers } = useStudentSlice();

  // Form State
  const [nameEn, setNameEn] = React.useState("");
  const [nameBn, setNameBn] = React.useState("");
  const [admissionNo, setAdmissionNo] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState("Class 11 (Science)");
  const [selectedSection, setSelectedSection] = React.useState("Section A (Padma)");
  const [phone, setPhone] = React.useState("+88017");

  const filteredStudents = students;

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handlers.handleEnrollStudent({
      nameEn,
      nameBn: nameBn || nameEn,
      class: selectedClass,
      section: selectedSection,
      phone,
    });

    if (success) {
      setAddModalOpen(false);
      setNameEn("");
      setNameBn("");
      setAdmissionNo("");
    }
  };

  const handleSimulateCsvImport = async () => {
    setIsImporting(true);
    try {
      const mockCsv = "nameEn,phone,class,section\nRahat Chowdhury,+8801711889900,Class 11 (Science),Section A (Padma)\nSamira Khan,+8801811889900,Class 11 (Commerce),Section B (Meghna)";
      await handlers.handleImportCsv(mockCsv);
      setImportModalOpen(false);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-sm text-muted-foreground">Search, register, and manage authoritative student profiles from people.student schema.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setAddModalOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-[11px] text-muted-foreground">Across Classes 11 & 12</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">100%</div>
            <p className="text-[11px] text-muted-foreground">All profiles in good standing</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Postgres Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">pg_trgm GIN</div>
            <p className="text-[11px] text-muted-foreground">Bilingual Bengali & English</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Guardian SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <p className="text-[11px] text-muted-foreground">Valid BD mobile numbers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID (e.g. DMC-2026-001) or mobile..."
                className="pl-8 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => handlers.handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing <strong className="text-foreground">{filteredStudents.length}</strong> students</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Admission No</TableHead>
                  <TableHead className="min-w-[180px]">Student Name (English / বাংলা)</TableHead>
                  <TableHead className="min-w-[160px]">Class & Section</TableHead>
                  <TableHead className="min-w-[140px]">Guardian Mobile</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[110px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No matching student profiles found for "{searchTerm}".
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {s.admissionNo}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{s.nameEn}</div>
                        <div className="text-xs text-muted-foreground">{s.nameBn}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium">{s.class}</span>
                        <span className="text-muted-foreground block">{s.section}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{s.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[10px] uppercase font-semibold">
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            toast({
                              title: `Selected: ${s.nameEn}`,
                              description: `ID: ${s.admissionNo} · Class: ${s.class} · Section: ${s.section}`,
                              type: "info",
                            });
                          }}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Student"
        description="Creates student_profile and initial academic term enrollment in PostgreSQL"
      >
        <form onSubmit={handleAddStudent} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Full Name (English)</label>
            <Input
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Mahir Faysal"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Full Name (বাংলা)</label>
            <Input
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: মাহির ফয়সাল"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Admission / Roll No</label>
              <Input
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                placeholder="DMC-2026-XXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Guardian Phone</label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+88017XXXXXXXX"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Class</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="Class 11 (Science)">Class 11 (Science)</option>
                <option value="Class 11 (Commerce)">Class 11 (Commerce)</option>
                <option value="Class 12 (Science)">Class 12 (Science)</option>
                <option value="Class 12 (Humanities)">Class 12 (Humanities)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Section</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="Section A (Padma)">Section A (Padma)</option>
                <option value="Section B (Meghna)">Section B (Meghna)</option>
                <option value="Section A (Jamuna)">Section A (Jamuna)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register Student
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Import Student CSV"
        description="Fast bulk intake with schema validation, Bangladeshi phone format verification and pg_trgm index refresh"
      >
        <div className="space-y-4 pt-2">
          <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-2 hover:border-primary transition-colors bg-muted/20">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="text-xs text-foreground font-medium">Click or drag CSV roster file here</div>
            <p className="text-[11px] text-muted-foreground">Supported format: admission_no, name_en, name_bn, class, section, guardian_phone</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSimulateCsvImport} disabled={isImporting}>
              {isImporting ? "Processing Batch..." : "Execute Import"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
