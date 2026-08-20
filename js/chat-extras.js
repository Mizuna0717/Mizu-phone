// ========== 13-chat-extras.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js

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

  // ★★★ 自动模拟角色 1.5 秒后领取（用户→角色） ★★★
  const charId = state.currentCharId;
  setTimeout(() => {
    const msgs = state.chats[charId] || [];
    const tMsg = msgs.find(m => m.id === msgId);
    if (tMsg && !tMsg.transferStatus) {
      tMsg.transferStatus = 'accepted';
      saveState();
      if (state.currentCharId === charId) {
        renderChat();
      }
      showToast('对方已领取');
    }
  }, 1500);
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
  if (!state.stickers.length) { g.innerHTML = '<div class="sticker-empty">No stickers</div>'; return; }
  g.innerHTML = state.stickers.map(s =>
    `<div class="sticker-item" onclick="sendSticker('${s.id}')"><img src="${s.dataUrl}"><div class="sticker-name">${esc(s.name)}</div><button class="sticker-del" onclick="event.stopPropagation();delSticker('${s.id}')"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6"/></svg></button></div>`
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
  document.getElementById('stickerManageBtn').textContent = p.classList.contains('manage') ? T('done') : T('manage');
}

// ========== CHAT MENU ==========
function toggleChatMenu() {
  const m = document.getElementById('chatMenu');
  const o = document.getElementById('chatMenuOverlay');
  const isOpen = m.classList.contains('open');
  if (isOpen) { m.classList.remove('open'); o.classList.remove('show'); }
  else { m.classList.add('open'); o.classList.add('show'); }
}

function closeChatMenu() {
  document.getElementById('chatMenu')?.classList.remove('open');
  document.getElementById('chatMenuOverlay')?.classList.remove('show');
}

// ========== ★★★ 电话 / 通话模态框 ★★★ ==========
function openCallModal() {
  closePlusMenu();
  document.getElementById('callModal').classList.add('show');
}

function startCall(type) {
  closeModal('callModal');

  if (!state.currentCharId) return;
  if (!state.chats[state.currentCharId]) state.chats[state.currentCharId] = [];

  const msgId = uid();
  const label = type === 'video' ? '视频通话' : '语音通话';

  // ★ 发送通话请求消息到聊天中
  state.chats[state.currentCharId].push({
    id: msgId,
    role: 'user',
    type: 'call',
    callType: type,
    callStatus: 'requesting',
    content: label + '请求中',
    timestamp: Date.now()
  });

  saveState();
  renderChat();
  showToast('正在呼叫…（' + label + '）');

  // ★★★ 角色自动接听：1 秒后自动变为「已接通」★★★
  const charId = state.currentCharId;
  setTimeout(() => {
    const msgs = state.chats[charId] || [];
    const callMsg = msgs.find(m => m.id === msgId);
    if (callMsg && callMsg.callStatus === 'requesting') {
      callMsg.callStatus = 'accepted';
      saveState();
      if (state.currentCharId === charId) {
        renderChat();
      }
      showToast('通话已接通（模拟）');
    }
  }, 1000);
}

// ========== ★★★ 重回确认（+号菜单中的重回） ★★★ ==========
function openReturnConfirm() {
  closePlusMenu();
  // 检查是否有角色消息可以重新生成
  const msgs = state.chats[state.currentCharId] || [];
  const hasAiMsg = msgs.some(m => m.role === 'assistant');
  if (!hasAiMsg) {
    showToast('没有可重新生成的消息');
    return;
  }
  document.getElementById('returnConfirmModal').classList.add('show');
}

function confirmReturn() {
  closeModal('returnConfirmModal');
  const msgs = state.chats[state.currentCharId] || [];
  // 找到最后一条角色消息
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') {
      regenerateMsg(msgs[i].id);
      return;
    }
  }
  showToast('没有可重新生成的消息');
}

// ========== 心声面板 ==========
function openHeartVoicePanel() {
  const charId = state.currentCharId;
  if (!charId) return;

  const char = state.characters.find(c => c.id === charId);
  if (!char) return;

  const hvAvatar = document.getElementById('hvAvatar');
  if (char.avatar) {
    hvAvatar.style.backgroundImage = 'url(' + char.avatar + ')';
  } else {
    hvAvatar.style.backgroundImage = 'none';
    hvAvatar.style.background = '#e5e5ea';
  }

  document.getElementById('hvCharName').textContent = char.name || '角色';

  const msgs = state.chats[charId] || [];
  let latestAction = '';
  let latestThought = '';

  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') {
      latestAction  = msgs[i].innerAction  || '';
      latestThought = msgs[i].innerThought || '';
      break;
    }
  }

  document.getElementById('hvActionText').textContent  = latestAction  || '（静静地看着你）';
  document.getElementById('hvThoughtText').textContent = latestThought || '（正在思考……）';

  document.getElementById('heartVoiceOverlay').classList.add('show');
  requestAnimationFrame(() => {
    document.getElementById('heartVoicePanel').classList.add('show');
  });
}

function closeHeartVoicePanel() {
  document.getElementById('heartVoicePanel').classList.remove('show');
  setTimeout(() => {
    document.getElementById('heartVoiceOverlay').classList.remove('show');
  }, 250);
}
