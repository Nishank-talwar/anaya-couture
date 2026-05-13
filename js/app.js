// ============================================
// ANAYA COUTURE — Core App Logic (Luxury Edition)
// ============================================

const App = {
  cart: [],
  wishlist: [],
  user: null,
  orders: [],
  recentlyViewed: [],
  catalog: [],

  async init() {
    this.loadLocalState();
    this.initScrollEffects();
    this.initRevealAnimations();
    this.initMobileNav();
    this.initSearch();

    await this.loadCatalog();
    await this.syncSession();

    this.updateCartCount();
    this.updateWishlistUI();
    console.log('✦ Anaya Couture — Heritage Luxe initialized');
  },

  // ============ STATE MANAGEMENT ============
  loadLocalState() {
    try {
      this.cart = JSON.parse(localStorage.getItem('ac_cart')) || [];
      this.wishlist = JSON.parse(localStorage.getItem('ac_wishlist')) || [];
      this.user = JSON.parse(localStorage.getItem('ac_user')) || null;
      this.orders = JSON.parse(localStorage.getItem('ac_orders')) || [];
      this.recentlyViewed = JSON.parse(localStorage.getItem('ac_recent')) || [];
    } catch (e) {
      console.warn('State load error', e);
    }
  },

  saveLocalState() {
    localStorage.setItem('ac_cart', JSON.stringify(this.cart));
    localStorage.setItem('ac_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('ac_user', JSON.stringify(this.user));
    localStorage.setItem('ac_orders', JSON.stringify(this.orders));
    localStorage.setItem('ac_recent', JSON.stringify(this.recentlyViewed));
  },

  async syncSession() {
    if (!window.Api) return;

    try {
      const me = await Api.auth.me();
      this.user = me;
      await Promise.all([this.loadCartFromApi(), this.loadWishlistFromApi(), this.loadOrdersFromApi()]);
      this.saveLocalState();
    } catch (error) {
      this.user = null;
    }
  },

  async loadCatalog() {
    if (window.Api?.products?.list) {
      try {
        const products = await Api.products.list();
        if (Array.isArray(products) && products.length) {
          this.catalog = products.map(this.normalizeProductFromApi);
          window.PRODUCTS = this.catalog;
          return;
        }
      } catch (e) {
        console.warn('Product API unavailable, using local catalog');
      }
    }

    this.catalog = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  },

  normalizeProductFromApi(product) {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      originalPrice: product.original,
      discount: product.original > product.price ? Math.round(((product.original - product.price) / product.original) * 100) : 0,
      colors: [...new Set((product.variants || []).map((v) => v.color).filter(Boolean))].map((name) => ({ name, hex: '#B8860B' })),
      sizes: [...new Set((product.variants || []).map((v) => v.size).filter(Boolean))],
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
      sold: 0,
      stock: (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0),
      images: (product.images || []).map((img) => img.url),
      tags: product.tags || [],
      occasion: product.subcategory || product.category,
      fabric: product.subcategory,
      description: product.description
    };
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
            prog.style.width = `${(y / h) * 100}%`;
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
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed', 'staggered');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => obs.observe(el));
  },

  // ============ MOBILE NAV ============
  initMobileNav() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.mobile-nav');
    const close = document.querySelector('.mobile-nav-close');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.add('active'));
    if (close) close.addEventListener('click', () => nav.classList.remove('active'));
    nav.querySelectorAll('.nav-link').forEach((l) => l.addEventListener('click', () => nav.classList.remove('active')));
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
    if (!results || !this.catalog.length) return;
    if (query.length < 2) {
      results.innerHTML = '<p style="padding:20px;text-align:center;color:var(--mist)">Type to search...</p>';
      return;
    }
    const q = query.toLowerCase();
    const found = this.catalog.filter((p) =>
      p.name.toLowerCase().includes(q)
      || String(p.category).includes(q)
      || String(p.subcategory).toLowerCase().includes(q)
      || String(p.occasion || '').toLowerCase().includes(q)
    ).slice(0, 6);
    if (!found.length) {
      results.innerHTML = '<p style="padding:20px;text-align:center;color:var(--mist)">No products found</p>';
      return;
    }
    results.innerHTML = found.map((p) => `
      <a href="product.html?id=${p.id}" style="display:flex;gap:16px;padding:16px;border-bottom:1px solid rgba(185,134,11,.08);text-decoration:none;transition:background .2s">
        <div style="width:60px;height:80px;flex-shrink:0;overflow:hidden"><img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"></div>
        <div>
          <h4 style="font-family:var(--font-display);font-size:.9rem;color:var(--onyx);margin-bottom:2px">${p.name}</h4>
          <p style="font-size:.75rem;color:var(--gold-soft);font-family:var(--font-accent);font-style:italic">${p.subcategory}</p>
          <span style="font-weight:700;font-size:.85rem;color:var(--onyx)">₹${Number(p.price).toLocaleString()}</span>
        </div>
      </a>
    `).join('');
  },

  // ============ AUTH ============
  async login(email, password) {
    const user = await Api.auth.login({ email, password });
    this.user = user;
    await Promise.all([this.loadCartFromApi(), this.loadWishlistFromApi(), this.loadOrdersFromApi()]);
    this.updateCartCount();
    this.updateWishlistUI();
    this.saveLocalState();
    this.showToast('Welcome', `Hello ${user.name}!`, 'success');
    return user;
  },

  async register(name, email, password) {
    const user = await Api.auth.register({ name, email, password });
    this.user = user;
    await Promise.all([this.loadCartFromApi(), this.loadWishlistFromApi(), this.loadOrdersFromApi()]);
    this.updateCartCount();
    this.updateWishlistUI();
    this.saveLocalState();
    this.showToast('Account Created', 'Your atelier account is ready.', 'success');
    return user;
  },

  async logout() {
    await Api.auth.logout();
    this.user = null;
    this.cart = [];
    this.wishlist = [];
    this.orders = [];
    this.saveLocalState();
    this.updateCartCount();
    this.updateWishlistUI();
    this.showToast('Signed Out', 'See you soon.', 'info');
  },

  // ============ CART ============
  mapCartItemFromApi(item) {
    return {
      cartItemId: item.id,
      variantId: item.variantId,
      id: item.variant?.product?.id,
      size: item.variant?.size,
      color: item.variant?.color,
      qty: item.qty,
      price: item.variant?.product?.price || 0,
      name: item.variant?.product?.name || 'Product',
      image: item.variant?.product?.images?.[0]?.url || ''
    };
  },

  async loadCartFromApi() {
    if (!this.user) return;
    const items = await Api.cart.list();
    this.cart = Array.isArray(items) ? items.map((item) => this.mapCartItemFromApi(item)) : [];
  },

  async addToCart(productId, size, color, qty = 1) {
    const product = this.catalog.find((p) => p.id === productId);
    if (!product) return;

    if (this.user) {
      try {
        await Api.cart.add({
          productId,
          size: size || product.sizes?.[0],
          color: color || product.colors?.[0]?.name,
          qty
        });
        await this.loadCartFromApi();
      } catch (error) {
        return;
      }
    } else {
      const existing = this.cart.find((i) => i.id === productId && i.size === size && i.color === color);
      if (existing) {
        existing.qty += qty;
      } else {
        this.cart.push({
          id: productId,
          size: size || product.sizes?.[0],
          color: color || product.colors?.[0]?.name,
          qty,
          price: product.price,
          name: product.name,
          image: product.images?.[0]
        });
      }
      this.saveLocalState();
    }

    this.updateCartCount();
    this.showToast('Added to Bag', `${product.name} has been added.`, 'success');
  },

  async removeFromCart(index) {
    const item = this.cart[index];
    if (!item) return;

    if (this.user && item.cartItemId) {
      try {
        await Api.cart.remove(item.cartItemId);
        await this.loadCartFromApi();
      } catch (error) {
        return;
      }
    } else {
      this.cart.splice(index, 1);
      this.saveLocalState();
    }

    this.updateCartCount();
  },

  async updateCartQty(index, qty) {
    if (qty < 1) {
      await this.removeFromCart(index);
      return;
    }

    const item = this.cart[index];
    if (!item) return;

    if (this.user && item.cartItemId) {
      try {
        await Api.cart.update(item.cartItemId, qty);
        await this.loadCartFromApi();
      } catch (error) {
        return;
      }
    } else {
      this.cart[index].qty = qty;
      this.saveLocalState();
    }
  },

  getCartTotal() { return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0); },
  getCartCount() { return this.cart.reduce((sum, item) => sum + item.qty, 0); },

  updateCartCount() {
    document.querySelectorAll('.cart-count').forEach((el) => {
      const c = this.getCartCount();
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    });
  },

  // ============ WISHLIST ============
  async loadWishlistFromApi() {
    if (!this.user) return;
    const items = await Api.wishlist.list();
    this.wishlist = Array.isArray(items) ? items.map((item) => item.productId) : [];
  },

  async toggleWishlist(productId) {
    if (this.user) {
      try {
        const isSaved = this.wishlist.includes(productId);
        if (isSaved) {
          await Api.wishlist.remove(productId);
        } else {
          await Api.wishlist.add(productId);
        }
        await this.loadWishlistFromApi();
        this.showToast(isSaved ? 'Removed' : 'Saved', isSaved ? 'Removed from wishlist' : 'Added to your wishlist ✦', isSaved ? 'info' : 'success');
        this.updateWishlistUI();
      } catch (error) {
        // API client already reports toast
      }
      return;
    }

    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      this.showToast('Removed', 'Removed from wishlist', 'info');
    } else {
      this.wishlist.push(productId);
      this.showToast('Saved', 'Added to your wishlist ✦', 'success');
    }
    this.saveLocalState();
    this.updateWishlistUI();
  },

  isWishlisted(productId) { return this.wishlist.includes(productId); },

  updateWishlistUI() {
    document.querySelectorAll('[data-wishlist]').forEach((btn) => {
      const id = btn.dataset.wishlist;
      const w = this.isWishlisted(id);
      btn.classList.toggle('wishlisted', w);
      btn.innerHTML = w ? '❤️' : '🤍';
    });
  },

  // ============ ORDERS ============
  async loadOrdersFromApi() {
    if (!this.user) return;
    const orders = await Api.orders.list();
    this.orders = Array.isArray(orders) ? orders : [];
  },

  // ============ RECENTLY VIEWED ============
  addRecentlyViewed(productId) {
    this.recentlyViewed = this.recentlyViewed.filter((id) => id !== productId);
    this.recentlyViewed.unshift(productId);
    if (this.recentlyViewed.length > 10) this.recentlyViewed.pop();
    this.saveLocalState();
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
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4000);
  },

  // ============ PRODUCT CARD RENDERER (Luxury Edition) ============
  renderProductCard(product) {
    const wishlisted = this.isWishlisted(product.id);
    const badge = product.tags?.includes('new')
      ? '<span class="product-card-badge">New</span>'
      : product.tags?.includes('bestseller')
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
          <img src="${product.images?.[0] || ''}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-card-info">
          <div class="product-card-category">${product.subcategory || product.category}</div>
          <h3 class="product-card-name">${product.name}</h3>
          <div class="product-card-price">
            ₹${Number(product.price).toLocaleString()}
            <span class="original">₹${Number(product.originalPrice || product.price).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  },

  renderStars(rating) {
    let s = '';
    for (let i = 1; i <= 5; i += 1) {
      s += `<span style="color:${i <= Math.floor(rating) ? 'var(--gold)' : 'var(--silk)'};font-size:.8rem">★</span>`;
    }
    return s;
  },

  getLiveViewers() { return Math.floor(Math.random() * 20) + 5; }
};

window.App = App;

// Init on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await App.init();
  document.dispatchEvent(new CustomEvent('app:ready'));
});
