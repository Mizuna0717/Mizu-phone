// ========== js/cross-tab.js ==========
// 多标签页协调：BroadcastChannel 通知 + Web Locks 排他
(function () {
  'use strict';

  if (window.__crossTabBooted) return;
  window.__crossTabBooted = true;

  var TAB_ID = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  window.__tabId = TAB_ID;

  var channel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('ai_app_sync');
  } else {
    console.warn('[cross-tab] BroadcastChannel 不可用');
  }

  // ── 广播数据变更 ──
  function broadcastChange(accountId, action) {
    if (!channel) return;
    try {
      channel.postMessage({
        type: 'DATA_CHANGED',
        accountId: accountId,
        action: action || 'save',
        tabId: TAB_ID,
        ts: Date.now()
      });
    } catch (e) {}
  }

  // ── 接收其他标签页的通知 ──
  if (channel) {
    channel.onmessage = function (event) {
      var msg = event.data;
      if (!msg || msg.tabId === TAB_ID) return;  // 忽略自己发的

      if (msg.type === 'DATA_CHANGED') {
        console.log('[cross-tab] 收到其他标签页变更:', msg.action, '账号:', msg.accountId);
        // 如果变更的是当前账号，标记需要重新加载
        if (msg.accountId === window.accountStore?.currentAccountId) {
          window.__remoteChangeDetected = true;
          // 可选：自动重新加载
          // if (typeof loadState === 'function') loadState();
        }
      }
    };
  }

  // ── Web Locks 排他写入 ──
  async function withWriteLock(fn) {
    if (!navigator.locks || !navigator.locks.request) {
      // 降级：直接执行
      return await fn();
    }
    return await navigator.locks.request(
      'ai_app_write_' + (window.accountStore?.currentAccountId || 'global'),
      { mode: 'exclusive' },
      fn
    );
  }

  // ── 包装 saveState，加锁 + 广播 ──
  var _origSaveState = window.saveState;
  window.saveState = function (force) {
    var accountId = window.accountStore?.currentAccountId;
    return withWriteLock(function () {
      return _origSaveState(force).then(function (r) {
        broadcastChange(accountId, 'save');
        return r;
      });
    });
  };

  window.__crossTab = {
    tabId: TAB_ID,
    broadcastChange: broadcastChange,
    withWriteLock: withWriteLock
  };

  console.log('[cross-tab] ✅ 多标签页协调已启动 | tabId:', TAB_ID);
})();