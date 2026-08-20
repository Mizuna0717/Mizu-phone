// ========== chat-settings.js ==========
// 聊天设置页面逻辑
// 依赖：02-state.js, 05-ui.js, 18-chat-config.js, 11-chat.js

let _autoMsgTimers = {};
let _autoMomentsTimers = {};

function openChatSettings() {
  if (!state.currentCharId) return;
  const cfg = getCharConfig(state.currentCharId);

  document.getElementById('csReplyMin').value = cfg.replyMin;
  document.getElementById('csReplyMax').value = cfg.replyMax;
  document.getElementById('csTimeToggle').classList.toggle('on', !!cfg.timeAwareness);
  document.getElementById('csRecallToggle').classList.toggle('on', !!cfg.charRecall);
  document.getElementById('csMomentsToggle').classList.toggle('on', !!cfg.autoMoments);
  document.getElementById('csMomentsInterval').value = cfg.momentsInterval;
  document.getElementById('csMomentsIntervalVal').textContent = cfg.momentsInterval;
  document.getElementById('csTranslateToggle').classList.toggle('on', !!cfg.translation);
  document.getElementById('csAutoMsgToggle').classList.toggle('on', !!cfg.autoMessage);
  document.getElementById('csAutoMsgInterval').value = cfg.autoMessageInterval;
  document.getElementById('csAutoMsgIntervalVal').textContent = cfg.autoMessageInterval;

  // ★★★ 新增：语言下拉框 ★★★
  document.getElementById('csChatLang').value = cfg.chatLang || 'zh-CN';

  // ★★★ 三个功能开关 ★★★
  document.getElementById('csStickersToggle').classList.toggle('on', !!cfg.useStickers);
  document.getElementById('csForceControlToggle').classList.toggle('on', !!cfg.forceControl);
  document.getElementById('csTopPriorityToggle').classList.toggle('on', !!cfg.topPriority);

  nav('screen-chat-settings');
}

function toggleCsToggle(field, toggleId) {
  if (!state.currentCharId) return;
  const cfg = getCharConfig(state.currentCharId);
  cfg[field] = !cfg[field];
  document.getElementById(toggleId).classList.toggle('on', cfg[field]);
  saveCharConfig();

  if (field === 'autoMessage') {
    cfg.autoMessage ? startAutoMessage(state.currentCharId) : stopAutoMessage(state.currentCharId);
  }
  if (field === 'autoMoments') {
    cfg.autoMoments ? startAutoMoments(state.currentCharId) : stopAutoMoments(state.currentCharId);
  }
  if (field === 'translation' || field === 'charRecall') {
    if (typeof renderChat === 'function') renderChat();
  }
}

function updateCsSetting(field, value) {
  if (!state.currentCharId) return;
  const cfg = getCharConfig(state.currentCharId);

  // ★ 字符串类型字段
  const stringFields = ['chatLang'];
  if (stringFields.includes(field)) {
    cfg[field] = value;
  } else {
    cfg[field] = parseInt(value) || 1;
  }

  if (field === 'replyMin' && cfg.replyMin > cfg.replyMax) {
    cfg.replyMax = cfg.replyMin;
    document.getElementById('csReplyMax').value = cfg.replyMax;
  }
  if (field === 'replyMax' && cfg.replyMax < cfg.replyMin) {
    cfg.replyMin = cfg.replyMax;
    document.getElementById('csReplyMin').value = cfg.replyMin;
  }

  saveCharConfig();

  if (field === 'autoMessageInterval' && cfg.autoMessage) startAutoMessage(state.currentCharId);
  if (field === 'momentsInterval' && cfg.autoMoments) startAutoMoments(state.currentCharId);
}

// ★★★ 清空聊天记录、记忆、收藏 ★★★
function clearChatAndMemories() {
  if (!state.currentCharId) return;
  const charId = state.currentCharId;

  const char = state.characters ? state.characters.find(c => c.id === charId) : null;
  const charName = char ? (char.name || '该角色') : '该角色';

  const confirmed = confirm(
    `确认清空「${charName}」的所有数据？\n\n此操作将删除：\n- 所有聊天记录\n- 所有记忆条目\n- 所有收藏消息\n\n此操作不可撤销！`
  );
  if (!confirmed) return;

  if (state.chats) {
    state.chats[charId] = [];
  }

  if (state.memories && Array.isArray(state.memories)) {
    state.memories = state.memories.filter(m => m.charId !== charId);
  }

  if (state.bookmarks && Array.isArray(state.bookmarks)) {
    state.bookmarks = state.bookmarks.filter(b => b.charId !== charId);
  }

  const cfg = getCharConfig(charId);
  cfg.lastSummaryMsgCount = 0;
  cfg.lastConsolidateCount = 0;

  saveState();

  if (typeof renderChat === 'function') {
    try { renderChat(); } catch (e) { console.warn('renderChat error:', e); }
  }

  if (typeof renderMemoryList === 'function') {
    try { renderMemoryList(); } catch (e) { console.warn('renderMemoryList error:', e); }
  }
  if (typeof renderCfgCharMemories === 'function') {
    try { renderCfgCharMemories(); } catch (e) { console.warn('renderCfgCharMemories error:', e); }
  }

  if (typeof showToast === 'function') {
    showToast('已清空');
  } else {
    alert('已清空');
  }
}

// =========== 自动发消息 ===========
function startAutoMessage(charId) {
  stopAutoMessage(charId);
  const cfg = getCharConfig(charId);
  if (!cfg.autoMessage) return;
  const intervalMs = (cfg.autoMessageInterval || 10) * 60 * 1000;
  _autoMsgTimers[charId] = setInterval(() => {
    if (state.currentCharId !== charId) return;
    if (typeof triggerResponse === 'function') triggerResponse();
  }, intervalMs);
}

function stopAutoMessage(charId) {
  if (_autoMsgTimers[charId]) {
    clearInterval(_autoMsgTimers[charId]);
    delete _autoMsgTimers[charId];
  }
}

function restartAutoMessageTimer(charId) {
  const cfg = getCharConfig(charId);
  cfg.autoMessage ? startAutoMessage(charId) : stopAutoMessage(charId);
}

// =========== 自动朋友圈 ===========
function startAutoMoments(charId) {
  stopAutoMoments(charId);
  const cfg = getCharConfig(charId);
  if (!cfg.autoMoments) return;
  const intervalMs = (cfg.momentsInterval || 6) * 60 * 60 * 1000;
  _autoMomentsTimers[charId] = setInterval(() => {
    if (state.currentCharId !== charId) return;
    const momentMsg = {
      id: uid(),
      role: 'assistant',
      content: '[朋友圈] 今天天气真好~',
      type: 'moment',
      timestamp: Date.now()
    };
    state.chats[charId].push(momentMsg);
    saveState();
    if (state.currentCharId === charId && typeof renderChat === 'function') renderChat();
    showToast('角色发了一条朋友圈');
  }, intervalMs);
}

function stopAutoMoments(charId) {
  if (_autoMomentsTimers[charId]) {
    clearInterval(_autoMomentsTimers[charId]);
    delete _autoMomentsTimers[charId];
  }
}

function forceSendMoment() {
  if (!state.currentCharId) return;
  const charId = state.currentCharId;
  if (!state.chats[charId]) state.chats[charId] = [];
  const momentMsg = {
    id: uid(),
    role: 'assistant',
    content: '[朋友圈] 今天天气真好~',
    type: 'moment',
    timestamp: Date.now()
  };
  state.chats[charId].push(momentMsg);
  const cfg = getCharConfig(charId);
  if (cfg.autoMoments) startAutoMoments(charId);
  saveState();
  showToast('朋友圈已发送');
}

// =========== iMessage 标签切换 ===========
function switchImsgTab(tab) {
  state.imsgTab = tab;

  document.querySelectorAll('.imsg-bottom-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  const tabMap = {
    messages: 'imsgTabMessages',
    groups: 'imsgTabGroups',
    moments: 'imsgTabMoments',
    profile: 'imsgTabProfile'
  };

  Object.values(tabMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const activeId = tabMap[tab];
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }

  const titles = {
    messages: 'Messages',
    groups: 'Groups',
    moments: 'Moments',
    profile: 'Profile'
  };
  const lt = document.getElementById('imsgLargeTitle');
  if (lt) lt.textContent = titles[tab] || 'Messages';

  saveState();
}
