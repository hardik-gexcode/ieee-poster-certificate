// api/certificate.js
//
// GET ?name=...&email=... -> re-verifies the pair (never trusts a cert type
// passed in the URL) and streams back a personalised PNG, generated on the
// fly by drawing the name onto the correct blank template.

import { findParticipant, certTypeFor } from "../lib/roster.js";
import { generateCertificate } from "../lib/certificate.js";

export default async function handler(req, res) {
  const { name, email } = req.query || {};

  const record = findParticipant(name, email);
  if (!record) {
    res.status(404).json({ success: false, message: "Verification failed." });
    return;
  }

  const certType = certTypeFor(record);

  try {
    const buffer = await generateCertificate(record.name, certType);
    const filename = record.name.trim().replace(/\s+/g, "_") + "_Certificate.png";

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not generate certificate." });
  }
}
