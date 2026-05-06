import type { Meta, StoryObj } from "@storybook/react";
import { GlassBadge } from "../components/GlassBadge";

const meta: Meta<typeof GlassBadge> = {
  title: "Glass UI/GlassBadge",
  component: GlassBadge,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "success", "warning", "danger"] },
  },
};

export default meta;
type Story = StoryObj<typeof GlassBadge>;

export const Default: Story = {
  args: { variant: "default", children: "Default" },
};

export const Success: Story = {
  args: { variant: "success", children: "Active" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Pending" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Error" },
};
