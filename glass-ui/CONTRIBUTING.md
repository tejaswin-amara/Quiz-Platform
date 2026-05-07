# Contributing to glass-ui

## Local setup

```bash
npm ci
```

## Required checks

Run from `glass-ui/` before opening a PR:

```bash
npm run lint
npm run format:check
npm test -- --watchAll=false
npm run build
npm run build:lib
npm run build-storybook
```

## Commit convention

Use Conventional Commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `refactor: ...`
- `test: ...`

## Pull requests

- Keep changes scoped and atomic
- Add/update tests for behavior changes
- Update docs/changelog for user-facing changes
