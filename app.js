// ============================================
// ANAYA COUTURE — Core App Logic (Luxury Edition)
// ============================================

const App = {
  cart: [],
  wishlist: [],
  user: null,
  orders: [],
  recentlyViewed: [],

  init() {
    this.loadState();
    this.initScrollEffects();
    this.initRevealAnimations();
    this.updateCartCount();
    this.initMobileNav();
    this.initSearch();
    console.log('✦ Anaya Couture — Heritage Luxe initialized');
  },

  // ============ STATE MANAGEMENT ============
  loadState() {
    try {
      this.cart = JSON.parse(localStorage.getItem('ac_cart')) || [];
      this.wishlist = JSON.parse(localStorage.getItem('ac_wishlist')) || [];
      this.user = JSON.parse(localStorage.getItem('ac_user')) || null;
      this.orders = JSON.parse(localStorage.getItem('ac_orders')) || [];
      this.recentlyViewed = JSON.parse(localStorage.getItem('ac_recent')) || [];
    } catch(e) { console.warn('State load error', e); }
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
      p.name.toLowerCase().includes(q) || p.category.includes(q) || p.subcategory.toLowerCase().includes(q) || p.occasion.toLowerCase().includes(q)
    ).slice(0, 6);
    if (!found.length) { results.innerHTML = '<p style="padding:20px;text-align:center;color:var(--mist)">No products found</p>'; return; }
    results.innerHTML = found.map(p => `
      <a href="product.html?id=${p.id}" style="display:flex;gap:16px;padding:16px;border-bottom:1px solid rgba(185,134,11,.08);text-decoration:none;transition:background .2s">
        <div style="width:60px;height:80px;flex-shrink:0;overflow:hidden"><img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"></div>
        <div>
          <h4 style="font-family:var(--font-display);font-size:.9rem;color:var(--onyx);margin-bottom:2px">${p.name}</h4>
          <p style="font-size:.75rem;color:var(--gold-soft);font-family:var(--font-accent);font-style:italic">${p.subcategory}</p>
          <span style="font-weight:700;font-size:.85rem;color:var(--onyx)">₹${p.price.toLocaleString()}</span>
        </div>
      </a>
    `).join('');
  },

  // ============ CART ============
  addToCart(productId, size, color, qty = 1) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = this.cart.find(i => i.id === productId && i.size === size && i.color === color);
    if (existing) {
      existing.qty += qty;
    } else {
      this.cart.push({ id: productId, size: size || product.sizes[0], color: color || product.colors[0].name, qty, price: product.price, name: product.name, image: product.images[0] });
    }
    this.saveState();
    this.updateCartCount();
    this.showToast('Added to Bag', `${product.name} has been added.`, 'success');
  },

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.saveState();
    this.updateCartCount();
  },

  updateCartQty(index, qty) {
    if (qty < 1) return this.removeFromCart(index);
    this.cart[index].qty = qty;
    this.saveState();
  },

  getCartTotal() { return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0); },
  getCartCount() { return this.cart.reduce((sum, item) => sum + item.qty, 0); },

  updateCartCount() {
    document.querySelectorAll('.cart-count').forEach(el => {
      const c = this.getCartCount();
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    });
  },

  // ============ WISHLIST ============
  toggleWishlist(productId) {
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

  isWishlisted(productId) { return this.wishlist.includes(productId); },

  updateWishlistUI() {
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
      const id = btn.dataset.wishlist;
      const w = this.isWishlisted(id);
      btn.classList.toggle('wishlisted', w);
      btn.innerHTML = w ? '❤️' : '🤍';
    });
  },

  // ============ RECENTLY VIEWED ============
  addRecentlyViewed(productId) {
    this.recentlyViewed = this.recentlyViewed.filter(id => id !== productId);
    this.recentlyViewed.unshift(productId);
    if (this.recentlyViewed.length > 10) this.recentlyViewed.pop();
    this.saveState();
  },

  // ============ ORDERS ============
  placeOrder(orderData) {
    const order = {
      id: 'ORD' + Date.now().toString(36).toUpperCase(),
      items: [...this.cart],
      total: this.getCartTotal(),
      ...orderData,
      status: 'confirmed',
      date: new Date().toISOString(),
      tracking: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    this.orders.unshift(order);
    this.cart = [];
    this.saveState();
    this.updateCartCount();
    return order;
  },

  // ============ AUTH ============
  login(name, email, phone) {
    this.user = { name, email, phone, joined: new Date().toISOString(), loyaltyPoints: 500 };
    this.saveState();
    this.showToast('Welcome', `Hello ${name}! You earned 500 welcome points.`, 'success');
    return this.user;
  },

  logout() {
    this.user = null;
    this.saveState();
    this.showToast('Signed Out', 'See you soon.', 'info');
  },

  // ============ TOAST NOTIFICATIONS ============
  showToast(title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✦', error: '✕', info: '◈', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '◈'}</span>
      <div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
  },

  // ============ PRODUCT CARD RENDERER (Luxury Edition) ============
  renderProductCard(product) {
    const wishlisted = this.isWishlisted(product.id);
    const badge = product.tags.includes('new')
      ? '<span class="product-card-badge">New</span>'
      : product.tags.includes('bestseller')
        ? '<span class="product-card-badge" style="background:var(--gold)">Bestseller</span>'
        : '';

    return `
      <div class="product-card reveal-pretty" onclick="location.href='product.html?id=${product.id}'">
        ${badge}
        <button class="product-card-wishlist ${wishlisted ? 'wishlisted' : ''}"
                data-wishlist="${product.id}"
                onclick="event.stopPropagation();App.toggleWishlist('${product.id}')">
          ${wishlisted ? '❤️' : '🤍'}
        </button>
        <div class="product-card-img">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-card-info">
          <div class="product-card-category">${product.subcategory}</div>
          <h3 class="product-card-name">${product.name}</h3>
          <div class="product-card-price">
            ₹${product.price.toLocaleString()}
            <span class="original">₹${product.originalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderStars(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += `<span style="color:${i <= Math.floor(rating) ? 'var(--gold)' : 'var(--silk)'};font-size:.8rem">★</span>`;
    }
    return s;
  },

  getLiveViewers() { return Math.floor(Math.random() * 20) + 5; }
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
