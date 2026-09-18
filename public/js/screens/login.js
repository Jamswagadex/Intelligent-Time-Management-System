Router.register('/login', async () => {
  document.getElementById('view').innerHTML = `
    <div class="auth-wrap">
      <div class="auth-logo">⏱</div>
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-sub">Log in to continue</p>
      <form id="login-form" novalidate>
        <div class="field" data-field="email">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="password">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
          <div class="error"></div>
        </div>
        <button class="btn btn-primary btn-block" id="submit-btn" type="submit">Log in</button>
      </form>
      <p style="text-align:center;margin-top:12px;">
        <a href="#/forgot" style="color:var(--accent);font-weight:600;">Forgot password?</a>
      </p>
      <p style="text-align:center;margin-top:16px;">
        Don't have an account? <a href="#/register" style="color:var(--accent);font-weight:600;">Register</a>
      </p>
    </div>`;

  const form = document.getElementById('login-form');
  const setErr = (name, msg) => {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    wrap.classList.toggle('invalid', !!msg);
    wrap.querySelector('.error').textContent = msg || '';
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) errs.email = 'Enter a valid email address.';
    if (!payload.password) errs.password = 'Enter your password.';
    if (Object.keys(errs).length) { Object.entries(errs).forEach(([k,v]) => setErr(k,v)); return; }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true; btn.textContent = 'Logging in…';
    try {
      const { user, token } = await API.post('/auth/login', payload);
      API.setToken(token);
      Store.setUser(user);
      applyTheme(user.theme);
      Notifications.requestPermission();
      Utils.toast('Welcome back, ' + user.fullName.split(' ')[0] + '!', 'success');
      location.hash = '#/dashboard';
    } catch (err) {
      if (err.fieldErrors) Object.entries(err.fieldErrors).forEach(([k,v]) => setErr(k,v));
      else Utils.toast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Log in';
    }
  };
});
