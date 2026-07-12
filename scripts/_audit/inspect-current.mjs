import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "https://rutaru.vercel.app";
const OUT_DIR = process.env.AUDIT_OUT_DIR;
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

const shots = [
  { url: "/", label: "home-desktop", width: 1440, height: 1400, full: true },
  { url: "/", label: "home-mobile", width: 375, height: 1400, full: true },
  { url: "/rutas", label: "categoria-desktop", width: 1440, height: 900, full: false },
  { url: "/ruta/cantona", label: "detalle-calendario-desktop", width: 1280, height: 1100, full: false },
  { url: "/ruta/cantona", label: "detalle-calendario-mobile", width: 375, height: 1400, full: true },
];

for (const s of shots) {
  const context = await browser.newContext({ viewport: { width: s.width, height: s.height } });
  const tab = await context.newPage();
  await tab.goto(`${BASE_URL}${s.url}`, { waitUntil: "load", timeout: 30000 });
  await tab.waitForTimeout(1000);
  await tab.screenshot({ path: `${OUT_DIR}/${s.label}.png`, fullPage: s.full });
  await context.close();
  console.log(`done: ${s.label}`);
}

// hamburguesa abierta en mobile
{
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const tab = await context.newPage();
  await tab.goto(`${BASE_URL}/`, { waitUntil: "load", timeout: 30000 });
  await tab.waitForTimeout(800);
  const btn = await tab.$("button[aria-label='Abrir menú']");
  if (btn) {
    await btn.click();
    await tab.waitForTimeout(400);
    await tab.screenshot({ path: `${OUT_DIR}/hamburguesa-mobile.png` });
  }
  await context.close();
  console.log("done: hamburguesa-mobile");
}

// chatbot abierto
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const tab = await context.newPage();
  await tab.goto(`${BASE_URL}/`, { waitUntil: "load", timeout: 30000 });
  await tab.waitForTimeout(800);
  const btn = await tab.$("button[aria-label*='chat']");
  if (btn) {
    await btn.click();
    await tab.waitForTimeout(400);
    await tab.screenshot({ path: `${OUT_DIR}/chatbot-abierto.png` });
  }
  await context.close();
  console.log("done: chatbot-abierto");
}

await browser.close();
