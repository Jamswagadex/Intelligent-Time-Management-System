Router.register('/splash', async () => {
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="splash">
      <div class="logo">⏱</div>
      <h1>Intelligent Time Management</h1>
      <p style="color:rgba(255,255,255,.75);text-align:center;padding:0 24px;">
        The Polytechnic Ibadan
      </p>
      <div class="spinner"></div>
    </div>`;

  // Verify existing session
  if (API.token()) {
    try {
      const { user } = await API.get('/auth/me');
      Store.setUser(user);
      applyTheme(user.theme);
      setTimeout(() => location.hash = '#/dashboard', 600);
      return;
    } catch { API.setToken(null); Store.clearUser(); }
  }
  setTimeout(() => location.hash = '#/welcome', 900);
});
