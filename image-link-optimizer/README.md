# Image Link Optimizer

This project provides a script to optimize image links found in markdown files. It replaces the original image links with optimized versions based on specified dimensions, ensuring that the images are appropriately sized for web use.

## Project Structure

```
image-link-optimizer
├── src
│   ├── index.js          # Entry point for the image optimization script
│   └── utils
│       └── imageProcessor.js  # Functions for processing images
├── scripts
│   └── optimize-images.js # Script to run in the build pipeline
├── package.json           # npm configuration file
└── README.md              # Project documentation
```

## Installation

To get started, clone the repository and install the necessary dependencies:

```bash
cd image-link-optimizer
npm install
```

## Usage

To optimize images in your markdown files, run the following command:

```bash
npm run optimize-images
```

This command will invoke the `optimize-images.js` script, which will search for image links in your markdown files, fetch the images, resize them to the specified dimensions, and replace the original links with the optimized versions.

## Functionality

- **Search for Image Links**: The script scans all markdown files in the project directory for image links.
- **Image Fetching and Resizing**: It fetches the images and resizes them based on the specified width (e.g., 500 pixels).
- **Link Replacement**: The original image links in the markdown files are replaced with the optimized image links.
