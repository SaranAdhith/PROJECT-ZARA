const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT  = path.join(__dirname, 'screenshots');
const DEMO = 'file:///D:/PROJECT%20ZARA/demo/index.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,860'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 860 });

  // ── 1. Welcome screen ─────────────────────────────────
  await page.goto(DEMO, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  // dismiss any alert
  page.on('dialog', d => d.dismiss());
  await page.screenshot({ path: `${OUT}\\welcome.png` });
  console.log('✓ welcome.png');

  // ── 2. Mobile view ────────────────────────────────────
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(DEMO, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT}\\mobile.png` });
  console.log('✓ mobile.png');

  // ── 3. Chat in progress ───────────────────────────────
  await page.setViewport({ width: 1400, height: 860 });
  await page.goto(DEMO, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // dismiss the "cannot reach backend" alert if it fires
  page.on('dialog', async d => { await d.dismiss(); });

  // Wait for session init then ask a question via the quick-question cards
  try {
    await page.waitForSelector('.card', { timeout: 5000 });
    await page.click('.card');          // click "What is CommunityTracker?"
    await new Promise(r => setTimeout(r, 4500)); // wait for streaming response
    await page.screenshot({ path: `${OUT}\\chat.png` });
    console.log('✓ chat.png');
  } catch (e) {
    console.log('chat screenshot skipped:', e.message);
  }

  await browser.close();
  console.log('All screenshots saved to /screenshots/');
})();
