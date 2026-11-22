import { Injectable } from "@nestjs/common";
import { AttendanceRepository } from "../repositories/attendance.repository";
import { OutboxService } from "../../../shared/outbox/outbox.service";

@Injectable()
export class AttendanceService {
  constructor(
    private repo: AttendanceRepository,
    private outbox: OutboxService,
  ) {}

  async markBatch(dto: any, markedBy: string) {
    const events = dto.records.map((r: any) => ({
      studentId: r.studentId,
      eventDate: dto.eventDate,
      period: dto.period || 0,
      sectionId: dto.sectionId,
      subjectId: dto.subjectId,
      status: r.status,
      source: "MANUAL",
      markedBy,
      note: r.note,
    }));

    const saved = await this.repo.saveBatch(events);

    // Filter absent students for parent notifications
    const absent = dto.records.filter((r: any) => r.status === "ABSENT");
    for (const a of absent) {
      await this.outbox.publish(
        "NOTIFY_ABSENTEE_PARENTS",
        {
          studentId: a.studentId,
          date: dto.eventDate,
          sectionId: dto.sectionId,
        },
        `absent_${a.studentId}_${dto.eventDate}`,
      );
    }

    return saved;
  }

  async getStudentAttendance(studentId: string) {
    return this.repo.findByStudent(studentId);
  }

  async submitCorrection(dto: any, requestedBy: string) {
    return this.repo.createCorrection({
      ...dto,
      oldStatus: "ABSENT", // Fallback lookup
      requestedBy,
    });
  }

  async ingestDevicePunch(body: {
    studentId: string;
    sectionId: string;
    punchTime?: string;
    deviceId?: string;
  }) {
    const today = (body.punchTime ? new Date(body.punchTime) : new Date()).toISOString().split("T")[0];

    const event = {
      studentId: body.studentId,
      eventDate: today,
      period: 0,
      sectionId: body.sectionId,
      status: "PRESENT",
      source: "DEVICE",
      markedBy: body.deviceId || "00000000-0000-0000-0000-000000000001",
      deviceId: body.deviceId || "00000000-0000-0000-0000-000000000001",
    };

    const saved = await this.repo.saveBatch([event]);
    return { success: true, saved, message: "Punch registered" };
  }
}
