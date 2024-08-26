// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    coverage: {
      include: ["src/**"],
      exclude: ["**/*.config.{ts,js,mts,mjs}"],
    },
  },
});
