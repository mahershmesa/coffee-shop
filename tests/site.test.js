// Browser tests for the site. Run with: npm test
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.webm': 'video/webm', '.mp4': 'video/mp4',
};

// Minimal static server so the page runs over HTTP, like in production
function serve() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    const size = fs.statSync(file).size;
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      // Video players request files in byte ranges
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes' });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

let URL_ROOT;
const results = [];
const check = (name, ok, info = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);

function watch(page) {
  const problems = [];
  page.on('pageerror', (e) => problems.push('JS error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => problems.push('request failed: ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
  return problems;
}
// Smooth scrolling makes the test runner re-scroll forever; users are unaffected.
const instantScroll = (page) => page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
const activeSlide = (p) => p.evaluate(() => [...document.querySelectorAll('.slide')].findIndex((s) => s.classList.contains('active')));

(async () => {
  const server = await serve();
  URL_ROOT = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();

  /* ---------- Desktop ---------- */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 860 } });
  const p = await ctx.newPage();
  const problems = watch(p);
  await p.goto(URL_ROOT, { waitUntil: 'load' });
  await instantScroll(p);
  await p.waitForTimeout(1500);

  check('one <h1> on the page', (await p.locator('h1').count()) === 1);
  check('5 slides and 5 dots rendered', (await p.locator('.slide').count()) === 5 && (await p.locator('.dot').count()) === 5);
  const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map((i) => i.src));
  check('no broken images', broken.length === 0, broken.join(', '));
  check('first-slide video is playing', await p.evaluate(() => !document.querySelector('.slide.active video').paused));

  // Slider controls
  await p.click('#nextBtn'); await p.waitForTimeout(1000);
  check('next arrow -> slide 2', (await activeSlide(p)) === 1);
  check('video paused when its slide is hidden', await p.evaluate(() => document.querySelector('.slide video').paused));
  await p.click('#prevBtn'); await p.waitForTimeout(1000);
  check('prev arrow -> slide 1', (await activeSlide(p)) === 0);
  await p.click('.dot[data-i="3"]'); await p.waitForTimeout(1000);
  check('dot 4 -> slide 4', (await activeSlide(p)) === 3);
  check('active dot has aria-current', (await p.getAttribute('.dot[data-i="3"]', 'aria-current')) === 'true');
  await p.click('#prevBtn'); await p.waitForTimeout(1000);
  await p.mouse.click(5, 400); // move focus out of the slider
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1000);
  check('ArrowRight key -> next slide', (await activeSlide(p)) === 3);
  await p.click('.dot[data-i="0"]'); await p.waitForTimeout(1000);
  await p.click('#prevBtn'); await p.waitForTimeout(1000);
  check('prev from slide 1 wraps to slide 5', (await activeSlide(p)) === 4);

  // Arrow keys must not change slides while typing
  await p.focus('#email');
  const before = await activeSlide(p);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(500);
  check('arrow keys ignored while typing in email box', (await activeSlide(p)) === before);

  // Filters
  await p.click('.chip[data-filter="cups"]');
  check('filter "Cups" shows 2 products', (await p.locator('.card').count()) === 2);
  check('active filter has aria-pressed=true', (await p.getAttribute('.chip[data-filter="cups"]', 'aria-pressed')) === 'true');
  await p.click('.chip[data-filter="all"]');
  check('filter "All" shows 5 products', (await p.locator('.card').count()) === 5);

  // Cart math: 3 x $18.50 + 1 x $649.00 = $704.50
  check('drawer is inert while closed', await p.evaluate(() => document.getElementById('drawer').inert));
  for (let i = 0; i < 3; i++) await p.click('[data-add="1"]');
  await p.click('[data-add="3"]');
  check('cart badge shows 4', (await p.textContent('#cartCount')) === '4');
  check('cart total is exactly $704.50', (await p.textContent('#cartTotal')) === '$704.50');
  check('toast announces the add', (await p.textContent('#toast')).includes('added to cart'));

  // Drawer focus handling
  await p.click('#cartBtn'); await p.waitForTimeout(500);
  check('drawer opens and focus moves into it', await p.evaluate(() => document.activeElement.id === 'closeDrawer' && !document.getElementById('drawer').inert));
  for (let i = 0; i < 12; i++) await p.keyboard.press('Tab');
  check('Tab keeps focus inside the open drawer', await p.evaluate(() => document.getElementById('drawer').contains(document.activeElement)));
  await p.click('[data-dec="3"]');
  check('minus removes the last machine', (await p.textContent('#cartTotal')) === '$55.50');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  check('Escape closes drawer and returns focus to cart button', await p.evaluate(() => document.activeElement.id === 'cartBtn' && document.getElementById('drawer').inert));

  // Persistence
  await p.reload({ waitUntil: 'load' });
  await instantScroll(p);
  check('cart survives a page reload', (await p.textContent('#cartCount')) === '3');

  // Checkout placeholder
  await p.click('#cartBtn'); await p.waitForTimeout(300);
  await p.click('#checkoutBtn');
  check('checkout shows a clear message', (await p.textContent('#toast')).includes('coming soon'));
  await p.keyboard.press('Escape');

  // Newsletter validation
  await p.fill('#email', 'not-an-email');
  await p.click('.newsletter button');
  check('invalid email is rejected', (await p.textContent('#toast')).includes('valid email') && (await p.inputValue('#email')) === 'not-an-email');
  await p.fill('#email', '  test@example.com  ');
  await p.click('.newsletter button');
  check('valid email is accepted and the form clears', (await p.textContent('#toast')).includes('Thanks') && (await p.inputValue('#email')) === '');

  // About video plays only when visible
  await p.evaluate(() => document.getElementById('about').scrollIntoView());
  await p.waitForTimeout(1500);
  check('About video plays when on screen', await p.evaluate(() => !document.getElementById('aboutVideo').paused));
  check('scroll-spy marks "About" active', (await p.getAttribute('#navLinks a[href="#about"]', 'class') || '').includes('active'));
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
  check('About video pauses when off screen', await p.evaluate(() => document.getElementById('aboutVideo').paused));

  check('desktop: no errors, CSP violations or failed requests', problems.length === 0, problems.join(' | '));

  /* ---------- Tampered storage (security) ---------- */
  const evil = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await evil.addInitScript(() => {
    localStorage.setItem('coffee-cart', '{"1":500,"2":"<img src=x onerror=\\"window.__xss=1\\">","3":-4,"4":2.5,"999":3,"<svg onload=window.__xss=1>":1,"__proto__":{"polluted":true}}');
  });
  const e = await evil.newPage();
  const eProblems = watch(e);
  await e.goto(URL_ROOT, { waitUntil: 'load' });
  await e.waitForTimeout(800);
  check('tampered cart: page still works (no crash)', eProblems.length === 0, eProblems.join(' | '));
  check('tampered cart: injected code never runs', await e.evaluate(() => window.__xss === undefined && ({}).polluted === undefined));
  check('tampered cart: only valid item kept, capped at 99', (await e.textContent('#cartCount')) === '99');
  await e.click('#cartBtn'); await e.waitForTimeout(300);
  check('tampered cart: "+" disabled at the 99 limit', await e.isDisabled('[data-inc="1"]'));
  check('tampered cart: no injected elements in the page', await e.evaluate(() => !document.querySelector('img[src="x"], svg[onload]')));
  await evil.close();

  // Corrupt JSON in storage
  const bad = await browser.newContext();
  await bad.addInitScript(() => localStorage.setItem('coffee-cart', '{not json'));
  const b = await bad.newPage();
  const bProblems = watch(b);
  await b.goto(URL_ROOT, { waitUntil: 'load' });
  check('corrupt stored cart is ignored safely', bProblems.length === 0 && (await b.textContent('#cartCount')) === '0', bProblems.join(' | '));
  await bad.close();

  /* ---------- Reduced motion ---------- */
  const rm = await browser.newContext({ reducedMotion: 'reduce' });
  const r = await rm.newPage();
  await r.goto(URL_ROOT, { waitUntil: 'load' });
  await r.waitForTimeout(10000);
  check('reduced motion: slider does not auto-advance', (await activeSlide(r)) === 0);
  check('reduced motion: background video stays paused', await r.evaluate(() => document.querySelector('.slide video').paused));
  await rm.close();

  /* ---------- Autoplay timing ---------- */
  const t = await ctx.newPage();
  await t.goto(URL_ROOT, { waitUntil: 'load' });
  await t.waitForTimeout(7000);
  const at7 = await activeSlide(t);
  await t.waitForTimeout(3500);
  check('autoplay: first slide stays 9s, then moves on', at7 === 0 && (await activeSlide(t)) === 1);

  /* ---------- Mobile ---------- */
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const mp = await m.newPage();
  const mProblems = watch(mp);
  await mp.goto(URL_ROOT, { waitUntil: 'load' });
  await mp.waitForTimeout(1000);
  check('mobile: no horizontal scroll', await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await mp.click('#menuBtn');
  check('mobile: menu opens with aria-expanded=true', (await mp.getAttribute('#menuBtn', 'aria-expanded')) === 'true');
  await mp.click('#navLinks a[href="#products"]'); await mp.waitForTimeout(800);
  check('mobile: tapping a link closes the menu', (await mp.getAttribute('#menuBtn', 'aria-expanded')) === 'false');
  check('mobile: no errors', mProblems.length === 0, mProblems.join(' | '));
  await m.close();

  /* ---------- Layout on real device sizes ---------- */
  const DEVICES = [
    ['small phone', 320, 568], ['iPhone SE', 375, 667], ['iPhone', 390, 844], ['iPhone Pro Max', 430, 932],
    ['phone landscape', 844, 390], ['iPad mini', 768, 1024], ['iPad Air', 820, 1180],
    ['iPad landscape', 1024, 768], ['iPad Pro', 1024, 1366], ['laptop', 1366, 768], ['desktop', 1920, 1080],
  ];
  for (const [name, width, height] of DEVICES) {
    const touch = width < 1300;
    const dc = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch && width < 1000 });
    const dp = await dc.newPage();
    await dp.goto(URL_ROOT, { waitUntil: 'load' });
    await dp.waitForTimeout(2600);
    const issues = [];
    for (let i = 0; i < 5; i++) {
      if (i) { await dp.evaluate((n) => document.querySelectorAll('.dot')[n].click(), i); await dp.waitForTimeout(1500); }
      issues.push(...await dp.evaluate((n) => {
        const R = (el) => el.getBoundingClientRect();
        const slide = document.querySelector('.slide.active');
        const cw = document.documentElement.clientWidth;
        const nav = R(document.querySelector('#nav'));
        const copy = R(slide.querySelector('.copy'));
        const cta = R(slide.querySelector('.cta'));
        const dots = R(document.querySelector('.dots'));
        const vis = slide.querySelector('.visual > div');
        const out = [];
        if (document.documentElement.scrollWidth > cw || window.innerWidth > cw) out.push('page wider than screen');
        if (R(document.querySelector('#cartBtn')).right > cw) out.push('cart icon off screen');
        if (copy.top < nav.bottom - 2) out.push('text under top bar');
        if (cta.bottom > dots.top) out.push('buttons overlap dots');
        if (vis) {
          const v = R(vis);
          const ox = Math.min(v.right, copy.right) - Math.max(v.left, copy.left);
          const oy = Math.min(v.bottom, copy.bottom) - Math.max(v.top, copy.top);
          if (ox > 30 && oy > 30) out.push('image overlaps text');
          if (v.top < nav.bottom - 10) out.push('image under top bar');
        }
        return out.map((x) => `slide ${n + 1}: ${x}`);
      }, i));
    }
    check(`layout fits on ${name} (${width}x${height})`, issues.length === 0, issues.join(', '));
    await dc.close();
  }

  await browser.close();
  console.log(results.join('\n'));
  const failed = results.filter((x) => x.startsWith('FAIL')).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  server.close();
  process.exit(failed ? 1 : 0);
})();
