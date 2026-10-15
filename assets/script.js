document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Preload Hero Animation Images ---
    // Frame URLs are injected by the hero-banner Shopify section as
    // window.tuliaHeroFrames (desktop) / window.tuliaHeroFramesMobile (vertical).
    const isMobileHero = window.innerWidth <= 768;
    const heroSrc = isMobileHero
        ? (window.tuliaHeroFramesMobile || window.tuliaHeroFrames || [])
        : (window.tuliaHeroFrames || window.tuliaHeroFramesMobile || []);
    const totalFrames = heroSrc.length || 1;
    const frames = [];
    for (let i = 0; i < heroSrc.length; i++) {
        const img = new Image();
        img.src = heroSrc[i];
        frames.push(img);
    }

    const sequenceImg = document.getElementById('sequence-img');
    if (sequenceImg && frames.length > 0) {
        sequenceImg.src = frames[0].src;
    }
    const heroSection = document.getElementById('hero');
    const heroTitle = document.getElementById('hero-title');
    
    const heroCta = document.getElementById('hero-cta');

    // --- 2. Handle Global Scroll Interactions ---
    const header = document.querySelector('.site-header');
    const backToTopBtn = document.getElementById('back-to-top');
    
    // Heritage Parallax Elements
    const heritageSection = document.getElementById('heritage');
    const parallaxImg = document.getElementById('parallax-img');
    const revealFades = document.querySelectorAll('.reveal-fade');
    const waitlistStrip = document.querySelector('.top-waitlist-strip');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Header Background & Waitlist Strip
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back to top visibility
        if (scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Hero Sequence Animation
        if (heroSection) {
            const heroRect = heroSection.getBoundingClientRect();
            const scrollDistance = heroSection.offsetHeight - window.innerHeight;
            let progress = -heroRect.top / scrollDistance;
            progress = Math.max(0, Math.min(1, progress));
            
            let frameIndex = Math.floor(progress * (totalFrames - 1));
            
            if (frames[frameIndex] && frames[frameIndex].src !== sequenceImg.src) {
                sequenceImg.src = frames[frameIndex].src;
            }

            // Text reveal staggered and stays
            const heroEyebrow = document.getElementById('hero-eyebrow');
            const heroPointer = document.getElementById('hero-pointer');
            const heroDesc = document.getElementById('hero-desc');

            if (progress < 0.15) {
                if(heroTitle) { heroTitle.style.opacity = '0'; heroTitle.style.transform = 'translateY(20px)'; }
                if(heroEyebrow) { heroEyebrow.style.opacity = '0'; heroEyebrow.style.transform = 'translateY(20px)'; }
                if(heroDesc) { heroDesc.style.opacity = '0'; heroDesc.style.transform = 'translateY(20px)'; }
            } else {
                if(heroTitle) { heroTitle.style.opacity = '1'; heroTitle.style.transform = 'translateY(0)'; }
                if(heroEyebrow) { heroEyebrow.style.opacity = '1'; heroEyebrow.style.transform = 'translateY(0)'; }
                if(heroDesc) { heroDesc.style.opacity = '1'; heroDesc.style.transform = 'translateY(0)'; }
            }

            if (progress < 0.4) {
                if(heroCta) { heroCta.style.opacity = '0'; heroCta.style.transform = 'translateY(20px)'; }
                if(heroPointer) { heroPointer.style.opacity = '0'; heroPointer.style.transform = 'translateY(20px)'; }
            } else {
                if(heroCta) { heroCta.style.opacity = '1'; heroCta.style.transform = 'translateY(0)'; }
                if(heroPointer) { heroPointer.style.opacity = '1'; heroPointer.style.transform = 'translateY(0)'; }
            }
        } else {
            if(heroTitle) { heroTitle.style.opacity = '1'; heroTitle.style.transform = 'translateY(0)'; }
            if(heroCta) { heroCta.style.opacity = '1'; heroCta.style.transform = 'translateY(0)'; }
        }
        // --- Blur and Fade for Calibrated Section ---
        const calibratedSection = document.getElementById('calibrated-section');
        const exploreSection = document.getElementById('explore');
        if (calibratedSection && exploreSection) {
            if (window.innerWidth <= 768) {
                // Disable sticky and blur on mobile for better performance and usability
                calibratedSection.style.top = 'auto';
                calibratedSection.style.filter = 'blur(0px)';
            } else {
                calibratedSection.style.top = '0px';
                
                const calibratedRect = calibratedSection.getBoundingClientRect();
                const exploreRect = exploreSection.getBoundingClientRect();
                const overlap = calibratedRect.bottom - exploreRect.top;
                
                if (overlap > 0) {
                    let progress = overlap / (window.innerHeight * 0.8); // Complete fade over 80% of window height
                    progress = Math.max(0, Math.min(1, progress));
                    calibratedSection.style.filter = `blur(${progress * 8}px)`;
                } else {
                    calibratedSection.style.filter = 'blur(0px)';
                }
            }
        }
    });

    // Run once on load to set initial states
    window.dispatchEvent(new Event('scroll'));

    // --- 3. Back to Top Click ---
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

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

    // --- 5. Explore The Edit (Click Interaction) ---
    const hoverItems = document.querySelectorAll('.edit-hover-item');
    const exploreMainImg = document.getElementById('explore-main-img');
    
    hoverItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            hoverItems.forEach(s => s.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            // Update main image source
            const newImgSrc = item.getAttribute('data-img');
            if (newImgSrc && exploreMainImg) {
                exploreMainImg.style.opacity = '0';
                setTimeout(() => {
                    exploreMainImg.src = newImgSrc;
                    exploreMainImg.style.opacity = '1';
                }, 150);
            }
        });
    });

    // --- 6. Video Gallery Logic ---
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const isExpanding = !card.classList.contains('expanded');
            
            videoCards.forEach(c => {
                c.classList.remove('expanded');
                c.classList.remove('dimmed');
                if (isExpanding && c !== card) {
                    c.classList.add('dimmed');
                }
            });
            
            if (isExpanding) {
                card.classList.add('expanded');
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }, 100);
                }
            }
        });
    });

    const videoTrack = document.querySelector('.video-track');
    const videoPrevBtn = document.querySelector('.video-nav-btn.prev');
    const videoNextBtn = document.querySelector('.video-nav-btn.next');

    if (videoTrack && videoPrevBtn && videoNextBtn) {
        videoPrevBtn.addEventListener('click', () => {
            videoTrack.scrollBy({ left: -320, behavior: 'smooth' });
        });
        videoNextBtn.addEventListener('click', () => {
            videoTrack.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }


    // --- 7. Testimonial Carousel Scroll ---
    const carouselTrack = document.getElementById('testimonial-track');
    const carousel = document.getElementById('testimonial-carousel');
    const prevBtn = document.getElementById('testi-prev');
    const nextBtn = document.getElementById('testi-next');
    const counterDisplay = document.getElementById('testi-counter');
    
    if (carouselTrack && carousel && prevBtn && nextBtn) {
        let currentIndex = 0;
        const totalItems = 3;
        let autoScrollInterval;
        
        function updateCarousel() {
            const scrollAmount = carousel.clientWidth;
            carousel.scrollTo({ left: currentIndex * scrollAmount, behavior: 'smooth' });
            counterDisplay.innerHTML = `0${currentIndex + 1} &mdash; 03`;
        }

        function startAutoScroll() {
            autoScrollInterval = setInterval(() => {
                currentIndex = (currentIndex < totalItems - 1) ? currentIndex + 1 : 0;
                updateCarousel();
            }, 4000);
        }

        function resetAutoScroll() {
            clearInterval(autoScrollInterval);
            startAutoScroll();
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalItems - 1;
            updateCarousel();
            resetAutoScroll();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex < totalItems - 1) ? currentIndex + 1 : 0;
            updateCarousel();
            resetAutoScroll();
        });

        startAutoScroll();
    }

    // --- 8. Ritual Finder Filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const ritualCards = document.querySelectorAll('.ritual-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            ritualCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    const categories = card.getAttribute('data-category');
                    if (categories && categories.includes(filterValue)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
});


/* Extracted script 1 from ./index.html */
document.addEventListener("DOMContentLoaded", () => {
            const stickyBar = document.getElementById("sticky-bottom-bar");
            const targetSection = document.getElementById("sacred-ingredients");
            const footer = document.querySelector("footer");
            const backToTop = document.getElementById("back-to-top");

            if (stickyBar && targetSection) {
                window.addEventListener('scroll', () => {
                    const rect = targetSection.getBoundingClientRect();

                    let isFooterVisible = false;
                    if (footer) {
                        const footerRect = footer.getBoundingClientRect();
                        // Check if footer is visible in the viewport
                        if (footerRect.top <= window.innerHeight) {
                            isFooterVisible = true;
                        }
                    }

                    // Show when Sacred Ingredients top enters viewport AND footer is not visible
                    if (rect.top <= window.innerHeight && !isFooterVisible) {
                        stickyBar.style.transform = "translateY(0)";
                        if (backToTop) backToTop.style.transform = "translateY(-70px)";
                    } else {
                        stickyBar.style.transform = "translateY(100%)";
                        if (backToTop) backToTop.style.transform = "translateY(0)";
                    }
                });
            }

            // Mega Menu Logic
            const shopTrigger = document.getElementById("shop-trigger");
            const megaMenu = document.getElementById("mega-menu");

            if (shopTrigger && megaMenu) {
                // Open mega menu on hover
                shopTrigger.addEventListener("mouseenter", () => {
                    megaMenu.classList.add("active");
                });

                shopTrigger.addEventListener("click", (e) => {
                    e.preventDefault();
                    megaMenu.classList.toggle("active");
                });
                // Close only when clicking outside
                document.addEventListener("click", (e) => {
                    if (!shopTrigger.contains(e.target) && !megaMenu.contains(e.target)) {
                        megaMenu.classList.remove("active");
                    }
                });
            }

            // Mobile Menu Logic
            const mobileMenuBtn = document.querySelector(".mobile-menu");
            const mobileOverlay = document.getElementById("mobile-overlay");
            const closeMobileBtn = document.getElementById("close-mobile-menu");

            if (mobileMenuBtn && mobileOverlay) {
                mobileMenuBtn.addEventListener("click", () => {
                    mobileOverlay.classList.add("active");
                    document.body.style.overflow = "hidden";
                });
                closeMobileBtn.addEventListener("click", () => {
                    mobileOverlay.classList.remove("active");
                    document.body.style.overflow = "";
                });
            }
        });

/* Extracted script 2 from ./index.html */
document.addEventListener("DOMContentLoaded", () => {
            // Waitlist Modal Logic
            const waitlistModal = document.getElementById("waitlist-modal");
            const waitlistClose = document.getElementById("waitlist-close");
            const waitlistTriggers = document.querySelectorAll(".waitlist-trigger");

            waitlistTriggers.forEach(trigger => {
                trigger.addEventListener("click", () => {
                    waitlistModal.classList.add("active");
                });
            });

            if (waitlistClose) {
                waitlistClose.addEventListener("click", () => {
                    waitlistModal.classList.remove("active");
                });
            }

            if (waitlistModal) {
                waitlistModal.addEventListener("click", (e) => {
                    if (e.target === waitlistModal) {
                        waitlistModal.classList.remove("active");
                    }
                });
            }

            // Image Thumbnail Logic
            function setupMegaFilters(tabSelector, cardSelector) {
                document.querySelectorAll(tabSelector).forEach(tab => {
                    tab.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        let siblings = this.parentElement.children;
                        for (let s of siblings) s.classList.remove('active');
                        this.classList.add('active');

                        let filter = this.getAttribute('data-filter');
                        let cards = this.closest('.mega-menu') ? this.closest('.mega-menu').querySelectorAll(cardSelector) : this.closest('.mobile-overlay-content').querySelectorAll(cardSelector);

                        cards.forEach(card => {
                            if (filter === 'all' || (card.getAttribute('data-category') && card.getAttribute('data-category').includes(filter))) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }
            setupMegaFilters('.mega-tab', '.mega-card');
            setupMegaFilters('.mobile-mega-tab', '.mobile-mega-card');
        });


/* Extracted script 1 from ./product_detail.html */
function selectSize(btn) {
                                document.querySelectorAll('.size-btn').forEach(b => {
                                    b.style.background = 'transparent';
                                    b.style.color = 'var(--on-surface-variant)';
                                    b.style.borderColor = 'var(--outline)';
                                    b.classList.remove('active');
                                });
                                btn.style.background = 'var(--primary)';
                                btn.style.color = 'white';
                                btn.style.borderColor = 'var(--primary)';
                                btn.classList.add('active');
                            }

/* Extracted script 2 from ./product_detail.html */
function toggleAcc(id) {
                    const el = document.getElementById(id);
                    if (el.classList.contains('active')) {
                        el.classList.remove('active');
                    } else {
                        document.querySelectorAll('.acc-item').forEach(item => item.classList.remove('active'));
                        el.classList.add('active');
                    }
                }

/* Extracted script 3 from ./product_detail.html */
document.addEventListener("DOMContentLoaded", () => {
            const stickyBar = document.getElementById("sticky-bottom-bar");
            const targetSection = document.getElementById("sacred-ingredients");
            const footer = document.querySelector("footer");
            const backToTop = document.getElementById("back-to-top");

            if (stickyBar && targetSection) {
                window.addEventListener('scroll', () => {
                    const rect = targetSection.getBoundingClientRect();

                    let isFooterVisible = false;
                    if (footer) {
                        const footerRect = footer.getBoundingClientRect();
                        // Check if footer is visible in the viewport
                        if (footerRect.top <= window.innerHeight) {
                            isFooterVisible = true;
                        }
                    }

                    // Show when Sacred Ingredients top enters viewport AND footer is not visible
                    if (rect.top <= window.innerHeight && !isFooterVisible) {
                        stickyBar.style.transform = "translateY(0)";
                        if (backToTop) backToTop.style.transform = "translateY(-70px)";
                    } else {
                        stickyBar.style.transform = "translateY(100%)";
                        if (backToTop) backToTop.style.transform = "translateY(0)";
                    }
                });
            }

            // Mega Menu Logic
            const shopTrigger = document.getElementById("shop-trigger");
            const megaMenu = document.getElementById("mega-menu");

            if (shopTrigger && megaMenu) {
                // Open mega menu on hover
                shopTrigger.addEventListener("mouseenter", () => {
                    megaMenu.classList.add("active");
                });

                shopTrigger.addEventListener("click", (e) => {
                    e.preventDefault();
                    megaMenu.classList.toggle("active");
                });
                // Close only when clicking outside
                document.addEventListener("click", (e) => {
                    if (!shopTrigger.contains(e.target) && !megaMenu.contains(e.target)) {
                        megaMenu.classList.remove("active");
                    }
                });
            }

            // Mobile Menu Logic
            const mobileMenuBtn = document.querySelector(".mobile-menu");
            const mobileOverlay = document.getElementById("mobile-overlay");
            const closeMobileBtn = document.getElementById("close-mobile-menu");

            if (mobileMenuBtn && mobileOverlay) {
                mobileMenuBtn.addEventListener("click", () => {
                    mobileOverlay.classList.add("active");
                    document.body.style.overflow = "hidden";
                });
                closeMobileBtn.addEventListener("click", () => {
                    mobileOverlay.classList.remove("active");
                    document.body.style.overflow = "";
                });
            }
        });

/* Extracted script 4 from ./product_detail.html */
document.addEventListener("DOMContentLoaded", () => {
            // Waitlist Modal Logic
            const waitlistModal = document.getElementById("waitlist-modal");
            const waitlistClose = document.getElementById("waitlist-close");
            const waitlistTriggers = document.querySelectorAll(".waitlist-trigger");

            waitlistTriggers.forEach(trigger => {
                trigger.addEventListener("click", () => {
                    waitlistModal.classList.add("active");
                });
            });

            if (waitlistClose) {
                waitlistClose.addEventListener("click", () => {
                    waitlistModal.classList.remove("active");
                });
            }

            if (waitlistModal) {
                waitlistModal.addEventListener("click", (e) => {
                    if (e.target === waitlistModal) {
                        waitlistModal.classList.remove("active");
                    }
                });
            }

            // Image Thumbnail Logic
            function setupMegaFilters(tabSelector, cardSelector) {
                document.querySelectorAll(tabSelector).forEach(tab => {
                    tab.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        let siblings = this.parentElement.children;
                        for (let s of siblings) s.classList.remove('active');
                        this.classList.add('active');

                        let filter = this.getAttribute('data-filter');
                        let cards = this.closest('.mega-menu') ? this.closest('.mega-menu').querySelectorAll(cardSelector) : this.closest('.mobile-overlay-content').querySelectorAll(cardSelector);

                        cards.forEach(card => {
                            if (filter === 'all' || (card.getAttribute('data-category') && card.getAttribute('data-category').includes(filter))) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }
            setupMegaFilters('.mega-tab', '.mega-card');
            setupMegaFilters('.mobile-mega-tab', '.mobile-mega-card');
        });







        

// Universal Shopify Mobile Menu Anchor Close Fix
document.addEventListener('DOMContentLoaded', function() {
  // Watch all links on the website
  document.body.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // If the clicked link contains /# or starts with #
    if (href && (href.includes('/#') || href.startsWith('#'))) {
      
      // 1. Find the close (X) icon anywhere on the page.
      // This targets close buttons of all standard Shopify themes (Dawn, Impulse, Prestige, etc.)
      const closeButton = document.querySelector(
        'button[aria-label*="Close" i], ' +
        'button[class*="close" i], ' +
        'a[class*="close" i], ' +
        '.menu-drawer__close-button, ' +
        '.mobile-menu-close, ' +
        '[data-drawer-close], ' +
        '.header__icon--close'
      );

      // 2. If a close button is found, click it automatically
      if (closeButton) {
        setTimeout(() => {
          closeButton.click();
        }, 50); // Small delay so the smooth scroll can run
      }

      // 3. Backup: if the theme is custom and did not close via button click, reset the page state
      document.documentElement.classList.remove('menu-open', 'overflow-hidden', 'nav-open');
      document.body.classList.remove('menu-open', 'overflow-hidden', 'nav-open');
      
      const activeDrawers = document.querySelectorAll('[class*="active" i], [class*="open" i]');
      activeDrawers.forEach(drawer => {
        // Only target menu drawers (leave the main page header alone)
        if(drawer.tagName === 'DIV' || drawer.tagName === 'ASIDE') {
           drawer.classList.remove('is-open', 'active', 'open', 'menu-open');
        }
      });
    }
  });
});