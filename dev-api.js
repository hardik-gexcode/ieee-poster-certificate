// dev-api.js
//
// Vite plugin used ONLY by `npm run dev`. On Vercel the files in /api are
// deployed as serverless functions automatically, but plain Vite knows
// nothing about them — so without this, `/api/verify` has nowhere to go and
// the form shows "Something went wrong reaching the server".
//
// This plugin runs the very same handlers (api/verify.js, api/certificate.js)
// inside the Vite dev server, giving them the small subset of Vercel's
// req/res helpers they use (req.body, req.query, res.status/json/send).
// Nothing here is bundled into the production build.

import fs from "fs";
import path from "path";

export default function devApi() {
  return {
    name: "dev-api",
    apply: "serve", // dev server only, never `vite build`

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", "http://localhost");
        const match = url.pathname.match(/^\/api\/([A-Za-z0-9_-]+)$/);
        if (!match) return next();

        const file = path.join(server.config.root, "api", `${match[1]}.js`);
        if (!fs.existsSync(file)) return next();

        try {
          // Vercel-style helpers
          req.query = Object.fromEntries(url.searchParams);
          req.body = await readBody(req);
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (obj) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(obj));
          };
          res.send = (body) => {
            res.end(body);
          };

          // ssrLoadModule re-reads the file on every edit, so changes to
          // api/*.js and lib/*.js are picked up without restarting.
          const mod = await server.ssrLoadModule(`/api/${match[1]}.js`);
          await mod.default(req, res);
        } catch (err) {
          server.config.logger.error(`[dev-api] ${req.url}\n${err?.stack || err}`);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
          }
          res.end(
            JSON.stringify({
              success: false,
              message: "Server error in dev API — see the terminal.",
            })
          );
        }
      });
    },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === "GET" || req.method === "HEAD") return resolve(undefined);
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(undefined);
      }
    });
    req.on("error", reject);
  });
}
