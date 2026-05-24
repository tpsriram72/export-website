document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navList.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        if (navList.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            navList.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // 3. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated to keep the state
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // 4. Form Submission Handling with FormSubmit.co AJAX API
    const formsToBind = [
        { selector: '.contact-form', subject: 'Contact Us Form Submission' },
        { selector: '#query-section form', subject: 'Product Inquiry Form Submission' },
        { selector: '.sample-request-form', subject: 'Product Sample Request Submission' }
    ];

    formsToBind.forEach(binding => {
        const formEls = document.querySelectorAll(binding.selector);
        formEls.forEach(formEl => {
            formEl.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = formEl.querySelector('button[type="submit"]') || formEl.querySelector('button');
                const originalText = btn.textContent;
                
                btn.textContent = 'Sending...';
                btn.disabled = true;
                btn.style.opacity = '0.8';
                
                // Collect values
                const payload = {
                    access_key: "e5a4bd54-7681-4095-acf7-f921510fbe27",
                    subject: binding.subject,
                };
                
                // Find all inputs, textareas, selects
                const fields = formEl.querySelectorAll('input, select, textarea');
                fields.forEach(field => {
                    const name = field.getAttribute('name') || field.id || field.placeholder || 'field';
                    if (field.type === 'checkbox') {
                        payload[name] = field.checked ? "Yes" : "No";
                    } else {
                        payload[name] = field.value;
                    }
                });
                
                // Dispatch the Email via Web3Forms AJAX in background
                fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error("Server response error");
                    }
                })
                 .then(data => {
                    // Lock height to prevent page layout jumping
                    const parent = formEl.parentElement;
                    if (parent) {
                        parent.style.minHeight = `${parent.offsetHeight}px`;
                    }

                    // Show success screen on the original page replacing form contents
                    formEl.innerHTML = `
                        <div class="success-message-box" style="text-align: center; padding: 40px 20px;">
                            <div style="font-size: 3.5rem; margin-bottom: 20px; color: #25D366;">✅</div>
                            <h4 style="font-size: 1.4rem; margin-bottom: 12px; color: var(--primary);">Thank You!</h4>
                            <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; max-width: 450px; margin: 0 auto 20px;">
                                Your request has been sent successfully. We will respond within 24 hours via WhatsApp or email.
                            </p>
                            <button class="btn btn-outline" style="padding: 10px 22px; font-size: 0.9rem;" onclick="window.location.reload()">Send Another Query</button>
                        </div>
                    `;

                    // Smoothly scroll the success message into view
                    formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                })
                .catch(error => {
                    console.error("Submission error:", error);
                    // Show error button state on failure
                    btn.textContent = 'Error, try again';
                    btn.style.backgroundColor = '#FF3B30';
                    btn.style.color = 'white';
                    btn.style.opacity = '1';
                    btn.disabled = false;
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }, 4000);
                });
            });
        });
    });
});
