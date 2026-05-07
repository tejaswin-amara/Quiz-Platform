import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { GlassButton } from "../GlassButton";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassButton", () => {
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
});
