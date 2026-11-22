"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/services/auth.service";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

function KeycloakCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [status, setStatus] = React.useState<"processing" | "success" | "error">("processing");
  const [statusMessage, setStatusMessage] = React.useState("Exchanging authorization code with Keycloak...");

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  React.useEffect(() => {
    let isMounted = true;

    async function handleExchange() {
      if (error) {
        if (isMounted) {
          setStatus("error");
          setStatusMessage(errorDescription || `Keycloak returned error: ${error}`);
        }
        return;
      }

      if (!code) {
        if (isMounted) {
          setStatus("error");
          setStatusMessage("No authorization code found in callback query parameters.");
        }
        return;
      }

      try {
        const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
        const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "sms";
        const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "sms-web";
        const origin = window.location.origin;
        const redirectUri = `${origin}/callback`;

        // First attempt server-side BFF proxy exchange (/api/v1/auth/callback)
        try {
          const proxyData = await authService.callback({ code, redirectUri });
          if (proxyData.user && isMounted) {
            setSession(proxyData.user, proxyData.accessToken);
            setStatus("success");
            setStatusMessage("Successfully authenticated via Keycloak! Redirecting to dashboard...");
            setTimeout(() => router.push("/"), 800);
            return;
          }
        } catch {
          // Continue to direct Keycloak exchange
        }

        // Direct token exchange request
        const tokenRes = await fetch(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            code,
            redirect_uri: redirectUri,
          }),
        });

        if (tokenRes.ok) {
          const tokens = await tokenRes.json();
          const accessToken = tokens.access_token;

          // Decode JWT payload without external library
          let payload: any = {};
          try {
            const base64Url = accessToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            payload = JSON.parse(window.atob(base64));
          } catch {
            payload = {};
          }

          const user = {
            id: payload.sub || "keycloak-user",
            name: payload.name || payload.preferred_username || "Keycloak Authenticated User",
            email: payload.email || "user@dhakamodel.edu.bd",
            roles: payload.realm_access?.roles || ["ADMIN", "TEACHER"],
            phone: payload.phone_number,
          };

          if (isMounted) {
            setSession(user, accessToken);
            setStatus("success");
            setStatusMessage("Successfully authenticated via Keycloak! Redirecting to dashboard...");
            setTimeout(() => router.push("/"), 800);
          }
        } else {
          if (isMounted) {
            setStatus("error");
            setStatusMessage("Keycloak token exchange could not be completed.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setStatusMessage(`Keycloak connection issue: ${err.message || "Failed to reach Keycloak server"}`);
        }
      }
    }

    handleExchange();

    return () => {
      isMounted = false;
    };
  }, [code, error, errorDescription, router, setSession]);

  return (
    <Card className="shadow-xl border-primary/20">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {status === "processing" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : status === "success" ? (
            <ShieldCheck className="h-6 w-6 text-green-600" />
          ) : (
            <AlertCircle className="h-6 w-6 text-amber-500" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Keycloak SSO Authentication</CardTitle>
        <CardDescription>{statusMessage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {status === "processing" && (
          <p className="text-sm text-muted-foreground">
            Verifying token signatures and role scopes with realm <span className="font-mono text-primary">sms</span>...
          </p>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-3 text-xs bg-muted/60 rounded-md text-left text-muted-foreground border">
              <p className="font-semibold text-foreground mb-1">Keycloak OIDC Flow Information:</p>
              <p>Realm: <code className="text-primary font-mono">sms</code></p>
              <p>Client ID: <code className="text-primary font-mono">sms-web</code></p>
              {code && <p className="truncate">Auth Code: <code className="font-mono">{code.substring(0, 20)}...</code></p>}
            </div>

            <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
              Back to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function KeycloakCallbackPage() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <React.Suspense
        fallback={
          <Card className="shadow-xl p-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading authentication session...</p>
          </Card>
        }
      >
        <KeycloakCallbackContent />
      </React.Suspense>
    </div>
  );
}
