import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.provider';
import { DatabaseInstance, staff, teacherSection, student, enrollment } from '@sms/database';
import { eq, and } from 'drizzle-orm';

export interface RowScope {
  role: string;
  userId: string;
  staffId?: string;
  studentIds?: string[];
  sectionIds?: string[];
  unrestricted: boolean;
}

declare global {
  namespace FastifyRequest {
    interface FastifyRequest {
      rowScope?: RowScope;
    }
  }
}

@Injectable()
export class RowScopeMiddleware implements NestMiddleware {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DatabaseInstance) {}

  async use(req: FastifyRequest, _res: FastifyReply, next: () => void) {
    const user = (req as any).user;
    if (!user) {
      return next();
    }

    const roles: string[] = user.roles || [];

    // Admin, Principal, Office, Finance: institution-wide scope
    if (
      roles.includes('ADMIN') ||
      roles.includes('PRINCIPAL') ||
      roles.includes('OFFICE') ||
      roles.includes('FINANCE')
    ) {
      (req as any).rowScope = {
        role: roles[0],
        userId: user.id,
        unrestricted: true,
      };
      return next();
    }

    // Teacher: restrict to assigned sections
    if (roles.includes('TEACHER')) {
      const [staffRow] = await this.db.select().from(staff).where(eq(staff.keycloakUserId, user.id)).limit(1);
      const assignments = staffRow
        ? await this.db.select().from(teacherSection).where(eq(teacherSection.staffId, staffRow.id))
        : [];
      (req as any).rowScope = {
        role: 'TEACHER',
        userId: user.id,
        staffId: staffRow?.id,
        sectionIds: assignments.map((a: typeof teacherSection.$inferSelect) => a.sectionId),
        unrestricted: false,
      };
      return next();
    }

    // Student / Parent: restrict to own or linked student records
    if (roles.includes('STUDENT') || roles.includes('PARENT')) {
      const rows = await this.db
        .select()
        .from(student)
        .where(eq(student.keycloakUserId, user.id))
        .limit(1);

      // For PARENT, look up via guardianKeycloakId
      let studentIds: string[] = [];
      if (roles.includes('STUDENT') && rows.length > 0) {
        studentIds = [rows[0].id];
      } else if (roles.includes('PARENT')) {
        const linked = await this.db.select().from(student).where(eq(student.guardianKeycloakId, user.id));
        studentIds = linked.map((s) => s.id);
      }

      (req as any).rowScope = {
        role: roles.includes('STUDENT') ? 'STUDENT' : 'PARENT',
        userId: user.id,
        studentIds,
        unrestricted: false,
      };
      return next();
    }

    next();
  }
}
