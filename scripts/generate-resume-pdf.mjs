/**
 * Renders resume.html (traditional résumé layout) to Kevin_Maroney_Resume.pdf.
 * Keep résumé copy aligned with index.html; edit resume.html when you refresh the PDF.
 *
 * From repo root:
 *   npm install
 *   PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium
 *   npm run build:pdf
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/* Prefer repo-local browsers so Cursor/sandbox PLAYWRIGHT_* env does not break runs. */
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, ".playwright-browsers");

const { chromium } = await import("playwright");

function contentType(file) {
  const ext = path.extname(file);
  const map = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
  };
  return map[ext] || "application/octet-stream";
}

function serveStatic(publicDir) {
  const server = http.createServer((req, res) => {
    const raw = (req.url || "/").split("?")[0];
    let rel = decodeURIComponent(raw === "/" ? "index.html" : raw.slice(1));
    if (rel.includes("..")) {
      res.writeHead(403);
      res.end();
      return;
    }
    const file = path.join(publicDir, rel);
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.setHeader("Content-Type", contentType(file));
      res.end(data);
    });
  });
  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

const server = await serveStatic(root);
const { port } = server.address();
const url = `http://127.0.0.1:${port}/resume.html`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });

const outPath = path.join(root, "Kevin_Maroney_Resume.pdf");
await page.pdf({
  path: outPath,
  format: "Letter",
  printBackground: false,
  margin: { top: "0.5in", right: "0.65in", bottom: "0.5in", left: "0.65in" },
});

await browser.close();
await new Promise((r) => server.close(r));
console.log("Wrote", outPath);
