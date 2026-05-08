import React from "react";
import "@testing-library/jest-dom";

const MOTION_PROP_NAMES = [
  "animate",
  "exit",
  "initial",
  "layout",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
];

const toDataAttribute = (propName: string) =>
  `data-motion-${propName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;

const createMotionComponent = (tag: string) =>
  React.forwardRef<HTMLElement, Record<string, unknown>>(function MotionComponent(props, ref) {
    const motionProps = Object.fromEntries(
      Object.entries(props)
        .filter(([key, value]) => MOTION_PROP_NAMES.includes(key) && value !== undefined)
        .map(([key, value]) => [
          toDataAttribute(key),
          typeof value === "string" ? value : JSON.stringify(value),
        ])
    );

    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !MOTION_PROP_NAMES.includes(key))
    );

    return React.createElement(tag, { ref, ...domProps, ...motionProps });
  });

jest.mock("framer-motion", () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, property: string) => createMotionComponent(property),
    }
  );

  return {
    __esModule: true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion,
  };
});

// Mock window.matchMedia for framer-motion and other consumers
const matchMediaMock = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(matchMediaMock),
});

// Also set on global for modules that check global.matchMedia
(global as any).matchMedia = jest.fn().mockImplementation(matchMediaMock);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor(_callback: ResizeObserverCallback) {}
} as any;
