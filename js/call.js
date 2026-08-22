// ========== call.js ==========
const callState = {
  active: false,
  charId: null,
  callMsgId: null,
  callType: 'voice',
  thoughtVisible: false,
  timerInterval: null,
  startTime: 0,
  messages: [],
  inputVisible: false,
  actionVisible: false,
  latestThought: '',
  latestAction: '',
  greetingPromise: null
};

// ========== 打开通话界面 ==========
function openCallInterface(charId, callType, callMsgId) {
  const ch = state.characters.find(c => c.id === charId);
  if (!ch) return;

  const existingMsg = (state.chats[charId] || []).find(m => m.id === callMsgId);
  const isHistoryView = existingMsg && existingMsg.callHistory && existingMsg.callStatus === 'ended';

  callState.active = !isHistoryView;
  callState.charId = charId;
  callState.callMsgId = callMsgId;
  callState.callType = callType || 'voice';
  callState.thoughtVisible = false;
  callState.inputVisible = false;
  callState.actionVisible = false;
  callState.latestThought = '';
  callState.latestAction = '';
  callState.greetingPromise = null;

  const screen = document.getElementById('callScreen');
  const bg = document.getElementById('callBg');

  if (ch.avatar) {
    bg.style.backgroundImage = 'url(' + ch.avatar + ')';
    document.getElementById('callAvatar').innerHTML = '<img src="' + ch.avatar + '">';
  } else {
    bg.style.backgroundImage = 'none';
    bg.style.background = '#f5f5f5';
    document.getElementById('callAvatar').innerHTML = '<svg viewBox="0 0 24 24" width="48" height="48"><circle cx="12" cy="8" r="4" stroke="#aaa" fill="none" stroke-width="1.5"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="#aaa" fill="none" stroke-width="1.5"/></svg>';
  }

  document.getElementById('callName').textContent = ch.name || '角色';
  document.getElementById('callTypeLabel').textContent = callType === 'video' ? '视频通话' : '语音通话';
  document.getElementById('callMessages').innerHTML = '';
  document.getElementById('callThoughtText').textContent = '';
  document.getElementById('callThoughtBar').style.display = 'none';
  document.getElementById('callInputBar').classList.remove('show');
  document.getElementById('callActionBar').classList.remove('show');

  const thoughtBtn = document.getElementById('callThoughtBtn');
  if (thoughtBtn) thoughtBtn.classList.remove('active');
  document.getElementById('callInputBtn')?.classList.remove('active');
  document.getElementById('callActionBtn')?.classList.remove('active');
  updateCallTypeUI();

  if (isHistoryView) {
    callState.messages = [];
    const history = existingMsg.callHistory || [];
    const duration = existingMsg.callDuration || '00:00';
    document.getElementById('callTimer').textContent = duration;

    document.getElementById('callControlsLive')?.classList.add('hidden');
    document.getElementById('callControlsHistory')?.classList.remove('hidden');

    screen.classList.add('show');

    history.forEach(function(msg) {
      if (msg.role === 'user') {
        appendCallBubbleRaw('sent', msg.content, msg.isAction);
      } else {
        appendCallReplyBubbleRaw(msg.content, msg.innerThought, msg.innerAction);
      }
    });

    return;
  }

  callState.messages = [];
  callState.startTime = Date.now();
  document.getElementById('callTimer').textContent = '00:00';

  document.getElementById('callControlsLive')?.classList.remove('hidden');
  document.getElementById('callControlsHistory')?.classList.add('hidden');

  screen.classList.add('show');
  startCallTimer();

  callState.greetingPromise = generateCallGreeting(charId, callType);

  setTimeout(async () => {
    if (!callState.active || callState.charId !== charId) return;
    try { await callState.greetingPromise; } catch (e) { console.error('Greeting error:', e); }
    callState.greetingPromise = null;
  }, 2000);
}

async function generateCallGreeting(charId, callType) {
  if (!callState.active || callState.charId !== charId) return;

  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) return;

  const ch = state.characters.find(c => c.id === charId);
  if (!ch) return;

  const container = document.getElementById('callMessages');
  if (!container) return;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'call-msg-row received';
  typingDiv.id = 'callTypingInd';
  typingDiv.innerHTML = '<div class="call-msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    let callSysPrompt = buildSystemPrompt(ch, state.worldbooks, state.stickers);
    callSysPrompt += '\n\n[CALL MODE - 通话模式]\n你正在和用户进行' +
      (callType === 'video' ? '视频' : '语音') +
      '通话。通话刚刚接通，请自然地打招呼或开场。' +
      '请用口语化、自然亲密的方式回复，就像在电话中说话一样。' +
      '回复要简短自然，像真人打电话时的说话风格。不要过长。' +
      '仍需强制使用三段式格式（【回复】【动作】【心声】）。';

    const chatMsgs = (state.chats[charId] || []).slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.recalled ? '[已撤回]' : m.content
    }));

    const reply = await sendChat(api, [{ role: 'system', content: callSysPrompt }, ...chatMsgs]);
    const parsed = parseThreePartReply(reply || '');

    const ti = document.getElementById('callTypingInd');
    if (ti) ti.remove();

    if (callState.active && callState.charId === charId) {
      processCallReply(parsed);
    }

  } catch (e) {
    const ti = document.getElementById('callTypingInd');
    if (ti) ti.remove();
    if (callState.active && callState.charId === charId) {
      appendCallBubbleRaw('received', '(连接中断)');
    }
    console.error('Call greeting error:', e);
  }
}

function processCallReply(parsed) {
  let replyContent = parsed.content
    .replace(/\[\s*领取转账\s*\]/g, '')
    .replace(/\[\s*拒绝转账\s*\]/g, '')
    .trim();

  if (!replyContent) replyContent = '...';

  const parts = replyContent.split(/---SPLIT---/).map(s => s.trim()).filter(Boolean);

  parts.forEach(function(part, i) {
    const isLast = i === parts.length - 1;
    const msgObj = {
      role: 'assistant',
      content: part,
      timestamp: Date.now() + i * 200,
      innerAction: isLast ? (parsed.innerAction || '') : '',
      innerThought: isLast ? (parsed.innerThought || '') : ''
    };
    callState.messages.push(msgObj);

    const idx = callState.messages.length - 1;
    appendCallReplyBubbleWithLP(
      part,
      isLast ? parsed.innerThought : '',
      isLast ? parsed.innerAction : '',
      idx
    );
  });

  if (parsed.innerThought) {
    callState.latestThought = parsed.innerThought;
    document.getElementById('callThoughtText').textContent = parsed.innerThought;
    if (callState.thoughtVisible) {
      document.getElementById('callThoughtBar').style.display = 'flex';
    }
  }
  if (parsed.innerAction) {
    callState.latestAction = parsed.innerAction;
  }
}

function startCallTimer() {
  if (callState.timerInterval) clearInterval(callState.timerInterval);
  callState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - callState.startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('callTimer');
    if (el) el.textContent = m + ':' + s;
  }, 1000);
}

function stopCallTimer() {
  if (callState.timerInterval) { clearInterval(callState.timerInterval); callState.timerInterval = null; }
}

function updateCallTypeUI() {
  const isVideo = callState.callType === 'video';
  const label = document.getElementById('callFacetimeLabel');
  const typeLabel = document.getElementById('callTypeLabel');
  const actionLabel = document.getElementById('callActionLabel');
  if (label) label.textContent = isVideo ? '语音' : 'FaceTime';
  if (typeLabel) typeLabel.textContent = isVideo ? '视频通话' : '语音通话';
  if (actionLabel) actionLabel.textContent = isVideo ? '动作' : '更多';
}

function callGenReply() {
  if (!callState.active) return;
  triggerCallResponse(null);
}

function toggleCallThought() {
  callState.thoughtVisible = !callState.thoughtVisible;
  const btn = document.getElementById('callThoughtBtn');
  if (btn) btn.classList.toggle('active', callState.thoughtVisible);
  const bar = document.getElementById('callThoughtBar');
  if (callState.thoughtVisible && callState.latestThought) {
    document.getElementById('callThoughtText').textContent = callState.latestThought;
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }
}

function toggleCallType() {
  callState.callType = callState.callType === 'voice' ? 'video' : 'voice';
  updateCallTypeUI();
  if (callState.callMsgId && callState.charId) {
    const msgs = state.chats[callState.charId] || [];
    const m = msgs.find(x => x.id === callState.callMsgId);
    if (m) { m.callType = callState.callType; saveState(); }
  }
}

function toggleCallInput() {
  callState.inputVisible = !callState.inputVisible;
  callState.actionVisible = false;
  document.getElementById('callInputBar').classList.toggle('show', callState.inputVisible);
  document.getElementById('callActionBar').classList.remove('show');
  document.getElementById('callInputBtn').classList.toggle('active', callState.inputVisible);
  document.getElementById('callActionBtn')?.classList.remove('active');
  if (callState.inputVisible) setTimeout(() => document.getElementById('callInput').focus(), 100);
}

function toggleCallAction() {
  callState.actionVisible = !callState.actionVisible;
  callState.inputVisible = false;
  document.getElementById('callActionBar').classList.toggle('show', callState.actionVisible);
  document.getElementById('callInputBar').classList.remove('show');
  document.getElementById('callActionBtn')?.classList.toggle('active', callState.actionVisible);
  document.getElementById('callInputBtn')?.classList.remove('active');
  if (callState.actionVisible) setTimeout(() => document.getElementById('callActionInput').focus(), 100);
}

function autoGrowCallInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}

// ========== ★★★ 结束通话 ★★★ ==========
async function endCallInterface() {
  callState.active = false;
  stopCallTimer();

  document.getElementById('callScreen').classList.remove('show');
  document.getElementById('callInputBar').classList.remove('show');
  document.getElementById('callActionBar').classList.remove('show');

  const elapsed = Math.floor((Date.now() - callState.startTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const durationStr = mm + ':' + ss;

  const charId = callState.charId;
  const callMsgId = callState.callMsgId;
  const callMessages = [...callState.messages];

  if (charId && state.chats[charId]) {
    const callMsg = state.chats[charId].find(m => m.id === callMsgId);
    if (callMsg) {
      callMsg.callStatus = 'ended';
      callMsg.callDuration = durationStr;
      callMsg.callHistory = callMessages;
    }

    state.chats[charId].push({
      id: uid(),
      role: 'system',
      content: '\u901A\u8BDD\u7ED3\u675F \u00B7 \u65F6\u957F ' + durationStr,
      type: 'call-summary',
      callRefId: callMsgId,
      timestamp: Date.now()
    });

    saveState();
    if (state.currentCharId === charId && typeof renderChat === 'function') {
      renderChat();
    }
  }

  if (charId && callMessages.length >= 2) {
    summarizeCallMemory(charId, callMessages);
  }

  callState.charId = null;
  callState.callMsgId = null;
  callState.messages = [];
  callState.greetingPromise = null;
}

function closeCallHistory() {
  document.getElementById('callScreen').classList.remove('show');
}

// ========== ★★★ 通话记忆自动总结 — 改为写入 FTM ★★★ ==========
async function summarizeCallMemory(charId, messages) {
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) return;
  const ch = state.characters.find(c => c.id === charId);
  if (!ch) return;

  const formatted = messages.map(m => {
    return (m.role === 'user' ? 'User' : ch.name) + ': ' + m.content;
  }).join('\n');

  const prompt = 'Summarize this phone call between User and ' + ch.name + ' into a concise memory note (under 100 words). Focus on key topics, emotions, and important info. Write in third person. No headers.\n\nCall transcript:\n' + formatted + '\n\nSummary:';

  try {
    const summary = await sendChat(api, [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Summarize now.' }
    ]);
    if (summary && typeof saveMemoryEntry === 'function') {
      // ★★★ 改为 'ftm' — 通话记忆写入易遗忘记忆 ★★★
      saveMemoryEntry(charId, 'ftm', '通话记录: ' + ch.name, summary.trim());
    }
  } catch (e) { console.error('Call memory summarize error:', e); }
}

// ========== 发送消息 ==========
function sendCallMessage() {
  const input = document.getElementById('callInput');
  const text = input.value.trim();
  if (!text) return;
  callState.messages.push({ role: 'user', content: text, timestamp: Date.now() });
  const idx = callState.messages.length - 1;
  appendCallBubbleWithLP('sent', text, false, idx);
  input.value = '';
  input.style.height = 'auto';
}

function sendCallAction() {
  const input = document.getElementById('callActionInput');
  const text = input.value.trim();
  if (!text) return;
  callState.messages.push({ role: 'user', content: '*' + text + '*', timestamp: Date.now(), isAction: true });
  const idx = callState.messages.length - 1;
  appendCallBubbleWithLP('sent', '*' + text + '*', true, idx);
  input.value = '';
  input.style.height = 'auto';
}

// ========== 长按删除 ==========
function initCallBubbleLongPress(el, msgIndex) {
  let timer = null;
  const start = (e) => { e.preventDefault(); timer = setTimeout(() => showCallDeleteMenu(el, msgIndex), 500); };
  const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchmove', cancel);
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', cancel);
  el.addEventListener('mouseleave', cancel);
}

function showCallDeleteMenu(el, msgIndex) {
  const old = document.getElementById('callDeleteMenu');
  if (old) old.remove();
  const oldO = document.getElementById('callDeleteOverlay');
  if (oldO) oldO.remove();

  const overlay = document.createElement('div');
  overlay.id = 'callDeleteOverlay';
  overlay.className = 'call-delete-overlay';

  const menu = document.createElement('div');
  menu.id = 'callDeleteMenu';
  menu.className = 'call-delete-menu';
  menu.innerHTML = '<div class="call-delete-item" onclick="deleteCallMsg(' + msgIndex + ')"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>删除</span></div>';

  overlay.onclick = () => { overlay.remove(); menu.remove(); };

  const rect = el.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 120)) + 'px';

  document.getElementById('callScreen').appendChild(overlay);
  document.getElementById('callScreen').appendChild(menu);
}

function deleteCallMsg(index) {
  const m = document.getElementById('callDeleteMenu');
  const o = document.getElementById('callDeleteOverlay');
  if (m) m.remove();
  if (o) o.remove();
  if (index >= 0 && index < callState.messages.length) callState.messages.splice(index, 1);
  rerenderCallMessages();
}

function rerenderCallMessages() {
  const container = document.getElementById('callMessages');
  container.innerHTML = '';
  callState.messages.forEach(function(msg, idx) {
    if (msg.role === 'user') {
      appendCallBubbleWithLP('sent', msg.content, msg.isAction, idx);
    } else {
      appendCallReplyBubbleWithLP(msg.content, msg.innerThought, msg.innerAction, idx);
    }
  });
}

function appendCallBubbleWithLP(side, content, isAction, idx) {
  const container = document.getElementById('callMessages');
  const div = document.createElement('div');
  div.className = 'call-msg-row ' + side;
  div.dataset.callIdx = idx;
  div.innerHTML = isAction
    ? '<div class="call-msg-bubble call-action-bubble">' + esc(content) + '</div>'
    : '<div class="call-msg-bubble">' + esc(content) + '</div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  initCallBubbleLongPress(div, idx);
}

function appendCallReplyBubbleWithLP(content, thought, action, idx) {
  const container = document.getElementById('callMessages');
  const div = document.createElement('div');
  div.className = 'call-msg-row received';
  div.dataset.callIdx = idx;
  let html = '<div class="call-msg-bubble">' + esc(content) + '</div>';
  if (action) html += '<div class="call-msg-action">' + esc(action) + '</div>';
  if (thought && callState.thoughtVisible) html += '<div class="call-msg-thought">' + esc(thought) + '</div>';
  div.innerHTML = html;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  initCallBubbleLongPress(div, idx);
}

function appendCallBubbleRaw(side, content, isAction) {
  const container = document.getElementById('callMessages');
  const div = document.createElement('div');
  div.className = 'call-msg-row ' + side;
  div.innerHTML = isAction
    ? '<div class="call-msg-bubble call-action-bubble">' + esc(content) + '</div>'
    : '<div class="call-msg-bubble">' + esc(content) + '</div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendCallReplyBubbleRaw(content, thought, action) {
  const container = document.getElementById('callMessages');
  const div = document.createElement('div');
  div.className = 'call-msg-row received';
  let html = '<div class="call-msg-bubble">' + esc(content) + '</div>';
  if (action) html += '<div class="call-msg-action">' + esc(action) + '</div>';
  if (thought) html += '<div class="call-msg-thought">' + esc(thought) + '</div>';
  div.innerHTML = html;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ========== 触发通话回复 ==========
async function triggerCallResponse(hint) {
  if (!callState.active || !callState.charId) return;
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) return;
  const ch = state.characters.find(c => c.id === callState.charId);
  if (!ch) return;

  const container = document.getElementById('callMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'call-msg-row received';
  typingDiv.id = 'callTypingInd';
  typingDiv.innerHTML = '<div class="call-msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    let callSysPrompt = buildSystemPrompt(ch, state.worldbooks, state.stickers);
    callSysPrompt += '\n\n[CALL MODE - 通话模式]\n你正在和用户进行' +
      (callState.callType === 'video' ? '视频' : '语音') +
      '通话。请用口语化、自然亲密的方式回复，就像在电话中说话一样。' +
      '回复要简短自然，像真人打电话时的说话风格。不要过长。' +
      '仍需强制使用三段式格式（【回复】【动作】【心声】）。';

    if (hint) callSysPrompt += '\n\n[提示] ' + hint;

    const chatMsgs = (state.chats[callState.charId] || []).slice(-20).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.recalled ? '[已撤回]' : m.content
    }));

    const callMsgs = callState.messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: '[通话] ' + m.content
    }));

    const allMsgs = [{ role: 'system', content: callSysPrompt }, ...chatMsgs.slice(-10), ...callMsgs];
    const reply = await sendChat(api, allMsgs);
    const parsed = parseThreePartReply(reply || '');

    const ti = document.getElementById('callTypingInd');
    if (ti) ti.remove();

    processCallReply(parsed);

  } catch (e) {
    const ti = document.getElementById('callTypingInd');
    if (ti) ti.remove();
    appendCallBubbleRaw('received', '(连接中断)');
    console.error('Call response error:', e);
  }
}

function viewCallHistory(msgId) {
  const charId = state.currentCharId;
  if (!charId) return;
  const msg = (state.chats[charId] || []).find(m => m.id === msgId);
  if (!msg) return;
  openCallInterface(charId, msg.callType || 'voice', msgId);
}

window.openCallInterface = openCallInterface;
window.endCallInterface = endCallInterface;
window.closeCallHistory = closeCallHistory;
window.callGenReply = callGenReply;
window.toggleCallThought = toggleCallThought;
window.toggleCallType = toggleCallType;
window.toggleCallInput = toggleCallInput;
window.toggleCallAction = toggleCallAction;
window.sendCallMessage = sendCallMessage;
window.sendCallAction = sendCallAction;
window.autoGrowCallInput = autoGrowCallInput;
window.deleteCallMsg = deleteCallMsg;
window.viewCallHistory = viewCallHistory;
