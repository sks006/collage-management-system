"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarClock, 
  GraduationCap, 
  Users, 
  CreditCard, 
  DollarSign, 
  Bell, 
  BookOpen 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/attendance", label: "Attendance", icon: CheckSquare },
  { href: "/attendance/period-close", label: "Period Close 🔒", icon: CalendarClock },
  { href: "/academic", label: "Academic", icon: BookOpen },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/finance", label: "Fees & Ledger", icon: CreditCard },
  { href: "/payroll", label: "Payroll", icon: DollarSign },
  { href: "/notices", label: "Notices", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-4 min-h-screen flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 py-2 font-bold text-xl tracking-tight text-primary">🏫 Dhaka Model College</div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <div>Postgres Source of Truth</div>
        <div className="mt-1 font-mono text-[10px] text-emerald-600">● LAN Online · Port 5432</div>
      </div>
    </aside>
  );
}
