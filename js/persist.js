// ========== js/persist.js ==========
// 防丢三件套：持久化权限 + visibilitychange + beforeunload + 定时兜底
(function () {
  'use strict';

  if (window.__persistBooted) {
    console.warn('[persist] ⚠️ 重复执行已阻止');
    return;
  }
  window.__persistBooted = true;

  console.log('[persist] 开始初始化...');

  // ─────────────────────────────────────────────
  // 步骤 0：等待 state.js 加载完毕（saveState 可用）
  // ─────────────────────────────────────────────
  var _waitTimer = setInterval(function () {
    if (typeof window.saveState === 'function' &&
        typeof window.isStateLoaded === 'function') {
      clearInterval(_waitTimer);
      _waitTimer = null;
      console.log('[persist] ✅ 检测到 saveState，开始挂载防丢保护');
      _boot();
    }
  }, 200);

  // 60 秒还没等到就别等了（异常情况）
  setTimeout(function () {
    if (_waitTimer) {
      clearInterval(_waitTimer);
      _waitTimer = null;
      console.error('[persist] ❌ 60 秒内未检测到 saveState，放弃初始化');
    }
  }, 60000);

  // ─────────────────────────────────────────────
  // 真正的初始化
  // ─────────────────────────────────────────────
  function _boot() {

    // ═══ 1. 申请持久化存储权限 ═══
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(function (granted) {
        if (granted) {
          console.log('%c[persist] ✅ 持久化存储权限已授予（IDB 不会被自动清理）',
            'color:#0a0;font-weight:bold');
        } else {
          console.warn('[persist] ⚠️ 持久化权限未授予（可能因浏览器策略），IDB 仍可用但可能被 LRU 清理');
        }
      }).catch(function (e) {
        console.warn('[persist] 持久化权限申请失败:', e);
      });

      // 顺便看一下当前状态
      if (navigator.storage.persisted) {
        navigator.storage.persisted().then(function (p) {
          console.log('[persist] 当前持久化状态:', p ? '已持久化 ✅' : '未持久化 ⚠️');
        });
      }
    } else {
      console.warn('[persist] ⚠️ 浏览器不支持 navigator.storage.persist');
    }

    // ═══ 2. visibilitychange 兜底保存（★ 核心防线）═══
    var _lastHiddenSave = 0;
    var HIDDEN_SAVE_THROTTLE = 2000;   // 2 秒节流

    // ═══ 2. visibilitychange 兜底保存（★ 核心防线）═══
var _lastHiddenSave = 0;
var HIDDEN_SAVE_THROTTLE = 2000;

// ★ 统一离开处理：flush（不节流） + saveState（节流）
function _handleLeave(reason) {
  if (typeof window.isStateLoaded === 'function' && !window.isStateLoaded()) {
    return; // 数据还没加载完，不保存（避免空覆盖）
  }

  // 1. 无条件 flush 聊天（这步不能节流，否则最后几条会丢）
  try {
    if (typeof window.__flushPendingSaves === 'function') {
      console.log('%c[persist] 🛟 flush 待保存聊天 (' + reason + ')',
        'color:#f80;font-weight:bold');
      window.__flushPendingSaves();   // async，但 IDB 事务会被浏览器继续执行
    }
  } catch (e) {
    console.error('[persist] flush 异常:', e);
  }

  // 2. saveState（节流，避免频繁切前台后台刷屏）
  var now = Date.now();
  if (now - _lastHiddenSave < HIDDEN_SAVE_THROTTLE) {
    console.log('[persist] saveState 节流中（flush 已执行）');
    return;
  }
  _lastHiddenSave = now;

  try {
    var r = window.saveState();
    if (r && typeof r.then === 'function') {
      r.then(function () {
        console.log('[persist] ✅ saveState 完成 (' + reason + ')');
      }).catch(function (e) {
        console.error('[persist] saveState 失败:', e);
      });
    }
  } catch (e) {
    console.error('[persist] saveState 异常:', e);
  }
}

document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    _handleLeave('hidden');
  } else {
    console.log('[persist] 📤 页面重新可见');
  }
}, false);

window.addEventListener('pagehide', function () {
  _handleLeave('pagehide');
}, false);

// ═══ 3. beforeunload 兜底 ═══
window.addEventListener('beforeunload', function () {
  _handleLeave('beforeunload');
}, false);

    // ═══ 3. beforeunload 兜底 ═══
    window.addEventListener('beforeunload', function () {
      if (typeof window.isStateLoaded === 'function' && window.isStateLoaded()) {
        console.log('[persist] 🚪 页面即将卸载，兜底保存');
        try { window.saveState(); } catch (e) {}
      }
    }, false);

    // ═══ 4. 30 秒定时保存 ═══
    var AUTO_SAVE_INTERVAL = 30000;   // 30 秒
    var _autoSaveCount = 0;
    setInterval(function () {
      if (typeof window.isStateLoaded === 'function' && window.isStateLoaded()) {
        _autoSaveCount++;
        // 只在页面可见时打日志，避免后台刷屏
        if (document.visibilityState === 'visible') {
          console.log('[persist] ⏰ 定时保存 #' + _autoSaveCount);
        }
        try { window.saveState(); } catch (e) {}
      }
    }, AUTO_SAVE_INTERVAL);

    console.log('%c[persist] ✅ 防丢三件套已全部挂载',
      'color:#0a0;font-weight:bold;font-size:13px');
    console.log('  - 持久化权限：已申请');
    console.log('  - visibilitychange：已监听（切后台时保存）');
    console.log('  - beforeunload：已监听（关页面时保存）');
    console.log('  - 定时保存：每 30 秒一次');
  }
})();