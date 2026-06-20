(function () {
  'use strict';

  var _dataLayer = window.dataLayer || [];
  window.dataLayer = _dataLayer;

  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      _dataLayer.push(arguments);
    };
  }

  if (typeof window.fbq !== 'function') {
    window.fbq = function () {
    };
  }

  if (typeof window.clarity !== 'function') {
    window.clarity = function () {
    };
  }

  var GA4_CONFIG = {
    measurement_id: 'G-XXXXXXXXXX',
    send_page_view: true
  };

  var _firstWhatsAppTracked = false;

  function safeGtag() {
    if (typeof window.gtag === 'function') {
      window.gtag.apply(null, arguments);
    }
  }

  function safeFbq() {
    if (typeof window.fbq === 'function') {
      window.fbq.apply(null, arguments);
    }
  }

  function safeClarity() {
    if (typeof window.clarity === 'function') {
      window.clarity.apply(null, arguments);
    }
  }

  function TrackWhatsAppClick(productName, source) {
    var eventData = {
      event: 'whatsapp_click',
      product: productName,
      source: source
    };

    _dataLayer.push(eventData);
    safeGtag('event', 'whatsapp_click', {
      product: productName,
      source: source
    });
    safeFbq('track', 'Lead', {
      content_name: productName,
      content_category: source
    });

    if (!_firstWhatsAppTracked) {
      _firstWhatsAppTracked = true;
      _dataLayer.push({ event: 'first_whatsapp_click', product: productName });
      safeGtag('event', 'first_whatsapp_click', { product: productName });
    }
  }

  function TrackProductView(productId, productName) {
    var eventData = {
      event: 'product_view',
      product_id: productId,
      product_name: productName
    };

    _dataLayer.push(eventData);
    safeGtag('event', 'product_view', {
      product_id: productId,
      product_name: productName
    });
    safeFbq('track', 'ViewContent', {
      content_ids: [productId],
      content_name: productName,
      content_type: 'product'
    });
  }

  function TrackTimeOnPage() {
    var startTime = Date.now();

    function sendTime() {
      var seconds = Math.floor((Date.now() - startTime) / 1000);
      _dataLayer.push({
        event: 'time_on_page',
        seconds: seconds,
        formatted: Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's'
      });
      safeGtag('event', 'time_on_page', { seconds: seconds });
    }

    window.addEventListener('beforeunload', sendTime);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        sendTime();
      }
    });
  }

  function trackPageLoadTime() {
    if (!window.performance) return;

    window.addEventListener('load', function () {
      setTimeout(function () {
        var perf = window.performance.timing;
        if (perf) {
          var loadTime = perf.loadEventEnd - perf.navigationStart;
          var domTime = perf.domComplete - perf.domLoading;
          _dataLayer.push({
            event: 'page_load_complete',
            load_time_ms: loadTime,
            dom_processing_ms: domTime
          });
          safeGtag('event', 'page_load_performance', {
            load_time_ms: loadTime,
            dom_processing_ms: domTime
          });
        }
      }, 0);
    });
  }

  function trackScrollDepth() {
    var depths = [25, 50, 75, 100];
    var tracked = {};

    function checkScroll() {
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      var scrolled = (window.scrollY / scrollHeight) * 100;

      depths.forEach(function (depth) {
        if (!tracked[depth] && scrolled >= depth) {
          tracked[depth] = true;
          _dataLayer.push({
            event: 'scroll_depth',
            depth: depth,
            depth_label: depth + '%'
          });
          safeGtag('event', 'scroll_depth', {
            depth: depth,
            depth_label: depth + '%'
          });
        }
      });
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  function initWhatsAppTracking() {
    document.addEventListener('biozen:whatsappClick', function (e) {
      TrackWhatsAppClick(e.detail.product, e.detail.source);
    });
  }

  function init() {
    trackPageLoadTime();
    trackScrollDepth();
    TrackTimeOnPage();
    initWhatsAppTracking();
  }

  window.TrackWhatsAppClick = TrackWhatsAppClick;
  window.TrackProductView = TrackProductView;
  window.TrackTimeOnPage = TrackTimeOnPage;
  window.GA4_CONFIG = GA4_CONFIG;

  document.addEventListener('DOMContentLoaded', init);
})();
