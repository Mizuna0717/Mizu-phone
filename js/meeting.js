// ========== meeting.js ==========
// Meeting Scene — UI only (Batch 1)
// No emoji. Line icons. Grey-white palette.

/* ──────────────────────────────────
   Placeholder Session Data
   ────────────────────────────────── */
var mtgSessions = {
  continue: [
    {
      id: 'demo-c1',
      name: 'The Lost Kingdom',
      date: '2024-08-22',
      characters: ['Elena', 'Marcus'],
      mode: 'continue',
      charPerson: 'first',
      userPerson: 'first',
      wc: { min: 100, max: 300 },
      turnSummary: true,
      worldview: '',
      identity: ''
    },
    {
      id: 'demo-c2',
      name: 'Midnight Cafe',
      date: '2024-08-20',
      characters: ['Yuki'],
      mode: 'continue',
      charPerson: 'third',
      userPerson: 'first',
      wc: { min: 150, max: 400 },
      turnSummary: false,
      worldview: '',
      identity: ''
    }
  ],
  'if': [
    {
      id: 'demo-i1',
      name: 'Crossroads',
      date: '2024-08-21',
      characters: ['Alex', 'Sam'],
      mode: 'if',
      charPerson: 'first',
      userPerson: 'second',
      wc: { min: 100, max: 250 },
      turnSummary: true,
      worldview: 'A world where every crossroad reveals a parallel reality.',
      identity: 'A wanderer between dimensions.'
    },
    {
      id: 'demo-i2',
      name: 'The Garden Path',
      date: '2024-08-18',
      characters: ['River'],
      mode: 'if',
      charPerson: 'third',
      userPerson: 'third',
      wc: { min: 200, max: 500 },
      turnSummary: false,
      worldview: 'An enchanted garden that reshapes itself based on emotions.',
      identity: ''
    }
  ]
};

var mtgCurrentTab = 'continue';
var mtgCurrentSession = null;

/* ──────────────────────────────────
   Utilities
   ────────────────────────────────── */
function mtgEsc(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function mtgFormatDate(ds) {
  var d = new Date(ds);
  if (isNaN(d.getTime())) return ds;
  if (typeof state !== 'undefined' && state.lang === 'zh') {
    return (d.getMonth() + 1) + '\u6708' + d.getDate() + '\u65e5';
  }
  var m = ['January','February','March','April','May','June',
           'July','August','September','October','November','December'];
  return m[d.getMonth()] + ' ' + d.getDate();
}

function mtgPersonLabel(val) {
  if (val === 'first')  return T('meetingFirstPerson');
  if (val === 'second') return T('meetingSecondPerson');
  if (val === 'third')  return T('meetingThirdPerson');
  return val;
}

/* ──────────────────────────────────
   Tab Switching
   ────────────────────────────────── */
function switchMeetingTab(tab) {
  mtgCurrentTab = tab;
  document.querySelectorAll('#meetingTabs .mtg-tab').forEach(function (el) {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  var sc = document.getElementById('meetingSectionContinue');
  var si = document.getElementById('meetingSectionIF');
  if (sc) sc.style.display = tab === 'continue' ? '' : 'none';
  if (si) si.style.display = tab === 'if' ? '' : 'none';
}

/* ──────────────────────────────────
   Render Session Cards
   ────────────────────────────────── */
function renderMeetingCards() {
  mtgRenderList('continue', 'meetingContinueCards');
  mtgRenderList('if', 'meetingIFCards');
}

function mtgRenderList(mode, cid) {
  var c = document.getElementById(cid);
  if (!c) return;
  var list = mtgSessions[mode] || [];

  if (list.length === 0) {
    c.innerHTML =
      '<div class="mtg-empty">' +
        '<svg viewBox="0 0 44 44" style="width:40px;height:40px;stroke:#d1d1d6;fill:none;stroke-width:1">' +
          '<rect x="8" y="4" width="28" height="36" rx="3"/>' +
          '<path d="M14 14h16M14 20h12M14 26h8"/>' +
        '</svg>' +
        '<div>' + T('meetingNoSessions') + '</div>' +
        '<div class="mtg-empty-sub">' + T('meetingCreateFirst') + '</div>' +
      '</div>';
    return;
  }

  var colors = ['#8e8e93','#b0b0b5','#c7c7cc','#d1d1d6'];
  var h = '<div style="background:#fff;border-radius:14px;overflow:hidden;border:1px solid #ececec;box-shadow:0 1px 4px rgba(0,0,0,.03)">';

  list.forEach(function (s, i) {
    var last = i === list.length - 1;
    var clr = colors[i % colors.length];
    var dl = mtgFormatDate(s.date);
    var cl = s.characters.length ? s.characters.join(', ') : T('meetingNoCharsSelected');

    h += '<div style="display:flex;align-items:center;padding:14px 16px;gap:14px;cursor:pointer' +
         (last ? '' : ';border-bottom:1px solid #f2f2f7') +
         '" onclick="openMeetingWrite(\'' + s.id + '\')">';

    // accent bar
    h += '<div style="width:4px;height:40px;border-radius:2px;background:' + clr + ';flex-shrink:0"></div>';

    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:15px;font-weight:500;color:#1d1d1f">' + mtgEsc(s.name) + '</div>';
    // date
    h += '<div style="font-size:12px;color:#8e8e93;margin-top:3px;display:flex;align-items:center;gap:6px">';
    h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4;flex-shrink:0">' +
         '<rect x="1.5" y="2.5" width="11" height="9" rx="1"/>' +
         '<path d="M4.5 1v3M9.5 1v3M1.5 5.5h11"/></svg>';
    h += '<span>' + dl + '</span></div>';
    // characters
    h += '<div style="font-size:11px;color:#b0b0b5;margin-top:4px;display:flex;align-items:center;gap:6px">';
    h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#b0b0b5;fill:none;stroke-width:1.4;flex-shrink:0">' +
         '<circle cx="7" cy="5" r="2.5"/>' +
         '<path d="M2.5 13c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/></svg>';
    h += '<span>' + mtgEsc(cl) + '</span></div>';
    h += '</div>';

    // chevron
    h += '<svg viewBox="0 0 8 14" style="width:8px;height:14px;flex-shrink:0"><path d="M1 1l6 6-6 6" stroke="#c7c7cc" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    h += '</div>';
  });

  h += '</div>';
  c.innerHTML = h;
}

/* ──────────────────────────────────
   Settings Page (Independent Screen)
   ────────────────────────────────── */
function openMeetingSettings() {
  // reset form
  var nameEl = document.getElementById('mtgSetSessionName');
  if (nameEl) nameEl.value = '';

  // sync mode seg with current tab
  var modeSeg = document.getElementById('mtgSetModeSeg');
  if (modeSeg) {
    modeSeg.querySelectorAll('.mtg-seg-opt').forEach(function (el) {
      el.classList.toggle('active', el.dataset.value === mtgCurrentTab);
    });
  }

  // reset perspectives to first person
  var charSeg = document.getElementById('mtgSetCharPersonSeg');
  if (charSeg) {
    charSeg.querySelectorAll('.mtg-seg-opt').forEach(function (el) {
      el.classList.toggle('active', el.dataset.value === 'first');
    });
  }
  var userSeg = document.getElementById('mtgSetUserPersonSeg');
  if (userSeg) {
    userSeg.querySelectorAll('.mtg-seg-opt').forEach(function (el) {
      el.classList.toggle('active', el.dataset.value === 'first');
    });
  }

  // reset word count
  var wcMin = document.getElementById('mtgSetWcMin');
  var wcMax = document.getElementById('mtgSetWcMax');
  if (wcMin) wcMin.value = '100';
  if (wcMax) wcMax.value = '300';

  // reset toggle
  var ts = document.getElementById('mtgSetToggleSummary');
  if (ts) ts.classList.remove('active');

  // reset worldview / identity
  var wvEl = document.getElementById('mtgSetWorldview');
  if (wvEl) wvEl.value = '';
  var idEl = document.getElementById('mtgSetIdentity');
  if (idEl) idEl.value = '';

  // render character checkboxes
  mtgSetRenderCharSelect();

  // apply IF-only visibility
  mtgSetModeChanged();

  // navigate to settings page
  nav('screen-meeting-settings');
}

function exitMeetingSettings() {
  nav('screen-meeting');
}

function mtgSetRenderCharSelect() {
  var c = document.getElementById('mtgSetCharSelect');
  if (!c) return;
  var chars = (typeof state !== 'undefined' && state.chars) ? state.chars : [];

  if (chars.length === 0) {
    c.innerHTML = '<div class="mtg-char-empty">' + T('meetingNoCharsAvail') + '</div>';
    return;
  }

  c.innerHTML = chars.map(function (ch) {
    return '<label class="mtg-char-item">' +
      '<input type="checkbox" class="mtg-set-char-check" value="' + ch.id + '">' +
      '<span class="mtg-char-checkmark"></span>' +
      '<span class="mtg-char-name">' + mtgEsc(ch.name) + '</span>' +
      '</label>';
  }).join('');
}

function mtgSetToggleSeg(el) {
  var p = el.parentElement;
  if (!p) return;
  p.querySelectorAll('.mtg-seg-opt').forEach(function (o) {
    o.classList.toggle('active', o === el);
  });
}

/* ── IF-only field visibility ── */
function mtgSetModeChanged() {
  var modeEl = document.querySelector('#mtgSetModeSeg .mtg-seg-opt.active');
  var mode = modeEl ? modeEl.dataset.value : 'continue';
  var isIF = mode === 'if';

  document.querySelectorAll('.mtg-set-if-only').forEach(function (el) {
    if (isIF) {
      el.style.display = '';
      el.classList.remove('mtg-set-hidden');
      el.classList.add('mtg-set-visible');
    } else {
      el.classList.remove('mtg-set-visible');
      el.classList.add('mtg-set-hidden');
      // after animation, hide
      setTimeout(function () {
        if (el.classList.contains('mtg-set-hidden')) {
          el.style.display = 'none';
        }
      }, 320);
    }
  });
}

/* ── Legacy seg toggle (kept for compatibility) ── */
function mtgToggleSeg(el) {
  mtgSetToggleSeg(el);
}

/* ──────────────────────────────────
   Start Session
   ────────────────────────────────── */
function startMeetingSession() {
  var nameEl = document.getElementById('mtgSetSessionName');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) {
    showToast(T('meetingNameRequired'));
    if (nameEl) nameEl.focus();
    return;
  }

  // read mode
  var modeEl = document.querySelector('#mtgSetModeSeg .mtg-seg-opt.active');
  var mode = modeEl ? modeEl.dataset.value : mtgCurrentTab;

  // read character perspective
  var charPersonEl = document.querySelector('#mtgSetCharPersonSeg .mtg-seg-opt.active');
  var charPerson = charPersonEl ? charPersonEl.dataset.value : 'first';

  // read user perspective
  var userPersonEl = document.querySelector('#mtgSetUserPersonSeg .mtg-seg-opt.active');
  var userPerson = userPersonEl ? userPersonEl.dataset.value : 'first';

  // read word count
  var wcMin = parseInt(document.getElementById('mtgSetWcMin').value) || 100;
  var wcMax = parseInt(document.getElementById('mtgSetWcMax').value) || 300;

  // read selected characters
  var selChars = [];
  document.querySelectorAll('.mtg-set-char-check:checked').forEach(function (cb) {
    if (typeof state !== 'undefined' && state.chars) {
      var ch = state.chars.find(function (c) { return c.id === cb.value; });
      if (ch) selChars.push(ch.name);
    }
  });

  // read turn summary
  var summaryEl = document.getElementById('mtgSetToggleSummary');
  var summary = summaryEl ? summaryEl.classList.contains('active') : false;

  // read worldview / identity (only meaningful for IF)
  var wv = '';
  var ident = '';
  if (mode === 'if') {
    var wvEl = document.getElementById('mtgSetWorldview');
    wv = wvEl ? wvEl.value.trim() : '';
    var idEl = document.getElementById('mtgSetIdentity');
    ident = idEl ? idEl.value.trim() : '';
  }

  var now = new Date();
  var session = {
    id: 'session-' + Date.now(),
    name: name,
    date: now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0'),
    characters: selChars,
    mode: mode,
    charPerson: charPerson,
    userPerson: userPerson,
    wc: { min: wcMin, max: wcMax },
    turnSummary: summary,
    worldview: wv,
    identity: ident
  };

  if (!mtgSessions[mode]) mtgSessions[mode] = [];
  mtgSessions[mode].unshift(session);

  // switch tab and render
  mtgCurrentTab = mode;
  switchMeetingTab(mode);
  renderMeetingCards();

  // go to writing page
  openMeetingWrite(session.id);
}

/* ──────────────────────────────────
   Writing Screen
   ────────────────────────────────── */
function openMeetingWrite(sid) {
  var session = null;
  ['continue', 'if'].forEach(function (m) {
    (mtgSessions[m] || []).forEach(function (s) {
      if (s.id === sid) session = s;
    });
  });
  if (!session) { showToast(T('error')); return; }
  mtgCurrentSession = session;

  var titleEl = document.getElementById('meetingWriteTitle');
  if (titleEl) titleEl.textContent = session.name;

  mtgRenderWriteContent(session);
  nav('screen-meeting-write');
}

function exitMeetingWrite() {
  mtgCurrentSession = null;
  nav('screen-meeting');
}

function mtgRenderWriteContent(s) {
  var body = document.getElementById('meetingWriteBody');
  if (!body) return;

  var modeL = s.mode === 'continue' ? T('meetingContinue') : T('meetingIF');
  var charPersonL = mtgPersonLabel(s.charPerson);
  var userPersonL = mtgPersonLabel(s.userPerson);

  var h = '';

  // info bar
  h += '<div class="mtg-write-info">';
  h += '<div class="mtg-write-info-row">';
  h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4">' +
       '<rect x="1.5" y="2.5" width="11" height="9" rx="1"/>' +
       '<path d="M4.5 1v3M9.5 1v3M1.5 5.5h11"/></svg>';
  h += '<span>' + mtgFormatDate(s.date) + '</span></div>';

  h += '<div class="mtg-write-info-row">';
  h += '<span class="mtg-write-tag">' + modeL + '</span>';
  h += '<span class="mtg-write-tag">' + T('meetingCharPerspectiveShort') + ': ' + charPersonL + '</span>';
  h += '<span class="mtg-write-tag">' + T('meetingUserPerspectiveShort') + ': ' + userPersonL + '</span>';
  h += '<span class="mtg-write-tag">' + s.wc.min + '-' + s.wc.max + ' ' + T('meetingWords') + '</span>';
  h += '</div>';

  if (s.characters.length) {
    h += '<div class="mtg-write-info-row">';
    h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4">' +
         '<circle cx="7" cy="5" r="2.5"/>' +
         '<path d="M2.5 13c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/></svg>';
    h += '<span>' + s.characters.join(', ') + '</span></div>';
  }

  // worldview / identity for IF mode
  if (s.mode === 'if') {
    if (s.worldview) {
      h += '<div class="mtg-write-info-row">';
      h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4">' +
           '<circle cx="7" cy="7" r="5.5"/><path d="M2 7h10M7 1.5c-2 2-2 9 0 11M7 1.5c2 2 2 9 0 11"/></svg>';
      h += '<span style="color:#b0b0b5">' + mtgEsc(s.worldview) + '</span></div>';
    }
    if (s.identity) {
      h += '<div class="mtg-write-info-row">';
      h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4">' +
           '<rect x="2" y="3" width="10" height="8" rx="1.5"/><path d="M5 7h4M7 5v4"/></svg>';
      h += '<span style="color:#b0b0b5">' + mtgEsc(s.identity) + '</span></div>';
    }
  }

  h += '</div>';

  // story content
  h += '<div class="mtg-write-content" id="mtgWriteContent">';

  if (s.id.indexOf('demo-') === 0) {
    h += '<div class="mtg-write-entry mtg-write-entry-system">' +
           '<div class="mtg-write-entry-label">' + T('meetingSystem') + '</div>' +
           '<div class="mtg-write-entry-text">' + T('meetingDemoIntro') + '</div>' +
         '</div>';
    h += '<div class="mtg-write-entry mtg-write-entry-char">' +
           '<div class="mtg-write-entry-label">' + (s.characters[0] || 'Character') + '</div>' +
           '<div class="mtg-write-entry-text">' + T('meetingDemoChar') + '</div>' +
         '</div>';
    h += '<div class="mtg-write-entry mtg-write-entry-user">' +
           '<div class="mtg-write-entry-label">' + T('meetingYou') + '</div>' +
           '<div class="mtg-write-entry-text">' + T('meetingDemoUser') + '</div>' +
         '</div>';
  } else {
    h += '<div class="mtg-write-empty">' +
           '<svg viewBox="0 0 44 44" style="width:36px;height:36px;stroke:#d1d1d6;fill:none;stroke-width:1">' +
             '<path d="M30 6l8 8-20 20H10v-8z"/><path d="M26 10l8 8"/>' +
           '</svg>' +
           '<div>' + T('meetingBeginStory') + '</div>' +
         '</div>';
  }

  h += '</div>';
  body.innerHTML = h;
}

function meetingWriteSend() {
  var inp = document.getElementById('meetingWriteInput');
  if (!inp) return;
  var text = inp.value.trim();
  if (!text) return;

  var content = document.getElementById('mtgWriteContent');
  if (content) {
    var empty = content.querySelector('.mtg-write-empty');
    if (empty) empty.remove();

    var entry = document.createElement('div');
    entry.className = 'mtg-write-entry mtg-write-entry-user';
    entry.innerHTML =
      '<div class="mtg-write-entry-label">' + T('meetingYou') + '</div>' +
      '<div class="mtg-write-entry-text">' + mtgEsc(text) + '</div>';
    content.appendChild(entry);

    var body = document.getElementById('meetingWriteBody');
    if (body) body.scrollTop = body.scrollHeight;
  }

  inp.value = '';
  showToast(T('meetingUiOnly'));
}

/* ──────────────────────────────────
   Init — called from nav()
   ────────────────────────────────── */
function initMeetingPage() {
  switchMeetingTab(mtgCurrentTab);
  renderMeetingCards();
}
