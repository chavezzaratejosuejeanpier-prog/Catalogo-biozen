let zoomLevel = 1;
let isZoomed = false;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragPanX = 0;
let dragPanY = 0;
let lastPinchDist = 0;
let pinchStartZoom = 1;
let zoomControlsInitialized = false;

function handleImageDoubleClick(e) {
  e.preventDefault();
  const container = document.getElementById('modalGalleryImgContainer');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  if (isZoomed) {
    resetZoom();
    if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
  } else {
    zoomLevel = 2.5;
    isZoomed = true;
    panX = cx - zoomLevel * (cx - 0);
    panY = cy - zoomLevel * (cy - 0);
    clampPan();
    updateZoomTransform();
    if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
  }
}

function handleImageDragStart(e) {
  if (zoomLevel <= 1) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragPanX = panX;
  dragPanY = panY;
  const container = document.getElementById('modalGalleryImgContainer');
  if (container) container.style.cursor = 'grabbing';
  e.preventDefault();
}

function handleImageDragMove(e) {
  if (!isDragging) return;
  panX = dragPanX + (e.clientX - dragStartX);
  panY = dragPanY + (e.clientY - dragStartY);
  updateZoomTransform();
  e.preventDefault();
}

function handleImageDragEnd(e) {
  if (isDragging) {
    clampPan();
    updateZoomTransform();
  }
  isDragging = false;
  const container = document.getElementById('modalGalleryImgContainer');
  if (container) container.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
}

function handleScrollZoom(e) {
  e.preventDefault();
  const container = document.getElementById('modalGalleryImgContainer');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const delta = e.deltaY > 0 ? -0.4 : 0.4;
  const newZoom = Math.min(Math.max(zoomLevel + delta, 1), 5);
  if (newZoom === zoomLevel) return;
  if (newZoom <= 1) {
    resetZoom();
    if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
    return;
  }
  const scale = newZoom / zoomLevel;
  panX = cx - scale * (cx - panX);
  panY = cy - scale * (cy - panY);
  zoomLevel = newZoom;
  isZoomed = true;
  clampPan();
  updateZoomTransform();
  if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
}

function handleTouchZoom(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist = getTouchDist(e.touches);
    if (lastPinchDist > 0) {
      const container = document.getElementById('modalGalleryImgContainer');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      const newZoom = Math.min(Math.max(pinchStartZoom * (dist / lastPinchDist), 1), 5);
      if (newZoom <= 1) {
        resetZoom();
        if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
        return;
      }
      const scale = newZoom / zoomLevel;
      panX = cx - scale * (cx - panX);
      panY = cy - scale * (cy - panY);
      zoomLevel = newZoom;
      isZoomed = true;
      clampPan();
      updateZoomTransform();
      if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
    }
    lastPinchDist = dist;
  }
}

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function resetZoom() {
  zoomLevel = 1;
  isZoomed = false;
  panX = 0;
  panY = 0;
  isDragging = false;
  updateZoomTransform();
  const container = document.getElementById('modalGalleryImgContainer');
  if (container) container.style.cursor = 'default';
}

function toggleZoom() {
  if (isZoomed) {
    resetZoom();
    if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
  } else {
    zoomLevel = 2.5;
    isZoomed = true;
    const container = document.getElementById('modalGalleryImgContainer');
    if (container) {
      const rect = container.getBoundingClientRect();
      panX = rect.width / 2 - zoomLevel * (rect.width / 2);
      panY = rect.height / 2 - zoomLevel * (rect.height / 2);
    } else {
      panX = 0;
      panY = 0;
    }
    clampPan();
    updateZoomTransform();
    if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
  }
}

function updateZoomTransform() {
  const img = document.querySelector('#modalGalleryImgContainer img');
  if (!img) return;
  if (zoomLevel <= 1) {
    img.style.transform = 'translate(0px, 0px) scale(1)';
    img.style.transformOrigin = '0 0';
  } else {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    img.style.transformOrigin = '0 0';
  }
}

function clampPan() {
  const img = document.querySelector('#modalGalleryImgContainer img');
  const container = document.getElementById('modalGalleryImgContainer');
  if (!img || !container) return;

  const imgRect = img.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();

  const overflowX = (imgRect.width - cRect.width) / 2;
  const overflowY = (imgRect.height - cRect.height) / 2;

  if (overflowX > 0) {
    panX = Math.min(Math.max(panX, -overflowX), overflowX);
  } else {
    panX = 0;
  }

  if (overflowY > 0) {
    panY = Math.min(Math.max(panY, -overflowY), overflowY);
  } else {
    panY = 0;
  }
}

function initZoomControls() {
  if (zoomControlsInitialized) return;
  zoomControlsInitialized = true;

  const container = document.getElementById('modalGalleryImgContainer');
  const img = container ? container.querySelector('img') : null;
  if (!container || !img) return;

  img.addEventListener('dblclick', handleImageDoubleClick);

  img.addEventListener('mousedown', handleImageDragStart);
  document.addEventListener('mousemove', handleImageDragMove);
  document.addEventListener('mouseup', handleImageDragEnd);

  container.addEventListener('wheel', handleScrollZoom, { passive: false });

  container.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      lastPinchDist = getTouchDist(e.touches);
      pinchStartZoom = zoomLevel;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragPanX = panX;
      dragPanY = panY;
    }
  }, { passive: true });

  container.addEventListener('touchmove', handleTouchZoom, { passive: false });

  container.addEventListener('touchend', () => {
    if (isDragging) {
      clampPan();
      updateZoomTransform();
    }
    isDragging = false;
    lastPinchDist = 0;
  }, { passive: true });

  updateZoomTransform();
}

window.resetZoom = resetZoom;
window.toggleZoom = toggleZoom;
