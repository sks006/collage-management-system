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
import { formatBDT } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useStaffSlice, StaffItem, RoleRequestItem } from "@/slicer";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Users,
} from "lucide-react";

export default function StaffPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"DIRECTORY" | "PENDING">("DIRECTORY");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [selectedReq, setSelectedReq] = React.useState<RoleRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const {
    staffList,
    allStaffCount,
    roleRequests,
    loading,
    loadingRequests,
    searchTerm,
    actionLoading,
    handlers,
  } = useStaffSlice();

  // Form State
  const [empNo, setEmpNo] = React.useState("");
  const [name, setName] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [department, setDepartment] = React.useState("Department of Physics");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("+88017");
  const [baseSalary, setBaseSalary] = React.useState("55000");

  const filteredStaff = staffList;
  const filteredRequests = roleRequests.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.requestedRole.toLowerCase().includes(q) ||
      (r.referenceNo || "").toLowerCase().includes(q)
    );
  });

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handlers.handleCreateStaff({
      employeeNo: empNo || `EMP-2026-${String(allStaffCount + 10).padStart(3, "0")}`,
      name,
      designation,
      department,
      email,
      phone,
      baseSalary: Number(baseSalary) || 50000,
    });

    if (success) {
      setModalOpen(false);
      setName("");
      setDesignation("");
      setEmail("");
      setEmpNo("");
    }
  };

  const handleApproveRequest = async (req: RoleRequestItem) => {
    await handlers.handleApproveRequest(req.id, req.fullName, req.requestedRole);
  };

  const handleRejectRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const success = await handlers.handleRejectRequest(
      selectedReq.id,
      selectedReq.fullName,
      rejectionReason || "Institutional documentation did not match requirements.",
    );

    if (success) {
      setRejectModalOpen(false);
      setSelectedReq(null);
      setRejectionReason("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty & Staff Management</h1>
          <p className="text-sm text-muted-foreground">
            Authoritative human records from people.staff schema with Gmail OTP onboarding & BEFTN routing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "DIRECTORY"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Active Staff Directory ({staffList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "PENDING"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Pending Role Approvals</span>
          {roleRequests.length > 0 && (
            <Badge variant="default" className="bg-amber-600 text-white text-[10px] h-5 px-1.5">
              {roleRequests.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Quick KPI stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Faculty & Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{staffList.length}</div>
            <p className="text-[11px] text-muted-foreground">Active in database</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{roleRequests.length}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting admin review</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payroll Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-primary">BEFTN Ready</div>
            <p className="text-[11px] text-muted-foreground">Bank account verification</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Row Scopes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-blue-600">Enforced</div>
            <p className="text-[11px] text-muted-foreground">teacher_section RLS filters</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content View */}
      {activeTab === "DIRECTORY" ? (
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name, designation, or employee code..."
                  className="pl-8 h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => handlers.handleSearch(e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Total Staff: <strong className="text-foreground">{filteredStaff.length}</strong>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px] whitespace-nowrap">Employee ID</TableHead>
                      <TableHead className="min-w-[160px] whitespace-nowrap">Staff Name</TableHead>
                      <TableHead className="min-w-[180px] whitespace-nowrap">Designation & Department</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap">Contact Info</TableHead>
                      <TableHead className="min-w-[110px] whitespace-nowrap">Base Salary</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No matching staff records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaff.map((st) => (
                        <TableRow key={st.id}>
                          <TableCell className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                            {st.employeeNo}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="font-medium text-foreground">{st.nameEn || st.name}</div>
                            {st.nameBn && <div className="text-xs text-muted-foreground">{st.nameBn}</div>}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            <span className="font-medium">{st.designation}</span>
                            <span className="text-muted-foreground block">{st.department}</span>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{st.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{st.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium whitespace-nowrap">
                            {formatBDT(st.baseSalary || 50000)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                st.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {st.status}
                            </Badge>
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
      ) : (
        /* PENDING ROLE APPROVALS TAB */
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pending requests by name, email, or role..."
                  className="pl-8 h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => handlers.handleSearch(e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Pending Requests: <strong className="text-amber-600">{filteredRequests.length}</strong>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingRequests ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px] whitespace-nowrap">Applicant Name</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap">Gmail Address</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap">Requested Role</TableHead>
                      <TableHead className="min-w-[130px] whitespace-nowrap">Reference / ID</TableHead>
                      <TableHead className="min-w-[120px] whitespace-nowrap">Submission Date</TableHead>
                      <TableHead className="text-right min-w-[180px] whitespace-nowrap">Decision Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pending staff role approval requests at this time.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="whitespace-nowrap font-medium text-foreground">
                            {req.fullName}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />
                              <span>{req.email}</span>
                            </div>
                            {req.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 mt-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                <span>{req.phone}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="font-semibold text-indigo-700 bg-indigo-50 border-indigo-200">
                              {req.requestedRole}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {req.referenceNo || "N/A"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                disabled={actionLoading === req.id}
                                onClick={() => handleApproveRequest(req)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 gap-1"
                                disabled={actionLoading === req.id}
                                onClick={() => {
                                  setSelectedReq(req);
                                  setRejectionReason("");
                                  setRejectModalOpen(true);
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </Button>
                            </div>
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
      )}

      {/* Register Staff Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Faculty or Staff Member"
        description="Creates people.staff record with Keycloak role provisioning and payroll profile"
      >
        <form onSubmit={handleRegisterStaff} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Employee ID</label>
              <Input
                value={empNo}
                onChange={(e) => setEmpNo(e.target.value)}
                placeholder="EMP-2026-XXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Full Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sharmin Sultana"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Designation</label>
              <Input
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Lecturer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Department</label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Physics"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Institutional Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dhakamodel.edu.bd"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Phone Number</label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+88017XXXXXXXX"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Monthly Base Salary (BDT)</label>
            <Input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              placeholder="55000"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Complete Registration
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Reject Role Request Modal */}
      <Dialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Staff Role Request"
        description="Provide an institutional justification for rejecting this role request."
      >
        <form onSubmit={handleRejectRequestSubmit} className="space-y-3 pt-2">
          {selectedReq && (
            <div className="p-3 bg-muted/50 rounded-md text-xs space-y-1">
              <div><strong>Applicant:</strong> {selectedReq.fullName} ({selectedReq.email})</div>
              <div><strong>Requested Role:</strong> {selectedReq.requestedRole}</div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold">Reason for Rejection</label>
            <Input
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Employee ID not found in institutional register"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={actionLoading !== null}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
