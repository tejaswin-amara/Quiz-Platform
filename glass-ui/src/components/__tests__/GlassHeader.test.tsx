import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassHeader } from "../GlassHeader";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassHeader", () => {
  it("renders the title", () => {
    render(<GlassHeader title="My App" />, { wrapper });
    expect(screen.getByText("My App")).toBeInTheDocument();
  });

  it("renders the actions slot", () => {
    render(
      <GlassHeader title="My App" actions={<button>Settings</button>} />,
      { wrapper }
    );
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });
});
