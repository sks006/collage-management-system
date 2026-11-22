import * as React from "react";

export interface SlicerLayoutProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  metrics?: React.ReactNode;
  slicerControls?: React.ReactNode;
  children: React.ReactNode;
  modals?: React.ReactNode;
}

/**
 * Standard Slicer Layout component adhering to Open-Closed Principle (OCP).
 * Provides a standardized structural layout for domain slices.
 */
export function SlicerLayout({
  title,
  subtitle,
  badge,
  actions,
  metrics,
  slicerControls,
  children,
  modals,
}: SlicerLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {/* Metric Cards Row */}
      {metrics && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {metrics}
        </div>
      )}

      {/* Slicer Filter Controls */}
      {slicerControls && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {slicerControls}
        </div>
      )}

      {/* Main Content (Table / View) */}
      <div className="w-full min-w-0 overflow-hidden">{children}</div>

      {/* Modals & Dialogs */}
      {modals}
    </div>
  );
}
