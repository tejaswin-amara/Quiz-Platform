module.exports = {
  root: true,
  extends: ["react-app", "react-app/jest", "eslint-config-prettier"],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "@typescript-eslint/no-useless-constructor": "off",
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "src/setupTests.ts"],
      rules: {
        "testing-library/no-node-access": "off",
      },
    },
  ],
};
