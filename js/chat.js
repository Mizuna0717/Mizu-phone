// ========== 11-chat.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 06-api.js, 07-prompt.js, 12-bubble-menu.js, 17-memory.js, 18-chat-config.js

function openChat(cid) {
  state.currentCharId = cid;
  state.unread[cid] = 0;
  if (!state.chats[cid]) state.chats[cid] = [];
  saveState();
  nav('screen-chat');
  // ★ 启动自动消息定时器（如果已启用）
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
  let h = `<div class="msg-bubble transfer-msg"><div class="transfer-card"><div class="tc-label">${T('transfer')}</div><div class="tc-amount">¥${esc(String(amount))}</div>${note ? `<div class="tc-note">${esc(note)}</div>` : ''}`;
  if (!isSent && !status) {
    h += `<div class="transfer-actions"><button class="ta-accept" onclick="event.stopPropagation();acceptTransfer('${msgId}')">${T('accept')}</button><button class="ta-decline" onclick="event.stopPropagation();declineTransfer('${msgId}')">${T('decline')}</button></div>`;
  } else if (status) {
    h += `<div class="transfer-status ${status}">${status === 'accepted' ? T('accepted') : T('declined')}</div>`;
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

function buildCallBubble(callType, msgId, isSent, callStatus) {
  const isVideo = callType === 'video';
  const label = isVideo ? '视频通话' : '语音通话';
  const icon = isVideo
    ? `<svg viewBox="0 0 20 20" class="call-type-icon"><rect x="2" y="5" width="11" height="10" rx="1.5"/><path d="M13 7.5l5-2.5v10l-5-2.5z"/></svg>`
    : `<svg viewBox="0 0 20 20" class="call-type-icon"><path d="M6.6 3H5A2 2 0 003 5c0 7.2 5.8 13 13 13a2 2 0 002-2v-1.6a1.5 1.5 0 00-1-1.4l-2.7-.8a1.5 1.5 0 00-1.5.4l-1 1A9.4 9.4 0 017.4 9l1-1a1.5 1.5 0 00.4-1.5l-.8-2.7A1.5 1.5 0 006.6 3z"/></svg>`;

  let statusHtml = '';
  if (callStatus === 'accepted') statusHtml = `<div class="call-status accepted">已接通</div>`;
  else if (callStatus === 'declined') statusHtml = `<div class="call-status declined">已拒绝</div>`;
  else if (callStatus === 'requesting') statusHtml = `<div class="call-status requesting">请求中…</div>`;
  else if (!isSent && !callStatus) {
    statusHtml = `<div class="call-actions"><button class="call-accept-btn" onclick="event.stopPropagation();acceptCall('${msgId}')">接听</button><button class="call-decline-btn" onclick="event.stopPropagation();declineCall('${msgId}')">拒绝</button></div>`;
  }

  let labelText;
  if (isSent) labelText = label;
  else if (!callStatus) {
    const ch = state.characters.find(c => c.id === state.currentCharId);
    labelText = (ch ? ch.name : '角色') + ' 邀请你' + label;
  } else labelText = label;

  return `<div class="msg-bubble call-msg"><div class="call-card"><div class="call-icon-wrap">${icon}</div><div class="call-info"><div class="call-label">${labelText}</div>${statusHtml}</div></div></div>`;
}

// ========== ★ 消息额外操作按钮（翻译 & 撤回）★ ==========
function buildMsgExtraActions(msgId, isReceived, isRecalled) {
  if (!state.currentCharId) return '';
  const cfg = getCharConfig(state.currentCharId);
  const btns = [];

  if (cfg.translation && !isRecalled) {
    btns.push(`<button class="msg-translate-btn" onclick="event.stopPropagation();translateMsg('${msgId}')" title="翻译"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 3h5M4.5 3v1.5M3 6.5c1 2 3 3.5 5 4"/><path d="M8 6.5c-1 2-3 3.5-5 4"/><path d="M9.5 8l2 5 2-5M10.5 11.5h2"/></svg></button>`);
  }

  if (isReceived && cfg.charRecall && !isRecalled) {
    btns.push(`<button class="msg-recall-btn" onclick="event.stopPropagation();recallMessage('${msgId}')" title="撤回"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M5 8l3-3M8 5v5a3 3 0 003 3h1" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`);
  }

  if (btns.length) return `<div class="msg-extra-actions">${btns.join('')}</div>`;
  return '';
}

// ★ 撤回消息
function recallMessage(msgId) {
  const msgs = state.chats[state.currentCharId] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg) return;
  msg.recalled = true;
  msg.originalContent = msg.content;
  msg.content = '角色撤回了一条消息';
  saveState();
  renderChat();
  showToast('消息已撤回');
}
  

// ★ 查看撤回原文
function viewRecalledMsg(msgId) {
  const msgs = state.chats[state.currentCharId] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg || !msg.originalContent) return;
  document.getElementById('errorModalTitle').textContent = '撤回的消息';
  document.getElementById('errorModalBody').textContent = msg.originalContent;
  document.getElementById('errorModal').classList.add('show');
}


// ★ 翻译消息（占位）
function translateMsg(msgId) {
  showToast('翻译功能开发中');
}

// ========== 三段式回复解析 ==========
function parseThreePartReply(raw) {
  const result = { content: raw, innerAction: '', innerThought: '' };
  const replyMatch = raw.match(/【回复】\s*([\s\S]*?)(?=【动作】|【心声】|$)/);
  const actionMatch = raw.match(/【动作】\s*([\s\S]*?)(?=【回复】|【心声】|$)/);
  const thoughtMatch = raw.match(/【心声】\s*([\s\S]*?)(?=【回复】|【动作】|$)/);

  if (replyMatch || actionMatch || thoughtMatch) {
    if (replyMatch) result.content = replyMatch[1].trim();
    if (actionMatch) result.innerAction = actionMatch[1].trim();
    if (thoughtMatch) result.innerThought = thoughtMatch[1].trim();
  }
  return result;
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

       // ★ 撤回消息（含查看原文按钮）
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

        // ★ 朋友圈消息
    if (msg.type === 'moment') {
      h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">
        ${checkSvg}<div class="msg-avatar">${av}</div>
        <div class="msg-bubble moment-bubble"><svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.5"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14"/></svg><span>${esc(msg.content)}</span></div>
      </div>`;
      return;
    }


    // 引用內容
    let quoteHtml = '';
    if (msg.quoteRef) {
      const qm = msgs.find(m => m.id === msg.quoteRef.id);
      quoteHtml = `<div class="msg-quote"><span class="mq-name">${esc(msg.quoteRef.name)}</span><br>${esc((qm ? qm.content : msg.quoteRef.text || '').slice(0, 40))}</div>`;
    }

    let editedMark = msg.edited ? '<span style="font-size:10px;opacity:.4;margin-left:6px">(' + T('edited') + ')</span>' : '';

    // ★ 额外操作按钮
    const extras = buildMsgExtraActions(msg.id, !sent, false);

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
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div>${buildCallBubble(msg.callType || 'voice', msg.id, true, msg.callStatus)}${extras}</div>`;
      } else {
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${av}</div><div class="msg-bubble" data-bubbleid="${msg.id}">${quoteHtml}${fmtMsg(msg.content)}${editedMark}</div>${extras}</div>`;
      }
    } else {
      // 角色消息（segment 拆分）
      const segs = parseReplySegments(msg.content, state.stickers);
      const recvExtras = buildMsgExtraActions(msg.id, true, false);
      segs.forEach((seg, segIdx) => {
        const segBubbleId = msg.id + '__seg' + segIdx;
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
          h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">${checkSvg}<div class="msg-avatar">${aH}</div><div class="msg-bubble" data-bubbleid="${segBubbleId}">${quoteHtml}${fmtMsg(seg.content)}${editedMark}</div>${recvExtras}</div>`;
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

function acceptCall(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.callStatus = 'accepted'; saveState(); renderChat(); showToast('通话已接通（模拟）'); }
}

function declineCall(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.callStatus = 'declined'; saveState(); renderChat(); showToast('已拒绝通话'); }
}

function acceptTransfer(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.transferStatus = 'accepted'; saveState(); renderChat(); showToast(T('accepted')); }
}

function declineTransfer(mid) {
  const m = (state.chats[state.currentCharId] || []).find(x => x.id === mid);
  if (m) { m.transferStatus = 'declined'; saveState(); renderChat(); }
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
        return { role: m.role, content: `[Transfer ¥${d.amount || d}${d.note ? ' ' + d.note : ''}]${m.transferStatus ? ' (' + m.transferStatus + ')' : ''}` };
      }
      if (m.type === 'image') return { role: m.role, content: m.content };
      if (m.type === 'simImage') return { role: m.role, content: `[Image: ${m.content}]` };
      if (m.type === 'call') {
        const ct2 = m.callType === 'video' ? '视频' : '语音';
        return { role: m.role, content: `[${ct2}通话]${m.callStatus ? '(' + m.callStatus + ')' : '(requesting)'}` };
      }
      return { role: m.role, content: m.content };
    });
    const chatMsgs = allChatMsgs.slice(-contextCount);
    const reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },
      ...chatMsgs
    ]);

    // ★★★ 三段式回复解析 ★★★
    const parsed = parseThreePartReply(reply || '');

    // ★★★ 拆分多条消息（---SPLIT---）★★★
    const splitParts = parsed.content.split('---SPLIT---').map(s => s.trim()).filter(Boolean);

    if (splitParts.length > 1) {
      splitParts.forEach((part, i) => {
        const newMsg = {
          id: uid(),
          role: 'assistant',
          content: part,
          type: 'text',
          timestamp: Date.now() + i * 800
        };
        // 仅最后一条携带 innerAction / innerThought
        if (i === splitParts.length - 1) {
          if (parsed.innerAction) newMsg.innerAction = parsed.innerAction;
          if (parsed.innerThought) newMsg.innerThought = parsed.innerThought;
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
      state.chats[state.currentCharId].push(newMsg);
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
// ========== ★ 全局绑定（修复 iMessage 角色列表 onclick 无法调用）★ ==========
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
