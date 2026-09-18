async function renderTaskForm(taskId) {
  const isEdit = !!taskId;
  let task = null;
  if (isEdit) {
    const r = await API.get(`/tasks/${taskId}`);
    task = r.task;
  }
  const user = Store.getUser() || {};
  const categories = ['Academic','Personal','Project','Assignment','Examination','Other'];
  const defaultReminder = user.defaultReminder ?? 30;

  document.getElementById('view').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
      <button class="icon-btn" id="back-btn" aria-label="Back" style="color:var(--primary);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${Utils.icons.back}</button>
      <h2>${isEdit ? 'Edit task' : 'New task'}</h2>
    </div>
    <form id="task-form" novalidate>
      <div class="field" data-field="title">
        <label for="title">Title *</label>
        <input id="title" name="title" required value="${Utils.escape(task?.title || '')}" placeholder="e.g. Submit Database Assignment" />
        <div class="error"></div>
      </div>
      <div class="field" data-field="description">
        <label for="description">Description</label>
        <textarea id="description" name="description" placeholder="Optional details…">${Utils.escape(task?.description || '')}</textarea>
        <div class="error"></div>
      </div>
      <div class="field" data-field="category">
        <label for="category">Category *</label>
        <select id="category" name="category" required>
          ${categories.map(c => `<option ${task?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <div class="error"></div>
      </div>
      <div class="field" data-field="importance">
        <label>Importance *</label>
        <div class="radio-group">
          <label><input type="radio" name="importance" value="1" ${task?.importance ? 'checked' : ''}><span>Important</span></label>
          <label><input type="radio" name="importance" value="0" ${task && !task.importance ? 'checked' : ''}><span>Not important</span></label>
        </div>
        <div class="error"></div>
      </div>
      <div class="field" data-field="urgency">
        <label>Urgency *</label>
        <div class="radio-group">
          <label><input type="radio" name="urgency" value="1" ${task?.urgency ? 'checked' : ''}><span>Urgent</span></label>
          <label><input type="radio" name="urgency" value="0" ${task && !task.urgency ? 'checked' : ''}><span>Not urgent</span></label>
        </div>
        <div class="error"></div>
      </div>
      <div class="field" data-field="dueDate">
        <label for="dueDate">Due date *</label>
        <input id="dueDate" name="dueDate" type="date" required value="${task?.dueDate || Utils.todayISO()}" />
        <div class="error"></div>
      </div>
      <div class="field" data-field="dueTime">
        <label for="dueTime">Due time</label>
        <input id="dueTime" name="dueTime" type="time" value="${task?.dueTime || ''}" />
        <div class="error"></div>
      </div>
      <div class="field" data-field="reminderMinutes">
        <label for="reminderMinutes">Reminder</label>
        <select id="reminderMinutes" name="reminderMinutes">
          ${[[0,'No reminder'],[10,'10 minutes before'],[30,'30 minutes before'],[60,'1 hour before'],[1440,'1 day before']]
            .map(([v,l]) => `<option value="${v}" ${((task?.reminderMinutes ?? defaultReminder) == v) ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <div class="error"></div>
      </div>
      <div class="field" data-field="estimatedDuration">
        <label for="estimatedDuration">Estimated duration (minutes)</label>
        <input id="estimatedDuration" name="estimatedDuration" type="number" min="5" max="1440" value="${task?.estimatedDuration || 30}" />
        <div class="error"></div>
      </div>

      <div class="card" id="preview-card" style="background:var(--surface-2);margin-bottom:16px;">
        <div class="section-title" style="margin-top:0;">Live preview</div>
        <div id="preview-body" style="font-size:13px;color:var(--on-surface-variant);"></div>
      </div>

      <button type="submit" class="btn btn-primary btn-block" id="save-btn">${isEdit ? 'Save changes' : 'Create task'}</button>
      ${isEdit ? `<button type="button" class="btn btn-danger btn-block" id="delete-btn" style="margin-top:8px;">Delete task</button>` : ''}
    </form>
  `;

  const form = document.getElementById('task-form');
  const setErr = (name, msg) => {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    wrap.classList.toggle('invalid', !!msg);
    wrap.querySelector('.error').textContent = msg || '';
  };

  function computeLocal(imp, urg, dueDate, est) {
    const quadrant = imp && urg ? 1 : imp && !urg ? 2 : !imp && urg ? 3 : 4;
    const action = { 1:'DO FIRST', 2:'SCHEDULE', 3:'DELEGATE', 4:'DELETE/MINIMIZE' }[quadrant];

    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dueDate + 'T00:00:00');
    const days = Math.round((due - today) / 86400000);

    let deadline = 2;
    if (days < 0) deadline = 30;
    else if (days === 0) deadline = 25;
    else if (days <= 2) deadline = 20;
    else if (days <= 7) deadline = 12;
    else if (days <= 14) deadline = 6;

    const quadBase = { 1: 50, 2: 35, 3: 20, 4: 5 }[quadrant];
    let durScore = est <= 30 ? 5 : est >= 180 ? -3 : 0;
    let score = quadBase + deadline + durScore + (days < 0 ? 15 : 0);
    score = Math.max(0, Math.min(100, score));

    const priority = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
    return { quadrant, action, priority, score };
  }

  function updatePreview() {
    const fd = new FormData(form);
    const imp = fd.get('importance') === '1';
    const urg = fd.get('urgency') === '1';
    const due = fd.get('dueDate') || Utils.todayISO();
    const est = Number(fd.get('estimatedDuration') || 30);
    const p = computeLocal(imp, urg, due, est);
    document.getElementById('preview-body').innerHTML = `
      Quadrant: <strong>Q${p.quadrant} · ${p.action}</strong><br/>
      Priority: <strong>${p.priority}</strong> (score ${p.score}/100)
    `;
  }

  form.addEventListener('input', () => { updatePreview(); });
  updatePreview();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      title: (fd.get('title') || '').trim(),
      description: (fd.get('description') || '').trim(),
      category: fd.get('category'),
      importance: fd.get('importance') === '1',
      urgency: fd.get('urgency') === '1',
      dueDate: fd.get('dueDate'),
      dueTime: fd.get('dueTime') || null,
      reminderMinutes: Number(fd.get('reminderMinutes') || 0),
      estimatedDuration: Number(fd.get('estimatedDuration') || 30),
    };

    // Client-side validation
    const errs = {};
    if (!payload.title) errs.title = 'Please enter a task title.';
    if (!payload.dueDate) errs.dueDate = 'Please select a valid deadline.';
    if (Object.keys(errs).length) { Object.entries(errs).forEach(([k,v]) => setErr(k,v)); return; }

    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    try {
      if (isEdit) await API.put(`/tasks/${taskId}`, payload);
      else        await API.post('/tasks', payload);
      Utils.toast(isEdit ? 'Task updated' : 'Task created', 'success');
      location.hash = '#/tasks';
    } catch (err) {
      if (err.fieldErrors) Object.entries(err.fieldErrors).forEach(([k,v]) => setErr(k,v));
      else Utils.toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  };

  document.getElementById('back-btn').onclick = () => history.back();

  const delBtn = document.getElementById('delete-btn');
  if (delBtn) delBtn.onclick = async () => {
    if (await Utils.confirm('Delete this task permanently?')) {
      try { await API.del(`/tasks/${taskId}`); Utils.toast('Task deleted', 'success'); location.hash = '#/tasks'; }
      catch (e) { Utils.toast(e.message, 'error'); }
    }
  };
}

Router.register('/tasks/new', () => renderTaskForm(null));
Router.register('/tasks/:id/edit', (params) => renderTaskForm(params.id));
