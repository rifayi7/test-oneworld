import fs from "fs";
import path from "path";

const targetDir = path.resolve(process.cwd(), "src");

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".sql")) {
      callback(filePath);
    }
  }
}

function main() {
  console.log("Replacing 'laccadives-coral-trails' with 'clean-world-solutions' in src/...");
  walkDir(targetDir, (filePath) => {
    let content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("laccadives-coral-trails")) {
      console.log(`Updating file: ${filePath}`);
      const updated = content.replaceAll("laccadives-coral-trails", "clean-world-solutions");
      fs.writeFileSync(filePath, updated, "utf-8");
    }
  });

  console.log("Replacement complete!");
}

main();
