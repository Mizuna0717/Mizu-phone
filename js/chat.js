// ========== 11-chat.js ==========

// ========== iMessage time format ==========
function fmtChatTime(ts) {
  var d = new Date(ts);
  var months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  var h = d.getHours();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  var min = d.getMinutes().toString().padStart(2, '0');
  return months[d.getMonth()] + ' ' + d.getDate() + ' ' + h + ':' + min + ' ' + ampm;
}

// ========== Default avatar SVGs ==========
function _defaultHeaderAvatar() {
  return '<svg viewBox="0 0 28 28" style="width:100%;height:100%;display:block">' +
    '<circle cx="14" cy="11" r="4.5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M5 25c0-5 4-9 9-9s9 4 9 9" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

function _defaultGroupHeaderAvatar() {
  return '<svg viewBox="0 0 28 28" style="width:100%;height:100%;display:block">' +
    '<circle cx="10" cy="10" r="3.5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<circle cx="18" cy="10" r="3.5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M3 22c0-4 3-7 7-7s7 3 7 7" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M14 22c0-4 2-7 5-7s5 3 5 7" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

function _defaultMsgAvatar() {
  return '<svg viewBox="0 0 32 32" style="width:100%;height:100%;display:block">' +
    '<circle cx="16" cy="12" r="5" stroke="#aaa" stroke-width="1.5" fill="none"/>' +
    '<path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#aaa" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

function _chatMsgAvatarHtml(src) {
  if (src) return '<img src="' + src + '">';
  return _defaultMsgAvatar();
}

function openChat(cid) {
  state.currentCharId = cid;
  state.unread[cid] = 0;
  if (!state.chats[cid]) state.chats[cid] = [];
  saveState();
  nav('screen-chat');
  if (!isGroupChat(cid) && typeof restartAutoMessageTimer === 'function') {
    restartAutoMessageTimer(cid);
  }
}

function getUserAv(cid) {
  var m = getMaskForChar(cid);
  return m?.avatar || state.userProfile.avatar || null;
}

// ========== CHAT BUBBLE BUILDERS ==========
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

// ========== Parse three-part reply ==========
function parseThreePartReply(raw) {
  var result = {
    content: raw,
    innerAction: '',
    innerThought: '',
    translation: '',
    affection: '',
    wannaDo: ''
  };

  var tags = ['回复','动作','心声','翻译','好感','想要'];
  var tagPattern = tags.map(function(t) { return '【' + t + '】'; }).join('|');
  var hasAny = new RegExp(tagPattern).test(raw);
  if (!hasAny) return result;

  var replyMatch       = raw.match(/【回复】\s*([\s\S]*?)(?=【动作】|【心声】|【翻译】|【好感】|【想要】|$)/);
  var actionMatch      = raw.match(/【动作】\s*([\s\S]*?)(?=【回复】|【心声】|【翻译】|【好感】|【想要】|$)/);
  var thoughtMatch     = raw.match(/【心声】\s*([\s\S]*?)(?=【回复】|【动作】|【翻译】|【好感】|【想要】|$)/);
  var translationMatch = raw.match(/【翻译】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|【好感】|【想要】|$)/);
  var affectionMatch   = raw.match(/【好感】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|【翻译】|【想要】|$)/);
  var wannaMatch       = raw.match(/【想要】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|【翻译】|【好感】|$)/);

  if (replyMatch)       result.content      = replyMatch[1].trim();
  if (actionMatch)      result.innerAction  = actionMatch[1].trim();
  if (thoughtMatch)     result.innerThought = thoughtMatch[1].trim();
  if (translationMatch) result.translation  = translationMatch[1].trim();
  if (affectionMatch)   result.affection    = affectionMatch[1].trim();
  if (wannaMatch)       result.wannaDo      = wannaMatch[1].trim();

  return result;
}

function processTransferDecision(charId, rawText) {
  var hasAccept  = /\[\s*领取转账\s*\]/.test(rawText);
  var hasDecline = /\[\s*拒绝转账\s*\]/.test(rawText);
  if (hasAccept || hasDecline) {
    var msgs = state.chats[charId] || [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user' && msgs[i].type === 'transfer' && !msgs[i].transferStatus) {
        msgs[i].transferStatus = hasAccept ? 'accepted' : 'declined';
        saveState();
        break;
      }
    }
  }
}

function stripTransferTags(contentStr) {
  return contentStr
    .replace(/\[\s*领取转账\s*\]/g, '')
    .replace(/\[\s*拒绝转账\s*\]/g, '')
    .trim();
}

// ========== Compute group positions ==========
function _computeGroupPositions(msgs) {
  var positions = new Array(msgs.length);
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].type === 'call-summary') {
      positions[i] = 'system';
      continue;
    }
    var prevIdx = -1;
    for (var j = i - 1; j >= 0; j--) {
      if (msgs[j].type !== 'call-summary') { prevIdx = j; break; }
    }
    var nextIdx = -1;
    for (var k = i + 1; k < msgs.length; k++) {
      if (msgs[k].type !== 'call-summary') { nextIdx = k; break; }
    }

    var prevSameGroup = prevIdx >= 0 &&
      msgs[prevIdx].role === msgs[i].role &&
      (msgs[i].timestamp - msgs[prevIdx].timestamp <= 180000);

    var nextSameGroup = nextIdx >= 0 &&
      msgs[nextIdx].role === msgs[i].role &&
      (msgs[nextIdx].timestamp - msgs[i].timestamp <= 180000);

    if      (prevSameGroup && nextSameGroup)  positions[i] = 'middle';
    else if (prevSameGroup && !nextSameGroup) positions[i] = 'last';
    else if (!prevSameGroup && nextSameGroup) positions[i] = 'first';
    else                                      positions[i] = 'solo';
  }
  return positions;
}

// ========== Group chat: compute positions by sender ==========
function _computeGroupChatPositions(msgs) {
  var positions = new Array(msgs.length);
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].type === 'call-summary') {
      positions[i] = 'system';
      continue;
    }
    var mySender = msgs[i].role === 'user' ? '__user__' : (msgs[i].senderId || '__unknown__');

    var prevIdx = -1;
    for (var j = i - 1; j >= 0; j--) {
      if (msgs[j].type !== 'call-summary') { prevIdx = j; break; }
    }
    var nextIdx = -1;
    for (var k = i + 1; k < msgs.length; k++) {
      if (msgs[k].type !== 'call-summary') { nextIdx = k; break; }
    }

    var prevSender = prevIdx >= 0 ? (msgs[prevIdx].role === 'user' ? '__user__' : (msgs[prevIdx].senderId || '__unknown__')) : null;
    var nextSender = nextIdx >= 0 ? (msgs[nextIdx].role === 'user' ? '__user__' : (msgs[nextIdx].senderId || '__unknown__')) : null;

    var prevSameGroup = prevSender !== null && prevSender === mySender && (msgs[i].timestamp - msgs[prevIdx].timestamp <= 180000);
    var nextSameGroup = nextSender !== null && nextSender === mySender && (msgs[nextIdx].timestamp - msgs[i].timestamp <= 180000);

    if      (prevSameGroup && nextSameGroup)  positions[i] = 'middle';
    else if (prevSameGroup && !nextSameGroup) positions[i] = 'last';
    else if (!prevSameGroup && nextSameGroup) positions[i] = 'first';
    else                                      positions[i] = 'solo';
  }
  return positions;
}

// ========== Pick a group responder (kept for backward compat) ==========
function pickGroupResponder(groupId) {
  var grp = getGroupById(groupId);
  if (!grp || !grp.members || !grp.members.length) return null;
  var idx = Math.floor(Math.random() * grp.members.length);
  return state.characters.find(function(c) { return c.id === grp.members[idx]; }) || null;
}

// ========== Build per-character chat messages for group API call ==========
function _buildGroupChatMsgsForChar(groupId, targetCharId, contextCount) {
  var grp = getGroupById(groupId);
  var userName = (grp && grp.userNickname) ? grp.userNickname : (state.userProfile.name || 'User');
  var rawMsgs = (state.chats[groupId] || []);

  var transformed = rawMsgs.map(function(m) {
    var content = m.content;
    if (m.recalled) content = '[Message recalled]';
    else if (m.type === 'voice') content = '[Voice]: ' + m.content;
    else if (m.type === 'sticker') content = '[Sent sticker]';
    else if (m.type === 'transfer') {
      var d;
      try {
        d = typeof m.content === 'string' && m.content.startsWith('{')
          ? JSON.parse(m.content) : m.content;
      } catch(e) { d = m.content; }
      content = '[Transfer $' + (d.amount || d) + ']';
    }
    else if (m.type === 'image') content = '[Image]';
    else if (m.type === 'simImage') content = '[Image: ' + m.content + ']';
    else if (m.type === 'call') {
      var ct2 = m.callType === 'video' ? 'Video' : 'Voice';
      content = '[' + ct2 + ' Call]';
    }
    else if (m.role === 'system' || m.type === 'call-summary') {
      return { role: 'system', content: m.content };
    }

    if (m.role === 'user') {
      return { role: 'user', content: '[' + userName + ']: ' + content };
    }

    // Assistant messages
    if (m.senderId === targetCharId) {
      return { role: 'assistant', content: content };
    } else {
      var sc = state.characters.find(function(c) { return c.id === m.senderId; });
      var sn = sc ? sc.name : 'Unknown';
      return { role: 'user', content: '[' + sn + ']: ' + content };
    }
  });

  return transformed.slice(-(contextCount || 50));
}

// ========== RENDER GROUP CHAT ==========
function renderGroupChat(grp) {
  document.getElementById('chatName').textContent = grp.name;
  var avatarEl = document.getElementById('chatAvatar');
  avatarEl.innerHTML = grp.avatar
    ? '<img src="' + grp.avatar + '">'
    : _defaultGroupHeaderAvatar();

  var notesEl = document.getElementById('chatNotes');
  if (notesEl) {
    notesEl.textContent = (grp.members || []).length + ' members';
    notesEl.style.display = 'block';
  }

  // Update chat menu items for group
  if (typeof updateChatMenuItems === 'function') updateChatMenuItems();

  var ct      = document.getElementById('chatMessages');
  var msgs    = state.chats[grp.id] || [];
  var userAv  = state.userProfile.avatar;
  var uH      = _chatMsgAvatarHtml(userAv);

  var groupPos = _computeGroupChatPositions(msgs);
  var multiClass = bubbleState.multiMode ? ' multi-mode' : '';

  var h = '';

  msgs.forEach(function(msg, i) {
    if (i === 0 || (msg.timestamp - msgs[i - 1].timestamp > 180000)) {
      h += '<div class="msg-time">' + fmtChatTime(msg.timestamp) + '</div>';
    }

    var gp   = groupPos[i];
    var sent = msg.role === 'user';
    var side = sent ? 'sent' : 'received';
    var gpClass = gp === 'system' ? '' : ' group-' + gp;

    if (msg.type === 'call-summary') {
      h += '<div class="msg-system-center" data-msgid="' + msg.id + '">' + esc(msg.content) + '</div>';
      return;
    }

    // Determine sender avatar and name for received messages
    var avHtml = uH;
    var senderName = '';
    if (!sent) {
      var senderChar = msg.senderId ? state.characters.find(function(c) { return c.id === msg.senderId; }) : null;
      avHtml = senderChar ? _chatMsgAvatarHtml(senderChar.avatar) : _chatMsgAvatarHtml(null);
      senderName = senderChar ? senderChar.name : 'Unknown';
    }

    // Show sender name label for first/solo received messages in a group
    if (!sent && (gp === 'first' || gp === 'solo')) {
      h += '<div style="font-size:11px;color:#8e8e93;margin-left:44px;margin-bottom:2px;margin-top:8px">' + esc(senderName) + '</div>';
    }

    var selected = bubbleState.selectedIds.has(msg.id) ? 'selected' : '';
    var checkChecked = bubbleState.selectedIds.has(msg.id) ? 'checked' : '';
    var checkSvg = '<div class="msg-check ' + checkChecked + '">' +
      '<svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';

    // For received messages, make avatar clickable to show heart voice
    var avatarOnclick = (!sent && msg.role === 'assistant')
      ? ' onclick="openGroupMsgHeartVoice(\'' + msg.id + '\')" style="cursor:pointer"'
      : '';

    var rowOpen = '<div class="msg-row ' + side + gpClass + multiClass + ' ' + selected +
      '" data-msgid="' + msg.id + '">' + checkSvg +
      '<div class="msg-avatar"' + avatarOnclick + '>' + avHtml + '</div>';
    var rowClose = '</div>';

    if (msg.type === 'voice') {
      h += rowOpen + buildVoiceBubble(msg.content) + rowClose;
    } else if (msg.type === 'sticker') {
      h += rowOpen + buildStickerBubble(msg.content) + rowClose;
    } else if (msg.type === 'image') {
      h += rowOpen + buildImageBubble(msg.dataUrl || msg.content) + rowClose;
    } else if (msg.type === 'simImage') {
      h += rowOpen + buildSimImageBubble(msg.content) + rowClose;
    } else if (msg.type === 'transfer') {
      var d = typeof msg.content === 'string' && msg.content.startsWith('{')
        ? JSON.parse(msg.content) : msg.content;
      h += rowOpen + buildTransferBubble(d.amount || d, d.note || '', msg.id, sent, msg.transferStatus) + rowClose;
    } else if (msg.type === 'call') {
      h += rowOpen + buildCallBubble(msg.callType || 'voice', msg.id, sent, msg.callStatus, msg.callDuration) + rowClose;
    } else {
      var editedMark = msg.edited
        ? '<span style="font-size:10px;opacity:.4;margin-left:6px">(edited)</span>'
        : '';

      // For received messages, parse reply segments
      if (!sent) {
        var segs = parseReplySegments(msg.content, state.stickers);
        segs.forEach(function(seg, segIdx) {
          var segBubbleId = msg.id + '__seg' + segIdx;
          var segGpClass = gpClass;
          if (segs.length > 1 && segIdx > 0) segGpClass = ' group-middle';

          var segRowOpen = '<div class="msg-row ' + side + segGpClass + multiClass + ' ' + selected +
            '" data-msgid="' + msg.id + '">' + checkSvg +
            '<div class="msg-avatar"' + avatarOnclick + '>' + avHtml + '</div>';
          var segRowClose = '</div>';

          if (seg.type === 'sticker') {
            h += segRowOpen + buildStickerBubble(seg.url) + segRowClose;
          } else if (seg.type === 'voice') {
            h += segRowOpen + buildVoiceBubble(seg.content) + segRowClose;
          } else if (seg.type === 'simImage') {
            h += segRowOpen + buildSimImageBubble(seg.content) + segRowClose;
          } else if (seg.type === 'transfer') {
            h += segRowOpen + buildTransferBubble(seg.amount, seg.note, msg.id, false, msg.transferStatus) + segRowClose;
          } else if (seg.type === 'call') {
            h += segRowOpen + buildCallBubble(seg.callType, msg.id, false, msg.callStatus) + segRowClose;
          } else {
            h += segRowOpen + '<div class="msg-bubble" data-bubbleid="' + segBubbleId + '">' +
              fmtMsg(seg.content) + editedMark + '</div>' + segRowClose;
          }
        });
      } else {
        h += rowOpen + '<div class="msg-bubble" data-bubbleid="' + msg.id + '">' +
          fmtMsg(msg.content) + editedMark + '</div>' + rowClose;
      }
    }
  });

  ct.innerHTML = h;

  ct.querySelectorAll('.msg-row[data-msgid]').forEach(function(row) {
    var msgId = row.dataset.msgid;
    row.querySelectorAll('.msg-bubble').forEach(function(el) {
      var bid = el.dataset.bubbleid || msgId;
      if (typeof initBubbleLongPress === 'function') initBubbleLongPress(el, bid);
    });
  });

  setTimeout(function() { ct.scrollTop = ct.scrollHeight; }, 50);
}

// ========== RENDER CHAT ==========
function renderChat() {
  // Check if this is a group chat
  var grp = getGroupById(state.currentCharId);
  if (grp) {
    renderGroupChat(grp);
    return;
  }

  var ch = state.characters.find(function(c) { return c.id === state.currentCharId; });
  if (!ch) return;

  document.getElementById('chatName').textContent = ch.name;
  var avatarEl = document.getElementById('chatAvatar');
  avatarEl.innerHTML = ch.avatar
    ? '<img src="' + ch.avatar + '">'
    : _defaultHeaderAvatar();

  var notesEl = document.getElementById('chatNotes');
  if (notesEl) {
    var cfg = getCharConfig(state.currentCharId);
    if (cfg && cfg.notes) {
      notesEl.textContent = cfg.notes;
      notesEl.style.display = 'block';
    } else {
      notesEl.style.display = 'none';
    }
  }

  // Update chat menu items for single chat
  if (typeof updateChatMenuItems === 'function') updateChatMenuItems();

  var ct      = document.getElementById('chatMessages');
  var msgs    = state.chats[state.currentCharId] || [];
  var charAv  = ch.avatar;
  var userAv  = getUserAv(state.currentCharId);
  var aH      = _chatMsgAvatarHtml(charAv);
  var uH      = _chatMsgAvatarHtml(userAv);

  var multiClass = bubbleState.multiMode ? ' multi-mode' : '';
  var charCfg    = getCharConfig(state.currentCharId);

  var groupPos = _computeGroupPositions(msgs);

  var h = '';

  msgs.forEach(function(msg, i) {
    if (i === 0 || (msg.timestamp - msgs[i - 1].timestamp > 180000)) {
      h += '<div class="msg-time">' + fmtChatTime(msg.timestamp) + '</div>';
    }

    var gp   = groupPos[i];
    var sent = msg.role === 'user';
    var side = sent ? 'sent' : 'received';
    var av   = sent ? uH : aH;
    var gpClass  = gp === 'system' ? '' : ' group-' + gp;
    var selected = bubbleState.selectedIds.has(msg.id) ? 'selected' : '';
    var checkChecked = bubbleState.selectedIds.has(msg.id) ? 'checked' : '';
    var checkSvg = '<div class="msg-check ' + checkChecked + '">' +
      '<svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
    var isRecalled = msg.recalled || msg.type === 'recalled';

    if (msg.type === 'call-summary') {
      var refClick = msg.callRefId
        ? ' onclick="viewCallHistory(\'' + msg.callRefId + '\')"'
        : '';
      h += '<div class="msg-system-center" data-msgid="' + msg.id + '"' + refClick + '>' +
        esc(msg.content) + '</div>';
      return;
    }

    if (isRecalled) {
      var viewBtn = msg.originalContent
        ? '<button class="recalled-view-btn" onclick="event.stopPropagation();viewRecalledMsg(\'' + msg.id + '\')">' +
          '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M2 8s3-4 6-4 6 4 6 4-3 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
          '<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>View</button>'
        : '';
      h += '<div class="msg-row ' + side + gpClass + multiClass + ' ' + selected +
        '" data-msgid="' + msg.id + '">' + checkSvg +
        '<div class="msg-avatar">' + av + '</div>' +
        '<div class="msg-bubble recalled-bubble">' + esc(msg.content) + viewBtn + '</div></div>';
      return;
    }

    if (msg.type === 'moment') {
      h += '<div class="msg-row ' + side + gpClass + multiClass + ' ' + selected +
        '" data-msgid="' + msg.id + '">' + checkSvg +
        '<div class="msg-avatar">' + av + '</div>' +
        '<div class="msg-bubble moment-bubble">' +
        '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
        '<circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
        '<span>' + esc(msg.content) + '</span></div></div>';
      return;
    }

    var quoteHtml = '';
    if (msg.quoteRef) {
      var qm = msgs.find(function(m) { return m.id === msg.quoteRef.id; });
      quoteHtml = '<div class="msg-quote"><span class="mq-name">' + esc(msg.quoteRef.name) +
        '</span><br>' + esc((qm ? qm.content : msg.quoteRef.text || '').slice(0, 40)) + '</div>';
    }

    var editedMark = msg.edited
      ? '<span style="font-size:10px;opacity:.4;margin-left:6px">(' + T('edited') + ')</span>'
      : '';
    var extras = buildMsgExtraActions(msg.id, !sent, false);
    var hasTranslation = charCfg.translation && msg.translation;

    var rowOpen = '<div class="msg-row ' + side + gpClass + multiClass + ' ' + selected +
      '" data-msgid="' + msg.id + '">' + checkSvg +
      '<div class="msg-avatar">' + av + '</div>';
    var rowClose = extras + '</div>';

    if (sent) {
      if (msg.type === 'voice') {
        h += rowOpen + buildVoiceBubble(msg.content) + rowClose;
      } else if (msg.type === 'sticker') {
        h += rowOpen + buildStickerBubble(msg.content) + rowClose;
      } else if (msg.type === 'transfer') {
        var d = typeof msg.content === 'string' && msg.content.startsWith('{')
          ? JSON.parse(msg.content) : msg.content;
        h += rowOpen + buildTransferBubble(d.amount || d, d.note || '', msg.id, true, msg.transferStatus) + rowClose;
      } else if (msg.type === 'image') {
        h += rowOpen + buildImageBubble(msg.dataUrl || msg.content) + rowClose;
      } else if (msg.type === 'simImage') {
        h += rowOpen + buildSimImageBubble(msg.content) + rowClose;
      } else if (msg.type === 'call') {
        var callClickAttr = (msg.callStatus === 'ended' && msg.callHistory)
          ? ' onclick="viewCallHistory(\'' + msg.id + '\')" style="cursor:pointer"'
          : '';
        h += rowOpen + buildCallBubble(msg.callType || 'voice', msg.id, true, msg.callStatus, msg.callDuration, callClickAttr) + rowClose;
      } else {
        h += rowOpen + '<div class="msg-bubble" data-bubbleid="' + msg.id + '">' +
          quoteHtml + fmtMsg(msg.content) + editedMark + '</div>' + rowClose;
      }
    } else {
      var segs = parseReplySegments(msg.content, state.stickers);
      var recvExtras = buildMsgExtraActions(msg.id, true, false);
      var lastTextIdx = segs.reduce(function(acc, seg, idx) {
        return seg.type === 'text' ? idx : acc;
      }, -1);

      segs.forEach(function(seg, segIdx) {
        var segBubbleId = msg.id + '__seg' + segIdx;
        var isLastText  = segIdx === lastTextIdx;

        var segGpClass = gpClass;
        if (segs.length > 1 && segIdx > 0) {
          segGpClass = ' group-middle';
        }

        var segRowOpen = '<div class="msg-row ' + side + segGpClass + multiClass + ' ' + selected +
          '" data-msgid="' + msg.id + '">' + checkSvg +
          '<div class="msg-avatar">' + aH + '</div>';
        var segRowClose = recvExtras + '</div>';

        if (seg.type === 'sticker') {
          h += segRowOpen + buildStickerBubble(seg.url) + segRowClose;
        } else if (seg.type === 'voice') {
          h += segRowOpen + buildVoiceBubble(seg.content) + segRowClose;
        } else if (seg.type === 'transfer') {
          h += segRowOpen + buildTransferBubble(seg.amount, seg.note, msg.id, false, msg.transferStatus) + segRowClose;
        } else if (seg.type === 'simImage') {
          h += segRowOpen + buildSimImageBubble(seg.content) + segRowClose;
        } else if (seg.type === 'call') {
          h += segRowOpen + buildCallBubble(seg.callType, msg.id, false, msg.callStatus) + segRowClose;
        } else {
          var transHtml = (isLastText && hasTranslation)
            ? '<div class="msg-translation">' + esc(msg.translation) + '</div>'
            : '';
          var bubbleClick = hasTranslation
            ? 'onclick="toggleMsgTranslation(event,\'' + msg.id + '\')"'
            : 'onclick="showMsgPopover(event,\'' + segBubbleId + '\')"';
          h += segRowOpen + '<div class="msg-bubble" ' + bubbleClick +
            ' data-bubbleid="' + segBubbleId + '">' + quoteHtml +
            fmtMsg(seg.content) + editedMark + transHtml + '</div>' + segRowClose;
        }
      });
    }
  });

  ct.innerHTML = h;

  ct.querySelectorAll('.msg-row[data-msgid]').forEach(function(row) {
    var msgId = row.dataset.msgid;
    row.querySelectorAll('.msg-bubble').forEach(function(el) {
      var bid = el.dataset.bubbleid || msgId;
      if (typeof initBubbleLongPress === 'function') initBubbleLongPress(el, bid);
    });
  });

  setTimeout(function() { ct.scrollTop = ct.scrollHeight; }, 50);
}

// ========== acceptCall / declineCall / etc ==========
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

// ========== TRIGGER AI RESPONSE ==========
async function triggerResponse() {
  if (!state.currentCharId) return;
  var api = state.apis.find(function(a) { return a.id === state.activeApiId; });
  if (!api?.url)  { showErrorModal(T('configApi')); return; }
  if (!api.model) { showErrorModal(T('selectModel')); return; }

  var isGroup = isGroupChat(state.currentCharId);

  if (isGroup) {
    await _triggerGroupResponse(api);
  } else {
    await _triggerSingleResponse(api);
  }
}

// ========== GROUP RESPONSE (all members reply) ==========
async function _triggerGroupResponse(api) {
  var grp = getGroupById(state.currentCharId);
  if (!grp || !grp.members || !grp.members.length) {
    showToast('No members in this group');
    return;
  }

  // Collect all member characters
  var memberChars = [];
  (grp.members || []).forEach(function(mid) {
    var mc = state.characters.find(function(c) { return c.id === mid; });
    if (mc) memberChars.push(mc);
  });

  if (!memberChars.length) {
    showToast('No valid members in this group');
    return;
  }

  var btn = document.getElementById('respondBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  var ct = document.getElementById('chatMessages');

  // Show typing indicator with all member names
  var typWrap = document.createElement('div');
  typWrap.id = 'typingInd';

  var nameLabel = document.createElement('div');
  nameLabel.style.cssText = 'font-size:11px;color:#8e8e93;margin-left:44px;margin-bottom:2px;margin-top:8px';
  nameLabel.textContent = memberChars.map(function(c) { return c.name; }).join(', ') + ' typing...';
  typWrap.appendChild(nameLabel);

  var typRow = document.createElement('div');
  typRow.className = 'msg-row received group-solo';
  typRow.innerHTML = '<div class="msg-avatar">' + _chatMsgAvatarHtml(memberChars[0].avatar) + '</div>' +
    '<div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  typWrap.appendChild(typRow);

  ct.appendChild(typWrap);
  ct.scrollTop = ct.scrollHeight;

  try {
    var contextCount = 50;

    // Build per-character prompts
    var charPrompts = memberChars.map(function(mc) {
      var sysPrompt = buildGroupSystemPrompt(mc, grp, state.worldbooks, state.stickers);
      var chatMsgs = _buildGroupChatMsgsForChar(state.currentCharId, mc.id, contextCount);
      return {
        charId: mc.id,
        messages: [{ role: 'system', content: sysPrompt }].concat(chatMsgs)
      };
    });

    // Send all API calls simultaneously
    var results = await sendGroupChats(api, charPrompts);

    // Process results
    var baseTime = Date.now();
    results.forEach(function(result, idx) {
      if (!result || !result.reply) return;

      var rawReply = result.reply;
      var parsed = parseThreePartReply(rawReply);
      var content = parsed.content.replace(/---SPLIT---/g, '\n').trim();
      content = stripTransferTags(content);

      var newMsg = {
        id: uid(),
        role: 'assistant',
        content: content,
        type: 'text',
        timestamp: baseTime + (idx + 1) * 500,
        senderId: result.charId,
        innerAction: parsed.innerAction || '',
        innerThought: parsed.innerThought || '',
        wannaDo: parsed.wannaDo || ''
      };

      state.chats[state.currentCharId].push(newMsg);
    });

    if (results.length === 0) {
      showToast('All API calls failed');
    }

    saveState();
  } catch (e) {
    showErrorModal(friendlyError(e));
  } finally {
    var ti = document.getElementById('typingInd');
    if (ti) ti.remove();
    btn.classList.remove('loading');
    btn.disabled = false;
    renderChat();
  }
}

// ========== SINGLE RESPONSE (original logic) ==========
async function _triggerSingleResponse(api) {
  var ch = state.characters.find(function(c) { return c.id === state.currentCharId; });
  if (!ch) return;

  var btn = document.getElementById('respondBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  var ct  = document.getElementById('chatMessages');
  var typ = document.createElement('div');
  typ.className = 'msg-row received group-solo';
  typ.id = 'typingInd';
  typ.innerHTML = '<div class="msg-avatar">' + _chatMsgAvatarHtml(ch.avatar) + '</div>' +
    '<div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  ct.appendChild(typ);
  ct.scrollTop = ct.scrollHeight;

  try {
    var sysPrompt    = buildSystemPrompt(ch, state.worldbooks, state.stickers);
    var charCfg      = getCharConfig(state.currentCharId);
    var contextCount = charCfg.contextCount || 50;

    var allChatMsgs = (state.chats[state.currentCharId] || []).map(function(m) {
      if (m.recalled) return { role: m.role, content: '[Message recalled]' };
      if (m.type === 'voice')    return { role: m.role, content: '[Voice]: ' + m.content };
      if (m.type === 'sticker')  return { role: m.role, content: '[Sent sticker]' };
      if (m.type === 'transfer') {
        var d2 = typeof m.content === 'string' && m.content.startsWith('{')
          ? JSON.parse(m.content) : m.content;
        var statusLabel = '';
        if      (m.transferStatus === 'accepted') statusLabel = ' (Accepted)';
        else if (m.transferStatus === 'declined') statusLabel = ' (Declined)';
        else                                      statusLabel = ' (Pending)';
        return { role: m.role, content: '[Transfer $' + (d2.amount || d2) + (d2.note ? ' ' + d2.note : '') + ']' + statusLabel };
      }
      if (m.type === 'image')    return { role: m.role, content: m.content };
      if (m.type === 'simImage') return { role: m.role, content: '[Image: ' + m.content + ']' };
      if (m.type === 'call') {
        var ct2 = m.callType === 'video' ? 'Video' : 'Voice';
        return { role: m.role, content: '[' + ct2 + ' Call]' + (m.callStatus ? '(' + m.callStatus + ')' : '(requesting)') };
      }
      if (m.role === 'system' || m.type === 'call-summary') {
        return { role: 'system', content: m.content };
      }
      return { role: m.role, content: m.content };
    });

    var chatMsgs = allChatMsgs.slice(-contextCount);

    var reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },chatMsgs
    ]);

    var rawReply = reply || '';
    processTransferDecision(state.currentCharId, rawReply);

    var parsed = parseThreePartReply(rawReply);
    parsed.content = stripTransferTags(parsed.content);

    if (parsed.affection) {
      var affNum = parseInt(parsed.affection, 10);
      if (!isNaN(affNum)) {
        charCfg.affection = Math.max(0, Math.min(100, affNum));
        saveCharConfig();
      }
    }

    var splitParts = parsed.content
      .split('---SPLIT---')
      .map(function(s) { return s.trim(); })
      .filter(Boolean);

    var translationParts = parsed.translation
      ? parsed.translation.split('---SPLIT---').map(function(s) { return s.trim(); }).filter(Boolean)
      : [];

    if (splitParts.length > 1) {
      splitParts.forEach(function(part, idx) {
        var newMsg = { id: uid(), role: 'assistant', content: part, type: 'text', timestamp: Date.now() + idx * 800 };
        if (idx === splitParts.length - 1) {
          if (parsed.innerAction)  newMsg.innerAction  = parsed.innerAction;
          if (parsed.innerThought) newMsg.innerThought = parsed.innerThought;
          if (parsed.wannaDo)      newMsg.wannaDo      = parsed.wannaDo;
        }
        if (translationParts.length >= splitParts.length) {
          newMsg.translation = translationParts[idx];
        } else if (translationParts.length > 0 && idx < translationParts.length) {
          newMsg.translation = translationParts[idx];
        } else if (parsed.translation && idx === splitParts.length - 1 && translationParts.length === 0) {
          newMsg.translation = parsed.translation;
        }
        state.chats[state.currentCharId].push(newMsg);
      });
    } else {
      var newMsg = { id: uid(), role: 'assistant', content: parsed.content, type: 'text', timestamp: Date.now() };
      if (parsed.innerAction)  newMsg.innerAction  = parsed.innerAction;
      if (parsed.innerThought) newMsg.innerThought = parsed.innerThought;
      if (parsed.wannaDo)      newMsg.wannaDo      = parsed.wannaDo;
      if (parsed.translation)  newMsg.translation  = parsed.translation;
      state.chats[state.currentCharId].push(newMsg);
    }

    if (charCfg.charRecall && Math.random() < 0.15) {
      var allMsgs  = state.chats[state.currentCharId];
      var newCount  = splitParts.length > 1 ? splitParts.length : 1;
      var batchMsgs = allMsgs.slice(-newCount);
      var target    = batchMsgs[Math.floor(Math.random() * batchMsgs.length)];
      if (target) {
        target.recalled = true;
        target.originalContent = target.content;
        target.content = 'Message recalled';
        delete target.translation;
      }
    }

    saveState();
    checkAutoSummarize();
  } catch (e) {
    showErrorModal(friendlyError(e));
  } finally {
    var ti = document.getElementById('typingInd');
    if (ti) ti.remove();
    btn.classList.remove('loading');
    btn.disabled = false;
    renderChat();
  }
}

// ========== Global bindings ==========
window.openChat             = openChat;
window.sendMessage          = sendMessage;
window.triggerResponse      = triggerResponse;
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
window.pickGroupResponder   = pickGroupResponder;
