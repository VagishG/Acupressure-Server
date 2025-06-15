import fs from "fs-extra";
import path from "path";
import sharp from "sharp";

// Paths (Update these to match your actual folder paths)
const sourceDir = "D:/Website/Accupressure/books";
const outputDir = "D:/Website/Accupressure/compressed_books";

// Function to compress or copy original if corrupted
async function compressAndSaveImage(inputPath: string, outputPath: string): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(outputPath)); // Ensure output folder exists

    await sharp(inputPath)
      .jpeg({ quality: 90 }) // Adjust quality as needed
      .toFile(outputPath);

    console.log(`✅ Compressed: ${outputPath}`);
  } catch (err) {
    console.warn(`⚠️ Compression failed for: ${inputPath} — copying original file.`);

    // Copy original file instead
    await fs.copy(inputPath, outputPath);
    console.log(`📁 Copied original: ${outputPath}`);
  }
}

// Main function to process all folders and images
async function processAllBooks() {
  try {
    const bookFolders = await fs.readdir(sourceDir);

    for (const folder of bookFolders) {
      const fullFolderPath = path.join(sourceDir, folder);
      const outputFolderPath = path.join(outputDir, folder);

      const stat = await fs.stat(fullFolderPath);
      if (!stat.isDirectory()) continue; // Skip files

      const files = await fs.readdir(fullFolderPath);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (![".jpg", ".jpeg", ".png"].includes(ext)) continue; // Skip non-image files

        const inputFile = path.join(fullFolderPath, file);
        const outputFile = path.join(outputFolderPath, file);

        await compressAndSaveImage(inputFile, outputFile);
      }
    }

    console.log("🎉 All books processed.");
  } catch (err) {
    console.error("❌ Error processing books:", err);
  }
}

// Run the script
processAllBooks();
