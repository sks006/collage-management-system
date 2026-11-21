"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Mail,
  UserCheck,
  Users,
  Coins,
  Briefcase,
  BookOpen,
  Lock,
} from "lucide-react";

type OnboardingStep = "DETAILS" | "OTP" | "ACTIVE_SUCCESS" | "PENDING_APPROVAL";

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, verifyUserOtp, resendOtp, setSession } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = React.useState<OnboardingStep>("DETAILS");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("+88017");
  const [requestedRole, setRequestedRole] = React.useState<
    "STUDENT" | "PARENT" | "TEACHER" | "FINANCE" | "OFFICE"
  >("STUDENT");
  const [referenceNo, setReferenceNo] = React.useState("");

  // OTP state
  const [otp, setOtp] = React.useState("");
  const [demoOtp, setDemoOtp] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(600); // 10 minutes
  const [isLoading, setIsLoading] = React.useState(false);

  // Timer countdown
  React.useEffect(() => {
    if (step !== "OTP" || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await registerUser({
        email,
        password,
        fullName,
        requestedRole,
        referenceNo,
        phone,
      });

      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
        setOtp(res.demoOtp); // pre-populate for quick testing convenience
      }
      setTimeLeft(600);
      setStep("OTP");
      toast({
        title: "6-Digit OTP Dispatched",
        description: `Verification code sent to ${email} via Gmail SMTP.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Registration Error",
        description: err.message || "Failed to start registration.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await resendOtp(email);
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
        setOtp(res.demoOtp);
      }
      setTimeLeft(600);
      toast({
        title: "Code Resent",
        description: "A fresh 6-digit verification code was sent to your Gmail.",
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Resend Error",
        description: err.message || "Failed to resend code.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the full 6-digit numeric verification code.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyUserOtp({ email, otp });

      if (res.status === "ACTIVE") {
        setStep("ACTIVE_SUCCESS");
        // Save user session
        setSession({
          id: `usr-${Date.now()}`,
          name: fullName,
          email,
          roles: [res.assignedRole || requestedRole],
          phone,
        });

        toast({
          title: "Account Verified & Active!",
          description: `Welcome to Dhaka Model College. Redirecting to your portal...`,
          type: "success",
        });

        setTimeout(() => {
          router.push(res.redirectUrl || "/");
        }, 1800);
      } else {
        setStep("PENDING_APPROVAL");
        toast({
          title: "Gmail Verified!",
          description: "Staff request recorded. Awaiting administrator review.",
          type: "info",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid or expired verification code.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Wizard Progress Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
              step === "DETAILS"
                ? "bg-primary text-primary-foreground"
                : "bg-emerald-500 text-white"
            }`}
          >
            1
          </span>
          <span className={step === "DETAILS" ? "text-foreground font-semibold" : ""}>
            Account Details
          </span>
        </div>
        <div className="h-0.5 w-8 bg-border" />
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
              step === "OTP"
                ? "bg-primary text-primary-foreground"
                : step === "ACTIVE_SUCCESS" || step === "PENDING_APPROVAL"
                ? "bg-emerald-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </span>
          <span className={step === "OTP" ? "text-foreground font-semibold" : ""}>
            Gmail OTP
          </span>
        </div>
        <div className="h-0.5 w-8 bg-border" />
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
              step === "ACTIVE_SUCCESS" || step === "PENDING_APPROVAL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </span>
          <span
            className={
              step === "ACTIVE_SUCCESS" || step === "PENDING_APPROVAL"
                ? "text-foreground font-semibold"
                : ""
            }
          >
            Role Status
          </span>
        </div>
      </div>

      <Card className="shadow-xl border-primary/20">
        {step === "DETAILS" && (
          <>
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create Institutional Account
              </CardTitle>
              <CardDescription>
                Register with your Gmail or Institutional ID to access Dhaka Model College
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Full Name (English / বাংলা)
                  </label>
                  <Input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan / তানভীর হাসান"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Gmail / Institutional Email
                    </label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Mobile Number (SMS)
                    </label>
                    <Input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+88017XXXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Password (8+ chars, upper, lower, digit)
                  </label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {/* Role Type Selector with Spec Badges */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Select Role & Access Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      onClick={() => setRequestedRole("STUDENT")}
                      className={`cursor-pointer rounded-lg border p-2.5 text-xs transition-all ${
                        requestedRole === "STUDENT"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 text-teal-600">
                          <GraduationCap className="h-4 w-4" /> Student
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          Instant Access
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Self-service registration with 6-digit Gmail OTP
                      </p>
                    </div>

                    <div
                      onClick={() => setRequestedRole("PARENT")}
                      className={`cursor-pointer rounded-lg border p-2.5 text-xs transition-all ${
                        requestedRole === "PARENT"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 text-purple-600">
                          <Users className="h-4 w-4" /> Parent / Guardian
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          Instant Access
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Tuition fees, receipts, and ward attendance
                      </p>
                    </div>

                    <div
                      onClick={() => setRequestedRole("TEACHER")}
                      className={`cursor-pointer rounded-lg border p-2.5 text-xs transition-all ${
                        requestedRole === "TEACHER"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 text-blue-600">
                          <BookOpen className="h-4 w-4" /> Teacher / Faculty
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                          Admin Review
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Requires 1-click Principal approval after OTP
                      </p>
                    </div>

                    <div
                      onClick={() => setRequestedRole("FINANCE")}
                      className={`cursor-pointer rounded-lg border p-2.5 text-xs transition-all ${
                        requestedRole === "FINANCE"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <Coins className="h-4 w-4" /> Finance Officer
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                          Admin + MFA
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Requires Admin approval + mandatory TOTP MFA
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    {requestedRole === "STUDENT"
                      ? "Admission No / Roll ID (Optional)"
                      : requestedRole === "PARENT"
                      ? "Ward Admission No (Optional)"
                      : "Staff Employee ID (Optional)"}
                  </label>
                  <Input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder={
                      requestedRole === "STUDENT"
                        ? "DMC-2026-XXXX"
                        : requestedRole === "PARENT"
                        ? "DMC-2026-XXXX"
                        : "EMP-2026-XXXX"
                    }
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? "Dispatching OTP..." : "Continue to Gmail Verification"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === "OTP" && (
          <>
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Enter 6-Digit OTP
              </CardTitle>
              <CardDescription>
                We dispatched a verification code to{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {demoOtp && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center justify-between">
                    <span>
                      Demo Mode Verification OTP:{" "}
                      <strong className="font-mono text-sm tracking-widest">{demoOtp}</strong>
                    </span>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-none">
                      Dev Active
                    </Badge>
                  </div>
                )}

                <div className="space-y-2 text-center">
                  <Input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="h-14 text-center font-mono text-2xl tracking-[0.5em] font-bold"
                    placeholder="••••••"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Expires in: <strong className="text-foreground">{formatTimer(timeLeft)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:underline font-medium"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button type="submit" className="w-full h-11" disabled={isLoading || otp.length < 6}>
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => setStep("DETAILS")}
                  >
                    Change Email or Role
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "ACTIVE_SUCCESS" && (
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Identity Verified & Account Active!
              </h2>
              <p className="text-sm text-muted-foreground">
                Welcome, <strong>{fullName}</strong>. Your {requestedRole} profile has been assigned
                immediate access credentials.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground font-mono">
              Session Cookies Established · Secure HTTP-Only OIDC Token
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(requestedRole === "PARENT" ? "/finance" : "/")}
            >
              Continue to Portal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        )}

        {step === "PENDING_APPROVAL" && (
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Gmail Verified — Awaiting Admin Approval
              </h2>
              <p className="text-sm text-muted-foreground">
                Thank you, <strong>{fullName}</strong>. Because you requested an administrative staff
                role (<strong>{requestedRole}</strong>), an institutional administrator must approve your
                access.
              </p>
            </div>
            <div className="rounded-lg border bg-amber-50/50 border-amber-200/60 p-3.5 text-xs text-left space-y-1 text-amber-900">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>Zero Privilege Escalation Safeguard</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                A notification has been dispatched to the Principal's Operations Hub. Once approved, you
                will receive an activation confirmation email and can sign in with your credentials.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Encrypted with Keycloak OIDC & Row-Level Scope (RLS)</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
