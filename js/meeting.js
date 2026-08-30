// ========== meeting.js ==========
// Meeting — Complete Redesign (v2.0 Memory System Integrated)
// Card-based UI · Grey-white · Line icons · No emoji
// ★★★ v2.1: 世界书 + 角色人设 + 面具 提示词修复 ★★★

/* ══════════════════════════════════
   i18n Keys
   ══════════════════════════════════ */
(function() {
  if (typeof LANG === 'undefined') return;
  function _add(lang, keys) {
    if (!LANG[lang]) LANG[lang] = {};
    for (var k in keys) {
      if (!LANG[lang][k]) LANG[lang][k] = keys[k];
    }
  }
  _add('en', {
    meetingTitle:           'Meeting',
    meetingNewArchive:      'New Archive',
    meetingArchiveName:     'Archive Name',
    meetingArchiveNamePh:   'Enter archive name',
    meetingMode:            'Mode',
    meetingContinue:        'Continue',
    meetingIF:              'IF',
    meetingCharacters:      'Characters',
    meetingPerspective:     'Perspective',
    meetingCharPerspectiveShort: 'Character',
    meetingUserPerspectiveShort: 'User',
    meetingFirstPerson:     'First',
    meetingSecondPerson:    'Second',
    meetingThirdPerson:     'Third',
    meetingWordCount:       'Word Count',
    meetingMin:             'Min',
    meetingMax:             'Max',
    meetingTurnSummary:     'Turn Summary',
    meetingTurnSummaryEnable: 'Enable turn summary',
    meetingSummaryInterval: 'Interval (turns)',
    meetingSummarySettings: 'Summary',
    meetingWorldview:       'Worldview',
    meetingWorldviewPh:     'Describe the world setting...',
    meetingIdentity:        'Identity',
    meetingIdentityPh:      'Your character identity...',
    meetingCreate:          'Create',
    meetingCancel:          'Cancel',
    meetingEnter:           'Enter',
    meetingNoArchives:      'No archives yet',
    meetingNoArchivesSub:   'Create your first archive to start',
    meetingNoCharsAvail:    'No characters available',
    meetingNoCharsSelected: 'No characters selected',
    meetingNameRequired:    'Please enter an archive name',
    meetingArchiveCreated:  'Archive created',
    meetingDeleteConfirm:   'Delete this archive?',
    meetingDeleted:         'Archive deleted',
    meetingDelete:          'Delete',
    meetingEdit:            'Edit',
    meetingRetry:           'Retry',
    meetingEditing:         'Editing...',
    meetingEdited:          'Edited',
    meetingInputPh:         'Enter message...',
    meetingDeleteMsgConfirm:'Delete this message?',
    meetingYou:             'Me',
    meetingSystem:          'System',
    meetingBeginStory:      'Send a message to begin',
    meetingWords:           'words',
    meetingTurns:           'turns',
    meetingSummaryRound:    'Round',
    meetingNoMemories:      'No memories yet',
    meetingManageTitle:     'Manage',
    meetingArchiveSettings: 'Settings',
    meetingSaveChanges:     'Save Changes',
    meetingShortTermMemory: 'Short-term Memory',
    meetingStatusActive:    'Active',
    meetingStatusEnded:     'Ended',
    meetingEndSession:      'End Session',
    meetingEndTitle:        'End Session',
    meetingEndMsg:          'This session has {turns} rounds, {msgs} messages.',
    meetingEndWriteQ:       'Write short-term memory to the memory library?',
    meetingEndNoMem:        'No short-term memories to write.',
    meetingSaveAndWrite:    'Save & Write to Memory',
    meetingSaveOnly:        'Save Only',
    meetingContinueWrite:   'Continue Writing',
    meetingMemWrittenPre:   'Written ',
    meetingMemWrittenPost:  ' memories to library',
    meetingSavedNoWrite:    'Saved, not written to memory library',
    meetingSessionName:     'Session Name',
    meetingStatusLabel:     'Status',
    meetingNoSessions:      'No sessions',
    meetingCreateFirst:     'Create one to start'
  });
  _add('zh', {
    meetingTitle:           '\u89c1\u9762',
    meetingNewArchive:      '\u65b0\u5efa\u5b58\u6863',
    meetingArchiveName:     '\u5b58\u6863\u540d\u79f0',
    meetingArchiveNamePh:   '\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingMode:            '\u6a21\u5f0f',
    meetingContinue:        '\u7eed\u5199',
    meetingIF:              'IF',
    meetingCharacters:      '\u89d2\u8272',
    meetingPerspective:     '\u89c6\u89d2',
    meetingCharPerspectiveShort: '\u89d2\u8272',
    meetingUserPerspectiveShort: '\u7528\u6237',
    meetingFirstPerson:     '\u7b2c\u4e00',
    meetingSecondPerson:    '\u7b2c\u4e8c',
    meetingThirdPerson:     '\u7b2c\u4e09',
    meetingWordCount:       '\u5b57\u6570',
    meetingMin:             '\u6700\u5c11',
    meetingMax:             '\u6700\u591a',
    meetingTurnSummary:     '\u56de\u5408\u6458\u8981',
    meetingTurnSummaryEnable: '\u542f\u7528\u56de\u5408\u6458\u8981',
    meetingSummaryInterval: '\u95f4\u9694\uff08\u56de\u5408\uff09',
    meetingSummarySettings: '\u6458\u8981',
    meetingWorldview:       '\u4e16\u754c\u89c2',
    meetingWorldviewPh:     '\u63cf\u8ff0\u4e16\u754c\u8bbe\u5b9a...',
    meetingIdentity:        '\u8eab\u4efd',
    meetingIdentityPh:      '\u4f60\u7684\u89d2\u8272\u8eab\u4efd...',
    meetingCreate:          '\u521b\u5efa',
    meetingCancel:          '\u53d6\u6d88',
    meetingEnter:           '\u8fdb\u5165',
    meetingNoArchives:      '\u6682\u65e0\u5b58\u6863',
    meetingNoArchivesSub:   '\u521b\u5efa\u7b2c\u4e00\u4e2a\u5b58\u6863\u5f00\u59cb',
    meetingNoCharsAvail:    '\u6ca1\u6709\u53ef\u7528\u89d2\u8272',
    meetingNoCharsSelected: '\u672a\u9009\u62e9\u89d2\u8272',
    meetingNameRequired:    '\u8bf7\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingArchiveCreated:  '\u5b58\u6863\u5df2\u521b\u5efa',
    meetingDeleteConfirm:   '\u786e\u5b9a\u5220\u9664\u6b64\u5b58\u6863\uff1f',
    meetingDeleted:         '\u5b58\u6863\u5df2\u5220\u9664',
    meetingDelete:          '\u5220\u9664',
    meetingEdit:            '\u4fee\u6539',
    meetingRetry:           '\u91cd\u56de',
    meetingEditing:         '\u6b63\u5728\u7f16\u8f91...',
    meetingEdited:          '\u5df2\u4fee\u6539',
    meetingInputPh:         '\u8f93\u5165\u6d88\u606f...',
    meetingDeleteMsgConfirm:'\u786e\u5b9a\u5220\u9664\u8fd9\u6761\u6d88\u606f\uff1f',
    meetingYou:             '\u6211',
    meetingSystem:          '\u7cfb\u7edf',
    meetingBeginStory:      '\u53d1\u9001\u6d88\u606f\u5f00\u59cb',
    meetingWords:           '\u5b57',
    meetingTurns:           '\u56de\u5408',
    meetingSummaryRound:    '\u7b2c',
    meetingNoMemories:      '\u6682\u65e0\u8bb0\u5fc6',
    meetingManageTitle:     '\u7ba1\u7406',
    meetingArchiveSettings: '\u8bbe\u7f6e',
    meetingSaveChanges:     '\u4fdd\u5b58\u66f4\u6539',
    meetingShortTermMemory: '\u77ed\u671f\u8bb0\u5fc6',
    meetingStatusActive:    '\u8fdb\u884c\u4e2d',
    meetingStatusEnded:     '\u5df2\u7ed3\u675f',
    meetingEndSession:      '\u7ed3\u675f\u89c1\u9762',
    meetingEndTitle:        '\u7ed3\u675f\u89c1\u9762',
    meetingEndMsg:          '\u672c\u6b21\u4f1a\u8bdd\u5df2\u8fdb\u884c {turns} \u8f6e\uff0c\u5171 {msgs} \u6761\u6d88\u606f\u3002',
    meetingEndWriteQ:       '\u662f\u5426\u5c06\u77ed\u671f\u8bb0\u5fc6\u5199\u5165\u603b\u8bb0\u5fc6\u5e93\uff1f',
    meetingEndNoMem:        '\u6682\u65e0\u77ed\u671f\u8bb0\u5fc6\u53ef\u5199\u5165\u3002',
    meetingSaveAndWrite:    '\u4fdd\u5b58\u5e76\u5199\u5165\u8bb0\u5fc6\u5e93',
    meetingSaveOnly:        '\u4ec5\u4fdd\u5b58',
    meetingContinueWrite:   '\u7ee7\u7eed\u5199\u4f5c',
    meetingMemWrittenPre:   '\u5df2\u5199\u5165 ',
    meetingMemWrittenPost:  ' \u6761\u8bb0\u5fc6',
    meetingSavedNoWrite:    '\u5df2\u4fdd\u5b58\uff0c\u672a\u5199\u5165\u8bb0\u5fc6\u5e93',
    meetingSessionName:     '\u4f1a\u8bdd\u540d\u79f0',
    meetingStatusLabel:     '\u72b6\u6001',
    meetingNoSessions:      '\u6682\u65e0\u4f1a\u8bdd',
    meetingCreateFirst:     '\u521b\u5efa\u4e00\u4e2a\u5f00\u59cb'
  });
})();

/* ══════════════════════════════════
   Constants & State
   ══════════════════════════════════ */
var MTG_CONTEXT_COUNT = 50;
var MTG_DEFAULT_SUMMARY_INTERVAL = 5;
var MTG_MEM_CONSOLIDATE_THRESHOLD = 5;
var mtgCurrentSession = null;
var mtgGenerating = false;
var mtgEditingEntryId = null;
var mtgSettingsReturnTo = 'screen-meeting-write';
var _mtgSummarizing = false;

/* ══════════════════════════════════
   Utilities
   ══════════════════════════════════ */
function mtgUid() {
  return 'mtg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

function mtgEsc(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function mtgFormatDate(ds) {
  var d = new Date(ds);
  if (isNaN(d.getTime())) return ds || '';
  if (typeof state !== 'undefined' && state.lang === 'zh') {
    return (d.getMonth() + 1) + '\u6708' + d.getDate() + '\u65e5';
  }
  var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m[d.getMonth()] + ' ' + d.getDate();
}

function mtgFormatDateTime(ds) {
  var d = new Date(ds);
  if (isNaN(d.getTime())) return ds || '';
  var time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (typeof state !== 'undefined' && state.lang === 'zh') {
    return (d.getMonth() + 1) + '\u6708' + d.getDate() + '\u65e5 ' + time;
  }
  var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m[d.getMonth()] + ' ' + d.getDate() + ' ' + time;
}

function mtgFormatTime(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function mtgPersonLabel(v) {
  if (v === 'first')  return T('meetingFirstPerson');
  if (v === 'second') return T('meetingSecondPerson');
  if (v === 'third')  return T('meetingThirdPerson');
  return v;
}

/* ══════════════════════════════════
   State Management
   ══════════════════════════════════ */
function mtgEnsureState() {
  if (!Array.isArray(state.meetings)) state.meetings = [];
}

function mtgFindSession(id) {
  mtgEnsureState();
  for (var i = 0; i < state.meetings.length; i++) {
    if (state.meetings[i].id === id) return state.meetings[i];
  }
  return null;
}

function mtgGetCharById(charId) {
  return (state.characters || []).find(function(c) { return c.id === charId; });
}

function mtgGetCharAvatar(charId) {
  var ch = mtgGetCharById(charId);
  if (ch && ch.avatar) return ch.avatar;
  return null;
}

function mtgGetUserAvatar() {
  if (typeof state !== 'undefined' && state.userAvatar) return state.userAvatar;
  return null;
}

/* ══════════════════════════════════
   Memory Fields Init & Compat
   ══════════════════════════════════ */
function mtgEnsureMemoryFields(session) {
  if (!session) {
    console.warn('[Meeting-Memory] mtgEnsureMemoryFields called with null session');
    return;
  }
  if (!Array.isArray(session.shortTermMemories))  session.shortTermMemories = [];
  if (!Array.isArray(session.shortTermMemory))    session.shortTermMemory = [];
  if (session.lastSummarizedEntryIdx === undefined) session.lastSummarizedEntryIdx = 0;
  if (session.consolidateThreshold === undefined)   session.consolidateThreshold = MTG_MEM_CONSOLIDATE_THRESHOLD;
  if (!Array.isArray(session.history)) session.history = [];

  if (session.shortTermMemory.length > 0 && session.shortTermMemories.length === 0) {
    console.log('[Meeting-Memory] Migrating', session.shortTermMemory.length, 'old STMs to new format');
    session.shortTermMemory.forEach(function(old) {
      session.shortTermMemories.push({
        id: old.id || mtgUid(),
        date: new Date(old.timestamp || Date.now()).toISOString().split('T')[0],
        content: old.content,
        turnRange: null,
        timestamp: old.timestamp || Date.now(),
        _writtenToLibrary: false
      });
    });
  }

  console.log('[Meeting-Memory] Fields ensured for session:', session.id,
    '| STMs:', session.shortTermMemories.length,
    '| lastIdx:', session.lastSummarizedEntryIdx,
    '| history:', session.history.length);
}

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
function initMeetingPage() {
  mtgEnsureState();
  mtgRenderArchiveList();
}

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


/* ══════════════════════════════════
   Message Actions: Delete / Edit / Regenerate
   ══════════════════════════════════ */
function mtgDeleteEntry(entryId) {
  if (!mtgCurrentSession) return;
  if (!confirm(T('meetingDeleteMsgConfirm'))) return;
  var s = mtgCurrentSession;
  s.history = s.history.filter(function(e) { return e.id !== entryId; });
  saveState();
  var card = document.querySelector('.mtg-msg-card[data-entry-id="' + entryId + '"]');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(.96)';
    setTimeout(function() { card.remove(); }, 220);
  }
  showToast(T('meetingDeleted'));
}

function mtgEditEntry(entryId) {
  if (!mtgCurrentSession) return;
  var s = mtgCurrentSession;
  var entry = null;
  for (var i = 0; i < s.history.length; i++) {
    if (s.history[i].id === entryId) { entry = s.history[i]; break; }
  }
  if (!entry) return;
  mtgEditingEntryId = entryId;
  var inp = document.getElementById('meetingWriteInput');
  if (inp) {
    inp.value = entry.content;
    inp.focus();
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
  }
  mtgShowEditBanner();
}

async function mtgRegenerateEntry(entryId) {
  if (mtgGenerating || !mtgCurrentSession) return;
  var s = mtgCurrentSession;
  var entryIdx = -1;
  for (var i = 0; i < s.history.length; i++) {
    if (s.history[i].id === entryId) { entryIdx = i; break; }
  }
  if (entryIdx < 0) return;
  var entry = s.history[entryIdx];
  if (entry.role !== 'char') return;

  var ch = null;
  if (entry.charId) ch = mtgGetCharById(entry.charId);
  if (!ch && entry.charName) {
    ch = (state.characters || []).find(function(c) { return c.name === entry.charName; });
  }
  if (!ch) { showToast(T('error')); return; }

  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) { showToast(T('configApi')); return; }
  if (typeof sendChat !== 'function') { showToast(T('configApi')); return; }

  s.history.splice(entryIdx, 1);
  saveState();
  var oldCard = document.querySelector('.mtg-msg-card[data-entry-id="' + entryId + '"]');
  if (oldCard) oldCard.remove();

  mtgGenerating = true;
  mtgSetSendEnabled(false);
  mtgShowTyping();

  try {
    var sysPrompt = mtgBuildSystemPrompt(s, ch);
    var ctxMsgs = mtgBuildContextMessages(s, ch);
    var messages = [{ role: 'system', content: sysPrompt }].concat(ctxMsgs);
    var reply = await sendChat(api, messages);
    if (reply && reply.trim()) {
      var newEntry = {
        id: mtgUid(), role: 'char', charName: ch.name, charId: ch.id,
        content: reply.trim(), timestamp: Date.now()
      };
      s.history.splice(entryIdx, 0, newEntry);
      saveState();
      mtgRenderChat(s);
    }
  } catch (e) {
    console.error('[Meeting-Memory] Regenerate failed:', e);
    showToast(T('error') + ': ' + (e.message || String(e)));
  } finally {
    mtgGenerating = false;
    mtgSetSendEnabled(true);
    mtgHideTyping();
  }
}

function mtgShowEditBanner() {
  var banner = document.getElementById('mtgEditBanner');
  if (!banner) return;
  banner.style.display = 'flex';
  banner.innerHTML =
    '<div class="mtg-edit-banner-info">' +
      '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#86868b;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round">' +
        '<path d="M10 2l2 2M3 9l7-7 2 2-7 7H3V9z"/>' +
      '</svg>' +
      '<span>' + T('meetingEditing') + '</span>' +
    '</div>' +
    '<button class="mtg-edit-banner-cancel" onclick="mtgCancelEdit()">' + T('meetingCancel') + '</button>';
}

function mtgHideEditBanner() {
  var banner = document.getElementById('mtgEditBanner');
  if (banner) banner.style.display = 'none';
}

function mtgCancelEdit() {
  mtgEditingEntryId = null;
  mtgHideEditBanner();
  var inp = document.getElementById('meetingWriteInput');
  if (inp) { inp.value = ''; inp.style.height = 'auto'; }
}


/* ══════════════════════════════════
   Send Message
   ══════════════════════════════════ */
function meetingWriteSend() {
  if (mtgGenerating || !mtgCurrentSession) return;
  var inp = document.getElementById('meetingWriteInput');
  var text = inp ? inp.value.trim() : '';
  if (!text) return;

  var s = mtgCurrentSession;

  if (mtgEditingEntryId) {
    var found = false;
    for (var i = 0; i < s.history.length; i++) {
      if (s.history[i].id === mtgEditingEntryId) {
        s.history[i].content = text;
        s.history[i].timestamp = Date.now();
        found = true;
        break;
      }
    }
    mtgEditingEntryId = null;
    mtgHideEditBanner();
    inp.value = '';
    inp.style.height = 'auto';
    if (found) {
      saveState();
      mtgRenderChat(s);
      showToast(T('meetingEdited'));
    }
    return;
  }

  var newEntry = {
    id: mtgUid(), role: 'user', content: text, timestamp: Date.now()
  };
  s.history.push(newEntry);
  s.turnCount = (s.turnCount || 0) + 1;
  saveState();

  mtgAppendCard(newEntry);
  inp.value = '';
  inp.style.height = 'auto';

  mtgAiRespond(s);
}


/* ══════════════════════════════════
   AI Logic
   ══════════════════════════════════ */
async function mtgAiRespond(session) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url) { showToast(T('configApi')); return; }
  if (!api.model) { showToast(T('selectModel')); return; }
  if (typeof sendChat !== 'function') { showToast(T('configApi')); return; }

  if (!session.charIds || session.charIds.length === 0) {
    showToast(T('meetingNoCharsSelected'));
    return;
  }

  mtgGenerating = true;
  mtgSetSendEnabled(false);
  mtgShowTyping();

  try {
    for (var i = 0; i < session.charIds.length; i++) {
      var charId = session.charIds[i];
      var ch = mtgGetCharById(charId);
      if (!ch) continue;

      try {
        var sysPrompt = mtgBuildSystemPrompt(session, ch);
        var ctxMsgs = mtgBuildContextMessages(session, ch);
        var messages = [{ role: 'system', content: sysPrompt }].concat(ctxMsgs);

        var reply = await sendChat(api, messages);
        if (reply && reply.trim()) {
          var newEntry = {
            id: mtgUid(), role: 'char', charName: ch.name, charId: ch.id,
            content: reply.trim(), timestamp: Date.now()
          };
          session.history.push(newEntry);
          mtgHideTyping();
          mtgAppendCard(newEntry);
          if (i < session.charIds.length - 1) mtgShowTyping();
        }
      } catch (charErr) {
        console.error('[Meeting-Memory] Character "' + ch.name + '" failed:', charErr);
      }
    }

    saveState();

    if (session.turnSummary) {
      await mtgCheckAutoSummarize(session);
    }

  } catch (e) {
    console.error('[Meeting-Memory] AI respond error:', e);
    showToast(T('error') + ': ' + (e.message || String(e)));
  } finally {
    mtgGenerating = false;
    mtgSetSendEnabled(true);
    mtgHideTyping();
  }
}

async function mtgGenerateInitialScene(session) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model || typeof sendChat !== 'function') return;
  if (!session.charIds || session.charIds.length === 0) return;

  mtgGenerating = true;
  mtgSetSendEnabled(false);
  mtgShowTyping();

  try {
    var ch = mtgGetCharById(session.charIds[0]);
    if (!ch) return;
    var sysPrompt = mtgBuildSystemPrompt(session, ch);
    sysPrompt += '\n\nGenerate the opening scene. Set the stage, describe the world, and establish the initial situation. Write as the narrator.\n';

    var reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: 'Begin the story.' }
    ]);

    if (reply && reply.trim()) {
      var newEntry = {
        id: mtgUid(), role: 'system', content: reply.trim(), timestamp: Date.now()
      };
      session.history.push(newEntry);
      saveState();
      mtgHideTyping();
      mtgAppendCard(newEntry);
    }
  } catch (e) {
    console.error('[Meeting-Memory] Initial scene failed:', e);
  } finally {
    mtgGenerating = false;
    mtgSetSendEnabled(true);
    mtgHideTyping();
  }
}


/* ══════════════════════════════════════════════════════════════
   ★★★ v2.1 FIX: Build System Prompt — 世界书 + 人设 + 面具 ★★★
   ══════════════════════════════════════════════════════════════ */
function mtgBuildSystemPrompt(session, ch) {
  var p = '';

  // ★ 1. Meeting 专用系统提示词（来自 prompt.js 的 getActiveSystemPrompt）
  if (typeof getActiveSystemPrompt === 'function') {
    var prevMode = (typeof tmp !== 'undefined' && tmp.chatMode) ? tmp.chatMode : undefined;
    if (typeof tmp !== 'undefined') tmp.chatMode = 'meeting';
    var activePrompt = getActiveSystemPrompt();
    if (typeof tmp !== 'undefined') {
      if (prevMode !== undefined) tmp.chatMode = prevMode;
      else delete tmp.chatMode;
    }
    if (activePrompt) {
      var _userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : 'User';
      activePrompt = activePrompt.replace(/\{\{user\}\}/g, _userName).replace(/\{\{char\}\}/g, ch.name);
      p += activePrompt + '\n\n';
      console.log('[Meeting-Prompt] Active system prompt injected | length:', activePrompt.length);
    }
  } else {
    console.log('[Meeting-Prompt] getActiveSystemPrompt not available, skipping base prompt');
  }

  // ★ 2. 角色完整人设信息
  p += '--- CHARACTER PROFILE ---\n';
  p += 'Name: ' + ch.name + '\n';

  if (ch.identity) {
    p += 'Identity: ' + ch.identity + '\n';
    console.log('[Meeting-Prompt] Identity included for', ch.name, '| length:', ch.identity.length);
  }

  if (ch.age) {
    p += 'Age: ' + ch.age + '\n';
    console.log('[Meeting-Prompt] Age included for', ch.name, ':', ch.age);
  }

  if (ch.personality) {
    p += 'Personality: ' + ch.personality + '\n';
    console.log('[Meeting-Prompt] Personality included for', ch.name, '| length:', ch.personality.length);
  }

  if (ch.background) {
    p += 'Background: ' + ch.background + '\n';
    console.log('[Meeting-Prompt] Background included for', ch.name, '| length:', ch.background.length);
  }

  if (ch.systemPrompt) {
    p += '\n' + ch.systemPrompt + '\n';
    console.log('[Meeting-Prompt] systemPrompt included for', ch.name, '| length:', ch.systemPrompt.length);
  } else if (ch.prompt) {
    p += '\n' + ch.prompt + '\n';
    console.log('[Meeting-Prompt] prompt (legacy) included for', ch.name, '| length:', ch.prompt.length);
  }

  if (ch.notes) {
    p += '\nNotes: ' + ch.notes + '\n';
    console.log('[Meeting-Prompt] Notes included for', ch.name, '| length:', ch.notes.length);
  }

  p += '--- END CHARACTER PROFILE ---\n\n';

  // ★ 3. 关联面具（Mask）信息
  var mask = null;
  if (typeof getMaskForChar === 'function') {
    mask = getMaskForChar(ch.id);
  } else {
    // Fallback: 手动查找面具
    mask = (state.masks || []).find(function(m) {
      return (m.charIds || []).indexOf(ch.id) >= 0;
    }) || null;
  }

  if (mask) {
    p += '[User Identity / Mask]\n';
    if (mask.name) {
      p += 'User Name: ' + mask.name + '\n';
    }
    if (mask.persona) {
      p += mask.persona + '\n';
    }
    if (mask.description) {
      p += mask.description + '\n';
    }
    p += '\n';
    console.log('[Meeting-Prompt] Mask included for', ch.name,
      '| maskName:', mask.name || '(none)',
      '| persona length:', (mask.persona || '').length);
  } else {
    // 没有面具时使用用户基本信息
    if (state.userProfile && state.userProfile.name && state.userProfile.name !== 'User') {
      p += 'User: ' + state.userProfile.name + '\n\n';
    }
    console.log('[Meeting-Prompt] No mask found for', ch.name);
  }

  // ★ 4. 世界书（Worldbook）信息
  var worldbooks = state.worldbooks || [];
  var activeBooks = [];

  if (typeof getActiveWorldBooks === 'function') {
    activeBooks = getActiveWorldBooks(ch, worldbooks);
    console.log('[Meeting-Prompt] getActiveWorldBooks returned', activeBooks.length, 'books for', ch.name);
  } else {
    // Fallback: 手动筛选
    var charWbIds = ch.worldbookIds || [];
    activeBooks = worldbooks.filter(function(wb) {
      return wb.isGlobal || charWbIds.indexOf(wb.id) >= 0;
    });
    console.log('[Meeting-Prompt] Manual worldbook filter:', activeBooks.length, 'books for', ch.name);
  }

  if (activeBooks.length > 0) {
    p += '[World Setting]\n';
    activeBooks.forEach(function(wb) {
      var tag = wb.isGlobal ? '[Global]' : '[Character]';
      p += '\u00b7 ' + tag + ' ' + (wb.name || 'Unnamed Worldbook');
      if (wb.content) p += '\uff1a' + wb.content;
      p += '\n';

      if (wb.entries && Array.isArray(wb.entries) && wb.entries.length > 0) {
        wb.entries.forEach(function(e) {
          if (e.keyword || e.content) {
            p += '  - ' + (e.keyword || '') + (e.content ? ': ' + e.content : '') + '\n';
          }
        });
      }

      console.log('[Meeting-Prompt] Worldbook "' + (wb.name || 'unnamed') + '"',
        '| global:', !!wb.isGlobal,
        '| entries:', (wb.entries || []).length,
        '| content length:', (wb.content || '').length);
    });
    p += '\n';
  } else {
    console.log('[Meeting-Prompt] No active worldbooks for', ch.name,
      '| total worldbooks:', worldbooks.length,
      '| char worldbookIds:', JSON.stringify(ch.worldbookIds || []));
  }

  // ★ 5. IF 模式专用字段
  if (session.mode === 'if') {
    if (session.worldview) {
      p += 'WORLDVIEW:\n' + session.worldview + '\n\n';
    }
    if (session.identity) {
      p += 'USER IDENTITY IN THIS SCENARIO:\n' + session.identity + '\n\n';
    }
  }

  // ★ 6. 协作写作规则
  var cpDesc = {
    first: 'first person (I, me, my)',
    second: 'second person (you, your)',
    third: 'third person (' + ch.name + ', he/she/they)'
  };
  var upDesc = {
    first: 'first person (I, me, my)',
    second: 'second person (you, your)',
    third: 'third person'
  };

  p += '--- COLLABORATIVE WRITING SESSION RULES ---\n';
  p += '1. Write your response using ' + (cpDesc[session.charPerson] || cpDesc.first) + ' narration.\n';
  p += '2. The user writes in ' + (upDesc[session.userPerson] || upDesc.first) + '.\n';
  p += '3. Your response MUST be between ' + session.wc.min + ' and ' + session.wc.max + ' words. Count carefully.\n';
  p += '4. Stay completely in character.\n';
  p += '5. Advance the story naturally. Do not repeat the user\'s content.\n';
  p += '6. Output only narrative prose. No meta-commentary, no character name prefix.\n';
  p += '---\n';

  // ★ 7. 多角色场景上下文
  if (session.charIds && session.charIds.length > 1) {
    p += '\n[Group Scene Context]\n';
    p += 'This is a meeting/group scene with multiple characters.\n';
    p += 'You are playing the role of **' + ch.name + '**. Respond ONLY as ' + ch.name + '.\n';
    p += 'Other characters in this scene:\n';
    session.charIds.forEach(function(cid) {
      if (cid === ch.id) return;
      var otherCh = mtgGetCharById(cid);
      if (otherCh) {
        p += '- ' + otherCh.name;
        if (otherCh.personality) p += ' (' + otherCh.personality.substring(0, 100) + ')';
        p += '\n';
      }
    });
    p += 'Interact naturally with the other characters. Do not speak for them.\n\n';
  }

  // ★ 8. 会话内记忆摘要（原有逻辑保留）
  if (session.shortTermMemories && session.shortTermMemories.length > 0) {
    p += '\nSTORY SUMMARIES (for context):\n';
    session.shortTermMemories.forEach(function(mem, idx) {
      p += '- Summary ' + (idx + 1) + ': ' + mem.content + '\n';
    });
    p += '\n';
  } else if (session.shortTermMemory && session.shortTermMemory.length > 0) {
    p += '\nSTORY SUMMARIES (for context):\n';
    session.shortTermMemory.forEach(function(mem) {
      p += '- Round ' + mem.round + ': ' + mem.content + '\n';
    });
    p += '\n';
  }

  // ★ 9. 角色的长期/短期记忆（来自记忆库 state.memories）
  if (typeof getCharMemoriesByType === 'function') {
    var charLTM = getCharMemoriesByType(ch.id, 'ltm') || [];
    var charSTM = (getCharMemoriesByType(ch.id, 'stm') || []).filter(function(m) { return !m.consolidated; });
    var charFTM = getCharMemoriesByType(ch.id, 'ftm') || [];

    if (charLTM.length > 0 || charSTM.length > 0 || charFTM.length > 0) {
      p += '\n[Character Memories for ' + ch.name + ']\n';

      if (charLTM.length > 0) {
        p += '\u2014 Long-term Memories (core, important) \u2014\n';
        charLTM.slice(0, 5).forEach(function(m) {
          p += '- (' + (m.date || '') + ') ' + m.content + '\n';
        });
      }

      if (charSTM.length > 0) {
        p += '\u2014 Recent Short-term Memories \u2014\n';
        charSTM.slice(0, 8).forEach(function(m) {
          p += '- (' + (m.date || '') + ') ' + m.content + '\n';
        });
      }

      if (charFTM.length > 0) {
        p += '\u2014 Vague / Forgettable Memories \u2014\n';
        charFTM.slice(0, 3).forEach(function(m) {
          p += '- (' + (m.date || '') + ') ' + m.content + '\n';
        });
      }

      p += '\n';
      console.log('[Meeting-Prompt] Character memories included | LTM:', charLTM.length,
        '| STM:', charSTM.length, '| FTM:', charFTM.length);
    }
  } else {
    // Fallback: 手动读取 state.memories
    var _allMem = (state.memories || []).filter(function(m) { return m.charId === ch.id; });
    if (_allMem.length > 0) {
      p += '\n[Character Memories for ' + ch.name + ']\n';
      _allMem.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
      _allMem.slice(0, 10).forEach(function(m) {
        p += '- (' + (m.date || '') + ') ' + (m.title ? m.title + ': ' : '') + m.content + '\n';
      });
      p += '\n';
      console.log('[Meeting-Prompt] Fallback memories included:', _allMem.length);
    }
  }

  // ★ 最终日志
  console.log('[Meeting-Prompt] ======= System Prompt Built =======',
    '\n| Character:', ch.name,
    '\n| Session:', session.name,
    '\n| Mode:', session.mode,
    '\n| Has personality:', !!ch.personality,
    '\n| Has background:', !!ch.background,
    '\n| Has identity:', !!ch.identity,
    '\n| Has systemPrompt:', !!ch.systemPrompt,
    '\n| Has mask:', !!mask,
    '\n| Active worldbooks:', activeBooks.length,
    '\n| Session memories:', (session.shortTermMemories || []).length,
    '\n| Prompt length:', p.length, 'chars');

  return p;
}


/* ── Build Context Messages ── */
function mtgBuildContextMessages(session, ch) {
  var N = session.contextCount || 50;
  var msgs = [];

  var meetingEntries = (session.history || []).filter(function(e) {
    return e.role !== 'summary';
  });
  var M = meetingEntries.length;
  var meetingToSend = (M >= N) ? meetingEntries.slice(-N) : meetingEntries;

  if (session.mode === 'continue' && M < N && ch) {
    var imsgNeeded = N - M;
    var chatHist = (state.chats && state.chats[ch.id]) ? state.chats[ch.id] : [];
    var recent = chatHist.slice(-imsgNeeded);
    if (recent.length > 0) {
      var ctx = '[Previous conversation between ' + ch.name + ' and the user \u2014 for context only]\n\n';
      recent.forEach(function(m) {
        if (m.recalled) return;
        var lbl = m.role === 'assistant' ? ch.name : 'User';
        var txt = m.content || '';
        if (m.type === 'voice') txt = '[Voice]: ' + txt;
        else if (m.type === 'sticker') txt = '[Sticker]';
        else if (m.type === 'image') txt = '[Image]';
        ctx += lbl + ': ' + txt + '\n';
      });
      ctx += '\n[End of previous context. Now continue the collaborative story.]\n';
      msgs.push({ role: 'system', content: ctx });
    }
  }

  meetingToSend.forEach(function(entry) {
    if (entry.role === 'user') {
      msgs.push({ role: 'user', content: entry.content });
    } else if (entry.role === 'char') {
      if (entry.charName === ch.name) {
        msgs.push({ role: 'assistant', content: entry.content });
      } else {
        msgs.push({ role: 'system', content: '[' + (entry.charName || 'Character') + ' wrote]: ' + entry.content });
      }
    } else if (entry.role === 'system') {
      msgs.push({ role: 'system', content: entry.content });
    }
  });

  return msgs;
}


/* ══════════════════════════════════════════════════════════════
   ★★★ v2.0 MEETING MEMORY SYSTEM ★★★
   ══════════════════════════════════════════════════════════════ */

function mtgCountUnsummarizedTurns(session) {
  if (!session || !session.history) return 0;
  mtgEnsureMemoryFields(session);
  var count = 0;
  for (var i = session.lastSummarizedEntryIdx; i < session.history.length; i++) {
    if (session.history[i].role === 'user') count++;
  }
  return count;
}

function mtgGetUnsummarizedEntries(session) {
  if (!session || !session.history) return [];
  mtgEnsureMemoryFields(session);
  return session.history.slice(session.lastSummarizedEntryIdx);
}

function _mtgSliceByTurns(entries, maxTurns) {
  var result = [];
  var turnCount = 0;
  for (var i = 0; i < entries.length; i++) {
    result.push(entries[i]);
    if (entries[i].role === 'user') {
      turnCount++;
      if (turnCount >= maxTurns) {
        for (var j = i + 1; j < entries.length; j++) {
          if (entries[j].role === 'user') break;
          result.push(entries[j]);
        }
        break;
      }
    }
  }
  return result;
}

async function mtgCallSummarize(session, entries, api) {
  console.log('[Meeting-Memory] mtgCallSummarize called | entries:', entries.length);

  if (!api || !api.url || !api.model) {
    throw new Error('[Meeting-Memory] No valid API config for summarize');
  }
  if (typeof sendChat !== 'function') {
    throw new Error('[Meeting-Memory] sendChat is not available');
  }

  var userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : '\u7528\u6237';
  var charNames = (session.characters && session.characters.length)
    ? session.characters.join('\u3001') : '\u89d2\u8272';

  // ★★★ 修复 Bug 2：获取主要角色名，用于角色第一人称视角 ★★★
  var primaryCharId = (session.charIds && session.charIds.length > 0) ? session.charIds[0] : null;
  var primaryChar = primaryCharId ? mtgGetCharById(primaryCharId) : null;
  var primaryCharName = primaryChar ? primaryChar.name : charNames;

  var formatted = entries.map(function(e) {
    var who;
    if (e.role === 'user') {
      who = session.identity ? (session.identity.split(/[,\uff0c]/)[0].trim() || userName) : userName;
    } else if (e.role === 'system') {
      who = '[\u65c1\u767d]';
    } else {
      var ch = e.charId ? mtgGetCharById(e.charId) : null;
      who = ch ? ch.name : (e.charName || charNames);
    }
    return who + ':\n' + (e.content || '').slice(0, 3000);
  }).join('\n\n---\n\n');

  var sessionLabel = session.name ? '\u300c' + session.name + '\u300d' : '\u8fd9\u6b21\u89c1\u9762';

  // ★★★ 修复 Bug 2：将提示词从「用户第一人称」改为「角色第一人称」★★★
  var prompt = '\u4f60\u662f\u4e00\u4f4d\u7ec6\u817b\u7684\u6545\u4e8b\u8bb0\u5fc6\u8005\u3002\u8bf7\u5c06\u4ee5\u4e0b' + sessionLabel + '\u573a\u666f\u4e2d\u53d1\u751f\u7684\u4e8b\uff0c\u4ee5 ' + primaryCharName + ' \u7684\u7b2c\u4e00\u4eba\u79f0\uff08\u300c\u6211\u300d\u5373 ' + primaryCharName + '\uff09\u7684\u89c6\u89d2\uff0c\u5199\u6210\u4e00\u6bb5\u79c1\u5bc6\u7684\u8bb0\u5fc6\u7247\u6bb5\u3002\n\n' +
    '\u91cd\u8981\uff1a\u4f60\u73b0\u5728\u662f ' + primaryCharName + '\uff0c\u4e0d\u662f ' + userName + '\u3002\u6240\u6709\u7684\u300c\u6211\u300d\u90fd\u6307\u7684\u662f ' + primaryCharName + '\u3002' + userName + ' \u662f\u4f60\u7684\u5bf9\u8bdd\u5bf9\u8c61\uff0c\u8bf7\u79f0\u547c\u5176\u4e3a\u300c' + userName + '\u300d\u6216\u300c\u4ed6/\u5979\u300d\u3002\n\n' +
    '\u3010\u5199\u4f5c\u89c4\u5219\u3011\n\n' +
    '1. \u8fc7\u6ee4\u5e9f\u8bdd\n' +
    '   - \u8df3\u8fc7\u65e0\u5b9e\u8d28\u5185\u5bb9\u7684\u5bd2\u6684\u3001\u91cd\u590d\u63cf\u5199\u548c\u8fc7\u6e21\u53e5\u3002\n' +
    '   - \u5982\u679c\u6574\u6bb5\u573a\u666f\u90fd\u662f\u65e5\u5e38\uff0c\u53ea\u7528\u4e00\u53e5\u8bdd\u6982\u62ec\u6c1b\u56f4\u3002\n\n' +
    '2. \u4fdd\u7559\u6838\u5fc3\n' +
    '   - \u63d0\u53d6\u5173\u952e\u5267\u60c5\u4e8b\u4ef6\u3001\u89d2\u8272\u4e92\u52a8\u3001\u60c5\u611f\u8f6c\u6298\u3001\u5173\u7cfb\u91cc\u7a0b\u7891\u3002\n' +
    '   - \u5982\u679c\u51fa\u73b0\u627f\u8bfa\u3001\u7ea6\u5b9a\u3001\u8eab\u4f53\u63a5\u89e6\u3001\u8868\u767d\u3001\u4e89\u6267\u7b49\u91cd\u8981\u8282\u70b9\uff0c\u5fc5\u987b\u8bb0\u5f55\u3002\n\n' +
    '3. \u8bb0\u5f55\u65f6\u7a7a\u4e0e\u4e8b\u4ef6\n' +
    '   - \u8fd8\u539f\u573a\u666f\u4e2d\u7684\u65f6\u95f4\u3001\u5730\u70b9\u548c\u5177\u4f53\u4e8b\u4ef6\u3002\n\n' +
    '4. \u60c5\u611f\u6e29\u5ea6\n' +
    '   - \u6355\u6349\u8ba9\u6211\uff08' + primaryCharName + '\uff09\u5fc3\u52a8\u3001\u5fc3\u75bc\u3001\u7d27\u5f20\u3001\u5931\u843d\u7684\u77ac\u95f4\u3002\n' +
    '   - \u4e0d\u8981\u5199\u6210\u51b0\u51b7\u7684\u5267\u60c5\u6458\u8981\uff0c\u8981\u5199\u6210\u771f\u5b9e\u7684\u8bb0\u5fc6\u3002\n\n' +
    '5. \u771f\u4eba\u8bb0\u5fc6\u611f\n' +
    '   - \u4fdd\u7559\u5177\u4f53\u7684\u3001\u6709\u753b\u9762\u611f\u7684\u7ec6\u8282\u3002\n\n' +
    '6. \u683c\u5f0f\n' +
    '   - \u5168\u7a0b\u4e2d\u6587\uff0c\u4ee5\u300c\u6211\u300d\uff08\u5373 ' + primaryCharName + '\uff09\u7684\u53e3\u543b\u3002\u63a7\u5236\u5728 80\uff5e200 \u5b57\u3002\n' +
    '   - \u4e0d\u52a0\u6807\u9898\u3001\u6807\u7b7e\u3001\u7f16\u53f7\u3002\u5fe0\u4e8e\u5185\u5bb9\uff0c\u7edd\u4e0d\u865a\u6784\u3002\u76f4\u63a5\u8f93\u51fa\u8bb0\u5fc6\u6587\u672c\u3002\n\n' +
    '\u573a\u666f\u5185\u5bb9\uff1a\n' + formatted + '\n\n\u8bf7\u76f4\u63a5\u4ee5\u300c\u6211\u300d\uff08' + primaryCharName + '\uff09\u7684\u7b2c\u4e00\u4eba\u79f0\u5199\u4e0b\u8fd9\u6bb5\u8bb0\u5fc6\u3002';

  console.log('[Meeting-Memory] Summary prompt perspective: Character "' + primaryCharName + '" as "I", User "' + userName + '" as third person');

  var result = await sendChat(api, [
    { role: 'system', content: prompt },
    { role: 'user', content: '\u8bf7\u5f00\u59cb\u8bb0\u5fc6\u3002' }
  ]);

  console.log('[Meeting-Memory] mtgCallSummarize result length:', (result || '').length);
  return result;
}


async function mtgCallConsolidate(session, stmList, api) {
  console.log('[Meeting-Memory] mtgCallConsolidate called | stmList:', stmList.length);

  if (!api || !api.url || !api.model) {
    throw new Error('[Meeting-Memory] No valid API config for consolidate');
  }
  if (typeof sendChat !== 'function') {
    throw new Error('[Meeting-Memory] sendChat is not available');
  }

  var userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : '\u7528\u6237';
  var charNames = (session.characters && session.characters.length)
    ? session.characters.join('\u3001') : '\u89d2\u8272';

  // ★★★ 修复 Bug 2：获取主要角色名 ★★★
  var primaryCharId = (session.charIds && session.charIds.length > 0) ? session.charIds[0] : null;
  var primaryChar = primaryCharId ? mtgGetCharById(primaryCharId) : null;
  var primaryCharName = primaryChar ? primaryChar.name : charNames;

  var formatted = stmList.map(function(m, i) {
    return '[\u7247\u6bb5 ' + (i + 1) + ' - ' + (m.date || '') + ']\n' + m.content;
  }).join('\n\n');

  var sessionLabel = session.name ? '\u300c' + session.name + '\u300d' : '\u8fd9\u6bb5\u7ecf\u5386';

  // ★★★ 修复 Bug 2：角色第一人称 ★★★
  var prompt = '\u4f60\u662f ' + primaryCharName + '\u3002\u4e0b\u9762\u662f\u4f60\u5728' + sessionLabel + '\u4e2d\u8bb0\u4e0b\u7684 ' + stmList.length + ' \u6bb5\u77ed\u671f\u8bb0\u5fc6\u788e\u7247\uff0c\u6d89\u53ca\u7684\u5bf9\u8bdd\u5bf9\u8c61\u6709 ' + userName + '\u3002\n' +
    '\u73b0\u5728\u4f60\u8981\u628a\u5b83\u4eec\u6574\u7406\u6210\u4e00\u6bb5\u5b8c\u6574\u7684\u957f\u671f\u8bb0\u5fc6\u3002\n\n' +
    '\u91cd\u8981\uff1a\u4f60\u662f ' + primaryCharName + '\uff0c\u300c\u6211\u300d\u6307\u7684\u662f ' + primaryCharName + '\u3002' + userName + ' \u662f\u4f60\u7684\u5bf9\u8bdd\u5bf9\u8c61\u3002\n\n' +
    '\u3010\u5199\u4f5c\u89c4\u5219\u3011\n\n' +
    '1. \u5408\u5e76\u91cd\u590d\u5185\u5bb9\uff0c\u53ea\u4fdd\u7559\u6700\u6709\u60c5\u611f\u91cd\u91cf\u7684\u7248\u672c\u3002\n' +
    '2. \u4fdd\u7559\u6240\u6709\u5173\u952e\u8f6c\u6298\u548c\u89d2\u8272\u7279\u5f81\u3002\n' +
    '3. \u6309\u65f6\u95f4\u987a\u5e8f\u7ec4\u7ec7\u3002\n' +
    '4. \u5199\u51fa\u60c5\u611f\u7684\u53d8\u5316\u548c\u5c42\u6b21\u3002\n' +
    '5. \u4fdd\u7559\u5177\u4f53\u7684\u3001\u6709\u753b\u9762\u611f\u7684\u7ec6\u8282\u3002\n' +
    '6. \u5168\u7a0b\u4e2d\u6587\uff0c\u4ee5\u300c\u6211\u300d\uff08\u5373 ' + primaryCharName + '\uff09\u7684\u53e3\u543b\u3002\u63a7\u5236\u5728 150\uff5e400 \u5b57\u3002\n' +
    '   \u4e0d\u52a0\u6807\u9898\u3001\u7f16\u53f7\u3002\u4e0d\u865a\u6784\u3002\u76f4\u63a5\u8f93\u51fa\u8bb0\u5fc6\u6587\u672c\u3002\n\n' +
    '\u77ed\u671f\u8bb0\u5fc6\u7247\u6bb5\uff1a\n' + formatted + '\n\n\u8bf7\u76f4\u63a5\u4ee5\u300c\u6211\u300d\uff08' + primaryCharName + '\uff09\u7684\u7b2c\u4e00\u4eba\u79f0\u5199\u4e0b\u8fd9\u6bb5\u957f\u671f\u8bb0\u5fc6\u3002';

  console.log('[Meeting-Memory] Consolidate prompt perspective: Character "' + primaryCharName + '" as "I"');

  var result = await sendChat(api, [
    { role: 'system', content: prompt },
    { role: 'user', content: '\u8bf7\u5f00\u59cb\u6574\u7406\u8bb0\u5fc6\u3002' }
  ]);

  console.log('[Meeting-Memory] mtgCallConsolidate result length:', (result || '').length);
  return result;
}


async function mtgCheckAutoSummarize(session) {
  if (!session) {
    console.log('[Meeting-Memory] mtgCheckAutoSummarize: no session, skip');
    return;
  }

  if (_mtgSummarizing) {
    console.log('[Meeting-Memory] Already summarizing, skip concurrent call');
    return;
  }

  mtgEnsureMemoryFields(session);

  if (!session.turnSummary) {
    console.log('[Meeting-Memory] Turn summary disabled for session:', session.id);
    return;
  }

  var interval = session.summaryInterval || MTG_DEFAULT_SUMMARY_INTERVAL;
  var unsummarizedTurns = mtgCountUnsummarizedTurns(session);

  console.log('[Meeting-Memory] Auto-check | unsummarized:', unsummarizedTurns,
    '| interval:', interval,
    '| lastIdx:', session.lastSummarizedEntryIdx,
    '| totalHistory:', session.history.length);

  if (unsummarizedTurns < interval) {
    console.log('[Meeting-Memory] Not yet reached interval (' + unsummarizedTurns + '/' + interval + '), skip');
    return;
  }

  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) {
    console.warn('[Meeting-Memory] No active API, cannot auto-summarize');
    return;
  }

  _mtgSummarizing = true;

  try {
    var allUnsummarized = mtgGetUnsummarizedEntries(session);
    var entriesToSummarize = _mtgSliceByTurns(allUnsummarized, interval);

    console.log('[Meeting-Memory] Auto-summarizing', entriesToSummarize.length,
      'entries (', interval, 'turns)...');

    var summary = await mtgCallSummarize(session, entriesToSummarize, api);

    if (!summary || !summary.trim()) {
      console.warn('[Meeting-Memory] Empty summary returned, skip saving');
      return;
    }

    var stm = {
      id: mtgUid(),
      date: new Date().toISOString().split('T')[0],
      content: summary.trim(),
      turnRange: [session.lastSummarizedEntryIdx,
                  session.lastSummarizedEntryIdx + entriesToSummarize.length],
      timestamp: Date.now(),
      _writtenToLibrary: false
    };
    session.shortTermMemories.push(stm);

    session.shortTermMemory.push({
      id: stm.id,
      round: session.turnCount || session.shortTermMemories.length,
      content: summary.trim(),
      timestamp: stm.timestamp
    });

    session.lastSummarizedEntryIdx += entriesToSummarize.length;
    saveState();

    console.log('[Meeting-Memory] STM #' + session.shortTermMemories.length + ' saved',
      '| length:', summary.length,
      '| preview:', summary.slice(0, 60) + '...');

    mtgAppendSummary(session.turnCount || session.shortTermMemories.length, summary);
    mtgRenderSettingsMemory();

    if (typeof showToast === 'function') {
      showToast(T('summarized') || '\u5df2\u603b\u7ed3');
    }

    _mtgSummarizing = false;
    var remainingTurns = mtgCountUnsummarizedTurns(session);
    if (remainingTurns >= interval) {
      console.log('[Meeting-Memory] Still', remainingTurns, 'turns unsummarized, continuing...');
      await mtgCheckAutoSummarize(session);
    }
  } catch (e) {
    console.error('[Meeting-Memory] Auto-summarize failed:', e);
  } finally {
    _mtgSummarizing = false;
  }
}

async function mtgSummarizeRemaining(session) {
  if (!session) {
    console.warn('[Meeting-Memory] mtgSummarizeRemaining: no session');
    return false;
  }
  mtgEnsureMemoryFields(session);

  var entries = mtgGetUnsummarizedEntries(session);
  var unsummarizedTurns = mtgCountUnsummarizedTurns(session);

  console.log('[Meeting-Memory] Summarize remaining | entries:', entries.length,
    '| turns:', unsummarizedTurns);

  if (entries.length < 2 || unsummarizedTurns < 1) {
    console.log('[Meeting-Memory] Not enough remaining entries to summarize');
    return false;
  }

  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) {
    console.warn('[Meeting-Memory] No active API for remaining summarize');
    return false;
  }
  if (typeof sendChat !== 'function') {
    console.warn('[Meeting-Memory] sendChat not available');
    return false;
  }

  console.log('[Meeting-Memory] Summarizing remaining', entries.length,
    'entries (', unsummarizedTurns, 'turns)...');

  try {
    var summary = await mtgCallSummarize(session, entries, api);

    if (!summary || !summary.trim()) {
      console.warn('[Meeting-Memory] Empty remaining summary, skip');
      return false;
    }

    var stm = {
      id: mtgUid(),
      date: new Date().toISOString().split('T')[0],
      content: summary.trim(),
      turnRange: [session.lastSummarizedEntryIdx,
                  session.lastSummarizedEntryIdx + entries.length],
      timestamp: Date.now(),
      _writtenToLibrary: false
    };
    session.shortTermMemories.push(stm);

    session.shortTermMemory.push({
      id: stm.id,
      round: session.turnCount || session.shortTermMemories.length,
      content: summary.trim(),
      timestamp: stm.timestamp
    });

    session.lastSummarizedEntryIdx += entries.length;
    saveState();

    console.log('[Meeting-Memory] Remaining STM saved',
      '| length:', summary.length,
      '| preview:', summary.slice(0, 60) + '...');
    return true;
  } catch (e) {
    console.error('[Meeting-Memory] Remaining summarize failed:', e);
    return false;
  }
}

async function mtgWriteToMemoryLibrary(sessionId) {
  var session;
  if (typeof sessionId === 'string') {
    session = mtgFindSession(sessionId);
  } else if (sessionId && sessionId.id) {
    session = sessionId;
  }
  if (!session) {
    console.error('[Meeting-Memory] mtgWriteToMemoryLibrary: session not found:', sessionId);
    return 0;
  }
  mtgEnsureMemoryFields(session);

  var unsummarized = mtgGetUnsummarizedEntries(session);
  if (unsummarized.length >= 2 && mtgCountUnsummarizedTurns(session) >= 1) {
    console.log('[Meeting-Memory] Step 1: Summarizing remaining', unsummarized.length, 'entries...');
    if (typeof showToast === 'function') {
      showToast(T('summarizing') || '\u6b63\u5728\u603b\u7ed3\u5269\u4f59\u5185\u5bb9...');
    }
    await mtgSummarizeRemaining(session);
  } else {
    console.log('[Meeting-Memory] Step 1: No remaining entries to summarize');
  }

  var stms = session.shortTermMemories || [];
  if (stms.length === 0) {
    console.log('[Meeting-Memory] No STMs to write');
    if (typeof showToast === 'function') {
      showToast(T('meetingEndNoMem') || '\u6682\u65e0\u77ed\u671f\u8bb0\u5fc6\u53ef\u5199\u5165');
    }
    return 0;
  }

  var primaryCharId = (session.charIds && session.charIds.length > 0)
    ? session.charIds[0] : null;
  var charNames = (session.characters && session.characters.length)
    ? session.characters.join('\u3001') : 'Meeting';

  console.log('[Meeting-Memory] Step 2: Writing', stms.length, 'STMs to memory library',
    '| primaryCharId:', primaryCharId, '| chars:', charNames);

  if (!Array.isArray(state.memories)) state.memories = [];

  var writtenCount = 0;
  stms.forEach(function(stm) {
    if (!stm._writtenToLibrary) {
      if (typeof saveMemoryEntry === 'function') {
        saveMemoryEntry(
          primaryCharId,
          'stm',
          (session.name || 'Meeting') + ' \u00b7 ' + charNames,
          stm.content
        );
      } else {
        state.memories.push({
          id: mtgUid(),
          title: (session.name || 'Meeting') + ' \u00b7 ' + charNames,
          date: stm.date || new Date().toISOString().split('T')[0],
          content: stm.content,
          mood: '', photo: null,
          charId: primaryCharId,
          memType: 'stm',
          autoGenerated: true,
          timestamp: stm.timestamp || Date.now()
        });
        console.log('[Meeting-Memory] Fallback: wrote STM directly to state.memories');
      }
      stm._writtenToLibrary = true;
      writtenCount++;
    }
  });

  saveState();
  console.log('[Meeting-Memory] Written', writtenCount, 'STMs to state.memories',
    '| Total memories now:', (state.memories || []).length);

  var threshold = session.consolidateThreshold || MTG_MEM_CONSOLIDATE_THRESHOLD;

  if (primaryCharId && typeof getUnconsolidatedSTM === 'function') {
    var unconsolidatedSTMs = getUnconsolidatedSTM(primaryCharId);

    console.log('[Meeting-Memory] Step 4: Consolidation check',
      '| unconsolidated:', unconsolidatedSTMs.length,
      '| threshold:', threshold);

    if (unconsolidatedSTMs.length >= threshold) {
      console.log('[Meeting-Memory] Threshold reached! Starting LTM consolidation...');
      if (typeof showToast === 'function') {
        showToast(T('consolidating') || '\u6b63\u5728\u5408\u5e76\u957f\u671f\u8bb0\u5fc6...');
      }

      var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
      if (api && api.url && api.model && typeof sendChat === 'function') {
        var toMerge = unconsolidatedSTMs.slice(0, threshold);

        try {
          var ltmContent = await mtgCallConsolidate(session, toMerge, api);

          if (ltmContent && ltmContent.trim()) {
            if (typeof saveMemoryEntry === 'function') {
              saveMemoryEntry(
                primaryCharId,
                'ltm',
                (T('longTermMemory') || 'LTM') + ': ' + (session.name || charNames),
                ltmContent.trim()
              );
            } else {
              state.memories.push({
                id: mtgUid(),
                title: (T('longTermMemory') || 'LTM') + ': ' + (session.name || charNames),
                date: new Date().toISOString().split('T')[0],
                content: ltmContent.trim(),
                mood: '', photo: null,
                charId: primaryCharId,
                memType: 'ltm',
                autoGenerated: true,
                timestamp: Date.now()
              });
            }

            toMerge.forEach(function(m) { m.consolidated = true; });
            saveState();

            console.log('[Meeting-Memory] LTM created!',
              '| length:', ltmContent.length,
              '| merged', toMerge.length, 'STMs',
              '| preview:', ltmContent.slice(0, 60) + '...');
          }
        } catch (e) {
          console.error('[Meeting-Memory] LTM consolidation failed:', e);
        }
      } else {
        console.warn('[Meeting-Memory] No API for consolidation');
      }
    } else {
      console.log('[Meeting-Memory] Consolidation not triggered (' +
        unconsolidatedSTMs.length + '/' + threshold + ')');
    }
  } else {
    console.log('[Meeting-Memory] getUnconsolidatedSTM not available, using session-level check');
    var unwritten = stms.filter(function(s) { return !s.consolidated; });
    if (unwritten.length >= threshold) {
      console.log('[Meeting-Memory] Session-level threshold reached:', unwritten.length, '/', threshold);
      var api2 = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
      if (api2 && api2.url && api2.model && typeof sendChat === 'function') {
        var toMerge2 = unwritten.slice(0, threshold);
        try {
          var ltm2 = await mtgCallConsolidate(session, toMerge2, api2);
          if (ltm2 && ltm2.trim()) {
            state.memories.push({
              id: mtgUid(),
              title: (T('longTermMemory') || 'LTM') + ': ' + (session.name || charNames),
              date: new Date().toISOString().split('T')[0],
              content: ltm2.trim(),
              mood: '', photo: null,
              charId: primaryCharId,
              memType: 'ltm',
              autoGenerated: true,
              timestamp: Date.now()
            });
            toMerge2.forEach(function(m) { m.consolidated = true; });
            saveState();
            console.log('[Meeting-Memory] Fallback LTM created! length:', ltm2.length);
          }
        } catch (e2) {
          console.error('[Meeting-Memory] Fallback LTM consolidation failed:', e2);
        }
      }
    }
  }

  mtgRenderSettingsMemory();
  if (typeof showToast === 'function') {
    showToast((T('meetingMemWrittenPre') || '\u5df2\u5199\u5165 ') + writtenCount +
      (T('meetingMemWrittenPost') || ' \u6761\u8bb0\u5fc6'));
  }

  return writtenCount;
}


/* ══════════════════════════════════
   End Session
   ══════════════════════════════════ */
function mtgEndSession(sessionId) {
  var session;
  if (sessionId) {
    session = mtgFindSession(sessionId);
  } else {
    session = mtgCurrentSession;
  }
  if (!session) {
    console.warn('[Meeting-Memory] mtgEndSession: no session found');
    return;
  }
  if (mtgGenerating) {
    if (typeof showToast === 'function') showToast(T('error'));
    return;
  }

  mtgEnsureMemoryFields(session);

  var turnCount = session.turnCount || 0;
  var msgCount = 0;
  (session.history || []).forEach(function(e) { if (e.role !== 'summary') msgCount++; });
  var memCount = session.shortTermMemories.length;
  var unsummarizedTurns = mtgCountUnsummarizedTurns(session);

  console.log('[Meeting-Memory] mtgEndSession called | turns:', turnCount,
    '| msgs:', msgCount, '| STMs:', memCount, '| unsummarized:', unsummarizedTurns);

  var msgText = (T('meetingEndMsg') || '\u672c\u6b21\u4f1a\u8bdd\u5df2\u8fdb\u884c {turns} \u8f6e\uff0c\u5171 {msgs} \u6761\u6d88\u606f\u3002')
    .replace('{turns}', turnCount)
    .replace('{msgs}', msgCount);

  if (unsummarizedTurns > 0) {
    msgText += '\n' + (state.lang === 'zh'
      ? '\u8fd8\u6709 ' + unsummarizedTurns + ' \u8f6e\u672a\u603b\u7ed3\uff0c\u5c06\u81ea\u52a8\u603b\u7ed3\u540e\u5199\u5165\u3002'
      : unsummarizedTurns + ' turns not yet summarized, will be summarized first.');
  }

  if (memCount > 0) {
    msgText += '\n' + (state.lang === 'zh'
      ? '\u5f53\u524d\u5df2\u6709 ' + memCount + ' \u6761\u77ed\u671f\u8bb0\u5fc6\u3002'
      : memCount + ' short-term memories ready.');
  }

  var subText = (memCount > 0 || unsummarizedTurns > 0)
    ? (T('meetingEndWriteQ') || '\u662f\u5426\u5c06\u77ed\u671f\u8bb0\u5fc6\u5199\u5165\u603b\u8bb0\u5fc6\u5e93\uff1f')
    : (T('meetingEndNoMem') || '\u6682\u65e0\u77ed\u671f\u8bb0\u5fc6\u53ef\u5199\u5165\u3002');

  var oldModal = document.getElementById('mtgEndModal');
  if (oldModal) oldModal.remove();

  var overlay = document.createElement('div');
  overlay.id = 'mtgEndModal';
  overlay.className = 'mtg-modal-overlay';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  var theSessionId = session.id;

  var mh = '<div class="mtg-modal">';
  mh += '<div class="mtg-modal-icon">';
  mh += '<svg viewBox="0 0 32 32" style="width:32px;height:32px;stroke:#86868b;fill:none;stroke-width:1.5">';
  mh += '<rect x="6" y="6" width="20" height="20" rx="4"/>';
  mh += '<path d="M12 16l3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/>';
  mh += '</svg></div>';
  mh += '<div class="mtg-modal-title">' + T('meetingEndTitle') + '</div>';
  mh += '<div class="mtg-modal-body">';
  mh += '<p>' + mtgEsc(msgText) + '</p>';
  mh += '<p class="mtg-modal-sub">' + mtgEsc(subText) + '</p>';
  mh += '</div>';
  mh += '<div class="mtg-modal-btns">';
  mh += '<button id="mtgEndWriteBtn" class="mtg-modal-btn mtg-modal-btn-primary">' + T('meetingSaveAndWrite') + '</button>';
  mh += '<button id="mtgEndSaveBtn" class="mtg-modal-btn mtg-modal-btn-secondary">' + T('meetingSaveOnly') + '</button>';
  mh += '<button id="mtgEndCancelBtn" class="mtg-modal-btn mtg-modal-btn-cancel">' + T('meetingContinueWrite') + '</button>';
  mh += '</div></div>';

  overlay.innerHTML = mh;
  document.body.appendChild(overlay);

  document.getElementById('mtgEndWriteBtn').onclick = async function() {
    this.disabled = true;
    this.textContent = '\u5904\u7406\u4e2d...';
    session.status = 'ended';
    saveState();
    await mtgWriteToMemoryLibrary(theSessionId);
    overlay.remove();
    mtgCurrentSession = null;
    mtgRenderArchiveList();
    nav('screen-meeting');
  };

  document.getElementById('mtgEndSaveBtn').onclick = function() {
    session.status = 'ended';
    saveState();
    if (typeof showToast === 'function') showToast(T('meetingSavedNoWrite'));
    overlay.remove();
    mtgCurrentSession = null;
    mtgRenderArchiveList();
    nav('screen-meeting');
  };

  document.getElementById('mtgEndCancelBtn').onclick = function() {
    overlay.remove();
  };
}

async function mtgManualWriteToMemory() {
  if (!mtgCurrentSession) {
    console.warn('[Meeting-Memory] mtgManualWriteToMemory: no active session');
    if (typeof showToast === 'function') showToast('No active session');
    return 0;
  }
  console.log('[Meeting-Memory] Manual write triggered for session:', mtgCurrentSession.id);
  var count = await mtgWriteToMemoryLibrary(mtgCurrentSession.id);
  mtgRenderSettingsMemory();
  return count;
}


/* ══════════════════════════════════
   Backward Compatibility
   ══════════════════════════════════ */
function openMeetingSettings() { openMeetingNewArchive(); }
function startMeetingSession() { mtgCreateArchive(); }
function renderMeetingCards() { mtgRenderArchiveList(); }
function openMeetingManageFromWrite() { openMeetingSettingsFromWrite(); }
function mtgSetToggleSeg(el) { mtgSegToggle(el); }
function mtgSetModeChanged() { mtgNewModeChanged(); }
function mtgSetSummaryToggled() { mtgNewSummaryToggled(); }
function mtgSetRenderCharSelect() { mtgRenderCharSelectList('mtgNewCharList', []); }
function exitMeetingSettings_legacy() { exitMeetingSettings(); }
function mtgCloseEndModal() { var el = document.getElementById('mtgEndModal'); if (el) el.remove(); }
function mtgConfirmEnd(writeToMemory) { /* replaced by mtgEndSession */ }
function mtgRenderSessionMemories(session) { mtgRenderSettingsMemory(); }


/* ══════════════════════════════════════════════════════════════
   ★★★ Diagnostic Test — __mizuMeetingTest ★★★
   ══════════════════════════════════════════════════════════════ */
function __mizuMeetingTest() {
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550 Mizu Meeting Memory Test \u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');

  var funcs = [
    { name: 'mtgEnsureMemoryFields',     ref: mtgEnsureMemoryFields },
    { name: 'mtgCheckAutoSummarize',     ref: mtgCheckAutoSummarize },
    { name: 'mtgSummarizeRemaining',     ref: mtgSummarizeRemaining },
    { name: 'mtgWriteToMemoryLibrary',   ref: mtgWriteToMemoryLibrary },
    { name: 'mtgEndSession',             ref: mtgEndSession },
    { name: 'mtgCallSummarize',          ref: mtgCallSummarize },
    { name: 'mtgCallConsolidate',        ref: mtgCallConsolidate },
    { name: 'mtgCountUnsummarizedTurns', ref: mtgCountUnsummarizedTurns },
    { name: 'mtgGetUnsummarizedEntries', ref: mtgGetUnsummarizedEntries },
    { name: 'mtgManualWriteToMemory',    ref: mtgManualWriteToMemory }
  ];

  var pass = 0, fail = 0;
  funcs.forEach(function(f) {
    var windowOk = typeof window[f.name] === 'function';
    var localOk  = typeof f.ref === 'function';
    if (windowOk && localOk) {
      console.log('%c  \u2705 ' + f.name, 'color:#34c759');
      pass++;
    } else {
      console.log('%c  \u274c ' + f.name +
        ' (window: ' + (windowOk ? 'OK' : 'MISSING') +
        ', local: ' + (localOk ? 'OK' : 'MISSING') + ')', 'color:#ff3b30');
      fail++;
    }
  });

  console.log('%c\u2500\u2500 Helper Functions \u2500\u2500', 'color:#8e8e93');
  var helpers = [
    { name: 'saveMemoryEntry',      avail: typeof saveMemoryEntry === 'function' },
    { name: 'getUnconsolidatedSTM', avail: typeof getUnconsolidatedSTM === 'function' },
    { name: 'sendChat',             avail: typeof sendChat === 'function' },
    { name: 'saveState',            avail: typeof saveState === 'function' },
    { name: 'showToast',            avail: typeof showToast === 'function' },
    { name: 'T (i18n)',             avail: typeof T === 'function' },
    { name: 'getActiveWorldBooks',  avail: typeof getActiveWorldBooks === 'function' },
    { name: 'getMaskForChar',       avail: typeof getMaskForChar === 'function' },
    { name: 'getActiveSystemPrompt',avail: typeof getActiveSystemPrompt === 'function' },
    { name: 'getCharMemoriesByType',avail: typeof getCharMemoriesByType === 'function' }
  ];
  helpers.forEach(function(h) {
    console.log('  ' + (h.avail ? '\u2705' : '\u26a0\ufe0f') + ' ' + h.name +
      (h.avail ? '' : ' (not found, fallback will be used)'));
  });

  console.log('%c\u2500\u2500 State Check \u2500\u2500', 'color:#8e8e93');
  var stateOk = typeof state !== 'undefined';
  console.log('  ' + (stateOk ? '\u2705' : '\u274c') + ' state object');
  if (stateOk) {
    console.log('    meetings: ' + (state.meetings || []).length);
    console.log('    memories: ' + (state.memories || []).length);
    console.log('    characters: ' + (state.characters || []).length);
    console.log('    worldbooks: ' + (state.worldbooks || []).length);
    console.log('    masks: ' + (state.masks || []).length);
    console.log('    apis: ' + (state.apis || []).length);
    console.log('    activeApiId: ' + (state.activeApiId || 'null'));
  }

  console.log('%c\u2500\u2500 Functional Test \u2500\u2500', 'color:#8e8e93');
  try {
    var testSession = {
      id: 'test-' + Date.now(),
      name: 'Test Session',
      history: [
        { id: 't1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: 't2', role: 'char', content: 'Hi there', charName: 'Test', timestamp: Date.now() }
      ],
      turnCount: 1,
      turnSummary: true,
      summaryInterval: 5,
      charIds: [],
      characters: ['Test']
    };

    mtgEnsureMemoryFields(testSession);
    console.log('  \u2705 mtgEnsureMemoryFields: shortTermMemories=' +
      testSession.shortTermMemories.length + ', lastIdx=' + testSession.lastSummarizedEntryIdx);

    var count = mtgCountUnsummarizedTurns(testSession);
    console.log('  \u2705 mtgCountUnsummarizedTurns: ' + count);

    var entries = mtgGetUnsummarizedEntries(testSession);
    console.log('  \u2705 mtgGetUnsummarizedEntries: ' + entries.length + ' entries');
  } catch (e) {
    console.error('  \u274c Functional test failed:', e);
    fail++;
  }

  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550 Result: ' + pass + '/' + funcs.length + ' passed \u2550\u2550\u2550\u2550\u2550\u2550',
    fail === 0 ? 'color:#34c759;font-weight:bold;font-size:14px' : 'color:#ff3b30;font-weight:bold;font-size:14px');

  if (fail === 0) {
    console.log('%c All meeting memory functions are properly defined and exported!', 'color:#34c759;font-size:12px');
  } else {
    console.log('%c ' + fail + ' functions are missing. Ensure meeting.js is properly loaded.', 'color:#ff3b30;font-size:12px');
  }

  return { pass: pass, fail: fail, total: funcs.length };
}


/* ══════════════════════════════════════════════════════════════
   ★★★ Prompt Integrity Test — __mizuMeetingPromptTest ★★★
   ══════════════════════════════════════════════════════════════ */
function __mizuMeetingPromptTest() {
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');
  console.log('%c  Mizu Meeting Prompt Integrity Test v2.1', 'color:#007aff;font-weight:bold;font-size:14px');
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');

  var pass = 0, fail = 0, warn = 0;

  function _pass(msg) { pass++; console.log('%c  \u2705 ' + msg, 'color:#34c759'); }
  function _fail(msg) { fail++; console.log('%c  \u274c ' + msg, 'color:#ff3b30'); }
  function _warn(msg) { warn++; console.log('%c  \u26a0\ufe0f ' + msg, 'color:#ff9500'); }

  // Step 0: Prerequisites
  console.log('%c\u2500\u2500 Step 0: Prerequisites \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (typeof state === 'undefined' || !state) { _fail('state object not found'); return; }
  else _pass('state object exists');

  if (typeof mtgBuildSystemPrompt !== 'function') { _fail('mtgBuildSystemPrompt function not found'); return; }
  else _pass('mtgBuildSystemPrompt function exists');

  var chars = state.characters || [];
  if (chars.length === 0) { _fail('No characters in state. Create a character first.'); return; }
  else _pass('Characters found: ' + chars.length);

  var worldbooks = state.worldbooks || [];
  console.log('  Total worldbooks: ' + worldbooks.length);
  var globalWbs = worldbooks.filter(function(wb) { return wb.isGlobal; });
  console.log('  Global worldbooks: ' + globalWbs.length);

  var masks = state.masks || [];
  console.log('  Total masks: ' + masks.length);

  // Step 1: Select test character
  console.log('%c\u2500\u2500 Step 1: Select Test Character \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var testChar = null;
  for (var i = 0; i < chars.length; i++) {
    if (chars[i].worldbookIds && chars[i].worldbookIds.length > 0) {
      testChar = chars[i];
      break;
    }
  }
  if (!testChar) testChar = chars[0];

  console.log('  Test character: ' + testChar.name + ' (id: ' + testChar.id + ')');
  console.log('  Has personality: ' + !!testChar.personality + (testChar.personality ? ' (' + testChar.personality.length + ' chars)' : ''));
  console.log('  Has background: ' + !!testChar.background + (testChar.background ? ' (' + testChar.background.length + ' chars)' : ''));
  console.log('  Has identity: ' + !!testChar.identity);
  console.log('  Has age: ' + !!testChar.age);
  console.log('  Has systemPrompt: ' + !!testChar.systemPrompt + (testChar.systemPrompt ? ' (' + testChar.systemPrompt.length + ' chars)' : ''));
  console.log('  worldbookIds: ' + JSON.stringify(testChar.worldbookIds || []));

  // Step 2: Mock session
  console.log('%c\u2500\u2500 Step 2: Build Mock Session \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var mockSession = {
    id: 'test-prompt-' + Date.now(),
    name: 'Prompt Test Session',
    mode: 'continue',
    charPerson: 'first',
    userPerson: 'first',
    wc: { min: 100, max: 300 },
    charIds: [testChar.id],
    characters: [testChar.name],
    worldview: 'A fantasy world with magic and dragons.',
    identity: 'A traveling merchant.',
    turnSummary: false,
    summaryInterval: 5,
    contextCount: 50,
    history: [],
    shortTermMemories: [],
    shortTermMemory: [],
    lastSummarizedEntryIdx: 0,
    status: 'active'
  };

  console.log('  Mock session created (mode: continue)');

  // Step 3: Generate prompt
  console.log('%c\u2500\u2500 Step 3: Generate System Prompt \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var prompt = '';
  try {
    prompt = mtgBuildSystemPrompt(mockSession, testChar);
    _pass('mtgBuildSystemPrompt executed | length: ' + prompt.length + ' chars');
  } catch (e) {
    _fail('mtgBuildSystemPrompt threw error: ' + e.message);
    return;
  }

  // Step 4: Verify character profile
  console.log('%c\u2500\u2500 Step 4: Verify Character Profile \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (prompt.indexOf(testChar.name) >= 0) _pass('Character name "' + testChar.name + '" found');
  else _fail('Character name "' + testChar.name + '" NOT found');

  if (prompt.indexOf('CHARACTER PROFILE') >= 0) _pass('CHARACTER PROFILE section found');
  else _fail('CHARACTER PROFILE section NOT found');

  if (testChar.personality) {
    if (prompt.indexOf(testChar.personality.substring(0, 30)) >= 0) _pass('Personality content found');
    else _fail('Personality content NOT found');
  } else _warn('No personality field on character');

  if (testChar.background) {
    if (prompt.indexOf(testChar.background.substring(0, 30)) >= 0) _pass('Background content found');
    else _fail('Background content NOT found');
  } else _warn('No background field on character');

  if (testChar.identity) {
    if (prompt.indexOf(testChar.identity.substring(0, 20)) >= 0) _pass('Identity content found');
    else _fail('Identity content NOT found');
  } else _warn('No identity field on character');

  if (testChar.systemPrompt) {
    if (prompt.indexOf(testChar.systemPrompt.substring(0, 30)) >= 0) _pass('systemPrompt content found');
    else _fail('systemPrompt content NOT found');
  } else _warn('No systemPrompt field on character');

  // Step 5: Verify worldbooks
  console.log('%c\u2500\u2500 Step 5: Verify Worldbooks \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var charWbIds = testChar.worldbookIds || [];
  var expectedWbs = worldbooks.filter(function(wb) {
    return wb.isGlobal || charWbIds.indexOf(wb.id) >= 0;
  });

  if (expectedWbs.length === 0) {
    _warn('No worldbooks expected (no global + no character-bound)');
  } else {
    if (prompt.indexOf('World Setting') >= 0) _pass('World Setting section found');
    else _fail('World Setting section NOT found');

    expectedWbs.forEach(function(wb) {
      if (prompt.indexOf(wb.name) >= 0) _pass('Worldbook "' + wb.name + '" (' + (wb.isGlobal ? 'global' : 'char') + ') found');
      else _fail('Worldbook "' + wb.name + '" (' + (wb.isGlobal ? 'global' : 'char') + ') NOT found');
    });
  }

  // Step 6: Verify mask
  console.log('%c\u2500\u2500 Step 6: Verify Mask \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var expectedMask = masks.find(function(m) {
    return (m.charIds || []).indexOf(testChar.id) >= 0;
  });

  if (expectedMask) {
    if (prompt.indexOf('User Identity') >= 0 || prompt.indexOf('Mask') >= 0) _pass('Mask section found');
    else _fail('Mask section NOT found');

    if (expectedMask.persona && prompt.indexOf(expectedMask.persona.substring(0, 20)) >= 0) _pass('Mask persona found');
    else if (expectedMask.persona) _fail('Mask persona NOT found');

    if (expectedMask.name && prompt.indexOf(expectedMask.name) >= 0) _pass('Mask name found');
    else if (expectedMask.name) _fail('Mask name NOT found');
  } else {
    _warn('No mask bound to "' + testChar.name + '"');
  }

  // Step 7: Verify writing rules
  console.log('%c\u2500\u2500 Step 7: Verify Writing Rules \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (prompt.indexOf('COLLABORATIVE WRITING') >= 0) _pass('Writing rules section found');
  else _fail('Writing rules section NOT found');

  // Step 8: IF mode test
  console.log('%c\u2500\u2500 Step 8: IF Mode Test \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var ifSession = JSON.parse(JSON.stringify(mockSession));
  ifSession.mode = 'if';
  try {
    var ifPrompt = mtgBuildSystemPrompt(ifSession, testChar);
    if (ifPrompt.indexOf('WORLDVIEW') >= 0) _pass('IF mode: WORLDVIEW section found');
    else _fail('IF mode: WORLDVIEW section missing');
    if (ifPrompt.indexOf('USER IDENTITY') >= 0 || ifPrompt.indexOf('traveling merchant') >= 0) _pass('IF mode: USER IDENTITY found');
    else _fail('IF mode: USER IDENTITY missing');
  } catch (e) {
    _fail('IF mode prompt failed: ' + e.message);
  }

  // Step 9: Multi-char test
  console.log('%c\u2500\u2500 Step 9: Multi-Character Test \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (chars.length >= 2) {
    var multiSession = JSON.parse(JSON.stringify(mockSession));
    multiSession.charIds = [chars[0].id, chars[1].id];
    multiSession.characters = [chars[0].name, chars[1].name];
    try {
      var multiPrompt = mtgBuildSystemPrompt(multiSession, chars[0]);
      if (multiPrompt.indexOf('Group Scene') >= 0 || multiPrompt.indexOf(chars[1].name) >= 0)
        _pass('Multi-char: Other character "' + chars[1].name + '" mentioned');
      else _fail('Multi-char: Other character NOT mentioned');
    } catch (e) {
      _fail('Multi-char prompt failed: ' + e.message);
    }
  } else _warn('Only 1 character, skipping multi-char test');

  // Step 10: Helper functions
  console.log('%c\u2500\u2500 Step 10: Helper Functions \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  [
    ['getActiveWorldBooks', typeof getActiveWorldBooks],
    ['getMaskForChar', typeof getMaskForChar],
    ['getActiveSystemPrompt', typeof getActiveSystemPrompt],
    ['getCharMemoriesByType', typeof getCharMemoriesByType],
    ['sendChat', typeof sendChat]
  ].forEach(function(h) {
    if (h[1] === 'function') _pass(h[0] + ' available');
    else _warn(h[0] + ' NOT available (fallback used)');
  });

  // Step 11: Print full prompt
  console.log('%c\u2500\u2500 Step 11: Full Prompt Output \u2500\u2500', 'color:#8e8e93;font-weight:bold');
  console.log('%c BEGIN SYSTEM PROMPT (' + prompt.length + ' chars)', 'color:#007aff');
  var lines = prompt.split('\n');
  var section = '';
  var sn = 0;
  for (var li = 0; li < lines.length; li++) {
    section += lines[li] + '\n';
    if (section.length > 800 || li === lines.length - 1) {
      sn++;
      console.log('  [Part ' + sn + ']\n' + section);
      section = '';
    }
  }
  console.log('%c END SYSTEM PROMPT', 'color:#007aff');

  // Step 12: Full messages array
  console.log('%c\u2500\u2500 Step 12: Full Messages Array \u2500\u2500', 'color:#8e8e93;font-weight:bold');
  try {
    var ctxMsgs = mtgBuildContextMessages(mockSession, testChar);
    var fullMessages = [{ role: 'system', content: prompt }].concat(ctxMsgs);
    console.log('  Total messages: ' + fullMessages.length);
    fullMessages.forEach(function(m, idx) {
      console.log('    [' + idx + '] role: ' + m.role + ' | length: ' + (m.content || '').length);
    });
    _pass('Full messages array: ' + fullMessages.length + ' messages');
  } catch (e) {
    _fail('mtgBuildContextMessages failed: ' + e.message);
  }

  // Summary
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');
  var total = pass + fail;
  var summary = '  Results: ' + pass + ' passed, ' + fail + ' failed, ' + warn + ' warnings / ' + total + ' checks';
  console.log('%c' + summary, fail === 0 ? 'color:#34c759;font-weight:bold;font-size:13px' : 'color:#ff3b30;font-weight:bold;font-size:13px');

  if (fail > 0 || warn > 0) {
    console.log('%c\u2500\u2500 Quick Fix Suggestions \u2500\u2500', 'color:#ff9500;font-weight:bold');
    if (!testChar.personality) console.log('  Add personality: state.characters.find(c=>c.id==="' + testChar.id + '").personality = "..."; saveState();');
    if (!testChar.background) console.log('  Add background: state.characters.find(c=>c.id==="' + testChar.id + '").background = "..."; saveState();');
    if (expectedWbs.length === 0 && worldbooks.length > 0) console.log('  Bind worldbook or set one as global');
    if (!expectedMask && masks.length === 0) console.log('  Create a mask and bind it to a character');
  }

  return { pass: pass, fail: fail, warn: warn, total: total, promptLength: prompt.length };
}


/* ══════════════════════════════════
   ★★★ Global Exports ★★★
   ══════════════════════════════════ */
;(function _exportMeetingGlobals() {
  'use strict';
  try {
    // Core business functions
    window.mtgEnsureMemoryFields     = mtgEnsureMemoryFields;
    window.mtgCheckAutoSummarize     = mtgCheckAutoSummarize;
    window.mtgSummarizeRemaining     = mtgSummarizeRemaining;
    window.mtgWriteToMemoryLibrary   = mtgWriteToMemoryLibrary;
    window.mtgEndSession             = mtgEndSession;
    window.mtgCallSummarize          = mtgCallSummarize;
    window.mtgCallConsolidate        = mtgCallConsolidate;
    window.mtgCountUnsummarizedTurns = mtgCountUnsummarizedTurns;
    window.mtgGetUnsummarizedEntries = mtgGetUnsummarizedEntries;
    window.mtgManualWriteToMemory    = mtgManualWriteToMemory;

    // UI & page functions
    window.initMeetingPage           = initMeetingPage;
    window.mtgRenderArchiveList      = mtgRenderArchiveList;
    window.openMeetingNewArchive     = openMeetingNewArchive;
    window.exitMeetingNew            = exitMeetingNew;
    window.mtgNewModeChanged         = mtgNewModeChanged;
    window.mtgNewSummaryToggled      = mtgNewSummaryToggled;
    window.mtgCreateArchive          = mtgCreateArchive;
    window.openMeetingManage         = openMeetingManage;
    window.exitMeetingManage         = exitMeetingManage;
    window.mtgOpenSettingsForArchive = mtgOpenSettingsForArchive;
    window.openMeetingSettingsFromWrite = openMeetingSettingsFromWrite;
    window.exitMeetingSettings       = exitMeetingSettings;
    window.mtgSaveSettings           = mtgSaveSettings;
    window.mtgDeleteArchive          = mtgDeleteArchive;
    window.openMeetingWrite          = openMeetingWrite;
    window.exitMeetingWrite          = exitMeetingWrite;
    window.meetingWriteSend          = meetingWriteSend;
    window.mtgDeleteEntry            = mtgDeleteEntry;
    window.mtgEditEntry              = mtgEditEntry;
    window.mtgRegenerateEntry        = mtgRegenerateEntry;
    window.mtgCancelEdit             = mtgCancelEdit;
    window.mtgSegToggle              = mtgSegToggle;
    window.mtgRenderSettingsMemory   = mtgRenderSettingsMemory;
    window.mtgRenderSessionMemories  = mtgRenderSessionMemories;

    // ★★★ v2.1: Prompt builder (exported for testing)
    window.mtgBuildSystemPrompt      = mtgBuildSystemPrompt;
    window.mtgBuildContextMessages   = mtgBuildContextMessages;

    // Backward compat
    window.openMeetingSettings       = openMeetingSettings;
    window.startMeetingSession       = startMeetingSession;
    window.renderMeetingCards        = renderMeetingCards;
    window.mtgCloseEndModal          = mtgCloseEndModal;

    // Test functions
    window.__mizuMeetingTest         = __mizuMeetingTest;
    window.__mizuMeetingPromptTest   = __mizuMeetingPromptTest;

    console.log('[Meeting v2.1] All globals exported.',
      '| Core: 10 | Prompt: mtgBuildSystemPrompt + mtgBuildContextMessages',
      '| Tests: __mizuMeetingTest + __mizuMeetingPromptTest');
  } catch (exportErr) {
    console.error('[Meeting v2.1] Global export FAILED:', exportErr);
  }
})();


window.mtgSettingsSummaryToggled = mtgSettingsSummaryToggled;
