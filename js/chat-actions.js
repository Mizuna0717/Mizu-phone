// ========== chat-actions.js ==========
// Message actions: recall, translate, accept/decline call & transfer, openChat, send, edit
// ★ 需求6: 新增 toggleChatMenu / closeChatMenu 修复三点菜单

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

// ── 聊天右上角三点菜单 ──
function toggleChatMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var menu = document.getElementById('chatDropdown');
  if (!menu) return;
  var isShowing = menu.classList.contains('show');
  // 先关掉其它浮层
  try { closeBubbleMenu(); } catch (_) {}
  try { closePlusMenu(); } catch (_) {}
  if (isShowing) {
    menu.classList.remove('show');
  } else {
    menu.classList.add('show');
  }
}

function closeChatMenu() {
  var menu = document.getElementById('chatDropdown');
  if (menu) menu.classList.remove('show');
}

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

function translateMsg(msgId) {
  toggleMsgTranslation(null, msgId);
}

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
  if (m) {
    m.callStatus = 'declined';
    saveState();
    renderChat();
    showToast('Call declined');
  }
}

function acceptTransfer(mid) {
  var m = (state.chats[state.currentCharId] || []).find(function(x) { return x.id === mid; });
  if (m) {
    m.transferStatus = 'accepted';
    saveState();
    renderChat();
    showToast('Accepted');
  }
}

function declineTransfer(mid) {
  var m = (state.chats[state.currentCharId] || []).find(function(x) { return x.id === mid; });
  if (m) {
    m.transferStatus = 'declined';
    saveState();
    renderChat();
    showToast('Declined');
  }
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
  if (isGroupChat(state.currentCharId)) {
    openGroupManagePanel();
    return;
  }
  state.charEditFrom = 'screen-chat';
  editChar(state.currentCharId);
}

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
window.toggleChatMenu       = toggleChatMenu;
window.closeChatMenu        = closeChatMenu;
