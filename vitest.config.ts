import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Externalised, these load their own CJS `react`, whose hook dispatcher react-dom never sets:
    // every render that reaches them throws "Invalid hook call".
    server: { deps: { inline: ["@tanstack/react-table", "cmdk"] } },
    // Node 25's global `localStorage` stub shadows happy-dom's.
    execArgv: ["--no-experimental-webstorage"]
  }
});
