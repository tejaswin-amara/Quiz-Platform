import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassCard } from "../GlassCard";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassCard", () => {
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
});
