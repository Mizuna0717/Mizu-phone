// ========== 02-state.js ==========
// ========== 图标专用 IndexedDB（与 AI_DB 无关，独立库）==========
var _iconDB = null;
function _getIconDB() {
  if (_iconDB) return Promise.resolve(_iconDB);
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open('ai_app_icons_db', 1);
    req.onupgradeneeded = function() {
      var db = req.result;
      if (!db.objectStoreNames.contains('icons')) {
        db.createObjectStore('icons', { keyPath: 'k' });
      }
    };
    req.onsuccess = function() { _iconDB = req.result; resolve(_iconDB); };
    req.onerror = function() { reject(req.error); };
  });
}

async function _saveIconsToIDB(accountId, iconsObj) {
  try {
    var db = await _getIconDB();
    await new Promise(function(resolve, reject) {
      var tx = db.transaction('icons', 'readwrite');
      var store = tx.objectStore('icons');

      // ★ 先删掉该账号所有旧图标，再写新的
      //   这样 Reset 后传空对象时，旧图标会被清掉
      var range = IDBKeyRange.bound(accountId + '::', accountId + '::~');
      var deleteCursor = store.openCursor(range);
      deleteCursor.onsuccess = function(e) {
        var c = e.target.result;
        if (c) {
          store.delete(c.key);
          c.continue();
        } else {
          // 旧图标清空完毕，开始写新的
          Object.keys(iconsObj).forEach(function(k) {
            store.put({ k: accountId + '::' + k, accountId: accountId, key: k, data: iconsObj[k] });
          });
        }
      };
      deleteCursor.onerror = function(e) { reject(e.target.error); };

      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
      tx.onabort = function() { reject(tx.error); };
    });
    return true;
  } catch (e) {
    console.error('[icons] IDB 保存失败:', e);
    return false;
  }
}

async function _loadIconsFromIDB(accountId) {
  try {
    var db = await _getIconDB();
    return await new Promise(function(resolve) {
      var tx = db.transaction('icons', 'readonly');
      var store = tx.objectStore('icons');
      var result = {};
      var range = IDBKeyRange.bound(accountId + '::', accountId + '::~');
      var req = store.openCursor(range);
      req.onsuccess = function() {
        var c = req.result;
        if (c) { result[c.value.key] = c.value.data; c.continue(); }
        else { resolve(result); }
      };
      req.onerror = function() { resolve({}); };
    });
  } catch (e) {
    console.error('[icons] IDB 加载失败:', e);
    return {};
  }
}

async function _deleteIconsFromIDB(accountId) {
  try {
    var db = await _getIconDB();
    await new Promise(function(resolve) {
      var tx = db.transaction('icons', 'readwrite');
      var store = tx.objectStore('icons');
      var range = IDBKeyRange.bound(accountId + '::', accountId + '::~');
      store.openCursor(range).onsuccess = function(e) {
        var c = e.target.result;
        if (c) { store.delete(c.key); c.continue(); }
      };
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { resolve(); };
    });
  } catch (e) {}
}
// ========== 图标专用 IDB 结束 ==========

let accountStore = { accounts: [], currentAccountId: null };

let state = {
  apis: [], activeApiId: null, characters: [], chats: {}, worldbooks: [], stickers: [],
  unread: {}, currentCharId: null, editingApiId: null, editingCharId: null,
  editingWbId: null, editingMaskId: null, editingMemId: null,
  charEditFrom: 'screen-imessage', drawerFilter: 'all', drawerSort: 'recent',
  drawerSearch: '', lang: 'en', userProfile: { name: 'User', avatar: null },
  masks: [], memories: [], imsgTab: 'messages', replyPrompt: null, charConfig: {},
  phoneData: {}, bookmarks: [], groups: [], moments: [],messageChats: [], callHistory: [],
    meetings: [],mailData: [],socialData: [],walletData: [],calendarData: [],
  npcs: [],notesData: [],musicData: [],travelData: [],shoppingData: [],
  wikiSchedule: [],
  home: { weather: { temperature: '--', condition: '--', humidity: '--', city: '', updatedAt: '' }, widget: { topLeftText: 'Mizu phone.com', topRightText: 'Mizu', avatar: { type: 'url', value: '' }, titleText: 'Mizu', description: ['🤍ineedu…^', '너에 대한 그리움은 사랑니처럼 은근히 아파 ⊹ '], images: [{ type: 'url', value: '' }, { type: 'url', value: '' }, { type: 'url', value: '' }] }, weatherWidget: { recordText: ['♡ㅠ ㅠ…？', 'i 🤍uuu so..'], image: { type: 'url', value: '' } } },
    allowQuote: true,
    theme: { fontSize: 'medium', chatBubble: '', chatInterface: '', meetingStyle: '', heartPanel: '', meetingArchive: '', chatTopBar: '', chatInput: '', chatCards: '', callScreen: '', general: { fontSize: 'medium',homeIcons: {}, desktopBackground: { type: 'url', value: '' }, desktopIcon: { type: 'url', value: '' }, iconNames: {}, iconSettings: {}, chatBackground: { type: 'url', value: '' } } },
          systemPromptIM: '',
  systemPromptMeeting: '',
  imPromptMode: 'default_no_punc',
  meetingPromptMode: 'default',
  user: null
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
  'memories', 'replyPrompt', 'charConfig', 'phoneData', 'bookmarks','mailData' , 'calendarData' ,          
    'groups', 'moments', 'imsgTab','messageChats', 'callHistory' ,'socialData' , 'walletData' ,            
    'meetings', 'npcs', 'allowQuote', 'systemPromptIM', 'systemPromptMeeting', 'theme','imPromptMode', 'meetingPromptMode',
  'wikiSchedule', 'together', 'home', 'settings','notesData' ,'musicData','travelData','shoppingData'
];

var _stateLoaded = false;
var _forceNextSave = false;
var _saveGeneration = 0;
window.__dirtyChats = window.__dirtyChats || new Set();   // ← 加这一行

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
    replyPrompt: (typeof DEFAULT_REPLY_PROMPT !== 'undefined') ? DEFAULT_REPLY_PROMPT : null,    imPromptMode: 'default_no_punc',
    meetingPromptMode: 'default',
    charConfig: {}, phoneData: {}, bookmarks: [], groups: [], moments: [], meetings: [],
    npcs: [], messageChats: [], callHistory: [], mailData: [], socialData: [],
      wikiSchedule: [],walletData: [],calendarData: [], notesData: [],musicData: [],travelData: [],shoppingData: [],
        together: { songs: [], videos: [], novels: [] },
    theme: { fontSize: 'medium', chatBubble: '', chatInterface: '', meetingStyle: '', heartPanel: '', meetingArchive: '', chatTopBar: '', chatInput: '', chatCards: '', callScreen: '', general: { fontSize: 'medium', desktopBackground: { type: 'url', value: '' }, desktopIcon: { type: 'url', value: '' }, iconNames: {}, iconSettings: {}, chatBackground: { type: 'url', value: '' } } },
    settings: {
      retrieval: {
        mode: 'auto',
        topK: 3,
        timeDecay: 0.99,
        embedding: { enabled: false, baseUrl: '', apiKey: '', model: 'text-embedding-3-small', timeout: 15 }
      }
    },
    user: null
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
  // FTM expiresAt migration: ensure all ftm entries have expiresAt
  if (Array.isArray(state.memories)) {
    var _now = Date.now();
    var _3days = 3 * 24 * 60 * 60 * 1000;
    state.memories.forEach(function(m) {
      if (m.memType === 'ftm' && !m.expiresAt) {
        m.expiresAt = _now + _3days;
      }
    });
  }
  if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
  if (state.replyPrompt == null) state.replyPrompt = (typeof DEFAULT_REPLY_PROMPT !== 'undefined') ? DEFAULT_REPLY_PROMPT : null;
  if (!state.charConfig || typeof state.charConfig !== 'object') state.charConfig = {};
  if (!Array.isArray(state.groups)) state.groups = [];
  if (!Array.isArray(state.moments)) state.moments = [];
  if (!Array.isArray(state.worldbooks)) state.worldbooks = [];
  if (!Array.isArray(state.stickers)) state.stickers = [];
  if (!Array.isArray(state.apis)) state.apis = [];
  if (!Array.isArray(state.meetings)) state.meetings = [];
  if (!Array.isArray(state.messageChats)) state.messageChats = [];
  if (!Array.isArray(state.callHistory)) state.callHistory = [];
  if (!Array.isArray(state.mailData)) state.mailData = [];
  if (!Array.isArray(state.socialData)) state.socialData = [];
  if (!Array.isArray(state.walletData)) state.walletData = [];
  if (!Array.isArray(state.calendarData)) state.calendarData = [];
  if (!Array.isArray(state.notesData)) state.notesData = [];
  if (!Array.isArray(state.musicData)) state.musicData = [];
  if (!Array.isArray(state.travelData)) state.travelData = [];
  if (!Array.isArray(state.shoppingData)) state.shoppingData = [];
  if (!Array.isArray(state.npcs)) state.npcs = [];
  if (!Array.isArray(state.wikiSchedule)) state.wikiSchedule = [];
    if (!state.imPromptMode) state.imPromptMode = 'default_no_punc';
  if (!state.meetingPromptMode) state.meetingPromptMode = 'default';



    if (!state.together || typeof state.together !== 'object') state.together = { songs: [], videos: [], novels: [], currentIndex: 0 };
  if (!Array.isArray(state.together.songs))  state.together.songs  = [];
  if (!Array.isArray(state.together.videos)) state.together.videos = [];
  if (!Array.isArray(state.together.novels)) state.together.novels = [];
  if (state.together.currentIndex == null)   state.together.currentIndex = 0;
  if (!state.theme || typeof state.theme !== 'object') state.theme = { fontSize: 'medium', chatBubble: '', chatInterface: '', meetingStyle: '', heartPanel: '', meetingArchive: '' };
  if (!state.theme.fontSize) state.theme.fontSize = 'medium';
  if (state.theme.chatBubble == null) state.theme.chatBubble = '';
  if (state.theme.chatInterface == null) state.theme.chatInterface = '';
  if (state.theme.meetingStyle == null) state.theme.meetingStyle = '';
  if (state.theme.heartPanel == null) state.theme.heartPanel = '';
  if (state.theme.meetingArchive == null) state.theme.meetingArchive = '';
  if (state.theme.chatTopBar == null) state.theme.chatTopBar = '';
  if (state.theme.chatInput == null) state.theme.chatInput = '';
  if (state.theme.chatCards == null) state.theme.chatCards = '';
  if (state.theme.callScreen == null) state.theme.callScreen = '';
  if (!state.theme.general || typeof state.theme.general !== 'object') state.theme.general = { fontSize: 'medium', desktopBackground: { type: 'url', value: '' }, desktopIcon: { type: 'url', value: '' }, iconNames: {}, chatBackground: { type: 'url', value: '' } };
  if (!state.theme.general.desktopBackground) state.theme.general.desktopBackground = { type: 'url', value: '' };
  if (!state.theme.general.desktopIcon) state.theme.general.desktopIcon = { type: 'url', value: '' };
  if (!state.theme.general.iconNames) state.theme.general.iconNames = {};
  if (!state.theme.general.iconSettings) state.theme.general.iconSettings = {};
  if (!state.theme.general.chatBackground) state.theme.general.chatBackground = { type: 'url', value: '' };
  if (!state.theme.general.homeIcons) state.theme.general.homeIcons = {};
  if (!state.home || typeof state.home !== 'object') state.home = {};
  if (!state.home.weather || typeof state.home.weather !== 'object') state.home.weather = { temperature: '--', condition: '--', humidity: '--', city: '', updatedAt: '' };
  if (!state.home.widget || typeof state.home.widget !== 'object') state.home.widget = { topLeftText: 'Mizu phone.com', topRightText: 'Mizu', avatar: { type: 'url', value: '' }, titleText: 'Mizu', description: ['🤍ineedu…^', '너에 대한 그리움은 사랑니처럼 은근히 아파 ⊹ '], images: [{ type: 'url', value: '' }, { type: 'url', value: '' }, { type: 'url', value: '' }] };
    if (!state.home.widget.avatar) state.home.widget.avatar = { type: 'url', value: '' };
  if (!Array.isArray(state.home.widget.images) || state.home.widget.images.length < 3) state.home.widget.images = [{ type: 'url', value: '' }, { type: 'url', value: '' }, { type: 'url', value: '' }];
  if (!Array.isArray(state.home.widget.description)) state.home.widget.description = ['🤍ineedu…^', '너에 대한 그리움은 사랑니처럼 은근히 아파 ⊹ '];
  if (!state.home.weatherWidget || typeof state.home.weatherWidget !== 'object') state.home.weatherWidget = { recordText: ['♡ㅠ ㅠ…？', 'i 🤍uuu so..'], image: { type: 'url', value: '' } };
  if (!Array.isArray(state.home.weatherWidget.recordText)) state.home.weatherWidget.recordText = ['♡ㅠ ㅠ…？', 'i 🤍uuu so..'];
  if (!state.home.weatherWidget.image) state.home.weatherWidget.image = { type: 'url', value: '' };
  if (!state.home.weatherWidget.image.value) state.home.weatherWidget.image = { type: 'url', value: 'images/weather-1.jpg' };
  if (!state.home.widget.avatar || !state.home.widget.avatar.value) state.home.widget.avatar = { type: 'url', value: 'images/blog-avatar.jpg' };
  if (window.__user) {
    state.user = window.__user;
  }

  // settings.retrieval 初始化
  if (!state.settings || typeof state.settings !== 'object') state.settings = {};
  if (!state.settings.retrieval || typeof state.settings.retrieval !== 'object') {
    state.settings.retrieval = { mode: 'auto', topK: 3, timeDecay: 0.99, embedding: { enabled: false, baseUrl: '', apiKey: '', model: 'text-embedding-3-small', timeout: 15 } };
  }
  var _r = state.settings.retrieval;
  if (!_r.mode) _r.mode = 'auto';
  if (!(_r.topK > 0)) _r.topK = 3;
  if (!(_r.timeDecay > 0)) _r.timeDecay = 0.99;
  if (!_r.embedding || typeof _r.embedding !== 'object') _r.embedding = { enabled: false, baseUrl: '', apiKey: '', model: 'text-embedding-3-small', timeout: 15 };
  if (_r.embedding.timeout == null) _r.embedding.timeout = 15;
  // Embedding rebuild flag (transient, not persisted)
  if (state.embeddingRebuildInProgress == null) state.embeddingRebuildInProgress = false;

  if (Array.isArray(state.meetings)) {
    state.meetings.forEach(function(session) {
      if (!Array.isArray(session.shortTermMemories))  session.shortTermMemories = [];
      if (!Array.isArray(session.shortTermMemory))    session.shortTermMemory = [];
      if (!Array.isArray(session.history))             session.history = [];
      if (session.lastSummarizedEntryIdx === undefined) session.lastSummarizedEntryIdx = 0;
      if (session.consolidateThreshold === undefined)   session.consolidateThreshold = 5;
    });
  }
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

async function _saveAccountMeta() {
  var meta = {
    accounts: accountStore.accounts.map(function(a) {
      return { id: a.id, name: a.name, avatar: a.avatar };
    }),
    currentId: accountStore.currentAccountId || null,
    savedAt: Date.now()
  };

  // 主：IDB
  try {
    await window.AI_DB.saveMeta(meta);
  } catch (e) {
    console.warn('[_saveAccountMeta] IDB 失败:', e);
  }

  // 备：LS（保留原有兼容）
  try {
    localStorage.setItem('ai_app_all_accounts', JSON.stringify(meta.accounts));
    localStorage.setItem('ai_app_current_id', meta.currentId || '');
  } catch (e) {
    console.warn('[_saveAccountMeta] LS 失败:', e);
  }
}

async function _loadAccountMeta() {
  // 主：IDB
  var idbMeta = null;
  try {
    idbMeta = await window.AI_DB.loadMeta();
  } catch (e) {}

  if (idbMeta && Array.isArray(idbMeta.accounts)) {
    accountStore.accounts = idbMeta.accounts;
    accountStore.currentAccountId = idbMeta.currentId || null;
    console.log('[_loadAccountMeta] 从 IDB 加载:', accountStore.accounts.length, '个账号');
    return;
  }

  // 备：LS（首次迁移或 IDB 为空）
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

    // 迁移到 IDB
    if (accountStore.accounts.length > 0) {
      await _saveAccountMeta();
      console.log('[_loadAccountMeta] LS → IDB 迁移完成');
    }
  } catch (e) {
    console.error('[_loadAccountMeta] 解析失败:', e);
    accountStore.accounts = [];
    accountStore.currentAccountId = null;
  }
}

async function _saveAccountData(accountId) {
  if (!accountId) return;

  var s = {};
  SAVE_KEYS.forEach(function(k) { s[k] = state[k]; });
    // ★ 把 homeIcons 从主 JSON 里剥离，单独存 IDB
  var _homeIconsToSave = undefined;
if (s.theme && s.theme.general && s.theme.general.homeIcons !== undefined) {
    _homeIconsToSave = s.theme.general.homeIcons;
    s.theme = JSON.parse(JSON.stringify(s.theme));
    var _namesOnly = {};
    Object.keys(_homeIconsToSave).forEach(function(k) {
      _namesOnly[k] = { name: _homeIconsToSave[k].name };
    });
    s.theme.general.homeIcons = _namesOnly;
  }

  var _localForce = _forceNextSave;

  // ── 同步部分：序列化 ──
  var json;
  try {
    json = JSON.stringify(s);
  } catch (e) {
    console.error('[save] 序列化失败:', e);
    return;
  }
  var usedKB = Math.round(json.length / 1024);

  // ── 防空覆写检查 ──
  if (!_localForce) {
    var newChars = (s.characters || []).length;
    var newChats = Object.keys(s.chats || {}).length;
    var newMasks = (s.masks || []).length;
    var newDataScore = newChars + newChats + newMasks;

    if (newDataScore === 0) {
      var existing = null;
      try { existing = await window.AI_DB.loadAccount(accountId); } catch(e) {}
      if (!existing) {
        try {
          var existingRaw = localStorage.getItem('ai_app_account_' + accountId);
          if (existingRaw) existing = JSON.parse(existingRaw);
        } catch(e) {}
      }
      if (existing) {
        var oldChars = (existing.characters || []).length;
        var oldChats = Object.keys(existing.chats || {}).length;
        var oldMasks = (existing.masks || []).length;
        var oldDataScore = oldChars + oldChats + oldMasks;

        if (oldDataScore > 0) {
          console.error('[save] 防空覆写！阻止空数据覆盖有效数据。',
            '| 现有: chars=' + oldChars + ' chats=' + oldChats + ' masks=' + oldMasks,
            '| 试图写入: chars=' + newChars + ' chats=' + newChats + ' masks=' + newMasks);
          try {
            localStorage.setItem('ai_app_backup_' + accountId, JSON.stringify(existing));
          } catch(be) {}
          return;
        }
      }
    }
  }

// ── IDB 写入：主数据 + chat 分片 ──
var idbOk = false;
var chatWritesFailed = [];
try {
  // 1. 主数据（不含 chats，或者 chats 只存摘要）
  var sForIdb = Object.assign({}, s);
  var chatsSnapshot = sForIdb.chats || {};
  sForIdb.chats = {};  // 主记录里不存完整 chats
  sForIdb._chatIds = Object.keys(chatsSnapshot);  // 只存 charId 列表

  idbOk = await window.AI_DB.saveAccount(accountId, sForIdb);

  // 2. chat 分片：只写变化的（★ 必须 await，写成功才清 dirty）
  var changedChatIds = window.__dirtyChats || new Set();
  if (changedChatIds.size === 0) {
    // 没有标记变化，全量写（兼容旧逻辑）
    for (var charId in chatsSnapshot) {
      try {
        await window.AI_DB.saveChat(accountId, charId, chatsSnapshot[charId]);
      } catch (e) {
        chatWritesFailed.push(charId);
        console.error('[save] chat 写入失败:', charId, e);
      }
    }
  } else {
    var _chatIdsArr = Array.from(changedChatIds);
    for (var _i = 0; _i < _chatIdsArr.length; _i++) {
      var _cid = _chatIdsArr[_i];
      if (!chatsSnapshot[_cid]) {
        if (window.__dirtyChats) window.__dirtyChats.delete(_cid);
        continue;
      }
      try {
        await window.AI_DB.saveChat(accountId, _cid, chatsSnapshot[_cid]);
        if (window.__dirtyChats) window.__dirtyChats.delete(_cid);  // ★ 写成功才清
      } catch (e) {
        chatWritesFailed.push(_cid);
        console.error('[save] chat 写入失败，保留 dirty:', _cid, e);
      }
    }
  }
} catch (e) {
  console.error('[save] IDB 写入异常:', e);
}

if (chatWritesFailed.length > 0) {
  console.warn('[save] ⚠️ ' + chatWritesFailed.length + ' 条聊天写入失败，下次保存会重试');
}

  // ★ 单独保存图标到 IDB
if (_homeIconsToSave !== undefined) {
  var _iconPayload = {};
  Object.keys(_homeIconsToSave).forEach(function(k) {
    var v = _homeIconsToSave[k];
    var payload = (v && (v.icon || v.data)) ? (v.icon || v.data) : v;
    if (payload && typeof payload === 'object' && payload.value !== undefined) {
      payload = payload.value;
    }
    _iconPayload[k] = payload;
  });
  console.log('[save] 写入 IDB 图标 | 数量:', Object.keys(_iconPayload).length, '（0 = 清空所有）');
  try {
    var _iconOk = await _saveIconsToIDB(accountId, _iconPayload);
    console.log('[save] IDB 图标写入:', _iconOk ? '✅' : '❌');
  } catch (e) {
    console.error('[save] IDB 图标写入异常:', e);
  }
}

  // ── 异步 2：写 localStorage（备用，超 4.5MB 跳过）──
  var lsOk = false;
    if (json.length > 500 * 1024) {
    console.warn('[save] 数据 ' + usedKB + 'KB 超过 500KB，跳过 localStorage 备份（IDB 已保存）');
  } else {
    try {
      localStorage.setItem('ai_app_account_' + accountId, json);
      lsOk = true;
    } catch (e) {
      console.error('[save] localStorage 写入失败（IDB 已保存）', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        try {
          localStorage.removeItem('aiphone8');
          for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if (key && key.indexOf('_backup') > -1) localStorage.removeItem(key);
          }
          localStorage.setItem('ai_app_account_' + accountId, json);
          lsOk = true;
        } catch(e2) {
          console.error('[save] 清理后仍失败', e2);
        }
      }
    }
  }

  _saveGeneration++;
  console.log('[save] #' + _saveGeneration, '账号', accountId,
    '| chars:', (s.characters||[]).length,
    '| chats:', Object.keys(s.chats||{}).length,
    '| masks:', (s.masks||[]).length,
    '| npcs:', (s.npcs||[]).length,
    '| size:', usedKB + 'KB',
    '| IDB:', idbOk ? '✓' : '✗',
    '| LS:', lsOk ? '✓' : '⏭');

  if (lsOk) {
    try {
      var verify = localStorage.getItem('ai_app_account_' + accountId);
      if (!verify) {
        console.error('[save] LS 写入后读回失败！');
      } else if (verify.length !== json.length) {
        console.error('[save] LS 长度不匹配！写入:', json.length, '读回:', verify.length);
      }
    } catch(e) {}
  }
}

async function _loadAccountData(accountId) {
  if (!accountId) return null;

  // ── 1. 优先从 IDB 读主数据 ──
  var idbData = null;
  try {
    idbData = await window.AI_DB.loadAccount(accountId);
  } catch (e) {
    console.warn('[load] IDB 读取异常:', e);
  }

  if (idbData && typeof idbData === 'object') {
    // 2. 如果有 chat 分片，优先用分片
    if (Array.isArray(idbData._chatIds) && idbData._chatIds.length > 0) {
      try {
        var chats = await window.AI_DB.loadAllChats(accountId);
        if (Object.keys(chats).length > 0) {
          idbData.chats = chats;
          console.log('[load] 从 IDB 加载（chat 分片模式）:',
            Object.keys(chats).length, '个会话');
        }
      } catch (e) {
        console.warn('[load] chat 分片读取失败，使用主数据 chats:', e);
      }
    }
        // ★ 从 IDB 单独加载图标，合并回 theme.general.homeIcons
    try {
      var _iconsFromIDB = await _loadIconsFromIDB(accountId);
      var _iconCount = Object.keys(_iconsFromIDB).length;
      if (_iconCount > 0) {
        idbData.theme = idbData.theme || {};
        idbData.theme.general = idbData.theme.general || {};
        idbData.theme.general.homeIcons = idbData.theme.general.homeIcons || {};
        Object.keys(_iconsFromIDB).forEach(function(k) {
          if (idbData.theme.general.homeIcons[k]) {
            idbData.theme.general.homeIcons[k].icon = _iconsFromIDB[k];
          } else {
            idbData.theme.general.homeIcons[k] = { icon: _iconsFromIDB[k] };
          }
        });
        console.log('[load] ✅ 从 IDB 加载图标:', _iconCount, '个');
      }
    } catch (e) {
      console.warn('[load] 图标加载失败:', e);
    }
    console.log('[load] 从 IDB 加载:', accountId,
      '| chars:', (idbData.characters||[]).length,
      '| chats:', Object.keys(idbData.chats||{}).length);
    return idbData;
  }

  // ── 2. 回退 localStorage，并异步迁移到 IDB ──
  try {
    var raw = localStorage.getItem('ai_app_account_' + accountId);
    if (!raw) {
      console.warn('[load] 无数据:', accountId);
      var backupRaw = localStorage.getItem('ai_app_backup_' + accountId);
      if (backupRaw) {
        console.log('[load] 从备份恢复:', accountId);
        try {
          var backupData = JSON.parse(backupRaw);
          if (backupData && typeof backupData === 'object') {
            localStorage.setItem('ai_app_account_' + accountId, backupRaw);
            if (window.AI_DB) await window.AI_DB.saveAccount(accountId, backupData);
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

    console.log('[load] 从 localStorage 加载并迁移到 IDB:', accountId,
      '| chars:', (data.characters||[]).length,
      '| chats:', Object.keys(data.chats||{}).length);

    // 后台迁移到 IDB，不阻塞返回
    if (window.AI_DB) {
      window.AI_DB.saveAccount(accountId, data).then(function(ok) {
        if (ok) console.log('[load] ✅ 已迁移到 IDB:', accountId);
      }).catch(function(e) {
        console.warn('[load] 迁移到 IDB 失败（不影响使用）:', e);
      });
    }

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
              var maskCount = (data.masks || []).length;
              var iconCount = (data.theme && data.theme.general && data.theme.general.homeIcons)
                                ? Object.keys(data.theme.general.homeIcons).length : 0;
              // ★ 放宽：只要有任何数据就算孤儿，不再要求 chars/chats>0
              if (charCount > 0 || chatCount > 0 || maskCount > 0 || iconCount > 0 ||
                  data.userProfile || data.theme) {
                found.push({
                  id: accountId,
                  name: (data.userProfile && data.userProfile.name) || 'Recovered',
                  avatar: (data.userProfile && data.userProfile.avatar) || null,
                  chars: charCount, chats: chatCount,
                  masks: maskCount, icons: iconCount
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
  // ★ 优先：LS 里已有的账号元数据 + 对应数据都在 → 直接恢复，不新建
  try {
    var metaRaw = localStorage.getItem('ai_app_all_accounts');
    var cidRaw  = localStorage.getItem('ai_app_current_id');
    if (metaRaw) {
      var savedMeta = JSON.parse(metaRaw);
      if (Array.isArray(savedMeta) && savedMeta.length > 0) {
        var cid = cidRaw || savedMeta[0].id;
        var hasData = false;
        for (var mi = 0; mi < savedMeta.length; mi++) {
          if (localStorage.getItem('ai_app_account_' + savedMeta[mi].id)) {
            hasData = true; break;
          }
        }
        if (hasData) {
          accountStore.accounts = savedMeta;
          // 选 currentId：优先 cid，其次有数据的
          var pick = null;
          for (var mj = 0; mj < savedMeta.length; mj++) {
            if (savedMeta[mj].id === cid &&
                localStorage.getItem('ai_app_account_' + cid)) {
              pick = cid; break;
            }
          }
          if (!pick) {
            for (var mk = 0; mk < savedMeta.length; mk++) {
              if (localStorage.getItem('ai_app_account_' + savedMeta[mk].id)) {
                pick = savedMeta[mk].id; break;
              }
            }
          }
          accountStore.currentAccountId = pick;
          console.log('[migrate] ✅ 从 LS 元数据恢复:', pick);
          return;
        }
      }
    }
  } catch(e) { console.warn('[migrate] LS 元数据恢复失败:', e); }

  var oldData = null;
  try { oldData = JSON.parse(localStorage.getItem('aiphone8')); } catch (e) {}

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

async function deleteAccount(id) {
    await _deleteIconsFromIDB(id);
  if (accountStore.accounts.length <= 1) {
    try { showToast('Cannot delete the last account'); } catch (e) {}
    return false;
  }
  var wasCurrent = (accountStore.currentAccountId === id);
  accountStore.accounts = accountStore.accounts.filter(function(a) { return a.id !== id; });
  await window.AI_DB.deleteAccount(id);
  _deleteAccountData(id);
  if (wasCurrent) {
    var first = accountStore.accounts[0];
    accountStore.currentAccountId = first.id;
    _resetStateToDefaults();
    var data = await _loadAccountData(first.id);
    if (data) _applyDataToState(data);
    _resetTransientState(); _validateState();
  }
  _saveAccountMeta();
  return true;
}

async function switchAccount(id) {
  var target = null;
  for (var i = 0; i < accountStore.accounts.length; i++) {
    if (accountStore.accounts[i].id === id) { target = accountStore.accounts[i]; break; }
  }
  if (!target) { console.error('[switch] 目标账号不存在:', id); return false; }
  if (id === accountStore.currentAccountId) return true;

  var oldId = accountStore.currentAccountId;
  console.log('[switch] 保存当前账号:', oldId);
  await _saveAccountData(oldId);
  accountStore.currentAccountId = id;
  _resetStateToDefaults();
  var data = await _loadAccountData(id);
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

// ── 串行保存队列（保证多次 saveState 按顺序执行，不并发覆盖）──
var _saveQueue = Promise.resolve();
var _saveQueueDepth = 0;
window.__saveQueueDepth = 0;   // 暴露给控制台观察

function saveState(force) {
  var _force = !!force;
  var _acctId = accountStore.currentAccountId;

  if (!_acctId) {
    console.warn('[saveState] 无当前账号ID');
    return Promise.resolve();
  }

  _saveQueueDepth++;
  window.__saveQueueDepth = _saveQueueDepth;

  _saveQueue = _saveQueue.then(function () {
    _forceNextSave = _force;   // 只在轮到本任务时才生效
    return _saveAccountData(_acctId).then(function () {
      _saveAccountMeta();
      _forceNextSave = false;
      _saveQueueDepth--;
      window.__saveQueueDepth = _saveQueueDepth;
    });
  }).catch(function (e) {
    console.error('[saveState] 队列任务失败:', e);
    _forceNextSave = false;
    _saveQueueDepth--;
    window.__saveQueueDepth = _saveQueueDepth;
  });

  return _saveQueue;
}

// ★ 强制立即写入所有待保存聊天（页面隐藏时调用，不经过队列）
window.__flushPendingSaves = async function () {
  var aid = accountStore.currentAccountId;
  if (!aid) return;

  var dirty = window.__dirtyChats;
  if (!dirty || dirty.size === 0) return;

  var chats = state.chats || {};
  var ids = Array.from(dirty);
  console.log('[flush] 强制写入 ' + ids.length + ' 条脏聊天…');

  for (var i = 0; i < ids.length; i++) {
    var cid = ids[i];
    if (!chats[cid]) {
      if (window.__dirtyChats) window.__dirtyChats.delete(cid);
      continue;
    }
    try {
      await window.AI_DB.saveChat(aid, cid, chats[cid]);
      if (window.__dirtyChats) window.__dirtyChats.delete(cid);
      console.log('[flush] ✓ ' + cid);
    } catch (e) {
      console.error('[flush] ✗ ' + cid, e);
    }
  }
  console.log('[flush] 完成，剩余 dirty:', window.__dirtyChats ? window.__dirtyChats.size : 0);
};

async function loadState() {
  _stateLoaded = false;
  console.log('[loadState] 开始加载...');
  await _loadAccountMeta();          // ← 加 await
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

  var data = await _loadAccountData(accountStore.currentAccountId);
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
    npcs: state.npcs.length,
    timestamp: Date.now()
  };

  console.log('[loadState] 完成 | account:', accountStore.currentAccountId,
    '| chars:', state.characters.length,
    '| chats:', Object.keys(state.chats).length,
    '| masks:', state.masks.length,
    '| npcs:', state.npcs.length,
    '| worldbooks:', state.worldbooks.length,
    '| meetings:', state.meetings.length);
}

function resetState() {
  console.warn('[resetState] 重置所有数据！');
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

function getCurrentUserMask() {
  var maskId = state.userProfile && state.userProfile.currentMaskId;
  if (!maskId) {
    if (state.currentCharId) {
      var byChar = (state.masks || []).find(function(m) {
        return (m.charIds || []).indexOf(state.currentCharId) >= 0;
      });
      if (byChar) return byChar;
    }
    return null;
  }
  return (state.masks || []).find(function(m) { return m.id === maskId; }) || null;
}

function getCurrentUserMaskName() {
  var mask = getCurrentUserMask();
  return (mask && mask.name) ? mask.name : (state.userProfile.name || 'User');
}

function getCurrentUserMaskAvatar() {
  var mask = getCurrentUserMask();
  return (mask && mask.avatar) ? mask.avatar : (state.userProfile.avatar || null);
}

;(function _exportStateGlobals() {
  'use strict';
  window.state         = state;
  window.accountStore  = accountStore;
  window.bubbleState   = bubbleState;
  window.phoneState    = phoneState;
  window.tmp           = tmp;
  window.SAVE_KEYS     = SAVE_KEYS;
  window.saveState             = saveState;
  window.loadState             = loadState;
  window.resetState            = resetState;
  window.createAccount         = createAccount;
  window.deleteAccount         = deleteAccount;
  window.switchAccount         = switchAccount;
  window.getCurrentAccount     = getCurrentAccount;
  window.getAllAccounts         = getAllAccounts;
  window.getOtherAccountsCharacters = getOtherAccountsCharacters;
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
  window.getCurrentUserMask       = getCurrentUserMask;
  window.getCurrentUserMaskName   = getCurrentUserMaskName;
  window.getCurrentUserMaskAvatar = getCurrentUserMaskAvatar;
  console.log('[state.js] 全局导出完成',
    '| window.state.characters:', state.characters.length,
    '| window.state.npcs:', state.npcs.length,
    '| window.saveState:', typeof window.saveState);
})();