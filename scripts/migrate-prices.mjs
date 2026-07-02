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
  const migrationFile = path.join(process.cwd(), "src/db/migrations/0005_prices.sql");
  if (!fs.existsSync(migrationFile)) {
    console.error("Migration file not found:", migrationFile);
    process.exit(1);
  }

  console.log("Reading migration 0005_prices.sql...");
  const sql = fs.readFileSync(migrationFile, "utf8");

  // Strip SQL comments line-by-line
  const sqlWithoutComments = sql
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("--");
      return idx !== -1 ? line.substring(0, idx) : line;
    })
    .join("\n");

  const statements = sqlWithoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);
  
  try {
    for (const stmt of statements) {
      console.log(`Executing: ${stmt}...`);
      await db.execute(stmt);
    }
    console.log("Migration executed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
