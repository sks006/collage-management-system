"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarClock,
  GraduationCap,
  Users,
  CreditCard,
  DollarSign,
  Bell,
  BookOpen,
  LogOut,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES, type Role } from "@sms/shared";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ROLES },
  { href: "/academic", label: "Academic", icon: BookOpen, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"] },
  { href: "/students", label: "Students", icon: GraduationCap, roles: ROLES },
  { href: "/staff", label: "Staff", icon: Users, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "TEACHER"] },
  { href: "/attendance", label: "Attendance", icon: CheckSquare, roles: ROLES },
  {
    href: "/attendance/period-close",
    label: "Period Close",
    icon: CalendarClock,
    roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE"],
  },
  { href: "/leave", label: "Leave", icon: CalendarClock, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"] },
  { href: "/finance", label: "Fees & Ledger", icon: CreditCard, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "PARENT", "STUDENT"] },
  { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "TEACHER"] },
  { href: "/notices", label: "Notices", icon: Bell, roles: ROLES },
];

export function Sidebar({ userRoles = [] }: { userRoles?: string[] }) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => userRoles.includes(r)),
  );

  return (
    <aside className="w-64 border-r bg-card p-4 min-h-screen flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 py-2 font-bold text-xl tracking-tight text-primary">
          🏫 Dhaka Model College
        </div>
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-2">
        <div>Postgres Source of Truth</div>
        <div className="font-mono text-[10px] text-emerald-600">● LAN Online · Port 5432</div>
        <div className="font-mono text-[10px] text-muted-foreground">
          Roles: {userRoles.join(", ") || "none"}
        </div>
      </div>
    </aside>
  );
}
