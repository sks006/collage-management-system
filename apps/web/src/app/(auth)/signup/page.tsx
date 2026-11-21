"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { GraduationCap } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("+88017");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("TEACHER");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup({
        name,
        email,
        role,
        phone,
      });
      toast({
        title: "Account Created Successfully",
        description: `Welcome to Dhaka Model College, ${name}! Your account role is set to ${role}.`,
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
          <CardTitle className="text-2xl font-bold tracking-tight">Create Institutional Account</CardTitle>
          <CardDescription>
            Register a new profile with role credentials for Dhaka Model College
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Full Name (English / বাংলা)</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanvir Hasan / তানভীর হাসান"
              />
            </div>
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
              <label className="text-xs font-semibold text-foreground">Mobile Number (SMS Alerts)</label>
              <Input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+88017XXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Role / Designation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TEACHER">Faculty / Teacher</option>
                <option value="STUDENT">Enrolled Student</option>
                <option value="PARENT">Parent / Guardian</option>
                <option value="OFFICE">Office & Admin Staff</option>
                <option value="FINANCE">Finance & Accounts Officer</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register & Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <div className="text-xs text-center text-muted-foreground pt-2 border-t w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
