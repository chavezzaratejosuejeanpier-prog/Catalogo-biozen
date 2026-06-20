(function () {
  'use strict';

  var WHATSAPP_NUMBER = '51972507949';

  var products = window.products || [];

  function getProductWhatsAppMessage(productName) {
    var name = productName || 'sus productos';
    return 'Hola BIOZEN, me interesa ' + name + '. Quisiera m\u00E1s informaci\u00F3n.';
  }

  function openWhatsApp(productName, source) {
    var msg = getProductWhatsAppMessage(productName);
    var src = source || 'generic';
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    trackClick(productName, src);
  }

  function openWhatsAppProduct(productId, source) {
    var product = null;
    if (products && products.length) {
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
          product = products[i];
          break;
        }
      }
    }
    var productName = product ? product.title : 'Producto #' + productId;
    var msg = getProductWhatsAppMessage(productName);
    var src = source || 'product';
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    trackClick(productName, src);
  }

  function openWhatsAppGeneric(source) {
    var msg = 'Hola BIOZEN, quiero informaci\u00F3n sobre sus productos.';
    var src = source || 'generic';
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    trackClick('General', src);
  }

  function trackClick(productName, source) {
    var event = new CustomEvent('biozen:whatsappClick', {
      detail: {
        product: productName,
        source: source
      },
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  function initDataAttributes() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-whatsapp-product]');
      if (!target) return;

      var productName = target.getAttribute('data-whatsapp-product');
      var source = target.getAttribute('data-whatsapp-source') || 'data-attribute';
      e.preventDefault();
      openWhatsApp(productName, source);
    });

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-whatsapp-product-id]');
      if (!target) return;

      var productId = parseInt(target.getAttribute('data-whatsapp-product-id'));
      var source = target.getAttribute('data-whatsapp-source') || 'data-attribute';
      if (isNaN(productId)) return;
      e.preventDefault();
      openWhatsAppProduct(productId, source);
    });
  }

  function init() {
    initDataAttributes();
  }

  window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
  window.openWhatsApp = openWhatsApp;
  window.openWhatsAppGeneric = openWhatsAppGeneric;
  window.openWhatsAppProduct = openWhatsAppProduct;
  window.getProductWhatsAppMessage = getProductWhatsAppMessage;

  document.addEventListener('DOMContentLoaded', init);
})();
