import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";
type ToastItem = {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
};

type ToastContextValue = {
  notify: (opts: {
    message: string;
    title?: string;
    type?: ToastType;
    duration?: number;
  }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((items) => items.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({
      message,
      title,
      type = "info",
      duration = 2600,
    }: {
      message: string;
      title?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = Date.now() + Math.random();
      setToasts((items) => [
        ...items,
        { id, type, title, message, duration } as ToastItem,
      ]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const api = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (message, title) => notify({ message, title, type: "success" }),
      error: (message, title) => notify({ message, title, type: "error" }),
      info: (message, title) => notify({ message, title, type: "info" }),
    }),
    [notify]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type}`}
            role="status"
            aria-live="polite"
          >
            {t.title && <div className="toast-title">{t.title}</div>}
            <div className="toast-message">{t.message}</div>
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
