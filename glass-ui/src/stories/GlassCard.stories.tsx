import type { Meta, StoryObj } from "@storybook/react";
import { GlassCard } from "../components/GlassCard";

const meta: Meta<typeof GlassCard> = {
  title: "Glass UI/GlassCard",
  component: GlassCard,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const Default: Story = {
  args: { size: "md", children: "This is a GlassCard with default (md) size." },
};

export const Small: Story = {
  args: { size: "sm", children: "Small GlassCard" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large GlassCard with more breathing room." },
};
