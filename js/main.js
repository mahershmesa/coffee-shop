/* ---------- Data ---------- */
const IMG = {
  pouch: 'images/coffee-pouch.png',
  sack: 'images/bean-sack.png',
  machine: 'images/espresso-machine.png',
  shots: 'images/espresso-shots.png',
  cup: 'images/coffee-cup.png',
};
const BEAN_IMAGES = 11; // images/beans/bean-1.png … bean-11.png

// Product photo. If a fallback is given, it shows when the image file is missing.
const photo = (src, alt, fallback = '') => fallback
  ? `<span class="ph"><img class="art photo" src="${src}" alt="${alt}" onerror="this.remove()"><span class="fallback">${fallback}</span></span>`
  : `<img class="art photo" src="${src}" alt="${alt}">`;

const SLIDES = [
  {
    theme: 'dark',
    bg: 'radial-gradient(120% 90% at 70% 50%, #4a2c1a 0%, #24150d 55%, #120a06 100%)',
    tag: 'Fresh Style Roast',
    title: ['Artisan', 'Roast'],
    text: 'Small-batch beans roasted every morning for a deep, chocolatey cup with a smooth finish.',
    primary: 'Shop Now', secondary: 'Our Story',
    visual: () => `
      <div class="v-combo">
        <div class="v-pouch">${photo(IMG.pouch, 'Artisan coffee pouch')}</div>
        <div class="v-sack">${photo(IMG.sack, 'Sack of roasted coffee beans')}</div>
      </div>`,
    beans: 6,
  },
  {
    theme: 'dark',
    bg: 'radial-gradient(120% 90% at 60% 50%, #d39a5f 0%, #a5672f 45%, #5c3417 100%)',
    tag: 'Rich Aroma',
    title: ['Rich', 'Aroma'],
    ghost: 'RICH AROMA',
    text: 'A velvety crema and a scent that fills the room. Brewed from hand-picked Arabica.',
    primary: 'Shop Now', secondary: 'Explore',
    visual: () => `<div class="v-cup float">${photo(IMG.cup, 'Cup of espresso', Art.cup())}</div>`,
    beans: 5,
  },
  {
    theme: 'light',
    bg: 'radial-gradient(120% 90% at 65% 45%, #fff6e6 0%, #f1dcb8 50%, #d9b47e 100%)',
    tag: 'Ultra Aroma',
    title: ['Bold', 'Blend'],
    ghost: 'BOLD BLEND',
    text: 'Our signature espresso blend — bright notes of caramel and cocoa in every shot.',
    primary: 'Shop Now', secondary: 'Taste Notes',
    visual: () => `
      <div class="v-streaks"></div>
      <div class="v-pouch solo float">${photo(IMG.pouch, 'Bold blend coffee pouch')}</div>`,
    beans: 14,
  },
  {
    theme: 'dark',
    bg: 'radial-gradient(120% 90% at 65% 55%, #3a332e 0%, #1c1916 55%, #0b0a09 100%)',
    tag: 'Sleek Commercial',
    title: ['Sleek', 'Espresso'],
    text: 'Barista-grade espresso machines with dual boilers and precise pressure control.',
    primary: 'Shop Machines', secondary: 'Compare',
    visual: () => `<div class="v-machine">${photo(IMG.machine, 'Commercial espresso machine')}</div>`,
    beans: 0,
  },
  {
    theme: 'light',
    bg: 'radial-gradient(120% 90% at 65% 50%, #fffaf3 0%, #f3e6d3 55%, #e2cdb0 100%)',
    tag: 'Order Fresh',
    title: ['Order', 'Fresh'],
    ghost: 'ORDER FRESH',
    text: 'Roasted today, at your door tomorrow. Free shipping on orders over $40.',
    primary: 'Shop Now', secondary: 'Subscribe',
    visual: () => `<div class="v-shots float">${photo(IMG.shots, 'Espresso pouring into two glasses')}</div>`,
    beans: 10,
  },
];

const PRODUCTS = [
  { id: 1, cat: 'beans', name: 'Artisan Dark Roast', price: 18.5, note: 'Chocolate · Smoky · 250g', art: () => photo(IMG.pouch, 'Artisan Dark Roast') },
  { id: 2, cat: 'beans', name: 'Whole Bean Sack', price: 32, note: 'House blend · 1kg', art: () => photo(IMG.sack, 'Whole Bean Sack') },
  { id: 3, cat: 'machines', name: 'Sleek Pro Espresso', price: 649, note: 'Dual group · 15 bar', art: () => photo(IMG.machine, 'Sleek Pro Espresso') },
  { id: 4, cat: 'cups', name: 'Classic Black Cup', price: 12, note: 'Cup & saucer · 90ml', art: () => photo(IMG.cup, 'Classic Black Cup', Art.cup({ steam: false })) },
  { id: 5, cat: 'cups', name: 'Espresso Shot Glasses', price: 14, note: 'Set of 2 · 60ml', art: () => photo(IMG.shots, 'Espresso Shot Glasses') },
];

/* ---------- Helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const money = (n) => `$${n.toFixed(2)}`;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Hero slider ---------- */
const hero = $('#hero');
const slidesEl = $('#slides');
const dotsEl = $('#dots');
const progressBar = $('#progressBar');
const DURATION = 5000;
let current = 0;
let timer = null;
let locked = false;

function beansHTML(count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const style = [
      `--x:${rand(42, 96).toFixed(1)}%`,
      `--y:${rand(8, 88).toFixed(1)}%`,
      `--s:${rand(0.5, 1.4).toFixed(2)}`,
      `--r:${rand(0, 360).toFixed(0)}deg`,
      `--fx:${rand(-400, 400).toFixed(0)}px`,
      `--fy:${rand(-300, 300).toFixed(0)}px`,
      `--d:${rand(0, 0.5).toFixed(2)}s`,
      `--f:${rand(3, 6).toFixed(1)}s`,
      `--blur:${Math.random() < 0.3 ? 2 : 0}px`,
    ].join(';');
    out += `<span class="bean" style="${style}"><img src="images/beans/bean-${1 + Math.floor(Math.random() * BEAN_IMAGES)}.png" alt=""></span>`;
  }
  return out;
}

function renderSlides() {
  slidesEl.innerHTML = SLIDES.map((s, i) => `
    <article class="slide theme-${s.theme}" style="background:${s.bg}" aria-label="Slide ${i + 1} of ${SLIDES.length}">
      ${s.ghost ? `<div class="ghost" aria-hidden="true">${s.ghost}</div>` : ''}
      <div class="slide-inner">
        <div class="copy">
          <span class="tag">${s.tag}</span>
          <h1 class="title">${s.title.map((w, j) => `<span class="line" style="--i:${j}"><span>${w}</span></span>`).join('')}</h1>
          <p class="text">${s.text}</p>
          <div class="cta">
            <a href="#products" class="btn btn-primary">${s.primary}</a>
            <a href="#about" class="btn btn-ghost">${s.secondary}</a>
          </div>
        </div>
        <div class="visual">${s.visual()}</div>
      </div>
      <div class="slide-beans" aria-hidden="true">${beansHTML(s.beans)}</div>
    </article>`).join('');

  dotsEl.innerHTML = SLIDES.map((_, i) =>
    `<button class="dot" aria-label="Go to slide ${i + 1}" data-i="${i}"></button>`).join('');
}

function goTo(next, dir = 1) {
  if (locked || next === current) return;
  locked = true;
  const slides = slidesEl.children;
  const prev = slides[current];
  current = (next + SLIDES.length) % SLIDES.length;
  const incoming = slides[current];

  hero.style.setProperty('--dir', dir);
  prev.classList.remove('active');
  prev.classList.add('leaving');
  incoming.classList.add('active');
  updateUI();

  setTimeout(() => {
    prev.classList.remove('leaving');
    locked = false;
  }, 900);
  restartTimer();
}

function updateUI() {
  hero.dataset.theme = SLIDES[current].theme;
  document.body.dataset.heroTheme = SLIDES[current].theme;
  [...dotsEl.children].forEach((d, i) => d.classList.toggle('active', i === current));
}

function restartTimer() {
  clearTimeout(timer);
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
  if (reduceMotion) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    progressBar.style.transition = `width ${DURATION}ms linear`;
    progressBar.style.width = '100%';
  }));
  timer = setTimeout(() => goTo(current + 1, 1), DURATION);
}

function initSlider() {
  renderSlides();
  slidesEl.children[0].classList.add('active');
  updateUI();
  restartTimer();

  $('#nextBtn').addEventListener('click', () => goTo(current + 1, 1));
  $('#prevBtn').addEventListener('click', () => goTo(current - 1, -1));
  dotsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.dot');
    if (b) goTo(+b.dataset.i, +b.dataset.i > current ? 1 : -1);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(current + 1, 1);
    if (e.key === 'ArrowLeft') goTo(current - 1, -1);
  });

  // Swipe on touch devices
  let startX = null;
  hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    startX = null;
  });

  // Pause when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer); else restartTimer();
  });

  // Subtle parallax on the visual
  if (!reduceMotion) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }
}

/* ---------- Products ---------- */
function renderProducts(filter = 'all') {
  const list = PRODUCTS.filter((p) => filter === 'all' || p.cat === filter);
  $('#productGrid').innerHTML = list.map((p) => `
    <article class="card">
      <div class="card-art">${p.art()}</div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.note}</p>
        <div class="card-foot">
          <strong>${money(p.price)}</strong>
          <button class="btn btn-primary sm" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`).join('');
}

$('#filters').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
  renderProducts(chip.dataset.filter);
});

/* ---------- Cart ---------- */
const cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem('coffee-cart')) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem('coffee-cart', JSON.stringify(cart)); } catch { /* storage unavailable */ }
}

function renderCart() {
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const count = entries.reduce((n, [, q]) => n + q, 0);
  const total = entries.reduce((n, [id, q]) => n + PRODUCTS.find((p) => p.id === +id).price * q, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').classList.toggle('show', count > 0);
  $('#cartTotal').textContent = money(total);
  $('#cartItems').innerHTML = entries.length ? entries.map(([id, q]) => {
    const p = PRODUCTS.find((x) => x.id === +id);
    return `<li>
      <div class="mini-art">${p.art()}</div>
      <div class="mini-info"><strong>${p.name}</strong><span>${money(p.price)}</span></div>
      <div class="qty">
        <button data-dec="${p.id}" aria-label="Decrease">−</button>
        <span>${q}</span>
        <button data-inc="${p.id}" aria-label="Increase">+</button>
      </div>
    </li>`;
  }).join('') : '<li class="empty">Your cart is empty.</li>';
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const btn = $('#cartBtn');
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  toast(`${PRODUCTS.find((p) => p.id === id).name} added to cart`);
}

document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  if (add) addToCart(+add.dataset.add);
  if (inc) { cart[inc.dataset.inc]++; saveCart(); renderCart(); }
  if (dec) { cart[dec.dataset.dec]--; if (cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec]; saveCart(); renderCart(); }
});

const openDrawer = () => document.body.classList.add('drawer-open');
const closeDrawer = () => document.body.classList.remove('drawer-open');
$('#cartBtn').addEventListener('click', openDrawer);
$('#closeDrawer').addEventListener('click', closeDrawer);
$('#drawerBackdrop').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

/* ---------- Misc ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

$('#menuBtn').addEventListener('click', () => document.body.classList.toggle('menu-open'));
$('#navLinks').addEventListener('click', () => document.body.classList.remove('menu-open'));

window.addEventListener('scroll', () => {
  $('#nav').classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

$('#newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  toast('Thanks! Check your inbox for your discount code.');
});

$('#year').textContent = new Date().getFullYear();
$('#aboutVisual').innerHTML = `<div class="v-shots">${photo(IMG.shots, 'Espresso shots')}</div><div class="about-bag">${photo(IMG.pouch, 'Coffee pouch')}</div>`;

// Reveal sections on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.15 });

initSlider();
renderProducts();
renderCart();
document.querySelectorAll('.products, .about').forEach((el) => io.observe(el));
