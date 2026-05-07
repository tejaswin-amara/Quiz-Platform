import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { glassSurface } from "./glassSurface";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const OverlayBase = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: var(--glass-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalBoxBase = styled(motion.div)`
  ${glassSurface};
  width: min(560px, 100%);
  max-height: min(85vh, 720px);
  overflow: auto;
  padding: 24px;
  display: grid;
  gap: 16px;
`;

const Announcement = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  announcement?: string;
}

const FOCUS_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export const GlassModal = ({ open, onClose, title, children, announcement }: GlassModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;

    const root = document.getElementById("root");
    if (root) root.setAttribute("aria-hidden", "true");

    if (announcement) setLiveMessage(announcement);

    const previousFocused = document.activeElement as HTMLElement | null;
    const container = modalRef.current;
    if (!container) return;

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUS_SELECTOR)
    );
    (focusables[0] ?? container).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const currentFocusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUS_SELECTOR)
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-disabled") !== "true"
      );

      if (currentFocusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (root) root.removeAttribute("aria-hidden");
      previousFocused?.focus();
    };
  }, [open, onClose, announcement]);

  const overlayVariants = prefersReduced
    ? undefined
    : { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  const modalVariants = prefersReduced
    ? undefined
    : { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.92 } };

  return (
    <>
      <Announcement aria-live="polite" aria-atomic="true">{liveMessage}</Announcement>
      <AnimatePresence>
        {open && (
          <OverlayBase
            key="modal-overlay"
            variants={overlayVariants}
            initial={prefersReduced ? undefined : "hidden"}
            animate={prefersReduced ? undefined : "visible"}
            exit={prefersReduced ? undefined : "exit"}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            <ModalBoxBase
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              variants={modalVariants}
              initial={prefersReduced ? undefined : "hidden"}
              animate={prefersReduced ? undefined : "visible"}
              exit={prefersReduced ? undefined : "exit"}
              transition={{ duration: 0.2 }}
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
              {children}
            </ModalBoxBase>
          </OverlayBase>
        )}
      </AnimatePresence>
    </>
  );
};
