import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { GlassModal } from "../GlassModal";
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

const renderModal = (props: Partial<React.ComponentProps<typeof GlassModal>> = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    title: "Test Modal",
    children: (
      <>
        <button>First</button>
        <button>Second</button>
      </>
    ),
    ...props,
  };
  return render(<GlassModal {...defaultProps} />, { wrapper });
};

describe("GlassModal", () => {
  let rootDiv: HTMLDivElement;

  beforeEach(() => {
    rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);
  });

  afterEach(() => {
    document.body.removeChild(rootDiv);
    window.matchMedia = originalMatchMedia;
    (global as any).matchMedia = originalMatchMedia;
  });

  it("renders when open=true", () => {
    renderModal({ open: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does NOT render dialog when open=false", () => {
    renderModal({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose on ESC key", () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on overlay click", () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    // Click the overlay (the fixed positioned div behind modal)
    const dialog = screen.getByRole("dialog");
    userEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT call onClose on modal body click", () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    const dialog = screen.getByRole("dialog");
    userEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("traps focus — Tab cycles through focusable elements", () => {
    renderModal();
    const buttons = screen.getAllByRole("button");
    // Focus the last button, Tab should wrap to first
    act(() => {
      buttons[buttons.length - 1].focus();
    });
    userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("restores focus on close", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    act(() => {
      trigger.focus();
    });

    const { rerender } = renderModal({ open: true });
    rerender(
      <ThemeProvider theme={lightTheme}>
        <GlassModal open={false} onClose={jest.fn()} title="Test Modal">
          <button>btn</button>
        </GlassModal>
      </ThemeProvider>
    );
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it("applies aria-hidden to #root when open", () => {
    renderModal({ open: true });
    expect(rootDiv).toHaveAttribute("aria-hidden", "true");
  });

  it("removes aria-hidden from #root when closed", () => {
    const { rerender } = renderModal({ open: true });
    expect(rootDiv).toHaveAttribute("aria-hidden", "true");
    rerender(
      <ThemeProvider theme={lightTheme}>
        <GlassModal open={false} onClose={jest.fn()} title="Test Modal">
          <button>btn</button>
        </GlassModal>
      </ThemeProvider>
    );
    expect(rootDiv).not.toHaveAttribute("aria-hidden");
  });

  it("disables modal animation props when reduced motion is preferred", () => {
    enableReducedMotion();
    renderModal({ open: true });

    const dialog = screen.getByRole("dialog");
    const overlay = dialog.parentElement;

    expect(dialog).not.toHaveAttribute("data-motion-initial");
    expect(dialog).not.toHaveAttribute("data-motion-animate");
    expect(dialog).not.toHaveAttribute("data-motion-exit");
    expect(dialog).not.toHaveAttribute("data-motion-variants");
    expect(dialog).not.toHaveAttribute("data-motion-transition");
    expect(overlay).not.toHaveAttribute("data-motion-initial");
    expect(overlay).not.toHaveAttribute("data-motion-animate");
    expect(overlay).not.toHaveAttribute("data-motion-exit");
    expect(overlay).not.toHaveAttribute("data-motion-variants");
    expect(overlay).not.toHaveAttribute("data-motion-transition");
  });
});
