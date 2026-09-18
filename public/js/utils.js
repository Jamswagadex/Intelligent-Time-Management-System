// Utility helpers shared across the app
const Utils = {
  el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  },
  escape(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  },
  todayISO() { return new Date().toISOString().slice(0, 10); },
  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  },
  formatDateShort(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  },
  formatTime(t) { return t || ''; },
  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  },
  priorityClass(p) { return String(p || 'low').toLowerCase(); },
  quadrantLabel(q) {
    return { 1: 'Urgent & Important', 2: 'Not Urgent & Important',
             3: 'Urgent & Not Important', 4: 'Not Urgent & Not Important' }[q];
  },
  quadrantAction(q) {
    return { 1: 'DO FIRST', 2: 'SCHEDULE', 3: 'DELEGATE', 4: 'DELETE/MINIMIZE' }[q];
  },
  toast(msg, kind = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + kind;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.add('hidden'), 2600);
  },
  confirm(message) {
    return new Promise(resolve => {
      const overlay = document.getElementById('modal');
      overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <h3>Confirm</h3>
          <p>${Utils.escape(message)}</p>
          <div class="actions">
            <button class="btn btn-text" data-act="cancel">Cancel</button>
            <button class="btn btn-danger" data-act="ok">Confirm</button>
          </div>
        </div>`;
      overlay.classList.remove('hidden');
      overlay.onclick = (e) => {
        if (e.target.dataset.act === 'ok') { overlay.classList.add('hidden'); overlay.innerHTML = ''; resolve(true); }
        else if (e.target.dataset.act === 'cancel' || e.target === overlay) {
          overlay.classList.add('hidden'); overlay.innerHTML = ''; resolve(false);
        }
      };
    });
  },
  // Simple SVG icon set (Material-ish)
  icons: {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z"/></svg>',
    tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    matrix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0116 0"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
  },
};
