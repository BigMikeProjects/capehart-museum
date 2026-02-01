/**
 * Capehart Communications Collection
 * Virtual Museum Interactive Features
 */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {
        progressBar: document.getElementById('progressBar'),
        siteHeader: document.getElementById('siteHeader'),
        navToggle: document.getElementById('navToggle'),
        navLinks: document.getElementById('navLinks'),
        backToTop: document.getElementById('backToTop'),
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxCaption: document.getElementById('lightboxCaption'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxPrev: document.getElementById('lightboxPrev'),
        lightboxNext: document.getElementById('lightboxNext'),
        animatedElements: document.querySelectorAll('.animate-on-scroll'),
        galleryItems: document.querySelectorAll('[data-lightbox]')
    };

    // ========================================
    // State
    // ========================================
    const state = {
        currentLightboxGroup: null,
        currentLightboxIndex: 0,
        lightboxImages: [],
        isLightboxOpen: false
    };

    // ========================================
    // Utilities
    // ========================================

    /**
     * Throttle function to limit execution rate
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get scroll percentage of page
     */
    function getScrollPercentage() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    }

    // ========================================
    // Progress Bar
    // ========================================

    function updateProgressBar() {
        if (elements.progressBar) {
            elements.progressBar.style.width = getScrollPercentage() + '%';
        }
    }

    // ========================================
    // Header Scroll Effect
    // ========================================

    function updateHeaderOnScroll() {
        if (elements.siteHeader) {
            if (window.scrollY > 100) {
                elements.siteHeader.classList.add('scrolled');
            } else {
                elements.siteHeader.classList.remove('scrolled');
            }
        }
    }

    // ========================================
    // Mobile Navigation
    // ========================================

    function initMobileNav() {
        if (!elements.navToggle || !elements.navLinks) return;

        elements.navToggle.addEventListener('click', () => {
            elements.navToggle.classList.toggle('active');
            elements.navLinks.classList.toggle('active');
            document.body.style.overflow = elements.navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close nav when clicking a link
        elements.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                elements.navToggle.classList.remove('active');
                elements.navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========================================
    // Back to Top Button
    // ========================================

    function updateBackToTop() {
        if (elements.backToTop) {
            if (window.scrollY > 500) {
                elements.backToTop.classList.add('visible');
            } else {
                elements.backToTop.classList.remove('visible');
            }
        }
    }

    function initBackToTop() {
        if (!elements.backToTop) return;

        elements.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // Scroll Animations (Intersection Observer)
    // ========================================

    function initScrollAnimations() {
        if (!elements.animatedElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // ========================================
    // Lightbox
    // ========================================

    function getLightboxData(element) {
        const img = element.querySelector('img') || element;
        const caption = element.querySelector('figcaption');

        return {
            src: img.src,
            alt: img.alt,
            caption: caption ? caption.innerHTML : img.alt
        };
    }

    function collectLightboxGroup(groupName) {
        const items = document.querySelectorAll(`[data-lightbox="${groupName}"]`);
        return Array.from(items).map(item => getLightboxData(item));
    }

    function openLightbox(groupName, index) {
        state.currentLightboxGroup = groupName;
        state.lightboxImages = collectLightboxGroup(groupName);
        state.currentLightboxIndex = index;
        state.isLightboxOpen = true;

        showLightboxImage();
        elements.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Update nav visibility
        updateLightboxNav();
    }

    function closeLightbox() {
        state.isLightboxOpen = false;
        elements.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showLightboxImage() {
        const imageData = state.lightboxImages[state.currentLightboxIndex];
        if (!imageData) return;

        elements.lightboxImage.src = imageData.src;
        elements.lightboxImage.alt = imageData.alt;
        elements.lightboxCaption.innerHTML = imageData.caption;
    }

    function updateLightboxNav() {
        const hasMultiple = state.lightboxImages.length > 1;
        elements.lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
        elements.lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
    }

    function navigateLightbox(direction) {
        const total = state.lightboxImages.length;
        if (total <= 1) return;

        if (direction === 'prev') {
            state.currentLightboxIndex = (state.currentLightboxIndex - 1 + total) % total;
        } else {
            state.currentLightboxIndex = (state.currentLightboxIndex + 1) % total;
        }

        showLightboxImage();
    }

    function initLightbox() {
        if (!elements.lightbox || !elements.galleryItems.length) return;

        // Attach click handlers to all lightbox items
        elements.galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const groupName = item.dataset.lightbox;

                // Find index within this group
                const groupItems = document.querySelectorAll(`[data-lightbox="${groupName}"]`);
                const groupIndex = Array.from(groupItems).indexOf(item);

                openLightbox(groupName, groupIndex);
            });

            // Add keyboard support
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        // Close button
        elements.lightboxClose.addEventListener('click', closeLightbox);

        // Navigation buttons
        elements.lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
        elements.lightboxNext.addEventListener('click', () => navigateLightbox('next'));

        // Click outside to close
        elements.lightbox.addEventListener('click', (e) => {
            if (e.target === elements.lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!state.isLightboxOpen) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    navigateLightbox('prev');
                    break;
                case 'ArrowRight':
                    navigateLightbox('next');
                    break;
            }
        });
    }

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    // ========================================
    // Parallax Effect for Hero
    // ========================================

    function initParallax() {
        const heroBackground = document.querySelector('.hero-background img');
        if (!heroBackground) return;

        // Only apply parallax on larger screens
        if (window.innerWidth < 768) return;

        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.scrollY;
            const heroHeight = document.querySelector('.hero').offsetHeight;

            if (scrolled < heroHeight) {
                heroBackground.style.transform = `translateY(${scrolled * 0.4}px)`;
            }
        }, 16));
    }

    // ========================================
    // Active Navigation Highlighting
    // ========================================

    function initActiveNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        if (!sections.length || !navLinks.length) return;

        const observerOptions = {
            rootMargin: '-30% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // ========================================
    // Image Lazy Loading Enhancement
    // ========================================

    function initLazyLoadEnhancement() {
        // Native lazy loading is used via HTML attribute
        // This adds a fade-in effect when images load
        const images = document.querySelectorAll('img[loading="lazy"]');

        images.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';

            if (img.complete) {
                img.style.opacity = '1';
            } else {
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
            }
        });
    }

    // ========================================
    // Scroll Event Handler
    // ========================================

    const handleScroll = throttle(() => {
        updateProgressBar();
        updateHeaderOnScroll();
        updateBackToTop();
    }, 16);

    // ========================================
    // Initialize Everything
    // ========================================

    function init() {
        // Core functionality
        initMobileNav();
        initBackToTop();
        initScrollAnimations();
        initLightbox();
        initSmoothScroll();
        initActiveNavHighlight();
        initLazyLoadEnhancement();

        // Optional effects (only on capable devices)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            initParallax();
        }

        // Scroll event listener
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial state updates
        updateProgressBar();
        updateHeaderOnScroll();
        updateBackToTop();

        // Log successful initialization
        console.log('Capehart Communications Collection - Virtual Museum Initialized');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
