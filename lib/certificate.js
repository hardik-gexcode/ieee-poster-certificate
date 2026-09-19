// lib/certificate.js
//
// Draws a participant's name onto the correct blank certificate template.
// Uses @napi-rs/canvas — it ships prebuilt binaries per platform (no
// node-gyp / native compiler needed), which is what makes this reliable to
// install on Vercel's build image.

import path from "path";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

const CERT_DIR = path.join(process.cwd(), "certificates");
const FONT_PATH = path.join(process.cwd(), "fonts", "DancingScript-Bold.ttf");

export const CERT_FILES = {
  participation: "participation.png",
  "1st": "appreciation_1st.png",
  "2nd": "appreciation_2nd.png",
  "3rd": "appreciation_3rd.png",
};

// Pixel bounding box of the blank name-line on each 2400px-wide template.
// The name is centered horizontally in the box and sits just above the
// underline at the bottom of the box.
const NAME_BOX = {
  participation: [852, 923, 1547, 975],
  "1st": [852, 962, 1547, 1014],
  "2nd": [852, 962, 1547, 1014],
  "3rd": [852, 962, 1547, 1014],
};

const NAME_COLOR = "rgb(26, 43, 76)"; // matches the certificate's navy headings
const FONT_FAMILY = "Dancing Script";

let fontReady = false;
function ensureFont() {
  if (!fontReady) {
    GlobalFonts.registerFromPath(FONT_PATH, FONT_FAMILY);
    fontReady = true;
  }
}

function fitFont(ctx, text, maxWidth, startSize = 70, minSize = 24) {
  let size = startSize;
  let metrics;
  while (size >= minSize) {
    ctx.font = `${size}px "${FONT_FAMILY}"`;
    metrics = ctx.measureText(text);
    if (metrics.width <= maxWidth) break;
    size -= 2;
  }
  return metrics;
}

export async function generateCertificate(name, certType) {
  ensureFont();

  const certPath = path.join(CERT_DIR, CERT_FILES[certType]);
  const img = await loadImage(certPath);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const [x1, y1, x2, y2] = NAME_BOX[certType];
  const maxWidth = (x2 - x1) * 0.94;
  const metrics = fitFont(ctx, name, maxWidth);

  ctx.fillStyle = NAME_COLOR;
  ctx.textBaseline = "alphabetic";
  const tx = (x1 + x2) / 2 - metrics.width / 2;
  const ty = y2 - 10; // sit just above the underline
  ctx.fillText(name, tx, ty);

  return canvas.encode("png");
}
