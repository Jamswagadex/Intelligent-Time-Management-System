const Store = {
  user: null,
  tasks: [],
  stats: null,
  listeners: [],

  setUser(u) { this.user = u; localStorage.setItem('itms_user', JSON.stringify(u)); this.emit(); },
  getUser() {
    if (this.user) return this.user;
    try { this.user = JSON.parse(localStorage.getItem('itms_user')); } catch {}
    return this.user;
  },
  clearUser() { this.user = null; localStorage.removeItem('itms_user'); this.emit(); },
  setTasks(t) { this.tasks = t; this.emit(); },
  setStats(s) { this.stats = s; this.emit(); },
  onChange(fn) { this.listeners.push(fn); },
  emit() { this.listeners.forEach(fn => fn()); },
};
