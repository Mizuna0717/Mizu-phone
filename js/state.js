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
  if (!state.unread) state.unread = {};
  if (!state.phoneData) state.phoneData = {};
  if (!state.userProfile) state.userProfile = { name: 'User', avatar: null };
  if (!state.masks) state.masks = [];
  if (!state.memories) state.memories = [];
  if (!state.bookmarks) state.bookmarks = [];
  if (state.replyPrompt == null) state.replyPrompt = DEFAULT_REPLY_PROMPT;
  if (!state.charConfig) state.charConfig = {};
  if (!state.groups) state.groups = [];
  if (!state.moments) state.moments = [];
}
