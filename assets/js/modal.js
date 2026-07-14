let galleryCurrentIndex = 0;
let galleryProduct = null;
let galleryAutoSlideTimer = null;

function openProductModal(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;

  if (window.innerWidth < 768 && typeof openProductOverlay === 'function') {
    openProductOverlay(productId);
    return;
  }

  galleryProduct = product;
  galleryCurrentIndex = 0;

  document.getElementById('modalProductTitle').textContent = product.title;
  var catBadge = document.getElementById('modalCategoryBadge');
  if (catBadge) catBadge.textContent = product.cat || '';

  updateGalleryView();

  const accBenefits = document.querySelector('#modalAccordion .accordion-benefits .accordion-body');
  const accIngredients = document.querySelector('#modalAccordion .accordion-ingredients .accordion-body');
  const accUsage = document.querySelector('#modalAccordion .accordion-usage .accordion-body');

  if (accBenefits) accBenefits.innerHTML = product.full;
  if (accIngredients) accIngredients.textContent = product.ing;
  if (accUsage) accUsage.textContent = product.use;

  const whatsappBtn = document.getElementById('modalWhatsappBtn');
  if (whatsappBtn) {
    whatsappBtn.onclick = () => openWhatsApp(product.title);
  }

  const modalEl = document.getElementById('productModal');
  if (!modalEl) return;

  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.show();

  setTimeout(function () {
    if (typeof gtag === 'function') {
      gtag('event', 'view_item', {
        currency: 'PEN',
        items: [{ id: product.id, name: product.title }]
      });
    }
  }, 100);
}

function updateGalleryView() {
  if (!galleryProduct) return;

  const container = document.getElementById('modalGalleryImgContainer');
  if (container) container.classList.remove('loaded');
  const img = document.getElementById('modalGalleryImg');
  if (img) {
    img.style.opacity = '0';
    setTimeout(function () {
      img.src = galleryProduct.media[galleryCurrentIndex].src;
      img.alt = `${galleryProduct.title} - Imagen ${galleryCurrentIndex + 1}`;
      img.onload = function () {
        if (container) container.classList.add('loaded');
        img.style.opacity = '1';
      };
      if (img.complete) {
        if (container) container.classList.add('loaded');
        img.style.opacity = '1';
      }
    }, 60);
  }

  // Update image counter
  const counter = document.getElementById('modalGalleryCounter');
  if (counter) {
    counter.textContent = `${galleryCurrentIndex + 1}/${galleryProduct.media.length}`;
  }

  const thumbs = document.getElementById('modalGalleryThumbs');
  if (thumbs) {
    thumbs.innerHTML = '';
    galleryProduct.media.forEach((m, i) => {
      const thumb = document.createElement('div');
      thumb.className = `gallery-thumb${i === galleryCurrentIndex ? ' active' : ''}`;
      thumb.dataset.index = i;
      thumb.innerHTML = `<img src="${m.src}" alt="${galleryProduct.title} - Imagen ${i + 1}">`;
      thumb.addEventListener('click', () => {
        galleryCurrentIndex = i;
        updateGalleryView();
        resetGalleryAutoSlide();
      });
      thumbs.appendChild(thumb);
    });
    // Scroll active thumb into view
    const activeThumb = thumbs.querySelector('.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  const prevBtn = document.getElementById('modalGalleryPrev');
  const nextBtn = document.getElementById('modalGalleryNext');
  if (prevBtn) prevBtn.style.display = galleryProduct.media.length <= 1 ? 'none' : '';
  if (nextBtn) nextBtn.style.display = galleryProduct.media.length <= 1 ? 'none' : '';
}

function galleryNext() {
  if (!galleryProduct) return;
  galleryCurrentIndex = (galleryCurrentIndex + 1) % galleryProduct.media.length;
  updateGalleryView();
  resetGalleryAutoSlide();
}

function galleryPrev() {
  if (!galleryProduct) return;
  galleryCurrentIndex = (galleryCurrentIndex - 1 + galleryProduct.media.length) % galleryProduct.media.length;
  updateGalleryView();
  resetGalleryAutoSlide();
}

function startGalleryAutoSlide() {
  // Auto-slide disabled inside product view
}

function stopGalleryAutoSlide() {
  if (galleryAutoSlideTimer) {
    clearInterval(galleryAutoSlideTimer);
    galleryAutoSlideTimer = null;
  }
}

function resetGalleryAutoSlide() {
  stopGalleryAutoSlide();
  startGalleryAutoSlide();
}

var _modalSwipeInitialized = false;

function initModalGallerySwipe() {
  if (_modalSwipeInitialized) return;
  var container = document.getElementById('modalGalleryImgContainer');
  if (!container) return;

  var startX = 0;
  var currentX = 0;
  var isSwiping = false;

  container.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!galleryProduct || galleryProduct.media.length <= 1) return;
    startX = e.clientX;
    currentX = startX;
    isSwiping = false;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', function (e) {
    if (!container.hasPointerCapture(e.pointerId)) return;
    var dx = Math.abs(e.clientX - startX);
    if (dx > 10) {
      isSwiping = true;
      e.preventDefault();
    }
    currentX = e.clientX;
  });

  container.addEventListener('pointerup', function (e) {
    if (!container.hasPointerCapture(e.pointerId)) return;
    try { container.releasePointerCapture(e.pointerId); } catch (_) {}
    if (!isSwiping) return;
    var diff = currentX - startX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) galleryNext();
      else galleryPrev();
    }
  });

  container.addEventListener('pointercancel', function (e) {
    if (!container.hasPointerCapture(e.pointerId)) return;
    try { container.releasePointerCapture(e.pointerId); } catch (_) {}
  });

  _modalSwipeInitialized = true;
}

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('productModal');
  if (!modalEl) return;

  modalEl.addEventListener('hidden.bs.modal', () => {
    galleryProduct = null;
    stopGalleryAutoSlide();
  });

  modalEl.addEventListener('shown.bs.modal', function () {
    if (typeof gsap !== 'undefined') {
      var dialog = modalEl.querySelector('.modal-dialog');
      if (dialog) {
        gsap.fromTo(dialog, { scale: 0.97, y: 12 }, { scale: 1, y: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      }
    }
    setTimeout(initModalGallerySwipe, 100);
  });

  document.getElementById('modalGalleryPrev')?.addEventListener('click', galleryPrev);
  document.getElementById('modalGalleryNext')?.addEventListener('click', galleryNext);

  document.addEventListener('keydown', e => {
    if (!modalEl.classList.contains('show')) return;
    if (e.key === 'ArrowRight') galleryNext();
    if (e.key === 'ArrowLeft') galleryPrev();
    if (e.key === 'Escape') {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  });
});

window.openProductModal = openProductModal;
window.galleryNext = galleryNext;
window.galleryPrev = galleryPrev;
