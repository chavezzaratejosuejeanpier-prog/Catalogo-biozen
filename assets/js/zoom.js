(function () {
  'use strict';

  var lens = null;
  var container = null;
  var img = null;
  var initialized = false;

  function isFinePointer() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function initZoomControls() {
    container = document.getElementById('modalGalleryImgContainer');
    if (!container) return;

    var newImg = container.querySelector('img');
    if (!newImg) return;
    img = newImg;

    if (!isFinePointer()) return;

    if (!initialized) {
      lens = document.createElement('div');
      lens.className = 'gallery-lens';
      container.appendChild(lens);
      container.addEventListener('mouseenter', onEnter);
      container.addEventListener('mousemove', onMove);
      container.addEventListener('mouseleave', onLeave);
      initialized = true;
    }
  }

  function onEnter() {
    if (!lens) return;
    lens.style.display = 'block';
  }

  function onMove(e) {
    if (!lens || !container || !img) return;
    var rect = container.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var size = 120;
    var half = size / 2;
    var lx = Math.max(half, Math.min(rect.width - half, x)) - half;
    var ly = Math.max(half, Math.min(rect.height - half, y)) - half;

    lens.style.left = lx + 'px';
    lens.style.top = ly + 'px';
    lens.style.width = size + 'px';
    lens.style.height = size + 'px';

    var zoom = 3;
    var pctX = (x / rect.width) * 100;
    var pctY = (y / rect.height) * 100;

    lens.style.backgroundImage = 'url("' + img.src + '")';
    lens.style.backgroundSize = (rect.width * zoom) + 'px ' + (rect.height * zoom) + 'px';
    lens.style.backgroundPosition = pctX + '% ' + pctY + '%';
  }

  function onLeave() {
    if (lens) lens.style.display = 'none';
  }

  function resetZoom() {
    if (lens) lens.style.display = 'none';
  }

  window.initZoomControls = initZoomControls;
  window.resetZoom = resetZoom;
})();
