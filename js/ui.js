// ========== 05-ui.js ==========
// 依赖：04-i18n.js (T)

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
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');

  try { closePlusMenu(); }    catch (e) {}
  try { closeStickerPanel(); } catch (e) {}
  try { closeBubbleMenu(); }  catch (e) {}
  try { closeChatMenu(); }    catch (e) {}
  try { closeGroupMenu(); }   catch (e) {}

  if (id === 'screen-settings') try { renderSettings(); } catch(e) {}
  if (id === 'screen-imessage') switchImsgTab(state.imsgTab || 'messages', true); // ★ skipSave
  if (id === 'screen-worldbook') try { renderWbList(); } catch(e) {}
  if (id === 'screen-chat') try { renderChat(); } catch(e) {}
  if (id === 'screen-home') try { updateHomeBadge(); } catch(e) {}
  if (id === 'screen-memory') try { renderMemoryList(); } catch(e) {}
  if (id === 'screen-chat-config') try { openChatConfig(); } catch(e) {}
  if (id === 'screen-bookmarks') try { renderBookmarkList(); } catch(e) {}
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

document.addEventListener('click', e => {
  if (!e.target.closest('.split-dropdown'))
    document.getElementById('splitMenu')?.classList.remove('open');
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
function switchImsgTab(tab, skipSave) {
  if (!['messages', 'groups', 'moments', 'profile'].includes(tab)) tab = 'messages';
  state.imsgTab = tab;

  // ★ 仅在用户主动切换时保存，nav 内部调用时跳过
  if (!skipSave) {
    try { saveState(); } catch(e) {}
  }

  document.querySelectorAll('.imsg-tab-content').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.imsg-bottom-tab').forEach(function(el) { el.classList.remove('active'); });

  var tabId = 'imsgTab' + tab.charAt(0).toUpperCase() + tab.slice(1);
  var el = document.getElementById(tabId);
  if (el) el.classList.add('active');

  var tabBtn = document.querySelector('.imsg-bottom-tab[data-tab="' + tab + '"]');
  if (tabBtn) tabBtn.classList.add('active');

  var titleMap = { messages: 'Messages', groups: 'Groups', moments: 'Moments', profile: 'Profile' };
  var lt = document.getElementById('imsgLargeTitle');
  if (lt) lt.textContent = titleMap[tab] || 'Messages';

  if (tab === 'messages') try { renderCharList(); } catch(e) {}
  if (tab === 'groups') try { renderGroups(); } catch(e) {}
  if (tab === 'moments') try { renderMoments(); } catch(e) {}
  if (tab === 'profile') {
    try { renderMaskList(); } catch(e) {}
    try { renderProfileInfo(); } catch(e) {}
    try { renderProfileStickers(); } catch(e) {}
  }

  var plusBtn = document.getElementById('imsgPlusBtn');
  var drawerBtn = document.getElementById('drawerBtnNav');

  if (tab === 'profile') {
    if (plusBtn)   plusBtn.setAttribute('onclick', 'openAccountCreateModal()');
    if (drawerBtn) drawerBtn.setAttribute('onclick', 'openAccountDrawer()');
  } else if (tab === 'groups') {
    if (plusBtn)   plusBtn.setAttribute('onclick', 'openNewGroupModal()');
    if (drawerBtn) drawerBtn.setAttribute('onclick', 'openDrawer()');
  } else if (tab === 'moments') {
    if (plusBtn)   plusBtn.setAttribute('onclick', 'openNewMomentModal()');
    if (drawerBtn) drawerBtn.setAttribute('onclick', 'openDrawer()');
  } else {
    if (plusBtn)   plusBtn.setAttribute('onclick', 'imsgTabAction()');
    if (drawerBtn) drawerBtn.setAttribute('onclick', 'openDrawer()');
  }
}

// ========== 多账号切换后刷新 UI ==========
function reloadUI(navTarget) {
  if (navTarget !== false) {
    try { nav(navTarget || 'screen-home'); } catch (e) {}
  }

  try { updateGreeting(); }      catch (e) {}
  try { updateCalendar(); }      catch (e) {}
  try { renderHomeProfile(); }   catch (e) {}
  try { renderCalEvent(); }      catch (e) {}
  try { updateHomeBadge(); }     catch (e) {}

  try {
    var songEl = document.getElementById('musicSong');
    var artistEl = document.getElementById('musicArtist');
    var coverEl = document.getElementById('musicCoverImg');
    if (songEl) songEl.textContent = state.userProfile.musicSong || 'Not Playing';
    if (artistEl) artistEl.textContent = state.userProfile.musicArtist || '';
    if (coverEl) {
      if (state.userProfile.musicCover) {
        coverEl.src = state.userProfile.musicCover;
        coverEl.style.display = 'block';
      } else {
        coverEl.style.display = 'none';
      }
    }
  } catch (e) {}

  try { renderCharList(); }       catch (e) {}
  try { renderGroups(); }         catch (e) {}
  try { renderMoments(); }        catch (e) {}
  try { renderMaskList(); }       catch (e) {}
  try { renderProfileInfo(); }    catch (e) {}
  try { renderProfileStickers(); } catch (e) {}

  try { renderSettings(); }       catch (e) {}
  try { renderWbList(); }         catch (e) {}
  try { renderMemoryList(); }     catch (e) {}
  try { renderBookmarkList(); }   catch (e) {}

  try { applyLang(); }            catch (e) {}

  console.log('🔄 reloadUI complete');
}
