/*
 * Bundles the front-end JavaScript using esbuild.
 * Watches for changes in real time during development.
 *
 * Usage:
 *  - Install esbuild (if not already):    npm install esbuild --save-dev
 *  - Launch build with watch:             node build.js
 *  - Output: dist/bundle.js (IIFE format for browser)
 */

const esbuild = require("esbuild");
const path = require("path");

async function buildAndWatch() {
  const ctx = await esbuild.context({
    entryPoints: ["JS/app.js"], // Entry point of the SPA
    bundle: true, // Bundle dependencies together
    outfile: path.join(__dirname, "dist/bundle.js"), // Output location
    format: "iife", // Immediately Invoked Function Expression (browser-friendly)
    sourcemap: true, // Useful for debugging
    minify: false, // Set to true for production
  });

  // Watch mode: rebuild automatically on changes
  await ctx.watch();

  console.log("Watching for file changes...");
}

// Execute the build process
buildAndWatch().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
