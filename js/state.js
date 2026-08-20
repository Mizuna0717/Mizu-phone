// ========== 02-state.js ==========
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
  // ★ 新增
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
  // ★ 新增
  expandedGroups: new Set()
};

const SAVE_KEYS = [
  'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
  'unread', 'drawerFilter', 'drawerSort', 'lang', 'userProfile', 'masks',
  'memories', 'replyPrompt', 'charConfig', 'phoneData', 'bookmarks',
  'groups', 'moments',
  'imsgTab'                       // ★ 新增：持久化当前标签页
];

function saveState() {
  const s = {};
  SAVE_KEYS.forEach(k => s[k] = state[k]);
  try { localStorage.setItem('aiphone8', JSON.stringify(s)); } catch (e) {}
}

function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem('aiphone8'));
    if (d) Object.keys(d).forEach(k => { if (d[k] !== undefined) state[k] = d[k]; });
  } catch (e) {}

  // ★ 修复：使用 Array.isArray 确保数组字段不会因数据损坏变成 null/object/string
  if (!Array.isArray(state.characters)) state.characters = [];
  if (!state.chats || typeof state.chats !== 'object' || Array.isArray(state.chats)) state.chats = {};
  if (!state.unread || typeof state.unread !== 'object') state.unread = {};
  if (!state.phoneData || typeof state.phoneData !== 'object') state.phoneData = {};
  if (!state.userProfile || typeof state.userProfile !== 'object') state.userProfile = { name: 'User', avatar: null };
  if (!Array.isArray(state.masks)) state.masks = [];
  if (!Array.isArray(state.memories)) state.memories = [];
  if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
  if (state.replyPrompt == null) state.replyPrompt = DEFAULT_REPLY_PROMPT;
  if (!state.charConfig || typeof state.charConfig !== 'object') state.charConfig = {};
  if (!Array.isArray(state.groups)) state.groups = [];
  if (!Array.isArray(state.moments)) state.moments = [];
  if (!Array.isArray(state.worldbooks)) state.worldbooks = [];
  if (!Array.isArray(state.stickers)) state.stickers = [];
  if (!Array.isArray(state.apis)) state.apis = [];
}
