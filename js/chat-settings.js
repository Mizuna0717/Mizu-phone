// ========== chat-settings.js ==========
// Chat Settings page logic + Top Priority + Force Control state management

var _autoMsgTimers = {};
var _autoMomentsTimers = {};
var _forceMomentBusy = false;

/* ══════════════════════════════════════════
   Top Priority — 全局状态管理（保持不变）
   ══════════════════════════════════════════ */
var TP_STATE_KEY = 'ai_app_tp_state';

function _loadTpState() {
  try { var raw = localStorage.getItem(TP_STATE_KEY); return raw ? JSON.parse(raw) : { locks: {} }; }
  catch (e) { return { locks: {} }; }
}
function _saveTpState(tpState) {
  try { localStorage.setItem(TP_STATE_KEY, JSON.stringify(tpState)); }
  catch (e) { console.error('[TP] save failed', e); }
}
function getTpLock(charId) {
  var tpState = _loadTpState(); return tpState.locks[charId] || null;
}
function setTpLock(charId, lockData) {
  var tpState = _loadTpState();
  if (lockData) { tpState.locks[charId] = lockData; } else { delete tpState.locks[charId]; }
  _saveTpState(tpState);
}
function _findActiveLockedCharId() {
  var tpState = _loadTpState(); var locks = tpState.locks || {};
  var keys = Object.keys(locks);
  for (var i = 0; i < keys.length; i++) {
    if (locks[keys[i]] && locks[keys[i]].active === true) return keys[i];
  }
  return null;
}
function isTopPriorityActive(charId) {
  var cfg = getCharConfig(charId); if (cfg && cfg.topPriority) return true;
  var lock = getTpLock(charId); if (lock && lock.active) return true; return false;
}
function isCharTpLocked(charId) {
  var lock = getTpLock(charId); return !!(lock && lock.active);
}
function initTopPriorityForChar(charId) {
  var existing = getTpLock(charId); if (existing && existing.active) return;
  setTpLock(charId, {
    active: false, originalAccountId: null, guestAccountId: null,
    emotions: { anger: 0, suspicion: 0, trust: 5, patience: 5 },
    consecutiveHigh: 0, cooldownRounds: 0, lockTimestamp: null, forceUnlockedAt: null
  });
}
function clearTopPriorityForChar(charId) { setTpLock(charId, null); }

function forceUnlockTopPriority(explicitCharId) {
  var charId = explicitCharId || null;
  if (!charId && state.currentCharId) charId = state.currentCharId;
  if (!charId) { charId = _findActiveLockedCharId(); }
  if (!charId) {
    var cfgObj = state.charConfig || {};
    var cfgKeys = Object.keys(cfgObj);
    for (var ci = 0; ci < cfgKeys.length; ci++) {
      var ck = cfgKeys[ci];
      if (cfgObj[ck] && cfgObj[ck].topPriority) {
        var testLock = getTpLock(ck);
        if (testLock && testLock.active) { charId = ck; break; }
      }
    }
  }
  if (!charId) { showToast('无活跃顶号状态'); return; }

  var lock = getTpLock(charId);
  var originalAccountId = (lock && lock.originalAccountId) ? lock.originalAccountId : null;
  var preservedEmotions = (lock && lock.emotions) ? lock.emotions : { anger:0,suspicion:0,trust:5,patience:5 };
  var newLock = {
    active: false, originalAccountId: null, guestAccountId: null,
    emotions: preservedEmotions, consecutiveHigh: 0, cooldownRounds: 0,
    lockTimestamp: null, forceUnlockedAt: Date.now()
  };
  setTpLock(charId, newLock);

  try {
    var cfg = getCharConfig(charId);
    if (cfg && cfg.topPriority) { cfg.topPriority = false; saveCharConfig(); }
    var toggleEl = document.getElementById('csTopPriorityToggle');
    if (toggleEl) toggleEl.classList.remove('on');
  } catch (e) {}

  if (originalAccountId && originalAccountId !== accountStore.currentAccountId) {
    try {
      var origRaw = localStorage.getItem('ai_app_account_' + originalAccountId);
      if (origRaw) {
        var origData = JSON.parse(origRaw);
        if (origData && origData.charConfig && origData.charConfig[charId]) {
          origData.charConfig[charId].topPriority = false;
          localStorage.setItem('ai_app_account_' + originalAccountId, JSON.stringify(origData));
        }
      }
    } catch (e) {}
  }

  window._tpConfirmFn = null; window._tpCancelFn = null;
  var tpModal = document.getElementById('tpModal'); if (tpModal) tpModal.remove();

  if (originalAccountId && originalAccountId !== accountStore.currentAccountId) {
    saveState();
    var ok = switchAccount(originalAccountId);
    if (ok) { state.currentCharId = charId; reloadUI(false); nav('screen-chat'); showToast('已强制解除顶号，切回主号'); }
    else { showToast('切回主号失败'); }
  } else {
    if (!state.currentCharId) state.currentCharId = charId;
    showToast('已解除顶号');
    try { renderChat(); } catch (e) {}
  }
  try { updateTopPrioritySettingsUI(); } catch (e) {}
}

function updateTopPrioritySettingsUI() {
  var extra = document.getElementById('csTopPriorityExtra');
  if (!extra) {
    var toggleEl = document.getElementById('csTopPriorityToggle');
    if (!toggleEl) return;
    var parentRow = toggleEl.closest('.cs-row') || toggleEl.parentElement;
    if (!parentRow) return;
    extra = document.createElement('div'); extra.id = 'csTopPriorityExtra';
    parentRow.parentElement.insertBefore(extra, parentRow.nextSibling);
  }
  var targetCharId = state.currentCharId || _findActiveLockedCharId();
  if (!targetCharId) { extra.innerHTML = ''; return; }
  var lock = getTpLock(targetCharId);
  if (lock && lock.active) {
    var em = lock.emotions || {};
    var emotionDesc = '愤怒 ' + (em.anger||0) + '/10 · 怀疑 ' + (em.suspicion||0) + '/10 · 信任 ' + (em.trust||0) + '/10 · 耐心 ' + (em.patience||0) + '/10';
    extra.innerHTML =
      '<div style="margin:8px 16px 0;background:#fef5f5;border:1px solid #f5c6cb;border-radius:10px;padding:12px 14px">' +
        '<div style="font-size:13px;color:#c62828;font-weight:600;margin-bottom:4px">顶号状态：已锁定</div>' +
        '<div style="font-size:11px;color:#888;margin-bottom:8px">' + emotionDesc + '</div>' +
        '<div style="font-size:11px;color:#999;margin-bottom:10px">冷却进度：' + (lock.cooldownRounds||0) + '/3 轮</div>' +
        '<button onclick="forceUnlockTopPriority(\'' + targetCharId + '\')" style="width:100%;padding:10px;border:none;background:#ef5350;color:#fff;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">强制解除顶号</button>' +
      '</div>';
  } else if (lock && lock.emotions && (lock.emotions.anger > 0 || lock.emotions.suspicion > 0)) {
    var em2 = lock.emotions;
    extra.innerHTML =
      '<div style="margin:8px 16px 0;background:#f5f5f5;border-radius:10px;padding:10px 14px">' +
        '<div style="font-size:11px;color:#888">当前情绪：愤怒 ' + (em2.anger||0) + ' · 怀疑 ' + (em2.suspicion||0) + ' · 连续超标 ' + (lock.consecutiveHigh||0) + ' 轮</div>' +
      '</div>';
  } else {
    extra.innerHTML = '';
  }
}


/* ══════════════════════════════════════════
   ★FC★ Force Control — 全局状态管理
   ══════════════════════════════════════════ */
var FC_STATE_KEY = 'ai_app_fc_state';

function _loadFcState() {
  try { var raw = localStorage.getItem(FC_STATE_KEY); return raw ? JSON.parse(raw) : { locks: {} }; }
  catch (e) { return { locks: {} }; }
}
function _saveFcState(fcState) {
  try { localStorage.setItem(FC_STATE_KEY, JSON.stringify(fcState)); }
  catch (e) { console.error('[FC] save failed', e); }
}
function getFcLock(charId) {
  var fcState = _loadFcState(); return fcState.locks[charId] || null;
}
function setFcLock(charId, lockData) {
  var fcState = _loadFcState();
  if (lockData) { fcState.locks[charId] = lockData; } else { delete fcState.locks[charId]; }
  _saveFcState(fcState);
}

function _findActiveFcLockedCharId() {
  var fcState = _loadFcState(); var locks = fcState.locks || {};
  var keys = Object.keys(locks);
  for (var i = 0; i < keys.length; i++) {
    if (locks[keys[i]] && locks[keys[i]].active === true) return keys[i];
  }
  return null;
}

function isForceControlActive(charId) {
  var cfg = (typeof getCharConfig === 'function') ? getCharConfig(charId) : null;
  if (cfg && cfg.forceControl) {
    var lock = getFcLock(charId);
    if (lock && lock.active) return true;
  }
  return false;
}

function initForceControlForChar(charId) {
  var existing = getFcLock(charId);
  if (existing && existing.active) return;
  setFcLock(charId, {
    active: false,
    emotions: { anger: 0, suspicion: 0, trust: 5, patience: 5 },
    consecutiveHigh: 0,
    cooldownRounds: 0,
    startTime: null,
    maxDuration: 180,        // 默认 3 分钟（秒）
    allowSwitchAccount: true,
    allowSendMessage: false,
    preScreenId: null,
    preCharId: null,
    forceUnlockedAt: null
  });
  console.log('[FC] init:', charId);
}

function clearForceControlForChar(charId) {
  setFcLock(charId, null);
  console.log('[FC] cleared:', charId);
}

/** ★FC★ 强制解除 Force Control */
function forceUnlockForceControl(explicitCharId) {
  var charId = explicitCharId || null;
  if (!charId && state.currentCharId) charId = state.currentCharId;
  if (!charId) charId = _findActiveFcLockedCharId();
  if (!charId) { showToast('无活跃强控状态'); return; }

  console.log('[FC forceUnlock] charId:', charId);

  var lock = getFcLock(charId);
  var preScreenId = (lock && lock.preScreenId) ? lock.preScreenId : 'screen-chat';
  var preCharId = (lock && lock.preCharId) ? lock.preCharId : charId;

  // 停止 FC 引擎
  fcStopEngine();

  // 更新锁状态
  var newLock = {
    active: false,
    emotions: (lock && lock.emotions) ? lock.emotions : { anger:0,suspicion:0,trust:5,patience:5 },
    consecutiveHigh: 0, cooldownRounds: 0,
    startTime: null, maxDuration: (lock && lock.maxDuration) || 180,
    allowSwitchAccount: (lock ? lock.allowSwitchAccount : true),
    allowSendMessage: (lock ? lock.allowSendMessage : false),
    preScreenId: null, preCharId: null,
    forceUnlockedAt: Date.now()
  };
  setFcLock(charId, newLock);

  // 同时关闭 Top Priority（如果 active）
  var tpLock = getTpLock(charId);
  if (tpLock && tpLock.active) {
    forceUnlockTopPriority(charId);
  }

  // 移除覆盖层
  fcHideOverlay();

  // 恢复到强控前的界面
  state.currentCharId = preCharId;
  window._fcEngineNavigating = true;
  nav(preScreenId);
  window._fcEngineNavigating = false;

  // 显示解除后情绪状态
  var em = newLock.emotions;
  var emStr = '角色情绪 — 愤怒: ' + em.anger + '/10';
  _showFcModal('已强制解除强控', emStr, '确定', function() {});

  try { renderChat(); } catch (e) {}
  try { updateForceControlSettingsUI(); } catch (e) {}
  console.log('[FC forceUnlock] DONE');
}

/** ★FC★ 自动恢复（情绪降低后调用） */
function fcAutoRestore(charId) {
  var lock = getFcLock(charId);
  if (!lock || !lock.active) return;

  console.log('[FC autoRestore] charId:', charId);

  var preScreenId = lock.preScreenId || 'screen-chat';
  var preCharId = lock.preCharId || charId;

  fcStopEngine();

  lock.active = false;
  lock.startTime = null;
  lock.consecutiveHigh = 0;
  lock.cooldownRounds = 0;
  lock.preScreenId = null;
  lock.preCharId = null;
  setFcLock(charId, lock);

  fcHideOverlay();

  state.currentCharId = preCharId;
  window._fcEngineNavigating = true;
  nav(preScreenId);
  window._fcEngineNavigating = false;

  var ch = (state.characters || []).find(function(c) { return c.id === charId; });
  var charName = ch ? ch.name : '角色';
  _showFcModal('角色已冷静', charName + ' 的情绪已恢复，账号控制权已归还。', '确定', function(){});

  try { renderChat(); } catch(e) {}
  try { updateForceControlSettingsUI(); } catch(e) {}
}

/** ★FC★ 设置界面状态更新 */
function updateForceControlSettingsUI() {
  // 配置子面板显隐
  var cfgPanel = document.getElementById('csFcConfigPanel');
  var extra = document.getElementById('csForceControlExtra');
  if (!cfgPanel || !extra) return;

  var targetCharId = state.currentCharId || _findActiveFcLockedCharId();
  if (!targetCharId) { cfgPanel.style.display = 'none'; extra.innerHTML = ''; return; }

  var cfg = (typeof getCharConfig === 'function') ? getCharConfig(targetCharId) : null;
  var fcEnabled = cfg && cfg.forceControl;

  // 配置面板
  cfgPanel.style.display = fcEnabled ? '' : 'none';
  if (fcEnabled) {
    var lock = getFcLock(targetCharId);
    var switchAcct = (lock && lock.allowSwitchAccount !== undefined) ? lock.allowSwitchAccount : true;
    var sendMsg = (lock && lock.allowSendMessage !== undefined) ? lock.allowSendMessage : false;
    var maxDur = (lock && lock.maxDuration !== undefined) ? lock.maxDuration : 180;

    var t1 = document.getElementById('csFcSwitchAcctToggle');
    if (t1) t1.classList.toggle('on', switchAcct);
    var t2 = document.getElementById('csFcSendMsgToggle');
    if (t2) t2.classList.toggle('on', sendMsg);
    var sel = document.getElementById('csFcMaxDuration');
    if (sel) sel.value = String(maxDur);
  }

  // 状态面板
  var lock = getFcLock(targetCharId);
  if (lock && lock.active) {
    var em = lock.emotions || {};
    var elapsed = lock.startTime ? Math.round((Date.now() - lock.startTime) / 1000) : 0;
    extra.innerHTML =
      '<div style="margin:8px 0 0;background:#fff3e0;border:1px solid #ffe0b2;border-radius:10px;padding:12px 14px">' +
        '<div style="font-size:13px;color:#e65100;font-weight:600;margin-bottom:4px">强控状态：进行中</div>' +
        '<div style="font-size:11px;color:#888;margin-bottom:4px">愤怒 ' + (em.anger||0) + '/10 · 怀疑 ' + (em.suspicion||0) + '/10</div>' +
        '<div style="font-size:11px;color:#999;margin-bottom:10px">已持续 ' + elapsed + '秒 · 冷却 ' + (lock.cooldownRounds||0) + '/3</div>' +
        '<button onclick="forceUnlockForceControl(\'' + targetCharId + '\')" style="width:100%;padding:10px;border:none;background:#ef5350;color:#fff;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">强制解除强控</button>' +
      '</div>';
  } else if (lock && lock.emotions && (lock.emotions.anger > 0 || lock.emotions.suspicion > 0)) {
    var em2 = lock.emotions;
    extra.innerHTML =
      '<div style="margin:8px 0 0;background:#f5f5f5;border-radius:10px;padding:10px 14px">' +
        '<div style="font-size:11px;color:#888">当前情绪：愤怒 ' + (em2.anger||0) + ' · 怀疑 ' + (em2.suspicion||0) + ' · 连续超标 ' + (lock.consecutiveHigh||0) + ' 轮</div>' +
      '</div>';
  } else {
    extra.innerHTML = '';
  }
}

/** ★FC★ FC 配置切换 */
function toggleFcOption(field, toggleId) {
  if (!state.currentCharId) return;
  var lock = getFcLock(state.currentCharId);
  if (!lock) { initForceControlForChar(state.currentCharId); lock = getFcLock(state.currentCharId); }
  if (!lock) return;
  lock[field] = !lock[field];
  setFcLock(state.currentCharId, lock);
  document.getElementById(toggleId).classList.toggle('on', lock[field]);
}

function updateFcOption(field, value) {
  if (!state.currentCharId) return;
  var lock = getFcLock(state.currentCharId);
  if (!lock) { initForceControlForChar(state.currentCharId); lock = getFcLock(state.currentCharId); }
  if (!lock) return;
  lock[field] = parseInt(value) || 0;
  setFcLock(state.currentCharId, lock);
}

/** ★FC★ FC 专用模态框 */
function _showFcModal(title, message, confirmText, onConfirm) {
  var existing = document.getElementById('fcModal');
  if (existing) existing.remove();

  window._fcModalConfirmFn = onConfirm || null;

  var overlay = document.createElement('div');
  overlay.id = 'fcModal';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:10005;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:fcFadeIn .22s ease';
  overlay.innerHTML =
    '<div style="background:rgba(255,255,255,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.5);box-shadow:0 8px 32px rgba(0,0,0,.12);width:calc(100% - 48px);max-width:320px;overflow:hidden">' +
      '<div style="padding:20px 20px 8px;font-size:17px;font-weight:700;text-align:center;color:#111">' + title + '</div>' +
      '<div style="padding:8px 20px 20px;font-size:14px;color:#3a3a3c;line-height:1.6;text-align:center;white-space:pre-line">' + message + '</div>' +
      '<div style="display:flex;border-top:1px solid rgba(0,0,0,.05)">' +
        '<button onclick="if(window._fcModalConfirmFn)window._fcModalConfirmFn();window._fcModalConfirmFn=null;document.getElementById(\'fcModal\')?.remove()" style="flex:1;padding:14px;border:none;background:none;font-size:16px;color:#111;font-weight:600;cursor:pointer;font-family:inherit">' +
          (confirmText || '确定') +
        '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
}


/* ══════════════════════════════════════════
   原有功能（保持不变）
   ══════════════════════════════════════════ */

function csNumStep(inputId, delta) {
  var el = document.getElementById(inputId); if (!el) return;
  var val = parseInt(el.value) || 1;
  var min = parseInt(el.min) || 1;
  var max = parseInt(el.max) || 10;
  val = Math.min(max, Math.max(min, val + delta));
  el.value = val;
  var fieldMap = { csReplyMin: 'replyMin', csReplyMax: 'replyMax' };
  var field = fieldMap[inputId];
  if (field) updateCsSetting(field, val);
}

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
  setTimeout(function () {
    updateTopPrioritySettingsUI();
    updateForceControlSettingsUI(); // ★FC★
  }, 50);
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

  // ★FC★ Force Control 开关
  if (field === 'forceControl') {
    if (cfg.forceControl) {
      initForceControlForChar(state.currentCharId);
      showToast('Force Control 已开启');
    } else {
      // 如果正在强控中，先解除
      var fcLock = getFcLock(state.currentCharId);
      if (fcLock && fcLock.active) {
        forceUnlockForceControl(state.currentCharId);
      }
      clearForceControlForChar(state.currentCharId);
      showToast('Force Control 已关闭');
    }
    setTimeout(function () { updateForceControlSettingsUI(); }, 50);
  }

  if (field === 'topPriority') {
    if (cfg.topPriority) {
      initTopPriorityForChar(state.currentCharId);
      showToast('Top Priority 已开启');
    } else {
      clearTopPriorityForChar(state.currentCharId);
      showToast('Top Priority 已关闭');
    }
    setTimeout(function () { updateTopPrioritySettingsUI(); }, 50);
  }
}

function updateCsSetting(field, value) {
  if (!state.currentCharId) return;
  var cfg = getCharConfig(state.currentCharId);
  var stringFields = ['chatLang'];
  if (stringFields.indexOf(field) >= 0) { cfg[field] = value; }
  else { cfg[field] = parseInt(value) || 1; }
  if (field === 'replyMin' && cfg.replyMin > cfg.replyMax) {
    cfg.replyMax = cfg.replyMin; document.getElementById('csReplyMax').value = cfg.replyMax;
  }
  if (field === 'replyMax' && cfg.replyMax < cfg.replyMin) {
    cfg.replyMin = cfg.replyMax; document.getElementById('csReplyMin').value = cfg.replyMin;
  }
  saveCharConfig();
  if (field === 'autoMessageInterval' && cfg.autoMessage) startAutoMessage(state.currentCharId);
  if (field === 'momentsInterval' && cfg.autoMoments) startAutoMoments(state.currentCharId);
}

function clearChatAndMemories() {
  if (!state.currentCharId) return;
  var charId = state.currentCharId;
  var ch = state.characters ? state.characters.find(function (c) { return c.id === charId; }) : null;
  var charName = ch ? (ch.name || 'this character') : 'this character';
  var confirmed = confirm('Clear all data for "' + charName + '"?\n\nThis will delete:\n- All chat messages\n- All memory entries\n- All bookmarked messages\n\nThis action cannot be undone!');
  if (!confirmed) return;
  if (state.chats) state.chats[charId] = [];
  if (state.memories && Array.isArray(state.memories)) {
    state.memories = state.memories.filter(function (m) { return m.charId !== charId; });
  }
  if (state.bookmarks && Array.isArray(state.bookmarks)) {
    state.bookmarks = state.bookmarks.filter(function (b) { return b.charId !== charId; });
  }
  var cfg = getCharConfig(charId);
  cfg.lastSummaryMsgCount = 0; cfg.lastConsolidateCount = 0;
  saveState();
  try { if (typeof renderChat === 'function') renderChat(); } catch (e) {}
  try { if (typeof renderMemoryList === 'function') renderMemoryList(); } catch (e) {}
  try { if (typeof renderCfgCharMemories === 'function') renderCfgCharMemories(); } catch (e) {}
  showToast(T('deleted'));
}

function startAutoMessage(charId) {
  stopAutoMessage(charId);
  var cfg = getCharConfig(charId); if (!cfg.autoMessage) return;
  var intervalMs = (cfg.autoMessageInterval || 10) * 60 * 1000;
  _autoMsgTimers[charId] = setInterval(function () {
    if (state.currentCharId !== charId) return;
    if (typeof triggerResponse === 'function') triggerResponse();
  }, intervalMs);
}
function stopAutoMessage(charId) {
  if (_autoMsgTimers[charId]) { clearInterval(_autoMsgTimers[charId]); delete _autoMsgTimers[charId]; }
}
function restartAutoMessageTimer(charId) {
  var cfg = getCharConfig(charId);
  cfg.autoMessage ? startAutoMessage(charId) : stopAutoMessage(charId);
}
function startAutoMoments(charId) {
  stopAutoMoments(charId);
  var cfg = getCharConfig(charId); if (!cfg.autoMoments) return;
  var intervalMs = (cfg.momentsInterval || 6) * 60 * 60 * 1000;
  _autoMomentsTimers[charId] = setInterval(function () {
    if (typeof generateAndPostCharMoment === 'function') generateAndPostCharMoment(charId);
  }, intervalMs);
}
function stopAutoMoments(charId) {
  if (_autoMomentsTimers[charId]) { clearInterval(_autoMomentsTimers[charId]); delete _autoMomentsTimers[charId]; }
}
function forceSendMoment() {
  if (!state.currentCharId) return;
  if (_forceMomentBusy) { showToast(T('csGenerating') || 'Generating...'); return; }
  _forceMomentBusy = true;
  if (typeof generateAndPostCharMoment === 'function') {
    var p = generateAndPostCharMoment(state.currentCharId);
    if (p && typeof p.finally === 'function') { p.finally(function () { _forceMomentBusy = false; }); }
    else { _forceMomentBusy = false; }
  } else { showToast(T('error')); _forceMomentBusy = false; }
  var cfg = getCharConfig(state.currentCharId);
  if (cfg.autoMoments) startAutoMoments(state.currentCharId);
}
function restartAllAutoMoments() {
  (state.characters || []).forEach(function (ch) {
    var cfg = getCharConfig(ch.id);
    if (cfg.autoMoments) startAutoMoments(ch.id);
  });
}

// ═══════ 全局导出 ═══════
window.openChatSettings = openChatSettings;
window.toggleCsToggle = toggleCsToggle;
window.updateCsSetting = updateCsSetting;
window.clearChatAndMemories = clearChatAndMemories;
window.startAutoMessage = startAutoMessage;
window.stopAutoMessage = stopAutoMessage;
window.restartAutoMessageTimer = restartAutoMessageTimer;
window.startAutoMoments = startAutoMoments;
window.stopAutoMoments = stopAutoMoments;
window.forceSendMoment = forceSendMoment;
window.restartAllAutoMoments = restartAllAutoMoments;
window.csNumStep = csNumStep;

// TP exports
window.getTpLock = getTpLock;
window.setTpLock = setTpLock;
window.isTopPriorityActive = isTopPriorityActive;
window.isCharTpLocked = isCharTpLocked;
window.initTopPriorityForChar = initTopPriorityForChar;
window.clearTopPriorityForChar = clearTopPriorityForChar;
window.forceUnlockTopPriority = forceUnlockTopPriority;
window.updateTopPrioritySettingsUI = updateTopPrioritySettingsUI;
window._findActiveLockedCharId = _findActiveLockedCharId;

// ★FC★ exports
window.getFcLock = getFcLock;
window.setFcLock = setFcLock;
window.isForceControlActive = isForceControlActive;
window.initForceControlForChar = initForceControlForChar;
window.clearForceControlForChar = clearForceControlForChar;
window.forceUnlockForceControl = forceUnlockForceControl;
window.fcAutoRestore = fcAutoRestore;
window.updateForceControlSettingsUI = updateForceControlSettingsUI;
window.toggleFcOption = toggleFcOption;
window.updateFcOption = updateFcOption;
window._findActiveFcLockedCharId = _findActiveFcLockedCharId;
