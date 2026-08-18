// ========== 11-chat.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 06-api.js, 07-prompt.js, 12-bubble-menu.js, 17-memory.js, 18-chat-config.js

function openChat(cid) {
  state.currentCharId = cid;
  state.unread[cid] = 0;
  if (!state.chats[cid]) state.chats[cid] = [];
  saveState();
  nav('screen-chat');
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
  let h = '';

  msgs.forEach((msg, i) => {
    if (i === 0 || (msg.timestamp - msgs[i - 1].timestamp > 300000))
      h += `<div class="msg-time">${fmtTime(msg.timestamp)}</div>`;
    const sent = msg.role === 'user';
    const side = sent ? 'sent' : 'received';
    const av = sent ? uH : aH;
    const selected = bubbleState.selectedIds.has(msg.id) ? 'selected' : '';
    const checkChecked = bubbleState.selectedIds.has(msg.id) ? 'checked' : '';

    // 撤回消息
    if (msg.recalled || msg.type === 'recalled') {
      h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}">
        <div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div>
        <div class="msg-avatar">${av}</div>
        <div class="msg-bubble" style="opacity:.5;font-style:italic;font-size:12px">${esc(msg.content)}</div>
      </div>`;
      return;
    }

    // 引用內容
    let quoteHtml = '';
    if (msg.quoteRef) {
      const qm = msgs.find(m => m.id === msg.quoteRef.id);
      quoteHtml = `<div class="msg-quote"><span class="mq-name">${esc(msg.quoteRef.name)}</span><br>${esc((qm ? qm.content : msg.quoteRef.text || '').slice(0, 40))}</div>`;
    }

    // 編輯標記
    let editedMark = msg.edited ? '<span style="font-size:10px;opacity:.4;margin-left:6px">(' + T('edited') + ')</span>' : '';

    if (sent) {
      if (msg.type === 'voice') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildVoiceBubble(msg.content)}</div>`;
      else if (msg.type === 'sticker') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildStickerBubble(msg.content)}</div>`;
      else if (msg.type === 'transfer') {
        const d = typeof msg.content === 'string' && msg.content.startsWith('{') ? JSON.parse(msg.content) : msg.content;
        h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildTransferBubble(d.amount || d, d.note || '', msg.id, true, msg.transferStatus)}</div>`;
      }
      else if (msg.type === 'image') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildImageBubble(msg.dataUrl || msg.content)}</div>`;
      else if (msg.type === 'simImage') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div>${buildSimImageBubble(msg.content)}</div>`;
      else h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${av}</div><div class="msg-bubble" data-bubbleid="${msg.id}">${quoteHtml}${fmtMsg(msg.content)}${editedMark}</div></div>`;
    } else {
      const segs = parseReplySegments(msg.content, state.stickers);
      segs.forEach((seg, segIdx) => {
        const segBubbleId = msg.id + '__seg' + segIdx;
        if (seg.type === 'sticker') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildStickerBubble(seg.url)}</div>`;
        else if (seg.type === 'voice') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildVoiceBubble(seg.content)}</div>`;
        else if (seg.type === 'transfer') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildTransferBubble(seg.amount, seg.note, msg.id, false, msg.transferStatus)}</div>`;
        else if (seg.type === 'simImage') h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div>${buildSimImageBubble(seg.content)}</div>`;
        else h += `<div class="msg-row ${side}${multiClass} ${selected}" data-msgid="${msg.id}"><div class="msg-check ${checkChecked}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="msg-avatar">${aH}</div><div class="msg-bubble" data-bubbleid="${segBubbleId}">${quoteHtml}${fmtMsg(seg.content)}${editedMark}</div></div>`;
      });
    }
  });

  ct.innerHTML = h;
  // 綁定長按事件
  ct.querySelectorAll('.msg-bubble[data-bubbleid]').forEach(el => {
    initBubbleLongPress(el, el.dataset.bubbleid);
  });
  setTimeout(() => ct.scrollTop = ct.scrollHeight, 50);
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
      if (m.type === 'voice') return { role: m.role, content: `[Voice]: ${m.content}` };
      if (m.type === 'sticker') return { role: m.role, content: '[Sent sticker]' };
      if (m.type === 'transfer') {
        const d = typeof m.content === 'string' && m.content.startsWith('{') ? JSON.parse(m.content) : m.content;
        return { role: m.role, content: `[Transfer ¥${d.amount || d}${d.note ? ' ' + d.note : ''}]${m.transferStatus ? ' (' + m.transferStatus + ')' : ''}` };
      }
      if (m.type === 'image') return { role: m.role, content: m.content };
      if (m.type === 'simImage') return { role: m.role, content: `[Image: ${m.content}]` };
      return { role: m.role, content: m.content };
    });
    const chatMsgs = allChatMsgs.slice(-contextCount);
    const reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },chatMsgs
    ]);
    state.chats[state.currentCharId].push({ id: uid(), role: 'assistant', content: reply || '', type: 'text', timestamp: Date.now() });
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
