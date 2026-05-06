import type { Meta, StoryObj } from "@storybook/react";
import { GlassToast } from "../components/GlassToast";

const meta: Meta<typeof GlassToast> = {
  title: "Glass UI/GlassToast",
  component: GlassToast,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "select", options: ["info", "success", "warning", "error"] },
    duration: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof GlassToast>;

export const Info: Story = {
  args: { message: "This is an info notification.", type: "info", duration: 0 },
};

export const Success: Story = {
  args: { message: "Operation completed successfully!", type: "success", duration: 0 },
};

export const Warning: Story = {
  args: { message: "Proceed with caution.", type: "warning", duration: 0 },
};

export const Error: Story = {
  args: { message: "Something went wrong.", type: "error", duration: 0 },
};
