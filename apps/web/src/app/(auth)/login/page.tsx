"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth, DEMO_PERSONAS } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { GraduationCap, ShieldCheck, UserCheck, KeyRound, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, switchPersona } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("principal@dhakamodel.edu.bd");
  const [password, setPassword] = React.useState("password123");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Signed In Successfully",
        description: `Welcome back to Dhaka Model College Portal.`,
        type: "success",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = async (roleKey: string) => {
    const persona = DEMO_PERSONAS[roleKey]!;
    setIsLoading(true);
    try {
      switchPersona(roleKey);
      await login(persona.email, "demo", roleKey);
      toast({
        title: `Logged in as ${persona.name}`,
        description: `Active Role: ${persona.roles.join(", ")}`,
        type: "success",
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
            Institutional Portal · Sign in to access your role-based dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {isLoading ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">Or Quick Demo Login</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground text-center">
              Click any persona to log in instantly with that role's permissions:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9 hover:border-primary"
                onClick={() => handleQuickPersona("ADMIN")}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0" />
                <span className="truncate">Principal / Admin</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9 hover:border-primary"
                onClick={() => handleQuickPersona("TEACHER")}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600 mr-1.5 shrink-0" />
                <span className="truncate">Teacher (Faculty)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9 hover:border-primary"
                onClick={() => handleQuickPersona("FINANCE")}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600 mr-1.5 shrink-0" />
                <span className="truncate">Finance Officer</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9 hover:border-primary"
                onClick={() => handleQuickPersona("OFFICE")}
              >
                <KeyRound className="h-3.5 w-3.5 text-blue-600 mr-1.5 shrink-0" />
                <span className="truncate">Office Staff</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9 hover:border-primary"
                onClick={() => handleQuickPersona("PARENT")}
              >
                <UserCheck className="h-3.5 w-3.5 text-purple-600 mr-1.5 shrink-0" />
                <span className="truncate">Parent / Guardian</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9 hover:border-primary"
                onClick={() => handleQuickPersona("STUDENT")}
              >
                <GraduationCap className="h-3.5 w-3.5 text-indigo-600 mr-1.5 shrink-0" />
                <span className="truncate">Enrolled Student</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleQuickPersona("ADMIN")}
          >
            🔒 Sign in with Keycloak OpenID Connect SSO
          </Button>
          <div className="text-xs text-center text-muted-foreground pt-1 border-t w-full">
            Don't have an institutional account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
