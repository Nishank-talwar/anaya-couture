// ============================================
// ANAYA COUTURE — Core App Logic (Luxury Edition)
// Wired to backend APIs with localStorage fallbacks
// ============================================

const App = {
  cart: [],
  wishlist: [],
  user: null,
  orders: [],
  recentlyViewed: [],
  _apiProductsLoaded: false,

  async init() {
    this.loadState();
    this.initScrollEffects();
    this.initRevealAnimations();
    this.updateCartCount();
    this.initMobileNav();
    this.initSearch();
    await this.syncUser();
    console.log('✦ Anaya Couture — Heritage Luxe initialized');
  },

  // ============ AUTH SYNC ============
  async syncUser() {
    try {
      const user = await API.auth.me();
      this.user = user;
      this.saveState();
      this.updateAuthUI();
      await Promise.all([this.syncCartFromAPI(), this.syncWishlistFromAPI()]);
    } catch (err) {
      if (!err.status || err.status !== 401) {
        console.warn('Auth check failed', err);
      }
      this.user = null;
      this.saveState();
      this.updateAuthUI();
    }
  },

  updateAuthUI() {
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = this.user ? this.user.name : 'Guest'; });
    document.querySelectorAll('[data-logged-in]').forEach(el => { el.style.display = this.user ? '' : 'none'; });
    document.querySelectorAll('[data-logged-out]').forEach(el => { el.style.display = this.user ? 'none' : ''; });
  },

  async login(email, password) {
    const user = await API.auth.login(email, password);
    this.user = user;
    this.saveState();
    this.showToast('Welcome back', 'Hello ' + user.name + '! Glad to have you.', 'success');
    this.updateAuthUI();
    await Promise.all([this.syncCartFromAPI(), this.syncWishlistFromAPI()]);
    return user;
  },

  async register(name, email, password) {
    const user = await API.auth.register(name, email, password);
    this.user = user;
    this.saveState();
    this.showToast('Welcome', 'Hello ' + user.name + '! You have joined the Anaya family.', 'success');
    this.updateAuthUI();
    return user;
  },

  async logout() {
    try { await API.auth.logout(); } catch (e) { /* ignore */ }
    this.user = null;
    this.cart = [];
    this.wishlist = [];
    this.orders = [];
    this.saveState();
    this.updateCartCount();
    this.updateWishlistUI();
    this.showToast('Signed Out', 'See you soon.', 'info');
    this.updateAuthUI();
  },

  // ============ STATE MANAGEMENT ============
  loadState() {
    try {
      this.cart = JSON.parse(localStorage.getItem('ac_cart')) || [];
      this.wishlist = JSON.parse(localStorage.getItem('ac_wishlist')) || [];
      this.user = JSON.parse(localStorage.getItem('ac_user')) || null;
      this.orders = JSON.parse(localStorage.getItem('ac_orders')) || [];
      this.recentlyViewed = JSON.parse(localStorage.getItem('ac_recent')) || [];
    } catch (e) { console.warn('State load error', e); }
  },

  saveState() {
    localStorage.setItem('ac_cart', JSON.stringify(this.cart));
    localStorage.setItem('ac_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('ac_user', JSON.stringify(this.user));
    localStorage.setItem('ac_orders', JSON.stringify(this.orders));
    localStorage.setItem('ac_recent', JSON.stringify(this.recentlyViewed));
  },

  // ============ SCROLL EFFECTS ============
  initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const prog = document.querySelector('.scroll-progress');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (navbar) {
            if (y > 60) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
          }
          if (prog) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            prog.style.width = (y / h * 100) + '%';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  },

  initRevealAnimations() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children, .reveal-pretty');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed', 'staggered');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  },

  // ============ MOBILE NAV ============
  initMobileNav() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.mobile-nav');
    const close = document.querySelector('.mobile-nav-close');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.add('active'));
    if (close) close.addEventListener('click', () => nav.classList.remove('active'));
    nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => nav.classList.remove('active')));
  },

  // ============ SEARCH ============
  initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    if (!searchBtn || !searchOverlay) return;
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput && searchInput.focus(), 300);
    });
    if (searchClose) searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
    if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) searchOverlay.classList.remove('active'); });
  },

  handleSearch(query) {
    const results = document.getElementById('search-results');
    if (!results || !window.PRODUCTS) return;
    if (query.length < 2) { results.innerHTML = '<p style="padding:20px;text-align:center;color:var(--mist)">Type to search...</p>'; return; }
    const q = query.toLowerCase();
    const found = window.PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.includes(q) || (p.subcategory || '').toLowerCase().includes(q) || (p.occasion || '').toLowerCase().includes(q)
    ).slice(0, 6);
    if (!found.length) { results.innerHTML = '<p style="padding:20px;text-align:center;color:var(--mist)">No products found</p>'; return; }
    results.innerHTML = found.map(p => {
      const img = (p.images && p.images[0]) || '';
      return '<a href="product.html?id=' + p.id + '" style="display:flex;gap:16px;padding:16px;border-bottom:1px solid rgba(185,134,11,.08);text-decoration:none;transition:background .2s"><div style="width:60px;height:80px;flex-shrink:0;overflow:hidden"><img src="' + this._esc(img) + '" alt="' + this._esc(p.name) + '" style="width:100%;height:100%;object-fit:cover"></div><div><h4 style="font-family:var(--font-display);font-size:.9rem;color:var(--onyx);margin-bottom:2px">' + this._esc(p.name) + '</h4><p style="font-size:.75rem;color:var(--gold-soft);font-family:var(--font-accent);font-style:italic">' + this._esc(p.subcategory || '') + '</p><span style="font-weight:700;font-size:.85rem;color:var(--onyx)">₹' + (p.price || 0).toLocaleString() + '</span></div></a>';
    }).join('');
  },

  // ============ CART ============
  async addToCart(productId, size, color, qty) {
    qty = qty || 1;
    const product = window.PRODUCTS ? window.PRODUCTS.find(p => p.id === productId) : null;
    if (!product) return;
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Free Size';
    const selectedColor = color || (product.colors && product.colors[0] && product.colors[0].name) || '';

    const variantId = this._findVariantId(product, selectedSize, selectedColor);

    if (this.user && variantId) {
      try {
        await API.cart.add(variantId, qty);
        await this.syncCartFromAPI();
        this.showToast('Added to Bag', product.name + ' has been added.', 'success');
        return;
      } catch (err) {
        console.warn('API cart add failed, using localStorage', err);
      }
    }

    const existing = this.cart.find(i => i.id === productId && i.size === selectedSize && i.color === selectedColor);
    if (existing) {
      existing.qty += qty;
    } else {
      this.cart.push({ id: productId, size: selectedSize, color: selectedColor, qty: qty, price: product.price, name: product.name, image: (product.images && product.images[0]) || '' });
    }
    this.saveState();
    this.updateCartCount();
    this.showToast('Added to Bag', product.name + ' has been added.', 'success');
  },

  _findVariantId(product, size, color) {
    if (!product.variants) return null;
    const v = product.variants.find(function(v) { return v.size === size && v.color === color; });
    return v ? v.id : (product.variants[0] ? product.variants[0].id : null);
  },

  async syncCartFromAPI() {
    if (!this.user) return;
    try {
      const items = await API.cart.get();
      this.cart = items.map(function(item) {
        return {
          _apiId: item.id,
          id: (item.variant && item.variant.product && item.variant.product.id) || item.variantId,
          variantId: item.variantId,
          size: (item.variant && item.variant.size) || '',
          color: (item.variant && item.variant.color) || '',
          qty: item.qty,
          price: (item.variant && item.variant.product && item.variant.product.price) || 0,
          name: (item.variant && item.variant.product && item.variant.product.name) || '',
          image: (item.variant && item.variant.product && item.variant.product.images && item.variant.product.images[0] && item.variant.product.images[0].url) || ''
        };
      });
      this.saveState();
      this.updateCartCount();
    } catch (err) {
      if (err.status !== 401) console.warn('Cart sync failed', err);
    }
  },

  removeFromCart(index) {
    const item = this.cart[index];
    if (item && item._apiId && this.user) {
      API.cart.remove(item._apiId).catch(function(e) { console.warn('API cart remove failed', e); });
    }
    this.cart.splice(index, 1);
    this.saveState();
    this.updateCartCount();
  },

  updateCartQty(index, qty) {
    if (qty < 1) return this.removeFromCart(index);
    const item = this.cart[index];
    if (item && item._apiId && this.user) {
      API.cart.update(item._apiId, qty).catch(function(e) { console.warn('API cart update failed', e); });
    }
    this.cart[index].qty = qty;
    this.saveState();
  },

  getCartTotal() { return this.cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0); },
  getCartCount() { return this.cart.reduce(function(sum, item) { return sum + item.qty; }, 0); },

  updateCartCount() {
    document.querySelectorAll('.cart-count').forEach(function(el) {
      const c = App.getCartCount();
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    });
  },

  // ============ WISHLIST ============
  async toggleWishlist(productId) {
    const isWishlisted = this.wishlist.includes(productId);

    if (this.user) {
      try {
        if (isWishlisted) {
          await API.wishlist.remove(productId);
        } else {
          await API.wishlist.add(productId);
        }
        await this.syncWishlistFromAPI();
        this.showToast(isWishlisted ? 'Removed' : 'Saved', isWishlisted ? 'Removed from wishlist' : 'Added to your wishlist ✦', 'info');
        this.updateWishlistUI();
        return;
      } catch (err) {
        console.warn('API wishlist toggle failed, using localStorage', err);
      }
    }

    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      this.showToast('Removed', 'Removed from wishlist', 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast('Saved', 'Added to your wishlist ✦', 'success');
    }
    this.saveState();
    this.updateWishlistUI();
  },

  async syncWishlistFromAPI() {
    if (!this.user) return;
    try {
      const items = await API.wishlist.get();
      this.wishlist = items.map(function(item) { return item.productId; });
      this.saveState();
    } catch (err) {
      if (err.status !== 401) console.warn('Wishlist sync failed', err);
    }
  },

  isWishlisted(productId) { return this.wishlist.includes(productId); },

  updateWishlistUI() {
    document.querySelectorAll('[data-wishlist]').forEach(function(btn) {
      const id = btn.dataset.wishlist;
      const w = App.isWishlisted(id);
      btn.classList.toggle('wishlisted', w);
      btn.innerHTML = w ? '❤️' : '🤍';
    });
  },

  // ============ RECENTLY VIEWED ============
  addRecentlyViewed(productId) {
    this.recentlyViewed = this.recentlyViewed.filter(function(id) { return id !== productId; });
    this.recentlyViewed.unshift(productId);
    if (this.recentlyViewed.length > 10) this.recentlyViewed.pop();
    this.saveState();
  },

  // ============ ORDERS (localStorage fallback) ============
  placeOrder(orderData) {
    const order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      items: [].concat(this.cart),
      total: this.getCartTotal(),
      status: 'confirmed',
      date: new Date().toISOString(),
      tracking: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    Object.assign(order, orderData);
    this.orders.unshift(order);
    this.cart = [];
    this.saveState();
    this.updateCartCount();
    return order;
  },

  // ============ TOAST NOTIFICATIONS ============
  showToast(title, message, type) {
    type = type || 'info';
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var icons = { success: '✦', error: '✕', info: '◈', warning: '⚠' };
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || '◈') + '</span><div class="toast-content"><div class="toast-title">' + this._esc(String(title)) + '</div><div class="toast-message">' + this._esc(String(message)) + '</div></div><button class="toast-close" onclick="this.parentElement.remove()">✕</button>';
    container.appendChild(toast);
    setTimeout(function() { if (toast.parentElement) toast.remove(); }, 4000);
  },

  // ============ XSS ESCAPE ============
  _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  // ============ PRODUCT CARD RENDERER (Luxury Edition) ============
  renderProductCard(product) {
    var wishlisted = this.isWishlisted(product.id);
    var tags = product.tags || [];
    var badge = tags.includes('new')
      ? '<span class="product-card-badge">New</span>'
      : tags.includes('bestseller')
        ? '<span class="product-card-badge" style="background:var(--gold)">Bestseller</span>'
        : '';
    var imgSrc = (product.images && product.images[0]) || '';
    var originalPrice = product.originalPrice || product.original || 0;

    return '<div class="product-card reveal-pretty" onclick="location.href=\'product.html?id=' + product.id + '\'">' + badge + '<button class="product-card-wishlist ' + (wishlisted ? 'wishlisted' : '') + '" data-wishlist="' + product.id + '" onclick="event.stopPropagation();App.toggleWishlist(\'' + product.id + '\')">' + (wishlisted ? '❤️' : '🤍') + '</button><div class="product-card-img"><img src="' + this._esc(imgSrc) + '" alt="' + this._esc(product.name) + '" loading="lazy"></div><div class="product-card-info"><div class="product-card-category">' + this._esc(product.subcategory || '') + '</div><h3 class="product-card-name">' + this._esc(product.name) + '</h3><div class="product-card-price">₹' + (product.price || 0).toLocaleString() + '<span class="original">₹' + originalPrice.toLocaleString() + '</span></div></div></div>';
  },

  renderStars(rating) {
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<span style="color:' + (i <= Math.floor(rating) ? 'var(--gold)' : 'var(--silk)') + ';font-size:.8rem">★</span>';
    }
    return s;
  },

  getLiveViewers() { return Math.floor(Math.random() * 20) + 5; }
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', function() { App.init(); });
