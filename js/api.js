// ============================================
// ANAYA COUTURE — API Client
// Wraps fetch with: base URL, credentials:include, error toasts
// ============================================

const API = {
  // ---- Core fetch wrapper ----
  async request(path, options = {}) {
    const url = `${Config.apiBase}${path}`;
    const opts = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    };
    if (options.body && typeof options.body === 'object') {
      opts.body = JSON.stringify(options.body);
    }
    try {
      const res = await fetch(url, opts);
      if (res.status === 204) return null;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || data.message || `Request failed (${res.status})`;
        // 401 means not logged in — show soft message
        if (res.status !== 401) {
          if (typeof App !== 'undefined') App.showToast('Error', msg, 'error');
        }
        throw Object.assign(new Error(msg), { status: res.status, data });
      }
      return data;
    } catch (err) {
      if (err.status) throw err; // already handled above
      if (typeof App !== 'undefined') App.showToast('Network Error', 'Could not reach the server. Please check your connection.', 'error');
      throw err;
    }
  },

  get(path) { return this.request(path, { method: 'GET' }); },
  post(path, body) { return this.request(path, { method: 'POST', body }); },
  patch(path, body) { return this.request(path, { method: 'PATCH', body }); },
  del(path) { return this.request(path, { method: 'DELETE' }); },

  // ---- Auth ----
  auth: {
    me() { return API.get('/auth/me'); },
    login(email, password) { return API.post('/auth/login', { email, password }); },
    register(name, email, password) { return API.post('/auth/register', { name, email, password }); },
    logout() { return API.post('/auth/logout', {}); }
  },

  // ---- Products ----
  products: {
    list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return API.get('/products' + (q ? '?' + q : ''));
    },
    get(slug) { return API.get('/products/' + slug); }
  },

  // ---- Cart ----
  cart: {
    get() { return API.get('/cart'); },
    add(variantId, qty) { return API.post('/cart', { variantId, qty }); },
    update(id, qty) { return API.patch('/cart/' + id, { qty }); },
    remove(id) { return API.del('/cart/' + id); }
  },

  // ---- Wishlist ----
  wishlist: {
    get() { return API.get('/wishlist'); },
    add(productId) { return API.post('/wishlist/' + productId, {}); },
    remove(productId) { return API.del('/wishlist/' + productId); }
  },

  // ---- Orders ----
  orders: {
    list() { return API.get('/orders'); },
    create(data) { return API.post('/orders', data); }
  },

  // ---- Payments ----
  payments: {
    razorpayOrder(orderId) { return API.post('/payments/razorpay/order', { orderId }); },
    razorpayVerify(data) { return API.post('/payments/razorpay/verify', data); }
  },

  // ---- Admin ----
  admin: {
    orders() { return API.get('/admin/orders'); },
    updateOrder(id, status) { return API.patch('/admin/orders/' + id, { status }); }
  }
};

if (typeof window !== 'undefined') window.API = API;
