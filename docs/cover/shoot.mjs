import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cover = "file://" + path.join(__dirname, "cover.html").replace(/\\/g, "/");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
await page.goto(cover, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(__dirname, "..", "screenshots", "xhs-cover.png") });
await browser.close();
console.log("wrote docs/screenshots/xhs-cover.png");
