import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { GlassButton } from "../GlassButton";
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

describe("GlassButton", () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    (global as any).matchMedia = originalMatchMedia;
  });

  it("renders primary variant", () => {
    render(<GlassButton variant="primary">Click me</GlassButton>, { wrapper });
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders ghost variant", () => {
    render(<GlassButton variant="ghost">Ghost</GlassButton>, { wrapper });
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
  });

  it("renders danger variant", () => {
    render(<GlassButton variant="danger">Delete</GlassButton>, { wrapper });
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("handles click events", () => {
    const onClick = jest.fn();
    render(<GlassButton onClick={onClick}>Submit</GlassButton>, { wrapper });
    userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire click when disabled", () => {
    const onClick = jest.fn();
    render(
      <GlassButton disabled onClick={onClick}>
        Disabled
      </GlassButton>,
      { wrapper }
    );
    userEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables motion props when reduced motion is preferred", () => {
    enableReducedMotion();
    render(<GlassButton>Still</GlassButton>, { wrapper });

    const button = screen.getByRole("button", { name: "Still" });
    expect(button).not.toHaveAttribute("data-motion-while-hover");
    expect(button).not.toHaveAttribute("data-motion-while-tap");
    expect(button).not.toHaveAttribute("data-motion-transition");
  });
});
