Router.register('/profile', async () => {
  const { user } = await API.get('/auth/me');
  Store.setUser(user);
  applyTheme(user.theme);

  const initials = (user.fullName || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  document.getElementById('view').innerHTML = `
    <div class="profile-header">
      <div class="avatar">${Utils.escape(initials)}</div>
      <h2>${Utils.escape(user.fullName)}</h2>
      <p style="font-size:13px;">${Utils.escape(user.email)}</p>
      <p style="font-size:12px;">${Utils.escape(user.department)} · ${Utils.escape(user.level)}</p>
    </div>

    <div class="list-item" id="nav-stats">
      <span>📊</span>
      <div class="grow"><div>Productivity statistics</div><div class="sub">View your progress</div></div>
      <div class="chev">${Utils.icons.chevron}</div>
    </div>
    <div class="list-item" id="nav-edit">
      <span>✏️</span>
      <div class="grow"><div>Edit profile</div><div class="sub">Update your details</div></div>
      <div class="chev">${Utils.icons.chevron}</div>
    </div>
    <div class="list-item" id="nav-password">
      <span>🔒</span>
      <div class="grow"><div>Change password</div><div class="sub">Keep your account secure</div></div>
      <div class="chev">${Utils.icons.chevron}</div>
    </div>
    <div class="list-item" id="nav-settings">
      <span>⚙️</span>
      <div class="grow"><div>Settings</div><div class="sub">Notifications, theme, about</div></div>
      <div class="chev">${Utils.icons.chevron}</div>
    </div>
    <div class="list-item" id="nav-logout" style="color:var(--critical);">
      <span>↩️</span>
      <div class="grow"><div>Log out</div></div>
    </div>
  `;

  document.getElementById('nav-stats').onclick = () => location.hash = '#/stats';
  document.getElementById('nav-edit').onclick = () => location.hash = '#/profile/edit';
  document.getElementById('nav-password').onclick = () => location.hash = '#/profile/password';
  document.getElementById('nav-settings').onclick = () => location.hash = '#/settings';
  document.getElementById('nav-logout').onclick = async () => {
    if (await Utils.confirm('Log out of your account?')) {
      API.setToken(null); Store.clearUser();
      Utils.toast('Logged out', 'success');
      location.hash = '#/login';
    }
  };
});

// Edit profile
Router.register('/profile/edit', async () => {
  const { user } = await API.get('/auth/me');
  const departments = ['Computer Science','Electrical Engineering','Mechanical Engineering',
    'Civil Engineering','Business Administration','Accountancy','Mass Communication',
    'Science Laboratory Technology','Statistics','Other'];
  const levels = ['ND 1','ND 2','HND 1','HND 2'];

  document.getElementById('view').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <button class="icon-btn" id="back-btn" aria-label="Back" style="color:var(--primary);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${Utils.icons.back}</button>
      <h2>Edit profile</h2>
    </div>
    <form id="edit-form" novalidate>
      <div class="field" data-field="fullName">
        <label for="fullName">Full name</label>
        <input id="fullName" name="fullName" value="${Utils.escape(user.fullName)}" required />
        <div class="error"></div>
      </div>
      <div class="field" data-field="department">
        <label for="department">Department</label>
        <select id="department" name="department">
          ${departments.map(d => `<option ${d===user.department?'selected':''}>${d}</option>`).join('')}
        </select>
        <div class="error"></div>
      </div>
      <div class="field" data-field="level">
        <label for="level">Level</label>
        <select id="level" name="level">
          ${levels.map(l => `<option ${l===user.level?'selected':''}>${l}</option>`).join('')}
        </select>
        <div class="error"></div>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Save changes</button>
    </form>
  `;

  document.getElementById('back-btn').onclick = () => location.hash = '#/profile';

  document.getElementById('edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    try {
      const { user: updated } = await API.put('/user/profile', payload);
      Store.setUser(updated);
      Utils.toast('Profile updated', 'success');
      location.hash = '#/profile';
    } catch (err) {
      if (err.fieldErrors) {
        for (const [k,v] of Object.entries(err.fieldErrors)) {
          const f = e.target.querySelector(`[data-field="${k}"]`);
          if (f) { f.classList.add('invalid'); f.querySelector('.error').textContent = v; }
        }
      } else Utils.toast(err.message, 'error');
    }
  };
});

// Change password
Router.register('/profile/password', async () => {
  document.getElementById('view').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <button class="icon-btn" id="back-btn" aria-label="Back" style="color:var(--primary);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${Utils.icons.back}</button>
      <h2>Change password</h2>
    </div>
    <form id="pw-form" novalidate>
      <div class="field" data-field="oldPassword">
        <label for="oldPassword">Current password</label>
        <input id="oldPassword" name="oldPassword" type="password" required />
        <div class="error"></div>
      </div>
      <div class="field" data-field="newPassword">
        <label for="newPassword">New password</label>
        <input id="newPassword" name="newPassword" type="password" required />
        <div class="error"></div>
      </div>
      <div class="field" data-field="confirm">
        <label for="confirm">Confirm new password</label>
        <input id="confirm" name="confirm" type="password" required />
        <div class="error"></div>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Update password</button>
    </form>
  `;

  document.getElementById('back-btn').onclick = () => location.hash = '#/profile';

  document.getElementById('pw-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = Object.fromEntries(new FormData(form).entries());
    if (fd.newPassword !== fd.confirm) {
      const f = form.querySelector(`[data-field="confirm"]`);
      f.classList.add('invalid'); f.querySelector('.error').textContent = 'Passwords do not match.';
      return;
    }
    try {
      await API.put('/user/password', { oldPassword: fd.oldPassword, newPassword: fd.newPassword });
      Utils.toast('Password updated', 'success');
      location.hash = '#/profile';
    } catch (err) {
      if (err.fieldErrors) {
        for (const [k,v] of Object.entries(err.fieldErrors)) {
          const f = form.querySelector(`[data-field="${k}"]`);
          if (f) { f.classList.add('invalid'); f.querySelector('.error').textContent = v; }
        }
      } else Utils.toast(err.message, 'error');
    }
  };
});
