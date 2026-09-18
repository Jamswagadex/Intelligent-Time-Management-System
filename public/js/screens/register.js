Router.register('/register', async () => {
  const departments = ['Computer Science','Electrical Engineering','Mechanical Engineering',
    'Civil Engineering','Business Administration','Accountancy','Mass Communication',
    'Science Laboratory Technology','Statistics','Other'];
  const levels = ['ND 1','ND 2','HND 1','HND 2'];

  document.getElementById('view').innerHTML = `
    <div class="auth-wrap">
      <h1 class="auth-title">Create your account</h1>
      <p class="auth-sub">Join the Intelligent Time Management System</p>
      <form id="reg-form" novalidate>
        <div class="field" data-field="fullName">
          <label for="fullName">Full name</label>
          <input id="fullName" name="fullName" autocomplete="name" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="email">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="password">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="new-password" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="confirmPassword">
          <label for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required />
          <div class="error"></div>
        </div>
        <div class="field" data-field="department">
          <label for="department">Department</label>
          <select id="department" name="department" required>
            <option value="">Select department</option>
            ${departments.map(d => `<option>${d}</option>`).join('')}
          </select>
          <div class="error"></div>
        </div>
        <div class="field" data-field="level">
          <label for="level">Level</label>
          <select id="level" name="level" required>
            <option value="">Select level</option>
            ${levels.map(l => `<option>${l}</option>`).join('')}
          </select>
          <div class="error"></div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="submit-btn">Create account</button>
      </form>
      <p style="text-align:center;margin-top:16px;">
        Already have an account? <a href="#/login" style="color:var(--accent);font-weight:600;">Log in</a>
      </p>
    </div>`;

  const form = document.getElementById('reg-form');

  const setErr = (name, msg) => {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    wrap.classList.toggle('invalid', !!msg);
    wrap.querySelector('.error').textContent = msg || '';
  };

  // Live validation
  ['fullName','email','password','confirmPassword','department','level'].forEach(n => {
    form[n].addEventListener('input', () => setErr(n, ''));
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    // Client-side validation
    const errs = {};
    if (!payload.fullName || payload.fullName.trim().length < 3) errs.fullName = 'Enter your full name (min 3 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) errs.email = 'Enter a valid email address.';
    if (!payload.password || payload.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (payload.password !== payload.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!payload.department) errs.department = 'Select your department.';
    if (!payload.level) errs.level = 'Select your level.';

    if (Object.keys(errs).length) { Object.entries(errs).forEach(([k,v]) => setErr(k, v)); return; }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true; btn.textContent = 'Creating…';
    try {
      const { user, token } = await API.post('/auth/register', payload, );
      API.setToken(token);
      Store.setUser(user);
      applyTheme(user.theme);
      Notifications.requestPermission();
      Utils.toast('Welcome, ' + user.fullName.split(' ')[0] + '!', 'success');
      location.hash = '#/dashboard';
    } catch (err) {
      if (err.fieldErrors) Object.entries(err.fieldErrors).forEach(([k,v]) => setErr(k, v));
      else Utils.toast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Create account';
    }
  };
});
