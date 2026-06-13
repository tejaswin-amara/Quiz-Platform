import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassModal } from "../GlassModal";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it("renders nothing when open=false", () => {
    render(
      <GlassModal open={false} onClose={onClose} title="Hidden">
        <p>invisible</p>
      </GlassModal>,
      { wrapper }
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with correct role and aria-label when open=true", () => {
    render(
      <GlassModal open title="My Modal" onClose={onClose}>
        <p>modal body</p>
      </GlassModal>,
      { wrapper }
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-label", "My Modal");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when Escape key is pressed", () => {
    render(
      <GlassModal open title="Esc Test" onClose={onClose}>
        <button>focusable</button>
      </GlassModal>,
      { wrapper }
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when clicking inside the modal content", () => {
    render(
      <GlassModal open title="Inner Click" onClose={onClose}>
        <button>inside button</button>
      </GlassModal>,
      { wrapper }
    );
    fireEvent.click(screen.getByRole("button", { name: "inside button" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("sets #root aria-hidden=true while modal is open", () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    render(
      <GlassModal open title="ARIA Test" onClose={onClose}>
        <p>content</p>
      </GlassModal>,
      { wrapper }
    );
    expect(root.getAttribute("aria-hidden")).toBe("true");

    document.body.removeChild(root);
  });

  it("removes #root aria-hidden when modal closes", () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    const { rerender } = render(
      <GlassModal open title="ARIA Close Test" onClose={onClose}>
        <p>content</p>
      </GlassModal>,
      { wrapper }
    );
    expect(root.getAttribute("aria-hidden")).toBe("true");

    rerender(
      <ThemeProvider theme={lightTheme}>
        <GlassModal open={false} title="ARIA Close Test" onClose={onClose}>
          <p>content</p>
        </GlassModal>
      </ThemeProvider>
    );
    expect(root.getAttribute("aria-hidden")).toBeNull();

    document.body.removeChild(root);
  });

  it("renders children inside the dialog", () => {
    render(
      <GlassModal open title="Children Test" onClose={onClose}>
        <span data-testid="child">hello</span>
      </GlassModal>,
      { wrapper }
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
