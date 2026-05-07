"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/globalStyles.ts
var globalStyles_exports = {};
__export(globalStyles_exports, {
  GlobalStyles: () => GlobalStyles
});
module.exports = __toCommonJS(globalStyles_exports);
var import_styled_components = require("styled-components");
var GlobalStyles = import_styled_components.createGlobalStyle`
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
  GlobalStyles
});
