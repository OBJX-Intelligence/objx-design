/**
 * Re-import and optimize images from Google Drive directly.
 * Reads from Drive (handles cloud-file placeholders), resizes, writes optimized JPEG.
 * Also updates projects.json to reflect any .webp → .jpg filename changes.
 *
 * Usage: node scripts/optimize-images.mjs
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const DRIVE_ROOT = path.resolve(import.meta.dirname, "..", "DESIGN", "WEB_images");
const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES_DIR = path.join(REPO_ROOT, "public", "images");
const PROJECTS_JSON = path.join(REPO_ROOT, "src", "data", "projects.json");

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 60);
}

function parseFolderName(folderName) {
  const parts = folderName.split(" - ");
  if (parts.length < 2) return { title: folderName.trim() };
  const title = parts.slice(0, -1).join(" - ").trim();
  return { title };
}

let totalBefore = 0;
let totalAfter = 0;
let fileCount = 0;
let errorCount = 0;

async function main() {
  console.log("Re-importing and optimizing images from Google Drive...\n");
  console.log(`Max dimension: ${MAX_DIMENSION}px | JPEG quality: ${JPEG_QUALITY}%\n`);

  // Read existing projects.json to update image paths
  const projects = JSON.parse(fs.readFileSync(PROJECTS_JSON, "utf-8"));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const folders = fs
    .readdirSync(DRIVE_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const folder of folders) {
    const { title } = parseFolderName(folder.name);
    const slug = slugify(title);
    const srcDir = path.join(DRIVE_ROOT, folder.name);
    const destDir = path.join(IMAGES_DIR, slug);

    const files = fs
      .readdirSync(srcDir)
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .sort();

    if (files.length === 0) continue;

    // Clean out existing folder and recreate
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true });
    }
    fs.mkdirSync(destDir, { recursive: true });

    console.log(`${folder.name} (${files.length} files)`);

    const newImages = [];

    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      const ext = path.extname(file).toLowerCase();
      // All output as .jpg
      const outName = ext === ".jpg" || ext === ".jpeg"
        ? file
        : file.replace(/\.(webp|png)$/i, ".jpg");
      const destPath = path.join(destDir, outName);

      try {
        // Read file into buffer first (handles Google Drive cloud files)
        const inputBuffer = fs.readFileSync(srcPath);
        totalBefore += inputBuffer.length;

        const image = sharp(inputBuffer);
        const metadata = await image.metadata();

        let pipeline = sharp(inputBuffer);

        const needsResize =
          (metadata.width && metadata.width > MAX_DIMENSION) ||
          (metadata.height && metadata.height > MAX_DIMENSION);

        if (needsResize) {
          pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        const outputBuffer = await pipeline
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer();

        fs.writeFileSync(destPath, outputBuffer);
        totalAfter += outputBuffer.length;
        fileCount++;

        const sizeBefore = (inputBuffer.length / 1024).toFixed(0);
        const sizeAfter = (outputBuffer.length / 1024).toFixed(0);
        const saved = (((inputBuffer.length - outputBuffer.length) / inputBuffer.length) * 100).toFixed(0);

        if (Number(saved) > 10 || ext !== ".jpg") {
          console.log(`  ${file} → ${outName} | ${sizeBefore}KB → ${sizeAfter}KB (${saved}%)`);
        }

        newImages.push({
          url: `/images/${slug}/${outName}`,
          cropX: 50,
          cropY: 50,
          cropScale: 1,
        });
      } catch (err) {
        console.error(`  ERROR: ${file} — ${err.message}`);
        errorCount++;
        // Still add the unoptimized reference
        newImages.push({
          url: `/images/${slug}/${outName}`,
          cropX: 50,
          cropY: 50,
          cropScale: 1,
        });
      }
    }

    // Update project in the map
    const project = projectMap.get(slug);
    if (project) {
      project.images = newImages;
      project.imageUrl = newImages[0]?.url ?? "";
    }
  }

  // Write updated projects.json
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(projects, null, 2) + "\n");

  const beforeMB = (totalBefore / 1024 / 1024).toFixed(1);
  const afterMB = (totalAfter / 1024 / 1024).toFixed(1);
  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
  const savedPct = totalBefore > 0 ? (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0) : 0;

  console.log(`\nOptimized ${fileCount} files (${errorCount} errors)`);
  console.log(`Total: ${beforeMB}MB → ${afterMB}MB (${savedMB}MB saved, ${savedPct}%)`);
  console.log("\nDone! projects.json updated with new image paths.");
}

main().catch(console.error);
