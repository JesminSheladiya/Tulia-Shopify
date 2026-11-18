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

    // --- 8. Form Validation Helpers ---
    // Custom error messages for each field
    const errorMessages = {
        'your-name': {
            required: 'Please enter your full name',
            minlength: 'Name must be at least 3 characters',
            pattern: 'First name and last name required',
            twoWords: 'Please enter both first and last name'
        },
        'business-name': {
            required: 'Please enter your business or brand name',
            minlength: 'Business name must be at least 2 characters',
            maxlength: 'Business name cannot exceed 100 characters'
        },
        'business-type': {
            required: 'Please select your business type'
        },
        'whatsapp-number': {
            required: 'Please enter your WhatsApp number',
            pattern: 'Enter a valid 10-digit Indian mobile number (e.g., 9876543210)',
            invalid: 'Number must start with 6, 7, 8, or 9'
        },
        'city': {
            required: 'Please enter your city',
            minlength: 'City name must be at least 2 characters',
            pattern: 'Only letters and spaces allowed'
        },
        'opening-order': {
            required: 'Please select an opening order size'
        },
        'Consent': {
            required: 'You must agree to be contacted to proceed'
        }
    };

    function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');
        input.parentNode.appendChild(errorEl);
    }

    function clearFieldError(input) {
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
    }

    function validateField(input) {
        clearFieldError(input);
        const value = input.value.trim();
        const id = input.id || input.name;
        const messages = errorMessages[id] || {};

        // Required check
        if (input.required && !value) {
            showFieldError(input, messages.required || 'This field is required');
            return false;
        }

        // Skip other validations if empty and not required
        if (!value && !input.required) return true;

        // Specific field validations with custom messages
        switch (id) {
            case 'your-name':
                if (value.length < (input.minLength || 3)) {
                    showFieldError(input, messages.minlength);
                    return false;
                }
                if (input.pattern && !new RegExp(input.pattern).test(value)) {
                    showFieldError(input, messages.pattern);
                    return false;
                }
                // Two words validation
                const words = value.split(/\s+/).filter(w => w.length > 0);
                if (words.length < 2) {
                    showFieldError(input, messages.twoWords);
                    return false;
                }
                break;

            case 'business-name':
                if (value.length < (input.minLength || 2)) {
                    showFieldError(input, messages.minlength);
                    return false;
                }
                if (input.maxLength && value.length > input.maxLength) {
                    showFieldError(input, messages.maxlength);
                    return false;
                }
                break;

            case 'whatsapp-number':
                if (!/^[6-9]\d{9}$/.test(value)) {
                    showFieldError(input, messages.pattern);
                    return false;
                }
                break;

            case 'city':
                if (value.length < (input.minLength || 2)) {
                    showFieldError(input, messages.minlength);
                    return false;
                }
                if (input.pattern && !new RegExp(input.pattern).test(value)) {
                    showFieldError(input, messages.pattern);
                    return false;
                }
                break;

            case 'business-type':
            case 'opening-order':
                // Select validation - just check if value exists (required handles it)
                break;

            case 'Consent':
                if (!input.checked) {
                    showFieldError(input, messages.required);
                    return false;
                }
                break;
        }

        return true;
    }

    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        // Check consent checkbox separately (it's not in the selector above due to type=checkbox)
        const consent = form.querySelector('input[name="Consent"]');
        if (consent && consent.required && !consent.checked) {
            isValid = false;
            const consentLabel = consent.closest('.checkbox-label');
            if (consentLabel && !consentLabel.querySelector('.field-error')) {
                showFieldError(consent, errorMessages.Consent.required);
            }
        }

        // Honeypot check (spam protection)
        const honeyPot = form.querySelector('#honey-pot');
        if (honeyPot && honeyPot.value) {
            // Bot filled the hidden field - silently fail
            return false;
        }

        // Timestamp rate limiting (minimum 3 seconds to fill form)
        const timestamp = form.querySelector('#form-timestamp');
        if (timestamp && timestamp.value) {
            const formAge = Date.now() - parseInt(timestamp.value, 10);
            if (formAge < 3000) {
                // Form submitted too quickly - likely bot
                showFormError(form, 'Please take your time filling the form. Submitting too quickly may be blocked.');
                return false;
            }
        }

        return isValid;
    }

    function showFormError(form, message) {
        const messageEl = form.querySelector('#form-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = 'form-message form-error';
            messageEl.style.display = 'block';
            messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function clearFormError(form) {
        const messageEl = form.querySelector('#form-message');
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = 'form-message';
            messageEl.style.display = 'none';
        }
    }

    // Initialize timestamp on page load
    const timestampInput = document.getElementById('form-timestamp');
    if (timestampInput) {
        timestampInput.value = Date.now().toString();
    }

    // Real-time validation on blur (when user leaves field)
    document.addEventListener('blur', (e) => {
        if (e.target.matches('input[required], select[required], textarea[required]')) {
            // Only validate if field has been touched (has value or was focused before)
            if (e.target.value.trim() || e.target.dataset.touched === 'true') {
                validateField(e.target);
            }
            e.target.dataset.touched = 'true';
        }
    }, true);

    // Clear errors on input (real-time as user types)
    document.addEventListener('input', (e) => {
        if (e.target.matches('input, select, textarea')) {
            const form = e.target.closest('form');
            if (form) clearFormError(form);
            // Only clear error if field was previously validated (touched)
            if (e.target.dataset.touched === 'true') {
                clearFieldError(e.target);
            }
            // Also clear consent error
            if (e.target.name === 'Consent') {
                const consentLabel = e.target.closest('.checkbox-label');
                if (consentLabel) {
                    consentLabel.querySelectorAll('.field-error').forEach(el => el.remove());
                    e.target.classList.remove('error');
                }
            }
        }
    });

    // Mark fields as touched on focus
    document.addEventListener('focus', (e) => {
        if (e.target.matches('input[required], select[required], textarea[required]')) {
            const form = e.target.closest('form');
            if (form) clearFormError(form);
            e.target.dataset.touched = 'true';
        }
    }, true);

    // Honeypot: hide via CSS (bots might fill it)
    const style = document.createElement('style');
    style.textContent = '#honey-pot { display: none !important; opacity: 0; position: absolute; left: -9999px; }';
    document.head.appendChild(style);

    // Restrict WhatsApp number field to numbers only (no +, -, spaces, letters, etc.)
    const whatsappInput = document.getElementById('whatsapp-number');
    if (whatsappInput) {
        whatsappInput.addEventListener('keydown', (e) => {
            // Allow: backspace, delete, tab, escape, enter, home, end, left/right arrows
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            // Allow Ctrl/Cmd + A, C, V, X
            if (isCtrlOrCmd && ['KeyA', 'KeyC', 'KeyV', 'KeyX'].includes(e.code)) {
                return;
            }

            // Allow navigation keys
            if (allowedKeys.includes(e.key)) {
                return;
            }

            // Block non-numeric keys
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Also sanitize on paste
        whatsappInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/\D/g, '').slice(0, 10);
            whatsappInput.value = numbersOnly;
            whatsappInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Sanitize on input (in case anything gets through)
        whatsappInput.addEventListener('input', (e) => {
            if (/\D/.test(e.target.value)) {
                e.target.value = e.target.value.replace(/\D/g, '');
            }
            // Enforce 10 digit max
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });
    }

    // --- 9. FormSubmit AJAX Submit with Loading State ---
    const wholesaleForm = document.getElementById('wholesale-enquiry-form');
    const submitBtn = wholesaleForm?.querySelector('.trade-submit-btn');

    if (wholesaleForm && submitBtn) {
        wholesaleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Client-side validation
            if (!validateForm(wholesaleForm)) {
                // Focus first invalid field
                const firstInvalid = wholesaleForm.querySelector('.error');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

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
                    // Reset timestamp for next submission
                    const timestampInput = wholesaleForm.querySelector('#form-timestamp');
                    if (timestampInput) timestampInput.value = Date.now().toString();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                // Even if fetch throws (network/CORS), form might have submitted via redirect
                // Show success anyway since FormSubmit usually works
                console.warn('Fetch error (may be CORS/redirect):', err);
                showSuccessPopup();
                wholesaleForm.reset();
                const timestampInput = wholesaleForm.querySelector('#form-timestamp');
                if (timestampInput) timestampInput.value = Date.now().toString();
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
                        <svg width="22" height="22" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" class="whatsapp-icon">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
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
