/* Tulia — search drawer + predictive search (Shopify) */
(function () {
  'use strict';

  var routes = window.tuliaRoutes || {};
  var predictiveUrl = (routes.predictive || '/search/suggest') + '.json';

  function openSearch() {
    document.body.classList.add('search-drawer-open');
    document.body.classList.add('no-scroll');
    var input = document.querySelector('[data-predictive-input]');
    if (input) setTimeout(function () { input.focus(); }, 50);
  }
  function closeSearch() {
    document.body.classList.remove('search-drawer-open');
    document.body.classList.remove('no-scroll');
  }

  var CS_NAMES = ['hair care serum', 'buttermax cream', 'the physical sunscreen gel', 'daily care shampoo'];

  function isComingSoon(title) {
    var t = (title || '').toLowerCase().replace(/^\s+|\s+$/g, '');
    for (var i = 0; i < CS_NAMES.length; i++) {
      var cs = CS_NAMES[i];
      if (t === cs || t.indexOf(cs) !== -1) return true;
      var words = cs.split(' ');
      var sig = 0, hit = 0;
      for (var j = 0; j < words.length; j++) {
        var w = words[j];
        if (w.length > 2 && w !== 'the' && w !== 'and' && w !== 'for') {
          sig++;
          if (t.indexOf(w) !== -1) hit++;
        }
      }
      if (sig >= 2 && hit === sig) return true;
    }
    return false;
  }

  function renderResults(container, data) {
    var products = (data.resources && data.resources.results && data.resources.results.products) || [];
    if (!products.length) {
      container.innerHTML = '<p class="search-drawer__empty">No products found.</p>';
      return;
    }
    var html = '<div class="search-drawer__grid">';
    products.forEach(function (p) {
      var img = p.image || (p.featured_image && p.featured_image.url) || '';
      if (isComingSoon(p.title)) {
        html += '<div class="search-result is-coming-soon" aria-disabled="true">' +
          '<span class="search-result__media">' +
          (img ? '<img src="' + img + '" alt="" loading="lazy">' : '<span class="search-result__noimg"></span>') +
          '<span class="search-result__badge"><span>Coming Soon</span></span></span>' +
          '<span class="search-result__info"><span class="search-result__title">' + p.title + '</span></span></div>';
      } else {
        html += '<a class="search-result" href="' + p.url + '">' +
          (img ? '<img src="' + img + '" alt="" loading="lazy">' : '<span class="search-result__noimg"></span>') +
          '<span class="search-result__info"><span class="search-result__title">' + p.title + '</span>' +
          '<span class="search-result__price">' + (p.price || '') + '</span></span></a>';
      }
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function query(term, container) {
    var url = predictiveUrl + '?q=' + encodeURIComponent(term) +
      '&resources[type]=product&resources[limit]=8&resources[options][unavailable_products]=last';
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) { renderResults(container, data); })
      .catch(function () { container.innerHTML = ''; });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-search-open]')) { e.preventDefault(); openSearch(); return; }
    if (e.target.closest('[data-search-close]')) { e.preventDefault(); closeSearch(); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
  });

  var timer;
  document.addEventListener('input', function (e) {
    var input = e.target.closest('[data-predictive-input]');
    if (!input) return;
    var container = document.querySelector('[data-predictive-results]');
    if (!container) return;
    var term = input.value.trim();
    if (window.tuliaPredictiveSearch === false || term.length < 2) { container.innerHTML = ''; return; }
    clearTimeout(timer);
    timer = setTimeout(function () { query(term, container); }, 250);
  });
})();
