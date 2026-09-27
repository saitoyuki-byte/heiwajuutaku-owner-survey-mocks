// Run with a local HTTP server and Playwright available in NODE_PATH.
// GALLERY_TEST_URL may also point to the published gallery for read-only checks.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome", headless: true });
  const base = process.env.GALLERY_TEST_URL || "http://127.0.0.1:4173/";
  const shots = fs.mkdtempSync(path.join(os.tmpdir(), "heiwa-progress-"));
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
  const page = await context.newPage();
  try {
    await page.goto(base);
    await page.waitForSelector(".progress-card");
    assert.equal(await page.locator(".progress-card:visible").count(), 23);
    assert.equal(await page.locator(".progress-card--migrated").count(), 7);
    assert.equal(await page.locator('.progress-card--migrated .migration-stage').allTextContents().then((labels) => labels.filter((x) => x === "テスト実装").length), 5);
    assert.equal(await page.locator("#operations").isVisible(), false);
    await page.screenshot({ path: path.join(shots, "desktop.png") });
    for (const status of ["active", "review", "done", "planned", "hold", "handed-off", "migrated"]) {
      await page.locator(`[data-filter="${status}"]`).click();
      const expected = Number(await page.locator(`[data-count="${status}"]`).textContent());
      assert.equal(await page.locator(".progress-card:visible").count(), expected, status);
      assert.equal(await page.locator(`.progress-card:visible:not([data-project-status="${status}"])`).count(), 0);
    }
    const gray = page.locator('[data-project-id="invoice-check"]');
    assert.equal(await gray.evaluate((node) => getComputedStyle(node).backgroundColor), "rgb(241, 243, 245)");
    assert.equal(await gray.locator(".progress-primary").isVisible(), false);
    assert.equal(await page.locator(".production-guide-link").getAttribute("href"), "https://heiwa-internal-tools.cantera-saito.chatgpt.site/#top");
    await gray.locator("summary").click();
    assert.equal(await gray.locator(".archive-note").isVisible(), true);
    assert.equal(await gray.locator(".project-detail-content a").count(), 1);
    await gray.locator("summary").click();
    await page.screenshot({ path: path.join(shots, "migrated.png"), fullPage: true });
    await page.locator('[data-category="forms"]').click();
    assert.equal(await page.locator(".progress-card:visible").count(), 2);
    await page.locator('[data-category="dashboards"]').click();
    assert.equal(await page.locator("[data-progress-empty]").isVisible(), true);
    await page.locator("[data-clear-filters]").click();
    assert.equal(await page.locator(".progress-card:visible").count(), 23);

    const admin = await context.newPage();
    await admin.goto(new URL("admin/", base).href);
    assert.equal(await admin.locator('[data-field="migrationUrl"]').count(), 0);
    const row = admin.locator('[data-project-id="shift-planner"]');
    await row.locator('[data-field="status"]').selectOption("migrated");
    await row.locator('[data-field="migrationStage"]').selectOption("production");
    await row.locator('[data-field="note"]').fill("社内App Storeへ移行しました");
    await page.waitForFunction(() => document.querySelector('[data-project-id="shift-planner"] .progress-primary').hidden);
    await page.reload();
    assert.equal(await page.locator(".progress-card--migrated").count(), 8);
    assert.equal(await page.locator('[data-project-id="shift-planner"] .migration-stage').textContent(), "本実装");
    await admin.locator("[data-status-filter]").selectOption("migrated");
    assert.equal(await admin.locator(".project-row:visible").count(), 8);
    await admin.locator("[data-search]").fill("存在しないツール");
    assert.equal(await admin.locator(".project-row:visible").count(), 0);
    assert.equal(await admin.locator("[data-empty]").isVisible(), true);
    await admin.locator("[data-search]").fill("");
    await admin.locator("[data-status-filter]").selectOption("all");
    await row.locator('[data-field="status"]').selectOption("handed-off");
    await row.locator('[data-field="note"]').fill("資料一式を髙橋満様へお渡し済み");
    await page.waitForFunction(() => document.querySelector('[data-project-id="shift-planner"]').dataset.projectStatus === "handed-off");
    await page.reload();
    await page.locator('[data-filter="handed-off"]').click();
    assert.equal(await page.locator(".progress-card:visible").count(), 1);
    assert.equal(await page.locator("[data-handed-off-total]").textContent(), "1");
    assert.equal(await page.locator("[data-working-total]").textContent(), "15");
    const handedOff = page.locator('[data-project-id="shift-planner"]');
    assert.equal(await handedOff.locator(".progress-badge").textContent(), "↪ 髙橋満様へ引き継ぎ済み");
    assert.equal(await handedOff.locator(".migration-stage").isVisible(), false);
    assert.equal(await handedOff.locator(".progress-primary").isVisible(), false);
    assert.equal(await row.locator("[data-migration-controls]").isVisible(), false);
    await handedOff.locator("summary").click();
    assert.ok((await handedOff.locator(".archive-note").textContent()).includes("髙橋満様への引き継ぎ時点"));
    await handedOff.locator("summary").click();
    await page.screenshot({ path: path.join(shots, "handed-off.png"), fullPage: true });
    await admin.locator("[data-status-filter]").selectOption("handed-off");
    assert.equal(await admin.locator(".project-row:visible").count(), 1);
    await admin.locator("[data-status-filter]").selectOption("all");
    await page.locator('[data-filter="all"]').click();
    await row.locator('[data-field="status"]').selectOption("active");
    await page.waitForFunction(() => document.querySelector('[data-project-id="shift-planner"]').dataset.projectStatus === "active");
    assert.equal(await page.locator("[data-handed-off-total]").textContent(), "0");
    assert.equal(await page.locator('[data-project-id="shift-planner"] .progress-primary').isVisible(), true);
    await admin.locator("[data-status-filter]").selectOption("all");
    await row.locator('[data-field="visible"]').uncheck({ force: true });
    await page.waitForFunction(() => document.querySelector('[data-project-id="shift-planner"]').hidden);

    const legacy = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await legacy.addInitScript(() => localStorage.setItem("heiwaPrototypeGalleryState:v1", JSON.stringify({ version: 1, projects: { "invoice-check": { status: "active", visible: true, priority: true, note: "保存済みメモ" } } })));
    const mobile = await legacy.newPage();
    await mobile.goto(base);
    assert.equal(await mobile.locator(".progress-card--migrated").count(), 7);
    assert.equal(await mobile.locator('[data-project-id="invoice-check"] .progress-next p').textContent(), "保存済みメモ");
    await mobile.locator('[data-filter="migrated"]').click();
    assert.equal(await mobile.locator(".progress-card:visible").count(), 7);
    await mobile.locator('[data-project-id="invoice-check"] summary').click();
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "mobile gallery overflow");
    await mobile.screenshot({ path: path.join(shots, "mobile.png"), fullPage: true });
    await mobile.goto(new URL("admin/", base).href);
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "mobile admin overflow");
    await mobile.screenshot({ path: path.join(shots, "mobile-admin.png") });
    await legacy.close();
    assert.deepEqual(errors, []);
    console.log("PASS: grouping, every status filter, no per-tool migration URLs, empty results, saved changes, cross-tab updates, legacy settings, and mobile layout");
    console.log("Screenshots:", shots);
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
