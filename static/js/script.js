// ========================================
// GLOBAL VARIABLES
// ========================================
let currentVideo = 0;
let currentReview = 0;
let counterStarted = false;
let touchStartX = 0;
let touchEndX = 0;

// ========================================
// MODAL FUNCTIONS - GLOBAL (defined first)
// ========================================
window.showModal = function(title, message, type = 'success') {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');

    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements not found');
        alert(`${title}: ${message}`);
        return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalIcon.classList.remove('success', 'error', 'warning', 'info');
    modalIcon.classList.add(type);

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    modalIcon.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i>`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log(`Modal shown: ${title} - ${type}`);
};

window.hideModal = function() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.showLoading = function(text = 'Please wait...') {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        const loadingText = loadingModal.querySelector('.loading-text');
        if (loadingText) loadingText.textContent = text;
        loadingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.hideLoading = function() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ========================================
// REVIEW NAVIGATION - GLOBAL
// ========================================
window.showReview = function(index) {
    const cards = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.review-dot');
    cards.forEach((c, i) => c.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    currentReview = index;
};

window.nextReview = function() {
    const cards = document.querySelectorAll('.review-card');
    if (cards.length > 0) {
        currentReview = (currentReview + 1) % cards.length;
        window.showReview(currentReview);
    }
};

window.prevReview = function() {
    const cards = document.querySelectorAll('.review-card');
    if (cards.length > 0) {
        currentReview = (currentReview - 1 + cards.length) % cards.length;
        window.showReview(currentReview);
    }
};

// ========================================
// LOAD REVIEWS FROM SERVER
// ========================================
async function loadReviews() {
    try {
        const response = await fetch('/get-reviews');

        // Check content type before parsing
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response from /get-reviews:', text.substring(0, 300));
            throw new Error('Server error loading reviews');
        }

        const data = await response.json();
        const container = document.querySelector('.reviews-slider');
        const dotsContainer = document.getElementById('reviewDotsContainer');
        const navigation = document.getElementById('reviewNavigation');

        if (!container) return;

        if (data.success && data.reviews && data.reviews.length > 0) {
            container.innerHTML = '';
            if (dotsContainer) dotsContainer.innerHTML = '';

            data.reviews.forEach((review, index) => {
                // Generate stars
                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<i class="${i <= review.rating ? 'fas' : 'far'} fa-star"></i>`;
                }

                // Avatar with fallback
                const avatarNum = (review.id % 70) + 1;
                const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=1a4d2e&color=fff&size=100`;

                const card = document.createElement('div');
                card.className = `review-card${index === 0 ? ' active' : ''}`;
                card.innerHTML = `
                    <div class="review-header">
                        <img src="https://i.pravatar.cc/100?img=${avatarNum}"
                             alt="${review.name}"
                             class="review-avatar"
                             onerror="this.src='${fallbackAvatar}'">
                        <div class="review-info">
                            <h4>${review.name}</h4>
                            <div class="review-stars">${starsHTML}</div>
                        </div>
                    </div>
                    <p class="review-text">"${review.message}"</p>
                    <span class="review-service">${review.service}</span>
                    ${review.is_featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                `;
                container.appendChild(card);

                // Create dot
                if (dotsContainer) {
                    const dot = document.createElement('span');
                    dot.className = `review-dot${index === 0 ? ' active' : ''}`;
                    dot.setAttribute('data-slide', index);
                    dot.addEventListener('click', () => {
                        currentReview = index;
                        window.showReview(index);
                    });
                    dotsContainer.appendChild(dot);
                }
            });

            if (navigation) navigation.style.display = 'flex';

            // Auto slide only if more than 1 review
            if (data.reviews.length > 1) {
                setInterval(window.nextReview, 5000);
            }

            console.log(`✓ Loaded ${data.reviews.length} approved reviews`);

        } else {
            container.innerHTML = `
                <div class="review-card active" style="text-align:center; padding:60px 20px;">
                    <i class="fas fa-comments" style="font-size:4rem; color:#ddd; margin-bottom:20px; display:block;"></i>
                    <h3 style="color:var(--dark-color); margin-bottom:10px;">No reviews yet</h3>
                    <p style="color:var(--gray);">Be the first to leave a review!</p>
                </div>`;
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
        const container = document.querySelector('.reviews-slider');
        if (container) {
            container.innerHTML = `
                <div class="review-card active" style="text-align:center; padding:60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#f5576c; margin-bottom:20px; display:block;"></i>
                    <p style="color:var(--gray);">Could not load reviews. Please refresh the page.</p>
                </div>`;
        }
    }
}

// ========================================
// PAGE LOAD ANIMATION
// ========================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ========================================
// PARALLAX EFFECT FOR HERO
// ========================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (scrolled < window.innerHeight) {
        document.querySelectorAll('.hero-video').forEach(video => {
            video.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.5}px))`;
        });
    }
});

// ========================================
// ALL DOM-DEPENDENT CODE INSIDE DOMContentLoaded
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Faith Legal Nepal...');

    // ========================================
    // MODAL EVENT LISTENERS
    // ========================================
    const modalButton = document.getElementById('modalButton');
    if (modalButton) {
        modalButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.hideModal();
        });
        console.log('✓ Modal button listener attached');
    } else {
        console.warn('⚠ Modal button not found');
    }

    const customModal = document.getElementById('customModal');
    if (customModal) {
        customModal.addEventListener('click', function(e) {
            if (e.target === customModal || e.target.classList.contains('modal-overlay')) {
                window.hideModal();
            }
        });
    }

    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.hideModal();
            window.hideLoading();
        }
    });

    // ========================================
    // MOBILE MENU
    // ========================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ========================================
    // SMOOTH SCROLLING
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 70;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // ========================================
    // VIDEO SLIDER
    // ========================================
    const videos = document.querySelectorAll('.hero-video');
    const videoDots = document.querySelectorAll('.video-dot');

    // Preload next video
    function preloadNextVideo() {
        if (videos.length > 0) {
            const nextIndex = (currentVideo + 1) % videos.length;
            if (videos[nextIndex]) {
                videos[nextIndex].load();
            }
        }
    }

    function changeVideo(index) {
        videos.forEach((video, i) => {
            video.classList.remove('active');
            if (videoDots[i]) videoDots[i].classList.remove('active');

            if (i === index) {
                video.classList.add('active');
                if (videoDots[i]) videoDots[i].classList.add('active');
                video.play().catch(e => console.log('Video play error:', e));
            } else {
                video.pause();
            }
        });
        currentVideo = index;
    }

    if (videos.length > 0) {
        // Mute all videos for autoplay policy
        videos.forEach(video => {
            video.muted = true;
            video.setAttribute('playsinline', '');
        });

        // Video dot clicks - reads data-video attribute from HTML
        videoDots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const videoIndex = parseInt(dot.getAttribute('data-video')) || 0;
                changeVideo(videoIndex);
            });
        });

        // Video error handling
        videos.forEach((video, index) => {
            video.addEventListener('error', () => {
                console.error(`Error loading video ${index + 1}`);
                if (videoDots[index]) videoDots[index].style.display = 'none';
            });

            // Preload next video when current loads
            video.addEventListener('loadeddata', () => {
                if (index === currentVideo) {
                    preloadNextVideo();
                }
            });
        });

        // Initialize first video
        changeVideo(0);

        // Auto change every 10 seconds
        setInterval(() => {
            currentVideo = (currentVideo + 1) % videos.length;
            changeVideo(currentVideo);
        }, 10000);
    }

    // ========================================
    // COUNTER ANIMATION
    // ========================================
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const runCounter = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counterStarted) {
                    runCounter();
                    counterStarted = true;
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // ========================================
    // REVIEWS SLIDER - navigation buttons
    // ========================================
    const reviewPrev = document.querySelector('.review-prev');
    const reviewNext = document.querySelector('.review-next');

    if (reviewNext) reviewNext.addEventListener('click', window.nextReview);
    if (reviewPrev) reviewPrev.addEventListener('click', window.prevReview);

    // ========================================
    // FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(faq => faq.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        }
    });

    // ========================================
    // CONTACT FORM SUBMISSION - FIXED
    // ========================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Contact form submitted');

            const nameInput    = document.getElementById('name');
            const emailInput   = document.getElementById('email');
            const phoneInput   = document.getElementById('phone');
            const serviceInput = document.getElementById('service');
            const messageInput = document.getElementById('message');

            if (!nameInput || !emailInput || !phoneInput || !serviceInput || !messageInput) {
                window.showModal('Form Error', 'Please refresh the page and try again.', 'error');
                return;
            }

            const name    = nameInput.value.trim();
            const email   = emailInput.value.trim();
            const phone   = phoneInput.value.trim();
            const service = serviceInput.value;
            const message = messageInput.value.trim();

            // Validate
            if (!name) {
                window.showModal('Missing Information', 'Please enter your name', 'warning');
                nameInput.focus();
                return;
            }
            if (!email) {
                window.showModal('Missing Information', 'Please enter your email address', 'warning');
                emailInput.focus();
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                window.showModal('Invalid Email', 'Please enter a valid email address', 'error');
                emailInput.focus();
                return;
            }
            if (!phone) {
                window.showModal('Missing Information', 'Please enter your phone number', 'warning');
                phoneInput.focus();
                return;
            }
            if (!service) {
                window.showModal('Missing Information', 'Please select a service', 'warning');
                serviceInput.focus();
                return;
            }
            if (!message) {
                window.showModal('Missing Information', 'Please enter your message', 'warning');
                messageInput.focus();
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('service', service);
            formData.append('message', message);

            window.showLoading('Sending your message...');

            try {
                console.log('Sending to /submit-contact...');

                const response = await fetch('/submit-contact', {
                    method: 'POST',
                    body: formData
                });

                console.log('Response status:', response.status);

                // CRITICAL: Check content-type before parsing JSON
                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text.substring(0, 300));
                    window.hideLoading();
                    window.showModal(
                        'Server Error',
                        'The server returned an unexpected response. Please try again or call us directly.',
                        'error'
                    );
                    return;
                }

                const data = await response.json();
                console.log('Response data:', data);

                window.hideLoading();

                if (data.success) {
                    window.showModal('Thank You!', data.message, 'success');
                    contactForm.reset();
                } else {
                    window.showModal('Submission Failed', data.message || 'An error occurred. Please try again.', 'error');
                }

            } catch (error) {
                window.hideLoading();
                console.error('Contact form fetch error:', error);

                if (error.name === 'TypeError' || error.message.includes('fetch')) {
                    window.showModal(
                        'Connection Error',
                        'Cannot reach the server. Please check your internet connection and try again.',
                        'error'
                    );
                } else {
                    window.showModal(
                        'Error',
                        'An unexpected error occurred. Please try again.',
                        'error'
                    );
                }
            }
        });
        console.log('✓ Contact form listener attached');
    }

    // ========================================
    // REVIEW FORM SUBMISSION - FIXED
    // ========================================
    const reviewForm = document.getElementById('reviewForm');

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Review form submitted');

            const formData = new FormData(reviewForm);

            const name    = (formData.get('name') || '').trim();
            const email   = (formData.get('email') || '').trim();
            const rating  = formData.get('rating');
            const service = formData.get('service');
            const message = (formData.get('message') || '').trim();

            // Validate all fields
            if (!name) {
                window.showModal('Missing Information', 'Please enter your name', 'warning');
                return;
            }
            if (!email) {
                window.showModal('Missing Information', 'Please enter your email address', 'warning');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                window.showModal('Invalid Email', 'Please enter a valid email address', 'error');
                return;
            }
            if (!rating) {
                window.showModal('Missing Rating', 'Please select a star rating', 'warning');
                return;
            }
            if (!service) {
                window.showModal('Missing Information', 'Please select a service', 'warning');
                return;
            }
            if (!message) {
                window.showModal('Missing Information', 'Please write your review message', 'warning');
                return;
            }

            window.showLoading('Submitting your review...');

            try {
                console.log('Sending to /submit-review...');

                const response = await fetch('/submit-review', {
                    method: 'POST',
                    body: formData
                });

                console.log('Response status:', response.status);

                // CRITICAL: Check content-type before parsing JSON
                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text.substring(0, 300));
                    window.hideLoading();
                    window.showModal(
                        'Server Error',
                        'The server returned an unexpected response. Please try again.',
                        'error'
                    );
                    return;
                }

                const data = await response.json();
                console.log('Response data:', data);

                window.hideLoading();

                if (data.success) {
                    window.showModal('Review Submitted!', data.message, 'success');
                    reviewForm.reset();
                } else {
                    window.showModal('Submission Failed', data.message || 'Please try again.', 'error');
                }

            } catch (error) {
                window.hideLoading();
                console.error('Review form fetch error:', error);

                if (error.name === 'TypeError' || error.message.includes('fetch')) {
                    window.showModal(
                        'Connection Error',
                        'Cannot reach the server. Please check your connection and try again.',
                        'error'
                    );
                } else {
                    window.showModal(
                        'Error',
                        'An unexpected error occurred. Please try again.',
                        'error'
                    );
                }
            }
        });
        console.log('✓ Review form listener attached');
    }

    // ========================================
    // NEWSLETTER FORM
    // ========================================
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;
            const email = emailInput.value.trim();
            if (!email) {
                window.showModal('Missing Email', 'Please enter your email address', 'warning');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                window.showModal('Invalid Email', 'Please enter a valid email address', 'error');
                return;
            }
            window.showModal('Subscribed!', `Thank you for subscribing with ${email}! You'll receive our latest updates.`, 'success');
            form.reset();
        });
    });

    // ========================================
    // FORM VALIDATION FEEDBACK
    // ========================================
    document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '' && input.hasAttribute('required')) {
                input.style.borderColor = '#e74c3c';
            } else {
                input.style.borderColor = '#ddd';
            }
        });
        input.addEventListener('focus', () => {
            input.style.borderColor = 'var(--primary-color)';
        });
    });

    // Email blur validation
    const contactEmailInput = document.getElementById('email');
    if (contactEmailInput) {
        contactEmailInput.addEventListener('blur', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (contactEmailInput.value && !emailPattern.test(contactEmailInput.value)) {
                contactEmailInput.style.borderColor = '#e74c3c';
            }
        });
    }

    // Phone - numbers only
    const contactPhoneInput = document.getElementById('phone');
    if (contactPhoneInput) {
        contactPhoneInput.addEventListener('input', () => {
            contactPhoneInput.value = contactPhoneInput.value.replace(/[^0-9+\-\s]/g, '');
        });
    }

    // ========================================
    // SCROLL TO TOP BUTTON
    // ========================================
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('show', window.pageYOffset > 300);
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================================
    // ANIMATION ON SCROLL
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .step, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ========================================
    // TOUCH SWIPE FOR REVIEWS
    // ========================================
    const reviewsSlider = document.querySelector('.reviews-slider');
    if (reviewsSlider) {
        reviewsSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        reviewsSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? window.nextReview() : window.prevReview();
            }
        }, { passive: true });
    }

    // ========================================
    // ACTIVE NAVIGATION HIGHLIGHT
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavigation() {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            if (scrollY > sectionTop && scrollY <= sectionTop + section.offsetHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // ========================================
    // KEYBOARD NAVIGATION FOR REVIEWS
    // ========================================
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement.tagName;
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
            if (e.key === 'ArrowLeft') window.prevReview();
            else if (e.key === 'ArrowRight') window.nextReview();
        }
    });

    // ========================================
    // LOGO RIGHT-CLICK PROTECTION
    // ========================================
    document.querySelectorAll('.logo-img').forEach(logo => {
        logo.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // ========================================
    // CHECK ALL REQUIRED ELEMENTS
    // ========================================
    const header = document.querySelector('header');
    const contactForm2 = document.getElementById('contactForm');
    const scrollTopBtn2 = document.getElementById('scrollTop');

    const requiredElements = [
        { name: 'Header',          element: header },
        { name: 'Navigation Menu', element: document.getElementById('navMenu') },
        { name: 'Contact Form',    element: contactForm2 },
        { name: 'Scroll Top Btn',  element: scrollTopBtn2 },
        { name: 'Custom Modal',    element: document.getElementById('customModal') },
        { name: 'Loading Modal',   element: document.getElementById('loadingModal') },
        { name: 'Modal Button',    element: document.getElementById('modalButton') }
    ];

    console.log('\n📊 Component Check:');
    requiredElements.forEach(item => {
        if (!item.element) {
            console.warn(`⚠ ${item.name} NOT FOUND`);
        } else {
            console.log(`✓ ${item.name}`);
        }
    });

    console.log('\n📊 Stats:');
    console.log(`   Videos: ${document.querySelectorAll('.hero-video').length}`);
    console.log(`   FAQ Items: ${document.querySelectorAll('.faq-item').length}`);
    console.log(`   Counters: ${document.querySelectorAll('.counter').length}`);
    console.log(`   Newsletter Forms: ${document.querySelectorAll('.newsletter-form').length}`);

    // ========================================
    // LOAD REVIEWS
    // ========================================
    loadReviews();

    console.log('\n✅ Faith Legal Nepal ready!');
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================
console.log('%c👋 Welcome to Faith Legal Nepal!', 'color: #1a4d2e; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped with ❤️', 'color: #4f772d; font-size: 14px;');