"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { CloseIcon } from "@/components/dsvh/icons";
import { statusStyles, defaultLoud, type Status } from "@/components/dsvh/status";

export type ToastTone = Status;

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  duration?: number; // mặc định 4000ms
  onClose?: () => void;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.onClose) target.onClose();
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const toast = useCallback((opts: ToastOptions) => {
    const id = opts.id || Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = {
      ...opts,
      id,
      duration: opts.duration ?? 4000,
      tone: opts.tone || "info",
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Container Toast - Góc phải trên */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <SingleToast key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function SingleToast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const { title, description, tone = "info", duration = 4000 } = item;
  // Same tone treatment as Alert (single source): soft for info/success/warning,
  // loud/solid for error. Keeps Toast and Alert visually in sync.
  const s = statusStyles[tone] ?? statusStyles.info;
  const loud = defaultLoud[tone];
  const container = loud ? s.loudContainer : s.softContainer;
  const iconColor = loud ? s.loudIcon : s.icon;
  const titleColor = loud ? s.loudTitle : s.softTitle;
  const bodyColor = loud ? s.loudBody : s.softBody;
  const { Icon } = s;

  useEffect(() => {
    if (duration <= 0 || duration === Infinity) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="pointer-events-auto overflow-hidden rounded-xl bg-surface shadow-xl">
    <div
      className={`flex w-full items-start gap-3 rounded-xl border p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${container}`}
      role="status"
    >
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <Icon size={20} />
      </div>

      <div className="flex-1 text-body">
        {title && <h5 className={`font-semibold leading-5 ${titleColor}`}>{title}</h5>}
        {description && (
          <p className={`${title ? "mt-0.5" : ""} leading-relaxed ${bodyColor}`}>
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className={`shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:bg-black/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30 ${iconColor}`}
        aria-label="Dismiss notification"
      >
        <CloseIcon size={16} />
      </button>
    </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
