// ============================================
// ANAYA COUTURE — Checkout & Payment
// ============================================

const Checkout = {
  currentStep: 1,
  address: {},
  paymentMethod: 'cod',
  promoCode: '',
  promoDiscount: 0,

  promoCodes: {
    'WELCOME10': { discount: 10, type: 'percent', min: 1500, desc: '10% off on first order' },
    'ANAYA20': { discount: 20, type: 'percent', min: 3000, desc: '20% off above ₹3000' },
    'FLAT500': { discount: 500, type: 'flat', min: 4000, desc: '₹500 off above ₹4000' },
    'FREESHIP': { discount: 0, type: 'shipping', min: 0, desc: 'Free shipping on all orders' },
    'WEDDING15': { discount: 15, type: 'percent', min: 8000, desc: '15% off wedding collection' }
  },

  applyPromo(code) {
    const promo = this.promoCodes[code.toUpperCase()];
    if (!promo) { App.showToast('Invalid Code', 'This promo code is not valid', 'error'); return false; }
    const total = App.getCartTotal();
    if (total < promo.min) { App.showToast('Minimum Not Met', `Minimum order ₹${promo.min.toLocaleString()} required`, 'warning'); return false; }
    if (promo.type === 'percent') this.promoDiscount = Math.floor(total * promo.discount / 100);
    else if (promo.type === 'flat') this.promoDiscount = promo.discount;
    else this.promoDiscount = 0;
    this.promoCode = code.toUpperCase();
    App.showToast('Promo Applied! 🎉', promo.desc, 'success');
    return true;
  },

  getShipping() {
    const total = App.getCartTotal() - this.promoDiscount;
    if (this.promoCode === 'FREESHIP' || total >= 1999) return 0;
    return 99;
  },

  getTax() { return Math.floor((App.getCartTotal() - this.promoDiscount) * 0.05); },

  getGrandTotal() {
    return App.getCartTotal() - this.promoDiscount + this.getShipping() + this.getTax();
  },

  processOrder() {
    const order = App.placeOrder({
      address: this.address,
      payment: this.paymentMethod,
      shipping: this.getShipping(),
      tax: this.getTax(),
      discount: this.promoDiscount,
      promo: this.promoCode,
      grandTotal: this.getGrandTotal()
    });
    this.promoCode = '';
    this.promoDiscount = 0;
    this.currentStep = 1;
    return order;
  },

  // UPI payment simulation
  simulateUPI() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, txnId: 'UPI' + Date.now().toString(36).toUpperCase() }), 2000);
    });
  },

  // Card payment simulation
  simulateCard() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, txnId: 'CARD' + Date.now().toString(36).toUpperCase() }), 2500);
    });
  }
};

if (typeof window !== 'undefined') window.Checkout = Checkout;
