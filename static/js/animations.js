// Enhanced animations for SolarCalc Pro with advanced dark theme
class SolarAnimations {
    constructor() {
        this.initScrollAnimations();
        this.initFloatingElements();
        this.initButtonEffects();
        this.initCursorEffects();
        this.initParallaxEffects();
        this.initTypewriter();
        this.initPageTransitions();
        this.initStarfield();
        this.initThemeAnimations();
    }

    initScrollAnimations() {
        // Enhanced scroll animations with staggered effects
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Add staggered animation for child elements
                    const staggerItems = entry.target.querySelectorAll('.stagger-item');
                    staggerItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe all elements with animation
        document.querySelectorAll('.feature-card, .result-card, .stat, .component-section, .advantage-card').forEach(el => {
            observer.observe(el);
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    initFloatingElements() {
        // Dynamic creation of enhanced floating elements
        this.createFloatingElements();
    }

    createFloatingElements() {
        const icons = ['fa-sun', 'fa-solar-panel', 'fa-battery-full', 'fa-bolt', 'fa-leaf', 'fa-wind', 'fa-cloud', 'fa-recycle'];
        const container = document.querySelector('.floating-elements');
        
        // Clear existing elements
        container.innerHTML = '';
        
        // Create enhanced floating elements
        for (let i = 0; i < 15; i++) {
            const icon = document.createElement('div');
            icon.className = 'floating-icon';
            icon.innerHTML = `<i class="fas ${icons[Math.floor(Math.random() * icons.length)]}"></i>`;
            
            // Random properties with enhanced ranges
            const left = Math.random() * 85 + 5;
            const top = Math.random() * 85 + 5;
            const delay = Math.random() * 8;
            const duration = 8 + Math.random() * 8;
            const size = 1 + Math.random() * 2;
            const rotation = Math.random() * 360;
            
            icon.style.left = `${left}%`;
            icon.style.top = `${top}%`;
            icon.style.animationDelay = `${delay}s`;
            icon.style.animationDuration = `${duration}s`;
            icon.style.fontSize = `${size}rem`;
            icon.style.transform = `rotate(${rotation}deg)`;
            
            // Add random color variation
            const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            icon.style.color = randomColor;
            
            container.appendChild(icon);
        }
    }

    initStarfield() {
        // Create starfield for dark theme
        const starfield = document.createElement('div');
        starfield.className = 'starfield';
        document.body.appendChild(starfield);

        // Create stars
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 2 + Math.random() * 3;
            
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            star.style.animationDelay = `${delay}s`;
            star.style.animationDuration = `${duration}s`;
            
            // Add twinkling effect
            star.style.animation = `twinkle ${duration}s ease-in-out ${delay}s infinite alternate`;
            
            starfield.appendChild(star);
        }

        // Create occasional meteors
        this.createMeteors();
    }

    createMeteors() {
        setInterval(() => {
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                const meteor = document.createElement('div');
                meteor.className = 'meteor';
                
                meteor.style.cssText = `
                    position: fixed;
                    width: 2px;
                    height: 2px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 10px 2px white;
                    animation: meteor 1s linear forwards;
                    z-index: -1;
                `;
                
                const startX = Math.random() * 100;
                const startY = Math.random() * 50;
                
                meteor.style.left = `${startX}%`;
                meteor.style.top = `${startY}%`;
                
                document.body.appendChild(meteor);
                
                setTimeout(() => {
                    meteor.remove();
                }, 1000);
            }
        }, 3000);
    }

    initThemeAnimations() {
        // Enhanced theme transition animations
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // Add transition class to body
                document.body.classList.add('theme-transition');
                
                // Remove transition class after animation
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 500);
                
                // Update floating elements for new theme
                setTimeout(() => {
                    this.updateFloatingElementsForTheme();
                }, 100);
            });
        }
    }

    updateFloatingElementsForTheme() {
        const floatingIcons = document.querySelectorAll('.floating-icon');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        floatingIcons.forEach(icon => {
            if (isDark) {
                icon.style.opacity = '0.15';
                icon.style.filter = 'drop-shadow(var(--neon-orange)) brightness(1.2)';
            } else {
                icon.style.opacity = '0.1';
                icon.style.filter = 'drop-shadow(var(--neon-orange))';
            }
        });
    }

    initButtonEffects() {
        // Enhanced button effects with ripple and magnetic effects
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            // Ripple effect
            button.addEventListener('mouseenter', (e) => {
                this.createRipple(e);
                this.createMagneticEffect(e);
            });
            
            button.addEventListener('click', (e) => {
                this.createClickEffect(e);
                this.createParticleEffect(e);
            });

            // Magnetic effect
            button.addEventListener('mousemove', (e) => {
                this.createMagneticEffect(e);
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    }

    initCursorEffects() {
        // Custom cursor effects
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        const follower = document.createElement('div');
        follower.className = 'cursor-follower';
        document.body.appendChild(follower);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 100);
        });

        // Interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .btn, .card, .feature-card');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
                follower.classList.add('cursor-hover');
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
                follower.classList.remove('cursor-hover');
            });
        });

        // Add cursor styles
        this.addCursorStyles();
    }

    addCursorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                width: 8px;
                height: 8px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: 
                    transform 0.1s ease,
                    background-color 0.3s ease;
                mix-blend-mode: difference;
            }
            
            .cursor-follower {
                position: fixed;
                width: 40px;
                height: 40px;
                border: 2px solid var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transition: 
                    all 0.2s ease,
                    border-color 0.3s ease;
                mix-blend-mode: difference;
            }
            
            .cursor-hover {
                transform: scale(1.5);
                background: var(--secondary-color);
            }
            
            .cursor-follower.cursor-hover {
                transform: scale(1.2);
                border-color: var(--secondary-color);
                background: rgba(245, 158, 11, 0.1);
            }

            .meteor {
                position: fixed;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 10px 2px white;
                animation: meteor 1s linear forwards;
                z-index: -1;
            }

            @keyframes meteor {
                0% {
                    transform: translateX(0) translateY(0) rotate(45deg);
                    opacity: 1;
                }
                100% {
                    transform: translateX(500px) translateY(500px) rotate(45deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initParallaxEffects() {
        // Parallax scrolling effects
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            // Floating elements parallax
            const floatingIcons = document.querySelectorAll('.floating-icon');
            floatingIcons.forEach((icon, index) => {
                const speed = 0.1 + (index * 0.02);
                icon.style.transform = `translateY(${scrolled * speed}px) rotate(${icon.style.transform ? parseFloat(icon.style.transform.split('rotate(')[1]) || 0 : 0}deg)`;
            });

            // Starfield parallax for dark theme
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                const stars = document.querySelectorAll('.star');
                stars.forEach((star, index) => {
                    const speed = 0.05 + (index * 0.005);
                    star.style.transform = `translateY(${scrolled * speed}px)`;
                });
            }
        });
    }

    initTypewriter() {
        // Typewriter effect for headings
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.width = '0';
            
            setTimeout(() => {
                let i = 0;
                const timer = setInterval(() => {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(timer);
                        element.style.borderRight = 'none';
                    }
                }, 100);
            }, 1000);
        });
    }

    initPageTransitions() {
        // Smooth page transitions
        const links = document.querySelectorAll('a[href^="/"], a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                } else {
                    // Add page transition
                    e.preventDefault();
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.3s ease';
                    
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 300);
                }
            });
        });
    }

    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }

    createMagneticEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) * 0.1;
        const deltaY = (y - centerY) * 0.1;
        
        button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    createClickEffect(event) {
        const button = event.currentTarget;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    createParticleEffect(event) {
        const button = event.currentTarget;
        const particles = 8;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (i / particles) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            const size = 3 + Math.random() * 5;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = getComputedStyle(button).backgroundColor;
            particle.style.borderRadius = '50%';
            particle.style.position = 'absolute';
            particle.style.pointerEvents = 'none';
            
            const rect = button.getBoundingClientRect();
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            
            document.body.appendChild(particle);
            
            const animation = particle.animate([
                {
                    transform: `translate(0, 0) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * 50}px, ${Math.sin(angle) * 50}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            animation.onfinish = () => particle.remove();
        }
    }
}

// Enhanced Particle system for hero section with theme support
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.querySelector('.hero');
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
        this.initMouseTracking();
    }

    initMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    createParticles() {
        for (let i = 0; i < 25; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'energy-particle';
        
        // Random properties
        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const animationDuration = 4 + Math.random() * 6;
        const animationDelay = Math.random() * 8;
        
        // Theme-based colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const colors = isDark 
            ? ['#60a5fa', '#fbbf24', '#34d399', '#a78bfa']
            : ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
        
        this.container.appendChild(particle);
        
        return {
            element: particle,
            left: left,
            speed: 0.8 + Math.random() * 1.5,
            size: size,
            oscillation: Math.random() * 2 - 1,
            color: color
        };
    }

    animate() {
        this.particles.forEach(particle => {
            const currentTop = parseFloat(particle.element.style.top) || -10;
            const newTop = currentTop + particle.speed;
            
            // Mouse interaction
            const rect = particle.element.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(particleX - this.mouse.x, 2) + 
                Math.pow(particleY - this.mouse.y, 2)
            );
            
            if (distance < 100) {
                const angle = Math.atan2(particleY - this.mouse.y, particleX - this.mouse.x);
                particle.element.style.left = `${parseFloat(particle.element.style.left) + Math.cos(angle) * 2}%`;
            }
            
            // Oscillation
            particle.element.style.left = `${particle.left + Math.sin(newTop * 0.02) * particle.oscillation}%`;
            
            if (newTop > 100) {
                particle.element.style.top = '-10px';
                particle.left = Math.random() * 100;
                
                // Update color based on theme
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const colors = isDark 
                    ? ['#60a5fa', '#fbbf24', '#34d399', '#a78bfa']
                    : ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
                
                const newColor = colors[Math.floor(Math.random() * colors.length)];
                particle.element.style.background = newColor;
                particle.element.style.boxShadow = `0 0 10px ${newColor}, 0 0 20px ${newColor}`;
            } else {
                particle.element.style.top = `${newTop}%`;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    window.solarAnimations = new SolarAnimations();
    
    // Initialize particle system only on hero section
    if (document.querySelector('.hero')) {
        window.particleSystem = new ParticleSystem();
    }
    
    // Add enhanced styles
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        .energy-particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            top: -10px;
            filter: blur(1px);
            transition: all 0.3s ease;
        }
        
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
        }
        
        .animate-in {
            animation: slideInUp 0.8s ease-out forwards;
        }
        
        body {
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        
        /* Enhanced focus styles */
        *:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        /* Selection styles */
        ::selection {
            background: rgba(37, 99, 235, 0.3);
            color: inherit;
        }
        
        /* Scrollbar styles */
        ::-webkit-scrollbar {
            width: 12px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--glass-light);
            border-radius: 6px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 6px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--secondary-color);
        }
        
        /* Theme transition enhancements */
        .theme-transition * {
            transition: 
                background-color 0.5s ease,
                color 0.5s ease,
                border-color 0.5s ease,
                box-shadow 0.5s ease !important;
        }
    `;
    document.head.appendChild(enhancedStyles);
});