import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// Read .env.local to load credentials
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
  console.log("Restoring default services list in Turso database...");
  try {
    // 1. Clear services table
    console.log("Clearing 'services' table...");
    await db.execute("DELETE FROM services;");
    
    // Reset SQL auto-increment sequence
    try {
      await db.execute("DELETE FROM sqlite_sequence WHERE name='services';");
    } catch (e) {
      // Ignored if sequence table doesn't exist
    }

    // 2. Read migration SQL statements
    const sqlPath = path.resolve(process.cwd(), "src/db/migrations/0004_services.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");
    
    // Parse the INSERT statement
    const insertStartIndex = sqlContent.indexOf("INSERT INTO services");
    if (insertStartIndex === -1) {
      throw new Error("Could not find INSERT INTO services statement in migration file.");
    }
    const insertSql = sqlContent.substring(insertStartIndex);

    console.log("Seeding default services from 0004_services.sql...");
    await db.execute(insertSql);

    console.log("Restore complete! Services table reset successfully.");
  } catch (error) {
    console.error("Error restoring services:", error);
  }
}

main();
