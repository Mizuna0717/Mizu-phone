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

/**
 * [兜底] 万一 DOM 被清空，用 JS 重建静态菜单
 * ★ 记忆设置跳转已修正为 screen-chat-config
 */
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
})();
