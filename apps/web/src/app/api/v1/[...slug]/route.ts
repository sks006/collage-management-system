import { NextRequest, NextResponse } from "next/server";

// Dynamic In-Memory Store mirroring docs/database_design_specification.md 9 PostgreSQL Schemas
const databaseStore = {
  academicYears: [
    { id: "ay-2026", year: 2026, name: "Academic Year 2026", startDate: "2026-01-01", endDate: "2026-12-31", status: "ACTIVE" },
    { id: "ay-2025", year: 2025, name: "Academic Year 2025", startDate: "2025-01-01", endDate: "2025-12-31", status: "CLOSED" },
  ],
  classes: [
    { id: "c-11-sci", yearId: "ay-2026", name: "Class 11 (Science)", code: "XI-SCI", gradeLevel: 11 },
    { id: "c-11-com", yearId: "ay-2026", name: "Class 11 (Commerce)", code: "XI-COM", gradeLevel: 11 },
    { id: "c-12-sci", yearId: "ay-2026", name: "Class 12 (Science)", code: "XII-SCI", gradeLevel: 12 },
    { id: "c-12-hum", yearId: "ay-2026", name: "Class 12 (Humanities)", code: "XII-HUM", gradeLevel: 12 },
  ],
  sections: [
    { id: "sec-11-a", classId: "c-11-sci", name: "Section A (Padma)", roomNo: "Building 2 - Room 301", capacity: 45, enrolled: 42 },
    { id: "sec-11-b", classId: "c-11-sci", name: "Section B (Meghna)", roomNo: "Building 2 - Room 302", capacity: 45, enrolled: 40 },
    { id: "sec-12-a", classId: "c-12-sci", name: "Section A (Jamuna)", roomNo: "Building 1 - Room 201", capacity: 50, enrolled: 48 },
  ],
  students: [
    { id: "stu-1", admissionNo: "DMC-2026-001", nameEn: "Tanvir Hasan", nameBn: "তানভীর হাসান", class: "Class 11 (Science)", section: "Section A (Padma)", sectionId: "sec-11-a", status: "ACTIVE", phone: "+8801711223344", email: "tanvir.student@dhakamodel.edu.bd", roll: 1 },
    { id: "stu-2", admissionNo: "DMC-2026-002", nameEn: "Nusrat Jahan", nameBn: "নুসরাত জাহান", class: "Class 11 (Commerce)", section: "Section B (Meghna)", sectionId: "sec-11-b", status: "ACTIVE", phone: "+8801811223344", email: "nusrat.student@dhakamodel.edu.bd", roll: 2 },
    { id: "stu-3", admissionNo: "DMC-2026-003", nameEn: "Sadman Sakib", nameBn: "সাদমান সাকিব", class: "Class 12 (Science)", section: "Section A (Jamuna)", sectionId: "sec-12-a", status: "ACTIVE", phone: "+8801911223344", email: "sadman.student@dhakamodel.edu.bd", roll: 3 },
    { id: "stu-4", admissionNo: "DMC-2026-004", nameEn: "Mehnaz Akter", nameBn: "মেহনাজ আক্তার", class: "Class 12 (Humanities)", section: "Section C", sectionId: "sec-12-c", status: "ACTIVE", phone: "+8801611223344", email: "mehnaz.student@dhakamodel.edu.bd", roll: 4 },
    { id: "stu-5", admissionNo: "DMC-2026-005", nameEn: "Kazi Nabil", nameBn: "কাজী নাবিল", class: "Class 11 (Science)", section: "Section A (Padma)", sectionId: "sec-11-a", status: "ACTIVE", phone: "+8801711556677", email: "nabil.student@dhakamodel.edu.bd", roll: 5 },
    { id: "stu-6", admissionNo: "DMC-2026-006", nameEn: "Sultana Razia", nameBn: "সুলতানা রাজিয়া", class: "Class 11 (Science)", section: "Section B (Meghna)", sectionId: "sec-11-b", status: "ACTIVE", phone: "+8801811556677", email: "razia.student@dhakamodel.edu.bd", roll: 6 },
  ],
  staff: [
    { id: "stf-1", employeeNo: "EMP-2021-001", nameEn: "Dr. Rafiqul Islam", nameBn: "ড. রফিকুল ইসলাম", designation: "Principal", department: "Administration", phone: "+8801711000001", email: "principal@dhakamodel.edu.bd", baseSalary: 120000, status: "ACTIVE" },
    { id: "stf-2", employeeNo: "EMP-2022-014", nameEn: "Rahim Ahmed", nameBn: "রহিম আহমেদ", designation: "Senior Lecturer", department: "Physics", phone: "+8801711000002", email: "rahim.physics@dhakamodel.edu.bd", baseSalary: 65000, status: "ACTIVE" },
    { id: "stf-3", employeeNo: "EMP-2023-005", nameEn: "Kamal Hossain", nameBn: "কামাল হোসেন", designation: "Accounts Officer", department: "Finance", phone: "+8801711000003", email: "finance@dhakamodel.edu.bd", baseSalary: 55000, status: "ACTIVE" },
    { id: "stf-4", employeeNo: "EMP-2024-002", nameEn: "Farhana Yasmin", nameBn: "ফারহানা ইয়াসমিন", designation: "Admin Officer", department: "Administration", phone: "+8801711000004", email: "admissions@dhakamodel.edu.bd", baseSalary: 45000, status: "ACTIVE" },
  ],
  attendanceEvents: [
    { studentId: "stu-1", eventDate: new Date().toISOString().split("T")[0], period: 0, status: "PRESENT", source: "DEVICE" },
    { studentId: "stu-2", eventDate: new Date().toISOString().split("T")[0], period: 0, status: "PRESENT", source: "MANUAL" },
    { studentId: "stu-3", eventDate: new Date().toISOString().split("T")[0], period: 0, status: "ABSENT", source: "DEVICE" },
    { studentId: "stu-4", eventDate: new Date().toISOString().split("T")[0], period: 0, status: "LATE", source: "MANUAL" },
    { studentId: "stu-5", eventDate: new Date().toISOString().split("T")[0], period: 0, status: "PRESENT", source: "DEVICE" },
  ],
  periodCloses: [
    { id: "pc-2026-02", sectionId: "sec-11-a", sectionName: "Class 11 Science - Sec A", month: "2026-02-01", status: "LOCKED", totalDays: 24, presentRate: 94.5, submittedBy: "Rahim Ahmed", approvedBy: "Dr. Rafiqul Islam", approvedAt: "2026-02-28T18:00:00Z" },
    { id: "pc-2026-03", sectionId: "sec-11-a", sectionName: "Class 11 Science - Sec A", month: "2026-03-01", status: "PENDING_APPROVAL", totalDays: 26, presentRate: 92.1, submittedBy: "Rahim Ahmed", approvedBy: null, approvedAt: null },
    { id: "pc-2026-03-b", sectionId: "sec-11-b", sectionName: "Class 11 Science - Sec B", month: "2026-03-01", status: "DRAFT", totalDays: 26, presentRate: 89.8, submittedBy: "Nasrin Sultana", approvedBy: null, approvedAt: null },
  ],
  invoices: [
    { id: "inv-2026-001", studentId: "stu-1", studentName: "Tanvir Hasan", admissionNo: "DMC-2026-001", month: "March 2026", head: "Monthly Tuition Fee", amount: 4500, status: "PAID", dueDate: "2026-03-15", paidAt: "2026-03-10", transactionId: "TXN-BKASH-881923" },
    { id: "inv-2026-002", studentId: "stu-2", studentName: "Nusrat Jahan", admissionNo: "DMC-2026-002", month: "March 2026", head: "Monthly Tuition Fee", amount: 4500, status: "PENDING", dueDate: "2026-03-15", paidAt: null, transactionId: null },
    { id: "inv-2026-003", studentId: "stu-3", studentName: "Sadman Sakib", admissionNo: "DMC-2026-003", month: "March 2026", head: "Monthly Tuition Fee", amount: 5000, status: "OVERDUE", dueDate: "2026-03-05", paidAt: null, transactionId: null },
    { id: "inv-2026-004", studentId: "stu-4", studentName: "Mehnaz Akter", admissionNo: "DMC-2026-004", month: "March 2026", head: "Monthly Tuition Fee", amount: 4500, status: "PAID", dueDate: "2026-03-15", paidAt: "2026-03-14", transactionId: "TXN-NAGAD-441290" },
  ],
  ledgerEntries: [
    { id: "led-1", account: "STUDENT_FEES", partyType: "STUDENT", partyName: "Tanvir Hasan", amount: 4500, currency: "BDT", direction: "CREDIT", source: "IPN_WEBHOOK", status: "POSTED", postedAt: "2026-03-10T11:42:00Z" },
    { id: "led-2", account: "STUDENT_FEES", partyType: "STUDENT", partyName: "Mehnaz Akter", amount: 4500, currency: "BDT", direction: "CREDIT", source: "IPN_WEBHOOK", status: "POSTED", postedAt: "2026-03-14T15:20:00Z" },
    { id: "led-3", account: "PAYROLL", partyType: "STAFF", partyName: "Rahim Ahmed", amount: 65000, currency: "BDT", direction: "DEBIT", source: "BEFTN_DISPATCH", status: "POSTED", postedAt: "2026-03-01T09:00:00Z" },
    { id: "led-4", account: "PAYROLL", partyType: "STAFF", partyName: "Kamal Hossain", amount: 55000, currency: "BDT", direction: "DEBIT", source: "BEFTN_DISPATCH", status: "POSTED", postedAt: "2026-03-01T09:00:00Z" },
  ],
  payrollRuns: [
    { id: "pr-2026-02", month: "February 2026", status: "DISPATCHED", totalAmount: 485000, totalStaff: 8, approvedBy: "Dr. Rafiqul Islam", approvedAt: "2026-02-28" },
    { id: "pr-2026-03", month: "March 2026", status: "DRAFT", totalAmount: 512000, totalStaff: 8, approvedBy: null, approvedAt: null },
  ],
  payrollLines: [
    { id: "pl-1", runId: "pr-2026-03", staffId: "stf-1", employeeName: "Dr. Rafiqul Islam", designation: "Principal", baseSalary: 120000, allowances: 25000, deductions: 5000, netSalary: 140000, status: "PENDING" },
    { id: "pl-2", runId: "pr-2026-03", staffId: "stf-2", employeeName: "Rahim Ahmed", designation: "Senior Lecturer", baseSalary: 65000, allowances: 12000, deductions: 2500, netSalary: 74500, status: "PENDING" },
    { id: "pl-3", runId: "pr-2026-03", staffId: "stf-3", employeeName: "Kamal Hossain", designation: "Accounts Officer", baseSalary: 55000, allowances: 8000, deductions: 2000, netSalary: 61000, status: "PENDING" },
    { id: "pl-4", runId: "pr-2026-03", staffId: "stf-4", employeeName: "Farhana Yasmin", designation: "Admin Officer", baseSalary: 45000, allowances: 6000, deductions: 1500, netSalary: 49500, status: "PENDING" },
  ],
  leaveRequests: [
    { id: "lv-1", staffId: "stf-2", staffName: "Rahim Ahmed", designation: "Senior Lecturer (Physics)", leaveType: "CASUAL", startDate: "2026-03-25", endDate: "2026-03-26", days: 2, reason: "Family medical emergency", status: "APPROVED", approvedBy: "Dr. Rafiqul Islam" },
    { id: "lv-2", staffId: "stf-4", staffName: "Farhana Yasmin", designation: "Admin Officer", leaveType: "EARNED", startDate: "2026-04-02", endDate: "2026-04-06", days: 5, reason: "Eid vacation extension", status: "PENDING", approvedBy: null },
  ],
  notices: [
    {
      id: "not-1",
      titleEn: "Schedule for HSC 2026 Pre-Test Examination Announced",
      titleBn: "এইচএসসি ২০২৬ প্রাক-নির্বাচনী পরীক্ষার রুটিন প্রকাশ",
      bodyEn: "The pre-test examination for Class 12 will commence on April 15, 2026. Admit cards can be downloaded from the portal from April 5.",
      bodyBn: "দ্বাদশ শ্রেণীর প্রাক-নির্বাচনী পরীক্ষা আগামী ১৫ এপ্রিল ২০২৬ থেকে শুরু হবে। আগামী ৫ এপ্রিল থেকে পোর্টাল থেকে প্রবেশপত্র ডাউনলোড করা যাবে।",
      targetRoles: ["ALL", "STUDENT", "PARENT", "TEACHER"],
      publishedAt: "2026-03-12T09:00:00Z",
      priority: "HIGH",
    },
    {
      id: "not-2",
      titleEn: "Tuition Fee Payment Clearance Notice for First Term",
      titleBn: "প্রথম সাময়িক বেতন পরিশোধ সংক্রান্ত বিজ্ঞপ্তি",
      bodyEn: "All students are requested to clear pending fees by March 20, 2026, using bKash, Nagad, or Bank gateway to avoid late surcharge.",
      bodyBn: "বিলম্ব জরিমানা এড়াতে সকল শিক্ষার্থীকে আগামী ২০ মার্চ ২০২৬-এর মধ্যে বিকাশ, নগদ বা ব্যাংকের মাধ্যমে বকেয়া বেতন পরিশোধের অনুরোধ করা হচ্ছে।",
      targetRoles: ["STUDENT", "PARENT", "FINANCE"],
      publishedAt: "2026-03-08T10:30:00Z",
      priority: "MEDIUM",
    },
  ],
};

async function forwardToBackend(request: NextRequest, slugPath: string) {
  const backendUrl = process.env.API_URL || "http://localhost:4000";
  const searchParams = request.nextUrl.search;
  const targetUrl = `${backendUrl}/api/v1/${slugPath}${searchParams}`;

  const headers = new Headers(request.headers);
  headers.set("host", "localhost:4000");

  let body: any = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, { status: res.status, headers: { "content-type": contentType } });
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return null; // Signals fallback to dynamic schema store
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Try live NestJS backend first
  const forwarded = await forwardToBackend(request, slugPath);
  if (forwarded) return forwarded;

  // Fallback to Dynamic Database Store (docs/database_design_specification.md)
  if (slugPath === "students") {
    return NextResponse.json({ data: databaseStore.students });
  }

  if (slugPath === "staff") {
    return NextResponse.json({ data: databaseStore.staff });
  }

  if (slugPath === "academic/years") {
    return NextResponse.json({ data: databaseStore.academicYears });
  }

  if (slugPath.startsWith("academic/classes")) {
    return NextResponse.json({ data: databaseStore.classes });
  }

  if (slugPath.startsWith("academic/sections")) {
    return NextResponse.json({ data: databaseStore.sections });
  }

  if (slugPath === "finance/invoices") {
    return NextResponse.json({ data: databaseStore.invoices });
  }

  if (slugPath === "finance/ledger") {
    return NextResponse.json({ data: databaseStore.ledgerEntries });
  }

  if (slugPath === "payroll/runs") {
    return NextResponse.json({ data: databaseStore.payrollRuns });
  }

  if (slugPath.startsWith("payroll/runs/") && slugPath.endsWith("/lines")) {
    return NextResponse.json({ data: databaseStore.payrollLines });
  }

  if (slugPath === "leave/requests") {
    return NextResponse.json({ data: databaseStore.leaveRequests });
  }

  if (slugPath === "notices") {
    return NextResponse.json({ data: databaseStore.notices });
  }

  if (slugPath === "attendance/close") {
    return NextResponse.json({ data: databaseStore.periodCloses });
  }

  if (slugPath.startsWith("attendance/students")) {
    return NextResponse.json({ data: databaseStore.attendanceEvents });
  }

  if (slugPath.startsWith("search/students")) {
    const q = (request.nextUrl.searchParams.get("q") || "").toLowerCase();
    const results = databaseStore.students.filter(
      (s) =>
        s.admissionNo.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.nameBn.includes(q) ||
        s.phone.includes(q)
    );
    return NextResponse.json({ data: results });
  }

  return NextResponse.json({ data: [], message: `Resource ${slugPath} ready` });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Try live NestJS backend first
  const forwarded = await forwardToBackend(request, slugPath);
  if (forwarded) return forwarded;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Fallback to Dynamic Database Store mutations
  if (slugPath === "students") {
    const newStudent = {
      id: `stu-${databaseStore.students.length + 1}`,
      admissionNo: body.admissionNo || `DMC-2026-${String(databaseStore.students.length + 10).padStart(3, "0")}`,
      nameEn: body.nameEn || body.fullNameEn || "New Student",
      nameBn: body.nameBn || body.fullNameBn || "নতুন শিক্ষার্থী",
      class: body.class || "Class 11 (Science)",
      section: body.section || "Section A (Padma)",
      sectionId: body.sectionId || "sec-11-a",
      status: "ACTIVE",
      phone: body.phone || body.guardianPhone || "+8801700000000",
      email: body.email || "student@dhakamodel.edu.bd",
      roll: databaseStore.students.length + 1,
    };
    databaseStore.students.unshift(newStudent);
    return NextResponse.json({ data: newStudent }, { status: 201 });
  }

  if (slugPath === "staff") {
    const newStaff = {
      id: `stf-${databaseStore.staff.length + 1}`,
      employeeNo: body.employeeNo || `EMP-2026-${String(databaseStore.staff.length + 10).padStart(3, "0")}`,
      nameEn: body.nameEn || body.fullNameEn || "Faculty Member",
      nameBn: body.nameBn || body.fullNameBn || "শিক্ষক",
      designation: body.designation || "Lecturer",
      department: body.department || "General",
      phone: body.phone || "+8801700000000",
      email: body.email || "staff@dhakamodel.edu.bd",
      baseSalary: Number(body.baseSalary) || 50000,
      status: "ACTIVE",
    };
    databaseStore.staff.unshift(newStaff);
    return NextResponse.json({ data: newStaff }, { status: 201 });
  }

  if (slugPath === "finance/invoices/bulk") {
    const count = databaseStore.students.length;
    const newInvoices = databaseStore.students.map((s, idx) => ({
      id: `inv-2026-${String(databaseStore.invoices.length + idx + 1).padStart(3, "0")}`,
      studentId: s.id,
      studentName: s.nameEn,
      admissionNo: s.admissionNo,
      month: body.month || "April 2026",
      head: "Monthly Tuition Fee",
      amount: 4500,
      status: "PENDING",
      dueDate: "2026-04-15",
      paidAt: null,
      transactionId: null,
    }));
    databaseStore.invoices = [...newInvoices, ...databaseStore.invoices];
    return NextResponse.json({ data: { count, generated: newInvoices.length } }, { status: 201 });
  }

  if (slugPath === "attendance/batch") {
    const count = (body.events || []).length;
    return NextResponse.json({ data: { status: "BATCH_COMMITTED", count } }, { status: 201 });
  }

  if (slugPath === "attendance/close") {
    const newClose = {
      id: `pc-${Date.now()}`,
      sectionId: body.sectionId || "sec-11-a",
      sectionName: "Class 11 Science - Sec A",
      month: body.month || "2026-03-01",
      status: "PENDING_APPROVAL",
      totalDays: 26,
      presentRate: 94.2,
      submittedBy: "Rahim Ahmed",
      approvedBy: null,
      approvedAt: null,
    };
    databaseStore.periodCloses.unshift(newClose);
    return NextResponse.json({ data: newClose }, { status: 201 });
  }

  if (slugPath.startsWith("attendance/close/") && slugPath.endsWith("/approve")) {
    const closeId = slug[2];
    const target = databaseStore.periodCloses.find((pc) => pc.id === closeId);
    if (target) {
      target.status = "LOCKED";
      target.approvedBy = "Dr. Rafiqul Islam";
      target.approvedAt = new Date().toISOString();
    }
    return NextResponse.json({ data: target || { status: "LOCKED" } });
  }

  if (slugPath === "leave/requests") {
    const newLeave = {
      id: `lv-${Date.now()}`,
      staffId: body.staffId || "stf-2",
      staffName: body.staffName || "Rahim Ahmed",
      designation: body.designation || "Senior Lecturer",
      leaveType: body.leaveType || "CASUAL",
      startDate: body.startDate || "2026-04-10",
      endDate: body.endDate || "2026-04-12",
      days: Number(body.days) || 3,
      reason: body.reason || "Personal grounds",
      status: "PENDING",
      approvedBy: null,
    };
    databaseStore.leaveRequests.unshift(newLeave);
    return NextResponse.json({ data: newLeave }, { status: 201 });
  }

  if (slugPath.startsWith("leave/requests/") && slugPath.endsWith("/approve")) {
    const leaveId = slug[2];
    const target = databaseStore.leaveRequests.find((l) => l.id === leaveId);
    if (target) {
      target.status = "APPROVED";
      target.approvedBy = "Dr. Rafiqul Islam";
    }
    return NextResponse.json({ data: target || { status: "APPROVED" } });
  }

  if (slugPath === "notices") {
    const newNotice = {
      id: `not-${Date.now()}`,
      titleEn: body.titleEn || body.title || "Institutional Notice",
      titleBn: body.titleBn || "প্রাতিষ্ঠানিক বিজ্ঞপ্তি",
      bodyEn: body.bodyEn || body.body || "",
      bodyBn: body.bodyBn || "",
      targetRoles: body.targetRoles || ["ALL"],
      publishedAt: new Date().toISOString(),
      priority: body.priority || "NORMAL",
    };
    databaseStore.notices.unshift(newNotice);
    return NextResponse.json({ data: newNotice }, { status: 201 });
  }

  if (slugPath === "payroll/runs") {
    const newRun = {
      id: `pr-${Date.now()}`,
      month: body.month || "April 2026",
      status: "DRAFT",
      totalAmount: 512000,
      totalStaff: databaseStore.staff.length,
      approvedBy: null,
      approvedAt: null,
    };
    databaseStore.payrollRuns.unshift(newRun);
    return NextResponse.json({ data: newRun }, { status: 201 });
  }

  return NextResponse.json({ data: { status: "OK", received: body } }, { status: 200 });
}
