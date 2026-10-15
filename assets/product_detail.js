document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Accordion functionality
    const accordions = document.querySelectorAll('details.group summary');
    accordions.forEach(acc => {
        acc.addEventListener('click', function(e) {
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) {
                if (this.parentElement.hasAttribute('open')) {
                    icon.textContent = 'expand_more';
                } else {
                    icon.textContent = 'expand_less';
                }
            }
        });
    });

    // Main Product Image Gallery
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    const mainImage = document.getElementById('main-product-image');

    function setActiveThumb(activeThumb) {
        thumbnails.forEach((t) => {
            const isActive = t === activeThumb;
            t.classList.toggle('is-active', isActive);
            t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        scrollThumbIntoView(activeThumb);
    }

    function scrollThumbIntoView(thumb) {
        const track = document.querySelector('.hero-thumbnails');
        if (!thumb || !track) return;
        if (window.innerWidth > 768) return;
        if (track.scrollWidth <= track.clientWidth + 2) return;
        const target = thumb.offsetLeft - track.clientWidth / 2 + thumb.offsetWidth / 2;
        track.scrollTo({ left: target, behavior: 'smooth' });
    }

    function showMainImage(thumb) {
        if (!thumb || !mainImage) return;
        const newSrc = thumb.getAttribute('data-image');
        if (!newSrc) return;
        // Same image already shown (compare resolved src + srcset-aware)
        if (mainImage.getAttribute('src') === newSrc && (thumb.getAttribute('data-srcset') || '') === (mainImage.getAttribute('srcset') || '')) {
            setActiveThumb(thumb);
            return;
        }
        const newSrcset = thumb.getAttribute('data-srcset');
        const newAlt = thumb.getAttribute('data-alt');

        // Preload to avoid flicker, then swap src AND srcset together.
        // NOTE: changing only `src` does not update the preview because the
        // main image has `srcset` — the browser picks from `srcset` and
        // ignores `src`. That was the old bug: thumbnail clicks never updated
        // the preview.
        const preload = new Image();
        preload.onload = () => {
            mainImage.style.opacity = '0';
            requestAnimationFrame(() => {
                mainImage.src = newSrc;
                if (newSrcset) {
                    mainImage.setAttribute('srcset', newSrcset);
                } else {
                    mainImage.removeAttribute('srcset');
                }
                if (newAlt) mainImage.alt = newAlt;
                mainImage.style.opacity = '1';
                setActiveThumb(thumb);
            });
        };
        preload.onerror = () => {
            // Fallback: still swap so the UI never gets stuck
            mainImage.src = newSrc;
            if (newSrcset) {
                mainImage.setAttribute('srcset', newSrcset);
            } else {
                mainImage.removeAttribute('srcset');
            }
            if (newAlt) mainImage.alt = newAlt;
            setActiveThumb(thumb);
        };
        preload.src = newSrc;
    }

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => showMainImage(thumb));
        thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showMainImage(thumb);
            }
        });
    });
    // Mark initial active thumb (first) if none marked
    if (thumbnails.length && !document.querySelector('.product-thumbnail.is-active')) {
        setActiveThumb(thumbnails[0]);
    }

    // Thumbnail slider arrows + swipe on main image (mobile)
    const thumbTrack = document.querySelector('.hero-thumbnails');
    const prevBtn = document.querySelector('.thumb-prev');
    const nextBtn = document.querySelector('.thumb-next');
    const mainContainer = document.getElementById('main-image-container');

    function thumbStep() {
        const first = thumbnails[0];
        return first ? first.offsetWidth + 12 : 84;
    }

    function updateThumbNav() {
        if (!thumbTrack || !prevBtn || !nextBtn) return;
        if (window.innerWidth > 768) return;
        const max = thumbTrack.scrollWidth - thumbTrack.clientWidth - 2;
        const need = max > 2;
        prevBtn.disabled = !need || thumbTrack.scrollLeft <= 2;
        nextBtn.disabled = !need || thumbTrack.scrollLeft >= max;
        const hide = !need;
        prevBtn.style.visibility = hide ? 'hidden' : 'visible';
        nextBtn.style.visibility = hide ? 'hidden' : 'visible';
    }

    function goToThumb(index) {
        if (!thumbnails.length) return;
        const total = thumbnails.length;
        const safe = (index + total) % total;
        showMainImage(thumbnails[safe]);
    }

    function activeThumbIndex() {
        return Array.prototype.findIndex.call(thumbnails, (t) => t.classList.contains('is-active'));
    }

    if (thumbTrack && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            thumbTrack.scrollBy({ left: -thumbStep() * 2, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            thumbTrack.scrollBy({ left: thumbStep() * 2, behavior: 'smooth' });
        });
        thumbTrack.addEventListener('scroll', updateThumbNav, { passive: true });
        window.addEventListener('resize', updateThumbNav);
        updateThumbNav();
        setTimeout(updateThumbNav, 500);
    }

    if (mainContainer && thumbnails.length > 1) {
        let touchX = null;
        let touchY = null;
        mainContainer.addEventListener('touchstart', (e) => {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
        }, { passive: true });
        mainContainer.addEventListener('touchend', (e) => {
            if (touchX == null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            const dy = e.changedTouches[0].clientY - (touchY || 0);
            touchX = null;
            touchY = null;
            if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
            const current = activeThumbIndex();
            const base = current === -1 ? 0 : current;
            goToThumb(dx < 0 ? base + 1 : base - 1);
        }, { passive: true });
    }

    // Review filters functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const reviews = document.querySelectorAll('.review-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--on-surface-variant)';
                b.style.borderColor = 'var(--outline-variant)';
            });
            
            // Add to clicked
            btn.classList.add('active');
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--primary)';
            
            const filterValue = btn.getAttribute('data-filter');
            
            reviews.forEach(review => {
                const category = review.getAttribute('data-category');
                if (filterValue === 'all' || (category && category.includes(filterValue))) {
                    review.style.display = 'block';
                    // Re-trigger animation
                    review.style.opacity = '0';
                    setTimeout(() => {
                        review.style.transition = 'opacity 0.4s ease';
                        review.style.opacity = '1';
                    }, 50);
                } else {
                    review.style.display = 'none';
                }
            });
        });
    });

    // Drag to scroll functionality
    const sliders = document.querySelectorAll('.drag-scroll');
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
    });

    // Reels Carousel Navigation
    const reelsContainer = document.querySelector('.reels-container');
    const btnPrev = document.querySelector('.reels-prev');
    const btnNext = document.querySelector('.reels-next');

    if (reelsContainer && btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            reelsContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
        btnNext.addEventListener('click', () => {
            reelsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }

    // Reels Play Interaction
    const reels = document.querySelectorAll('.reel-item');
    reels.forEach(reel => {
        reel.addEventListener('click', () => {
            const isPlaying = reel.classList.contains('playing');
            
            // Reset all
            reels.forEach(r => {
                r.classList.remove('playing');
                r.style.transform = 'scale(1)';
                r.style.opacity = '1';
                r.style.zIndex = '1';
                // If it was a real video, we would pause it here: r.querySelector('video').pause();
            });

            if (!isPlaying) {
                // Play this one
                reel.classList.add('playing');
                reel.style.transform = 'scale(1.05)';
                reel.style.zIndex = '10';
                reel.style.opacity = '1';
                
                // If it was a real video, we would play it here: reel.querySelector('video').play();
                
                // Fade others
                reels.forEach(r => {
                    if (r !== reel) {
                        r.style.opacity = '0.4';
                    }
                });
                
                if (window.innerWidth <= 768) {
                    reel.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                } else {
                    reel.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                }
                setTimeout(() => {
                    // Play video if exists after scrolling
                    const video = reel.querySelector('video');
                    if (video) video.play();
                }, 500);
            }
        });
    });
});
