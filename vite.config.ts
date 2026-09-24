import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import devApi from "./dev-api.js";

export default defineConfig({
  // devApi() serves /api/* from the same handlers Vercel deploys, so
  // `npm run dev` is fully self-contained — no `vercel dev` needed.
  // It's dev-only; the production build ignores it.
  plugins: [react(), devApi()],
});
