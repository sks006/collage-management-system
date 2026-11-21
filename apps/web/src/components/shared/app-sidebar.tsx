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
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { ROLES } from "@sms/shared";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ROLES, group: "Overview" },
  { href: "/academic", label: "Academic", icon: BookOpen, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"], group: "Academics" },
  { href: "/students", label: "Students", icon: GraduationCap, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER", "PARENT", "STUDENT"], group: "Academics" },
  { href: "/staff", label: "Staff", icon: Users, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "TEACHER"], group: "Academics" },
  { href: "/attendance", label: "Attendance", icon: CheckSquare, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"], group: "Operations" },
  {
    href: "/attendance/period-close",
    label: "Period Close",
    icon: CalendarClock,
    roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE"],
    group: "Operations",
  },
  { href: "/leave", label: "Leave", icon: CalendarDays, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "TEACHER"], group: "Operations" },
  { href: "/finance", label: "Fees & Ledger", icon: CreditCard, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "PARENT", "STUDENT"], group: "Finance" },
  { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["ADMIN", "PRINCIPAL", "OFFICE", "FINANCE", "TEACHER"], group: "Finance" },
  { href: "/notices", label: "Notices", icon: Bell, roles: ROLES, group: "Communication" },
];

export function AppSidebar({ userRoles }: { userRoles?: string[] }) {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const pathname = usePathname();
  const roles = userRoles && userRoles.length > 0 ? userRoles : (user?.roles || ["ADMIN"]);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  return (
    <Sidebar collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0">
                  🏫
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-sm tracking-tight text-foreground truncate">
                    Dhaka Model
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Institutional SMS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation Groups */}
      <SidebarContent>
        {groups.map((groupName) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems
                  .filter((item) => item.group === groupName)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link href={item.href} className="flex items-center gap-2.5">
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="default"
              onClick={logout}
              tooltip="Sign Out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {state === "expanded" && (
          <div className="rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
              <span>PostgreSQL 16</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-mono text-[10px] truncate text-muted-foreground">
              Role: {roles[0]}
            </div>
          </div>
        )}
      </SidebarFooter>

      {/* Resizable / Hoverable Rail */}
      <SidebarRail />
    </Sidebar>
  );
}
