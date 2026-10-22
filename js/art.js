/* Inline SVG illustrations used across the site.
   Replace any of these with real product photos later (see README). */
const Art = (() => {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  // Coffee bag with a folded top and a label
  function bag({ body = '#1f1611', label = '#c89b6d', text = '#1f1611', name = 'ARTISAN', sub = 'Dark Roast' } = {}) {
    const g = id('bagGrad');
    const s = id('bagShine');
    return `
<svg class="art art-bag" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${g}" x1="0" x2="1">
      <stop offset="0" stop-color="${body}" stop-opacity=".85"/>
      <stop offset=".45" stop-color="${body}"/>
      <stop offset="1" stop-color="#000" stop-opacity=".9"/>
    </linearGradient>
    <linearGradient id="${s}" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".18"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="292" rx="80" ry="7" fill="#000" opacity=".35"/>
  <path d="M30 40 L170 40 L178 280 Q100 292 22 280 Z" fill="url(#${g})"/>
  <path d="M26 18 h148 v26 h-148z" fill="${body}" />
  <path d="M26 18 h148" stroke="#000" stroke-opacity=".3" stroke-width="2"/>
  ${Array.from({ length: 14 }, (_, i) => `<path d="M${32 + i * 10} 20 v22" stroke="#000" stroke-opacity=".18"/>`).join('')}
  <rect x="48" y="110" width="104" height="120" rx="6" fill="${label}"/>
  <text x="100" y="140" text-anchor="middle" font-family="Anton, sans-serif" font-size="20" fill="${text}">${name}</text>
  <path d="M68 150 h64" stroke="${text}" stroke-width="1.5"/>
  <text x="100" y="168" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="${text}">${sub}</text>
  <g transform="translate(100 196)" fill="${text}">
    <ellipse rx="10" ry="14" transform="rotate(25)"/>
    <path d="M-3 -12 Q4 0 -3 12" stroke="${label}" stroke-width="2" fill="none" transform="rotate(25)"/>
  </g>
  <rect x="64" y="40" width="22" height="240" fill="url(#${s})"/>
</svg>`;
  }

  // Cup with saucer and animated steam
  function cup({ cup = '#f4ece2', saucer = '#efe5d8', coffee = '#6b3e22', steam = true } = {}) {
    const g = id('cupGrad');
    const c = id('crema');
    return `
<svg class="art art-cup" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${g}" x1="0" x2="1">
      <stop offset="0" stop-color="#fff"/>
      <stop offset=".6" stop-color="${cup}"/>
      <stop offset="1" stop-color="#b9a48c"/>
    </linearGradient>
    <radialGradient id="${c}" cx=".45" cy=".45" r=".6">
      <stop offset="0" stop-color="#d9a066"/>
      <stop offset=".6" stop-color="#a8642f"/>
      <stop offset="1" stop-color="${coffee}"/>
    </radialGradient>
  </defs>
  ${steam ? `
  <g class="steam" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="6" opacity=".55">
    <path d="M105 80 C90 60 120 50 105 25"/>
    <path d="M130 78 C115 55 148 45 130 15"/>
    <path d="M155 80 C140 60 170 50 155 28"/>
  </g>` : ''}
  <ellipse cx="130" cy="222" rx="110" ry="22" fill="${saucer}"/>
  <ellipse cx="130" cy="216" rx="80" ry="12" fill="#000" opacity=".08"/>
  <path d="M195 120 q40 5 30 40 q-8 25 -45 30" fill="none" stroke="url(#${g})" stroke-width="14"/>
  <path d="M60 100 Q62 200 130 212 Q198 200 200 100 Z" fill="url(#${g})"/>
  <ellipse cx="130" cy="100" rx="70" ry="16" fill="#e8dccd"/>
  <ellipse cx="130" cy="102" rx="62" ry="12" fill="url(#${c})"/>
  <path d="M110 100 q20 -8 40 0 q-20 8 -40 0" fill="#f3d2a6" opacity=".7"/>
</svg>`;
  }

  // Espresso machine with portafilter and a small glass
  function machine({ body = '#2a2a2c', metal = '#c9ccd1' } = {}) {
    const m = id('metal');
    const b = id('mbody');
    return `
<svg class="art art-machine" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${m}" x1="0" x2="1">
      <stop offset="0" stop-color="#8d9096"/>
      <stop offset=".35" stop-color="#f3f4f6"/>
      <stop offset=".7" stop-color="${metal}"/>
      <stop offset="1" stop-color="#6e7177"/>
    </linearGradient>
    <linearGradient id="${b}" x1="0" x2="1">
      <stop offset="0" stop-color="#111"/>
      <stop offset=".5" stop-color="${body}"/>
      <stop offset="1" stop-color="#0c0c0d"/>
    </linearGradient>
  </defs>
  <ellipse cx="150" cy="288" rx="130" ry="9" fill="#000" opacity=".4"/>
  <rect x="40" y="30" width="220" height="70" rx="10" fill="url(#${b})"/>
  <rect x="40" y="96" width="40" height="180" fill="url(#${b})"/>
  <rect x="220" y="96" width="40" height="180" fill="url(#${b})"/>
  <rect x="34" y="268" width="232" height="16" rx="4" fill="url(#${m})"/>
  <rect x="84" y="250" width="132" height="18" rx="2" fill="#333"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${90 + i * 12.5}" y="254" width="7" height="10" fill="#1a1a1a"/>`).join('')}
  <circle cx="95" cy="64" r="20" fill="url(#${m})"/>
  <circle cx="95" cy="64" r="15" fill="#f8f5ef"/>
  <path d="M95 64 l8 -8" stroke="#c0392b" stroke-width="2"/>
  <circle cx="95" cy="64" r="2" fill="#222"/>
  <circle cx="205" cy="64" r="20" fill="url(#${m})"/>
  <circle cx="205" cy="64" r="15" fill="#f8f5ef"/>
  <path d="M205 64 l-6 -9" stroke="#c0392b" stroke-width="2"/>
  <circle cx="205" cy="64" r="2" fill="#222"/>
  <rect x="140" y="50" width="20" height="28" rx="4" fill="url(#${m})"/>
  <rect x="120" y="100" width="60" height="22" rx="4" fill="url(#${m})"/>
  <rect x="112" y="122" width="76" height="18" rx="6" fill="url(#${m})"/>
  <rect x="186" y="126" width="62" height="10" rx="5" fill="#141414"/>
  <path d="M140 140 v8 M160 140 v8" stroke="#888" stroke-width="4"/>
  <path class="pour" d="M143 150 v80 M157 150 v80" stroke="#6b3a1c" stroke-width="3" stroke-linecap="round"/>
  <path d="M118 192 h64 l-6 58 h-52 z" fill="#fff" opacity=".25" stroke="#fff" stroke-opacity=".5"/>
  <path d="M121 218 h58 l-3 32 h-52 z" fill="#5a2f15"/>
  <path d="M121 218 h58 l-1 6 h-56 z" fill="#c78a4f"/>
  <rect x="236" y="100" width="6" height="90" rx="3" fill="url(#${m})"/>
</svg>`;
  }

  // A single coffee bean
  function bean(color = '#3b2010') {
    return `<svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="20" cy="26" rx="17" ry="24" fill="${color}"/>
  <ellipse cx="15" cy="18" rx="6" ry="10" fill="#fff" opacity=".12"/>
  <path d="M20 4 C10 18 30 34 20 48" stroke="#140803" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
  }

  return { bag, cup, machine, bean };
})();
