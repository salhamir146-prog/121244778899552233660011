// ============================================
// SHOP - فروشگاه محصولات
// ============================================

let products = JSON.parse(localStorage.getItem('admin_products')) || [
    { id: 1, name: 'طلای آبشده ۱۸ عیار', category: 'gold', price: 18327600, weight: 1, stock: 100 },
    { id: 2, name: 'سکه بهار آزادی', category: 'coin', price: 149000000, weight: 8.133, stock: 50 },
    { id: 3, name: 'نیم سکه', category: 'coin', price: 74500000, weight: 4.066, stock: 30 },
    { id: 4, name: 'انگشتر طلا', category: 'jewelry', price: 25000000, weight: 1.2, stock: 20 },
    { id: 5, name: 'نقره خالص', category: 'silver', price: 280000, weight: 1, stock: 200 },
    { id: 6, name: 'شمش طلا ۱۰ گرمی', category: 'gold', price: 183276000, weight: 10, stock: 15 },
];

let currentCategory = 'all';

function initShop() {
    renderShop();
}

function renderShop(category = currentCategory) {
    const container = document.getElementById('shopContainer');
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);

    container.innerHTML = `
        <div class="shop-filters">
            <button class="filter-btn ${category === 'all' ? 'active' : ''}" onclick="filterProducts('all', this)">همه</button>
            <button class="filter-btn ${category === 'gold' ? 'active' : ''}" onclick="filterProducts('gold', this)">طلای آبشده</button>
            <button class="filter-btn ${category === 'coin' ? 'active' : ''}" onclick="filterProducts('coin', this)">سکه</button>
            <button class="filter-btn ${category === 'jewelry' ? 'active' : ''}" onclick="filterProducts('jewelry', this)">مصنوعات</button>
            <button class="filter-btn ${category === 'silver' ? 'active' : ''}" onclick="filterProducts('silver', this)">نقره</button>
        </div>

        <div class="product-grid">
            ${filtered.map(p => `
                <div class="product-card">
                    <div class="product-image">
                        <i class="fas fa-gem" style="font-size:3rem;color:var(--gold);"></i>
                    </div>
                    <h4>${p.name}</h4>
                    <div class="product-price">${App.formatPrice(p.price)} تومان</div>
                    <div class="product-meta">
                        <span>⚖️ ${p.weight} گرم</span>
                        <span>📦 ${p.stock} عدد</span>
                    </div>
                    <button class="btn-gold w-full" onclick="addToCart({id:${p.id}, name:'${p.name}', price:${p.price}, weight:${p.weight}})">
                        <i class="fas fa-cart-plus"></i> افزودن به سبد
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function filterProducts(category, btn) {
    currentCategory = category;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderShop(category);
}

// صادر کردن
window.products = products;
window.initShop = initShop;
window.filterProducts = filterProducts;
