import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { PAGES, VIEWPORTS } from "./pages.mjs";
import { getCookiesFor } from "./login.mjs";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";
const OUT_DIR = process.env.AUDIT_OUT_DIR;
if (!OUT_DIR) throw new Error("Set AUDIT_OUT_DIR");
mkdirSync(OUT_DIR, { recursive: true });

const reportPath = `${OUT_DIR}/report.json`;
const previousResults = existsSync(reportPath)
  ? JSON.parse(readFileSync(reportPath, "utf-8"))
  : [];

const roles = [...new Set(PAGES.map((p) => p.role).filter(Boolean))];
const cookiesByRole = {};
for (const role of roles) {
  cookiesByRole[role] = await getCookiesFor(role);
  console.log(`login ok: ${role}`);
}

const browser = await chromium.launch();

const fromLabel = process.env.AUDIT_FROM_LABEL;
const pagesToRun = fromLabel
  ? PAGES.slice(PAGES.findIndex((p) => p.label === fromLabel))
  : PAGES;
const runLabels = new Set(pagesToRun.map((p) => p.label));
const results = previousResults.filter((r) => !runLabels.has(r.label));

for (const page of pagesToRun) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.name === "mobile" ? 2 : 1,
    });
    if (page.role) {
      await context.addCookies(
        cookiesByRole[page.role].map((c) => ({ ...c, url: BASE_URL }))
      );
    }
    const tab = await context.newPage();
    const consoleErrors = [];
    tab.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 300));
    });
    tab.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message.slice(0, 300)}`));

    const fileBase = `${page.label}__${vp.name}`;
    let status = null;
    let overflowPx = 0;
    let title = "";
    try {
      const resp = await tab.goto(`${BASE_URL}${page.url}`, {
        waitUntil: "load",
        timeout: 15000,
      });
      status = resp?.status() ?? null;
      await tab.waitForTimeout(1000);
      title = await tab.title();
      overflowPx = await tab.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      await tab.screenshot({
        path: `${OUT_DIR}/${fileBase}.png`,
        fullPage: true,
      });
    } catch (e) {
      consoleErrors.push(`navigation error: ${String(e).slice(0, 300)}`);
    }

    results.push({
      label: page.label,
      url: page.url,
      role: page.role ?? null,
      viewport: vp.name,
      status,
      title,
      overflowPx,
      consoleErrors,
      screenshot: `${fileBase}.png`,
    });
    console.log(
      `${fileBase}: status=${status} overflow=${overflowPx}px errors=${consoleErrors.length}`
    );
    await context.close();
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
  }
}

await browser.close();
console.log(`\nDone. Report: ${reportPath}`);
