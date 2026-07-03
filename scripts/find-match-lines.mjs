import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "scripts/found-db-dumps.txt");
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  console.log("Searching found-db-dumps.txt for whatsapp-image references...");
  for (const line of lines) {
    if (line.includes("whatsapp-image-")) {
      // Find the JSON block and print it
      console.log("\nFound match line:");
      console.log(line.substring(0, 4000));
    }
  }
} else {
  console.log("File not found.");
}
