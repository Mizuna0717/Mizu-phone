// ========== meeting-core.js ==========
// Meeting Core — 狀態管理、工具函數、記憶欄位相容性處理
// ★★★ v2.1: 核心底層模組 ★★★

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
   Unsummarized Turn Counting & Entry Extraction (計算工具)
   ══════════════════════════════════ */
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
