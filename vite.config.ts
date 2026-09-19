import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Lets `npm run dev` (plain Vite) hit `vercel dev` for the API
      // during local development. See README for the two ways to run this.
      "/api": "http://localhost:3000",
    },
  },
});
