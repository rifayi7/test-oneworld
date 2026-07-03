import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// Read .env.local to load credentials if running locally
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const parts = line.trim().split("=");
    if (parts.length >= 2 && !parts[0].startsWith("#")) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      process.env[key] = val;
    }
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL environment variable.");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
  console.log("Updating service image URLs in the Turso/SQLite database...");
  try {
    const result = await db.execute({
      sql: "UPDATE services SET img = REPLACE(img, 'laccadives-coral-trails', 'clean-world-solutions')"
    });
    console.log(`Database updated successfully! Affected rows: ${result.rowsAffected || 0}`);
  } catch (error) {
    console.error("Database update error:", error);
  }
}

main();
