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

    // Update active state on scroll
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

    // Show nav on mobile after scroll
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
    isDragging: false,
    isZoomed: false
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

    // Populate content
    overlay.querySelector('.overlay-title').textContent = product.title;
    overlay.querySelector('.overlay-category').textContent = product.cat;

    // Gallery
    var track = overlay.querySelector('.gallery-track');
    track.innerHTML = '';
    product.media.forEach(function (m, i) {
      var slide = document.createElement('div');
      slide.className = 'gallery-slide';
      slide.innerHTML = '<img src="' + m.src + '" alt="' + product.title + ' - ' + (i + 1) + '" loading="lazy">';
      track.appendChild(slide);
    });

    // Gallery dots
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

    // Gallery counter
    var counter = overlay.querySelector('.gallery-counter');
    if (counter) {
      counter.textContent = product.media.length > 1 ? '1 / ' + product.media.length : '';
    }

    // Reset gallery position
    updateGalleryPosition(0, false);

    // Content sections
    var benefitsBody = overlay.querySelector('.overlay-section-body.benefits-body');
    if (benefitsBody) {
      benefitsBody.innerHTML = product.full ? product.full.replace(/<br>/g, '') : '';
      if (benefitsBody.querySelector('ul')) {
        // Already has list
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

    // WhatsApp button
    var whatsappBtn = overlay.querySelector('.overlay-whatsapp-btn');
    if (whatsappBtn) {
      whatsappBtn.onclick = function () {
        if (typeof openWhatsApp === 'function') openWhatsApp(product.title);
      };
    }

    // Instant slide-up
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
    }

    // Analytics
    if (typeof TrackProductView === 'function') {
      TrackProductView(product.id, product.title);
    }

    // Init gallery gestures
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

    // Update dots
    var dots = overlay.querySelectorAll('.gallery-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === index);
    });

    // Update counter
    var counter = overlay.querySelector('.gallery-counter');
    if (counter && overlayState.currentProduct) {
      counter.textContent = (index + 1) + ' / ' + overlayState.currentProduct.media.length;
    }

    // Re-enable transitions after a frame
    if (animate === false) {
      requestAnimationFrame(function () {
        track.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
      });
    }

    // Notify zoom system to reset
    var evt = new CustomEvent('gallery-slide-changed', { bubbles: true });
    track.dispatchEvent(evt);
  }

  /* ================================
     GALLERY SWIPE GESTURES
  ================================ */

  function initOverlayGalleryGestures() {
    var overlay = document.getElementById('productOverlay');
    if (!overlay) return;
    var gallery = overlay.querySelector('.overlay-gallery');
    var track = overlay.querySelector('.gallery-track');
    if (!gallery || !track || !overlayState.currentProduct) return;

    // ALWAYS initialize zoom, even for single-image products
    initOverlayZoom(gallery);

    if (overlayState.currentProduct.media.length <= 1) return;

    var startX = 0;
    var currentX = 0;
    var isSwiping = false;
    var slideWidth = 0;

    function onTouchStart(e) {
      if (overlayState.isDragging || overlayState.isZoomed || e.touches.length !== 1) return;
      var touch = e.touches[0];
      startX = touch.clientX;
      currentX = startX;
      isSwiping = true;
      slideWidth = gallery.offsetWidth;
      track.classList.add('dragging');
      track.style.transition = 'none';
    }

    function onTouchMove(e) {
      if (!isSwiping) return;
      var touch = e.touches[0];
      currentX = touch.clientX;
      var diff = currentX - startX;
      var baseOffset = -overlayState.currentSlide * slideWidth;
      track.style.transform = 'translateX(' + (baseOffset + diff) + 'px)';
    }

    function onTouchEnd() {
      if (!isSwiping) return;
      isSwiping = false;
      track.classList.remove('dragging');

      var diff = currentX - startX;
      var threshold = slideWidth * 0.2;

      if (Math.abs(diff) > threshold) {
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

    gallery.removeEventListener('touchstart', onTouchStart);
    gallery.removeEventListener('touchmove', onTouchMove);
    gallery.removeEventListener('touchend', onTouchEnd);

    gallery.addEventListener('touchstart', onTouchStart, { passive: true });
    gallery.addEventListener('touchmove', onTouchMove, { passive: true });
    gallery.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function initOverlayZoom(gallery) {
    if (gallery.dataset.zoomInit) return;
    gallery.dataset.zoomInit = '1';

    var z = {
      scale: 1, minScale: 1, maxScale: 5,
      tx: 0, ty: 0,
      panning: false, panSX: 0, panSY: 0,
      lastPinchDist: 0,
      lastTapTime: 0, lastTapX: 0, lastTapY: 0
    };

    function getActiveSlide() {
      var slides = gallery.querySelectorAll('.gallery-slide');
      return slides[overlayState.currentSlide] || null;
    }

    function getActiveImg() {
      var slide = getActiveSlide();
      return slide ? slide.querySelector('img') : null;
    }

    function apply(animate) {
      var img = getActiveImg();
      if (!img) return;
      img.style.transform = 'translate(' + z.tx + 'px,' + z.ty + 'px) scale(' + z.scale + ')';
      img.style.transition = animate ? 'transform 0.15s cubic-bezier(0.4,0,0.2,1)' : 'none';
      overlayState.isZoomed = z.scale > 1;
      var s = getActiveSlide();
      if (s) s.classList.toggle('zoomed', z.scale > 1);
    }

    function resetZoom() {
      z.scale = 1; z.tx = 0; z.ty = 0;
      overlayState.isZoomed = false;
      var s = getActiveSlide();
      if (s) s.classList.remove('zoomed');
      var img = getActiveImg();
      if (img) { img.style.transform = ''; img.style.transition = ''; }
    }

    function clamp(r) {
      var m = (z.scale - 1) * 0.5;
      z.tx = Math.max(-r.width * m, Math.min(r.width * m, z.tx));
      z.ty = Math.max(-r.height * m, Math.min(r.height * m, z.ty));
    }

    function zoomAt(scale, cx, cy) {
      var s = getActiveSlide();
      if (!s) return;
      var r = s.getBoundingClientRect();
      var prev = z.scale;
      z.scale = Math.max(z.minScale, Math.min(z.maxScale, scale));
      z.tx = cx - (cx - z.tx) * (z.scale / prev);
      z.ty = cy - (cy - z.ty) * (z.scale / prev);
      clamp(r);
      apply(false);
    }

    gallery.addEventListener('wheel', function (e) {
      e.preventDefault();
      var s = getActiveSlide(); if (!s) return;
      var r = s.getBoundingClientRect();
      zoomAt(z.scale * (1 - e.deltaY * 0.002), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    gallery.addEventListener('dblclick', function (e) {
      if (z.scale > 1) { resetZoom(); return; }
      var s = getActiveSlide(); if (!s) return;
      var r = s.getBoundingClientRect();
      zoomAt(2.5, e.clientX - r.left, e.clientY - r.top);
    });

    gallery.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        if (overlayState.isZoomed && !overlayState.isDragging) {
          z.panning = true;
          z.panSX = e.touches[0].clientX - z.tx;
          z.panSY = e.touches[0].clientY - z.ty;
        }
      } else if (e.touches.length === 2) {
        z.panning = false;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        z.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: false });

    gallery.addEventListener('touchmove', function (e) {
      if (e.touches.length === 1 && z.panning) {
        z.tx = e.touches[0].clientX - z.panSX;
        z.ty = e.touches[0].clientY - z.panSY;
        var s = getActiveSlide(); if (s) clamp(s.getBoundingClientRect());
        apply(false);
      } else if (e.touches.length === 2 && z.lastPinchDist > 0) {
        e.preventDefault();
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        var s = getActiveSlide(); if (s) { var r = s.getBoundingClientRect(); zoomAt(z.scale * (dist / z.lastPinchDist), cx - r.left, cy - r.top); }
        z.lastPinchDist = dist;
      }
    }, { passive: false });

    gallery.addEventListener('touchend', function (e) {
      z.panning = false;
      if (e.touches.length < 2) z.lastPinchDist = 0;
      if (e.changedTouches.length === 1 && e.touches.length === 0) {
        var t = e.changedTouches[0];
        var now = Date.now();
        if (now - z.lastTapTime < 300 && Math.abs(t.clientX - z.lastTapX) < 30 && Math.abs(t.clientY - z.lastTapY) < 30) {
          if (overlayState.isZoomed) { resetZoom(); } else { var s = getActiveSlide(); if (s) { var r = s.getBoundingClientRect(); zoomAt(2.5, t.clientX - r.left, t.clientY - r.top); } }
          z.lastTapTime = 0;
        } else { z.lastTapTime = now; z.lastTapX = t.clientX; z.lastTapY = t.clientY; }
      }
    }, { passive: false });

    gallery.addEventListener('gallery-slide-changed', resetZoom);
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
      // Only allow pull-to-close when at top of scroll
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

      if (diff < 0) return; // Only pull down

      overlayState.dragOffset = diff;
      overlay.style.transform = 'translateY(' + diff + 'px)';
      overlay.style.transition = 'none';

      // Show pull indicator
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
     PRODUCT CARD CLICK -> OVERLAY
     Handled by modal.js -> openProductModal -> redirects to overlay on mobile
  ================================ */

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
          '<span class="scroll-card-badge">' + product.cat + '</span>' +
          '<img src="' + imgSrc + '" alt="' + product.title + '" loading="lazy">' +
          (imgCount > 1 ? '<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.5);color:#fff;font-size:0.65rem;padding:2px 8px;border-radius:50px;z-index:2;backdrop-filter:blur(4px)">' + imgCount + ' fotos</div>' : '') +
        '</div>' +
        '<div class="scroll-card-body">' +
          '<h3 class="scroll-card-title">' + product.title + '</h3>' +
        '</div>' +
      '</div>';
    }).join('');

    // Click handlers for scroll cards
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

    // Backdrop click to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeProductOverlay();
      }
    });

    // Keyboard escape
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
      // Allow scroll within body
      e.stopPropagation();
    }, { passive: true });
  }

  /* ================================
     RESPONSIVE SWITCH: Modal vs Overlay
  ================================ */

  function initResponsiveSwitch() {
    function checkWidth() {
      isMobile = window.innerWidth < 768;
      // On mobile, use overlay. On desktop, use Bootstrap modal.
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

    // Cleanup: unregister any leftover service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) { r.unregister(); });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose for other scripts
  window.openProductOverlay = openProductOverlay;
  window.closeProductOverlay = closeProductOverlay;

})();
