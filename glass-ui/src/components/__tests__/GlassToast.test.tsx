import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassToast } from "../GlassToast";
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

describe("GlassToast", () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    (global as any).matchMedia = originalMatchMedia;
  });

  it("renders message", () => {
    render(<GlassToast message="Saved" duration={0} />, { wrapper });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("supports all types", () => {
    const { rerender } = render(<GlassToast message="Info" type="info" duration={0} />, {
      wrapper,
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <GlassToast message="Success" type="success" duration={0} />
      </ThemeProvider>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Success");
  });

  it("disables animation props when reduced motion is preferred", () => {
    enableReducedMotion();
    render(<GlassToast message="Saved" duration={0} />, { wrapper });

    const toast = screen.getByRole("status");
    expect(toast).not.toHaveAttribute("data-motion-initial");
    expect(toast).not.toHaveAttribute("data-motion-animate");
    expect(toast).not.toHaveAttribute("data-motion-exit");
    expect(toast).not.toHaveAttribute("data-motion-transition");
  });
});
