import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
const OUT_DIR = process.env.AUDIT_OUT_DIR;
if (!OUT_DIR) throw new Error("Set AUDIT_OUT_DIR");
mkdirSync(OUT_DIR, { recursive: true });

const widths = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "mobile-375", width: 375, height: 812 },
];

const browser = await chromium.launch();
for (const vp of widths) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const tab = await context.newPage();
  await tab.goto(`${BASE_URL}/rutas`, { waitUntil: "load", timeout: 15000 });
  await tab.waitForTimeout(500);
  const header = await tab.$("header");
  await header.screenshot({ path: `${OUT_DIR}/navbar-${vp.name}.png` });
  const overflowPx = await tab.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  console.log(`${vp.name}: overflow=${overflowPx}px`);
  await context.close();
}
await browser.close();
console.log("done");
