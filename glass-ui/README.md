# glass-ui

[![npm version](https://img.shields.io/npm/v/glass-ui.svg)](https://www.npmjs.com/package/glass-ui)
[![CI](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/glass-ui-ci.yml/badge.svg)](https://github.com/tejaswin-amara/Quiz-Platform/actions/workflows/glass-ui-ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Storybook](https://img.shields.io/badge/storybook-ready-ff4785.svg)](#storybook)

Enterprise-grade glassmorphism UI components for React + TypeScript, with styled-components, motion safety, and accessibility-first defaults.

## Architecture overview

- **UI primitives:** `GlassCard`, `GlassHeader`, `GlassModal`, `GlassButton`, `GlassToast`, `GlassTooltip`, `GlassBadge`
- **Styling layer:** shared `glassSurface` mixin + CSS variables emitted by `GlobalStyles`
- **Theming:** `lightTheme` and `darkTheme`, with custom theme support via `ThemeProvider`
- **Animation:** Framer Motion with `prefers-reduced-motion` safeguards
- **Packaging:** ESM + CJS + declaration files built by `tsup`

## Installation

### npm

```bash
npm install glass-ui styled-components framer-motion
```

### pnpm

```bash
pnpm add glass-ui styled-components framer-motion
```

### yarn

```bash
yarn add glass-ui styled-components framer-motion
```

### CDN (ESM)

```html
<script type="module">
  import { GlassCard } from "https://esm.sh/glass-ui";
</script>
```

## Usage

```tsx
import { ThemeProvider } from "styled-components";
import { GlobalStyles, lightTheme, GlassCard, GlassButton } from "glass-ui";

export function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      <GlassCard>
        <h2>glass-ui</h2>
        <GlassButton>Continue</GlassButton>
      </GlassCard>
    </ThemeProvider>
  );
}
```

## Theming guide

`GlobalStyles` exports these CSS variables globally:

- `--glass-bg`
- `--glass-surface`
- `--glass-border`
- `--glass-text`
- `--glass-accent`
- `--glass-overlay`
- `--glass-blur`
- `--glass-radius`
- `--glass-shadow`

Use custom themes by providing a `DefaultTheme`-compatible object to `ThemeProvider`.

## SSR notes

- Components are SSR-safe.
- Motion preference checks guard against missing `window.matchMedia`.
- Render `GlobalStyles` on both server and client to avoid visual drift.

## Accessibility guarantees

- Modal focus trap + restore, ESC close, and root isolation (`aria-hidden`)
- Tooltip semantics with `role="tooltip"` + `aria-describedby`
- Toast announcements with `aria-live="assertive"`
- Visible keyboard focus ring
- Motion reduction support for both CSS and Framer Motion paths

## Browser support

| Browser | Version |
| ------- | ------- |
| Chrome  | 76+     |
| Safari  | 9+      |
| Firefox | 103+    |
| Edge    | 79+     |

Fallbacks are applied when `backdrop-filter` is unavailable.

## Bundle and performance

- ESM/CJS outputs with tree-shakable exports
- Shared style primitives to reduce duplicate CSS
- Reduced-motion no-op variants for animation-heavy paths
- Build bundle details: run `npm run build:lib`

## Storybook

```bash
npm run storybook
```

Includes:

- Dark/light toolbar switch
- Reduced-motion preview toggle
- A11y checks via `@storybook/addon-a11y`

## Development scripts

```bash
npm run lint
npm run format:check
npm test -- --watchAll=false
npm run build
npm run build:lib
npm run build-storybook
```

## Release workflow

1. Update `CHANGELOG.md`
2. Bump version with semantic versioning
3. Tag release (`glass-ui-vX.Y.Z`)
4. Publish with provenance via GitHub Actions release workflow

## SemVer policy

- `patch`: fixes and internal hardening
- `minor`: backward-compatible features
- `major`: breaking API changes

## Contribution workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md), and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## FAQ

### Is this library tree-shakeable?

Yes. Use ESM imports for best results.

### Does it support React StrictMode?

Yes, components are StrictMode compatible.

### Does it work with CRA and Vite?

Yes, both are supported.

## Troubleshooting

- **Styles not applied:** Ensure `GlobalStyles` is rendered.
- **Theme mismatch:** Confirm `ThemeProvider` wraps your app.
- **Animation issues in tests:** Ensure `matchMedia` is mocked in test setup.

## Screenshots / GIF placeholders

- `docs/screenshots/light-mode.png`
- `docs/screenshots/dark-mode.png`
- `docs/gifs/components-demo.gif`
