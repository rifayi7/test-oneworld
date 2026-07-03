import fs from "fs";
import path from "path";

const logPath = "C:/Users/User/.gemini/antigravity-cli/brain/d0b8ea1d-d1b7-48f2-8989-8b7a5b8d0c80/.system_generated/logs/transcript_full.jsonl";
if (!fs.existsSync(logPath)) {
  console.log("Transcript not found.");
  process.exit(1);
}

const content = fs.readFileSync(logPath, "utf8");
// Regex to match R2 URLs containing services
const regex = /https:\/\/pub-[^\s\"]+\/(?:clean-world-solutions|laccadives-coral-trails)\/services\/[^\s\"]+/g;
const matches = content.match(regex) || [];
const unique = [...new Set(matches)];
console.log(JSON.stringify(unique, null, 2));
