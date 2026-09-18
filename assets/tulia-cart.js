/* Tulia — AJAX cart + slide-out drawer (Shopify) */
(function () {
  'use strict';

  var routes = window.tuliaRoutes || {
    cart_add: '/cart/add', cart_change: '/cart/change', cart_update: '/cart/update', cart: '/cart'
  };

  function hasDrawer() {
    return window.tuliaCartType === 'drawer' && document.getElementById('shopify-section-cart-drawer');
  }

  function openDrawer() { document.body.classList.add('cart-drawer-open'); document.body.classList.add('no-scroll'); }
  function closeDrawer() { document.body.classList.remove('cart-drawer-open'); document.body.classList.remove('no-scroll'); }

  function refreshCartCount() {
    return fetch(routes.cart + '.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.classList.toggle('is-empty', cart.item_count === 0);
        });
        return cart;
      })
      .catch(function () {});
  }

  // Pull a fresh render of the cart-drawer section and swap it in.
  function renderDrawer() {
    if (!hasDrawer()) return Promise.resolve();
    return fetch('/?sections=cart-drawer', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var wrap = document.getElementById('shopify-section-cart-drawer');
        if (wrap && data['cart-drawer'] != null) wrap.innerHTML = data['cart-drawer'];
      })
      .catch(function () {});
  }

  function changeLine(key, quantity) {
    return fetch(routes.cart_change + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(function () { return Promise.all([renderDrawer(), refreshCartCount()]); });
  }

  function updateNote(value) {
    return fetch(routes.cart_update + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ note: value })
    });
  }

  // --- Add to cart (intercept product/quick-add forms) ---
  function onProductFormSubmit(form) {
    form.addEventListener('submit', function (e) {
      if (window.tuliaCartAjax === false || !window.fetch) return; // native submit
      e.preventDefault();

      var btn = form.querySelector('[type="submit"]');
      var original = btn ? btn.innerHTML : '';
      if (btn) { btn.setAttribute('disabled', 'disabled'); btn.classList.add('is-loading'); }

      fetch(routes.cart_add + '.js', {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
      })
        .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); })
        .then(function (res) {
          if (!res.ok) { throw res.body; }
          return Promise.all([renderDrawer(), refreshCartCount()]);
        })
        .then(function () {
          if (btn) { btn.removeAttribute('disabled'); btn.classList.remove('is-loading'); btn.innerHTML = original; }
          if (hasDrawer()) {
            openDrawer();
          } else if (btn) {
            btn.innerHTML = 'Added ✓';
            setTimeout(function () { btn.innerHTML = original; }, 1400);
          }
          document.dispatchEvent(new CustomEvent('tulia:cart:added'));
        })
        .catch(function (err) {
          if (btn) { btn.removeAttribute('disabled'); btn.classList.remove('is-loading'); btn.innerHTML = original; }
          if (err && err.description) {
            // Surface Shopify's error (e.g. out of stock) without blocking.
            alert(err.description);
          } else {
            form.submit();
          }
        });
    });
  }

  // --- Delegated drawer interactions (survive section re-render) ---
  document.addEventListener('click', function (e) {
    var openEl = e.target.closest('[data-cart-open]');
    if (openEl) {
      if (hasDrawer()) { e.preventDefault(); openDrawer(); renderDrawer(); }
      return;
    }
    if (e.target.closest('[data-cart-close]')) { e.preventDefault(); closeDrawer(); return; }

    var removeEl = e.target.closest('[data-cart-remove]');
    if (removeEl) { e.preventDefault(); changeLine(removeEl.getAttribute('data-key'), 0); return; }

    var up = e.target.closest('[data-qty-up]');
    var down = e.target.closest('[data-qty-down]');
    if (up || down) {
      var wrap = (up || down).closest('[data-qty-wrap]');
      var input = wrap && wrap.querySelector('[data-qty]');
      if (input) {
        var q = parseInt(input.value, 10) || 0;
        q = up ? q + 1 : Math.max(0, q - 1);
        input.value = q;
        changeLine(input.getAttribute('data-key'), q);
      }
    }
  });

  document.addEventListener('change', function (e) {
    var qty = e.target.closest('[data-qty]');
    if (qty) {
      var q = parseInt(qty.value, 10);
      if (isNaN(q) || q < 0) q = 0;
      changeLine(qty.getAttribute('data-key'), q);
    }
  });

  var noteTimer;
  document.addEventListener('input', function (e) {
    var note = e.target.closest('[data-cart-note]');
    if (note) { clearTimeout(noteTimer); noteTimer = setTimeout(function () { updateNote(note.value); }, 500); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  document.addEventListener('DOMContentLoaded', function () {
    refreshCartCount();
    document.querySelectorAll('form[action$="/cart/add"], form[data-ajax-cart]').forEach(onProductFormSubmit);
  });

  window.TuliaCart = { refreshCartCount: refreshCartCount, renderDrawer: renderDrawer, open: openDrawer, close: closeDrawer };
})();
