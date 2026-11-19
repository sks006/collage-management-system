import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../database/database.provider";
import { DatabaseInstance } from "@sms/database";
import { auditLog } from "@sms/database";

@Injectable()
export class AuditService {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async log(params: {
    actorId: string;
    actorRole: string;
    action: string;
    resourceType: string;
    resourceId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.db.insert(auditLog).values({
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }
}
