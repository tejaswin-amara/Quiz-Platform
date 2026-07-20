# Contributing to Quiz Platform

Thanks for considering a contribution — whether to the Spring Boot backend or the `glass-ui` component library.

## Before you start

1. Check open [issues](../../issues) and the [pull request template](.github/pull_request_template.md).
2. For anything non-trivial, open an issue first using the [bug report](.github/ISSUE_TEMPLATE/bug_report.yml) or [feature request](.github/ISSUE_TEMPLATE/feature_request.yml) template, so the approach is agreed before you write code.

## Setup

See [README.md § Quick Start](./README.md#quick-start) — H2 gives a zero-config backend, no MySQL or Docker required for local work.

## Backend changes (`src/`)

- Standard Maven project — run `mvn test` before opening a PR.
- New DSA-backed logic belongs in `src/main/java/com/tejaswin/quizplatform/dsa/`, kept isolated from `service/` and `controller/` so it stays independently testable.
- Schema changes go through a new Flyway migration under `src/main/resources/db` — never a manual schema edit.
- The `backend-ci` GitHub Actions workflow runs on every PR and must pass.
- If you add or change an endpoint, update [API.md](./API.md) in the same PR.

## `glass-ui` changes

`glass-ui` is a standalone, publishable package with its own stricter conventions — see [glass-ui/CONTRIBUTING.md](./glass-ui/CONTRIBUTING.md) for the full guide. In short:

- Commits are linted with `commitlint` (Conventional Commits) via Husky — non-conforming messages are rejected locally.
- `npm run lint`, `npm run typecheck`, and `npm test` must all pass; `npm run prepack` runs those plus the library build (`tsup`).
- New components need an accompanying Storybook story.
- `glass-ui-ci` and `glass-ui-release` gate merges and publishing.

## Pull requests

- Keep PRs focused — one concern per PR.
- Fill out the [PR template](.github/pull_request_template.md) completely and link the issue it resolves.
- All relevant CI checks (`backend-ci`, `glass-ui-ci`, `frontend-pages-deploy`) must be green before review.

## Code of Conduct

`glass-ui` has an explicit [Code of Conduct](./glass-ui/CODE_OF_CONDUCT.md); the same standard applies project-wide — be respectful, keep discussion technical, and assume good faith.
