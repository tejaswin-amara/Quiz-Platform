import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GlassTooltip } from "../components/GlassTooltip";

const meta: Meta<typeof GlassTooltip> = {
  title: "Glass UI/GlassTooltip",
  component: GlassTooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GlassTooltip>;

export const Default: Story = {
  render: (args) => (
    <GlassTooltip {...args}>
      <button style={{ padding: "8px 16px", cursor: "pointer" }}>Hover or focus me</button>
    </GlassTooltip>
  ),
  args: { label: "This is a tooltip" },
};

export const LongLabel: Story = {
  render: (args) => (
    <GlassTooltip {...args}>
      <button style={{ padding: "8px 16px", cursor: "pointer" }}>Hover me</button>
    </GlassTooltip>
  ),
  args: { label: "A longer tooltip with more descriptive text" },
};
