// lib/roster.js
//
// Loads the two roster CSVs and answers "does this name+email pair match a
// real registration, and if so, what certificate do they get?"
//
// Two files, on purpose:
//   data/participants.csv  ->  name, email               (everyone who took part)
//   data/winners.csv       ->  name, email, position      (only the top 3)
//
// The website never asks a student for their position — it is only ever
// looked up here, server-side, from whichever file their email is actually
// in. A winners.csv match always takes priority over participants.csv.

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const DATA_DIR = path.join(process.cwd(), "data");

function readCsv(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function loadWinners() {
  const map = {};
  for (const row of readCsv("winners.csv")) {
    const email = (row.email || "").trim().toLowerCase();
    const position = (row.position || "").trim().toLowerCase();
    if (!email || !["1st", "2nd", "3rd"].includes(position)) continue;
    map[email] = { name: (row.name || "").trim(), position };
  }
  return map;
}

function loadParticipants() {
  const map = {};
  for (const row of readCsv("participants.csv")) {
    const email = (row.email || "").trim().toLowerCase();
    if (!email) continue;
    map[email] = { name: (row.name || "").trim() };
  }
  return map;
}

/**
 * Returns { name, position } — position is '' for a regular participant,
 * or '1st' / '2nd' / '3rd' for a winner — only if BOTH the email exists in
 * one of the two files AND the typed name matches what's on record there
 * (case-insensitive, whitespace-trimmed). Returns null on no match.
 */
export function findParticipant(name, email) {
  name = (name || "").trim();
  email = (email || "").trim().toLowerCase();
  if (!name || !email) return null;

  const winners = loadWinners();
  if (winners[email] && winners[email].name.toLowerCase() === name.toLowerCase()) {
    return winners[email];
  }

  const participants = loadParticipants();
  if (participants[email] && participants[email].name.toLowerCase() === name.toLowerCase()) {
    return { name: participants[email].name, position: "" };
  }

  return null;
}

export const CERT_LABELS = {
  participation: "Certificate of Participation",
  "1st": "Certificate of Appreciation — 1st Position",
  "2nd": "Certificate of Appreciation — 2nd Position",
  "3rd": "Certificate of Appreciation — 3rd Position",
};

export function certTypeFor(record) {
  return ["1st", "2nd", "3rd"].includes(record.position) ? record.position : "participation";
}
