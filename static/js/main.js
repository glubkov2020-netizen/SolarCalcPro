// Enhanced Main JavaScript functionality for SolarCalc Pro

class SolarCalcApp {
    constructor() {
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initSmoothScroll();
        this.initCounters();
        this.initFormValidation();
        this.initThemeToggle();
        this.initLazyLoading();
        this.initPerformanceOptimization();
    }

    initMobileMenu() {
        // Enhanced mobile menu functionality
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-label', 'Toggle menu');
        
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            document.querySelector('.nav-container').appendChild(menuToggle);
            
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
                menuToggle.innerHTML = navMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
                
                // Add animation to menu items
                const menuItems = navMenu.querySelectorAll('.nav-link');
                menuItems.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.1}s`;
                    item.classList.toggle('slide-in-right');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }

    initSmoothScroll() {
        // Enhanced smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
                    
                    window.scrollTo({
                        top: offsetTop - 80, // Account for fixed navbar
                        behavior: 'smooth'
                    });
                    
                    // Add visual feedback
                    target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.3)';
                    setTimeout(() => {
                        target.style.boxShadow = '';
                    }, 1000);
                }
            });
        });
    }

    initCounters() {
        // Enhanced animated counters with progress animation
        const counters = document.querySelectorAll('.counter');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();
        const startValue = parseInt(counter.innerText) || 0;
        
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
        
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutQuart(progress);
            
            const current = Math.floor(startValue + (target - startValue) * easeProgress);
            counter.innerText = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target.toLocaleString();
                
                // Add completion animation
                counter.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    counter.style.transform = 'scale(1)';
                }, 200);
            }
        };
        
        requestAnimationFrame(updateCount);
    }

    initFormValidation() {
        // Enhanced form validation with animations
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearInputError(input);
                });
            });
            
            form.addEventListener('submit', (e) => {
                let valid = true;
                
                inputs.forEach(input => {
                    if (!this.validateInput(input)) {
                        valid = false;
                        this.shakeElement(input);
                    }
                });
                
                if (!valid) {
                    e.preventDefault();
                    this.showFormError(form, 'Пожалуйста, исправьте ошибки в форме');
                }
            });
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let message = '';
        
        if (!value) {
            isValid = false;
            message = 'Это поле обязательно для заполнения';
        } else if (input.type === 'email' && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Введите корректный email адрес';
        } else if (input.type === 'number' && input.min && parseFloat(value) < parseFloat(input.min)) {
            isValid = false;
            message = `Значение должно быть не менее ${input.min}`;
        } else if (input.type === 'number' && input.max && parseFloat(value) > parseFloat(input.max)) {
            isValid = false;
            message = `Значение должно быть не более ${input.max}`;
        }
        
        if (!isValid) {
            this.showInputError(input, message);
        } else {
            this.showInputSuccess(input);
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showInputError(input, message) {
        this.clearInputError(input);
        input.classList.add('error');
        input.classList.remove('success');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        errorElement.style.animation = 'slideInDown 0.3s ease';
        input.parentNode.appendChild(errorElement);
    }

    showInputSuccess(input) {
        this.clearInputError(input);
        input.classList.remove('error');
        input.classList.add('success');
    }

    clearInputError(input) {
        input.classList.remove('error', 'success');
        const existingError = input.parentNode.querySelector('.input-error');
        if (existingError) {
            existingError.style.animation = 'slideInUp 0.3s ease';
            setTimeout(() => {
                existingError.remove();
            }, 300);
        }
    }

    showFormError(form, message) {
        let errorElement = form.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            form.prepend(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.animation = 'shake 0.5s ease';
        
        setTimeout(() => {
            errorElement.style.animation = '';
        }, 500);
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    initThemeToggle() {
        // Theme toggle functionality
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.appendChild(themeToggle);
            
            // Check for saved theme preference or default to light
            const currentTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            this.updateThemeIcon(themeToggle, currentTheme);
            
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.updateThemeIcon(themeToggle, newTheme);
                
                // Add transition
                document.documentElement.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    document.documentElement.style.transition = '';
                }, 300);
            });
        }
        
        // Add theme styles
        this.addThemeStyles();
    }

    updateThemeIcon(button, theme) {
        button.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }

    addThemeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            [data-theme="dark"] {
                --dark-color: #f8fafc;
                --light-color: #1f2937;
                --gray-color: #d1d5db;
            }
            
            .theme-toggle {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .theme-toggle:hover {
                background: rgba(37, 99, 235, 0.1);
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    initLazyLoading() {
        // Lazy loading for images and components
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                        
                        if (element.dataset.bg) {
                            element.style.backgroundImage = `url(${element.dataset.bg})`;
                            element.removeAttribute('data-bg');
                        }
                        
                        lazyObserver.unobserve(element);
                    }
                });
            });
            
            document.querySelectorAll('[data-src], [data-bg]').forEach(element => {
                lazyObserver.observe(element);
            });
        }
    }

    initPerformanceOptimization() {
        // Performance optimizations
        this.debounceScrollEvents();
        this.throttleResizeEvents();
        this.preloadCriticalResources();
    }

    debounceScrollEvents() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Heavy scroll operations
            }, 100);
        });
    }

    throttleResizeEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(() => {
                    resizeTimeout = null;
                    // Heavy resize operations
                }, 250);
            }
        });
    }

    preloadCriticalResources() {
        // Preload critical resources
        const criticalResources = [
            '/static/css/style.css',
            '/static/js/main.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
}

// Enhanced utility functions
const SolarUtils = {
    formatNumber: (num) => new Intl.NumberFormat('ru-RU').format(num),
    
    formatCurrency: (num) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(num),
    
    debounce: (func, wait, immediate) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Add more utility functions as needed
    getRandomColor: () => {
        const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Local storage utilities
    setStorage: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Local storage error:', e);
            return false;
        }
    },
    
    getStorage: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Local storage error:', e);
            return null;
        }
    }
};

// Service Worker Registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize the enhanced application
document.addEventListener('DOMContentLoaded', function() {
    window.solarCalcApp = new SolarCalcApp();
    
    // Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Remove loading spinner if exists
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.opacity = '0';
            setTimeout(() => {
                loadingSpinner.remove();
            }, 500);
        }
    });
    
    // Error handling
    window.addEventListener('error', (e) => {
        console.error('Application error:', e.error);
        // You can add error reporting service here
    });
    
    // Online/offline detection
    window.addEventListener('online', () => {
        this.showNotification('Соединение восстановлено', 'success');
    });
    
    window.addEventListener('offline', () => {
        this.showNotification('Отсутствует интернет-соединение', 'warning');
    });
});

// Global notification system
window.showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid var(--primary-color);
                max-width: 400px;
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .notification-success {
                border-left-color: var(--success-color);
            }
            
            .notification-warning {
                border-left-color: var(--secondary-color);
            }
            
            .notification-error {
                border-left-color: var(--danger-color);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .notification-close:hover {
                background: rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Close on button click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
};