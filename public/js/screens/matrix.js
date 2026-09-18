Router.register('/matrix', async () => {
  const { tasks } = await API.get('/tasks');
  const pending = tasks.filter(t => t.status === 'PENDING');

  const quadrants = [1, 2, 3, 4].map(q => ({
    q,
    action: Utils.quadrantAction(q),
    label: Utils.quadrantLabel(q),
    tasks: pending.filter(t => t.quadrant === q)
      .sort((a, b) => b.priorityScore - a.priorityScore),
  }));

  document.getElementById('view').innerHTML = `
    <h1 style="margin-bottom:4px;">Eisenhower Matrix</h1>
    <p style="font-size:13px;margin-bottom:16px;">Tasks are automatically classified based on importance and urgency.</p>
    <div class="matrix-grid" id="matrix"></div>
  `;

  const grid = document.getElementById('matrix');
  quadrants.forEach(({ q, action, label, tasks: qTasks }) => {
    const qEl = Utils.el(`
      <div class="quadrant" data-q="${q}">
        <h3>Q${q} · ${action}</h3>
        <div class="action">${label}</div>
        <div class="q-tasks"></div>
      </div>
    `);
    const list = qEl.querySelector('.q-tasks');
    if (!qTasks.length) {
      list.innerHTML = `<div style="font-size:11px;color:var(--on-surface-variant);text-align:center;padding:8px;">No tasks in this quadrant.</div>`;
    } else {
      qTasks.forEach(t => {
        const mt = Utils.el(`
          <div class="mini-task ${Utils.priorityClass(t.priority)}">
            <div style="font-weight:600;">${Utils.escape(t.title)}</div>
            <div style="font-size:10px;color:var(--on-surface-variant);">
              ${t.priority} · due ${Utils.formatDateShort(t.dueDate)}
            </div>
          </div>`);
        mt.onclick = () => location.hash = `#/tasks/${t.id}/edit`;
        list.appendChild(mt);
      });
    }
    grid.appendChild(qEl);
  });
});
