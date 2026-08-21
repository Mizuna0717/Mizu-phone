// ========== 13-chat-extras.js ==========
// Dependencies: 02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js
// ★ toggleChatMenu / closeChatMenu / updateChatMenuItems 已在 chat-actions.js 中定义并保护，此处不再重复

// ========== TRANSFER MODAL ==========
function openTransferModal() {
  closePlusMenu();
  document.getElementById('transferAmount').value = '';
  document.getElementById('transferNote').value = '';
  document.getElementById('transferModal').classList.add('show');
}

function sendTransfer() {
  const amt = document.getElementById('transferAmount').value.trim();
  if (!amt || !state.currentCharId) return;
  const note = document.getElementById('transferNote').value.trim();
  const msgId = uid();
  state.chats[state.currentCharId].push({
    id: msgId, role: 'user', content: JSON.stringify({ amount: amt, note }),
    type: 'transfer', timestamp: Date.now()
  });
  saveState();
  closeModal('transferModal');
  renderChat();
}

// ========== IMAGE MODAL ==========
function openImageModal() {
  closePlusMenu();
  setImgType('real');
  document.getElementById('realImagePreview').style.display = 'none';
  document.getElementById('simImageText').value = '';
  tmp.realImageData = null;
  document.getElementById('imageModal').classList.add('show');
}

function setImgType(t) {
  tmp.imgType = t;
  document.getElementById('imgTypeReal').classList.toggle('active', t === 'real');
  document.getElementById('imgTypeSim').classList.toggle('active', t === 'sim');
  document.getElementById('imgRealArea').style.display = t === 'real' ? 'block' : 'none';
  document.getElementById('imgSimArea').style.display = t === 'sim' ? 'block' : 'none';
}

function previewRealImage(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => {
      tmp.realImageData = e.target.result;
      document.getElementById('realImagePreview').src = e.target.result;
      document.getElementById('realImagePreview').style.display = 'block';
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function sendImage() {
  if (!state.currentCharId) return;
  if (tmp.imgType === 'real') {
    if (!tmp.realImageData) return;
    state.chats[state.currentCharId].push({
      id: uid(), role: 'user', content: '[User sent a real photo]',
      type: 'image', dataUrl: tmp.realImageData, timestamp: Date.now()
    });
  } else {
    const text = document.getElementById('simImageText').value.trim();
    if (!text) return;
    state.chats[state.currentCharId].push({
      id: uid(), role: 'user', content: text, type: 'simImage', timestamp: Date.now()
    });
  }
  saveState();
  closeModal('imageModal');
  renderChat();
}

// ========== PLUS MENU ==========
function togglePlusMenu() {
  document.getElementById('plusMenu').classList.toggle('show');
  document.getElementById('plusMenuOverlay').classList.toggle('show');
}

function closePlusMenu() {
  document.getElementById('plusMenu')?.classList.remove('show');
  document.getElementById('plusMenuOverlay')?.classList.remove('show');
}

// ========== VOICE MODAL ==========
function openVoiceModal() {
  closePlusMenu();
  document.getElementById('voiceText').value = '';
  document.getElementById('voiceModal').classList.add('show');
}

function sendVoice() {
  const t = document.getElementById('voiceText').value.trim();
  if (!t || !state.currentCharId) return;
  state.chats[state.currentCharId].push({
    id: uid(), role: 'user', content: t, type: 'voice', timestamp: Date.now()
  });
  saveState();
  closeModal('voiceModal');
  renderChat();
}

// ========== STICKER PANEL ==========
function openStickerPanel() {
  closePlusMenu();
  renderStickerGrid();
  document.getElementById('stickerPanel').classList.add('show');
  document.getElementById('stickerPanel').classList.remove('manage');
}

function closeStickerPanel() {
  document.getElementById('stickerPanel')?.classList.remove('show', 'manage');
}

function renderStickerGrid() {
  const g = document.getElementById('stickerGrid');
  if (!state.stickers.length) {
    g.innerHTML = '<div class="sticker-empty">No stickers</div>';
    return;
  }
  g.innerHTML = state.stickers.map(s =>
    '<div class="sticker-item" onclick="sendSticker(\'' + s.id + '\')">' +
    '<img src="' + s.dataUrl + '">' +
    '<div class="sticker-name">' + esc(s.name) + '</div>' +
    '<button class="sticker-del" onclick="event.stopPropagation();delSticker(\'' + s.id + '\')">' +
    '<svg viewBox="0 0 10 10" style="width:8px;height:8px;stroke:#8e8e93;fill:none;stroke-width:2"><path d="M2 2l6 6M8 2l-6 6" stroke-linecap="round"/></svg></button></div>'
  ).join('');
}

function sendSticker(sid) {
  const s = state.stickers.find(x => x.id === sid);
  if (!s || !state.currentCharId) return;
  state.chats[state.currentCharId].push({
    id: uid(), role: 'user', content: s.dataUrl, type: 'sticker', timestamp: Date.now()
  });
  saveState();
  closeStickerPanel();
  renderChat();
}

function delSticker(sid) {
  state.stickers = state.stickers.filter(s => s.id !== sid);
  saveState();
  renderStickerGrid();
}

function toggleStickerManage() {
  const p = document.getElementById('stickerPanel');
  p.classList.toggle('manage');
  document.getElementById('stickerManageBtn').textContent =
    p.classList.contains('manage') ? T('done') : T('manage');
}

// ========== HEADER CLICK HANDLER ==========
function handleChatHeaderClick() {
  if (isGroupChat(state.currentCharId)) {
    openGroupManagePanel();
  } else {
    openHeartVoicePanel();
  }
}

// ========== CALL MODAL ==========
function openCallModal() {
  closePlusMenu();
  document.getElementById('callModal').classList.add('show');
}

function startCall(type) {
  closeModal('callModal');

  if (!state.currentCharId) return;
  if (!state.chats[state.currentCharId]) state.chats[state.currentCharId] = [];

  const msgId = uid();
  const label = type === 'video' ? 'Video Call' : 'Voice Call';

  state.chats[state.currentCharId].push({
    id: msgId,
    role: 'user',
    type: 'call',
    callType: type,
    callStatus: 'requesting',
    content: label + ' requesting...',
    timestamp: Date.now()
  });

  saveState();
  renderChat();
  showToast('Calling...');

  const charId = state.currentCharId;
  setTimeout(() => {
    const msgs = state.chats[charId] || [];
    const callMsg = msgs.find(m => m.id === msgId);
    if (callMsg && callMsg.callStatus === 'requesting') {
      callMsg.callStatus = 'accepted';
      saveState();
      if (state.currentCharId === charId) {
        renderChat();
        if (typeof openCallInterface === 'function') {
          openCallInterface(charId, type, msgId);
        }
      }
    }
  }, 1500);
}

function acceptCallAndOpen(mid) {
  const charId = state.currentCharId;
  const m = (state.chats[charId] || []).find(x => x.id === mid);
  if (!m) return;
  m.callStatus = 'accepted';
  saveState();
  renderChat();
  if (typeof openCallInterface === 'function') {
    openCallInterface(charId, m.callType || 'voice', mid);
  }
}

// ========== REGENERATE CONFIRM ==========
function openReturnConfirm() {
  closePlusMenu();
  const msgs = state.chats[state.currentCharId] || [];
  const hasAiMsg = msgs.some(m => m.role === 'assistant');
  if (!hasAiMsg) {
    showToast('No messages to regenerate');
    return;
  }
  document.getElementById('returnConfirmModal').classList.add('show');
}

function confirmReturn() {
  closeModal('returnConfirmModal');
  const msgs = state.chats[state.currentCharId] || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') {
      regenerateMsg(msgs[i].id);
      return;
    }
  }
  showToast('No messages to regenerate');
}

// ========== HEART VOICE PANEL (Single Chat) ==========
function openHeartVoicePanel() {
  const charId = state.currentCharId;
  if (!charId) return;

  if (isGroupChat(charId)) {
    openGroupManagePanel();
    return;
  }

  const char = state.characters.find(c => c.id === charId);
  if (!char) return;

  const hvAvatar = document.getElementById('hvAvatar');
  if (char.avatar) {
    hvAvatar.style.backgroundImage = 'url(' + char.avatar + ')';
  } else {
    hvAvatar.style.backgroundImage = 'none';
    hvAvatar.style.background = '#e5e5ea';
  }

  document.getElementById('hvCharName').textContent = char.name || 'Character';

  const msgs = state.chats[charId] || [];
  let latestAction = '';
  let latestThought = '';
  let latestWannaDo = '';

  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') {
      latestAction   = msgs[i].innerAction  || '';
      latestThought  = msgs[i].innerThought || '';
      latestWannaDo  = msgs[i].wannaDo      || '';
      break;
    }
  }

  const charCfg = getCharConfig(charId);
  const affection = typeof charCfg.affection === 'number' ? charCfg.affection : 50;

  var affSection = document.getElementById('hvAffectionSection');
  var affDivider = document.getElementById('hvAffectionDivider');
  if (affSection) affSection.style.display = '';
  if (affDivider) affDivider.style.display = '';

  document.getElementById('hvAffectionFill').style.width = affection + '%';
  document.getElementById('hvAffectionNum').textContent   = affection + '%';
  document.getElementById('hvThoughtText').textContent    = latestThought  || '(Thinking...)';
  document.getElementById('hvActionText').textContent     = latestAction   || '(Quietly watching you)';
  document.getElementById('hvWannaDoText').textContent    = latestWannaDo  || '(Nothing special right now)';

  document.getElementById('heartVoiceOverlay').classList.add('show');
  requestAnimationFrame(() => {
    document.getElementById('heartVoicePanel').classList.add('show');
  });
}

function closeHeartVoicePanel() {
  document.getElementById('heartVoicePanel').classList.remove('show');
  setTimeout(() => {
    document.getElementById('heartVoiceOverlay').classList.remove('show');
    var affSection = document.getElementById('hvAffectionSection');
    var affDivider = document.getElementById('hvAffectionDivider');
    if (affSection) affSection.style.display = '';
    if (affDivider) affDivider.style.display = '';
  }, 250);
}

// ========== GROUP MESSAGE HEART VOICE ==========
function openGroupMsgHeartVoice(msgId) {
  const charId = state.currentCharId;
  if (!charId) return;

  const msgs = state.chats[charId] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg || msg.role !== 'assistant') return;

  const senderChar = msg.senderId ? state.characters.find(c => c.id === msg.senderId) : null;
  if (!senderChar) return;

  const hvAvatar = document.getElementById('hvAvatar');
  if (senderChar.avatar) {
    hvAvatar.style.backgroundImage = 'url(' + senderChar.avatar + ')';
  } else {
    hvAvatar.style.backgroundImage = 'none';
    hvAvatar.style.background = '#e5e5ea';
  }

  document.getElementById('hvCharName').textContent = senderChar.name || 'Character';

  var affSection = document.getElementById('hvAffectionSection');
  var affDivider = document.getElementById('hvAffectionDivider');
  if (affSection) affSection.style.display = 'none';
  if (affDivider) affDivider.style.display = 'none';

  document.getElementById('hvThoughtText').textContent = msg.innerThought || '(Thinking...)';
  document.getElementById('hvActionText').textContent  = msg.innerAction  || '(Quietly watching you)';
  document.getElementById('hvWannaDoText').textContent = msg.wannaDo      || '(Nothing special right now)';

  document.getElementById('heartVoiceOverlay').classList.add('show');
  requestAnimationFrame(() => {
    document.getElementById('heartVoicePanel').classList.add('show');
  });
}

// ========== GROUP MANAGEMENT PANEL ==========
function openGroupManagePanel() {
  const grp = getGroupById(state.currentCharId);
  if (!grp) { showToast('Group not found'); return; }

  const avatarEl = document.getElementById('gmGroupAvatar');
  if (grp.avatar) {
    avatarEl.style.backgroundImage = 'url(' + grp.avatar + ')';
    avatarEl.innerHTML = '';
  } else {
    avatarEl.style.backgroundImage = 'none';
    avatarEl.innerHTML = _defaultGroupHeaderAvatar();
  }

  document.getElementById('gmGroupName').value = grp.name || '';
  document.getElementById('gmNickname').value = grp.userNickname || state.userProfile.name || '';
  tmp.groupAvatarData = null;
  renderGroupMemberList();

  const addView = document.getElementById('gmAddMemberView');
  if (addView) addView.style.display = 'none';

  document.getElementById('groupManageModal').classList.add('show');
}

function renderGroupMemberList() {
  const grp = getGroupById(state.currentCharId);
  if (!grp) return;

  let html = '';
  (grp.members || []).forEach(function(mid) {
    const mc = state.characters.find(c => c.id === mid);
    if (!mc) return;
    const avSrc = mc.avatar
      ? '<img src="' + mc.avatar + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover">'
      : '<div style="width:36px;height:36px;border-radius:50%;background:#e5e5ea;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 32 32" style="width:20px;height:20px"><circle cx="16" cy="12" r="5" stroke="#aaa" stroke-width="1.5" fill="none"/><path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#aaa" stroke-width="1.5" fill="none"/></svg></div>';
    html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f2f2f7">';
    html += '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0">' + avSrc + '</div>';
    html += '<div style="flex:1;font-size:15px;color:#1d1d1f">' + esc(mc.name) + '</div>';
    html += '<button onclick="removeMemberFromGroup(\'' + mid + '\')" style="background:none;border:1px solid #ff3b30;border-radius:6px;padding:4px 10px;cursor:pointer;color:#ff3b30;font-size:12px;font-family:inherit">移除</button>';
    html += '</div>';
  });

  document.getElementById('gmMemberList').innerHTML = html;
  const countEl = document.getElementById('gmMemberCount');
  if (countEl) countEl.textContent = (grp.members || []).length;
}

function toggleAddMemberView() {
  const view = document.getElementById('gmAddMemberView');
  const btn = document.getElementById('gmAddMemberBtn');
  if (view.style.display === 'none' || !view.style.display) {
    renderAvailableCharList();
    view.style.display = 'block';
    if (btn) btn.textContent = '收起';
  } else {
    view.style.display = 'none';
    if (btn) btn.textContent = '添加';
  }
}

function renderAvailableCharList() {
  const grp = getGroupById(state.currentCharId);
  if (!grp) return;

  const available = state.characters.filter(c => !(grp.members || []).includes(c.id));
  let html = '';
  if (!available.length) {
    html = '<div style="text-align:center;color:#8e8e93;padding:16px;font-size:13px">没有可添加的角色</div>';
  } else {
    available.forEach(function(c) {
      const avSrc = c.avatar
        ? '<img src="' + c.avatar + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover">'
        : '<div style="width:32px;height:32px;border-radius:50%;background:#e5e5ea"></div>';
      html += '<div onclick="addMemberToGroup(\'' + c.id + '\')" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f2f2f7;cursor:pointer">';
      html += '<div style="width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0">' + avSrc + '</div>';
      html += '<div style="flex:1;font-size:14px;color:#1d1d1f">' + esc(c.name) + '</div>';
      html += '<span style="color:#007aff;font-size:13px;font-weight:500">+ 添加</span>';
      html += '</div>';
    });
  }
  document.getElementById('gmAvailableCharList').innerHTML = html;
}

function addMemberToGroup(charId) {
  const grp = getGroupById(state.currentCharId);
  if (!grp) return;
  if (!grp.members) grp.members = [];
  if (!grp.members.includes(charId)) {
    grp.members.push(charId);
    saveState();
    renderGroupMemberList();
    renderAvailableCharList();
    renderChat();
    showToast('成员已添加');
  }
}

function removeMemberFromGroup(charId) {
  const grp = getGroupById(state.currentCharId);
  if (!grp) return;
  if ((grp.members || []).length <= 2) {
    showToast('群组至少需要2名成员');
    return;
  }
  grp.members = (grp.members || []).filter(m => m !== charId);
  saveState();
  renderGroupMemberList();
  renderAvailableCharList();
  renderChat();
  showToast('成员已移除');
}

function previewGroupAvatar(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = function(e) {
      tmp.groupAvatarData = e.target.result;
      const avatarEl = document.getElementById('gmGroupAvatar');
      avatarEl.style.backgroundImage = 'url(' + e.target.result + ')';
      avatarEl.innerHTML = '';
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function saveGroupInfo() {
  const grp = getGroupById(state.currentCharId);
  if (!grp) return;
  const name = document.getElementById('gmGroupName').value.trim();
  if (name) grp.name = name;
  if (tmp.groupAvatarData) {
    grp.avatar = tmp.groupAvatarData;
    tmp.groupAvatarData = null;
  }
  saveState();
  renderChat();
  showToast('群信息已保存');
}

function saveGroupNickname() {
  const grp = getGroupById(state.currentCharId);
  if (!grp) return;
  const nick = document.getElementById('gmNickname').value.trim();
  grp.userNickname = nick;
  saveState();
  showToast('群昵称已保存');
}

function confirmLeaveGroup() {
  document.getElementById('leaveGroupConfirmModal').classList.add('show');
}

function leaveGroup() {
  closeModal('leaveGroupConfirmModal');
  closeModal('groupManageModal');
  const groupId = state.currentCharId;
  state.groups = (state.groups || []).filter(g => g.id !== groupId);
  delete state.chats[groupId];
  delete state.unread[groupId];
  state.currentCharId = null;
  saveState();
  nav('screen-imessage');
  renderCharList();
  showToast('已退出群组');
}
