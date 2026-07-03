import { S3Client, ListObjectsV2Command, CopyObjectCommand } from "@aws-sdk/client-s3";
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

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("Missing R2 configuration environment variables.");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const sourcePrefix = "laccadives-coral-trails";
const destPrefix = "clean-world-solutions";

async function main() {
  console.log(`Listing files under prefix '${sourcePrefix}' in bucket '${bucket}'...`);
  
  try {
    const listResponse = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: sourcePrefix,
      })
    );

    const contents = listResponse.Contents || [];
    if (contents.length === 0) {
      console.log("No files found to copy.");
      return;
    }

    console.log(`Found ${contents.length} files. Copying to '${destPrefix}'...`);

    for (const file of contents) {
      const sourceKey = file.Key;
      if (!sourceKey) continue;
      
      // Calculate new key
      const destKey = sourceKey.replace(sourcePrefix, destPrefix);
      
      console.log(`Copying: ${sourceKey} -> ${destKey}`);

      await client.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${sourceKey}`,
          Key: destKey,
        })
      );
    }

    console.log("R2 files copied successfully!");
  } catch (error) {
    console.error("Error copying R2 files:", error);
  }
}

main();
