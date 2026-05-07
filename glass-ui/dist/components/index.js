"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/index.ts
var components_exports = {};
__export(components_exports, {
  GlassBadge: () => GlassBadge,
  GlassButton: () => GlassButton,
  GlassCard: () => GlassCard,
  GlassHeader: () => GlassHeader,
  GlassModal: () => GlassModal,
  GlassToast: () => GlassToast,
  GlassTooltip: () => GlassTooltip,
  GlobalStyles: () => GlobalStyles,
  darkTheme: () => darkTheme,
  glassSurface: () => glassSurface,
  lightTheme: () => lightTheme
});
module.exports = __toCommonJS(components_exports);

// src/components/GlassCard.tsx
var import_react2 = __toESM(require("react"));
var import_styled_components2 = __toESM(require("styled-components"));
var import_framer_motion = require("framer-motion");

// src/components/glassSurface.ts
var import_styled_components = require("styled-components");
var glassSurface = import_styled_components.css`
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
var import_react = require("react");
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
  const [prefersReducedMotion, setPrefersReducedMotion] = (0, import_react.useState)(getInitialValue);
  (0, import_react.useEffect)(() => {
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
var import_jsx_runtime = require("react/jsx-runtime");
var sizeStyles = {
  sm: import_styled_components2.css`padding: 16px; gap: 12px; width: min(100%, 360px);`,
  md: import_styled_components2.css`padding: 24px; gap: 16px; width: min(100%, 560px);`,
  lg: import_styled_components2.css`padding: 32px; gap: 20px; width: min(100%, 760px);`
};
var CardRoot = (0, import_styled_components2.default)(import_framer_motion.motion.section)`
  ${glassSurface};
  ${({ $size }) => sizeStyles[$size]};
  display: grid;
  contain: layout style;
`;
var GlassCard = import_react2.default.memo(function GlassCard2({ size = "md", children, ...rest }) {
  const prefersReduced = usePrefersReducedMotion();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var import_react3 = __toESM(require("react"));
var import_styled_components3 = __toESM(require("styled-components"));
var import_framer_motion2 = require("framer-motion");
var import_jsx_runtime2 = require("react/jsx-runtime");
var HeaderRoot = (0, import_styled_components3.default)(import_framer_motion2.motion.header)`
  position: sticky;
  top: 0;
  z-index: 10;
  ${glassSurface};
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
`;
var HeaderInner = import_styled_components3.default.div`
  margin: 0 auto;
  width: min(1080px, 100% - 32px);
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;
var Title = import_styled_components3.default.h1`
  margin: 0;
  font-size: clamp(1rem, 1.2vw + 0.8rem, 1.25rem);
`;
var Actions = import_styled_components3.default.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;
function GlassHeaderInner({ title, actions }) {
  const prefersReduced = usePrefersReducedMotion();
  const { scrollY } = (0, import_framer_motion2.useScroll)();
  const opacity = (0, import_framer_motion2.useMotionValue)(1);
  import_react3.default.useEffect(() => {
    if (prefersReduced) return;
    return scrollY.on("change", (y) => {
      opacity.set(Math.max(0.7, 1 - y / 400));
    });
  }, [scrollY, opacity, prefersReduced]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(HeaderRoot, { style: { opacity: prefersReduced ? 1 : opacity }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(HeaderInner, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Title, { children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Actions, { "aria-label": "Header actions", children: actions })
  ] }) });
}
var GlassHeader = import_react3.default.memo(GlassHeaderInner);

// src/components/GlassModal.tsx
var import_react4 = require("react");
var import_styled_components4 = __toESM(require("styled-components"));
var import_framer_motion3 = require("framer-motion");
var import_jsx_runtime3 = require("react/jsx-runtime");
var OverlayBase = (0, import_styled_components4.default)(import_framer_motion3.motion.div)`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: var(--glass-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
var ModalBoxBase = (0, import_styled_components4.default)(import_framer_motion3.motion.div)`
  ${glassSurface};
  width: min(560px, 100%);
  max-height: min(85vh, 720px);
  overflow: auto;
  padding: 24px;
  display: grid;
  gap: 16px;
`;
var Announcement = import_styled_components4.default.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
var FOCUS_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
var GlassModal = ({ open, onClose, title, children, announcement }) => {
  const modalRef = (0, import_react4.useRef)(null);
  const [liveMessage, setLiveMessage] = (0, import_react4.useState)("");
  const prefersReduced = usePrefersReducedMotion();
  (0, import_react4.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Announcement, { "aria-live": "polite", "aria-atomic": "true", children: liveMessage }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_framer_motion3.AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      OverlayBase,
      {
        variants: overlayVariants,
        initial: prefersReduced ? void 0 : "hidden",
        animate: prefersReduced ? void 0 : "visible",
        exit: prefersReduced ? void 0 : "exit",
        transition: { duration: 0.2 },
        onClick: onClose,
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
var import_react5 = __toESM(require("react"));
var import_styled_components5 = __toESM(require("styled-components"));
var import_framer_motion4 = require("framer-motion");
var import_jsx_runtime4 = require("react/jsx-runtime");
var sizeStyles2 = {
  sm: import_styled_components5.css`padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;`,
  md: import_styled_components5.css`padding: 10px 16px; font-size: 0.9rem; border-radius: 12px;`,
  lg: import_styled_components5.css`padding: 14px 24px; font-size: 1rem; border-radius: 14px;`
};
var variantStyles = {
  primary: import_styled_components5.css`
    background: var(--glass-accent);
    color: #ffffff;
    border: 1px solid transparent;
  `,
  ghost: import_styled_components5.css`
    background: transparent;
    color: var(--glass-text);
    border: 1px solid var(--glass-border);
  `,
  danger: import_styled_components5.css`
    background: #e05260;
    color: #ffffff;
    border: 1px solid transparent;
  `
};
var ButtonRoot = (0, import_styled_components5.default)(import_framer_motion4.motion.button)`
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
var GlassButton = import_react5.default.memo(function GlassButton2({
  variant = "primary",
  size = "md",
  children,
  ...rest
}) {
  const prefersReduced = usePrefersReducedMotion();
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
var import_react6 = require("react");
var import_styled_components6 = __toESM(require("styled-components"));
var import_framer_motion5 = require("framer-motion");
var import_jsx_runtime5 = require("react/jsx-runtime");
var typeStyles = {
  info: import_styled_components6.css`background: rgba(91, 140, 255, 0.25); border-color: rgba(91, 140, 255, 0.4);`,
  success: import_styled_components6.css`background: rgba(34, 197, 94, 0.25); border-color: rgba(34, 197, 94, 0.4);`,
  warning: import_styled_components6.css`background: rgba(251, 191, 36, 0.25); border-color: rgba(251, 191, 36, 0.4);`,
  error: import_styled_components6.css`background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.4);`
};
var ToastRoot = (0, import_styled_components6.default)(import_framer_motion5.motion.div)`
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
  const [visible, setVisible] = (0, import_react6.useState)(true);
  const prefersReduced = usePrefersReducedMotion();
  (0, import_react6.useEffect)(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { "aria-live": "assertive", "aria-atomic": "true", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_framer_motion5.AnimatePresence, { children: visible && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_react7 = __toESM(require("react"));
var import_styled_components7 = __toESM(require("styled-components"));
var import_framer_motion6 = require("framer-motion");
var import_jsx_runtime6 = require("react/jsx-runtime");
var Wrapper = import_styled_components7.default.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;
var TooltipBox = (0, import_styled_components7.default)(import_framer_motion6.motion.div)`
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
  const id = (0, import_react7.useId)();
  const [show, setShow] = (0, import_react7.useState)(false);
  const prefersReduced = usePrefersReducedMotion();
  const childProps = {
    "aria-describedby": show ? id : void 0,
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Wrapper, { children: [
    import_react7.default.cloneElement(children, childProps),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_framer_motion6.AnimatePresence, { children: show && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
var import_react8 = __toESM(require("react"));
var import_styled_components8 = __toESM(require("styled-components"));
var import_jsx_runtime7 = require("react/jsx-runtime");
var variantStyles2 = {
  default: import_styled_components8.css`background: var(--glass-surface); border-color: var(--glass-border); color: var(--glass-text);`,
  success: import_styled_components8.css`background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.4); color: #16a34a;`,
  warning: import_styled_components8.css`background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.4); color: #ca8a04;`,
  danger: import_styled_components8.css`background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #dc2626;`
};
var BadgeRoot = import_styled_components8.default.span`
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
var GlassBadge = import_react8.default.memo(function GlassBadge2({
  variant = "default",
  children,
  ...rest
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(BadgeRoot, { $variant: variant, ...rest, children });
});

// src/theme.ts
var lightTheme = {
  colors: {
    bg: "#f4f6f8",
    glass: "rgba(255,255,255,0.25)",
    border: "rgba(255,255,255,0.4)",
    text: "#1a1a1a",
    accent: "#5b8cff",
    overlay: "rgba(9, 14, 30, 0.45)"
  },
  blur: "12px",
  radius: "16px",
  shadow: "0 8px 32px rgba(0,0,0,0.15)"
};
var darkTheme = {
  colors: {
    bg: "#0f1115",
    glass: "rgba(20,20,20,0.35)",
    border: "rgba(255,255,255,0.1)",
    text: "#ffffff",
    accent: "#7aa2ff",
    overlay: "rgba(2, 4, 10, 0.6)"
  },
  blur: "12px",
  radius: "16px",
  shadow: "0 8px 32px rgba(0,0,0,0.4)"
};

// src/globalStyles.ts
var import_styled_components9 = require("styled-components");
var GlobalStyles = import_styled_components9.createGlobalStyle`
  :root {
    --glass-bg: ${({ theme }) => theme.colors.bg};
    --glass-surface: ${({ theme }) => theme.colors.glass};
    --glass-border: ${({ theme }) => theme.colors.border};
    --glass-text: ${({ theme }) => theme.colors.text};
    --glass-accent: ${({ theme }) => theme.colors.accent};
    --glass-overlay: ${({ theme }) => theme.colors.overlay};
    --glass-blur: ${({ theme }) => theme.blur};
    --glass-radius: ${({ theme }) => theme.radius};
    --glass-shadow: ${({ theme }) => theme.shadow};
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--glass-bg);
    color: var(--glass-text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button, input {
    font: inherit;
  }

  :focus-visible {
    outline: 2px solid var(--glass-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
