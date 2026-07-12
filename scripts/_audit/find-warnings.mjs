import { chromium } from "playwright";
import { PAGES } from "./pages.mjs";
import { getCookiesFor } from "./login.mjs";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3001";

const roles = [...new Set(PAGES.map((p) => p.role).filter(Boolean))];
const cookiesByRole = {};
for (const role of roles) {
  cookiesByRole[role] = await getCookiesFor(role);
}

const browser = await chromium.launch();
const hallazgos = [];

for (const page of PAGES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (page.role) {
    await context.addCookies(cookiesByRole[page.role].map((c) => ({ ...c, url: BASE_URL })));
  }
  const tab = await context.newPage();
  const warnings = [];
  tab.on("console", (msg) => {
    if (msg.type() === "warning") warnings.push(msg.text().slice(0, 300));
  });
  tab.on("pageerror", (e) => warnings.push(`pageerror: ${e.message.slice(0, 300)}`));
  try {
    await tab.goto(`${BASE_URL}${page.url}`, { waitUntil: "load", timeout: 20000 });
    await tab.waitForTimeout(800);
  } catch (e) {
    warnings.push(`navigation error: ${String(e).slice(0, 200)}`);
  }
  if (warnings.length) {
    hallazgos.push({ label: page.label, url: page.url, warnings: [...new Set(warnings)] });
    console.log(`\n${page.label} (${page.url}):`);
    for (const w of new Set(warnings)) console.log(`  - ${w}`);
  }
  await context.close();
}

console.log(`\nTotal paginas con warnings: ${hallazgos.length}/${PAGES.length}`);
await browser.close();
