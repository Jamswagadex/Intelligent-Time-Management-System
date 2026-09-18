const API = {
  base: '/api',
  token() { return localStorage.getItem('itms_token'); },
  setToken(t) { t ? localStorage.setItem('itms_token', t) : localStorage.removeItem('itms_token'); },

  async request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && this.token()) headers['Authorization'] = 'Bearer ' + this.token();
    const res = await fetch(this.base + path, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      if (res.status === 401 && auth) {
        API.setToken(null);
        Store.clearUser();
        location.hash = '#/login';
      }
      const err = new Error((data && (data.error || data.message)) || 'Request failed');
      err.status = res.status;
      err.fieldErrors = data && data.errors;
      throw err;
    }
    return data;
  },
  get(p)         { return this.request(p); },
  post(p, b)     { return this.request(p, { method: 'POST', body: b }); },
  put(p, b)      { return this.request(p, { method: 'PUT', body: b }); },
  patch(p, b)    { return this.request(p, { method: 'PATCH', body: b }); },
  del(p)         { return this.request(p, { method: 'DELETE' }); },
};
