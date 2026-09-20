// ========== phone-travel.js ==========
// Travel App — 列表页（Top Tab: Upcoming / Past）+ AI 生成 + 详情页
// 模块 2：假数据列表 + Tab
// 模块 3：AI 一次性生成
// 模块 3.5：修 prompt + 骰子按钮 UI
// 模块 4：全屏详情页
;(function () {
  'use strict';

  var _tab = 'upcoming';
  var _generating = false;

  // ---------- 工具 ----------
  function _esc(s) {
    if (typeof esc === 'function') return esc(String(s == null ? '' : s));
    return String(s == null ? '' : s);
  }
  function _ownerCharId() {
    if (typeof _pmsgOwnerCharId === 'function') {
      try { var id = _pmsgOwnerCharId(); if (id) return id; } catch (e) {}
    }
    if (typeof state !== 'undefined' && state.phoneCharId) return state.phoneCharId;
    return '__no_owner__';
  }
  function _toMs(v) {
    var n = Number(v);
    if (!n || isNaN(n)) return 0;
    if (n < 100000000000) n *= 1000;
    return n;
  }

  // ---------- 数据 ----------
  function _allTrips() {
    var ownerCharId = _ownerCharId();
    if (typeof state === 'undefined' || !Array.isArray(state.travelData)) return [];
    return state.travelData.filter(function (t) { return t && t.ownerCharId === ownerCharId; });
  }
  function _tripsByTab(tab) {
    return _allTrips().filter(function (t) {
      if (tab === 'past') return t.status === 'past' || t.status === 'cancelled';
      return t.status === 'upcoming' || t.status === 'ongoing';
    }).sort(function (a, b) {
      return tab === 'past' ? (b.startTime - a.startTime) : (a.startTime - b.startTime);
    });
  }
  function _findTripById(id) {
    var list = _allTrips();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  // ---------- 日期 ----------
  var _MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function _fmtDate(ts) {
    var d = new Date(ts);
    return _MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function _fmtDateShort(ts) {
    var d = new Date(ts);
    return _MON[d.getMonth()] + ' ' + d.getDate();
  }
  function _fmtTime(ts) {
    var d = new Date(ts);
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
  }

  // ---------- 条形码（seed = trip.id，稳定） ----------
  function _barcodeSvg(seed) {
    var s = 0;
    seed = String(seed || '');
    for (var k = 0; k < seed.length; k++) s += seed.charCodeAt(k);
    var h = '<svg viewBox="0 0 200 30" style="width:100%;height:30px">';
    for (var i = 0; i < 40; i++) {
      var v = (s + i * 7) % 3;
      var w = v === 0 ? 3 : v === 1 ? 1 : 2;
      var x = i * 5;
      var op = 0.1 + (((s + i * 13) % 10) / 100);
      h += '<rect x="' + x + '" y="2" width="' + w + '" height="26" fill="rgba(255,255,255,' + op.toFixed(2) + ')"/>';
    }
    h += '</svg>';
    return h;
  }

  // ---------- 列表卡片 ----------
  function _cardHtml(trip) {
    var isPast = (trip.status === 'past' || trip.status === 'cancelled');
    var statusLabel = isPast
      ? (trip.status === 'cancelled' ? 'Cancelled' : 'Completed')
      : (trip.status === 'ongoing' ? 'Ongoing' : 'Upcoming Trip');

    var h = '<div class="papp-travel-upcoming" onclick="_ptravelOpenTrip(\'' + _esc(trip.id) + '\')" style="cursor:pointer;margin-bottom:10px">';
    h += '<div class="papp-travel-upcoming-header" style="display:flex;justify-content:space-between;align-items:center">'
       +   '<span>' + _esc(trip.destination || trip.destinationCode || '—') + '</span>'
       +   '<span style="font-size:11px;color:rgba(255,255,255,.35)">' + statusLabel + '</span>'
       + '</div>';
    h += '<div class="papp-travel-route">'
       +   '<div class="papp-travel-city">'
       +     '<div class="papp-travel-code">' + _esc(trip.departureCode || '—') + '</div>'
       +     '<div class="papp-travel-city-name">' + _esc(trip.departureCity || '') + '</div>'
       +   '</div>'
       +   '<div class="papp-travel-line">'
       +     '<svg viewBox="0 0 60 20" style="width:60px;height:20px">'
       +       '<path d="M5 10h50" stroke="rgba(255,255,255,.15)" fill="none" stroke-width="1" stroke-dasharray="3 3"/>'
       +       '<path d="M45 6l8 4-8 4" stroke="rgba(255,255,255,.2)" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
       +     '</svg>'
       +   '</div>'
       +   '<div class="papp-travel-city">'
       +     '<div class="papp-travel-code">' + _esc(trip.destinationCode || '—') + '</div>'
       +     '<div class="papp-travel-city-name">' + _esc(trip.destination || '') + '</div>'
       +   '</div>'
       + '</div>';
    h += '<div class="papp-travel-details">'
       +   '<div class="papp-travel-detail">'
       +     '<div class="papp-travel-detail-label">Date</div>'
       +     '<div class="papp-travel-detail-val">' + _esc(_fmtDate(trip.startTime)) + '</div>'
       +   '</div>'
       +   '<div class="papp-travel-detail">'
       +     '<div class="papp-travel-detail-label">Flight</div>'
       +     '<div class="papp-travel-detail-val">' + _esc(trip.flightNumber || '—') + '</div>'
       +   '</div>'
       +   '<div class="papp-travel-detail">'
       +     '<div class="papp-travel-detail-label">' + (isPast ? 'Seat' : 'Depart') + '</div>'
       +     '<div class="papp-travel-detail-val">' + _esc(isPast ? (trip.seat || '—') : _fmtTime(trip.departTime || trip.startTime)) + '</div>'
       +   '</div>'
       + '</div>';
    h += '</div>';
    return h;
  }

  // ---------- Top Tab ----------
  function _tabsHtml() {
    return '<div class="papp-segments" style="margin-bottom:12px">'
         +   '<div class="papp-seg' + (_tab === 'upcoming' ? ' papp-seg-active' : '') + '" onclick="_ptravelSwitchTab(\'upcoming\')">Upcoming</div>'
         +   '<div class="papp-seg' + (_tab === 'past' ? ' papp-seg-active' : '') + '" onclick="_ptravelSwitchTab(\'past\')">Past</div>'
         + '</div>';
  }

  // ---------- 空 / 加载 ----------
  function _emptyHtml() {
    return '<div class="ptravel-empty-state">'
         +   '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2">'
         +     '<rect x="10" y="18" width="28" height="20" rx="3"/>'
         +     '<path d="M18 18V13a2 2 0 012-2h8a2 2 0 012 2v5M10 26h28"/>'
         +   '</svg>'
         +   '<div class="ptravel-empty-title">No trips yet</div>'
         +   '<div class="ptravel-empty-hint">Tap the dice icon to generate</div>'
         + '</div>';
  }

  function _loadingHtml() {
    return '<div class="ptravel-loading">'
         +   '<div class="ptravel-loading-dots"><span></span><span></span><span></span></div>'
         +   '<p class="ptravel-loading-text">Generating trips...</p>'
         + '</div>';
  }

  // ---------- 列表主渲染 ----------
  function _buildHtml() {
    if (_generating) return _tabsHtml() + _loadingHtml();
    var trips = _tripsByTab(_tab);
    var h = _tabsHtml();
    if (trips.length === 0) {
      if (_allTrips().length === 0) h += _emptyHtml();
      else h += '<div class="ptravel-empty-row" style="text-align:center;padding:60px 20px">'
             +   'No ' + (_tab === 'past' ? 'past' : 'upcoming') + ' trips'
             + '</div>';
    } else {
      trips.forEach(function (t) { h += _cardHtml(t); });
    }
    return h;
  }
  function _renderer(charName) {
    setTimeout(_ptravelInjectDiceBtn, 0);
    return _buildHtml();
  }
  function _refresh() {
    var body = document.querySelector('#phoneAppPage .papp-body');
    if (body) {
      body.innerHTML = _buildHtml();
      setTimeout(_ptravelInjectDiceBtn, 0);
    }
  }

  // ---------- 骰子按钮 ----------
  function _ptravelInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollTravelData()" title="Generate Travel">'
      +   '<svg viewBox="0 0 20 20" width="20" height="20" stroke="#0a84ff" fill="none" '
      +   'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
      +     '<rect x="2.5" y="2.5" width="15" height="15" rx="2.5"/>'
      +     '<circle cx="7" cy="7" r="1.3" fill="#0a84ff" stroke="none"/>'
      +     '<circle cx="10" cy="10" r="1.3" fill="#0a84ff" stroke="none"/>'
      +     '<circle cx="13" cy="13" r="1.3" fill="#0a84ff" stroke="none"/>'
      +   '</svg>'
      + '</button>';
  }

  // ---------- 详情页 ----------
  function _statusLabel(trip) {
    if (trip.status === 'ongoing') return 'Ongoing Trip';
    if (trip.status === 'past') return 'Past Trip';
    if (trip.status === 'cancelled') return 'Cancelled';
    return 'Upcoming Trip';
  }

  function _itineraryHtml(trip) {
    if (!Array.isArray(trip.itinerary) || trip.itinerary.length === 0) {
      return '<div class="ptravel-empty-row">No itinerary</div>';
    }
    // 按 dayOffset 分组
    var groups = {};
    trip.itinerary.forEach(function (it) {
      if (!it) return;
      var d = (it.dayOffset != null) ? Number(it.dayOffset) : 0;
      if (!groups[d]) groups[d] = [];
      groups[d].push(it);
    });
    var keys = Object.keys(groups).map(Number).sort(function (a, b) { return a - b; });

    var h = '';
    keys.forEach(function (d) {
      var dayTs = (trip.startTime || Date.now()) + d * 86400000;
      h += '<div class="ptravel-day-group">';
      h += '<div class="ptravel-day-header">Day ' + (d + 1) + ' · ' + _esc(_fmtDateShort(dayTs)) + '</div>';
      // 按 time 排序
      groups[d].sort(function (a, b) {
        return String(a.time || '').localeCompare(String(b.time || ''));
      }).forEach(function (it) {
        h += '<div class="ptravel-activity">';
        h += '<span class="ptravel-activity-time">' + _esc(it.time || '') + '</span>';
        h += '<div class="ptravel-activity-body">';
        h += '<div class="ptravel-activity-text">' + _esc(it.activity || '') + '</div>';
        if (it.location) h += '<div class="ptravel-activity-loc">' + _esc(it.location) + '</div>';
        h += '</div>';
        h += '</div>';
      });
      h += '</div>';
    });
    return h;
  }

  function _packingHtml(trip) {
    if (!Array.isArray(trip.packingList) || trip.packingList.length === 0) {
            return '<div class="ptravel-empty-row">No packing list</div>';
    }
    var svgCheck = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none">'
                 +   '<circle cx="10" cy="10" r="7" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>'
                 + '</svg>';
    var svgDone  = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none">'
                 +   '<circle cx="10" cy="10" r="7" stroke="rgba(48,209,88,.5)" fill="rgba(48,209,88,.1)" stroke-width="1.5"/>'
                 +   '<path d="M7 10l2 2 4-4" stroke="rgba(48,209,88,.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
                 + '</svg>';
    var h = '';
    trip.packingList.forEach(function (p) {
      if (!p) return;
      var done = !!p.done;
      h += '<div class="ptravel-packing-item' + (done ? ' done' : '') + '">'
         +   (done ? svgDone : svgCheck)
         +   '<span class="ptravel-packing-text">' + _esc(p.text || '') + '</span>'
         + '</div>';
    });
    return h;
  }

  function _companionHtml(trip) {
    if (!trip.companionIsUser) return '';
    var userName = 'User';
    if (typeof getCurrentUserMaskName === 'function') {
      try { userName = getCurrentUserMaskName() || 'User'; } catch (e) {}
    }
    var initial = String(userName).charAt(0).toUpperCase();
    return '<div class="ptravel-companion">'
         +   '<div class="ptravel-companion-avatar">' + _esc(initial) + '</div>'
         +   '<div class="ptravel-companion-name">' + _esc(userName) + '</div>'
         + '</div>';
  }

  function _detailHtml(trip) {
    var isPast = (trip.status === 'past' || trip.status === 'cancelled');

    var h = '<div class="ptravel-detail-page">';

    // 顶栏
    h += '<div class="ptravel-detail-header">'
       +   '<button class="ptravel-detail-back" onclick="backToTravelList()">'
       +     '<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><path d="M12 4l-6 6 6 6" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
       +     '<span>Trip</span>'
       +   '</button>'
       +   '<div class="ptravel-detail-title">' + _esc(trip.destination || '') + '</div>'
       +   '<div class="ptravel-detail-header-right"></div>'
       + '</div>';

    // 滚动区
    h += '<div class="ptravel-detail-scroll">';

    // 1) 大机票卡片（复用列表卡片 class，去掉自带 margin）
    h += '<div class="ptravel-hero-card">'
       +   '<div class="papp-travel-upcoming" style="margin:0">'
       +     '<div class="papp-travel-upcoming-header" style="display:flex;justify-content:space-between;align-items:center">'
       +       '<span>' + _esc(_statusLabel(trip)) + '</span>'
       +       (isPast ? '<span style="font-size:11px;color:rgba(255,255,255,.35)">' + _esc(_fmtDate(trip.startTime)) + '</span>' : '')
       +     '</div>'
       +     '<div class="papp-travel-route">'
       +       '<div class="papp-travel-city">'
       +         '<div class="papp-travel-code">' + _esc(trip.departureCode || '—') + '</div>'
       +         '<div class="papp-travel-city-name">' + _esc(trip.departureCity || '') + '</div>'
       +       '</div>'
       +       '<div class="papp-travel-line">'
       +         '<svg viewBox="0 0 60 20" style="width:60px;height:20px">'
       +           '<path d="M5 10h50" stroke="rgba(255,255,255,.15)" fill="none" stroke-width="1" stroke-dasharray="3 3"/>'
       +           '<path d="M45 6l8 4-8 4" stroke="rgba(255,255,255,.2)" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
       +         '</svg>'
       +       '</div>'
       +       '<div class="papp-travel-city">'
       +         '<div class="papp-travel-code">' + _esc(trip.destinationCode || '—') + '</div>'
       +         '<div class="papp-travel-city-name">' + _esc(trip.destination || '') + '</div>'
       +       '</div>'
       +     '</div>'
       +     '<div class="papp-travel-details">'
       +       '<div class="papp-travel-detail">'
       +         '<div class="papp-travel-detail-label">Date</div>'
       +         '<div class="papp-travel-detail-val">' + _esc(_fmtDate(trip.startTime)) + '</div>'
       +       '</div>'
       +       '<div class="papp-travel-detail">'
       +         '<div class="papp-travel-detail-label">Flight</div>'
       +         '<div class="papp-travel-detail-val">' + _esc(trip.flightNumber || '—') + '</div>'
       +       '</div>'
       +       '<div class="papp-travel-detail">'
       +         '<div class="papp-travel-detail-label">Depart</div>'
       +         '<div class="papp-travel-detail-val">' + _esc(_fmtTime(trip.departTime || trip.startTime)) + '</div>'
       +       '</div>'
       +     '</div>'
       +   '</div>'
       + '</div>';

    // 2) Boarding Pass
    if (trip.flightNumber || trip.seat || trip.gate || trip.boardingTime) {
      h += '<div class="papp-travel-pass" style="margin-top:16px">';
      h += '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Passenger</span><span class="papp-travel-pass-val">' + _esc(_ownerName()) + '</span></div>';
      if (trip.airline) h += '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Airline</span><span class="papp-travel-pass-val">' + _esc(trip.airline) + '</span></div>';
      if (trip.flightNumber) h += '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Flight</span><span class="papp-travel-pass-val">' + _esc(trip.flightNumber) + '</span></div>';
      if (trip.seat) h += '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Seat</span><span class="papp-travel-pass-val">' + _esc(trip.seat) + '</span></div>';
      if (trip.gate) h += '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Gate</span><span class="papp-travel-pass-val">' + _esc(trip.gate) + '</span></div>';
      if (trip.boardingTime) h += '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Boarding</span><span class="papp-travel-pass-val">' + _esc(_fmtTime(trip.boardingTime)) + '</span></div>';
      h += '<div class="papp-travel-pass-barcode">' + _barcodeSvg(trip.id) + '</div>';
      h += '</div>';
    }

    // 3) 酒店
    if (trip.hotelName) {
      h += '<div class="ptravel-hotel">';
      h += '<div class="ptravel-hotel-label">Hotel</div>';
      h += '<div class="ptravel-hotel-name">' + _esc(trip.hotelName) + '</div>';
      if (trip.hotelType) h += '<div class="ptravel-hotel-type">' + _esc(trip.hotelType) + '</div>';
      h += '</div>';
    }

    // 4) 行程
    h += '<div class="ptravel-section-title">Itinerary</div>';
    h += _itineraryHtml(trip);

    // 5) 打包清单
    h += '<div class="ptravel-section-title">Packing List</div>';
    h += _packingHtml(trip);

    // 6) 同行人（仅 companionIsUser）
    if (trip.companionIsUser) {
      h += '<div class="ptravel-section-title">Companion</div>';
      h += _companionHtml(trip);
    }

    // 7) 内心想法
    if (trip.thoughts) {
      h += '<div class="ptravel-section-title">Thoughts</div>';
      h += '<div class="ptravel-thoughts">' + _esc(trip.thoughts) + '</div>';
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /page
    return h;
  }

  function _ownerName() {
    if (typeof _pmsgResolveOwnerCharacter === 'function') {
      try {
        var c = _pmsgResolveOwnerCharacter();
        if (c && c.name) return c.name;
      } catch (e) {}
    }
    if (typeof state !== 'undefined' && state.phoneCharId) {
      var list = state.characters || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === state.phoneCharId) return list[i].name || 'Passenger';
    }
    return 'Passenger';
  }

  // ---------- 全局交互 ----------
  window._ptravelSwitchTab = function (tab) {
    if (tab !== 'upcoming' && tab !== 'past') return;
    _tab = tab;
    _refresh();
  };

  window._ptravelOpenTrip = function (tripId) {
    var trip = _findTripById(tripId);
    if (!trip) {
      if (typeof showToast === 'function') showToast('Trip not found');
      return;
    }
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    pageEl.innerHTML = _detailHtml(trip);
    pageEl.scrollTop = 0;
    var scrollEl = pageEl.querySelector('.ptravel-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
    console.log('[travel] open trip:', tripId, '|', trip.destination);
  };

  window.backToTravelList = function () {
    if (typeof openPhoneApp === 'function') openPhoneApp('travel');
  };

  // ---------- Prompt ----------
  function _buildPrompt() {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function')
      ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[travel] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', block: '' };
    if (!ownerInfo || typeof ownerInfo !== 'object') {
      ownerInfo = { name: ownerChar.name || 'Unknown', block: String(ownerInfo || '') };
    }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function')
      ? (_pmsgBuildWorldbookBlock() || '') : '';

    // user profile（新增：让 AI 知道 user 是谁 / 在哪）
    var userName = 'User';
    if (typeof getCurrentUserMaskName === 'function') {
      try { userName = getCurrentUserMaskName() || 'User'; } catch (e) {}
    }
    var userProfileBlock = '=== USER PROFILE ===\n';
    userProfileBlock += 'Name: ' + userName + '\n';
    if (typeof state !== 'undefined' && state.userProfile && state.userProfile.name) {
      userProfileBlock += 'Display name: ' + state.userProfile.name + '\n';
    }
    if (typeof getCurrentUserMask === 'function') {
      try {
        var _mask = getCurrentUserMask();
        if (_mask) {
          if (_mask.description) userProfileBlock += 'Description: ' + _mask.description + '\n';
          if (_mask.personality) userProfileBlock += 'Personality: ' + _mask.personality + '\n';
          if (_mask.notes) userProfileBlock += 'Notes: ' + _mask.notes + '\n';
          if (_mask.location) userProfileBlock += 'Location: ' + _mask.location + '\n';
        }
      } catch (e) {}
    }
    userProfileBlock += '\n';

    var ownerCharId = _ownerCharId();
    var historyBlock = '';
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function')
      ? (_pmsgPullOwnerChatHistory(ownerCharId, 60) || []) : [];
    if (Array.isArray(recent) && recent.length > 0) {
      historyBlock = '=== CHAT HISTORY (most recent ' + recent.length + ' messages) ===\n';
      recent.forEach(function (m) {
        if (!m) return;
        var sender = m.sender || m.role || '?';
        var content = m.content || m.text || '';
        historyBlock += '  [' + sender + '] ' + content + '\n';
      });
      historyBlock += '\n';
    } else {
      historyBlock = '=== CHAT HISTORY ===\n(no chat history available)\n\n';
    }

    var now = Date.now();
    var oneYearAgo = now - 365 * 86400000;
    var halfYearLater = now + 182 * 86400000;

    return 'You are writing the TRAVEL APP data of a fictional phone owner.\n'
      + 'The phone owner is "' + (ownerInfo.name || 'Unknown') + '".\n\n'

      + '=== PHONE OWNER ===\n' + (ownerInfo.block || '(no profile)') + '\n\n'

      + (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '')

      + userProfileBlock

      + historyBlock

      + '=== STEP 0 — LOCATION GROUNDING (DO THIS FIRST, MANDATORY) ===\n'
      + 'Before generating ANY trip, you MUST determine the following by carefully\n'
      + 'reading PHONE OWNER, WORLD SETTING, and CHAT HISTORY above:\n'
      + '\n'
      + '  (a) OWNER_HOME — the city/region where the phone owner CURRENTLY LIVES.\n'
      + '      - Read the owner profile carefully. If it says they live in 京都, then OWNER_HOME = Kyoto.\n'
      + '      - DO NOT default to Tokyo / New York unless the sources actually say so.\n'
      + '      - DO NOT pick a big city just because it is famous.\n'
      + '      - If multiple cities appear, choose the one described as "current residence".\n'
      + '\n'
      + '  (b) OWNER_HOME_AIRPORT — the IATA code of the airport nearest to OWNER_HOME.\n'
      + '      - Kyoto → KIX (Kansai International) or ITM (Itami)\n'
      + '      - Tokyo → NRT or HND\n'
      + '      - Osaka → KIX\n'
      + '      - etc. Use real-world airport codes.\n'
      + '\n'
      + '  (c) USER_LOCATION — where the USER ({{user}}) currently is.\n'
      + '      PRIORITY ORDER (use the HIGHEST priority source you can find):\n'
      + '        1. USER PROFILE — if it explicitly states the user\'s location, USE IT.\n'
      + '        2. WORLD SETTING — search carefully. If the worldbook says the user\n'
      + '           is in a specific place (e.g. "在澳门" / "住在澳门"), USE IT.\n'
      + '           Even if it is mentioned only once, treat it as authoritative.\n'
      + '        3. CHAT HISTORY — look for hints like "我在澳门" / "来澳门找我" /\n'
      + '           "I\'m in Macau" / "下个月我飞京都" / where the user says they live.\n'
      + '      - DO NOT guess a big famous city (Tokyo / NYC / London) just because it\n'
      + '        appears somewhere in the context. The user\'s location MUST be EVIDENCED\n'
      + '        by one of the three sources above.\n'
      + '      - If truly unknown, write "UNKNOWN" — do NOT invent a city.\n'
      + '\n'
      + '  (d) RECURRING_CITIES — cities that repeatedly appear in CHAT HISTORY or WORLD\n'
      + '      (family lives there, work is there, friends there, owner visits often).\n'
      + '\n'
      + '  (e) CLAIMED_TRIPS — any trip explicitly mentioned in CHAT HISTORY.\n'
      + '      Examples: "我下周去东京" / "I\'ll visit you next month" / "3月要去大阪出差".\n'
      + '      Record them exactly (who goes where, when if mentioned).\n'
      + '\n'
      + 'These findings MUST be reported in the "reasoning" field of the output JSON.\n'
      + '\n'

      + '=== STEP 1 — GENERATE TRIPS (GROUNDED IN STEP 0) ===\n'
      + 'RULES (each trip must satisfy these):\n'
      + '\n'
      + '1. Departure city: the MAJORITY of trips must depart from OWNER_HOME_AIRPORT.\n'
      + '   - If OWNER_HOME = Kyoto → most trips fly out of KIX/ITM, NOT NRT/HND.\n'
      + '   - A Tokyo departure is only allowed if the trip is explicitly about Tokyo\n'
      + '     or if the flight is a long-haul connection through Tokyo.\n'
      + '\n'
      + '2. User-related trip: if USER_LOCATION is not UNKNOWN, and CHAT HISTORY hints the\n'
      + '   owner plans to visit the user, generate at least ONE trip to USER_LOCATION.\n'
      + '   Set companionIsUser = false (the user is already there, not traveling together)\n'
      + '   UNLESS the chat explicitly says they will travel together.\n'
      + '\n'
      + '3. Claimed trips: every entry in CLAIMED_TRIPS must appear as a real trip,\n'
      + '   respecting the dates / destination / purpose mentioned in chat.\n'
      + '\n'
      + '4. Recurring cities: include at least 1 trip to each city listed in RECURRING_CITIES\n'
      + '   (unless it is the owner\'s own home city).\n'
      + '\n'
      + '5. Do NOT invent trips to random famous cities (NYC / Milan / Paris / Dubai) unless\n'
      + '   they are supported by: PHONE OWNER profile, WORLD SETTING, CHAT HISTORY,\n'
      + '   RECURRING_CITIES, or CLAIMED_TRIPS.\n'
      + '\n'
      + '6. Match airlines / hotels / seat class to the owner\'s wealth level.\n'
      + '   - Wealthy / noble → first class, luxury hotels (Park Hyatt, Ritz, etc.)\n'
      + '   - Middle class → economy / premium economy, mid hotels\n'
      + '   - Student / broke → budget airlines, hostels, trains\n'
      + '\n'
      + '7. TIME RANGE: every startTime/endTime must be between ' + oneYearAgo + ' and ' + halfYearLater + ' (unix ms).\n'
      + '\n'
      + '8. TRIP COUNT — MANDATORY: generate between 10 and 15 trips. HARD LIMIT.\n'
      + '   - Do NOT generate fewer than 10 trips, regardless of the character\'s lifestyle.\n'
      + '   - Do NOT generate more than 15 trips.\n'
      + '   - Even a homebody / student must have at least 10 entries in the app.\n'
      + '     Spread them across the past year — short local trips count too.\n'
      + '   - Aim for a mix of upcoming / ongoing / past that fits the character.\n'
      + '\n'
      + '9. status: "upcoming" | "ongoing" | "past" | "cancelled".\n'
      + '   "ongoing" only if the trip is happening RIGHT NOW.\n'
      + '\n'
      + '10. LANGUAGE FORMAT (STRICT — read carefully):\n'
      + '    Every free-text field must follow: "<original> (<Chinese translation>)".\n'
      + '    - OUTSIDE the parentheses = original text in the owner\'s native language.\n'
      + '    - INSIDE the parentheses  = CHINESE translation of that text.\n'
      + '    - If the original text is ALREADY Chinese, write it WITHOUT parentheses.\n'
      + '    - If the original text is a proper noun that is the same in both\n'
      + '      languages (e.g. "京都"), write it ONCE without parentheses.\n'
      + '    CORRECT examples:\n'
      + '        Japanese owner: "東京 (东京)"   "空港到着 (到达机场)"   "パスポート (护照)"\n'
      + '        English owner:  "Tokyo (东京)"  "Arrived at airport (到达机场)"  "Passport (护照)"\n'
      + '        Korean owner:   "서울 (首尔)"   "공항 도착 (到达机场)"\n'
      + '    WRONG (never do this): "東京 (Tokyo)"   ← parentheses MUST be Chinese!\n'
      + '    WRONG (never do this): "Kyoto (Kyoto)"  ← do not repeat the same word!\n'
      + '\n'
      + '11. companionIsUser: true ONLY if the owner and the user are traveling TOGETHER.\n'
      + '    If the owner is going to visit the user who is already somewhere else, that is\n'
      + '    NOT companionIsUser = true.\n'
      + '\n'
      + '12. Every trip must include a full itinerary (2~5 days, 4~8 activities per day)\n'
      + '    and a packing list (5~12 items).\n'
      + '\n'

      + '=== FIELD SPEC ===\n'
      + '  "status"          : upcoming | ongoing | past | cancelled\n'
      + '  "destination"     : native (Chinese) — e.g. "東京 (东京)" or "Kyoto (京都)"\n'
      + '  "destinationCode" : IATA airport code, e.g. "KIX"\n'
      + '  "departureCity"   : native (Chinese) — same format as destination\n'
      + '  "departureCode"   : IATA code, e.g. "HND"\n'
      + '  "startTime"       : unix ms (departure)\n'
      + '  "endTime"         : unix ms (return)\n'
      + '  "durationDays"    : integer\n'
      + '  "purpose"         : vacation | business | family | adventure | cultural | romantic\n'
      + '  "transport"       : flight | train | car | cruise\n'
      + '  "flightNumber"    : e.g. "JL 001"\n'
      + '  "airline"         : e.g. "Japan Airlines"\n'
      + '  "seat"            : e.g. "14A Window"\n'
      + '  "gate"            : e.g. "G12"\n'
      + '  "boardingTime"    : unix ms (startTime - 45min typically)\n'
      + '  "departTime"      : unix ms (usually == startTime)\n'
      + '  "hotelName"       : hotel name in native lang + Chinese in () — e.g. "Park Hyatt Tokyo (东京柏悦酒店)"\n'
      + '  "hotelType"       : luxury | mid | budget | hostel\n'
      + '  "companionIsUser" : true | false\n'
      + '  "companionName"   : "" unless companionIsUser\n'
      + '  "itinerary"       : [{ dayOffset, time, activity, location }]\n'
      + '  "packingList"     : [{ text, done }]\n'
      + '  "thoughts"        : 1-3 sentences in owner\'s voice (native lang).\n'
      + '                      If the trip is connected to a chat conversation,\n'
      + '                      reference the feeling naturally (e.g. "她终于要来了").\n'
      + '\n'

      + '=== OUTPUT — valid JSON only (no markdown fence, no explanation) ===\n'
      + '{\n'
      + '  "reasoning": {\n'
      + '    "owner_home": "京都",\n'
      + '    "owner_home_airport": "KIX",\n'
      + '    "user_location": "Macau (澳门)",\n'
      + '    "user_location_source": "worldbook | user_profile | chat | unknown",\n'
      + '    "recurring_cities": ["東京 (东京)", "京都"],\n'
      + '    "claimed_trips_in_chat": ["3月に東京へ行く (3月去东京)"]\n'
      + '  },\n'
      + '  "trips": [\n'
      + '    {\n'
      + '      "status": "upcoming",\n'
      + '      "destination": "東京 (东京)",\n'
      + '      "destinationCode": "HND",\n'
      + '      "departureCity": "京都",\n'
      + '      "departureCode": "KIX",\n'
      + '      "startTime": 1770000000000,\n'
      + '      "endTime": 1770432000000,\n'
      + '      "durationDays": 3,\n'
      + '      "purpose": "vacation",\n'
      + '      "transport": "flight",\n'
      + '      "flightNumber": "JL 224",\n'
      + '      "airline": "Japan Airlines",\n'
      + '      "seat": "2A",\n'
      + '      "gate": "G12",\n'
      + '      "boardingTime": 1769997300000,\n'
      + '      "departTime": 1770000000000,\n'
      + '      "hotelName": "Park Hyatt Tokyo (东京柏悦酒店)",\n'
      + '      "hotelType": "luxury",\n'
      + '      "companionIsUser": false,\n'
      + '      "companionName": "",\n'
      + '      "itinerary": [\n'
      + '        { "dayOffset": 0, "time": "11:30", "activity": "空港到着 (到达机场)", "location": "羽田空港" }\n'
      + '      ],\n'
      + '      "packingList": [\n'
      + '        { "text": "パスポート (护照)", "done": true }\n'
      + '      ],\n'
      + '      "thoughts": "久しぶりの東京。用事を済ませたら早めに帰ろう。 (久违的东京。办完事就早点回去吧。)"\n'
      + '    }\n'
      + '  ]\n'
      + '}\n';
  }

    // ---------- 解析 AI 返回 ----------
  function _parseTrips(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    var m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    var json = null;
    try { json = JSON.parse(m[0]); } catch (e) { return null; }
    if (!json || !Array.isArray(json.trips)) return null;

    var ownerCharId = _ownerCharId();
    var valid = [];
    var whitelist = ['upcoming', 'ongoing', 'past', 'cancelled'];

    json.trips.forEach(function (t, i) {
      if (!t || typeof t !== 'object') return;
      if (!t.destination || !t.startTime) return;
      var st = _toMs(t.startTime) || Date.now();
      var et = _toMs(t.endTime) || (st + 86400000);
      valid.push({
        id: 'trip_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2, 8),
        ownerCharId: ownerCharId,
        type: 'trip',
        status: (whitelist.indexOf(t.status) >= 0) ? t.status : 'past',
        destination: String(t.destination || ''),
        destinationCode: String(t.destinationCode || '—').toUpperCase().slice(0, 4),
        departureCity: String(t.departureCity || ''),
        departureCode: String(t.departureCode || '—').toUpperCase().slice(0, 4),
        startTime: st, endTime: et,
        durationDays: Number(t.durationDays) || 1,
        purpose: String(t.purpose || 'vacation'),
        transport: String(t.transport || 'flight'),
        flightNumber: String(t.flightNumber || ''),
        airline: String(t.airline || ''),
        seat: String(t.seat || ''),
        gate: String(t.gate || ''),
        boardingTime: _toMs(t.boardingTime) || st,
        departTime: _toMs(t.departTime) || st,
        hotelName: String(t.hotelName || ''),
        hotelType: String(t.hotelType || 'mid'),
        companionIsUser: !!t.companionIsUser,
        companionName: String(t.companionName || ''),
        itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
        packingList: Array.isArray(t.packingList) ? t.packingList : [],
        thoughts: String(t.thoughts || '')
      });
    });
    return valid.length > 0 ? valid : null;
  }


  // ---------- 骰子主入口 ----------
  window.rollTravelData = async function () {
    if (_generating) return;
    var ownerCharId = _ownerCharId();
    if (ownerCharId === '__no_owner__') {
      if (typeof showToast === 'function') showToast('No character selected');
      return;
    }
    var api = (typeof state !== 'undefined' && Array.isArray(state.apis))
      ? state.apis.find(function (a) { return a.id === state.activeApiId; }) : null;
    if (!api || !api.url) {
      if (typeof showToast === 'function') showToast('Please configure API first');
      return;
    }
    if (typeof sendChat !== 'function') { console.error('[travel] sendChat not found'); return; }

    _generating = true;
    _refresh();

    var before = (state.travelData || []).length;
    state.travelData = (state.travelData || []).filter(function (x) { return x.ownerCharId !== ownerCharId; });
    console.log('[rollTravelData] 清空旧数据:', before, '→', state.travelData.length);

    try {
      var prompt = _buildPrompt();
      if (!prompt) throw new Error('无法构建 prompt（无手机主人）');
      console.log('[rollTravelData] prompt 长度:', prompt.length);
      var reply = await sendChat(api, [{ role: 'user', content: prompt }]);
      console.log('[rollTravelData] raw reply 长度:', reply.length);
      var trips = _parseTrips(reply);
      if (!trips) throw new Error('AI 返回内容无法解析为 JSON');
      state.travelData = state.travelData.concat(trips);
      if (typeof saveState === 'function') saveState();
      console.log('[rollTravelData] generated', trips.length, 'trips for', ownerCharId);
      if (typeof showToast === 'function') showToast('Generated ' + trips.length + ' trips');
    } catch (e) {
      console.error('[rollTravelData] generate failed:', e);
      if (typeof showErrorModal === 'function') showErrorModal('生成失败：' + (e && e.message ? e.message : String(e)));
      else if (typeof showToast === 'function') showToast('Generation failed');
    } finally {
      _generating = false;
      _tab = 'upcoming';
      _refresh();
    }
  };

  // 测试导出
  window._ptravelParseTrips = _parseTrips;
  window._ptravelBuildPrompt = _buildPrompt;
  window._ptravelDetailHtml = _detailHtml;

  // ---------- 注册 ----------
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.travel = _renderer;
    console.log('[phone-travel.js] registered | module=4');
  } else {
    console.warn('[phone-travel.js] PHONE_APP_RENDERERS not found');
  }
})();