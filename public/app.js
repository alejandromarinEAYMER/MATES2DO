/* ===== RANKING PÚBLICO — app.js ===== */

const API = {
  get: () => fetch('/api/alumnos').then(r => r.json()),
};

// ── Stars background ──────────────────────────────────────────
function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      --dur: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 4}s;
      --brightness: ${0.3 + Math.random() * 0.7};
    `;
    container.appendChild(s);
  }
}

// ── Sorting: descending by points, then alphabetical for ties ─
function sortAlumnos(alumnos) {
  return [...alumnos].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

// ── Render podium (top 3) ─────────────────────────────────────
function renderPodium(sorted) {
  const podium = document.getElementById('podium');
  if (!sorted.length) { podium.innerHTML = ''; return; }

  const top = sorted.slice(0, 3);
  // Display order: 2nd, 1st, 3rd for visual podium effect
  const display = [top[1], top[0], top[2]].filter(Boolean);
  const posClass = ['p2', 'p1', 'p3'];
  const posNum = [2, 1, 3];
  const medals = ['🥈', '🥇', '🥉'];

  podium.innerHTML = display.map((a, i) => {
    const actualPos = top.indexOf(a);
    const cls = posClass[i];
    const medal = medals[i];
    return `
      <div class="podium-slot ${cls}">
        <div class="podium-avatar">${a.avatar}</div>
        <div class="podium-name">${escHtml(a.nombre)}</div>
        <div class="podium-pts">${a.puntos} <small style="font-size:0.6em;opacity:.6">pts</small></div>
        <div class="podium-block">${medal}</div>
      </div>
    `;
  }).join('');
}

// ── Render top 8 list ─────────────────────────────────────────
function renderRanking(sorted) {
  const list = document.getElementById('rankingList');
  const top8 = sorted.slice(0, 8);
  const maxPts = top8[0]?.puntos || 1;

  if (!top8.length) {
    list.innerHTML = `<div class="empty-state"><span class="big-emoji">📋</span>No hay alumnos todavía</div>`;
    return;
  }

  const delays = top8.map((_, i) => i * 0.07);

  list.innerHTML = top8.map((a, i) => {
    const pos = i + 1;
    let rankClass = 'rank-other';
    let posClass = 'other';
    let posLabel = `#${pos}`;
    if (pos === 1) { rankClass = 'rank-1'; posClass = 'gold'; posLabel = '🥇'; }
    if (pos === 2) { rankClass = 'rank-2'; posClass = 'silver'; posLabel = '🥈'; }
    if (pos === 3) { rankClass = 'rank-3'; posClass = 'bronze'; posLabel = '🥉'; }

    const barWidth = maxPts > 0 ? Math.round((a.puntos / maxPts) * 100) : 0;

    return `
      <div class="rank-card ${rankClass}" style="animation-delay:${delays[i]}s">
        <div class="rank-pos ${posClass}">${posLabel}</div>
        <div class="rank-avatar">${a.avatar}</div>
        <div class="rank-info">
          <div class="rank-name">${escHtml(a.nombre)}</div>
          <div class="xp-bar-wrap">
            <div class="xp-bar" style="width:${barWidth}%"></div>
          </div>
        </div>
        <div class="rank-pts">${a.puntos}<span>pts</span></div>
      </div>
    `;
  }).join('');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Main ──────────────────────────────────────────────────────
async function load() {
  try {
    const alumnos = await API.get();
    const sorted = sortAlumnos(alumnos);
    renderPodium(sorted);
    renderRanking(sorted);
  } catch (e) {
    document.getElementById('rankingList').innerHTML = `
      <div class="empty-state">
        <span class="big-emoji">⚠️</span>
        Error al cargar el ranking. Recarga la página.
      </div>
    `;
  }
}

// Auto-refresh every 30 seconds
createStars();
load();
setInterval(load, 30_000);
