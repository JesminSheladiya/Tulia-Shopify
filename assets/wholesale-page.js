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

    function getErrorContainer(input) {
        // For regular fields: append to form-group
        // For phone input: append to form-group (parent of phone-input-wrapper)
        // For checkbox: append to form-consent-wrap
        return input.closest('.form-group')
            || input.closest('.form-consent-wrap')
            || input.closest('.checkbox-label')
            || input.parentNode;
    }

    function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');
        const container = getErrorContainer(input);
        container.appendChild(errorEl);
    }

    function clearFieldError(input) {
        input.classList.remove('error');
        const container = getErrorContainer(input);
        const existingError = container.querySelector('.field-error');
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

    // --- 9. FormSubmit Reliable Standard Submit ---
    const wholesaleForm = document.getElementById('wholesale-enquiry-form');
    const submitBtn = wholesaleForm?.querySelector('.trade-submit-btn');

    if (wholesaleForm && submitBtn) {
        wholesaleForm.addEventListener('submit', (e) => {
            // Client-side validation
            if (!validateForm(wholesaleForm)) {
                e.preventDefault();
                // Focus first invalid field
                const firstInvalid = wholesaleForm.querySelector('.error');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Prepend +91 to WhatsApp number before submitting
            const whatsappInput = document.getElementById('whatsapp-number');
            if (whatsappInput && whatsappInput.value && !whatsappInput.value.startsWith('+91')) {
                whatsappInput.value = '+91' + whatsappInput.value.trim();
            }

            // UI: Loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            submitBtn.classList.add('loading');

            // Form proceeds to submit natively via POST to FormSubmit action URL
        });
    }

});
