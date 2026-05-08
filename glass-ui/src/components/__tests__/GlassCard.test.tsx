import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassCard } from "../GlassCard";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

const originalMatchMedia = window.matchMedia;

const enableReducedMotion = () => {
  const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  window.matchMedia = matchMediaMock as typeof window.matchMedia;
  (global as any).matchMedia = matchMediaMock;
};

describe("GlassCard", () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    (global as any).matchMedia = originalMatchMedia;
  });

  it("renders children", () => {
    render(
      <GlassCard>
        <span>Hello</span>
      </GlassCard>,
      { wrapper }
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders with default size (md) — no explicit size needed", () => {
    render(<GlassCard data-testid="card">Content</GlassCard>, { wrapper });
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders with size=sm", () => {
    render(
      <GlassCard size="sm" data-testid="card-sm">
        Small
      </GlassCard>,
      { wrapper }
    );
    expect(screen.getByTestId("card-sm")).toBeInTheDocument();
  });

  it("renders with size=md", () => {
    render(
      <GlassCard size="md" data-testid="card-md">
        Medium
      </GlassCard>,
      { wrapper }
    );
    expect(screen.getByTestId("card-md")).toBeInTheDocument();
  });

  it("renders with size=lg", () => {
    render(
      <GlassCard size="lg" data-testid="card-lg">
        Large
      </GlassCard>,
      { wrapper }
    );
    expect(screen.getByTestId("card-lg")).toBeInTheDocument();
  });

  it("disables hover motion when reduced motion is preferred", () => {
    enableReducedMotion();
    render(<GlassCard data-testid="card">Content</GlassCard>, { wrapper });

    expect(screen.getByTestId("card")).not.toHaveAttribute("data-motion-while-hover");
  });
});
