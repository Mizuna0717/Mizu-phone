// ========== chat-ai.js ==========
// triggerResponse, _triggerSingleResponse, _triggerGroupResponse

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

async function _triggerGroupResponse(api) {
  var grp = getGroupById(state.currentCharId);
  if (!grp || !grp.members || !grp.members.length) {
    showToast('No members in this group');
    return;
  }

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

    var charPrompts = memberChars.map(function(mc) {
      var sysPrompt = buildGroupSystemPrompt(mc, grp, state.worldbooks, state.stickers);
      var chatMsgs = _buildGroupChatMsgsForChar(state.currentCharId, mc.id, contextCount);
      return {
        charId: mc.id,
        messages: [{ role: 'system', content: sysPrompt }].concat(chatMsgs)
      };
    });

    var results = await sendGroupChats(api, charPrompts);

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

window.triggerResponse = triggerResponse;