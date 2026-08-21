// ========== 10-characters.js ==========

// ========== DRAWER ==========
function openDrawer() { updateDrawerCounts(); document.getElementById('drawerMask').classList.add('open'); }
function closeDrawer() { document.getElementById('drawerMask').classList.remove('open'); }

function setDrawerFilter(el, f) {
  document.querySelectorAll('.drawer-item[data-filter]').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  state.drawerFilter = f;
  saveState();
  renderCharList();
}

function setDrawerSort(el, s) {
  document.querySelectorAll('.drawer-item[data-sort]').forEach(i => i.classList.remove('active'));
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
  let u = 0, c = 0;
  state.characters.forEach(ch => {
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
  let c = [...state.characters];
  if (state.drawerSearch) c = c.filter(x => x.name.toLowerCase().includes(state.drawerSearch));
  if (state.drawerFilter === 'unread') c = c.filter(x => (state.unread[x.id] || 0) > 0);
  if (state.drawerFilter === 'hasChat') c = c.filter(x => (state.chats[x.id] || []).length > 0);
  if (state.drawerSort === 'name') c.sort((a, b) => a.name.localeCompare(b.name));
  else c.sort((a, b) => {
    const ma = state.chats[a.id] || [], mb = state.chats[b.id] || [];
    return (mb.length ? mb[mb.length - 1].timestamp : 0) - (ma.length ? ma[ma.length - 1].timestamp : 0);
  });
  return c;
}

function renderCharList() {
  const body = document.getElementById('charListBody');
  if (!body) return;

  var chatGroups = (state.groups || []).filter(function(g) { return g.isGroup === true; });
  var chars = getFilteredChars();

  if (!chars.length && !chatGroups.length) {
    body.innerHTML = '<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M12 6h24a2 2 0 012 2v24a2 2 0 01-2 2H20l-8 6v-6h-2a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#d1d1d6" stroke-width="1.5" fill="none"/></svg><p>' + T('noConversations') + '<br>' + T('tapCreateChar') + '</p></div>';
    return;
  }

  // Build unified items
  var items = [];

  chars.forEach(function(ch) {
    var msgs = state.chats[ch.id] || [];
    var last = msgs.length ? msgs[msgs.length - 1] : null;
    items.push({
      id: ch.id,
      isGroupItem: false,
      name: ch.name,
      lastMsg: last,
      lastTime: last ? last.timestamp : 0,
      unread: state.unread[ch.id] || 0,
      char: ch
    });
  });

  chatGroups.forEach(function(g) {
    var msgs = state.chats[g.id] || [];
    var last = msgs.length ? msgs[msgs.length - 1] : null;
    // Apply search filter to groups too
    if (state.drawerSearch && !g.name.toLowerCase().includes(state.drawerSearch)) return;
    // Apply drawer filters
    if (state.drawerFilter === 'unread' && !((state.unread[g.id] || 0) > 0)) return;
    if (state.drawerFilter === 'hasChat' && !msgs.length) return;
    items.push({
      id: g.id,
      isGroupItem: true,
      name: g.name,
      lastMsg: last,
      lastTime: last ? last.timestamp : 0,
      unread: state.unread[g.id] || 0,
      group: g
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
      h += '<div class="li-info">';
      h += '<div class="li-title">' + esc(g.name) + '</div>';
      h += '<div class="li-sub">' + esc(lt) + '</div>';
      h += '</div>';
      if (ur > 0) h += '<div class="num-badge">' + ur + '</div>';
      h += '<span class="li-arrow">&rsaquo;</span></div>';
    } else {
      var ch = item.char;
      var last2 = item.lastMsg;
      var prefix = last2 ? ({ voice: '[Voice] ', sticker: '[Sticker] ', transfer: '[Transfer] ', image: '[Image] ', simImage: '[Image] ' }[last2.type] || '') : '';
      var lt2;
      if (ch.notes && ch.notes.trim()) {
        lt2 = ch.notes.trim();
      } else if (last2) {
        lt2 = prefix + (last2.content || '').slice(0, 25);
      } else {
        lt2 = T('startConversation');
      }
      var ur2 = state.unread[ch.id] || 0;
      h += '<div class="list-item" onclick="openChat(\'' + ch.id + '\')">';
      h += '<div class="li-avatar">' + charAvatarImg(ch) + '</div>';
      h += '<div class="li-info">';
      h += '<div class="li-title">' + esc(ch.name) + '</div>';
      h += '<div class="li-sub">' + esc(lt2) + '</div>';
      h += '</div>';
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
  const ch = id ? state.characters.find(c => c.id === id) : null;
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
  const c = document.getElementById('charWbList');
  if (!c) return;
  if (!state.worldbooks.length) {
    c.innerHTML = '<div class="mask-bind-empty">' +
      '<svg viewBox="0 0 32 32"><rect x="7" y="4" width="18" height="24" rx="3" stroke="#d1d1d6" stroke-width="1.5" fill="none"/><path d="M12 10h8M12 15h8M12 20h5" stroke="#d1d1d6" stroke-width="1.5" fill="none"/></svg>' +
      '<span>' + T('noWbAvailable') + '</span></div>';
    return;
  }
  c.innerHTML = state.worldbooks.map(wb => {
    const ck = sel.includes(wb.id);
    return '<div class="mask-bind-item" onclick="toggleWbBind(this)">' +
      '<div class="mask-bind-avatar wb-bind-icon">' +
      '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#8e8e93" stroke-width="1.5" fill="none"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#8e8e93" stroke-width="1.5" fill="none"/></svg></div>' +
      '<div class="mask-bind-info">' +
      '<div class="mask-bind-name">' + esc(wb.name) + '</div>' +
      '<div class="mask-bind-status">' +
      '<span class="wb-bind-tag ' + (wb.isGlobal ? 'wb-tag-global' : 'wb-tag-local') + '">' + (wb.isGlobal ? T('global') : T('local')) + '</span>' +
      '</div></div>' +
      '<div class="mask-bind-check' + (ck ? ' checked' : '') + '" data-wbid="' + wb.id + '">' +
      '<svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>';
  }).join('');
}

function toggleWbBind(el) {
  const check = el.querySelector('.mask-bind-check');
  if (check) check.classList.toggle('checked');
}

function previewCharAvatar(inp) {
  previewAvatarFile(inp, d => { tmp.charAvatar = d; setAvatarPreview('charAvatarPv', 'charAvatarPh', d); });
}

function saveChar() {
  const name = document.getElementById('charName').value.trim();
  if (!name) { showToast(T('enterName')); return; }
  const notes = document.getElementById('charNotes').value.trim();
  const sp = document.getElementById('charPromptArea').value.trim();
  const av = tmp.charAvatar;
  const wbIds = [];
  document.querySelectorAll('#charWbList .mask-bind-check.checked').forEach(cb => wbIds.push(cb.dataset.wbid));

  if (state.editingCharId) {
    const ch = state.characters.find(c => c.id === state.editingCharId);
    if (ch) Object.assign(ch, { name, notes, systemPrompt: sp, avatar: av, worldbookIds: wbIds });
  } else {
    const nid = uid();

    if (!state.groups) state.groups = [];
    let defaultGroup = state.groups.find(g => g.name === 'Default' && !g.isGroup);
    if (!defaultGroup) {
      defaultGroup = { id: uid(), name: 'Default', charIds: [], createdAt: Date.now() };
      state.groups.push(defaultGroup);
    }

    state.characters.push({
      id: nid,
      name,
      notes,
      systemPrompt: sp,
      avatar: av,
      worldbookIds: wbIds,
      groupId: defaultGroup.id
    });
    state.chats[nid] = [];
  }

  saveState();
  showToast(T('charSaved'));
  nav(state.charEditFrom || 'screen-imessage');
}

function deleteChar() {
  if (!state.editingCharId) return;
  const cid = state.editingCharId;
  const ch = state.characters.find(c => c.id === cid);
  const bk = JSON.parse(JSON.stringify(state.chats[cid] || []));
  state.characters = state.characters.filter(c => c.id !== cid);
  delete state.chats[cid];
  delete state.unread[cid];
  state.masks.forEach(m => { m.charIds = (m.charIds || []).filter(id => id !== cid); });
  // Remove from chat groups
  (state.groups || []).forEach(function(g) {
    if (g.isGroup && g.members) {
      g.members = g.members.filter(function(mid) { return mid !== cid; });
    }
  });
  saveState();
  nav('screen-imessage');
  showSnackbar(T('deleted'), () => { state.characters.push(ch); state.chats[cid] = bk; saveState(); renderCharList(); });
}

// ========== CREATE ACTION SHEET ==========
function imsgTabAction() {
  if (state.imsgTab === 'profile') {
    editMask(null);
  } else if (state.imsgTab === 'moments') {
    if (typeof openNewMomentModal === 'function') openNewMomentModal();
  } else {
    // messages / groups tab → 显示「创建角色 / 创建群组」Action Sheet
    document.getElementById('createActionSheet').classList.add('show');
  }
}


function closeCreateActionSheet() {
  document.getElementById('createActionSheet').classList.remove('show');
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
    container.innerHTML = '<div style="padding:24px;text-align:center;color:#8e8e93;font-size:14px">' +
      '<svg viewBox="0 0 40 40" style="width:36px;height:36px;stroke:#d1d1d6;fill:none;stroke-width:1.5;display:block;margin:0 auto 8px">' +
      '<circle cx="20" cy="14" r="6"/><path d="M8 34c0-6.5 5-12 12-12s12 5.5 12 12"/></svg>' +
      'No characters available.<br>Create characters first.</div>';
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
  if (tmp.createGroupSelected.has(charId)) {
    tmp.createGroupSelected.delete(charId);
  } else {
    tmp.createGroupSelected.add(charId);
  }
  renderCreateGroupCharList();
}

function confirmCreateGroup() {
  var name = document.getElementById('createGroupName').value.trim();
  if (!name) { showToast('Please enter a group name'); return; }
  if (tmp.createGroupSelected.size < 2) { showToast('Select at least 2 members'); return; }

  var groupId = uid();
  var membersArr = Array.from(tmp.createGroupSelected);

  var newGroup = {
    id: groupId,
    name: name,
    avatar: null,
    members: membersArr,
    ownerId: 'user',
    createdAt: Date.now(),
    nicknames: {},
    isGroup: true,
    lastMessage: null,
    unread: 0
  };

  state.groups.push(newGroup);
  state.chats[groupId] = [];
  state.unread[groupId] = 0;
  saveState();

  closeModal('createGroupModal');
  renderCharList();
  if (typeof renderGroups === 'function') renderGroups();
  showToast('Group created');
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
