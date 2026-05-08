# Changelog

All notable changes to `glass-ui` will be documented in this file.

The format follows Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Release hardening metadata (`exports`, `sideEffects`, publish config, engines, keywords)
- CI/release workflows, Dependabot, Renovate, CODEOWNERS, issue/PR templates
- Linting/formatting/commit quality gates (ESLint, Prettier, lint-staged, Husky, commitlint)
- Storybook motion toggle + strict accessibility parameterization
- Maintainer docs (`CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`, `LICENSE`)
- Reduced-motion regression coverage for motion-enabled components

### Changed

- README upgraded for installation, SSR, accessibility, release, and troubleshooting guidance
- Normalized npm repository metadata and kept `web-vitals` as a dev-only dependency to reduce consumer install footprint
- Fully disable modal transition props when reduced motion is preferred
