document.addEventListener('DOMContentLoaded', () => {
    // --- 0. SELECTORS & CONFIGURATION ---
    const IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
    const body = document.body;
    const loadingOverlay = document.getElementById('loading-overlay');
    const siteHeader = document.getElementById('site-header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenuList = document.getElementById('nav-menu-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section[id]'); // Sections directly under main
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const currentYearFooter = document.getElementById('current-year-footer');

    const animationItemsOnLoad = document.querySelectorAll('.anim-on-load');
    const animationItemsOnScroll = document.querySelectorAll('.anim-on-scroll');

    // Parallax & Tilt Configuration
    const TILT_INTENSITY = 8; // Default tilt intensity in degrees
    const PARALLAX_INTENSITY_MOUSE = 0.01; // Multiplier for mouse parallax

    // --- 1. LOADING OVERLAY ---
    if (loadingOverlay) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
                body.classList.add('page-loaded'); // For triggering entry animations
                // Trigger immediate animations for elements already visible (mainly hero)
                animationItemsOnLoad.forEach(item => {
                    if (isElementInViewport(item, false)) { // Check if visible without scroll consideration
                        animateItem(item);
                    }
                });
            }, 300); // Min display time for loader
        });
    } else {
        body.classList.add('page-loaded'); // If no loader, assume page loaded
    }

    // --- 2. SITE HEADER & NAVIGATION ---
    if (siteHeader) {
        const headerHeight = siteHeader.offsetHeight;
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > headerHeight / 2) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    if (navToggle && navMenuList) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navToggle.classList.toggle('active');
            navMenuList.classList.toggle('active');
            body.classList.toggle('no-scroll', !isExpanded);
        });

        navMenuList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenuList.classList.contains('active')) {
                    navMenuList.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    body.classList.remove('no-scroll');
                }
            });
        });
    }

    // Active nav link on scroll
    function updateActiveNavLink() {
        let currentSectionId = '';
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 30 : 90; // Offset for fixed header + buffer

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - headerOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink(); // Initial call


    // --- 3. INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ---
    function animateItem(item) {
        const delay = parseFloat(item.dataset.delay || 0) * 1000;
        setTimeout(() => {
            item.classList.add('animated');
        }, delay);
    }

    if (animationItemsOnScroll.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateItem(entry.target);
                    observerInstance.unobserve(entry.target); // Animate only once
                }
            });
        }, { threshold: 0.15 }); // Trigger when 15% of the item is visible

        animationItemsOnScroll.forEach(item => observer.observe(item));
    } else { // Fallback for older browsers or if no items to observe
        animationItemsOnScroll.forEach(item => animateItem(item)); // Animate all immediately (no scroll effect)
        animationItemsOnLoad.forEach(item => animateItem(item)); // Also ensure load items are animated if observer fails
    }


    // --- 4. MATERIALS SECTION TABS ---
    const materialTabButtons = document.querySelectorAll('.material-tab-button');
    const materialTabPanes = document.querySelectorAll('.material-tab-pane');

    if (materialTabButtons.length > 0 && materialTabPanes.length > 0) {
        materialTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Deactivate all buttons and panes
                materialTabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                materialTabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    // pane.setAttribute('hidden', ''); // Better for a11y
                });

                // Activate clicked button and corresponding pane
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                const targetPaneId = this.getAttribute('aria-controls');
                const targetPane = document.getElementById(targetPaneId);

                if (targetPane) {
                    targetPane.classList.add('active');
                    // targetPane.removeAttribute('hidden');

                    // Re-trigger animations for items within the newly activated tab content
                    const animatedItemsInTab = targetPane.querySelectorAll('.anim-on-scroll, .anim-on-load'); // Re-target items in this tab
                    animatedItemsInTab.forEach(item => {
                         item.classList.remove('animated'); // Reset animation state
                         void item.offsetHeight; // Force reflow
                         animateItem(item); // Trigger their animation
                    });
                }
            });
        });
        // Ensure first tab is active on load (if an .active class is not already set in HTML)
        if (!document.querySelector('.material-tab-button.active') && materialTabButtons.length > 0) {
            materialTabButtons[0].click();
        }
    }


    // --- 5. CARD TILT EFFECT (Elements with data-tilt attribute) ---
    const tiltableElements = document.querySelectorAll('[data-tilt]');
    if (tiltableElements.length > 0 && !IS_TOUCH_DEVICE && window.matchMedia('(min-width: 769px)').matches) { // Also disable on smaller tablets
        tiltableElements.forEach(element => {
            const intensity = parseFloat(element.dataset.tiltIntensity) || TILT_INTENSITY;
            let glareElement = element.querySelector('.card-glare-effect');
            if (!glareElement) { // Create glare if not exists
                glareElement = document.createElement('div');
                glareElement.className = 'card-glare-effect';
                element.style.position = 'relative'; // Needed for glare
                element.style.overflow = 'hidden';   // Needed for glare
                element.appendChild(glareElement);
            }

            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const { width, height } = rect;
                const rotateX = ((y / height) - 0.5) * intensity * -2;
                const rotateY = ((x / width) - 0.5) * intensity * 2;

                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
                element.style.transition = 'transform 0.1s ease-out';

                const glareX = (x / width) * 100;
                const glareY = (y / height) * 100;
                glareElement.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
                glareElement.style.opacity = '1';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                element.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                glareElement.style.opacity = '0';
                glareElement.style.transition = 'opacity 0.3s ease-out';
            });
        });
    }
     // Add this CSS for .card-glare-effect in your style.css:
     // .card-glare-effect { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
     // pointer-events: none; border-radius: inherit; opacity: 0; mix-blend-mode: overlay; }


    // --- 6. MOUSEMOVE PARALLAX (Simplified for specific elements) ---
    const parallaxScrollItems = document.querySelectorAll('[data-parallax-intensity]');
    if (parallaxScrollItems.length > 0 && !IS_TOUCH_DEVICE && window.matchMedia('(min-width: 769px)').matches) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            parallaxScrollItems.forEach(el => {
                const intensity = parseFloat(el.dataset.parallaxIntensity) || 5; // Default intensity
                const elementTop = el.offsetTop; // Get element's top position relative to document
                const speed = intensity / 100; 
                // Move element based on its position relative to viewport and scroll
                // This is a very basic parallax on scroll, needs refinement for sophisticated effects
                // A more common mousemove parallax is based on cursor position not scroll.
                // The request was "عناصر بتتحرك معاك في الحركه الخاصه بالموقع"
                // For mousemove parallax independent of sections:
                // el.style.transform = `translateY(${scrollTop * speed * 0.1}px)`;
            });
        }, { passive: true });

        // Mousemove parallax for hero shapes (if defined with data-parallax-intensity)
        const heroShapes = document.querySelectorAll('.hero-decorative-shapes .hero-shape');
         heroShapes.forEach(shape => {
            const intensity = parseFloat(shape.dataset.parallaxIntensityMouse) || 50; // Example specific intensity
            document.addEventListener('mousemove', e => {
                 const x = (window.innerWidth - e.clientX * (intensity/10)) / 100;
                 const y = (window.innerHeight - e.clientY * (intensity/10)) / 100;
                 // This needs to be combined with existing CSS animation transforms carefully.
                 // shape.style.transform = `translateX(${x}px) translateY(${y}px) /* + existing anim transforms */`;
            }, {passive: true});
         });
    }


    // --- 7. SCROLL TO TOP BUTTON ---
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 8. FOOTER: CURRENT YEAR ---
    if (currentYearFooter) {
        currentYearFooter.textContent = new Date().getFullYear();
    }

    // --- Initial active link setup after all content might have shifted layout ---
    setTimeout(updateActiveNavLink, 100); // Call after potential layout shifts

});