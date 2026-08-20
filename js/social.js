// ========== social.js ==========
// 好友分组 & 朋友圈

// ============ 工具 ============
function socialRelativeTime(ts) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '刚刚';
  const min = Math.floor(sec / 60);
  if (min < 60) return min + '分钟前';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + '小时前';
  const day = Math.floor(hr / 24);
  if (day === 1) return '昨天';
  if (day < 30) return day + '天前';
  return new Date(ts).toLocaleDateString();
}

// ============ GROUPS ============

function renderGroups() {
  const container = document.getElementById('groupsListBody');
  if (!container) return;

  if (!state.groups.length) {
    container.innerHTML = `
      <div class="social-empty">
        <svg viewBox="0 0 48 48"><circle cx="16" cy="14" r="5"/><circle cx="32" cy="14" r="5"/>
        <path d="M6 32c0-5 4-9 10-9s10 4 10 9"/><path d="M22 32c0-5 4-9 10-9s10 4 10 9"/></svg>
        <p>暂无分组，点击 + 创建</p>
      </div>`;
    return;
  }

  let h = '';
  state.groups.forEach(g => {
    const chars = state.characters.filter(c => c.groupId === g.id);
    const expanded = tmp.expandedGroups && tmp.expandedGroups.has(g.id);
    h += `<div class="group-card" data-gid="${g.id}">
      <div class="group-card-header" onclick="toggleGroupExpand('${g.id}')">
        <div class="group-card-icon">
          <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="7" r="3"/>
          <path d="M2 20c0-3.5 3-6.5 7-6.5 1.5 0 2.8.4 4 1"/><path d="M14 20c0-3.5 2-6.5 5-6.5s5 3 5 6.5"/></svg>
        </div>
        <div class="group-card-info">
          <div class="group-card-name">${esc(g.name)}</div>
          <div class="group-card-count">${chars.length}人</div>
        </div>
        <div class="group-card-actions">
          <button class="group-more-btn" onclick="event.stopPropagation();showGroupMenu('${g.id}',event)" title="更多">
            <svg viewBox="0 0 16 16"><circle cx="4" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12" cy="8" r="1.2"/></svg>
          </button>
          <span class="group-expand-arrow ${expanded ? 'expanded' : ''}">
            <svg viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </div>
      </div>
      ${expanded ? buildGroupCharList(g.id, chars) : ''}
    </div>`;
  });

  container.innerHTML = h;
}

function buildGroupCharList(gid, chars) {
  if (!chars.length) {
    return `<div class="group-char-list"><div class="group-char-empty">暂无角色</div></div>`;
  }
  let h = '<div class="group-char-list">';
  chars.forEach(ch => {
    h += `<div class="group-char-item">
      <div class="group-char-av" onclick="openChat('${ch.id}')">${charAvatarImg(ch)}</div>
      <span class="group-char-name" onclick="openChat('${ch.id}')">${esc(ch.name)}</span>
      <button class="group-char-remove" onclick="removeCharFromGroup('${ch.id}','${gid}')" title="移除">
        <svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke-linecap="round"/></svg>
      </button>
    </div>`;
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
  if (ch) { ch.groupId = null; saveState(); renderGroups(); showToast('已移除'); }
}

// --- 新建分组 ---
function openNewGroupModal() {
  document.getElementById('newGroupNameInput').value = '';
  document.getElementById('newGroupModal').classList.add('show');
}

function confirmNewGroup() {
  const name = document.getElementById('newGroupNameInput').value.trim();
  if (!name) { showToast('请输入分组名称'); return; }

  // ★ 创建新分组并记录其 id
  const newGroupId = uid();
  state.groups.push({ id: newGroupId, name, charIds: [], createdAt: Date.now() });
  saveState();

  closeModal('newGroupModal');
  renderGroups();
  showToast('分组已创建');

  // ★ 自动弹出"添加角色"面板，方便立即勾选
  setTimeout(() => {
    openAddCharToGroupModal(newGroupId);
  }, 300);
}

// --- 分组菜单（重命名/删除/添加角色） ---
 // --- 分组浮动菜单 ---
// --- 分组浮动菜单（重构版）---
function showGroupMenu(gid, evt) {
  closeGroupMenu();
  const g = state.groups.find(x => x.id === gid);
  if (!g) return;

  // ★ 单一 wrapper 同时充当遮罩 + 菜单容器，避免兄弟层级点击冲突
  const wrapper = document.createElement('div');
  wrapper.id = 'groupMenuWrapper';
  wrapper.style.cssText = 'position:fixed;inset:0;z-index:999;';

  const menu = document.createElement('div');
  menu.id = 'groupContextMenu';
  menu.className = 'group-context-menu';
  menu.innerHTML = `
    <div class="group-context-item" data-action="members">
      <svg viewBox="0 0 20 20"><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="7" r="2.5"/>
      <path d="M1 17c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5"/><path d="M12 17c0-3 2-5.5 5-5.5s5 2.5 5 5.5"/></svg>
      <span>管理成员</span>
    </div>
    <div class="group-context-item" data-action="rename">
      <svg viewBox="0 0 20 20"><path d="M13.5 3.5l3 3M4 13l-1 4 4-1 9-9-3-3-9 9z"/></svg>
      <span>重命名</span>
    </div>
    <div class="group-context-item group-context-danger" data-action="delete">
      <svg viewBox="0 0 20 20"><path d="M5 5h10M8 5V3h4v2M6 5v11a1 1 0 001 1h6a1 1 0 001-1V5"/></svg>
      <span>删除分组</span>
    </div>`;

  // ★ 菜单放在 wrapper 内部（父子关系），stopPropagation 阻止冒泡到 wrapper
  wrapper.appendChild(menu);
  document.body.appendChild(wrapper);

  // 定位到按钮下方
  const btn = evt ? (evt.currentTarget || evt.target.closest('.group-more-btn') || evt.target) : null;
  if (btn) {
    const rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
  }

  requestAnimationFrame(() => menu.classList.add('show'));

  // ★ 用 addEventListener 替代内联 onclick，确保事件绑定可靠
  menu.addEventListener('click', function (e) {
    e.stopPropagation();                       // ★ 阻止冒泡到 wrapper
    const item = e.target.closest('.group-context-item');
    if (!item) return;
    const action = item.dataset.action;
    closeGroupMenu();

    // ★ setTimeout 确保 DOM 清理完毕后再弹 prompt/confirm
    setTimeout(() => {
      const grp = state.groups.find(x => x.id === gid);
      if (!grp) return;

      if (action === 'members') {
        openAddCharToGroupModal(gid);
      } else if (action === 'rename') {
        const newName = prompt('输入新名称：', grp.name);
        if (newName && newName.trim()) {
          grp.name = newName.trim();
          saveState();
          renderGroups();
          showToast('已重命名');
        }
      } else if (action === 'delete') {
        if (confirm('确定删除分组「' + grp.name + '」？角色不会被删除。')) {
          state.characters.forEach(ch => { if (ch.groupId === gid) ch.groupId = null; });
          state.groups = state.groups.filter(x => x.id !== gid);
          saveState();
          renderGroups();
          showToast('分组已删除');
        }
      }
    }, 50);
  });

  // ★ 点击 wrapper（空白遮罩区域）关闭菜单
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
    body.innerHTML = '<div style="padding:20px;text-align:center;color:#8e8e93">没有可添加的角色</div>';
  } else {
    body.innerHTML = ungrouped.map(ch => {
      const inGroup = ch.groupId === gid;
      return `<div class="add-char-row" onclick="toggleCharInGroup('${ch.id}',this)">
        <div class="add-char-check ${inGroup ? 'checked' : ''}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div>
        <div class="add-char-av">${charAvatarImg(ch)}</div>
        <span>${esc(ch.name)}</span>
      </div>`;
    }).join('');
  }

  document.getElementById('addCharToGroupTitle').textContent = `添加到「${g.name}」`;
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

// ============ MOMENTS ============

function renderMoments() {
  const container = document.getElementById('momentsListBody');
  if (!container) return;

  if (!state.moments.length) {
    container.innerHTML = `
      <div class="social-empty">
        <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="8"/>
        <path d="M24 6v4M24 38v4M6 24h4M38 24h4"/></svg>
        <p>暂无朋友圈动态<br>快来发布第一条吧~</p>
      </div>`;
    return;
  }

  const sorted = [...state.moments].sort((a, b) => b.timestamp - a.timestamp);
  let h = '';
  sorted.forEach(m => {
    const ch = state.characters.find(c => c.id === m.charId);
    const isUser = !m.charId || m.charId === 'user';
    const name = isUser ? (state.userProfile.name || 'User') : (ch ? ch.name : '系统');
    const avHtml = isUser
      ? (state.userProfile.avatar ? `<img src="${state.userProfile.avatar}">` : `<svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>`)
      : (ch && ch.avatar ? `<img src="${ch.avatar}">` : `<svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>`);

    const liked = (m.likes || []).includes('user');
    const likeCount = (m.likes || []).length;
    const commentCount = (m.comments || []).length;

    // 内容展开/收起
    const isLong = m.content.length > 120;
    const shortContent = isLong ? m.content.slice(0, 120) + '' : m.content;

    h += `<div class="moment-card" data-mid="${m.id}">
      <div class="moment-header">
        <div class="moment-av"${ch ? ` onclick="openChat('${ch.id}')"` : ''}>${avHtml}</div>
        <div class="moment-meta">
          <div class="moment-name"${ch ? ` onclick="openChat('${ch.id}')"` : ''}>${esc(name)}</div>
          <div class="moment-time">${socialRelativeTime(m.timestamp)}</div>
        </div>
        <button class="moment-delete-btn" onclick="deleteMoment('${m.id}')" title="删除">
          <svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="moment-body">
        <span class="moment-text" id="mt_${m.id}">${esc(shortContent)}</span>
        ${isLong ? `<button class="moment-expand-btn" onclick="toggleMomentExpand('${m.id}',this)">展开</button>` : ''}
      </div>
      <div class="moment-actions-bar">
        <button class="moment-action-btn ${liked ? 'liked' : ''}" onclick="toggleMomentLike('${m.id}')">
          <svg viewBox="0 0 20 20"><path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"/></svg>
          <span>${likeCount || ''}</span>
        </button>
        <button class="moment-action-btn" onclick="toggleMomentComment('${m.id}')">
          <svg viewBox="0 0 20 20"><path d="M3 3h14a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3v-3H3a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
          <span>${commentCount || ''}</span>
        </button>
      </div>
      ${buildMomentComments(m)}
    </div>`;
  });

  container.innerHTML = h;
}

function buildMomentComments(m) {
  const comments = m.comments || [];
  let h = `<div class="moment-comments" id="mc_${m.id}" style="display:${comments.length ? 'block' : 'none'}">`;
  comments.forEach(c => {
    const cch = state.characters.find(x => x.id === c.charId);
    const cName = c.charId === 'user' ? (state.userProfile.name || 'User') : (cch ? cch.name : '匿名');
    h += `<div class="moment-comment-item">
      <span class="mci-name"${cch ? ` onclick="openChat('${cch.id}')"` : ''}>${esc(cName)}</span>
      <span class="mci-text">${esc(c.content)}</span>
    </div>`;
  });
  h += `</div>
  <div class="moment-comment-input" id="mci_${m.id}" style="display:none">
    <input type="text" placeholder="写评论…" id="mcinput_${m.id}" onkeydown="if(event.key==='Enter')sendMomentComment('${m.id}')">
    <button onclick="sendMomentComment('${m.id}')">
      <svg viewBox="0 0 16 16"><path d="M3 13l10-5L3 3v4l6 1-6 1z" fill="#1d1d1f" stroke="none"/></svg>
    </button>
  </div>`;
  return h;
}

function toggleMomentExpand(mid, btn) {
  const m = state.moments.find(x => x.id === mid);
  if (!m) return;
  const el = document.getElementById('mt_' + mid);
  if (btn.textContent === '展开') {
    el.textContent = m.content;
    btn.textContent = '收起';
  } else {
    el.textContent = m.content.slice(0, 120) + '…';
    btn.textContent = '展开';
  }
}

function toggleMomentLike(mid) {
  const m = state.moments.find(x => x.id === mid);
  if (!m) return;
  if (!m.likes) m.likes = [];
  const idx = m.likes.indexOf('user');
  if (idx >= 0) m.likes.splice(idx, 1);
  else m.likes.push('user');
  saveState();
  renderMoments();
}

function toggleMomentComment(mid) {
  const el = document.getElementById('mci_' + mid);
  const cmt = document.getElementById('mc_' + mid);
  if (!el) return;
  const showing = el.style.display !== 'none';
  el.style.display = showing ? 'none' : 'flex';
  if (!showing) {
    cmt.style.display = 'block';
    document.getElementById('mcinput_' + mid)?.focus();
  }
}

function sendMomentComment(mid) {
  const m = state.moments.find(x => x.id === mid);
  if (!m) return;
  const inp = document.getElementById('mcinput_' + mid);
  const text = inp?.value.trim();
  if (!text) return;
  if (!m.comments) m.comments = [];
  m.comments.push({ charId: 'user', content: text, timestamp: Date.now() });
  saveState();
  renderMoments();
}

function deleteMoment(mid) {
  if (!confirm('确定删除这条动态？')) return;
  state.moments = state.moments.filter(x => x.id !== mid);
  saveState();
  renderMoments();
  showToast('已删除');
}

// --- 发布朋友圈 ---
function openNewMomentModal() {
  document.getElementById('newMomentContent').value = '';
  document.getElementById('newMomentCharSelect').innerHTML = buildMomentCharOptions();
  document.getElementById('newMomentModal').classList.add('show');
}

function buildMomentCharOptions() {
  let h = `<option value="user">我自己</option>`;
  state.characters.forEach(ch => {
    h += `<option value="${ch.id}">${esc(ch.name)}</option>`;
  });
  return h;
}

function confirmNewMoment() {
  const content = document.getElementById('newMomentContent').value.trim();
  if (!content) { showToast('请输入内容'); return; }
  const charId = document.getElementById('newMomentCharSelect').value || 'user';
  addMoment(charId, content);
  closeModal('newMomentModal');
  showToast('发布成功');
}

// 添加朋友圈动态（可从外部调用）
function addMoment(charId, content) {
  state.moments.push({
    id: uid(),
    charId: charId,
    content: content,
    timestamp: Date.now(),
    likes: [],
    comments: []
  });
  saveState();
  if (state.imsgTab === 'moments') renderMoments();
}

// ★ 自动发朋友圈（从 chat-settings 调用）
function forceSendMoment() {
  const cid = state.currentCharId;
  if (!cid) { showToast('请先打开角色聊天'); return; }
  const ch = state.characters.find(c => c.id === cid);
  if (!ch) return;

  const templates = [
    '今天天气真好~',
    '好想吃火锅啊',
    '刚看了一部好看的电影',
    '生活就是这样，充满了小惊喜',
    '今天也要加油呀！',
    '一个人的下午，有点安静',
    '新的一天，新的心情',
    '最近有点忙，但很充实',
  ];
  const text = templates[Math.floor(Math.random() * templates.length)];
  addMoment(cid, text);
  showToast(ch.name + ' 发了一条朋友圈');
}
