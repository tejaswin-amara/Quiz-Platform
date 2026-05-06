import React from "react";
import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { glassSurface } from "./glassSurface";

type CardSize = "sm" | "md" | "lg";

const sizeStyles = {
  sm: css`padding: 16px; gap: 12px; width: min(100%, 360px);`,
  md: css`padding: 24px; gap: 16px; width: min(100%, 560px);`,
  lg: css`padding: 32px; gap: 20px; width: min(100%, 760px);`,
};

const CardRoot = styled(motion.section)<{ $size: CardSize }>`
  ${glassSurface};
  ${({ $size }) => sizeStyles[$size]};
  display: grid;
  contain: layout style;
`;

export interface GlassCardProps extends React.ComponentPropsWithoutRef<"section"> {
  size?: CardSize;
  children?: React.ReactNode;
}

export const GlassCard = React.memo(function GlassCard({ size = "md", children, ...rest }: GlassCardProps) {
  return (
    <CardRoot
      $size={size}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      {...(rest as any)}
    >
      {children}
    </CardRoot>
  );
});
