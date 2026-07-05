import sharp from "sharp";
import path from "path";
import fs from "fs";

const source1 = "C:/Users/User/.gemini/antigravity-cli/brain/2551e67f-0e7a-4aa8-93fc-e373cd89feca/uploaded_media_0_1783236990775.png";
const source2 = "C:/Users/User/.gemini/antigravity-cli/brain/2551e67f-0e7a-4aa8-93fc-e373cd89feca/uploaded_media_1_1783236990775.png";

const dest1 = path.resolve(process.cwd(), "public/services/common-banner-1.webp");
const dest2 = path.resolve(process.cwd(), "public/services/common-banner-2.webp");

async function main() {
  try {
    console.log("Optimizing and converting banners to webp...");
    
    // Check if target directory exists
    const destDir = path.dirname(dest1);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Process first image
    if (fs.existsSync(source1)) {
      await sharp(source1)
        .webp({ quality: 80 })
        .toFile(dest1);
      console.log(`Saved optimized image 1 to ${dest1}`);
    } else {
      console.error(`Source image 1 not found at ${source1}`);
    }

    // Process second image
    if (fs.existsSync(source2)) {
      await sharp(source2)
        .webp({ quality: 80 })
        .toFile(dest2);
      console.log(`Saved optimized image 2 to ${dest2}`);
    } else {
      console.error(`Source image 2 not found at ${source2}`);
    }

    console.log("Banner optimization complete!");
  } catch (error) {
    console.error("Error during banner optimization:", error);
  }
}

main();
