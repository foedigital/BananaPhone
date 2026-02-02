// ==========================================================================
//  BANANA PHONE - Scripts
// ==========================================================================

// ----------------------------------------------------------------------
//  LOADING SCREEN — runs before DOMContentLoaded
// ----------------------------------------------------------------------
(function () {
    const bar = document.getElementById('loader-bar');
    const loader = document.getElementById('loader');
    if (!bar || !loader) return;

    let progress = 0;

    // Tick progress forward in small increments, slowing as it nears 90%
    const tick = setInterval(() => {
        const remaining = 90 - progress;
        progress += remaining * 0.06;
        bar.style.width = progress + '%';
    }, 120);

    // Once the full page (images, iframes, etc.) has loaded, finish the bar
    window.addEventListener('load', () => {
        clearInterval(tick);
        bar.style.width = '100%';
        setTimeout(() => loader.classList.add('done'), 400);
        setTimeout(() => loader.remove(), 900);
    });
})();

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    //  NAVIGATION - scroll state + mobile menu
    // ----------------------------------------------------------------------
    const nav = document.getElementById('nav');
    const mobileBtn = document.querySelector('.nav-mobile-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    window.addEventListener('scroll', () => {
        if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 60);
    });

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('active');
            document.body.style.overflow = open ? 'hidden' : '';
            // animate hamburger
            const spans = mobileBtn.querySelectorAll('span');
            if (open) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                const spans = mobileBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }

    // ----------------------------------------------------------------------
    //  SMOOTH SCROLL for anchor links
    // ----------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ----------------------------------------------------------------------
    //  ACTIVE NAV HIGHLIGHTING
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    function highlightNav() {
        const scrollPos = window.scrollY + 150;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            navAnchors.forEach(a => {
                if (a.getAttribute('href') === `#${id}`) {
                    a.style.color = (scrollPos >= top && scrollPos < top + height) ? '#FFD700' : '';
                }
            });
        });
    }
    window.addEventListener('scroll', highlightNav);

    // ----------------------------------------------------------------------
    //  SCROLL REVEAL
    // ----------------------------------------------------------------------
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // ----------------------------------------------------------------------
    //  CONFETTI (on RSVP click)
    // ----------------------------------------------------------------------
    const confettiCanvas = document.getElementById('confetti-canvas');
    const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
    let particles = [];
    let animating = false;

    function resizeCanvas() {
        if (confettiCanvas) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.vx = (Math.random() - 0.5) * 20;
            this.vy = Math.random() * -15 - 5;
            this.gravity = 0.5;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 10;
            this.size = Math.random() * 8 + 4;
            this.color = ['#FFD700', '#FF1493', '#00BFFF', '#fff'][Math.floor(Math.random() * 4)];
            this.alpha = 1;
        }
        update() {
            this.vy += this.gravity; this.x += this.vx; this.y += this.vy;
            this.rotation += this.rotSpeed; this.vx *= 0.99; this.alpha -= 0.012;
        }
        draw(c) {
            c.save(); c.translate(this.x, this.y);
            c.rotate(this.rotation * Math.PI / 180);
            c.globalAlpha = Math.max(0, this.alpha);
            c.fillStyle = this.color;
            c.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
            c.restore();
        }
    }

    function burst(x, y, count = 60) {
        for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
        if (!animating) { animating = true; animateConfetti(); }
    }

    function animateConfetti() {
        if (!ctx) return;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        particles = particles.filter(p => p.alpha > 0 && p.y < confettiCanvas.height);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        if (particles.length > 0) requestAnimationFrame(animateConfetti);
        else animating = false;
    }

    // Attach to all primary CTA buttons
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(el => {
        el.addEventListener('click', e => {
            const r = el.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2);
        });
    });

    // ----------------------------------------------------------------------
    //  EPISODES CAROUSEL - arrow navigation
    // ----------------------------------------------------------------------
    const carousel = document.querySelector('.episodes-carousel');
    const arrowLeft = document.querySelector('.carousel-arrow-left');
    const arrowRight = document.querySelector('.carousel-arrow-right');

    if (carousel && arrowLeft && arrowRight) {
        const getScrollAmount = () => {
            const card = carousel.querySelector('.episode-card');
            if (!card) return 320;
            return card.offsetWidth + 24; // card width + gap
        };

        arrowLeft.addEventListener('click', () => {
            carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        arrowRight.addEventListener('click', () => {
            carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
    }

    // ----------------------------------------------------------------------
    //  CLIPS CAROUSEL - arrow navigation
    // ----------------------------------------------------------------------
    const clipsCarousel = document.querySelector('.clips-carousel');
    const clipsArrowLeft = document.querySelector('.clips-arrow-left');
    const clipsArrowRight = document.querySelector('.clips-arrow-right');

    if (clipsCarousel && clipsArrowLeft && clipsArrowRight) {
        const getClipsScrollAmount = () => {
            const card = clipsCarousel.querySelector('.clip-card');
            if (!card) return 220;
            return card.offsetWidth + 24;
        };

        clipsArrowLeft.addEventListener('click', () => {
            clipsCarousel.scrollBy({ left: -getClipsScrollAmount(), behavior: 'smooth' });
        });

        clipsArrowRight.addEventListener('click', () => {
            clipsCarousel.scrollBy({ left: getClipsScrollAmount(), behavior: 'smooth' });
        });
    }

    // ----------------------------------------------------------------------
    //  EASTER EGG - surprise button toggle
    // ----------------------------------------------------------------------
    const surpriseBtn = document.getElementById('btn-surprise');
    const easterEggVideo = document.getElementById('easter-egg-video');

    if (surpriseBtn && easterEggVideo) {
        surpriseBtn.addEventListener('click', () => {
            easterEggVideo.classList.toggle('visible');
            surpriseBtn.textContent = easterEggVideo.classList.contains('visible')
                ? 'HIDE THE SURPRISE'
                : 'FUN LITTLE SURPRISE';
        });
    }

    // ----------------------------------------------------------------------
    //  HERO VIDEO - sequential load, double-buffered seamless cycling
    // ----------------------------------------------------------------------
    const heroPanels = document.querySelectorAll('.hero-video-panel[data-clips]');
    const CYCLE_INTERVAL = 10000;

    function heroSrc(id) {
        return `https://iframe.videodelivery.net/${id}?autoplay=true&muted=true&loop=true&controls=false`;
    }

    function makeIframe(src) {
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media;';
        iframe.allowFullscreen = true;
        return iframe;
    }

    function initPanel(panel, existingIframe) {
        const clips = panel.dataset.clips.split(',');
        let idx = 0;

        // Use existing iframe from HTML, or create one for the first clip
        const active = existingIframe || (() => {
            const f = makeIframe(heroSrc(clips[0]));
            f.style.zIndex = '2';
            panel.appendChild(f);
            return f;
        })();

        const loaded = new Promise(resolve => {
            active.addEventListener('load', resolve, { once: true });
        });

        function startCycling() {
            if (clips.length < 2) return;

            let front = active;
            idx = 1;

            // Preload next clip behind the active one
            let back = makeIframe(heroSrc(clips[idx]));
            back.style.zIndex = '1';
            let backReady = false;
            back.addEventListener('load', () => { backReady = true; }, { once: true });
            panel.appendChild(back);

            setInterval(() => {
                if (!backReady) return;

                back.style.zIndex = '2';
                front.style.zIndex = '1';
                [front, back] = [back, front];

                idx = (idx + 1) % clips.length;
                backReady = false;
                back.addEventListener('load', () => { backReady = true; }, { once: true });
                back.src = heroSrc(clips[idx]);
            }, CYCLE_INTERVAL);
        }

        return { loaded, startCycling };
    }

    // Panel 1 iframe is already in the HTML for instant loading
    async function loadHeroPanels() {
        const cyclers = [];

        // Panel 1 — use the iframe already in HTML
        const p1Iframe = heroPanels[0] && heroPanels[0].querySelector('iframe');
        if (p1Iframe) {
            const p1 = initPanel(heroPanels[0], p1Iframe);
            await p1.loaded;
            cyclers.push(p1.startCycling);
        }

        // Panels 2 & 3 — inject sequentially after previous loads
        for (let i = 1; i < heroPanels.length; i++) {
            const p = initPanel(heroPanels[i]);
            await p.loaded;
            cyclers.push(p.startCycling);
        }

        cyclers.forEach(fn => fn());
    }

    if (heroPanels.length > 0) {
        loadHeroPanels();
    }
});
