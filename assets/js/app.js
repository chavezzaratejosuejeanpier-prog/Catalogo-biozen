(function () {
  'use strict';

  var isMobile = window.innerWidth < 768;
  var lastScrollY = 0;
  var scrollDirection = 'down';

  /* ================================
     BOTTOM NAVIGATION
  ================================ */

  function initBottomNav() {
    var nav = document.querySelector('.app-bottom-nav');
    if (!nav) return;

    var items = nav.querySelectorAll('.nav-item');

    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var target = item.getAttribute('data-target');
        if (!target) return;
        var section = document.querySelector(target);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    var sections = [];
    items.forEach(function (item) {
      var target = item.getAttribute('data-target');
      if (target) {
        var el = document.querySelector(target);
        if (el) sections.push({ el: el, item: item });
      }
    });

    function updateActiveNav() {
      var scrollPos = window.scrollY + 120;
      var current = null;

      sections.forEach(function (s) {
        var top = s.el.offsetTop;
        var height = s.el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = s.item;
        }
      });

      items.forEach(function (item) {
        item.classList.toggle('active', item === current);
      });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    setTimeout(function () {
      nav.classList.add('visible');
    }, 300);
  }

  /* ================================
     SMART CTA (WhatsApp Float)
  ================================ */

  function initSmartCTA() {
    var floatBtn = document.getElementById('whatsappFloat');
    if (!floatBtn) return;

    floatBtn.classList.add('smart-visible');

    window.addEventListener('scroll', function () {
      var currentScroll = window.scrollY;
      scrollDirection = currentScroll > lastScrollY ? 'down' : 'up';
      lastScrollY = currentScroll;

      if (scrollDirection === 'down' && currentScroll > 200) {
        floatBtn.classList.remove('smart-visible');
        floatBtn.classList.add('smart-hidden');
      } else {
        floatBtn.classList.remove('smart-hidden');
        floatBtn.classList.add('smart-visible');
      }
    }, { passive: true });
  }

  /* ================================
     FULLSCREEN PRODUCT OVERLAY
  ================================ */

  var overlayState = {
    isOpen: false,
    currentProduct: null,
    currentSlide: 0,
    dragStartY: 0,
    dragOffset: 0,
    isDragging: false
  };

  function openProductOverlay(productId) {
    var product = window.products ? window.products.find(function (p) { return p.id === productId; }) : null;
    if (!product) return;

    overlayState.currentProduct = product;
    overlayState.currentSlide = 0;
    overlayState.isOpen = true;

    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;

    document.body.style.overflow = 'hidden';
    document.body.classList.add('overlay-open');

    overlay.querySelector('.overlay-title').textContent = product.title;
    var catEl = overlay.querySelector('.overlay-category');
    if (catEl) catEl.textContent = product.cat || '';

    var track = overlay.querySelector('.gallery-track');
    track.innerHTML = '';
    product.media.forEach(function (m, i) {
      var slide = document.createElement('div');
      slide.className = 'gallery-slide';
      var img = document.createElement('img');
      img.src = m.src;
      img.alt = product.title + ' - ' + (i + 1);
      img.width = 400;
      img.height = 400;
      img.loading = 'lazy';
      img.onload = function () { slide.classList.add('loaded'); };
      if (img.complete) slide.classList.add('loaded');
      slide.appendChild(img);
      track.appendChild(slide);
    });

    var dotsContainer = overlay.querySelector('.gallery-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      if (product.media.length > 1) {
        product.media.forEach(function (_, i) {
          var dot = document.createElement('span');
          dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
          dotsContainer.appendChild(dot);
        });
      }
    }

    var counter = overlay.querySelector('.gallery-counter');
    if (counter) {
      counter.textContent = product.media.length > 1 ? '1 / ' + product.media.length : '';
    }

    updateGalleryPosition(0, false);

    var benefitsBody = overlay.querySelector('.overlay-section-body.benefits-body');
    if (benefitsBody) {
      benefitsBody.innerHTML = product.full ? product.full.replace(/<br>/g, '') : '';
      if (benefitsBody.querySelector('ul')) {
      } else {
        var items = product.full ? product.full.split('<br>').filter(Boolean) : [];
        if (items.length) {
          var ul = document.createElement('ul');
          items.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item.replace(/^•\s*/, '').trim();
            ul.appendChild(li);
          });
          benefitsBody.innerHTML = '';
          benefitsBody.appendChild(ul);
        }
      }
    }

    overlay.querySelector('.ingredients-body').textContent = product.ing || '';
    overlay.querySelector('.usage-body').textContent = product.use || '';

    var whatsappBtn = overlay.querySelector('.overlay-whatsapp-btn');
    if (whatsappBtn) {
      whatsappBtn.onclick = function () {
        if (typeof openWhatsApp === 'function') openWhatsApp(product.title);
      };
    }

    overlay.style.visibility = 'visible';
    overlay.style.pointerEvents = 'auto';

    if (typeof gsap !== 'undefined') {
      gsap.set(overlay, { y: '100%' });
      gsap.to(overlay, {
        y: '0%',
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    } else {
      overlay.style.transform = 'translateY(0)';
      overlay.style.transition = 'transform 0.25s ease';
    }

    if (typeof TrackProductView === 'function') {
      TrackProductView(product.id, product.title);
    }

    initOverlayGalleryGestures();
  }

  function closeProductOverlay() {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;

    overlayState.isOpen = false;
    document.body.style.overflow = '';
    document.body.classList.remove('overlay-open');

    overlay.style.visibility = 'hidden';
    overlay.style.pointerEvents = 'none';
    overlay.style.transform = '';
    overlay.style.transition = '';
    if (typeof gsap !== 'undefined') {
      gsap.set(overlay, { y: '100%', clearProps: 'all' });
    }
  }

  function updateGalleryPosition(index, animate) {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;
    var track = overlay.querySelector('.gallery-track');
    if (!track) return;

    overlayState.currentSlide = index;
    var offset = -index * 100;

    if (animate === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
    }
    track.style.transform = 'translateX(' + offset + '%)';

    var dots = overlay.querySelectorAll('.gallery-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === index);
    });

    var counter = overlay.querySelector('.gallery-counter');
    if (counter && overlayState.currentProduct) {
      counter.textContent = (index + 1) + ' / ' + overlayState.currentProduct.media.length;
    }

    if (animate === false) {
      requestAnimationFrame(function () {
        track.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
      });
    }
  }

  /* ================================
     GALLERY SWIPE GESTURES
   ================================ */

  function initOverlayGalleryGestures() {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;
    var gallery = overlay.querySelector('.overlay-gallery');
    var track = overlay.querySelector('.gallery-track');
    if (!gallery || !track) return;

    if (gallery._swipeInit) return;
    gallery._swipeInit = true;

    var startX = 0;
    var currentX = 0;
    var slideWidth = 0;
    var isSwiping = false;

    function onTouchStart(e) {
      if (!overlayState.currentProduct || overlayState.currentProduct.media.length <= 1) return;
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      currentX = startX;
      isSwiping = true;
      slideWidth = gallery.offsetWidth;
      track.classList.add('dragging');
      track.style.transition = 'none';
    }

    function onTouchMove(e) {
      if (!isSwiping) return;
      if (e.touches.length !== 1) return;
      currentX = e.touches[0].clientX;
      track.style.transform = 'translateX(' + (-overlayState.currentSlide * slideWidth + (currentX - startX)) + 'px)';
    }

    function onTouchEnd() {
      if (!isSwiping) return;
      isSwiping = false;
      track.classList.remove('dragging');
      var diff = currentX - startX;
      if (!overlayState.currentProduct) return;
      if (Math.abs(diff) > slideWidth * 0.2) {
        if (diff < 0 && overlayState.currentSlide < overlayState.currentProduct.media.length - 1) {
          updateGalleryPosition(overlayState.currentSlide + 1, true);
        } else if (diff > 0 && overlayState.currentSlide > 0) {
          updateGalleryPosition(overlayState.currentSlide - 1, true);
        } else {
          updateGalleryPosition(overlayState.currentSlide, true);
        }
      } else {
        updateGalleryPosition(overlayState.currentSlide, true);
      }
    }

    function onTouchCancel() {
      if (!isSwiping) return;
      isSwiping = false;
      track.classList.remove('dragging');
      updateGalleryPosition(overlayState.currentSlide, true);
    }

    gallery.addEventListener('touchstart', onTouchStart, { passive: true });
    gallery.addEventListener('touchmove', onTouchMove, { passive: true });
    gallery.addEventListener('touchend', onTouchEnd, { passive: true });
    gallery.addEventListener('touchcancel', onTouchCancel, { passive: true });
  }

  /* ================================
     PULL-TO-CLOSE OVERLAY
  ================================ */

  function initOverlayPullToClose() {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;
    var dragHandle = overlay.querySelector('.overlay-drag-handle');
    if (!dragHandle) return;

    var startY = 0;
    var currentY = 0;
    var isPulling = false;

    function onTouchStart(e) {
      if (overlayState.isDragging) return;
      var body = overlay.querySelector('.overlay-body');
      if (body && body.scrollTop > 0) return;

      var touch = e.touches[0];
      startY = touch.clientY;
      isPulling = true;
      overlayState.dragStartY = startY;
      if (typeof gsap !== 'undefined') {
        gsap.set(overlay, { clearProps: 'y' });
      }
    }

    function onTouchMove(e) {
      if (!isPulling) return;
      var touch = e.touches[0];
      currentY = touch.clientY;
      var diff = currentY - startY;

      if (diff < 0) return;

      overlayState.dragOffset = diff;
      overlay.style.transform = 'translateY(' + diff + 'px)';
      overlay.style.transition = 'none';

      var indicator = overlay.querySelector('.overlay-pull-indicator');
      if (indicator) {
        indicator.classList.toggle('visible', diff > 30);
      }
    }

    function onTouchEnd() {
      if (!isPulling) return;
      isPulling = false;

      var diff = currentY - startY || overlayState.dragOffset;

      var indicator = overlay.querySelector('.overlay-pull-indicator');
      if (indicator) {
        indicator.classList.remove('visible');
      }

      if (diff > 100) {
        closeProductOverlay();
      } else {
        overlay.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
        overlay.style.transform = 'translateY(0)';
        setTimeout(function () {
          overlay.style.transition = '';
        }, 350);
      }

      overlayState.dragOffset = 0;
    }

    dragHandle.addEventListener('touchstart', onTouchStart, { passive: true });
    dragHandle.addEventListener('touchmove', onTouchMove, { passive: true });
    dragHandle.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  /* ================================
     HORIZONTAL SCROLL CATALOG
  ================================ */

  function renderScrollCatalog() {
    var container = document.getElementById('scrollProducts');
    if (!container || !window.products) return;

    container.innerHTML = window.products.map(function (product) {
      var imgSrc = product.media && product.media.length ? product.media[0].src : '';
      var imgCount = product.media ? product.media.length : 0;
      return '<div class="product-scroll-card" data-product-id="' + product.id + '">' +
        '<div class="scroll-card-img">' +
          '<img src="' + imgSrc + '" alt="' + product.title + '" loading="lazy" width="300" height="300">' +
          (imgCount > 1 ? '<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.5);color:#fff;font-size:0.65rem;padding:2px 8px;border-radius:50px;z-index:2;backdrop-filter:blur(4px)">' + imgCount + ' fotos</div>' : '') +
        '</div>' +
        '<div class="scroll-card-body">' +
          '<h3 class="scroll-card-title">' + product.title + '</h3>' +
          '<button class="btn btn-whatsapp-xs" onclick="event.stopPropagation(); openWhatsApp(\'' + product.title + '\')"><i class="bi bi-whatsapp"></i> Consultar</button>' +
        '</div>' +
      '</div>';
    }).join('');

    container.addEventListener('click', function (e) {
      var card = e.target.closest('.product-scroll-card');
      if (!card) return;
      var productId = parseInt(card.dataset.productId, 10);
      if (productId && typeof openProductOverlay === 'function') {
        openProductOverlay(productId);
      }
    });
  }

  /* ================================
     OVERLAY CLOSE EVENTS
  ================================ */

  function initOverlayControls() {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;

    var closeBtn = overlay.querySelector('.overlay-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeProductOverlay);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeProductOverlay();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayState.isOpen) {
        closeProductOverlay();
      }
    });
  }

  /* ================================
     OVERLAY BODY SCROLL LOCK
  ================================ */

  function initOverlayScrollLock() {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;
    var body = overlay.querySelector('.overlay-body');
    if (!body) return;

    body.addEventListener('touchmove', function (e) {
      e.stopPropagation();
    }, { passive: true });
  }

  /* ================================
     RESPONSIVE SWITCH: Modal vs Overlay
  ================================ */

  function initResponsiveSwitch() {
    function checkWidth() {
      isMobile = window.innerWidth < 768;
    }
    checkWidth();
    window.addEventListener('resize', checkWidth);
  }

  /* ================================
     INIT ALL
  ================================ */

  function init() {
    initBottomNav();
    initSmartCTA();
    initOverlayControls();
    initOverlayPullToClose();
    initOverlayScrollLock();
    initResponsiveSwitch();

    renderScrollCatalog();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.openProductOverlay = openProductOverlay;
  window.closeProductOverlay = closeProductOverlay;
  window.renderScrollCatalog = renderScrollCatalog;

})();
