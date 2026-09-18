Router.register('/welcome', async () => {
  document.getElementById('view').innerHTML = `
    <div class="auth-wrap">
      <div class="welcome-art">⏱</div>
      <h1 class="auth-title">Intelligent Time Management System</h1>
      <p class="auth-sub">Prioritize your tasks with the Eisenhower Matrix and rule-based intelligent scheduling.</p>

      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin-bottom:8px;">Built for Students</h3>
        <p style="font-size:13px;line-height:1.6;">
          Manage academic and personal tasks, get automatic prioritization, and stay on top of every deadline —
          designed for The Polytechnic Ibadan.
        </p>
      </div>

      <button class="btn btn-primary btn-block" id="go-register">Create an account</button>
      <button class="btn btn-outline btn-block" id="go-login" style="margin-top:10px;">I already have an account</button>
      <p style="text-align:center;margin-top:16px;font-size:12px;">© The Polytechnic Ibadan — Final Year Project</p>
    </div>`;
  document.getElementById('go-register').onclick = () => location.hash = '#/register';
  document.getElementById('go-login').onclick = () => location.hash = '#/login';
});
