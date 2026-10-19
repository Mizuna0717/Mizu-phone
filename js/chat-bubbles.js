// ========== chat-bubbles.js ==========
// All bubble builder functions

function wrapBubble(side, avHtml, inner) {
  return '<div class="msg-row ' + side + '"><div class="msg-avatar">' + avHtml + '</div>' + inner + '</div>';
}

function buildVoiceBubble(content) {
  return '<div class="msg-bubble voice" onclick="toggleVoiceText(this)">' +
    '<div class="voice-row">' +
    '<svg viewBox="0 0 20 20"><polygon points="4,2 18,10 4,18" fill="currentColor" stroke="none"/></svg>' +
    '<div class="voice-wave">' + makeWaveBars() + '</div></div>' +
    '<div class="voice-text">' + esc(content) + '</div></div>';
}

function buildStickerBubble(url) {
  return '<div class="msg-bubble sticker-msg"><img src="' + url + '"></div>';
}

function buildTransferBubble(amount, note, msgId, isSent, status) {
  var h = '<div class="msg-bubble transfer-msg"><div class="transfer-card">';
  h += '<div class="tc-label">' + T('transfer') + '</div>';
  h += '<div class="tc-amount">\u00A5' + esc(String(amount)) + '</div>';
  if (note) h += '<div class="tc-note">' + esc(note) + '</div>';
  if (status) {
    var label = status === 'accepted' ? 'Accepted' : 'Declined';
    h += '<div class="transfer-status ' + status + '">' + label + '</div>';
  } else if (isSent) {
    h += '<div class="transfer-status pending">Pending</div>';
  } else {
    h += '<div class="transfer-actions">';
    h += '<button class="ta-accept" onclick="event.stopPropagation();acceptTransfer(\'' + msgId + '\')">Accept</button>';
    h += '<button class="ta-decline" onclick="event.stopPropagation();declineTransfer(\'' + msgId + '\')">Decline</button>';
    h += '</div>';
  }
  h += '</div></div>';
  return h;
}

function buildSimImageBubble(content) {
  return '<div class="msg-bubble sim-image-msg"><div class="sim-image-box">' +
    '<svg viewBox="0 0 28 28"><rect x="2" y="2" width="24" height="24" rx="4" stroke-dasharray="3 2" stroke="#c7c7cc" stroke-width="1.3" fill="none"/>' +
    '<path d="M8 14h12M14 8v12" stroke="#c7c7cc" stroke-width="1.3" fill="none"/></svg>' +
    '<div class="sim-desc">' + esc(content) + '</div></div></div>';
}

function buildImageBubble(msg) {
  // 兼容旧调用（传字符串）
  if (typeof msg === 'string') {
    return '<div class="msg-bubble image-msg"><img src="' + msg + '"></div>';
  }

  var src = msg.dataUrl || msg.content;
  var desc = _getImageDesc(msg);
  var msgId = msg.id;

  // ★ 有描述且处于"文字模式"→ 显示文字卡片
  if (msg._showText && desc) {
    return '<div class="msg-bubble image-msg image-msg-text" data-msgid="' + msgId + '"' +
      ' onclick="toggleImageText(event,\'' + msgId + '\')">' +
      '<div class="image-text-content">' + esc(desc) + '</div>' +
    '</div>';
  }

  return '<div class="msg-bubble image-msg" data-msgid="' + msgId + '"' +
    ' onclick="toggleImageText(event,\'' + msgId + '\')">' +
    '<img src="' + src + '">' +
  '</div>';
}

function buildTextBubble(content, msgId) {
  return '<div class="msg-bubble" data-msgid="' + msgId + '" onclick="showMsgPopover(event,\'' + msgId + '\')">' + fmtMsg(content) + '</div>';
}

function buildCallBubble(callType, msgId, isSent, callStatus, callDuration, extraAttr) {
  var isVideo = callType === 'video';
  var label = isVideo ? 'Video Call' : 'Voice Call';
  var icon = isVideo
    ? '<svg viewBox="0 0 20 20" class="call-type-icon"><rect x="2" y="5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M13 7.5l5-2.5v10l-5-2.5z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>'
    : '<svg viewBox="0 0 20 20" class="call-type-icon"><path d="M6.6 3H5A2 2 0 003 5c0 7.2 5.8 13 13 13a2 2 0 002-2v-1.6a1.5 1.5 0 00-1-1.4l-2.7-.8a1.5 1.5 0 00-1.5.4l-1 1A9.4 9.4 0 017.4 9l1-1a1.5 1.5 0 00.4-1.5l-.8-2.7A1.5 1.5 0 006.6 3z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
  var statusHtml = '';
  if (callStatus === 'ended') {
    statusHtml = '<div class="call-status ended">Duration ' + (callDuration || '00:00') + '</div>';
  } else if (callStatus === 'accepted') {
    statusHtml = '<div class="call-status accepted">Connected</div>';
  } else if (callStatus === 'declined') {
    statusHtml = '<div class="call-status declined">Declined</div>';
  } else if (callStatus === 'requesting') {
    statusHtml = '<div class="call-status requesting">Requesting</div>';
  } else if (!isSent && !callStatus) {
    statusHtml = '<div class="call-actions">' +
      '<button class="call-accept-btn" onclick="event.stopPropagation();acceptCall(\'' + msgId + '\')">Accept</button>' +
      '<button class="call-decline-btn" onclick="event.stopPropagation();declineCall(\'' + msgId + '\')">Decline</button>' +
      '</div>';
  }
  var labelText;
  if (isSent) {
    labelText = label;
  } else if (!callStatus) {
    var ch = state.characters.find(function(c) { return c.id === state.currentCharId; });
    labelText = (ch ? ch.name : 'Character') + ' invites ' + label;
  } else {
    labelText = label;
  }
  return '<div class="msg-bubble call-msg"' + (extraAttr || '') + '>' +
    '<div class="call-card"><div class="call-icon-wrap">' + icon + '</div>' +
    '<div class="call-info"><div class="call-label">' + labelText + '</div>' +
    statusHtml + '</div></div></div>';
}

function buildMsgExtraActions(msgId, isReceived, isRecalled) {
  return '';
}

// ═══════════════════════════════════════
//  ★ 图片消息：描述读取 / 点击切换 / 长按保护
// ═══════════════════════════════════════

// 从消息里提取纯文本描述（兼容新旧格式）
function _getImageDesc(msg) {
  if (!msg) return '';
  if (typeof msg.desc === 'string' && msg.desc.trim()) return msg.desc.trim();
  var c = (msg.content || '').trim();
  if (!c) return '';
  var m = c.match(/^\[图片[:：]\s*([\s\S]*?)\]$/);
  if (m) return m[1].trim();
  if (c === '[图片]' || /^\[图片（识别失败）\]$/.test(c) || /^\[图片识别中\.\.\.\]$/.test(c)) {
    return '';
  }
  return c;
}

// ★ 点击图片 ↔ 文字切换
function toggleImageText(event, msgId) {
  // 多选模式下不切换
  if (typeof bubbleState !== 'undefined' && bubbleState.multiMode) return;
  // 长按刚触发过，忽略这次 click（避免长按后误触）
  if (Date.now() - (window._lastLongPressTs || 0) < 800) return;
  if (event) event.stopPropagation();

  var msg = (state.chats[state.currentCharId] || []).find(function(m) { return m.id === msgId; });
  if (!msg) return;
  if (msg.type !== 'image') return;

  var desc = _getImageDesc(msg);
  if (!desc) {
    showToast('暂无图片描述');
    return;
  }
  msg._showText = !msg._showText;
  saveState();
  renderChat();
}

// ★ 记录长按时间（供 toggleImageText 检测）
window._lastLongPressTs = 0;
