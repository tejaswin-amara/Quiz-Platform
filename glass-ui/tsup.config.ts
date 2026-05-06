import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/components/index.ts", "src/theme.ts", "src/globalStyles.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "styled-components", "framer-motion"],
});
