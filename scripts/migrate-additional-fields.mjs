import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";

// Read environment variables from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length === 2) {
      process.env[parts[0].trim()] = parts[1].trim();
    }
  });
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in .env.local.");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
  console.log("Applying additional fields database migration...");

  const statements = [
    // Add payment/link columns to bookings table
    "ALTER TABLE bookings ADD COLUMN total_price INTEGER DEFAULT 0",
    "ALTER TABLE bookings ADD COLUMN advance_paid INTEGER DEFAULT 0",
    "ALTER TABLE bookings ADD COLUMN balance_due INTEGER DEFAULT 0",
    "ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'Pending'",
    "ALTER TABLE bookings ADD COLUMN payment_link TEXT",
    
    // Add location coordinates to bookings table
    "ALTER TABLE bookings ADD COLUMN latitude TEXT",
    "ALTER TABLE bookings ADD COLUMN longitude TEXT",
    
    // Add device/access logs to bookings
    "ALTER TABLE bookings ADD COLUMN ip_address TEXT",
    "ALTER TABLE bookings ADD COLUMN user_agent TEXT",
    "ALTER TABLE bookings ADD COLUMN device_type TEXT",

    // Add device/access logs to leads
    "ALTER TABLE leads ADD COLUMN ip_address TEXT",
    "ALTER TABLE leads ADD COLUMN user_agent TEXT",
    "ALTER TABLE leads ADD COLUMN device_type TEXT",

    // Create feedbacks table for customer feedback & rating
    `CREATE TABLE IF NOT EXISTS feedbacks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      rating       INTEGER NOT NULL DEFAULT 5,
      quote        TEXT NOT NULL,
      location     TEXT,
      service      TEXT,
      approved     INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ];

  for (const stmt of statements) {
    try {
      console.log(`Executing: ${stmt.substring(0, 80)}...`);
      await db.execute(stmt);
    } catch (e) {
      console.warn(`Statement might have already been run or encountered error: ${e.message}`);
    }
  }

  console.log("Migration finished!");
  process.exit(0);
}

main();
