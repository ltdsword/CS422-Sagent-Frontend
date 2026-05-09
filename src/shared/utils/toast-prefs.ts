import { toast } from "sonner";

export type ToastPrefs = {
  /** Controls whether in-app toaster popups are shown. */
  inApp: boolean;
};

export const TOAST_PREFS_STORAGE_KEY = "toast_prefs_v1";

export function loadToastPrefs(): ToastPrefs {
  try {
    const raw = localStorage.getItem(TOAST_PREFS_STORAGE_KEY);
    if (!raw) {
      return { inApp: true };
    }
    const parsed = JSON.parse(raw) as Partial<ToastPrefs>;
    return { inApp: Boolean(parsed.inApp ?? true) };
  } catch {
    return { inApp: true };
  }
}

export function saveToastPrefs(prefs: ToastPrefs) {
  localStorage.setItem(TOAST_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function areToastsEnabled(): boolean {
  return loadToastPrefs().inApp;
}

type ToastFn = (message: string, opts?: Record<string, unknown>) => string | number;

function wrap(fn: ToastFn): ToastFn {
  return (message, opts) => {
    if (!areToastsEnabled()) {
      return -1;
    }
    return fn(message, opts);
  };
}

export const appToast = {
  success: wrap(toast.success as unknown as ToastFn),
  error: wrap(toast.error as unknown as ToastFn),
  message: wrap(toast.message as unknown as ToastFn),
  info: wrap((toast as unknown as { info?: ToastFn }).info ?? (toast.message as unknown as ToastFn)),
  warning: wrap((toast as unknown as { warning?: ToastFn }).warning ?? (toast.message as unknown as ToastFn)),
};

