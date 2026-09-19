// api/verify.js
//
// POST { name, email } -> checks the pair against the roster (winners.csv
// checked first, then participants.csv) and reports back which certificate,
// if any, this person is entitled to. Never accepts a position from the
// client — that only ever comes from server-side lookup.

import { findParticipant, certTypeFor, CERT_LABELS } from "../lib/roster.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const { name, email } = req.body || {};

  if (!name || !email) {
    res.status(400).json({ success: false, message: "Please enter both your name and email." });
    return;
  }

  const record = findParticipant(name, email);
  if (!record) {
    res.status(404).json({
      success: false,
      message:
        "We couldn't find a matching registration. Double-check the spelling of your name and the email you registered with.",
    });
    return;
  }

  const certType = certTypeFor(record);
  res.status(200).json({
    success: true,
    name: record.name,
    certType,
    label: CERT_LABELS[certType],
  });
}
