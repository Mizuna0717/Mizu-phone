// ==========================================================
//  PHONE SHOPPING APP
//  模块 3：骰子 + AI 一次性生成（含 Private 密码）
// ==========================================================

;(function() {
  'use strict';

  var _pshopView = 'all';
  var _pshopPrivateUnlocked = false;

  // ══════════════════════════════════════════════
  //  1. 基础工具
  // ══════════════════════════════════════════════
  function _pshopEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _pshopCurrencySymbol(cur) {
    var map = { JPY:'¥', CNY:'¥', USD:'$', EUR:'€', GBP:'£', KRW:'₩', HKD:'HK$', TWD:'NT$' };
    return map[cur] || (cur + ' ');
  }
  function _pshopFormatPrice(amount, currency) {
    var sym = _pshopCurrencySymbol(currency || 'USD');
    var noDecimal = ['JPY','KRW','CNY','TWD'].indexOf(currency) >= 0;
    return noDecimal
      ? sym + Math.round(amount).toLocaleString('en-US')
      : sym + Number(amount).toFixed(2);
  }
  function _pshopFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    var DAY = 86400000;
    if (diff < DAY) return 'Today';
    if (diff < 2 * DAY) return 'Yesterday';
    if (diff < 7 * DAY) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    return (d.getMonth()+1) + '/' + d.getDate();
  }

  // ══════════════════════════════════════════════
  //  2. 数据访问
  // ══════════════════════════════════════════════
  function _pshopFindMeta(ownerCharId) {
    var arr = state.shoppingData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].ownerCharId === ownerCharId && arr[i].type === 'meta') return arr[i];
    }
    return null;
  }
  function _pshopGetProducts(ownerCharId, includeAdult) {
    return (state.shoppingData || []).filter(function(p){
      if (!p || p.ownerCharId !== ownerCharId || p.type !== 'product') return false;
      if (!includeAdult && p.isAdult) return false;
      return true;
    });
  }
  function _pshopGetCart(ownerCharId) {
    var arr = state.shoppingData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].ownerCharId === ownerCharId && arr[i].type === 'cart') return arr[i];
    }
    return null;
  }
  function _pshopGetOrders(ownerCharId) {
    return (state.shoppingData || []).filter(function(o){
      return o && o.ownerCharId === ownerCharId && o.type === 'order';
    }).sort(function(a, b){ return (b.timestamp || 0) - (a.timestamp || 0); });
  }

  // ══════════════════════════════════════════════
  //  3. SVG 图标
  // ══════════════════════════════════════════════
  var _pshopIconImage = '<svg viewBox="0 0 32 32" width="36" height="36" fill="none"><rect x="3" y="5" width="26" height="22" rx="3" stroke="currentColor" stroke-width="1.4"/><path d="M3 20l7-6 4 3 5-5 10 8" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="22" cy="11" r="2" stroke="currentColor" stroke-width="1.4"/></svg>';
  var _pshopIconLock = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M7.5 9V6a2.5 2.5 0 015 0v3" stroke="currentColor" stroke-width="1.4"/></svg>';
  var _pshopIconBack = '<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><path d="M12 4l-6 6 6 6" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var _pshopIconStar = '<svg viewBox="0 0 12 12" width="11" height="11" fill="none"><path d="M6 1l1.5 3.2L11 4.6 8.5 7l.6 3.4L6 8.8 2.9 10.4l.6-3.4L1 4.6l3.5-.4z" fill="rgba(255,214,10,.7)" stroke="rgba(255,214,10,.7)" stroke-width=".5" stroke-linejoin="round"/></svg>';

  // ══════════════════════════════════════════════
  //  4. 分类颜色 + 标签
  // ══════════════════════════════════════════════
  var _pshopCategoryColors = {
    electronics: 'rgba(90, 130, 200, .18)',
    clothing:    'rgba(200, 120, 140, .18)',
    home:        'rgba(140, 160, 140, .18)',
    books:       'rgba(180, 160, 120, .18)',
    sports:      'rgba(120, 180, 160, .18)',
    beauty:      'rgba(200, 130, 160, .18)',
    food:        'rgba(190, 160, 110, .18)',
    stationery:  'rgba(150, 150, 170, .18)',
    accessories: 'rgba(140, 130, 190, .18)',
    adult:       'rgba(200, 100, 130, .18)',
    other:       'rgba(150, 150, 160, .15)'
  };
  function _pshopCategoryColor(cat) { return _pshopCategoryColors[cat] || _pshopCategoryColors.other; }
  function _pshopCategoryLabel(cat) {
    var m = {
      electronics:'电子产品', clothing:'服装', home:'家居', books:'书籍',
      sports:'运动', beauty:'美妆', food:'食品', stationery:'文具',
      accessories:'配饰', adult:'成人用品', other:'其他'
    };
    return m[cat] || '其他';
  }

  // ══════════════════════════════════════════════
  //  5. 商品行
  // ══════════════════════════════════════════════
  function _pshopBuildProductRowHTML(p) {
    var catColor = _pshopCategoryColor(p.category);
    var h = '<div class="pshop-product" data-product-id="' + _pshopEscape(p.id) + '" ' +
            'onclick="openProductDetail(\'' + _pshopEscape(p.id) + '\')" ' +
            'style="cursor:pointer;-webkit-tap-highlight-color:transparent">';
    h += '<div class="pshop-product-img" onclick="event.stopPropagation();pshopToggleProductImage(this)">';
    h += '<div class="pshop-product-img-svg">' + _pshopIconImage + '</div>';
    if (p.imageDesc) {
      h += '<div class="pshop-product-img-desc">' + _pshopEscape(p.imageDesc) + '</div>';
    }
    h += '</div>';
    h += '<div class="pshop-product-info">';
    h += '<div class="pshop-product-name">' + _pshopEscape(p.name) + '</div>';
    h += '<div class="pshop-product-meta">';
    h += '<span class="pshop-product-rating">' + _pshopIconStar + ' ' + (p.rating || 0).toFixed(1) + '</span>';
    if (p.reviewCount > 0) {
      h += '<span class="pshop-product-sep">·</span>';
      h += '<span>' + p.reviewCount + ' reviews</span>';
    }
    h += '</div>';
    h += '<div class="pshop-product-bottom">';
    h += '<span class="pshop-product-price">' + _pshopFormatPrice(p.price, p.currency) + '</span>';
    h += '<span class="pshop-product-tag" style="background:' + catColor + '">' + _pshopCategoryLabel(p.category) + '</span>';
    h += '</div>';
    if (p.store) {
      h += '<div class="pshop-product-store">' + _pshopEscape(p.store) + '</div>';
    }
    h += '</div>';
    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  6. Tab
  // ══════════════════════════════════════════════
  function _pshopBuildTabsHTML() {
    function tab(id, label, icon) {
      var active = (_pshopView === id) ? ' pshop-tab-active' : '';
      return '<div class="pshop-tab' + active + '" onclick="pshopSwitchTab(\'' + id + '\')">' +
        (icon || '') + label +
      '</div>';
    }
    var h = '<div class="pshop-tabs">';
    h += tab('all', 'All');
    h += tab('cart', 'Cart');
    h += tab('orders', 'Orders');
    h += tab('private', 'Private', '<span class="pshop-tab-lock">' + _pshopIconLock + '</span>');
    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  7. 三个 Tab 内容
  // ══════════════════════════════════════════════
  function _pshopBuildAllTabHTML(ownerCharId) {
    var products = _pshopGetProducts(ownerCharId, false);
    if (products.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<path d="M10 14h28l-3 20H13z"/><path d="M16 14a8 8 0 0116 0"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No products yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var h = '';
    h += '<div class="papp-search">' +
      '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg>' +
      '<span>Search products</span>' +
    '</div>';

    var cats = {};
    products.forEach(function(p){ cats[p.category] = (cats[p.category] || 0) + 1; });
    var catKeys = Object.keys(cats);
    if (catKeys.length > 0) {
      h += '<div class="pshop-chips">';
      h += '<div class="pshop-chip pshop-chip-active">All</div>';
      catKeys.forEach(function(c){
        h += '<div class="pshop-chip">' + _pshopCategoryLabel(c) + '</div>';
      });
      h += '</div>';
    }

    h += '<div class="pshop-section-title">Recommended</div>';
    products.forEach(function(p){ h += _pshopBuildProductRowHTML(p); });
    return h;
  }

  function _pshopBuildCartTabHTML(ownerCharId) {
    var cart = _pshopGetCart(ownerCharId);
    var items = (cart && Array.isArray(cart.items)) ? cart.items : [];
    if (items.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<div style="color:rgba(255,255,255,.4);font-size:15px">Your cart is empty</div>' +
      '</div>';
    }

    var total = 0;
    var cur = cart.currency || 'USD';
    items.forEach(function(it){ total += (it.price * (it.qty || 1)); });

    var h = '<div class="pshop-section-title">Cart (' + items.length + ' items)</div>';
    items.forEach(function(it){
      h += '<div class="pshop-cart-item">';
      h += '<div class="pshop-cart-img"><div class="pshop-product-img-svg">' + _pshopIconImage + '</div></div>';
      h += '<div class="pshop-cart-info">';
      h += '<div class="pshop-cart-name">' + _pshopEscape(it.name) + '</div>';
      h += '<div class="pshop-cart-meta">Qty: ' + (it.qty || 1) + '</div>';
      h += '</div>';
      h += '<div class="pshop-cart-price">' + _pshopFormatPrice(it.price * (it.qty || 1), cur) + '</div>';
      h += '</div>';
    });
    h += '<div class="pshop-cart-total">';
    h += '<span>Total</span>';
    h += '<span>' + _pshopFormatPrice(total, cur) + '</span>';
    h += '</div>';
    return h;
  }

  function _pshopBuildOrdersTabHTML(ownerCharId) {
    var orders = _pshopGetOrders(ownerCharId);
    if (orders.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<div style="color:rgba(255,255,255,.4);font-size:15px">No orders yet</div>' +
      '</div>';
    }

    var h = '<div class="pshop-section-title">Order History</div>';
    orders.forEach(function(o){
      var itemNames = (o.items || []).map(function(it){ return it.name; }).join(', ');
      var statusLabel = { delivered: '已送达', shipped: '运送中', processing: '处理中', cancelled: '已取消' }[o.status] || o.status;

      h += '<div class="pshop-order">';
      h += '<div class="pshop-order-header">';
      h += '<span class="pshop-order-merchant">' + _pshopEscape(o.merchant) + '</span>';
      h += '<span class="pshop-order-time">' + _pshopFormatTime(o.timestamp) + '</span>';
      h += '</div>';
      h += '<div class="pshop-order-items">' + _pshopEscape(itemNames) + '</div>';
      h += '<div class="pshop-order-footer">';
      h += '<span class="pshop-order-total">' + _pshopFormatPrice(o.total, o.currency) + '</span>';
      h += '<span class="pshop-order-status pshop-order-status-' + o.status + '">' + statusLabel + '</span>';
      h += '</div>';
      h += '</div>';
    });
    return h;
  }

  function _pshopBuildPrivateTabHTML(ownerCharId) {
    var adultProducts = _pshopGetProducts(ownerCharId, true).filter(function(p){ return p.isAdult; });
    var h = '<div class="pshop-section-title">Private · ' + adultProducts.length + ' items</div>';
    if (adultProducts.length === 0) {
      h += '<div class="pshop-empty-hint">No private products</div>';
    } else {
      adultProducts.forEach(function(p){ h += _pshopBuildProductRowHTML(p); });
    }
    return h;
  }

  // ══════════════════════════════════════════════
  //  8. 主入口
  // ══════════════════════════════════════════════
  function _pshopBuildListHTML(ownerCharId) {
    var h = '';
    if (_pshopView === 'all') h = _pshopBuildAllTabHTML(ownerCharId);
    else if (_pshopView === 'cart') h = _pshopBuildCartTabHTML(ownerCharId);
    else if (_pshopView === 'orders') h = _pshopBuildOrdersTabHTML(ownerCharId);
    else if (_pshopView === 'private') h = _pshopBuildPrivateTabHTML(ownerCharId);
    return _pshopBuildTabsHTML() + h;
  }

  function _pshopPageRenderer(charName) {
    setTimeout(_pshopInjectHeaderBtns, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pshopBuildListHTML(ownerCharId);
  }

  // ══════════════════════════════════════════════
  //  9. Header 按钮
  // ══════════════════════════════════════════════
  function _pshopInjectHeaderBtns() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollShoppingData()" title="Generate">' +
        '<svg viewBox="0 0 20 20" width="20" height="20" stroke="#0a84ff" fill="none" ' +
        'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="2.5" y="2.5" width="15" height="15" rx="2.5"/>' +
          '<circle cx="7" cy="7" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="10" cy="10" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="13" cy="13" r="1.3" fill="#0a84ff" stroke="none"/>' +
        '</svg>' +
      '</button>';
  }

  // ══════════════════════════════════════════════
  //  10. 交互
  // ══════════════════════════════════════════════
  function _pshopRerender() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    var bodyEl = pageEl.querySelector('.papp-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = _pshopBuildListHTML(ownerCharId);
    setTimeout(_pshopInjectHeaderBtns, 0);
  }

  window.pshopSwitchTab = function(tabId) {
    if (!tabId) return;
    if (tabId === 'private' && !_pshopPrivateUnlocked) {
      pshopOpenPrivate();
      return;
    }
    _pshopView = tabId;
    _pshopRerender();
  };

  window.pshopToggleProductImage = function(el) {
    if (!el) return;
    el.classList.toggle('pshop-img-show-desc');
  };

    // ══════════════════════════════════════════════
  //  10.5 商品详情页（模块 4）
  // ══════════════════════════════════════════════

  function _pshopFindProductById(productId) {
    var arr = state.shoppingData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === productId && arr[i].type === 'product') return arr[i];
    }
    return null;
  }

  function _pshopBuildProductDetailHTML(p) {
    var catColor = _pshopCategoryColor(p.category);
    var h = '<div class="pshop-detail-page">';

    // 顶栏
    h += '<div class="pshop-detail-header">' +
      '<button class="pshop-detail-back" onclick="backToShopList()">' +
        _pshopIconBack + '<span>Shop</span>' +
      '</button>' +
      '<div class="pshop-detail-title">Product</div>' +
      '<div class="pshop-detail-header-right"></div>' +
    '</div>';

    // 滚动区
    h += '<div class="pshop-detail-scroll">';

    // 大图区
    h += '<div class="pshop-detail-hero" onclick="pshopToggleDetailImage(this)">';
    h += '<div class="pshop-detail-hero-svg">' + _pshopIconImage + '</div>';
    if (p.imageDesc) {
      h += '<div class="pshop-detail-hero-desc">' + _pshopEscape(p.imageDesc) + '</div>';
    }
    h += '</div>';

    // 商品名
    h += '<div class="pshop-detail-name">' + _pshopEscape(p.name) + '</div>';

    // 评分
    if (p.rating) {
      h += '<div class="pshop-detail-rating">';
      h += '<span class="pshop-detail-rating-star">' + _pshopIconStar + '</span>';
      h += '<span class="pshop-detail-rating-val">' + p.rating.toFixed(1) + '</span>';
      if (p.reviewCount > 0) {
        h += '<span class="pshop-detail-rating-sep">·</span>';
        h += '<span class="pshop-detail-rating-count">' + p.reviewCount + ' reviews</span>';
      }
      h += '</div>';
    }

    // 价格
    h += '<div class="pshop-detail-price">' + _pshopFormatPrice(p.price, p.currency) + '</div>';

    // 标签行（分类 + 店铺）
    h += '<div class="pshop-detail-tags">';
    h += '<span class="pshop-product-tag" style="background:' + catColor + '">' + _pshopCategoryLabel(p.category) + '</span>';
    if (p.store) {
      h += '<span class="pshop-detail-store">' + _pshopEscape(p.store) + '</span>';
    }
    h += '</div>';

    // 分隔
    h += '<div class="pshop-detail-divider"></div>';

    // 想法
    if (p.thoughts && String(p.thoughts).trim()) {
      h += '<div class="pshop-detail-thoughts">';
      h += '<div class="pshop-thoughts-label">内心想法</div>';
      h += '<div class="pshop-thoughts-text">' + _pshopEscape(p.thoughts) + '</div>';
      h += '</div>';
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /detail-page
    return h;
  }

  window.openProductDetail = function(productId) {
    var p = _pshopFindProductById(productId);
    if (!p) { showToast('Product not found'); return; }

    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;

    pageEl.innerHTML = _pshopBuildProductDetailHTML(p);
    pageEl.scrollTop = 0;

    var scrollEl = pageEl.querySelector('.pshop-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;

    console.log('[openProductDetail]', p.name);
  };

  window.backToShopList = function() {
    if (typeof openPhoneApp === 'function') openPhoneApp('shopping');
  };

  window.pshopToggleDetailImage = function(el) {
    if (!el) return;
    el.classList.toggle('pshop-detail-img-show-desc');
  };

    // ══════════════════════════════════════════════
  //  10.6 Private 密码锁（模块 7）
  // ══════════════════════════════════════════════

  function _pshopBuildPasswordModalHTML() {
    return '<div class="pshop-pw-overlay" id="pshopPwOverlay" onclick="pshopClosePasswordModal()">' +
      '<div class="pshop-pw-modal" onclick="event.stopPropagation()">' +
        '<div class="pshop-pw-icon">' + _pshopIconLock + '</div>' +
        '<div class="pshop-pw-title">Private</div>' +
        '<div class="pshop-pw-sub">Enter 4-digit password</div>' +
        '<input type="password" inputmode="numeric" maxlength="4" class="pshop-pw-input" id="pshopPwInput" onkeydown="if(event.key===\'Enter\')pshopSubmitPassword()" />' +
        '<div class="pshop-pw-error" id="pshopPwError"></div>' +
        '<div class="pshop-pw-actions">' +
          '<button class="pshop-pw-btn pshop-pw-cancel" onclick="pshopClosePasswordModal()">Cancel</button>' +
          '<button class="pshop-pw-btn pshop-pw-confirm" onclick="pshopSubmitPassword()">Unlock</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  window.pshopOpenPrivate = function() {
    // 已解锁 → 直接进
    if (_pshopPrivateUnlocked) {
      _pshopView = 'private';
      _pshopRerender();
      return;
    }
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    // 避免重复插入
    if (document.getElementById('pshopPwOverlay')) return;
    pageEl.insertAdjacentHTML('beforeend', _pshopBuildPasswordModalHTML());
    setTimeout(function(){
      var input = document.getElementById('pshopPwInput');
      if (input) input.focus();
    }, 100);
  };

  window.pshopClosePasswordModal = function() {
    var overlay = document.getElementById('pshopPwOverlay');
    if (overlay) overlay.remove();
  };

  window.pshopSubmitPassword = function() {
    var input = document.getElementById('pshopPwInput');
    var errEl = document.getElementById('pshopPwError');
    if (!input) return;

    var entered = String(input.value || '').trim();
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var meta = _pshopFindMeta(ownerCharId);
    var correctPass = (meta && meta.privatePassword) ? meta.privatePassword : '1234';

    if (entered === correctPass) {
      _pshopPrivateUnlocked = true;
      window.pshopClosePasswordModal();
      _pshopView = 'private';
      _pshopRerender();
      console.log('[pshopSubmitPassword] 解锁成功');
      if (typeof showToast === 'function') showToast('Unlocked');
    } else {
      if (errEl) {
        errEl.textContent = 'Wrong password';
        errEl.style.opacity = '1';
      }
      input.value = '';
      input.classList.add('pshop-pw-input-error');
      setTimeout(function(){ input.classList.remove('pshop-pw-input-error'); }, 400);
      input.focus();
    }
  };

  // ══════════════════════════════════════════════
  //  11. Prompt
  // ══════════════════════════════════════════════
  function _pshopBuildPrompt(ownerInfo, historyBlock, worldbookBlk, todayStr) {
    return 'You are writing the SHOPPING APP of a fictional phone owner.\n' +
      'The phone owner is "' + ownerInfo.name + '".\n' +
      'Today is: ' + todayStr + '\n\n' +

      '=== PHONE OWNER ===\n' + ownerInfo.block + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      (historyBlock ? historyBlock + '\n' : '') +

      '=== PRIORITY RULE ===\n' +
      'If CHAT HISTORY conflicts with WORLD SETTING or PERSONA, CHAT HISTORY WINS.\n' +
      'If the owner mentions wanting to buy something in chat, it should appear.\n' +
      'If chat mentions an anniversary/birthday, use it for the Private password.\n\n' +

      '=== STEP 1: CONSUMER PROFILE (analyze silently) ===\n' +
      'Determine:\n' +
      '  - WEALTH: wealthy / upper-middle / middle / modest / struggling\n' +
      '  - SHOPPING HABIT: heavy shopper / moderate / minimalist\n' +
      '  - INTERESTS: electronics / fashion / home / sports / beauty / books / etc.\n' +
      '  - REGION / CURRENCY: match persona (Japan → JPY, Korea → KRW, China → CNY,\n' +
      '    USA → USD, UK → GBP, Eurozone → EUR, Hong Kong → HKD, Taiwan → TWD)\n' +
      '  - AGE: young / middle / older (affects product style)\n\n' +

      '=== STEP 2: PRODUCTS (10-30 total) ===\n' +
      '  - Heavy shopper → 25-30 products\n' +
      '  - Moderate → 18-24\n' +
      '  - Minimalist → 10-15\n\n' +

      'PRICE RANGE by wealth (in primary currency scale):\n' +
      '  - wealthy      : 500 ~ 50000\n' +
      '  - upper-middle : 100 ~ 5000\n' +
      '  - middle       : 20  ~ 500\n' +
      '  - modest/poor  : 5   ~ 100\n\n' +

      'CATEGORIES — distribute by INTERESTS:\n' +
      '  electronics / clothing / home / books / sports / beauty / food /\n' +
      '  stationery / accessories / other\n\n' +

      'Each product:\n' +
      '  - "name"        : product name (native language)\n' +
      '  - "price"       : number\n' +
      '  - "currency"    : ISO code\n' +
      '  - "category"    : one of the categories above\n' +
      '  - "rating"      : 3.5 ~ 5.0 (one decimal)\n' +
      '  - "reviewCount" : number (bigger for popular items)\n' +
      '  - "store"       : seller/brand (Amazon / Uniqlo / Nike / IKEA / etc, fit region)\n' +
      '  - "imageDesc"   : 1 sentence describing what the product looks like (native language)\n' +
      '  - "thoughts"    : 1 sentence — owner\'s reaction to seeing this product (native language)\n' +
      '  - "isAdult"     : false\n\n' +

      '=== STEP 3: ADULT PRODUCTS (Private, 2-6 items) ===\n' +
      'Generate 2-6 INTIMATE / ADULT products the owner would shop for.\n' +
      'Match owner\'s age / gender / relationship context from chat.\n' +
      'Set "isAdult": true. Include all fields above PLUS:\n' +
      '  - "category": "adult"\n' +
      'Thoughts can be explicit — this is a private shopping list.\n\n' +

      '=== STEP 4: PRIVATE PASSWORD (4-digit) ===\n' +
      'Password extraction priority:\n' +
      '  1. PERSONA anniversary (纪念日 / 記念日 / 기념일) → MM DD → MMDD\n' +
      '  2. PERSONA owner\'s birthday → MMDD\n' +
      '  3. CHAT HISTORY mentioned date (user birthday, first meeting, etc.) → MMDD\n' +
      '  4. Fallback: "1234"\n\n' +

      '=== STEP 5: CART (0-5 items) ===\n' +
      'A cart with 0-5 items. If 0, use empty array.\n' +
      'Each item: { "name": "...", "price": N, "qty": 1 }\n' +
      'Items should be from the products list above (or similar).\n\n' +

      '=== STEP 6: ORDERS (3-12 orders) ===\n' +
      'Past orders (things already purchased).\n' +
      'Each order:\n' +
      '  - "merchant"  : store name\n' +
      '  - "items"     : array of { name, price, qty }\n' +
      '  - "total"     : sum\n' +
      '  - "currency"  : ISO code\n' +
      '  - "status"    : "delivered" | "shipped" | "processing" | "cancelled"\n' +
      '  - "daysAgo"   : 1 ~ 60\n\n' +

      '=== STEP 7: LANGUAGE ===\n' +
      'ALL text (product names, store names, imageDesc, thoughts) in owner\'s native language.\n' +
      'Non-Chinese → native FIRST, Chinese translation in parentheses.\n' +
      'Example: "ワイヤレスイヤホン (无线耳机)"\n' +
      'Pure Chinese → no translation.\n\n' +

      '=== STEP 8: CONTENT BOUNDARY ===\n' +
      'Normal products reveal shopping taste, not private life.\n' +
      'Adult products are private and can be explicit — match relationship context.\n\n' +

      '=== OUTPUT — valid JSON only ===\n' +
      '{\n' +
      '  "privatePassword": "0615",\n' +
      '  "currency": "JPY",\n' +
      '  "products": [\n' +
      '    {\n' +
      '      "name": "ワイヤレスイヤホン (无线耳机)",\n' +
      '      "price": 24800, "currency": "JPY",\n' +
      '      "category": "electronics",\n' +
      '      "rating": 4.6, "reviewCount": 1240,\n' +
      '      "store": "Amazon",\n' +
      '      "imageDesc": "黒いケースに入った白いワイヤレスイヤホン (白色无线耳机配有黑色充电盒)",\n' +
      '      "thoughts": "前から欲しかった。 (一直想要。)",\n' +
      '      "isAdult": false\n' +
      '    }\n' +
      '  ],\n' +
      '  "cart": [\n' +
      '    { "name": "ノート3冊セット (笔记本 3 本装)", "price": 980, "qty": 1 }\n' +
      '  ],\n' +
      '  "orders": [\n' +
      '    {\n' +
      '      "merchant": "Uniqlo",\n' +
      '      "items": [ { "name": "Tシャツ (T恤)", "price": 1500, "qty": 3 } ],\n' +
      '      "total": 4500, "currency": "JPY",\n' +
      '      "status": "delivered",\n' +
      '      "daysAgo": 3\n' +
      '    }\n' +
      '  ]\n' +
      '}\n';
  }

  // ══════════════════════════════════════════════
  //  12. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _pshopGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollShoppingData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', block: '' };

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 20) : [];
    var historyBlock = '';
    if (recent.length > 0) {
      historyBlock = '=== CHAT HISTORY (HIGHEST PRIORITY) ===\n';
      recent.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
    }

    var now = new Date();
    var todayStr = now.getFullYear() + '-' + ('' + (now.getMonth()+1)).padStart(2,'0') + '-' + ('' + now.getDate()).padStart(2,'0');

    var prompt = _pshopBuildPrompt(ownerInfo, historyBlock, worldbookBlk, todayStr);
    console.log('[rollShoppingData] prompt 长度:', prompt.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollShoppingData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollShoppingData] raw reply 长度:', rawReply.length);

    var obj = null;
    try { var jm = rawReply.match(/\{[\s\S]*\}/); if (jm) obj = JSON.parse(jm[0]); }
    catch(e) { console.warn('[rollShoppingData] 完整解析失败:', e.message); }

    if (!obj) {
      console.warn('[rollShoppingData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('{');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx);
        for (var cut = body.length; cut > 0; cut -= 50) {
          var probe = body.slice(0, cut);
          var opens = (probe.match(/\[/g) || []).length - (probe.match(/\]/g) || []).length;
          var bopens = (probe.match(/\{/g) || []).length - (probe.match(/\}/g) || []).length;
          for (var q = 0; q < opens; q++) probe += ']';
          for (var w = 0; w < bopens; w++) probe += '}';
          try { obj = JSON.parse(probe); console.log('[rollShoppingData] 截断补救成功'); break; }
          catch(e2) {}
        }
      }
    }

    if (!obj || typeof obj !== 'object') { console.warn('[rollShoppingData] 无法解析'); return null; }

    // 密码归一化
    var rawPass = obj.privatePassword != null ? String(obj.privatePassword).trim() : '';
    var password = /^\d{4}$/.test(rawPass) ? rawPass : '1234';
    console.log('[rollShoppingData] 密码:', password, '(AI:', rawPass, ')');

    var nowTs = Date.now();
    var HOUR = 3600000;
    var DAY = 86400000;
    var defaultCur = obj.currency || 'USD';
    var out = [];

    // meta
    out.push({
      id: 'shopping_meta_' + ownerCharId + '_' + Date.now(),
      ownerCharId: ownerCharId,
      type: 'meta',
      privatePassword: password,
      currency: defaultCur
    });

    // 商品
    var products = Array.isArray(obj.products) ? obj.products : [];
    products.forEach(function(p, i){
      if (!p || !p.name) return;
      var price = parseFloat(p.price);
      if (!isFinite(price) || price < 0) return;
      var rating = parseFloat(p.rating);
      if (!isFinite(rating)) rating = 4.0;
      if (rating < 0) rating = 0;
      if (rating > 5) rating = 5;

      out.push({
        id: 'product_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        type: 'product',
        name: String(p.name).trim(),
        price: Math.round(price * 100) / 100,
        currency: (p.currency != null) ? String(p.currency).trim().toUpperCase() : defaultCur,
        category: String(p.category || 'other').toLowerCase(),
        rating: Math.round(rating * 10) / 10,
        reviewCount: parseInt(p.reviewCount, 10) || 0,
        store: (p.store != null) ? String(p.store).trim() : '',
        imageDesc: (p.imageDesc != null) ? String(p.imageDesc).trim() : '',
        thoughts: (p.thoughts != null) ? String(p.thoughts).trim() : '',
        isAdult: !!p.isAdult
      });
    });

    // 购物车
    var cartItems = [];
    if (Array.isArray(obj.cart)) {
      obj.cart.forEach(function(it){
        if (!it || !it.name) return;
        var price = parseFloat(it.price);
        if (!isFinite(price) || price < 0) return;
        var qty = parseInt(it.qty, 10);
        if (!isFinite(qty) || qty < 1) qty = 1;
        cartItems.push({
          name: String(it.name).trim(),
          price: Math.round(price * 100) / 100,
          qty: qty
        });
      });
    }
    out.push({
      id: 'cart_meta_' + ownerCharId + '_' + Date.now(),
      ownerCharId: ownerCharId,
      type: 'cart',
      currency: defaultCur,
      items: cartItems
    });

    // 订单
    var orders = Array.isArray(obj.orders) ? obj.orders : [];
    orders.forEach(function(o, i){
      if (!o || !o.merchant) return;
      var daysAgo = parseFloat(o.daysAgo);
      if (!isFinite(daysAgo) || daysAgo < 0) daysAgo = Math.random() * 30 + 1;
      if (daysAgo > 90) daysAgo = 90;

      var items = [];
      var total = 0;
      if (Array.isArray(o.items)) {
        o.items.forEach(function(it){
          if (!it || !it.name) return;
          var price = parseFloat(it.price);
          if (!isFinite(price) || price < 0) return;
          var qty = parseInt(it.qty, 10);
          if (!isFinite(qty) || qty < 1) qty = 1;
          items.push({ name: String(it.name).trim(), price: Math.round(price * 100) / 100, qty: qty });
          total += price * qty;
        });
      }
      var status = String(o.status || 'delivered').toLowerCase();
      if (['delivered','shipped','processing','cancelled'].indexOf(status) < 0) status = 'delivered';

      out.push({
        id: 'order_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        type: 'order',
        merchant: String(o.merchant).trim(),
        items: items,
        total: Math.round(total * 100) / 100,
        currency: (o.currency != null) ? String(o.currency).trim().toUpperCase() : defaultCur,
        status: status,
        timestamp: nowTs - daysAgo * DAY,
        thoughts: (o.thoughts != null) ? String(o.thoughts).trim() : ''
      });
    });

    var productCount = out.filter(function(x){ return x.type === 'product'; }).length;
    var adultCount = out.filter(function(x){ return x.type === 'product' && x.isAdult; }).length;
    var orderCount = out.filter(function(x){ return x.type === 'order'; }).length;
    console.log('[rollShoppingData] 生成完成: 商品', productCount, '(含成人', adultCount, ') | 订单', orderCount, '| 币种', defaultCur);
    return out;
  }

  // ══════════════════════════════════════════════
  //  13. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollShoppingData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollShoppingData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating shop...</p></div>';
    }

    var before = (state.shoppingData || []).length;
    state.shoppingData = (state.shoppingData || []).filter(function(x){ return x.ownerCharId !== ownerCharId; });
    console.log('[rollShoppingData] 清空旧数据:', before, '→', state.shoppingData.length);

    _pshopPrivateUnlocked = false;
    _pshopView = 'all';

    var data = await _pshopGenerateAll(ownerCharId);
    if (!data || data.length === 0) { showToast('Generation failed'); openPhoneApp('shopping'); return; }

    data.forEach(function(x){ state.shoppingData.push(x); });
    saveState();
    openPhoneApp('shopping');
    showToast('Generated ' + data.length + ' items');
  };

  // ══════════════════════════════════════════════
  //  14. 注册 + 测试
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.shopping = _pshopPageRenderer;
  } else {
    console.warn('[phone-shopping.js] PHONE_APP_RENDERERS 未定义');
  }

  window.__pshopTest = {
    buildListHTML: _pshopBuildListHTML,
    buildPrompt: _pshopBuildPrompt,
    generateAll: _pshopGenerateAll,
    renderer: _pshopPageRenderer
  };

  console.log('[phone-shopping.js] 已加载（模块 3）');
})();