import {
  GlobalStyles
} from "../chunk-UXCNCCQH.mjs";
import {
  darkTheme,
  lightTheme
} from "../chunk-46UTUTCF.mjs";

// src/components/GlassCard.tsx
import React from "react";
import styled, { css as css2 } from "styled-components";
import { motion } from "framer-motion";

// src/components/glassSurface.ts
import { css } from "styled-components";
var glassSurface = css`
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  border-radius: var(--glass-radius);
  will-change: transform;

  @supports not (backdrop-filter: blur(1px)) {
    background: ${({ theme }) => theme.colors.bg};
    opacity: 0.97;
  }
`;

// src/hooks/usePrefersReducedMotion.ts
import { useEffect, useState } from "react";
var QUERY = "(prefers-reduced-motion: reduce)";
function getInitialValue() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  const mediaQuery = window.matchMedia(QUERY);
  if (!mediaQuery || typeof mediaQuery.matches !== "boolean") {
    return false;
  }
  return mediaQuery.matches;
}
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialValue);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mediaQuery = window.matchMedia(QUERY);
    if (!mediaQuery || typeof mediaQuery.matches !== "boolean") {
      return;
    }
    const onChange = (event) => setPrefersReducedMotion(event.matches);
    setPrefersReducedMotion(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }
    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);
  return prefersReducedMotion;
}

// src/components/GlassCard.tsx
import { jsx } from "react/jsx-runtime";
var sizeStyles = {
  sm: css2`padding: 16px; gap: 12px; width: min(100%, 360px);`,
  md: css2`padding: 24px; gap: 16px; width: min(100%, 560px);`,
  lg: css2`padding: 32px; gap: 20px; width: min(100%, 760px);`
};
var CardRoot = styled(motion.section)`
  ${glassSurface};
  ${({ $size }) => sizeStyles[$size]};
  display: grid;
  contain: layout style;
`;
var GlassCard = React.memo(function GlassCard2({ size = "md", children, ...rest }) {
  const prefersReduced = usePrefersReducedMotion();
  return /* @__PURE__ */ jsx(
    CardRoot,
    {
      $size: size,
      whileHover: prefersReduced ? void 0 : { y: -4, transition: { duration: 0.2 } },
      ...rest,
      children
    }
  );
});

// src/components/GlassHeader.tsx
import React2 from "react";
import styled2 from "styled-components";
import { motion as motion2, useScroll, useMotionValue } from "framer-motion";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var HeaderRoot = styled2(motion2.header)`
  position: sticky;
  top: 0;
  z-index: 10;
  ${glassSurface};
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
`;
var HeaderInner = styled2.div`
  margin: 0 auto;
  width: min(1080px, 100% - 32px);
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;
var Title = styled2.h1`
  margin: 0;
  font-size: clamp(1rem, 1.2vw + 0.8rem, 1.25rem);
`;
var Actions = styled2.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;
function GlassHeaderInner({ title, actions }) {
  const prefersReduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useMotionValue(1);
  React2.useEffect(() => {
    if (prefersReduced) return;
    return scrollY.on("change", (y) => {
      opacity.set(Math.max(0.7, 1 - y / 400));
    });
  }, [scrollY, opacity, prefersReduced]);
  return /* @__PURE__ */ jsx2(HeaderRoot, { style: { opacity: prefersReduced ? 1 : opacity }, children: /* @__PURE__ */ jsxs(HeaderInner, { children: [
    /* @__PURE__ */ jsx2(Title, { children: title }),
    /* @__PURE__ */ jsx2(Actions, { "aria-label": "Header actions", children: actions })
  ] }) });
}
var GlassHeader = React2.memo(GlassHeaderInner);

// src/components/GlassModal.tsx
import { useEffect as useEffect2, useRef, useState as useState2 } from "react";
import styled3 from "styled-components";
import { motion as motion3, AnimatePresence } from "framer-motion";
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var OverlayBase = styled3(motion3.div)`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: var(--glass-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
var ModalBoxBase = styled3(motion3.div)`
  ${glassSurface};
  width: min(560px, 100%);
  max-height: min(85vh, 720px);
  overflow: auto;
  padding: 24px;
  display: grid;
  gap: 16px;
`;
var Announcement = styled3.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
var FOCUS_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
var GlassModal = ({ open, onClose, title, children, announcement }) => {
  const modalRef = useRef(null);
  const [liveMessage, setLiveMessage] = useState2("");
  const prefersReduced = usePrefersReducedMotion();
  useEffect2(() => {
    if (!open) return;
    const root = document.getElementById("root");
    if (root) root.setAttribute("aria-hidden", "true");
    if (announcement) setLiveMessage(announcement);
    const previousFocused = document.activeElement;
    const container = modalRef.current;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll(FOCUS_SELECTOR)
    );
    (focusables[0] ?? container).focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const currentFocusable = Array.from(
        container.querySelectorAll(FOCUS_SELECTOR)
      ).filter(
        (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-disabled") !== "true"
      );
      if (currentFocusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const active = document.activeElement;
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
  const overlayVariants = prefersReduced ? void 0 : { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const modalVariants = prefersReduced ? void 0 : { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.92 } };
  return /* @__PURE__ */ jsxs2(Fragment, { children: [
    /* @__PURE__ */ jsx3(Announcement, { "aria-live": "polite", "aria-atomic": "true", children: liveMessage }),
    /* @__PURE__ */ jsx3(AnimatePresence, { children: open && /* @__PURE__ */ jsx3(
      OverlayBase,
      {
        variants: overlayVariants,
        initial: prefersReduced ? void 0 : "hidden",
        animate: prefersReduced ? void 0 : "visible",
        exit: prefersReduced ? void 0 : "exit",
        transition: { duration: 0.2 },
        onClick: onClose,
        children: /* @__PURE__ */ jsx3(
          ModalBoxBase,
          {
            ref: modalRef,
            role: "dialog",
            "aria-modal": "true",
            "aria-label": title,
            tabIndex: -1,
            variants: modalVariants,
            initial: prefersReduced ? void 0 : "hidden",
            animate: prefersReduced ? void 0 : "visible",
            exit: prefersReduced ? void 0 : "exit",
            transition: { duration: 0.2 },
            onClick: (event) => event.stopPropagation(),
            children
          }
        )
      },
      "modal-overlay"
    ) })
  ] });
};

// src/components/GlassButton.tsx
import React4 from "react";
import styled4, { css as css3 } from "styled-components";
import { motion as motion4 } from "framer-motion";
import { jsx as jsx4 } from "react/jsx-runtime";
var sizeStyles2 = {
  sm: css3`padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;`,
  md: css3`padding: 10px 16px; font-size: 0.9rem; border-radius: 12px;`,
  lg: css3`padding: 14px 24px; font-size: 1rem; border-radius: 14px;`
};
var variantStyles = {
  primary: css3`
    background: var(--glass-accent);
    color: #ffffff;
    border: 1px solid transparent;
  `,
  ghost: css3`
    background: transparent;
    color: var(--glass-text);
    border: 1px solid var(--glass-border);
  `,
  danger: css3`
    background: #e05260;
    color: #ffffff;
    border: 1px solid transparent;
  `
};
var ButtonRoot = styled4(motion4.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;

  ${({ $variant }) => variantStyles[$variant]};
  ${({ $size }) => sizeStyles2[$size]};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
var GlassButton = React4.memo(function GlassButton2({
  variant = "primary",
  size = "md",
  children,
  ...rest
}) {
  const prefersReduced = usePrefersReducedMotion();
  return /* @__PURE__ */ jsx4(
    ButtonRoot,
    {
      $variant: variant,
      $size: size,
      whileHover: prefersReduced ? void 0 : { scale: 1.03 },
      whileTap: prefersReduced ? void 0 : { scale: 0.97 },
      transition: prefersReduced ? void 0 : { duration: 0.15 },
      ...rest,
      children
    }
  );
});

// src/components/GlassToast.tsx
import { useEffect as useEffect3, useState as useState3 } from "react";
import styled5, { css as css4 } from "styled-components";
import { motion as motion5, AnimatePresence as AnimatePresence2 } from "framer-motion";
import { jsx as jsx5 } from "react/jsx-runtime";
var typeStyles = {
  info: css4`background: rgba(91, 140, 255, 0.25); border-color: rgba(91, 140, 255, 0.4);`,
  success: css4`background: rgba(34, 197, 94, 0.25); border-color: rgba(34, 197, 94, 0.4);`,
  warning: css4`background: rgba(251, 191, 36, 0.25); border-color: rgba(251, 191, 36, 0.4);`,
  error: css4`background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.4);`
};
var ToastRoot = styled5(motion5.div)`
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

  @supports not (backdrop-filter: blur(1px)) {
    background: ${({ theme }) => theme.colors.bg};
    opacity: 0.98;
  }
`;
var GlassToast = ({ message, type = "info", duration = 4e3, onDismiss }) => {
  const [visible, setVisible] = useState3(true);
  const prefersReduced = usePrefersReducedMotion();
  useEffect3(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);
  return /* @__PURE__ */ jsx5("div", { "aria-live": "assertive", "aria-atomic": "true", children: /* @__PURE__ */ jsx5(AnimatePresence2, { children: visible && /* @__PURE__ */ jsx5(
    ToastRoot,
    {
      $type: type,
      role: "status",
      initial: prefersReduced ? void 0 : { opacity: 0, y: 24 },
      animate: prefersReduced ? void 0 : { opacity: 1, y: 0 },
      exit: prefersReduced ? void 0 : { opacity: 0, y: 24 },
      transition: prefersReduced ? void 0 : { duration: 0.25 },
      children: message
    }
  ) }) });
};

// src/components/GlassTooltip.tsx
import React6, { useId, useState as useState4 } from "react";
import styled6 from "styled-components";
import { motion as motion6, AnimatePresence as AnimatePresence3 } from "framer-motion";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var Wrapper = styled6.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;
var TooltipBox = styled6(motion6.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  font-size: 0.78rem;
  color: var(--glass-text);
  pointer-events: none;
  z-index: 50;

  @supports not (backdrop-filter: blur(1px)) {
    background: ${({ theme }) => theme.colors.bg};
    opacity: 0.98;
  }
`;
var GlassTooltip = ({ label, children }) => {
  const id = useId();
  const [show, setShow] = useState4(false);
  const prefersReduced = usePrefersReducedMotion();
  const childProps = {
    "aria-describedby": show ? id : void 0,
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  };
  return /* @__PURE__ */ jsxs3(Wrapper, { children: [
    React6.cloneElement(children, childProps),
    /* @__PURE__ */ jsx6(AnimatePresence3, { children: show && /* @__PURE__ */ jsx6(
      TooltipBox,
      {
        id,
        role: "tooltip",
        initial: prefersReduced ? void 0 : { opacity: 0, y: -4 },
        animate: prefersReduced ? void 0 : { opacity: 1, y: 0 },
        exit: prefersReduced ? void 0 : { opacity: 0, y: -4 },
        transition: prefersReduced ? void 0 : { duration: 0.15 },
        children: label
      }
    ) })
  ] });
};

// src/components/GlassBadge.tsx
import React7 from "react";
import styled7, { css as css5 } from "styled-components";
import { jsx as jsx7 } from "react/jsx-runtime";
var variantStyles2 = {
  default: css5`background: var(--glass-surface); border-color: var(--glass-border); color: var(--glass-text);`,
  success: css5`background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.4); color: #16a34a;`,
  warning: css5`background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.4); color: #ca8a04;`,
  danger: css5`background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #dc2626;`
};
var BadgeRoot = styled7.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  border: 1px solid;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.6;
  ${({ $variant }) => variantStyles2[$variant]};
`;
var GlassBadge = React7.memo(function GlassBadge2({
  variant = "default",
  children,
  ...rest
}) {
  return /* @__PURE__ */ jsx7(BadgeRoot, { $variant: variant, ...rest, children });
});
export {
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassHeader,
  GlassModal,
  GlassToast,
  GlassTooltip,
  GlobalStyles,
  darkTheme,
  glassSurface,
  lightTheme
};
