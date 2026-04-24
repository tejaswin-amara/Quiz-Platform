import { css } from "styled-components";

export const glassSurface = css`
  background: ${({ theme }) => theme.colors.glass};
  border: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.blur});
  -webkit-backdrop-filter: blur(${({ theme }) => theme.blur});
  box-shadow: ${({ theme }) => theme.shadow};
  border-radius: ${({ theme }) => theme.radius};
`;
