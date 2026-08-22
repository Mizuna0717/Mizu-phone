// ========== meeting.js ==========
// Meeting — Batch 2: Vertical Layout + AI Writing + Manage Page
// No emoji. Line icons. Grey-white palette.

/* ══════════════════════════════════
   Constants & State
   ══════════════════════════════════ */
var MTG_CONTEXT_COUNT = 50;
var MTG_DEFAULT_SUMMARY_INTERVAL = 5;
var mtgCurrentSession = null;
var mtgGenerating = false;

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
  if (isNaN(d.getTime())) return ds;
  if (typeof state !== 'undefined' && state.lang === 'zh') {
    return (d.getMonth() + 1) + '\u6708' + d.getDate() + '\u65e5';
  }
  var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m[d.getMonth()] + ' ' + d.getDate();
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

function mtgGetSessions(mode) {
  mtgEnsureState();
  return state.meetings.filter(function(s) { return s.mode === mode; });
}

function mtgFindSession(id) {
  mtgEnsureState();
  for (var i = 0; i < state.meetings.length; i++) {
    if (state.meetings[i].id === id) return state.meetings[i];
  }
  return null;
}

/* ══════════════════════════════════
   Main Page — vertical layout
   ══════════════════════════════════ */
function initMeetingPage() {
  mtgEnsureState();
  renderMeetingCards();
}

function renderMeetingCards() {
  mtgRenderList('continue', 'meetingContinueCards');
  mtgRenderList('if', 'meetingIFCards');
}

function mtgRenderList(mode, cid) {
  var c = document.getElementById(cid);
  if (!c) return;
  var list = mtgGetSessions(mode);

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

  list.forEach(function(s, i) {
    var last = i === list.length - 1;
    var clr = colors[i % colors.length];
    var dl = mtgFormatDate(s.date);
    var cl = (s.characters && s.characters.length) ? s.characters.join(', ') : T('meetingNoCharsSelected');
    var tc = s.turnCount || 0;

    h += '<div style="display:flex;align-items:center;padding:14px 16px;gap:14px;cursor:pointer' +
         (last ? '' : ';border-bottom:1px solid #f2f2f7') +
         '" onclick="openMeetingWrite(\'' + s.id + '\')">';
    h += '<div style="width:4px;height:40px;border-radius:2px;background:' + clr + ';flex-shrink:0"></div>';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:15px;font-weight:500;color:#1d1d1f">' + mtgEsc(s.name) + '</div>';
    h += '<div style="font-size:12px;color:#8e8e93;margin-top:3px;display:flex;align-items:center;gap:6px">';
    h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4;flex-shrink:0"><rect x="1.5" y="2.5" width="11" height="9" rx="1"/><path d="M4.5 1v3M9.5 1v3M1.5 5.5h11"/></svg>';
    h += '<span>' + dl + '</span>';
    if (tc > 0) h += '<span style="margin-left:4px;color:#b0b0b5">' + tc + ' ' + T('meetingTurns') + '</span>';
    h += '</div>';
    h += '<div style="font-size:11px;color:#b0b0b5;margin-top:4px;display:flex;align-items:center;gap:6px">';
    h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#b0b0b5;fill:none;stroke-width:1.4;flex-shrink:0"><circle cx="7" cy="5" r="2.5"/><path d="M2.5 13c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/></svg>';
    h += '<span>' + mtgEsc(cl) + '</span></div>';
    h += '</div>';
    h += '<svg viewBox="0 0 8 14" style="width:8px;height:14px;flex-shrink:0"><path d="M1 1l6 6-6 6" stroke="#c7c7cc" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    h += '</div>';
  });

  h += '</div>';
  c.innerHTML = h;
}

/* ══════════════════════════════════
   Settings Page
   ══════════════════════════════════ */
function openMeetingSettings() {
  var el = document.getElementById('mtgSetSessionName');
  if (el) el.value = '';

  var modeSeg = document.getElementById('mtgSetModeSeg');
  if (modeSeg) modeSeg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o.dataset.value === 'continue');
  });

  ['mtgSetCharPersonSeg','mtgSetUserPersonSeg'].forEach(function(id) {
    var seg = document.getElementById(id);
    if (seg) seg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
      o.classList.toggle('active', o.dataset.value === 'first');
    });
  });

  var wcMin = document.getElementById('mtgSetWcMin');
  var wcMax = document.getElementById('mtgSetWcMax');
  if (wcMin) wcMin.value = '100';
  if (wcMax) wcMax.value = '300';

  var ts = document.getElementById('mtgSetToggleSummary');
  if (ts) ts.classList.remove('active');
  var iw = document.getElementById('mtgSetSummaryIntervalWrap');
  if (iw) iw.style.display = 'none';
  var iv = document.getElementById('mtgSetSummaryInterval');
  if (iv) iv.value = '5';

  var wv = document.getElementById('mtgSetWorldview');
  if (wv) wv.value = '';
  var id2 = document.getElementById('mtgSetIdentity');
  if (id2) id2.value = '';

  mtgSetRenderCharSelect();
  mtgSetModeChanged();
  nav('screen-meeting-settings');
}

function exitMeetingSettings() { nav('screen-meeting'); }

function mtgSetRenderCharSelect() {
  var c = document.getElementById('mtgSetCharSelect');
  if (!c) return;
  var chars = (typeof state !== 'undefined' && Array.isArray(state.characters)) ? state.characters : [];
  if (chars.length === 0) {
    c.innerHTML = '<div class="mtg-char-empty">' + T('meetingNoCharsAvail') + '</div>';
    return;
  }
  c.innerHTML = chars.map(function(ch) {
    return '<label class="mtg-char-item">' +
      '<input type="checkbox" class="mtg-set-char-check" value="' + ch.id + '">' +
      '<span class="mtg-char-checkmark"></span>' +
      '<span class="mtg-char-name">' + mtgEsc(ch.name) + '</span></label>';
  }).join('');
}

function mtgSetToggleSeg(el) {
  var p = el.parentElement;
  if (!p) return;
  p.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o === el);
  });
}

function mtgSetModeChanged() {
  var modeEl = document.querySelector('#mtgSetModeSeg .mtg-seg-opt.active');
  var isIF = modeEl && modeEl.dataset.value === 'if';
  document.querySelectorAll('.mtg-set-if-only').forEach(function(el) {
    if (isIF) {
      el.style.display = '';
      el.classList.remove('mtg-set-hidden');
      el.classList.add('mtg-set-visible');
    } else {
      el.classList.remove('mtg-set-visible');
      el.classList.add('mtg-set-hidden');
      setTimeout(function() { if (el.classList.contains('mtg-set-hidden')) el.style.display = 'none'; }, 320);
    }
  });
}

function mtgSetSummaryToggled() {
  var toggle = document.getElementById('mtgSetToggleSummary');
  var wrap = document.getElementById('mtgSetSummaryIntervalWrap');
  if (toggle && wrap) wrap.style.display = toggle.classList.contains('active') ? '' : 'none';
}

/* ══════════════════════════════════
   Start Session
   ══════════════════════════════════ */
function startMeetingSession() {
  var nameEl = document.getElementById('mtgSetSessionName');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast(T('meetingNameRequired')); if (nameEl) nameEl.focus(); return; }

  var modeEl = document.querySelector('#mtgSetModeSeg .mtg-seg-opt.active');
  var mode = modeEl ? modeEl.dataset.value : 'continue';

  var cpEl = document.querySelector('#mtgSetCharPersonSeg .mtg-seg-opt.active');
  var charPerson = cpEl ? cpEl.dataset.value : 'first';

  var upEl = document.querySelector('#mtgSetUserPersonSeg .mtg-seg-opt.active');
  var userPerson = upEl ? upEl.dataset.value : 'first';

  var wcMin = parseInt((document.getElementById('mtgSetWcMin') || {}).value) || 100;
  var wcMax = parseInt((document.getElementById('mtgSetWcMax') || {}).value) || 300;

  var selCharIds = [];
  var selCharNames = [];
  document.querySelectorAll('.mtg-set-char-check:checked').forEach(function(cb) {
    var ch = (state.characters || []).find(function(c) { return c.id === cb.value; });
    if (ch) { selCharIds.push(ch.id); selCharNames.push(ch.name); }
  });

  var tsEl = document.getElementById('mtgSetToggleSummary');
  var turnSummary = tsEl ? tsEl.classList.contains('active') : false;
  var summaryInterval = parseInt((document.getElementById('mtgSetSummaryInterval') || {}).value) || MTG_DEFAULT_SUMMARY_INTERVAL;

  var wv = '', ident = '';
  if (mode === 'if') {
    wv = (document.getElementById('mtgSetWorldview') || {}).value || '';
    ident = (document.getElementById('mtgSetIdentity') || {}).value || '';
  }

  var now = new Date();
  var session = {
    id: mtgUid(),
    name: name,
    date: now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0'),
    characters: selCharNames,
    charIds: selCharIds,
    mode: mode,
    charPerson: charPerson,
    userPerson: userPerson,
    wc: { min: wcMin, max: wcMax },
    turnSummary: turnSummary,
    summaryInterval: summaryInterval,
    worldview: wv.trim(),
    identity: ident.trim(),
    history: [],
    shortTermMemory: [],
    turnCount: 0
  };

  mtgEnsureState();
  state.meetings.unshift(session);
  saveState();

  openMeetingWrite(session.id);
}

/* ══════════════════════════════════
   Writing Screen
   ══════════════════════════════════ */
function openMeetingWrite(sid) {
  var session = mtgFindSession(sid);
  if (!session) { showToast(T('error')); return; }
  mtgCurrentSession = session;

  var titleEl = document.getElementById('meetingWriteTitle');
  if (titleEl) titleEl.textContent = session.name;

  mtgRenderWriteContent(session);
  nav('screen-meeting-write');

  // IF mode with empty history: auto-generate initial scene
  if (session.mode === 'if' && session.history.length === 0 && session.charIds.length > 0) {
    setTimeout(function() { mtgGenerateInitialScene(session); }, 300);
  }
}

function exitMeetingWrite() {
  mtgCurrentSession = null;
  renderMeetingCards();
  nav('screen-meeting');
}

function mtgRenderWriteContent(s) {
  var body = document.getElementById('meetingWriteBody');
  if (!body) return;

  var modeL = s.mode === 'continue' ? T('meetingContinue') : T('meetingIF');
  var h = '';

  // info bar
  h += '<div class="mtg-write-info">';
  h += '<div class="mtg-write-info-row">';
  h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4"><rect x="1.5" y="2.5" width="11" height="9" rx="1"/><path d="M4.5 1v3M9.5 1v3M1.5 5.5h11"/></svg>';
  h += '<span>' + mtgFormatDate(s.date) + '</span></div>';
  h += '<div class="mtg-write-info-row">';
  h += '<span class="mtg-write-tag">' + modeL + '</span>';
  h += '<span class="mtg-write-tag">' + T('meetingCharPerspectiveShort') + ': ' + mtgPersonLabel(s.charPerson) + '</span>';
  h += '<span class="mtg-write-tag">' + T('meetingUserPerspectiveShort') + ': ' + mtgPersonLabel(s.userPerson) + '</span>';
  h += '<span class="mtg-write-tag">' + s.wc.min + '-' + s.wc.max + ' ' + T('meetingWords') + '</span>';
  h += '</div>';
  if (s.characters && s.characters.length) {
    h += '<div class="mtg-write-info-row">';
    h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:1.4"><circle cx="7" cy="5" r="2.5"/><path d="M2.5 13c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/></svg>';
    h += '<span>' + s.characters.join(', ') + '</span></div>';
  }
  h += '</div>';

  // content area
  h += '<div class="mtg-write-content" id="mtgWriteContent">';

  if (!s.history || s.history.length === 0) {
    h += '<div class="mtg-write-empty">' +
      '<svg viewBox="0 0 44 44" style="width:36px;height:36px;stroke:#d1d1d6;fill:none;stroke-width:1">' +
        '<path d="M30 6l8 8-20 20H10v-8z"/><path d="M26 10l8 8"/></svg>' +
      '<div>' + T('meetingBeginStory') + '</div></div>';
  } else {
    s.history.forEach(function(entry) {
      if (entry.role === 'summary') {
        h += '<div class="mtg-write-summary">';
        h += '<div class="mtg-write-summary-bar">';
        h += '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#b0b0b5;fill:none;stroke-width:1.4"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>';
        h += '<span>' + T('meetingSummaryRound') + ' ' + (entry.round || '?') + '</span></div>';
        h += '<div class="mtg-write-summary-text">' + mtgEsc(entry.content) + '</div></div>';
      } else {
        var cls = entry.role === 'user' ? 'user' : (entry.role === 'char' ? 'char' : 'system');
        var label = entry.role === 'user' ? T('meetingYou') :
                    entry.role === 'char' ? (entry.charName || 'Character') :
                    T('meetingSystem');
        h += '<div class="mtg-write-entry mtg-write-entry-' + cls + '">';
        h += '<div class="mtg-write-entry-label">' + mtgEsc(label) + '</div>';
        h += '<div class="mtg-write-entry-text">' + mtgEsc(entry.content) + '</div></div>';
      }
    });
  }

  h += '</div>';
  body.innerHTML = h;

  // scroll to bottom
  setTimeout(function() { body.scrollTop = body.scrollHeight; }, 50);
}

/* ── Append helpers (avoid full re-render) ── */
function mtgAppendEntry(role, label, text) {
  var content = document.getElementById('mtgWriteContent');
  if (!content) return;
  var empty = content.querySelector('.mtg-write-empty');
  if (empty) empty.remove();

  var cls = role === 'user' ? 'user' : (role === 'char' ? 'char' : 'system');
  var entry = document.createElement('div');
  entry.className = 'mtg-write-entry mtg-write-entry-' + cls;
  entry.innerHTML = '<div class="mtg-write-entry-label">' + mtgEsc(label) + '</div>' +
                    '<div class="mtg-write-entry-text">' + mtgEsc(text) + '</div>';
  content.appendChild(entry);
  var body = document.getElementById('meetingWriteBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function mtgAppendSummary(round, text) {
  var content = document.getElementById('mtgWriteContent');
  if (!content) return;
  var div = document.createElement('div');
  div.className = 'mtg-write-summary';
  div.innerHTML =
    '<div class="mtg-write-summary-bar">' +
      '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#b0b0b5;fill:none;stroke-width:1.4"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>' +
      '<span>' + T('meetingSummaryRound') + ' ' + round + '</span></div>' +
    '<div class="mtg-write-summary-text">' + mtgEsc(text) + '</div>';
  content.appendChild(div);
  var body = document.getElementById('meetingWriteBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function mtgShowTyping() {
  var content = document.getElementById('mtgWriteContent');
  if (!content || document.getElementById('mtgTypingInd')) return;
  var empty = content.querySelector('.mtg-write-empty');
  if (empty) empty.remove();
  var ind = document.createElement('div');
  ind.id = 'mtgTypingInd';
  ind.className = 'mtg-write-typing';
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
   Send Message + Trigger AI
   ══════════════════════════════════ */
function meetingWriteSend() {
  if (mtgGenerating || !mtgCurrentSession) return;
  var inp = document.getElementById('meetingWriteInput');
  var text = inp ? inp.value.trim() : '';
  if (!text) return;

  var s = mtgCurrentSession;
  s.history.push({ id: mtgUid(), role: 'user', content: text, timestamp: Date.now() });
  s.turnCount = (s.turnCount || 0) + 1;
  saveState();

  mtgAppendEntry('user', T('meetingYou'), text);
  inp.value = '';

  // call AI
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
      var ch = (state.characters || []).find(function(c) { return c.id === charId; });
      if (!ch) continue;

      var sysPrompt = mtgBuildSystemPrompt(session, ch);
      var ctxMsgs = mtgBuildContextMessages(session, ch);
      var messages = [{ role: 'system', content: sysPrompt }].concat(ctxMsgs);

      var reply = await sendChat(api, messages);
      if (reply && reply.trim()) {
        var cleaned = reply.trim();
        session.history.push({
          id: mtgUid(), role: 'char', charName: ch.name,
          content: cleaned, timestamp: Date.now()
        });
        mtgHideTyping();
        mtgAppendEntry('char', ch.name, cleaned);
        if (i < session.charIds.length - 1) mtgShowTyping();
      }
    }

    saveState();

    // check summary
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

/* ── Generate initial scene (IF mode) ── */
async function mtgGenerateInitialScene(session) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model || typeof sendChat !== 'function') return;
  if (!session.charIds || session.charIds.length === 0) return;

  mtgGenerating = true;
  mtgSetSendEnabled(false);
  mtgShowTyping();

  try {
    var ch = (state.characters || []).find(function(c) { return c.id === session.charIds[0]; });
    if (!ch) return;

    var sysPrompt = mtgBuildSystemPrompt(session, ch);
    sysPrompt += '\n\nGenerate the opening scene. Set the stage, describe the world, and establish the initial situation. Write as the narrator.\n';

    var reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: 'Begin the story.' }
    ]);

    if (reply && reply.trim()) {
      session.history.push({
        id: mtgUid(), role: 'system', content: reply.trim(), timestamp: Date.now()
      });
      saveState();
      mtgHideTyping();
      mtgAppendEntry('system', T('meetingSystem'), reply.trim());
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

  // Character identity
  p += 'You are ' + ch.name + '.\n';
  if (ch.prompt) p += ch.prompt + '\n';
  if (ch.notes) p += '\nNotes: ' + ch.notes + '\n';
  p += '\n';

  // IF-mode context
  if (session.mode === 'if') {
    if (session.worldview) p += 'WORLDVIEW:\n' + session.worldview + '\n\n';
    if (session.identity)  p += 'IDENTITY:\n' + session.identity + '\n\n';
  }

  // Person & word count rules
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

  // Short-term memory summaries
  if (session.shortTermMemory && session.shortTermMemory.length > 0) {
    p += '\nSTORY SUMMARIES (for context):\n';
    session.shortTermMemory.forEach(function(mem) {
      p += '- Round ' + mem.round + ': ' + mem.content + '\n';
    });
    p += '\n';
  }

  return p;
}

/* ── Build Context Messages ── */
function mtgBuildContextMessages(session, ch) {
  var msgs = [];

  // Continue mode: prepend recent chat as context
  if (session.mode === 'continue' && ch) {
    var chatHist = (state.chats && state.chats[ch.id]) ? state.chats[ch.id] : [];
    var recent = chatHist.slice(-MTG_CONTEXT_COUNT);
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

  // Session history
  (session.history || []).forEach(function(entry) {
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
    // skip 'summary' entries — covered by system prompt
  });

  return msgs;
}

/* ── Turn Summary ── */
async function mtgDoSummary(session) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model || typeof sendChat !== 'function') return;

  // collect entries since last summary
  var lastRound = 0;
  if (session.shortTermMemory.length > 0) {
    lastRound = session.shortTermMemory[session.shortTermMemory.length - 1].round;
  }

  var recentEntries = [];
  (session.history || []).forEach(function(e) {
    if (e.role !== 'summary') recentEntries.push(e);
  });
  // take the last N*3 entries approximately
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

      session.history.push({
        id: mtgUid(), role: 'summary', content: summary.trim(),
        round: session.turnCount, timestamp: Date.now()
      });

      mtgAppendSummary(session.turnCount, summary.trim());
      saveState();
    }
  } catch (e) {
    console.warn('[Meeting] Summary failed:', e);
  }
}

/* ══════════════════════════════════
   Manage Page
   ══════════════════════════════════ */
function openMeetingManage() {
  if (!mtgCurrentSession) { showToast(T('error')); return; }
  mtgRenderManagePage();
  nav('screen-meeting-manage');
}

function exitMeetingManage() {
  nav('screen-meeting-write');
}

function mtgRenderManagePage() {
  var s = mtgCurrentSession;
  if (!s) return;

  // Info card
  var infoEl = document.getElementById('mtgManageInfo');
  if (infoEl) {
    var h = '';
    h += '<div class="mtg-manage-row"><span>' + T('meetingSessionName') + '</span><span>' + mtgEsc(s.name) + '</span></div>';
    h += '<div class="mtg-manage-row"><span>' + T('meetingMode') + '</span><span>' + (s.mode === 'continue' ? T('meetingContinue') : T('meetingIF')) + '</span></div>';
    h += '<div class="mtg-manage-row"><span>' + T('meetingCharacters') + '</span><span>' + ((s.characters || []).join(', ') || T('meetingNoCharsSelected')) + '</span></div>';
    h += '<div class="mtg-manage-row"><span>' + T('meetingTurns') + '</span><span>' + (s.turnCount || 0) + '</span></div>';
    infoEl.innerHTML = h;
  }

  // Editable settings
  var cpSeg = document.getElementById('mtgManageCharPersonSeg');
  if (cpSeg) cpSeg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o.dataset.value === s.charPerson);
  });

  var upSeg = document.getElementById('mtgManageUserPersonSeg');
  if (upSeg) upSeg.querySelectorAll('.mtg-seg-opt').forEach(function(o) {
    o.classList.toggle('active', o.dataset.value === s.userPerson);
  });

  var wcMin = document.getElementById('mtgManageWcMin');
  if (wcMin) wcMin.value = s.wc.min;
  var wcMax = document.getElementById('mtgManageWcMax');
  if (wcMax) wcMax.value = s.wc.max;

  var intEl = document.getElementById('mtgManageSummaryInterval');
  if (intEl) intEl.value = s.summaryInterval || MTG_DEFAULT_SUMMARY_INTERVAL;

  // Memory
  mtgRenderManageMemory();
}

function mtgSaveManageChanges() {
  var s = mtgCurrentSession;
  if (!s) return;

  var cpEl = document.querySelector('#mtgManageCharPersonSeg .mtg-seg-opt.active');
  if (cpEl) s.charPerson = cpEl.dataset.value;
  var upEl = document.querySelector('#mtgManageUserPersonSeg .mtg-seg-opt.active');
  if (upEl) s.userPerson = upEl.dataset.value;

  s.wc.min = parseInt((document.getElementById('mtgManageWcMin') || {}).value) || 100;
  s.wc.max = parseInt((document.getElementById('mtgManageWcMax') || {}).value) || 300;
  s.summaryInterval = parseInt((document.getElementById('mtgManageSummaryInterval') || {}).value) || MTG_DEFAULT_SUMMARY_INTERVAL;

  saveState();
  showToast(T('meetingSaveChanges'));
}

function mtgRenderManageMemory() {
  var c = document.getElementById('mtgManageMemoryList');
  if (!c || !mtgCurrentSession) return;

  var mems = mtgCurrentSession.shortTermMemory || [];
  if (mems.length === 0) {
    c.innerHTML = '<div class="mtg-empty" style="padding:20px">' +
      '<svg viewBox="0 0 36 36" style="width:32px;height:32px;stroke:#d1d1d6;fill:none;stroke-width:1"><rect x="4" y="4" width="28" height="28" rx="4"/><path d="M10 14h16M10 20h12"/></svg>' +
      '<div style="margin-top:6px">' + T('meetingNoMemories') + '</div></div>';
    return;
  }

  var h = '';
  mems.forEach(function(m) {
    h += '<div class="mtg-manage-mem-item">';
    h += '<div class="mtg-manage-mem-round">' + T('meetingSummaryRound') + ' ' + m.round + '</div>';
    h += '<div class="mtg-manage-mem-text">' + mtgEsc(m.content) + '</div>';
    h += '</div>';
  });
  c.innerHTML = h;
}
