const Notifications = {
  seenIds: new Set(JSON.parse(localStorage.getItem('itms_seen_notifs') || '[]')),

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const r = await Notification.requestPermission();
    return r === 'granted';
  },

  async show(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, { body, icon: '/icon.png', badge: '/icon.png' });
    } else {
      new Notification(title, { body });
    }
  },

  persist() {
    localStorage.setItem('itms_seen_notifs', JSON.stringify([...this.seenIds]));
  },

  /** Polls server for un-sent notifications every 30s. */
  startPolling() {
    const poll = async () => {
      if (!API.token()) return;
      try {
        const { notifications } = await API.get('/user/notifications');
        const user = Store.getUser();
        if (user && user.notificationsEnabled === false) return;
        for (const n of notifications) {
          if (n.is_sent && !this.seenIds.has(n.id)) {
            this.seenIds.add(n.id);
            this.persist();
            this.show(n.title, n.body);
            Utils.toast(n.title + ': ' + n.body);
          }
        }
      } catch {}
    };
    poll();
    setInterval(poll, 30000);
  },
};

// Register service worker for better notification support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
