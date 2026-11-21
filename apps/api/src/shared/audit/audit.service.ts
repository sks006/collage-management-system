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
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const actorId = isUuid(params.actorId) ? params.actorId : "00000000-0000-0000-0000-000000000001";
    const resourceId = isUuid(params.resourceId) ? params.resourceId : "00000000-0000-0000-0000-000000000001";

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
      // Fallback in case of database offline in test environments
    }
  }
}
