Router.register('/settings', async () => {
  const { user } = await API.get('/auth/me');
  Store.setUser(user);

  document.getElementById('view').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <button class="icon-btn" id="back-btn" aria-label="Back" style="color:var(--primary);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${Utils.icons.back}</button>
      <h2>Settings</h2>
    </div>

    <div class="card">
      <h3 style="margin-bottom:12px;">Appearance</h3>
      <div class="list-item">
        <div class="grow"><div>Dark mode</div><div class="sub">Toggle theme</div></div>
        <label class="switch">
          <input type="checkbox" id="theme-toggle" ${user.theme==='dark'?'checked':''} />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="card" style="margin-top:12px;">
      <h3 style="margin-bottom:12px;">Notifications</h3>
      <div class="list-item">
        <div class="grow"><div>Enable notifications</div><div class="sub">Task reminders & overdue alerts</div></div>
        <label class="switch">
          <input type="checkbox" id="notif-toggle" ${user.notificationsEnabled?'checked':''} />
          <span class="slider"></span>
        </label>
      </div>
      <div class="list-item" style="display:block;">
        <div style="margin-bottom:8px;">Default reminder</div>
        <select id="default-reminder" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid var(--outline);background:var(--surface);color:var(--on-surface);">
          ${[[0,'No reminder'],[10,'10 minutes before'],[30,'30 minutes before'],[60,'1 hour before'],[1440,'1 day before']]
            .map(([v,l]) => `<option value="${v}" ${user.defaultReminder==v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-outline btn-block" id="test-notif" style="margin-top:8px;">Send test notification</button>
    </div>

    <div class="card" style="margin-top:12px;">
      <h3 style="margin-bottom:8px;">About application</h3>
      <p style="font-size:13px;line-height:1.7;">
        <strong>Intelligent Time Management System</strong><br/>
        Design and Implementation of an Intelligent Time Management System<br/>
        (A Case Study of The Polytechnic Ibadan)<br/><br/>
        Version 1.0 · Final-Year Undergraduate Project<br/>
        Built with Node.js, Express, SQLite, and vanilla JavaScript.
        Implements the Eisenhower Matrix for task classification and
        <em>Rule-Based Intelligent Task Prioritization</em>.
      </p>
    </div>

    <div class="list-item" id="logout-btn" style="color:var(--critical);margin-top:12px;">
      <span>↩️</span>
      <div class="grow"><div>Log out</div></div>
    </div>
  `;

  document.getElementById('back-btn').onclick = () => location.hash = '#/profile';

  document.getElementById('theme-toggle').onchange = async (e) => {
    const theme = e.target.checked ? 'dark' : 'light';
    applyTheme(theme);
    try {
      const { user: updated } = await API.put('/user/preferences', { theme });
      Store.setUser(updated);
    } catch (err) { Utils.toast(err.message, 'error'); }
  };

  document.getElementById('notif-toggle').onchange = async (e) => {
    const enabled = e.target.checked;
    if (enabled) await Notifications.requestPermission();
    try {
      const { user: updated } = await API.put('/user/preferences', { notificationsEnabled: enabled });
      Store.setUser(updated);
      Utils.toast(enabled ? 'Notifications enabled' : 'Notifications disabled', 'success');
    } catch (err) { Utils.toast(err.message, 'error'); }
  };

  document.getElementById('default-reminder').onchange = async (e) => {
    try {
      const { user: updated } = await API.put('/user/preferences', { defaultReminder: Number(e.target.value) });
      Store.setUser(updated);
    } catch (err) { Utils.toast(err.message, 'error'); }
  };

  document.getElementById('test-notif').onclick = async () => {
    const ok = await Notifications.requestPermission();
    if (!ok) return Utils.toast('Notification permission denied by browser.', 'error');
    await Notifications.show('Task Reminder', 'This is a test notification from ITMS.');
    Utils.toast('Test notification sent', 'success');
  };

  document.getElementById('logout-btn').onclick = async () => {
    if (await Utils.confirm('Log out of your account?')) {
      API.setToken(null); Store.clearUser();
      location.hash = '#/login';
    }
  };
});

// Global theme helper (used by splash/login/register too)
function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}
