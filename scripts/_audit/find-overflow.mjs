import { chromium } from "playwright";
import { PAGES } from "./pages.mjs";
import { getCookiesFor } from "./login.mjs";

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3001";

const roles = [...new Set(PAGES.map((p) => p.role).filter(Boolean))];
const cookiesByRole = {};
for (const role of roles) {
  cookiesByRole[role] = await getCookiesFor(role);
}

const browser = await chromium.launch();
let totalBad = 0;

for (const page of PAGES) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  if (page.role) {
    await context.addCookies(
      cookiesByRole[page.role].map((c) => ({ ...c, url: BASE_URL }))
    );
  }
  const tab = await context.newPage();
  try {
    await tab.goto(`${BASE_URL}${page.url}`, { waitUntil: "load", timeout: 15000 });
    await tab.waitForTimeout(700);
    const overflowPx = await tab.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    if (overflowPx > 3) {
      totalBad++;
      const culprits = await tab.evaluate(() => {
        const vw = window.innerWidth;
        const all = document.querySelectorAll("body *");
        const results = [];
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && (rect.right > vw + 2 || rect.left < -2)) {
            const hasOverflowingChild = [...el.children].some((c) => {
              const r = c.getBoundingClientRect();
              return r.right > vw + 2 || r.left < -2;
            });
            if (!hasOverflowingChild) {
              results.push({
                tag: el.tagName,
                class: el.className?.toString().slice(0, 100),
                text: el.textContent?.trim().slice(0, 50),
                right: Math.round(rect.right),
              });
            }
          }
        }
        return results.slice(0, 5);
      });
      console.log(`\n${page.label} (${page.url}): overflow=${overflowPx}px`);
      console.log(JSON.stringify(culprits, null, 2));
    }
  } catch (e) {
    console.log(`${page.label}: ERROR ${String(e).slice(0, 150)}`);
  }
  await context.close();
}

console.log(`\nTotal paginas con overflow: ${totalBad}/${PAGES.length}`);
await browser.close();
