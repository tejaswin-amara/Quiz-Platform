import React from "react";
import styled, { css } from "styled-components";

export type BadgeVariant = "default" | "success" | "warning" | "danger";

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  default: css`background: var(--glass-surface); border-color: var(--glass-border); color: var(--glass-text);`,
  success: css`background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.4); color: #16a34a;`,
  warning: css`background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.4); color: #ca8a04;`,
  danger: css`background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #dc2626;`,
};

const BadgeRoot = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  border: 1px solid;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.6;
  ${({ $variant }: { $variant: BadgeVariant }) => variantStyles[$variant]};
`;

export interface GlassBadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant;
  children?: React.ReactNode;
}

export const GlassBadge = React.memo(function GlassBadge({
  variant = "default",
  children,
  ...rest
}: GlassBadgeProps) {
  return (
    <BadgeRoot $variant={variant} {...rest}>
      {children}
    </BadgeRoot>
  );
});
