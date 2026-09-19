// ==========================================================
//  PHONE WALLET APP
//  模块 3：所有账户统一大卡片 + 骰子 + AI 一次性生成
// ==========================================================

;(function() {
  'use strict';

  // ══════════════════════════════════════════════
  //  1. 时间格式化
  // ══════════════════════════════════════════════
  function _pwalFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    var DAY = 86400000;
    var time = ('' + d.getHours()).padStart(2,'0') + ':' + ('' + d.getMinutes()).padStart(2,'0');
    if (diff < DAY) return 'Today ' + time;
    if (diff < 2 * DAY) return 'Yesterday ' + time;
    if (diff < 7 * DAY) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()] + ' ' + time;
    return (d.getMonth()+1) + '/' + d.getDate() + ' ' + time;
  }

  // ══════════════════════════════════════════════
  //  2. HTML 转义
  // ══════════════════════════════════════════════
  function _pwalEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ══════════════════════════════════════════════
  //  3. 金额格式化
  // ══════════════════════════════════════════════
  function _pwalCurrencySymbol(cur) {
    var map = { JPY:'¥', CNY:'¥', USD:'$', EUR:'€', GBP:'£', KRW:'₩', HKD:'HK$', TWD:'NT$', AUD:'A$', CAD:'C$' };
    return map[cur] || (cur + ' ');
  }
  function _pwalFormatAmount(amount, currency, withSign, type) {
    var sym = _pwalCurrencySymbol(currency);
    var abs = Math.abs(amount);
    var noDecimal = ['JPY','KRW','CNY','TWD'].indexOf(currency) >= 0;
    var numStr = noDecimal
      ? Math.round(abs).toLocaleString('en-US')
      : abs.toFixed(2);
    var sign = '';
    if (withSign) {
      if (type === 'income') sign = '+';
      else if (type === 'expense') sign = '-';
    } else if (amount < 0) {
      sign = '-';
    }
    return sign + sym + numStr;
  }

  // ══════════════════════════════════════════════
  //  4. SVG 图标
  // ══════════════════════════════════════════════
  var _pwalIcons = {
    card:     '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 9h16" stroke="currentColor" stroke-width="1.4"/><rect x="5" y="12" width="4" height="1.4" rx=".4" fill="currentColor"/></svg>',
    ewallet:  '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><rect x="4" y="3" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M7.5 3h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="10" cy="15" r=".8" fill="currentColor"/></svg>',
    balance:  '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M10 3v14M5 7h8a2 2 0 110 4H7a2 2 0 100 4h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cash:     '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><rect x="2" y="6" width="16" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="10.5" r="2" stroke="currentColor" stroke-width="1.4"/></svg>',
    food:     '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M6 3v7a2 2 0 002 2v5M6 3v5M9 3v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 3c-1.5 1-2 3-2 5s.5 3 2 3v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    transport:'<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><rect x="4" y="4" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 10h12" stroke="currentColor" stroke-width="1.4"/><circle cx="7" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/></svg>',
    shopping: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M5 6h10l-1 10H6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 6a3 3 0 016 0" stroke="currentColor" stroke-width="1.4"/></svg>',
    entertainment: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M7 15V6l7-2v9" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5" cy="15" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="13" r="2" stroke="currentColor" stroke-width="1.4"/></svg>',
    bills:    '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    health:   '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M10 16S4 12.5 4 8.5A3 3 0 0110 6a3 3 0 016 2.5c0 4-6 7.5-6 7.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    education:'<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M3 8l7-4 7 4-7 4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 10v4c0 1 2 2 4 2s4-1 4-2v-4" stroke="currentColor" stroke-width="1.4"/></svg>',
    income:   '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M10 4v12M5 11l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    transfer: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M4 7h11l-2-2M16 13H5l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    other:    '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.4"/></svg>'
  };
  function _pwalCategoryIcon(cat) {
    return _pwalIcons[cat] || _pwalIcons.other;
  }
  function _pwalAccountTypeIcon(type) {
    return _pwalIcons[type] || _pwalIcons.card;
  }
  function _pwalAccountTypeLabel(type) {
    var map = { card: '银行卡', ewallet: '电子支付', balance: '账户余额', cash: '现金' };
    return map[type] || '';
  }

  // ══════════════════════════════════════════════
  //  5. 账户大卡片（含余额）
  // ══════════════════════════════════════════════
  function _pwalBuildAccountCardHTML(acc, currency) {
    var cur = acc.currency || currency || 'USD';
    var balanceStr = (typeof acc.balance === 'number')
      ? _pwalFormatAmount(acc.balance, cur, false)
      : '—';

    var h = '<div class="pwallet-card" data-type="' + _pwalEscape(acc.type) + '">';

    // 顶部：账户名 + 类型图标
    h += '<div class="pwallet-card-top">';
    h += '<span class="pwallet-card-name">' + _pwalEscape(acc.name) + '</span>';
    h += '<span class="pwallet-card-type-icon">' + _pwalAccountTypeIcon(acc.type) + '</span>';
    h += '</div>';

    // 中部：余额大字
    h += '<div class="pwallet-card-balance">' + balanceStr + '</div>';

    // 底部：卡号 or 类型标签
    h += '<div class="pwallet-card-footer">';
    if (acc.last4) {
      h += '<span class="pwallet-card-num">**** ' + _pwalEscape(acc.last4) + '</span>';
    }
    h += '<span class="pwallet-card-type-label">' + _pwalEscape(_pwalAccountTypeLabel(acc.type)) + '</span>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  6. 列表 HTML
  // ══════════════════════════════════════════════
  function _pwalBuildListHTML(ownerCharId) {
    var all = (state.walletData || []).filter(function(x){
      return x && x.ownerCharId === ownerCharId;
    });

    var meta = all.find(function(x){ return x.type === 'meta'; });
    var txs = all.filter(function(x){ return x.type === 'expense' || x.type === 'income'; })
                 .sort(function(a, b){ return b.timestamp - a.timestamp; });

    if (!meta && txs.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<rect x="8" y="12" width="32" height="22" rx="3"/>' +
          '<path d="M8 20h32"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No transactions yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var h = '';

    // ── 余额区 ──
    if (meta) {
      var balStr = _pwalFormatAmount(meta.balance || 0, meta.currency || 'USD', false);
      h += '<div class="pwallet-balance-section">';
      h += '<div class="pwallet-balance-label">Total Balance</div>';
      h += '<div class="pwallet-balance-value">' + balStr + '</div>';
      if (typeof meta.monthlyChange === 'number' && meta.monthlyChange !== 0) {
        var chgStr = _pwalFormatAmount(meta.monthlyChange, meta.currency, true,
          meta.monthlyChange >= 0 ? 'income' : 'expense');
        var chgCls = meta.monthlyChange >= 0 ? 'pwallet-balance-up' : 'pwallet-balance-down';
        h += '<div class="pwallet-balance-change ' + chgCls + '">' +
             chgStr + ' this month</div>';
      }
      h += '</div>';
    }

    // ── 账户区（所有账户都用大卡片）──
    if (meta && meta.accounts && meta.accounts.length > 0) {
      h += '<div class="pwallet-section-title">Payment Accounts</div>';
      h += '<div class="pwallet-accounts">';
      meta.accounts.forEach(function(acc){
        h += _pwalBuildAccountCardHTML(acc, meta.currency);
      });
      h += '</div>';
    }

    // ── 交易列表 ──
    if (txs.length > 0) {
      h += '<div class="pwallet-section-title">Recent Transactions</div>';
      h += '<div class="pwallet-tx-list">';

      txs.forEach(function(tx){
        var isIncome = tx.type === 'income';
        var amountStr = _pwalFormatAmount(tx.amount, tx.currency, true, tx.type);
        var amountCls = isIncome ? 'pwallet-tx-amount-income' : 'pwallet-tx-amount-expense';
        var catIcon = _pwalCategoryIcon(tx.category);
        var payAcc = (tx.paymentAccount || '').trim();

        h += '<div class="pwallet-tx-item" data-tx-id="' + _pwalEscape(tx.id) + '" ' +
             'onclick="openWalletTxDetail(\'' + _pwalEscape(tx.id) + '\')" ' +
             'style="cursor:pointer;-webkit-tap-highlight-color:transparent">';
        h += '<div class="pwallet-tx-icon">' + catIcon + '</div>';
        h += '<div class="pwallet-tx-info">';
        h += '<div class="pwallet-tx-top">';
        h += '<span class="pwallet-tx-merchant">' + _pwalEscape(tx.merchant) + '</span>';
        h += '<span class="pwallet-tx-amount ' + amountCls + '">' + amountStr + '</span>';
        h += '</div>';
        h += '<div class="pwallet-tx-sub">' + _pwalFormatTime(tx.timestamp) + '</div>';
        if (payAcc) {
          h += '<div class="pwallet-tx-account">' + _pwalEscape(payAcc) + '</div>';
        }
        h += '</div>';
        h += '</div>';
      });

      h += '</div>';
    }

    return h;
  }

  // ══════════════════════════════════════════════
  //  7. 骰子按钮
  // ══════════════════════════════════════════════
  function _pwalInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollWalletData()" title="Generate Wallet">' +
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
  //  8. 主渲染
  // ══════════════════════════════════════════════
  function _pwalPageRenderer(charName) {
    setTimeout(_pwalInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pwalBuildListHTML(ownerCharId);
  }

    // ══════════════════════════════════════════════
  //  8.5 详情页（模块 4）
  // ══════════════════════════════════════════════

  function _pwalFindTxById(txId) {
    var arr = state.walletData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === txId) return arr[i];
    }
    return null;
  }

  function _pwalCategoryLabel(cat) {
    var map = {
      food:'餐饮', transport:'交通', shopping:'购物',
      entertainment:'娱乐', bills:'账单', health:'医疗',
      education:'教育', income:'收入', transfer:'转账', other:'其他'
    };
    return map[cat] || '其他';
  }

  function _pwalFormatFullTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    var time = ('' + d.getHours()).padStart(2,'0') + ':' + ('' + d.getMinutes()).padStart(2,'0');
    if (diff < 86400000) return 'Today ' + time;
    if (diff < 172800000) return 'Yesterday ' + time;
    return months[d.getMonth()] + ' ' + d.getDate() + ' ' + time;
  }

  function _pwalBuildDetailHTML(tx) {
    var isIncome = tx.type === 'income';
    var amountStr = _pwalFormatAmount(tx.amount, tx.currency, true, tx.type);
    var amountCls = isIncome ? 'pwallet-detail-amount-income' : 'pwallet-detail-amount-expense';
    var catIcon = _pwalCategoryIcon(tx.category);

    var h = '<div class="pwallet-detail-page">';

    // ── 顶栏 ──
    h += '<div class="pwallet-detail-header">' +
      '<button class="pwallet-detail-back" onclick="backToWalletList()">' +
        '<svg viewBox="0 0 20 20" width="22" height="22" fill="none">' +
          '<path d="M12 4l-6 6 6 6" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</button>' +
      '<div class="pwallet-detail-title">Transaction</div>' +
      '<div class="pwallet-detail-header-right"></div>' +
    '</div>';

    // ── 可滚动 ──
    h += '<div class="pwallet-detail-scroll">';

    // 顶部 Hero 区：图标 + 大号金额 + 商户
    h += '<div class="pwallet-detail-hero">';
    h += '<div class="pwallet-detail-icon">' + catIcon + '</div>';
    h += '<div class="pwallet-detail-amount ' + amountCls + '">' + amountStr + '</div>';
    h += '<div class="pwallet-detail-merchant">' + _pwalEscape(tx.merchant) + '</div>';
    h += '<div class="pwallet-detail-time">' + _pwalFormatFullTime(tx.timestamp) + '</div>';
    h += '</div>';

    // 详情字段
    h += '<div class="pwallet-detail-fields">';

    h += '<div class="pwallet-field-row">';
    h += '<span class="pwallet-field-label">Category</span>';
    h += '<span class="pwallet-field-value">' + _pwalEscape(_pwalCategoryLabel(tx.category)) + '</span>';
    h += '</div>';

    if (tx.paymentAccount) {
      h += '<div class="pwallet-field-row">';
      h += '<span class="pwallet-field-label">Payment</span>';
      h += '<span class="pwallet-field-value">' + _pwalEscape(tx.paymentAccount) + '</span>';
      h += '</div>';
    }

    h += '<div class="pwallet-field-row">';
    h += '<span class="pwallet-field-label">Type</span>';
    h += '<span class="pwallet-field-value">' + (isIncome ? '收入' : '支出') + '</span>';
    h += '</div>';

    h += '<div class="pwallet-field-row">';
    h += '<span class="pwallet-field-label">Status</span>';
    h += '<span class="pwallet-field-value pwallet-field-status">已完成</span>';
    h += '</div>';

    if (tx.note) {
      h += '<div class="pwallet-field-row">';
      h += '<span class="pwallet-field-label">Note</span>';
      h += '<span class="pwallet-field-value">' + _pwalEscape(tx.note) + '</span>';
      h += '</div>';
    }

        h += '</div>'; // /fields

    // ── 交易明细区 ──
    if (tx.items && tx.items.length > 0) {
      h += '<div class="pwallet-items-section">';
      h += '<div class="pwallet-items-label">交易明细</div>';
      h += '<div class="pwallet-items-list">';
      tx.items.forEach(function(it) {
        var linePrice = it.price * (it.qty || 1);
        var priceStr = _pwalFormatAmount(linePrice, tx.currency, false);
        var qtyStr = (it.qty && it.qty > 1) ? (' × ' + it.qty) : '';
        h += '<div class="pwallet-item-row">';
        h += '<span class="pwallet-item-name">' + _pwalEscape(it.name) + qtyStr + '</span>';
        h += '<span class="pwallet-item-price">' + priceStr + '</span>';
        h += '</div>';
      });
      h += '</div>';
      // 小计
      var sum = tx.items.reduce(function(s, it){ return s + (it.price * (it.qty || 1)); }, 0);
      if (Math.abs(sum - tx.amount) > 0.5) {
        // 有差额时显示小计（可能含税/服务费）
        h += '<div class="pwallet-items-summary">';
        h += '<span>小计</span>';
        h += '<span>' + _pwalFormatAmount(sum, tx.currency, false) + '</span>';
        h += '</div>';
      }
      h += '</div>';
    }

    // ── 想法区 ──
    if (tx.thoughts && String(tx.thoughts).trim()) {
      h += '<div class="pwallet-detail-thoughts">';
      h += '<div class="pwallet-thoughts-label">内心想法</div>';
      h += '<div class="pwallet-thoughts-text">' + _pwalEscape(tx.thoughts) + '</div>';
      h += '</div>';
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /detail-page

    return h;
  }

  window.openWalletTxDetail = function(txId) {
    var tx = _pwalFindTxById(txId);
    if (!tx) { showToast('Transaction not found'); return; }

    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;

    pageEl.innerHTML = _pwalBuildDetailHTML(tx);
    pageEl.scrollTop = 0;

    var scrollEl = pageEl.querySelector('.pwallet-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;

    console.log('[openWalletTxDetail]', tx.merchant, '|', tx.amount, tx.currency);
  };

  window.backToWalletList = function() {
    if (typeof openPhoneApp === 'function') openPhoneApp('wallet');
  };


  // ══════════════════════════════════════════════
  //  9. Prompt 构建
  // ══════════════════════════════════════════════
  function _pwalBuildPrompt(ownerInfo, historyBlock, worldbookBlk) {
    var ownerName = ownerInfo.name;
    var ownerBlock = ownerInfo.block;

    var prompt =
      'You are writing a realistic phone WALLET for a fictional phone owner.\n' +
      'The phone owner is "' + ownerName + '".\n\n' +

      '=== PHONE OWNER ===\n' + ownerBlock + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      historyBlock +

      '=== STEP 1: WEALTH PROFILE (analyze silently) ===\n' +
      'Determine from the persona:\n' +
      '  - WEALTH: wealthy / upper-middle / middle / modest / poor\n' +
      '  - SPENDING: lavish / balanced / frugal / struggling\n' +
      '  - CULTURE / CURRENCY: match the owner\'s region:\n' +
      '      Japan → JPY / Korea → KRW / China → CNY / USA → USD / UK → GBP /\n' +
      '      Eurozone → EUR / Hong Kong → HKD / Taiwan → TWD / etc.\n' +
      '  - LIFESTYLE: student / business / artist / parent / celebrity / noble / etc.\n\n' +

      '=== STEP 2: ACCOUNTS (2-4 accounts) ===\n' +
      'Generate 2-4 payment accounts that fit the owner. Mix these types:\n' +
      '  - "card"     : a real bank card (name + last4 digits)\n' +
      '  - "ewallet"  : mobile payment (LINE Pay / PayPay / Apple Pay / 微信支付 / Alipay / PayPal / 카카오페이 etc — pick those that fit the region)\n' +
      '  - "balance"  : a stored balance / savings\n' +
      '  - "cash"     : physical cash (no last4)\n\n' +
      'Each account:\n' +
      '  - "type"     : card / ewallet / balance / cash\n' +
      '  - "name"     : display name (e.g. "Visa Debit", "PayPay", "现金", "微信支付")\n' +
      '  - "last4"    : 4 digits, ONLY for card type\n' +
      '  - "balance"  : number — the CURRENT balance in this account\n' +
      '  - "currency" : ISO code (default same as main currency)\n\n' +

      'Rules for accounts:\n' +
      '  - A wealthy owner → premium cards (Amex Black / Visa Infinite / etc) + 1-2 e-wallets\n' +
      '  - Middle class → 1-2 normal cards + 1 e-wallet + small cash\n' +
      '  - Poor → mostly cash + maybe 1 e-wallet, small balance\n' +
      '  - Cash is common in Asian countries, less in Western urban contexts\n\n' +

      '=== STEP 3: MAIN BALANCE ===\n' +
      '  - "balance"      : total wealth in primary currency\n' +
      '                     wealthy: 1,000,000+ / middle: 50,000~500,000 / poor: 500~20,000 (in JPY scale, adjust for currency)\n' +
      '  - "monthlyChange": net change this month (positive=income>expense, negative=reverse)\n' +
      '  - "currency"     : ISO code\n\n' +

      '=== STEP 4: TRANSACTIONS (10-20) ===\n' +
      'Aim for 10-20 transactions, 90% expense + 10% income.\n\n' +
      'Each transaction:\n' +
      '  - "type"               : "expense" | "income"\n' +
      '  - "merchant"           : shop / service name (local language)\n' +
      '  - "amount"             : positive number (magnitude only)\n' +
      '  - "currency"           : ISO code\n' +
      '  - "category"           : food / transport / shopping / entertainment / bills / health / education / income / transfer / other\n' +
      '  - "paymentAccount"     : display name of the account used (MUST match one of the accounts above)\n' +
      '  - "paymentAccountType" : card / ewallet / balance / cash\n' +
            '  - "hoursAgo"           : spread across 0.1 ~ 1440 — MUST cover all 4 buckets:\n' +
      '                            * 2+ transactions: 0.1~24 (today)\n' +
      '                            * 2+ transactions: 24~48 (yesterday)\n' +
      '                            * 3+ transactions: 48~168 (days ago)\n' +
      '                            * 3+ transactions: 168~1440 (weeks ago)\n' +
      '  - "items"              : OPTIONAL array of purchase line items.\n' +
      '                            Include ONLY for transactions where a breakdown makes sense\n' +
      '                            (restaurants / shops / online orders / grocery / pharmacy).\n' +
      '                            SKIP for: bills / income / transfer / transport fares / fixed subscriptions.\n' +
      '                            Each item: { "name": "line name (native language)", "price": per-unit price, "qty": 1 (optional) }\n' +
      '                            The SUM of (price × qty) should ≈ total amount.\n' +
      '  - "thoughts"           : 1 sentence — owner\'s reaction (in owner\'s native language)\n\n' +

      '=== STEP 5: AMOUNT SCALE (based on wealth) ===\n' +
      '  - wealthy    : 5,000~500,000 per expense (JPY scale)\n' +
      '  - middle     : 500~50,000\n' +
      '  - poor       : 100~5,000\n' +
      '  - income usually 10x~100x a normal expense\n\n' +

      '=== STEP 6: LANGUAGE ===\n' +
      'ALL text (merchant names, thoughts) MUST be in the owner\'s NATIVE language.\n' +
      'Non-Chinese text → native language FIRST, Chinese translation in parentheses on the SAME line.\n' +
      'Format: "コンビニ (便利店)" / "Convenience store (便利店)"\n' +
      'Pure Chinese → no translation.\n\n' +

      '=== STEP 7: CONTENT BOUNDARY ===\n' +
      'Transactions are personal finance records. They reveal spending habits but\n' +
      'NOT private emotional content. Thoughts should be casual reactions\n' +
      '(e.g. "worth the price", "too expensive", "again?") — NOT romantic / intimate.\n\n' +

      '=== OUTPUT — valid JSON, single object ===\n' +
      '{\n' +
      '  "currency": "JPY",\n' +
      '  "balance": 8524300,\n' +
      '  "monthlyChange": -124500,\n' +
      '  "accounts": [\n' +
      '    { "type": "card", "name": "Visa Debit", "last4": "4821", "balance": 320000 },\n' +
      '    { "type": "ewallet", "name": "PayPay", "last4": "", "balance": 45000 },\n' +
      '    { "type": "cash", "name": "现金", "last4": "", "balance": 28000 }\n' +
      '  ],\n' +
            '  "transactions": [\n' +
      '    {\n' +
      '      "type": "expense", "merchant": "一兰拉面", "amount": 1200, "currency": "JPY",\n' +
      '      "category": "food", "paymentAccount": "PayPay", "paymentAccountType": "ewallet",\n' +
      '      "hoursAgo": 2,\n' +
      '      "items": [\n' +
      '        { "name": "豚骨ラーメン (豚骨拉面)", "price": 890 },\n' +
      '        { "name": "半熟卵 (半熟蛋)", "price": 150 },\n' +
      '        { "name": "追加チャーシュー (追加叉烧)", "price": 160 }\n' +
      '      ],\n' +
      '      "thoughts": "まあまあ。 (还行。)"\n' +
      '    }\n' +
      '  ]\n' +
      '}\n';

    return prompt;
  }

  // ══════════════════════════════════════════════
  //  10. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _pwalGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollWalletData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', block: '' };

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 15) : [];
    var historyBlock = '';
    if (recent.length > 0) {
      historyBlock = '=== RECENT iMESSAGE (owner ↔ user) ===\n';
      recent.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
      historyBlock += '\n';
    }

    var prompt = _pwalBuildPrompt(ownerInfo, historyBlock, worldbookBlk);
    console.log('[rollWalletData] prompt 长度:', prompt.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollWalletData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollWalletData] raw reply 长度:', rawReply.length);

    // 解析 JSON object
    var obj = null;
    try { var jm = rawReply.match(/\{[\s\S]*\}/); if (jm) obj = JSON.parse(jm[0]); }
    catch(e) { console.warn('[rollWalletData] 完整解析失败:', e.message); }

    // 截断补救
    if (!obj) {
      console.warn('[rollWalletData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('{');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx);
        // 尝试逐渐截断到最后一个完整字段
        var lastBrace = body.lastIndexOf('}');
        if (lastBrace > 0) {
          try {
            obj = JSON.parse(body.slice(0, lastBrace + 1));
            console.log('[rollWalletData] 截断补救成功（可能字段不完整）');
          } catch(e) { console.error('[rollWalletData] 截断补救失败:', e); }
        }
      }
    }

    if (!obj || typeof obj !== 'object') { console.warn('[rollWalletData] 无法解析'); return null; }

    var now = Date.now();
    var HOUR = 3600000;
    var out = [];

    // ── meta 记录 ──
    var metaCurrency = obj.currency || 'USD';
    var metaBalance = parseFloat(obj.balance);
    if (!isFinite(metaBalance)) metaBalance = 0;

    var metaMonthly = parseFloat(obj.monthlyChange);
    if (!isFinite(metaMonthly)) metaMonthly = 0;

    // 账户归一化
    var accounts = [];
    if (Array.isArray(obj.accounts)) {
      obj.accounts.forEach(function(a){
        if (!a || !a.type || !a.name) return;
        var type = String(a.type).toLowerCase();
        if (['card','ewallet','balance','cash'].indexOf(type) < 0) type = 'card';
        var acc = {
          type: type,
          name: String(a.name).trim(),
          last4: (a.last4 != null) ? String(a.last4).trim() : '',
          balance: parseFloat(a.balance),
          currency: (a.currency != null) ? String(a.currency).trim().toUpperCase() : metaCurrency
        };
        if (!isFinite(acc.balance)) acc.balance = 0;
        // 非 card 类型不带 last4
        if (type !== 'card') acc.last4 = '';
        accounts.push(acc);
      });
    }
    if (accounts.length === 0) {
      // 兜底
      accounts = [
        { type: 'card', name: 'Visa Debit', last4: '0000', balance: Math.round(metaBalance * 0.5), currency: metaCurrency }
      ];
    }

    out.push({
      id: 'wallet_meta_' + ownerCharId + '_' + Date.now(),
      ownerCharId: ownerCharId,
      type: 'meta',
      balance: metaBalance,
      monthlyChange: metaMonthly,
      currency: metaCurrency,
      accounts: accounts
    });

    // 交易归一化
    var txs = Array.isArray(obj.transactions) ? obj.transactions : [];
    txs.forEach(function(t, i){
      if (!t || !t.merchant) return;

      var type = (t.type === 'income') ? 'income' : 'expense';
      var amount = parseFloat(t.amount);
      if (!isFinite(amount) || amount < 0) return;
      amount = Math.round(amount);

      var hoursAgo = parseFloat(t.hoursAgo);
      if (!isFinite(hoursAgo) || hoursAgo < 0) hoursAgo = Math.random() * 72 + 1;
      if (hoursAgo > 1440) hoursAgo = 1440;

      var cat = String(t.category || 'other').toLowerCase();
      var validCats = ['food','transport','shopping','entertainment','bills','health','education','income','transfer','other'];
      if (validCats.indexOf(cat) < 0) cat = 'other';

            // 归一化 items
      var items = [];
      if (Array.isArray(t.items)) {
        t.items.forEach(function(it){
          if (!it || !it.name) return;
          var price = parseFloat(it.price);
          if (!isFinite(price) || price < 0) return;
          var qty = parseInt(it.qty, 10);
          if (!isFinite(qty) || qty < 1) qty = 1;
          items.push({
            name: String(it.name).trim(),
            price: Math.round(price * 100) / 100,
            qty: qty
          });
        });
      }

      out.push({
        id: 'tx_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        type: type,
        merchant: String(t.merchant).trim(),
        amount: amount,
        currency: (t.currency != null) ? String(t.currency).trim().toUpperCase() : metaCurrency,
        category: cat,
        paymentAccount: (t.paymentAccount != null) ? String(t.paymentAccount).trim() : '',
        paymentAccountType: (t.paymentAccountType != null) ? String(t.paymentAccountType).trim() : 'card',
        timestamp: now - hoursAgo * HOUR,
        items: items,
        note: (t.note != null) ? String(t.note).trim() : '',
        thoughts: (t.thoughts != null) ? String(t.thoughts).trim() : ''
      });
    });

    console.log('[rollWalletData] 生成完成：账户 ' + accounts.length + ' 个 | 交易 ' + (out.length - 1) + ' 条 | 币种 ' + metaCurrency);
    return out;
  }

  // ══════════════════════════════════════════════
  //  11. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollWalletData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollWalletData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating wallet...</p></div>';
    }

    var before = (state.walletData || []).length;
    state.walletData = (state.walletData || []).filter(function(x){ return x.ownerCharId !== ownerCharId; });
    console.log('[rollWalletData] 清空旧数据:', before, '→', state.walletData.length);

    var data = await _pwalGenerateAll(ownerCharId);
    if (!data || data.length === 0) { showToast('Generation failed'); openPhoneApp('wallet'); return; }

    data.forEach(function(x){ state.walletData.push(x); });
    saveState();
    openPhoneApp('wallet');
    showToast('Generated ' + (data.length - 1) + ' transactions');
  };

  // ══════════════════════════════════════════════
  //  12. 注册 renderer
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.wallet = _pwalPageRenderer;
  } else {
    console.warn('[phone-wallet.js] PHONE_APP_RENDERERS 未定义');
  }

  // ══════════════════════════════════════════════
  //  13. 测试挂载
  // ══════════════════════════════════════════════
  window.__pwalTest = {
    buildListHTML: _pwalBuildListHTML,
    buildPrompt: _pwalBuildPrompt,
    generateAll: _pwalGenerateAll,
    formatAmount: _pwalFormatAmount,
    renderer: _pwalPageRenderer
  };

  console.log('[phone-wallet.js] 已加载（模块 3）');
})();