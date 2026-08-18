// ========== 12-bubble-menu.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 07-prompt.js (parseReplySegments)

let longPressTimer = null;
let longPressTarget = null;

function showMsgPopover(event, msgId) {
  if (bubbleState.multiMode) return;
}

function initBubbleLongPress(el, msgId) {
  el.addEventListener('touchstart', e => {
    longPressTarget = { el, msgId };
    longPressTimer = setTimeout(() => {
      e.preventDefault();
      if (bubbleState.multiMode) return;
      showBubbleMenu(el, msgId);
    }, 500);
  }, { passive: false });
  el.addEventListener('touchend', () => { clearTimeout(longPressTimer); });
  el.addEventListener('touchmove', () => { clearTimeout(longPressTimer); });
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (bubbleState.multiMode) return;
    showBubbleMenu(el, msgId);
  });
  el.addEventListener('click', e => {
    if (bubbleState.multiMode) {
      e.stopPropagation();
      toggleBubbleSelect(msgId);
    }
  });
}

function showBubbleMenu(el, msgId) {
  const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
  if (!msg) return;
  const isSent = msg.role === 'user';
  const sc = document.getElementById('screen-chat'), sr = sc.getBoundingClientRect();
  const br = el.getBoundingClientRect();
  const menu = document.getElementById('bubbleMenu');

  let items = '';
  items += `<div class="bm-item" onclick="quoteMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M4 8V5a4 4 0 018 0v1"/><path d="M2 8h5v6H2zM9 8h5v6H9z"/></svg>${T('quote')}</div>`;
  items += `<div class="bm-item" onclick="copyBubbleMsg('${msgId}')"><svg viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M5 11H3.5A1.5 1.5 0 012 9.5v-6A1.5 1.5 0 013.5 2h6A1.5 1.5 0 0111 3.5V5"/></svg>${T('copy')}</div>`;
  items += `<div class="bm-item" onclick="startEditMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M11 2l3 3M2 11v3h3L13 6l-3-3L2 11z"/></svg>${T('edit')}</div>`;
  items += `<div class="bm-item" onclick="toggleBookmarkMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M3 1h10a1 1 0 011 1v13l-6-3-6 3V2a1 1 0 011-1z"/></svg>${T('bookmark')}</div>`;
  items += `<div class="bm-item" onclick="enterMultiSelect('${msgId}')"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>${T('multiSelect')}</div>`;
  if (isSent) {
    items += `<div class="bm-item danger" onclick="recallMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M3 8l3-3M3 8l3 3M3 8h10"/></svg>${T('recall')}</div>`;
  }
  items += `<div class="bm-item danger" onclick="deleteBubbleMsg('${msgId}')"><svg viewBox="0 0 16 16"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>${T('delete')}</div>`;

  menu.innerHTML = items;
  let top = br.top - sr.top - menu.offsetHeight - 8;
  let left = isSent ? br.right - sr.left - 170 : br.left - sr.left;
  if (top < 60) top = br.bottom - sr.top + 8;
  if (left < 8) left = 8;
  if (left > sr.width - 170) left = sr.width - 170;
  menu.style.top = top + 'px';
  menu.style.left = left + 'px';
  menu.classList.add('open');
  document.getElementById('bubbleMenuOverlay').classList.add('show');
}

function closeBubbleMenu() {
  document.getElementById('bubbleMenu').classList.remove('open');
  document.getElementById('bubbleMenuOverlay').classList.remove('show');
}

// ===== 引用 =====
function quoteMsg(msgId) {
  closeBubbleMenu();
  const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
  if (!msg) return;
  const ch = state.characters.find(c => c.id === state.currentCharId);
  const name = msg.role === 'user' ? (state.userProfile.name || 'User') : (ch?.name || '');
  const text = (msg.content || '').slice(0, 60);
  bubbleState.quoteMsg = { id: msgId, name, text };
  document.getElementById('cqbText').innerHTML = `<span class="cqb-name">${esc(name)}</span> ${esc(text)}`;
  document.getElementById('chatQuoteBar').classList.add('show');
  document.getElementById('chatInput').focus();
}

function clearQuote() {
  bubbleState.quoteMsg = null;
  document.getElementById('chatQuoteBar').classList.remove('show');
}

// ===== 複製 =====
function copyBubbleMsg(msgId) {
  closeBubbleMenu();
  const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
  if (msg?.content) navigator.clipboard?.writeText(msg.content).catch(() => {});
  showToast(T('copied'));
}

// ===== 編輯 =====
function startEditMsg(msgId) {
  closeBubbleMenu();
  const segMatch = msgId.match(/^(.+)__seg(\d+)$/);
  if (segMatch) {
    const realId = segMatch[1];
    const segIdx = parseInt(segMatch[2]);
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === realId);
    if (!msg) return;
    const segs = parseReplySegments(msg.content, state.stickers);
    const targetSeg = segs[segIdx];
    if (!targetSeg || targetSeg.type !== 'text') { showToast('无法编辑'); return; }
    bubbleState.editingMsgId = msgId;
    document.getElementById('editMsgInput').value = targetSeg.content || '';
    document.getElementById('editMsgModal').classList.add('show');
    setTimeout(() => document.getElementById('editMsgInput').focus(), 100);
  } else {
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
    if (!msg || msg.type !== 'text') { showToast('无法编辑'); return; }
    bubbleState.editingMsgId = msgId;
    document.getElementById('editMsgInput').value = msg.content || '';
    document.getElementById('editMsgModal').classList.add('show');
    setTimeout(() => document.getElementById('editMsgInput').focus(), 100);
  }
}

// ===== 撤回 =====
function recallMsg(msgId) {
  closeBubbleMenu();
  const msgs = state.chats[state.currentCharId] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (msg) {
    msg.recalled = true;
    msg.originalContent = msg.content;
    msg.content = T('recalledMsg');
    msg.type = 'recalled';
    saveState();
    renderChat();
    showToast(T('recalled'));
  }
}

// ===== 刪除 =====
function deleteBubbleMsg(msgId) {
  closeBubbleMenu();
  const msgs = state.chats[state.currentCharId] || [];
  const idx = msgs.findIndex(m => m.id === msgId);
  if (idx === -1) return;
  const del = msgs.splice(idx, 1)[0];
  saveState();
  renderChat();
  showSnackbar(T('msgDeleted'), () => { msgs.splice(idx, 0, del); saveState(); renderChat(); });
}

// ===== 收藏 =====
function toggleBookmarkMsg(msgId) {
  closeBubbleMenu();
  if (!state.bookmarks) state.bookmarks = [];
  const ch = state.characters.find(c => c.id === state.currentCharId);
  const msg = (state.chats[state.currentCharId] || []).find(m => m.id === msgId);
  if (!msg) return;
  const existing = state.bookmarks.findIndex(b => b.msgId === msgId && b.charId === state.currentCharId);
  if (existing >= 0) {
    state.bookmarks.splice(existing, 1);
    saveState();
    showToast(T('unbookmarked'));
  } else {
    state.bookmarks.push({
      id: uid(), msgId, charId: state.currentCharId,
      charName: ch?.name || '', charAvatar: ch?.avatar || null,
      role: msg.role, content: msg.content, type: msg.type,
      timestamp: msg.timestamp, bookmarkedAt: Date.now()
    });
    saveState();
    showToast(T('bookmarked'));
  }
}

// ===== 多選模式 =====
function enterMultiSelect(firstMsgId) {
  closeBubbleMenu();
  bubbleState.multiMode = true;
  bubbleState.selectedIds = new Set([firstMsgId]);
  document.getElementById('chatHeaderNormal').style.display = 'none';
  document.getElementById('bubbleActionBar').classList.add('show');
  renderChat();
  updateMultiCount();
}

function exitMultiSelect() {
  bubbleState.multiMode = false;
  bubbleState.selectedIds.clear();
  document.getElementById('chatHeaderNormal').style.display = '';
  document.getElementById('bubbleActionBar').classList.remove('show');
  renderChat();
}

function toggleBubbleSelect(msgId) {
  if (bubbleState.selectedIds.has(msgId)) bubbleState.selectedIds.delete(msgId);
  else bubbleState.selectedIds.add(msgId);
  updateMultiCount();
  document.querySelectorAll('.msg-row').forEach(row => {
    const mid = row.dataset.msgid;
    if (mid) {
      row.classList.toggle('selected', bubbleState.selectedIds.has(mid));
      const ck = row.querySelector('.msg-check');
      if (ck) ck.classList.toggle('checked', bubbleState.selectedIds.has(mid));
    }
  });
}

function updateMultiCount() {
  document.getElementById('babCount').textContent = bubbleState.selectedIds.size + ' ' + T('selectedCount');
}

function deleteSelected() {
  const msgs = state.chats[state.currentCharId] || [];
  const ids = [...bubbleState.selectedIds];
  const deleted = [];
  ids.forEach(id => {
    const idx = msgs.findIndex(m => m.id === id);
    if (idx >= 0) deleted.push({ idx, msg: msgs.splice(idx, 1)[0] });
  });
  saveState();
  exitMultiSelect();
  renderChat();
  showSnackbar(deleted.length + ' ' + T('msgDeleted'), () => {
    deleted.sort((a, b) => a.idx - b.idx).forEach(d => msgs.splice(d.idx, 0, d.msg));
    saveState();
    renderChat();
  });
}

function bookmarkSelected() {
  if (!state.bookmarks) state.bookmarks = [];
  const ch = state.characters.find(c => c.id === state.currentCharId);
  const msgs = state.chats[state.currentCharId] || [];
  let count = 0;
  bubbleState.selectedIds.forEach(id => {
    if (state.bookmarks.some(b => b.msgId === id && b.charId === state.currentCharId)) return;
    const msg = msgs.find(m => m.id === id);
    if (!msg) return;
    state.bookmarks.push({
      id: uid(), msgId: id, charId: state.currentCharId,
      charName: ch?.name || '', charAvatar: ch?.avatar || null,
      role: msg.role, content: msg.content, type: msg.type,
      timestamp: msg.timestamp, bookmarkedAt: Date.now()
    });
    count++;
  });
  saveState();
  exitMultiSelect();
  showToast(count + ' ' + T('bookmarked'));
}

// ===== 收藏列表 =====
function renderBookmarkList() {
  const el = document.getElementById('bookmarkListBody');
  const bks = (state.bookmarks || []).filter(b => b.charId === state.currentCharId).sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
  if (!bks.length) {
    el.innerHTML = `<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M12 4h24a2 2 0 012 2v36l-14-7-14 7V6a2 2 0 012-2z"/></svg><p>${T('noBookmarks')}</p></div>`;
    return;
  }
  el.innerHTML = '<div class="list-group">' + bks.map(b =>
    `<div class="bookmark-list-item">
      <div class="bli-avatar">${b.charAvatar ? `<img src="${b.charAvatar}">` : PERSON_SVG}</div>
      <div class="bli-info">
        <div class="bli-name">${esc(b.role === 'user' ? (state.userProfile.name || 'User') : b.charName)}</div>
        <div class="bli-text">${esc((b.content || '').slice(0, 100))}</div>
        <div class="bli-time">${fmtTime(b.timestamp)}</div>
      </div>
      <button class="bli-del" onclick="removeBookmark('${b.id}')"><svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg></button>
    </div>`
  ).join('') + '</div>';
}

function removeBookmark(bid) {
  state.bookmarks = (state.bookmarks || []).filter(b => b.id !== bid);
  saveState();
  renderBookmarkList();
  showToast(T('unbookmarked'));
}
