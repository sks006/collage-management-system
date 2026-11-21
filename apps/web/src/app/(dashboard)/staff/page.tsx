"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Search, UserPlus, Mail, Phone } from "lucide-react";

interface StaffItem {
  id: string;
  employeeNo: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "ON_LEAVE";
}

export default function StaffPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);

  const [staffList, setStaffList] = React.useState<StaffItem[]>([
    { id: "1", employeeNo: "EMP-001", name: "Dr. Rafiqul Islam", designation: "Principal & Professor", department: "Academic Administration", email: "principal@dhakamodel.edu.bd", phone: "+8801711000001", status: "ACTIVE" },
    { id: "2", employeeNo: "EMP-002", name: "Rahim Ahmed", designation: "Senior Lecturer", department: "Department of Physics", email: "rahim.physics@dhakamodel.edu.bd", phone: "+8801711000002", status: "ACTIVE" },
    { id: "3", employeeNo: "EMP-003", name: "Fatima Begum", designation: "Lecturer", department: "Department of English", email: "fatima.english@dhakamodel.edu.bd", phone: "+8801711000003", status: "ON_LEAVE" },
    { id: "4", employeeNo: "EMP-004", name: "Kamal Hossain", designation: "Chief Finance Officer", department: "Finance & Accounts", email: "finance@dhakamodel.edu.bd", phone: "+8801711000004", status: "ACTIVE" },
    { id: "5", employeeNo: "EMP-005", name: "Farhana Yasmin", designation: "Admissions Officer", department: "Office Administration", email: "admissions@dhakamodel.edu.bd", phone: "+8801711000005", status: "ACTIVE" },
  ]);

  // Form State
  const [empNo, setEmpNo] = React.useState("");
  const [name, setName] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [department, setDepartment] = React.useState("Department of Science");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("+88017");

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.employeeNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q)
    );
  });

  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffItem = {
      id: String(staffList.length + 1),
      employeeNo: empNo || `EMP-0${staffList.length + 10}`,
      name,
      designation,
      department,
      email,
      phone,
      status: "ACTIVE",
    };

    setStaffList([newStaff, ...staffList]);
    setModalOpen(false);
    setEmpNo("");
    setName("");
    setDesignation("");
    setEmail("");

    toast({
      title: "Staff Member Registered",
      description: `${newStaff.name} added to ${newStaff.department}. Keycloak ID mapped.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff Directory</h1>
          <p className="text-muted-foreground">Faculty and institutional administrative staff.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setModalOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register Staff</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffList.length + 243}</div>
            <p className="text-[11px] text-muted-foreground">Institutional personnel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Teaching Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">185</div>
            <p className="text-[11px] text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">244</div>
            <p className="text-[11px] text-muted-foreground">Biometric verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium">On Approved Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">4</div>
            <p className="text-[11px] text-muted-foreground">Substitutions assigned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">Active Faculty & Staff ({filteredStaff.length})</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search staff, designation, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase">
                <tr>
                  <th className="px-3 py-2.5">Emp #</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Designation & Department</th>
                  <th className="px-3 py-2.5">Contact</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-3 py-3 font-mono font-semibold">{s.employeeNo}</td>
                    <td className="px-3 py-3 font-semibold text-foreground">{s.name}</td>
                    <td className="px-3 py-3">
                      <div>{s.designation}</div>
                      <div className="text-[11px] text-muted-foreground">{s.department}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px]">
                      <div>{s.email}</div>
                      <div className="text-muted-foreground">{s.phone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={s.status === "ACTIVE" ? "success" : "warning"} className="text-[10px]">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast({ title: `Staff Profile: ${s.name}`, description: `${s.designation} · ${s.email}`, type: "info" })}>
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Register Staff Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen} title="Register Institutional Staff">
        <form onSubmit={handleRegisterStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Employee ID</label>
              <Input placeholder="e.g. EMP-009" value={empNo} onChange={(e) => setEmpNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Full Name</label>
              <Input required placeholder="e.g. Dr. Masud Rana" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Designation</label>
              <Input required placeholder="e.g. Assistant Professor" value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background text-xs">
                <option value="Department of Physics">Department of Physics</option>
                <option value="Department of Chemistry">Department of Chemistry</option>
                <option value="Department of English">Department of English</option>
                <option value="Department of Mathematics">Department of Mathematics</option>
                <option value="Department of ICT">Department of ICT</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Office Administration">Office Administration</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email</label>
              <Input required type="email" placeholder="name@dhakamodel.edu.bd" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Phone</label>
              <Input required placeholder="+88017XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Staff Account</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
