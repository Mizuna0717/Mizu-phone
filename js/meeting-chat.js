// ========== meeting-chat.js ==========
// Meeting Chat — 發送訊息、AI 回應、訊息編輯/刪除/重試
// requires: meeting-core.js (mtgUid, mtgGetCharById, mtgEnsureMemoryFields, state globals)
// requires: meeting-prompt.js (mtgBuildSystemPrompt, mtgBuildContextMessages)
// requires: meeting-memory.js (mtgCheckAutoSummarize)
// requires: meeting-ui.js (mtgAppendCard, mtgShowTyping, mtgHideTyping, mtgSetSendEnabled, mtgRenderChat, mtgShowEditBanner, mtgHideEditBanner)

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
