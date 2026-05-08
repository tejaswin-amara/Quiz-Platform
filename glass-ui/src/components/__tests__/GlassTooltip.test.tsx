import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { GlassTooltip } from "../GlassTooltip";
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

describe("GlassTooltip", () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    (global as any).matchMedia = originalMatchMedia;
  });

  it("shows tooltip on hover and hides on leave", async () => {
    render(
      <GlassTooltip label="Tooltip text">
        <button>Target</button>
      </GlassTooltip>,
      { wrapper }
    );

    const target = screen.getByRole("button", { name: "Target" });
    await userEvent.hover(target);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip text");

    await userEvent.unhover(target);
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("disables animation props when reduced motion is preferred", async () => {
    enableReducedMotion();
    render(
      <GlassTooltip label="Tooltip text">
        <button>Target</button>
      </GlassTooltip>,
      { wrapper }
    );

    const target = screen.getByRole("button", { name: "Target" });
    await userEvent.hover(target);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).not.toHaveAttribute("data-motion-initial");
    expect(tooltip).not.toHaveAttribute("data-motion-animate");
    expect(tooltip).not.toHaveAttribute("data-motion-exit");
    expect(tooltip).not.toHaveAttribute("data-motion-transition");
  });
});
