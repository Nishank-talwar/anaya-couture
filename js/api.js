(function initApi() {
  class ApiError extends Error {
    constructor(message, status, payload) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.payload = payload;
    }
  }

  function toastError(message) {
    if (window.App?.showToast) {
      window.App.showToast('Request Failed', message, 'error');
    }
  }

  async function request(path, options = {}) {
    const base = window.ANAYA_CONFIG?.API_BASE_URL || '';
    const prefix = window.ANAYA_CONFIG?.API_PREFIX || '/api';
    const response = await fetch(`${base}${prefix}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      const message = data?.error || data?.message || `Request failed (${response.status})`;
      const error = new ApiError(message, response.status, data);
      if (!options.silentError) toastError(message);
      throw error;
    }

    return data;
  }

  window.Api = {
    request,
    auth: {
      me: () => request('/auth/me', { silentError: true }),
      login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
      register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
      logout: () => request('/auth/logout', { method: 'POST' })
    },
    products: {
      list: () => request('/products', { silentError: true })
    },
    cart: {
      list: () => request('/cart', { silentError: true }),
      add: (payload) => request('/cart', { method: 'POST', body: JSON.stringify(payload) }),
      update: (id, qty) => request(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
      remove: (id) => request(`/cart/${id}`, { method: 'DELETE' })
    },
    wishlist: {
      list: () => request('/wishlist', { silentError: true }),
      add: (productId) => request(`/wishlist/${productId}`, { method: 'POST' }),
      remove: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' })
    },
    orders: {
      list: () => request('/orders', { silentError: true }),
      create: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) })
    },
    payments: {
      createRazorpayOrder: (payload) => request('/payments/razorpay/order', { method: 'POST', body: JSON.stringify(payload) }),
      verifyRazorpay: (payload) => request('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(payload) })
    }
  };
})();
