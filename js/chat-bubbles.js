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

function buildImageBubble(src) {
  return '<div class="msg-bubble image-msg"><img src="' + src + '"></div>';
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
