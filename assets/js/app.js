// ============================================
// APP CORE - مدیریت اصلی برنامه
// ============================================

const App = {
    // وضعیت اصلی
    state: {
        goldPrice: 18327600,
        goldPriceHistory: [],
        isAdmin: false,
        currentPage: 'home',
        user: null,
    },

    // مقداردهی اولیه
    init() {
        this.loadState();
        this.setupEventListeners();
        this.startPriceSimulation();
        this.hidePreloader();
        this.navigate('home');
    },

    // بارگذاری وضعیت از localStorage
    loadState() {
        const saved = localStorage.getItem('talamotamedi_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(this.state, parsed);
            } catch (e) {}
        }
        // بررسی ادمین
        if (localStorage.getItem('talamotamedi_admin') === 'true') {
            this.state.isAdmin = true;
            document.getElementById('adminLink').style.display = 'block';
        }
    },

    // ذخیره وضعیت
    saveState() {
        localStorage.setItem('talamotamedi_state', JSON.stringify(this.state));
    },

    // رویدادها
    setupEventListeners() {
        // کلیک روی لینک‌های منو
        document.querySelectorAll('.nav-menu a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(link.dataset.page);
            });
        });

        // بستن منو با کلیک بیرون
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('mainMenu');
            const toggle = document.querySelector('.mobile-toggle');
            if (menu.classList.contains('open') && 
                !menu.contains(e.target) && 
                !toggle.contains(e.target)) {
                menu.classList.remove('open');
            }
        });
    },

    // ناوبری
    navigate(page) {
        // اگر صفحه ادمین است و کاربر ادمین نیست
        if (page === 'admin' && !this.state.isAdmin) {
            showNotif('شما دسترسی به پنل مدیریت ندارید');
            return;
        }

        this.state.currentPage = page;
        this.saveState();

        // بروزرسانی کلاس active در منو
        document.querySelectorAll('.nav-menu a[data-page]').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // بارگذاری صفحه
        this.loadPage(page);

        // بستن منو موبایل
        document.getElementById('mainMenu').classList.remove('open');

        // اسکرول به بالا
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // بارگذاری صفحه
    loadPage(page) {
        const container = document.getElementById('pageContainer');
        
        // صفحات مختلف
        const pages = {
            home: this.renderHome,
            chart: this.renderChart,
            gha: this.renderGha,
            shop: this.renderShop,
            cart: this.renderCart,
            invite: this.renderInvite,
            about: this.renderAbout,
            admin: this.renderAdmin,
        };

        if (pages[page]) {
            container.innerHTML = pages[page].call(this);
            // اجرای اسکریپت‌های اختصاصی صفحه
            if (page === 'chart') initChart();
            if (page === 'gha') initGha();
            if (page === 'shop') initShop();
            if (page === 'cart') initCart();
            if (page === 'admin') initAdmin();
        }
    },

    // ============================================
    // RENDER PAGES
    // ============================================
    
    renderHome() {
        return `
            <section class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h1><i class="fas fa-gem text-gold"></i> طلای معتمدی</h1>
                        <p class="hero-subtitle">خرید و فروش آنلاین طلا و نقره <strong>بدون اجرت و مالیات</strong></p>
                        <div class="hero-stats">
                            <div class="stat"><i class="fas fa-store"></i> ۲۳ شعبه</div>
                            <div class="stat"><i class="fas fa-users"></i> ۲۰ میلیون کاربر</div>
                            <div class="stat"><i class="fas fa-clock"></i> پشتیبانی ۲۴/۷</div>
                            <div class="stat"><i class="fas fa-shield-alt"></i> ضمانت اصالت</div>
                        </div>
                        <div class="hero-actions">
                            <button class="btn-gold" onclick="App.navigate('shop')">
                                <i class="fas fa-shopping-cart"></i> شروع خرید
                            </button>
                            <button class="btn-outline" onclick="App.navigate('gha')">
                                <i class="fas fa-piggy-bank"></i> قلک طلا
                            </button>
                        </div>
                    </div>
                    <div class="hero-price-card">
                        <div class="price-label">💰 قیمت لحظه‌ای هر گرم طلا ۱۸ عیار</div>
                        <div class="price-value" id="heroPrice">${this.formatPrice(this.state.goldPrice)}</div>
                        <div class="price-change ${this.state.goldPrice > 18000000 ? 'positive' : 'negative'}">
                            ${this.state.goldPrice > 18000000 ? '▲' : '▼'} ۲.۴۲%
                        </div>
                        <button class="btn-outline" style="width:100%;margin-top:15px;" onclick="App.updateGoldPrice()">
                            <i class="fas fa-sync-alt"></i> بروزرسانی قیمت
                        </button>
                    </div>
                </div>
            </section>

            <div class="container">
                <div class="grid-4 benefits-grid">
                    <div class="benefit-card"><i class="fas fa-hand-holding-usd"></i><h4>بدون اجرت</h4></div>
                    <div class="benefit-card"><i class="fas fa-shield-alt"></i><h4>ضمانت اصالت</h4></div>
                    <div class="benefit-card"><i class="fas fa-truck"></i><h4>تحویل فیزیکی</h4></div>
                    <div class="benefit-card"><i class="fas fa-coins"></i><h4>از ۱ میلی‌گرم</h4></div>
                </div>

                <h2 class="section-title">خدمات ویژه طلای معتمدی</h2>
                <div class="grid-3">
                    <div class="service-card">
                        <i class="fas fa-gold"></i>
                        <h3>خرید طلا</h3>
                        <p>طلای آبشده ۱۸ عیار با بهترین قیمت</p>
                        <button class="btn-gold w-full" onclick="App.navigate('shop')">خرید</button>
                    </div>
                    <div class="service-card">
                        <i class="fas fa-piggy-bank"></i>
                        <h3>قلک طلا</h3>
                        <p>ذخیره‌سازی پله‌ای طلا با هر بودجه</p>
                        <button class="btn-gold w-full" onclick="App.navigate('gha')">ورود به قلک</button>
                    </div>
                    <div class="service-card">
                        <i class="fas fa-hand-holding-heart"></i>
                        <h3>وام طلا</h3>
                        <p>دریافت وام بدون ضامن با وثیقه طلا</p>
                        <button class="btn-gold w-full" onclick="showNotif('درخواست وام ثبت شد')">درخواست</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderChart() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-chart-line text-gold"></i> نمودار قیمت لحظه‌ای طلا</h2>
                <div class="card">
                    <div style="max-width:800px;margin:0 auto;">
                        <canvas id="goldChart" height="300"></canvas>
                    </div>
                    <div class="flex-center gap-10 mt-20">
                        <button class="btn-gold" onclick="updateChartData()">
                            <i class="fas fa-sync-alt"></i> بروزرسانی
                        </button>
                        <button class="btn-outline" onclick="toggleChartTime()">
                            <i class="fas fa-calendar"></i> تغییر بازه
                        </button>
                    </div>
                </div>

                <div class="card mt-20">
                    <h4>📊 قیمت‌های روزانه</h4>
                    <div class="grid-4" id="dailyPriceList" style="margin-top:15px;">
                        ${this.generateDailyPrices()}
                    </div>
                </div>
            </div>
        `;
    },

    renderGha() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-piggy-bank text-gold"></i> قلک طلای معتمدی</h2>
                <div id="ghaContainer">
                    <!-- توسط gha.js پر می‌شود -->
                </div>
            </div>
        `;
    },

    renderShop() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-store text-gold"></i> فروشگاه طلای معتمدی</h2>
                <div id="shopContainer">
                    <!-- توسط shop.js پر می‌شود -->
                </div>
            </div>
        `;
    },

    renderCart() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-shopping-cart text-gold"></i> سبد خرید</h2>
                <div id="cartContainer">
                    <!-- توسط cart.js پر می‌شود -->
                </div>
            </div>
        `;
    },

    renderInvite() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-user-friends text-gold"></i> دعوت دوستان</h2>
                <div class="card" style="text-align:center;padding:50px;">
                    <i class="fas fa-gift" style="font-size:4rem;color:var(--gold);margin-bottom:20px;"></i>
                    <h3>کد معرف اختصاصی شما</h3>
                    <div class="invite-code" id="inviteCodeDisplay">GOLD-${Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
                    <div class="flex-center gap-10 mt-20">
                        <button class="btn-gold" onclick="copyInviteCode()"><i class="fas fa-copy"></i> کپی</button>
                        <button class="btn-outline" onclick="shareInvite()"><i class="fas fa-share-alt"></i> اشتراک‌گذاری</button>
                    </div>
                    <div class="mt-20" style="border-top:1px solid #eee;padding-top:20px;">
                        <p>👥 تاکنون <strong>۱۲</strong> نفر از کد شما استفاده کرده‌اند</p>
                        <p>🎁 پاداش دریافتی: <strong class="text-gold">۰.۵۰۰ گرم طلا</strong></p>
                    </div>
                </div>
            </div>
        `;
    },

    renderAbout() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-info-circle text-gold"></i> درباره طلای معتمدی</h2>
                <div class="card" style="padding:40px;">
                    <p style="font-size:1.1rem;line-height:2;">طلای معتمدی یک پلتفرم معتبر و قانونی برای خرید و فروش آنلاین طلا و نقره در ایران است. ما با هدف حذف هزینه‌های اضافی مانند اجرت و مالیات، بستری امن، شفاف و سریع برای سرمایه‌گذاری در فلزات گرانبها فراهم کرده‌ایم.</p>
                    
                    <h4 style="margin-top:25px;">🔹 مجوزها و اعتبار</h4>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin:10px 0;">
                        <span class="badge" style="background:#e8f5e9;color:#2e7d32;padding:6px 18px;border-radius:20px;">✅ اینماد</span>
                        <span class="badge" style="background:#e8f5e9;color:#2e7d32;padding:6px 18px;border-radius:20px;">✅ اتحادیه طلا</span>
                        <span class="badge" style="background:#e8f5e9;color:#2e7d32;padding:6px 18px;border-radius:20px;">✅ نظام صنفی</span>
                        <span class="badge" style="background:#e8f5e9;color:#2e7d32;padding:6px 18px;border-radius:20px;">✅ فینتک</span>
                    </div>

                    <h4 style="margin-top:25px;">📞 تماس با ما</h4>
                    <ul style="list-style:none;">
                        <li><i class="fas fa-phone text-gold"></i> ۰۲۱-۱۲۳۴۵۶۷۸</li>
                        <li><i class="fas fa-envelope text-gold"></i> info@talamotamedi.com</li>
                        <li><i class="fas fa-map-marker-alt text-gold"></i> تهران، خیابان ولیعصر، پلاک ۱۲۳</li>
                    </ul>
                </div>
            </div>
        `;
    },

    renderAdmin() {
        return `
            <div class="container">
                <h2 class="section-title"><i class="fas fa-user-cog text-gold"></i> پنل مدیریت</h2>
                <div id="adminContainer">
                    <!-- توسط admin.js پر می‌شود -->
                </div>
            </div>
        `;
    },

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    formatPrice(price) {
        return price.toLocaleString('fa-IR');
    },

    generateDailyPrices() {
        const days = ['امروز', 'دیروز', '۳ روز پیش', '۴ روز پیش'];
        const prices = [
            this.state.goldPrice,
            this.state.goldPrice - Math.floor(Math.random() * 200000),
            this.state.goldPrice - Math.floor(Math.random() * 400000),
            this.state.goldPrice - Math.floor(Math.random() * 600000),
        ];
        return days.map((d, i) => `
            <div style="background:var(--light-gray);padding:12px;border-radius:10px;text-align:center;">
                <div style="font-weight:bold;">${d}</div>
                <div style="color:var(--gold);font-weight:bold;direction:ltr;">${this.formatPrice(prices[i])}</div>
            </div>
        `).join('');
    },

    // ============================================
    // PRICE SIMULATION
    // ============================================
    updateGoldPrice() {
        const min = 17500000;
        const max = 19500000;
        this.state.goldPrice = Math.floor(Math.random() * (max - min + 1)) + min;
        this.saveState();
        this.updatePriceDisplay();
        showNotif(`قیمت طلا بروزرسانی شد: ${this.formatPrice(this.state.goldPrice)} تومان`);
    },

    updatePriceDisplay() {
        const formatted = this.formatPrice(this.state.goldPrice);
        document.getElementById('headerGoldPrice').textContent = formatted;
        const heroPrice = document.getElementById('heroPrice');
        if (heroPrice) heroPrice.textContent = formatted;
    },

    startPriceSimulation() {
        // بروزرسانی هر ۳۰ ثانیه
        setInterval(() => {
            this.updateGoldPrice();
        }, 30000);
    },

    // ============================================
    // PRELOADER
    // ============================================
    hidePreloader() {
        setTimeout(() => {
            document.getElementById('preloader').classList.add('hidden');
        }, 600);
    },

    // ============================================
    // AUTH
    // ============================================
    login(phone) {
        if (phone === '09981064505') {
            this.state.isAdmin = true;
            localStorage.setItem('talamotamedi_admin', 'true');
            document.getElementById('adminLink').style.display = 'block';
            showNotif('👋 خوش آمدید ادمین عزیز!');
            this.navigate('admin');
            return true;
        }
        return false;
    },

    logout() {
        this.state.isAdmin = false;
        localStorage.removeItem('talamotamedi_admin');
        document.getElementById('adminLink').style.display = 'none';
        showNotif('با موفقیت خارج شدید');
        this.navigate('home');
    }
};

// ============================================
// GLOBAL FUNCTIONS
// ============================================
function showNotif(msg) {
    const el = document.getElementById('notif');
    document.getElementById('notifText').textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 5000);
}

function closeNotif() {
    document.getElementById('notif').classList.remove('show');
}

function toggleMenu() {
    document.getElementById('mainMenu').classList.toggle('open');
}

function handleAuth() {
    const phone = prompt('📱 شماره موبایل خود را وارد کنید:');
    if (!phone) return;
    if (phone === '09981064505') {
        App.login(phone);
    } else {
        App.state.user = phone;
        App.saveState();
        showNotif(`✅ خوش آمدید ${phone}`);
        App.navigate('home');
    }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// صادر کردن برای استفاده در سایر فایل‌ها
window.App = App;
window.showNotif = showNotif;
window.handleAuth = handleAuth;
