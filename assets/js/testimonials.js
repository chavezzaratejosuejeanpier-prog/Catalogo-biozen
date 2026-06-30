(function () {
  'use strict';

  var SUPABASE_URL = 'https://sziwmmxtwqacevyyngkr.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aXdtbXh0d3FhY2V2eXluZ2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTA2MjQsImV4cCI6MjA5ODA2NjYyNH0.G-9gRhDo7FHX3TpEfMOIQH9CGCUMVdMHCYgL3CvTU2w';
  var STORAGE_BUCKET = 'testimonials';

  function publicUrl(path) {
    return SUPABASE_URL + '/storage/v1/object/public/' + STORAGE_BUCKET + '/' + path;
  }

  /* ---------------------------------------------------------------
     FALLBACK
     --------------------------------------------------------------- */
  var FALLBACK = [
    { src: 'fotos/Colageno1.jpeg', alt: 'Experiencia real compartida por cliente de Colágeno Premium' },
    { src: 'fotos/Omega1.jpeg', alt: 'Captura real de conversación sobre Omega 3,6,9' },
    { src: 'fotos/Creatina1.jpeg', alt: 'Cliente comparte su experiencia auténtica con Creatina' },
    { src: 'fotos/Detox Fix1.jpeg', alt: 'Conversación real de cliente satisfecho con Detox Fit' },
    { src: 'fotos/BioEnergy1.jpeg', alt: 'Experiencia genuina de cliente con BioEnergy' },
    { src: 'fotos/GanoGreen1.png', alt: 'Captura auténtica de cliente sobre GanoGreen' },
    { src: 'fotos/Prostate1.jpeg', alt: 'Cliente real comparte su resultado con Prostate' },
    { src: 'fotos/Floraints1.jpeg', alt: 'Experiencia auténtica con FloraInts' },
    { src: 'fotos/CalcioZen1.jpeg', alt: 'Captura real de conversación sobre CalcioZen' },
    { src: 'fotos/HepZen1.jpeg', alt: 'Cliente comparte su experiencia genuina con HepZen' },
    { src: 'fotos/GanoGold1.jpeg', alt: 'Experiencia real compartida sobre GanoGold' },
  ];

  /* ---------------------------------------------------------------
     FETCH FROM SUPABASE
     --------------------------------------------------------------- */
  async function fetchTestimonials() {
    try {
      if (typeof window.supabase === 'undefined') return null;
      var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      var res = await client
        .from('testimonials')
        .select('src, alt')
        .eq('active', true)
        .order('sort_order', { ascending: true, nullsFirst: false });
      if (res.error) throw res.error;
      if (!res.data || res.data.length === 0) return null;
      return res.data.map(function (item) {
        return { src: publicUrl(item.src), alt: item.alt };
      });
    } catch (_) {
      return null;
    }
  }

  /* ---------------------------------------------------------------
     CAROUSEL
     --------------------------------------------------------------- */
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

    this._raf = false;
    this._tween = null;
    this._rtimer = null;
    this._imagesLoaded = 0;
    this._measurePending = false;

    if (!this.viewport || !this.track) return;
    this.render();
    this.bind();
    // Load visible images immediately so they start fetching
    this.lazyLoad();
    // Measure after layout settles
    requestAnimationFrame(this.measure.bind(this));
  }

  /* ----- RENDER ----- */
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

      // Skeleton loader — shown while image loads
      var skeleton = document.createElement('div');
      skeleton.className = 'testimonials-skeleton';
      card.appendChild(skeleton);

      // Image element
      var picture = document.createElement('img');
      picture.dataset.src = img.src;
      picture.alt = '';
      picture.setAttribute('aria-hidden', 'true');
      picture.loading = 'lazy';
      picture.decoding = 'async';

      // On load: fade skeleton out, mark image as loaded
      picture.addEventListener('load', function () {
        self._imagesLoaded++;
        var sk = this.parentNode.querySelector('.testimonials-skeleton');
        if (sk) {
          gsap.to(sk, { opacity: 0, duration: 0.35, ease: 'power2.out', onComplete: function () { if (sk.parentNode) sk.remove(); } });
        }
        this.classList.add('loaded');

        // Re-measure after first image loads (dimensions may shift)
        if (self._imagesLoaded === 1 && !self._measurePending) {
          self._measurePending = true;
          requestAnimationFrame(function () {
            self.measure();
            self.refresh();
            self._measurePending = false;
          });
        }
      });

      // On error: replace skeleton with error icon
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

  /* ----- BIND ----- */
  Carousel.prototype.bind = function () {
    var self = this;
    this.viewport.addEventListener('pointerdown', function (e) { return self.down(e); });
    window.addEventListener('pointermove', function (e) { return self.move(e); });
    window.addEventListener('pointerup', function (e) { return self.up(e); });
    window.addEventListener('pointercancel', function (e) { return self.up(e); });
    this.viewport.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    this.section.addEventListener('keydown', function (e) { return self.key(e); });
    window.addEventListener('resize', function () { return self.resize(); });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { self.resize(); }, 350);
    });
  };

  /* ----- MEASURE ----- */
  Carousel.prototype.measure = function () {
    if (!this.cards.length) return;
    this.cardW = this.cards[0].offsetWidth;
    this.gap = parseFloat(window.getComputedStyle(this.track).gap) || 12;
    var vw = this.viewport.offsetWidth;
    this.trackW = this.cards.length * (this.cardW + this.gap) - this.gap;
    this.maxX = 0;
    this.minX = Math.min(0, vw - this.trackW);
    if (this.trackW <= vw) {
      this.minX = this.maxX = (vw - this.trackW) / 2;
    }
  };

  /* ----- REFRESH (measure + reclamp + visuals) ----- */
  Carousel.prototype.refresh = function () {
    this.measure();
    var x = gsap.getProperty(this.track, 'x');
    if (typeof x !== 'number') x = 0;
    this.currentX = Math.max(this.minX, Math.min(this.maxX, x));
    gsap.set(this.track, { x: this.currentX });
    this.visuals();
    this.lazyLoad();
  };

  /* ----- LAZY LOAD ----- */
  Carousel.prototype.lazyLoad = function () {
    if (!this.cards.length) return;
    var vpW = this.viewport.offsetWidth;
    var buf = vpW;
    var tx = this.currentX || 0;
    // Use measured cardW, or read from DOM if not yet measured
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

  /* ----- POINTER DOWN ----- */
  Carousel.prototype.down = function (e) {
    if (this.animating) {
      if (this._tween) { this._tween.kill(); this._tween = null; }
      this.animating = false;
    }
    this.viewport.setPointerCapture(e.pointerId);
    this.dragging = true;
    this.viewport.classList.add('dragging');
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.startTrackX = this.currentX;
    this.lastTime = performance.now();
    this.velocity = 0;
    this.velocitySamples = [];
  };

  /* ----- POINTER MOVE ----- */
  Carousel.prototype.move = function (e) {
    if (!this.dragging) return;
    var now = performance.now();
    var dt = now - this.lastTime;
    if (dt > 0) {
      var dx = e.clientX - this.lastX;
      this.velocitySamples.push({ dx: dx, dt: dt });
      if (this.velocitySamples.length > 5) this.velocitySamples.shift();
      var totalW = 0, totalV = 0;
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

  /* ----- POINTER UP ----- */
  Carousel.prototype.up = function (e) {
    if (!this.dragging) return;
    this.dragging = false;
    this.viewport.classList.remove('dragging');
    try { this.viewport.releasePointerCapture(e.pointerId); } catch (_) {}
    if (this._raf) { this._raf = false; this.visuals(); this.lazyLoad(); }
    if (this.currentX > this.maxX || this.currentX < this.minX) {
      this.animTo(Math.max(this.minX, Math.min(this.maxX, this.currentX)), 0.5);
      return;
    }
    var absV = Math.abs(this.velocity);
    if (absV > 0.003) {
      var momentum = this.velocity * 360;
      var target = this.currentX + momentum;
      target = Math.max(this.minX, Math.min(this.maxX, target));
      var dist = Math.abs(target - this.currentX);
      var dur = Math.min(dist / 500, 1.2);
      this.animTo(target, Math.max(dur, 0.25));
    } else {
      this.snap();
    }
  };

  /* ----- RUBBER BAND ----- */
  Carousel.prototype.rubber = function (x) {
    if (x > this.maxX) { var o = x - this.maxX; return this.maxX + Math.log(1 + o) * 35; }
    if (x < this.minX) { var o2 = this.minX - x; return this.minX - Math.log(1 + o2) * 35; }
    return x;
  };

  /* ----- ANIMATE TO ----- */
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
        self.visuals();
        if (Math.abs(self.velocity) < 0.005) self.snap();
      }
    });
  };

  /* ----- SNAP ----- */
  Carousel.prototype.snap = function () {
    if (!this.cards.length) return;
    this.measure();
    var vpW = this.viewport.offsetWidth;
    var vpC = vpW / 2;
    var nearIdx = 0, nearDist = Infinity;
    for (var i = 0; i < this.cards.length; i++) {
      var c = i * (this.cardW + this.gap) + this.cardW / 2;
      var d = Math.abs(c + this.currentX - vpC);
      if (d < nearDist) { nearDist = d; nearIdx = i; }
    }
    var target = -(nearIdx * (this.cardW + this.gap)) + (vpW - this.cardW) / 2;
    target = Math.max(this.minX, Math.min(this.maxX, target));
    if (Math.abs(target - this.currentX) < 2) return;
    this.animTo(target, 0.35);
  };

  /* ----- VISUALS (scale, opacity, rotation, depth) ----- */
  Carousel.prototype.visuals = function () {
    if (!this.cards.length) return;
    var vpW = this.viewport.offsetWidth;
    var vpC = vpW / 2;
    var tx = this.currentX;
    var maxD = vpW * 0.55;
    for (var i = 0; i < this.cards.length; i++) {
      var card = this.cards[i];
      var cC = i * (this.cardW + this.gap) + this.cardW / 2;
      var dist = Math.abs(cC + tx - vpC);
      var n = Math.min(dist / maxD, 1);
      var scale = 1 - n * 0.14;
      var opacity = 1 - n * 0.5;
      var dir = (cC + tx - vpC) / (vpW * 0.5);
      var rotY = -dir * 2.5 * (1 - Math.min(dist / (vpW * 0.3), 1));
      var sO = card._bs, oO = card._bo, rO = card._br;
      if (sO !== undefined &&
          Math.abs(scale - sO) < 0.005 &&
          Math.abs(opacity - oO) < 0.005 &&
          (rO !== undefined && Math.abs(rotY - rO) < 0.05)) {
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

  /* ----- KEYBOARD ----- */
  Carousel.prototype.key = function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    this.measure();
    var dir = e.key === 'ArrowRight' ? -1 : 1;
    var step = this.cardW + this.gap;
    var target = Math.max(this.minX, Math.min(this.maxX, this.currentX + dir * step));
    if (this._tween) { this._tween.kill(); this._tween = null; }
    this.animTo(target, 0.35);
  };

  /* ----- RESIZE / ORIENTATION ----- */
  Carousel.prototype.resize = function () {
    var self = this;
    clearTimeout(this._rtimer);
    this._rtimer = setTimeout(function () {
      self.measure();
      var c = Math.max(self.minX, Math.min(self.maxX, self.currentX));
      self.currentX = c;
      gsap.set(self.track, { x: c });
      self.visuals();
      self.lazyLoad();
    }, 120);
  };

  /* ---------------------------------------------------------------
     BOOT
     --------------------------------------------------------------- */
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
