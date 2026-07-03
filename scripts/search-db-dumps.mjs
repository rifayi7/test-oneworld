import fs from "fs";
import path from "path";

const logPath = "C:/Users/User/.gemini/antigravity-cli/brain/d0b8ea1d-d1b7-48f2-8989-8b7a5b8d0c80/.system_generated/logs/transcript_full.jsonl";
const outputPath = path.resolve(process.cwd(), "scripts/found-db-dumps.txt");

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.split("\n");
  let output = "=== DATABASE DUMPS FOUND IN HISTORY ===\n\n";
  let found = 0;
  for (const line of lines) {
    if (line.toLowerCase().includes("select") && line.toLowerCase().includes("services") && line.toLowerCase().includes("img")) {
      output += `\n--- Match ${found + 1} (step_index in log) ---\n`;
      output += line + "\n";
      found++;
    }
  }
  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`Search complete! Written to scripts/found-db-dumps.txt. Matches found: ${found}`);
} else {
  console.log("Transcript not found.");
}
