// ========== 10-characters.js ==========

// =============================================
//  跨账号角色查询 — 直接读 localStorage，零依赖 state.js 内部函数
// =============================================
function getOtherAccountsCharacters() {
  // 1. 获取账号列表和当前 ID（使用公共 API + 容错）
  var accounts = [];
  var currentId = '';

  try {
    accounts = getAllAccounts();
    var cur = getCurrentAccount();
    currentId = cur ? cur.id : '';
  } catch (e1) {
    // 回退：直接读 localStorage
    try {
      var raw = localStorage.getItem('ai_app_all_accounts');
      accounts = raw ? JSON.parse(raw) : [];
      currentId = localStorage.getItem('ai_app_current_id') || '';
    } catch (e2) {
      console.error('[getOtherAccountsCharacters] 无法读取账号列表:', e2);
      return [];
    }
  }

  console.log('[import-debug] 账号总数:', accounts.length, '当前ID:', currentId);

  var result = [];

  for (var i = 0; i < accounts.length; i++) {
    var acct = accounts[i];
    if (acct.id === currentId) {
      console.log('[import-debug] 跳过当前账号:', acct.name);
      continue;
    }

    // 2. 直接从 localStorage 读取该账号的数据
    var storageKey = 'ai_app_account_' + acct.id;
    var rawData = null;
    try {
      rawData = localStorage.getItem(storageKey);
    } catch (e) {
      console.warn('[import-debug] 读取失败:', storageKey, e);
      continue;
    }

    if (!rawData) {
      console.log('[import-debug] 账号', acct.name, '无数据 (key:', storageKey, ')');
      continue;
    }

    var data = null;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.warn('[import-debug] 解析失败:', storageKey, e);
      continue;
    }

    if (!data || !Array.isArray(data.characters)) {
      console.log('[import-debug] 账号', acct.name, '无 characters 数组');
      continue;
    }

    console.log('[import-debug] 账号', acct.name, '角色数:', data.characters.length);

    for (var j = 0; j < data.characters.length; j++) {
      result.push({
        accountId: acct.id,
        accountName: acct.name,
        character: JSON.parse(JSON.stringify(data.characters[j]))
      });
    }
  }

  console.log('[import-debug] 汇总可导入角色数:', result.length);
  return result;
}

// ========== DRAWER ==========
function openDrawer() { updateDrawerCounts(); document.getElementById('drawerMask').classList.add('open'); }
function closeDrawer() { document.getElementById('drawerMask').classList.remove('open'); }

function setDrawerFilter(el, f) {
  document.querySelectorAll('.drawer-item[data-filter]').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  state.drawerFilter = f;
  saveState();
  renderCharList();
}

function setDrawerSort(el, s) {
  document.querySelectorAll('.drawer-item[data-sort]').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  state.drawerSort = s;
  saveState();
  renderCharList();
}

function applyDrawerFilter() {
  state.drawerSearch = document.getElementById('drawerSearchInput').value.trim().toLowerCase();
  renderCharList();
}

function updateDrawerCounts() {
  document.getElementById('drawerCountAll').textContent = state.characters.length;
  var u = 0, c = 0;
  state.characters.forEach(function(ch) {
    if ((state.unread[ch.id] || 0) > 0) u++;
    if ((state.chats[ch.id] || []).length > 0) c++;
  });
  document.getElementById('drawerCountUnread').textContent = u;
  document.getElementById('drawerCountChat').textContent = c;
}

// ========== GROUP HELPERS ==========
function isGroupChat(id) {
  return (state.groups || []).some(function(g) { return g.id === id && g.isGroup === true; });
}

function getGroupById(id) {
  return (state.groups || []).find(function(g) { return g.id === id && g.isGroup === true; });
}

function groupAvatarHtml(g) {
  if (g && g.avatar) {
    return '<img src="' + g.avatar + '" style="width:100%;height:100%;object-fit:cover;display:block">';
  }
  return '<svg viewBox="0 0 40 40" style="width:100%;height:100%;display:block">' +
    '<circle cx="14" cy="13" r="5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<circle cx="26" cy="13" r="5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M5 30c0-5 4-8 9-8s9 3 9 8" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M17 30c0-5 4-8 9-8s9 3 9 8" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

// ========== CHARACTERS ==========
function getFilteredChars() {
  var c = state.characters.slice();
  if (state.drawerSearch) c = c.filter(function(x) { return x.name.toLowerCase().includes(state.drawerSearch); });
  if (state.drawerFilter === 'unread') c = c.filter(function(x) { return (state.unread[x.id] || 0) > 0; });
  if (state.drawerFilter === 'hasChat') c = c.filter(function(x) { return (state.chats[x.id] || []).length > 0; });
  if (state.drawerSort === 'name') c.sort(function(a, b) { return a.name.localeCompare(b.name); });
  else c.sort(function(a, b) {
    var ma = state.chats[a.id] || [], mb = state.chats[b.id] || [];
    return (mb.length ? mb[mb.length - 1].timestamp : 0) - (ma.length ? ma[ma.length - 1].timestamp : 0);
  });
  return c;
}

function renderCharList() {
  var body = document.getElementById('charListBody');
  if (!body) return;

  var chatGroups = (state.groups || []).filter(function(g) { return g.isGroup === true; });
  var chars = getFilteredChars();

  if (!chars.length && !chatGroups.length) {
    body.innerHTML = '<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M12 6h24a2 2 0 012 2v24a2 2 0 01-2 2H20l-8 6v-6h-2a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#d1d1d6" stroke-width="1.5" fill="none"/></svg><p>' + T('noConversations') + '<br>' + T('tapCreateChar') + '</p></div>';
    return;
  }

  var items = [];

  chars.forEach(function(ch) {
    var msgs = state.chats[ch.id] || [];
    var last = msgs.length ? msgs[msgs.length - 1] : null;
    items.push({
      id: ch.id, isGroupItem: false, name: ch.name,
      lastMsg: last, lastTime: last ? last.timestamp : 0,
      unread: state.unread[ch.id] || 0, char: ch
    });
  });

  chatGroups.forEach(function(g) {
    var msgs = state.chats[g.id] || [];
    var last = msgs.length ? msgs[msgs.length - 1] : null;
    if (state.drawerSearch && !g.name.toLowerCase().includes(state.drawerSearch)) return;
    if (state.drawerFilter === 'unread' && !((state.unread[g.id] || 0) > 0)) return;
    if (state.drawerFilter === 'hasChat' && !msgs.length) return;
    items.push({
      id: g.id, isGroupItem: true, name: g.name,
      lastMsg: last, lastTime: last ? last.timestamp : 0,
      unread: state.unread[g.id] || 0, group: g
    });
  });

  if (state.drawerSort === 'name') {
    items.sort(function(a, b) { return a.name.localeCompare(b.name); });
  } else {
    items.sort(function(a, b) { return b.lastTime - a.lastTime; });
  }

  if (!items.length) {
    body.innerHTML = '<div class="empty-state"><p>' + T('noMatching') + '</p></div>';
    return;
  }

  var h = '<div class="list-group">';
  items.forEach(function(item) {
    if (item.isGroupItem) {
      var g = item.group;
      var last = item.lastMsg;
      var memberCount = (g.members || []).length;
      var lt = '';
      if (last) {
        var senderChar = last.senderId ? state.characters.find(function(c) { return c.id === last.senderId; }) : null;
        var senderPrefix = senderChar ? senderChar.name + ': ' : '';
        lt = senderPrefix + (last.content || '').slice(0, 25);
      } else {
        lt = memberCount + ' members';
      }
      var ur = state.unread[g.id] || 0;
      h += '<div class="list-item" onclick="openChat(\'' + g.id + '\')">';
      h += '<div class="li-avatar" style="background:#f2f2f7;overflow:hidden">' + groupAvatarHtml(g) + '</div>';
      h += '<div class="li-info"><div class="li-title">' + esc(g.name) + '</div><div class="li-sub">' + esc(lt) + '</div></div>';
      if (ur > 0) h += '<div class="num-badge">' + ur + '</div>';
      h += '<span class="li-arrow">&rsaquo;</span></div>';
    } else {
      var ch = item.char;
      var last2 = item.lastMsg;
      var prefix = last2 ? ({ voice: '[Voice] ', sticker: '[Sticker] ', transfer: '[Transfer] ', image: '[Image] ', simImage: '[Image] ' }[last2.type] || '') : '';
      var lt2;
      if (ch.notes && ch.notes.trim()) { lt2 = ch.notes.trim(); }
      else if (last2) { lt2 = prefix + (last2.content || '').slice(0, 25); }
      else { lt2 = T('startConversation'); }
      var ur2 = state.unread[ch.id] || 0;
      h += '<div class="list-item" onclick="openChat(\'' + ch.id + '\')">';
      h += '<div class="li-avatar">' + charAvatarImg(ch) + '</div>';
      h += '<div class="li-info"><div class="li-title">' + esc(ch.name) + '</div><div class="li-sub">' + esc(lt2) + '</div></div>';
      if (ur2 > 0) h += '<div class="num-badge">' + ur2 + '</div>';
      h += '<span class="li-arrow">&rsaquo;</span></div>';
    }
  });
  body.innerHTML = h + '</div>';
  updateHomeBadge();
}

function createNewChar() { state.charEditFrom = 'screen-imessage'; editChar(null); }

function editChar(id) {
  state.editingCharId = id;
  var ch = id ? state.characters.find(function(c) { return c.id === id; }) : null;
  document.getElementById('charEditTitle').textContent = ch ? T('editChar') : T('newChar');
  document.getElementById('charName').value = ch ? ch.name : '';
  document.getElementById('charNotes').value = ch ? (ch.notes || '') : '';
  document.getElementById('charPromptArea').value = ch ? (ch.systemPrompt || '') : '';
  document.getElementById('deleteCharBtn').style.display = ch ? 'block' : 'none';
  tmp.charAvatar = ch ? ch.avatar : null;
  setAvatarPreview('charAvatarPv', 'charAvatarPh', tmp.charAvatar);
  renderCharWbList(ch ? (ch.worldbookIds || []) : []);
  nav('screen-char-edit');
}

function navCharEditBack() { nav(state.charEditFrom || 'screen-imessage'); }

function renderCharWbList(sel) {
  var c = document.getElementById('charWbList');
  if (!c) return;
  if (!state.worldbooks.length) {
    c.innerHTML = '<div class="mask-bind-empty"><svg viewBox="0 0 32 32"><rect x="7" y="4" width="18" height="24" rx="3" stroke="#d1d1d6" stroke-width="1.5" fill="none"/><path d="M12 10h8M12 15h8M12 20h5" stroke="#d1d1d6" stroke-width="1.5" fill="none"/></svg><span>' + T('noWbAvailable') + '</span></div>';
    return;
  }
  c.innerHTML = state.worldbooks.map(function(wb) {
    var ck = sel.includes(wb.id);
    return '<div class="mask-bind-item" onclick="toggleWbBind(this)"><div class="mask-bind-avatar wb-bind-icon"><svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#8e8e93" stroke-width="1.5" fill="none"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#8e8e93" stroke-width="1.5" fill="none"/></svg></div><div class="mask-bind-info"><div class="mask-bind-name">' + esc(wb.name) + '</div><div class="mask-bind-status"><span class="wb-bind-tag ' + (wb.isGlobal ? 'wb-tag-global' : 'wb-tag-local') + '">' + (wb.isGlobal ? T('global') : T('local')) + '</span></div></div><div class="mask-bind-check' + (ck ? ' checked' : '') + '" data-wbid="' + wb.id + '"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>';
  }).join('');
}

function toggleWbBind(el) {
  var check = el.querySelector('.mask-bind-check');
  if (check) check.classList.toggle('checked');
}

function previewCharAvatar(inp) {
  previewAvatarFile(inp, function(d) { tmp.charAvatar = d; setAvatarPreview('charAvatarPv', 'charAvatarPh', d); });
}

function saveChar() {
  var name = document.getElementById('charName').value.trim();
  if (!name) { showToast(T('enterName')); return; }
  var notes = document.getElementById('charNotes').value.trim();
  var sp = document.getElementById('charPromptArea').value.trim();
  var av = tmp.charAvatar;
  var wbIds = [];
  document.querySelectorAll('#charWbList .mask-bind-check.checked').forEach(function(cb) { wbIds.push(cb.dataset.wbid); });

  if (state.editingCharId) {
    var ch = state.characters.find(function(c) { return c.id === state.editingCharId; });
    if (ch) Object.assign(ch, { name: name, notes: notes, systemPrompt: sp, avatar: av, worldbookIds: wbIds });
  } else {
    var nid = uid();
    if (!state.groups) state.groups = [];
    var defaultGroup = state.groups.find(function(g) { return g.name === 'Default' && !g.isGroup; });
    if (!defaultGroup) {
      defaultGroup = { id: uid(), name: 'Default', charIds: [], createdAt: Date.now() };
      state.groups.push(defaultGroup);
    }
    state.characters.push({ id: nid, name: name, notes: notes, systemPrompt: sp, avatar: av, worldbookIds: wbIds, groupId: defaultGroup.id });
    state.chats[nid] = [];
  }

  saveState();
  showToast(T('charSaved'));
  nav(state.charEditFrom || 'screen-imessage');
}

function deleteChar() {
  if (!state.editingCharId) return;
  var cid = state.editingCharId;
  var ch = state.characters.find(function(c) { return c.id === cid; });
  var bk = JSON.parse(JSON.stringify(state.chats[cid] || []));
  state.characters = state.characters.filter(function(c) { return c.id !== cid; });
  delete state.chats[cid];
  delete state.unread[cid];
  state.masks.forEach(function(m) { m.charIds = (m.charIds || []).filter(function(id) { return id !== cid; }); });
  (state.groups || []).forEach(function(g) {
    if (g.isGroup && g.members) {
      g.members = g.members.filter(function(mid) { return mid !== cid; });
    }
  });
  saveState();
  nav('screen-imessage');
  showSnackbar(T('deleted'), function() { state.characters.push(ch); state.chats[cid] = bk; saveState(); renderCharList(); });
}

// ========== MESSAGES TAB ACTION SHEET ==========
function imsgTabAction() {
  var sheet = document.getElementById('createActionSheet');
  if (!sheet) { console.error('createActionSheet not found'); return; }
  sheet.classList.add('show');
}

function closeCreateActionSheet() {
  var sheet = document.getElementById('createActionSheet');
  if (sheet) sheet.classList.remove('show');
}

// ========== CREATE GROUP MODAL ==========
function openCreateGroupModal() {
  document.getElementById('createGroupName').value = 'New Group';
  tmp.createGroupSelected = new Set();
  renderCreateGroupCharList();
  document.getElementById('createGroupModal').classList.add('show');
}

function renderCreateGroupCharList() {
  var container = document.getElementById('createGroupCharList');
  if (!container) return;
  if (!state.characters.length) {
    container.innerHTML = '<div style="padding:24px;text-align:center;color:#8e8e93;font-size:14px"><svg viewBox="0 0 40 40" style="width:36px;height:36px;stroke:#d1d1d6;fill:none;stroke-width:1.5;display:block;margin:0 auto 8px"><circle cx="20" cy="14" r="6"/><path d="M8 34c0-6.5 5-12 12-12s12 5.5 12 12"/></svg>No characters available.<br>Create characters first.</div>';
    return;
  }
  var h = '';
  state.characters.forEach(function(ch) {
    var checked = tmp.createGroupSelected.has(ch.id);
    h += '<div onclick="toggleGroupMemberCheck(\'' + ch.id + '\',this)" style="display:flex;align-items:center;gap:12px;padding:10px 12px;cursor:pointer;border-radius:10px;margin-bottom:4px;background:' + (checked ? 'rgba(29,29,31,.04)' : 'transparent') + ';transition:background .15s">';
    h += '<div style="width:22px;height:22px;border-radius:6px;border:2px solid ' + (checked ? '#1d1d1f' : '#d1d1d6') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;background:' + (checked ? '#1d1d1f' : 'transparent') + ';transition:all .15s" data-charid="' + ch.id + '">';
    if (checked) {
      h += '<svg viewBox="0 0 14 14" style="width:10px;height:10px"><path d="M2 7l4 4 6-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    h += '</div>';
    h += '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;background:#e5e5ea;flex-shrink:0;display:flex;align-items:center;justify-content:center">' + charAvatarImg(ch) + '</div>';
    h += '<div style="flex:1;font-size:15px;font-weight:500;color:#1d1d1f">' + esc(ch.name) + '</div>';
    h += '</div>';
  });
  container.innerHTML = h;
}

function toggleGroupMemberCheck(charId, rowEl) {
  if (tmp.createGroupSelected.has(charId)) tmp.createGroupSelected.delete(charId);
  else tmp.createGroupSelected.add(charId);
  renderCreateGroupCharList();
}

function confirmCreateGroup() {
  var name = document.getElementById('createGroupName').value.trim();
  if (!name) { showToast('Please enter a group name'); return; }
  if (tmp.createGroupSelected.size < 2) { showToast('Select at least 2 members'); return; }

  var groupId = uid();
  var membersArr = Array.from(tmp.createGroupSelected);
  var newGroup = {
    id: groupId, name: name, avatar: null, members: membersArr,
    ownerId: 'user', createdAt: Date.now(), nicknames: {},
    isGroup: true, lastMessage: null, unread: 0
  };

  state.groups.push(newGroup);
  state.chats[groupId] = [];
  state.unread[groupId] = 0;
  saveState();

  closeModal('createGroupModal');
  renderCharList();
  try { renderGroups(); } catch (e) {}
  showToast('Group created');
}

// =============================================
//  添加已有角色（跨账号导入）
// =============================================
function openAddExistingCharModal() {
  var allOther = getOtherAccountsCharacters();

  // 构建已导入源 ID 集合
  var importedSources = {};
  state.characters.forEach(function(c) {
    if (c._sourceCharId) importedSources[c._sourceCharId] = true;
  });

  // 构建当前角色 ID 集合
  var currentIds = {};
  state.characters.forEach(function(c) {
    currentIds[c.id] = true;
  });

  // 过滤
  tmp.importCharList = allOther.filter(function(item) {
    if (importedSources[item.character.id]) return false;
    if (currentIds[item.character.id]) return false;
    return true;
  });

  console.log('[import] 过滤后可导入角色数:', tmp.importCharList.length);

  var searchInput = document.getElementById('importCharSearch');
  if (searchInput) searchInput.value = '';

  renderImportCharList('');

  var modal = document.getElementById('importCharModal');
  if (modal) {
    modal.classList.add('show');
  } else {
    console.error('importCharModal not found');
  }
}

function renderImportCharList(searchTerm) {
  var container = document.getElementById('importCharListBody');
  if (!container) { console.error('importCharListBody not found'); return; }

  var items = (tmp.importCharList || []).slice();
  var search = (searchTerm || '').toLowerCase().trim();

  if (search) {
    items = items.filter(function(item) {
      return item.character.name.toLowerCase().indexOf(search) > -1 ||
             item.accountName.toLowerCase().indexOf(search) > -1;
    });
  }

  if (!items.length) {
    var hasOther = false;
    try { hasOther = getAllAccounts().length > 1; } catch (e) {}
    var msg = '';
    if (!hasOther) {
      msg = '<svg viewBox="0 0 40 40" style="width:36px;height:36px;stroke:#d1d1d6;fill:none;stroke-width:1.5;margin-bottom:8px"><circle cx="20" cy="14" r="6"/><path d="M8 34c0-6.5 5-12 12-12s12 5.5 12 12"/></svg>没有其他账号<br><span style="font-size:12px;color:#aeaeb2">请先创建其他账号并添加角色</span>';
    } else if (tmp.importCharList && tmp.importCharList.length > 0) {
      msg = '没有匹配的角色';
    } else {
      msg = '<svg viewBox="0 0 40 40" style="width:36px;height:36px;stroke:#d1d1d6;fill:none;stroke-width:1.5;margin-bottom:8px"><path d="M12 20l6 6 12-14" stroke-width="2.5"/></svg>没有可添加的角色<br><span style="font-size:12px;color:#aeaeb2">其他账号中的角色已全部添加</span>';
    }
    container.innerHTML = '<div class="import-char-empty">' + msg + '</div>';
    return;
  }

  var h = '';
  items.forEach(function(item) {
    var ch = item.character;
    var avatarHtml = ch.avatar
      ? '<img src="' + ch.avatar + '">'
      : '<svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>';

    h += '<div class="import-char-item" data-acctid="' + item.accountId + '" data-charid="' + ch.id + '" onclick="doImportChar(this)">' +
      '<div class="import-char-avatar">' + avatarHtml + '</div>' +
      '<div class="import-char-info">' +
        '<div class="import-char-name">' + esc(ch.name) + '</div>' +
        '<div class="import-char-from">' + esc(item.accountName) + '</div>' +
      '</div>' +
      '<svg class="import-char-add" viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke-linecap="round"/></svg>' +
    '</div>';
  });

  container.innerHTML = h;
}

function doImportChar(el) {
  var accountId = el.getAttribute('data-acctid');
  var charId = el.getAttribute('data-charid');
  if (!accountId || !charId) return;
  confirmImportChar(accountId, charId);
}

function filterImportCharList() {
  var input = document.getElementById('importCharSearch');
  renderImportCharList(input ? input.value : '');
}

function confirmImportChar(accountId, charId) {
  var target = null;
  var items = tmp.importCharList || [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].accountId === accountId && items[i].character.id === charId) {
      target = items[i];
      break;
    }
  }
  if (!target) { console.warn('[import] target not found'); return; }

  var newChar = JSON.parse(JSON.stringify(target.character));
  var newId = uid();
  newChar._sourceCharId = target.character.id;
  newChar._sourceAccountId = accountId;
  newChar.id = newId;
  delete newChar.groupId;

  state.characters.push(newChar);
  state.chats[newId] = [];

  console.log('[import] 已导入:', newChar.name,
    '| newId:', newId,
    '| _sourceCharId:', newChar._sourceCharId,
    '| chatLength:', state.chats[newId].length);

  tmp.importCharList = tmp.importCharList.filter(function(item) {
    return !(item.accountId === accountId && item.character.id === charId);
  });

  saveState();

  var searchInput = document.getElementById('importCharSearch');
  renderImportCharList(searchInput ? searchInput.value : '');
  renderCharList();

  showToast('已添加: ' + newChar.name);
}

// ========== GLOBAL BINDINGS ==========
window.isGroupChat = isGroupChat;
window.getGroupById = getGroupById;
window.groupAvatarHtml = groupAvatarHtml;
window.imsgTabAction = imsgTabAction;
window.closeCreateActionSheet = closeCreateActionSheet;
window.openCreateGroupModal = openCreateGroupModal;
window.toggleGroupMemberCheck = toggleGroupMemberCheck;
window.confirmCreateGroup = confirmCreateGroup;
window.openAddExistingCharModal = openAddExistingCharModal;
window.confirmImportChar = confirmImportChar;
window.doImportChar = doImportChar;
window.filterImportCharList = filterImportCharList;
window.getOtherAccountsCharacters = getOtherAccountsCharacters;
