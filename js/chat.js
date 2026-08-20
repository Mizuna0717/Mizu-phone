// ========== 11-chat.js ==========

function openChat(cid) {
  state.currentCharId = cid;
  state.unread[cid] = 0;
  if (!state.chats[cid]) state.chats[cid] = [];
  saveState();
  nav('screen-chat');
  if (typeof restartAutoMessageTimer === 'function') restartAutoMessageTimer(cid);
}

function getUserAv(cid) {
  const m = getMaskForChar(cid);
  return m?.avatar || state.userProfile.avatar || null;
}

// ========== CHAT BUBBLE BUILDERS ==========
function wrapBubble(side, avHtml, inner) {
  return `<div class="msg-row ${side}"><div class="msg-avatar">${avHtml}</div>${inner}</div>`;
}

function buildVoiceBubble(content) {
  return `<div class="msg-bubble voice" onclick="toggleVoiceText(this)"><div class="voice-row"><svg viewBox="0 0 20 20"><polygon points="4,2 18,10 4,18" fill="currentColor" stroke="none"/></svg><div class="voice-wave">${makeWaveBars()}</div></div><div class="voice-text">${esc(content)}</div></div>`;
}

function buildStickerBubble(url) {
  return `<div class="msg-bubble sticker-msg"><img src="${url}"></div>`;
}

function buildTransferBubble(amount, note, msgId, isSent, status) {
  let h = `<div class="msg-bubble transfer-msg"><div class="transfer-card">`;
  h += `<div class="tc-label">${T('transfer')}</div>`;
  h += `<div class="tc-amount">\u00A5${esc(String(amount))}</div>`;
  if (note) h += `<div class="tc-note">${esc(note)}</div>`;

  if (status) {
    const label = status === 'accepted' ? '已领取' : '已拒绝';
    h += `<div class="transfer-status ${status}">${label}</div>`;
  } else if (isSent) {
    h += `<div class="transfer-status pending">待领取</div>`;
  } else {
    h += `<div class="transfer-actions">`;
    h += `<button class="ta-accept" onclick="event.stopPropagation();acceptTransfer('${msgId}')">接收</button>`;
    h += `<button class="ta-decline" onclick="event.stopPropagation();declineTransfer('${msgId}')">拒绝</button>`;
    h += `</div>`;
  }

  h += `</div></div>`;
  return h;
}

function buildSimImageBubble(content) {
  return `<div class="msg-bubble sim-image-msg"><div class="sim-image-box"><svg viewBox="0 0 28 28"><rect x="2" y="2" width="24" height="24" rx="4" stroke-dasharray="3 2"/><path d="M8 14h12M14 8v12"/></svg><div class="sim-desc">${esc(content)}</div></div></div>`;
}

function buildImageBubble(src) {
  return `<div class="msg-bubble image-msg"><img src="${src}"></div>`;
}

function buildTextBubble(content, msgId) {
  return `<div class="msg-bubble" data-msgid="${msgId}" onclick="showMsgPopover(event,'${msgId}')">${fmtMsg(content)}</div>`;
}

// ★★★ 变更：增加 callDuration 和 extraAttr 参数，处理 ended 状态 ★★★
function buildCallBubble(callType, msgId, isSent, callStatus, callDuration, extraAttr) {
  const isVideo = callType === 'video';
  const label = isVideo ? '视频通话' : '语音通话';
  const icon = isVideo
    ? `<svg viewBox="0 0 20 20" class="call-type-icon"><rect x="2" y="5" width="11" height="10" rx="1.5"/><path d="M13 7.5l5-2.5v10l-5-2.5z"/></svg>`
    : `<svg viewBox="0 0 20 20" class="call-type-icon"><path d="M6.6 3H5A2 2 0 003 5c0 7.2 5.8 13 13 13a2 2 0 002-2v-1.6a1.5 1.5 0 00-1-1.4l-2.7-.8a1.5 1.5 0 00-1.5.4l-1 1A9.4 9.4 0 017.4 9l1-1a1.5 1.5 0 00.4-1.5l-.8-2.7A1.5 1.5 0 006.6 3z"/></svg>`;

  let statusHtml = '';
  // ★★★ 变更：新增 ended 状态显示通话时长 ★★★
  if (callStatus === 'ended') {
    statusHtml = `<div class="call-status ended">\u901A\u8BDD\u65F6\u957F ${callDuration || '00:00'}</div>`;
  } else if (callStatus === 'accepted') {
    statusHtml = `<div class="call-status accepted">已接通</div>`;
  } else if (callStatus === 'declined') {
    statusHtml = `<div class="call-status declined">已拒绝</div>`;
  } else if (callStatus === 'requesting') {
    statusHtml = `<div class="call-status requesting">请求中</div>`;
  } else if (!isSent && !callStatus) {
    statusHtml = `<div class="call-actions"><button class="call-accept-btn" onclick="event.stopPropagation();acceptCall('${msgId}')">接听</button><button class="call-decline-btn" onclick="event.stopPropagation();declineCall('${msgId}')">拒绝</button></div>`;
  }

  let labelText;
  if (isSent) labelText = label;
  else if (!callStatus) {
    const ch = state.characters.find(c => c.id === state.currentCharId);
    labelText = (ch ? ch.name : '角色') + ' 邀请你' + label;
  } else labelText = label;

  // ★★★ 变更：使用 extraAttr 支持点击查看历史 ★★★
  return `<div class="msg-bubble call-msg"${extraAttr || ''}><div class="call-card"><div class="call-icon-wrap">${icon}</div><div class="call-info"><div class="call-label">${labelText}</div>${statusHtml}</div></div></div>`;
}

function buildMsgExtraActions(msgId, isReceived, isRecalled) {
  return '';
}

function recallMessage(msgId) {
  const msgs = state.chats[state.currentCharId] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg) return;
  msg.recalled = true;
  msg.originalContent = msg.content;
  msg.content = '角色撤回了一条消息';
  delete msg.translation;
  saveState();
  renderChat();
  showToast('消息已撤回');
}

function viewRecalledMsg(msgId) {
  const msgs = state.chats[state.currentCharId] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg || !msg.originalContent) return;
  document.getElementById('errorModalTitle').textContent = '撤回的消息';
  document.getElementById('errorModalBody').textContent = msg.originalContent;
  document.getElementById('errorModal').classList.add('show');
}

function toggleMsgTranslation(event, msgId) {
  if (event) event.stopPropagation();
  const container = document.getElementById('chatMessages');
  container.querySelectorAll('.msg-row[data-msgid="' + msgId + '"] .msg-translation').forEach(function (el) {
    el.classList.toggle('show');
  });
}

function translateMsg(msgId) {
  toggleMsgTranslation(null, msgId);
}

// ========== 三段式回复解析（含翻译） ==========
function parseThreePartReply(raw) {
  const result = { content: raw, innerAction: '', innerThought: '', translation: '' };
  const replyMatch = raw.match(/【回复】\s*([\s\S]*?)(?=【动作】|【心声】|【翻译】|$)/);
  const actionMatch = raw.match(/【动作】\s*([\s\S]*?)(?=【回复】|【心声】|【翻译】|$)/);
  const thoughtMatch = raw.match(/【心声】\s*([\s\S]*?)(?=【回复】|【动作】|【翻译】|$)/);
  const translationMatch = raw.match(/【翻译】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|$)/);

  if (replyMatch || actionMatch || thoughtMatch || translationMatch) {
    if (replyMatch) result.content = replyMatch[1].trim();
    if (actionMatch) result.innerAction = actionMatch[1].trim();
    if (thoughtMatch) result.innerThought = thoughtMatch[1].trim();
    if (translationMatch) result.translation = translationMatch[1].trim();
  }
  return result;
}

function processTransferDecision(charId, rawText) {
  const hasAccept = /\[\s*领取转账\s*\]/.test(rawText);
  const hasDecline = /\[\s*拒绝转账\s*\]/.test(rawText);

  if (hasAccept || hasDecline) {
    const msgs = state.chats[charId] || [];
    for (let i = msgs.length - 1; i >= 0; i--) {
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

// ========== RENDER CHAT ==========
function renderChat() {
  const ch = state.characters.find(c => c.id === state.currentCharId);
  if (!ch) return;
  document.getElementById('chatName').textContent = ch.name;
  document.getElementById('chatAvatar').innerHTML = ch.avatar ? `<img src="${ch.avatar}">` : '';
  const ct = document.getElementById('chatMessages');
  const msgs = state.chats[state.currentCharId] || [];
  const aH = msgAvatarHtml(ch.avatar);
  const uA = getUserAv(state.currentCharId);
  const uH = msgAvatarHtml(uA);
  const multiClass = bubbleState.multiMode ? ' multi-mode' : '';
  const cfg = getCharConfig(state.currentCharId);
  let h = '';

  msgs.forEach((msg, i) => {
    if (i === 0 || (msg.timestamp - msgs[i - 1].timestamp > 300000))
      h += `<div class="msg-time">${fmtTime(msg.timestamp)}</div>`;
    const sent = msg.role === 'user';
    const side = sent ? 'sent' : 'received';
    const av = sent ? uH : aH;
    const selected = bubbleState.selectedIds.has(msg.id) ? 'selected' : '';
    const checkChecked = bubbleState.selectedIds.has(msg.id) ? 'checked' : '';
    const checkSvg = `<div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div>`;
    const isRecalled = msg.recalled || msg.type === 'recalled';

    if (isRecalled) {
      const viewBtn = msg.originalContent
        ? `<button class="recalled-view-btn" onclick="event.stopPropagation();viewRecalledMsg('${msg.id}')"><svg viewBox="0 0 16 16" width="12" height="12"><path d="M2 8s3-4 6-4 6 4 6 4-3 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="2"/></svg>查看</button>`
        : '';
      h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">
        ${checkSvg}<div class="msg-avatar">${av}</div>
        <div class="msg-bubble recalled-bubble">${esc(msg.content)}${viewBtn}</div>
      </div>`;
      return;
    }

    if (msg.type === 'moment') {
      h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">
        ${checkSvg}<div class="msg-avatar">${av}</div>
        <div class="msg-bubble moment-bubble"><svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.5"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14"/></svg><span>${esc(msg.content)}</span></div>
      </div>`;
      return;
    }

    // ★★★ 变更：通话摘要 → 居中系统消息，无头像，小尺寸 ★★★
    if (msg.type === 'call-summary') {
      const refClick = msg.callRefId ? ` onclick="viewCallHistory('${msg.callRefId}')"` : '';
      h += `<div class="msg-system-center" data-msgid="${msg.id}"${refClick}>${esc(msg.content)}</div>`;
      return;
    }

    let quoteHtml = '';
    if (msg.quoteRef) {
      const qm = msgs.find(m => m.id === msg.quoteRef.id);
      quoteHtml = `<div class="msg-quote"><span class="mq-name">${esc(msg.quoteRef.name)}</span><br>${esc((qm ? qm.content : msg.quoteRef.text || '').slice(0, 40))}</div>`;
    }

    let editedMark = msg.edited ? '<span style="font-size:10px;opacity:.4;margin-left:6px">(' + T('edited') + ')</span>' : '';

    const extras = buildMsgExtraActions(msg.id, !sent, false);

    const hasTranslation = cfg.translation && msg.translation;

    if (sent) {
      if (msg.type === 'voice') {
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildVoiceBubble(msg.content)}${extras}</div>`;
      } else if (msg.type === 'sticker') {
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildStickerBubble(msg.content)}${extras}</div>`;
      } else if (msg.type === 'transfer') {
        const d = typeof msg.content === 'string' && msg.content.startsWith('{') ? JSON.parse(msg.content) : msg.content;
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildTransferBubble(d.amount || d, d.note || '', msg.id, true, msg.transferStatus)}${extras}</div>`;
      } else if (msg.type === 'image') {
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildImageBubble(msg.dataUrl || msg.content)}${extras}</div>`;
      } else if (msg.type === 'simImage') {
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildSimImageBubble(msg.content)}${extras}</div>`;
      } else if (msg.type === 'call') {
        // ★★★ 变更：结束的通话卡片可点击查看历史记录 ★★★
        const callClickAttr = (msg.callStatus === 'ended' && msg.callHistory)
          ? ' onclick="viewCallHistory(\'' + msg.id + '\')" style="cursor:pointer"'
          : '';
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildCallBubble(msg.callType || 'voice', msg.id, true, msg.callStatus, msg.callDuration, callClickAttr)}${extras}</div>`;
      } else {
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div><div class="msg-bubble" data-bubbleid="${msg.id}">${quoteHtml}${fmtMsg(msg.content)}${editedMark}</div>${extras}</div>`;
      }
    } else {
      const segs = parseReplySegments(msg.content, state.stickers);
      const recvExtras = buildMsgExtraActions(msg.id, true, false);

      const lastTextIdx = segs.reduce(function (acc, seg, idx) { return seg.type === 'text' ? idx : acc; }, -1);

      segs.forEach((seg, segIdx) => {
        const segBubbleId = msg.id + '__seg' + segIdx;
        const isLastText = segIdx === lastTextIdx;

        if (seg.type === 'sticker') {
          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div>${buildStickerBubble(seg.url)}${recvExtras}</div>`;
        } else if (seg.type === 'voice') {
          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div>${buildVoiceBubble(seg.content)}${recvExtras}</div>`;
        } else if (seg.type === 'transfer') {
          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div>${buildTransferBubble(seg.amount, seg.note, msg.id, false, msg.transferStatus)}${recvExtras}</div>`;
        } else if (seg.type === 'simImage') {
          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div>${buildSimImageBubble(seg.content)}${recvExtras}</div>`;
        } else if (seg.type === 'call') {
          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div>${buildCallBubble(seg.callType, msg.id, false, msg.callStatus)}${recvExtras}</div>`;
        } else {
          const transHtml = (isLastText && hasTranslation)
            ? `<div class="msg-translation">${esc(msg.translation)}</div>`
            : '';
          const bubbleClick = hasTranslation
            ? `onclick="toggleMsgTranslation(event,'${msg.id}')"`
            : `onclick="showMsgPopover(event,'${segBubbleId}')"`;

          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div><div class="msg-bubble" ${bubbleClick} data-bubbleid="${segBubbleId}">${quoteHtml}${fmtMsg(seg.content)}${editedMark}${transHtml}</div>${recvExtras}</div>`;
        }
      });
    }
  });

  ct.innerHTML = h;

  ct.querySelectorAll('.msg-row[data-msgid]').forEach(row => {
    const msgId = row.dataset.msgid;
    row.querySelectorAll('.msg-bubble').forEach(el => {
      const bid = el.dataset.bubbleid || msgId;
      initBubbleLongPress(el, bid);
    });
  });

  setTimeout(() => ct.scrollTop = ct.scrollHeight, 50);
}

// ★★★ acceptCall → 接听后打开全屏通话界面 ★★★
function acceptCall(mid) {
  const charId = state.currentCharId;
  const m = (state.chats[charId] || []).find(x => x.id === mid);
  if (!m) return;
  m.callStatus = 'accepted';
  saveState();
  renderChat();
  if (typeof openCallInterface === 'function') {
    openCallInterface(charId, m.callType || 'voice', mid);
  } else {
    showToast('通话已接通');
  }
}

function declineCall(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.callStatus = 'declined'; saveState(); renderChat(); showToast('已拒绝通话'); }
}

function acceptTransfer(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.transferStatus = 'accepted'; saveState(); renderChat(); showToast('已领取'); }
}

function declineTransfer(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.transferStatus = 'declined'; saveState(); renderChat(); showToast('已拒绝'); }
}

function toggleVoiceText(el) { el.querySelector('.voice-text')?.classList.toggle('show'); }
function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px'; }

function sendMessage() {
  const inp = document.getElementById('chatInput');
  const t = inp.value.trim();
  if (!t || !state.currentCharId) return;
  const msg = { id: uid(), role: 'user', content: t, type: 'text', timestamp: Date.now() };
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
  if (state.currentCharId) { state.charEditFrom = 'screen-chat'; editChar(state.currentCharId); }
}

// ========== TRIGGER AI RESPONSE ==========
async function triggerResponse() {
  if (!state.currentCharId) return;
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url) { showErrorModal(T('configApi')); return; }
  if (!api.model) { showErrorModal(T('selectModel')); return; }
  const ch = state.characters.find(c => c.id === state.currentCharId);
  if (!ch) return;
  const btn = document.getElementById('respondBtn');
  btn.classList.add('loading');
  btn.disabled = true;
  const ct = document.getElementById('chatMessages');
  const typ = document.createElement('div');
  typ.className = 'msg-row received';
  typ.id = 'typingInd';
  typ.innerHTML = `<div class="msg-avatar">${msgAvatarHtml(ch.avatar)}</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  ct.appendChild(typ);
  ct.scrollTop = ct.scrollHeight;
  try {
    const sysPrompt = buildSystemPrompt(ch, state.worldbooks, state.stickers);
    const charCfg = getCharConfig(state.currentCharId);
    const contextCount = charCfg.contextCount || 50;
    const allChatMsgs = (state.chats[state.currentCharId] || []).map(m => {
      if (m.recalled) return { role: m.role, content: '[此消息已撤回]' };
      if (m.type === 'voice') return { role: m.role, content: `[Voice]: ${m.content}` };
      if (m.type === 'sticker') return { role: m.role, content: '[Sent sticker]' };
      if (m.type === 'transfer') {
        const d = typeof m.content === 'string' && m.content.startsWith('{') ? JSON.parse(m.content) : m.content;
        let statusLabel = '';
        if (m.transferStatus === 'accepted') statusLabel = ' (已领取)';
        else if (m.transferStatus === 'declined') statusLabel = ' (已拒绝)';
        else statusLabel = ' (待领取)';
        return { role: m.role, content: `[转账 ¥${d.amount || d}${d.note ? ' ' + d.note : ''}]${statusLabel}` };
      }
      if (m.type === 'image') return { role: m.role, content: m.content };
      if (m.type === 'simImage') return { role: m.role, content: `[Image: ${m.content}]` };
      if (m.type === 'call') {
        const ct2 = m.callType === 'video' ? '视频' : '语音';
        return { role: m.role, content: `[${ct2}通话]${m.callStatus ? '(' + m.callStatus + ')' : '(requesting)'}` };
      }
      // ★★★ 变更：跳过系统消息（call-summary 等），不送入 API ★★★
      if (m.role === 'system' || m.type === 'call-summary') {
        return { role: 'system', content: m.content };
      }
      return { role: m.role, content: m.content };
    });
    const chatMsgs = allChatMsgs.slice(-contextCount);
    const reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },
      ...chatMsgs
    ]);

    const rawReply = reply || '';
    processTransferDecision(state.currentCharId, rawReply);
    const parsed = parseThreePartReply(rawReply);
    parsed.content = stripTransferTags(parsed.content);

    const splitParts = parsed.content.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
    const translationParts = parsed.translation
      ? parsed.translation.split('---SPLIT---').map(s => s.trim()).filter(Boolean)
      : [];

    if (splitParts.length > 1) {
      splitParts.forEach((part, i) => {
        const newMsg = {
          id: uid(),
          role: 'assistant',
          content: part,
          type: 'text',
          timestamp: Date.now() + i * 800
        };
        if (i === splitParts.length - 1) {
          if (parsed.innerAction) newMsg.innerAction = parsed.innerAction;
          if (parsed.innerThought) newMsg.innerThought = parsed.innerThought;
        }
        if (translationParts.length >= splitParts.length) {
          newMsg.translation = translationParts[i];
        } else if (translationParts.length > 0 && i < translationParts.length) {
          newMsg.translation = translationParts[i];
        } else if (parsed.translation && i === splitParts.length - 1 && translationParts.length === 0) {
          newMsg.translation = parsed.translation;
        }
        state.chats[state.currentCharId].push(newMsg);
      });
    } else {
      const newMsg = {
        id: uid(),
        role: 'assistant',
        content: parsed.content,
        type: 'text',
        timestamp: Date.now()
      };
      if (parsed.innerAction) newMsg.innerAction = parsed.innerAction;
      if (parsed.innerThought) newMsg.innerThought = parsed.innerThought;
      if (parsed.translation) newMsg.translation = parsed.translation;
      state.chats[state.currentCharId].push(newMsg);
    }

    if (charCfg.charRecall && Math.random() < 0.15) {
      const allMsgs = state.chats[state.currentCharId];
      const newCount = splitParts.length > 1 ? splitParts.length : 1;
      const batchMsgs = allMsgs.slice(-newCount);
      const target = batchMsgs[Math.floor(Math.random() * batchMsgs.length)];
      if (target) {
        target.recalled = true;
        target.originalContent = target.content;
        target.content = '角色撤回了一条消息';
        delete target.translation;
      }
    }

    saveState();
    checkAutoSummarize();
  } catch (e) {
    showErrorModal(friendlyError(e));
  } finally {
    const ti = document.getElementById('typingInd');
    if (ti) ti.remove();
    btn.classList.remove('loading');
    btn.disabled = false;
    renderChat();
  }
}

// ========== 全局绑定 ==========
window.openChat = openChat;
window.sendMessage = sendMessage;
window.triggerResponse = triggerResponse;
window.editCharFromChat = editCharFromChat;
window.acceptTransfer = acceptTransfer;
window.declineTransfer = declineTransfer;
window.acceptCall = acceptCall;
window.declineCall = declineCall;
window.toggleVoiceText = toggleVoiceText;
window.autoGrow = autoGrow;
window.recallMessage = recallMessage;
window.viewRecalledMsg = viewRecalledMsg;
window.translateMsg = translateMsg;
window.toggleMsgTranslation = toggleMsgTranslation;
