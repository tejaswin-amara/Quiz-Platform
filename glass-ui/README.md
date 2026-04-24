# Glass UI Component Library

Production-ready React + TypeScript glassmorphism component suite using `styled-components`.

## Setup

```bash
npm install
npm start
```

## Build and test

```bash
npm run build
npm test -- --watchAll=false
```

## Components

- `GlassCard`
- `GlassHeader`
- `GlassModal`

## Usage snippets

```tsx
import { GlassCard } from "./components/GlassCard";

<GlassCard>
  <h2>Profile</h2>
  <p>Translucent, reusable content block.</p>
</GlassCard>
```

```tsx
import { GlassModal } from "./components/GlassModal";

<GlassModal open={open} onClose={() => setOpen(false)} title="Settings">
  <button onClick={() => setOpen(false)}>Close</button>
</GlassModal>
```

```tsx
import { GlassHeader } from "./components/GlassHeader";

<GlassHeader title="Dashboard" actions={<button>Theme</button>} />
```

## Theme

`src/theme.ts` exports `lightTheme` and `darkTheme` tokens. Wrap app with `ThemeProvider` and switch themes through state.
