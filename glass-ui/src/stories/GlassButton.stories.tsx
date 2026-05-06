import type { Meta, StoryObj } from "@storybook/react";
import { GlassButton } from "../components/GlassButton";

const meta: Meta<typeof GlassButton> = {
  title: "Glass UI/GlassButton",
  component: GlassButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof GlassButton>;

export const Primary: Story = {
  args: { variant: "primary", size: "md", children: "Primary Button" },
};

export const Ghost: Story = {
  args: { variant: "ghost", size: "md", children: "Ghost Button" },
};

export const Danger: Story = {
  args: { variant: "danger", size: "md", children: "Delete" },
};

export const Small: Story = {
  args: { variant: "primary", size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { variant: "primary", size: "lg", children: "Large Button" },
};

export const Disabled: Story = {
  args: { variant: "primary", size: "md", children: "Disabled", disabled: true },
};
