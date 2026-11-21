"use client";

import * as React from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/lib/sidebar-context";
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
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const roles = userRoles && userRoles.length > 0 ? userRoles : (user?.roles || ["ADMIN"]);
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => roles.includes(r)),
  );

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        {/* Header with Title and Toggle Button */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b pb-3">
          <Link
            href="/"
            onClick={closeMobile}
            className={cn(
              "flex items-center gap-2 font-bold text-base tracking-tight text-primary rounded-lg transition-colors overflow-hidden",
              isCollapsed ? "justify-center w-full px-0" : "px-1"
            )}
            title="Dhaka Model College"
          >
            <span className="text-xl shrink-0">🏫</span>
            {!isCollapsed && <span className="truncate">Dhaka Model</span>}
          </Link>

          {/* Toggle button on desktop */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            className={cn(
              "hidden md:inline-flex p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0",
              isCollapsed && "mx-auto mt-2"
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={item.label}
                className={cn(
                  "flex items-center rounded-lg text-xs font-medium transition-colors",
                  isCollapsed
                    ? "justify-center p-2.5"
                    : "gap-2.5 px-3 py-2",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Scope */}
      <div className="space-y-2 pt-3 border-t">
        {!isCollapsed && (
          <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground text-[11px] truncate">PostgreSQL Single Truth</div>
            <div className="font-mono text-[10px] text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Port 5432 · Online</span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground truncate">
              {roles[0]}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          className={cn(
            "w-full flex items-center rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors",
            isCollapsed ? "justify-center p-2.5" : "gap-2 px-3 py-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex border-r bg-card p-3 min-h-screen flex-col shrink-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card p-4 shadow-2xl animate-in slide-in-from-left duration-200 border-r">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
