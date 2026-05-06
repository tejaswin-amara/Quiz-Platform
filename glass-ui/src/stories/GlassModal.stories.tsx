import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GlassModal } from "../components/GlassModal";

const meta: Meta<typeof GlassModal> = {
  title: "Glass UI/GlassModal",
  component: GlassModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GlassModal>;

const ModalDemo = (args: React.ComponentProps<typeof GlassModal>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <GlassModal {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalDemo {...args} />,
  args: {
    title: "Glass Modal",
    children: <p>This is a glassmorphism modal dialog.</p>,
  },
};

export const WithActions: Story = {
  render: (args) => <ModalDemo {...args} />,
  args: {
    title: "Confirm Action",
    children: (
      <div>
        <p>Are you sure you want to proceed?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button>Cancel</button>
          <button>Confirm</button>
        </div>
      </div>
    ),
  },
};
