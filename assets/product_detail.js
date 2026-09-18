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

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const newSrc = thumb.getAttribute('data-image');
            if (newSrc && mainImage && newSrc !== mainImage.getAttribute('src')) {
                const container = document.getElementById('main-image-container');
                if (container) {
                    const overlay = document.createElement('img');
                    overlay.src = newSrc;
                    overlay.style.position = 'absolute';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.objectFit = 'cover';
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.3s ease';
                    overlay.style.zIndex = '2';
                    
                    container.appendChild(overlay);
                    
                    // Trigger reflow
                    overlay.offsetHeight;
                    overlay.style.opacity = '1';
                    
                    setTimeout(() => {
                        mainImage.src = newSrc;
                        overlay.remove();
                    }, 300);
                } else {
                    mainImage.src = newSrc;
                }
            }
        });
    });

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
