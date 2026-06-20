(function () {
  'use strict';

  function initFloatingSpheres() {
    var spheres = document.querySelectorAll('.sphere-1, .sphere-2, .sphere-3');
    if (!spheres.length) return;

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

    var badge = hero.querySelector('.hero-badge');
    var title = hero.querySelector('.hero-title');
    var subtitle = hero.querySelector('.hero-subtitle');
    var actions = hero.querySelector('.hero-actions');
    var stats = hero.querySelector('.hero-stats');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });

    if (badge) tl.from(badge, { y: 30, opacity: 0, duration: 0.5 });
    if (title) tl.from(title, { y: 40, opacity: 0 }, '-=0.2');
    if (subtitle) tl.from(subtitle, { y: 30, opacity: 0 }, '-=0.3');
    if (actions) tl.from(actions, { y: 20, opacity: 0 }, '-=0.2');
    if (stats) tl.from(stats, { y: 20, opacity: 0 }, '-=0.15');
  }

  function initMagneticButtons() {
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
          duration: 2,
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
        start: 'top 85%',
        toggleClass: { targets: el, className: 'revealed' },
        once: true
      });
    });
  }

  function init() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    initFloatingSpheres();
    initTopBarRotation();
    initHeroEntrance();
    initMagneticButtons();
    initCounterAnimation();
    initHeroParallax();
    initFloatingElements();
    initScrollReveals();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
