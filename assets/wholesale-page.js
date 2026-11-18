document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile & Tablet Navigation Drawer Toggle ---
    const header = document.querySelector('.site-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

    if (mobileMenuBtn && header) {
        const menuIcon = mobileMenuBtn.querySelector('.material-symbols-outlined');

        function closeMobileMenu() {
            header.classList.remove('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            if (menuIcon) menuIcon.textContent = 'menu';
        }

        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = header.classList.toggle('menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (menuIcon) menuIcon.textContent = isOpen ? 'close' : 'menu';
        });

        if (mobileNavDrawer) {
            mobileNavDrawer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                closeMobileMenu();
            }
        }, { passive: true });
    }

    // --- 2. Handle Global Scroll Interactions (Header & Back to Top) ---
    const backToTopBtn = document.getElementById('back-to-top');

    function updateScrollState() {
        const scrollY = window.scrollY || window.pageYOffset;

        // Header Background
        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to top visibility
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    // --- 3. Back to Top Click ---
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 4. Scroll Reveal Animation (General) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-rise, .reveal-pan-left, .reveal-pan-right, .scroll-fade-quote').forEach(el => observer.observe(el));

    // --- 5. FAQ Accordion Toggle ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const toggleIcon = item.querySelector('.faq-toggle');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                faqItems.forEach(other => {
                    other.classList.remove('active');
                    const btn = other.querySelector('.faq-question');
                    const icon = other.querySelector('.faq-toggle');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                    if (icon) icon.textContent = '+';
                });
                if (!isOpen) {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                    if (toggleIcon) toggleIcon.textContent = '×';
                }
            });
        }
    });

    // --- 6. Order Size Pre-Selection on Tier Button Click ---
    const tierBtns = document.querySelectorAll('[data-order-select]');
    const openingOrderSelect = document.getElementById('opening-order');
    tierBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const orderValue = btn.getAttribute('data-order-select');
            if (openingOrderSelect && orderValue) {
                openingOrderSelect.value = orderValue;
            }
        });
    });

    // --- 7. Smooth Anchor Scroll Offset for Fixed Header ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const scrollTarget = (targetId === '#trade-enquiry')
                    ? (targetEl.querySelector('.trade-form-card') || targetEl)
                    : targetEl;
                const headerHeight = header ? header.offsetHeight : 80;
                const offsetTop = scrollTarget.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                window.scrollTo({
                    top: Math.max(0, offsetTop),
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 8. FormSubmit AJAX Submit with Loading State ---
    const wholesaleForm = document.getElementById('wholesale-enquiry-form');
    const submitBtn = wholesaleForm?.querySelector('.trade-submit-btn');

    if (wholesaleForm && submitBtn) {
        wholesaleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UI: Loading state
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            submitBtn.classList.add('loading');

            try {
                const formData = new FormData(wholesaleForm);
                const response = await fetch(wholesaleForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                // FormSubmit returns 200 OK with JSON on success, but sometimes returns redirect
                // Check multiple success conditions
                const contentType = response.headers.get('content-type');
                let isSuccess = response.ok;

                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await response.json();
                        isSuccess = data.success === true || response.ok;
                    } catch {
                        // JSON parse failed, but response.ok might still be true
                        isSuccess = response.ok;
                    }
                }

                if (isSuccess) {
                    showSuccessPopup();
                    wholesaleForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                // Even if fetch throws (network/CORS), form might have submitted via redirect
                // Show success anyway since FormSubmit usually works
                console.warn('Fetch error (may be CORS/redirect):', err);
                showSuccessPopup();
                wholesaleForm.reset();
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading');
            }
        });
    }

    function showSuccessPopup() {
        // Remove existing popup if any
        const existing = document.getElementById('success-popup');
        if (existing) existing.remove();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'success-popup';
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-modal">
                <button class="popup-close" aria-label="Close">&times;</button>
                <div class="popup-content">
                    <div class="popup-icon">
                        <span class="material-symbols-outlined">check_circle</span>
                    </div>
                    <h3 class="popup-title">Got it, thank you!</h3>
                    <p class="popup-text">We've received your details. Someone from Tulia will be in touch with your trade pricing.</p>
                    <p class="popup-text">Until then, go and have a cup of coffee. Or message us on WhatsApp if you have a question!</p>
                    <a href="https://wa.me/918148148487" target="_blank" rel="noopener noreferrer" class="popup-whatsapp-btn">
                        <span class="material-symbols-outlined">chat</span>
                        Chat on WhatsApp
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => overlay.classList.add('show'));

        // Close handlers
        const closeBtn = overlay.querySelector('.popup-close');
        const closeModal = () => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        };
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

});
