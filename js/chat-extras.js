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
  var hintEl = document.getElementById('realImageHint');
  if (hintEl) hintEl.value = '';
  tmp.realImageData = null;
  document.getElementById('imageModal').classList.add('show');
}

function setImgType(t) {
  tmp.imgType = t;
  document.getElementById('imgTypeReal').classList.toggle('active', t === 'real');
  document.getElementById('imgTypeSim').classList.toggle('active', t === 'sim');
  document.getElementById('imgRealArea').style.display = t === 'real' ? 'block' : 'none';
  document.getElementById('imgSimArea').style.display = t === 'sim' ? 'block' : 'none';
  // ★ 底部按钮文字随 tab 切换
  var btn = document.getElementById('imageModalSendBtn');
  if (btn) btn.textContent = (t === 'real') ? '解析图片' : '发送';
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

async function sendImage() {
  if (!state.currentCharId) return;

  if (tmp.imgType === 'real') {
    if (!tmp.realImageData) return;
    var hintEl = document.getElementById('realImageHint');
    var hint = hintEl ? hintEl.value.trim() : '';
    await _sendRealImageWithVision(tmp.realImageData, hint);
  } else {
    var text = document.getElementById('simImageText').value.trim();
    if (!text) return;
    state.chats[state.currentCharId].push({
      id: uid(), role: 'user', content: text, type: 'simImage', timestamp: Date.now()
    });
    saveState();
    closeModal('imageModal');
    renderChat();
  }
}

async function sendImage() {
  if (!state.currentCharId) return;

  if (tmp.imgType === 'real') {
    if (!tmp.realImageData) return;
    var hintEl = document.getElementById('realImageHint');
    var hint = hintEl ? hintEl.value.trim() : '';
    await _sendRealImageWithVision(tmp.realImageData, hint);
  } else {
    var text = document.getElementById('simImageText').value.trim();
    if (!text) return;
    state.chats[state.currentCharId].push({
      id: uid(), role: 'user', content: text, type: 'simImage', timestamp: Date.now()
    });
    saveState();
    closeModal('imageModal');
    renderChat();
  }
}

async function _sendRealImageWithVision(dataUrl, hint) {
  var charId = state.currentCharId;
  closeModal('imageModal');

  var msg = {
    id: uid(), role: 'user',
    content: '[图片识别中...]',
    type: 'image',
    dataUrl: dataUrl,
    timestamp: Date.now(),
    _visionLoading: true,
    desc: ''                    // ★ 新增：纯文本描述
  };
  state.chats[charId].push(msg);
  saveState();
  renderChat();

  try {
    var desc = await _describeImage(dataUrl, hint);
    msg.desc = desc || '';
    msg.content = desc ? '[图片: ' + desc + ']' : '[图片]';
    delete msg._visionLoading;
    saveState();
    renderChat();
    showToast(desc ? '图片识别完成' : '图片识别完成（无文字内容）');
  } catch (e) {
    console.error('[vision] 失败:', e);
    msg.desc = '';
    msg.content = '[图片（识别失败）]';
    delete msg._visionLoading;
    saveState();
    renderChat();
    showToast('图片识别失败');
  }
}

async function _describeImage(dataUrl, hint) {
  var api = state.apis.find(function(a){ return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) throw new Error('无可用 API');

  var base = api._resolvedBase || api.url;
  var endpoint = base.replace(/\/$/, '') + '/chat/completions';
  var apiKey = api.key || api.apiKey || api.token || '';

  var basePrompt = '请详细描述这张图片：主体、场景、人物表情、氛围、图中文字。用中文，一段话，不要前言，不要markdown。';
  // ★ 用户填的提示词附加在后面，帮助 AI 更准确识别
  var finalPrompt = hint
    ? basePrompt + '\n\n（用户补充说明：' + hint + '）'
    : basePrompt;

  var resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: api.model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: finalPrompt },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }],
      max_tokens: 300
    })
  });

  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var data = await resp.json();
  var text = data && data.choices && data.choices[0] && data.choices[0].message
           ? data.choices[0].message.content : '';
  return String(text || '').trim();
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
  // ★ 防御：打开心声弹窗前，强制关闭聊天菜单，避免层级冲突
  try { if (typeof closeChatMenu === 'function') closeChatMenu(); } catch (_) {}
  try {
    var _m = document.getElementById('chatMenu');
    var _o = document.getElementById('chatMenuOverlay');
    if (_m) { _m.classList.remove('show'); _m.style.display = 'none'; _m.style.pointerEvents = 'none'; }
    if (_o) { _o.classList.remove('show'); }
  } catch (_) {}

  const charId = state.currentCharId;
  if (!charId) return;
  // ... 后面保持原样

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
    // ★ 渲染情绪区（只有开了强控/顶号且有情绪数据才显示）
  _renderHeartEmotions(charId);

  requestAnimationFrame(() => {
    document.getElementById('heartVoicePanel').classList.add('show');
  });
}

function closeHeartVoicePanel() {
  var panel   = document.getElementById('heartVoicePanel');
  var overlay = document.getElementById('heartVoiceOverlay');

  if (panel)   panel.classList.remove('show');

  // ★ 立即禁止 overlay 接收点击，避免 250ms 动画期间误触下层元素
  if (overlay) overlay.style.pointerEvents = 'none';

  setTimeout(function() {
    if (overlay) {
      overlay.classList.remove('show');
      overlay.style.pointerEvents = '';   // 恢复默认，下次打开能正常点
    }
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
    var emSection = document.getElementById('hvEmotionSection');
  if (emSection) emSection.classList.remove('visible');

  requestAnimationFrame(() => {
    document.getElementById('heartVoicePanel').classList.add('show');
  });
}



// ========== GROUP MANAGEMENT PANEL ==========
function openGroupManagePanel() {
  var grp = getGroupById(state.currentCharId);
  if (!grp) { showToast('Group not found'); return; }

    // 头像（★ 不再用 innerHTML，避免删掉 file input）
  var avatarEl = document.getElementById('gmGroupAvatar');
  var avatarSvg = document.getElementById('gmAvatarSvg');
  if (grp.avatar) {
    avatarEl.style.backgroundImage = 'url(' + grp.avatar + ')';
    if (avatarSvg) avatarSvg.style.display = 'none';
  } else {
    avatarEl.style.backgroundImage = 'none';
    if (avatarSvg) avatarSvg.style.display = '';
  }
  // 重置 file input（允许再次选同一张）
  var avatarInput = document.getElementById('gmAvatarInput');
  if (avatarInput) avatarInput.value = '';

  // 表单
  document.getElementById('gmGroupName').value = grp.name || '';
  document.getElementById('gmNickname').value = grp.userNickname || state.userProfile.name || '';
  tmp.groupAvatarData = null;

  // 成员列表
  renderGroupMemberList();

  // 收起添加成员
  var addView = document.getElementById('gmAddMemberView');
  if (addView) addView.style.display = 'none';
  var addBtn = document.getElementById('gmAddMemberBtn');
  if (addBtn) addBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg> 添加成员';

  // ★ 用 nav 切页，不是弹窗
  nav('screen-group-manage');
}

function closeGroupManagePanel() {
  nav('screen-chat');
}
window.closeGroupManagePanel = closeGroupManagePanel;

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
    // ★ 优先显示群昵称
    const groupNick = (grp.nicknames && grp.nicknames[mid]) || '';
    const displayName = groupNick || mc.name;
    html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f2f2f7">';
    html += '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0">' + avSrc + '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:15px;color:#1d1d1f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(displayName) + '</div>';
    if (groupNick && groupNick !== mc.name) {
      html += '<div style="font-size:11px;color:#8e8e93;margin-top:1px">' + esc(mc.name) + '</div>';
    }
    html += '</div>';
    // ★ 改成"管理"
    html += '<button onclick="openMemberManageModal(\'' + mid + '\')" style="background:none;border:1px solid #d1d1d6;border-radius:6px;padding:4px 10px;cursor:pointer;color:#3a3a3c;font-size:12px;font-family:inherit">管理</button>';
    html += '</div>';
  });

  document.getElementById('gmMemberList').innerHTML = html;
  const countEl = document.getElementById('gmMemberCount');
  if (countEl) countEl.textContent = ((grp.members || []).length + 1);   // ★ +1 是自己
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
  // ★ 现在成员数包含自己，所以最少 3 个（2 个角色 + 我），移除后剩 2（1 角色 + 我）就报错
  if ((grp.members || []).length <= 1) {
    showToast('群组至少需要1名其他成员');
    return;
  }
  grp.members = (grp.members || []).filter(m => m !== charId);
  if (grp.nicknames) delete grp.nicknames[charId];
  saveState();
  renderGroupMemberList();
  renderAvailableCharList();
  renderChat();
  showToast('成员已移除');
}

// ========== 成员管理弹窗 ==========
function openMemberManageModal(charId) {
  var grp = getGroupById(state.currentCharId);
  if (!grp) return;
  var mc = state.characters.find(c => c.id === charId);
  if (!mc) return;

  tmp.memberManageCharId = charId;

  var nameEl = document.getElementById('gmMemberManageName');
  if (nameEl) nameEl.textContent = mc.name;

  var nickInput = document.getElementById('gmMemberNicknameInput');
  if (nickInput) {
    var existing = (grp.nicknames && grp.nicknames[charId]) || '';
    nickInput.value = existing;
    nickInput.placeholder = '默认：' + mc.name;
  }

  document.getElementById('gmMemberManageModal').classList.add('show');
}

function saveMemberGroupNickname() {
  var grp = getGroupById(state.currentCharId);
  var cid = tmp.memberManageCharId;
  if (!grp || !cid) return;

  if (!grp.nicknames) grp.nicknames = {};
  var input = document.getElementById('gmMemberNicknameInput');
  var val = input ? input.value.trim() : '';
  if (val) {
    grp.nicknames[cid] = val;
  } else {
    delete grp.nicknames[cid];
  }
  saveState();
  closeModal('gmMemberManageModal');
  renderGroupMemberList();
  renderChat();
  showToast(val ? '群昵称已保存' : '已恢复默认名称');
}

function removeMemberFromGroupFromManage() {
  var cid = tmp.memberManageCharId;
  if (!cid) return;
  closeModal('gmMemberManageModal');
  removeMemberFromGroup(cid);
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
  if (!confirm('退出群聊？\n\n退出后该群聊的所有消息将从你的列表移除，且无法恢复。')) return;
  leaveGroup();
}

function leaveGroup() {
  var groupId = state.currentCharId;
  state.groups = (state.groups || []).filter(function(g) { return g.id !== groupId; });
  delete state.chats[groupId];
  delete state.unread[groupId];
  state.currentCharId = null;
  saveState();
  nav('screen-imessage');
  renderCharList();
  showToast('已退出群组');
}

// ============================================================
//  心声面板 — 情绪显示
// ============================================================

function _renderHeartEmotions(charId) {
  if (!charId) return;

  var section = document.getElementById('hvEmotionSection');
  if (!section) {
    var content = document.querySelector('#heartVoicePanel .hv-content');
    if (!content) return;
    section = document.createElement('div');
    section.id = 'hvEmotionSection';
    section.className = 'hv-emotion-section';
    section.innerHTML =
      '<div class="hv-emotion-header">' +
        '<span class="hv-emotion-title">Emotions</span>' +
      '</div>' +
      '<div class="hv-emotion-list">' +
        _buildEmotionRow('anger', '愤怒') +
        _buildEmotionRow('suspicion', '怀疑') +
        _buildEmotionRow('trust', '信任') +
        _buildEmotionRow('patience', '耐心') +
      '</div>';
    content.appendChild(section);
  }

  // 判断是否开启强控/顶号
  var cfg = getCharConfig(charId);
  var hasTp = !!(cfg && cfg.topPriority);
  var hasFc = !!(cfg && cfg.forceControl);

  if (!hasTp && !hasFc) {
    section.classList.remove('visible');
    return;
  }

  // 读情绪数据
  var emotions = null;
  try {
    if (hasTp && typeof getTpLock === 'function') {
      var tpLock = getTpLock(charId);
      if (tpLock && tpLock.emotions) emotions = tpLock.emotions;
    }
    if (!emotions && hasFc && typeof getFcLock === 'function') {
      var fcLock = getFcLock(charId);
      if (fcLock && fcLock.emotions) emotions = fcLock.emotions;
    }
  } catch (e) { console.warn('[HeartEmotions] 读取失败:', e); }

  if (!emotions) {
    section.classList.remove('visible');
    return;
  }

  section.classList.add('visible');

  ['anger', 'suspicion', 'trust', 'patience'].forEach(function (key) {
    var val = parseInt(emotions[key], 10);
    if (isNaN(val)) val = 0;
    val = Math.max(0, Math.min(10, val));
    var item = section.querySelector('.hv-emotion-item[data-emotion="' + key + '"]');
    if (!item) return;
    var fill = item.querySelector('.hv-emotion-fill');
    var num  = item.querySelector('.hv-emotion-num');
    if (fill) fill.style.width = (val * 10) + '%';
    if (num)  num.textContent  = val;
  });
}

function _buildEmotionRow(key, label) {
  return '<div class="hv-emotion-item" data-emotion="' + key + '">' +
    '<span class="hv-emotion-label">' + label + '</span>' +
    '<div class="hv-emotion-track">' +
      '<div class="hv-emotion-fill"></div>' +
    '</div>' +
    '<span class="hv-emotion-num">0</span>' +
  '</div>';
}

// ========== 群信息自动保存（防 onchange 不触发） ==========
var _saveGroupInfoTimer = null;
var _saveGroupNicknameTimer = null;

function debouncedSaveGroupInfo() {
  if (_saveGroupInfoTimer) clearTimeout(_saveGroupInfoTimer);
  _saveGroupInfoTimer = setTimeout(function() {
    var grp = getGroupById(state.currentCharId);
    if (!grp) return;
    var el = document.getElementById('gmGroupName');
    if (!el) return;
    var name = el.value.trim();
    if (name) grp.name = name;
    saveState();
  }, 500);
}

function debouncedSaveGroupNickname() {
  if (_saveGroupNicknameTimer) clearTimeout(_saveGroupNicknameTimer);
  _saveGroupNicknameTimer = setTimeout(function() {
    var grp = getGroupById(state.currentCharId);
    if (!grp) return;
    var el = document.getElementById('gmNickname');
    if (!el) return;
    grp.userNickname = el.value.trim();
    saveState();
  }, 500);
}

window.debouncedSaveGroupInfo = debouncedSaveGroupInfo;
window.debouncedSaveGroupNickname = debouncedSaveGroupNickname;