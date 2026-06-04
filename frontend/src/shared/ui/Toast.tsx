import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import styles from "./Toast.module.css";

/* -------- Types -------- */
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = manual dismiss
}

type AddToastFn = (t: Omit<ToastItem, "id">) => void;

/* -------- Context -------- */
const ToastContext = createContext<AddToastFn>(() => {});

export function useToast(): AddToastFn {
  return useContext(ToastContext);
}

/* -------- Single Toast -------- */
const TYPE_ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "i",
  warning: "!",
};

function ToastCard({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const dur = item.duration ?? 4000;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(item.id), 260);
  }, [item.id, onRemove]);

  useEffect(() => {
    if (dur <= 0) return;
    const t = setTimeout(dismiss, dur);
    return () => clearTimeout(t);
  }, [dur, dismiss]);

  const typeCls = {
    success: styles.toastSuccess,
    error: styles.toastError,
    info: styles.toastInfo,
    warning: styles.toastWarning,
  }[item.type];

  const iconCls = {
    success: styles.iconSuccess,
    error: styles.iconError,
    info: styles.iconInfo,
    warning: styles.iconWarning,
  }[item.type];

  const progressCls = {
    success: styles.progressSuccess,
    error: styles.progressError,
    info: styles.progressInfo,
    warning: styles.progressWarning,
  }[item.type];

  return (
    <div
      className={`${styles.toast} ${typeCls} ${exiting ? styles.toastExiting : ""}`}
      role="alert"
      aria-live="polite"
    >
      <span className={`${styles.icon} ${iconCls}`} aria-hidden>
        {TYPE_ICONS[item.type]}
      </span>
      <div className={styles.content}>
        {item.title && <div className={styles.title}>{item.title}</div>}
        <div className={styles.message}>{item.message}</div>
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={dismiss}
        aria-label="Đóng"
      >
        ✕
      </button>
      {dur > 0 && (
        <div
          className={`${styles.progress} ${progressCls}`}
          style={{ animationDuration: `${dur}ms` }}
        />
      )}
    </div>
  );
}

/* -------- Provider -------- */
let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const add: AddToastFn = useCallback((t) => {
    const id = `toast-${++counter}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { ...t, id }]); // max 5 visible
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={add}>
      {children}
      {createPortal(
        <div className={styles.toastContainer} aria-label="Thông báo">
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onRemove={remove} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
