// ============================================
// ANAYA COUTURE — Checkout & Payment
// ============================================

const Checkout = {
  currentStep: 1,
  address: {},
  paymentMethod: 'COD',
  promoCode: '',
  promoDiscount: 0,

  promoCodes: {
    WELCOME10: { discount: 10, type: 'percent', min: 1500, desc: '10% off on first order' },
    ANAYA20: { discount: 20, type: 'percent', min: 3000, desc: '20% off above ₹3000' },
    FLAT500: { discount: 500, type: 'flat', min: 4000, desc: '₹500 off above ₹4000' },
    FREESHIP: { discount: 0, type: 'shipping', min: 0, desc: 'Free shipping on all orders' },
    WEDDING15: { discount: 15, type: 'percent', min: 8000, desc: '15% off wedding collection' }
  },

  applyPromo(code) {
    const promo = this.promoCodes[code.toUpperCase()];
    if (!promo) {
      App.showToast('Invalid Code', 'This promo code is not valid', 'error');
      return false;
    }
    const total = App.getCartTotal();
    if (total < promo.min) {
      App.showToast('Minimum Not Met', `Minimum order ₹${promo.min.toLocaleString()} required`, 'warning');
      return false;
    }
    if (promo.type === 'percent') this.promoDiscount = Math.floor((total * promo.discount) / 100);
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

  getTax() {
    return Math.floor((App.getCartTotal() - this.promoDiscount) * 0.05);
  },

  getGrandTotal() {
    return App.getCartTotal() - this.promoDiscount + this.getShipping() + this.getTax();
  },

  buildOrderPayload(paymentMethod) {
    return {
      items: App.cart.map((item) => ({
        variantId: item.variantId,
        productId: item.id,
        size: item.size,
        color: item.color,
        qty: item.qty,
        price: item.price
      })),
      subtotal: App.getCartTotal(),
      tax: this.getTax(),
      shipping: this.getShipping(),
      discount: this.promoDiscount,
      total: this.getGrandTotal(),
      paymentMethod,
      shippingAddress: {
        name: this.address.name,
        phone: this.address.phone,
        line1: this.address.line,
        city: this.address.city,
        state: this.address.state,
        country: this.address.country || 'India',
        postal: this.address.pin
      }
    };
  },

  async createOrder(paymentMethod) {
    const payload = this.buildOrderPayload(paymentMethod);
    return Api.orders.create(payload);
  },

  async ensureRazorpayScript() {
    if (window.Razorpay) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  },

  async placeCodOrder() {
    return this.createOrder('COD');
  },

  async placeRazorpayOrder() {
    const order = await this.createOrder('RAZORPAY');
    const rp = await Api.payments.createRazorpayOrder({ orderId: order.id });
    await this.ensureRazorpayScript();

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: rp.keyId,
        amount: rp.amount,
        currency: rp.currency || 'INR',
        order_id: rp.orderId,
        name: 'Anaya Couture',
        description: `Order ${order.id}`,
        handler: async (response) => {
          try {
            await Api.payments.verifyRazorpay({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            resolve(order);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled'))
        }
      });
      razorpay.open();
    });
  }
};

if (typeof window !== 'undefined') window.Checkout = Checkout;
