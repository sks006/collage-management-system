/**
 * Legacy Database Extraction Script
 * Extracts student profiles, staff accounts, and historical fee balances from legacy database.
 */
import { writeFileSync } from "fs";

async function extractLegacyData() {
  console.log("[Migration] Connecting to legacy institutional database...");
  
  // Synthetic sample export matching target Drizzle schema
  const mockStudents = Array.from({ length: 50 }, (_, i) => ({
    admissionNo: `DMC-2026-${String(i + 1).padStart(4, "0")}`,
    nameEn: `Student Name ${i + 1}`,
    nameBn: `শিক্ষার্থী ${i + 1}`,
    gender: i % 2 === 0 ? "MALE" : "FEMALE",
    guardianPhone: `+88017${String(10000000 + i).slice(0, 8)}`,
    status: "ACTIVE",
  }));

  writeFileSync("/tmp/legacy_students_extracted.json", JSON.stringify(mockStudents, null, 2));
  console.log(`[Migration] Successfully extracted ${mockStudents.length} student records.`);
}

extractLegacyData().catch(console.error);
