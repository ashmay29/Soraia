#!/usr/bin/env node
/**
 * Creates indexes and seeds the three fixed accounts.
 *
 * Idempotent: re-running will NOT reset an existing user's password. Pass --reset
 * <email> to deliberately issue a new temporary password for one account.
 *
 *   pnpm seed
 *   pnpm seed --reset soraia@eigensu.in
 */

import { MongoClient } from "mongodb";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const ACCOUNTS = [
  { email: "admin@eigensu.in", name: "Admin", role: "admin" },
  { email: "soraia@eigensu.in", name: "Soraia Staff 1", role: "staff" },
  { email: "soraia2@eigensu.in", name: "Soraia Staff 2", role: "staff" },
];

/** Readable temp password — no ambiguous characters, retyped from a screen once. */
function tempPassword() {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run via: pnpm seed");
  process.exit(1);
}

const resetIdx = process.argv.indexOf("--reset");
const resetEmail = resetIdx !== -1 ? process.argv[resetIdx + 1]?.toLowerCase() : null;

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB ?? "soraia_payments");

console.log(`\n  database: ${db.databaseName}\n`);

// ── indexes ───────────────────────────────────────────────────────────────────

const users = db.collection("users");
const links = db.collection("paymentLinks");
const events = db.collection("gatewayEvents");

await users.createIndex({ email: 1 }, { unique: true });
await links.createIndex({ token: 1 }, { unique: true });
await links.createIndex(
  { "attempts.merchantTxnNo": 1 },
  { unique: true, partialFilterExpression: { "attempts.merchantTxnNo": { $exists: true } } }
);
await links.createIndex({ status: 1, expiresAt: 1 });
await links.createIndex({ createdBy: 1, createdAt: -1 });
await events.createIndex({ merchantTxnNo: 1, receivedAt: -1 });

console.log("  ✓ indexes ensured");

// ── accounts ──────────────────────────────────────────────────────────────────

const issued = [];

for (const account of ACCOUNTS) {
  const email = account.email.toLowerCase();
  const existing = await users.findOne({ email });

  if (existing && resetEmail !== email) {
    console.log(`  · ${email.padEnd(22)} exists (${existing.role}) — unchanged`);
    continue;
  }

  const password = tempPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await users.updateOne(
    { email },
    {
      $set: { passwordHash, mustChangePassword: true, isActive: true },
      $setOnInsert: {
        email,
        name: account.name,
        role: account.role,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  issued.push({ email, role: account.role, password });
  console.log(`  ${existing ? "↻" : "+"} ${email.padEnd(22)} ${existing ? "password reset" : `created (${account.role})`}`);
}

if (issued.length) {
  console.log("\n  ┌─ TEMPORARY PASSWORDS — shown once, not stored anywhere ─┐");
  for (const u of issued) {
    console.log(`  │  ${u.email.padEnd(22)} ${u.password}`);
  }
  console.log("  └──────────────────────────────────────────────────────────┘");
  console.log("\n  Send each person their own password over a private channel.");
  console.log("  All accounts are flagged mustChangePassword on first login.\n");
} else {
  console.log("\n  No passwords issued. Use --reset <email> to force a new one.\n");
}

await client.close();
