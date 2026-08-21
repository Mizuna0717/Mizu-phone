// ========== 02-state.js ==========
// 多账号系统 — 数据层

// ===== Account Store (元数据) =====
let accountStore = {
  accounts: [],
  currentAccountId: null
};

// ===== State (当前账号的活跃数据，全局引用不变) =====
let state = {
  apis: [],
  activeApiId: null,
  characters: [],
  chats: {},
  worldbooks: [],
  stickers: [],
  unread: {},
  currentCharId: null,
  editingApiId: null,
  editingCharId: null,
  editingWbId: null,
  editingMaskId: null,
  editingMemId: null,
  charEditFrom: 'screen-imessage',
  drawerFilter: 'all',
  drawerSort: 'recent',
  drawerSearch: '',
  lang: 'en',
  userProfile: { name: 'User', avatar: null },
  masks: [],
  memories: [],
  imsgTab: 'messages',
  replyPrompt: null,
  charConfig: {},
  phoneData: {},
  bookmarks: [],
  groups: [],
  moments: []
};

let bubbleState = {
  multiMode: false,
  selectedIds: new Set(),
  quoteMsg: null,
  editingMsgId: null
};

let phoneState = {
  selectedCharId: null,
  currentAppId: null
};

let tmp = {
  wbEntries: [],
  wbGlobal: false,
  charAvatar: null,
  tempModels: null,
  popoverMsgId: null,
  resolvedBase: null,
  maskAvatar: null,
  imgType: 'real',
  realImageData: null,
  memPhoto: null,
  memMood: '',
  expandedGroups: new Set(),
  addCharGroupId: null,
  createGroupSelected: new Set(),
  momentImageType: 'text',
  momentImageData: null,
  momentVirtualText: '',
  acctAvatar: null,
  importCharList: null

};

// 需要持久化的 state 字段
var SAVE_KEYS = [
  'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
  'unread', 'drawerFilter', 'drawerSort', 'lang', 'userProfile', 'masks',
  'memories', 'replyPrompt', 'charConfig', 'phoneData', 'bookmarks',
  'groups', 'moments', 'imsgTab'
];

// =============================================
//  内部工具
// =============================================

function _generateAccountId() {
  return 'acct_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function _getStateDefaults() {
  return {
    apis: [],
    activeApiId: null,
    characters: [],
    chats: {},
    worldbooks: [],
    stickers: [],
    unread: {},
    currentCharId: null,
    editingApiId: null,
    editingCharId: null,
    editingWbId: null,
    editingMaskId: null,
    editingMemId: null,
    charEditFrom: 'screen-imessage',
    drawerFilter: 'all',
    drawerSort: 'recent',
    drawerSearch: '',
    lang: 'en',
    userProfile: { name: 'User', avatar: null },
    masks: [],
    memories: [],
    imsgTab: 'messages',
    replyPrompt: (typeof DEFAULT_REPLY_PROMPT !== 'undefined') ? DEFAULT_REPLY_PROMPT : null,
    charConfig: {},
    phoneData: {},
    bookmarks: [],
    groups: [],
    moments: []
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
}

function _resetTransientState() {
  state.currentCharId = null;
  state.editingApiId = null;
  state.editingCharId = null;
  state.editingWbId = null;
  state.editingMaskId = null;
  state.editingMemId = null;
  state.charEditFrom = 'screen-imessage';
  state.drawerSearch = '';

  bubbleState.multiMode = false;
  bubbleState.selectedIds = new Set();
  bubbleState.quoteMsg = null;
  bubbleState.editingMsgId = null;

  phoneState.selectedCharId = null;
  phoneState.currentAppId = null;

  tmp.wbEntries = [];
  tmp.wbGlobal = false;
  tmp.charAvatar = null;
  tmp.tempModels = null;
  tmp.popoverMsgId = null;
  tmp.resolvedBase = null;
  tmp.maskAvatar = null;
  tmp.imgType = 'real';
  tmp.realImageData = null;
  tmp.memPhoto = null;
  tmp.memMood = '';
  tmp.expandedGroups = new Set();
  tmp.addCharGroupId = null;
  tmp.createGroupSelected = new Set();
  tmp.momentImageType = 'text';
  tmp.momentImageData = null;
  tmp.momentVirtualText = '';
  tmp.acctAvatar = null;
  tmp.importCharList = null;

}

// =============================================
//  localStorage 读写
// =============================================

function _saveAccountMeta() {
  try {
    var meta = accountStore.accounts.map(function (a) {
      return { id: a.id, name: a.name, avatar: a.avatar };
    });
    localStorage.setItem('ai_app_all_accounts', JSON.stringify(meta));
    localStorage.setItem('ai_app_current_id', accountStore.currentAccountId || '');
  } catch (e) { console.warn('_saveAccountMeta failed', e); }
}

function _loadAccountMeta() {
  try {
    var raw = localStorage.getItem('ai_app_all_accounts');
    if (raw) accountStore.accounts = JSON.parse(raw) || [];
    accountStore.currentAccountId = localStorage.getItem('ai_app_current_id') || null;
  } catch (e) {
    accountStore.accounts = [];
    accountStore.currentAccountId = null;
  }
}

function _saveAccountData(accountId) {
  var s = {};
  SAVE_KEYS.forEach(function (k) { s[k] = state[k]; });
  try {
    localStorage.setItem('ai_app_account_' + accountId, JSON.stringify(s));
  } catch (e) { console.warn('_saveAccountData failed', e); }
}

function _loadAccountData(accountId) {
  try {
    return JSON.parse(localStorage.getItem('ai_app_account_' + accountId)) || null;
  } catch (e) { return null; }
}

function _deleteAccountData(accountId) {
  try { localStorage.removeItem('ai_app_account_' + accountId); } catch (e) {}
}

function _applyDataToState(data) {
  if (!data) return;
  SAVE_KEYS.forEach(function (k) {
    if (data[k] !== undefined) state[k] = data[k];
  });
}

function _resetStateToDefaults() {
  var defaults = _getStateDefaults();
  Object.keys(defaults).forEach(function (k) { state[k] = defaults[k]; });
}

// =============================================
//  旧数据迁移
// =============================================

function _migrateFromLegacy() {
  var oldData = null;
  try { oldData = JSON.parse(localStorage.getItem('aiphone8')); } catch (e) {}

  var id = _generateAccountId();
  var acctName = (oldData && oldData.userProfile && oldData.userProfile.name) ? oldData.userProfile.name : '主号';
  var acctAvatar = (oldData && oldData.userProfile && oldData.userProfile.avatar) ? oldData.userProfile.avatar : null;

  var account = { id: id, name: acctName, avatar: acctAvatar };
  accountStore.accounts = [account];
  accountStore.currentAccountId = id;

  if (oldData) {
    _applyDataToState(oldData);
    _validateState();
    _saveAccountData(id);
    console.log('✅ 已将旧数据 (aiphone8) 迁移到账号:', acctName);
  } else {
    _saveAccountData(id);
  }

  _saveAccountMeta();
}

// =============================================
//  公开 API：账号管理
// =============================================

/**
 * 创建新账号
 * @param {string} name - 账号名称
 * @param {string|null} avatar - 头像 dataUrl（可选）
 * @returns {{ id:string, name:string, avatar:string|null }}
 */
function createAccount(name, avatar) {
  var id = _generateAccountId();
  var account = { id: id, name: name || 'Account', avatar: avatar || null };
  accountStore.accounts.push(account);

  // 暂存当前 state
  var prevState = {};
  SAVE_KEYS.forEach(function (k) { prevState[k] = state[k]; });

  // 用干净默认值初始化新账号数据
  _resetStateToDefaults();
  state.userProfile.name = name || 'User';
  state.userProfile.avatar = avatar || null;
  _saveAccountData(id);

  // 恢复当前 state
  SAVE_KEYS.forEach(function (k) { state[k] = prevState[k]; });

  _saveAccountMeta();
  return account;
}

/**
 * 删除账号（不能删除最后一个）
 * @param {string} id
 * @returns {boolean}
 */
function deleteAccount(id) {
  if (accountStore.accounts.length <= 1) {
    try { showToast('Cannot delete the last account'); } catch (e) {}
    return false;
  }

  var wasCurrent = (accountStore.currentAccountId === id);

  accountStore.accounts = accountStore.accounts.filter(function (a) { return a.id !== id; });
  _deleteAccountData(id);

  if (wasCurrent) {
    var first = accountStore.accounts[0];
    accountStore.currentAccountId = first.id;

    _resetStateToDefaults();
    var data = _loadAccountData(first.id);
    if (data) _applyDataToState(data);
    _resetTransientState();
    _validateState();
  }

  _saveAccountMeta();
  return true;
}

/**
 * 切换到另一个账号
 * @param {string} id
 * @returns {boolean}
 */
function switchAccount(id) {
  var target = null;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === id) { target = accountStore.accounts[i]; break; }
  }
  if (!target) return false;
  if (id === accountStore.currentAccountId) return true;

  // 1. 保存当前账号数据
  if (accountStore.currentAccountId) {
    _saveAccountData(accountStore.currentAccountId);
  }

  // 2. 切换
  accountStore.currentAccountId = id;

  // 3. 重置 state → 加载目标账号
  _resetStateToDefaults();
  var data = _loadAccountData(id);
  if (data) _applyDataToState(data);
  _resetTransientState();
  _validateState();

  // 4. 持久化元数据
  _saveAccountMeta();

  return true;
}

/** 获取当前账号元数据 */
function getCurrentAccount() {
  var id = accountStore.currentAccountId;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === id) return accountStore.accounts[i];
  }
  return null;
}

/** 获取所有账号元数据列表（副本） */
function getAllAccounts() {
  return accountStore.accounts.slice();
}

// =============================================
//  兼容接口：saveState / loadState / resetState
// =============================================

function saveState() {
  if (!accountStore.currentAccountId) return;
  _saveAccountData(accountStore.currentAccountId);
}

function loadState() {
  _loadAccountMeta();

  if (!accountStore.accounts || accountStore.accounts.length === 0) {
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
}

function resetState() {
  _resetStateToDefaults();

  if (typeof DEFAULT_REPLY_PROMPT !== 'undefined') {
    state.replyPrompt = DEFAULT_REPLY_PROMPT;
  }

  _resetTransientState();
  saveState();
}

/**
 * 读取其他账号中的所有角色（不切换账号）
 * 返回 [{ accountId, accountName, character }, ...]
 */
function getOtherAccountsCharacters() {
  var currentId = accountStore.currentAccountId;
  var result = [];
  for (var i = 0; i < accountStore.accounts.length; i++) {
    var acct = accountStore.accounts[i];
    if (acct.id === currentId) continue;
    var data = _loadAccountData(acct.id);
    if (!data || !Array.isArray(data.characters)) continue;
    for (var j = 0; j < data.characters.length; j++) {
      result.push({
        accountId: acct.id,
        accountName: acct.name,
        character: JSON.parse(JSON.stringify(data.characters[j]))
      });
    }
  }
  return result;
}
