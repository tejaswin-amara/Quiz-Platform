import React from "react";
import styled, { css } from "styled-components";
import { motion, HTMLMotionProps } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export type ButtonVariant = "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

// Variant and size token maps
const sizeMap: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 8px;
  `,
  md: css`
    padding: 10px 16px;
    font-size: 0.9rem;
    border-radius: 12px;
  `,
  lg: css`
    padding: 14px 24px;
    font-size: 1rem;
    border-radius: 14px;
  `,
};

const variantMap: Record<ButtonVariant, ReturnType<typeof css>> = {
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

// Module-level styled(motion.button) so tests can use the mocked motion.button properly.
// Using HTMLMotionProps as the base avoids the onAnimationStart type conflict between
// React's AnimationEventHandler and framer-motion's AnimationDefinition handler.
const ButtonRoot = styled(motion.button)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;
  ${({ $variant }) => variantMap[$variant as ButtonVariant]};
  ${({ $size }) => sizeMap[$size as ButtonSize]};
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Public interface extends HTMLMotionProps so onAnimationStart matches the styled component.
export interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const GlassButton = React.memo(function GlassButton({
  variant = "primary",
  size = "md",
  children,
  whileHover,
  whileTap,
  ...rest
}: GlassButtonProps) {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <ButtonRoot
      $variant={variant}
      $size={size}
      whileHover={whileHover ?? (prefersReduced ? undefined : { scale: 1.03 })}
      whileTap={whileTap ?? (prefersReduced ? undefined : { scale: 0.97 })}
      transition={prefersReduced ? undefined : { duration: 0.15 }}
      {...rest}
    >
      {children}
    </ButtonRoot>
  );
});
