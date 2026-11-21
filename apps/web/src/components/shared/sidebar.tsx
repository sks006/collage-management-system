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
  BookOpen,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { ROLES } from "@sms/shared";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ROLES },
  { href: "/academic", label: "Academic", icon: BookOpen, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"] },
  { href: "/students", label: "Students", icon: GraduationCap, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER", "PARENT", "STUDENT"] },
  { href: "/staff", label: "Staff", icon: Users, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "TEACHER"] },
  { href: "/attendance", label: "Attendance", icon: CheckSquare, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"] },
  {
    href: "/attendance/period-close",
    label: "Period Close",
    icon: CalendarClock,
    roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE"],
  },
  { href: "/leave", label: "Leave", icon: CalendarDays, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"] },
  { href: "/finance", label: "Fees & Ledger", icon: CreditCard, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "PARENT", "STUDENT"] },
  { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "TEACHER"] },
  { href: "/notices", label: "Notices", icon: Bell, roles: ROLES },
];

export function Sidebar({ userRoles }: { userRoles?: string[] }) {
  const { user, logout } = useAuth();
  const roles = userRoles && userRoles.length > 0 ? userRoles : (user?.roles || ["ADMIN"]);
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => roles.includes(r)),
  );

  return (
    <aside className="w-64 border-r bg-card p-4 min-h-screen flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        <Link href="/" className="px-3 py-2 font-bold text-xl tracking-tight text-primary block">
          🏫 Dhaka Model College
        </Link>
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-2">
          <div className="font-semibold text-foreground">Postgres Source of Truth</div>
          <div className="font-mono text-[10px] text-emerald-600 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Online · Port 5432</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground truncate">
            Active: {roles.join(", ")}
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
