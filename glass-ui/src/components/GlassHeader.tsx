import React from "react";
import styled from "styled-components";
import { glassSurface } from "./glassSurface";

const HeaderRoot = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  ${glassSurface};
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
`;

const HeaderInner = styled.div`
  margin: 0 auto;
  width: min(1080px, 100% - 32px);
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1rem, 1.2vw + 0.8rem, 1.25rem);
`;

const Actions = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export interface GlassHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export const GlassHeader = ({ title, actions }: GlassHeaderProps) => (
  <HeaderRoot>
    <HeaderInner>
      <Title>{title}</Title>
      <Actions aria-label="Header actions">{actions}</Actions>
    </HeaderInner>
  </HeaderRoot>
);
