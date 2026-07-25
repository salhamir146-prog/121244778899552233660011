// ============================================
// CHART - نمودار قیمت طلا
// ============================================

let chartInstance = null;
let chartTimeRange = 'week';

function initChart() {
    const ctx = document.getElementById('goldChart');
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const data = generateChartData('week');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'قیمت هر گرم طلا (تومان)',
                data: data.prices,
                borderColor: '#d4a017',
                backgroundColor: 'rgba(212, 160, 23, 0.08)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d4a017',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('fa-IR') + ' تومان';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fa-IR');
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)',
                    }
                },
                x: {
                    grid: {
                        display: false,
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });
}

function generateChartData(range) {
    const labels = [];
    const prices = [];
    const currentPrice = App.state.goldPrice;
    let count = 7;

    if (range === 'month') count = 30;
    else if (range === 'day') count = 24;

    const basePrice = currentPrice - 1000000;

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('fa-IR'));
        
        const randomChange = (Math.random() - 0.5) * 400000;
        prices.push(Math.round(basePrice + randomChange + (i / count) * 800000));
    }

    // تنظیم آخرین مقدار به قیمت فعلی
    prices[prices.length - 1] = currentPrice;

    return { labels, prices };
}

function updateChartData() {
    if (!chartInstance) {
        initChart();
        return;
    }
    const data = generateChartData(chartTimeRange);
    chartInstance.data.labels = data.labels;
    chartInstance.data.datasets[0].data = data.prices;
    chartInstance.update();
    showNotif('📊 نمودار بروزرسانی شد');
}

function toggleChartTime() {
    const ranges = ['day', 'week', 'month'];
    const currentIndex = ranges.indexOf(chartTimeRange);
    const nextIndex = (currentIndex + 1) % ranges.length;
    chartTimeRange = ranges[nextIndex];
    const labels = {
        day: '۲۴ ساعت',
        week: 'هفته',
        month: 'ماه'
    };
    showNotif(`📊 بازه تغییر کرد: ${labels[chartTimeRange]}`);
    updateChartData();
}

// صادر کردن
window.initChart = initChart;
window.updateChartData = updateChartData;
window.toggleChartTime = toggleChartTime;
