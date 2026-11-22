import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  private getJWKS() {
    if (!this.jwks) {
      const keycloakUrl = process.env.KEYCLOAK_URL || "http://localhost:8080";
      const realm = process.env.KEYCLOAK_REALM || "sms";
      const jwksUri = new URL(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`);
      this.jwks = createRemoteJWKSet(jwksUri, {
        cacheMaxAge: 3600000, // 1 hour cache invariant
      });
    }
    return this.jwks;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Bearer Token");
    }

    const token = authHeader.split(" ")[1];

    try {
      const issuer = process.env.JWT_ISSUER || "http://localhost:8080/realms/sms";
      const expectedAudience = process.env.JWT_AUDIENCE
        ? [process.env.JWT_AUDIENCE, "account", "sms-web"]
        : ["account", "sms-api", "sms-web"];
      const { payload } = await jwtVerify(token, this.getJWKS(), {
        issuer,
        audience: expectedAudience,
      });

      req.user = {
        id: payload.sub as string,
        email: (payload as any).email || "",
        roles: (payload as any).realm_access?.roles || [],
        name: (payload as any).name || "",
      };
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(`Invalid Token: ${err.message}`);
    }
  }
}
