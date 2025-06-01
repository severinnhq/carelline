// scripts/optimizeImages.js
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

async function optimizeImageFile(inputPath, outputPath) {
  try {
    const buffer = await fs.readFile(inputPath);
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    
    await fs.writeFile(outputPath, optimizedBuffer);
    console.log(`Optimized ${path.basename(inputPath)} -> ${path.basename(outputPath)} (${(optimizedBuffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`Error optimizing ${path.basename(inputPath)}:`, err);
  }
}

async function run() {
    const reviewsFolder = path.join(process.cwd(), 'public', 'uploads', 'reviews');

  const files = await fs.readdir(reviewsFolder);
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      const inputPath = path.join(reviewsFolder, file);
      const outputPath = path.join(reviewsFolder, `optimized_${file}`);
      await optimizeImageFile(inputPath, outputPath);
    }
  }
}

run().catch(err => console.error(err));
