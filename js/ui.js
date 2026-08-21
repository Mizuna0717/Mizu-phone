// ========== 05-ui.js ==========
// 依賴：04-i18n.js (T)

// ========== MODALS / TOAST / SNACKBAR ==========
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

let toastT;
function showToast(m) {
  const e = document.getElementById('toast');
  e.textContent = m;
  e.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => e.classList.remove('show'), 2200);
}

let snackT;
function showSnackbar(t, cb) {
  const sb = document.getElementById('snackbar');
  document.getElementById('snackbarText').textContent = t;
  const btn = document.getElementById('snackbarAction');
  if (cb) {
    btn.style.display = 'block';
    btn.textContent = T('undo');
    btn.onclick = () => { cb(); hideSnackbar(); };
  } else btn.style.display = 'none';
  sb.classList.add('show');
  clearTimeout(snackT);
  snackT = setTimeout(() => sb.classList.remove('show'), 4000);
}

function hideSnackbar() {
  document.getElementById('snackbar').classList.remove('show');
}

function showErrorModal(m) {
  document.getElementById('errorModalTitle').textContent = T('error');
  document.getElementById('errorModalBody').textContent = m;
  document.getElementById('errorModal').classList.add('show');
}

function toggleAcc(h) {
  const it = h.parentElement;
  const w = it.classList.contains('open');
  it.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  if (!w) it.classList.add('open');
}

// ========== NAVIGATION ==========
function nav(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // ★ try-catch 包裹 close 调用，防止任何一个抛错阻断后续渲染
  try { closePlusMenu(); } catch (e) {}
  try { closeStickerPanel(); } catch (e) {}
  try { closeBubbleMenu(); } catch (e) {}
  try { closeChatMenu(); } catch (e) {}
  try { closeGroupMenu(); } catch (e) {}

  if (id === 'screen-settings') renderSettings();
  if (id === 'screen-imessage') { switchImsgTab(state.imsgTab || 'messages'); }
  if (id === 'screen-worldbook') renderWbList();
  if (id === 'screen-chat') renderChat();
  if (id === 'screen-home') updateHomeBadge();
  if (id === 'screen-memory') renderMemoryList();
  if (id === 'screen-chat-config') openChatConfig();
  if (id === 'screen-bookmarks') renderBookmarkList();
}

function updateHomeBadge() {
  let n = 0;
  Object.values(state.unread || {}).forEach(v => n += v);
  document.getElementById('homeMsgBadge').textContent = n > 0 ? n : '';
}

function setUrlStatus(t, txt) {
  const el = document.getElementById('urlStatus');
  el.querySelector('.dot').className = 'dot ' + t;
  el.querySelector('span').textContent = txt;
}

function toggleSplitMenu() {
  document.getElementById('splitMenu').classList.toggle('open');
}

// ★ 需求6 修复: 全局点击关闭下拉菜单  ── 同时处理 splitMenu 和 chatDropdown
document.addEventListener('click', e => {
  // 关闭 split 菜单
  if (!e.target.closest('.split-dropdown'))
    document.getElementById('splitMenu')?.classList.remove('open');

  // 关闭聊天右上角三点菜单
  if (!e.target.closest('.chat-dropdown-wrap')) {
    var cd = document.getElementById('chatDropdown');
    if (cd) cd.classList.remove('show');
  }
});

// ========== PHONE TIME ==========
function updatePhoneTime() {
  const now = new Date();
  const el = document.getElementById('phoneTime');
  if (el) el.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const del = document.getElementById('phoneDate');
  if (del) del.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
}

// ========== iMessage 标签切换 ==========
function switchImsgTab(tab) {
  if (!['messages', 'groups', 'moments', 'profile'].includes(tab)) tab = 'messages';
  state.imsgTab = tab;
  saveState();

  document.querySelectorAll('.imsg-tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.imsg-bottom-tab').forEach(el => el.classList.remove('active'));

  const tabId = 'imsgTab' + tab.charAt(0).toUpperCase() + tab.slice(1);
  const el = document.getElementById(tabId);
  if (el) el.classList.add('active');

  const tabBtn = document.querySelector(`.imsg-bottom-tab[data-tab="${tab}"]`);
  if (tabBtn) tabBtn.classList.add('active');

  // 更新大标题
  const titleMap = { messages: 'Messages', groups: 'Groups', moments: 'Moments', profile: 'Profile' };
  const lt = document.getElementById('imsgLargeTitle');
  if (lt) lt.textContent = titleMap[tab] || 'Messages';

  // 根据标签渲染对应内容
  if (tab === 'messages') renderCharList();
  if (tab === 'groups') renderGroups();
  if (tab === 'moments') renderMoments();
  if (tab === 'profile') { renderMaskList(); renderProfileInfo(); renderProfileStickers(); }
}
