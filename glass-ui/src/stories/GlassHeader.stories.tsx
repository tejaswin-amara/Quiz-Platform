import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GlassHeader } from "../components/GlassHeader";

const meta: Meta<typeof GlassHeader> = {
  title: "Glass UI/GlassHeader",
  component: GlassHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GlassHeader>;

export const Default: Story = {
  args: { title: "Glass UI App" },
};

export const WithActions: Story = {
  args: {
    title: "Glass UI App",
    actions: <button style={{ padding: "8px 16px", cursor: "pointer" }}>Toggle Theme</button>,
  },
};
