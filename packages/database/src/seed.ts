import { createDbPool, createDb } from "./client";
import {
  academicYear,
  term,
  classTable,
  section,
  subject,
  teacherSection,
} from "./schema/academic";
import { student, staff, enrollment } from "./schema/people";
import { calendarDay, leaveType, leaveRequest } from "./schema/leave";
import { feeSchedule, invoice, payment, ledgerEntry } from "./schema/finance";
import { notice } from "./schema/notice";
import { periodEvent, dailySummary, periodClose } from "./schema/attendance";
import { payrollRun, payrollLine } from "./schema/payroll";
import { eq, and, sql } from "drizzle-orm";

async function getKeycloakAdminToken(): Promise<string | null> {
  const keycloakUrl = process.env.KEYCLOAK_URL || "http://127.0.0.1:8080";
  const tokenUrl = `${keycloakUrl}/realms/master/protocol/openid-connect/token`;
  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "admin-cli",
        username: process.env.KEYCLOAK_ADMIN_USERNAME || "admin",
        password: process.env.KEYCLOAK_ADMIN_PASSWORD || "admin",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`  ! Keycloak token response not OK: status ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.access_token;
  } catch (err: any) {
    console.warn(`  ! Keycloak master admin login notice: ${err.message}`);
    return null;
  }
}

async function ensureKeycloakUser(
  adminToken: string,
  user: {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    password?: string;
  }
): Promise<string | null> {
  const keycloakUrl = process.env.KEYCLOAK_URL || "http://127.0.0.1:8080";
  const realm = process.env.KEYCLOAK_REALM || "sms";
  const usersUrl = `${keycloakUrl}/admin/realms/${realm}/users`;
  const defaultPassword = user.password || "College@2026";

  try {
    // 1. Search if user exists
    const searchRes = await fetch(`${usersUrl}?email=${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      signal: AbortSignal.timeout(4000),
    });
    let userId: string | null = null;
    if (searchRes.ok) {
      const users = await searchRes.json();
      if (Array.isArray(users) && users.length > 0) {
        userId = users[0].id;
      }
    }

    // 2. If not found, create user
    if (!userId) {
      const createRes = await fetch(usersUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: "password",
              value: defaultPassword,
              temporary: false,
            },
          ],
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (createRes.ok || createRes.status === 201) {
        const location = createRes.headers.get("location");
        if (location) {
          userId = location.split("/").pop() || null;
        }
      }
      if (!userId) {
        const recheck = await fetch(`${usersUrl}?email=${encodeURIComponent(user.email)}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          signal: AbortSignal.timeout(4000),
        });
        if (recheck.ok) {
          const list = await recheck.json();
          if (list[0]) userId = list[0].id;
        }
      }
    }

    // 3. Reset password to ensure known password
    if (userId) {
      await fetch(`${usersUrl}/${userId}/reset-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "password",
          value: defaultPassword,
          temporary: false,
        }),
        signal: AbortSignal.timeout(4000),
      });

      // 4. Assign Realm Roles
      for (const roleName of user.roles) {
        try {
          const roleRes = await fetch(`${keycloakUrl}/admin/realms/${realm}/roles/${encodeURIComponent(roleName)}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            signal: AbortSignal.timeout(4000),
          });
          if (roleRes.ok) {
            const roleObj = await roleRes.json();
            await fetch(`${usersUrl}/${userId}/role-mappings/realm`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${adminToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify([roleObj]),
              signal: AbortSignal.timeout(4000),
            });
          }
        } catch {}
      }
    }

    return userId;
  } catch (err: any) {
    console.warn(`  ! Keycloak sync for ${user.email} notice: ${err.message}`);
    return null;
  }
}

async function seed() {
  const connectionString =
    process.env.DATABASE_ADMIN_URL ||
    process.env.DATABASE_URL ||
    "postgresql://sms_api:sms_api_password@127.0.0.1:5432/sms";

  console.log(`[Seed] Connecting to PostgreSQL at ${connectionString.replace(/:[^:@]+@/, ":***@")}...`);
  const pool = createDbPool(connectionString);
  const db = createDb(pool);

  try {
    console.log("[Seed] Starting idempotent database seed for Dhaka Model College...");
    const adminToken = await getKeycloakAdminToken();
    if (adminToken) {
      console.log("  * Successfully authenticated with Keycloak Admin API.");
    } else {
      console.log("  ! Keycloak Admin API unavailable - continuing with PostgreSQL seed.");
    }

    // 1. ACADEMIC SCHEMA
    console.log("[Seed] 1. Seeding Academic Year & Terms...");
    let [ay2026] = await db
      .select()
      .from(academicYear)
      .where(eq(academicYear.name, "Academic Year 2026"));

    if (!ay2026) {
      [ay2026] = await db
        .insert(academicYear)
        .values({
          name: "Academic Year 2026",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          isCurrent: true,
        })
        .returning();
      console.log(`  + Created Academic Year: ${ay2026.name} (${ay2026.id})`);
    } else {
      console.log(`  = Academic Year exists: ${ay2026.name}`);
    }

    const termNames = [
      { name: "First Term 2026", startDate: "2026-01-01", endDate: "2026-04-30", seq: 1 },
      { name: "Mid-Term 2026", startDate: "2026-05-01", endDate: "2026-08-31", seq: 2 },
      { name: "Final Term 2026", startDate: "2026-09-01", endDate: "2026-12-31", seq: 3 },
    ];

    for (const t of termNames) {
      const [existing] = await db
        .select()
        .from(term)
        .where(and(eq(term.academicYearId, ay2026.id), eq(term.name, t.name)));
      if (!existing) {
        await db.insert(term).values({
          academicYearId: ay2026.id,
          name: t.name,
          startDate: t.startDate,
          endDate: t.endDate,
          sequence: t.seq,
        });
        console.log(`  + Created Term: ${t.name}`);
      }
    }

    // Classes & Groups
    console.log("[Seed] 2. Seeding Classes & Sections...");
    const classConfigs = [
      { name: "Class 11 (Science)", level: 11 },
      { name: "Class 11 (Commerce)", level: 11 },
      { name: "Class 11 (Humanities)", level: 11 },
      { name: "Class 12 (Science)", level: 12 },
      { name: "Class 12 (Commerce)", level: 12 },
      { name: "Class 12 (Humanities)", level: 12 },
    ];

    const seededClasses: Record<string, any> = {};
    for (const c of classConfigs) {
      let [cls] = await db
        .select()
        .from(classTable)
        .where(and(eq(classTable.academicYearId, ay2026.id), eq(classTable.name, c.name)));
      if (!cls) {
        [cls] = await db
          .insert(classTable)
          .values({
            name: c.name,
            numericLevel: c.level,
            academicYearId: ay2026.id,
          })
          .returning();
        console.log(`  + Created Class: ${c.name}`);
      }
      seededClasses[c.name] = cls;
    }

    // Sections
    const sectionConfigs = ["Section A (Padma)", "Section B (Meghna)"];
    const seededSections: Record<string, any> = {};
    for (const [className, cls] of Object.entries(seededClasses)) {
      for (const secName of sectionConfigs) {
        const key = `${className} - ${secName}`;
        let [sec] = await db
          .select()
          .from(section)
          .where(and(eq(section.classId, cls.id), eq(section.name, secName)));
        if (!sec) {
          [sec] = await db
            .insert(section)
            .values({
              classId: cls.id,
              name: secName,
              capacity: 45,
            })
            .returning();
          console.log(`  + Created Section: ${key}`);
        }
        seededSections[key] = sec;
      }
    }

    // Subjects
    console.log("[Seed] 3. Seeding Subjects...");
    const subjectList = [
      { code: "PHY-101", name: "Physics", className: "Class 11 (Science)" },
      { code: "CHE-101", name: "Chemistry", className: "Class 11 (Science)" },
      { code: "MTH-101", name: "Higher Mathematics", className: "Class 11 (Science)" },
      { code: "BIO-101", name: "Biology", className: "Class 11 (Science)" },
      { code: "ACC-101", name: "Accounting", className: "Class 11 (Commerce)" },
      { code: "FIN-101", name: "Finance & Banking", className: "Class 11 (Commerce)" },
      { code: "ECO-101", name: "Economics", className: "Class 11 (Humanities)" },
      { code: "BAN-101", name: "Bangla", className: "Class 11 (Science)" },
      { code: "ENG-101", name: "English", className: "Class 11 (Science)" },
      { code: "ICT-101", name: "Information & Communication Technology", className: "Class 11 (Science)" },
    ];

    const seededSubjects: Record<string, any> = {};
    for (const s of subjectList) {
      const cls = seededClasses[s.className] || Object.values(seededClasses)[0];
      let [sb] = await db
        .select()
        .from(subject)
        .where(and(eq(subject.code, s.code), eq(subject.classId, cls.id)));
      if (!sb) {
        [sb] = await db
          .insert(subject)
          .values({
            code: s.code,
            name: s.name,
            classId: cls.id,
          })
          .returning();
        console.log(`  + Created Subject: ${s.name} (${s.code})`);
      }
      seededSubjects[s.code] = sb;
    }

    // 2. PEOPLE SCHEMA: STAFF
    console.log("[Seed] 4. Seeding Staff Directory (All Roles)...");
    const staffList = [
      {
        employeeNo: "EMP-2026-001",
        nameEn: "Dr. Rafiqul Islam",
        nameBn: "ড. রফিকুল ইসলাম",
        role: "ADMIN",
        designation: "Principal",
        department: "Administration",
        email: "principal@dhakamodel.edu.bd",
        phone: "+8801711000001",
        bankName: "Sonali Bank PLC",
        bankAccountNo: "1001234567890",
        bankBranch: "Mirpur Branch",
      },
      {
        employeeNo: "EMP-2026-002",
        nameEn: "Dr. Mohammad Harun",
        nameBn: "ড. মোহাম্মদ হারুন",
        role: "PRINCIPAL",
        designation: "Vice Principal",
        department: "Administration",
        email: "viceprincipal@dhakamodel.edu.bd",
        phone: "+8801711000002",
        bankName: "Sonali Bank PLC",
        bankAccountNo: "1001234567891",
        bankBranch: "Mirpur Branch",
      },
      {
        employeeNo: "EMP-2026-003",
        nameEn: "Rahim Ahmed",
        nameBn: "রহিম আহমেদ",
        role: "TEACHER",
        designation: "Senior Lecturer",
        department: "Physics",
        email: "rahim.physics@dhakamodel.edu.bd",
        phone: "+8801711000003",
        bankName: "Dutch-Bangla Bank PLC",
        bankAccountNo: "1001234567892",
        bankBranch: "Dhanmondi Branch",
      },
      {
        employeeNo: "EMP-2026-004",
        nameEn: "Nasrin Sultana",
        nameBn: "নাসরিন সুলতানা",
        role: "TEACHER",
        designation: "Lecturer",
        department: "Chemistry",
        email: "nasrin.chem@dhakamodel.edu.bd",
        phone: "+8801711000004",
        bankName: "Dutch-Bangla Bank PLC",
        bankAccountNo: "1001234567893",
        bankBranch: "Dhanmondi Branch",
      },
      {
        employeeNo: "EMP-2026-005",
        nameEn: "Tariqul Alam",
        nameBn: "তরিকুল আলম",
        role: "TEACHER",
        designation: "Assistant Professor",
        department: "Mathematics",
        email: "tariqul.math@dhakamodel.edu.bd",
        phone: "+8801711000005",
        bankName: "Brac Bank PLC",
        bankAccountNo: "1001234567894",
        bankBranch: "Gulshan Branch",
      },
      {
        employeeNo: "EMP-2026-006",
        nameEn: "Farhana Yasmin",
        nameBn: "ফারহানা ইয়াসমিন",
        role: "OFFICE",
        designation: "Head Admin Officer",
        department: "Administration",
        email: "admissions@dhakamodel.edu.bd",
        phone: "+8801711000006",
        bankName: "Sonali Bank PLC",
        bankAccountNo: "1001234567895",
        bankBranch: "Mirpur Branch",
      },
      {
        employeeNo: "EMP-2026-007",
        nameEn: "Kamal Hossain",
        nameBn: "কামাল হোসেন",
        role: "FINANCE",
        designation: "Chief Accounts Officer",
        department: "Accounts & Finance",
        email: "finance@dhakamodel.edu.bd",
        phone: "+8801711000007",
        bankName: "Islami Bank Bangladesh PLC",
        bankAccountNo: "1001234567896",
        bankBranch: "Mirpur Branch",
      },
      {
        employeeNo: "EMP-2026-008",
        nameEn: "Anisur Rahman",
        nameBn: "আনিসুর রহমান",
        role: "TEACHER",
        designation: "Lecturer",
        department: "English",
        email: "anis.english@dhakamodel.edu.bd",
        phone: "+8801711000008",
        bankName: "Dutch-Bangla Bank PLC",
        bankAccountNo: "1001234567897",
        bankBranch: "Dhanmondi Branch",
      },
      {
        employeeNo: "EMP-2026-009",
        nameEn: "Mahmuda Begum",
        nameBn: "মাহমুদা বেগম",
        role: "TEACHER",
        designation: "Senior Lecturer",
        department: "Bangla",
        email: "mahmuda.bangla@dhakamodel.edu.bd",
        phone: "+8801711000009",
        bankName: "Sonali Bank PLC",
        bankAccountNo: "1001234567898",
        bankBranch: "Mirpur Branch",
      },
      {
        employeeNo: "EMP-2026-010",
        nameEn: "Jahidul Islam",
        nameBn: "জাহিদুল ইসলাম",
        role: "OFFICE",
        designation: "IT & Systems Coordinator",
        department: "IT",
        email: "it.admin@dhakamodel.edu.bd",
        phone: "+8801711000010",
        bankName: "City Bank PLC",
        bankAccountNo: "1001234567899",
        bankBranch: "Mirpur Branch",
      },
    ];

    const seededStaff: Record<string, any> = {};
    for (const st of staffList) {
      const firstName = st.nameEn.split(" ")[0] || st.nameEn;
      const lastName = st.nameEn.split(" ").slice(1).join(" ") || "";
      const roles = st.role === "ADMIN" ? ["ADMIN", "PRINCIPAL"] : [st.role];
      const keycloakUserId = adminToken
        ? await ensureKeycloakUser(adminToken, {
            email: st.email,
            firstName,
            lastName,
            roles,
          })
        : null;

      let [stf] = await db.select().from(staff).where(eq(staff.employeeNo, st.employeeNo));
      if (!stf) {
        [stf] = await db.insert(staff).values({ ...st, keycloakUserId }).returning();
        console.log(`  + Created Staff: ${st.nameEn} (${st.employeeNo} - ${st.role}) [KC: ${keycloakUserId || 'offline'}]`);
      } else if (keycloakUserId && stf.keycloakUserId !== keycloakUserId) {
        await db.update(staff).set({ keycloakUserId }).where(eq(staff.id, stf.id));
        stf.keycloakUserId = keycloakUserId;
        console.log(`  = Linked Staff Keycloak ID: ${st.nameEn} [KC: ${keycloakUserId}]`);
      }
      seededStaff[st.employeeNo] = stf;
    }

    // Teacher Section Assignments
    const primarySection = Object.values(seededSections)[0];
    const phySubject = seededSubjects["PHY-101"];
    if (primarySection && phySubject && seededStaff["EMP-2026-003"]) {
      const [existingTS] = await db
        .select()
        .from(teacherSection)
        .where(
          and(
            eq(teacherSection.staffId, seededStaff["EMP-2026-003"].id),
            eq(teacherSection.sectionId, primarySection.id),
            eq(teacherSection.academicYearId, ay2026.id)
          )
        );
      if (!existingTS) {
        await db.insert(teacherSection).values({
          staffId: seededStaff["EMP-2026-003"].id,
          sectionId: primarySection.id,
          subjectId: phySubject.id,
          academicYearId: ay2026.id,
        });
        console.log(`  + Assigned Teacher: ${seededStaff["EMP-2026-003"].nameEn} -> ${primarySection.name}`);
      }
    }

    // 3. PEOPLE SCHEMA: STUDENTS & ENROLLMENTS
    console.log("[Seed] 5. Seeding Student Directory & Enrollments...");
    const studentList = [
      {
        admissionNo: "DMC-2026-001",
        nameEn: "Tanvir Hasan",
        nameBn: "তানভীর হাসান",
        email: "tanvir.student@dhakamodel.edu.bd",
        phone: "+8801711223344",
        gender: "MALE",
        bloodGroup: "B+",
        guardianName: "Abul Kalam (Guardian)",
        guardianPhone: "+8801711000005",
        guardianEmail: "parent.kalam@gmail.com",
        sessionYear: "2026",
        sectionKey: "Class 11 (Science) - Section A (Padma)",
        rollNo: "1",
      },
      {
        admissionNo: "DMC-2026-002",
        nameEn: "Nusrat Jahan",
        nameBn: "নুসরাত জাহান",
        email: "nusrat.student@dhakamodel.edu.bd",
        phone: "+8801811223344",
        gender: "FEMALE",
        bloodGroup: "O+",
        guardianName: "Anwar Hossain",
        guardianPhone: "+8801811998877",
        sessionYear: "2026",
        sectionKey: "Class 11 (Commerce) - Section A (Padma)",
        rollNo: "2",
      },
      {
        admissionNo: "DMC-2026-003",
        nameEn: "Sadman Sakib",
        nameBn: "সাদমান সাকিব",
        email: "sadman.student@dhakamodel.edu.bd",
        phone: "+8801911223344",
        gender: "MALE",
        bloodGroup: "A+",
        guardianName: "Mokhlesur Rahman",
        guardianPhone: "+8801911887766",
        sessionYear: "2026",
        sectionKey: "Class 12 (Science) - Section A (Padma)",
        rollNo: "3",
      },
      {
        admissionNo: "DMC-2026-004",
        nameEn: "Mehnaz Akter",
        nameBn: "মেহনাজ আক্তার",
        email: "mehnaz.student@dhakamodel.edu.bd",
        phone: "+8801611223344",
        gender: "FEMALE",
        bloodGroup: "AB+",
        guardianName: "Sirajul Islam",
        guardianPhone: "+8801611776655",
        sessionYear: "2026",
        sectionKey: "Class 12 (Humanities) - Section A (Padma)",
        rollNo: "4",
      },
      {
        admissionNo: "DMC-2026-005",
        nameEn: "Kazi Nabil",
        nameBn: "কাজী নাবিল",
        email: "nabil.student@dhakamodel.edu.bd",
        phone: "+8801711556677",
        gender: "MALE",
        bloodGroup: "O+",
        guardianName: "Kazi Jalal",
        guardianPhone: "+8801711443322",
        sessionYear: "2026",
        sectionKey: "Class 11 (Science) - Section B (Meghna)",
        rollNo: "5",
      },
      {
        admissionNo: "DMC-2026-006",
        nameEn: "Sultana Razia",
        nameBn: "সুলতানা রাজিয়া",
        email: "razia.student@dhakamodel.edu.bd",
        phone: "+8801811556677",
        gender: "FEMALE",
        bloodGroup: "B+",
        guardianName: "Bazlur Rashid",
        guardianPhone: "+8801811332211",
        sessionYear: "2026",
        sectionKey: "Class 11 (Science) - Section B (Meghna)",
        rollNo: "6",
      },
      {
        admissionNo: "DMC-2026-007",
        nameEn: "Arefin Shuvo",
        nameBn: "আরেফিন শুভ",
        email: "arefin.student@dhakamodel.edu.bd",
        phone: "+8801911556677",
        gender: "MALE",
        bloodGroup: "A-",
        guardianName: "Shahidul Alam",
        guardianPhone: "+8801911221100",
        sessionYear: "2026",
        sectionKey: "Class 11 (Commerce) - Section B (Meghna)",
        rollNo: "7",
      },
      {
        admissionNo: "DMC-2026-008",
        nameEn: "Samira Khan",
        nameBn: "সামিরা খান",
        email: "samira.student@dhakamodel.edu.bd",
        phone: "+8801611556677",
        gender: "FEMALE",
        bloodGroup: "O-",
        guardianName: "Kabir Khan",
        guardianPhone: "+8801611112233",
        sessionYear: "2026",
        sectionKey: "Class 12 (Science) - Section B (Meghna)",
        rollNo: "8",
      },
      {
        admissionNo: "DMC-2026-009",
        nameEn: "Fahim Montasir",
        nameBn: "ফাহিম মুনতাসির",
        email: "fahim.student@dhakamodel.edu.bd",
        phone: "+8801511556677",
        gender: "MALE",
        bloodGroup: "B+",
        guardianName: "Mokbul Hossain",
        guardianPhone: "+8801511009988",
        sessionYear: "2026",
        sectionKey: "Class 12 (Commerce) - Section A (Padma)",
        rollNo: "9",
      },
      {
        admissionNo: "DMC-2026-010",
        nameEn: "Tasnia Rahman",
        nameBn: "তাসনিয়া রহমান",
        email: "tasnia.student@dhakamodel.edu.bd",
        phone: "+8801711889900",
        gender: "FEMALE",
        bloodGroup: "A+",
        guardianName: "Mahfuzur Rahman",
        guardianPhone: "+8801711990011",
        sessionYear: "2026",
        sectionKey: "Class 12 (Humanities) - Section B (Meghna)",
        rollNo: "10",
      },
    ];

    const seededStudents: Record<string, any> = {};
    for (const s of studentList) {
      const firstName = s.nameEn.split(" ")[0] || s.nameEn;
      const lastName = s.nameEn.split(" ").slice(1).join(" ") || "";
      const keycloakUserId = adminToken
        ? await ensureKeycloakUser(adminToken, {
            email: s.email,
            firstName,
            lastName,
            roles: ["STUDENT"],
          })
        : null;

      let guardianKeycloakId: string | null = null;
      if (adminToken && s.guardianEmail) {
        guardianKeycloakId = await ensureKeycloakUser(adminToken, {
          email: s.guardianEmail,
          firstName: s.guardianName.split(" ")[0] || s.guardianName,
          lastName: s.guardianName.split(" ").slice(1).join(" ") || "Guardian",
          roles: ["PARENT"],
        });
      }

      let [stu] = await db.select().from(student).where(eq(student.admissionNo, s.admissionNo));
      if (!stu) {
        [stu] = await db
          .insert(student)
          .values({
            admissionNo: s.admissionNo,
            nameEn: s.nameEn,
            nameBn: s.nameBn,
            email: s.email,
            phone: s.phone,
            gender: s.gender,
            bloodGroup: s.bloodGroup,
            guardianName: s.guardianName,
            guardianPhone: s.guardianPhone,
            guardianEmail: s.guardianEmail,
            guardianKeycloakId,
            keycloakUserId,
            sessionYear: s.sessionYear,
            status: "ACTIVE",
          })
          .returning();
        console.log(`  + Created Student: ${s.nameEn} (${s.admissionNo}) [KC: ${keycloakUserId || 'offline'}]`);
      } else if (
        (keycloakUserId && stu.keycloakUserId !== keycloakUserId) ||
        (guardianKeycloakId && stu.guardianKeycloakId !== guardianKeycloakId)
      ) {
        await db
          .update(student)
          .set({
            keycloakUserId: keycloakUserId || stu.keycloakUserId,
            guardianKeycloakId: guardianKeycloakId || stu.guardianKeycloakId,
          })
          .where(eq(student.id, stu.id));
        stu.keycloakUserId = keycloakUserId || stu.keycloakUserId;
        stu.guardianKeycloakId = guardianKeycloakId || stu.guardianKeycloakId;
        console.log(`  = Linked Student Keycloak ID: ${s.nameEn} [KC: ${keycloakUserId}]`);
      }
      seededStudents[s.admissionNo] = stu;

      const sec = seededSections[s.sectionKey] || Object.values(seededSections)[0];
      if (sec && stu) {
        const [existingEnr] = await db
          .select()
          .from(enrollment)
          .where(and(eq(enrollment.studentId, stu.id), eq(enrollment.academicYearId, ay2026.id)));
        if (!existingEnr) {
          await db.insert(enrollment).values({
            studentId: stu.id,
            sectionId: sec.id,
            academicYearId: ay2026.id,
            rollNo: s.rollNo,
            status: "ENROLLED",
          });
          console.log(`    -> Enrolled ${s.admissionNo} in ${s.sectionKey}`);
        }
      }
    }

    // 4. LEAVE SCHEMA: LEAVE TYPES & HOLIDAY CALENDAR
    console.log("[Seed] 6. Seeding Leave Types & 2026 Calendar...");
    const leaveTypes = [
      { name: "Casual Leave", maxDaysPerYear: 15, isPaid: true },
      { name: "Medical / Sick Leave", maxDaysPerYear: 15, isPaid: true },
      { name: "Earned Leave", maxDaysPerYear: 30, isPaid: true },
    ];

    for (const lt of leaveTypes) {
      const [existing] = await db.select().from(leaveType).where(eq(leaveType.name, lt.name));
      if (!existing) {
        await db.insert(leaveType).values(lt);
        console.log(`  + Created Leave Type: ${lt.name}`);
      }
    }

    const holidays = [
      { date: "2026-02-21", type: "HOLIDAY", label: "Shaheed Day & International Mother Language Day" },
      { date: "2026-03-26", type: "HOLIDAY", label: "Independence & National Day" },
      { date: "2026-04-14", type: "HOLIDAY", label: "Pahela Baishakh (Bengali New Year)" },
      { date: "2026-05-01", type: "HOLIDAY", label: "May Day" },
      { date: "2026-12-16", type: "HOLIDAY", label: "Victory Day" },
      { date: "2026-12-25", type: "HOLIDAY", label: "Christmas Day" },
    ];

    for (const h of holidays) {
      const [existing] = await db.select().from(calendarDay).where(eq(calendarDay.date, h.date));
      if (!existing) {
        await db.insert(calendarDay).values({
          academicYearId: ay2026.id,
          date: h.date,
          type: h.type,
          label: h.label,
        });
        console.log(`  + Created Holiday: ${h.date} (${h.label})`);
      }
    }

    // 5. FINANCE SCHEMA: FEE SCHEDULES & SAMPLE INVOICES
    console.log("[Seed] 7. Seeding Fee Schedules & Balanced Invoices...");
    const sciClass11 = seededClasses["Class 11 (Science)"];
    const comClass11 = seededClasses["Class 11 (Commerce)"];

    const schedules = [
      { name: "Monthly Tuition Fee - Class 11", classId: sciClass11?.id, amount: "3500.00", frequency: "MONTHLY" },
      { name: "Science Laboratory Fee", classId: sciClass11?.id, amount: "1500.00", frequency: "MONTHLY" },
      { name: "Monthly Tuition Fee - Commerce", classId: comClass11?.id, amount: "3200.00", frequency: "MONTHLY" },
      { name: "Half-Yearly Examination Fee", classId: sciClass11?.id, amount: "2000.00", frequency: "ONE_TIME" },
    ];

    for (const sc of schedules) {
      if (!sc.classId) continue;
      const [existing] = await db
        .select()
        .from(feeSchedule)
        .where(and(eq(feeSchedule.name, sc.name), eq(feeSchedule.classId, sc.classId)));
      if (!existing) {
        await db.insert(feeSchedule).values({
          academicYearId: ay2026.id,
          classId: sc.classId,
          name: sc.name,
          amount: sc.amount,
          frequency: sc.frequency,
        });
        console.log(`  + Created Fee Schedule: ${sc.name} (৳ ${sc.amount})`);
      }
    }

    // Invoices and Balanced Ledger Entries
    const stu1 = seededStudents["DMC-2026-001"];
    const stu2 = seededStudents["DMC-2026-002"];
    const adminUser = seededStaff["EMP-2026-001"];

    if (stu1 && adminUser) {
      const invKey1 = "INV-2026-03-001";
      let [inv1] = await db.select().from(invoice).where(eq(invoice.idempotencyKey, invKey1));
      if (!inv1) {
        [inv1] = await db
          .insert(invoice)
          .values({
            studentId: stu1.id,
            academicYearId: ay2026.id,
            month: "2026-03-01",
            amount: "5000.00",
            dueDate: "2026-03-15",
            status: "PAID",
            idempotencyKey: invKey1,
          })
          .returning();
        console.log(`  + Created Invoice: ${invKey1} for ${stu1.nameEn} (PAID ৳ 5000)`);

        // Add payment record
        const payKey1 = "PAY-BKASH-20260310-001";
        const [pay1] = await db
          .insert(payment)
          .values({
            invoiceId: inv1.id,
            amount: "5000.00",
            currency: "BDT",
            method: "BKASH",
            aggregatorTranId: "TXN-BKASH-881923",
            status: "PROCESSED",
            idempotencyKey: payKey1,
            validatedAt: new Date("2026-03-10T14:30:00Z"),
          })
          .returning();

        // Balanced Double-Entry in finance.ledger_entry (Append-only)
        // 1. Debit Cash/Bank Asset Account
        await db.insert(ledgerEntry).values({
          account: "ASSET_BKASH_SETTLEMENT",
          partyType: "STUDENT",
          partyId: stu1.id,
          amount: "5000.00",
          currency: "BDT",
          direction: "DEBIT",
          source: "PAYMENT",
          sourceId: pay1.id,
          idempotencyKey: `LEDGER-DEBIT-${payKey1}`,
          postedBy: adminUser.id,
          status: "POSTED",
        });

        // 2. Credit Student Fee Revenue Account
        await db.insert(ledgerEntry).values({
          account: "REVENUE_STUDENT_FEES",
          partyType: "STUDENT",
          partyId: stu1.id,
          amount: "5000.00",
          currency: "BDT",
          direction: "CREDIT",
          source: "PAYMENT",
          sourceId: pay1.id,
          idempotencyKey: `LEDGER-CREDIT-${payKey1}`,
          postedBy: adminUser.id,
          status: "POSTED",
        });

        console.log(`  + Inserted Balanced Double-Entry in finance.ledger_entry (Debit ৳5000, Credit ৳5000)`);
      }
    }

    if (stu2) {
      const invKey2 = "INV-2026-03-002";
      const [existingInv2] = await db.select().from(invoice).where(eq(invoice.idempotencyKey, invKey2));
      if (!existingInv2) {
        await db.insert(invoice).values({
          studentId: stu2.id,
          academicYearId: ay2026.id,
          month: "2026-03-01",
          amount: "3200.00",
          dueDate: "2026-03-15",
          status: "ISSUED",
          idempotencyKey: invKey2,
        });
        console.log(`  + Created Invoice: ${invKey2} for ${stu2.nameEn} (PENDING ৳ 3200)`);
      }
    }

    // 6. NOTICE SCHEMA: BILINGUAL CIRCULARS
    console.log("[Seed] 8. Seeding Bilingual Institutional Notices...");
    const noticeList = [
      {
        title: "Class 11 & 12 Half-Yearly Examination Routine 2026",
        body: "The Half-Yearly Examination 2026 for Class 11 and Class 12 will commence on May 10, 2026. All students must collect exam admit cards after clearing all fee dues by May 05, 2026. Detail routine is published on the institutional notice board.\n\nএকাদশ ও দ্বাদশ শ্রেণির অর্ধবার্ষিক পরীক্ষা ২০২৬ আগামী ১০ মে ২০২৬ তারিখ থেকে শুরু হবে। সকল শিক্ষার্থীকে আগামী ৫ মে ২০২৬ এর মধ্যে যাবতীয় বকেয়া বেতন পরিশোধপূর্বক প্রবেশপত্র সংগ্রহ করার নির্দেশ দেওয়া হলো।",
        audience: { roles: ["TEACHER", "PARENT", "STUDENT"] },
        published: true,
        publishedAt: new Date("2026-03-01T09:00:00Z"),
      },
      {
        title: "Pahela Baishakh Celebration 1433 Notice",
        body: "Dhaka Model College will celebrate Pahela Baishakh 1433 with a cultural program on the college campus starting at 8:00 AM on April 14, 2026. All faculty, staff, and students are invited to join in traditional festive attire.\n\nপহেলা বৈশাখ ১৪৩৩ উদযাপন উপলক্ষে আগামী ১৪ এপ্রিল ২০২৬ সকাল ৮:০০ টায় কলেজ প্রাঙ্গণে বর্ণাঢ্য সাংস্কৃতিক অনুষ্ঠানের আয়োজন করা হয়েছে। শিক্ষক, শিক্ষার্থী ও অভিভাবকবৃন্দকে উপস্থিত থাকার আমন্ত্রণ জানানো হচ্ছে।",
        audience: { roles: ["ALL"] },
        published: true,
        publishedAt: new Date("2026-04-01T10:00:00Z"),
      },
      {
        title: "Tuition Fee Payment Deadline for April 2026",
        body: "Dear Parents and Guardians, please note that the monthly tuition fee for April 2026 is due by April 20, 2026. Payments can be seamlessly completed through bKash, Nagad, or Dutch-Bangla Bank portal.\n\nশ্রদ্ধেয় অভিভাবকবৃন্দ, এপ্রিল ২০২৬ মাসের মাসিক বেতন প্রদানের শেষ সময় আগামী ২০ এপ্রিল ২০২৬। বিকাশ, নগদ অথবা ডিবিবিএল গেটওয়ের মাধ্যমে অনলাইনে ফি পরিশোধ করা যাবে।",
        audience: { roles: ["PARENT", "STUDENT", "FINANCE"] },
        published: true,
        publishedAt: new Date("2026-04-05T11:00:00Z"),
      },
      {
        title: "Parent-Teacher Association Meeting Schedule",
        body: "A Parent-Teacher Association (PTA) session for Class 11 Science & Commerce will be held on Saturday, March 28, 2026 at 10:30 AM in the College Auditorium.\n\nএকাদশ শ্রেণির বিজ্ঞান ও ব্যবসায় শিক্ষা শাখার অভিভাবক-শিক্ষক মতবিনিময় সভা আগামী শনিবার, ২৮ মার্চ ২০২৬ সকাল ১০:৩০ টায় কলেজ মিলনায়তনে অনুষ্ঠিত হবে।",
        audience: { roles: ["TEACHER", "PARENT"] },
        published: true,
        publishedAt: new Date("2026-03-20T08:30:00Z"),
      },
    ];

    if (adminUser) {
      for (const n of noticeList) {
        const [existing] = await db.select().from(notice).where(eq(notice.title, n.title));
        if (!existing) {
          await db.insert(notice).values({
            title: n.title,
            body: n.body,
            audience: n.audience,
            published: n.published,
            publishedAt: n.publishedAt,
            createdBy: adminUser.id,
          });
          console.log(`  + Created Notice: ${n.title}`);
        }
      }
    }

    // 7. ATTENDANCE & PERIOD CLOSE
    console.log("[Seed] 9. Seeding Period Closes & Daily Attendance...");
    const sec1 = Object.values(seededSections)[0];
    const principalUser = seededStaff["EMP-2026-002"] || adminUser;

    if (sec1 && adminUser && principalUser) {
      const [existingPC1] = await db
        .select()
        .from(periodClose)
        .where(and(eq(periodClose.sectionId, sec1.id), eq(periodClose.month, "2026-02-01")));
      if (!existingPC1) {
        await db.insert(periodClose).values({
          sectionId: sec1.id,
          month: "2026-02-01",
          status: "LOCKED",
          summary: { totalDays: 24, presentRate: 94.5 },
          submittedBy: adminUser.id,
          submittedAt: new Date("2026-02-28T16:00:00Z"),
          approvedBy: principalUser.id,
          approvedAt: new Date("2026-02-28T18:00:00Z"),
          lockedAt: new Date("2026-02-28T18:00:00Z"),
        });
        console.log(`  + Created Period Close: ${sec1.name} (Feb 2026 - LOCKED with Maker-Checker)`);
      }

      const [existingPC2] = await db
        .select()
        .from(periodClose)
        .where(and(eq(periodClose.sectionId, sec1.id), eq(periodClose.month, "2026-03-01")));
      if (!existingPC2) {
        await db.insert(periodClose).values({
          sectionId: sec1.id,
          month: "2026-03-01",
          status: "PENDING_APPROVAL",
          summary: { totalDays: 26, presentRate: 92.1 },
          submittedBy: adminUser.id,
          submittedAt: new Date("2026-03-31T17:00:00Z"),
        });
        console.log(`  + Created Period Close: ${sec1.name} (March 2026 - PENDING_APPROVAL)`);
      }

      // Sample period events
      const todayStr = new Date().toISOString().split("T")[0];
      for (const stu of Object.values(seededStudents).slice(0, 5)) {
        const [existingEvt] = await db
          .select()
          .from(periodEvent)
          .where(
            and(
              eq(periodEvent.studentId, stu.id),
              eq(periodEvent.eventDate, todayStr),
              eq(periodEvent.period, 0)
            )
          );
        if (!existingEvt) {
          await db.insert(periodEvent).values({
            studentId: stu.id,
            eventDate: todayStr,
            period: 0,
            sectionId: sec1.id,
            status: "PRESENT",
            source: "DEVICE",
            markedBy: adminUser.id,
          });
        }
      }
      console.log(`  + Seeded 5 Attendance Events for ${todayStr}`);
    }

    // 8. PAYROLL RUNS
    console.log("[Seed] 10. Seeding Monthly Payroll Runs...");
    if (adminUser && principalUser) {
      const [existingPR] = await db
        .select()
        .from(payrollRun)
        .where(eq(payrollRun.month, "2026-02-01"));
      if (!existingPR) {
        const [pr] = await db
          .insert(payrollRun)
          .values({
            month: "2026-02-01",
            status: "PAID",
            createdBy: adminUser.id,
            approvedBy: principalUser.id,
            approvedAt: new Date("2026-02-28T19:00:00Z"),
            dispatchedAt: new Date("2026-03-01T08:00:00Z"),
          })
          .returning();

        // Seed Payroll Lines for Teachers
        for (const stf of Object.values(seededStaff).slice(0, 5)) {
          await db.insert(payrollLine).values({
            payrollRunId: pr.id,
            staffId: stf.id,
            basicSalary: "65000.00",
            allowances: { houseRent: 20000, medical: 5000, conveyance: 5000 },
            deductions: { providentFund: 6500, tax: 2000 },
            gross: "95000.00",
            net: "86500.00",
            isImmutable: true,
          });
        }
        console.log(`  + Created Payroll Run: Feb 2026 (PAID) with 5 Staff Payslip Lines`);
      }
    }

    console.log("[Seed] SUCCESS: Database seed completed idempotently!");
  } catch (error) {
    console.error("[Seed] FAILED with error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
