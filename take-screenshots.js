const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const WIDGET_HTML = 'file:///' + path.join(__dirname, 'widget', 'test.html').replace(/\\/g, '/');
const OUT = path.join(__dirname, 'screenshots');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto(WIDGET_HTML, { waitUntil: 'networkidle2', timeout: 15000 });

  // Wait for widget button and icon to render
  await page.waitForSelector('#zara-widget-btn');
  // Wait for all images to finish loading
  await page.evaluate(() => {
    const imgs = [...document.images];
    return Promise.all(imgs.map(img => img.complete
      ? Promise.resolve()
      : new Promise(r => { img.onload = r; img.onerror = r; })
    ));
  });
  await sleep(1200);

  // ── Screenshot 1: closed state with popup bubble ─────────────────────────
  await page.evaluate(() => document.getElementById('zara-widget-bubble')?.classList.add('visible'));
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, 'widget-closed.png') });
  console.log('✓ widget-closed.png');

  // ── Screenshot 2: welcome state (panel open, welcome screen) ─────────────
  await page.click('#zara-widget-btn');
  await sleep(600); // animation
  await page.screenshot({ path: path.join(OUT, 'widget-welcome.png') });
  console.log('✓ widget-welcome.png');

  // ── Screenshot 3: chat state (mock conversation) ──────────────────────────
  // Inject a mock conversation directly into the DOM
  await page.evaluate(() => {
    const ICON = 'https://slkkbt56njcjju1f.public.blob.vercel-storage.com/Icon%20only.jpg';
    const msgs = document.getElementById('zw-messages');

    // Remove welcome screen
    const welcome = document.getElementById('zw-welcome');
    if (welcome) welcome.remove();

    function row(role, html) {
      const el = document.createElement('div');
      el.className = `zw-row ${role}`;
      const avatarHTML = role === 'bot'
        ? `<img src="${ICON}" alt="Zara">`
        : 'You';
      el.innerHTML = `
        <div class="zw-msg-avatar">${avatarHTML}</div>
        <div class="zw-bubble">${html}</div>`;
      msgs.appendChild(el);
    }

    row('user', 'What is CommunityTracker.ai?');
    row('bot', 'CommunityTracker.ai is a <strong>community intelligence platform</strong> that helps GTM teams discover high-intent buyer signals, monitor competitor visibility, and convert community conversations into sales pipeline opportunities.');
    row('user', 'What are the pricing plans?');
    row('bot', 'We offer three plans:<ul><li><strong>Starter</strong> — $29/mo, 3 platforms</li><li><strong>Growth</strong> — $79/mo, unlimited platforms</li><li><strong>Enterprise</strong> — custom pricing</li></ul>All plans include a free 14-day trial.');

    msgs.scrollTop = msgs.scrollHeight;
  });

  await sleep(400);
  await page.screenshot({ path: path.join(OUT, 'widget-chat.png') });
  console.log('✓ widget-chat.png');

  await browser.close();
  console.log('\nDone — screenshots saved to screenshots/');
})();
