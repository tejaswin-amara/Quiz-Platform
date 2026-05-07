import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassBadge } from "../GlassBadge";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassBadge", () => {
  it("renders with default variant", () => {
    render(<GlassBadge>Default</GlassBadge>, { wrapper });
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with status variants", () => {
    const { rerender } = render(<GlassBadge variant="success">Active</GlassBadge>, { wrapper });
    expect(screen.getByText("Active")).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <GlassBadge variant="danger">Error</GlassBadge>
      </ThemeProvider>
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
  });
});
