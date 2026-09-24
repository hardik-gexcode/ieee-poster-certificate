// lib/certificate.js
//
// Draws a participant's name onto the correct blank certificate template.
// Uses @napi-rs/canvas — it ships prebuilt binaries per platform (no
// node-gyp / native compiler needed), which is what makes this reliable to
// install on Vercel's build image.
//
// Each certificate type has its own entry in CERTS below (template file,
// script font, ink colour, and where the name sits), so adding or swapping
// a design never touches the drawing code.

import path from "path";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

const ROOT = process.cwd();
const CERT_DIR = path.join(ROOT, "certificates");
const FONT_DIR = path.join(ROOT, "fonts");

// ── Fonts ────────────────────────────────────────────────────────────────
const FONTS = {
  // Same script face as the Canva "Blue & Gold" certificate.
  greatVibes: { file: "GreatVibes-Regular.ttf", family: "Great Vibes" },
  // Used by the (older) 1st/2nd/3rd appreciation templates.
  dancing: { file: "DancingScript-Bold.ttf", family: "Dancing Script" },
};

const registered = new Set();
function ensureFont(key) {
  if (registered.has(key)) return;
  GlobalFonts.registerFromPath(path.join(FONT_DIR, FONTS[key].file), FONTS[key].family);
  registered.add(key);
}

// ── Certificate types ────────────────────────────────────────────────────
//
// line:      [x1, x2, y]  the gold underline the name sits on (pixels on the
//                         template). The name is centred on the middle of
//                         [x1, x2] and shrunk to fit inside 94% of its width.
// startSize: font size (px) used when the name fits — 150px is exactly the
//            size of the sample name on the original Canva design.
// gap:       distance from the baseline up to the underline, as a fraction of
//            the font size (so shrunk names keep the same proportions).
// clear:     minimum clear space between the deepest descender (the tail of
//            a J, y, g, f…) and the underline, as a fraction of the font size.
//            Names with deep tails are nudged up just enough to honour it.
export const CERT_FILES = {
  participation: "participation.png",
  "1st": "appreciation_1st.png",
  "2nd": "appreciation_2nd.png",
  "3rd": "appreciation_3rd.png",
};

const CERTS = {
  participation: {
    font: "greatVibes",
    color: "rgb(131, 93, 0)", // the gold-brown of the "Mayank Katariya" sample
    line: [438, 1561, 818],
    startSize: 150,
    minSize: 44,
    gap: 61 / 150,
    clear: 12 / 150,
  },
  "1st": oldAppreciation(1014),
  "2nd": oldAppreciation(1014),
  "3rd": oldAppreciation(1014),
};

function oldAppreciation(bottom) {
  return {
    font: "dancing",
    color: "rgb(26, 43, 76)",
    line: [852, 1547, bottom],
    startSize: 70,
    minSize: 24,
    gap: 10 / 70,
    clear: 0,
  };
}

// Largest size (stepping down by 2px) at which the name's *ink* fits maxWidth.
function fitFont(ctx, family, text, maxWidth, startSize, minSize) {
  let size = startSize;
  let m;
  for (; size >= minSize; size -= 2) {
    ctx.font = `${size}px "${family}"`;
    m = ctx.measureText(text);
    if (m.actualBoundingBoxLeft + m.actualBoundingBoxRight <= maxWidth) break;
  }
  size = Math.max(size, minSize);
  ctx.font = `${size}px "${family}"`;
  return { size, metrics: ctx.measureText(text) };
}

export async function generateCertificate(name, certType) {
  const cfg = CERTS[certType];
  ensureFont(cfg.font);

  const img = await loadImage(path.join(CERT_DIR, CERT_FILES[certType]));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const [x1, x2, lineY] = cfg.line;
  const maxWidth = (x2 - x1) * 0.94;
  const { size, metrics } = fitFont(
    ctx,
    FONTS[cfg.font].family,
    name,
    maxWidth,
    cfg.startSize,
    cfg.minSize
  );

  // Centre on the visible ink (script swashes overhang the advance width, so
  // centring by advance width would make some names look off-centre).
  const inkW = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const x = (x1 + x2) / 2 - inkW / 2 + metrics.actualBoundingBoxLeft;
  const y = Math.min(
    lineY - cfg.gap * size,
    lineY - cfg.clear * size - metrics.actualBoundingBoxDescent
  );

  ctx.fillStyle = cfg.color;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(name, x, y);

  return canvas.encode("png");
}
