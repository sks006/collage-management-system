"use client";

import * as React from "react";
import { useAuth, DEMO_PERSONAS } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Bell, LogOut, User, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, logout, switchPersona } = useAuth();
  const { toast } = useToast();
  const [showPersonaMenu, setShowPersonaMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: "1", title: "Monthly Attendance Closed", desc: "November 2026 period close approved.", time: "10m ago" },
    { id: "2", title: "New Fee Payment Verified", desc: "৳ 3,500 credited via bKash IPN webhook.", time: "25m ago" },
    { id: "3", title: "Half-Yearly Routine Published", desc: "Exam schedule live for Class 11 & 12.", time: "2h ago" },
  ];

  const handleRoleSelect = (roleKey: string) => {
    switchPersona(roleKey);
    setShowPersonaMenu(false);
    toast({
      title: `Switched Persona: ${roleKey}`,
      description: `Active role changed to ${roleKey}. Navigation and permissions updated.`,
      type: "info",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed Out",
      description: "You have been logged out of the session.",
      type: "info",
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card px-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <span className="font-bold text-lg text-primary tracking-tight">Dhaka Model College</span>
        <Badge variant="outline" className="hidden sm:inline-flex text-[11px] bg-muted/50 font-mono">
          PostgreSQL Single Source of Truth
        </Badge>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dynamic Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-muted/60 hover:bg-muted transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Role: <strong className="text-foreground">{user?.roles[0] || "USER"}</strong></span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-card p-2 shadow-xl z-50 text-card-foreground text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 font-bold text-muted-foreground uppercase text-[10px] tracking-wider border-b mb-1">
                Switch Active Persona
              </div>
              {Object.entries(DEMO_PERSONAS).map(([key, p]) => {
                const isActive = user?.email === p.email;
                return (
                  <button
                    key={key}
                    onClick={() => handleRoleSelect(key)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-muted text-left transition-colors ${
                      isActive ? "bg-primary/10 text-primary font-semibold" : ""
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{key} · {p.email}</div>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card p-3 shadow-xl z-50 text-card-foreground text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b font-semibold">
                <span>Recent Notifications</span>
                <span className="text-[10px] text-primary">Mark all as read</span>
              </div>
              <div className="divide-y max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 space-y-0.5">
                    <div className="font-medium text-xs text-foreground">{n.title}</div>
                    <div className="text-[11px] text-muted-foreground">{n.desc}</div>
                    <div className="text-[9px] text-muted-foreground pt-0.5">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-3 border-l pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-foreground leading-tight">{user?.name || "Dr. Rafiqul Islam"}</div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center space-x-1 p-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
