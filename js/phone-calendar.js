// ==========================================================
//  PHONE CALENDAR APP
//  模块 2：列表渲染 + 假数据测试版
// ==========================================================

;(function() {
  'use strict';

  // ── 状态：当前显示的月份 + 选中的日期 ──
  var _pcalViewYear = null;
  var _pcalViewMonth = null;  // 0-based
  var _pcalSelectedDate = null;  // Date 对象（零点）

  // ══════════════════════════════════════════════
  //  1. HTML 转义
  // ══════════════════════════════════════════════
  function _pcalEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ══════════════════════════════════════════════
  //  2. 时间工具
  // ══════════════════════════════════════════════
  function _pcalStartOfDay(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  function _pcalSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }
  function _pcalFormatTime12(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    if (h === 0 && m === 0) return '12:00 AM';
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + ('' + m).padStart(2,'0') + ' ' + ampm;
  }
  function _pcalFormatDuration(minutes) {
    if (minutes >= 60 && minutes % 60 === 0) return (minutes/60) + 'h';
    if (minutes >= 60) return Math.floor(minutes/60) + 'h ' + (minutes%60) + 'min';
    return minutes + ' min';
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
  //  3. 分类图标 + 颜色
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
  function _pcalCategoryColor(cat) {
    return _pcalCategoryColors[cat] || _pcalCategoryColors.other;
  }
  function _pcalCategoryLabel(cat) {
    var map = {
      work:'工作', personal:'个人', social:'社交', health:'健康',
      education:'学习', travel:'旅行', appointment:'预约', reminder:'提醒',
      freelance:'自由职业', family:'家人', date:'约会', religious:'宗教',
      hobby:'兴趣', other:'其他'
    };
    return map[cat] || '其他';
  }

  // ══════════════════════════════════════════════
  //  4. 月历渲染
  // ══════════════════════════════════════════════
  function _pcalGetEventsForDay(ownerCharId, day) {
    var start = _pcalStartOfDay(day).getTime();
    var end = start + 86400000;
    return (state.calendarData || []).filter(function(e){
      if (!e || e.ownerCharId !== ownerCharId) return false;
      if (e.allDay) {
        // 全天事件：用 startTime 所在日期
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

  function _pcalBuildMonthGridHTML(ownerCharId, year, month, selectedDate) {
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = _pcalStartOfDay(new Date());

    var h = '';
    h += '<div class="pcal-month-header">';
    h += '<div class="pcal-month-title">' + ['January','February','March','April','May','June','July','August','September','October','November','December'][month] + ' ' + year + '</div>';
    h += '</div>';

    h += '<div class="pcal-weekdays">';
    days.forEach(function(d){ h += '<div class="pcal-weekday">' + d.charAt(0) + '</div>'; });
    h += '</div>';

    h += '<div class="pcal-grid">';

    // 前置空白
    for (var i = 0; i < firstDay; i++) {
      h += '<div class="pcal-cell pcal-cell-empty"></div>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var thisDay = new Date(year, month, d);
      var isToday = _pcalSameDay(thisDay, today);
      var isSelected = selectedDate && _pcalSameDay(thisDay, selectedDate);
      var hasEvent = _pcalGetEventsForDay(ownerCharId, thisDay).length > 0;

      var cls = 'pcal-cell';
      if (isToday) cls += ' pcal-cell-today';
      if (isSelected) cls += ' pcal-cell-selected';

      h += '<div class="' + cls + '" data-date="' + thisDay.getTime() + '">';
      h += '<span class="pcal-cell-num">' + d + '</span>';
      if (hasEvent) h += '<span class="pcal-cell-dot"></span>';
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  5. 事件行渲染
  // ══════════════════════════════════════════════
  function _pcalBuildEventRowHTML(event) {
    var catColor = _pcalCategoryColor(event.category);
    var isCancelled = event.status === 'cancelled';
    var isCompleted = event.status === 'completed';
    var isOngoing = event.status === 'ongoing';

    var timeStr;
    if (event.allDay) {
      timeStr = 'All Day';
    } else {
      var start = new Date(event.startTime);
      var end = new Date(event.endTime);
      timeStr = _pcalFormatTime12(start);
      var dur = Math.round((event.endTime - event.startTime) / 60000);
      if (dur > 0) timeStr += ' · ' + _pcalFormatDuration(dur);
    }

    var cls = 'pcal-event';
    if (isCancelled) cls += ' pcal-event-cancelled';
    if (isCompleted) cls += ' pcal-event-completed';
    if (isOngoing) cls += ' pcal-event-ongoing';

    var h = '<div class="' + cls + '" data-event-id="' + _pcalEscape(event.id) + '">';
    h += '<div class="pcal-event-time">' + (event.allDay ? '<span class="pcal-event-allday">ALL DAY</span>' : timeStr.split(' · ')[0]) + '</div>';
    h += '<div class="pcal-event-bar" style="background:' + catColor + '"></div>';
    h += '<div class="pcal-event-info">';
    h += '<div class="pcal-event-title">' + _pcalEscape(event.title) + '</div>';
    h += '<div class="pcal-event-meta">';
    if (!event.allDay) {
      var dur = Math.round((event.endTime - event.startTime) / 60000);
      if (dur > 0) h += '<span>' + _pcalFormatDuration(dur) + '</span>';
    }
    if (event.location) {
      if (h.indexOf('pcal-event-dot') >= 0 || true) h += '<span class="pcal-event-dot">·</span>';
      h += '<span>' + _pcalEscape(event.location) + '</span>';
    }
    h += '</div>';
    h += '</div>';
    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  6. 当天事件列表
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
  //  7. 列表 HTML 主入口
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

    // 月历
    h += '<div class="pcal-month-wrap">';
    h += _pcalBuildMonthGridHTML(ownerCharId, _pcalViewYear, _pcalViewMonth, _pcalSelectedDate);
    h += '</div>';

    // 选中日事件
    h += _pcalBuildDaySectionHTML(ownerCharId, _pcalSelectedDate);

    return h;
  }

  // ══════════════════════════════════════════════
  //  8. 主渲染
  // ══════════════════════════════════════════════
  function _pcalPageRenderer(charName) {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pcalBuildListHTML(ownerCharId);
  }

  // ══════════════════════════════════════════════
  //  9. 注册 renderer
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.calendar = _pcalPageRenderer;
  } else {
    console.warn('[phone-calendar.js] PHONE_APP_RENDERERS 未定义');
  }

  // ══════════════════════════════════════════════
  //  10. 测试挂载
  // ══════════════════════════════════════════════
  window.__pcalTest = {
    buildListHTML: _pcalBuildListHTML,
    renderer: _pcalPageRenderer,
    getEventsForDay: _pcalGetEventsForDay,
    injectFakeData: function(ownerCharId) {
      var oid = ownerCharId || _pmsgOwnerCharId();
      var now = new Date();
      var today = _pcalStartOfDay(now);
      var DAY = 86400000;

      function makeEvent(dateOffset, startHour, startMin, endHour, endMin, title, cat, location, status, isSpecial) {
        var s = new Date(today.getTime() + dateOffset * DAY);
        s.setHours(startHour, startMin, 0, 0);
        var e = new Date(today.getTime() + dateOffset * DAY);
        e.setHours(endHour, endMin, 0, 0);
        return {
          id: 'fake_evt_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
          ownerCharId: oid,
          title: title,
          category: cat,
          location: location || '',
          startTime: s.getTime(),
          endTime: e.getTime(),
          allDay: false,
          status: status || 'upcoming',
          reminder: '',
          isSpecial: !!isSpecial,
          specialType: '',
          note: '',
          thoughts: ''
        };
      }

      function makeAllDay(dateOffset, title, cat, status, isSpecial) {
        var s = new Date(today.getTime() + dateOffset * DAY);
        s.setHours(0, 0, 0, 0);
        var e = new Date(s.getTime() + DAY - 1);
        return {
          id: 'fake_evt_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
          ownerCharId: oid,
          title: title,
          category: cat,
          location: '',
          startTime: s.getTime(),
          endTime: e.getTime(),
          allDay: true,
          status: status || 'upcoming',
          reminder: '',
          isSpecial: !!isSpecial,
          specialType: '',
          note: '',
          thoughts: ''
        };
      }

      var fake = [
        // 今天
        makeEvent(0, 9, 0, 9, 30, 'チームミーティング (团队会议)', 'work', '東京本社 15F', 'ongoing'),
        makeEvent(0, 11, 0, 12, 0, 'Design review', 'work', '会議室 3', 'upcoming'),
        makeEvent(0, 13, 0, 14, 30, '昼食 (午餐)', 'personal', '社員食堂', 'upcoming'),
        makeEvent(0, 15, 0, 17, 0, '取引先と打ち合わせ (与客户会面)', 'work', '丸の内オフィス', 'upcoming'),
        makeEvent(0, 19, 30, 21, 0, 'ジム (健身)', 'health', 'セントラルフィットネス', 'upcoming'),
        // 明天
        makeEvent(1, 8, 30, 9, 0, '歯医者の予約 (牙医预约)', 'appointment', '恵比寿歯科', 'upcoming'),
        makeEvent(1, 10, 0, 11, 0, 'Weekly sync', 'work', 'オンライン', 'upcoming'),
        makeEvent(1, 15, 0, 17, 0, '山田さんとカフェで打ち合わせ (与山田在咖啡馆会面)', 'work', 'ブルーボトル渋谷', 'upcoming'),
        // 后天
        makeEvent(2, 19, 0, 21, 30, '健太と夕食 (和健太吃晚餐)', 'social', '新宿 焼肉店', 'upcoming'),
        // 3 天后
        makeEvent(3, 10, 0, 12, 0, 'Investor call', 'work', 'オンライン', 'upcoming'),
        makeEvent(3, 18, 0, 19, 30, 'ピアノ教室 (钢琴课)', 'hobby', '音楽スタジオ', 'upcoming'),
        // 5 天后
        makeEvent(5, 11, 0, 13, 0, '美術館 (美术馆)', 'hobby', '森美術館', 'upcoming'),
        // 7 天后
        makeAllDay(7, '山田さん誕生日 (山田生日)', 'reminder', 'upcoming', true),
        // 未来 2 周
        makeEvent(10, 14, 0, 16, 0, '京都出張 (京都出差)', 'travel', '東京駅 → 京都駅', 'upcoming'),
        makeEvent(14, 9, 0, 11, 0, 'Quarterly review', 'work', '本社会議室', 'upcoming'),
        // 过去
        makeEvent(-1, 12, 0, 13, 0, 'ランチ (午餐)', 'personal', '近所のカフェ', 'completed'),
        makeEvent(-2, 9, 30, 11, 30, 'プレゼン (演示)', 'work', '本社', 'completed'),
        makeEvent(-3, 19, 0, 21, 0, '友人と食事 (和朋友吃饭)', 'social', '恵比寿のイタリアン', 'completed'),
        makeEvent(-5, 15, 0, 16, 0, 'Canceled meeting', 'work', '', 'cancelled'),
        makeEvent(-7, 10, 0, 12, 0, '読書 (阅读)', 'hobby', '自宅', 'completed'),
        makeEvent(-10, 8, 0, 10, 0, '空港送迎 (机场接送)', 'travel', '羽田空港', 'completed'),
        makeEvent(-12, 20, 0, 23, 0, 'パーティー (派对)', 'social', '六本木', 'completed')
      ];
      state.calendarData = (state.calendarData || []).filter(function(e){
        return e.ownerCharId !== oid;
      });
      fake.forEach(function(e){ state.calendarData.push(e); });
      console.log('[__pcalTest] 已注入 ' + fake.length + ' 个事件到 ownerCharId=' + oid);
      return fake.length;
    },
    clearData: function(ownerCharId) {
      var oid = ownerCharId || _pmsgOwnerCharId();
      var before = (state.calendarData || []).length;
      state.calendarData = (state.calendarData || []).filter(function(e){
        return e.ownerCharId !== oid;
      });
      console.log('[__pcalTest] 清空 ' + (before - state.calendarData.length) + ' 个事件');
    }
  };

  console.log('[phone-calendar.js] 已加载（模块 2）');
})();