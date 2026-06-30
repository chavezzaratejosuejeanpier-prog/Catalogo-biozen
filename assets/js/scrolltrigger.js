(function () {
  'use strict';

  function initParallaxSections() {
    var sections = document.querySelectorAll('.parallax-section');
    if (!sections.length) return;

    sections.forEach(function (section) {
      var bg = section.querySelector('[data-parallax-bg]') || section;
      var speed = parseFloat(section.getAttribute('data-speed')) || 0.3;

      gsap.to(bg, {
        y: function () {
          return section.offsetHeight * speed * 0.5;
        },
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    });
  }

  function initSectionReveals() {
    var sections = document.querySelectorAll('.section-reveal');
    if (!sections.length) return;

    sections.forEach(function (section) {
      gsap.fromTo(section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  }

  function initStaggerChildren() {
    var containers = document.querySelectorAll('.stagger-children');
    if (!containers.length) return;

    containers.forEach(function (container) {
      var children = container.children;
      if (!children.length) return;

      gsap.from(children, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  }

  function initProductCardsReveal() {
    var cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

    var containers = document.querySelectorAll('.product-card');
    var isGrid = containers.length > 0;
    if (!isGrid) return;

    gsap.from('.product-card', {
      opacity: 0,
      y: 50,
      scale: 0.95,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: '.products-section',
        start: 'top 75%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  function initTrustMatrix() {
    var items = document.querySelectorAll('.trust-matrix-item, .trust-item');
    if (!items.length) return;

    gsap.from(items, {
      opacity: 0,
      x: function () { return (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 30); },
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: {
        trigger: items[0].closest('section') || items[0].parentElement,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  function initTestimonialCards() {
    var cards = document.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    gsap.from(cards, {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.testimonials-section',
        start: 'top 78%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('.hero-stat-number');
    if (!counters.length) return;

    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'));
      if (!target) return;

      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          },
          onUpdate: function () {
            el.textContent = Number(this.targets()[0].textContent).toFixed(0) + '+';
          }
        }
      );
    });
  }

  function init() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    initParallaxSections();
    initSectionReveals();
    initStaggerChildren();
    initProductCardsReveal();
    initTrustMatrix();
    initTestimonialCards();
    initCounters();

    ScrollTrigger.refresh();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
