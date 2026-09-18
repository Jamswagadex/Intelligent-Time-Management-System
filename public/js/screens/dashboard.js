Router.register('/dashboard', async () => {
  const view = document.getElementById('view');
  view.innerHTML = '<div class="empty"><div class="icon">⏳</div><h3>Loading…</h3></div>';

  const [{ tasks }, { stats }, { recommendation }] = await Promise.all([
    API.get('/tasks'),
    API.get('/stats'),
    API.get('/tasks/recommend'),
  ]);
  Store.setTasks(tasks);
  Store.setStats(stats);

  const user = Store.getUser() || {};
  const today = Utils.todayISO();
  const pending = tasks.filter(t => t.status === 'PENDING');
  const completed = tasks.filter(t => t.status === 'COMPLETED');
  const todays = pending.filter(t => t.dueDate === today);
  const urgent = pending.filter(t => t.quadrant === 1 && t.dueDate >= today);
  const upcoming = pending
    .filter(t => t.dueDate > today)
    .sort((a, b) => (a.dueDate + (a.dueTime||'')).localeCompare(b.dueDate + (b.dueTime||'')))
    .slice(0, 5);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  view.innerHTML = `
    <div class="header-block">
      <p class="date">${dateStr}</p>
      <h1>${Utils.greeting()}, ${Utils.escape((user.fullName || 'Student').split(' ')[0])}</h1>
    </div>

    ${recommendation ? `
      <div class="recommend">
        <h3>Do this next</h3>
        <div class="rec-title">${Utils.escape(recommendation.title)}</div>
        <div class="rec-reason">${Utils.escape(recommendation.reason)}</div>
        <div class="rec-meta">${recommendation.priority} · due ${Utils.formatDate(recommendation.dueDate)}${recommendation.dueTime ? ' at ' + recommendation.dueTime : ''}</div>
      </div>` : ''}

    <div class="stat-grid">
      <div class="stat-card">
        <div class="value">${stats.pending}</div>
        <div class="label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="value">${stats.completed}</div>
        <div class="label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="value">${stats.completionPct}%</div>
        <div class="label">Completion</div>
      </div>
      <div class="stat-card">
        <div class="value" style="color:${stats.overdue ? 'var(--critical)' : 'var(--primary)'}">${stats.overdue}</div>
        <div class="label">Overdue</div>
      </div>
    </div>

    <div class="section-title">Today's tasks (${todays.length})</div>
    <div id="dash-today">${todays.length ? '' : emptyBlock('No tasks due today.', 'Enjoy the clear schedule or add a task.')}</div>

    <div class="section-title">Urgent — DO FIRST (${urgent.length})</div>
    <div id="dash-urgent">${urgent.length ? '' : emptyBlock('No urgent tasks.', 'Nothing requires immediate attention.')}</div>

    <div class="section-title">Upcoming deadlines</div>
    <div id="dash-upcoming">${upcoming.length ? '' : emptyBlock('No upcoming tasks.', 'Add a task to start planning ahead.')}</div>

    <button class="fab" id="fab-add" aria-label="Add task">+</button>
  `;

  function emptyBlock(title, sub) {
    return `<div class="empty"><h3>${title}</h3><p>${sub}</p></div>`;
  }

  // Render task cards
  const renderList = (container, list) => {
    list.forEach(t => container.appendChild(taskCard(t)));
  };

  const todayEl = document.getElementById('dash-today');
  if (todays.length) renderList(todayEl, todays);
  const urgentEl = document.getElementById('dash-urgent');
  if (urgent.length) renderList(urgentEl, urgent);
  const upEl = document.getElementById('dash-upcoming');
  if (upcoming.length) renderList(upEl, upcoming);

  document.getElementById('fab-add').onclick = () => location.hash = '#/tasks/new';
});

/** Renders a single task card. Reused across dashboard, tasks list, calendar. */
function taskCard(t) {
  const overdue = t.deadlineStatus === 'overdue';
  const card = Utils.el(`
    <div class="task-card ${t.status === 'COMPLETED' ? 'done' : ''} ${overdue ? 'overdue' : ''}"
         data-priority="${t.priority}">
      <div class="task-title">${Utils.escape(t.title)}</div>
      <div class="task-meta">
        <span class="chip ${Utils.priorityClass(t.priority)}">${t.priority}</span>
        <span class="chip">${Utils.escape(t.category)}</span>
        <span class="chip">Q${t.quadrant} · ${Utils.quadrantAction(t.quadrant)}</span>
        <span class="chip ${overdue ? 'overdue' : ''}">
          ${overdue ? 'Overdue ' : 'Due '}${Utils.formatDateShort(t.dueDate)}${t.dueTime ? ' ' + t.dueTime : ''}
        </span>
      </div>
      ${t.priorityReason ? `<div style="font-size:11px;color:var(--on-surface-variant);margin-top:6px;font-style:italic;">${Utils.escape(t.priorityReason)}</div>` : ''}
      <div class="task-actions"></div>
    </div>
  `);
  const actions = card.querySelector('.task-actions');
  const btnComplete = Utils.el(`<button class="btn-complete">${t.status === 'COMPLETED' ? 'Undo' : 'Complete'}</button>`);
  const btnEdit = Utils.el(`<button>Edit</button>`);
  const btnDelete = Utils.el(`<button class="btn-delete">Delete</button>`);

  btnComplete.onclick = async () => {
    const newStatus = t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await API.patch(`/tasks/${t.id}/status`, { status: newStatus });
      Utils.toast(newStatus === 'COMPLETED' ? 'Task completed' : 'Task reopened', 'success');
      Router.render();
    } catch (e) { Utils.toast(e.message, 'error'); }
  };
  btnEdit.onclick = () => location.hash = `#/tasks/${t.id}/edit`;
  btnDelete.onclick = async () => {
    if (await Utils.confirm('Delete this task permanently?')) {
      try { await API.del(`/tasks/${t.id}`); Utils.toast('Task deleted', 'success'); Router.render(); }
      catch (e) { Utils.toast(e.message, 'error'); }
    }
  };

  actions.append(btnComplete, btnEdit, btnDelete);
  return card;
}
