import "@testing-library/jest-dom";

jest.mock("framer-motion", () => {
  const React: typeof import("react") = require("react");
  const motionPropNames = [
    "animate",
    "exit",
    "initial",
    "layout",
    "transition",
    "variants",
    "whileHover",
    "whileTap",
  ];
  const normalizeStyle = (style: Record<string, unknown> | undefined) =>
    Object.fromEntries(
      Object.entries(style ?? {}).map(([key, value]) => [
        key,
        value &&
        typeof value === "object" &&
        "get" in value &&
        typeof (value as { get: () => unknown }).get === "function"
          ? (value as { get: () => unknown }).get()
          : value,
      ])
    );
  const toDataAttribute = (propName: string) =>
    `data-motion-${propName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
  const createMotionComponent = (tag: string) =>
    React.forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.ForwardedRef<HTMLElement>
    ) {
      const motionProps = Object.fromEntries(
        Object.entries(props)
          .filter(([key, value]) => motionPropNames.includes(key) && value !== undefined)
          .map(([key, value]) => [
            toDataAttribute(key),
            typeof value === "string" ? value : JSON.stringify(value),
          ])
      );

      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionPropNames.includes(key))
      );

      return React.createElement(tag, {
        ref,
        ...domProps,
        style: normalizeStyle(domProps.style as Record<string, unknown> | undefined),
        ...motionProps,
      });
    });
  const useMotionValue = (initialValue: number) => {
    let value = initialValue;

    return {
      get: () => value,
      set: (nextValue: number) => {
        value = nextValue;
      },
      on: jest.fn(() => jest.fn()),
    };
  };
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
    useMotionValue,
    useScroll: () => ({
      scrollY: {
        on: jest.fn(() => jest.fn()),
      },
    }),
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
