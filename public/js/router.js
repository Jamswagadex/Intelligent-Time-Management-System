const Router = {
  routes: {},

  register(path, handler) { this.routes[path] = handler; },

  match(hash) {
    const clean = hash.replace(/^#/, '') || '/splash';
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const keys = [];
      const regex = new RegExp('^' + pattern.replace(/:([^/]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
      const m = clean.match(regex);
      if (m) {
        const params = {};
        keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
        return { handler, params };
      }
    }
    return null;
  },

  navigate(hash) { location.hash = hash; },

  async render() {
    const token = API.token();
    const authedRoutes = ['/dashboard','/tasks','/tasks/new','/tasks/:id/edit','/matrix',
                          '/calendar','/profile','/profile/edit','/profile/password',
                          '/settings','/stats','/about'];
    const guestRoutes  = ['/splash','/welcome','/login','/register','/forgot'];

    let clean = location.hash.replace(/^#/, '') || '/splash';
    const isGuest = guestRoutes.includes(clean) || clean === '';
    const isAuth  = authedRoutes.some(r =>
      new RegExp('^' + r.replace(/:[^/]+/g, '[^/]+') + '$').test(clean));

    if (isAuth && !token) { location.hash = '#/login'; return; }
    if (isGuest && token && clean === '/login') { location.hash = '#/dashboard'; return; }

    const m = this.match(location.hash);
    if (!m) { location.hash = token ? '#/dashboard' : '#/welcome'; return; }

    // Toggle chrome
    const isAuthedView = isAuth;
    document.getElementById('bottomnav').classList.toggle('hidden', !isAuthedView);
    document.getElementById('topbar').classList.toggle('hidden', true);

    if (isAuthedView) this.renderBottomNav(clean);

    try { await m.handler(m.params, clean); }
    catch (e) { console.error(e); Utils.toast(e.message || 'Error', 'error'); }
  },

  renderBottomNav(active) {
    const tabs = [
      { path: '/dashboard', label: 'Home',     icon: 'home' },
      { path: '/tasks',     label: 'Tasks',    icon: 'tasks' },
      { path: '/matrix',    label: 'Matrix',   icon: 'matrix' },
      { path: '/calendar',  label: 'Calendar', icon: 'calendar' },
      { path: '/profile',   label: 'Profile',  icon: 'profile' },
    ];
    const nav = document.getElementById('bottomnav');
    nav.innerHTML = '';
    tabs.forEach(t => {
      const btn = Utils.el(`<button aria-label="${t.label}">
        ${Utils.icons[t.icon]}<span>${t.label}</span>
      </button>`);
      const isActive = active === t.path ||
        (t.path === '/tasks' && active.startsWith('/tasks'));
      if (isActive) btn.classList.add('active');
      btn.onclick = () => location.hash = '#' + t.path;
      nav.appendChild(btn);
    });
  },
};

window.addEventListener('hashchange', () => Router.render());
window.addEventListener('DOMContentLoaded', () => Router.render());
