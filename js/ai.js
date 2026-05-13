// ============================================
// ANAYA COUTURE — AI Module (StyleBot + Recommendations)
// ============================================

const AI = {
  // ============ STYLEBOT RESPONSES ============
  responses: {
    greetings: [
      "Namaste! 🙏 Welcome to Anaya Couture! I'm StyleBot, your personal AI stylist. How can I help you today?",
      "Hello, beautiful! ✨ I'm here to help you find the perfect ethnic outfit. What's the occasion?",
      "Welcome! 💫 I'm your AI fashion advisor. Tell me about the event and I'll curate the perfect look for you!"
    ],
    wedding: [
      "For a wedding, I'd recommend our stunning Bridal Velvet Lehenga or the Royal Banarasi Silk Saree! 💍 Both are bestsellers. Would you like to see the bridal collection?",
      "Wedding season! How exciting! 🎉 Are you the bride, bridesmaid, or a guest? I'll customize my suggestions accordingly.",
      "For weddings, heavy work lehengas and rich Banarasi sarees are perfect. Our Kanjivaram collection is also divine! Shall I show you options?"
    ],
    party: [
      "For parties, I suggest our Pastel Sequin Lehenga or the Palazzo Suit with Mirror Work! They're trendy and glamorous ✨",
      "Party wear? You'll love our Organza sarees and Crop Top Lehengas! They're lightweight yet stunning. What's your budget range?"
    ],
    casual: [
      "For everyday elegance, our Chikankari Lucknowi Kurtas and Chanderi Cotton Sarees are perfect! Comfortable yet classy 🌸",
      "Daily wear that still looks gorgeous? Try our Straight Cut Lawn Cotton Suits or Chanderi sarees. Budget-friendly too!"
    ],
    budget: [
      "Great question! We have beautiful options at every price point:\n• Under ₹2,000: Cotton Kurtas & Suits\n• ₹2,000-5,000: Palazzo Suits, Chanderi Sarees\n• ₹5,000-10,000: Anarkalis, Silk Lehengas\n• ₹10,000+: Bridal Lehengas, Kanjivaram Sarees",
      "Our best value picks are the Chikankari Kurta at ₹1,799 and Straight Cut Suit at ₹1,999. Amazing quality at great prices!"
    ],
    size: [
      "For sizing, I recommend measuring your bust, waist, and hips. Our general guide:\n• XS: Bust 32\", Waist 26\"\n• S: Bust 34\", Waist 28\"\n• M: Bust 36\", Waist 30\"\n• L: Bust 38\", Waist 32\"\n• XL: Bust 40\", Waist 34\"\n• XXL: Bust 42\", Waist 36\"\n\nSarees are free size! 🎀",
      "Don't worry about sizing! We offer free alterations on orders above ₹5,000. Just share your measurements and we'll customize it perfectly."
    ],
    shipping: [
      "We ship across India (3-7 days) and internationally to 50+ countries! 🌍 Free shipping on orders above ₹1,999 in India. International rates start at ₹499.",
      "Delivery times: Metro cities 3-5 days, rest of India 5-7 days, international 10-15 days. We also have express shipping options!"
    ],
    returns: [
      "We have a hassle-free 7-day return policy! 📦 Items must be unused with original tags. Refund is processed within 5-7 business days. Exchange is also available.",
      "Easy returns within 7 days! Just initiate a return from your account and our team will arrange pickup. No questions asked!"
    ],
    color: [
      "Color advice? Here's what works for different skin tones:\n• Fair: Pastels, deep reds, emerald green\n• Medium: Coral, teal, mustard, wine\n• Dusky: Royal blue, hot pink, gold, orange\n• Dark: Bright yellows, reds, turquoise\n\nBut honestly, wear what makes YOU happy! 💖"
    ],
    festive: [
      "For festivals, I love our Patiala Suit with Phulkari Work and the A-Line Silk Lehenga! They're vibrant, traditional, and perfect for celebrations 🪔✨",
      "Festival season calls for bright colors and rich fabrics! Our Silk Blend Festive Kurta Sets and Tussar Silk sarees are perfect picks!"
    ],
    default: [
      "I'd love to help! Could you tell me more about:\n• The occasion (wedding, party, casual, festive)?\n• Your budget range?\n• Any color preferences?\n• Your size?\n\nThe more you share, the better I can style you! 💫",
      "That's a great question! Let me help you. What type of outfit are you looking for — a saree, suit, lehenga, or kurta?",
      "I'm here to help! Browse our collections or tell me what you need, and I'll find the perfect piece for you! ✨"
    ],
    compliment: [
      "Thank you so much! 🥰 We put our heart into every collection. Is there anything specific I can help you with?",
      "You're too kind! 💕 We're passionate about bringing authentic Indian fashion to the world. How can I assist you today?"
    ],
    payment: [
      "We accept multiple payment methods:\n• 💵 Cash on Delivery (COD)\n• 📱 UPI (Google Pay, PhonePe, Paytm)\n• 💳 Credit/Debit Cards\n• 🏦 Net Banking\n\nAll payments are 100% secure! 🔒"
    ]
  },

  // ============ KEYWORD MATCHING ============
  getResponse(message) {
    const msg = message.toLowerCase();
    const keywords = {
      greetings: ['hi', 'hello', 'hey', 'namaste', 'hola', 'good morning', 'good evening'],
      wedding: ['wedding', 'bride', 'bridal', 'shaadi', 'dulhan', 'marriage', 'vivah'],
      party: ['party', 'cocktail', 'reception', 'sangeet', 'mehendi', 'club', 'dinner'],
      casual: ['casual', 'daily', 'everyday', 'office', 'simple', 'work', 'comfort'],
      budget: ['budget', 'price', 'cheap', 'affordable', 'cost', 'how much', 'expensive', 'money', 'range'],
      size: ['size', 'sizing', 'measurement', 'fit', 'fitting', 'measure', 'bust', 'waist'],
      shipping: ['shipping', 'delivery', 'ship', 'deliver', 'international', 'track', 'when will'],
      returns: ['return', 'refund', 'exchange', 'cancel', 'wrong'],
      color: ['color', 'colour', 'skin tone', 'shade', 'which color', 'what color'],
      festive: ['festival', 'festive', 'diwali', 'navratri', 'eid', 'puja', 'celebration', 'holi'],
      compliment: ['love', 'beautiful', 'amazing', 'great', 'awesome', 'wonderful', 'nice', 'thank'],
      payment: ['payment', 'pay', 'cod', 'upi', 'card', 'credit', 'debit', 'gpay']
    };

    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(w => msg.includes(w))) {
        const arr = this.responses[cat];
        return arr[Math.floor(Math.random() * arr.length)];
      }
    }
    const def = this.responses.default;
    return def[Math.floor(Math.random() * def.length)];
  },

  // ============ RECOMMENDATION ENGINE ============
  getRecommendations(productId, count = 4) {
    if (!window.PRODUCTS) return [];
    const current = window.PRODUCTS.find(p => p.id === productId);
    if (!current) return window.PRODUCTS.slice(0, count);

    return window.PRODUCTS
      .filter(p => p.id !== productId)
      .map(p => ({
        ...p,
        score: (p.category === current.category ? 3 : 0) +
               (p.occasion === current.occasion ? 2 : 0) +
               (Math.abs(p.price - current.price) < 3000 ? 1 : 0) +
               (p.rating >= 4.7 ? 1 : 0)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  },

  getPersonalized(count = 4) {
    if (!window.PRODUCTS) return [];
    const recent = App.recentlyViewed || [];
    if (!recent.length) return window.PRODUCTS.filter(p => p.tags.includes('bestseller') || p.tags.includes('trending')).slice(0, count);
    const cats = recent.map(id => window.PRODUCTS.find(p => p.id === id)).filter(Boolean).map(p => p.category);
    const topCat = cats.sort((a, b) => cats.filter(c => c === b).length - cats.filter(c => c === a).length)[0];
    return window.PRODUCTS.filter(p => p.category === topCat && !recent.includes(p.id)).slice(0, count);
  },

  getTrending(count = 4) {
    if (!window.PRODUCTS) return [];
    return [...window.PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, count);
  },

  // ============ STYLE QUIZ ============
  styleQuiz: {
    questions: [
      { q: "What's the occasion?", options: ['Wedding', 'Party', 'Festival', 'Casual', 'Office'] },
      { q: "Your preferred style?", options: ['Traditional', 'Modern Fusion', 'Minimalist', 'Heavy Work', 'Bohemian'] },
      { q: "Favorite colors?", options: ['Red/Maroon', 'Pastels', 'Bold/Bright', 'Earth Tones', 'Blues/Greens'] },
      { q: "Budget range?", options: ['Under ₹3,000', '₹3,000-₹7,000', '₹7,000-₹15,000', 'Above ₹15,000'] },
      { q: "Which outfit type?", options: ['Saree', 'Lehenga', 'Suit/Salwar', 'Kurta', 'Any'] }
    ],
    getResults(answers) {
      if (!window.PRODUCTS) return [];
      let filtered = [...window.PRODUCTS];
      if (answers[0]) {
        const occasionMap = { 'Wedding': 'Wedding', 'Party': 'Party', 'Festival': 'Festive', 'Casual': 'Casual', 'Office': 'Daily Wear' };
        const occ = occasionMap[answers[0]];
        if (occ) filtered = filtered.filter(p => p.occasion === occ || p.occasion === 'Festive');
      }
      if (answers[3]) {
        const budgetMap = { 'Under ₹3,000': [0, 3000], '₹3,000-₹7,000': [3000, 7000], '₹7,000-₹15,000': [7000, 15000], 'Above ₹15,000': [15000, 100000] };
        const range = budgetMap[answers[3]];
        if (range) filtered = filtered.filter(p => p.price >= range[0] && p.price <= range[1]);
      }
      if (answers[4] && answers[4] !== 'Any') {
        const catMap = { 'Saree': 'sarees', 'Lehenga': 'lehengas', 'Suit/Salwar': 'suits', 'Kurta': 'suits' };
        const cat = catMap[answers[4]];
        if (cat) filtered = filtered.filter(p => p.category === cat);
      }
      return filtered.sort((a, b) => b.rating - a.rating).slice(0, 6);
    }
  },

  // ============ CHAT MANAGER ============
  initChat() {
    const widget = document.querySelector('.chat-widget');
    const toggle = document.querySelector('.chat-toggle');
    const input = document.querySelector('.chat-input');
    const send = document.querySelector('.chat-send');
    const messages = document.querySelector('.chat-messages');
    if (!widget || !toggle) return;

    toggle.addEventListener('click', () => {
      widget.classList.toggle('open');
      if (widget.classList.contains('open') && messages && messages.children.length === 0) {
        this.addBotMessage(messages, this.responses.greetings[0]);
        setTimeout(() => this.addBotMessage(messages, "You can ask me about:\n• Outfit recommendations 👗\n• Size & styling help 📏\n• Shipping & returns 📦\n• Payment options 💳\n\nOr take the Style Quiz! ✨"), 1000);
      }
    });

    const sendMsg = () => {
      if (!input || !input.value.trim()) return;
      const msg = input.value.trim();
      this.addUserMessage(messages, msg);
      input.value = '';
      this.showTyping(messages);
      setTimeout(() => {
        this.removeTyping(messages);
        const response = this.getResponse(msg);
        this.addBotMessage(messages, response);
      }, 800 + Math.random() * 700);
    };

    if (send) send.addEventListener('click', sendMsg);
    if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
  },

  addBotMessage(container, text) {
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  addUserMessage(container, text) {
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  showTyping(container) {
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg bot typing-indicator';
    div.innerHTML = '<div class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  removeTyping(container) {
    if (!container) return;
    const t = container.querySelector('.typing-indicator');
    if (t) t.remove();
  }
};

// Init chat on DOM ready
document.addEventListener('DOMContentLoaded', () => AI.initChat());
