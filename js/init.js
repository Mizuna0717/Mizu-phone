// ========== 19-init.js ==========
// 依赖：所有其他关键文件。此文件必须在关键脚本最后载入。

(function() {
  'use strict';

  var _initStart = performance.now();

  // ═══════════════════════════════════════════════
  //  1. 加载多账号数据
  // ═══════════════════════════════════════════════
  try { loadState(); } catch(e) { console.error('loadState failed:', e); }

  // ── 1.5 初始化系统提示词（必须在 loadState 之后） ──
  try { initSystemPrompts(); } catch(e) { console.error('initSystemPrompts failed:', e); }

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
  //  ★★★ 关键修复：使用 nav() 确保首屏正确显示 ★★★
  // ═══════════════════════════════════════════════
  try {
    if (typeof nav === 'function') {
      nav('screen-home');
      console.log('[init] ✅ 已通过 nav() 导航至 screen-home');
    } else {
      console.warn('[init] ⚠️ nav() 未定义，使用手动激活');
      var initScreen = document.getElementById('screen-home');
      if (initScreen) {
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        initScreen.classList.add('active');
        console.log('[init] ✅ screen-home 已手动激活');
      } else {
        console.error('[init] ❌ #screen-home 不存在！请检查 home.html 是否正确加载');
        var allScreens = document.querySelectorAll('.screen');
        console.log('[init] 可用 screens:', Array.from(allScreens).map(function(s) { return s.id; }));
      }
    }
  } catch(e) {
    console.error('[init] 首屏导航失败:', e);
  }

  // ═══════════════════════════════════════════════
  //  3. 延迟渲染：将非首屏渲染推迟到空闲时执行
  // ═══════════════════════════════════════════════
  var deferredRenders = [
    function() { try { renderCharList(); }       catch(e) {} },
    function() { try { renderMaskList(); }       catch(e) {} },
    function() { try { renderProfileInfo(); }    catch(e) {} },
    function() { try { renderProfileStickers(); } catch(e) {} }
  ];

  // ★ renderGroups 和 renderMoments 依赖延迟加载的模块，
  //   放到延迟脚本加载完成后再执行（见 screen-loader.js 末尾）
  // 如果对应函数已存在（非延迟加载模式），也在这里调度
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
    });
  });

  // ═══════════════════════════════════════════════
  //  4. 时间更新 + 自动保存（合并为单一定时器）
  // ═══════════════════════════════════════════════
  try { updatePhoneTime(); } catch(e) {}

  var _tickTimer = setInterval(function() {
    try { updatePhoneTime(); } catch(e) {}
    try { saveState(); } catch(e) { console.error('auto-save failed:', e); }
  }, 30000);

  window.__autoSaveTimer = _tickTimer;

  // ── 5. 重启自动 Moment 定时器（如果函数已存在） ──
  try {
    if (typeof restartAllAutoMoments === 'function') {
      restartAllAutoMoments();
    }
  } catch(e) {}

  // ═══════════════════════════════════════════════
  //  6. ★★★ 数据持久化保障 ★★★
  // ═══════════════════════════════════════════════

  // (A) 页面关闭/刷新前保存
  window.addEventListener('beforeunload', function() {
    try { saveState(); } catch(e) { console.error('beforeunload save failed:', e); }
  });

  // (B) 切换标签页/最小化时保存（移动端更可靠）
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      try { saveState(); } catch(e) { console.error('visibilitychange save failed:', e); }
    }
  });

  // (C) 移动端 pagehide 事件（iOS Safari 专用）
  window.addEventListener('pagehide', function() {
    try { saveState(); } catch(e) { console.error('pagehide save failed:', e); }
  });

  // ═══════════════════════════════════════════════
  //  7. 控制台输出
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
