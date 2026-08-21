// ========== chat-actions.js ==========
// ★ 终极修复版：菜单项在 HTML 中为静态内容，JS 只管 show/hide

function openChat(cid) {
  state.currentCharId = cid;
  state.unread[cid] = 0;
  if (!state.chats[cid]) state.chats[cid] = [];
  saveState();

  ['groupManageModal', 'addGroupMemberModal', 'createGroupModal', 'createActionSheet']
    .forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });

  nav('screen-chat');
  if (!isGroupChat(cid) && typeof restartAutoMessageTimer === 'function') {
    restartAutoMessageTimer(cid);
  }
}

// ══════════════════════════════════════════════
//  ★ 聊天右上角三点菜单 — 纯显隐版
// ══════════════════════════════════════════════

function updateChatMenuItems() {
  var groupItem = document.getElementById('chatMenuGroupItem');
  if (!groupItem) return;

  var isGroup = false;
  try {
    if (typeof isGroupChat === 'function') {
      isGroup = isGroupChat(state.currentCharId);
    }
  } catch (e) {}

  groupItem.style.display = isGroup ? '' : 'none';
}

function toggleChatMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }

  var menu    = document.getElementById('chatMenu');
  var overlay = document.getElementById('chatMenuOverlay');
  if (!menu) return;

  var isShowing = menu.classList.contains('show');

  try { closeBubbleMenu();  } catch (_) {}
  try { closePlusMenu();    } catch (_) {}
  try { closeStickerPanel(); } catch (_) {}

  if (isShowing) {
    menu.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  } else {
    updateChatMenuItems();

    if (!menu.children.length) {
      console.warn('[chatMenu] 内容被清空，正在重建...');
      _rebuildMenuDOM(menu);
    }

    menu.classList.add('show');
    if (overlay) overlay.classList.add('show');
  }
}

function closeChatMenu() {
  var menu    = document.getElementById('chatMenu');
  var overlay = document.getElementById('chatMenuOverlay');
  if (menu)    menu.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
}

function _rebuildMenuDOM(menu) {
  var items = [
    { label: '记忆设置', action: "closeChatMenu();nav('screen-chat-config')",
      icon: '<path d="M10 2a6 6 0 00-6 6c0 2.5 1.5 4.5 3 5.5V16a1 1 0 001 1h4a1 1 0 001-1v-2.5c1.5-1 3-3 3-5.5a6 6 0 00-6-6z"/><path d="M8 19h4"/>' },
    { label: '聊天设置', action: "closeChatMenu();openChatSettings()",
      icon: '<circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/>' },
    { label: '角色设置', action: "closeChatMenu();editCharFromChat()",
      icon: '<circle cx="10" cy="6" r="3.5"/><path d="M3.5 18c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/>' },
    { label: '信息收藏', action: "closeChatMenu();nav('screen-bookmarks')",
      icon: '<path d="M5 3h10a1 1 0 011 1v13l-6-3.5L4 17V4a1 1 0 011-1z"/>' }
  ];

  menu.innerHTML = '';

  items.forEach(function(it) {
    var div = document.createElement('div');
    div.className = 'chat-menu-item';
    div.setAttribute('onclick', it.action);
    div.innerHTML =
      '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">' +
        it.icon +
      '</svg>' +
      '<span>' + it.label + '</span>';
    menu.appendChild(div);
  });

  var isGroup = false;
  try { isGroup = isGroupChat(state.currentCharId); } catch(_) {}

  var gDiv = document.createElement('div');
  gDiv.className = 'chat-menu-item chat-menu-group-item';
  gDiv.id = 'chatMenuGroupItem';
  gDiv.setAttribute('onclick', 'closeChatMenu();openGroupManagePanel()');
  gDiv.style.display = isGroup ? '' : 'none';
  gDiv.innerHTML =
    '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<circle cx="7.5" cy="6" r="2.5"/><path d="M2 16c0-3 2.2-5 5.5-5s5.5 2 5.5 5"/>' +
      '<circle cx="14.5" cy="7" r="2"/><path d="M14.5 12c2 0 3.5 1.2 3.5 3"/>' +
    '</svg>' +
    '<span>群管理</span>';
  menu.appendChild(gDiv);
}


// ══════════════════════════════════════════════
//  导出聊天记录
// ══════════════════════════════════════════════
function exportCurrentChat() {
  var charId = state.currentCharId;
  if (!charId) return;

  var msgs = state.chats[charId] || [];
  if (!msgs.length) { showToast('No messages to export'); return; }

  var isGroup = isGroupChat(charId);
  var title = '';
  if (isGroup) {
    var grp = getGroupById(charId);
    title = grp ? grp.name : 'Group';
  } else {
    var ch = state.characters.find(function(c) { return c.id === charId; });
    title = ch ? ch.name : 'Chat';
  }

  var lines = ['=== Chat with ' + title + ' ===', ''];
  msgs.forEach(function(m) {
    if (m.recalled) return;
    var time = new Date(m.timestamp).toLocaleString();
    var sender = m.role === 'user' ? (state.userProfile.name || 'User') : title;
    if (isGroup && m.senderId) {
      var sc = state.characters.find(function(c) { return c.id === m.senderId; });
      if (sc) sender = sc.name;
    }
    var content = m.content || '';
    if (m.type === 'sticker')  content = '[Sticker]';
    if (m.type === 'image')    content = '[Image]';
    if (m.type === 'voice')    content = '[Voice]';
    if (m.type === 'transfer') content = '[Transfer]';
    if (m.type === 'call')     content = '[Call]';
    lines.push('[' + time + '] ' + sender + ': ' + content);
  });

  var text = lines.join('\n');
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '_chat.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported');
}


// ══════════════════════════════════════════════
//  多选模式
// ══════════════════════════════════════════════
if (typeof enterMultiSelect === 'undefined') {
  function enterMultiSelect() {
    bubbleState.multiMode = true;
    bubbleState.selectedIds = new Set();
    renderChat();
    var bar = document.getElementById('bubbleActionBar');
    if (bar) bar.classList.add('show');
    var header = document.getElementById('chatHeaderNormal');
    if (header) header.style.display = 'none';
  }
  window.enterMultiSelect = enterMultiSelect;
}
if (typeof exitMultiSelect === 'undefined') {
  function exitMultiSelect() {
    bubbleState.multiMode = false;
    bubbleState.selectedIds = new Set();
    renderChat();
    var bar = document.getElementById('bubbleActionBar');
    if (bar) bar.classList.remove('show');
    var header = document.getElementById('chatHeaderNormal');
    if (header) header.style.display = '';
  }
  window.exitMultiSelect = exitMultiSelect;
}


// ══════════════════════════════════════════════
//  原有消息操作函数
// ══════════════════════════════════════════════

function recallMessage(msgId) {
  var msgs = state.chats[state.currentCharId] || [];
  var msg = msgs.find(function(m) { return m.id === msgId; });
  if (!msg) return;
  msg.recalled = true;
  msg.originalContent = msg.content;
  msg.content = 'Message recalled';
  delete msg.translation;
  saveState();
  renderChat();
  showToast('Message recalled');
}

function viewRecalledMsg(msgId) {
  var msgs = state.chats[state.currentCharId] || [];
  var msg = msgs.find(function(m) { return m.id === msgId; });
  if (!msg || !msg.originalContent) return;
  document.getElementById('errorModalTitle').textContent = 'Recalled Message';
  document.getElementById('errorModalBody').textContent = msg.originalContent;
  document.getElementById('errorModal').classList.add('show');
}

function toggleMsgTranslation(event, msgId) {
  if (event) event.stopPropagation();
  var container = document.getElementById('chatMessages');
  container.querySelectorAll('.msg-row[data-msgid="' + msgId + '"] .msg-translation').forEach(function(el) {
    el.classList.toggle('show');
  });
}

function translateMsg(msgId) { toggleMsgTranslation(null, msgId); }

function acceptCall(mid) {
  var charId = state.currentCharId;
  var m = (state.chats[charId] || []).find(function(x) { return x.id === mid; });
  if (!m) return;
  m.callStatus = 'accepted';
  saveState();
  renderChat();
  if (typeof openCallInterface === 'function') {
    openCallInterface(charId, m.callType || 'voice', mid);
  } else {
    showToast('Call connected');
  }
}

function declineCall(mid) {
  var m = (state.chats[state.currentCharId] || []).find(function(x) { return x.id === mid; });
  if (m) { m.callStatus = 'declined'; saveState(); renderChat(); showToast('Call declined'); }
}

function acceptTransfer(mid) {
  var m = (state.chats[state.currentCharId] || []).find(function(x) { return x.id === mid; });
  if (m) { m.transferStatus = 'accepted'; saveState(); renderChat(); showToast('Accepted'); }
}

function declineTransfer(mid) {
  var m = (state.chats[state.currentCharId] || []).find(function(x) { return x.id === mid; });
  if (m) { m.transferStatus = 'declined'; saveState(); renderChat(); showToast('Declined'); }
}

function toggleVoiceText(el) {
  el.querySelector('.voice-text')?.classList.toggle('show');
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function sendMessage() {
  var inp = document.getElementById('chatInput');
  var t = inp.value.trim();
  if (!t || !state.currentCharId) return;
  var msg = { id: uid(), role: 'user', content: t, type: 'text', timestamp: Date.now() };
  if (bubbleState.quoteMsg) {
    msg.quoteRef = { id: bubbleState.quoteMsg.id, name: bubbleState.quoteMsg.name, text: bubbleState.quoteMsg.text };
    clearQuote();
  }
  state.chats[state.currentCharId].push(msg);
  inp.value = '';
  inp.style.height = 'auto';
  saveState();
  renderChat();
}

function editCharFromChat() {
  if (!state.currentCharId) return;
  if (isGroupChat(state.currentCharId)) { openGroupManagePanel(); return; }
  state.charEditFrom = 'screen-chat';
  editChar(state.currentCharId);
}


// ══════════════════════════════════════════════════════════
//  ★★★ 重回（Regenerate）— 整轮重新生成修复 ★★★
// ══════════════════════════════════════════════════════════

/**
 * regenerateLastTurn(bubbleId)
 *
 * bubbleId 可以是：
 *   - 纯消息 ID  （如 "abc123"）
 *   - 带分段后缀 （如 "abc123__seg0"）
 *
 * 逻辑：
 *  1. 从 bubbleId 提取真实 msgId
 *  2. 在 state.chats 中定位该消息
 *  3. 向前 / 向后扩展，找出同一轮（连续 assistant 消息）的 **全部** 消息
 *  4. 全部移除
 *  5. 用当前 API 重新生成，插回原位置
 */
async function regenerateLastTurn(bubbleId) {
  var charId = state.currentCharId;
  if (!charId) return;
  if (typeof isGroupChat === 'function' && isGroupChat(charId)) {
    showToast('群聊暂不支持重回');
    return;
  }

  /* ① 提取真实 msgId */
  var msgId = String(bubbleId);
  var segSep = msgId.indexOf('__seg');
  if (segSep >= 0) msgId = msgId.substring(0, segSep);

  var msgs = state.chats[charId];
  if (!msgs || !msgs.length) return;

  /* ② 定位目标消息 */
  var targetIdx = -1;
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].id === msgId) { targetIdx = i; break; }
  }
  if (targetIdx < 0) return;
  if (msgs[targetIdx].role !== 'assistant') {
    showToast('只能对AI消息使用重回');
    return;
  }

  /* ③ 找整轮边界：连续的 assistant 消息（跳过 call-summary 等系统类型） */
  function _isNormalAssistant(m) {
    return m && m.role === 'assistant' && m.type !== 'call-summary';
  }

  var turnStart = targetIdx;
  while (turnStart > 0 && _isNormalAssistant(msgs[turnStart - 1])) {
    turnStart--;
  }

  var turnEnd = targetIdx;
  while (turnEnd < msgs.length - 1 && _isNormalAssistant(msgs[turnEnd + 1])) {
    turnEnd++;
  }

  var turnCount = turnEnd - turnStart + 1;
  console.log('[regenerate] 轮次范围 idx ' + turnStart + '~' + turnEnd + '，共 ' + turnCount + ' 条');

  /* ④ 移除整轮 */
  msgs.splice(turnStart, turnCount);
  saveState();
  renderChat();

  /* ⑤ 准备重新生成 */
  var api = state.apis ? state.apis.find(function(a) { return a.id === state.activeApiId; }) : null;
  if (!api || !api.url || !api.model) {
    showToast('请先配置API');
    return;
  }

  var ch = state.characters.find(function(c) { return c.id === charId; });
  if (!ch) { showToast('角色不存在'); return; }

  /* 上下文：取移除后、turnStart 之前的消息（最多 30 条） */
  var ctxEnd = Math.min(turnStart, msgs.length);
  var ctxSlice = msgs.slice(Math.max(0, ctxEnd - 30), ctxEnd);
  var apiCtx = ctxSlice.map(function(m) {
    return {
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.recalled ? '[已撤回]' : (m.content || '')
    };
  });

  var sysPrompt = '';
  if (typeof buildSystemPrompt === 'function') {
    sysPrompt = buildSystemPrompt(ch, state.worldbooks, state.stickers);
  }

  /* ⑥ 在聊天区显示打字指示器 */
  var ct = document.getElementById('chatMessages');
  var typingRow = document.createElement('div');
  typingRow.className = 'msg-row received';
  typingRow.id = 'regenTypingIndicator';

  var charAv = ch.avatar;
  var avHtml = charAv
    ? '<img src="' + charAv + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'
    : '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="8" r="4" stroke="#999" fill="none" stroke-width="1.5"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="#999" fill="none" stroke-width="1.5"/></svg>';
  typingRow.innerHTML =
    '<div class="msg-avatar">' + avHtml + '</div>' +
    '<div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  if (ct) {
    ct.appendChild(typingRow);
    ct.scrollTop = ct.scrollHeight;
  }

  /* ⑦ 调用 API */
  try {
    var allApiMsgs = [{ role: 'system', content: sysPrompt }].concat(apiCtx);
    var reply = await sendChat(api, allApiMsgs);

    /* 移除打字指示器 */
    var ti = document.getElementById('regenTypingIndicator');
    if (ti) ti.remove();

    if (!reply) {
      showToast('AI 返回为空，请重试');
      return;
    }

    /* ⑧ 解析 & 插入新消息 */
    var parsed = (typeof parseThreePartReply === 'function')
      ? parseThreePartReply(reply)
      : { content: reply, innerThought: '', innerAction: '' };

    var content = (parsed.content || '')
      .replace(/\[\s*领取转账\s*\]/g, '')
      .replace(/\[\s*拒绝转账\s*\]/g, '')
      .trim();
    if (!content) content = '';

    /* 支持 ---SPLIT--- 多段 */
    var parts = content.split(/---SPLIT---/).map(function(s) { return s.trim(); }).filter(Boolean);

    var insertIdx = turnStart;
    parts.forEach(function(part, pi) {
      var newMsg = {
        id: uid(),
        role: 'assistant',
        content: part,
        type: 'text',
        timestamp: Date.now() + pi * 100
      };
      msgs.splice(insertIdx + pi, 0, newMsg);
    });

    saveState();
    renderChat();

    /* 自动翻译 */
    if (typeof getCharConfig === 'function' && typeof autoTranslateMsg === 'function') {
      var cfg = getCharConfig(charId);
      if (cfg && cfg.translation && parts.length > 0) {
        var lastInserted = msgs[insertIdx + parts.length - 1];
        if (lastInserted) autoTranslateMsg(lastInserted.id);
      }
    }

    showToast('已重新生成');

  } catch (e) {
    var ti2 = document.getElementById('regenTypingIndicator');
    if (ti2) ti2.remove();
    showToast('重新生成失败');
    console.error('[regenerateLastTurn] error:', e);
  }
}


// ══════════════════════════════════════════════
//  全局导出（防覆盖）
// ══════════════════════════════════════════════
(function _exportChatActions() {

  var _protected = {
    toggleChatMenu:      toggleChatMenu,
    closeChatMenu:       closeChatMenu,
    updateChatMenuItems: updateChatMenuItems
  };

  Object.keys(_protected).forEach(function(name) {
    try { delete window[name]; } catch(_) {}
    try {
      Object.defineProperty(window, name, {
        value:        _protected[name],
        writable:     false,
        configurable: true,
        enumerable:   true
      });
    } catch(e) {
      window[name] = _protected[name];
    }
  });

  window.openChat             = openChat;
  window.sendMessage          = sendMessage;
  window.editCharFromChat     = editCharFromChat;
  window.acceptTransfer       = acceptTransfer;
  window.declineTransfer      = declineTransfer;
  window.acceptCall           = acceptCall;
  window.declineCall          = declineCall;
  window.toggleVoiceText      = toggleVoiceText;
  window.autoGrow             = autoGrow;
  window.recallMessage        = recallMessage;
  window.viewRecalledMsg      = viewRecalledMsg;
  window.translateMsg         = translateMsg;
  window.toggleMsgTranslation = toggleMsgTranslation;
  window.exportCurrentChat    = exportCurrentChat;

  // ★★★ 重回 — 整轮重新生成 ★★★
  window.regenerateLastTurn   = regenerateLastTurn;
  // 兼容：如果 bubble-menu 里调用的是 regenerateMsg / regenBubble，统一指向同一函数
  window.regenerateMsg        = regenerateLastTurn;
  window.regenBubble          = regenerateLastTurn;
})();
