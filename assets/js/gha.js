// ============================================
// GHA (قلک) - مدیریت کیف پول طلا
// ============================================

let ghaState = {
    balance: parseFloat(localStorage.getItem('gha_balance')) || 0.700,
    history: JSON.parse(localStorage.getItem('gha_history')) || [
        { type: 'buy', amount: 0.5, price: 9163800, status: 'confirmed', date: '۱۴۰۵/۰۵/۰۱' },
        { type: 'buy', amount: 0.2, price: 3665520, status: 'pending', date: '۱۴۰۵/۰۵/۰۳' },
    ],
    cardNumber: '۶۰۳۷-۱۲۳۴-۵۶۷۸-۹۰۱۲',
};

function initGha() {
    renderGha();
    updateGhaUI();
}

function renderGha() {
    const container = document.getElementById('ghaContainer');
    container.innerHTML = `
        <div class="grid-2">
            <div class="card">
                <h3>🪙 خرید طلا برای قلک</h3>
                <p class="text-muted">از ۱ میلی‌گرم تا ۱۰ کیلوگرم</p>
                <div class="gha-input-group">
                    <input type="number" id="ghaAmount" placeholder="مقدار" min="0.001" step="0.001" value="0.1">
                    <select id="ghaUnit" class="gha-select">
                        <option value="g">گرم</option>
                        <option value="mg">میلی‌گرم</option>
                        <option value="kg">کیلوگرم</option>
                    </select>
                </div>
                <div class="gha-price-info">
                    <div>قیمت هر گرم: <strong class="text-gold" id="ghaPriceDisplay">${App.formatPrice(App.state.goldPrice)}</strong> تومان</div>
                    <div>مبلغ قابل پرداخت: <strong class="text-gold" id="ghaTotalDisplay">${App.formatPrice(App.state.goldPrice * 0.1)}</strong> تومان</div>
                </div>
                <button class="btn-gold w-full" onclick="addToGha()">
                    <i class="fas fa-plus-circle"></i> افزودن به قلک
                </button>
                <button class="btn-outline w-full mt-20" onclick="completeGhaPurchase()">
                    <i class="fas fa-check-circle"></i> تکمیل خرید با کیف پول
                </button>
            </div>

            <div class="card gha-wallet">
                <h4>💰 کیف پول طلا</h4>
                <div class="wallet-amount">
                    <span id="ghaWalletAmount">${ghaState.balance.toFixed(3)}</span>
                    <span style="font-size:0.9rem;color:var(--gray);">گرم</span>
                </div>
                <div class="wallet-value">
                    ارزش: <span id="ghaWalletValue">${App.formatPrice(App.state.goldPrice * ghaState.balance)}</span> تومان
                </div>
                <div class="wallet-actions">
                    <button class="btn-outline" style="width:100%;" onclick="requestPhysicalDelivery()">
                        <i class="fas fa-truck"></i> درخواست تحویل فیزیکی
                    </button>
                </div>
            </div>
        </div>

        <div class="card mt-20">
            <h4>📜 تاریخچه تراکنش‌ها</h4>
            <div class="gha-history" id="ghaHistoryList">
                ${ghaState.history.map(h => `
                    <div class="history-item">
                        <div>
                            <strong>${h.type === 'buy' ? '🟢 خرید' : '🔴 برداشت'}</strong>
                            ${h.amount} گرم
                        </div>
                        <div>${App.formatPrice(h.price)} تومان</div>
                        <div class="status-badge ${h.status}">${h.status === 'confirmed' ? 'تایید شده' : 'در انتظار'}</div>
                        <div style="font-size:0.8rem;color:var(--gray);">${h.date}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // رویدادها
    document.getElementById('ghaAmount').addEventListener('input', updateGhaUI);
    document.getElementById('ghaUnit').addEventListener('change', updateGhaUI);
}

function updateGhaUI() {
    const amount = parseFloat(document.getElementById('ghaAmount').value) || 0;
    const unit = document.getElementById('ghaUnit').value;
    let grams = amount;
    if (unit === 'mg') grams = amount / 1000;
    if (unit === 'kg') grams = amount * 1000;

    const total = App.state.goldPrice * grams;
    document.getElementById('ghaTotalDisplay').textContent = App.formatPrice(total);
    document.getElementById('ghaWalletAmount').textContent = ghaState.balance.toFixed(3);
    document.getElementById('ghaWalletValue').textContent = App.formatPrice(App.state.goldPrice * ghaState.balance);
    document.getElementById('ghaPriceDisplay').textContent = App.formatPrice(App.state.goldPrice);
}

function addToGha() {
    const amount = parseFloat(document.getElementById('ghaAmount').value);
    if (!amount || amount <= 0) {
        showNotif('❌ لطفاً مقدار معتبر وارد کنید');
        return;
    }

    const unit = document.getElementById('ghaUnit').value;
    let grams = amount;
    if (unit === 'mg') grams = amount / 1000;
    if (unit === 'kg') grams = amount * 1000;

    if (grams > 10000) {
        showNotif('❌ حداکثر ۱۰ کیلوگرم مجاز است');
        return;
    }

    const total = App.state.goldPrice * grams;
    const confirmMsg = `🪙 خرید ${grams.toFixed(3)} گرم طلا\n💰 مبلغ: ${App.formatPrice(total)} تومان\n🏦 شماره کارت: ${ghaState.cardNumber}\n\nپس از واریز، رسید را برای ادمین ارسال کنید.`;
    
    if (confirm(confirmMsg)) {
        // شبیه‌سازی اضافه شدن به کیف پول پس از تایید ادمین
        ghaState.balance += grams;
        ghaState.history.unshift({
            type: 'buy',
            amount: grams,
            price: total,
            status: 'pending',
            date: new Date().toLocaleDateString('fa-IR'),
        });
        saveGhaState();
        renderGha();
        updateGhaUI();
        showNotif(`✅ ${grams.toFixed(3)} گرم طلا به کیف پول شما اضافه شد (در انتظار تایید)`);
        
        // ارسال به ادمین (شبیه‌سازی)
        if (window.Admin) {
            Admin.addOrder('کیف پول قلک', 'خرید قلک', grams + ' گرم', total);
        }
    }
}

function completeGhaPurchase() {
    if (ghaState.balance <= 0) {
        showNotif('❌ موجودی کیف پول طلا کافی نیست');
        return;
    }

    const productName = prompt('نام محصول مورد نظر:');
    if (!productName) return;
    
    const weight = prompt('وزن (گرم):');
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
        showNotif('❌ وزن نامعتبر');
        return;
    }

    const w = parseFloat(weight);
    const total = App.state.goldPrice * w;

    if (w > ghaState.balance) {
        showNotif(`❌ موجودی کافی نیست. موجودی: ${ghaState.balance.toFixed(3)} گرم`);
        return;
    }

    if (confirm(`🪙 خرید ${w} گرم ${productName}\n💰 مبلغ: ${App.formatPrice(total)} تومان\n💳 پرداخت با کیف پول طلا`)) {
        ghaState.balance -= w;
        ghaState.history.unshift({
            type: 'buy',
            amount: w,
            price: total,
            status: 'confirmed',
            date: new Date().toLocaleDateString('fa-IR'),
        });
        saveGhaState();
        renderGha();
        updateGhaUI();
        showNotif(`✅ خرید ${productName} با موفقیت انجام شد`);
        
        if (window.Admin) {
            Admin.addOrder('کیف پول طلا', productName, w + ' گرم', total);
        }
    }
}

function requestPhysicalDelivery() {
    if (ghaState.balance < 1) {
        showNotif('❌ حداقل ۱ گرم طلا برای تحویل فیزیکی لازم است');
        return;
    }
    showNotif(`✅ درخواست تحویل ${ghaState.balance.toFixed(3)} گرم طلا ثبت شد. با شما تماس گرفته می‌شود.`);
}

function saveGhaState() {
    localStorage.setItem('gha_balance', ghaState.balance);
    localStorage.setItem('gha_history', JSON.stringify(ghaState.history));
}

// صادر کردن
window.ghaState = ghaState;
window.initGha = initGha;
window.addToGha = addToGha;
window.completeGhaPurchase = completeGhaPurchase;
window.requestPhysicalDelivery = requestPhysicalDelivery;
