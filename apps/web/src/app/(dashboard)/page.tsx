"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { formatBDT } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  DollarSign,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Bell,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  CalendarDays,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.roles[0] || "ADMIN";

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name || "Dr. Rafiqul Islam"}</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {role}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Dhaka Model College Institutional Portal · Single Source of Truth
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role === "TEACHER" && (
            <Link href="/attendance">
              <Button size="sm" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark Today's Attendance</span>
              </Button>
            </Link>
          )}
          {role === "FINANCE" && (
            <Link href="/finance">
              <Button size="sm" className="gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>Manage Fee Ledger</span>
              </Button>
            </Link>
          )}
          {(role === "ADMIN" || role === "PRINCIPAL") && (
            <Link href="/attendance/period-close">
              <Button size="sm" className="gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                <span>Period Close Gate</span>
              </Button>
            </Link>
          )}
          {(role === "STUDENT" || role === "PARENT") && (
            <Link href="/finance">
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="h-4 w-4" />
                <span>Pay Tuition Fee Online</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Role-Specific Metrics */}
      {role === "STUDENT" || role === "PARENT" ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">My Attendance Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">96.5%</div>
              <p className="text-[11px] text-muted-foreground">Term 1 · 172 of 178 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Outstanding Dues</CardTitle>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{formatBDT(3500)}</div>
              <p className="text-[11px] text-muted-foreground">November Tuition Fee</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Class & Roll</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Class 11</div>
              <p className="text-[11px] text-muted-foreground">Section A (Science) · Roll 101</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Exam Status</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Eligible</div>
              <p className="text-[11px] text-muted-foreground">Admit Card issued</p>
            </CardContent>
          </Card>
        </div>
      ) : role === "TEACHER" ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Assigned Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Sections</div>
              <p className="text-[11px] text-muted-foreground">Physics (Class 11 & 12)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Today's Roster Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">COMPLETED</div>
              <p className="text-[11px] text-muted-foreground">Morning shift recorded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Leave Balance</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18 Days</div>
              <p className="text-[11px] text-muted-foreground">Casual + Medical + Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Latest Notice</CardTitle>
              <Bell className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">Half-Yearly Routine</div>
              <p className="text-[11px] text-muted-foreground">Exam duty schedule live</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14,850</div>
              <p className="text-xs text-muted-foreground">Class 1 to 12 across 48 sections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">94.2%</div>
              <p className="text-xs text-muted-foreground">13,988 students present</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Collections</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBDT(4250000)}</div>
              <p className="text-xs text-muted-foreground">bKash, Nagad, Bank Cards (Aggregator)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Close Gate</CardTitle>
              <CalendarCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">LOCKED</div>
              <p className="text-xs text-muted-foreground">November 2026 payroll ready</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Attendance Roster</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mark period-level student attendance with instant parent SMS dispatch on absentee markers.
            </p>
            <Link href="/attendance" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
              <span>Open Class Roster</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Fees & Append-Only Ledger</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Double-entry student fee accounting. Process MFS payments, issue invoices, and inspect the immutable ledger.
            </p>
            <Link href="/finance" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
              <span>View Financial Ledger</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Staff Leave & Approvals</span>
              <CalendarDays className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Apply for leaves, track remaining allocations, assign teacher substitutions, and approve requests.
            </p>
            <Link href="/leave" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
              <span>Leave Management</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
