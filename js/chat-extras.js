// ========== 13-chat-extras.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js

// ========== TRANSFER / IMAGE MODALS ==========
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
  state.chats[state.currentCharId].push({
    id: uid(), role: 'user', content: JSON.stringify({ amount: amt, note }), type: 'transfer', timestamp: Date.now()
  });
  saveState();
  closeModal('transferModal');
  renderChat();
}

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
      id: uid(), role: 'user', content: '[User sent a real photo]', type: 'image', dataUrl: tmp.realImageData, timestamp: Date.now()
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

// ========== PLUS MENU / STICKERS / VOICE ==========
function togglePlusMenu() {
  document.getElementById('plusMenu').classList.toggle('show');
  document.getElementById('plusMenuOverlay').classList.toggle('show');
}

function closePlusMenu() {
  document.getElementById('plusMenu')?.classList.remove('show');
  document.getElementById('plusMenuOverlay')?.classList.remove('show');
}

function openVoiceModal() {
  closePlusMenu();
  document.getElementById('voiceText').value = '';
  document.getElementById('voiceModal').classList.add('show');
}

function sendVoice() {
  const t = document.getElementById('voiceText').value.trim();
  if (!t || !state.currentCharId) return;
  state.chats[state.currentCharId].push({ id: uid(), role: 'user', content: t, type: 'voice', timestamp: Date.now() });
  saveState();
  closeModal('voiceModal');
  renderChat();
}

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
  state.chats[state.currentCharId].push({ id: uid(), role: 'user', content: s.dataUrl, type: 'sticker', timestamp: Date.now() });
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
