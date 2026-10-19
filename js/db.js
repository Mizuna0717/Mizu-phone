// ========== js/db.js ==========
// IndexedDB 封装层 —— 对上层只暴露 window.AI_DB
(function () {
  'use strict';

  if (typeof Dexie === 'undefined') {
    console.warn('[db] ⚠️ Dexie 未加载，AI_DB 不可用，将回退到 localStorage');
    window.AI_DB = {
      _disabled: true,
      async saveAccount() { return false; },
      async loadAccount() { return null; },
      async deleteAccount() {},
      async saveMeta() {},
      async loadMeta() { return null; },
      async listAccountIds() { return []; },
      async saveChat() { return false; },
      async loadChat() { return null; },
      async loadAllChats() { return {}; },
      async deleteChat() {}
    };
    return;
  }

  // ── 数据库结构 ──
  var db = new Dexie('ai_app_db');
  db.version(1).stores({
    accounts: '&accountId, savedAt',
    meta: '&key'
  });
  db.version(2).stores({
    accounts: '&accountId, savedAt',
    meta: '&key',
    chats: '&[accountId+charId], accountId, charId, updatedAt'
  });

  // ── 对外 API（所有方法都在这个对象里）──
  window.AI_DB = {
    _disabled: false,
    _db: db,

    async saveAccount(accountId, dataObj) {
      if (!accountId) return false;
      try {
        await db.accounts.put({
          accountId: accountId,
          data: dataObj,
          savedAt: Date.now(),
          version: 1
        });
        return true;
      } catch (e) {
        console.error('[db] saveAccount 失败:', accountId, e);
        return false;
      }
    },

    async loadAccount(accountId) {
      if (!accountId) return null;
      try {
        var row = await db.accounts.get(accountId);
        return row ? row.data : null;
      } catch (e) {
        console.error('[db] loadAccount 失败:', accountId, e);
        return null;
      }
    },

    async deleteAccount(accountId) {
      if (!accountId) return;
      try { await db.accounts.delete(accountId); }
      catch (e) { console.error('[db] deleteAccount 失败:', accountId, e); }
    },

    async saveMeta(metaObj) {
      try { await db.meta.put({ key: 'account_meta', value: metaObj }); }
      catch (e) { console.error('[db] saveMeta 失败:', e); }
    },

    async loadMeta() {
      try {
        var row = await db.meta.get('account_meta');
        return row ? row.value : null;
      } catch (e) { return null; }
    },

    async listAccountIds() {
      try {
        var rows = await db.accounts.toArray();
        return rows.map(function (r) { return r.accountId; });
      } catch (e) { return []; }
    },

    // ── chat 分片 API ──
    async saveChat(accountId, charId, messages) {
      try {
        await db.chats.put({
          accountId: accountId,
          charId: charId,
          messages: messages,
          updatedAt: Date.now()
        });
        return true;
      } catch (e) {
        console.error('[db] saveChat 失败:', charId, e);
        return false;
      }
    },

    async loadChat(accountId, charId) {
      try {
        var row = await db.chats.get([accountId, charId]);
        return row ? row.messages : null;
      } catch (e) { return null; }
    },

    async loadAllChats(accountId) {
      try {
        var rows = await db.chats.where('accountId').equals(accountId).toArray();
        var result = {};
        rows.forEach(function (r) { result[r.charId] = r.messages; });
        return result;
      } catch (e) { return {}; }
    },

    async deleteChat(accountId, charId) {
      try { await db.chats.delete([accountId, charId]); } catch (e) {}
    }
  };

  console.log('[db] ✅ IndexedDB 层已就绪 (ai_app_db)');
})();