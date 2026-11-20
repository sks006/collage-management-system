import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
// Adjust schema imports to match your @sms/database exports
import { DRIZZLE_DB } from '../database/database.provider';

export interface RowScope {
  role: string;
  userId: string;
  staffId?: string;
  studentIds?: string[];
  sectionIds?: string[];
  unrestricted: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email?: string;
        roles: string[];
      };
      rowScope?: RowScope;
    }
  }
}

@Injectable()
export class RowScopeMiddleware implements NestMiddleware {
  constructor(@Inject(DRIZZLE_DB) private readonly db: any) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) {
      return next();
    }

    const roles = user.roles || [];

    // Admin, Principal, Office, and Finance have institution-wide scope
    if (
      roles.includes('ADMIN') ||
      roles.includes('PRINCIPAL') ||
      roles.includes('OFFICE') ||
      roles.includes('FINANCE')
    ) {
      req.rowScope = {
        role: roles[0],
        userId: user.sub,
        unrestricted: true,
      };
      return next();
    }

    // Teacher: restrict to assigned sections
    if (roles.includes('TEACHER')) {
      const staff = await this.db.query.staff?.findFirst({
        where: (s: any, { eq }: any) => eq(s.keycloakUserId, user.sub),
      });

      const assignments = staff
        ? await this.db.query.teacherAssignments?.findMany({
            where: (ta: any, { eq }: any) => eq(ta.staffId, staff.id),
          })
        : [];

      req.rowScope = {
        role: 'TEACHER',
        userId: user.sub,
        staffId: staff?.id,
        sectionIds: assignments.map((a: any) => a.sectionId),
        unrestricted: false,
      };
      return next();
    }

    // Student / Parent: restrict to own or linked student records
    if (roles.includes('STUDENT') || roles.includes('PARENT')) {
      const students = await this.db.query.students?.findMany({
        where: (st: any, { eq, or }: any) =>
          or(eq(st.keycloakUserId, user.sub), eq(st.guardianKeycloakId, user.sub)),
      });

      req.rowScope = {
        role: roles.includes('STUDENT') ? 'STUDENT' : 'PARENT',
        userId: user.sub,
        studentIds: (students || []).map((s: any) => s.id),
        unrestricted: false,
      };
      return next();
    }

    next();
  }
}