/**
 * Quiz Platform runtime configuration.
 *
 * THIS FILE IS OVERWRITTEN AT DEPLOY TIME by the GitHub Actions workflow:
 *   .github/workflows/frontend-pages-deploy.yml
 *
 * The workflow reads the `API_BASE_URL` repository variable and injects:
 *   window.__QUIZ_PLATFORM_CONFIG__ = { apiBaseUrl: "<Railway URL>" };
 *
 * For local development: leave apiBaseUrl as "" to use same-origin requests
 * (works when the Spring Boot server serves this file directly on port 8080).
 *
 * To point a locally-served frontend at a remote backend, set:
 *   apiBaseUrl: "https://<your-railway-app>.up.railway.app"
 *
 * Setup instructions: see DEPLOYMENT.md § 2 (GitHub Pages) and § 3 (Railway).
 */
window.__QUIZ_PLATFORM_CONFIG__ = window.__QUIZ_PLATFORM_CONFIG__ || {
  apiBaseUrl: "",
};
