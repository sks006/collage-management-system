"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (options: { title: string; description?: string; type?: "success" | "error" | "info" }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = "success" }: { title: string; description?: string; type?: "success" | "error" | "info" }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg border bg-card text-card-foreground shadow-lg animate-in slide-in-from-bottom-5 duration-200"
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
    };
  }
  return ctx;
}
