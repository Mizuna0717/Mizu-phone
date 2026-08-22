// ========== chat-ai.js ==========
// triggerResponse, _triggerSingleResponse, _triggerGroupResponse
// ★★★ Top Priority + Force Control 情绪检测 ★★★

/* ══════════════════════════════════════════
   TOP PRIORITY — 情绪解析 & 评估 & 执行（保持不变）
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
  _showTpModal('角色已冷静', charName + ' 的情绪已恢复。', '切回主号', function () { var freshLock = getTpLock(charId); var originalAccountId = freshLock ? freshLock.originalAccountId : null; if (freshLock) { freshLock.active = false; freshLock.consecutiveHigh = 0; freshLock.cooldownRounds = 0; freshLock.lockTimestamp = null; setTpLock(charId, freshLock); } if (originalAccountId && originalAccountId !== accountStore.currentAccountId) { saveState(); var ok = switchAccount(originalAccountId); if (ok) { reloadUI(false); state.currentCharId = charId; nav('screen-chat'); showToast('已切回主号'); } else { showToast('切回失败'); } } else { showToast('已恢复正常'); if (typeof renderChat === 'function') renderChat(); } }, '继续对话', function () { showToast('可随时手动切回'); });
}

function _showTpModal(title, message, confirmText, onConfirm, cancelText, onCancel) {
  var existing = document.getElementById('tpModal'); if (existing) existing.remove();
  window._tpConfirmFn = null; window._tpCancelFn = null;
  var overlay = document.createElement('div'); overlay.id = 'tpModal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:modalIn .22s ease';
  var hasCancel = !!cancelText; var actionsHtml = '';
  if (hasCancel) { actionsHtml = '<div style="display:flex;border-top:1px solid rgba(0,0,0,.05)"><button onclick="if(window._tpCancelFn)window._tpCancelFn();window._tpConfirmFn=null;window._tpCancelFn=null;document.getElementById(\'tpModal\')?.remove()" style="flex:1;padding:14px;border:none;background:none;font-size:16px;color:#8e8e93;cursor:pointer;font-family:inherit;border-right:1px solid rgba(0,0,0,.05)">' + (cancelText||'取消') + '</button><button onclick="if(window._tpConfirmFn)window._tpConfirmFn();window._tpConfirmFn=null;window._tpCancelFn=null;document.getElementById(\'tpModal\')?.remove()" style="flex:1;padding:14px;border:none;background:none;font-size:16px;color:#111;font-weight:600;cursor:pointer;font-family:inherit">' + (confirmText||'确认') + '</button></div>'; }
  else { actionsHtml = '<div style="display:flex;border-top:1px solid rgba(0,0,0,.05)"><button onclick="if(window._tpConfirmFn)window._tpConfirmFn();window._tpConfirmFn=null;window._tpCancelFn=null;document.getElementById(\'tpModal\')?.remove()" style="flex:1;padding:14px;border:none;background:none;font-size:16px;color:#111;font-weight:600;cursor:pointer;font-family:inherit">' + (confirmText||'确认') + '</button></div>'; }
  overlay.innerHTML = '<div style="background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.5);box-shadow:0 8px 32px rgba(0,0,0,.12);width:calc(100% - 48px);max-width:320px;overflow:hidden"><div style="padding:20px 20px 8px;font-size:17px;font-weight:700;text-align:center;color:#111">' + title + '</div><div style="padding:8px 20px 20px;font-size:14px;color:#3a3a3c;line-height:1.6;text-align:center;white-space:pre-line">' + message + '</div>' + actionsHtml + '</div>';
  window._tpConfirmFn = onConfirm || null; window._tpCancelFn = onCancel || null;
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
  if (typeof fcShowOverlay === 'function') { fcShowOverlay(charName); }
  else { console.error('[FC] fcShowOverlay not found!'); window._fcNavigationLocked = true; }
  window._fcEngineStarted = false;
  _showFcActivationModal(charName, function() {
    if (!window._fcEngineStarted) { window._fcEngineStarted = true; if (window._fcAutoStartTimer) { clearTimeout(window._fcAutoStartTimer); window._fcAutoStartTimer = null; } fcStartEngine(charId); }
  });
  window._fcAutoStartTimer = setTimeout(function() { window._fcAutoStartTimer = null; if (!window._fcEngineStarted) { window._fcEngineStarted = true; var modal = document.getElementById('fcModal'); if (modal) modal.remove(); console.log('[FC] 自动启动引擎（3秒超时）'); fcStartEngine(charId); } }, 3000);
}

function _showFcActivationModal(charName, onConfirm) {
  var existing = document.getElementById('fcModal'); if (existing) existing.remove();
  window._fcActivationConfirmFn = onConfirm || null;
  var modal = document.createElement('div'); modal.id = 'fcModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:fcFadeIn .25s ease;';
  modal.innerHTML = '<div style="background:rgba(255,255,255,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:16px;border:1px solid rgba(255,255,255,.5);box-shadow:0 8px 32px rgba(0,0,0,.15);width:calc(100% - 48px);max-width:320px;overflow:hidden"><div style="padding:24px 24px 8px;text-align:center"><div style="font-size:36px;margin-bottom:8px">&#128274;</div><div style="font-size:18px;font-weight:700;color:#111">账号被控制</div></div><div style="padding:8px 24px 24px;font-size:14px;color:#3a3a3c;line-height:1.6;text-align:center;white-space:pre-line">' + charName + ' 正在查看你的账号...\n你暂时无法操作界面。</div><div style="display:flex;border-top:1px solid rgba(0,0,0,.06)"><button onclick="if(window._fcActivationConfirmFn)window._fcActivationConfirmFn();window._fcActivationConfirmFn=null;document.getElementById(\'fcModal\')?.remove()" style="flex:1;padding:15px;border:none;background:none;font-size:16px;color:#111;font-weight:600;cursor:pointer;font-family:inherit">我知道了</button></div></div>';
  document.body.appendChild(modal);
}


/* ══════════════════════════════════════════
   ★FC★ Force Control 操作引擎
   ★★★ 修复版 v3：unlock/nav/relock 模式 ★★★
   ══════════════════════════════════════════ */
var _fcActionQueue = [];
var _fcActionTimer = null;
var _fcTimeoutTimer = null;
var _fcEngineCharId = null;
var _fcActionIndex = 0;



function fcStartEngine(charId) {
  _fcEngineCharId = charId;
  _fcActionIndex = 0;
  _fcActionQueue = _fcGenerateActions(charId);
  console.log('[FC Engine] 启动，共', _fcActionQueue.length, '个操作');

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
  console.log('[FC Engine] 已停止');
}

/**
 * ★修复★ 引擎专用导航函数
 * 使用 unlock → nav → relock 模式，绕过标志位时序问题
 * 内含 fallback：如果 nav() 失败，直接操作 DOM
 */
function _fcUnlockedNav(screenId) {
  var wasLocked = window._fcNavigationLocked;
  var wasEngineNav = window._fcEngineNavigating;

  // 临时解锁，让 nav() 放行
  window._fcNavigationLocked = false;
  window._fcEngineNavigating = true;

  try {
    nav(screenId);
    console.log('[FC Engine] _fcUnlockedNav OK:', screenId);
  } catch (e) {
    // fallback：直接操作 DOM
    console.warn('[FC Engine] nav() threw, fallback to DOM:', e.message);
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    var target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    // 手动触发该页面的渲染
    try {
      if (screenId === 'screen-chat' && typeof renderChat === 'function') renderChat();
      if (screenId === 'screen-settings' && typeof renderSettings === 'function') renderSettings();
      if (screenId === 'screen-imessage' && typeof switchImsgTab === 'function') switchImsgTab(state.imsgTab || 'messages', true);
    } catch (re) {}
  }

  // 恢复原锁定状态
  window._fcNavigationLocked = wasLocked;
  window._fcEngineNavigating = wasEngineNav;
}


function _fcExecuteNext() {
  if (!_fcEngineCharId) return;
  var lock = (typeof getFcLock === 'function') ? getFcLock(_fcEngineCharId) : null;
  if (!lock || !lock.active) { fcStopEngine(); return; }

  if (_fcActionIndex >= _fcActionQueue.length) {
    _fcActionIndex = 0;
    _fcActionQueue = _fcGenerateActions(_fcEngineCharId);
    if (_fcActionQueue.length === 0) return;
  }

  var action = _fcActionQueue[_fcActionIndex];
  _fcActionIndex++;

  console.log('[FC Engine] 动作 #' + _fcActionIndex + '/' + _fcActionQueue.length + ':', action.type,
    action.text || action.label || action.charName || '');

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
      actions.push({ type: 'openChat', charId: target.id, charName: targetName, delay: 2000 });
      actions.push({ type: 'log', text: charName + ' 正在翻看聊天记录...', delay: 600 });
      actions.push({ type: 'scroll', direction: 'up', delay: 1500 });
      actions.push({ type: 'log', text: charName + ' 继续往下看...', delay: 500 });
      actions.push({ type: 'scroll', direction: 'down', delay: 1200 });
    }
  }

  if (em.suspicion >= 6) {
    actions.push({ type: 'log', text: charName + ' 打开了设置页面...', delay: 800 });
    actions.push({ type: 'nav', screen: 'screen-settings', label: '设置', delay: 2500 });
  }

  if (lock && lock.allowSwitchAccount && em.suspicion >= 7) {
    var accounts = (typeof getAllAccounts === 'function') ? getAllAccounts() : [];
    var otherAccts = accounts.filter(function(a) { return a.id !== accountStore.currentAccountId; });
    if (otherAccts.length > 0) {
      var targetAcct = otherAccts[Math.floor(Math.random() * otherAccts.length)];
      actions.push({ type: 'log', text: charName + ' 发现了另一个账号: ' + targetAcct.name, delay: 1200 });
      actions.push({ type: 'switchAccount', accountId: targetAcct.id, accountName: targetAcct.name, delay: 2500 });
      actions.push({ type: 'log', text: charName + ' 正在查看 ' + targetAcct.name + ' 的内容...', delay: 800 });
      actions.push({ type: 'nav', screen: 'screen-imessage', label: '消息列表', delay: 2000 });
      actions.push({ type: 'log', text: charName + ' 看完了，切回原账号...', delay: 1500 });
      actions.push({ type: 'switchBack', delay: 2000 });
    }
  }

  actions.push({ type: 'log', text: charName + ' 返回自己的聊天界面...', delay: 800 });
  actions.push({ type: 'openChat', charId: charId, charName: charName, delay: 1500 });
  actions.push({ type: 'log', text: charName + ' 在沉默地思考...', delay: 4000 });

  return actions;
}

/**
 * ★★★ 修复核心：_fcPerformAction ★★★
 * 所有导航操作使用 _fcUnlockedNav（unlock/relock 模式）
 * 日志更新使用同步 fcUpdateActionLog
 */
function _fcPerformAction(action, callback) {
  switch (action.type) {

    case 'log':
      fcUpdateActionLog(action.text || '...');
      if (callback) callback();
      break;

    case 'nav':
      fcUpdateActionLog('切换到' + (action.label || '') + '...');
      if (typeof fcScreenFlash === 'function') fcScreenFlash();
      // ★★★ 使用 unlock/relock 模式 ★★★
      _fcUnlockedNav(action.screen);
      if (callback) callback();
      break;

    case 'openChat':
      fcUpdateActionLog('打开 ' + (action.charName || '角色') + ' 的聊天...');
      if (typeof fcScreenFlash === 'function') fcScreenFlash();
      state.currentCharId = action.charId;
      if (!state.chats[action.charId]) state.chats[action.charId] = [];
      // ★★★ 使用 unlock/relock 模式 ★★★
      _fcUnlockedNav('screen-chat');
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
      // ★★★ 切换账号也需要解锁 ★★★
      var wasLocked = window._fcNavigationLocked;
      window._fcNavigationLocked = false;
      window._fcEngineNavigating = true;
      var ok = switchAccount(action.accountId);
      if (ok) { try { reloadUI(false); } catch(e) {} }
      window._fcNavigationLocked = wasLocked;
      window._fcEngineNavigating = false;
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
      if (callback) callback();
      break;

    default:
      if (callback) callback();
      break;
  }
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
window._parseEmotions = _parseEmotions;
window._evaluateTopPriority = _evaluateTopPriority;
window._executeTopPriorityKick = _executeTopPriorityKick;
window._evaluateForceControl = _evaluateForceControl;
window._executeForceControl = _executeForceControl;
window.fcStartEngine = fcStartEngine;
window.fcStopEngine = fcStopEngine;
window._fcUnlockedNav = _fcUnlockedNav;
