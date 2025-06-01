// scripts/replaceOriginals.js
const fs = require('fs/promises');
const path = require('path');

async function replaceOriginals() {
  const reviewsFolder = path.join(process.cwd(), 'public', 'uploads', 'reviews');
  const files = await fs.readdir(reviewsFolder);
  
  for (const file of files) {
    if (file.startsWith('optimized_') && file.toLowerCase().endsWith('.png')) {
      const originalName = file.replace('optimized_', '');
      const optimizedPath = path.join(reviewsFolder, file);
      const originalPath = path.join(reviewsFolder, originalName);

      // Delete the original file (if it exists)
      try {
        await fs.unlink(originalPath);
        console.log(`Deleted original ${originalName}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Error deleting ${originalName}:`, err);
        }
      }

      // Rename optimized file to original name
      await fs.rename(optimizedPath, originalPath);
      console.log(`Renamed ${file} -> ${originalName}`);
    }
  }

  console.log('Replacement complete!');
}

replaceOriginals().catch(console.error);
