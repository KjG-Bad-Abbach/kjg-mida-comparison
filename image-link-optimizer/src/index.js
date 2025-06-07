const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const { v1: uuidv1 } = require("uuid");

const factorOverSize = 1.5; // Factor to oversize images by 50% before resizing

async function fetchImage(url, currentFolder) {
  const isWebUrl = url.startsWith("http://") || url.startsWith("https://");
  if (isWebUrl) {
    // fetch image from web URL
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const relativePath = "";
    const fileName =
      uuidv1() +
      path.extname(url.replace(/[\?#].*/, "").replace(/.*[\/\\]/, ""));
    return { content: response.data, relativePath, fileName };
  } else {
    // read relative file path
    const imagePath = path.resolve(currentFolder, url);
    const relativePath = path.dirname(
      path.relative(currentFolder, imagePath).replace(/\\/g, "/")
    );
    const fileName = path.basename(imagePath);
    const content = await fs.promises.readFile(imagePath);
    return { content, relativePath, fileName };
  }
}

async function resizeImage(imageBuffer, imageWidth) {
  return await sharp(imageBuffer)
    .resize({ width: imageWidth * factorOverSize, fit: "inside", kernel: sharp.kernel.lanczos3 })
    .toBuffer();
}

async function replaceImageLinksInMarkdown(filePath) {
  const currentFolder = path.dirname(filePath);
  let content = await fs.promises.readFile(filePath, "utf-8");
  const imageLinks = content.match(/!\[.*?\]\((.*?)\)\{(.*?)\}/g) || [];

  for (const link of imageLinks) {
    const url = link.match(/\((.*?)\)/)[1];
    const options = link.match(/\{(.*?)\}/)[1];
    const widthMatches =
      options.match(
        /(?<=[\s\{])(?:width[:=\s]+(["']?))(?<value>\d+)(?=px)?(?!cm|mm|in|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%|\d)\1/g
      ) || [];
    if (widthMatches.length === 1) {
      const widthStr = (widthMatches[0].match(/\d+/) || [])[0];
      const width = parseInt(widthStr, 10);
      if (isNaN(width)) {
        console.warn(`Invalid width value: ${widthStr}`);
        continue;
      }
      if (width < 1 || width > 1000) {
        console.warn(`Width out of range (1-1000): ${width}`);
        continue;
      }

      console.info(`Processing image: ${url} with width: ${width}px`);

      const {
        content: imageBuffer,
        relativePath,
        fileName,
      } = await fetchImage(url, currentFolder);
      const resizedImageBuffer = await resizeImage(imageBuffer, width);

      const fileNameWithoutExt = path.parse(fileName).name;
      const fileExt = path.parse(fileName).ext;
      const newFileName = `${fileNameWithoutExt}-x${width}${fileExt}`;
      const newImagePath = path.join(currentFolder, relativePath, newFileName);
      await fs.promises.writeFile(newImagePath, resizedImageBuffer);

      const description = link.match(/\[(.*?)\]/)[1] || "Optimized Image";
      const newImagePathRelative = path
        .relative(currentFolder, newImagePath)
        .replace(/\\/g, "/");
      // Replace the original link with the new optimized image link
      const newLink = `![${description}](${newImagePathRelative})${options}`;
      content = content.replace(link, newLink);
    }
  }

  await fs.promises.writeFile(filePath, content);
}

const markdownDirectory = path.join(__dirname, "../../docs"); // Adjust the path to your markdown files

async function optimizeImages() {
  const files = fs.readdirSync(markdownDirectory);
  if (!files.length) {
    console.warn("No markdown files found in the specified directory.");
    return;
  }
  console.log(
    `Found ${files.length} markdown files in the directory: ${markdownDirectory}`
  );
  console.log("Starting image optimization...");

  // Read all markdown files in the directory
  for (const file of files) {
    if (file.endsWith(".md")) {
      const filePath = path.join(markdownDirectory, file);
      await replaceImageLinksInMarkdown(filePath);
    }
  }
}

(async () => {
  try {
    await optimizeImages();
    console.log("Image optimization completed successfully.");
  } catch (error) {
    console.error("Error during image optimization:", error);
  }
})();
