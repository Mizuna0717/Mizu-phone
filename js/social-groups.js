// ========== social-groups.js ==========
// Groups rendering, folder groups, chat groups listing, group CRUD

function renderGroups() {
  const container = document.getElementById('groupsListBody');
  if (!container) return;

  const chatGroups = (state.groups || []).filter(g => g.isGroup === true);
  const folderGroups = (state.groups || []).filter(g => !g.isGroup);

  if (!chatGroups.length && !folderGroups.length) {
    container.innerHTML =
      '<div class="social-empty">' +
        '<svg viewBox="0 0 48 48" style="width:48px;height:48px;stroke:#d1d1d6;fill:none;stroke-width:1.5;display:block;margin:0 auto 12px">' +
          '<circle cx="16" cy="14" r="5"/><circle cx="32" cy="14" r="5"/>' +
          '<path d="M6 32c0-5 4-9 10-9s10 4 10 9"/><path d="M22 32c0-5 4-9 10-9s10 4 10 9"/>' +
        '</svg>' +
        '<p style="color:#8e8e93;font-size:14px;text-align:center">No groups yet<br><span style="font-size:12px">Tap + to create one</span></p>' +
      '</div>';
    return;
  }

  let h = '';

  // ---- Chat Groups Section ----
  if (chatGroups.length) {
    h += '<div style="padding:0 4px 8px;font-size:13px;color:#8e8e93;text-transform:uppercase;letter-spacing:.5px;font-weight:600;display:flex;align-items:center;gap:8px">' +
      '<svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:#8e8e93;fill:none;stroke-width:1.5">' +
      '<circle cx="6" cy="5" r="2.5"/><circle cx="11" cy="5" r="2.5"/>' +
      '<path d="M1 14c0-3 2-5 5-5s5 2 5 5"/><path d="M9 14c0-3 1.5-5 4-5s4 2 4 5"/></svg>' +
      '<span>CHAT GROUPS</span></div>';

    chatGroups.forEach(g => {
      const members = (g.members || []).map(mid => state.characters.find(c => c.id === mid)).filter(Boolean);
      const memberCount = members.length;
      const msgs = state.chats[g.id] || [];
      const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
      const ur = state.unread[g.id] || 0;

      let memberAvsHtml = '<div style="display:flex;align-items:center">';
      members.slice(0, 4).forEach((m, idx) => {
        memberAvsHtml += '<div style="width:24px;height:24px;border-radius:50%;overflow:hidden;border:2px solid #fff;' +
          (idx > 0 ? 'margin-left:-6px;' : '') +
          'position:relative;z-index:' + (4 - idx) + ';background:#e5e5ea;display:flex;align-items:center;justify-content:center;flex-shrink:0">';
        if (m.avatar) {
          memberAvsHtml += '<img src="' + m.avatar + '" style="width:100%;height:100%;object-fit:cover;display:block">';
        } else {
          memberAvsHtml += '<svg viewBox="0 0 20 20" style="width:12px;height:12px;stroke:#b0b0b0;fill:none;stroke-width:1.5"><circle cx="10" cy="8" r="3"/><path d="M4 18c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5"/></svg>';
        }
        memberAvsHtml += '</div>';
      });
      if (members.length > 4) {
        memberAvsHtml += '<div style="width:24px;height:24px;border-radius:50%;background:#f2f2f7;border:2px solid #fff;margin-left:-6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#8e8e93;font-weight:600;flex-shrink:0">+' + (members.length - 4) + '</div>';
      }
      memberAvsHtml += '</div>';

      let preview = '';
      if (lastMsg) {
        let senderChar = lastMsg.senderId ? state.characters.find(c => c.id === lastMsg.senderId) : null;
        let senderPrefix = lastMsg.role === 'user' ? 'You: ' : (senderChar ? senderChar.name + ': ' : '');
        preview = senderPrefix + (lastMsg.content || '').slice(0, 30);
      } else {
        preview = memberCount + ' members';
      }

      h += '<div style="margin-bottom:10px;background:#fff;border-radius:14px;padding:14px 16px;border:1px solid #ececec;cursor:pointer;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(0,0,0,.03)" onclick="openChat(\'' + g.id + '\')">';
      h += '<div style="width:48px;height:48px;border-radius:50%;background:#f2f2f7;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">';
      if (g.avatar) {
        h += '<img src="' + g.avatar + '" style="width:100%;height:100%;object-fit:cover;display:block">';
      } else {
        h += groupAvatarHtml(g);
      }
      h += '</div>';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font-size:16px;font-weight:500;color:#1d1d1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(g.name) + '</div>';
      h += '<div style="font-size:12px;color:#8e8e93;margin-top:4px;display:flex;align-items:center;gap:8px">';
      h += memberAvsHtml;
      h += '<span>' + memberCount + ' members</span>';
      h += '</div>';
      if (preview) {
        h += '<div style="font-size:12px;color:#b0b0b5;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(preview) + '</div>';
      }
      h += '</div>';
      if (ur > 0) {
        h += '<div class="num-badge">' + ur + '</div>';
      }
      h += '<span style="color:#c7c7cc;font-size:16px">&rsaquo;</span>';
      h += '</div>';
    });
  }

  // ---- Folder Groups Section ----
  if (folderGroups.length) {
    h += '<div style="padding:16px 4px 8px;font-size:13px;color:#8e8e93;text-transform:uppercase;letter-spacing:.5px;font-weight:600;display:flex;align-items:center;gap:8px">' +
      '<svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:#8e8e93;fill:none;stroke-width:1.5">' +
      '<path d="M2 4h4l2 2h6a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>' +
      '<span>FOLDERS</span></div>';

    folderGroups.forEach(g => {
      const chars = state.characters.filter(c => c.groupId === g.id);
      const expanded = tmp.expandedGroups && tmp.expandedGroups.has(g.id);
      h += '<div class="group-card" data-gid="' + g.id + '">' +
        '<div class="group-card-header" onclick="toggleGroupExpand(\'' + g.id + '\')">' +
        '<div class="group-card-icon">' +
        '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#8e8e93;fill:none;stroke-width:1.5"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="7" r="3"/>' +
        '<path d="M2 20c0-3.5 3-6.5 7-6.5 1.5 0 2.8.4 4 1"/><path d="M14 20c0-3.5 2-6.5 5-6.5s5 3 5 6.5"/></svg>' +
        '</div>' +
        '<div class="group-card-info">' +
        '<div class="group-card-name">' + esc(g.name) + '</div>' +
        '<div class="group-card-count">' + chars.length + ' characters</div>' +
        '</div>' +
        '<div class="group-card-actions">' +
        '<button class="group-more-btn" onclick="event.stopPropagation();showGroupMenu(\'' + g.id + '\',event)" title="More">' +
        '<svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:#8e8e93;fill:none;stroke-width:1.5"><circle cx="4" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12" cy="8" r="1.2"/></svg>' +
        '</button>' +
        '<span class="group-expand-arrow ' + (expanded ? 'expanded' : '') + '">' +
        '<svg viewBox="0 0 16 16" style="width:12px;height:12px;stroke:#c7c7cc;fill:none;stroke-width:2"><path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</span></div></div>' +
        (expanded ? buildGroupCharList(g.id, chars) : '') +
        '</div>';
    });
  }

  if (!chatGroups.length && !folderGroups.length) {
    h = '<div class="social-empty">' +
      '<svg viewBox="0 0 48 48" style="width:48px;height:48px;stroke:#d1d1d6;fill:none;stroke-width:1.5;display:block;margin:0 auto 12px">' +
      '<circle cx="16" cy="14" r="5"/><circle cx="32" cy="14" r="5"/>' +
      '<path d="M6 32c0-5 4-9 10-9s10 4 10 9"/><path d="M22 32c0-5 4-9 10-9s10 4 10 9"/>' +
      '</svg>' +
      '<p style="color:#8e8e93;font-size:14px;text-align:center">No groups yet<br><span style="font-size:12px">Tap + to create one</span></p>' +
      '</div>';
  }

  container.innerHTML = h;
}

function buildGroupCharList(gid, chars) {
  if (!chars.length) {
    return '<div class="group-char-list"><div class="group-char-empty">No characters</div></div>';
  }
  let h = '<div class="group-char-list">';
  chars.forEach(ch => {
    h += '<div class="group-char-item">' +
      '<div class="group-char-av" onclick="openChat(\'' + ch.id + '\')">' + charAvatarImg(ch) + '</div>' +
      '<span class="group-char-name" onclick="openChat(\'' + ch.id + '\')">' + esc(ch.name) + '</span>' +
      '<button class="group-char-remove" onclick="removeCharFromGroup(\'' + ch.id + '\',\'' + gid + '\')" title="Remove">' +
      '<svg viewBox="0 0 12 12" style="width:10px;height:10px;stroke:#8e8e93;fill:none;stroke-width:2"><path d="M3 3l6 6M9 3l-6 6" stroke-linecap="round"/></svg>' +
      '</button></div>';
  });
  h += '</div>';
  return h;
}

function toggleGroupExpand(gid) {
  if (!tmp.expandedGroups) tmp.expandedGroups = new Set();
  if (tmp.expandedGroups.has(gid)) tmp.expandedGroups.delete(gid);
  else tmp.expandedGroups.add(gid);
  renderGroups();
}

function removeCharFromGroup(charId, gid) {
  const ch = state.characters.find(c => c.id === charId);
  if (ch) { ch.groupId = null; saveState(); renderGroups(); showToast('Removed'); }
}

// --- New folder group ---
function openNewGroupModal() {
  document.getElementById('newGroupNameInput').value = '';
  document.getElementById('newGroupModal').classList.add('show');
}

function confirmNewGroup() {
  const name = document.getElementById('newGroupNameInput').value.trim();
  if (!name) { showToast('Please enter a folder name'); return; }

  const newGroupId = uid();
  state.groups.push({ id: newGroupId, name, charIds: [], createdAt: Date.now() });
  saveState();

  closeModal('newGroupModal');
  renderGroups();
  showToast('Folder created');

  setTimeout(() => {
    openAddCharToGroupModal(newGroupId);
  }, 300);
}

// --- Folder group context menu ---
function showGroupMenu(gid, evt) {
  closeGroupMenu();
  const g = state.groups.find(x => x.id === gid);
  if (!g) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'groupMenuWrapper';
  wrapper.style.cssText = 'position:fixed;inset:0;z-index:999;';

  const menu = document.createElement('div');
  menu.id = 'groupContextMenu';
  menu.className = 'group-context-menu';
  menu.innerHTML =
    '<div class="group-context-item" data-action="members">' +
      '<svg viewBox="0 0 20 20" style="width:16px;height:16px;stroke:#3a3a3c;fill:none;stroke-width:1.5"><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="7" r="2.5"/>' +
      '<path d="M1 17c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5"/><path d="M12 17c0-3 2-5.5 5-5.5s5 2.5 5 5.5"/></svg>' +
      '<span>Manage Members</span></div>' +
    '<div class="group-context-item" data-action="rename">' +
      '<svg viewBox="0 0 20 20" style="width:16px;height:16px;stroke:#3a3a3c;fill:none;stroke-width:1.5"><path d="M13.5 3.5l3 3M4 13l-1 4 4-1 9-9-3-3-9 9z"/></svg>' +
      '<span>Rename</span></div>' +
    '<div class="group-context-item group-context-danger" data-action="delete">' +
      '<svg viewBox="0 0 20 20" style="width:16px;height:16px;stroke:#ff3b30;fill:none;stroke-width:1.5"><path d="M5 5h10M8 5V3h4v2M6 5v11a1 1 0 001 1h6a1 1 0 001-1V5"/></svg>' +
      '<span>Delete Folder</span></div>';

  wrapper.appendChild(menu);
  document.body.appendChild(wrapper);

  const btn = evt ? (evt.currentTarget || evt.target.closest('.group-more-btn') || evt.target) : null;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
  }

  requestAnimationFrame(() => menu.classList.add('show'));

  menu.addEventListener('click', function (e) {
    e.stopPropagation();
    const item = e.target.closest('.group-context-item');
    if (!item) return;
    const action = item.dataset.action;
    closeGroupMenu();

    setTimeout(() => {
      const grp = state.groups.find(x => x.id === gid);
      if (!grp) return;

      if (action === 'members') {
        openAddCharToGroupModal(gid);
      } else if (action === 'rename') {
        const newName = prompt('Enter new name:', grp.name);
        if (newName && newName.trim()) {
          grp.name = newName.trim();
          saveState();
          renderGroups();
          showToast('Renamed');
        }
      } else if (action === 'delete') {
        if (confirm('Delete folder "' + grp.name + '"? Characters will not be deleted.')) {
          state.characters.forEach(ch => { if (ch.groupId === gid) ch.groupId = null; });
          state.groups = state.groups.filter(x => x.id !== gid);
          saveState();
          renderGroups();
          showToast('Folder deleted');
        }
      }
    }, 50);
  });

  wrapper.addEventListener('click', function (e) {
    if (e.target === wrapper) closeGroupMenu();
  });
}

function closeGroupMenu() {
  const w = document.getElementById('groupMenuWrapper');
  if (w) w.remove();
}

function openAddCharToGroupModal(gid) {
  const g = state.groups.find(x => x.id === gid);
  if (!g) return;
  tmp.addCharGroupId = gid;

  const body = document.getElementById('addCharToGroupList');
  const ungrouped = state.characters.filter(c => !c.groupId || c.groupId === gid);
  if (!ungrouped.length) {
    body.innerHTML = '<div style="padding:20px;text-align:center;color:#8e8e93">No characters to add</div>';
  } else {
    body.innerHTML = ungrouped.map(ch => {
      const inGroup = ch.groupId === gid;
      return '<div class="add-char-row" onclick="toggleCharInGroup(\'' + ch.id + '\',this)">' +
        '<div class="add-char-check ' + (inGroup ? 'checked' : '') + '"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        '<div class="add-char-av">' + charAvatarImg(ch) + '</div>' +
        '<span>' + esc(ch.name) + '</span></div>';
    }).join('');
  }

  document.getElementById('addCharToGroupTitle').textContent = 'Add to "' + g.name + '"';
  document.getElementById('addCharToGroupModal').classList.add('show');
}

function toggleCharInGroup(charId, row) {
  const ch = state.characters.find(c => c.id === charId);
  if (!ch) return;
  const gid = tmp.addCharGroupId;
  if (ch.groupId === gid) ch.groupId = null;
  else ch.groupId = gid;
  saveState();
  const check = row.querySelector('.add-char-check');
  check.classList.toggle('checked');
}

function closeAddCharToGroupModal() {
  closeModal('addCharToGroupModal');
  renderGroups();
}
