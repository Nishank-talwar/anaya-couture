// ============================================
// ANAYA COUTURE — Analytics & Dashboard
// ============================================

const Analytics = {
  getData() {
    const orders = App.orders || [];
    const totalRevenue = orders.reduce((s, o) => s + (o.grandTotal || o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders ? Math.floor(totalRevenue / totalOrders) : 0;
    const topProducts = this.getTopProducts(orders);
    return {
      totalRevenue, totalOrders, avgOrder,
      totalCustomers: Math.max(1, totalOrders),
      conversionRate: (3.2 + Math.random() * 2).toFixed(1),
      returningRate: (28 + Math.random() * 15).toFixed(0),
      topProducts,
      monthlySales: this.getMonthlySales(),
      categorySplit: this.getCategorySplit(),
      recentOrders: orders.slice(0, 10),
      loyaltyPoints: App.user ? App.user.loyaltyPoints || 500 : 0,
      visitors: Math.floor(Math.random() * 500) + 200,
      bounceRate: (35 + Math.random() * 15).toFixed(1),
      avgSessionTime: '4m 32s'
    };
  },

  getTopProducts(orders) {
    const counts = {};
    orders.forEach(o => (o.items || []).forEach(i => { counts[i.id] = (counts[i.id] || 0) + i.qty; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, qty]) => {
      const p = (window.PRODUCTS || []).find(pr => pr.id === id);
      return { id, qty, name: p ? p.name : id, revenue: p ? p.price * qty : 0 };
    });
  },

  getMonthlySales() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({ month: m, sales: Math.floor(Math.random() * 80000) + 20000 }));
  },

  getCategorySplit() {
    return [
      { name: 'Sarees', percent: 35, color: '#8B1A4A' },
      { name: 'Suits', percent: 28, color: '#D4AF37' },
      { name: 'Lehengas', percent: 25, color: '#B76E79' },
      { name: 'Kurtas', percent: 12, color: '#4A0E2A' }
    ];
  },

  getGrowthTips() {
    return [
      { icon: '📱', title: 'Launch Mobile App', desc: 'Convert 40% more mobile visitors with a dedicated app.' },
      { icon: '📸', title: 'Instagram Reels', desc: 'Post 3-4 styling reels per week for 5x organic reach.' },
      { icon: '🤝', title: 'Influencer Collabs', desc: 'Partner with 10 micro-influencers for authentic reach.' },
      { icon: '🎯', title: 'Retargeting Ads', desc: 'Set up Facebook & Google retargeting for cart abandoners.' },
      { icon: '💌', title: 'Email Marketing', desc: 'Send weekly curated looks to boost repeat purchases by 30%.' },
      { icon: '🌍', title: 'NRI Market Focus', desc: 'Target Indian diaspora in US, UK, Canada for higher AOV.' },
      { icon: '🏪', title: 'Pop-up Stores', desc: 'Launch seasonal pop-ups in metros for brand awareness.' },
      { icon: '📦', title: 'Subscription Box', desc: 'Monthly ethnic fashion box for recurring revenue.' }
    ];
  },

  renderChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight || 200;
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data.map(d => d.sales));
    const barW = (w - 60) / data.length;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#D4AF37');
    gradient.addColorStop(1, '#8B1A4A');

    data.forEach((d, i) => {
      const barH = (d.sales / max) * (h - 40);
      const x = 30 + i * barW + barW * 0.15;
      const bw = barW * 0.7;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, h - 20 - barH, bw, barH, [4, 4, 0, 0]);
      ctx.fill();
      ctx.fillStyle = '#8A7A6A';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.month, x + bw / 2, h - 4);
    });
  }
};

if (typeof window !== 'undefined') window.Analytics = Analytics;
