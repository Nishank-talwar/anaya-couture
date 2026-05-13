// ============================================
// ANAYA COUTURE — Product Catalog
// Premium Ethnic Wear Collection
// ============================================

const PRODUCTS = [
  // ============ SAREES ============
  {
    id: 'SAR001', name: 'Royal Banarasi Silk Saree', category: 'sarees', subcategory: 'Banarasi',
    price: 8999, originalPrice: 12999, discount: 31,
    colors: [{ name: 'Maroon', hex: '#800020' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Emerald', hex: '#2D6A4F' }],
    sizes: ['Free Size'], rating: 4.8, reviews: 234, sold: 1420, stock: 18,
    images: ['images/sarees.png'],
    tags: ['bestseller', 'wedding'], occasion: 'Wedding',
    fabric: 'Pure Silk', weight: '800g', blouseIncluded: true, blouseLength: '0.8m', sareeLength: '5.5m',
    description: 'A masterpiece of grace and glamour. This royal Banarasi silk saree features intricate gold zari weaving that shimmers with every step. Perfect for making a grand entrance at weddings.'
  },
  {
    id: 'SAR002', name: 'Kanjivaram Temple Border Saree', category: 'sarees', subcategory: 'Kanjivaram',
    price: 15999, originalPrice: 22999, discount: 30,
    colors: [{ name: 'Red', hex: '#C41E3A' }, { name: 'Gold', hex: '#D4AF37' }],
    sizes: ['Free Size'], rating: 4.9, reviews: 187, sold: 890, stock: 8,
    images: ['images/saree-royal.png'],
    tags: ['new', 'premium'], occasion: 'Wedding',
    fabric: 'Pure Silk', weight: '900g', blouseIncluded: true, blouseLength: '0.8m', sareeLength: '5.5m',
    description: 'Magnificent Kanjivaram silk saree with temple border design. Rich pallu with peacock motifs.'
  },
  {
    id: 'SAR003', name: 'Chanderi Cotton Silk Saree', category: 'sarees', subcategory: 'Chanderi',
    price: 3499, originalPrice: 5499, discount: 36,
    colors: [{ name: 'Peach', hex: '#FFDAB9' }, { name: 'Mint', hex: '#98D8C8' }, { name: 'Lilac', hex: '#C8A2C8' }],
    sizes: ['Free Size'], rating: 4.6, reviews: 312, sold: 2100, stock: 45,
    images: ['images/sarees.png'],
    tags: ['trending'], occasion: 'Casual',
    fabric: 'Cotton Silk', weight: '500g', blouseIncluded: true, blouseLength: '0.8m', sareeLength: '5.5m',
    description: 'Lightweight Chanderi cotton silk saree perfect for daily wear. Elegant butis with contrasting border.'
  },
  {
    id: 'SAR004', name: 'Organza Floral Digital Print Saree', category: 'sarees', subcategory: 'Organza',
    price: 2999, originalPrice: 4999, discount: 40,
    colors: [{ name: 'Baby Pink', hex: '#F4C2C2' }, { name: 'Sky Blue', hex: '#87CEEB' }],
    sizes: ['Free Size'], rating: 4.5, reviews: 458, sold: 3200, stock: 62,
    images: ['images/saree-royal.png'],
    tags: ['sale', 'trending'], occasion: 'Party',
    fabric: 'Organza', weight: '400g', blouseIncluded: true, blouseLength: '0.8m', sareeLength: '5.5m',
    description: 'Stunning organza saree with digital floral prints. Lightweight and elegant for parties.'
  },
  {
    id: 'SAR005', name: 'Tussar Silk Hand-Painted Saree', category: 'sarees', subcategory: 'Tussar',
    price: 6999, originalPrice: 9999, discount: 30,
    colors: [{ name: 'Cream', hex: '#FFFDD0' }, { name: 'Beige', hex: '#F5F5DC' }],
    sizes: ['Free Size'], rating: 4.7, reviews: 156, sold: 620, stock: 12,
    images: ['images/sarees.png'],
    tags: ['handcrafted'], occasion: 'Festive',
    fabric: 'Tussar Silk', weight: '600g', blouseIncluded: true, blouseLength: '0.8m', sareeLength: '5.5m',
    description: 'Hand-painted Tussar silk saree featuring traditional folk art. Each piece is unique.'
  },

  // ============ SUITS / SALWAR KAMEEZ ============
  {
    id: 'SUT001', name: 'Anarkali Embroidered Suit Set', category: 'suits', subcategory: 'Anarkali',
    price: 5499, originalPrice: 8999, discount: 39,
    colors: [{ name: 'Wine', hex: '#722F37' }, { name: 'Teal', hex: '#008080' }, { name: 'Mustard', hex: '#FFDB58' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], rating: 4.7, reviews: 389, sold: 2800, stock: 35,
    images: ['images/hero-bridal.png'],
    tags: ['bestseller'], occasion: 'Festive',
    fabric: 'Georgette', weight: '700g',
    description: 'Flowy, feminine, and absolutely stunning. This floor-length Anarkali set features delicate thread and sequin embroidery that catches the light beautifully.'
  },
  {
    id: 'SUT002', name: 'Palazzo Suit with Mirror Work', category: 'suits', subcategory: 'Palazzo',
    price: 3999, originalPrice: 6999, discount: 43,
    colors: [{ name: 'Coral', hex: '#FF7F50' }, { name: 'Sage', hex: '#8A9A5B' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.5, reviews: 267, sold: 1900, stock: 48,
    images: ['images/saree-royal.png'],
    tags: ['trending'], occasion: 'Party',
    fabric: 'Chanderi Silk', weight: '550g',
    description: 'Elegant palazzo suit set with intricate mirror and thread work. Flared palazzo with printed dupatta.'
  },
  {
    id: 'SUT003', name: 'Straight Cut Lawn Cotton Suit', category: 'suits', subcategory: 'Straight Cut',
    price: 1999, originalPrice: 3499, discount: 43,
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Blue', hex: '#4169E1' }, { name: 'Pink', hex: '#FF69B4' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.4, reviews: 521, sold: 4200, stock: 80,
    images: ['images/sarees.png'],
    tags: ['sale'], occasion: 'Daily Wear',
    fabric: 'Lawn Cotton', weight: '450g',
    description: 'Comfortable straight-cut cotton suit for everyday elegance. Digital printed with embroidered neckline.'
  },
  {
    id: 'SUT004', name: 'Sharara Suit Heavy Embroidery', category: 'suits', subcategory: 'Sharara',
    price: 7999, originalPrice: 12999, discount: 38,
    colors: [{ name: 'Dusty Rose', hex: '#D4A5A5' }, { name: 'Ivory', hex: '#FFFFF0' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.8, reviews: 198, sold: 950, stock: 15,
    images: ['images/hero-bridal.png'],
    tags: ['new', 'wedding'], occasion: 'Wedding',
    fabric: 'Faux Georgette', weight: '800g',
    description: 'Gorgeous sharara suit with heavy zari and sequin embroidery. Perfect for weddings and sangeet.'
  },
  {
    id: 'SUT005', name: 'Patiala Suit Phulkari Work', category: 'suits', subcategory: 'Patiala',
    price: 2999, originalPrice: 4499, discount: 33,
    colors: [{ name: 'Yellow', hex: '#FFD700' }, { name: 'Red', hex: '#DC143C' }, { name: 'Green', hex: '#228B22' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.6, reviews: 342, sold: 2400, stock: 55,
    images: ['images/lehengas.png'],
    tags: ['trending'], occasion: 'Festive',
    fabric: 'Cotton', weight: '500g',
    description: 'Vibrant Patiala suit with authentic Phulkari hand embroidery from Punjab. Full Patiala salwar included.'
  },

  // ============ LEHENGAS ============
  {
    id: 'LEH001', name: 'Bridal Velvet Lehenga Choli', category: 'lehengas', subcategory: 'Bridal',
    price: 24999, originalPrice: 39999, discount: 38,
    colors: [{ name: 'Red', hex: '#B22222' }, { name: 'Maroon', hex: '#800020' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.9, reviews: 156, sold: 520, stock: 5,
    images: ['images/lehengas.png'],
    tags: ['premium', 'wedding'], occasion: 'Wedding',
    fabric: 'Velvet + Net', weight: '2.5kg',
    description: 'Embody pure royalty on your special day. This breathtaking bridal lehenga is crafted from plush velvet with intricate zardozi hand-embroidery that sparkles under the lights.'
  },
  {
    id: 'LEH002', name: 'Pastel Sequin Work Lehenga', category: 'lehengas', subcategory: 'Party Wear',
    price: 12999, originalPrice: 19999, discount: 35,
    colors: [{ name: 'Lavender', hex: '#E6E6FA' }, { name: 'Mint', hex: '#98D8C8' }, { name: 'Blush', hex: '#F5C6CB' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], rating: 4.7, reviews: 278, sold: 1100, stock: 22,
    images: ['images/hero-bridal.png'],
    tags: ['trending', 'new'], occasion: 'Reception',
    fabric: 'Georgette + Net', weight: '1.8kg',
    description: 'Dreamy pastel lehenga with all-over sequin work and cutdana embellishments. Modern silhouette.'
  },
  {
    id: 'LEH003', name: 'A-Line Silk Lehenga Set', category: 'lehengas', subcategory: 'Festive',
    price: 8499, originalPrice: 13999, discount: 39,
    colors: [{ name: 'Royal Blue', hex: '#4169E1' }, { name: 'Emerald', hex: '#50C878' }, { name: 'Wine', hex: '#722F37' }],
    sizes: ['S', 'M', 'L', 'XL'], rating: 4.6, reviews: 345, sold: 1650, stock: 30,
    images: ['images/lehengas.png'],
    tags: ['bestseller'], occasion: 'Festive',
    fabric: 'Art Silk', weight: '1.5kg',
    description: 'Elegant A-line silk lehenga with zari weaving and contrast border. Traditional with a modern twist.'
  },
  {
    id: 'LEH004', name: 'Crop Top Lehenga Digital Print', category: 'lehengas', subcategory: 'Indo-Western',
    price: 4999, originalPrice: 7999, discount: 38,
    colors: [{ name: 'Teal', hex: '#008080' }, { name: 'Coral', hex: '#FF6F61' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.5, reviews: 412, sold: 2800, stock: 40,
    images: ['images/saree-royal.png'],
    tags: ['trending'], occasion: 'Sangeet',
    fabric: 'Crepe + Organza', weight: '1.2kg',
    description: 'Contemporary crop top lehenga with digital floral prints. Perfect for mehendi and sangeet celebrations.'
  },
  {
    id: 'LEH005', name: 'Designer Lehenga Gota Patti', category: 'lehengas', subcategory: 'Rajasthani',
    price: 11499, originalPrice: 17999, discount: 36,
    colors: [{ name: 'Hot Pink', hex: '#FF69B4' }, { name: 'Orange', hex: '#FF8C00' }],
    sizes: ['S', 'M', 'L', 'XL'], rating: 4.8, reviews: 189, sold: 780, stock: 14,
    images: ['images/hero-bridal.png'],
    tags: ['handcrafted', 'premium'], occasion: 'Wedding',
    fabric: 'Raw Silk', weight: '2kg',
    description: 'Rajasthani designer lehenga with authentic gota patti work. Handcrafted by artisans from Jaipur.'
  },

  // ============ KURTAS ============
  {
    id: 'KUR001', name: 'Chikankari Lucknowi Kurta', category: 'suits', subcategory: 'Kurta',
    price: 1799, originalPrice: 2999, discount: 40,
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Pastel Blue', hex: '#AEC6CF' }, { name: 'Light Pink', hex: '#FFB6C1' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], rating: 4.6, reviews: 567, sold: 5200, stock: 95,
    images: ['images/sarees.png'],
    tags: ['bestseller', 'sale'], occasion: 'Casual',
    fabric: 'Cotton', weight: '300g',
    description: 'Elegant Chikankari hand-embroidered kurta from Lucknow. Breathable cotton with delicate needlework.'
  },
  {
    id: 'KUR002', name: 'Silk Blend Festive Kurta Set', category: 'suits', subcategory: 'Kurta Set',
    price: 3499, originalPrice: 5999, discount: 42,
    colors: [{ name: 'Teal', hex: '#008080' }, { name: 'Plum', hex: '#8E4585' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.5, reviews: 234, sold: 1800, stock: 42,
    images: ['images/lehengas.png'],
    tags: ['festive'], occasion: 'Festive',
    fabric: 'Silk Blend', weight: '450g',
    description: 'Premium silk blend kurta set with zari detailing. Comes with matching pants and dupatta.'
  }
];

// ============ COLLECTIONS ============
const COLLECTIONS = [
  { id: 'wedding', name: 'Wedding Collection', tagline: 'For Your Perfect Day', icon: '💍', filter: p => p.occasion === 'Wedding' },
  { id: 'festive', name: 'Festive Edit', tagline: 'Celebrate in Style', icon: '✨', filter: p => p.occasion === 'Festive' },
  { id: 'party', name: 'Party Wear', tagline: 'Shine & Dazzle', icon: '🎉', filter: p => ['Party', 'Reception', 'Sangeet'].includes(p.occasion) },
  { id: 'daily', name: 'Everyday Elegance', tagline: 'Grace for Every Day', icon: '🌸', filter: p => ['Casual', 'Daily Wear'].includes(p.occasion) },
  { id: 'new', name: 'New Arrivals', tagline: 'Just Dropped', icon: '🆕', filter: p => p.tags.includes('new') },
  { id: 'sale', name: 'Sale & Offers', tagline: 'Best Deals', icon: '🏷️', filter: p => p.discount >= 35 }
];

// ============ REVIEWS DATA ============
const REVIEWS = [
  { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'Absolutely stunning! The quality of the Banarasi saree exceeded my expectations. The zari work is impeccable.', date: '2 days ago', verified: true },
  { name: 'Anita Reddy', location: 'Hyderabad', rating: 5, text: 'The lehenga was perfect for my sister\'s wedding. Received so many compliments! Delivery was fast too.', date: '1 week ago', verified: true },
  { name: 'Meera Patel', location: 'Ahmedabad', rating: 4, text: 'Beautiful Anarkali suit. The fabric quality is great. Took 5 days for delivery but worth the wait.', date: '2 weeks ago', verified: true },
  { name: 'Sarah Khan', location: 'Delhi', rating: 5, text: 'Love the AI Stylist feature! It suggested the perfect combination for my engagement. Will order again!', date: '3 days ago', verified: true },
  { name: 'Deepika Singh', location: 'Jaipur', rating: 5, text: 'The Gota Patti lehenga is a masterpiece. Every stitch shows the artisan\'s dedication. Thank you Anaya Couture!', date: '1 week ago', verified: true },
  { name: 'Roshni Iyer', location: 'Chennai', rating: 4, text: 'Gorgeous Kanjivaram saree. The colors are exactly as shown. The packaging was also very premium.', date: '4 days ago', verified: true },
  { name: 'Fatima Begum', location: 'Lucknow', rating: 5, text: 'The Chikankari kurta is so comfortable and elegant. Perfect for summer wear. Already ordered two more!', date: '5 days ago', verified: true },
  { name: 'Jennifer Dsouza', location: 'Goa', rating: 5, text: 'Ordered from overseas and the shipping was seamless. The crop top lehenga is gorgeous!', date: '2 weeks ago', verified: true }
];

// ============ FAQ DATA ============
const FAQS = [
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, Rupay), and Net Banking.' },
  { q: 'How long does delivery take?', a: 'Domestic orders: 5-7 business days. Metro cities: 3-5 days. International: 10-15 business days. Express shipping available.' },
  { q: 'What is your return policy?', a: 'We offer 7-day easy returns for all products. Items must be unused, unwashed with original tags. Refund processed within 5-7 days.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to 50+ countries including USA, UK, Canada, Australia, UAE, Singapore. International shipping rates vary.' },
  { q: 'How do I choose the right size?', a: 'Use our AI Size Guide on each product page. You can also chat with our StyleBot for personalized sizing help.' },
  { q: 'Are these products authentic?', a: 'Absolutely! All products are sourced directly from artisans and verified weavers. Each product comes with an authenticity certificate.' },
  { q: 'Can I customize or alter my order?', a: 'Yes! We offer free alterations on all orders above ₹5000. Custom stitching available with 5-7 extra days.' },
  { q: 'Do you offer bulk/wholesale pricing?', a: 'Yes, we offer wholesale pricing for orders of 10+ pieces. Contact us via WhatsApp for bulk inquiry.' }
];

// ============ SHIPPING COUNTRIES ============
const SHIPPING_ZONES = [
  { zone: 'India', countries: ['All States & UTs'], delivery: '3-7 days', freeAbove: 1999, rate: 99 },
  { zone: 'South Asia', countries: ['Nepal', 'Sri Lanka', 'Bangladesh', 'Bhutan'], delivery: '7-10 days', freeAbove: 5000, rate: 499 },
  { zone: 'Middle East', countries: ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Oman', 'Bahrain'], delivery: '7-12 days', freeAbove: 8000, rate: 799 },
  { zone: 'Southeast Asia', countries: ['Singapore', 'Malaysia', 'Thailand', 'Indonesia'], delivery: '8-12 days', freeAbove: 8000, rate: 899 },
  { zone: 'North America', countries: ['USA', 'Canada'], delivery: '10-15 days', freeAbove: 10000, rate: 1299 },
  { zone: 'Europe', countries: ['UK', 'Germany', 'France', 'Italy', 'Netherlands', 'Spain'], delivery: '10-15 days', freeAbove: 10000, rate: 1199 },
  { zone: 'Oceania', countries: ['Australia', 'New Zealand'], delivery: '12-18 days', freeAbove: 12000, rate: 1399 }
];

// Export
if (typeof window !== 'undefined') {
  window.PRODUCTS = PRODUCTS;
  window.COLLECTIONS = COLLECTIONS;
  window.REVIEWS = REVIEWS;
  window.FAQS = FAQS;
  window.SHIPPING_ZONES = SHIPPING_ZONES;
}
