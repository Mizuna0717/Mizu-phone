// ==========================================================
//  PHONE CALENDAR APP
//  模块 3：骰子 + AI 一次性生成（含社交性×规律性 + 特殊日期）
// ==========================================================

;(function() {
  'use strict';

  // 当前显示的月份 + 选中日期
  var _pcalViewYear = null;
  var _pcalViewMonth = null;
  var _pcalSelectedDate = null;

  // ══════════════════════════════════════════════
  //  1. 基础工具
  // ══════════════════════════════════════════════
  function _pcalEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _pcalStartOfDay(d) {
    var x = new Date(d); x.setHours(0,0,0,0); return x;
  }
  function _pcalSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }
  function _pcalFormatTime12(d) {
    var h = d.getHours(), m = d.getMinutes();
    if (h === 0 && m === 0) return '12:00 AM';
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + ('' + m).padStart(2,'0') + ' ' + ampm;
  }
  function _pcalFormatDuration(min) {
    if (min >= 60 && min % 60 === 0) return (min/60) + 'h';
    if (min >= 60) return Math.floor(min/60) + 'h ' + (min%60) + 'min';
    return min + ' min';
  }
  function _pcalDayLabel(d) {
    var today = _pcalStartOfDay(new Date());
    var diff = Math.round((_pcalStartOfDay(d).getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
  }

  // ══════════════════════════════════════════════
  //  2. 分类颜色 + 标签
  // ══════════════════════════════════════════════
  var _pcalCategoryColors = {
    work:          'rgba(90, 110, 150, .55)',
    personal:      'rgba(130, 130, 140, .5)',
    social:        'rgba(90, 140, 110, .55)',
    health:        'rgba(150, 85, 85, .5)',
    education:     'rgba(120, 105, 150, .55)',
    travel:        'rgba(90, 130, 150, .5)',
    appointment:   'rgba(150, 125, 90, .5)',
    reminder:      'rgba(160, 145, 90, .5)',
    freelance:     'rgba(95, 130, 160, .5)',
    family:        'rgba(150, 105, 120, .5)',
    date:          'rgba(155, 95, 115, .55)',
    religious:     'rgba(140, 125, 100, .5)',
    hobby:         'rgba(100, 140, 130, .5)',
    other:         'rgba(120, 120, 125, .45)'
  };
  function _pcalCategoryColor(cat) { return _pcalCategoryColors[cat] || _pcalCategoryColors.other; }
  function _pcalCategoryLabel(cat) {
    var m = { work:'工作',personal:'个人',social:'社交',health:'健康',education:'学习',
              travel:'旅行',appointment:'预约',reminder:'提醒',freelance:'自由职业',
              family:'家人',date:'约会',religious:'宗教',hobby:'兴趣',other:'其他' };
    return m[cat] || '其他';
  }
  function _pcalStatusLabel(s) {
    var m = { upcoming:'Upcoming', ongoing:'Ongoing', completed:'Completed', cancelled:'Cancelled' };
    return m[s] || s;
  }

  // ══════════════════════════════════════════════
  //  3. 查事件
  // ══════════════════════════════════════════════
  function _pcalGetEventsForDay(ownerCharId, day) {
    var start = _pcalStartOfDay(day).getTime();
    var end = start + 86400000;
    return (state.calendarData || []).filter(function(e){
      if (!e || e.ownerCharId !== ownerCharId) return false;
      if (e.allDay) {
        var d = _pcalStartOfDay(new Date(e.startTime));
        return d.getTime() === start;
      }
      return e.startTime >= start && e.startTime < end;
    }).sort(function(a, b){
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return a.startTime - b.startTime;
    });
  }

  // ══════════════════════════════════════════════
  //  4. 月历渲染
  // ══════════════════════════════════════════════
  function _pcalBuildMonthGridHTML(ownerCharId, year, month, selectedDate) {
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = _pcalStartOfDay(new Date());
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        var h = '';
    h += '<div class="pcal-month-header">';
    h += '<button class="pcal-nav-btn" onclick="pcalNavMonth(-1)">' +
      '<svg viewBox="0 0 20 20" width="20" height="20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';
    h += '<div class="pcal-month-title">' + MONTHS[month] + ' ' + year + '</div>';
    h += '<button class="pcal-nav-btn" onclick="pcalNavMonth(1)">' +
      '<svg viewBox="0 0 20 20" width="20" height="20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';
    h += '</div>';
    h += '<div class="pcal-weekdays">';
    days.forEach(function(d){ h += '<div class="pcal-weekday">' + d.charAt(0) + '</div>'; });
    h += '</div>';
    h += '<div class="pcal-grid">';

    for (var i = 0; i < firstDay; i++) h += '<div class="pcal-cell pcal-cell-empty"></div>';

    for (var d = 1; d <= daysInMonth; d++) {
      var thisDay = new Date(year, month, d);
      var isToday = _pcalSameDay(thisDay, today);
      var isSelected = selectedDate && _pcalSameDay(thisDay, selectedDate);
      var hasEvent = _pcalGetEventsForDay(ownerCharId, thisDay).length > 0;

      var cls = 'pcal-cell';
      if (isToday) cls += ' pcal-cell-today';
      if (isSelected) cls += ' pcal-cell-selected';

      h += '<div class="' + cls + '" data-date="' + thisDay.getTime() + '" ' +
           'onclick="pcalSelectDay(' + thisDay.getTime() + ')">';
      h += '<span class="pcal-cell-num">' + d + '</span>';
      if (hasEvent) h += '<span class="pcal-cell-dot"></span>';
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  5. 事件行
  // ══════════════════════════════════════════════
    function _pcalBuildEventRowHTML(event) {
    var catColor = _pcalCategoryColor(event.category);
    var isCancelled = event.status === 'cancelled';
    var isCompleted = event.status === 'completed';
    var isOngoing = event.status === 'ongoing';
    var hasThoughts = event.thoughts && String(event.thoughts).trim();

    var timeStr = '';
    if (!event.allDay) {
      timeStr = _pcalFormatTime12(new Date(event.startTime));
    }

    var cls = 'pcal-event';
    if (isCancelled) cls += ' pcal-event-cancelled';
    if (isCompleted) cls += ' pcal-event-completed';
    if (isOngoing) cls += ' pcal-event-ongoing';
    if (!hasThoughts) cls += ' pcal-event-nothoughts';

    var onClickAttr = hasThoughts
      ? 'onclick="pcalToggleEventThoughts(\'' + _pcalEscape(event.id) + '\')" '
      : '';

    var h = '<div class="' + cls + '" data-event-id="' + _pcalEscape(event.id) + '" ' +
            onClickAttr +
            'style="cursor:' + (hasThoughts ? 'pointer' : 'default') + ';-webkit-tap-highlight-color:transparent">';

    // 主体行
    h += '<div class="pcal-event-main">';

    h += '<div class="pcal-event-time">' +
      (event.allDay ? '<span class="pcal-event-allday">ALL DAY</span>' : timeStr) +
    '</div>';

    h += '<div class="pcal-event-bar" style="background:' + catColor + '"></div>';

        h += '<div class="pcal-event-info">';
    h += '<div class="pcal-event-title">' +
      (event.isSpecial ? '<span class="pcal-event-special">★</span> ' : '') +
      _pcalEscape(event.title) +
    '</div>';
    if (event.description && String(event.description).trim()) {
      h += '<div class="pcal-event-desc">' + _pcalEscape(event.description) + '</div>';
    }

    // meta 行：分类标签 + 时长 + 地点
    h += '<div class="pcal-event-meta">';
        // 把 catColor 的 alpha 从 .5 降为 .22（更淡）
    var catBg = catColor.replace(/,\s*[\d.]+\)$/, ', 0.22)');
    h += '<span class="pcal-event-tag" style="background:' + catBg + '">' +
      _pcalCategoryLabel(event.category) +
    '</span>';
    if (!event.allDay) {
      var dur = Math.round((event.endTime - event.startTime) / 60000);
      if (dur > 0) {
        h += '<span class="pcal-event-meta-sep">·</span>';
        h += '<span>' + _pcalFormatDuration(dur) + '</span>';
      }
    }
    if (event.location) {
      h += '<span class="pcal-event-meta-sep">·</span>';
      h += '<span>' + _pcalEscape(event.location) + '</span>';
    }
    h += '</div>';   // /meta
    h += '</div>';   // /info
    h += '</div>';   // /main

    // 展开的想法（默认折叠）
    if (hasThoughts) {
      h += '<div class="pcal-event-thoughts">';
      h += '<div class="pcal-thoughts-text">' + _pcalEscape(event.thoughts) + '</div>';
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  6. 当天列表
  // ══════════════════════════════════════════════
  function _pcalBuildDaySectionHTML(ownerCharId, date) {
    var events = _pcalGetEventsForDay(ownerCharId, date);
    var h = '<div class="pcal-day-section">';
    h += '<div class="pcal-day-header">' + _pcalDayLabel(date) + '</div>';
    if (events.length === 0) {
      h += '<div class="pcal-day-empty">No events</div>';
    } else {
      events.forEach(function(e){ h += _pcalBuildEventRowHTML(e); });
    }
    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  7. 列表主入口
  // ══════════════════════════════════════════════
  function _pcalBuildListHTML(ownerCharId) {
    var now = new Date();
    if (_pcalViewYear == null) _pcalViewYear = now.getFullYear();
    if (_pcalViewMonth == null) _pcalViewMonth = now.getMonth();
    if (_pcalSelectedDate == null) _pcalSelectedDate = _pcalStartOfDay(now);

    var events = (state.calendarData || []).filter(function(e){
      return e && e.ownerCharId === ownerCharId;
    });

    if (events.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<rect x="8" y="12" width="32" height="28" rx="3"/>' +
          '<path d="M8 20h32M16 8v8M32 8v8"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No events yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var h = '';
    h += '<div class="pcal-month-wrap">';
    h += _pcalBuildMonthGridHTML(ownerCharId, _pcalViewYear, _pcalViewMonth, _pcalSelectedDate);
    h += '</div>';
    h += _pcalBuildDaySectionHTML(ownerCharId, _pcalSelectedDate);
    return h;
  }

  // ══════════════════════════════════════════════
  //  8. 骰子按钮
  // ══════════════════════════════════════════════
  function _pcalInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollCalendarData()" title="Generate Events">' +
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
  //  9. 主渲染
  // ══════════════════════════════════════════════
  function _pcalPageRenderer(charName) {
    setTimeout(_pcalInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pcalBuildListHTML(ownerCharId);
  }

    // ══════════════════════════════════════════════
  //  9.5 日期交互（模块 4）
  // ══════════════════════════════════════════════

  window.pcalSelectDay = function(timestamp) {
    if (!timestamp) return;
    var d = _pcalStartOfDay(new Date(timestamp));
    _pcalSelectedDate = d;
    // 如果点在别的月份的格子里，同步 view
    _pcalViewYear = d.getFullYear();
    _pcalViewMonth = d.getMonth();
    _pcalRerender();
  };

  window.pcalNavMonth = function(delta) {
    if (!delta) delta = 0;
    var y = _pcalViewYear;
    var m = _pcalViewMonth + delta;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    _pcalViewYear = y;
    _pcalViewMonth = m;
    // 选中日期跳到新月份的 1 号
    _pcalSelectedDate = _pcalStartOfDay(new Date(y, m, 1));
    _pcalRerender();
  };

window.pcalToggleEventThoughts = function(eventId) {
    if (!eventId) return;
    var row = document.querySelector('#phoneAppPage .pcal-event[data-event-id="' + eventId + '"]');
    if (!row) return;
    if (row.classList.contains('pcal-event-nothoughts')) return;
    row.classList.toggle('pcal-event-expanded');
  };

  function _pcalRerender() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    var bodyEl = pageEl.querySelector('.papp-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = _pcalBuildListHTML(ownerCharId);
    setTimeout(_pcalInjectDiceBtn, 0);
  }


  // ══════════════════════════════════════════════
  //  10. Prompt 构建
  // ══════════════════════════════════════════════
  function _pcalBuildPrompt(ownerInfo, contactsText, historyBlock, worldbookBlk, todayStr) {
    var prompt =
      'You are writing a REALISTIC CALENDAR for a fictional phone owner.\n' +
      'The phone owner is "' + ownerInfo.name + '".\n' +
      'Today\'s date is: ' + todayStr + '\n\n' +

      '=== PHONE OWNER ===\n' + ownerInfo.block + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      (contactsText ? '=== CONTACTS (from Messages app) ===\n' + contactsText + '\n\n' : '') +

      (historyBlock ? historyBlock + '\n' : '') +

      '=== PRIORITY RULE (CRITICAL) ===\n' +
      'If the CHAT HISTORY above conflicts with the WORLD SETTING or the PERSONA,\n' +
      'the CHAT HISTORY WINS. Events mentioned in the chat (dates, plans, meetups,\n' +
      'birthdays, anniversaries) MUST appear in the calendar.\n\n' +

      '=== STEP 1: ANALYZE THE OWNER ===\n' +
      'Determine:\n' +
      '  - SOCIABILITY: high / medium / low\n' +
      '      (high = extroverted / social / many friends / public figure\n' +
      '       low  = introverted / loner / homebody / private)\n' +
      '  - PLANNING STYLE: high / medium / low\n' +
      '      (high = methodical / scheduler / planner / disciplined / uses calendar\n' +
      '       low  = spontaneous / go-with-the-flow / rarely plans)\n' +
      '  - IDENTITY: student / office worker / freelancer / artist / noble /\n' +
      '                celebrity / parent / business owner / etc.\n' +
      '  - HABITS: sleep schedule, workouts, hobbies, regular commitments\n' +
      '  - REGION / CULTURE: affects location names, event types, holidays\n\n' +

      '=== STEP 2: EVENT COUNT (sociability × planning style) ===\n' +
      '  ╔═════════════╦════════════╦════════════╦════════════╗\n' +
      '  ║             ║ HIGH plan  ║ MED plan   ║ LOW plan   ║\n' +
      '  ╠═════════════╬════════════╬════════════╬════════════╣\n' +
      '  ║ HIGH social ║ 50-70      ║ 40-55      ║ 25-40      ║\n' +
      '  ║ MED social  ║ 35-50      ║ 25-40      ║ 15-25      ║\n' +
      '  ║ LOW social  ║ 20-30      ║ 15-25      ║ 8-15       ║\n' +
      '  ╚═════════════╩════════════╩════════════╩════════════╝\n\n' +

            '=== STEP 3: TIME RANGE ===\n' +
      'Cover from -14 days (2 weeks ago) to +28 days (4 weeks ahead) relative to today.\n' +
      'Density rules:\n' +
      '  - TODAY:        5-10 events (busiest day)\n' +
      '  - Tomorrow:     3-6 events\n' +
      '  - Past 7 days:  1-4 events per day\n' +
      '  - Past 2 weeks: sparse (1 every 2-3 days)\n' +
      '  - Next 7 days:  1-4 events per day\n' +
      '  - Next 4 weeks: sparse\n\n' +
            '★ Days right before/after an important event (travel, exam, deadline) may cluster.\n' +
      '★ Avoid the pattern: 1 event per day × 40 days. That is wrong.\n\n' +
            '★ EXCEPTION — SPECIAL DATES (birthday / anniversary / holiday) are NOT bound by\n' +
      '  the -14 ~ +28 range. They may appear anywhere from -180 to +180 days.\n' +
      '  ALWAYS include them if the persona or chat history mentions them,\n' +
      '  even if the actual date is far in the past or future.\n\n' +

            '=== STEP 4: SPECIAL DATES — HIGH PRIORITY, EVENT CHAINS ===\n' +
      '★ These are MORE IMPORTANT than ordinary events. Treat them as EVENT CHAINS,\n' +
      '  not single events. Each special date MUST have 2-5 related events.\n\n' +

      '★ SCAN MANDATE (must do all):\n' +
      '  1. Scan the PERSONA block above for ANY birthday / anniversary / holiday.\n' +
      '     - Birthday of the phone owner themselves\n' +
      '     - Anniversary of important life events (met X, wedding, debut, etc.)\n' +
      '     - Cultural holidays in their region\n' +
      '  2. Scan the CHAT HISTORY for ANY mentioned date or plan:\n' +
      '     - "下个月是我生日" / "my birthday is on..." / "다음 주에 우리 기념일"\n' +
      '     - Trips / meetups / deadlines / promises with a date\n' +
            '     - The USER\'S birthday if mentioned (the owner cares about it!)\n' +
      '  3. If a date is found, it MUST be included in the calendar,\n' +
      '     EVEN IF it falls outside the -14 ~ +28 range. Range is -180 ~ +180.\n\n' +

      '★ EVENT CHAIN STRUCTURE (for birthday / anniversary):\n' +
      '  For EACH birthday or anniversary, generate 2-5 events spread over time:\n' +
      '    [PREP]     1~3 weeks before  → buy gift / book restaurant / make invitation list /\n' +
      '                                   prepare surprise / pick outfit / arrange transport\n' +
      '    [DAY-OF]   the day itself    → the party / dinner / surprise / alone celebration\n' +
      '    [FOLLOWUP] 1~3 days after    → thank-you messages / share photos / cleanup /\n' +
      '                                   send gifts / post on social\n\n' +

      '  EXAMPLE — birthday on day +30:\n' +
      '    day +14: "Enのプレゼントを探す (给En挑礼物)"        [birthday-prep]\n' +
      '    day +28: "レストランを予約する (预订餐厅)"         [birthday-prep]\n' +
      '    day +30: "Enの誕生日パーティー (En的生日派对)"     [birthday]\n' +
      '    day +31: "お礼のメッセージを送る (发感谢消息)"     [birthday-followup]\n\n' +

      '  If the birthday is on day -14 (two weeks ago):\n' +
      '    day -28: "プレゼントを準備する (准备礼物)"         [birthday-prep]\n' +
      '    day -14: "ユーザーの誕生日 (用户生日)"            [birthday]\n' +
      '    day -13: "お礼の写真を送る (发送感谢照片)"        [birthday-followup]\n\n' +

      '★ SPECIAL FIELDS:\n' +
      '  - "isSpecial":  true\n' +
      '  - "specialType": one of:\n' +
      '      "birthday"             — the birthday itself\n' +
      '      "birthday-prep"        — preparation before a birthday\n' +
      '      "birthday-followup"    — follow-up after a birthday\n' +
      '      "anniversary"          — anniversary itself\n' +
      '      "anniversary-prep"     — preparation before\n' +
      '      "anniversary-followup" — follow-up after\n' +
      '      "holiday"              — cultural / religious holiday\n' +
      '      "plan"                 — a specific plan mentioned in chat\n\n' +

      '★ TITLE CONVENTION for special events:\n' +
      '  - Birthday of the owner themselves → include "自分の誕生日" / "My birthday"\n' +
      '  - Birthday of user → include the user name → "Enの誕生日" / "En\'s birthday"\n' +
      '  - Prep events → include action + target → "Enのプレゼントを買う" / "Buy gift for En"\n' +
      '  - Followup → "お礼を言う" / "Thank-you message"\n\n' +

      '=== STEP 5: EVENT FIELDS ===\n' +
      'Each event:\n' +
      '  - "title"        : event title (in owner\'s NATIVE language).\n' +
      '                     If the event is WITH a specific person, include them:\n' +
      '                     "山田さんとランチ" / "Lunch with 山田" / "과 山田 점심"\n' +
      '  - "category"     : one of:\n' +
      '                     work / personal / social / health / education / travel /\n' +
      '                     appointment / reminder / freelance / family / date /\n' +
      '                     religious / hobby / other\n' +
      '  - "location"     : place name (in native language) or ""\n' +
      '  - "daysOffset"   : INTEGER days relative to today. -14 to +28.\n' +
      '  - "startHour"    : 0-23 (SKIP if allDay)\n' +
      '  - "startMin"     : 0-59 (SKIP if allDay)\n' +
      '  - "endHour"      : 0-23 (SKIP if allDay)\n' +
      '  - "endMin"       : 0-59 (SKIP if allDay)\n' +
      '  - "allDay"       : true | false\n' +
      '  - "status"       : "upcoming" | "ongoing" | "completed" | "cancelled"\n' +
      '                     * past events → "completed" (80%) or "cancelled" (5%)\n' +
      '                     * today + happening now → "ongoing"\n' +
      '                     * future → "upcoming"\n' +
      '  - "reminder"     : string like "15 min before" | "1 hour before" | "1 day before" | ""\n' +
      '  - "isSpecial"    : true if birthday / anniversary / holiday / chat-mentioned plan\n' +
      '  - "specialType"  : "birthday" | "anniversary" | "holiday" | "plan" | ""\n' +
            '  - "description"  : ONE short sentence describing what this event IS\n' +
      '                     (objective, not the owner\'s feelings).\n' +
      '                     In owner\'s NATIVE language, with Chinese translation in ().\n' +
      '                     Examples:\n' +
      '                       "Weekly team meeting to review progress (每周团队会，回顾进度)"\n' +
      '                       "Buy a birthday gift for En (给 En 买生日礼物)"\n' +
      '                       "Pick up dry cleaning on the way home (回家路上取干洗的衣服)"\n' +
      '                     Keep it SHORT (under 60 chars). If the event is trivial,\n' +
      '                     you may use an empty string "" to skip the description.\n' +
      '  - "thoughts"     : 1-2 sentences in owner\'s inner voice (native language)\n\n' +

      '=== STEP 6: CONTENT BOUNDARY ===\n' +
      'Events are schedule items, not private diary entries. Titles may mention\n' +
      'casual interactions ("lunch with X") but MUST NOT expose intimate secrets.\n' +
      'Owner\'s thoughts can be personal but should stay within what they\'d jot down\n' +
      'in a calendar note.\n\n' +

      '=== STEP 7: LANGUAGE ===\n' +
      'ALL text (titles, locations, thoughts) in owner\'s NATIVE language.\n' +
      'Non-Chinese text → native language FIRST, Chinese translation in parentheses.\n' +
      'Format: "山田さんとランチ (和山田吃午餐)"\n' +
      'Pure Chinese → no translation.\n\n' +

      '=== OUTPUT ===\n' +
      'Return ONLY a valid JSON object:\n' +
      '{\n' +
      '  "events": [\n' +
      '    {\n' +
      '      "title": "チームミーティング (团队会议)",\n' +
      '      "description": "Weekly sync with the project team (每周与项目组同步)",\n' +
      '      "category": "work",\n' +
      '      "location": "東京本社 15F",\n' +
      '      "daysOffset": 0,\n' +
      '      "startHour": 9, "startMin": 0,\n' +
      '      "endHour": 9, "endMin": 30,\n' +
      '      "allDay": false,\n' +
      '      "status": "upcoming",\n' +
      '      "reminder": "15 min before",\n' +
      '      "isSpecial": false,\n' +
      '      "specialType": "",\n' +
      '      "thoughts": "また会議か。 (又是会议。)"\n' +
      '    }\n' +
      '  ]\n' +
      '}\n';

    return prompt;
  }

  // ══════════════════════════════════════════════
  //  11. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _pcalGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollCalendarData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', block: '' };

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';

    // 拉联系人
    var contactsText = '';
    if (Array.isArray(state.messageChats)) {
      var seen = {};
      var contacts = [];
      state.messageChats.forEach(function(c){
        if (!c || c.isUser || c.ownerCharId !== ownerCharId) return;
        var n = (c.npcName || '').trim();
        if (!n) return;
        var k = n.toLowerCase();
        if (seen[k]) return;
        seen[k] = true;
        contacts.push(n + (c.displayName && c.displayName !== n ? ' (' + c.displayName + ')' : ''));
      });
      if (contacts.length > 0) contactsText = contacts.map(function(n, i){ return (i+1) + '. ' + n; }).join('\n');
    }

    // 聊天记录（权重高于世界书）
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 30) : [];
    var historyBlock = '';
    if (recent.length > 0) {
      historyBlock = '=== CHAT HISTORY (HIGHEST PRIORITY — extract events, dates, plans from here) ===\n';
      recent.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
    }

    // 今天的日期字符串
    var now = new Date();
    var todayStr = now.getFullYear() + '-' + ('' + (now.getMonth()+1)).padStart(2,'0') + '-' + ('' + now.getDate()).padStart(2,'0');

    var prompt = _pcalBuildPrompt(ownerInfo, contactsText, historyBlock, worldbookBlk, todayStr);
    console.log('[rollCalendarData] prompt 长度:', prompt.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollCalendarData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollCalendarData] raw reply 长度:', rawReply.length);

    var obj = null;
    try { var jm = rawReply.match(/\{[\s\S]*\}/); if (jm) obj = JSON.parse(jm[0]); }
    catch(e) { console.warn('[rollCalendarData] 完整解析失败:', e.message); }

    if (!obj) {
      console.warn('[rollCalendarData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('{');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx);
        // 尝试逐层删掉尾部找到合法 JSON
        for (var cut = body.length; cut > 0; cut -= 50) {
          var probe = body.slice(0, cut);
          // 补齐可能的括弧
          var opens = (probe.match(/\[/g) || []).length - (probe.match(/\]/g) || []).length;
          var bopens = (probe.match(/\{/g) || []).length - (probe.match(/\}/g) || []).length;
          for (var q = 0; q < opens; q++) probe += ']';
          for (var w = 0; w < bopens; w++) probe += '}';
          try { obj = JSON.parse(probe); console.log('[rollCalendarData] 截断补救成功'); break; }
          catch(e2) {}
        }
      }
    }

    if (!obj || typeof obj !== 'object') { console.warn('[rollCalendarData] 无法解析'); return null; }
    if (!Array.isArray(obj.events)) { console.warn('[rollCalendarData] 无 events 数组'); return null; }

    console.log('[rollCalendarData] AI 返回事件数:', obj.events.length);

    // 归一化
    var todayStart = _pcalStartOfDay(new Date()).getTime();
    var nowTs = Date.now();
    var DAY = 86400000;
    var out = [];

    obj.events.forEach(function(e, i){
      if (!e || !e.title) return;

      var daysOffset = parseInt(e.daysOffset, 10);
      if (!isFinite(daysOffset)) daysOffset = 0;
      if (daysOffset < -30 || daysOffset > 60) return;

      var cat = String(e.category || 'other').toLowerCase();
      var validCats = ['work','personal','social','health','education','travel','appointment',
                       'reminder','freelance','family','date','religious','hobby','other'];
      if (validCats.indexOf(cat) < 0) cat = 'other';

      var status = String(e.status || 'upcoming').toLowerCase();
      if (['upcoming','ongoing','completed','cancelled'].indexOf(status) < 0) status = 'upcoming';

      var allDay = !!e.allDay;
      var startTs, endTs;

      if (allDay) {
        startTs = todayStart + daysOffset * DAY;
        endTs = startTs + DAY - 1;
      } else {
        var sh = parseInt(e.startHour, 10); if (!isFinite(sh) || sh < 0) sh = 9;
        var sm = parseInt(e.startMin, 10); if (!isFinite(sm) || sm < 0) sm = 0;
        var eh = parseInt(e.endHour, 10); if (!isFinite(eh) || eh < 0) eh = sh + 1;
        var em = parseInt(e.endMin, 10); if (!isFinite(em) || em < 0) em = 0;
        var sDate = new Date(todayStart + daysOffset * DAY);
        sDate.setHours(sh, sm, 0, 0);
        var eDate = new Date(todayStart + daysOffset * DAY);
        eDate.setHours(eh, em, 0, 0);
        if (eDate.getTime() <= sDate.getTime()) eDate = new Date(sDate.getTime() + 3600000);
        startTs = sDate.getTime();
        endTs = eDate.getTime();
      }

      out.push({
        id: 'event_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
                title: String(e.title).trim(),
        description: (e.description != null) ? String(e.description).trim() : '',
        category: cat,
        location: (e.location != null) ? String(e.location).trim() : '',
        startTime: startTs,
        endTime: endTs,
        allDay: allDay,
        status: status,
        reminder: (e.reminder != null) ? String(e.reminder).trim() : '',
        isSpecial: !!e.isSpecial,
        specialType: (e.specialType != null) ? String(e.specialType).trim() : '',
        note: '',
        thoughts: (e.thoughts != null) ? String(e.thoughts).trim() : ''
      });
    });

    out.sort(function(a, b){ return a.startTime - b.startTime; });
    var specials = out.filter(function(e){ return e.isSpecial; }).length;
    console.log('[rollCalendarData] 生成完成:', out.length, '个事件，其中', specials, '个特殊日期');
    return out;
  }

  // ══════════════════════════════════════════════
  //  12. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollCalendarData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollCalendarData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating events...</p></div>';
    }

    var before = (state.calendarData || []).length;
    state.calendarData = (state.calendarData || []).filter(function(e){ return e.ownerCharId !== ownerCharId; });
    console.log('[rollCalendarData] 清空旧数据:', before, '→', state.calendarData.length);

    var events = await _pcalGenerateAll(ownerCharId);
    if (!events || events.length === 0) { showToast('Generation failed'); openPhoneApp('calendar'); return; }

    events.forEach(function(e){ state.calendarData.push(e); });
    saveState();
    openPhoneApp('calendar');
    showToast('Generated ' + events.length + ' events');
  };

  // ══════════════════════════════════════════════
  //  13. 注册 renderer
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.calendar = _pcalPageRenderer;
  } else {
    console.warn('[phone-calendar.js] PHONE_APP_RENDERERS 未定义');
  }

  // ══════════════════════════════════════════════
  //  14. 测试挂载
  // ══════════════════════════════════════════════
  window.__pcalTest = {
    buildListHTML: _pcalBuildListHTML,
    buildPrompt: _pcalBuildPrompt,
    generateAll: _pcalGenerateAll,
    getEventsForDay: _pcalGetEventsForDay,
    renderer: _pcalPageRenderer
  };

  console.log('[phone-calendar.js] 已加载（模块 3）');
})();