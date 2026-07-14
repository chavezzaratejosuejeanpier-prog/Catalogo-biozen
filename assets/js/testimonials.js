(function () {
  'use strict';

  var FALLBACK = [
    { src: 'img/Tes1.jpg', alt: 'Experiencia real compartida por cliente de BIOZEN' },
    { src: 'img/Tes2.jpg', alt: 'Captura real de conversación sobre productos BIOZEN' },
    { src: 'img/Tes3.jpg', alt: 'Cliente comparte su experiencia auténtica con BIOZEN' },
    { src: 'img/Tes4.jpg', alt: 'Conversación real de cliente satisfecho con BIOZEN' },
  ];

  async function fetchTestimonials() {
    return null;
  }

  function Carousel(section, images) {
    this.images = images;
    this.section = section;
    this.viewport = section.querySelector('.testimonials-viewport');
    this.track = section.querySelector('.testimonials-track');
    this.cards = [];

    this.dragging = false;
    this.animating = false;

    this.startX = 0;
    this.startTrackX = 0;
    this.currentX = 0;
    this.lastX = 0;
    this.lastTime = 0;
    this.velocity = 0;
    this.velocitySamples = [];

    this.minX = 0;
    this.maxX = 0;
    this.cardW = 0;
    this.gap = 0;
    this.trackW = 0;
    this.currentIndex = 0;

    this._raf = false;
    this._tween = null;
    this._rtimer = null;
    this._imagesLoaded = 0;
    this._measurePending = false;

    this.prevBtn = section.querySelector('.testimonials-btn-prev');
    this.nextBtn = section.querySelector('.testimonials-btn-next');

    if (!this.viewport || !this.track) return;
    this.render();
    this.bind();
    this.lazyLoad();
    var self = this;
    requestAnimationFrame(function () {
      self.measure();
      self.currentX = self.maxX;
      gsap.set(self.track, { x: self.currentX });
      self.updateIndex();
      self.visuals();
      self.lazyLoad();
    });
  }

  Carousel.prototype.render = function () {
    var df = document.createDocumentFragment();
    var self = this;

    for (var i = 0; i < this.images.length; i++) {
      var img = this.images[i];
      var card = document.createElement('div');
      card.className = 'testimonials-card';
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', img.alt);
      card.setAttribute('tabindex', '0');
      card.dataset.index = i;

      var skeleton = document.createElement('div');
      skeleton.className = 'testimonials-skeleton';
      card.appendChild(skeleton);

      var picture = document.createElement('img');
      picture.dataset.src = img.src;
      picture.alt = '';
      picture.setAttribute('aria-hidden', 'true');
      picture.loading = 'lazy';
      picture.decoding = 'async';

      picture.addEventListener('load', function () {
        self._imagesLoaded++;
        var sk = this.parentNode.querySelector('.testimonials-skeleton');
        if (sk) {
          gsap.to(sk, { opacity: 0, duration: 0.35, ease: 'power2.out', onComplete: function () { if (sk.parentNode) sk.remove(); } });
        }
        this.classList.add('loaded');

        if (self._imagesLoaded === 1 && !self._measurePending) {
          self._measurePending = true;
          requestAnimationFrame(function () {
            self.measure();
            self.refresh();
            self._measurePending = false;
          });
        }
      });

      picture.addEventListener('error', function () {
        var sk = this.parentNode.querySelector('.testimonials-skeleton');
        if (sk) {
          sk.className = 'testimonials-error';
          sk.innerHTML = '<i class="bi bi-image"></i>';
        }
      });

      card.appendChild(picture);
      df.appendChild(card);
      this.cards.push(card);
    }

    this.track.appendChild(df);
  };

  Carousel.prototype.bind = function () {
    var self = this;
    this.viewport.addEventListener('pointerdown', function (e) { return self.down(e); });
    window.addEventListener('pointermove', function (e) { return self.move(e); });
    window.addEventListener('pointerup', function (e) { return self.up(e); });
    window.addEventListener('pointercancel', function (e) { return self.up(e); });
    this.viewport.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    this.section.addEventListener('keydown', function (e) { return self.key(e); });
    if (this.prevBtn) this.prevBtn.addEventListener('click', function (e) { e.stopPropagation(); self.nav(-1); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', function (e) { e.stopPropagation(); self.nav(1); });
    this.viewport.addEventListener('wheel', function (e) { return self.wheel(e); }, { passive: false });
    window.addEventListener('resize', function () { return self.resize(); });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { self.resize(); }, 350);
    });
  };

  Carousel.prototype.measure = function () {
    if (!this.cards.length) return;
    this.cardW = this.cards[0].offsetWidth;
    this.gap = parseFloat(window.getComputedStyle(this.track).gap) || 12;
    var vw = this.viewport.offsetWidth;
    var step = this.cardW + this.gap;
    this.trackW = this.cards.length * step - this.gap;
    if (this.trackW <= vw) {
      this.minX = this.maxX = (vw - this.trackW) / 2;
    } else {
      this.maxX = (vw - this.cardW) / 2;
      this.minX = this.maxX - (this.cards.length - 1) * step;
    }
  };

  Carousel.prototype.refresh = function () {
    this.measure();
    if (this.track._gsap && typeof gsap.getProperty(this.track, 'x') === 'number') {
      this.currentX = gsap.getProperty(this.track, 'x');
    }
    this.currentX = Math.max(this.minX, Math.min(this.maxX, this.currentX));
    gsap.set(this.track, { x: this.currentX });
    this.updateIndex();
    this.visuals();
    this.lazyLoad();
  };

  Carousel.prototype.updateIndex = function () {
    if (!this.cards.length) return;
    var vpC = this.viewport.offsetWidth / 2;
    var step = this.cardW + this.gap;
    var nearIdx = 0;
    var nearDist = Infinity;
    for (var i = 0; i < this.cards.length; i++) {
      var c = i * step + this.cardW / 2;
      var d = Math.abs(c + this.currentX - vpC);
      if (d < nearDist) {
        nearDist = d;
        nearIdx = i;
      }
    }
    this.currentIndex = nearIdx;
  };

  Carousel.prototype.lazyLoad = function () {
    if (!this.cards.length) return;
    var vpW = this.viewport.offsetWidth;
    var buf = vpW;
    var tx = this.currentX || 0;
    var cw = this.cardW || this.cards[0].offsetWidth || vpW * 0.8;
    var gp = this.gap || parseFloat(window.getComputedStyle(this.track).gap) || 12;

    for (var i = 0; i < this.cards.length; i++) {
      var card = this.cards[i];
      var left = i * (cw + gp);
      var right = left + cw;
      if (right + tx > -buf && left + tx < vpW + buf) {
        var img = card.querySelector('img[data-src]');
        if (img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      }
    }
  };

  Carousel.prototype.down = function (e) {
    if (this.animating) {
      if (this._tween) { this._tween.kill(); this._tween = null; }
      this.animating = false;
    }
    this.dragging = true;
    this._wasDrag = false;
    this.viewport.classList.add('dragging');
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.startTrackX = this.currentX;
    this.lastTime = performance.now();
    this.velocity = 0;
    this.velocitySamples = [];
  };

  Carousel.prototype.move = function (e) {
    if (!this.dragging) return;
    if (!this._wasDrag && Math.abs(e.clientX - this.startX) > 5) this._wasDrag = true;
    var now = performance.now();
    var dt = now - this.lastTime;
    if (dt > 0) {
      var dx = e.clientX - this.lastX;
      this.velocitySamples.push({ dx: dx, dt: dt });
      if (this.velocitySamples.length > 5) this.velocitySamples.shift();
      var totalW = 0;
      var totalV = 0;
      for (var i = 0; i < this.velocitySamples.length; i++) {
        var s = this.velocitySamples[i];
        var w = (i + 1) / this.velocitySamples.length;
        totalV += (s.dx / s.dt) * w;
        totalW += w;
      }
      this.velocity = totalW > 0 ? totalV / totalW : 0;
    }
    this.lastX = e.clientX;
    this.lastTime = now;
    var raw = this.startTrackX + (e.clientX - this.startX);
    this.currentX = this.rubber(raw);
    gsap.set(this.track, { x: this.currentX });
    if (!this._raf) {
      this._raf = true;
      requestAnimationFrame(this.flush.bind(this));
    }
  };

  Carousel.prototype.flush = function () {
    this._raf = false;
    this.visuals();
    this.lazyLoad();
  };

  Carousel.prototype.up = function (e) {
    if (!this.dragging) return;
    this.dragging = false;
    this.viewport.classList.remove('dragging');
    if (this._raf) { this._raf = false; this.visuals(); this.lazyLoad(); }
    if (!this._wasDrag) {
      var rect = this.viewport.getBoundingClientRect();
      var clickX = e.clientX - rect.left;
      this.nav(clickX > rect.width / 2 ? 1 : -1);
      return;
    }
    if (this.currentX > this.maxX || this.currentX < this.minX) {
      this.animTo(Math.max(this.minX, Math.min(this.maxX, this.currentX)), 0.5);
      return;
    }
    var absV = Math.abs(this.velocity);
    if (absV > 0.003) {
      var dir = this.velocity > 0 ? -1 : 1;
      this.nav(dir);
    } else {
      this.snap();
    }
  };

  Carousel.prototype.rubber = function (x) {
    if (x > this.maxX) { var o = x - this.maxX; return this.maxX + Math.log(1 + o) * 35; }
    if (x < this.minX) { var o2 = this.minX - x; return this.minX - Math.log(1 + o2) * 35; }
    return x;
  };

  Carousel.prototype.animTo = function (x, dur) {
    var self = this;
    this.animating = true;
    if (this._tween) { this._tween.kill(); this._tween = null; }
    this._tween = gsap.to(this.track, {
      x: x,
      duration: dur,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: function () {
        self.currentX = gsap.getProperty(self.track, 'x');
        self.visuals();
        self.lazyLoad();
      },
      onComplete: function () {
        self.animating = false;
        self._tween = null;
        self.currentX = gsap.getProperty(self.track, 'x');
        self.updateIndex();
        self.visuals();
      }
    });
  };

  Carousel.prototype.nav = function (dir) {
    var len = this.cards.length;
    if (len === 0) return;
    if (this.animating) {
      if (this._tween) { this._tween.kill(); this._tween = null; }
      this.animating = false;
    }
    this.measure();
    this.currentIndex = (this.currentIndex + dir + len) % len;
    var vpW = this.viewport.offsetWidth;
    var target = -(this.currentIndex * (this.cardW + this.gap)) + (vpW - this.cardW) / 2;
    target = Math.max(this.minX, Math.min(this.maxX, target));
    this.animTo(target, 0.35);
  };

  Carousel.prototype.snap = function () {
    if (!this.cards.length) return;
    this.measure();
    this.updateIndex();
    var vpW = this.viewport.offsetWidth;
    var target = -(this.currentIndex * (this.cardW + this.gap)) + (vpW - this.cardW) / 2;
    target = Math.max(this.minX, Math.min(this.maxX, target));
    if (Math.abs(target - this.currentX) < 2) return;
    this.animTo(target, 0.35);
  };

  Carousel.prototype.visuals = function () {
    if (!this.cards.length) return;
    var vpW = this.viewport.offsetWidth;
    var vpC = vpW / 2;
    var tx = this.currentX;
    var maxD = vpW * 0.55;
    var step = this.cardW + this.gap;
    for (var i = 0; i < this.cards.length; i++) {
      var card = this.cards[i];
      var cC = i * step + this.cardW / 2;
      var dist = Math.abs(cC + tx - vpC);
      var n = Math.min(dist / maxD, 1);
      var scale = 1 - n * 0.14;
      var opacity = 1 - n * 0.5;
      var dir = (cC + tx - vpC) / (vpW * 0.5);
      var rotY = -dir * 2.5 * (1 - Math.min(dist / (vpW * 0.3), 1));
      var sO = card._bs;
      var oO = card._bo;
      var rO = card._br;
      if (sO !== undefined &&
          Math.abs(scale - sO) < 0.005 &&
          Math.abs(opacity - oO) < 0.005 &&
          rO !== undefined && Math.abs(rotY - rO) < 0.05) {
        card.classList.toggle('active', n < 0.15);
        continue;
      }
      card._bs = scale;
      card._bo = opacity;
      card._br = rotY;
      gsap.set(card, { scale: scale, opacity: opacity, rotateY: rotY, z: -n * 25 });
      card.classList.toggle('active', n < 0.15);
    }
  };

  Carousel.prototype.key = function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    this.nav(e.key === 'ArrowRight' ? 1 : -1);
  };

  Carousel.prototype.wheel = function (e) {
    e.preventDefault();
    var deltaX = Math.abs(e.deltaX);
    var deltaY = Math.abs(e.deltaY);
    var delta = deltaX > deltaY ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 20) {
      this.nav(delta > 0 ? 1 : -1);
    }
  };

  Carousel.prototype.resize = function () {
    var self = this;
    clearTimeout(this._rtimer);
    this._rtimer = setTimeout(function () {
      self.measure();
      var c = Math.max(self.minX, Math.min(self.maxX, self.currentX));
      self.currentX = c;
      gsap.set(self.track, { x: c });
      self.updateIndex();
      self.visuals();
      self.lazyLoad();
    }, 120);
  };

  async function boot() {
    var el = document.getElementById('testimonios');
    if (!el) return;

    var images = await fetchTestimonials();
    if (!images || images.length === 0) images = FALLBACK;
    if (!images || images.length === 0) {
      el.style.display = 'none';
      return;
    }

    if (typeof gsap === 'undefined') {
      var iv = setInterval(function () {
        if (typeof gsap !== 'undefined') {
          clearInterval(iv);
          new Carousel(el, images);
        }
      }, 100);
      return;
    }
    new Carousel(el, images);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
