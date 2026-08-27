// ========== meeting.js ==========
// Meeting — Complete Redesign
// Card-based UI · Grey-white · Line icons · No emoji

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
var mtgCurrentSession = null;
var mtgGenerating = false;
var mtgEditingEntryId = null;
var mtgSettingsReturnTo = 'screen-meeting-write';

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

  // Card body — clickable to enter
  h += '<div class="mtg-archive-card-body" onclick="openMeetingWrite(\'' + s.id + '\')">';

  // Name
  h += '<div class="mtg-archive-card-name">' + mtgEsc(s.name) + '</div>';

  // Info rows
  h += '<div class="mtg-archive-card-info">';

  // Characters
  h += '<div class="mtg-archive-info-row">';
  h += '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg>';
  h += '<span>' + mtgEsc(charNames) + '</span>';
  h += '</div>';

  // Date + Status
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

  h += '</div>';
  h += '</div>'; // card-info
  h += '</div>'; // card-body

  // Action bar
  h += '<div class="mtg-archive-actions">';
  h += '<button class="mtg-archive-action-btn" onclick="event.stopPropagation();mtgOpenSettingsForArchive(\'' + s.id + '\')">';
  h += '<svg viewBox="0 0 16 16"><path d="M10 2l4 4M3 9l7-7 4 4-7 7H3V9z"/></svg>';
  h += '<span>' + T('meetingEdit') + '</span>';
  h += '</button>';
  h += '<button class="mtg-archive-action-btn" onclick="event.stopPropagation();mtgDeleteArchive(\'' + s.id + '\')">';
  h += '<svg viewBox="0 0 16 16"><path d="M3 4h10"/><path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1"/><path d="M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>';
  h += '<span>' + T('meetingDelete') + '</span>';
  h += '</button>';
  h += '</div>';

  h += '</div>'; // archive-card
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
   1. MAIN PAGE — Archive List (grouped by mode)
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

  // Separate by mode
  var continueList = list.filter(function(s) { return s.mode === 'continue'; });
  var ifList = list.filter(function(s) { return s.mode === 'if'; });

  var h = '';

  // Continue section
  if (continueList.length > 0) {
    h += _mtgGroupHeaderHTML('continue');
    continueList.forEach(function(s) {
      h += _mtgArchiveCardHTML(s);
    });
  }

  // IF section
  if (ifList.length > 0) {
    h += _mtgGroupHeaderHTML('if');
    ifList.forEach(function(s) {
      h += _mtgArchiveCardHTML(s);
    });
  }

  container.innerHTML = h;
}


/* ══════════════════════════════════
   2. NEW ARCHIVE PAGE
   ══════════════════════════════════ */
function openMeetingNewArchive() {
  // Reset form
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

function exitMeetingNew() {
  nav('screen-meeting');
}

function mtgNewModeChanged() {
  var modeEl = document.querySelector('#mtgNewModeSeg .mtg-seg-opt.active');
  var isIF = modeEl && modeEl.dataset.value === 'if';
  ['mtgNewWorldviewWrap', 'mtgNewIdentityWrap'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = isIF ? '' : 'none';
  });
}

function mtgNewSummaryToggled() {
  var toggle = document.getElementById('mtgNewToggleSummary');
  var wrap = document.getElementById('mtgNewSummaryIntervalWrap');
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
    shortTermMemory: [],
    turnCount: 0,
    status: 'active'
  };

  mtgEnsureState();
  state.meetings.unshift(session);
  saveState();

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

    // Characters
    h += '<div class="mtg-manage-info-row">';
    h += '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg>';
    h += '<span>' + mtgEsc(charNames) + '</span>';
    h += '</div>';

    // Date
    h += '<div class="mtg-manage-info-row">';
    h += '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 1.5v3M11 1.5v3M2 6.5h12"/></svg>';
    h += '<span>' + dateStr + '</span>';
    h += '</div>';

    h += '</div>'; // card-info
    h += '</div>'; // manage-card
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

 
  // Render memory list
  mtgRenderSettingsMemory();
}

function mtgRenderSettingsMemory() {
  var c = document.getElementById('mtgSettingsMemoryList');
  if (!c || !mtgCurrentSession) return;

  var mems = mtgCurrentSession.shortTermMemory || [];
  if (mems.length === 0) {
    c.innerHTML =
      '<div class="mtg-form-card" style="padding:24px;text-align:center;color:#86868b;font-size:14px">' +
        T('meetingNoMemories') +
      '</div>';
    return;
  }

  var h = '';
  mems.forEach(function(m) {
    h += '<div class="mtg-mem-card">';
    h += '<div class="mtg-mem-round">' + T('meetingSummaryRound') + ' ' + m.round + '</div>';
    h += '<div class="mtg-mem-text">' + mtgEsc(m.content) + '</div>';
    h += '</div>';
  });
  c.innerHTML = h;
}

function exitMeetingSettings() {
  var returnTo = mtgSettingsReturnTo || 'screen-meeting';
  if (returnTo === 'screen-meeting') {
    mtgRenderArchiveList();
  }
  nav(returnTo);
}

function mtgSaveSettings() {
  var s = mtgCurrentSession;
  if (!s) return;

  var nameEl = document.getElementById('mtgSettingsName');
  if (nameEl && nameEl.value.trim()) s.name = nameEl.value.trim();

  // Update characters
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


  saveState();
  showToast(T('meetingSaveChanges'));

  // Update write screen title if returning there
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
  if (mtgCurrentSession && mtgCurrentSession.id === id) {
    mtgCurrentSession = null;
  }
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


/* ── Build avatar HTML ── */
function _mtgAvatarHTML(role, entry) {
  if (role === 'user') {
    var ua = mtgGetUserAvatar();
    if (ua) {
      return '<div class="mtg-msg-avatar"><img src="' + ua + '" alt=""></div>';
    }
    return '<div class="mtg-msg-avatar"><div class="mtg-msg-avatar-placeholder"><svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg></div></div>';
  }
  if (role === 'char' && entry && entry.charId) {
    var ca = mtgGetCharAvatar(entry.charId);
    if (ca) {
      return '<div class="mtg-msg-avatar"><img src="' + ca + '" alt=""></div>';
    }
  }
  // Default avatar
  return '<div class="mtg-msg-avatar"><div class="mtg-msg-avatar-placeholder"><svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M2.5 15c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/></svg></div></div>';
}


/* ── Build message card HTML ── */
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

  // Header with avatar
  h += '<div class="mtg-msg-header">';
  h += _mtgAvatarHTML(entry.role, entry);
  h += '<div class="mtg-msg-meta">';
  h += '<span class="mtg-msg-sender">' + mtgEsc(sender) + '</span>';
  if (time) h += '<span class="mtg-msg-time">' + time + '</span>';
  h += '</div>';
  h += '</div>';

  // Body
  h += '<div class="mtg-msg-body">' + mtgEsc(entry.content) + '</div>';

  // Actions (user & char only)
  if (isUser) {
    h += '<div class="mtg-msg-actions">';
    h += '<button class="mtg-msg-action-btn" onclick="mtgDeleteEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M3 4h10"/><path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1"/><path d="M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>';
    h += '<span>' + T('meetingDelete') + '</span></button>';
    h += '<button class="mtg-msg-action-btn" onclick="mtgEditEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M11 2l3 3M3 10l8-8 3 3-8 8H3v-3z"/></svg>';
    h += '<span>' + T('meetingEdit') + '</span></button>';
    h += '</div>';
  } else if (isChar) {
    h += '<div class="mtg-msg-actions">';
    h += '<button class="mtg-msg-action-btn" onclick="mtgRegenerateEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M2 8a6 6 0 0111-3"/><path d="M14 8a6 6 0 01-11 3"/><path d="M13 2v3h-3"/><path d="M3 14v-3h3"/></svg>';
    h += '<span>' + T('meetingRetry') + '</span></button>';
    h += '<button class="mtg-msg-action-btn" onclick="mtgEditEntry(\'' + eid + '\')">';
    h += '<svg viewBox="0 0 16 16"><path d="M11 2l3 3M3 10l8-8 3 3-8 8H3v-3z"/></svg>';
    h += '<span>' + T('meetingEdit') + '</span></button>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}


/* ── Render full chat ── */
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


/* ── Append a single card ── */
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


/* ── Typing indicator ── */
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

/* ── Delete ── */
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

/* ── Edit ── */
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

/* ── Regenerate (char only) ── */
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
    console.error('[Meeting Regenerate]', e);
    showToast(T('error') + ': ' + (e.message || String(e)));
  } finally {
    mtgGenerating = false;
    mtgSetSendEnabled(true);
    mtgHideTyping();
  }
}


/* ── Edit Banner ── */
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
  if (inp) {
    inp.value = '';
    inp.style.height = 'auto';
  }
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

  // ── Editing mode ──
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

  // ── Normal send ──
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
    // ── 逐角色生成，各自独立 try/catch ──
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
        // 单角色失败：记录错误，继续下一个角色
        console.error('[Meeting AI] Character "' + ch.name + '" failed:', charErr);
      }
    }

    saveState();

    // ── 回合摘要（仅写入 shortTermMemory，不写入 history）──
    if (session.turnSummary && session.summaryInterval > 0 &&
        session.turnCount > 0 && session.turnCount % session.summaryInterval === 0) {
      await mtgDoSummary(session);
    }
  } catch (e) {
    console.error('[Meeting AI]', e);
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
    console.error('[Meeting] Initial scene failed:', e);
  } finally {
    mtgGenerating = false;
    mtgSetSendEnabled(true);
    mtgHideTyping();
  }
}

/* ── Build System Prompt ── */
function mtgBuildSystemPrompt(session, ch) {
  var p = '';

  p += 'You are ' + ch.name + '.\n';
  if (ch.prompt) p += ch.prompt + '\n';
  if (ch.notes) p += '\nNotes: ' + ch.notes + '\n';
  p += '\n';

  if (session.mode === 'if') {
    if (session.worldview) p += 'WORLDVIEW:\n' + session.worldview + '\n\n';
    if (session.identity)  p += 'IDENTITY:\n' + session.identity + '\n\n';
  }

  var cpDesc = { first: 'first person (I, me, my)', second: 'second person (you, your)', third: 'third person (' + ch.name + ', he/she/they)' };
  var upDesc = { first: 'first person (I, me, my)', second: 'second person (you, your)', third: 'third person' };

  p += '--- COLLABORATIVE WRITING SESSION RULES ---\n';
  p += '1. Write your response using ' + (cpDesc[session.charPerson] || cpDesc.first) + ' narration.\n';
  p += '2. The user writes in ' + (upDesc[session.userPerson] || upDesc.first) + '.\n';
  p += '3. Your response MUST be between ' + session.wc.min + ' and ' + session.wc.max + ' words. Count carefully.\n';
  p += '4. Stay completely in character.\n';
  p += '5. Advance the story naturally. Do not repeat the user\'s content.\n';
  p += '6. Output only narrative prose. No meta-commentary, no character name prefix.\n';
  p += '---\n';

  if (session.shortTermMemory && session.shortTermMemory.length > 0) {
    p += '\nSTORY SUMMARIES (for context):\n';
    session.shortTermMemory.forEach(function(mem) {
      p += '- Round ' + mem.round + ': ' + mem.content + '\n';
    });
    p += '\n';
  }

  return p;
}

/* ── Build Context Messages (with contextCount + mode logic) ── */
function mtgBuildContextMessages(session, ch) {
  var N = session.contextCount || 50;
  var msgs = [];

  // 收集 Meeting 历史（排除 summary）
  var meetingEntries = (session.history || []).filter(function(e) {
    return e.role !== 'summary';
  });
  var M = meetingEntries.length;

  // 确定要发送的 Meeting 条目
  var meetingToSend = (M >= N) ? meetingEntries.slice(-N) : meetingEntries;

  // ── iMessage 补充：仅限 Continue 模式，且 Meeting 记录不足时 ──
  // IF 模式绝不补充 iMessage
  if (session.mode === 'continue' && M < N && ch) {
    var imsgNeeded = N - M;
    var chatHist = (state.chats && state.chats[ch.id]) ? state.chats[ch.id] : [];
    var recent = chatHist.slice(-imsgNeeded);
    if (recent.length > 0) {
      var ctx = '[Previous conversation between ' + ch.name + ' and the user — for context only]\n\n';
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

  // ── Meeting 条目 ──
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
/* ── Turn Summary ── */
async function mtgDoSummary(session) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model || typeof sendChat !== 'function') return;

  var recentEntries = [];
  (session.history || []).forEach(function(e) {
    if (e.role !== 'summary') recentEntries.push(e);
  });
  var count = (session.summaryInterval || MTG_DEFAULT_SUMMARY_INTERVAL) * 3;
  recentEntries = recentEntries.slice(-count);
  if (recentEntries.length === 0) return;

  var summaryPrompt = 'Summarize the following collaborative story entries concisely. Focus on:\n' +
    '- Key plot developments\n- Character emotional changes\n- Important decisions\n' +
    'Keep the summary under 150 words.\n\n';

  recentEntries.forEach(function(e) {
    var lbl = e.role === 'user' ? 'User' : (e.charName || 'Character');
    summaryPrompt += lbl + ': ' + e.content + '\n';
  });

  try {
    var summary = await sendChat(api, [{ role: 'system', content: summaryPrompt }]);
    if (summary && summary.trim()) {
      var mem = {
        id: mtgUid(),
        round: session.turnCount,
        content: summary.trim(),
        timestamp: Date.now()
      };
      if (!session.shortTermMemory) session.shortTermMemory = [];
      session.shortTermMemory.push(mem);

      // ★ 已移除: 不再将 summary 写入 session.history ★
      // 仅做当次会话的即时可视展示
      mtgAppendSummary(session.turnCount, summary.trim());
      saveState();
    }
  } catch (e) {
    console.warn('[Meeting] Summary failed:', e);
  }
}


/* ══════════════════════════════════
   End Session
   ══════════════════════════════════ */
function mtgEndSession() {
  if (!mtgCurrentSession) return;
  if (mtgGenerating) { showToast(T('error')); return; }

  mtgCloseEndModal();

  var s = mtgCurrentSession;
  var turnCount = s.turnCount || 0;
  var msgCount = 0;
  (s.history || []).forEach(function(e) { if (e.role !== 'summary') msgCount++; });
  var memCount = (s.shortTermMemory || []).length;

  var overlay = document.createElement('div');
  overlay.id = 'mtgEndModal';
  overlay.className = 'mtg-modal-overlay';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) mtgCloseEndModal();
  });

  var msgText = T('meetingEndMsg').replace('{turns}', turnCount).replace('{msgs}', msgCount);
  var subText = memCount > 0 ? T('meetingEndWriteQ') : T('meetingEndNoMem');

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
  mh += '<button class="mtg-modal-btn mtg-modal-btn-primary" onclick="mtgConfirmEnd(true)">' + T('meetingSaveAndWrite') + '</button>';
  mh += '<button class="mtg-modal-btn mtg-modal-btn-secondary" onclick="mtgConfirmEnd(false)">' + T('meetingSaveOnly') + '</button>';
  mh += '<button class="mtg-modal-btn mtg-modal-btn-cancel" onclick="mtgCloseEndModal()">' + T('meetingContinueWrite') + '</button>';
  mh += '</div></div>';

  overlay.innerHTML = mh;
  document.body.appendChild(overlay);
}

function mtgCloseEndModal() {
  var el = document.getElementById('mtgEndModal');
  if (el) el.remove();
}

function mtgConfirmEnd(writeToMemory) {
  var s = mtgCurrentSession;
  if (!s) { mtgCloseEndModal(); return; }

  s.status = 'ended';

  if (writeToMemory) {
    if (!Array.isArray(state.memories)) state.memories = [];
    var mems = s.shortTermMemory || [];
    var count = 0;
    var today = new Date().toISOString().split('T')[0];

    mems.forEach(function(mem) {
      var tags = ['meeting', s.mode];
      if (s.charIds && s.charIds.length) tags = tags.concat(s.charIds);

      state.memories.push({
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        charId: null, memType: 'ftm',
        title: 'Meeting: ' + s.name + ' (Round ' + mem.round + ')',
        content: mem.content, date: today, mood: '', photo: null,
        timestamp: Date.now(), tags: tags
      });
      count++;
    });

    saveState();
    showToast(T('meetingMemWrittenPre') + count + T('meetingMemWrittenPost'));
  } else {
    saveState();
    showToast(T('meetingSavedNoWrite'));
  }

  mtgCloseEndModal();
  mtgCurrentSession = null;
  mtgRenderArchiveList();
  nav('screen-meeting');
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
