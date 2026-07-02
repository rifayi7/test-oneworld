import fs from "fs";
import path from "path";
import { scryptSync, randomBytes } from "crypto";
import { createClient } from "@libsql/client";

// Read environment variables
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

// Helper scrypt hash password matching src/lib/users.ts logic
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node scripts/create-admin.mjs <email> <password> [name]");
    process.exit(1);
  }

  const email = args[0].toLowerCase().trim();
  const password = args[1];
  const name = args[2] || "Root Administrator";

  console.log(`Bootstrapping admin user account: ${email}...`);
  const hashed = hashPassword(password);

  try {
    // Check if user already exists
    const checkUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email]
    });

    if (checkUser.rows.length > 0) {
      console.error(`Error: User with email '${email}' already exists.`);
      process.exit(1);
    }

    // Insert new root admin user with admin role
    await db.execute({
      sql: "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')",
      args: [email, name, hashed]
    });

    console.log(`Admin user successfully seeded! You can now sign in at /admin/login.`);
    process.exit(0);
  } catch (error) {
    console.error("Database seed failed:", error);
    process.exit(1);
  }
}

main();
