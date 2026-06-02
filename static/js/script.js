// ========================================
// GLOBAL VARIABLES
// ========================================
let currentVideo = 0;
let currentReview = 0;
let counterStarted = false;
let touchStartX = 0;
let touchEndX = 0;
let reviewCardsArray = [];
let reviewDotsArray = [];

// ========================================
// WAIT FOR DOM TO BE FULLY LOADED
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Faith Legal Nepal...');

    // Initialize all components
    initMobileMenu();
    initNavbarScroll();
    initSmoothScrolling();
    setupModalListeners();
    initVideoSlider();
    initCounters();
    initFAQ();
    initContactForm();
    initReviewForm();
    initNewsletterForms();
    initFormValidation();
    initScrollTop();
    initAnimationOnScroll();
    initTouchSwipe();
    initKeyboardNavigation();
    initParallax();
    loadReviews();

    console.log('✅ All components initialized successfully!');
});

// ========================================
// MOBILE MENU TOGGLE
// ========================================
function initMobileMenu() {
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
        console.log('✓ Mobile menu initialized');
    }
}

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
function initNavbarScroll() {
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        console.log('✓ Navbar scroll initialized');
    }
}

// ========================================
// SMOOTH SCROLLING
// ========================================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    console.log('✓ Smooth scrolling initialized');
}

// ========================================
// CUSTOM MODAL FUNCTIONS
// ========================================
window.showModal = function(title, message, type = 'success') {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');

    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements not found');
        alert(title + '\n\n' + message);
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

    console.log(`Modal shown: [${type}] ${title}`);
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
        if (loadingText) {
            loadingText.textContent = text;
        }
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
// MODAL EVENT LISTENERS
// ========================================
function setupModalListeners() {
    const modalButton = document.getElementById('modalButton');
    if (modalButton) {
        modalButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.hideModal();
        });
        console.log('✓ Modal button listener attached');
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
        }
    });

    console.log('✓ Modal listeners setup complete');
}

// ========================================
// VIDEO SLIDER
// ========================================
function initVideoSlider() {
    const videos = document.querySelectorAll('.hero-video');
    const videoDots = document.querySelectorAll('.video-dot');

    if (videos.length === 0) return;

    // Mute videos for autoplay
    videos.forEach(video => {
        video.muted = true;
        video.setAttribute('playsinline', '');
    });

    function changeVideo(index) {
        videos.forEach((video, i) => {
            video.classList.remove('active');
            if (videoDots[i]) {
                videoDots[i].classList.remove('active');
            }
        });

        if (videos[index]) {
            videos[index].classList.add('active');
            if (videoDots[index]) {
                videoDots[index].classList.add('active');
            }
            videos[index].play().catch(e => console.log('Video play error:', e));
        }

        // Pause others
        videos.forEach((video, i) => {
            if (i !== index) {
                video.pause();
            }
        });
    }

    // Auto change video every 10 seconds
    setInterval(() => {
        currentVideo = (currentVideo + 1) % videos.length;
        changeVideo(currentVideo);
    }, 10000);

    // Manual control via dots
    videoDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentVideo = index;
            changeVideo(currentVideo);
        });
    });

    // Initialize first video
    changeVideo(0);

    console.log(`✓ Video slider initialized (${videos.length} videos)`);
}

// ========================================
// COUNTER ANIMATION
// ========================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const statsSection = document.querySelector('.stats');

    if (!statsSection || counters.length === 0) return;

    const runCounter = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const speed = 200;
            const inc = target / speed;

            const updateCount = () => {
                count += inc;
                if (count < target) {
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counterStarted) {
                runCounter();
                counterStarted = true;
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
    console.log('✓ Counters initialized');
}

// ========================================
// REVIEWS SLIDER
// ========================================
function showReview(index) {
    reviewCardsArray = document.querySelectorAll('.review-card');
    reviewDotsArray = document.querySelectorAll('.review-dot');

    reviewCardsArray.forEach((card, i) => {
        card.classList.remove('active');
    });
    reviewDotsArray.forEach((dot, i) => {
        dot.classList.remove('active');
    });

    if (reviewCardsArray[index]) {
        reviewCardsArray[index].classList.add('active');
    }
    if (reviewDotsArray[index]) {
        reviewDotsArray[index].classList.add('active');
    }
}

window.nextReview = function() {
    reviewCardsArray = document.querySelectorAll('.review-card');
    if (reviewCardsArray.length > 0) {
        currentReview = (currentReview + 1) % reviewCardsArray.length;
        showReview(currentReview);
    }
};

window.prevReview = function() {
    reviewCardsArray = document.querySelectorAll('.review-card');
    if (reviewCardsArray.length > 0) {
        currentReview = (currentReview - 1 + reviewCardsArray.length) % reviewCardsArray.length;
        showReview(currentReview);
    }
};

// ========================================
// FAQ ACCORDION
// ========================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(faq => faq.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    console.log(`✓ FAQ initialized (${faqItems.length} items)`);
}

// ========================================
// CONTACT FORM SUBMISSION - FIXED
// ========================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) {
        console.warn('⚠ Contact form not found');
        return;
    }

    // Remove action attribute to prevent traditional form submission
    contactForm.removeAttribute('action');
    contactForm.removeAttribute('method');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('📩 Contact form submitted');

        // Get form values
        const name = (document.getElementById('name') || {}).value?.trim() || '';
        const email = (document.getElementById('email') || {}).value?.trim() || '';
        const phone = (document.getElementById('phone') || {}).value?.trim() || '';
        const service = (document.getElementById('service') || {}).value?.trim() || '';
        const message = (document.getElementById('message') || {}).value?.trim() || '';

        console.log('Form data:', { name, email, phone, service, message: message.substring(0, 30) });

        // Validation
        if (!name) {
            window.showModal('Missing Information', 'Please enter your name.', 'warning');
            document.getElementById('name')?.focus();
            return;
        }

        if (!email) {
            window.showModal('Missing Information', 'Please enter your email address.', 'warning');
            document.getElementById('email')?.focus();
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            window.showModal('Invalid Email', 'Please enter a valid email address.', 'error');
            document.getElementById('email')?.focus();
            return;
        }

        if (!phone) {
            window.showModal('Missing Information', 'Please enter your phone number.', 'warning');
            document.getElementById('phone')?.focus();
            return;
        }

        if (!service) {
            window.showModal('Missing Information', 'Please select a service.', 'warning');
            document.getElementById('service')?.focus();
            return;
        }

        if (!message) {
            window.showModal('Missing Information', 'Please enter your message.', 'warning');
            document.getElementById('message')?.focus();
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('service', service);
        formData.append('message', message);

        // Show loading
        window.showLoading('Sending your message...');

        try {
            console.log('Sending request to /submit-contact...');

            const response = await fetch('/submit-contact', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);

            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('Server returned non-JSON response');
            }

            console.log('Response data:', data);

            window.hideLoading();

            if (data.success) {
                window.showModal('Thank You! 🎉', data.message, 'success');
                contactForm.reset();
            } else {
                window.showModal('Submission Failed', data.message || 'An error occurred. Please try again.', 'error');
            }

        } catch (error) {
            window.hideLoading();
            console.error('Contact form fetch error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.showModal(
                    'Connection Error',
                    'Cannot connect to server. Please check if the server is running and try again.',
                    'error'
                );
            } else {
                window.showModal(
                    'Error',
                    'An unexpected error occurred: ' + error.message,
                    'error'
                );
            }
        }
    });

    console.log('✓ Contact form initialized');
}

// ========================================
// REVIEW FORM SUBMISSION - FIXED
// ========================================
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');

    if (!reviewForm) {
        console.warn('⚠ Review form not found');
        return;
    }

    // Remove action attribute to prevent traditional form submission
    reviewForm.removeAttribute('action');
    reviewForm.removeAttribute('method');

    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('⭐ Review form submitted');

        const formData = new FormData(reviewForm);

        // Get values for validation
        const name = (formData.get('name') || '').trim();
        const email = (formData.get('email') || '').trim();
        const rating = formData.get('rating');
        const service = formData.get('service') || '';
        const message = (formData.get('message') || '').trim();

        console.log('Review data:', { name, email, rating, service, message: message.substring(0, 30) });

        // Validation
        if (!name) {
            window.showModal('Missing Information', 'Please enter your name.', 'warning');
            return;
        }

        if (!email) {
            window.showModal('Missing Information', 'Please enter your email address.', 'warning');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            window.showModal('Invalid Email', 'Please enter a valid email address.', 'error');
            return;
        }

        if (!rating) {
            window.showModal('Missing Rating', 'Please select a star rating.', 'warning');
            return;
        }

        if (!service) {
            window.showModal('Missing Information', 'Please select a service.', 'warning');
            return;
        }

        if (!message) {
            window.showModal('Missing Information', 'Please enter your review.', 'warning');
            return;
        }

        // Show loading
        window.showLoading('Submitting your review...');

        try {
            console.log('Sending request to /submit-review...');

            const response = await fetch('/submit-review', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            console.log('Response status:', response.status);

            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);

            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('Server returned non-JSON response');
            }

            console.log('Response data:', data);

            window.hideLoading();

            if (data.success) {
                window.showModal('Review Submitted! ⭐', data.message, 'success');
                reviewForm.reset();
            } else {
                window.showModal('Submission Failed', data.message || 'An error occurred. Please try again.', 'error');
            }

        } catch (error) {
            window.hideLoading();
            console.error('Review form fetch error:', error);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                window.showModal(
                    'Connection Error',
                    'Cannot connect to server. Please check if the server is running and try again.',
                    'error'
                );
            } else {
                window.showModal(
                    'Error',
                    'An unexpected error occurred: ' + error.message,
                    'error'
                );
            }
        }
    });

    console.log('✓ Review form initialized');
}

// ========================================
// LOAD REVIEWS FROM SERVER
// ========================================
async function loadReviews() {
    const reviewsContainer = document.querySelector('.reviews-slider');
    const dotsContainer = document.getElementById('reviewDotsContainer');
    const navigation = document.getElementById('reviewNavigation');

    if (!reviewsContainer) {
        console.warn('⚠ Reviews slider container not found');
        return;
    }

    try {
        console.log('Loading reviews from server...');

        const response = await fetch('/get-reviews', {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Loaded ${data.reviews ? data.reviews.length : 0} reviews`);

        if (data.success && data.reviews && data.reviews.length > 0) {
            // Clear container
            reviewsContainer.innerHTML = '';
            if (dotsContainer) dotsContainer.innerHTML = '';

            data.reviews.forEach((review, index) => {
                // Create review card
                const reviewCard = document.createElement('div');
                reviewCard.className = `review-card ${index === 0 ? 'active' : ''}`;

                // Generate stars HTML
                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= review.rating) {
                        starsHTML += '<i class="fas fa-star"></i>';
                    } else {
                        starsHTML += '<i class="far fa-star"></i>';
                    }
                }

                // Safe avatar (use initials as fallback)
                const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                const avatarNum = (index % 70) + 1;

                reviewCard.innerHTML = `
                    <div class="review-header">
                        <img src="https://i.pravatar.cc/100?img=${avatarNum}" 
                             alt="${review.name}" 
                             class="review-avatar"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div class="review-avatar-fallback" style="display:none; width:60px; height:60px; border-radius:50%; background:var(--primary-color); color:white; align-items:center; justify-content:center; font-size:1.2rem; font-weight:bold;">${initials}</div>
                        <div class="review-info">
                            <h4>${escapeHtml(review.name)}</h4>
                            <div class="review-stars">${starsHTML}</div>
                        </div>
                    </div>
                    <p class="review-text">"${escapeHtml(review.message)}"</p>
                    <span class="review-service">${escapeHtml(review.service)}</span>
                    ${review.is_featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                    <small style="color: var(--gray); display: block; margin-top: 10px;">${review.created_at}</small>
                `;

                reviewsContainer.appendChild(reviewCard);

                // Create navigation dot
                if (dotsContainer) {
                    const dot = document.createElement('span');
                    dot.className = `review-dot ${index === 0 ? 'active' : ''}`;
                    dot.setAttribute('data-slide', index);
                    dot.addEventListener('click', () => {
                        currentReview = index;
                        showReview(currentReview);
                    });
                    dotsContainer.appendChild(dot);
                }
            });

            // Show navigation if more than 1 review
            if (navigation && data.reviews.length > 1) {
                navigation.style.display = 'flex';

                // Setup navigation buttons
                const prevBtn = navigation.querySelector('.review-prev');
                const nextBtn = navigation.querySelector('.review-next');

                if (prevBtn) {
                    prevBtn.onclick = window.prevReview;
                }
                if (nextBtn) {
                    nextBtn.onclick = window.nextReview;
                }
            }

            // Auto slide
            if (data.reviews.length > 1) {
                setInterval(window.nextReview, 5000);
            }

            console.log(`✓ ${data.reviews.length} reviews loaded successfully`);

        } else {
            // No reviews
            reviewsContainer.innerHTML = `
                <div class="review-card active" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-comments" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: var(--dark-color); margin-bottom: 10px;">No Reviews Yet</h3>
                    <p style="color: var(--gray);">Be the first to share your experience with us!</p>
                </div>
            `;
            console.log('No approved reviews found');
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
        if (reviewsContainer) {
            reviewsContainer.innerHTML = `
                <div class="review-card active" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f5576c; margin-bottom: 20px;"></i>
                    <p style="color: var(--gray);">Unable to load reviews. Please refresh the page.</p>
                </div>
            `;
        }
    }
}

// ========================================
// HELPER - ESCAPE HTML
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// NEWSLETTER FORMS
// ========================================
function initNewsletterForms() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');

    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;

            const email = emailInput.value.trim();

            if (!email) {
                window.showModal('Missing Email', 'Please enter your email address.', 'warning');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                window.showModal('Invalid Email', 'Please enter a valid email address.', 'error');
                return;
            }

            window.showModal(
                'Subscribed! 🎉',
                `Thank you for subscribing with ${email}! You'll receive our latest updates.`,
                'success'
            );
            form.reset();
        });
    });

    console.log(`✓ Newsletter forms initialized (${newsletterForms.length})`);
}

// ========================================
// FORM VALIDATION FEEDBACK
// ========================================
function initFormValidation() {
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea');

    formInputs.forEach(input => {
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

    // Email validation
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

    console.log('✓ Form validation initialized');
}

// ========================================
// SCROLL TO TOP BUTTON
// ========================================
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        console.log('✓ Scroll top button initialized');
    }
}

// ========================================
// ANIMATION ON SCROLL
// ========================================
function initAnimationOnScroll() {
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

    // Active navigation highlight
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    console.log('✓ Scroll animations initialized');
}

// ========================================
// TOUCH SWIPE FOR REVIEWS
// ========================================
function initTouchSwipe() {
    const reviewsSlider = document.querySelector('.reviews-slider');

    if (reviewsSlider) {
        reviewsSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        reviewsSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;

            if (touchEndX < touchStartX - 50) {
                window.nextReview();
            } else if (touchEndX > touchStartX + 50) {
                window.prevReview();
            }
        }, { passive: true });

        console.log('✓ Touch swipe initialized');
    }
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT';

        if (!isInputFocused) {
            if (e.key === 'ArrowLeft') {
                window.prevReview();
            } else if (e.key === 'ArrowRight') {
                window.nextReview();
            }
        }
    });

    console.log('✓ Keyboard navigation initialized');
}

// ========================================
// PARALLAX EFFECT
// ========================================
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroVideos = document.querySelectorAll('.hero-video');

        heroVideos.forEach(video => {
            if (scrolled < window.innerHeight) {
                video.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.3}px))`;
            }
        });
    }, { passive: true });

    console.log('✓ Parallax initialized');
}

// ========================================
// PAGE LOAD FADE IN
// ========================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});

// ========================================
// PREVENT RIGHT-CLICK ON LOGO
// ========================================
document.querySelectorAll('.logo-img').forEach(logo => {
    logo.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================
console.log('%c👋 Welcome to Faith Legal Nepal!', 'color: #1a4d2e; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped with ❤️', 'color: #4f772d; font-size: 14px;');