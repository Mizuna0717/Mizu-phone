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
  createGroupSelected: new Set()
};

const SAVE_KEYS = [
  'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
  'unread', 'drawerFilter', 'drawerSort', 'lang', 'userProfile', 'masks',
  'memories', 'replyPrompt', 'charConfig', 'phoneData', 'bookmarks',
  'groups', 'moments',
  'imsgTab'
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

function resetState() {
  state.apis = [];
  state.activeApiId = null;
  state.characters = [];
  state.chats = {};
  state.worldbooks = [];
  state.stickers = [];
  state.unread = {};
  state.currentCharId = null;
  state.editingApiId = null;
  state.editingCharId = null;
  state.editingWbId = null;
  state.editingMaskId = null;
  state.editingMemId = null;
  state.charEditFrom = 'screen-imessage';
  state.drawerFilter = 'all';
  state.drawerSort = 'recent';
  state.drawerSearch = '';
  state.lang = 'en';
  state.userProfile = { name: 'User', avatar: null };
  state.masks = [];
  state.memories = [];
  state.imsgTab = 'messages';
  state.replyPrompt = (typeof DEFAULT_REPLY_PROMPT !== 'undefined') ? DEFAULT_REPLY_PROMPT : null;
  state.charConfig = {};
  state.phoneData = {};
  state.bookmarks = [];
  state.groups = [];
  state.moments = [];

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
}
