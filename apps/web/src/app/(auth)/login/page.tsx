"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Sparkles,
  Lock,
  ExternalLink,
  Users,
  Coins,
  Briefcase,
  BookOpen,
} from "lucide-react";

export default function LoginPage() {
  const { login, loginWithKeycloak } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("principal@dhakamodel.edu.bd");
  const [password, setPassword] = React.useState("College@2026");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Signed In Successfully",
        description: `Welcome back to Dhaka Model College Institutional Portal.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials. Please verify your email and password.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="shadow-xl border-primary/20">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Dhaka Model College</CardTitle>
          <CardDescription>
            Institutional Management System · Authenticate with Keycloak OIDC or Institutional ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keycloak SSO Action Button */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="default"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
              onClick={loginWithKeycloak}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Sign In with Keycloak SSO
              <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-70" />
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Authenticates against Keycloak Realm <span className="font-mono text-primary font-medium">sms</span> (OAuth 2.0 / OIDC)
            </p>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">Or Institutional Login</span>
            </div>
          </div>

          {/* Standard Institutional Credentials */}
          <form onSubmit={handleCredentialsLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Institutional Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dhakamodel.edu.bd"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In with Credentials"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Need an institutional account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Protected by Keycloak RBAC & Row-Level Scope (RLS)</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
