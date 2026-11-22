"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/shared/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar collapsible="icon" />
      <SidebarInset className="min-w-0 w-full overflow-hidden flex flex-col h-svh max-h-svh">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/15 overflow-y-auto min-w-0 w-full">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
