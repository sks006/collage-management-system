# 4. Identity & Authentication: Self-Hosted Keycloak OIDC with Stateless JWT Verification

Date: 2026-11-20
Status: Accepted

## Context
A modern institution requires enterprise SSO, Google Workspace federation, multi-factor authentication (MFA) for administrative staff, and role-based access control without storing plain/salted passwords directly in application databases.

## Decision
Deploy Keycloak 24 as a dedicated Identity Provider (IdP):
- Real-time OAuth2 / OpenID Connect authorization code flow with PKCE for Next.js frontend.
- Stateless RS256 JWT verification on NestJS API backend using `jose` and cached JWKS endpoints (1-hour cache).
- 7 canonical realm roles: `ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `STUDENT`, `PARENT`.

## Consequences
- Passwords and MFA secrets never touch the application database.
- API requests remain stateless and performant with local public key verification.
- Seamless federation with Google Workspace and government portal IDPs.
