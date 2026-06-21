function carouselProducts(mediaArray) {
  if (!mediaArray || mediaArray.length === 0) return '';
  if (mediaArray.length === 1) {
    return `<img src="${mediaArray[0].src}" alt="" loading="lazy" class="active">`;
  }
  const slides = mediaArray.map((m, i) =>
    `<img src="${m.src}" alt="" loading="lazy" class="${i === 0 ? 'active' : ''}" data-index="${i}">`
  ).join('');
  const dots = mediaArray.map((_, i) =>
    `<span class="pcard-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
  ).join('');
  return `<div class="pcard-carousel">${slides}<div class="pcard-dots">${dots}</div></div>`;
}

function renderProductsGrid(productsList) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = productsList.map((product, index) => `
    <div class="col-lg-3 col-md-4 col-sm-6 reveal reveal-slideUp stagger-${Math.min(index + 1, 12)}">
      <div class="product-card" data-product-id="${product.id}" data-product-cat="${product.cat}">
        <div class="product-card-img">
          <span class="product-card-cat">${product.cat}</span>
          ${carouselProducts(product.media)}
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title">${product.title}</h3>
          <div class="product-card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-whatsapp-sm" onclick="event.stopPropagation(); openWhatsApp('${product.title}')">
              <i class="bi bi-whatsapp"></i> Consultar
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  initProductCardCarousels();
  if (typeof refreshAnimations === 'function') refreshAnimations();
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
    document.querySelectorAll('#productsGrid .reveal:not(.revealed)').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        toggleClass: { targets: el, className: 'revealed' },
        once: true
      });
    });
  }
}

function filterProducts(category) {
  const list = category === 'Todos'
    ? window.products
    : window.products.filter(p => p.cat === category);
  renderProductsGrid(list);
}

function initFilterButtons() {
  const filterBar = document.querySelector('#filterBar');
  if (!filterBar) return;
  filterBar.addEventListener('click', e => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    filterBar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const category = pill.dataset.filter || 'Todos';
    filterProducts(category);
  });
}

function initCardClickHandlers() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const productId = parseInt(card.dataset.productId, 10);
    if (typeof openProductModal === 'function') openProductModal(productId);
  });
}

function initProductCardCarousels() {
  document.querySelectorAll('#productsGrid .pcard-carousel').forEach(carousel => {
    if (carousel.dataset.pcardInit) return;
    carousel.dataset.pcardInit = 'true';
    const slides = carousel.querySelectorAll('img');
    const dots = carousel.querySelectorAll('.pcard-dot');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let interval = null;
    let paused = false;

    function goTo(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentIndex = index;
    }

    function next() {
      goTo((currentIndex + 1) % slides.length);
    }

    function start() {
      stop();
      interval = setInterval(() => { if (!paused) next(); }, 4000);
    }

    function stop() {
      if (interval) { clearInterval(interval); interval = null; }
    }

    const hoverArea = carousel.closest('.product-card-img') || carousel.parentElement;
    hoverArea.addEventListener('mouseenter', () => { paused = true; });
    hoverArea.addEventListener('mouseleave', () => { paused = false; });
    start();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFilterButtons();
  initCardClickHandlers();
});

window.renderProductsGrid = renderProductsGrid;
window.filterProducts = filterProducts;
window.carouselProducts = carouselProducts;
