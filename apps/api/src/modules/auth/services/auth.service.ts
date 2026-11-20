import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

export interface ProvisionUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'OFFICE' | 'FINANCE' | 'STUDENT' | 'PARENT';
  temporaryPassword?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
  private readonly realm = process.env.KEYCLOAK_REALM || 'college-sms';
  private readonly clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';
  private readonly clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || '';

  private async getAdminToken(): Promise<string> {
    const tokenUrl = `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      throw new InternalServerErrorException('Failed to authenticate with Keycloak Admin API');
    }

    const data = await res.json();
    return data.access_token;
  }

  async provisionUser(dto: ProvisionUserDto): Promise<{ keycloakId: string }> {
    const token = await this.getAdminToken();
    const usersUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;

    const createRes = await fetch(usersUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: dto.username,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        enabled: true,
        emailVerified: false,
        credentials: dto.temporaryPassword
          ? [{ type: 'password', value: dto.temporaryPassword, temporary: true }]
          : undefined,
        requiredActions: ['UPDATE_PASSWORD', 'VERIFY_EMAIL'],
      }),
    });

    if (!createRes.ok && createRes.status !== 409) {
      const errText = await createRes.text();
      this.logger.error(`Keycloak user creation failed: ${errText}`);
      throw new InternalServerErrorException('Failed to provision user in Keycloak');
    }

    const locationHeader = createRes.headers.get('location');
    const keycloakId = locationHeader ? locationHeader.split('/').pop()! : '';

    if (keycloakId) {
      await this.assignRealmRole(token, keycloakId, dto.role);
    }

    return { keycloakId };
  }

  async bulkProvisionUsers(users: ProvisionUserDto[]) {
    const results: Array<{ username: string; keycloakId?: string; error?: string }> = [];

    for (const user of users) {
      try {
        const { keycloakId } = await this.provisionUser(user);
        results.push({ username: user.username, keycloakId });
      } catch (err: any) {
        results.push({ username: user.username, error: err.message });
      }
    }

    return {
      total: users.length,
      succeeded: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
      results,
    };
  }

  private async assignRealmRole(token: string, userId: string, roleName: string) {
    const roleRes = await fetch(
      `${this.keycloakUrl}/admin/realms/${this.realm}/roles/${roleName}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!roleRes.ok) return;

    const roleObj = await roleRes.json();
    await fetch(
      `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([roleObj]),
      },
    );
  }
}