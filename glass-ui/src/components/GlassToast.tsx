import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "info" | "success" | "warning" | "error";

const typeStyles: Record<ToastType, ReturnType<typeof css>> = {
  info: css`background: rgba(91, 140, 255, 0.25); border-color: rgba(91, 140, 255, 0.4);`,
  success: css`background: rgba(34, 197, 94, 0.25); border-color: rgba(34, 197, 94, 0.4);`,
  warning: css`background: rgba(251, 191, 36, 0.25); border-color: rgba(251, 191, 36, 0.4);`,
  error: css`background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.4);`,
};

const ToastRoot = styled(motion.div)<{ $type: ToastType }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  padding: 14px 20px;
  border-radius: var(--glass-radius);
  border: 1px solid;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  color: var(--glass-text);
  font-size: 0.9rem;
  max-width: 360px;
  ${({ $type }) => typeStyles[$type]};
`;

export interface GlassToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

export const GlassToast = ({ message, type = "info", duration = 4000, onDismiss }: GlassToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div aria-live="assertive" aria-atomic="true">
      <AnimatePresence>
        {visible && (
          <ToastRoot
            $type={type}
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
          >
            {message}
          </ToastRoot>
        )}
      </AnimatePresence>
    </div>
  );
};
