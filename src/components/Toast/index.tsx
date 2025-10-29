import React, { useEffect, useState } from "react";

export type ToastVariant = "info" | "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  info: "bg-ctp-mauve-700 text-ctp-mauve-50",
  success: "bg-ctp-green-700 text-ctp-green-50",
  error: "bg-ctp-red-700 text-ctp-red-50",
};

const Toast: React.FC<ToastProps> = ({
  message,
  variant = "info",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  // animation length must be shorter than duration; this controls fade-out timing
  const ANIM_MS = 200;

  useEffect(() => {
    // enter
    setVisible(true);

    // start exit after duration
    const hideTimer = window.setTimeout(() => setVisible(false), duration);
    // call onClose after duration + animation time
    const closeTimer = window.setTimeout(() => onClose?.(), duration + ANIM_MS);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-xl h-fit shadow-md px-4 py-2 ${VARIANT_CLASSES[variant]} transition duration-200 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="text-sm text-wrap">{message}</div>
    </div>
  );
};

export default Toast;
