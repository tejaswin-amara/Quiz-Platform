import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
  colors: {
    bg: "#f4f6f8",
    glass: "rgba(255,255,255,0.25)",
    border: "rgba(255,255,255,0.4)",
    text: "#1a1a1a",
    accent: "#5b8cff",
    overlay: "rgba(9, 14, 30, 0.45)",
  },
  blur: "12px",
  radius: "16px",
  shadow: "0 8px 32px rgba(0,0,0,0.15)",
};

export const darkTheme: DefaultTheme = {
  colors: {
    bg: "#0f1115",
    glass: "rgba(20,20,20,0.35)",
    border: "rgba(255,255,255,0.1)",
    text: "#ffffff",
    accent: "#7aa2ff",
    overlay: "rgba(2, 4, 10, 0.6)",
  },
  blur: "12px",
  radius: "16px",
  shadow: "0 8px 32px rgba(0,0,0,0.4)",
};
