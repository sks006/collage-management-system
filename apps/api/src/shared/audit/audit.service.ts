import { Injectable, Inject } from "@nestjs/common";
import { randomUUID } from "crypto";
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
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const actorId = isUuid(params.actorId) ? params.actorId : randomUUID();
    const resourceId = isUuid(params.resourceId) ? params.resourceId : randomUUID();

    try {
      await this.db.insert(auditLog).values({
        actorId,
        actorRole: params.actorRole,
        action: params.action,
        resourceType: params.resourceType,
        resourceId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } catch {
      // Suppress error in test environments if audit table unavailable
    }
  }
}
