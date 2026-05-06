import React, { useId, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

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
`;

export interface GlassTooltipProps {
  label: string;
  children: React.ReactElement;
}

export const GlassTooltip = ({ label, children }: GlassTooltipProps) => {
  const id = useId();
  const [show, setShow] = useState(false);

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
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </TooltipBox>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
