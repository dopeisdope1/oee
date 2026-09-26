"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error";
}

const ToastContext = createContext<{
  show: (message: string, variant?: Toast["variant"]) => void;
} | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg",
              t.variant === "success"
                ? "border-success/30 bg-surface text-foreground"
                : "border-danger/30 bg-surface text-foreground"
            )}
          >
            {t.variant === "success" ? (
              <Check className="size-4 text-success" />
            ) : (
              <AlertCircle className="size-4 text-danger" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
