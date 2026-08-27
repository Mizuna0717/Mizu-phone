// ========== 02-state.js ==========
let accountStore = { accounts: [], currentAccountId: null };

let state = {
  apis: [], activeApiId: null, characters: [], chats: {}, worldbooks: [], stickers: [],
  unread: {}, currentCharId: null, editingApiId: null, editingCharId: null,
  editingWbId: null, editingMaskId: null, editingMemId: null,
  charEditFrom: 'screen-imessage', drawerFilter: 'all', drawerSort: 'recent',
  drawerSearch: '', lang: 'en', userProfile: { name: 'User', avatar: null },
  masks: [], memories: [], imsgTab: 'messages', replyPrompt: null, charConfig: {},
  phoneData: {}, bookmarks: [], groups: [], moments: [],
  meetings: [],
  allowQuote: true,
  systemPromptIM: '',
  systemPromptMeeting: ''
};

let bubbleState = { multiMode: false, selectedIds: new Set(), quoteMsg: null, editingMsgId: null };
let phoneState = { selectedCharId: null, currentAppId: null };

let tmp = {
  wbEntries: [], wbGlobal: false, charAvatar: null, tempModels: null,
  popoverMsgId: null, resolvedBase: null, maskAvatar: null, imgType: 'real',
  realImageData: null, memPhoto: null, memMood: '', expandedGroups: new Set(),
  addCharGroupId: null, createGroupSelected: new Set(), momentImageType: 'text',
  momentImageData: null, momentVirtualText: '', acctAvatar: null, importCharList: null
};

var SAVE_KEYS = [
  'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
  'unread', 'drawerFilter', 'drawerSort', 'lang', 'userProfile', 'masks',
  'memories', 'replyPrompt', 'charConfig', 'phoneData', 'bookmarks',
  'groups', 'moments', 'imsgTab',
  'meetings', 'allowQuote', 'systemPromptIM', 'systemPromptMeeting'
];

// ★★★ 状态标志 ★★★
var _stateLoaded = false;
var _forceNextSave = false;
var _saveGeneration = 0;

function _generateAccountId() {
  return 'acct_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function _getStateDefaults() {
  return {
    apis: [], activeApiId: null, characters: [], chats: {}, worldbooks: [], stickers: [],
    unread: {}, currentCharId: null, editingApiId: null, editingCharId: null,
    editingWbId: null, editingMaskId: null, editingMemId: null,
    charEditFrom: 'screen-imessage', drawerFilter: 'all', drawerSort: 'recent',
    drawerSearch: '', lang: 'en', userProfile: { name: 'User', avatar: null },
    masks: [], memories: [], imsgTab: 'messages',
    replyPrompt: (typeof DEFAULT_REPLY_PROMPT !== 'undefined') ? DEFAULT_REPLY_PROMPT : null,
    charConfig: {}, phoneData: {}, bookmarks: [], groups: [], moments: [], meetings: [],
    allowQuote: true, systemPromptIM: '', systemPromptMeeting: ''
  };
}

function _validateState() {
  if (!Array.isArray(state.characters)) state.characters = [];
  if (!state.chats || typeof state.chats !== 'object' || Array.isArray(state.chats)) state.chats = {};
  if (!state.unread || typeof state.unread !== 'object') state.unread = {};
  if (!state.phoneData || typeof state.phoneData !== 'object') state.phoneData = {};
  if (!state.userProfile || typeof state.userProfile !== 'object') state.userProfile = { name: 'User', avatar: null };
  if (!Array.isArray(state.masks)) state.masks = [];
  if (!Array.isArray(state.memories)) state.memories = [];
  if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
  if (state.replyPrompt == null) state.replyPrompt = (typeof DEFAULT_REPLY_PROMPT !== 'undefined') ? DEFAULT_REPLY_PROMPT : null;
  if (!state.charConfig || typeof state.charConfig !== 'object') state.charConfig = {};
  if (!Array.isArray(state.groups)) state.groups = [];
  if (!Array.isArray(state.moments)) state.moments = [];
  if (!Array.isArray(state.worldbooks)) state.worldbooks = [];
  if (!Array.isArray(state.stickers)) state.stickers = [];
  if (!Array.isArray(state.apis)) state.apis = [];
  if (!Array.isArray(state.meetings)) state.meetings = [];
  if (state.allowQuote == null) state.allowQuote = true;
  if (state.systemPromptIM == null) state.systemPromptIM = '';
  if (state.systemPromptMeeting == null) state.systemPromptMeeting = '';
}

function _resetTransientState() {
  state.currentCharId = null; state.editingApiId = null; state.editingCharId = null;
  state.editingWbId = null; state.editingMaskId = null; state.editingMemId = null;
  state.charEditFrom = 'screen-imessage'; state.drawerSearch = '';
  bubbleState.multiMode = false; bubbleState.selectedIds = new Set();
  bubbleState.quoteMsg = null; bubbleState.editingMsgId = null;
  phoneState.selectedCharId = null; phoneState.currentAppId = null;
  tmp.wbEntries = []; tmp.wbGlobal = false; tmp.charAvatar = null;
  tmp.tempModels = null; tmp.popoverMsgId = null; tmp.resolvedBase = null;
  tmp.maskAvatar = null; tmp.imgType = 'real'; tmp.realImageData = null;
  tmp.memPhoto = null; tmp.memMood = ''; tmp.expandedGroups = new Set();
  tmp.addCharGroupId = null; tmp.createGroupSelected = new Set();
  tmp.momentImageType = 'text'; tmp.momentImageData = null;
  tmp.momentVirtualText = ''; tmp.acctAvatar = null; tmp.importCharList = null;
}

function _saveAccountMeta() {
  try {
    var meta = accountStore.accounts.map(function(a) {
      return { id: a.id, name: a.name, avatar: a.avatar };
    });
    localStorage.setItem('ai_app_all_accounts', JSON.stringify(meta));
    localStorage.setItem('ai_app_current_id', accountStore.currentAccountId || '');
  } catch (e) { console.warn('_saveAccountMeta failed', e); }
}

function _loadAccountMeta() {
  try {
    var raw = localStorage.getItem('ai_app_all_accounts');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        accountStore.accounts = parsed;
      } else {
        accountStore.accounts = [];
      }
    } else {
      accountStore.accounts = [];
    }
    var cid = localStorage.getItem('ai_app_current_id');
    accountStore.currentAccountId = (cid && cid.length > 0) ? cid : null;
  } catch (e) {
    console.error('[_loadAccountMeta] 解析失败:', e);
    accountStore.accounts = [];
    accountStore.currentAccountId = null;
  }
}

// ★★★ 防空覆写保护 ★★★
function _saveAccountData(accountId) {
  var s = {};
  SAVE_KEYS.forEach(function(k) { s[k] = state[k]; });

  try {
    var json = JSON.stringify(s);
    var usedKB = Math.round(json.length / 1024);

    // ★ 防空覆写检测
    if (!_forceNextSave) {
      var newChars = (s.characters || []).length;
      var newChats = Object.keys(s.chats || {}).length;
      var newMasks = (s.masks || []).length;
      var newDataScore = newChars + newChats + newMasks;

      if (newDataScore === 0) {
        var existingRaw = null;
        try { existingRaw = localStorage.getItem('ai_app_account_' + accountId); } catch(e) {}

        if (existingRaw) {
          try {
            var existing = JSON.parse(existingRaw);
            var oldChars = (existing.characters || []).length;
            var oldChats = Object.keys(existing.chats || {}).length;
            var oldMasks = (existing.masks || []).length;
            var oldDataScore = oldChars + oldChats + oldMasks;

            if (oldDataScore > 0) {
              console.error('[save] ⛔ 防空覆写！阻止空数据覆盖有效数据。',
                '| 现有: chars=' + oldChars + ' chats=' + oldChats + ' masks=' + oldMasks,
                '| 试图写入: chars=' + newChars + ' chats=' + newChats + ' masks=' + newMasks);
              try {
                localStorage.setItem('ai_app_backup_' + accountId, existingRaw);
              } catch(be) {}
              return;
            }
          } catch (pe) { /* 解析失败，允许覆写 */ }
        }
      }
    }

    if (json.length > 4.5 * 1024 * 1024) {
      console.warn('[save] 数据量过大 (' + usedKB + 'KB)，可能超出 localStorage 5MB 限制');
    }

    localStorage.setItem('ai_app_account_' + accountId, json);
    _saveGeneration++;

    console.log('[save] #' + _saveGeneration, '账号', accountId,
      '| chars:', (s.characters||[]).length,
      '| chats:', Object.keys(s.chats||{}).length,
      '| masks:', (s.masks||[]).length,
      '| size:', usedKB + 'KB');

    // 写入后立即验证
    var verify = localStorage.getItem('ai_app_account_' + accountId);
    if (!verify) {
      console.error('[save] ❌ 写入后读回失败！');
    } else if (verify.length !== json.length) {
      console.error('[save] ❌ 长度不匹配！写入:', json.length, '读回:', verify.length);
    }
  } catch (e) {
    console.error('[save] FAILED for', accountId, e);
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.error('[save] localStorage 已满！');
      try {
        localStorage.removeItem('aiphone8');
        for (var i = localStorage.length - 1; i >= 0; i--) {
          var key = localStorage.key(i);
          if (key && key.indexOf('_backup') > -1) localStorage.removeItem(key);
        }
        localStorage.setItem('ai_app_account_' + accountId, json);
        console.log('[save] 清理后重试成功');
      } catch(e2) {
        console.error('[save] 清理后仍然失败', e2);
      }
    }
  }
}

function _loadAccountData(accountId) {
  try {
    var raw = localStorage.getItem('ai_app_account_' + accountId);
    if (!raw) {
      console.warn('[load] 无数据:', accountId);
      var backupRaw = localStorage.getItem('ai_app_backup_' + accountId);
      if (backupRaw) {
        console.log('[load] ✅ 从备份恢复:', accountId);
        try {
          var backupData = JSON.parse(backupRaw);
          if (backupData && typeof backupData === 'object') {
            localStorage.setItem('ai_app_account_' + accountId, backupRaw);
            return backupData;
          }
        } catch(be) { console.error('[load] 备份解析失败', be); }
      }
      return null;
    }
    var data;
    try {
      data = JSON.parse(raw);
    } catch(parseErr) {
      console.error('[load] JSON 解析失败:', accountId, parseErr);
      try { localStorage.setItem('ai_app_account_' + accountId + '_corrupt_backup', raw); } catch(e) {}
      return null;
    }
    if (!data || typeof data !== 'object') {
      console.error('[load] 数据格式无效:', accountId);
      return null;
    }
    console.log('[load] 账号', accountId,
      '| chars:', (data.characters||[]).length,
      '| chats:', Object.keys(data.chats||{}).length,
      '| masks:', (data.masks||[]).length);
    return data;
  } catch (e) {
    console.error('[load] FAILED:', accountId, e);
    return null;
  }
}

function _deleteAccountData(accountId) {
  try { localStorage.removeItem('ai_app_account_' + accountId); } catch (e) {}
}

function _applyDataToState(data) {
  if (!data) return;
  SAVE_KEYS.forEach(function(k) { if (data[k] !== undefined) state[k] = data[k]; });
}

function _resetStateToDefaults() {
  var defaults = _getStateDefaults();
  Object.keys(defaults).forEach(function(k) { state[k] = defaults[k]; });
}

// ★★★ 孤儿账号扫描 ★★★
function _scanOrphanedAccounts() {
  var found = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key) continue;
      if (key.indexOf('ai_app_account_acct_') === 0 &&
          key.indexOf('_backup') === -1 &&
          key.indexOf('_corrupt') === -1) {
        var accountId = key.replace('ai_app_account_', '');
        var isKnown = false;
        for (var j = 0; j < accountStore.accounts.length; j++) {
          if (accountStore.accounts[j].id === accountId) { isKnown = true; break; }
        }
        if (!isKnown) {
          try {
            var data = JSON.parse(localStorage.getItem(key));
            if (data && typeof data === 'object') {
              var charCount = (data.characters || []).length;
              var chatCount = Object.keys(data.chats || {}).length;
              if (charCount > 0 || chatCount > 0) {
                found.push({
                  id: accountId,
                  name: (data.userProfile && data.userProfile.name) || 'Recovered',
                  avatar: (data.userProfile && data.userProfile.avatar) || null,
                  chars: charCount, chats: chatCount
                });
              }
            }
          } catch(e) {}
        }
      }
    }
  } catch(e) { console.warn('[scanOrphaned] 扫描失败:', e); }
  return found;
}

function _migrateFromLegacy() {
  var oldData = null;
  try { oldData = JSON.parse(localStorage.getItem('aiphone8')); } catch (e) {}

  // ★ 先扫描孤儿
  var orphans = _scanOrphanedAccounts();
  if (orphans.length > 0) {
    console.log('[migrate] 发现', orphans.length, '个孤儿账号，正在恢复...');
    orphans.sort(function(a, b) { return (b.chars + b.chats) - (a.chars + a.chats); });
    var best = orphans[0];
    console.log('[migrate] 恢复孤儿账号:', best.id, '| chars:', best.chars);
    accountStore.accounts = [{ id: best.id, name: best.name, avatar: best.avatar }];
    accountStore.currentAccountId = best.id;
    for (var oi = 1; oi < orphans.length; oi++) {
      accountStore.accounts.push({
        id: orphans[oi].id, name: orphans[oi].name, avatar: orphans[oi].avatar
      });
    }
    _saveAccountMeta();
    return;
  }

  var id = _generateAccountId();
  var acctName = (oldData && oldData.userProfile && oldData.userProfile.name) ? oldData.userProfile.name : '主号';
  var acctAvatar = (oldData && oldData.userProfile && oldData.userProfile.avatar) ? oldData.userProfile.avatar : null;
  accountStore.accounts = [{ id: id, name: acctName, avatar: acctAvatar }];
  accountStore.currentAccountId = id;
  if (oldData) { _applyDataToState(oldData); _validateState(); _saveAccountData(id); }
  else { _saveAccountData(id); }
  _saveAccountMeta();
}

function createAccount(name, avatar) {
  var id = _generateAccountId();
  var account = { id: id, name: name || 'Account', avatar: avatar || null };
  accountStore.accounts.push(account);
  _saveAccountData(accountStore.currentAccountId);
  var prevState = {};
  SAVE_KEYS.forEach(function(k) { prevState[k] = JSON.parse(JSON.stringify(state[k])); });
  _resetStateToDefaults();
  state.userProfile.name = name || 'User';
  state.userProfile.avatar = avatar || null;
  _saveAccountData(id);
  SAVE_KEYS.forEach(function(k) { state[k] = prevState[k]; });
  _saveAccountMeta();
  return account;
}

function deleteAccount(id) {
  if (accountStore.accounts.length <= 1) { try { showToast('Cannot delete the last account'); } catch (e) {} return false; }
  var wasCurrent = (accountStore.currentAccountId === id);
  accountStore.accounts = accountStore.accounts.filter(function(a) { return a.id !== id; });
  _deleteAccountData(id);
  if (wasCurrent) {
    var first = accountStore.accounts[0];
    accountStore.currentAccountId = first.id;
    _resetStateToDefaults();
    var data = _loadAccountData(first.id);
    if (data) _applyDataToState(data);
    _resetTransientState(); _validateState();
  }
  _saveAccountMeta();
  return true;
}

function switchAccount(id) {
  var target = null;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === id) { target = accountStore.accounts[i]; break; }
  }
  if (!target) { console.error('[switch] 目标账号不存在:', id); return false; }
  if (id === accountStore.currentAccountId) return true;
  var oldId = accountStore.currentAccountId;
  console.log('[switch] 保存当前账号:', oldId);
  _saveAccountData(oldId);
  accountStore.currentAccountId = id;
  _resetStateToDefaults();
  var data = _loadAccountData(id);
  if (data) {
    _applyDataToState(data);
    console.log('[switch] 已加载账号:', id, '| chars:', state.characters.length);
  }
  _resetTransientState();
  _validateState();
  _saveAccountMeta();
  return true;
}

function getCurrentAccount() {
  var id = accountStore.currentAccountId;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === id) return accountStore.accounts[i];
  }
  return null;
}

function getAllAccounts() { return accountStore.accounts.slice(); }

function saveState(force) {
  if (force) _forceNextSave = true;
  if (!accountStore.currentAccountId) {
    console.warn('[saveState] 无当前账号ID');
    _forceNextSave = false;
    return;
  }
  _saveAccountData(accountStore.currentAccountId);
  _saveAccountMeta(); // ★ 每次保存同步刷新 meta
  _forceNextSave = false;
}

function loadState() {
  _stateLoaded = false;
  console.log('[loadState] 开始加载...');
  _loadAccountMeta();
  console.log('[loadState] meta | accounts:', accountStore.accounts.length,
    '| currentId:', accountStore.currentAccountId);

  if (!accountStore.accounts || accountStore.accounts.length === 0) {
    console.warn('[loadState] 无账号数据，执行迁移...');
    _migrateFromLegacy();
  }

  var valid = false;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === accountStore.currentAccountId) { valid = true; break; }
  }
  if (!valid) {
    accountStore.currentAccountId = accountStore.accounts[0].id;
    _saveAccountMeta();
  }

  var data = _loadAccountData(accountStore.currentAccountId);
  if (data) _applyDataToState(data);
  _validateState();

  _stateLoaded = true;
  window._loadedSnapshot = {
    chars: state.characters.length,
    chats: Object.keys(state.chats).length,
    masks: state.masks.length,
    worldbooks: state.worldbooks.length,
    meetings: state.meetings.length,
    moments: state.moments.length,
    timestamp: Date.now()
  };

  console.log('[loadState] ✅ 完成 | account:', accountStore.currentAccountId,
    '| chars:', state.characters.length,
    '| chats:', Object.keys(state.chats).length,
    '| masks:', state.masks.length,
    '| worldbooks:', state.worldbooks.length,
    '| meetings:', state.meetings.length);
}

function resetState() {
  console.warn('[resetState] ⚠️ 重置所有数据！');
  _resetStateToDefaults();
  if (typeof DEFAULT_REPLY_PROMPT !== 'undefined') state.replyPrompt = DEFAULT_REPLY_PROMPT;
  _resetTransientState();
  _forceNextSave = true;
  saveState(true);
}

function isStateLoaded() { return _stateLoaded; }

function getOtherAccountsCharacters() {
  var currentId = accountStore.currentAccountId;
  var result = [];
  for (var i = 0; i < accountStore.accounts.length; i++) {
    var acct = accountStore.accounts[i];
    if (acct.id === currentId) continue;
    try {
      var raw = localStorage.getItem('ai_app_account_' + acct.id);
      if (!raw) continue;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.characters)) continue;
      for (var j = 0; j < data.characters.length; j++) {
        result.push({ accountId: acct.id, accountName: acct.name, character: JSON.parse(JSON.stringify(data.characters[j])) });
      }
    } catch (e) { continue; }
  }
  return result;
}



// ═══════════════════════════════════════════════════════════
//  ★★★ 全局导出 — 解决模块作用域隔离问题 ★★★
//  必须放在 state.js 最末尾，所有函数定义之后
// ═══════════════════════════════════════════════════════════
;(function _exportStateGlobals() {
  'use strict';

  // ── 1. 核心数据对象（直接引用，所有模块共享同一对象）──
  window.state         = state;
  window.accountStore  = accountStore;
  window.bubbleState   = bubbleState;
  window.phoneState    = phoneState;
  window.tmp           = tmp;
  window.SAVE_KEYS     = SAVE_KEYS;

  // ── 2. 核心函数 ──
  window.saveState             = saveState;
  window.loadState             = loadState;
  window.resetState            = resetState;

  // ── 3. 账号管理函数 ──
  window.createAccount         = createAccount;
  window.deleteAccount         = deleteAccount;
  window.switchAccount         = switchAccount;
  window.getCurrentAccount     = getCurrentAccount;
  window.getAllAccounts         = getAllAccounts;
  window.getOtherAccountsCharacters = getOtherAccountsCharacters;

  // ── 4. 内部函数（诊断工具 & 其他模块需要）──
  window._getStateDefaults     = _getStateDefaults;
  window._loadAccountMeta      = _loadAccountMeta;
  window._loadAccountData      = _loadAccountData;
  window._saveAccountData      = _saveAccountData;
  window._applyDataToState     = _applyDataToState;
  window._validateState        = _validateState;
  window._saveAccountMeta      = _saveAccountMeta;
  window._resetStateToDefaults = _resetStateToDefaults;
  window._resetTransientState  = _resetTransientState;
  window._generateAccountId    = _generateAccountId;

  // ── 5. 验证导出成功 ──
  console.log('[state.js] ✅ 全局导出完成',
    '| window.state.characters:', state.characters.length,
    '| window.saveState:', typeof window.saveState);
})();
