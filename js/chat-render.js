// ========== chat-render.js ==========
// renderChat() & renderGroupChat()

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

    var avHtml = uH;
    var senderName = '';
    if (!sent) {
      var senderChar = msg.senderId ? state.characters.find(function(c) { return c.id === msg.senderId; }) : null;
      avHtml = senderChar ? _chatMsgAvatarHtml(senderChar.avatar) : _chatMsgAvatarHtml(null);
      senderName = senderChar ? senderChar.name : 'Unknown';
    }

    if (!sent && (gp === 'first' || gp === 'solo')) {
      h += '<div style="font-size:11px;color:#8e8e93;margin-left:44px;margin-bottom:2px;margin-top:8px">' + esc(senderName) + '</div>';
    }

    var selected = bubbleState.selectedIds.has(msg.id) ? 'selected' : '';
    var checkChecked = bubbleState.selectedIds.has(msg.id) ? 'checked' : '';
    var checkSvg = '<div class="msg-check ' + checkChecked + '">' +
      '<svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';

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

function renderChat() {
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
