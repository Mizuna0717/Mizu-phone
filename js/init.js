// ========== 19-init.js ==========
(function() {
  'use strict';

  var _initStart = performance.now();

  // ═══════════════════════════════════════════════
  //  1. 加载多账号数据
  // ═══════════════════════════════════════════════
  try { loadState(); } catch(e) { console.error('loadState failed:', e); }

  // ★★★ 新增：加载后立即做数据快照，用于检测后续是否被意外重置 ★★★
  var _postLoadChars = state.characters.length;
  var _postLoadChats = Object.keys(state.chats).length;
  var _postLoadMasks = state.masks.length;
  console.log('[init] 加载后快照 | chars:', _postLoadChars,
    '| chats:', _postLoadChats, '| masks:', _postLoadMasks);

  // ── 1.5 初始化系统提示词（必须在 loadState 之后） ──
  try { initSystemPrompts(); } catch(e) { console.error('initSystemPrompts failed:', e); }

  // ★★★ 新增：验证 initSystemPrompts 没有破坏数据 ★★★
  if (state.characters.length !== _postLoadChars) {
    console.error('[init] ⚠️ initSystemPrompts 后角色数量变化！',
      _postLoadChars, '->', state.characters.length);
  }

  // ═══════════════════════════════════════════════
  //  2. 首页初始化（全部 try-catch）
  // ═══════════════════════════════════════════════
  try { initHomeSwipe(); }   catch(e) {}
  try { updateGreeting(); }  catch(e) {}
  try { updateCalendar(); }  catch(e) {}
  try { renderHomeProfile(); } catch(e) {}
  try { renderCalEvent(); }  catch(e) {}

  try {
    if (state.userProfile.musicSong)
      document.getElementById('musicSong').textContent = state.userProfile.musicSong;
    if (state.userProfile.musicArtist)
      document.getElementById('musicArtist').textContent = state.userProfile.musicArtist;
    if (state.userProfile.musicCover) {
      var mi = document.getElementById('musicCoverImg');
      if (mi) { mi.src = state.userProfile.musicCover; mi.style.display = 'block'; }
    }
  } catch(e) {}

  try { applyLang(); } catch(e) {}

  var chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        try { sendMessage(); } catch(err) {}
      }
    });
  }

  try { updateHomeBadge(); } catch(e) {}

  // ═══════════════════════════════════════════════
  //  ★★★ 首屏导航 ★★★
  // ═══════════════════════════════════════════════
  try {
    if (typeof nav === 'function') {
      nav('screen-home');
    } else {
      var initScreen = document.getElementById('screen-home');
      if (initScreen) {
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        initScreen.classList.add('active');
      }
    }
  } catch(e) {
    console.error('[init] 首屏导航失败:', e);
  }

  // ═══════════════════════════════════════════════
  //  3. 延迟渲染
  // ═══════════════════════════════════════════════
  var deferredRenders = [
    function() { try { renderCharList(); }       catch(e) {} },
    function() { try { renderMaskList(); }       catch(e) {} },
    function() { try { renderProfileInfo(); }    catch(e) {} },
    function() { try { renderProfileStickers(); } catch(e) {} }
  ];

  if (typeof renderGroups === 'function') {
    deferredRenders.push(function() { try { renderGroups(); } catch(e) {} });
  }
  if (typeof renderMoments === 'function') {
    deferredRenders.push(function() { try { renderMoments(); } catch(e) {} });
  }

  var scheduleIdle = window.requestIdleCallback
    ? function(fn) { requestIdleCallback(fn, { timeout: 2000 }); }
    : function(fn) { setTimeout(fn, 50); };

  deferredRenders.forEach(function(renderFn) {
    scheduleIdle(function() {
      renderFn();

      // ★★★ 新增：每次延迟渲染后检查数据完整性 ★★★
      if (state.characters.length !== _postLoadChars && _postLoadChars > 0) {
        console.error('[init] ⚠️ 延迟渲染后角色数量变化！',
          _postLoadChars, '->', state.characters.length,
          '| 渲染函数:', renderFn.toString().slice(0, 80));
      }
    });
  });

  // ═══════════════════════════════════════════════
  //  4. 时间更新 + 自动保存
  // ═══════════════════════════════════════════════
  try { updatePhoneTime(); } catch(e) {}

  var _tickTimer = setInterval(function() {
    try { updatePhoneTime(); } catch(e) {}

    // ★★★ 修复：自动保存前检查状态完整性 ★★★
    try {
      if (typeof isStateLoaded === 'function' && !isStateLoaded()) {
        console.warn('[auto-save] 状态尚未加载完成，跳过自动保存');
        return;
      }
      saveState();
    } catch(e) {
      console.error('auto-save failed:', e);
    }
  }, 30000);

  window.__autoSaveTimer = _tickTimer;

  // ── 5. 重启自动 Moment 定时器 ──
  try {
    if (typeof restartAllAutoMoments === 'function') {
      restartAllAutoMoments();
    }
  } catch(e) {}

  // ═══════════════════════════════════════════════
  //  6. ★★★ 数据持久化保障 ★★★
  // ═══════════════════════════════════════════════

  window.addEventListener('beforeunload', function() {
    try { saveState(); } catch(e) { console.error('beforeunload save failed:', e); }
  });

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      try { saveState(); } catch(e) { console.error('visibilitychange save failed:', e); }
    }
  });

  window.addEventListener('pagehide', function() {
    try { saveState(); } catch(e) { console.error('pagehide save failed:', e); }
  });

  // ═══════════════════════════════════════════════
  //  7. ★★★ 新增：延迟数据完整性终检 ★★★
  // ═══════════════════════════════════════════════
  setTimeout(function() {
    var finalChars = state.characters.length;
    var finalChats = Object.keys(state.chats).length;

    if (_postLoadChars > 0 && finalChars === 0) {
      console.error('[init] 🚨 严重：初始化后角色数据被清空！',
        '加载时:', _postLoadChars, '当前:', finalChars,
        '— 正在从 localStorage 恢复...');
      // 紧急恢复
      try {
        var emergencyData = _loadAccountData(accountStore.currentAccountId);
        if (emergencyData) {
          _applyDataToState(emergencyData);
          _validateState();
          console.log('[init] ✅ 紧急恢复成功 | chars:', state.characters.length);
          try { renderCharList(); } catch(e) {}
        }
      } catch(e) {
        console.error('[init] ❌ 紧急恢复失败:', e);
      }
    } else {
      console.log('[init] ✅ 数据完整性检查通过 | chars:', finalChars, '| chats:', finalChats);
    }
  }, 3000);

  // ═══════════════════════════════════════════════
  //  8. 控制台输出
  // ═══════════════════════════════════════════════
  try {
    var acct = getCurrentAccount();
    var total = getAllAccounts().length;
    console.log('当前账号: ' + (acct ? acct.name : '???') + '  (共 ' + total + ' 个账号)');
  } catch(e) {}

  var _initTime = Math.round(performance.now() - _initStart);
  console.log('init.js 执行完成 (' + _initTime + 'ms)');
  window.__initTime = _initTime;

})();
