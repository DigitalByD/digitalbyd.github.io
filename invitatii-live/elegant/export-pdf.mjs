import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeNodeModules =
  "C:\\Users\\darya\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(runtimeNodeModules, "playwright"));
const { PDFDocument } = require(path.join(runtimeNodeModules, "pdf-lib"));

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const pagesToExport = [
  { url: "/index.html", label: "Invitatie" },
  { url: "/multumim.html", label: "Confirmare" },
  { url: "/nu.html", label: "Refuz" }
];

const outputFile = path.join(__dirname, "invitatie-elegant-completa.pdf");

function getContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function startStaticServer(rootDir) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
      let relativePath = decodeURIComponent(requestUrl.pathname);

      if (relativePath === "/") {
        relativePath = "/index.html";
      }

      const resolvedPath = path.resolve(rootDir, `.${relativePath}`);

      if (!resolvedPath.startsWith(rootDir)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }

      const fileBuffer = await fs.readFile(resolvedPath);
      res.writeHead(200, { "Content-Type": getContentType(resolvedPath) });
      res.end(fileBuffer);
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Nu am putut porni serverul local pentru export.");
  }

  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

async function resolveEdgePath() {
  for (const candidate of edgeCandidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error("Microsoft Edge nu a fost găsit pentru exportul PDF.");
}

async function exportPages() {
  const edgePath = await resolveEdgePath();
  const { server, origin } = await startStaticServer(__dirname);
  const browser = await chromium.launch({
    headless: true,
    executablePath: edgePath
  });

  try {
    const mergedPdf = await PDFDocument.create();

    for (const pageConfig of pagesToExport) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1800 },
        deviceScaleFactor: 1
      });

      await page.emulateMedia({ media: "screen" });
      await page.goto(`${origin}${pageConfig.url}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);

      const pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0"
        }
      });

      const currentPdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(currentPdf, currentPdf.getPageIndices());

      copiedPages.forEach((copiedPage) => {
        mergedPdf.addPage(copiedPage);
      });

      await page.close();
      console.log(`Exportat: ${pageConfig.label}`);
    }

    const finalBytes = await mergedPdf.save();
    await fs.writeFile(outputFile, finalBytes);
    console.log(`PDF creat: ${outputFile}`);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

exportPages().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
