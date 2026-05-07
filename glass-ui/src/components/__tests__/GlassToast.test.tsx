import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { GlassToast } from "../GlassToast";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassToast", () => {
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
});
