(function () {
  function initCardTilt() {
    var cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      var isInside = false;

      card.addEventListener('mouseenter', function () {
        isInside = true;
      });

      card.addEventListener('mousemove', function (e) {
        if (!isInside) return;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -6;
        var rotateY = ((x - centerX) / centerX) * 6;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        var shadowX = ((x - centerX) / centerX) * 8;
        var shadowY = ((y - centerY) / centerY) * 8;
        card.style.boxShadow = shadowX + 'px ' + shadowY + 'px 32px -12px rgba(13,148,136,0.18), 0 4px 16px -4px rgba(0,0,0,0.06)';
      });

      card.addEventListener('mouseleave', function () {
        isInside = false;
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
        card.style.boxShadow = '';
      });
    });
  }

  function init() {
    if (typeof gsap === 'undefined') return;
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initCardTilt, 500);
    });
    var grid = document.getElementById('productsGrid');
    if (grid) {
      var observer = new MutationObserver(function () {
        setTimeout(initCardTilt, 100);
      });
      observer.observe(grid, { childList: true, subtree: true });
    }
  }

  init();
})();
