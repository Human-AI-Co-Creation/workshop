import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(import.meta.dirname, "..");
const input = path.resolve(root, process.argv[2] ?? "poster.html");
const output = path.resolve(root, process.argv[3] ?? "poster-puppeteer.pdf");
const chromePath =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: [
    "--disable-background-networking",
    "--disable-component-update",
    "--font-render-hinting=none",
  ],
});

try {
  const page = await browser.newPage();

  await page.setViewport({
    width: 1123,
    height: 1587,
    deviceScaleFactor: 2,
  });

  await page.goto(pathToFileURL(input).href, {
    waitUntil: ["load", "networkidle0"],
    timeout: 120000,
  });

  await page.evaluate(async () => {
    await document.fonts?.ready;
    const images = Array.from(document.images);
    await Promise.all(
      images.map((image) => {
        if (image.complete) return undefined;
        return new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        });
      }),
    );
  });

  await page.addStyleTag({
    content: `
      @media print {
        *, *::before, *::after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  });

  await page.pdf({
    path: output,
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    scale: 1,
    timeout: 120000,
  });
} finally {
  await browser.close();
}

console.log(output);
