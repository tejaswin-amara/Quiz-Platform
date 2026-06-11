import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
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
    font-family: "Manrope", "Syne", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
