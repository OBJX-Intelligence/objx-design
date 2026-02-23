/**
 * One-time import script: copies project images from Google Drive
 * into public/images/ and generates projects.json + categories.json
 *
 * Usage: node scripts/import-from-drive.mjs
 */

import fs from "fs";
import path from "path";

const DRIVE_ROOT = "I:/My Drive/100-OBJX-BRAND/website";
const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES_DIR = path.join(REPO_ROOT, "public", "images");
const PROJECTS_JSON = path.join(REPO_ROOT, "src", "data", "projects.json");
const CATEGORIES_JSON = path.join(REPO_ROOT, "src", "data", "categories.json");

/* ─── Category mapping (Drive suffix → site category) ─── */

const CATEGORY_MAP = {
  "Missing Middle": "Missing Middle Residential",
  "Misisng Middle": "Missing Middle Residential", // typo in Drive
  "Custom Residential": "Custom Residential",
  "Custom Residential + Missing Middle": "Missing Middle Residential",
  "Residential Interiors": "Residential Interiors",
  "Residdential Interiors": "Residential Interiors", // typo in Drive
  "Hospitality": "Hospitality",
  "Commercial Office": "Commercial Interiors",
  "Feasibility": "Conceptual Planning + Feasibility",
  "Concept": "Conceptual Planning + Feasibility",
};

const CATEGORIES = [
  { id: "seed-1", name: "Missing Middle Residential", description: "", orderIndex: 1 },
  { id: "seed-2", name: "Custom Residential", description: "", orderIndex: 2 },
  { id: "seed-3", name: "Residential Interiors", description: "", orderIndex: 3 },
  { id: "seed-4", name: "Hospitality", description: "", orderIndex: 4 },
  { id: "seed-5", name: "Commercial Interiors", description: "", orderIndex: 5 },
  { id: "seed-6", name: "Conceptual Planning + Feasibility", description: "", orderIndex: 6 },
];

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/* ─── Helpers ─── */

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

function parseFolderName(folderName) {
  // Pattern: "Project Name - Category"
  // Special case: "Rare Society - Solana Beach - Hospitality" (double dash)
  // Strategy: split on " - " and take last segment as category
  const parts = folderName.split(" - ");
  if (parts.length < 2) {
    return { title: folderName.trim(), rawCategory: "Unknown" };
  }
  const rawCategory = parts[parts.length - 1].trim();
  const title = parts.slice(0, -1).join(" - ").trim();
  return { title, rawCategory };
}

/* ─── Main ─── */

console.log("Starting import from Google Drive...\n");

// Ensure output dirs exist
fs.mkdirSync(IMAGES_DIR, { recursive: true });
fs.mkdirSync(path.dirname(PROJECTS_JSON), { recursive: true });

const folders = fs
  .readdirSync(DRIVE_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));

console.log(`Found ${folders.length} project folders\n`);

const projects = [];
let orderIndex = 1;
let totalImages = 0;

for (const folder of folders) {
  const { title, rawCategory } = parseFolderName(folder.name);
  const category = CATEGORY_MAP[rawCategory];

  if (!category) {
    console.warn(`  WARNING: Unknown category "${rawCategory}" for "${title}" — skipping`);
    continue;
  }

  const slug = slugify(title);
  const srcDir = path.join(DRIVE_ROOT, folder.name);
  const destDir = path.join(IMAGES_DIR, slug);

  // Get image files
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.warn(`  WARNING: No images in "${folder.name}" — skipping`);
    continue;
  }

  // Create destination folder
  fs.mkdirSync(destDir, { recursive: true });

  // Copy images
  const images = [];
  for (const file of files) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    fs.copyFileSync(src, dest);
    images.push({
      url: `/images/${slug}/${file}`,
      cropX: 50,
      cropY: 50,
      cropScale: 1,
    });
  }

  totalImages += files.length;

  projects.push({
    id: slug,
    title,
    description: "",
    imageUrl: images[0].url,
    images,
    category,
    medium: "",
    year: "",
    orderIndex: orderIndex++,
    published: true,
    showOnLanding: false,
  });

  console.log(`  ✓ ${title} (${category}) — ${files.length} images → public/images/${slug}/`);
}

// Write projects.json
fs.writeFileSync(PROJECTS_JSON, JSON.stringify(projects, null, 2) + "\n");
console.log(`\nWrote ${projects.length} projects to src/data/projects.json`);

// Write categories.json
fs.writeFileSync(CATEGORIES_JSON, JSON.stringify(CATEGORIES, null, 2) + "\n");
console.log(`Wrote ${CATEGORIES.length} categories to src/data/categories.json`);

console.log(`\nTotal: ${projects.length} projects, ${totalImages} images copied`);
console.log("Done! Run 'npm run build' to verify, then commit and deploy.");
