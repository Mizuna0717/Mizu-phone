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
  // ★FC★ 强控期间阻止用户主动导航（但允许 FC 引擎调用）
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


/* ══════════════════════════════════════════
   ★FC★ Force Control — UI 覆盖层 & 强制解除按钮
   ★★★ 修复版：提升 z-index、增加视觉反馈 ★★★
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
    '@keyframes fcPulse{0%,100%{transform:scale(1);box-shadow:0 4px 16px rgba(239,83,80,.45)}50%{transform:scale(1.06);box-shadow:0 6px 24px rgba(239,83,80,.6)}}' +
    '@keyframes fcFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes fcFlash{0%{opacity:.18}100%{opacity:0}}';
  document.head.appendChild(style);
}

/**
 * 创建 / 显示 FC 覆盖层
 * ★修复★ z-index 提升到 99990+，确保在所有页面之上
 */
function fcShowOverlay(charName) {
  // 清理旧覆盖层
  var existing = document.getElementById('fcOverlay');
  if (existing) existing.remove();

  _fcEnsureStyles();

  // ── 1. 主覆盖层（拦截所有用户操作） ──
  var overlay = document.createElement('div');
  overlay.id = 'fcOverlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99990;' +
    'pointer-events:auto;' +
    'background:rgba(0,0,0,0.06);';  // ★修复★ 微弱蒙层让用户感知到锁定

  // 拦截所有点击和触摸（仅放行解除按钮和确认弹窗）
  overlay.addEventListener('click', function(e) {
    var t = e.target;
    // 放行：解除按钮 + fcModal 内的按钮 + fcConfirmModal 内的按钮
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
    'position:fixed;top:0;left:0;right:0;z-index:99993;' +
    'background:rgba(0,0,0,0.78);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
    'color:#fff;font-size:14px;font-weight:600;' +
    'padding:14px 16px;text-align:center;' +
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
    'letter-spacing:0.3px;' +
    'animation:fcSlideIn .35s ease;';
  topBar.innerHTML = '<span style="margin-right:6px">&#128274;</span> ' +
    (charName || '角色') + ' 正在控制账号';
  overlay.appendChild(topBar);

  // ── 3. 操作日志条（顶部指示条下方） ──
  var logBar = document.createElement('div');
  logBar.id = 'fcActionLog';
  logBar.style.cssText =
    'position:fixed;top:48px;left:0;right:0;z-index:99993;' +
    'background:rgba(0,0,0,0.55);' +
    'color:rgba(255,255,255,0.7);font-size:12px;' +
    'padding:7px 16px;text-align:center;' +
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
    'transition:all .3s ease;' +
    'animation:fcFadeIn .5s ease;';
  logBar.textContent = '正在准备操作...';
  overlay.appendChild(logBar);

  // ── 4. 右下角强制解除按钮 ──
  var btn = document.createElement('button');
  btn.id = 'fcForceReleaseBtn';
  btn.textContent = '强制解除';
  btn.style.cssText =
    'position:fixed;bottom:36px;right:20px;z-index:99995;' +
    'background:#ef5350;color:#fff;' +
    'border:none;border-radius:24px;' +
    'padding:14px 28px;font-size:15px;font-weight:700;' +
    'cursor:pointer;pointer-events:auto;' +
    'box-shadow:0 4px 20px rgba(239,83,80,0.5);' +
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
    'animation:fcPulse 2s ease-in-out infinite;' +
    '-webkit-tap-highlight-color:transparent;';
  btn.onclick = function(e) {
    e.stopPropagation();
    _fcConfirmForceRelease();
  };
  overlay.appendChild(btn);

  // ── 5. 插入 DOM ──
  document.body.appendChild(overlay);
  window._fcNavigationLocked = true;

  console.log('[FC UI] overlay shown for "' + charName + '" | elements created:',
    'topBar=' + !!document.getElementById('fcTopBar'),
    'logBar=' + !!document.getElementById('fcActionLog'),
    'btn=' + !!document.getElementById('fcForceReleaseBtn'));
}

/**
 * 移除 FC 覆盖层
 */
function fcHideOverlay() {
  var overlay = document.getElementById('fcOverlay');
  if (overlay) overlay.remove();
  // 同时清理可能残留的弹窗
  var modal = document.getElementById('fcModal');
  if (modal) modal.remove();
  var confirmModal = document.getElementById('fcConfirmModal');
  if (confirmModal) confirmModal.remove();
  // 清除自动启动定时器
  if (window._fcAutoStartTimer) {
    clearTimeout(window._fcAutoStartTimer);
    window._fcAutoStartTimer = null;
  }
  window._fcNavigationLocked = false;
  window._fcEngineNavigating = false;
  console.log('[FC UI] overlay hidden');
}

/**
 * ★修复★ 更新操作日志条文本 — 同步直接赋值
 * 旧版使用 setTimeout+opacity 导致高频调用时文本被覆盖不显示
 */
function fcUpdateActionLog(text) {
  var log = document.getElementById('fcActionLog');
  if (!log) {
    // 自修复：如果 overlay 还在但 logBar 消失了，重新创建
    var overlay = document.getElementById('fcOverlay');
    if (overlay) {
      log = document.createElement('div');
      log.id = 'fcActionLog';
      log.style.cssText =
        'position:fixed;top:48px;left:0;right:0;z-index:99993;' +
        'background:rgba(0,0,0,0.55);' +
        'color:rgba(255,255,255,0.7);font-size:12px;' +
        'padding:7px 16px;text-align:center;' +
        'font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
      overlay.appendChild(log);
      console.warn('[FC UI] fcActionLog 重建完成');
    } else {
      console.warn('[FC UI] fcActionLog 和 fcOverlay 均不存在');
      return;
    }
  }
  // ★修复★ 直接赋值，不使用异步动画
  log.textContent = text;
}



/**
 * ★FC★ 页面切换时的视觉闪烁（让用户看到切换动作）
 */
function fcScreenFlash() {
  var flash = document.createElement('div');
  flash.style.cssText =
    'position:fixed;inset:0;z-index:99989;' +
    'background:rgba(0,0,0,0.12);' +
    'pointer-events:none;' +
    'animation:fcFlash .6s ease forwards;';
  document.body.appendChild(flash);
  setTimeout(function() { if (flash.parentNode) flash.remove(); }, 650);
}

/**
 * 强制解除确认弹窗
 */
function _fcConfirmForceRelease() {
  // 移除可能已存在的确认弹窗
  var old = document.getElementById('fcConfirmModal');
  if (old) old.remove();

  var confirmDiv = document.createElement('div');
  confirmDiv.id = 'fcConfirmModal';
  confirmDiv.style.cssText =
    'position:fixed;inset:0;z-index:99998;' +
    'display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.4);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
    'animation:fcFadeIn .2s ease;';
  confirmDiv.innerHTML =
    '<div style="background:rgba(255,255,255,.96);backdrop-filter:blur(20px);border-radius:16px;' +
      'width:calc(100% - 48px);max-width:300px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.18)">' +
      '<div style="padding:20px 20px 8px;font-size:17px;font-weight:700;text-align:center;color:#111">确认强制解除</div>' +
      '<div style="padding:8px 20px 20px;font-size:14px;color:#3a3a3c;line-height:1.6;text-align:center">' +
        '确认强制解除强控？角色可能会生气。' +
      '</div>' +
      '<div style="display:flex;border-top:1px solid rgba(0,0,0,.08)">' +
        '<button id="fcConfirmCancel" style="flex:1;padding:14px;border:none;background:none;font-size:16px;color:#8e8e93;cursor:pointer;font-family:inherit;border-right:1px solid rgba(0,0,0,.08)">取消</button>' +
        '<button id="fcConfirmOK" style="flex:1;padding:14px;border:none;background:none;font-size:16px;color:#c62828;font-weight:700;cursor:pointer;font-family:inherit">强制解除</button>' +
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
