// ========================================
// GLOBAL VARIABLES
// ========================================
let currentVideo = 0;
let currentReview = 0;
let counterStarted = false;
let touchStartX = 0;
let touchEndX = 0;

// ========================================
// MOBILE MENU TOGGLE
// ========================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
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
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ========================================
// SMOOTH SCROLLING
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
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

// ========================================
// CUSTOM MODAL FUNCTIONS (FIXED)
// ========================================
window.showModal = function(title, message, type = 'success') {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    
    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements not found');
        alert(message); // Fallback to alert
        return;
    }
    
    // Set content
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Remove all type classes
    modalIcon.classList.remove('success', 'error', 'warning', 'info');
    
    // Add appropriate class and icon
    modalIcon.classList.add(type);
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    modalIcon.innerHTML = `<i class="fas ${icons[type]}"></i>`;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log(`Modal shown: ${title} - ${type}`);
};

window.hideModal = function() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Modal hidden');
    }
};

window.showLoading = function(text = 'Sending your message...') {
    const loadingModal = document.getElementById('loadingModal');
    const loadingText = loadingModal ? loadingModal.querySelector('.loading-text') : null;
    
    if (loadingModal && loadingText) {
        loadingText.textContent = text;
        loadingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Loading modal shown');
    }
};

window.hideLoading = function() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Loading modal hidden');
    }
};

// ========================================
// MODAL EVENT LISTENERS SETUP
// ========================================
function setupModalListeners() {
    console.log('Setting up modal listeners...');
    
    // Modal OK button
    const modalButton = document.getElementById('modalButton');
    if (modalButton) {
        modalButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Modal button clicked');
            window.hideModal();
        });
        console.log('✓ Modal button listener attached');
    } else {
        console.warn('⚠ Modal button not found');
    }

    // Modal overlay click
    const customModal = document.getElementById('customModal');
    if (customModal) {
        customModal.addEventListener('click', function(e) {
            if (e.target === customModal || e.target.classList.contains('modal-overlay')) {
                console.log('Modal overlay clicked');
                window.hideModal();
            }
        });
        console.log('✓ Modal overlay listener attached');
    }

    // Prevent modal content clicks from closing
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        console.log('✓ Modal container listener attached');
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.hideModal();
        }
    });
    console.log('✓ ESC key listener attached');
}

// ========================================
// VIDEO SLIDER
// ========================================
const videos = document.querySelectorAll('.hero-video');
const videoDots = document.querySelectorAll('.video-dot');

function changeVideo(index) {
    videos.forEach((video, i) => {
        video.classList.remove('active');
        if (videoDots[i]) {
            videoDots[i].classList.remove('active');
        }
        if (i === index) {
            video.classList.add('active');
            if (videoDots[i]) {
                videoDots[i].classList.add('active');
            }
            video.play().catch(e => console.log('Video play error:', e));
        } else {
            video.pause();
        }
    });
}

// Auto change video every 10 seconds
if (videos.length > 0) {
    setInterval(() => {
        currentVideo = (currentVideo + 1) % videos.length;
        changeVideo(currentVideo);
    }, 10000);

    // Manual video control
    videoDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentVideo = index;
            changeVideo(currentVideo);
        });
    });

    // Initialize first video
    changeVideo(0);
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

// Intersection Observer for Counter
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
// REVIEWS SLIDER
// ========================================
const reviewCards = document.querySelectorAll('.review-card');
const reviewDots = document.querySelectorAll('.review-dot');
const reviewPrev = document.querySelector('.review-prev');
const reviewNext = document.querySelector('.review-next');

function showReview(index) {
    reviewCards.forEach((card, i) => {
        card.classList.remove('active');
        if (reviewDots[i]) {
            reviewDots[i].classList.remove('active');
        }
    });
    
    if (reviewCards[index]) {
        reviewCards[index].classList.add('active');
    }
    if (reviewDots[index]) {
        reviewDots[index].classList.add('active');
    }
}

function nextReview() {
    if (reviewCards.length > 0) {
        currentReview = (currentReview + 1) % reviewCards.length;
        showReview(currentReview);
    }
}

function prevReview() {
    if (reviewCards.length > 0) {
        currentReview = (currentReview - 1 + reviewCards.length) % reviewCards.length;
        showReview(currentReview);
    }
}

if (reviewNext && reviewPrev) {
    reviewNext.addEventListener('click', nextReview);
    reviewPrev.addEventListener('click', prevReview);
}

// Manual review dots control
reviewDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentReview = index;
        showReview(currentReview);
    });
});

// Auto slide reviews every 5 seconds
if (reviewCards.length > 0) {
    setInterval(nextReview, 5000);
    showReview(0); // Initialize first review
}

// ========================================
// FAQ ACCORDION
// ========================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }
});

// ========================================
// CONTACT FORM SUBMISSION (FIXED)
// ========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('Form submitted');
        
        // Get all form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const serviceInput = document.getElementById('service');
        const messageInput = document.getElementById('message');
        
        // Check if elements exist
        if (!nameInput || !emailInput || !phoneInput || !serviceInput || !messageInput) {
            window.showModal('Form Error', 'Please refresh the page and try again.', 'error');
            return;
        }
        
        // Get values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const service = serviceInput.value;
        const message = messageInput.value.trim();
        
        console.log('Form data:', { name, email, phone, service, message });
        
        // Client-side validation
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
        
        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
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
        
        // Create FormData object
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('service', service);
        formData.append('message', message);
        
        // Show loading modal
        window.showLoading('Sending your message...');
        
        try {
            console.log('Sending request to server...');
            
            const response = await fetch('/submit-contact', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response received:', response.status, response.statusText);
            
            // Try to parse response as JSON
            let data;
            try {
                const responseText = await response.text();
                console.log('Response text:', responseText);
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Server returned invalid response. Please try again.');
            }
            
            console.log('Response data:', data);
            
            // Hide loading
            window.hideLoading();
            
            if (data.success) {
                // Show success modal
                window.showModal(
                    'Thank You!', 
                    data.message,
                    'success'
                );
                
                // Reset form
                contactForm.reset();
            } else {
                // Show error modal
                window.showModal(
                    'Submission Failed',
                    data.message || 'An error occurred. Please try again.',
                    'error'
                );
            }
            
        } catch (error) {
            // Hide loading
            window.hideLoading();
            
            console.error('Fetch Error:', error);
            
            // Show user-friendly error
            window.showModal(
                'Error',
                error.message || 'Network error. Please check your connection and try again.',
                'error'
            );
        }
    });
    
    console.log('✓ Contact form listener attached');
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
        
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            window.showModal('Invalid Email', 'Please enter a valid email address', 'error');
            return;
        }
        
        window.showModal(
            'Subscribed!',
            `Thank you for subscribing with ${email}! You'll receive our latest updates.`,
            'success'
        );
        form.reset();
    });
});

// ========================================
// FORM VALIDATION FEEDBACK
// ========================================
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

// Email validation for contact form
const contactEmailInput = document.getElementById('email');
if (contactEmailInput) {
    contactEmailInput.addEventListener('blur', () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(contactEmailInput.value) && contactEmailInput.value !== '') {
            contactEmailInput.style.borderColor = '#e74c3c';
        }
    });
}

// Phone validation
const contactPhoneInput = document.getElementById('phone');
if (contactPhoneInput) {
    contactPhoneInput.addEventListener('input', () => {
        // Allow only numbers, +, -, and spaces
        contactPhoneInput.value = contactPhoneInput.value.replace(/[^0-9+\-\s]/g, '');
    });
}

// ========================================
// SCROLL TO TOP BUTTON
// ========================================
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
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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

// Observe all service cards and other elements
document.querySelectorAll('.service-card, .step, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ========================================
// LOADING ANIMATION
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
const logoImages = document.querySelectorAll('.logo-img');
logoImages.forEach(logo => {
    if (logo) {
        logo.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
});

// ========================================
// LAZY LOAD VIDEOS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Mute videos for autoplay
    videos.forEach(video => {
        video.muted = true;
        video.setAttribute('playsinline', '');
    });
});

// ========================================
// TOUCH SWIPE FOR MOBILE (Reviews)
// ========================================
const reviewsSlider = document.querySelector('.reviews-slider');

if (reviewsSlider) {
    reviewsSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    reviewsSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left - next review
            nextReview();
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe right - previous review
            prevReview();
        }
    }
}

// ========================================
// ACTIVE NAVIGATION HIGHLIGHT
// ========================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavigation() {
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
}

window.addEventListener('scroll', highlightNavigation);

// ========================================
// PARALLAX EFFECT FOR HERO
// ========================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVideos = document.querySelectorAll('.hero-video');
    
    heroVideos.forEach(video => {
        if (scrolled < window.innerHeight) {
            video.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.5}px))`;
        }
    });
});

// ========================================
// PRELOAD NEXT VIDEO
// ========================================
function preloadNextVideo() {
    if (videos.length > 0) {
        const nextIndex = (currentVideo + 1) % videos.length;
        if (videos[nextIndex]) {
            videos[nextIndex].load();
        }
    }
}

if (videos.length > 0) {
    videos.forEach((video, index) => {
        video.addEventListener('loadeddata', () => {
            if (index === currentVideo) {
                preloadNextVideo();
            }
        });
    });
}

// ========================================
// KEYBOARD NAVIGATION FOR REVIEWS
// ========================================
document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement.tagName === 'INPUT' || 
                          activeElement.tagName === 'TEXTAREA' || 
                          activeElement.tagName === 'SELECT';
    
    if (!isInputFocused) {
        if (e.key === 'ArrowLeft') {
            prevReview();
        } else if (e.key === 'ArrowRight') {
            nextReview();
        }
    }
});

// ========================================
// ERROR HANDLING FOR VIDEOS
// ========================================
videos.forEach((video, index) => {
    video.addEventListener('error', (e) => {
        console.error(`Error loading video ${index + 1}:`, e);
        // Hide video controls if video fails to load
        if (videoDots[index]) {
            videoDots[index].style.display = 'none';
        }
    });
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================
console.log('%c👋 Welcome to Faith Legal Nepal!', 'color: #1a4d2e; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped with ❤️', 'color: #4f772d; font-size: 14px;');

// ========================================
// INITIALIZE ALL COMPONENTS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Faith Legal Nepal...');
    
    // Setup modal listeners
    setupModalListeners();
    
    // Check if all required elements exist
    const requiredElements = [
        { name: 'Header', element: header },
        { name: 'Navigation Menu', element: navMenu },
        { name: 'Contact Form', element: contactForm },
        { name: 'Scroll Top Button', element: scrollTopBtn },
        { name: 'Custom Modal', element: document.getElementById('customModal') },
        { name: 'Loading Modal', element: document.getElementById('loadingModal') },
        { name: 'Modal Button', element: document.getElementById('modalButton') }
    ];

    let allElementsFound = true;
    
    requiredElements.forEach(item => {
        if (!item.element) {
            console.warn(`⚠️ Warning: ${item.name} not found!`);
            allElementsFound = false;
        } else {
            console.log(`✓ ${item.name} loaded`);
        }
    });
    
    // Log statistics
    console.log(`\n📊 Component Statistics:`);
    console.log(`   Videos: ${videos.length}`);
    console.log(`   Reviews: ${reviewCards.length}`);
    console.log(`   FAQ Items: ${faqItems.length}`);
    console.log(`   Stats Counters: ${counters.length}`);
    console.log(`   Newsletter Forms: ${newsletterForms.length}`);
    
    if (allElementsFound) {
        console.log('\n✅ All components initialized successfully!');
    } else {
        console.log('\n⚠️ Some components missing - check warnings above');
    }
    
    console.log('\n🎉 Faith Legal Nepal is ready!');
});

// ========================================
// Reviews
// ========================================
async function loadReviews() {
    try {
        const response = await fetch('/get-reviews');
        const data = await response.json();
        
        if (data.success && data.reviews.length > 0) {
            const reviewsContainer = document.querySelector('.reviews-slider');
            const dotsContainer = document.getElementById('reviewDotsContainer');
            const navigation = document.getElementById('reviewNavigation');
            
            // Clear loading message
            reviewsContainer.innerHTML = '';
            dotsContainer.innerHTML = '';
            
            // Create review cards
            data.reviews.forEach((review, index) => {
                const reviewCard = document.createElement('div');
                reviewCard.className = `review-card ${index === 0 ? 'active' : ''}`;
                
                // Generate stars
                let starsHTML = '';
                for (let i = 0; i < 5; i++) {
                    if (i < review.rating) {
                        starsHTML += '<i class="fas fa-star"></i>';
                    } else {
                        starsHTML += '<i class="far fa-star"></i>';
                    }
                }
                
                // Generate avatar URL
                const avatarUrl = `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70) + 1}`;
                
                reviewCard.innerHTML = `
                    <div class="review-header">
                        <img src="${avatarUrl}" alt="${review.name}" class="review-avatar">
                        <div class="review-info">
                            <h4>${review.name}</h4>
                            <div class="review-stars">${starsHTML}</div>
                        </div>
                    </div>
                    <p class="review-text">"${review.message}"</p>
                    <span class="review-service">${review.service}</span>
                    ${review.is_featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                `;
                
                reviewsContainer.appendChild(reviewCard);
                
                // Create dot
                const dot = document.createElement('span');
                dot.className = `review-dot ${index === 0 ? 'active' : ''}`;
                dot.setAttribute('data-slide', index);
                dot.addEventListener('click', () => {
                    currentReview = index;
                    showReview(currentReview);
                });
                dotsContainer.appendChild(dot);
            });
            
            // Show navigation
            navigation.style.display = 'flex';
            
            // Update global variables
            window.reviewCards = document.querySelectorAll('.review-card');
            window.reviewDots = document.querySelectorAll('.review-dot');
            
            console.log(`✓ Loaded ${data.reviews.length} approved reviews`);
        } else {
            // No reviews yet
            const reviewsContainer = document.querySelector('.reviews-slider');
            reviewsContainer.innerHTML = `
                <div class="review-card active" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-comments" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: var(--dark-color); margin-bottom: 10px;">No reviews yet</h3>
                    <p style="color: var(--gray);">Be the first to leave a review!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        const reviewsContainer = document.querySelector('.reviews-slider');
        reviewsContainer.innerHTML = `
            <div class="review-card active" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f5576c; margin-bottom: 20px;"></i>
                <p style="color: var(--gray);">Error loading reviews. Please try again later.</p>
            </div>
        `;
    }
}

// ========================================
// REVIEW FORM SUBMISSION
// ========================================
const reviewForm = document.getElementById('reviewForm');

if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(reviewForm);
        
        // Validate rating
        const rating = formData.get('rating');
        if (!rating) {
            window.showModal('Missing Rating', 'Please select a star rating', 'warning');
            return;
        }
        
        // Show loading
        window.showLoading('Submitting your review...');
        
        try {
            const response = await fetch('/submit-review', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            window.hideLoading();
            
            if (data.success) {
                window.showModal('Review Submitted!', data.message, 'success');
                reviewForm.reset();
            } else {
                window.showModal('Submission Failed', data.message, 'error');
            }
        } catch (error) {
            window.hideLoading();
            console.error('Error submitting review:', error);
            window.showModal('Network Error', 'Please try again later.', 'error');
        }
    });
}

// Load reviews when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
});