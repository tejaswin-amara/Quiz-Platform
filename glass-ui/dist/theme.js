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

// src/theme.ts
var theme_exports = {};
__export(theme_exports, {
  darkTheme: () => darkTheme,
  lightTheme: () => lightTheme
});
module.exports = __toCommonJS(theme_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  darkTheme,
  lightTheme
});
