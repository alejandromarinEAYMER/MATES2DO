/* ===== PANEL PROFESOR — admin.js ===== */

const AVATARS = [
  '🦁','🐯','🦊','🐺','🦅','🐉','🦋','🐬','🦄','🐲',
  '🦈','🐻','🦝','🐙','🦖','🐸','🦓','🐼','🦩','🦔',
  '🐨','🦦','🦥','🐧','🦜','🐺','🦁','🐮','🐱','🐶',
];

const API = {
  get:    ()         => fetch('/api/alumnos').then(r => r.json()),
  update: (body)     => fetch('/api/update-alumno', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => r.json()),
  reset:  (password) => fetch('/api/reset', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password }) }).then(r => r.json()),
};

let alumnos = [];
let editingId = null;
let selectedAvatar = null;

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, isError = false) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast' + (isError ? ' error' : '');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── Sorting ───────────────────────────────────────────────────
function sortAlumnos(arr) {
  return [...arr].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

// ── Render admin cards ────────────────────────────────────────
function getRankLabel(pos) {
  if (pos === 1) return '🥇 #1';
  if (pos === 2) return '🥈 #2';
  if (pos === 3) return '🥉 #3';
  return `#${pos}`;
}

function renderAdminGrid(filter = '') {
  const grid = document.getElementById('adminGrid');
  const sorted = sortAlumnos(alumnos);

  const filtered = filter
    ? sorted.filter(a => a.nombre.toLowerCase().includes(filter.toLowerCase()))
    : sorted;

  if (!filtered.length) {
    grid.innerHTML = `<div class="loading">Sin resultados</div>`;
    return;
  }

  grid.innerHTML = filtered.map(a => {
    const pos = sorted.findIndex(x => x.id === a.id) + 1;
    return `
      <div class="admin-card" id="card-${a.id}">
        <span class="rank-badge">${getRankLabel(pos)}</span>
        <button class="card-avatar-btn" data-id="${a.id}" title="Cambiar avatar">${a.avatar}</button>
        <div class="card-info">
          <div class="card-name">${escHtml(a.nombre)}</div>
          <div class="card-pts-label">Puntos actuales</div>
        </div>
        <div class="card-controls">
          <button class="btn-minus" data-id="${a.id}" data-delta="-1" title="−1 punto">−</button>
          <span class="card-pts-display" id="pts-${a.id}">${a.puntos}</span>
          <button class="btn-plus" data-id="${a.id}" data-delta="1" title="+1 punto">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// ── Update points (optimistic) ────────────────────────────────
async function updatePoints(id, delta) {
  const alumno = alumnos.find(a => a.id === id);
  if (!alumno) return;

  const newPts = Math.max(0, alumno.puntos + delta);
  alumno.puntos = newPts;

  // Optimistic UI update
  const ptsEl = document.getElementById(`pts-${id}`);
  if (ptsEl) {
    ptsEl.textContent = newPts;
    ptsEl.style.transform = 'scale(1.3)';
    setTimeout(() => ptsEl.style.transform = '', 200);
  }

  try {
    const res = await API.update({ id, puntos: newPts });
    if (!res.success) throw new Error(res.error);

    showToast(`${alumno.nombre}: ${newPts} pts ${delta > 0 ? '⬆️' : '⬇️'}`);

    // Re-render to update rank badges
    renderAdminGrid(document.getElementById('searchInput').value);
  } catch (e) {
    alumno.puntos -= delta; // rollback
    showToast('Error al guardar. Reintentar.', true);
    renderAdminGrid(document.getElementById('searchInput').value);
  }
}

// ── Edit modal ────────────────────────────────────────────────
function openEditModal(id) {
  const alumno = alumnos.find(a => a.id === id);
  if (!alumno) return;

  editingId = id;
  selectedAvatar = alumno.avatar;

  document.getElementById('editName').value = alumno.nombre;

  // Build emoji grid
  const grid = document.getElementById('emojiGrid');
  grid.innerHTML = AVATARS.map(e => `
    <button class="emoji-btn ${e === alumno.avatar ? 'selected' : ''}" data-emoji="${e}">${e}</button>
  `).join('');

  document.getElementById('editModal').classList.add('open');
  document.getElementById('editName').focus();
}

async function saveEdit() {
  const alumno = alumnos.find(a => a.id === editingId);
  if (!alumno) return;

  const newName = document.getElementById('editName').value.trim();
  if (!newName) { showToast('El nombre no puede estar vacío', true); return; }

  alumno.nombre = newName;
  alumno.avatar = selectedAvatar;

  document.getElementById('editModal').classList.remove('open');

  try {
    const res = await API.update({ id: editingId, nombre: newName, avatar: selectedAvatar });
    if (!res.success) throw new Error(res.error);
    showToast('✅ Alumno actualizado');
    renderAdminGrid(document.getElementById('searchInput').value);
  } catch (e) {
    showToast('Error al guardar', true);
    await loadAlumnos(); // reload from server
  }
}

// ── Reset ─────────────────────────────────────────────────────
async function doReset() {
  const pw = document.getElementById('resetPassword').value;
  if (!pw) { showToast('Introduce la contraseña', true); return; }

  const btn = document.getElementById('confirmReset');
  btn.disabled = true;
  btn.textContent = 'Reseteando...';

  try {
    const res = await API.reset(pw);
    if (!res.success) throw new Error(res.error || 'Contraseña incorrecta');
    document.getElementById('resetModal').classList.remove('open');
    document.getElementById('resetPassword').value = '';
    showToast('✅ Puntuaciones reseteadas');
    await loadAlumnos();
  } catch (e) {
    showToast(e.message || 'Error al resetear', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Resetear todo';
  }
}

// ── Load ──────────────────────────────────────────────────────
async function loadAlumnos() {
  try {
    alumnos = await API.get();
    renderAdminGrid(document.getElementById('searchInput').value);
  } catch (e) {
    document.getElementById('adminGrid').innerHTML =
      `<div class="loading">⚠️ Error al cargar. Recarga la página.</div>`;
  }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Event delegation ──────────────────────────────────────────
document.getElementById('adminGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-delta]');
  if (btn) {
    const id = parseInt(btn.dataset.id);
    const delta = parseInt(btn.dataset.delta);
    updatePoints(id, delta);
    return;
  }
  const avatarBtn = e.target.closest('.card-avatar-btn');
  if (avatarBtn) {
    openEditModal(parseInt(avatarBtn.dataset.id));
  }
});

document.getElementById('emojiGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.emoji-btn');
  if (!btn) return;
  selectedAvatar = btn.dataset.emoji;
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  renderAdminGrid(e.target.value);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('resetModal').classList.add('open');
});
document.getElementById('cancelReset').addEventListener('click', () => {
  document.getElementById('resetModal').classList.remove('open');
  document.getElementById('resetPassword').value = '';
});
document.getElementById('confirmReset').addEventListener('click', doReset);

document.getElementById('cancelEdit').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('open');
});
document.getElementById('confirmEdit').addEventListener('click', saveEdit);

document.getElementById('editName').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveEdit();
  if (e.key === 'Escape') document.getElementById('editModal').classList.remove('open');
});

// Close modals clicking overlay
['resetModal','editModal'].forEach(id => {
  document.getElementById(id).addEventListener('click', (e) => {
    if (e.target.id === id) document.getElementById(id).classList.remove('open');
  });
});

// ── Init ──────────────────────────────────────────────────────
loadAlumnos();
