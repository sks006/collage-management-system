"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState("ADMIN");

  const handleKeycloakLogin = () => {
    // In dev environment, redirect directly to dashboard or Keycloak endpoint
    window.location.href = "/";
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="text-center space-y-2">
        <div className="text-3xl">🏫</div>
        <CardTitle className="text-2xl font-bold tracking-tight">College Management System</CardTitle>
        <CardDescription>
          Sign in via OpenID Connect (Keycloak SSO) to access your institutional portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Dev Persona</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ADMIN">Principal / Admin</option>
            <option value="TEACHER">Teacher / Faculty</option>
            <option value="FINANCE">Finance Officer</option>
            <option value="OFFICE">Office Staff</option>
            <option value="PARENT">Parent / Guardian</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full text-base py-5" onClick={handleKeycloakLogin}>
          Sign in with Keycloak SSO
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Protected by OAuth2 / OpenID Connect with RS256 JWT validation.
        </p>
      </CardFooter>
    </Card>
  );
}
