import React from "react";
import type { Preview, Decorator } from "@storybook/react-webpack5";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../src/theme";
import { GlobalStyles } from "../src/globalStyles";

const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals?.theme === "dark";
  const reducedMotion = context.globals?.motion === "reduced";
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          background: theme.colors.bg,
          transition: reducedMotion ? "none" : undefined,
          animation: reducedMotion ? "none" : undefined,
        }}
      >
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Global theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
    motion: {
      description: "Motion mode",
      defaultValue: "default",
      toolbar: {
        title: "Motion",
        icon: "transfer",
        items: ["default", "reduced"],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
