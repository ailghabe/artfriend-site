// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {

    // ==== MOBILE MENU TOGGLE ====
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active'); // Toggles the .active class set in CSS
            // For accessibility: toggle aria-expanded attribute
            const isExpanded = mainNav.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            // Change icon on toggle (optional)
            if (isExpanded) {
                mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>'; // Change to X icon
                mobileMenuToggle.setAttribute('aria-label', 'إغلاق القائمة');
            } else {
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Change back to bars icon
                mobileMenuToggle.setAttribute('aria-label', 'فتح القائمة');
            }
        });
    }

    // ==== HEADER SCROLL EFFECT ====
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) { // Adjust scroll distance as needed
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ==== BACK TO TOP BUTTON ====
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) { // Show button after 300px scroll
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Smooth scroll to top on click (alternative to href="#hero")
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior if using <a>
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==== UPDATE FOOTER YEAR ====
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // ==== ACTIVE NAVIGATION LINK ON SCROLL (Intersection Observer API) ====
    const sections = document.querySelectorAll('section[id]'); // Get all sections with an ID
    const navLinks = document.querySelectorAll('#main-nav .nav-link'); // Get all nav links

    if (sections.length > 0 && navLinks.length > 0) {
        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '0px',
            threshold: 0.5 // 50% of section is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        // Check href against sectionId. For links like #about .contact-details-wrapper, we need to be more specific or simplify the href
                        if (link.getAttribute('href') === `#${sectionId}` || (sectionId === 'about' && link.classList.contains('contact-anchor'))) {
                            link.classList.add('active');
                        } else if (link.getAttribute('href').startsWith(`#${sectionId}`) && sectionId !== 'hero') {
                            // Handles cases where href might be more specific like "#materials .some-sub-part"
                            // and you want the main "materials" link to be active.
                            // This needs careful consideration based on your exact nav structure.
                            // For simplicity, the primary check is `link.getAttribute('href') === #${sectionId}`
                        }
                    });
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => {
            observer.observe(section);
        });
        
        // Special handling for nav links that point to sub-elements of a section
        // Example: "اتصل بنا" link in nav should make "من نحن" section link active if needed.
        // The current CSS handles this via `.nav-link.active::after`.
        // If "اتصل بنا" itself should show the active state, adjust the conditions in observerCallback.
        // The .contact-anchor logic is a basic attempt.
    }

    // Smooth scroll for all internal links (optional enhancement)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            // Exclude simple "#" links or non-ID targets.
            if (hrefAttribute.length > 1 && document.querySelector(hrefAttribute)) {
                e.preventDefault();
                const targetElement = document.querySelector(hrefAttribute);
                if (targetElement) {
                    let offset = 0;
                    if (hrefAttribute !== "#hero"){ // Don't offset for hero as header is already accounted for by padding-top
                       offset = document.getElementById('main-header') ? document.getElementById('main-header').offsetHeight : 80;
                    }

                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open after clicking a link
                    if (mainNav && mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        mobileMenuToggle.setAttribute('aria-label', 'فتح القائمة');
                    }
                }
            }
        });
    });

}); // End of DOMContentLoaded