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
  resetZoom();

  document.getElementById('modalProductTitle').textContent = product.title;

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

  resetZoom();

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

  const img = document.getElementById('modalGalleryImg');
  if (img) {
    img.src = galleryProduct.media[galleryCurrentIndex].src;
    img.alt = `${galleryProduct.title} - Imagen ${galleryCurrentIndex + 1}`;
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

  resetZoom();
  initZoomControls();
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

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('productModal');
  if (!modalEl) return;

  modalEl.addEventListener('hidden.bs.modal', () => {
    galleryProduct = null;
    stopGalleryAutoSlide();
    resetZoom();
  });

  modalEl.addEventListener('shown.bs.modal', function () {
    // No auto-slide in product view
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
