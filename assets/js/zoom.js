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

function getZoomContainer() {
  return document.getElementById('modalGalleryImgContainer');
}

function getZoomImg() {
  const container = getZoomContainer();
  return container ? container.querySelector('img') : null;
}

function getContainerBounds() {
  const container = getZoomContainer();
  if (!container) return { w: 0, h: 0 };
  return { w: container.clientWidth, h: container.clientHeight };
}

function getImgNaturalSize() {
  const img = getZoomImg();
  if (!img || !img.naturalWidth) return null;
  return { w: img.naturalWidth, h: img.naturalHeight };
}

function animateZoomReset() {
  const img = getZoomImg();
  if (!img) return;
  zoomLevel = 1;
  isZoomed = false;
  panX = 0;
  panY = 0;
  isDragging = false;
  const container = getZoomContainer();
  if (container) container.style.cursor = 'default';
  if (typeof gsap !== 'undefined') {
    gsap.to(img, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: function () {
        img.style.transformOrigin = '0 0';
      }
    });
  } else {
    img.style.transform = 'translate(0px, 0px) scale(1)';
    img.style.transformOrigin = '0 0';
  }
}

function getNaturalFitScale() {
  const container = getContainerBounds();
  const natural = getImgNaturalSize();
  if (!natural || container.w === 0 || container.h === 0) return 1;
  const scaleX = container.w / natural.w;
  const scaleY = container.h / natural.h;
  return Math.min(scaleX, scaleY);
}

function applyZoomTransform(animate) {
  const img = getZoomImg();
  if (!img) return;
  if (zoomLevel <= 1) {
    animateZoomReset();
    return;
  }
  const transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')';
  if (animate && typeof gsap !== 'undefined') {
    gsap.to(img, {
      x: panX,
      y: panY,
      scale: zoomLevel,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: function () {
        img.style.transformOrigin = '0 0';
      }
    });
  } else {
    img.style.transform = transform;
    img.style.transformOrigin = '0 0';
  }
}

function updateZoomTransform() {
  const img = getZoomImg();
  if (!img) return;
  if (zoomLevel <= 1) {
    img.style.transform = 'translate(0px, 0px) scale(1)';
    img.style.transformOrigin = '0 0';
  } else {
    img.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')';
    img.style.transformOrigin = '0 0';
  }
}

function clampPan() {
  const container = getContainerBounds();
  if (container.w === 0 || container.h === 0) return;
  const displayedW = container.w * zoomLevel;
  const displayedH = container.h * zoomLevel;
  const maxPanX = Math.max(0, (displayedW - container.w) / 2);
  const maxPanY = Math.max(0, (displayedH - container.h) / 2);
  if (displayedW > container.w) {
    panX = Math.min(Math.max(panX, -maxPanX * 1.5), maxPanX * 1.5);
  } else {
    panX = 0;
  }
  if (displayedH > container.h) {
    panY = Math.min(Math.max(panY, -maxPanY * 1.5), maxPanY * 1.5);
  } else {
    panY = 0;
  }
}

function handleImageDoubleClick(e) {
  e.preventDefault();
  const container = getZoomContainer();
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  if (isZoomed) {
    animateZoomReset();
    if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
  } else {
    zoomLevel = 2.5;
    isZoomed = true;
    panX = cx * (1 - zoomLevel);
    panY = cy * (1 - zoomLevel);
    clampPan();
    applyZoomTransform(true);
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
  const container = getZoomContainer();
  if (container) container.style.cursor = 'grabbing';
  e.preventDefault();
}

function handleImageDragMove(e) {
  if (!isDragging) return;
  panX = dragPanX + (e.clientX - dragStartX);
  panY = dragPanY + (e.clientY - dragStartY);
  applyZoomTransform(false);
  e.preventDefault();
}

function handleImageDragEnd() {
  if (isDragging) {
    clampPan();
    applyZoomTransform(true);
  }
  isDragging = false;
  const container = getZoomContainer();
  if (container) container.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
}

function handleScrollZoom(e) {
  e.preventDefault();
  const container = getZoomContainer();
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const delta = e.deltaY > 0 ? -0.4 : 0.4;
  const newZoom = Math.min(Math.max(zoomLevel + delta, 1), 5);
  if (newZoom === zoomLevel) return;
  if (newZoom <= 1) {
    animateZoomReset();
    if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
    return;
  }
  const scale = newZoom / zoomLevel;
  panX = cx - scale * (cx - panX);
  panY = cy - scale * (cy - panY);
  zoomLevel = newZoom;
  isZoomed = true;
  clampPan();
  applyZoomTransform(true);
  if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
}

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchZoom(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist = getTouchDist(e.touches);
    if (lastPinchDist > 0) {
      const container = getZoomContainer();
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      const newZoom = Math.min(Math.max(pinchStartZoom * (dist / lastPinchDist), 1), 5);
      if (newZoom <= 1) {
        animateZoomReset();
        if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
        return;
      }
      const scale = newZoom / zoomLevel;
      panX = cx - scale * (cx - panX);
      panY = cy - scale * (cy - panY);
      zoomLevel = newZoom;
      isZoomed = true;
      clampPan();
      applyZoomTransform(false);
      if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
    }
    lastPinchDist = dist;
  }
}

function resetZoom() {
  zoomLevel = 1;
  isZoomed = false;
  panX = 0;
  panY = 0;
  isDragging = false;
  updateZoomTransform();
  const container = getZoomContainer();
  if (container) container.style.cursor = 'default';
}

function toggleZoom() {
  if (isZoomed) {
    animateZoomReset();
    if (typeof startGalleryAutoSlide === 'function') startGalleryAutoSlide();
  } else {
    zoomLevel = 2.5;
    isZoomed = true;
    const container = getZoomContainer();
    if (container) {
      panX = container.clientWidth / 2 - zoomLevel * (container.clientWidth / 2);
      panY = container.clientHeight / 2 - zoomLevel * (container.clientHeight / 2);
    } else {
      panX = 0;
      panY = 0;
    }
    clampPan();
    applyZoomTransform(true);
    if (typeof stopGalleryAutoSlide === 'function') stopGalleryAutoSlide();
  }
}

function initZoomControls() {
  if (zoomControlsInitialized) return;
  zoomControlsInitialized = true;
  const container = getZoomContainer();
  const img = container ? container.querySelector('img') : null;
  if (!container || !img) return;

  let lastTap = 0;
  img.addEventListener('touchend', function (e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      handleImageDoubleClick(e);
      e.preventDefault();
    }
    lastTap = currentTime;
  });
  img.addEventListener('dblclick', handleImageDoubleClick);

  img.addEventListener('mousedown', handleImageDragStart);
  document.addEventListener('mousemove', handleImageDragMove);
  document.addEventListener('mouseup', handleImageDragEnd);

  container.addEventListener('wheel', handleScrollZoom, { passive: false });

  container.addEventListener('touchstart', function (e) {
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

  container.addEventListener('touchend', function () {
    if (isDragging) {
      clampPan();
      applyZoomTransform(true);
    }
    isDragging = false;
    lastPinchDist = 0;
  }, { passive: true });

  updateZoomTransform();

  img.addEventListener('dragstart', function (e) { e.preventDefault(); });
}

window.resetZoom = resetZoom;
window.toggleZoom = toggleZoom;
