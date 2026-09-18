Router.register('/calendar', async () => {
  const { tasks } = await API.get('/tasks');
  let currentYear, currentMonth, selectedDate;

  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  selectedDate = Utils.todayISO();

  document.getElementById('view').innerHTML = `
    <h1 style="margin-bottom:16px;">Calendar</h1>
    <div class="card">
      <div class="calendar-header">
        <button id="prev-month" class="btn btn-text" aria-label="Previous month" style="padding:8px;">‹</button>
        <h3 id="month-label"></h3>
        <button id="next-month" class="btn btn-text" aria-label="Next month" style="padding:8px;">›</button>
      </div>
      <div class="calendar-grid" id="cal-grid"></div>
    </div>
    <div class="section-title" id="day-title">Tasks</div>
    <div id="day-tasks"></div>
  `;

  function renderCalendar() {
    const monthLabel = new Date(currentYear, currentMonth, 1)
      .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    document.getElementById('month-label').textContent = monthLabel;

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';
    ['S','M','T','W','T','F','S'].forEach(d => {
      grid.appendChild(Utils.el(`<div class="dow">${d}</div>`));
    });

    const first = new Date(currentYear, currentMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      grid.appendChild(dayCell(d, currentMonth - 1, true));
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      grid.appendChild(dayCell(d, currentMonth, false));
    }
    // Next month padding to complete the row
    let trailing = 7 - ((startDay + daysInMonth) % 7);
    if (trailing === 7) trailing = 0;
    for (let d = 1; d <= trailing; d++) {
      grid.appendChild(dayCell(d, currentMonth + 1, true));
    }
  }

  function dayCell(day, month, otherMonth) {
    const y = currentYear + Math.floor(month / 12);
    const m = ((month % 12) + 12) % 12;
    const iso = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const cell = Utils.el(`<div class="day ${otherMonth ? 'other-month' : ''}" role="button" tabindex="0">
      <span>${day}</span>
    </div>`);
    const dayTasks = tasks.filter(t => t.dueDate === iso && t.status === 'PENDING');
    if (dayTasks.length) {
      const overdue = dayTasks.some(t => t.deadlineStatus === 'overdue');
      cell.appendChild(Utils.el(`<div class="dot ${overdue ? 'overdue' : ''}"></div>`));
    }
    if (iso === Utils.todayISO()) cell.classList.add('today');
    if (iso === selectedDate) cell.classList.add('selected');
    cell.onclick = () => { selectedDate = iso; renderCalendar(); renderDayTasks(); };
    return cell;
  }

  function renderDayTasks() {
    const titleEl = document.getElementById('day-title');
    titleEl.textContent = 'Tasks on ' + Utils.formatDate(selectedDate);
    const list = document.getElementById('day-tasks');
    list.innerHTML = '';
    const filtered = tasks.filter(t => t.dueDate === selectedDate)
                          .sort((a,b) => (a.dueTime||'').localeCompare(b.dueTime||''));
    if (!filtered.length) {
      list.innerHTML = `<div class="empty"><div class="icon">📅</div><h3>No tasks scheduled.</h3><p>Add a task for this date.</p></div>`;
      return;
    }
    filtered.forEach(t => list.appendChild(taskCard(t)));
  }

  document.getElementById('prev-month').onclick = () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  };
  document.getElementById('next-month').onclick = () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  };

  renderCalendar();
  renderDayTasks();
});
