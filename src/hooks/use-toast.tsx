"use client";

import * as React from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [, setTick] = React.useState(0);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    console.log("TOAST:", t.title || "", t.description || "");
    // minimal no-op UI toast; you can upgrade to shadcn toaster later
    setTick((x) => x + 1);
  }, []);

  return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  return {
    toast: ctx?.toast || ((t: any) => console.log("TOAST:", t)),
  };
}