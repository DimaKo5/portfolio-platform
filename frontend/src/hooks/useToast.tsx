import { useCallback, useState } from "react";

interface ToastState {
  message: string;
  kind: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const showSuccess = useCallback((message: string) => show(message, "success"), [show]);
  const showError = useCallback((message: string) => show(message, "error"), [show]);

  const node = toast ? (
    <div
      className="toast"
      style={
        toast.kind === "error"
          ? { background: "var(--color-danger)" }
          : { background: "var(--color-dark)" }
      }
      role="status"
    >
      {toast.message}
    </div>
  ) : null;

  return { showSuccess, showError, toastNode: node };
}
