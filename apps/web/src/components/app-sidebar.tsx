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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { ROLES } from "@sms/shared";

export const NAV_ITEMS = [
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

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRoles?: string[];
}

export function AppSidebar({
  userRoles,
  collapsible = "icon",
  className,
  ...props
}: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const roles = userRoles && userRoles.length > 0 ? userRoles : (user?.roles || ["ADMIN"]);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => roles.includes(r))
  );

  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible={collapsible} className={className} {...props}>
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/"
            onClick={handleLinkClick}
            title="Dhaka Model College"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:flex-none"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0 shadow-xs">
              🏫
            </div>
            <div className="flex flex-col gap-0.5 leading-none min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sm tracking-tight text-foreground truncate">
                Dhaka Model
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                Institutional SMS
              </span>
            </div>
          </Link>

          {/* In-sidebar toggle/collapse button */}
          <button
            type="button"
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
          >
            <PanelLeftClose className="h-4 w-4" />
            <span className="sr-only">Collapse Sidebar</span>
          </button>
        </div>
      </SidebarHeader>

      {/* Navigation Groups */}
      <SidebarContent className="group-data-[collapsible=icon]:p-1">
        {groups.map((groupName) => (
          <SidebarGroup key={groupName} className="group-data-[collapsible=icon]:p-0">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 group-data-[collapsible=icon]:hidden">
              {groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                {visibleItems
                  .filter((item) => item.group === groupName)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <SidebarMenuItem
                        key={item.href}
                        className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link
                            href={item.href}
                            onClick={handleLinkClick}
                            title={item.label}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!gap-0"
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {item.label}
                            </span>
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
      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="default"
              onClick={logout}
              tooltip="Sign Out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground space-y-1 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
            <span>PostgreSQL 16</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-mono text-[10px] truncate text-muted-foreground">
            Role: {roles[0]}
          </div>
        </div>
      </SidebarFooter>

      {/* Resizable / Hoverable Rail */}
      <SidebarRail />
    </Sidebar>
  );
}
