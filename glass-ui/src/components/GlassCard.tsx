import React from "react";
import styled, { css } from "styled-components";
import { motion, HTMLMotionProps } from "framer-motion";
import { glassSurface } from "./glassSurface";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type CardSize = "sm" | "md" | "lg";

const sizeMap: Record<CardSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 16px;
    gap: 12px;
    width: min(100%, 360px);
  `,
  md: css`
    padding: 24px;
    gap: 16px;
    width: min(100%, 560px);
  `,
  lg: css`
    padding: 32px;
    gap: 20px;
    width: min(100%, 760px);
  `,
};

const CardRoot = styled(motion.section)<{ $size: CardSize }>`
  ${glassSurface};
  ${({ $size }) => sizeMap[$size as CardSize]};
  display: grid;
  contain: layout style;
`;

export interface GlassCardProps extends Omit<HTMLMotionProps<"section">, "ref"> {
  size?: CardSize;
}

export const GlassCard = React.memo(function GlassCard({
  size = "md",
  children,
  whileHover,
  ...rest
}: GlassCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <CardRoot
      $size={size}
      whileHover={
        whileHover ?? (prefersReduced ? undefined : { y: -4, transition: { duration: 0.2 } })
      }
      {...rest}
    >
      {children}
    </CardRoot>
  );
});
