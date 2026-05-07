import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { GlassTooltip } from "../GlassTooltip";
import { lightTheme } from "../../theme";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe("GlassTooltip", () => {
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
});
