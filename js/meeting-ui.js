// ========== meeting-ui.js ==========
// Meeting UI — UI 渲染與頁面導航
// requires: meeting-core.js (mtgEsc, mtgFormatDateTime, mtgFormatTime, mtgGetCharAvatar, mtgGetUserAvatar, mtgGetCharById, mtgEnsureState, mtgFindSession, mtgEnsureMemoryFields, mtgCountUnsummarizedTurns, mtgUid, state globals)
// requires: meeting-memory.js (mtgGenerateInitialScene — indirectly via openMeetingWrite triggering setTimeout)

/* ══════════════════════════════════
   Segmented Control Toggle
   ══════════════════════════════════ */
function mtgSegToggle(el) {
  var p = el.parentElement;
  if (!p) return;
  p.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o === el);
  });
}

/* ══════════════════════════════════
   Character Select Renderer
   ══════════════════════════════════ */
function mtgRenderCharSelectList(containerId, selectedIds) {
  var c = document.getElementById(containerId);
  if (!c) return;
  var chars = (typeof state !== 'undefined' && Array.isArray(state.characters)) ? state.characters : [];

  if (chars.length === 0) {
    c.innerHTML = '<div class="mtg-char-empty-msg">' + T('meetingNoCharsAvail') + '</div>';
    return;
  }

  var sel = selectedIds || [];
  c.innerHTML = chars.map(function(ch) {
    var checked = sel.indexOf(ch.id) >= 0 ? 'checked' : '';
    var avatarHtml;
    if (ch.avatar) {
      avatarHtml = '<div class="mtg-char-select-avatar"><img src="' + ch.avatar + '" alt=""></div>';
    } else {
      avatarHtml = '<div class="mtg-char-select-avatar"><div class="mtg-msg-avatar-placeholder"><svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg></div></div>';
    }
    return '<label class="mtg-char-select-item">' +
      '<input type="checkbox" class="mtg-char-check" value="' + ch.id + '" ' + checked + '>' +
      '<span class="mtg-char-select-check"></span>' +
      avatarHtml +
      '<span class="mtg-char-select-name">' + mtgEsc(ch.name) + '</span></label>';
  }).join('');
}


/* ══════════════════════════════════
   Archive Card HTML Builder (shared)
   ══════════════════════════════════ */
function _mtgArchiveCardHTML(s) {
  var charNames = (s.characters && s.characters.length) ? s.characters.join(', ') : T('meetingNoCharsSelected');
  var dateStr = mtgFormatDateTime(s.date || s.createdAt);
  var isEnded = s.status === 'ended';

  var h = '<div class="mtg-archive-card">';
  h += '<div class="mtg-archive-card-body" onclick="openMeetingWrite(\'' + s.id + '\')">';
  h += '<div class="mtg-archive-card-name">' + mtgEsc(s.name) + '</div>';
  h += '<div class="mtg-archive-card-info">';
  h += '<div class="mtg-archive-info-row">';
  h += '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg>';
  h += '<span>' + mtgEsc(charNames) + '</span>';
  h += '</div>';
  h += '<div class="mtg-archive-info-row">';
  h += '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 1.5v3M11 1.5v3M2 6.5h12"/></svg>';
  h += '<span>' + dateStr + '</span>';

  if (isEnded) {
    h += '<span style="margin-left:auto;color:#c7c7cc;font-size:11px">';
    h += '<span class="mtg-status-dot mtg-status-dot-ended"></span>' + T('meetingStatusEnded');
    h += '</span>';
  } else {
    h += '<span style="margin-left:auto;color:#86868b;font-size:11px">';
    h += '<span class="mtg-status-dot mtg-status-dot-active"></span>' + T('meetingStatusActive');
    h += '</span>';
  }

  h += '</div></div></div>';
  h += '<div class="mtg-archive-actions">';
  h += '<button class="mtg-archive-action-btn" onclick="event.stopPropagation();mtgOpenSettingsForArchive(\'' + s.id + '\')">';
  h += '<svg viewBox="0 0 16 16"><path d="M10 2l4 4M3 9l7-7 4 4-7 7H3V9z"/></svg>';
  h += '<span>' + T('meetingEdit') + '</span></button>';
  h += '<button class="mtg-archive-action-btn" onclick="event.stopPropagation();mtgDeleteArchive(\'' + s.id + '\')">';
  h += '<svg viewBox="0 0 16 16"><path d="M3 4h10"/><path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1"/><path d="M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>';
  h += '<span>' + T('meetingDelete') + '</span></button>';
  h += '</div></div>';
  return h;
}


/* ══════════════════════════════════
   Group Header HTML Builder
   ══════════════════════════════════ */
function _mtgGroupHeaderHTML(mode) {
  var label, iconSvg;
  if (mode === 'continue') {
    label = T('meetingContinue');
    iconSvg = '<svg viewBox="0 0 16 16"><path d="M3 13V3h7l3 3v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M10 3v3h3"/><path d="M6 9h4M6 11h2"/></svg>';
  } else {
    label = T('meetingIF');
    iconSvg = '<svg viewBox="0 0 16 16"><circle cx="8" cy="2.5" r="1.5"/><path d="M8 4v3"/><path d="M4.5 9.5L8 7l3.5 2.5"/><path d="M4.5 9.5v3"/><path d="M11.5 9.5v3"/></svg>';
  }
  return '<div class="mtg-group-header">' + iconSvg + '<span>' + label + '</span></div>';
}


/* ══════════════════════════════════
   1. MAIN PAGE — Archive List
   ══════════════════════════════════ */
function mtgRenderArchiveList() {
  var container = document.getElementById('meetingArchiveList');
  if (!container) return;
  mtgEnsureState();
  var list = state.meetings;

  if (!list || list.length === 0) {
    container.innerHTML =
      '<div class="mtg-empty-state">' +
        '<svg viewBox="0 0 48 48" style="width:48px;height:48px;stroke:#d1d1d6;fill:none;stroke-width:1">' +
          '<rect x="8" y="6" width="32" height="36" rx="4"/>' +
          '<path d="M16 16h16M16 22h12M16 28h8"/>' +
        '</svg>' +
        '<div class="mtg-empty-state-title">' + T('meetingNoArchives') + '</div>' +
        '<div class="mtg-empty-state-sub">' + T('meetingNoArchivesSub') + '</div>' +
      '</div>';
    return;
  }

  var continueList = list.filter(function(s) { return s.mode === 'continue'; });
  var ifList = list.filter(function(s) { return s.mode === 'if'; });
  var h = '';
  if (continueList.length > 0) {
    h += _mtgGroupHeaderHTML('continue');
    continueList.forEach(function(s) { h += _mtgArchiveCardHTML(s); });
  }
  if (ifList.length > 0) {
    h += _mtgGroupHeaderHTML('if');
    ifList.forEach(function(s) { h += _mtgArchiveCardHTML(s); });
  }
  container.innerHTML = h;
}


/* ══════════════════════════════════
   2. NEW ARCHIVE PAGE
   ══════════════════════════════════ */
function openMeetingNewArchive() {
  var el = document.getElementById('mtgNewName');
  if (el) el.value = '';

  var modeSeg = document.getElementById('mtgNewModeSeg');
  if (modeSeg) modeSeg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o.dataset.value === 'continue');
  });

  ['mtgNewCharPersonSeg','mtgNewUserPersonSeg'].forEach(function(id) {
    var seg = document.getElementById(id);
    if (seg) seg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
      o.classList.toggle('active', o.dataset.value === 'first');
    });
  });

  var wcMin = document.getElementById('mtgNewWcMin');
  var wcMax = document.getElementById('mtgNewWcMax');
  if (wcMin) wcMin.value = '100';
  if (wcMax) wcMax.value = '300';

  var ts = document.getElementById('mtgNewToggleSummary');
  if (ts) ts.classList.remove('active');
  var iw = document.getElementById('mtgNewSummaryIntervalWrap');
  if (iw) iw.style.display = 'none';
  var iv = document.getElementById('mtgNewSummaryInterval');
  if (iv) iv.value = '5';

  var cc = document.getElementById('mtgNewContextCount');
  if (cc) cc.value = '50';

  var wv = document.getElementById('mtgNewWorldview');
  if (wv) wv.value = '';
  var ident = document.getElementById('mtgNewIdentity');
  if (ident) ident.value = '';

  mtgRenderCharSelectList('mtgNewCharList', []);
  mtgNewModeChanged();
  nav('screen-meeting-new');
}

function exitMeetingNew() { nav('screen-meeting'); }

function mtgNewModeChanged() {
  var modeEl = document.querySelector('#mtgNewModeSeg .mtg-seg-opt.active');
  var isIF = modeEl && modeEl.dataset.value === 'if';
  ['mtgNewWorldviewWrap', 'mtgNewIdentityWrap'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = isIF ? '' : 'none';
  });
}

function mtgSettingsSummaryToggled() {
  var toggle = document.getElementById('mtgSettingsToggleSummary');
  var wrap = document.getElementById('mtgSettingsSummaryIntervalWrap');
  if (toggle) {
    toggle.classList.toggle('active');
    console.log('[Meeting-Fix] Settings turnSummary toggled to:', toggle.classList.contains('active'));
  }
  if (toggle && wrap) wrap.style.display = toggle.classList.contains('active') ? '' : 'none';
}


function mtgCreateArchive() {
  var nameEl = document.getElementById('mtgNewName');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast(T('meetingNameRequired')); if (nameEl) nameEl.focus(); return; }

  var modeEl = document.querySelector('#mtgNewModeSeg .mtg-seg-opt.active');
  var mode = modeEl ? modeEl.dataset.value : 'continue';

  var cpEl = document.querySelector('#mtgNewCharPersonSeg .mtg-seg-opt.active');
  var charPerson = cpEl ? cpEl.dataset.value : 'first';

  var upEl = document.querySelector('#mtgNewUserPersonSeg .mtg-seg-opt.active');
  var userPerson = upEl ? upEl.dataset.value : 'first';

  var wcMin = parseInt((document.getElementById('mtgNewWcMin') || {}).value) || 100;
  var wcMax = parseInt((document.getElementById('mtgNewWcMax') || {}).value) || 300;

  var selCharIds = [];
  var selCharNames = [];
  document.querySelectorAll('#mtgNewCharList .mtg-char-check:checked').forEach(function(cb) {
    var ch = (state.characters || []).find(function(c) { return c.id === cb.value; });
    if (ch) { selCharIds.push(ch.id); selCharNames.push(ch.name); }
  });

  var tsEl = document.getElementById('mtgNewToggleSummary');
  var turnSummary = tsEl ? tsEl.classList.contains('active') : false;
  var summaryInterval = parseInt((document.getElementById('mtgNewSummaryInterval') || {}).value) || MTG_DEFAULT_SUMMARY_INTERVAL;
  var contextCount = parseInt((document.getElementById('mtgNewContextCount') || {}).value) || 50;

  var wv = '', ident = '';
  if (mode === 'if') {
    wv = (document.getElementById('mtgNewWorldview') || {}).value || '';
    ident = (document.getElementById('mtgNewIdentity') || {}).value || '';
  }

  var now = new Date();
  var session = {
    id: mtgUid(),
    name: name,
    date: now.toISOString(),
    createdAt: now.toISOString(),
    characters: selCharNames,
    charIds: selCharIds,
    mode: mode,
    charPerson: charPerson,
    userPerson: userPerson,
    wc: { min: wcMin, max: wcMax },
    turnSummary: turnSummary,
    summaryInterval: summaryInterval,
    contextCount: contextCount,
    worldview: wv.trim(),
    identity: ident.trim(),
    history: [],
    turnCount: 0,
    status: 'active',
    shortTermMemory: [],
    shortTermMemories: [],
    lastSummarizedEntryIdx: 0,
    consolidateThreshold: MTG_MEM_CONSOLIDATE_THRESHOLD
  };

  mtgEnsureState();
  state.meetings.unshift(session);
  saveState();

  console.log('[Meeting-Memory] Archive created:', session.id,
    '| turnSummary:', turnSummary, '| interval:', summaryInterval);

  showToast(T('meetingArchiveCreated'));
  mtgRenderArchiveList();
  nav('screen-meeting');
}


/* ══════════════════════════════════
   3. MANAGE ARCHIVES PAGE
   ══════════════════════════════════ */
function openMeetingManage() {
  mtgRenderManageList();
  nav('screen-meeting-manage');
}

function exitMeetingManage() {
  var writing = mtgCurrentSession ? 'screen-meeting-write' : 'screen-meeting';
  if (writing === 'screen-meeting') mtgRenderArchiveList();
  nav(writing);
}

function mtgRenderManageList() {
  var container = document.getElementById('mtgManageArchiveList');
  if (!container) return;
  mtgEnsureState();
  var list = state.meetings;

  if (!list || list.length === 0) {
    container.innerHTML =
      '<div class="mtg-empty-state">' +
        '<svg viewBox="0 0 48 48" style="width:48px;height:48px;stroke:#d1d1d6;fill:none;stroke-width:1">' +
          '<rect x="8" y="6" width="32" height="36" rx="4"/>' +
          '<path d="M16 16h16M16 22h12M16 28h8"/>' +
        '</svg>' +
        '<div class="mtg-empty-state-title">' + T('meetingNoArchives') + '</div>' +
      '</div>';
    return;
  }

  var h = '';
  list.forEach(function(s) {
    var charNames = (s.characters && s.characters.length) ? s.characters.join(', ') : T('meetingNoCharsSelected');
    var dateStr = mtgFormatDateTime(s.date || s.createdAt);
    h += '<div class="mtg-manage-card">';
    h += '<div class="mtg-manage-card-name">' + mtgEsc(s.name) + '</div>';
    h += '<div class="mtg-manage-card-info">';
    h += '<div class="mtg-manage-info-row">';
    h += '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg>';
    h += '<span>' + mtgEsc(charNames) + '</span></div>';
    h += '<div class="mtg-manage-info-row">';
    h += '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 1.5v3M11 1.5v3M2 6.5h12"/></svg>';
    h += '<span>' + dateStr + '</span></div>';
    h += '</div></div>';
  });
  container.innerHTML = h;
}


/* ══════════════════════════════════
   4. ARCHIVE SETTINGS PAGE
   ══════════════════════════════════ */
function mtgOpenSettingsForArchive(id) {
  var session = mtgFindSession(id);
  if (!session) { showToast(T('error')); return; }
  mtgCurrentSession = session;
  mtgSettingsReturnTo = 'screen-meeting';
  mtgFillSettingsPage(session);
  nav('screen-meeting-settings');
}

function openMeetingSettingsFromWrite() {
  if (!mtgCurrentSession) { showToast(T('error')); return; }
  mtgSettingsReturnTo = 'screen-meeting-write';
  mtgFillSettingsPage(mtgCurrentSession);
  nav('screen-meeting-settings');
}

function mtgFillSettingsPage(s) {
  var nameEl = document.getElementById('mtgSettingsName');
  if (nameEl) nameEl.value = s.name || '';

  mtgRenderCharSelectList('mtgSettingsCharList', s.charIds || []);

  var cpSeg = document.getElementById('mtgSettingsCharPersonSeg');
  if (cpSeg) cpSeg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o.dataset.value === s.charPerson);
  });

  var upSeg = document.getElementById('mtgSettingsUserPersonSeg');
  if (upSeg) upSeg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o.dataset.value === s.userPerson);
  });

  var wcMin = document.getElementById('mtgSettingsWcMin');
  if (wcMin) wcMin.value = s.wc ? s.wc.min : 100;
  var wcMax = document.getElementById('mtgSettingsWcMax');
  if (wcMax) wcMax.value = s.wc ? s.wc.max : 300;

  var intEl = document.getElementById('mtgSettingsSummaryInterval');
  if (intEl) intEl.value = s.summaryInterval || MTG_DEFAULT_SUMMARY_INTERVAL;

  var ccEl = document.getElementById('mtgSettingsContextCount');
  if (ccEl) ccEl.value = s.contextCount || 50;

  // ★★★ 修复 Bug 1：回填 turnSummary 开关状态 ★★★
  var tsToggle = document.getElementById('mtgSettingsToggleSummary');
  if (tsToggle) {
    tsToggle.classList.toggle('active', !!s.turnSummary);
    console.log('[Meeting-Fix] Settings page loaded turnSummary:', !!s.turnSummary);
  }
  var siWrap = document.getElementById('mtgSettingsSummaryIntervalWrap');
  if (siWrap) {
    siWrap.style.display = s.turnSummary ? '' : 'none';
  }

  mtgRenderSettingsMemory();
}


function mtgRenderSettingsMemory() {
  var c = document.getElementById('mtgSettingsMemoryList');
  if (!c || !mtgCurrentSession) return;

  mtgEnsureMemoryFields(mtgCurrentSession);
  var mems = mtgCurrentSession.shortTermMemories;

  if (!mems || mems.length === 0) {
    var unsumm = mtgCountUnsummarizedTurns(mtgCurrentSession);
    var hint = T('meetingNoMemories');
    if (unsumm > 0) {
      hint += '<br><span style="font-size:11px;color:#c7c7cc">' + unsumm +
        (state.lang === 'zh' ? ' \u8f6e\u5f85\u603b\u7ed3' : ' turns pending') + '</span>';
    }
    c.innerHTML = '<div class="mtg-form-card" style="padding:24px;text-align:center;color:#86868b;font-size:14px">' + hint + '</div>';
    return;
  }

  var h = '';
  mems.forEach(function(m, idx) {
    var written = m._writtenToLibrary;
    h += '<div class="mtg-mem-card" style="border-left:3px solid ' + (written ? '#34c759' : '#007aff') + '">';
    h += '<div class="mtg-mem-round">';
    h += T('meetingSummaryRound') + ' ' + (idx + 1);
    if (written) h += ' <span style="font-size:10px;color:#34c759">\u2713</span>';
    h += '</div>';
    h += '<div class="mtg-mem-text">' + mtgEsc(m.content) + '</div>';
    if (m.date) h += '<div style="font-size:10px;color:#c7c7cc;margin-top:4px">' + m.date + '</div>';
    h += '</div>';
  });

  var unsummarizedTurns = mtgCountUnsummarizedTurns(mtgCurrentSession);
  h += '<div style="text-align:center;padding:8px;font-size:11px;color:#8e8e93">';
  h += mems.length + (state.lang === 'zh' ? ' \u6761\u77ed\u671f\u8bb0\u5fc6' : ' short-term memories');
  if (unsummarizedTurns > 0) {
    h += ' \u00b7 ' + unsummarizedTurns + (state.lang === 'zh' ? ' \u8f6e\u5f85\u603b\u7ed3' : ' turns pending');
  }
  h += '</div>';

  c.innerHTML = h;
}

function exitMeetingSettings() {
  var returnTo = mtgSettingsReturnTo || 'screen-meeting';
  if (returnTo === 'screen-meeting') mtgRenderArchiveList();
  nav(returnTo);
}

function mtgSaveSettings() {
  var s = mtgCurrentSession;
  if (!s) return;

  var nameEl = document.getElementById('mtgSettingsName');
  if (nameEl && nameEl.value.trim()) s.name = nameEl.value.trim();

  var selCharIds = [];
  var selCharNames = [];
  document.querySelectorAll('#mtgSettingsCharList .mtg-char-check:checked').forEach(function(cb) {
    var ch = (state.characters || []).find(function(c) { return c.id === cb.value; });
    if (ch) { selCharIds.push(ch.id); selCharNames.push(ch.name); }
  });
  s.charIds = selCharIds;
  s.characters = selCharNames;

  var cpEl = document.querySelector('#mtgSettingsCharPersonSeg .mtg-seg-opt.active');
  if (cpEl) s.charPerson = cpEl.dataset.value;
  var upEl = document.querySelector('#mtgSettingsUserPersonSeg .mtg-seg-opt.active');
  if (upEl) s.userPerson = upEl.dataset.value;

  s.wc = s.wc || {};
  s.wc.min = parseInt((document.getElementById('mtgSettingsWcMin') || {}).value) || 100;
  s.wc.max = parseInt((document.getElementById('mtgSettingsWcMax') || {}).value) || 300;
  s.summaryInterval = parseInt((document.getElementById('mtgSettingsSummaryInterval') || {}).value) || MTG_DEFAULT_SUMMARY_INTERVAL;
  s.contextCount = parseInt((document.getElementById('mtgSettingsContextCount') || {}).value) || 50;

  // ★★★ 修复 Bug 1：保存 turnSummary 开关状态 ★★★
  var tsToggle = document.getElementById('mtgSettingsToggleSummary');
  if (tsToggle) {
    s.turnSummary = tsToggle.classList.contains('active');
    console.log('[Meeting-Fix] turnSummary saved:', s.turnSummary);
  }

  saveState();
  showToast(T('meetingSaveChanges'));

  if (mtgSettingsReturnTo === 'screen-meeting-write') {
    var titleEl = document.getElementById('meetingWriteTitle');
    if (titleEl) titleEl.textContent = s.name;
    var charEl = document.getElementById('meetingWriteCharName');
    if (charEl) charEl.textContent = s.characters.join(', ');
  }
  exitMeetingSettings();
}


/* ══════════════════════════════════
   Delete Archive
   ══════════════════════════════════ */
function mtgDeleteArchive(id) {
  if (!confirm(T('meetingDeleteConfirm'))) return;
  mtgEnsureState();
  state.meetings = state.meetings.filter(function(s) { return s.id !== id; });
  if (mtgCurrentSession && mtgCurrentSession.id === id) mtgCurrentSession = null;
  saveState();
  mtgRenderArchiveList();
  mtgRenderManageList();
  showToast(T('meetingDeleted'));
}


/* ══════════════════════════════════
   5. CHAT SCREEN (Writing)
   ══════════════════════════════════ */
function openMeetingWrite(sid) {
  var session = mtgFindSession(sid);
  if (!session) { showToast(T('error')); return; }

  if (session.status === 'ended') {
    session.status = 'active';
    saveState();
  }

  mtgCurrentSession = session;
  mtgEditingEntryId = null;
  mtgEnsureMemoryFields(session);

  var titleEl = document.getElementById('meetingWriteTitle');
  if (titleEl) titleEl.textContent = session.name;

  var charEl = document.getElementById('meetingWriteCharName');
  if (charEl) {
    var chars = (session.characters && session.characters.length) ? session.characters.join(', ') : '';
    charEl.textContent = chars;
  }

  mtgHideEditBanner();
  mtgRenderChat(session);
  nav('screen-meeting-write');

  if (session.mode === 'if' && session.history.length === 0 && session.charIds && session.charIds.length > 0) {
    setTimeout(function() { mtgGenerateInitialScene(session); }, 300);
  }
}

function exitMeetingWrite() {
  mtgCurrentSession = null;
  mtgEditingEntryId = null;
  mtgHideEditBanner();
  mtgRenderArchiveList();
  nav('screen-meeting');
}

function _mtgAvatarHTML(role, entry) {
  if (role === 'user') {
    var ua = mtgGetUserAvatar();
    if (ua) return '<div class="mtg-msg-avatar"><img src="' + ua + '" alt=""></div>';
    return '<div class="mtg-msg-avatar"><div class="mtg-msg-avatar-placeholder"><svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg></div></div>';
  }
  if (role === 'char' && entry && entry.charId) {
    var ca = mtgGetCharAvatar(entry.charId);
    if (ca) return '<div class="mtg-msg-avatar"><img src="' + ca + '" alt=""></div>';
  }
  return '<div class="mtg-msg-avatar"><div class="mtg-msg-avatar-placeholder"><svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg></div></div>';
}

function _mtgMsgCardHTML(entry) {
  var isUser   = entry.role === 'user';
  var isChar   = entry.role === 'char';
  var isSystem = entry.role === 'system';

  var cardCls = isSystem ? 'mtg-msg-card mtg-msg-card-system' : 'mtg-msg-card';
  var sender  = isUser ? T('meetingYou') :
                isChar ? (entry.charName || 'Character') :
                T('meetingSystem');
  var time = mtgFormatTime(entry.timestamp);
  var eid = entry.id || '';

  var h = '<div class="' + cardCls + '" data-entry-id="' + eid + '">';
  h += '<div class="mtg-msg-header">';
  h += _mtgAvatarHTML(entry.role, entry);
  h += '<div class="mtg-msg-meta">';
  h += '<span class="mtg-msg-sender">' + mtgEsc(sender) + '</span>';
  if (time) h += '<span class="mtg-msg-time">' + time + '</span>';
  h += '</div></div>';
  h += '<div class="mtg-msg-body">' + mtgEsc(entry.content) + '</div>';

  if (isUser) {
    h += '<div class="mtg-msg-actions">';
    h += '<button class="mtg-msg-action-btn" onclick="mtgDeleteEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M3 4h10"/><path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1"/><path d="M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>';
    h += '<span>' + T('meetingDelete') + '</span></button>';
    h += '<button class="mtg-msg-action-btn" onclick="mtgEditEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M11 2l3 3M3 10l8-8 3 3-8 8H3v-3z"/></svg>';
    h += '<span>' + T('meetingEdit') + '</span></button></div>';
  } else if (isChar) {
    h += '<div class="mtg-msg-actions">';
    h += '<button class="mtg-msg-action-btn" onclick="mtgRegenerateEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M2 8a6 6 0 0111-3"/><path d="M14 8a6 6 0 01-11 3"/><path d="M13 2v3h-3"/><path d="M3 14v-3h3"/></svg>';
    h += '<span>' + T('meetingRetry') + '</span></button>';
    h += '<button class="mtg-msg-action-btn" onclick="mtgEditEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M11 2l3 3M3 10l8-8 3 3-8 8H3v-3z"/></svg>';
    h += '<span>' + T('meetingEdit') + '</span></button></div>';
  }

  h += '</div>';
  return h;
}

function mtgRenderChat(s) {
  var content = document.getElementById('mtgChatContent');
  if (!content) return;
  var h = '';

  if (!s.history || s.history.length === 0) {
    h += '<div class="mtg-chat-empty">' +
      '<svg viewBox="0 0 48 48" style="width:40px;height:40px;stroke:#d1d1d6;fill:none;stroke-width:1">' +
        '<path d="M32 8l8 8-20 20H12v-8z"/><path d="M28 12l8 8"/>' +
      '</svg>' +
      '<div class="mtg-chat-empty-text">' + T('meetingBeginStory') + '</div>' +
    '</div>';
  } else {
    s.history.forEach(function(entry) {
      if (entry.role === 'summary') {
        h += '<div class="mtg-summary-card">';
        h += '<div class="mtg-summary-header">';
        h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#aeaeb2;fill:none;stroke-width:1.4"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>';
        h += '<span>' + T('meetingSummaryRound') + ' ' + (entry.round || '?') + '</span>';
        h += '</div>';
        h += '<div class="mtg-summary-text">' + mtgEsc(entry.content) + '</div>';
        h += '</div>';
      } else {
        h += _mtgMsgCardHTML(entry);
      }
    });
  }

  content.innerHTML = h;
  var body = document.getElementById('meetingWriteBody');
  if (body) setTimeout(function() { body.scrollTop = body.scrollHeight; }, 50);
}

function mtgAppendCard(entry) {
  var content = document.getElementById('mtgChatContent');
  if (!content) return;
  var empty = content.querySelector('.mtg-chat-empty');
  if (empty) empty.remove();
  content.insertAdjacentHTML('beforeend', _mtgMsgCardHTML(entry));
  var body = document.getElementById('meetingWriteBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function mtgAppendSummary(round, text) {
  var content = document.getElementById('mtgChatContent');
  if (!content) return;
  var div = document.createElement('div');
  div.className = 'mtg-summary-card';
  div.innerHTML =
    '<div class="mtg-summary-header">' +
      '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#aeaeb2;fill:none;stroke-width:1.4"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>' +
      '<span>' + T('meetingSummaryRound') + ' ' + round + '</span>' +
    '</div>' +
    '<div class="mtg-summary-text">' + mtgEsc(text) + '</div>';
  content.appendChild(div);
  var body = document.getElementById('meetingWriteBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function mtgShowTyping() {
  var content = document.getElementById('mtgChatContent');
  if (!content || document.getElementById('mtgTypingInd')) return;
  var empty = content.querySelector('.mtg-chat-empty');
  if (empty) empty.remove();
  var ind = document.createElement('div');
  ind.id = 'mtgTypingInd';
  ind.className = 'mtg-typing-indicator';
  ind.innerHTML = '<span></span><span></span><span></span>';
  content.appendChild(ind);
  var body = document.getElementById('meetingWriteBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function mtgHideTyping() {
  var ind = document.getElementById('mtgTypingInd');
  if (ind) ind.remove();
}

function mtgSetSendEnabled(v) {
  var btn = document.getElementById('meetingWriteSendBtn');
  if (btn) btn.disabled = !v;
}
