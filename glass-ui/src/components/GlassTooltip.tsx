import React, { useId, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TooltipBox = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  font-size: 0.78rem;
  color: var(--glass-text);
  pointer-events: none;
  z-index: 50;

  @supports not (backdrop-filter: blur(1px)) {
    background: ${({ theme }) => theme.colors.bg};
    opacity: 0.98;
  }
`;

export interface GlassTooltipProps {
  label: string;
  children: React.ReactElement;
}

export const GlassTooltip = ({ label, children }: GlassTooltipProps) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  const childProps = {
    "aria-describedby": show ? id : undefined,
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false),
  };

  return (
    <Wrapper>
      {React.cloneElement(children, childProps)}
      <AnimatePresence>
        {show && (
          <TooltipBox
            id={id}
            role="tooltip"
            initial={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            transition={prefersReduced ? undefined : { duration: 0.15 }}
          >
            {label}
          </TooltipBox>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
