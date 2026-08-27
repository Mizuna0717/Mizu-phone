// ========== 02-state.js ==========
let accountStore = { accounts: [], currentAccountId: null };

// 1. In the state object, add meetings:
let state = {
  apis: [], activeApiId: null, characters: [], chats: {}, worldbooks: [], stickers: [],
  unread: {}, currentCharId: null, editingApiId: null, editingCharId: null,
  editingWbId: null, editingMaskId: null, editingMemId: null,
  charEditFrom: 'screen-imessage', drawerFilter: 'all', drawerSort: 'recent',
  drawerSearch: '', lang: 'en', userProfile: { name: 'User', avatar: null },
  masks: [], memories: [], imsgTab: 'messages', replyPrompt: null, charConfig: {},
  phoneData: {}, bookmarks: [], groups: [], moments: [],
  meetings: [],
  allowQuote: true,         // ★ NEW — 引用信息开关，默认开启
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

// 2. In SAVE_KEYS, add 'meetings', 'allowQuote', 'systemPromptIM', 'systemPromptMeeting':
var SAVE_KEYS = [
  'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
  'unread', 'drawerFilter', 'drawerSort', 'lang', 'userProfile', 'masks',
  'memories', 'replyPrompt', 'charConfig', 'phoneData', 'bookmarks',
  'groups', 'moments', 'imsgTab',
  'meetings',
  'allowQuote',             // ★ NEW
  'systemPromptIM',
  'systemPromptMeeting'
];

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
    allowQuote: true,         // ★ NEW
    systemPromptIM: '',
    systemPromptMeeting: ''
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
  // ★ NEW: 引用信息开关默认开启
  if (state.allowQuote == null) state.allowQuote = true;
  // ★ NEW: 确保 systemPromptIM 和 systemPromptMeeting 始终为字符串
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
    var meta = accountStore.accounts.map(function(a) { return { id: a.id, name: a.name, avatar: a.avatar }; });
    localStorage.setItem('ai_app_all_accounts', JSON.stringify(meta));
    localStorage.setItem('ai_app_current_id', accountStore.currentAccountId || '');
  } catch (e) { console.warn('_saveAccountMeta failed', e); }
}

function _loadAccountMeta() {
  try {
    var raw = localStorage.getItem('ai_app_all_accounts');
    if (raw) accountStore.accounts = JSON.parse(raw) || [];
    accountStore.currentAccountId = localStorage.getItem('ai_app_current_id') || null;
  } catch (e) { accountStore.accounts = []; accountStore.currentAccountId = null; }
}

function _saveAccountData(accountId) {
  var s = {};
  SAVE_KEYS.forEach(function(k) { s[k] = state[k]; });
  try {
    var json = JSON.stringify(s);
    localStorage.setItem('ai_app_account_' + accountId, json);
    console.log('[save] 账号', accountId, '| chars:', (s.characters||[]).length, '| masks:', (s.masks||[]).length, '| moments:', (s.moments||[]).length, '| bytes:', json.length);
  } catch (e) { console.error('[save] FAILED for', accountId, e); }
}

function _loadAccountData(accountId) {
  try {
    var raw = localStorage.getItem('ai_app_account_' + accountId);
    if (!raw) { console.warn('[load] 无数据:', accountId); return null; }
    var data = JSON.parse(raw);
    console.log('[load] 账号', accountId, '| chars:', (data.characters||[]).length, '| masks:', (data.masks||[]).length, '| moments:', (data.moments||[]).length);
    return data;
  } catch (e) { console.error('[load] FAILED:', accountId, e); return null; }
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

function _migrateFromLegacy() {
  var oldData = null;
  try { oldData = JSON.parse(localStorage.getItem('aiphone8')); } catch (e) {}
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
  console.log('[switch] 保存当前账号:', oldId, '| chars:', state.characters.length);
  _saveAccountData(oldId);
  var verifyData = _loadAccountData(oldId);
  if (!verifyData) {
    console.error('[switch] 保存验证失败！当前账号数据可能丢失:', oldId);
  } else {
    console.log('[switch] 保存验证通过 | chars:', verifyData.characters.length);
  }
  accountStore.currentAccountId = id;
  _resetStateToDefaults();
  var data = _loadAccountData(id);
  if (data) {
    _applyDataToState(data);
    console.log('[switch] 已加载账号:', id, '| chars:', state.characters.length, '| masks:', state.masks.length);
  } else {
    console.warn('[switch] 目标账号无数据，使用默认值:', id);
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

function saveState() {
  if (!accountStore.currentAccountId) { console.warn('[saveState] 无当前账号ID'); return; }
  _saveAccountData(accountStore.currentAccountId);
}

function loadState() {
  _loadAccountMeta();
  if (!accountStore.accounts || accountStore.accounts.length === 0) { _migrateFromLegacy(); }
  var valid = false;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === accountStore.currentAccountId) { valid = true; break; }
  }
  if (!valid) { accountStore.currentAccountId = accountStore.accounts[0].id; _saveAccountMeta(); }
  var data = _loadAccountData(accountStore.currentAccountId);
  if (data) _applyDataToState(data);
  _validateState();
}

function resetState() {
  _resetStateToDefaults();
  if (typeof DEFAULT_REPLY_PROMPT !== 'undefined') state.replyPrompt = DEFAULT_REPLY_PROMPT;
  _resetTransientState(); saveState();
}

function getOtherAccountsCharacters() {
  var currentId = accountStore.currentAccountId;
  var result = [];
  for (var i = 0; i < accountStore.accounts.length; i++) {
    var acct = accountStore.accounts[i];
    if (acct.id === currentId) continue;
    var storageKey = 'ai_app_account_' + acct.id;
    try {
      var raw = localStorage.getItem(storageKey);
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
