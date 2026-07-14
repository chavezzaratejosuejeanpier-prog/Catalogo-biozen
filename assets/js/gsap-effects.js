(function () {
  'use strict';

  var isMobile = window.innerWidth < 768;
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  function getReducedFactor() {
    return isMobile ? 0.5 : 1;
  }

  function initFloatingSpheres() {
    var spheres = document.querySelectorAll('.sphere-1, .sphere-2, .sphere-3');
    if (!spheres.length) return;

    if (isMobile) {
      spheres.forEach(function (el) {
        gsap.set(el, { opacity: 0.15 });
      });
      return;
    }

    var configs = [
      { x: 15, y: -10, duration: 4 },
      { x: -12, y: 18, duration: 5.5 },
      { x: 20, y: -15, duration: 6 }
    ];

    spheres.forEach(function (el, i) {
      var cfg = configs[i % configs.length];
      gsap.to(el, {
        x: cfg.x,
        y: cfg.y,
        duration: cfg.duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  function initTopBarRotation() {
    var topBar = document.getElementById('smartTopBar');
    if (!topBar) return;

    var messages = topBar.querySelectorAll('span');
    if (!messages.length) return;

    var tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.6, ease: 'power2.inOut' } });

    messages.forEach(function (msg, i) {
      if (i > 0) {
        tl.to(messages[i - 1], { opacity: 0, display: 'none' });
      }
      tl.fromTo(msg, { opacity: 0, display: 'none' }, { opacity: 1, display: 'inline' });
      tl.to({}, { duration: 3.4 });
    });

    tl.to(messages[messages.length - 1], { opacity: 0, display: 'none' });
    tl.fromTo(messages[0], { opacity: 0, display: 'none' }, { opacity: 1, display: 'inline' });
    tl.to({}, { duration: 0.2 });
  }

  function initHeroEntrance() {
    var hero = document.querySelector('.hero-section');
    if (!hero) return;

    var factor = getReducedFactor();

    var badge = hero.querySelector('.hero-badge');
    var title = hero.querySelector('.hero-title');
    var subtitle = hero.querySelector('.hero-subtitle');
    var actions = hero.querySelector('.hero-actions');
    var stats = hero.querySelector('.hero-stats');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 * factor } });

    if (badge) tl.from(badge, { y: 30 * factor, opacity: 0, duration: 0.5 * factor });
    if (title) tl.from(title, { y: 40 * factor, opacity: 0 }, '-=0.2');
    if (subtitle) tl.from(subtitle, { y: 30 * factor, opacity: 0 }, '-=0.3');
    if (actions) tl.from(actions, { y: 20 * factor, opacity: 0 }, '-=0.2');
    if (stats) tl.from(stats, { y: 20 * factor, opacity: 0 }, '-=0.15');

    // Mobile: also fade in the hero visual
    if (isMobile) {
      var visual = hero.querySelector('.hero-image-wrapper, .hero-visual');
      if (visual) {
        tl.from(visual, { opacity: 0, scale: 0.9 }, '-=0.3');
      }
    }
  }

  function initMagneticButtons() {
    if (isTouchDevice) return;

    var buttons = document.querySelectorAll('.btn-magnetic');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var maxDist = 3;

        var dist = Math.min(Math.sqrt(x * x + y * y) / (Math.min(rect.width, rect.height) / 2), 1);
        var moveX = (x / (rect.width / 2)) * maxDist * dist;
        var moveY = (y / (rect.height / 2)) * maxDist * dist;

        gsap.to(btn, {
          x: moveX,
          y: moveY,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  function initCounterAnimation() {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-target'));
      if (isNaN(target)) return;

      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals')) || 0;

      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target,
          duration: isMobile ? 1.2 : 2,
          ease: 'power2.out',
          snap: { textContent: Math.pow(10, -decimals) },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          onUpdate: function () {
            el.textContent = prefix + Number(this.targets()[0].textContent).toFixed(decimals) + suffix;
          }
        }
      );
    });
  }

  function initHeroParallax() {
    if (isMobile) return;

    var hero = document.querySelector('.hero-section');
    if (!hero) return;

    var elements = hero.querySelectorAll('.hero-circle, .hero-image-wrapper, .hero-badge, .hero-title');

    elements.forEach(function (el) {
      var speed = el.classList.contains('hero-circle') ? 0.15 : 0.08;

      gsap.to(el, {
        y: function () {
          return window.innerHeight * speed * -0.5;
        },
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    });
  }

  function initFloatingElements() {
    if (isMobile) return;

    var floats = document.querySelectorAll('.float-element');
    if (!floats.length) return;

    floats.forEach(function (el) {
      var duration = parseFloat(el.getAttribute('data-duration')) || 3 + Math.random() * 2;
      var yAmount = parseFloat(el.getAttribute('data-y')) || 8 + Math.random() * 8;

      gsap.to(el, {
        y: yAmount,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  function initScrollReveals() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    reveals.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: isMobile ? 'top 90%' : 'top 85%',
        toggleClass: { targets: el, className: 'revealed' },
        once: true
      });
    });
  }

  /* ===== APP-LIKE PAGE TRANSITIONS ===== */
  function initPageTransitions() {
    // Smooth reveal for sections as they enter viewport
    var sections = document.querySelectorAll('section');
    sections.forEach(function (section) {
      if (section.classList.contains('hero-section')) return;
      gsap.fromTo(section,
        { opacity: 0, y: isMobile ? 30 : 60 },
        {
          opacity: 1,
          y: 0,
          duration: isMobile ? 0.6 : 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  }

  /* ===== PRODUCT CARD APP-LIKE REVEAL ===== */
  function initMobileCardReveal() {
    if (!isMobile) return;

    var cards = document.querySelectorAll('.product-card');
    cards.forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: i * 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  }

  /* ===== NAVBAR SCROLL ANIMATION ===== */
  function initNavbarAnimation() {
    var navbar = document.querySelector('.navbar-biozen');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        gsap.to(navbar, {
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
          duration: 0.3,
          overwrite: 'auto'
        });
      } else {
        gsap.to(navbar, {
          background: 'var(--glass-heavy)',
          boxShadow: 'none',
          duration: 0.3,
          overwrite: 'auto'
        });
      }
    }, { passive: true });
  }

  function initParallaxSections() {
    var sections = document.querySelectorAll('.parallax-section');
    if (!sections.length) return;
    sections.forEach(function (section) {
      var bg = section.querySelector('[data-parallax-bg]') || section;
      var speed = parseFloat(section.getAttribute('data-speed')) || 0.3;
      gsap.to(bg, {
        y: function () { return section.offsetHeight * speed * 0.5; },
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    });
  }

  function initStaggerChildren() {
    var containers = document.querySelectorAll('.stagger-children');
    if (!containers.length) return;
    containers.forEach(function (container) {
      var children = container.children;
      if (!children.length) return;
      gsap.from(children, {
        opacity: 0, y: 40, duration: 0.6, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: container, start: 'top 82%', toggleActions: 'play none none none', once: true }
      });
    });
  }

  function initTestimonialCards() {
    var cards = document.querySelectorAll('.testimonial-card');
    if (!cards.length) return;
    gsap.from(cards, {
      opacity: 0, y: 40, scale: 0.95, duration: 0.6, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: '.testimonials-section', start: 'top 78%', toggleActions: 'play none none none', once: true }
    });
  }

  function init() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    isMobile = window.innerWidth < 768;

    initFloatingSpheres();
    initTopBarRotation();
    initHeroEntrance();
    initMagneticButtons();
    initCounterAnimation();
    initHeroParallax();
    initFloatingElements();
    initScrollReveals();
    initPageTransitions();
    initMobileCardReveal();
    initNavbarAnimation();
    initParallaxSections();
    initStaggerChildren();
    initTestimonialCards();

    ScrollTrigger.refresh();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
