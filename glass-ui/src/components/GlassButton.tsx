import React from "react";
import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export type ButtonVariant = "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;`,
  md: css`padding: 10px 16px; font-size: 0.9rem; border-radius: 12px;`,
  lg: css`padding: 14px 24px; font-size: 1rem; border-radius: 14px;`,
};

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: var(--glass-accent);
    color: #ffffff;
    border: 1px solid transparent;
  `,
  ghost: css`
    background: transparent;
    color: var(--glass-text);
    border: 1px solid var(--glass-border);
  `,
  danger: css`
    background: #e05260;
    color: #ffffff;
    border: 1px solid transparent;
  `,
};

const ButtonRoot = styled(motion.button)<{ $variant: ButtonVariant; $size: ButtonSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;

  ${({ $variant }: { $variant: ButtonVariant }) => variantStyles[$variant]};
  ${({ $size }: { $size: ButtonSize }) => sizeStyles[$size]};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export interface GlassButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

export const GlassButton = React.memo(function GlassButton({
  variant = "primary",
  size = "md",
  children,
  ...rest
}: GlassButtonProps) {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <ButtonRoot
      $variant={variant}
      $size={size}
      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={prefersReduced ? undefined : { duration: 0.15 }}
      {...(rest as any)}
    >
      {children}
    </ButtonRoot>
  );
});
