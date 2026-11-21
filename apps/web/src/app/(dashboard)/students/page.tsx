import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentsPage() {
  const students = [
    { id: "1", admissionNo: "DMC-2026-001", nameEn: "Tanvir Hasan", nameBn: "তানভীর হাসান", class: "Class 11 (Science)", section: "Section A", status: "ACTIVE", phone: "+8801711223344" },
    { id: "2", admissionNo: "DMC-2026-002", nameEn: "Nusrat Jahan", nameBn: "নুসরাত জাহান", class: "Class 11 (Commerce)", section: "Section B", status: "ACTIVE", phone: "+8801811223344" },
    { id: "3", admissionNo: "DMC-2026-003", nameEn: "Sadman Sakib", nameBn: "সাদমান সাকিব", class: "Class 12 (Science)", section: "Section A", status: "ACTIVE", phone: "+8801911223344" },
    { id: "4", admissionNo: "DMC-2026-004", nameEn: "Mehnaz Akter", nameBn: "মেহনাজ আক্তার", class: "Class 12 (Humanities)", section: "Section C", status: "ACTIVE", phone: "+8801611223344" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-muted-foreground">Search, register, and bulk import student profiles.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Import CSV</Button>
          <Button>Add Student</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,850</div>
            <p className="text-xs text-muted-foreground">Across Classes 1–12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">14,210</div>
            <p className="text-xs text-muted-foreground">95.7% daily attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240</div>
            <p className="text-xs text-muted-foreground">Academic Year 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Guardian Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Verified mobile numbers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registered Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3">Admission No</th>
                  <th className="px-4 py-3">Name (English / বাংলা)</th>
                  <th className="px-4 py-3">Class & Section</th>
                  <th className="px-4 py-3">Guardian Mobile</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{s.admissionNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.nameEn}</div>
                      <div className="text-xs text-muted-foreground font-bengali">{s.nameBn}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{s.class}</div>
                      <div className="text-xs text-muted-foreground">{s.section}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
