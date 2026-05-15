document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navBackdrop = document.getElementById('nav-backdrop');
    const revealItems = document.querySelectorAll('.reveal');
    const bookingForms = document.querySelectorAll('[data-booking-form]');
    const inquiryForms = document.querySelectorAll('[data-inquiry-form]');
    const filterBars = document.querySelectorAll('[data-filter-bar]');
    const galleryItems = document.querySelectorAll('[data-lightbox]');
    const bookingCalculator = document.querySelector('[data-booking-calculator]');

    const mobileNavQuery = window.matchMedia('(max-width: 1050px)');

    const testimonials = [
        {
            quote: 'Guests consistently mention the friendly team, peaceful garden setting, and comfortable rooms.',
            name: 'Review theme',
            title: 'Guest stays in Ndola'
        },
        {
            quote: 'A practical, welcoming base for Copperbelt travel, with breakfast, meals, and helpful support on site.',
            name: 'Review theme',
            title: 'Business and leisure visits'
        },
        {
            quote: 'Clean, functional accommodation in Kansenshi with the essentials guests expect for a smooth stay.',
            name: 'Review theme',
            title: 'Short and extended stays'
        }
    ];

    let menuScrollLockY = 0;

    const showToast = (message) => {
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    };

    const setHeaderState = () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 24);
    };

    const syncNavInert = (isOpen) => {
        if (!navLinks || !('inert' in navLinks)) return;
        const mobile = mobileNavQuery.matches;
        navLinks.inert = Boolean(mobile && !isOpen);
    };

    const setMenuState = (isOpen) => {
        if (!menuToggle || !navLinks) return;

        const wasOpen = document.body.classList.contains('nav-open');

        if (isOpen) {
            menuScrollLockY = window.scrollY;
            document.body.style.setProperty('position', 'fixed');
            document.body.style.setProperty('top', `-${menuScrollLockY}px`);
            document.body.style.setProperty('width', '100%');
        } else if (wasOpen) {
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('top');
            document.body.style.removeProperty('width');
            window.scrollTo(0, menuScrollLockY);
        }

        document.body.classList.toggle('nav-open', isOpen);
        navLinks.classList.toggle('active', isOpen);
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

        if (navBackdrop) {
            navBackdrop.hidden = !isOpen;
            navBackdrop.setAttribute('aria-hidden', String(!isOpen));
        }

        syncNavInert(isOpen);

        if (isOpen && mobileNavQuery.matches) {
            const firstLink = navLinks.querySelector('a');
            requestAnimationFrame(() => firstLink?.focus({ preventScroll: true }));
        } else if (!isOpen && wasOpen) {
            requestAnimationFrame(() => menuToggle.focus({ preventScroll: true }));
        }
    };

    const sendWhatsApp = (message) => {
        window.location.href = `https://wa.me/260963532271?text=${encodeURIComponent(message)}`;
    };

    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });

    syncNavInert(false);

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => setMenuState(!document.body.classList.contains('nav-open')));
        navLinks.addEventListener('click', (event) => {
            if (event.target.matches('a')) setMenuState(false);
        });
    }

    if (navBackdrop) navBackdrop.addEventListener('click', () => setMenuState(false));

    const onViewportNavResize = () => {
        if (!mobileNavQuery.matches && document.body.classList.contains('nav-open')) {
            setMenuState(false);
        } else {
            syncNavInert(document.body.classList.contains('nav-open'));
        }
    };
    window.addEventListener('resize', onViewportNavResize, { passive: true });
    if (typeof mobileNavQuery.addEventListener === 'function') {
        mobileNavQuery.addEventListener('change', onViewportNavResize);
    } else if (typeof mobileNavQuery.addListener === 'function') {
        mobileNavQuery.addListener(onViewportNavResize);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
            closeLightbox();
        }
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        const href = link.getAttribute('href');
        if (href === current || (current === 'index.html' && href === './')) {
            link.classList.add('active');
        }
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('visible'));
    }

    bookingForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const data = new FormData(form);
            const arrival = data.get('arrival');
            const departure = data.get('departure');
            const guests = data.get('guests') || 'guests';
            const room = data.get('room') || 'a room';
            const purpose = data.get('purpose') || 'General booking';
            const addons = Array.from(form.querySelectorAll('[name="addons"]:checked')).map((addon) => addon.parentElement?.textContent?.trim()).filter(Boolean).join(', ');

            if (!arrival || !departure) {
                showToast('Please select your arrival and departure dates.');
                return;
            }

            if (new Date(departure) <= new Date(arrival)) {
                showToast('Departure should be after your arrival date.');
                return;
            }

            sendWhatsApp(`Hello Spree Guest House, I would like to check availability for ${room} from ${arrival} to ${departure} for ${guests}. Purpose: ${purpose}. Add-ons: ${addons || 'None'}.`);
        });
    });

    inquiryForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const data = new FormData(form);
            const name = data.get('name') || '';
            const phone = data.get('phone') || '';
            const email = data.get('email') || '';
            const purpose = data.get('purpose') || 'Inquiry';
            const message = data.get('message') || '';
            const body = `Hello Spree Guest House, I would like to make an inquiry.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nPurpose: ${purpose}\n\nMessage:\n${message}`;
            sendWhatsApp(body);
            showToast('Opening WhatsApp with your inquiry details.');
        });
    });

    let testimonialIndex = 0;
    const testimonialQuote = document.getElementById('testimonial-quote');
    const testimonialName = document.getElementById('testimonial-name');
    const testimonialTitle = document.getElementById('testimonial-title');
    const updateTestimonial = (direction = 1) => {
        if (!testimonialQuote || !testimonialName || !testimonialTitle) return;
        testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length;
        const active = testimonials[testimonialIndex];
        testimonialQuote.style.opacity = '0';
        window.setTimeout(() => {
            testimonialQuote.textContent = active.quote;
            testimonialName.textContent = active.name;
            testimonialTitle.textContent = active.title;
            testimonialQuote.style.opacity = '1';
        }, 180);
    };

    const prev = document.getElementById('testimonial-prev');
    const next = document.getElementById('testimonial-next');
    if (prev && next) {
        prev.addEventListener('click', () => updateTestimonial(-1));
        next.addEventListener('click', () => updateTestimonial(1));
        window.setInterval(() => updateTestimonial(1), 6500);
    }

    filterBars.forEach((bar) => {
        const targetSelector = bar.dataset.filterTarget || '[data-category]';
        const items = document.querySelectorAll(targetSelector);
        bar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-filter]');
            if (!button) return;
            const filter = button.dataset.filter;
            bar.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.toggle('active', btn === button));
            items.forEach((item) => {
                const categories = (item.dataset.category || '').split(' ');
                item.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
            });
        });
    });

    let lightbox;
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox?.remove();
            lightbox = null;
        }, 220);
    }

    galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const src = item.dataset.src;
            const alt = item.dataset.alt || 'Spree Guest House media';
            if (!src) return;

            lightbox = document.createElement('div');
            lightbox.className = 'lightbox active';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');

            const content = document.createElement('div');
            content.className = 'lightbox-content';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'lightbox-close';
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Close media');
            closeBtn.innerHTML = '&times;';

            const img = document.createElement('img');
            img.src = src;
            img.alt = alt;

            content.append(closeBtn, img);
            lightbox.appendChild(content);
            document.body.appendChild(lightbox);
            lightbox.addEventListener('click', (event) => {
                if (event.target === lightbox || event.target.closest('.lightbox-close')) closeLightbox();
            });
        });
    });

    if (bookingCalculator) {
        const room = bookingCalculator.querySelector('[name="room"]');
        const nights = bookingCalculator.querySelector('[name="nights"]');
        const guests = bookingCalculator.querySelector('[name="guests"]');
        const addons = bookingCalculator.querySelectorAll('[name="addons"]');
        const roomOut = document.getElementById('summary-room');
        const nightsOut = document.getElementById('summary-nights');
        const guestsOut = document.getElementById('summary-guests');
        const addonsOut = document.getElementById('summary-addons');
        const totalOut = document.getElementById('summary-total');

        const updateSummary = () => {
            const rate = Number(room?.selectedOptions[0]?.dataset.rate || 850);
            const nightCount = Math.max(1, Number(nights?.value || 1));
            const guestCount = guests?.value || '2';
            const addonTotal = Array.from(addons).filter((addon) => addon.checked).reduce((sum, addon) => sum + Number(addon.dataset.price || 0), 0);
            const total = (rate * nightCount) + addonTotal;

            if (roomOut) roomOut.textContent = room?.value || 'Classic Guest Room';
            if (nightsOut) nightsOut.textContent = `${nightCount} night${nightCount > 1 ? 's' : ''}`;
            if (guestsOut) guestsOut.textContent = `${guestCount} guest${guestCount === '1' ? '' : 's'}`;
            if (addonsOut) addonsOut.textContent = addonTotal ? `K${addonTotal.toLocaleString()}` : 'None selected';
            if (totalOut) totalOut.textContent = `K${total.toLocaleString()}`;
        };

        bookingCalculator.addEventListener('input', updateSummary);
        bookingCalculator.addEventListener('change', updateSummary);
        updateSummary();
    }

    const heroParallax = document.querySelector('[data-hero-parallax]');
    const heroParallaxImg = heroParallax?.querySelector('.hero-image--parallax');
    const reduceMotionHero = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (heroParallax && heroParallaxImg && !reduceMotionHero) {
        const maxShift = 100;
        const onHeroScroll = () => {
            const y = Math.min(window.scrollY * 0.22, maxShift);
            heroParallaxImg.style.transform = `translate3d(0, ${y}px, 0) scale(1.08)`;
        };
        onHeroScroll();
        window.addEventListener('scroll', onHeroScroll, { passive: true });
    } else if (heroParallaxImg && reduceMotionHero) {
        heroParallaxImg.style.transform = 'translate3d(0, 0, 0) scale(1.06)';
    }
});
