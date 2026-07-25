// ============================================
// ADMIN - پنل مدیریت
// ============================================

const Admin = {
    orders: JSON.parse(localStorage.getItem('admin_orders')) || [
        { id: 1, user: '۰۹۹۸۱۰۶۴۵۰۵', product: 'طلای آبشده', weight: '۰.۵۰۰ گرم', amount: 9163800, status: 'pending', date: '۱۴۰۵/۰۵/۰۴' },
        { id: 2, user: '۰۹۱۲۳۴۵۶۷۸۹', product: 'سکه بهار آزادی', weight: '۸.۱۳۳ گرم', amount: 149000000, status: 'confirmed', date: '۱۴۰۵/۰۵/۰۳' },
        { id: 3, user: '۰۹۳۳۳۳۳۳۳۳', product: 'انگشتر طلا', weight: '۱.۲۰۰ گرم', amount: 25000000, status: 'cancelled', date: '۱۴۰۵/۰۵/۰۲' },
    ],
    notifications: [],
    cardNumber: '۶۰۳۷-۱۲۳۴-۵۶۷۸-۹۰۱۲',
    products: JSON.parse(localStorage.getItem('admin_products')) || [
        { id: 1, name: 'طلای آبشده ۱۸ عیار', category: 'gold', price: 18327600, weight: 1, stock: 100 },
        { id: 2, name: 'سکه بهار آزادی', category: 'coin', price: 149000000, weight: 8.133, stock: 50 },
        { id: 3, name: 'نیم سکه', category: 'coin', price: 74500000, weight: 4.066, stock: 30 },
        { id: 4, name: 'انگشتر طلا', category: 'jewelry', price: 25000000, weight: 1.2, stock: 20 },
        { id: 5, name: 'نقره خالص', category: 'silver', price: 280000, weight: 1, stock: 200 },
        { id: 6, name: 'شمش طلا ۱۰ گرمی', category: 'gold', price: 183276000, weight: 10, stock: 15 },
    ],
    nextOrderId: 4,
    nextProductId: 7,

    init() {
        this.render();
        this.updateStats();
    },

    render() {
        const container = document.getElementById('adminContainer');
        container.innerHTML = `
            <div class="admin-header">
                <div class="admin-greeting">
                    <h3>👋 خوش آمدید، ادمین عزیز</h3>
                    <span class="status-badge confirmed">آنلاین</span>
                </div>
                <div class="admin-actions">
                    <button class="btn-outline" onclick="Admin.exportData()">
                        <i class="fas fa-download"></i> خروجی
                    </button>
                    <button class="btn-danger" onclick="App.logout()">
                        <i class="fas fa-sign-out-alt"></i> خروج
                    </button>
                </div>
            </div>

            <div class="admin-stats" id="adminStats">
                <div class="stat-card"><span class="num" id="statTotal">${this.orders.length}</span> کل سفارشات</div>
                <div class="stat-card"><span class="num" id="statPending">${this.orders.filter(o => o.status === 'pending').length}</span> در انتظار</div>
                <div class="stat-card"><span class="num" id="statConfirmed">${this.orders.filter(o => o.status === 'confirmed').length}</span> تکمیل شده</div>
                <div class="stat-card"><span class="num" id="statToday">${this.orders.filter(o => o.date === new Date().toLocaleDateString('fa-IR')).length}</span> امروز</div>
            </div>

            <div class="admin-tabs">
                <button class="tab-btn active" onclick="Admin.showTab('orders')">📋 سفارشات</button>
                <button class="tab-btn" onclick="Admin.showTab('products')">🛍️ محصولات</button>
                <button class="tab-btn" onclick="Admin.showTab('settings')">⚙️ تنظیمات</button>
                <button class="tab-btn" onclick="Admin.showTab('notifications')">🔔 اعلان‌ها</button>
            </div>

            <div id="adminTabContent">
                ${this.renderOrdersTab()}
            </div>
        `;
    },

    renderOrdersTab() {
        return `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>کاربر</th>
                            <th>محصول</th>
                            <th>وزن</th>
                            <th>مبلغ</th>
                            <th>تاریخ</th>
                            <th>وضعیت</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.orders.map(order => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.user}</td>
                                <td>${order.product}</td>
                                <td>${order.weight}</td>
                                <td>${App.formatPrice(order.amount)}</td>
                                <td>${order.date}</td>
                                <td><span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span></td>
                                <td>
                                    ${order.status === 'pending' ? `
                                        <button class="admin-btn confirm" onclick="Admin.confirmOrder(${order.id})">✓ تایید</button>
                                    ` : ''}
                                    <button class="admin-btn view" onclick="Admin.viewOrder(${order.id})">👁️</button>
                                    <button class="admin-btn delete" onclick="Admin.deleteOrder(${order.id})">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderProductsTab() {
        return `
            <div class="admin-products">
                <button class="btn-gold" onclick="Admin.addProduct()">
                    <i class="fas fa-plus"></i> افزودن محصول جدید
                </button>
                <div class="admin-table-wrapper mt-20">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>نام</th>
                                <th>دسته</th>
                                <th>قیمت (تومان)</th>
                                <th>وزن (گرم)</th>
                                <th>موجودی</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.products.map(p => `
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${p.name}</td>
                                    <td>${p.category}</td>
                                    <td>${App.formatPrice(p.price)}</td>
                                    <td>${p.weight}</td>
                                    <td>${p.stock}</td>
                                    <td>
                                        <button class="admin-btn edit" onclick="Admin.editProduct(${p.id})">✏️</button>
                                        <button class="admin-btn delete" onclick="Admin.deleteProduct(${p.id})">🗑️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderSettingsTab() {
        return `
            <div class="admin-settings">
                <div class="setting-group">
                    <h4>🏦 شماره کارت واریزی</h4>
                    <div class="setting-item">
                        <span id="adminCardDisplay">${this.cardNumber}</span>
                        <button class="admin-btn edit" onclick="Admin.changeCardNumber()">تغییر</button>
                    </div>
                </div>
                <div class="setting-group">
                    <h4>💰 قیمت پایه طلا</h4>
                    <div class="setting-item">
                        <span>${App.formatPrice(App.state.goldPrice)} تومان</span>
                        <button class="admin-btn edit" onclick="Admin.changeGoldPrice()">تغییر</button>
                    </div>
                </div>
                <div class="setting-group">
                    <h4>📊 آمار سیستم</h4>
                    <div class="setting-item">
                        <span>کل کاربران: ۲۰,۰۰۰+</span>
                        <span>کل تراکنش‌ها: ${this.orders.length}</span>
                    </div>
                </div>
                <div class="setting-group">
                    <h4>🔄 پشتیبان‌گیری</h4>
                    <div class="setting-item">
                        <button class="btn-gold" onclick="Admin.backupData()">📥 دریافت پشتیبان</button>
                        <button class="btn-outline" onclick="Admin.restoreData()">📤 بازیابی</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderNotificationsTab() {
        return `
            <div class="admin-notifications">
                <button class="btn-outline" onclick="Admin.clearNotifications()">پاک کردن همه</button>
                <div class="notification-list">
                    ${this.notifications.length === 0 ? `
                        <div class="text-muted" style="text-align:center;padding:30px;">هیچ اعلانی وجود ندارد</div>
                    ` : this.notifications.map(n => `
                        <div class="notif-item">
                            <span class="notif-time">${n.time}</span>
                            <span>${n.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getStatusText(status) {
        const map = {
            pending: 'در انتظار',
            confirmed: 'تایید شده',
            cancelled: 'لغو شده',
            delivered: 'تحویل شده',
        };
        return map[status] || status;
    },

    updateStats() {
        const total = this.orders.length;
        const pending = this.orders.filter(o => o.status === 'pending').length;
        const confirmed = this.orders.filter(o => o.status === 'confirmed').length;
        const today = this.orders.filter(o => o.date === new Date().toLocaleDateString('fa-IR')).length;

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPending').textContent = pending;
        document.getElementById('statConfirmed').textContent = confirmed;
        document.getElementById('statToday').textContent = today;
    },

    showTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.tab-btn[onclick*="${tab}"]`).classList.add('active');

        const container = document.getElementById('adminTabContent');
        switch(tab) {
            case 'orders': container.innerHTML = this.renderOrdersTab(); break;
            case 'products': container.innerHTML = this.renderProductsTab(); break;
            case 'settings': container.innerHTML = this.renderSettingsTab(); break;
            case 'notifications': container.innerHTML = this.renderNotificationsTab(); break;
        }
    },

    confirmOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            order.status = 'confirmed';
            this.saveOrders();
            this.render();
            this.updateStats();
            showNotif(`✅ سفارش #${id} تایید شد`);
        }
    },

    deleteOrder(id) {
        if (confirm(`آیا از حذف سفارش #${id} اطمینان دارید؟`)) {
            this.orders = this.orders.filter(o => o.id !== id);
            this.saveOrders();
            this.render();
            this.updateStats();
            showNotif(`🗑️ سفارش #${id} حذف شد`);
        }
    },

    viewOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            alert(`📋 جزییات سفارش #${order.id}\n\nکاربر: ${order.user}\nمحصول: ${order.product}\nوزن: ${order.weight}\nمبلغ: ${App.formatPrice(order.amount)}\nتاریخ: ${order.date}\nوضعیت: ${this.getStatusText(order.status)}`);
        }
    },

    addOrder(user, product, weight, amount) {
        this.orders.unshift({
            id: this.nextOrderId++,
            user: user,
            product: product,
            weight: weight,
            amount: amount,
            status: 'pending',
            date: new Date().toLocaleDateString('fa-IR'),
        });
        this.saveOrders();
        this.updateStats();
        this.sendNotification(`سفارش جدید از ${user}`);
    },

    addProduct() {
        const name = prompt('نام محصول:');
        if (!name) return;
        const category = prompt('دسته (gold/coin/jewelry/silver):');
        if (!category) return;
        const price = prompt('قیمت (تومان):');
        if (!price || isNaN(price)) return;
        const weight = prompt('وزن (گرم):');
        if (!weight || isNaN(weight)) return;
        const stock = prompt('موجودی:');
        if (!stock || isNaN(stock)) return;

        this.products.push({
            id: this.nextProductId++,
            name,
            category,
            price: parseInt(price),
            weight: parseFloat(weight),
            stock: parseInt(stock),
        });
        this.saveProducts();
        this.render();
        showNotif(`✅ محصول ${name} با موفقیت اضافه شد`);
    },

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;
        const name = prompt('نام جدید:', product.name);
        if (name) product.name = name;
        const price = prompt('قیمت جدید:', product.price);
        if (price && !isNaN(price)) product.price = parseInt(price);
        const stock = prompt('موجودی جدید:', product.stock);
        if (stock && !isNaN(stock)) product.stock = parseInt(stock);
        this.saveProducts();
        this.render();
        showNotif(`✅ محصول ${product.name} بروزرسانی شد`);
    },

    deleteProduct(id) {
        if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
            this.products = this.products.filter(p => p.id !== id);
            this.saveProducts();
            this.render();
            showNotif('🗑️ محصول حذف شد');
        }
    },

    changeCardNumber() {
        const newCard = prompt('شماره کارت جدید:', this.cardNumber);
        if (newCard && newCard.length >= 16) {
            this.cardNumber = newCard;
            localStorage.setItem('admin_card', newCard);
            showNotif('✅ شماره کارت تغییر یافت');
            this.render();
        }
    },

    changeGoldPrice() {
        const newPrice = prompt('قیمت جدید هر گرم طلا (تومان):', App.state.goldPrice);
        if (newPrice && !isNaN(newPrice)) {
            App.state.goldPrice = parseInt(newPrice);
            App.saveState();
            App.updatePriceDisplay();
            showNotif('✅ قیمت طلا بروزرسانی شد');
            this.render();
        }
    },

    sendNotification(message) {
        this.notifications.unshift({
            message: message,
            time: new Date().toLocaleTimeString('fa-IR'),
        });
        localStorage.setItem('admin_notifications', JSON.stringify(this.notifications));
    },

    clearNotifications() {
        this.notifications = [];
        localStorage.setItem('admin_notifications', JSON.stringify(this.notifications));
        this.render();
        showNotif('✅ همه اعلان‌ها پاک شدند');
    },

    backupData() {
        const data = {
            orders: this.orders,
            products: this.products,
            cardNumber: this.cardNumber,
            goldPrice: App.state.goldPrice,
            date: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `talamotamedi_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotif('✅ پشتیبان با موفقیت دریافت شد');
    },

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.orders) this.orders = data.orders;
                    if (data.products) this.products = data.products;
                    if (data.cardNumber) this.cardNumber = data.cardNumber;
                    if (data.goldPrice) {
                        App.state.goldPrice = data.goldPrice;
                        App.saveState();
                        App.updatePriceDisplay();
                    }
                    this.saveOrders();
                    this.saveProducts();
                    localStorage.setItem('admin_card', this.cardNumber);
                    showNotif('✅ بازیابی با موفقیت انجام شد');
                    this.render();
                    this.updateStats();
                } catch (err) {
                    showNotif('❌ فایل نامعتبر است');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    exportData() {
        const data = {
            orders: this.orders,
            products: this.products,
            cardNumber: this.cardNumber,
            goldPrice: App.state.goldPrice,
            stats: {
                total: this.orders.length,
                pending: this.orders.filter(o => o.status === 'pending').length,
                confirmed: this.orders.filter(o => o.status === 'confirmed').length,
            },
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `talamotamedi_export_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotif('✅ خروجی با موفقیت دریافت شد');
    },

    saveOrders() {
        localStorage.setItem('admin_orders', JSON.stringify(this.orders));
    },

    saveProducts() {
        localStorage.setItem('admin_products', JSON.stringify(this.products));
        // همزمان بروزرسانی در Products اصلی
        window.products = this.products;
    },
};

// صادر کردن
window.Admin = Admin;
