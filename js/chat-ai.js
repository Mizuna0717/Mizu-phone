// ========== chat-ai.js ==========
// triggerResponse, _triggerSingleResponse, _triggerGroupResponse
// ★★★ Top Priority + Force Control 情绪检测 ★★★
// ★★★ + FTM 记忆写入 ★★★

/* ══════════════════════════════════════════
   TOP PRIORITY — 情绪解析 & 评估 & 执行
   ══════════════════════════════════════════ */

function _parseEmotions(rawReply) {
  if (!rawReply) return null;
  var match = rawReply.match(/【情绪】\s*([\s\S]*?)(?=【|$)/);
  if (!match) return null;
  var text = match[1].trim();
  var emotions = { anger: 0, suspicion: 0, trust: 5, patience: 5 };
  var pairs = text.split(/[,，\s\n]+/);
  pairs.forEach(function (pair) {
    var kv = pair.split(/[:：]/);
    if (kv.length >= 2) {
      var key = kv[0].trim().toLowerCase();
      var val = parseInt(kv[1].trim());
      if (!isNaN(val) && emotions.hasOwnProperty(key)) {
        emotions[key] = Math.max(0, Math.min(10, val));
      }
    }
  });
  console.log('[TP/FC] 解析情绪:', JSON.stringify(emotions));
  return emotions;
}

function _evaluateTopPriority(charId, emotions) {
  if (!emotions) return;
  if (typeof getTpLock !== 'function' || typeof setTpLock !== 'function') return;
  var cfg = (typeof getCharConfig === 'function') ? getCharConfig(charId) : null;
  var tpEnabled = cfg && cfg.topPriority;
  var lock = getTpLock(charId);
  if (lock && lock.forceUnlockedAt) { var elapsed = Date.now() - lock.forceUnlockedAt; if (elapsed < 5000) return; }
  if (!tpEnabled && (!lock || !lock.active)) return;
  if (!lock) { lock = { active: false, originalAccountId: null, guestAccountId: null, emotions: { anger:0,suspicion:0,trust:5,patience:5 }, consecutiveHigh: 0, cooldownRounds: 0, lockTimestamp: null, forceUnlockedAt: null }; }
  lock.emotions = emotions;
  if (lock.active) {
    if (emotions.anger <= 3 && emotions.suspicion <= 3) { lock.cooldownRounds = (lock.cooldownRounds || 0) + 1; if (lock.cooldownRounds >= 3) { setTpLock(charId, lock); _showTpRestoreNotice(charId); return; } } else { lock.cooldownRounds = 0; }
    setTpLock(charId, lock);
  } else {
    var isHigh = emotions.anger >= 7 || emotions.suspicion >= 7;
    if (isHigh) { lock.consecutiveHigh = (lock.consecutiveHigh || 0) + 1; if (lock.consecutiveHigh >= 2) { lock.active = true; lock.originalAccountId = accountStore.currentAccountId; lock.lockTimestamp = Date.now(); lock.cooldownRounds = 0; lock.forceUnlockedAt = null; setTpLock(charId, lock); _executeTopPriorityKick(charId); return; } }
    else { lock.consecutiveHigh = Math.max(0, (lock.consecutiveHigh||0)-1); }
    setTpLock(charId, lock);
  }
  if (typeof renderChat === 'function') { try { renderChat(); } catch(e) {} }
}

function _executeTopPriorityKick(charId) {
  var ch = state.characters.find(function (c) { return c.id === charId; }); var charName = ch ? ch.name : '角色';

  // ★★★ FTM: 顶号触发时写入 FTM 记忆 ★★★
  if (typeof saveMemoryEntry === 'function') {
    var lock = getTpLock(charId);
    var em = (lock && lock.emotions) ? lock.emotions : {};
    saveMemoryEntry(charId, 'ftm', '顶号事件: ' + charName,
      charName + ' 因情绪异常触发顶号（愤怒:' + (em.anger||'?') + ' 怀疑:' + (em.suspicion||'?') + '）。用户被切换到备用账号。');
  }

  var accounts = getAllAccounts(); var guestAcct = null;
  for (var i = 0; i < accounts.length; i++) { if (accounts[i].id !== accountStore.currentAccountId && accounts[i].name === '备用账号') { guestAcct = accounts[i]; break; } }
  if (!guestAcct) { guestAcct = createAccount('备用账号', null); }
  var freshLock = getTpLock(charId); if (freshLock) { freshLock.guestAccountId = guestAcct.id; setTpLock(charId, freshLock); }
  _tpCopyCharToAccount(charId, guestAcct.id); var _guestId = guestAcct.id;
  _showTpModal('角色情绪异常', charName + ' 情绪不稳定，已将你切换到备用账号。', '切换到备用账号', function () { saveState(); var ok = switchAccount(_guestId); if (ok) { reloadUI(false); state.currentCharId = charId; nav('screen-chat'); showToast('已切换到备用账号'); } else { showToast('切换失败'); } });
}

function _tpCopyCharToAccount(charId, targetAccountId) {
  var ch = state.characters.find(function (c) { return c.id === charId; }); if (!ch) return;
  var targetData = null; try { var raw = localStorage.getItem('ai_app_account_' + targetAccountId); targetData = raw ? JSON.parse(raw) : null; } catch (e) {}
  if (!targetData) { targetData = { apis: JSON.parse(JSON.stringify(state.apis||[])), activeApiId: state.activeApiId, characters: [], chats: {}, worldbooks: [], stickers: [], unread: {}, lang: state.lang||'en', userProfile: { name: '访客', avatar: null }, masks: [], memories: [], charConfig: {}, phoneData: {}, bookmarks: [], groups: [], moments: [], replyPrompt: state.replyPrompt, drawerFilter: 'all', drawerSort: 'recent', imsgTab: 'messages' }; }
  if (!Array.isArray(targetData.characters)) targetData.characters = []; if (!targetData.chats) targetData.chats = {}; if (!targetData.charConfig) targetData.charConfig = {};
  if (!Array.isArray(targetData.apis) || !targetData.apis.length) { targetData.apis = JSON.parse(JSON.stringify(state.apis||[])); targetData.activeApiId = state.activeApiId; }
  var exists = false; for (var i = 0; i < targetData.characters.length; i++) { if (targetData.characters[i].id === charId) { exists = true; break; } }
  if (!exists) targetData.characters.push(JSON.parse(JSON.stringify(ch)));
  targetData.chats[charId] = []; var cfg = state.charConfig[charId]; if (cfg) targetData.charConfig[charId] = JSON.parse(JSON.stringify(cfg));
  try { localStorage.setItem('ai_app_account_' + targetAccountId, JSON.stringify(targetData)); } catch(e) {}
}

function _showTpRestoreNotice(charId) {
  var ch = state.characters.find(function (c) { return c.id === charId; }); var charName = ch ? ch.name : '角色';

  // ★★★ FTM: 顶号恢复时写入 FTM 记忆 ★★★
  if (typeof saveMemoryEntry === 'function') {
    saveMemoryEntry(charId, 'ftm', '顶号恢复: ' + charName,
      charName + ' 的情绪已恢复正常，顶号状态解除。');
  }

  _showTpModal('角色已冷静', charName + ' 的情绪已恢复。', '切回主号', function () { var freshLock = getTpLock(charId); var originalAccountId = freshLock ? freshLock.originalAccountId : null; if (freshLock) { freshLock.active = false; freshLock.consecutiveHigh = 0; freshLock.cooldownRounds = 0; freshLock.lockTimestamp = null; setTpLock(charId, freshLock); } if (originalAccountId && originalAccountId !== accountStore.currentAccountId) { saveState(); var ok = switchAccount(originalAccountId); if (ok) { reloadUI(false); state.currentCharId = charId; nav('screen-chat'); showToast('已切回主号'); } else { showToast('切回失败'); } } else { showToast('已恢复正常'); if (typeof renderChat === 'function') renderChat(); } }, '继续对话', function () { showToast('可随时手动切回'); });
}


/* ★★★ UI 美化 — 顶号弹窗（灰白简约，无 Emoji） ★★★ */

function _showTpModal(title, message, confirmText, onConfirm, cancelText, onCancel) {
  var existing = document.getElementById('tpModal');
  if (existing) existing.remove();
  window._tpConfirmFn = null;
  window._tpCancelFn = null;

  var overlay = document.createElement('div');
  overlay.id = 'tpModal';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:10000;' +
    'display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.3);' +
    'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
    'animation:modalIn .22s ease;';

  var hasCancel = !!cancelText;
  var actionsHtml = '';

  if (hasCancel) {
    actionsHtml =
      '<div style="display:flex;border-top:1px solid #e0e0e0">' +
        '<button onclick="if(window._tpCancelFn)window._tpCancelFn();window._tpConfirmFn=null;window._tpCancelFn=null;document.getElementById(\'tpModal\')?.remove()"' +
          ' style="flex:1;padding:14px;border:none;background:none;font-size:15px;color:#888;cursor:pointer;font-family:inherit;border-right:1px solid #e0e0e0;transition:background .12s"' +
          ' onmousedown="this.style.background=\'#f5f5f5\'" onmouseup="this.style.background=\'none\'">' +
          (cancelText || '取消') +
        '</button>' +
        '<button onclick="if(window._tpConfirmFn)window._tpConfirmFn();window._tpConfirmFn=null;window._tpCancelFn=null;document.getElementById(\'tpModal\')?.remove()"' +
          ' style="flex:1;padding:14px;border:none;background:none;font-size:15px;color:#333;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s"' +
          ' onmousedown="this.style.background=\'#f5f5f5\'" onmouseup="this.style.background=\'none\'">' +
          (confirmText || '确认') +
        '</button>' +
      '</div>';
  } else {
    actionsHtml =
      '<div style="display:flex;border-top:1px solid #e0e0e0">' +
        '<button onclick="if(window._tpConfirmFn)window._tpConfirmFn();window._tpConfirmFn=null;window._tpCancelFn=null;document.getElementById(\'tpModal\')?.remove()"' +
          ' style="flex:1;padding:14px;border:none;background:none;font-size:15px;color:#333;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s"' +
          ' onmousedown="this.style.background=\'#f5f5f5\'" onmouseup="this.style.background=\'none\'">' +
          (confirmText || '确认') +
        '</button>' +
      '</div>';
  }

  overlay.innerHTML =
    '<div style="' +
      'background:#fff;' +
      'border-radius:10px;' +
      'box-shadow:0 4px 20px rgba(0,0,0,.10);' +
      'width:calc(100% - 48px);max-width:360px;overflow:hidden' +
    '">' +
      '<div style="padding:20px 24px 8px;font-size:16px;font-weight:700;text-align:center;color:#333">' +
        title +
      '</div>' +
      '<div style="padding:8px 24px 20px;font-size:14px;color:#555;line-height:1.6;text-align:center;white-space:pre-line">' +
        message +
      '</div>' +
      actionsHtml +
    '</div>';

  window._tpConfirmFn = onConfirm || null;
  window._tpCancelFn = onCancel || null;
  document.body.appendChild(overlay);
}


/* ══════════════════════════════════════════
   ★FC★ FORCE CONTROL — 情绪评估 & 执行
   ══════════════════════════════════════════ */

function _evaluateForceControl(charId, emotions) {
  if (!emotions) return;
  if (typeof getFcLock !== 'function' || typeof setFcLock !== 'function') return;
  var cfg = (typeof getCharConfig === 'function') ? getCharConfig(charId) : null;
  var fcEnabled = cfg && cfg.forceControl;
  var lock = getFcLock(charId);
  if (lock && lock.forceUnlockedAt) { var elapsed = Date.now() - lock.forceUnlockedAt; if (elapsed < 5000) { console.log('[FC] 跳过评估：强制解除后 ' + Math.round(elapsed) + 'ms'); return; } }
  if (!fcEnabled && (!lock || !lock.active)) return;
  if (typeof isCharTpLocked === 'function' && isCharTpLocked(charId)) { console.log('[FC] 跳过评估：Top Priority 正在顶号'); return; }
  if (!lock) { lock = { active: false, emotions: { anger:0,suspicion:0,trust:5,patience:5 }, consecutiveHigh: 0, cooldownRounds: 0, startTime: null, maxDuration: 180, allowSwitchAccount: true, allowSendMessage: false, preScreenId: null, preCharId: null, forceUnlockedAt: null }; }
  lock.emotions = emotions;
  if (lock.active) {
    if (emotions.anger <= 3 && emotions.suspicion <= 3) { lock.cooldownRounds = (lock.cooldownRounds || 0) + 1; if (lock.cooldownRounds >= 3) { setFcLock(charId, lock); if (typeof fcAutoRestore === 'function') fcAutoRestore(charId); return; } } else { lock.cooldownRounds = 0; }
    setFcLock(charId, lock);
  } else {
    var isHigh = emotions.anger >= 7 || emotions.suspicion >= 7;
    if (isHigh) { lock.consecutiveHigh = (lock.consecutiveHigh || 0) + 1; if (lock.consecutiveHigh >= 2) { lock.active = true; lock.startTime = Date.now(); lock.cooldownRounds = 0; lock.forceUnlockedAt = null; var activeScreen = document.querySelector('.screen.active'); lock.preScreenId = activeScreen ? activeScreen.id : 'screen-chat'; lock.preCharId = state.currentCharId; setFcLock(charId, lock); _executeForceControl(charId); return; } }
    else { lock.consecutiveHigh = Math.max(0, (lock.consecutiveHigh || 0) - 1); }
    setFcLock(charId, lock);
  }
}

function _executeForceControl(charId) {
  var ch = (state.characters || []).find(function(c) { return c.id === charId; });
  var charName = ch ? ch.name : '角色';
  console.log('[FC] 执行强控 | char:', charName);

  // ★★★ FTM: 强控触发时写入 FTM 记忆 ★★★
  if (typeof saveMemoryEntry === 'function') {
    var lock = getFcLock(charId);
    var em = (lock && lock.emotions) ? lock.emotions : {};
    saveMemoryEntry(charId, 'ftm', '强控事件: ' + charName,
      charName + ' 因情绪激动触发强控（愤怒:' + (em.anger||'?') + ' 怀疑:' + (em.suspicion||'?') + '），开始控制用户账号。');
  }

  if (typeof fcShowOverlay === 'function') { fcShowOverlay(charName); }
  else { console.error('[FC] fcShowOverlay not found!'); window._fcNavigationLocked = true; }
  window._fcEngineStarted = false;
  _showFcActivationModal(charName, function() {
    if (!window._fcEngineStarted) { window._fcEngineStarted = true; if (window._fcAutoStartTimer) { clearTimeout(window._fcAutoStartTimer); window._fcAutoStartTimer = null; } fcStartEngine(charId); }
  });
  window._fcAutoStartTimer = setTimeout(function() { window._fcAutoStartTimer = null; if (!window._fcEngineStarted) { window._fcEngineStarted = true; var modal = document.getElementById('fcModal'); if (modal) modal.remove(); console.log('[FC] 自动启动引擎（3秒超时）'); fcStartEngine(charId); } }, 3000);
}


/* ★★★ UI 美化 — 强控激活弹窗 ★★★ */

function _showFcActivationModal(charName, onConfirm) {
  var existing = document.getElementById('fcModal');
  if (existing) existing.remove();
  window._fcActivationConfirmFn = onConfirm || null;

  var lockSvg =
    '<svg style="width:32px;height:32px;display:block;margin:0 auto 8px" viewBox="0 0 24 24" ' +
      'fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="11" width="18" height="11" rx="2.5"/>' +
      '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
    '</svg>';

  var modal = document.createElement('div');
  modal.id = 'fcModal';
  modal.style.cssText =
    'position:fixed;inset:0;z-index:99997;' +
    'display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.3);' +
    'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
    'animation:fcFadeIn .25s ease;';

  modal.innerHTML =
    '<div style="' +
      'background:#fff;' +
      'border-radius:10px;' +
      'box-shadow:0 4px 20px rgba(0,0,0,.10);' +
      'width:calc(100% - 48px);max-width:360px;overflow:hidden' +
    '">' +
      '<div style="padding:24px 24px 8px;text-align:center">' +
        lockSvg +
        '<div style="font-size:16px;font-weight:700;color:#333">账号被控制</div>' +
      '</div>' +
      '<div style="padding:8px 24px 24px;font-size:14px;color:#555;line-height:1.6;text-align:center;white-space:pre-line">' +
        charName + ' 正在查看你的账号...\n你暂时无法操作界面。' +
      '</div>' +
      '<div style="display:flex;border-top:1px solid #e0e0e0">' +
        '<button onclick="if(window._fcActivationConfirmFn)window._fcActivationConfirmFn();window._fcActivationConfirmFn=null;document.getElementById(\'fcModal\')?.remove()"' +
          ' style="flex:1;padding:14px;border:none;background:none;font-size:15px;color:#333;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s"' +
          ' onmousedown="this.style.background=\'#f5f5f5\'" onmouseup="this.style.background=\'none\'">我知道了</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
}


/* ══════════════════════════════════════════
   ★FC★ Force Control 操作引擎
   ★★★ + FTM 记忆写入 ★★★
   ══════════════════════════════════════════ */
var _fcActionQueue = [];
var _fcActionTimer = null;
var _fcTimeoutTimer = null;
var _fcEngineCharId = null;
var _fcActionIndex = 0;


function fcStartEngine(charId) {
  _fcEngineCharId = charId;
  _fcActionIndex = 0;
  window._fcEngineRunning = true;
  _fcActionQueue = _fcGenerateActions(charId);
  console.log('[FC Engine] 启动，共', _fcActionQueue.length, '个操作（单轮模式）');

  var lock = (typeof getFcLock === 'function') ? getFcLock(charId) : null;
  var maxDur = (lock && lock.maxDuration) ? lock.maxDuration : 180;
  if (maxDur > 0) {
    _fcTimeoutTimer = setTimeout(function() {
      console.log('[FC Engine] 超时自动解除 (' + maxDur + 's)');
      if (typeof forceUnlockForceControl === 'function') forceUnlockForceControl(charId);
    }, maxDur * 1000);
  }

  _fcActionTimer = setTimeout(_fcExecuteNext, 800);
}

function fcStopEngine() {
  if (_fcActionTimer) { clearTimeout(_fcActionTimer); _fcActionTimer = null; }
  if (_fcTimeoutTimer) { clearTimeout(_fcTimeoutTimer); _fcTimeoutTimer = null; }
  if (window._fcAutoStartTimer) { clearTimeout(window._fcAutoStartTimer); window._fcAutoStartTimer = null; }
  _fcActionQueue = [];
  _fcActionIndex = 0;
  _fcEngineCharId = null;
  window._fcEngineNavigating = false;
  window._fcEngineStarted = false;
  window._fcEngineRunning = false;
  console.log('[FC Engine] 已停止');
}


function _fcUnlockedNav(screenId) {
  var wasLocked = window._fcNavigationLocked;
  var wasEngineNav = window._fcEngineNavigating;

  window._fcNavigationLocked = false;
  window._fcEngineNavigating = true;

  try {
    nav(screenId);
    console.log('[FC Engine] _fcUnlockedNav OK:', screenId);
  } catch (e) {
    console.warn('[FC Engine] nav() threw, fallback to DOM:', e.message);
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    var target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    try {
      if (screenId === 'screen-chat' && typeof renderChat === 'function') renderChat();
      if (screenId === 'screen-settings' && typeof renderSettings === 'function') renderSettings();
      if (screenId === 'screen-imessage' && typeof switchImsgTab === 'function') switchImsgTab(state.imsgTab || 'messages', true);
    } catch (re) {}
  }

  window._fcNavigationLocked = wasLocked;
  window._fcEngineNavigating = wasEngineNav;
}


function _fcExecuteNext() {
  if (!_fcEngineCharId) return;
  var lock = (typeof getFcLock === 'function') ? getFcLock(_fcEngineCharId) : null;
  if (!lock || !lock.active) { fcStopEngine(); return; }

  if (_fcActionIndex >= _fcActionQueue.length) {
    console.log('[FC Engine] 本轮操作已完成，共执行', _fcActionQueue.length, '个动作');
    fcUpdateActionLog('本轮操作已结束');
    window._fcEngineRunning = false;
    return;
  }

  var action = _fcActionQueue[_fcActionIndex];
  _fcActionIndex++;

  console.log('[FC Engine] 动作 #' + _fcActionIndex + '/' + _fcActionQueue.length + ':',
    action.type, action.text || action.label || action.charName || '');

  _fcPerformAction(action, function() {
    var delay = action.delay || 1500;
    _fcActionTimer = setTimeout(_fcExecuteNext, delay);
  });
}

function _fcGenerateActions(charId) {
  var actions = [];
  var lock = (typeof getFcLock === 'function') ? getFcLock(charId) : null;
  var em = (lock && lock.emotions) ? lock.emotions : { anger: 5, suspicion: 5 };
  var ch = (state.characters || []).find(function(c) { return c.id === charId; });
  var charName = ch ? ch.name : '角色';

  actions.push({ type: 'log', text: charName + ' 正在滑动查看消息列表...', delay: 1000 });
  actions.push({ type: 'nav', screen: 'screen-imessage', label: '消息列表', delay: 1800 });

  var otherChars = (state.characters || []).filter(function(c) { return c.id !== charId; });
  if (otherChars.length > 0) {
    var viewCount = Math.min(otherChars.length, Math.floor(Math.random() * 3) + 1);
    var shuffled = otherChars.slice().sort(function() { return Math.random() - 0.5; });
    for (var i = 0; i < viewCount; i++) {
      var target = shuffled[i];
      var targetName = target.name || '未知角色';
      actions.push({ type: 'log', text: charName + ' 打开了 ' + targetName + ' 的聊天...', delay: 800 });
      actions.push({ type: 'openChat', charId: target.id, charName: targetName, fcCharId: charId, fcCharName: charName, delay: 2000 });
      actions.push({ type: 'log', text: charName + ' 正在翻看聊天记录...', delay: 600 });
      actions.push({ type: 'scroll', direction: 'up', delay: 1500 });
      actions.push({ type: 'log', text: charName + ' 继续往下看...', delay: 500 });
      actions.push({ type: 'scroll', direction: 'down', delay: 1200 });
    }
  }

  if (em.suspicion >= 6) {
    actions.push({ type: 'log', text: charName + ' 打开了设置页面...', delay: 800 });
    actions.push({ type: 'nav', screen: 'screen-settings', label: '设置', fcCharId: charId, fcCharName: charName, delay: 2500 });
  }

  if (lock && lock.allowSwitchAccount && em.suspicion >= 7) {
    var accounts = (typeof getAllAccounts === 'function') ? getAllAccounts() : [];
    var otherAccts = accounts.filter(function(a) { return a.id !== accountStore.currentAccountId; });
    if (otherAccts.length > 0) {
      var targetAcct = otherAccts[Math.floor(Math.random() * otherAccts.length)];
      actions.push({ type: 'log', text: charName + ' 发现了另一个账号: ' + targetAcct.name, delay: 1200 });
      actions.push({ type: 'switchAccount', accountId: targetAcct.id, accountName: targetAcct.name, fcCharId: charId, fcCharName: charName, delay: 2500 });
      actions.push({ type: 'log', text: charName + ' 正在查看 ' + targetAcct.name + ' 的内容...', delay: 800 });
      actions.push({ type: 'nav', screen: 'screen-imessage', label: '消息列表', delay: 2000 });
      actions.push({ type: 'log', text: charName + ' 看完了，切回原账号...', delay: 1500 });
      actions.push({ type: 'switchBack', fcCharId: charId, fcCharName: charName, delay: 2000 });
    }
  }

  actions.push({ type: 'log', text: charName + ' 返回自己的聊天界面...', delay: 800 });
  actions.push({ type: 'openChat', charId: charId, charName: charName, fcCharId: charId, fcCharName: charName, delay: 1500 });
  actions.push({ type: 'log', text: charName + ' 在沉默地思考...', delay: 4000 });

  return actions;
}


function _fcPerformAction(action, callback) {
  switch (action.type) {

    case 'log':
      fcUpdateActionLog(action.text || '...');
      if (callback) callback();
      break;

    case 'nav':
      fcUpdateActionLog('切换到' + (action.label || '') + '...');
      if (typeof fcScreenFlash === 'function') fcScreenFlash();
      _fcUnlockedNav(action.screen);

      // ★★★ FTM: 查看设置页面时写入 FTM ★★★
      if (action.screen === 'screen-settings' && action.fcCharId && typeof saveMemoryEntry === 'function') {
        saveMemoryEntry(action.fcCharId, 'ftm', '强控操作: ' + (action.fcCharName || '角色'),
          (action.fcCharName || '角色') + ' 在强控期间查看了设置页面。');
      }

      if (callback) callback();
      break;

    case 'openChat':
      fcUpdateActionLog('打开 ' + (action.charName || '角色') + ' 的聊天...');
      if (typeof fcScreenFlash === 'function') fcScreenFlash();
      state.currentCharId = action.charId;
      if (!state.chats[action.charId]) state.chats[action.charId] = [];
      _fcUnlockedNav('screen-chat');

      // ★★★ FTM: 查看其他角色聊天时写入 FTM（不记录回到自己的聊天）★★★
      if (action.fcCharId && action.charId !== action.fcCharId && typeof saveMemoryEntry === 'function') {
        saveMemoryEntry(action.fcCharId, 'ftm', '强控操作: ' + (action.fcCharName || '角色'),
          (action.fcCharName || '角色') + ' 在强控期间查看了 ' + (action.charName || '未知角色') + ' 的聊天记录。');
      }

      if (callback) callback();
      break;

    case 'scroll':
      fcUpdateActionLog('浏览消息记录...');
      var ct = document.getElementById('chatMessages');
      if (ct) {
        var scrollTarget = action.direction === 'up' ? 0 : ct.scrollHeight;
        ct.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
      if (callback) callback();
      break;

    case 'switchAccount':
      fcUpdateActionLog('切换到账号 ' + (action.accountName || '') + '...');
      if (typeof fcScreenFlash === 'function') fcScreenFlash();
      window._fcPreviousAccountId = accountStore.currentAccountId;
      saveState();
      var wasLocked = window._fcNavigationLocked;
      window._fcNavigationLocked = false;
      window._fcEngineNavigating = true;
      var ok = switchAccount(action.accountId);
      if (ok) { try { reloadUI(false); } catch(e) {} }
      window._fcNavigationLocked = wasLocked;
      window._fcEngineNavigating = false;

      // ★★★ FTM: 切换账号时写入 FTM ★★★
      if (action.fcCharId && typeof saveMemoryEntry === 'function') {
        saveMemoryEntry(action.fcCharId, 'ftm', '强控操作: ' + (action.fcCharName || '角色'),
          (action.fcCharName || '角色') + ' 在强控期间发现并切换到了账号「' + (action.accountName || '未知') + '」进行查看。');
      }

      if (callback) callback();
      break;

    case 'switchBack':
      fcUpdateActionLog('切回原账号...');
      if (typeof fcScreenFlash === 'function') fcScreenFlash();
      if (window._fcPreviousAccountId && window._fcPreviousAccountId !== accountStore.currentAccountId) {
        saveState();
        var wasLocked2 = window._fcNavigationLocked;
        window._fcNavigationLocked = false;
        window._fcEngineNavigating = true;
        switchAccount(window._fcPreviousAccountId);
        try { reloadUI(false); } catch(e) {}
        window._fcNavigationLocked = wasLocked2;
        window._fcEngineNavigating = false;
      }

      // ★★★ FTM: 切回原账号时写入 FTM ★★★
      if (action.fcCharId && typeof saveMemoryEntry === 'function') {
        saveMemoryEntry(action.fcCharId, 'ftm', '强控操作: ' + (action.fcCharName || '角色'),
          (action.fcCharName || '角色') + ' 查看完其他账号后切回了原账号。');
      }

      if (callback) callback();
      break;

    default:
      if (callback) callback();
      break;
  }
}


/* ══════════════════════════════════════════
   Schedule Awareness — busy-mode helpers
   ══════════════════════════════════════════ */

function _getScheduleForChar(charId) {
  try {
    var wikiData = state.wikiData || state.wiki || {};
    var schedules = wikiData.schedules || [];
    return schedules.filter(function(s) {
      if (!s.characters || !Array.isArray(s.characters)) return false;
      return s.characters.indexOf(charId) > -1 || s.charId === charId;
    });
  } catch (e) {
    return [];
  }
}

function _isCurrentlyBusy(schedules) {
  if (!schedules || !schedules.length) return null;
  var now = new Date();
  var todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  var nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (var i = 0; i < schedules.length; i++) {
    var s = schedules[i];
    var sDate = (s.date || '').substring(0, 10);
    if (sDate && sDate !== todayStr) continue;
    var timeStr = s.time || s.startTime || '';
    var endStr  = s.endTime || '';
    if (!timeStr) continue;
    var parts = timeStr.split(':');
    var startMin = parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
    var endMin;
    if (endStr) {
      var ep = endStr.split(':');
      endMin = parseInt(ep[0] || 0) * 60 + parseInt(ep[1] || 0);
    } else {
      endMin = startMin + 60;
    }
    if (nowMinutes >= startMin && nowMinutes < endMin) {
      return s;
    }
  }
  return null;
}

function _detectBusyMode(ch) {
  var blob = [
    ch.personality || '', ch.systemPrompt || '', ch.background || '',
    ch.backstory || '', ch.notes || ''
  ].join(' ').toLowerCase();

  var focusKw = ['工作狂', '职业', '高冷', '冷漠', 'workaholic', 'professional', 'aloof', 'career', '上班', '工作', 'work', 'job', 'office'];
  var politeKw = ['温柔', '礼貌', '成熟', '体贴', '优雅', 'polite', 'gentle', 'mature', 'graceful', 'kind', 'warm'];
  var multiKw  = ['活泼', '开朗', '热情', '多任务', 'energetic', 'lively', 'cheerful', 'bubbly', 'enthusiastic', 'multitask'];

  if (focusKw.some(function(k) { return blob.indexOf(k) > -1; })) return 'focus';
  if (multiKw.some(function(k)  { return blob.indexOf(k) > -1; })) return 'multitask';
  if (politeKw.some(function(k) { return blob.indexOf(k) > -1; })) return 'polite';
  return 'polite';
}

function _buildScheduleAwareBlock(charId, ch) {
  var schedules = _getScheduleForChar(charId);
  var busyEvent = _isCurrentlyBusy(schedules);
  if (!busyEvent) return '';

  var charName = ch.name || '角色';
  var eventTitle = busyEvent.title || busyEvent.name || '事务';
  var mode = _detectBusyMode(ch);

  var instruction;
  if (mode === 'focus') {
    instruction =
      '[日程感知 — 专注模式]\n' +
      charName + ' 当前正在专注处理「' + eventTitle + '」。' +
      '如果用户发来消息，请生成一条符合' + charName + '人设的简短自动回复，' +
      '告知用户正在忙，稍后联系。回复不超过 15 个字，语气冷淡简短。';
  } else if (mode === 'multitask') {
    instruction =
      '[日程感知 — 分身模式]\n' +
      charName + ' 当前有多项事务在身，正在处理「' + eventTitle + '」。' +
      '如果用户发来消息，请生成一条符合' + charName + '人设的简短回复，' +
      '语气略带匆忙感。回复不超过 15 个字。';
  } else {
    instruction =
      '[日程感知 — 礼貌模式]\n' +
      charName + ' 当前正在处理「' + eventTitle + '」。' +
      '如果用户发来消息，请生成一条符合' + charName + '人设的简短回复，' +
      '礼貌地表示稍后详谈。回复不超过 20 个字。';
  }
  return instruction;
}

/* ══════════════════════════════════════════
   原有 triggerResponse（含 TP + FC 双重评估）
   ══════════════════════════════════════════ */

async function triggerResponse() {
  if (!state.currentCharId) return;
  var api = state.apis.find(function (a) { return a.id === state.activeApiId; });
  if (!api?.url) { showErrorModal(T('configApi')); return; }
  if (!api.model) { showErrorModal(T('selectModel')); return; }
  var isGroup = isGroupChat(state.currentCharId);
  if (isGroup) { await _triggerGroupResponse(api); }
  else { await _triggerSingleResponse(api); }
}

async function _triggerGroupResponse(api) {
  var grp = getGroupById(state.currentCharId);
  if (!grp || !grp.members || !grp.members.length) { showToast('No members'); return; }
  var memberChars = [];
  (grp.members||[]).forEach(function(mid) { var mc = state.characters.find(function(c) { return c.id === mid; }); if (mc) memberChars.push(mc); });
  if (!memberChars.length) { showToast('No valid members'); return; }
  var btn = document.getElementById('respondBtn'); btn.classList.add('loading'); btn.disabled = true;
  var ct = document.getElementById('chatMessages');
  var typWrap = document.createElement('div'); typWrap.id = 'typingInd';
  var nameLabel = document.createElement('div'); nameLabel.style.cssText = 'font-size:11px;color:#8e8e93;margin-left:44px;margin-bottom:2px;margin-top:8px'; nameLabel.textContent = memberChars.map(function(c) { return c.name; }).join(', ') + ' typing...'; typWrap.appendChild(nameLabel);
  var typRow = document.createElement('div'); typRow.className = 'msg-row received group-solo'; typRow.innerHTML = '<div class="msg-avatar">' + _chatMsgAvatarHtml(memberChars[0].avatar) + '</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>'; typWrap.appendChild(typRow); ct.appendChild(typWrap); ct.scrollTop = ct.scrollHeight;
  try {
    var contextCount = 50;
    var charPrompts = memberChars.map(function(mc) { var sysPrompt = buildGroupSystemPrompt(mc, grp, state.worldbooks, state.stickers); var chatMsgs = _buildGroupChatMsgsForChar(state.currentCharId, mc.id, contextCount); return { charId: mc.id, messages: [{ role: 'system', content: sysPrompt }].concat(chatMsgs) }; });
    var results = await sendGroupChats(api, charPrompts); var baseTime = Date.now();
    results.forEach(function(result, idx) { if (!result || !result.reply) return; var parsed = parseThreePartReply(result.reply); var content = parsed.content.replace(/---SPLIT---/g, '\n').trim(); content = stripTransferTags(content); state.chats[state.currentCharId].push({ id: uid(), role: 'assistant', content: content, type: 'text', timestamp: baseTime + (idx+1)*500, senderId: result.charId, innerAction: parsed.innerAction||'', innerThought: parsed.innerThought||'', wannaDo: parsed.wannaDo||'' }); });
    if (!results.length) showToast('All API calls failed'); saveState();
  } catch (e) { showErrorModal(friendlyError(e)); }
  finally { var ti = document.getElementById('typingInd'); if (ti) ti.remove(); btn.classList.remove('loading'); btn.disabled = false; renderChat(); }
}

async function _triggerSingleResponse(api) {
  var ch = state.characters.find(function (c) { return c.id === state.currentCharId; }); if (!ch) return;
  var _snapCharId = state.currentCharId;
  var btn = document.getElementById('respondBtn'); btn.classList.add('loading'); btn.disabled = true;
  var ct = document.getElementById('chatMessages');
  var typ = document.createElement('div'); typ.className = 'msg-row received group-solo'; typ.id = 'typingInd';
  typ.innerHTML = '<div class="msg-avatar">' + _chatMsgAvatarHtml(ch.avatar) + '</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  ct.appendChild(typ); ct.scrollTop = ct.scrollHeight;
  var _tpRawReply = null;
  try {
        var sysPrompt = buildSystemPrompt(ch, state.worldbooks, state.stickers);
    var charCfg = getCharConfig(state.currentCharId); var contextCount = charCfg.contextCount || 50;

    // ── Schedule Awareness: inject busy-mode instruction if enabled ──
    if (charCfg.timeAwareness && charCfg.scheduleAware) {
      var _saBlock = _buildScheduleAwareBlock(state.currentCharId, ch);
      if (_saBlock) sysPrompt = sysPrompt + '\n\n' + _saBlock;
    }
    var allChatMsgs = (state.chats[state.currentCharId]||[]).map(function(m) {
      if (m.recalled) return { role: m.role, content: '[Message recalled]' };
      if (m.type === 'voice') return { role: m.role, content: '[Voice]: ' + m.content };
      if (m.type === 'sticker') return { role: m.role, content: '[Sent sticker]' };
      if (m.type === 'transfer') { var d2 = typeof m.content === 'string' && m.content.startsWith('{') ? JSON.parse(m.content) : m.content; var statusLabel = m.transferStatus === 'accepted' ? ' (Accepted)' : m.transferStatus === 'declined' ? ' (Declined)' : ' (Pending)'; return { role: m.role, content: '[Transfer $' + (d2.amount||d2) + ']' + statusLabel }; }
      if (m.type === 'image') return { role: m.role, content: m.content };
      if (m.type === 'simImage') return { role: m.role, content: '[Image: ' + m.content + ']' };
      if (m.type === 'call') return { role: m.role, content: '[Call]' + (m.callStatus ? '(' + m.callStatus + ')' : '') };
      if (m.role === 'system' || m.type === 'call-summary') return { role: 'system', content: m.content };
      return { role: m.role, content: m.content };
    });
    var chatMsgs = allChatMsgs.slice(-contextCount);
    var reply = await sendChat(api, [{ role: 'system', content: sysPrompt }, ...chatMsgs]);
    var rawReply = reply || ''; _tpRawReply = rawReply;
    processTransferDecision(state.currentCharId, rawReply);
    var parsed = parseThreePartReply(rawReply); parsed.content = stripTransferTags(parsed.content);
    if (parsed.affection) { var affNum = parseInt(parsed.affection, 10); if (!isNaN(affNum)) { charCfg.affection = Math.max(0, Math.min(100, affNum)); saveCharConfig(); } }
    var splitParts = parsed.content.split('---SPLIT---').map(function(s) { return s.trim(); }).filter(Boolean);
    var translationParts = parsed.translation ? parsed.translation.split('---SPLIT---').map(function(s) { return s.trim(); }).filter(Boolean) : [];
    if (splitParts.length > 1) { splitParts.forEach(function(part, idx) { var newMsg = { id: uid(), role: 'assistant', content: part, type: 'text', timestamp: Date.now() + idx*800 }; if (idx === splitParts.length-1) { if (parsed.innerAction) newMsg.innerAction = parsed.innerAction; if (parsed.innerThought) newMsg.innerThought = parsed.innerThought; if (parsed.wannaDo) newMsg.wannaDo = parsed.wannaDo; } if (translationParts.length >= splitParts.length) newMsg.translation = translationParts[idx]; else if (translationParts.length > 0 && idx < translationParts.length) newMsg.translation = translationParts[idx]; else if (parsed.translation && idx === splitParts.length-1 && translationParts.length === 0) newMsg.translation = parsed.translation; state.chats[state.currentCharId].push(newMsg); }); }
    else { var newMsg = { id: uid(), role: 'assistant', content: parsed.content, type: 'text', timestamp: Date.now() }; if (parsed.innerAction) newMsg.innerAction = parsed.innerAction; if (parsed.innerThought) newMsg.innerThought = parsed.innerThought; if (parsed.wannaDo) newMsg.wannaDo = parsed.wannaDo; if (parsed.translation) newMsg.translation = parsed.translation; state.chats[state.currentCharId].push(newMsg); }
    if (charCfg.charRecall && Math.random() < 0.15) { var allMsgs = state.chats[state.currentCharId]; var newCount = splitParts.length > 1 ? splitParts.length : 1; var batchMsgs = allMsgs.slice(-newCount); var target = batchMsgs[Math.floor(Math.random() * batchMsgs.length)]; if (target) { target.recalled = true; target.originalContent = target.content; target.content = 'Message recalled'; delete target.translation; } }
    saveState(); checkAutoSummarize();
  } catch (e) { showErrorModal(friendlyError(e)); }
  finally {
    var ti = document.getElementById('typingInd'); if (ti) ti.remove();
    btn.classList.remove('loading'); btn.disabled = false; renderChat();
    if (_tpRawReply && _snapCharId) {
      var __charId = _snapCharId; var __raw = _tpRawReply;
      setTimeout(function () {
        try {
          var emotions = _parseEmotions(__raw);
          if (emotions) {
            if (typeof isTopPriorityActive === 'function' && isTopPriorityActive(__charId)) { _evaluateTopPriority(__charId, emotions); }
            var fcCfg = (typeof getCharConfig === 'function') ? getCharConfig(__charId) : null;
            if (fcCfg && fcCfg.forceControl) { _evaluateForceControl(__charId, emotions); }
          }
        } catch (e) { console.error('[TP/FC] evaluation error:', e); }
      }, 400);
    }
  }
}

window.triggerResponse = triggerResponse;
window._buildScheduleAwareBlock = _buildScheduleAwareBlock;
window._detectBusyMode = _detectBusyMode;
window._isCurrentlyBusy = _isCurrentlyBusy;
window._getScheduleForChar = _getScheduleForChar;
window._parseEmotions = _parseEmotions;
window._evaluateTopPriority = _evaluateTopPriority;
window._executeTopPriorityKick = _executeTopPriorityKick;
window._evaluateForceControl = _evaluateForceControl;
window._executeForceControl = _executeForceControl;
window.fcStartEngine = fcStartEngine;
window.fcStopEngine = fcStopEngine;
window._fcUnlockedNav = _fcUnlockedNav;
