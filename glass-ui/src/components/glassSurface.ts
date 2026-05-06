import { css } from "styled-components";

export const glassSurface = css`
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
