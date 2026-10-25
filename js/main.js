'use strict';

(() => {
  /* ================= Data ================= */

  const IMG = {
    pouch: { src: 'images/coffee-pouch.webp', w: 408, h: 612 },
    sack: { src: 'images/bean-sack.webp', w: 499, h: 499 },
    machine: { src: 'images/espresso-machine.webp', w: 408, h: 612 },
    shots: { src: 'images/espresso-shots.webp', w: 397, h: 629 },
    cup: { src: 'images/coffee-cup.webp', w: 1400, h: 1800 },
    poster: { src: 'images/beans-poster.webp', w: 720, h: 1280 },
  };
  const BEAN_IMAGE_COUNT = 11; // images/beans/bean-1.webp … bean-11.webp

  const SLIDE_MS = 5000;
  const TRANSITION_MS = 900;
  const CART_KEY = 'coffee-cart';
  const MAX_QTY = 99;

  /*
   * Each slide: theme (text colour), bg (CSS background), optional video / photo
   * background, copy, and a visual made of one or more product images.
   */
  const SLIDES = [
    {
      theme: 'dark',
      bg: '#120a06',
      video: 'videos/beans',
      duration: 9000, // longer, so the moving background is seen
      tag: 'Fresh Style Roast',
      title: ['Artisan', 'Roast'],
      text: 'Small-batch beans roasted every morning for a deep, chocolatey cup with a smooth finish.',
      cta: ['Shop Now', 'Our Story'],
      visual: {
        layout: 'v-combo',
        images: [
          { ...IMG.pouch, alt: 'Artisan coffee pouch', className: 'v-pouch' },
          { ...IMG.sack, alt: 'Sack of roasted coffee beans', className: 'v-sack' },
        ],
      },
      beans: 6,
    },
    {
      theme: 'dark',
      bg: '#0d1013',
      photo: IMG.cup.src,
      tag: 'Rich Aroma',
      title: ['Rich', 'Aroma'],
      text: 'A velvety crema and a scent that fills the room. Brewed from hand-picked Arabica.',
      cta: ['Shop Now', 'Explore'],
      beans: 5,
    },
    {
      theme: 'light',
      bg: 'radial-gradient(120% 90% at 65% 45%, #fff6e6 0%, #f1dcb8 50%, #d9b47e 100%)',
      tag: 'Ultra Aroma',
      title: ['Bold', 'Blend'],
      ghost: 'Bold Blend',
      text: 'Our signature espresso blend — bright notes of caramel and cocoa in every shot.',
      cta: ['Shop Now', 'Taste Notes'],
      visual: {
        layout: 'v-solo',
        streaks: true,
        images: [{ ...IMG.pouch, alt: 'Bold blend coffee pouch', className: 'float' }],
      },
      beans: 14,
    },
    {
      theme: 'dark',
      bg: 'radial-gradient(120% 90% at 65% 55%, #3a332e 0%, #1c1916 55%, #0b0a09 100%)',
      tag: 'Sleek Commercial',
      title: ['Sleek', 'Espresso'],
      text: 'Barista-grade espresso machines with dual boilers and precise pressure control.',
      cta: ['Shop Machines', 'Compare'],
      visual: {
        layout: 'v-machine',
        images: [{ ...IMG.machine, alt: 'Commercial espresso machine' }],
      },
      beans: 0,
    },
    {
      theme: 'light',
      bg: 'radial-gradient(120% 90% at 65% 50%, #fffaf3 0%, #f3e6d3 55%, #e2cdb0 100%)',
      tag: 'Order Fresh',
      title: ['Order', 'Fresh'],
      ghost: 'Order Fresh',
      text: 'Roasted today, at your door tomorrow. Free shipping on orders over $40.',
      cta: ['Shop Now', 'Subscribe'],
      visual: {
        layout: 'v-shots',
        images: [{ ...IMG.shots, alt: 'Espresso pouring into two glasses', className: 'float' }],
      },
      beans: 10,
    },
  ];

  // Prices are in cents to avoid floating-point rounding errors.
  const PRODUCTS = [
    { id: 1, cat: 'beans', name: 'Artisan Dark Roast', price: 1850, note: 'Chocolate · Smoky · 250g', img: IMG.pouch },
    { id: 2, cat: 'beans', name: 'Whole Bean Sack', price: 3200, note: 'House blend · 1kg', img: IMG.sack },
    { id: 3, cat: 'machines', name: 'Sleek Pro Espresso', price: 64900, note: 'Dual group · 15 bar', img: IMG.machine },
    { id: 4, cat: 'cups', name: 'Classic Black Cup', price: 1200, note: 'Cup & saucer · 90ml', img: IMG.cup, cover: true },
    { id: 5, cat: 'cups', name: 'Espresso Shot Glasses', price: 1400, note: 'Set of 2 · 60ml', img: IMG.shots },
  ];
  const productById = new Map(PRODUCTS.map((p) => [p.id, p]));

  /* ================= Helpers ================= */

  const $ = (selector) => document.querySelector(selector);
  const rand = (min, max) => min + Math.random() * (max - min);
  const money = (cents) => `$${(cents / 100).toFixed(2)}`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Create an element. Text is always added as text nodes, never parsed as HTML.
   * props: class, text, style (CSS properties), dataset, or any attribute.
   */
  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key === 'text') el.textContent = value;
      else if (key === 'style') Object.entries(value).forEach(([prop, v]) => el.style.setProperty(prop, v));
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else el.setAttribute(key, value === true ? '' : value);
    }
    el.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
    return el;
  }

  const img = ({ src, w, h: height, alt = '', className = '' }, lazy = false) => h('img', {
    class: `photo ${className}`.trim(),
    src,
    alt,
    width: w,
    height,
    decoding: 'async',
    loading: lazy ? 'lazy' : undefined,
  });

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  const isTyping = (target) => target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

  /* ================= Hero slider ================= */

  const hero = $('#top');
  const slidesEl = $('#slides');
  const dotsEl = $('#dots');
  const progressBar = $('#progressBar');
  let current = 0;
  let timer = null;
  let locked = false;

  function renderBeans(count) {
    const beans = [];
    for (let i = 0; i < count; i++) {
      beans.push(h('span', {
        class: 'bean',
        style: {
          '--x': `${rand(42, 96).toFixed(1)}%`,
          '--y': `${rand(8, 88).toFixed(1)}%`,
          '--s': rand(0.5, 1.4).toFixed(2),
          '--r': `${rand(0, 360).toFixed(0)}deg`,
          '--fx': `${rand(-400, 400).toFixed(0)}px`,
          '--fy': `${rand(-300, 300).toFixed(0)}px`,
          '--d': `${rand(0, 0.5).toFixed(2)}s`,
          '--f': `${rand(3, 6).toFixed(1)}s`,
          '--blur': `${Math.random() < 0.3 ? 2 : 0}px`,
        },
      }, h('img', { src: `images/beans/bean-${1 + Math.floor(Math.random() * BEAN_IMAGE_COUNT)}.webp`, alt: '', decoding: 'async' })));
    }
    return h('div', { class: 'slide-beans', 'aria-hidden': 'true' }, beans);
  }

  function renderBackground(slide, index) {
    if (slide.video) {
      const video = h('video', {
        class: 'slide-video',
        poster: IMG.poster.src,
        loop: true,
        playsinline: true,
        preload: index === 0 && !reduceMotion ? 'auto' : 'none', // no download if it will never play
        'aria-hidden': 'true',
      },
      h('source', { src: `${slide.video}.webm`, type: 'video/webm' }),
      h('source', { src: `${slide.video}.mp4`, type: 'video/mp4' }));
      video.muted = true; // required for autoplay
      return [video, h('div', { class: 'slide-shade' })];
    }
    if (slide.photo) {
      return [h('div', { class: 'slide-photo', style: { 'background-image': `url("${slide.photo}")` } })];
    }
    return [];
  }

  function renderVisual(visual) {
    if (!visual) return h('div', { class: 'visual' });
    return h('div', { class: 'visual' },
      h('div', { class: visual.layout },
        visual.streaks && h('div', { class: 'v-streaks' }),
        visual.images.map((image) => img(image))));
  }

  function renderSlide(slide, index) {
    return h('article', {
      class: `slide theme-${slide.theme}`,
      style: { '--bg': slide.bg },
      'aria-roledescription': 'slide',
      'aria-label': `${index + 1} of ${SLIDES.length}`,
    },
    renderBackground(slide, index),
    slide.ghost && h('div', { class: 'ghost', 'aria-hidden': 'true', text: slide.ghost }),
    h('div', { class: 'slide-inner' },
      h('div', { class: 'copy' },
        h('span', { class: 'tag', text: slide.tag }),
        h('h2', { class: 'title' }, slide.title.map((word, i) => h('span', { class: 'line', style: { '--i': i } }, h('span', { text: word })))),
        h('p', { class: 'text', text: slide.text }),
        h('div', { class: 'cta' },
          h('a', { href: '#products', class: 'btn btn-primary', text: slide.cta[0] }),
          h('a', { href: '#about', class: 'btn btn-ghost', text: slide.cta[1] }))),
      renderVisual(slide.visual)),
    renderBeans(slide.beans));
  }

  function syncVideos() {
    [...slidesEl.children].forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;
      if (i === current && !reduceMotion && !document.hidden) {
        video.play().catch(() => { /* autoplay blocked: the poster image stays */ });
      } else {
        video.pause();
      }
    });
  }

  function updateUI() {
    const { theme } = SLIDES[current];
    hero.dataset.theme = theme;
    document.body.dataset.heroTheme = theme;
    [...dotsEl.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    syncVideos();
  }

  function stopTimer() {
    clearTimeout(timer);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
  }

  // True when a keyboard user is focused on something inside the slider
  const keyboardFocusInHero = () => {
    const el = document.activeElement;
    return hero.contains(el) && el.matches(':focus-visible');
  };

  function startTimer() {
    stopTimer();
    if (reduceMotion || document.hidden || keyboardFocusInHero()) return;
    const ms = SLIDES[current].duration || SLIDE_MS;
    // Two frames so the bar resets to 0 before it animates again
    requestAnimationFrame(() => requestAnimationFrame(() => {
      progressBar.style.transition = `width ${ms}ms linear`;
      progressBar.style.width = '100%';
    }));
    timer = setTimeout(() => goTo(current + 1, 1), ms);
  }

  function goTo(target, dir) {
    const index = (target + SLIDES.length) % SLIDES.length;
    if (locked || index === current) return;
    locked = true;

    const slides = slidesEl.children;
    const outgoing = slides[current];
    current = index;

    hero.style.setProperty('--dir', dir);
    outgoing.classList.remove('active');
    outgoing.classList.add('leaving');
    slides[current].classList.add('active');
    updateUI();

    setTimeout(() => {
      outgoing.classList.remove('leaving');
      locked = false;
    }, TRANSITION_MS);
    startTimer();
  }

  const next = () => goTo(current + 1, 1);
  const prev = () => goTo(current - 1, -1);

  function initSlider() {
    slidesEl.append(...SLIDES.map(renderSlide));
    dotsEl.append(...SLIDES.map((_, i) => h('button', {
      type: 'button', class: 'dot', 'aria-label': `Go to slide ${i + 1}`, dataset: { i },
    })));
    slidesEl.children[0].classList.add('active');
    updateUI();
    startTimer();

    $('#nextBtn').addEventListener('click', next);
    $('#prevBtn').addEventListener('click', prev);
    dotsEl.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      const i = Number(dot.dataset.i);
      goTo(i, i > current ? 1 : -1);
    });

    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target) || drawerIsOpen()) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Swipe on touch screens
    let startX = null;
    hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    });

    // Keyboard users: pause while focus is inside the slider
    hero.addEventListener('focusin', () => { if (keyboardFocusInHero()) stopTimer(); });
    hero.addEventListener('focusout', (e) => {
      if (!hero.contains(e.relatedTarget)) startTimer();
    });

    // Save battery when the tab is in the background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTimer(); else startTimer();
      syncVideos();
    });

    // Subtle parallax, at most once per frame
    if (!reduceMotion) {
      let frame = 0;
      hero.addEventListener('mousemove', (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = hero.getBoundingClientRect();
          hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        });
      });
    }
  }

  /* ================= Products ================= */

  function renderProducts(filter) {
    const list = PRODUCTS.filter((p) => filter === 'all' || p.cat === filter);
    $('#productGrid').replaceChildren(...list.map((p) => h('article', { class: 'card' },
      h('div', { class: `card-art${p.cover ? ' is-cover' : ''}` }, img({ ...p.img, alt: p.name }, true)),
      h('div', { class: 'card-body' },
        h('h3', { text: p.name }),
        h('p', { text: p.note }),
        h('div', { class: 'card-foot' },
          h('strong', { text: money(p.price) }),
          h('button', { type: 'button', class: 'btn btn-primary sm', dataset: { add: p.id }, 'aria-label': `Add ${p.name} to cart`, text: 'Add to cart' }))))));
  }

  function initProducts() {
    const filters = $('#filters');
    filters.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      filters.querySelectorAll('.chip').forEach((c) => {
        c.classList.toggle('active', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      renderProducts(chip.dataset.filter);
    });
    renderProducts('all');
  }

  /* ================= Cart ================= */

  // Stored data can be edited by anyone, so only known products and sane quantities are kept.
  function sanitizeCart(raw) {
    const clean = {};
    if (!raw || typeof raw !== 'object') return clean;
    for (const { id } of PRODUCTS) {
      const qty = raw[id];
      if (Number.isInteger(qty) && qty > 0) clean[id] = Math.min(qty, MAX_QTY);
    }
    return clean;
  }

  function loadCart() {
    try {
      return sanitizeCart(JSON.parse(localStorage.getItem(CART_KEY)));
    } catch {
      return {};
    }
  }

  let cart = loadCart();

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable (private mode): the cart still works for this visit */
    }
  }

  function setQty(id, qty) {
    if (!productById.has(id)) return;
    if (qty > 0) cart[id] = Math.min(qty, MAX_QTY);
    else delete cart[id];
    saveCart();
    renderCart();
  }

  function renderCart() {
    const entries = Object.entries(cart).map(([id, qty]) => [productById.get(Number(id)), qty]);
    const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
    const total = entries.reduce((sum, [p, qty]) => sum + p.price * qty, 0);

    const badge = $('#cartCount');
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
    $('#cartBtn').setAttribute('aria-label', count ? `Open cart, ${count} items` : 'Open cart');
    $('#cartTotal').textContent = money(total);

    $('#cartItems').replaceChildren(...(entries.length
      ? entries.map(([p, qty]) => h('li', {},
        h('div', { class: `mini-art${p.cover ? ' is-cover' : ''}` }, img({ ...p.img, alt: '' })),
        h('div', { class: 'mini-info' }, h('strong', { text: p.name }), h('span', { text: money(p.price) })),
        h('div', { class: 'qty' },
          h('button', { type: 'button', dataset: { dec: p.id }, 'aria-label': `Remove one ${p.name}`, text: '−' }),
          h('span', { text: qty }),
          h('button', { type: 'button', dataset: { inc: p.id }, 'aria-label': `Add one ${p.name}`, disabled: qty >= MAX_QTY, text: '+' }))))
      : [h('li', { class: 'empty', text: 'Your cart is empty.' })]));
  }

  /* ---------- Drawer ---------- */

  const drawer = $('#drawer');
  let lastFocus = null;
  const drawerIsOpen = () => document.body.classList.contains('drawer-open');

  function openDrawer() {
    lastFocus = document.activeElement;
    document.body.classList.add('drawer-open');
    drawer.inert = false;
    $('#cartBtn').setAttribute('aria-expanded', 'true');
    $('#closeDrawer').focus();
  }

  function closeDrawer() {
    if (!drawerIsOpen()) return;
    document.body.classList.remove('drawer-open');
    drawer.inert = true;
    $('#cartBtn').setAttribute('aria-expanded', 'false');
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  // Keep keyboard focus inside the open drawer
  function trapFocus(e) {
    if (e.key !== 'Tab' || !drawerIsOpen()) return;
    const focusable = [...drawer.querySelectorAll('button:not([disabled]), a[href], input')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initCart() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      if (add) {
        const id = Number(add.dataset.add);
        setQty(id, (cart[id] || 0) + 1);
        const btn = $('#cartBtn');
        btn.classList.remove('bump');
        void btn.offsetWidth; // restart the bump animation
        btn.classList.add('bump');
        toast(`${productById.get(id).name} added to cart`);
      }
      if (inc) setQty(Number(inc.dataset.inc), (cart[inc.dataset.inc] || 0) + 1);
      if (dec) setQty(Number(dec.dataset.dec), (cart[dec.dataset.dec] || 0) - 1);
    });

    $('#cartBtn').addEventListener('click', openDrawer);
    $('#closeDrawer').addEventListener('click', closeDrawer);
    $('#drawerBackdrop').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', trapFocus);

    // TODO: connect a payment provider (e.g. Stripe Checkout) here.
    $('#checkoutBtn').addEventListener('click', () => {
      toast(Object.keys(cart).length ? 'Online checkout is coming soon.' : 'Your cart is empty.');
    });

    // Keep the cart in sync across open tabs
    window.addEventListener('storage', (e) => {
      if (e.key !== CART_KEY) return;
      cart = loadCart();
      renderCart();
    });

    renderCart();
  }

  /* ================= Navigation ================= */

  function initNav() {
    const nav = $('#nav');
    const menuBtn = $('#menuBtn');
    const links = $('#navLinks');

    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      setMenu(false);
      closeDrawer();
    });

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Highlight the link of the section in view
    const linkFor = new Map([...links.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        linkFor.forEach((a, id) => a.classList.toggle('active', id === entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    linkFor.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ================= About & footer ================= */

  function initAbout() {
    const about = $('#about');
    const video = $('#aboutVideo');

    new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      about.classList.add('in');
      observer.disconnect();
    }, { threshold: 0.15 }).observe(about);

    // Play the background video only while it is on screen
    if (reduceMotion) return;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.preload = 'auto';
        video.play().catch(() => { /* poster stays */ });
      } else {
        video.pause();
      }
    }).observe(video);
  }

  function initNewsletter() {
    const form = $('#newsletter');
    const email = $('#email');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      email.value = email.value.trim();
      if (!email.checkValidity()) {
        toast('Please enter a valid email address.');
        email.focus();
        return;
      }
      // TODO: send the email to a mailing-list service before showing success.
      form.reset();
      toast('Thanks for subscribing!');
    });
  }

  /* ================= Start ================= */

  initSlider();
  initProducts();
  initCart();
  initNav();
  initAbout();
  initNewsletter();
  $('#year').textContent = new Date().getFullYear();
})();
