// ========== chat-settings.js ==========
// 聊天设置页面逻辑
// 依赖：02-state.js, 05-ui.js, 18-chat-config.js

var _autoMsgTimers = {};
var _autoMomentsTimers = {};
var _forceMomentBusy = false;

function openChatSettings() {
  if (!state.currentCharId) return;
  var cfg = getCharConfig(state.currentCharId);

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
  document.getElementById('csChatLang').value = cfg.chatLang || 'zh-CN';
  document.getElementById('csStickersToggle').classList.toggle('on', !!cfg.useStickers);
  document.getElementById('csForceControlToggle').classList.toggle('on', !!cfg.forceControl);
  document.getElementById('csTopPriorityToggle').classList.toggle('on', !!cfg.topPriority);

  nav('screen-chat-settings');
}

function toggleCsToggle(field, toggleId) {
  if (!state.currentCharId) return;
  var cfg = getCharConfig(state.currentCharId);
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
  var cfg = getCharConfig(state.currentCharId);

  var stringFields = ['chatLang'];
  if (stringFields.indexOf(field) >= 0) {
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

// ★ 清空聊天记录、记忆、收藏
function clearChatAndMemories() {
  if (!state.currentCharId) return;
  var charId = state.currentCharId;
  var ch = state.characters ? state.characters.find(function(c) { return c.id === charId; }) : null;
  var charName = ch ? (ch.name || '该角色') : '该角色';

  var confirmed = confirm(
    '确认清空「' + charName + '」的所有数据？\n\n此操作将删除：\n- 所有聊天记录\n- 所有记忆条目\n- 所有收藏消息\n\n此操作不可撤销！'
  );
  if (!confirmed) return;

  if (state.chats) state.chats[charId] = [];
  if (state.memories && Array.isArray(state.memories)) {
    state.memories = state.memories.filter(function(m) { return m.charId !== charId; });
  }
  if (state.bookmarks && Array.isArray(state.bookmarks)) {
    state.bookmarks = state.bookmarks.filter(function(b) { return b.charId !== charId; });
  }
  var cfg = getCharConfig(charId);
  cfg.lastSummaryMsgCount = 0;
  cfg.lastConsolidateCount = 0;
  saveState();

  try { if (typeof renderChat === 'function') renderChat(); } catch(e) {}
  try { if (typeof renderMemoryList === 'function') renderMemoryList(); } catch(e) {}
  try { if (typeof renderCfgCharMemories === 'function') renderCfgCharMemories(); } catch(e) {}
  showToast('已清空');
}

// =========== 自动发消息 ===========
function startAutoMessage(charId) {
  stopAutoMessage(charId);
  var cfg = getCharConfig(charId);
  if (!cfg.autoMessage) return;
  var intervalMs = (cfg.autoMessageInterval || 10) * 60 * 1000;
  _autoMsgTimers[charId] = setInterval(function() {
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
  var cfg = getCharConfig(charId);
  cfg.autoMessage ? startAutoMessage(charId) : stopAutoMessage(charId);
}

// =========== 自动朋友圈（调用 AI 生成） ===========
function startAutoMoments(charId) {
  stopAutoMoments(charId);
  var cfg = getCharConfig(charId);
  if (!cfg.autoMoments) return;
  var intervalMs = (cfg.momentsInterval || 6) * 60 * 60 * 1000;
  _autoMomentsTimers[charId] = setInterval(function() {
    if (typeof generateAndPostCharMoment === 'function') {
      generateAndPostCharMoment(charId);
    }
  }, intervalMs);
}

function stopAutoMoments(charId) {
  if (_autoMomentsTimers[charId]) {
    clearInterval(_autoMomentsTimers[charId]);
    delete _autoMomentsTimers[charId];
  }
}

// ★ 强制发送 Moment（防抖 + 调用 AI 生成）
function forceSendMoment() {
  if (!state.currentCharId) return;
  if (_forceMomentBusy) {
    showToast('正在生成中...');
    return;
  }
  _forceMomentBusy = true;

  if (typeof generateAndPostCharMoment === 'function') {
    var p = generateAndPostCharMoment(state.currentCharId);
    if (p && typeof p.finally === 'function') {
      p.finally(function() { _forceMomentBusy = false; });
    } else {
      _forceMomentBusy = false;
    }
  } else {
    showToast('功能未加载');
    _forceMomentBusy = false;
  }

  // 重启定时器
  var cfg = getCharConfig(state.currentCharId);
  if (cfg.autoMoments) startAutoMoments(state.currentCharId);
}

// =========== 重启所有自动 Moment 定时器（可在 init 中调用）===========
function restartAllAutoMoments() {
  (state.characters || []).forEach(function(ch) {
    var cfg = getCharConfig(ch.id);
    if (cfg.autoMoments) startAutoMoments(ch.id);
  });
}

window.openChatSettings      = openChatSettings;
window.toggleCsToggle         = toggleCsToggle;
window.updateCsSetting        = updateCsSetting;
window.clearChatAndMemories   = clearChatAndMemories;
window.startAutoMessage       = startAutoMessage;
window.stopAutoMessage        = stopAutoMessage;
window.restartAutoMessageTimer= restartAutoMessageTimer;
window.startAutoMoments       = startAutoMoments;
window.stopAutoMoments        = stopAutoMoments;
window.forceSendMoment        = forceSendMoment;
window.restartAllAutoMoments  = restartAllAutoMoments;
