# Glass UI

A React glassmorphism component library built with TypeScript, styled-components, and framer-motion.

## Installation

```bash
npm install glass-ui styled-components framer-motion
# Peer deps: react@^18, react-dom@^18
```

## Setup

Wrap your app with `ThemeProvider` and render `GlobalStyles`:

```tsx
import { ThemeProvider } from "styled-components";
import { GlobalStyles, lightTheme, darkTheme } from "glass-ui";

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      {/* your app */}
    </ThemeProvider>
  );
}
```

## Components

### GlassCard

Frosted glass container. Optional `size` prop: `"sm" | "md" | "lg"` (default: `"md"`).

```tsx
import { GlassCard } from "glass-ui";

<GlassCard size="md">
  <h2>Hello World</h2>
  <p>Content inside the card.</p>
</GlassCard>
```

### GlassHeader

Sticky glassmorphism navbar with scroll-based opacity animation.

```tsx
import { GlassHeader } from "glass-ui";

<GlassHeader
  title="My App"
  actions={<button>Settings</button>}
/>
```

### GlassModal

Accessible modal dialog with focus trap, ESC close, outside-click close, and `aria-hidden` on `#root`.

```tsx
import { GlassModal } from "glass-ui";

<GlassModal open={open} onClose={() => setOpen(false)} title="My Modal">
  <p>Modal content here.</p>
  <button onClick={() => setOpen(false)}>Close</button>
</GlassModal>
```

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Show/hide modal |
| `onClose` | `() => void` | Called on ESC or overlay click |
| `title` | `string` | ARIA label for dialog |
| `announcement` | `string?` | Message for `aria-live="polite"` region |

### GlassButton

```tsx
import { GlassButton } from "glass-ui";

<GlassButton variant="primary" size="md">Click Me</GlassButton>
<GlassButton variant="ghost">Cancel</GlassButton>
<GlassButton variant="danger">Delete</GlassButton>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `"primary" \| "ghost" \| "danger"` | `"primary"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |

### GlassToast

Auto-dismissing notification toast with `aria-live="assertive"`.

```tsx
import { GlassToast } from "glass-ui";

<GlassToast message="Saved!" type="success" duration={3000} onDismiss={() => {}} />
```

| Prop | Type | Default |
|------|------|---------|
| `type` | `"info" \| "success" \| "warning" \| "error"` | `"info"` |
| `duration` | `number` (ms) | `4000` |

### GlassTooltip

Hover + focus triggered tooltip. Uses `role="tooltip"` and `aria-describedby`.

```tsx
import { GlassTooltip } from "glass-ui";

<GlassTooltip label="Opens settings panel">
  <button>⚙</button>
</GlassTooltip>
```

### GlassBadge

Inline pill badge.

```tsx
import { GlassBadge } from "glass-ui";

<GlassBadge variant="success">Active</GlassBadge>
<GlassBadge variant="danger">Error</GlassBadge>
```

| `variant` | Values |
|-----------|--------|
| | `"default" \| "success" \| "warning" \| "danger"` |

## Theming

### ThemeProvider (source of truth)

Themes are plain JS objects matching `DefaultTheme`. The `GlobalStyles` component emits CSS custom properties from the active theme on `:root`, so both styled-components interpolations and raw CSS can consume them.

```ts
import { lightTheme, darkTheme } from "glass-ui";
```

### Available CSS Variables

Once `GlobalStyles` is rendered, these variables are available globally:

| Variable | Description |
|----------|-------------|
| `--glass-bg` | Page background |
| `--glass-surface` | Glass fill color |
| `--glass-border` | Glass border color |
| `--glass-text` | Body text color |
| `--glass-accent` | Accent / primary color |
| `--glass-overlay` | Modal overlay color |
| `--glass-blur` | Backdrop blur amount |
| `--glass-radius` | Border radius |
| `--glass-shadow` | Box shadow |

### Custom Theme

```ts
import { DefaultTheme } from "styled-components";

const myTheme: DefaultTheme = {
  colors: {
    bg: "#ffffff",
    glass: "rgba(255,255,255,0.3)",
    border: "rgba(255,255,255,0.5)",
    text: "#111111",
    accent: "#6366f1",
    overlay: "rgba(0,0,0,0.4)",
  },
  blur: "16px",
  radius: "20px",
  shadow: "0 8px 32px rgba(0,0,0,0.12)",
};
```

## Accessibility Guarantees

- All focus management handled by `GlassModal` (focus trap + restore on close)
- `GlassModal` applies `aria-hidden="true"` to `#root` when open
- `aria-live="polite"` announcement region in `GlassModal`
- `GlassToast` uses `aria-live="assertive"` for critical notifications
- `GlassTooltip` uses `role="tooltip"` and `aria-describedby`
- `:focus-visible` ring using `--glass-accent`
- `prefers-reduced-motion` disables all CSS animations

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 76+ | Full `backdrop-filter` support |
| Safari | 9+ | Full `-webkit-backdrop-filter` support |
| Firefox | 103+ | `backdrop-filter` support (enabled by default) |
| Edge | 79+ | Full support (Chromium-based) |
| Firefox < 103 | — | Falls back to opaque background via `@supports not` |

## Performance Notes

- `will-change: transform` on all glass surfaces for GPU compositing
- `contain: layout style` on `GlassCard` to limit reflow scope
- `React.memo` on `GlassCard`, `GlassHeader`, `GlassButton`, `GlassBadge`
- Animation variants are no-ops when `prefers-reduced-motion` is set
- CSS custom properties avoid re-rendering on theme switch for static consumers

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start CRA dev server |
| `npm test` | Run Jest tests |
| `npm run build:lib` | Build library with tsup (ESM + CJS + types) |
| `npm run storybook` | Start Storybook dev server on port 6006 |
| `npm run build-storybook` | Build static Storybook |
