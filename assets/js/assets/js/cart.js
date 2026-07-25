// ============================================
// CART - مدیریت سبد خرید
// ============================================

let cartItems = JSON.parse(localStorage.getItem('cart_items')) || [];

function initCart() {
    renderCart();
    updateCartBadge();
}

function renderCart() {
    const container = document.getElementById('cartContainer');
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:60px 20px;">
                <i class="fas fa-cart-plus" style="font-size:4rem;color:#ddd;"></i>
                <h3 style="margin-top:15px;color:var(--gray);">سبد خرید شما خالی است</h3>
                <p class="text-muted">برای شروع خرید به <a href="#" onclick="App.navigate('shop')" style="color:var(--gold);">فروشگاه</a> بروید</p>
            </div>
        `;
        return;
    }

    let totalWeight = 0;
    let totalPrice = 0;

    const itemsHtml = cartItems.map((item, index) => {
        const qty = item.qty || 1;
        const weight = item.weight * qty;
        const price = item.price * qty;
        totalWeight += weight;
        totalPrice += price;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span class="text-muted">وزن: ${weight.toFixed(3)} گرم</span>
                </div>
                <div class="cart-item-price">${App.formatPrice(price)} تومان</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
                    <span>${qty}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    <button class="qty-btn remove" onclick="removeFromCart(${index})">✕</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="card">
            ${itemsHtml}
            <div class="cart-summary">
                <div class="summary-item">
                    <span>وزن کل:</span>
                    <strong>${totalWeight.toFixed(3)} گرم</strong>
                </div>
                <div class="summary-item total">
                    <span>مجموع:</span>
                    <strong>${App.formatPrice(totalPrice)} تومان</strong>
                </div>
            </div>
            <div class="cart-actions">
                <button class="btn-gold" onclick="checkoutCart()">
                    <i class="fas fa-check"></i> تکمیل خرید
                </button>
                <button class="btn-outline" onclick="requestPriceCheck()">
                    <i class="fas fa-search"></i> استعلام قیمت و موجودی
                </button>
                <button class="btn-danger" onclick="clearCart()">
                    <i class="fas fa-trash"></i> خالی کردن
                </button>
            </div>
        </div>
    `;

    updateCartBadge();
}

function updateCartBadge() {
    const count = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
    document.getElementById('cartCount').textContent = count;
}

function addToCart(product) {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
    } else {
        cartItems.push({ ...product, qty: 1 });
    }
    saveCart();
    renderCart();
    updateCartBadge();
    showNotif(`✅ ${product.name} به سبد خرید اضافه شد`);
}

function changeQty(index, delta) {
    if (!cartItems[index]) return;
    const newQty = (cartItems[index].qty || 1) + delta;
    if (newQty <= 0) {
        cartItems.splice(index, 1);
    } else {
        cartItems[index].qty = newQty;
    }
    saveCart();
    renderCart();
    updateCartBadge();
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCart();
    renderCart();
    updateCartBadge();
    showNotif('🗑️ محصول از سبد خرید حذف شد');
}

function clearCart() {
    if (cartItems.length === 0) return;
    if (confirm('آیا از خالی کردن سبد خرید اطمینان دارید؟')) {
        cartItems = [];
        saveCart();
        renderCart();
        updateCartBadge();
        showNotif('🗑️ سبد خرید خالی شد');
    }
}

function checkoutCart() {
    if (cartItems.length === 0) {
        showNotif('❌ سبد خرید خالی است');
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const cardNumber = '۶۰۳۷-۱۲۳۴-۵۶۷۸-۹۰۱۲';
    
    // نمایش شماره کارت
    const msg = `🏦 شماره کارت جهت واریز:\n${cardNumber}\n\n💰 مبلغ کل: ${App.formatPrice(total)} تومان\n\nپس از واریز، رسید را برای ادمین ارسال کنید.`;
    alert(msg);
    
    // شبیه‌سازی ارسال به ادمین
    if (window.Admin) {
        const products = cartItems.map(i => `${i.name} (${i.qty}x)`).join(', ');
        Admin.addOrder('کاربر سایت', products, cartItems.reduce((s, i) => s + (i.weight * (i.qty || 1)), 0).toFixed(3) + ' گرم', total);
    }
    
    // پاک کردن سبد
    cartItems = [];
    saveCart();
    renderCart();
    updateCartBadge();
    showNotif('✅ سفارش شما ثبت شد. منتظر تایید ادمین باشید.');
}

function requestPriceCheck() {
    if (cartItems.length === 0) {
        showNotif('❌ سبد خرید خالی است');
        return;
    }
    showNotif('📨 استعلام قیمت و موجودی برای ادمین ارسال شد');
    
    // شبیه‌سازی ارسال نوتیف به ادمین
    if (window.Admin) {
        Admin.sendNotification('استعلام قیمت جدید از سوی کاربر');
    }
}

function saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
}

// صادر کردن
window.cartItems = cartItems;
window.initCart = initCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkoutCart = checkoutCart;
window.requestPriceCheck = requestPriceCheck;
