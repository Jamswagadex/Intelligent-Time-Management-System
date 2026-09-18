Router.register('/tasks', async () => {
  const view = document.getElementById('view');
  view.innerHTML = '<div class="empty"><div class="icon">⏳</div><h3>Loading…</h3></div>';

  const { tasks } = await API.get('/tasks');
  Store.setTasks(tasks);

  let filter = 'all';
  let search = '';

  view.innerHTML = `
    <h1 style="margin-bottom:12px;">My Tasks</h1>
    <div class="search-bar">
      ${Utils.icons.search}
      <input id="search-input" placeholder="Search tasks…" aria-label="Search tasks" value="${Utils.escape(search)}" />
    </div>
    <div class="filter-chips" id="filters"></div>
    <div id="task-list"></div>
    <button class="fab" id="fab-add" aria-label="Add task">+</button>
  `;

  const filters = [
    { id: 'all',        label: 'All' },
    { id: 'pending',    label: 'Pending' },
    { id: 'completed',  label: 'Completed' },
    { id: 'overdue',    label: 'Overdue' },
    { id: 'q1',         label: 'Q1 · DO FIRST' },
    { id: 'q2',         label: 'Q2 · SCHEDULE' },
    { id: 'q3',         label: 'Q3 · DELEGATE' },
    { id: 'q4',         label: 'Q4 · MINIMIZE' },
    { id: 'CRITICAL',   label: 'Critical' },
    { id: 'HIGH',       label: 'High' },
    { id: 'MEDIUM',     label: 'Medium' },
    { id: 'LOW',        label: 'Low' },
    ...['Academic','Personal','Project','Assignment','Examination','Other'].map(c => ({ id: 'cat:' + c, label: c })),
  ];

  const chipsEl = document.getElementById('filters');
  filters.forEach(f => {
    const chip = Utils.el(`<button class="chip ${f.id === filter ? 'active' : ''}" data-id="${f.id}">${f.label}</button>`);
    chip.onclick = () => { filter = f.id; updateChips(); renderList(); };
    chipsEl.appendChild(chip);
  });

  function updateChips() {
    chipsEl.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.id === filter);
    });
  }

  function applyFilter(list) {
    const q = search.trim().toLowerCase();
    let out = list;
    if (q) out = out.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q));

    switch (filter) {
      case 'pending':   out = out.filter(t => t.status === 'PENDING'); break;
      case 'completed': out = out.filter(t => t.status === 'COMPLETED'); break;
      case 'overdue':   out = out.filter(t => t.deadlineStatus === 'overdue'); break;
      case 'q1':        out = out.filter(t => t.quadrant === 1); break;
      case 'q2':        out = out.filter(t => t.quadrant === 2); break;
      case 'q3':        out = out.filter(t => t.quadrant === 3); break;
      case 'q4':        out = out.filter(t => t.quadrant === 4); break;
      case 'CRITICAL':
      case 'HIGH':
      case 'MEDIUM':
      case 'LOW':       out = out.filter(t => t.priority === filter); break;
      default:
        if (filter.startsWith('cat:')) out = out.filter(t => t.category === filter.slice(4));
    }
    return out;
  }

  function renderList() {
    const listEl = document.getElementById('task-list');
    listEl.innerHTML = '';
    const filtered = applyFilter(tasks);
    if (!filtered.length) {
      listEl.innerHTML = `
        <div class="empty">
          <div class="icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Your schedule is clear. Add a task to get started.</p>
        </div>`;
      return;
    }
    filtered.forEach(t => listEl.appendChild(taskCard(t)));
  }

  document.getElementById('search-input').addEventListener('input', (e) => {
    search = e.target.value; renderList();
  });

  document.getElementById('fab-add').onclick = () => location.hash = '#/tasks/new';

  renderList();
});
