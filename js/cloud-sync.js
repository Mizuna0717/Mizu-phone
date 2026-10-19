// ========== js/cloud-sync.js ==========
(function () {
  'use strict';

  if (window.__cloudSyncBooted) return;
  window.__cloudSyncBooted = true;

  var _supabase = null;
  var _userId = null;
  var _syncTimer = null;
  var _retryQueue = [];
  var SYNC_INTERVAL = 60000;  // 60 秒同步一次

  // ── 等 Supabase 和 auth 就绪 ──
  function waitForAuth(cb) {
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if (window._supabase && window._supabase.auth) {
        window._supabase.auth.getSession().then(function (res) {
          if (res && res.data && res.data.session) {
            _supabase = window._supabase;
            _userId = res.data.session.user.id;
            clearInterval(t);
            cb();
          } else if (tries > 30) {
            clearInterval(t);
            console.warn('[cloud-sync] 未登录，跳过云端同步');
          }
        });
      } else if (tries > 30) {
        clearInterval(t);
        console.warn('[cloud-sync] 超时，Supabase 未就绪');
      }
    }, 500);
  }

  // ── 推送本地数据到云端 ──
  async function pushToCloud(accountId) {
    if (!_supabase || !_userId || !accountId) return false;
    try {
      var localData = await window.AI_DB.loadAccount(accountId);
      if (!localData) return false;

      var { error } = await _supabase
        .from('user_data')
        .upsert({
          user_id: _userId,
          account_id: accountId,
          data: localData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,account_id' });

      if (error) throw error;
      console.log('[cloud-sync] ✅ 推送成功:', accountId);
      return true;
    } catch (e) {
      console.error('[cloud-sync] 推送失败:', e);
      _retryQueue.push({ accountId: accountId, ts: Date.now() });
      return false;
    }
  }

  // ── 从云端拉取 ──
  async function pullFromCloud(accountId) {
    if (!_supabase || !_userId || !accountId) return null;
    try {
      var { data, error } = await _supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', _userId)
        .eq('account_id', accountId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? data.data : null;
    } catch (e) {
      console.error('[cloud-sync] 拉取失败:', e);
      return null;
    }
  }

  // ── 合并策略：本地优先，云端补充 ──
  async function mergeCloudData(accountId) {
    var local = await window.AI_DB.loadAccount(accountId);
    var cloud = await pullFromCloud(accountId);

    if (!cloud) {
      console.log('[cloud-sync] 云端无数据，跳过合并');
      return;
    }
    if (!local) {
      console.log('[cloud-sync] 本地无数据，用云端覆盖');
      await window.AI_DB.saveAccount(accountId, cloud);
      return;
    }

    // 简单策略：本地数据较新则不合并；云端较新则合并 chat
    var localTime = local._savedAt || 0;
    var cloudTime = cloud._savedAt || 0;

    if (cloudTime > localTime) {
      console.log('[cloud-sync] 云端更新，合并 chats');
      // 合并 chat：云端有但本地没有的，补充进来
      var cloudChats = cloud.chats || {};
      var localChats = local.chats || {};
      for (var cid in cloudChats) {
        if (!localChats[cid]) {
          localChats[cid] = cloudChats[cid];
          console.log('  + 补充会话:', cid);
        }
      }
      local.chats = localChats;
      await window.AI_DB.saveAccount(accountId, local);
    }
  }

  // ── 重试队列 ──
  function processRetryQueue() {
    if (_retryQueue.length === 0) return;
    var now = Date.now();
    var pending = _retryQueue.filter(function (item) {
      return now - item.ts < 5 * 60 * 1000;  // 5 分钟内的重试
    });
    _retryQueue = pending;
    pending.forEach(function (item) {
      pushToCloud(item.accountId);
    });
  }

  // ── 启动 ──
  waitForAuth(function () {
    console.log('[cloud-sync] ✅ 云端同步已启动 | userId:', _userId.substr(0, 8) + '...');

    // 首次：拉取并合并
    var curId = window.accountStore?.currentAccountId;
    if (curId) {
      mergeCloudData(curId).then(function () {
        console.log('[cloud-sync] 首次合并完成');
      });
    }

    // 定时推送
    _syncTimer = setInterval(function () {
      var aid = window.accountStore?.currentAccountId;
      if (aid) {
        pushToCloud(aid);
        processRetryQueue();
      }
    }, SYNC_INTERVAL);

    // 页面隐藏时推送
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        var aid = window.accountStore?.currentAccountId;
        if (aid) pushToCloud(aid);
      }
    });
  });

  window.__cloudSync = {
    push: pushToCloud,
    pull: pullFromCloud,
    merge: mergeCloudData,
    retryQueue: _retryQueue
  };
})();