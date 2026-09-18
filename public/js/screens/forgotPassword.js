Router.register('/forgot', async () => {
  document.getElementById('view').innerHTML = `
    <div class="auth-wrap">
      <h1 class="auth-title">Reset password</h1>
      <p class="auth-sub">Enter your email and choose a new password</p>
      <form id="forgot-form" novalidate>
        <div class="field" data-field="email">
          <label for="email">Registered email</label>
          <input id="email" name="email" type="email" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="newPassword">
          <label for="newPassword">New password</label>
          <input id="newPassword" name="newPassword" type="password" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="confirmPassword">
          <label for="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required />
          <div class="error"></div>
        </div>
        <button class="btn btn-primary btn-block" type="submit" id="submit-btn">Reset password</button>
      </form>
      <p style="text-align:center;margin-top:16px;">
        <a href="#/login" style="color:var(--accent);font-weight:600;">Back to login</a>
      </p>
    </div>`;

  const form = document.getElementById('forgot-form');
  const setErr = (name, msg) => {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    wrap.classList.toggle('invalid', !!msg);
    wrap.querySelector('.error').textContent = msg || '';
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) errs.email = 'Enter a valid email address.';
    if (!payload.newPassword || payload.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters.';
    if (payload.newPassword !== payload.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errs).length) { Object.entries(errs).forEach(([k,v]) => setErr(k,v)); return; }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true; btn.textContent = 'Resetting…';
    try {
      await API.post('/auth/forgot-password', {
        email: payload.email,
        newPassword: payload.newPassword,
      });
      Utils.toast('Password reset. You can log in now.', 'success');
      location.hash = '#/login';
    } catch (err) {
      if (err.fieldErrors) Object.entries(err.fieldErrors).forEach(([k,v]) => setErr(k,v));
      else Utils.toast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Reset password';
    }
  };
});
