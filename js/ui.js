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
// ===== 在 nav() 函数中，找到 meeting 行后追加 =====

function nav(id) {
  if (window._fcNavigationLocked && !window._fcEngineNavigating) {
    console.log('[FC] nav blocked:', id);
    return;
  }

  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');

  try { closePlusMenu(); }    catch (e) {}
  try { closeStickerPanel(); } catch (e) {}
  try { closeBubbleMenu(); }  catch (e) {}
  try { closeChatMenu(); }    catch (e) {}
  try { closeGroupMenu(); }   catch (e) {}

  if (id === 'screen-settings') try { renderSettings(); } catch(e) {}
  if (id === 'screen-imessage') switchImsgTab(state.imsgTab || 'messages', true);
  if (id === 'screen-worldbook') try { renderWbList(); } catch(e) {}
  if (id === 'screen-chat') try { renderChat(); } catch(e) {}
  if (id === 'screen-home') try { updateHomeBadge(); } catch(e) {}
  if (id === 'screen-memory') try { renderMemoryList(); } catch(e) {}
  if (id === 'screen-chat-config') try { openChatConfig(); } catch(e) {}
  if (id === 'screen-bookmarks') try { renderBookmarkList(); } catch(e) {}
  if (id === 'screen-cloud') try { initCloudPage(); } catch(e) {}
  if (id === 'screen-meeting') try { initMeetingPage(); } catch(e) {}
  // ★ NEW: Meeting settings page — no special init needed, form reset in openMeetingSettings()
  if (id === 'screen-meeting-settings') try { applyLang(); } catch(e) {}
  if (id === 'screen-meeting-manage') try { applyLang(); } catch(e) {}  
  if (id === 'screen-theme') try { onThemeScreenOpen(); } catch(e) {}
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

  console.log('[UI] reloadUI complete');
}


/* ══════════════════════════════════════════
   ★FC★ Force Control — UI 覆盖层 & 强制解除按钮
   ★★★ 美化版 v2：灰色线条风格，SVG 解锁图标 ★★★
   ══════════════════════════════════════════ */

/**
 * 注入 FC 动画 CSS（只注入一次）
 */
function _fcEnsureStyles() {
  if (document.getElementById('fcAnimStyle')) return;
  var style = document.createElement('style');
  style.id = 'fcAnimStyle';
  style.textContent =
    '@keyframes fcSlideIn{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}' +
    '@keyframes fcFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes fcFlash{0%{opacity:.12}100%{opacity:0}}' +
    '@keyframes fcLogIn{from{opacity:0;transform:translate(-50%,-50%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}';
  document.head.appendChild(style);
}

/**
 * ★美化★ SVG 锁图标（用于顶部指示条，白色线条）
 */
function _fcLockSvg(size, color) {
  return '<svg style="width:' + (size||14) + 'px;height:' + (size||14) + 'px;vertical-align:-2px;margin-right:6px;flex-shrink:0" ' +
    'viewBox="0 0 24 24" fill="none" stroke="' + (color||'#fff') + '" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="11" width="18" height="11" rx="2.5"/>' +
    '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
  '</svg>';
}

/**
 * ★新增★ SVG 解锁图标（用于强制解除按钮，灰色线条）
 */
function _fcUnlockSvg(size, color) {
  return '<svg style="width:' + (size||14) + 'px;height:' + (size||14) + 'px;vertical-align:-2px;margin-right:5px;flex-shrink:0" ' +
    'viewBox="0 0 24 24" fill="none" stroke="' + (color||'#666') + '" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="11" width="18" height="11" rx="2.5"/>' +
    '<path d="M7 11V7a5 5 0 0 1 9.9-1"/>' +
  '</svg>';
}

/**
 * ★美化 v2★ 创建 / 显示 FC 覆盖层
 * 灰白简约风格，无 Emoji
 * ★★★ 强制解除按钮改为灰色线条胶囊风格 ★★★
 */
function fcShowOverlay(charName) {
  var existing = document.getElementById('fcOverlay');
  if (existing) existing.remove();

  _fcEnsureStyles();

  // ── 1. 主覆盖层 ──
  var overlay = document.createElement('div');
  overlay.id = 'fcOverlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99990;' +
    'pointer-events:auto;' +
    'background:rgba(0,0,0,0.3);';

  overlay.addEventListener('click', function(e) {
    var t = e.target;
    if (t.id === 'fcForceReleaseBtn') return;
    if (t.closest && t.closest('#fcModal')) return;
    if (t.closest && t.closest('#fcConfirmModal')) return;
    e.stopPropagation();
    e.preventDefault();
  }, true);
  overlay.addEventListener('touchstart', function(e) {
    var t = e.target;
    if (t.id === 'fcForceReleaseBtn') return;
    if (t.closest && t.closest('#fcModal')) return;
    if (t.closest && t.closest('#fcConfirmModal')) return;
    e.stopPropagation();
    e.preventDefault();
  }, { passive: false, capture: true });

  // ── 2. 顶部指示条 ──
  var topBar = document.createElement('div');
  topBar.id = 'fcTopBar';
  topBar.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:99994;' +
    'background:rgba(0,0,0,0.85);' +
    'color:#fff;font-size:14px;font-weight:600;' +
    'padding:14px 16px;text-align:center;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
    'letter-spacing:0.3px;' +
    'display:flex;align-items:center;justify-content:center;' +
    'animation:fcSlideIn .35s ease;';
  topBar.innerHTML = _fcLockSvg(14, '#fff') +
    '<span>' + (charName || '角色') + ' 正在控制账号</span>';
  overlay.appendChild(topBar);

  // ── 3. 操作日志 ──
  var logCard = document.createElement('div');
  logCard.id = 'fcActionLog';
  logCard.style.cssText =
    'position:fixed;top:50%;left:50%;z-index:99993;' +
    'transform:translate(-50%,-50%);' +
    'background:rgba(255,255,255,0.92);' +
    'color:#555;font-size:14px;line-height:1.6;' +
    'padding:14px 28px;' +
    'border-radius:8px;' +
    'box-shadow:0 4px 16px rgba(0,0,0,0.08);' +
    'text-align:center;' +
    'max-width:calc(100% - 64px);' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
    'animation:fcLogIn .4s ease;' +
    'pointer-events:none;';
  logCard.textContent = '正在准备操作...';
  overlay.appendChild(logCard);

  // ── 4. ★★★ 右下角强制解除按钮 — 灰色线条胶囊风格 ★★★ ──
  var btn = document.createElement('button');
  btn.id = 'fcForceReleaseBtn';
  btn.style.cssText =
    'position:fixed;bottom:24px;right:20px;z-index:99995;' +
    'background:#f0f0f0;color:#666;' +
    'border:1px solid #ccc;border-radius:20px;' +
    'padding:8px 16px;font-size:13px;font-weight:500;' +
    'cursor:pointer;pointer-events:auto;' +
    'box-shadow:none;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
    '-webkit-tap-highlight-color:transparent;' +
    'transition:background .15s,border-color .15s;' +
    'display:flex;align-items:center;gap:0;';
  btn.innerHTML = _fcUnlockSvg(14, '#666') + '<span>强制解除</span>';
  btn.onmouseenter = function() {
    btn.style.background = '#e0e0e0';
    btn.style.borderColor = '#bbb';
  };
  btn.onmouseleave = function() {
    btn.style.background = '#f0f0f0';
    btn.style.borderColor = '#ccc';
  };
  btn.onmousedown = function() {
    btn.style.background = '#d5d5d5';
  };
  btn.onmouseup = function() {
    btn.style.background = '#e0e0e0';
  };
  btn.onclick = function(e) {
    e.stopPropagation();
    _fcConfirmForceRelease();
  };
  overlay.appendChild(btn);

  // ── 5. 插入 DOM ──
  document.body.appendChild(overlay);
  window._fcNavigationLocked = true;

  console.log('[FC UI] overlay shown for "' + charName + '"');
}

/**
 * 移除 FC 覆盖层
 */
function fcHideOverlay() {
  var overlay = document.getElementById('fcOverlay');
  if (overlay) overlay.remove();
  var modal = document.getElementById('fcModal');
  if (modal) modal.remove();
  var confirmModal = document.getElementById('fcConfirmModal');
  if (confirmModal) confirmModal.remove();
  if (window._fcAutoStartTimer) {
    clearTimeout(window._fcAutoStartTimer);
    window._fcAutoStartTimer = null;
  }
  window._fcNavigationLocked = false;
  window._fcEngineNavigating = false;
  console.log('[FC UI] overlay hidden');
}

/**
 * ★修复★ 更新操作日志文本
 */
function fcUpdateActionLog(text) {
  var log = document.getElementById('fcActionLog');
  if (!log) {
    var overlay = document.getElementById('fcOverlay');
    if (overlay) {
      log = document.createElement('div');
      log.id = 'fcActionLog';
      log.style.cssText =
        'position:fixed;top:50%;left:50%;z-index:99993;' +
        'transform:translate(-50%,-50%);' +
        'background:rgba(255,255,255,0.92);' +
        'color:#555;font-size:14px;line-height:1.6;' +
        'padding:14px 28px;' +
        'border-radius:8px;' +
        'box-shadow:0 4px 16px rgba(0,0,0,0.08);' +
        'text-align:center;' +
        'max-width:calc(100% - 64px);' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
        'pointer-events:none;';
      overlay.appendChild(log);
      console.warn('[FC UI] fcActionLog rebuilt');
    } else {
      console.warn('[FC UI] fcActionLog and fcOverlay both missing');
      return;
    }
  }
  log.textContent = text;
}

/**
 * ★FC★ 页面切换视觉闪烁
 */
function fcScreenFlash() {
  var flash = document.createElement('div');
  flash.style.cssText =
    'position:fixed;inset:0;z-index:99989;' +
    'background:rgba(0,0,0,0.08);' +
    'pointer-events:none;' +
    'animation:fcFlash .5s ease forwards;';
  document.body.appendChild(flash);
  setTimeout(function() { if (flash.parentNode) flash.remove(); }, 550);
}

/**
 * ★美化★ 强制解除确认弹窗（灰白简约，无 Emoji）
 */
function _fcConfirmForceRelease() {
  var old = document.getElementById('fcConfirmModal');
  if (old) old.remove();

  var confirmDiv = document.createElement('div');
  confirmDiv.id = 'fcConfirmModal';
  confirmDiv.style.cssText =
    'position:fixed;inset:0;z-index:99998;' +
    'display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.3);' +
    'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
    'animation:fcFadeIn .2s ease;';

  confirmDiv.innerHTML =
    '<div style="' +
      'background:#fff;border-radius:10px;' +
      'width:calc(100% - 48px);max-width:340px;overflow:hidden;' +
      'box-shadow:0 4px 20px rgba(0,0,0,.10)' +
    '">' +
      '<div style="padding:20px 24px 8px;font-size:16px;font-weight:700;text-align:center;color:#333">' +
        '确认强制解除' +
      '</div>' +
      '<div style="padding:8px 24px 20px;font-size:14px;color:#555;line-height:1.6;text-align:center">' +
        '确认强制解除强控？角色可能会生气。' +
      '</div>' +
      '<div style="display:flex;border-top:1px solid #e0e0e0">' +
        '<button id="fcConfirmCancel" style="' +
          'flex:1;padding:14px;border:none;background:none;' +
          'font-size:15px;color:#888;cursor:pointer;font-family:inherit;' +
          'border-right:1px solid #e0e0e0;transition:background .12s' +
        '">取消</button>' +
        '<button id="fcConfirmOK" style="' +
          'flex:1;padding:14px;border:none;background:none;' +
          'font-size:15px;color:#666;font-weight:600;cursor:pointer;font-family:inherit;' +
          'transition:background .12s' +
        '">强制解除</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(confirmDiv);

  document.getElementById('fcConfirmCancel').onclick = function() {
    confirmDiv.remove();
  };
  document.getElementById('fcConfirmOK').onclick = function() {
    confirmDiv.remove();
    if (typeof forceUnlockForceControl === 'function') {
      forceUnlockForceControl();
    }
  };
}
