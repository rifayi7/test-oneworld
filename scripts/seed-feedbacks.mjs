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

const DEFAULT_FEEDBACKS = [
  {
    name: "Ragesh Nair",
    rating: 5,
    quote: "Excellent water tank cleaning service. The team arrived on time with professional machinery. The tank is now completely spotless and sanitized.",
    location: "Kochi, Ernakulam",
    service: "Water Tank Cleaning"
  },
  {
    name: "Anitha Kurian",
    rating: 5,
    quote: "Very professional team. They cleared the wild grass and creepers in my compound wall within hours. Highly reliable and transparent pricing.",
    location: "Kottayam",
    service: "Grass Cutting & Weed Removal"
  },
  {
    name: "Deepak Menon",
    rating: 5,
    quote: "Affordable pricing and timely service. They set up my CCTV security camera network and explained the mobile app interface very clearly.",
    location: "Trivandrum",
    service: "CCTV Installation"
  }
];

async function main() {
  console.log("Seeding feedbacks table...");
  
  for (const item of DEFAULT_FEEDBACKS) {
    try {
      await db.execute({
        sql: "INSERT INTO feedbacks (name, rating, quote, location, service, approved) VALUES (?, ?, ?, ?, ?, 1)",
        args: [item.name, item.rating, item.quote, item.location, item.service]
      });
      console.log(`Seeded feedback from ${item.name}`);
    } catch (e) {
      console.error(`Failed to seed feedback: ${e.message}`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main();
