// Solar Calculator functionality
class SolarCalculator {
    constructor() {
        this.currentChart = null;
        this.currentCalculationId = null;
        this.initEventListeners();
        this.initRangeInputs();
        this.initTabs();
    }

    initEventListeners() {
        const form = document.getElementById('solarForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateSolar();
            });
        }
    }

    initRangeInputs() {
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            const valueDisplay = input.nextElementSibling?.querySelector('span');
            if (valueDisplay) {
                valueDisplay.textContent = input.value;
                
                input.addEventListener('input', () => {
                    valueDisplay.textContent = input.value;
                });
            }
        });
    }

    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                const tabName = button.getAttribute('data-tab');
                const tabContent = document.getElementById(`${tabName}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }

    async calculateSolar() {
        const form = document.getElementById('solarForm');
        if (!form) {
            console.error('Форма не найдена');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Добавляем недостающие поля для базового калькулятора
        data.inverter_type = 'string'; // значение по умолчанию
        data.battery_type = 'lifepo4'; // значение по умолчанию  
        data.battery_capacity = '0'; // нет аккумуляторов в базовом
        data.azimuth = '0'; // значение по умолчанию
        data.installation_cost = '50000'; // значение по умолчанию
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.currentCalculationId = result.calculation_id;
                this.displayResults(result.data);
            } else {
                this.showError('Ошибка расчета: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('Ошибка соединения: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(data) {
        if (!data || !data.technical) {
            this.showError('Некорректные данные от сервера');
            return;
        }

        // Основные технические показатели
        this.setElementText('total-power', data.technical.total_power + ' Вт');
        this.setElementText('annual-generation', this.formatNumber(data.technical.annual_generation) + ' кВт·ч');
        this.setElementText('system-efficiency', data.technical.system_efficiency + '%');
        this.setElementText('total-area', data.technical.total_area + ' м²');

        // Экономические показатели
        this.setElementText('total-cost', this.formatNumber(data.economic.total_cost) + ' руб');
        this.setElementText('annual-savings', this.formatNumber(data.economic.annual_savings) + ' руб');
        this.setElementText('payback-years', data.economic.payback_years);
        this.setElementText('roi-25years', data.economic.roi_25years + '%');

        // Экологические показатели
        this.setElementText('co2-saved', this.formatNumber(data.environmental.co2_saved_annual) + ' кг');
        this.setElementText('trees-equivalent', this.formatNumber(data.environmental.trees_equivalent));

        // Графики
        if (data.monthly_generation) {
            this.renderMonthlyChart(data.monthly_generation);
        }
        
        this.showResults();
    }

    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    renderMonthlyChart(monthlyData) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        const canvasCtx = ctx.getContext('2d');
        if (!canvasCtx) return;
        
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        
        this.currentChart = new Chart(canvasCtx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Выработка (кВт·ч)',
                    data: monthlyData,
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1,
                    borderRadius: 8,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Выработка электроэнергии по месяцам',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'кВт·ч'
                        }
                    }
                }
            }
        });
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        if (loading) loading.style.display = 'block';
        if (results) results.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    showResults() {
        const results = document.getElementById('results');
        if (results) {
            results.style.display = 'block';
            results.classList.add('slide-in-left');
        }
    }

    showError(message) {
        alert(message);
        console.error('SolarCalculator Error:', message);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(Math.round(num));
    }
}

// Глобальные функции для кнопок
function saveCalculation() {
    if (!window.solarCalculator?.currentCalculationId) {
        alert('Сначала выполните расчет!');
        return;
    }
    alert('Расчет сохранен в историю! ID: ' + window.solarCalculator.currentCalculationId);
}

function exportCalculation() {
    if (!window.solarCalculator?.currentCalculationId) {
        alert('Сначала выполните расчет!');
        return;
    }
    window.open(`/api/export-pdf/${window.solarCalculator.currentCalculationId}`, '_blank');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.solarCalculator = new SolarCalculator();
});
