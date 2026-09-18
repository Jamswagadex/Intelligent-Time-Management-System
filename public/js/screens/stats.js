Router.register('/stats', async () => {
  const { stats } = await API.get('/stats');
  const maxWeekly = Math.max(1, ...stats.weekly.map(d => d.completed));
  const maxQuad = Math.max(1, ...Object.values(stats.quadrants));

  document.getElementById('view').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <button class="icon-btn" id="back-btn" aria-label="Back" style="color:var(--primary);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${Utils.icons.back}</button>
      <h1 style="font-size:20px;">Productivity Statistics</h1>
    </div>

    <div class="stat-grid">
      <div class="stat-card"><div class="value">${stats.total}</div><div class="label">Total</div></div>
      <div class="stat-card"><div class="value">${stats.completed}</div><div class="label">Completed</div></div>
      <div class="stat-card"><div class="value">${stats.pending}</div><div class="label">Pending</div></div>
      <div class="stat-card"><div class="value" style="color:${stats.overdue?'var(--critical)':'var(--primary)'}">${stats.overdue}</div><div class="label">Overdue</div></div>
    </div>

    <div class="card" style="margin-top:16px;">
      <h3 style="margin-bottom:8px;">Overall completion</h3>
      <div class="progress-ring-wrap">
        <div class="progress-ring" style="--pct:${stats.completionPct};position:relative;">
          <span>${stats.completionPct}%</span>
        </div>
        <div>
          <p style="font-size:13px;">${stats.completed} of ${stats.total} tasks completed</p>
          <p style="font-size:12px;">${stats.dueToday} due today · ${stats.overdue} overdue</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <h3 style="margin-bottom:8px;">Last 7 days</h3>
      <div class="bar-chart">
        ${stats.weekly.map(d => `
          <div class="bar-wrap">
            <div class="bar" style="height:${(d.completed/maxWeekly)*100}%;" title="${d.completed} tasks"></div>
            <div class="bar-label">${d.label.slice(3)}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <h3 style="margin-bottom:8px;">Last 30 days</h3>
      <div class="bar-chart" style="height:100px;">
        ${stats.monthly.map(d => `
          <div class="bar-wrap">
            <div class="bar" style="height:${Math.max(2,(d.completed/Math.max(1,...stats.monthly.map(x=>x.completed)))*100)}%;"></div>
            <div class="bar-label" style="font-size:9px;">${d.label}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <h3 style="margin-bottom:12px;">Quadrant distribution</h3>
      <div class="quad-bars">
        ${[1,2,3,4].map(q => `
          <div class="quad-row" data-q="${q}">
            <div class="name">Q${q} · ${Utils.quadrantAction(q)}</div>
            <div class="bar-outer"><div class="bar-inner" style="width:${(stats.quadrants[q]/maxQuad)*100}%"></div></div>
            <div class="val">${stats.quadrants[q]}</div>
          </div>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('back-btn').onclick = () => location.hash = '#/profile';
});
