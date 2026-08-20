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
  if (!body) return;                    // ★ DOM 元素不存在时安全退出
  if (!state.characters.length) {
    body.innerHTML = `<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M12 6h24a2 2 0 012 2v24a2 2 0 01-2 2H20l-8 6v-6h-2a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg><p>${T('noConversations')}<br>${T('tapCreateChar')}</p></div>`;
    return;
  }
  const chars = getFilteredChars();
  if (!chars.length) { body.innerHTML = `<div class="empty-state"><p>${T('noMatching')}</p></div>`; return; }
  let h = '<div class="list-group">';
  chars.forEach(ch => {
    const msgs = state.chats[ch.id] || [], last = msgs.length ? msgs[msgs.length - 1] : null;
    const prefix = last ? ({ voice: '🎤', sticker: '🖼', transfer: '💰', image: '📷', simImage: '📷' }[last.type] || '') : '';

    // ★★★ 问题三修复：优先显示 notes 备注，无备注则显示最后一条消息预览 ★★★
    let lt;
    if (ch.notes && ch.notes.trim()) {
      lt = ch.notes.trim();
    } else if (last) {
      lt = prefix + ' ' + (last.content || '').slice(0, 25);
    } else {
      lt = T('startConversation');
    }

    const ur = state.unread[ch.id] || 0;
    h += `<div class="list-item" onclick="openChat('${ch.id}')"><div class="li-avatar">${charAvatarImg(ch)}</div><div class="li-info"><div class="li-title">${esc(ch.name)}</div><div class="li-sub">${esc(lt)}</div></div>${ur > 0 ? `<div class="num-badge">${ur}</div>` : ''}<span class="li-arrow">›</span></div>`;
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
  if (!state.worldbooks.length) {
    c.innerHTML = `<div style="padding:14px 16px;color:#8e8e93;font-size:14px">${T('noWbAvailable')}</div>`;
    return;
  }
  c.innerHTML = state.worldbooks.map(wb =>
    `<div class="wb-check-item" onclick="this.querySelector('.checkbox').classList.toggle('checked')"><div class="checkbox ${sel.includes(wb.id) ? 'checked' : ''}" data-wbid="${wb.id}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="li-info"><div class="li-title">${esc(wb.name)}</div><div class="li-sub">${wb.isGlobal ? T('global') : T('local')}</div></div></div>`
  ).join('');
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
  document.querySelectorAll('#charWbList .checkbox.checked').forEach(cb => wbIds.push(cb.dataset.wbid));

  if (state.editingCharId) {
    // ---- 编辑已有角色 ----
    const ch = state.characters.find(c => c.id === state.editingCharId);
    if (ch) Object.assign(ch, { name, notes, systemPrompt: sp, avatar: av, worldbookIds: wbIds });
  } else {
    // ---- 新建角色 ----
    const nid = uid();

    // ★ 确保"Default"分组存在，若不存在则自动创建
    if (!state.groups) state.groups = [];
    let defaultGroup = state.groups.find(g => g.name === 'Default');
    if (!defaultGroup) {
      defaultGroup = { id: uid(), name: 'Default', charIds: [], createdAt: Date.now() };
      state.groups.push(defaultGroup);
    }

    // ★ 新角色自动归入 Default 分组
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
  saveState();
  nav('screen-imessage');
  showSnackbar(T('deleted'), () => { state.characters.push(ch); state.chats[cid] = bk; saveState(); renderCharList(); });
}
