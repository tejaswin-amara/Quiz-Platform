import styled from "styled-components";
import { glassSurface } from "./glassSurface";

export const GlassCard = styled.section`
  ${glassSurface};
  padding: 24px;
  display: grid;
  gap: 16px;
  width: min(100%, 560px);
`;
