import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { glassSurface } from "./glassSurface";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalBox = styled.div`
  ${glassSurface};
  width: min(560px, 100%);
  max-height: min(85vh, 720px);
  overflow: auto;
  padding: 24px;
  display: grid;
  gap: 16px;
`;

export interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FOCUS_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export const GlassModal = ({ open, onClose, title, children }: GlassModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

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
      ).filter((element) => !element.hasAttribute("disabled"));

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
      previousFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay onMouseDown={onClose}>
      <ModalBox
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </ModalBox>
    </Overlay>
  );
};
