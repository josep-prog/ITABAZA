/**
 * Responsive Utilities for iTABAZA
 * Handles mobile navigation, responsive adaptations, and device-specific optimizations
 */

class ResponsiveManager {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.handleResize();
    }

    init() {
        this.createMobileMenuToggle();
        this.optimizeForDevice();
        this.handleOrientationChange();
    }

    createMobileMenuToggle() {
        // Wait for DOM to be ready
        const initMenu = () => {
            // Create hamburger menu if it doesn't exist
            if (!document.getElementById('hamb')) {
                const navbar = document.getElementById('nav-cont');
                if (navbar) {
                    const hambIcon = document.createElement('div');
                    hambIcon.id = 'hamb';
                    hambIcon.innerHTML = '<i class="fas fa-bars"></i>';
                    hambIcon.style.cssText = `
                        display: none;
                        cursor: pointer;
                        color: white;
                        font-size: 1.5rem;
                        padding: 0.5rem;
                        order: 1;
                    `;
                    
                    // Insert hamburger as first child after logo
                    const navLogo = document.getElementById('nav-logo');
                    if (navLogo && navLogo.nextSibling) {
                        navbar.insertBefore(hambIcon, navLogo.nextSibling);
                    } else {
                        navbar.appendChild(hambIcon);
                    }
                }
            }

            // Add click event to hamburger menu
            const hambMenu = document.getElementById('hamb');
            const navMenu = document.getElementById('nav-menu');
            
            if (hambMenu && navMenu) {
                // Remove existing listeners to prevent duplicates
                hambMenu.replaceWith(hambMenu.cloneNode(true));
                const newHambMenu = document.getElementById('hamb');
                
                newHambMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navMenu.classList.toggle('show');
                    this.toggleMenuIcon(newHambMenu);
                });

                // Close menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (!newHambMenu.contains(e.target) && !navMenu.contains(e.target)) {
                        navMenu.classList.remove('show');
                        this.resetMenuIcon(newHambMenu);
                    }
                });

                // Close menu when clicking on menu items
                const menuItems = navMenu.querySelectorAll('li');
                menuItems.forEach(item => {
                    item.addEventListener('click', () => {
                        navMenu.classList.remove('show');
                        this.resetMenuIcon(newHambMenu);
                    });
                });
            }
        };
        
        // Try to initialize immediately, or wait for navbar to load
        if (document.getElementById('nav-cont')) {
            initMenu();
        } else {
            // Wait for navbar to be loaded by navbar.js
            setTimeout(initMenu, 100);
        }
    }

    toggleMenuIcon(hambMenu) {
        const icon = hambMenu.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    resetMenuIcon(hambMenu) {
        const icon = hambMenu.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }

    optimizeForDevice() {
        // Detect device type and apply optimizations
        const isMobile = this.isMobileDevice();
        const isTablet = this.isTabletDevice();
        
        if (isMobile) {
            this.applyMobileOptimizations();
        } else if (isTablet) {
            this.applyTabletOptimizations();
        } else {
            this.applyDesktopOptimizations();
        }
    }

    isMobileDevice() {
        return window.innerWidth <= 767 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isTabletDevice() {
        return window.innerWidth >= 768 && window.innerWidth <= 1023;
    }

    applyMobileOptimizations() {
        // Optimize images for mobile
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
        });

        // Optimize touch targets
        this.optimizeTouchTargets();
        
        // Apply mobile-specific styles
        document.body.classList.add('mobile-device');
    }

    applyTabletOptimizations() {
        // Tablet-specific optimizations
        document.body.classList.add('tablet-device');
        
        // Optimize for landscape/portrait
        this.handleTabletOrientation();
    }

    applyDesktopOptimizations() {
        // Desktop-specific optimizations
        document.body.classList.add('desktop-device');
    }

    optimizeTouchTargets() {
        // Ensure buttons and links are appropriately sized for touch
        const touchElements = document.querySelectorAll('button, a, input[type="submit"], input[type="button"]');
        
        touchElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.height < 44) {
                element.style.minHeight = '44px';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }
        });
    }

    handleTabletOrientation() {
        const handleOrientation = () => {
            if (window.orientation === 90 || window.orientation === -90) {
                document.body.classList.add('landscape');
                document.body.classList.remove('portrait');
            } else {
                document.body.classList.add('portrait');
                document.body.classList.remove('landscape');
            }
        };

        window.addEventListener('orientationchange', handleOrientation);
        handleOrientation(); // Apply immediately
    }

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
                this.optimizeForDevice();
            }, 100);
        });
    }

    handleResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.optimizeForDevice();
                this.adjustLayoutForViewport();
            }, 250);
        });
    }

    adjustLayoutForViewport() {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Adjust container heights for mobile browsers with varying viewport heights
        if (this.isMobileDevice()) {
            document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
        }

        // Adjust grid layouts based on available space
        this.adjustGridLayouts(viewportWidth);
    }

    adjustGridLayouts(viewportWidth) {
        const featureCont = document.getElementById('feature-cont');
        const consultBody = document.getElementById('consult-body');
        const doctorsCont = document.getElementById('doctors-cont');

        if (featureCont) {
            this.adjustGridColumns(featureCont, viewportWidth);
        }
        
        if (consultBody) {
            this.adjustGridColumns(consultBody, viewportWidth);
        }
        
        if (doctorsCont) {
            this.adjustGridColumns(doctorsCont, viewportWidth);
        }
    }

    adjustGridColumns(element, viewportWidth) {
        const baseColumns = {
            'feature-cont': 5,
            'consult-body': 5,
            'doctors-cont': 2
        };

        const elementId = element.id;
        const base = baseColumns[elementId] || 2;

        let columns;
        if (viewportWidth >= 1400) {
            columns = base;
        } else if (viewportWidth >= 1200) {
            columns = Math.max(1, base - 1);
        } else if (viewportWidth >= 1024) {
            columns = Math.max(1, base - 2);
        } else if (viewportWidth >= 768) {
            columns = elementId === 'doctors-cont' ? 1 : Math.max(1, base - 2);
        } else if (viewportWidth >= 576) {
            columns = elementId === 'feature-cont' || elementId === 'consult-body' ? 2 : 1;
        } else {
            columns = 1;
        }

        element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    setupEventListeners() {
        // Performance optimization for scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                    scrollTimeout = null;
                }, 16); // ~60fps
            }
        });

        // Handle form inputs on mobile
        this.optimizeFormInputs();
    }

    handleScroll() {
        // Optimize scroll performance
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show navbar on scroll for mobile
        if (this.isMobileDevice()) {
            this.handleMobileNavbarScroll(scrollTop);
        }
    }

    handleMobileNavbarScroll(scrollTop) {
        const navbar = document.getElementById('navbar');
        const lastScrollTop = this.lastScrollTop || 0;

        if (navbar && scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        this.lastScrollTop = scrollTop;
    }

    optimizeFormInputs() {
        // Prevent zoom on input focus for iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (parseFloat(getComputedStyle(input).fontSize) < 16) {
                    input.style.fontSize = '16px';
                }
            });
        }
    }

    // Utility methods for responsive image handling
    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    // Table responsiveness helper
    makeTablesResponsive() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    // Initialize touch gestures for mobile
    initTouchGestures() {
        let startY = 0;
        let startX = 0;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (this.isMobileDevice()) {
                const currentY = e.touches[0].clientY;
                const currentX = e.touches[0].clientX;
                const deltaY = startY - currentY;
                const deltaX = startX - currentX;

                // Handle pull-to-refresh prevention if needed
                if (deltaY < -100 && window.pageYOffset === 0) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }
}

// Initialize responsive manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const responsiveManager = new ResponsiveManager();
    
    // Make it globally accessible for debugging
    window.responsiveManager = responsiveManager;
    
    // Setup additional responsive features
    setTimeout(() => {
        responsiveManager.setupResponsiveImages();
        responsiveManager.makeTablesResponsive();
        responsiveManager.initTouchGestures();
    }, 100);
});

// Handle page visibility change (mobile optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause non-essential processes when page is hidden
        console.log('Page hidden - pausing non-essential processes');
    } else {
        // Resume processes when page becomes visible
        console.log('Page visible - resuming processes');
    }
});

export default ResponsiveManager;
