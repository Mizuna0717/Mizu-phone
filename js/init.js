// ========== 19-init.js ==========
// 依赖：所有其他文件。此文件必须最后载入。

(function() {
  'use strict';

  // ── 1. 加载多账号数据 ──
  try { loadState(); } catch(e) { console.error('loadState failed:', e); }

  // ── 2. 首页初始化（全部 try-catch） ──
  try { initHomeSwipe(); }   catch(e) {}
  try { updateGreeting(); }  catch(e) {}
  try { updateCalendar(); }  catch(e) {}
  try { renderHomeProfile(); } catch(e) {}
  try { renderCalEvent(); }  catch(e) {}

  try {
    if (state.userProfile.musicSong)
      document.getElementById('musicSong').textContent = state.userProfile.musicSong;
    if (state.userProfile.musicArtist)
      document.getElementById('musicArtist').textContent = state.userProfile.musicArtist;
    if (state.userProfile.musicCover) {
      var mi = document.getElementById('musicCoverImg');
      if (mi) { mi.src = state.userProfile.musicCover; mi.style.display = 'block'; }
    }
  } catch(e) {}

  try { applyLang(); } catch(e) {}

  var chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        try { sendMessage(); } catch(err) {}
      }
    });
  }

  try { updateHomeBadge(); } catch(e) {}

  // ★ 确保首屏默认到 home，不触发 switchImsgTab 中的 saveState
  try {
    var initScreen = document.getElementById('screen-home');
    if (initScreen) {
      document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
      initScreen.classList.add('active');
    }
  } catch(e) {}

  // ── 3. 预渲染（不触发 saveState） ──
  try { renderCharList(); }       catch(e) {}
  try { renderGroups(); }         catch(e) {}
  try { renderMoments(); }        catch(e) {}
  try { renderMaskList(); }       catch(e) {}
  try { renderProfileInfo(); }    catch(e) {}
  try { renderProfileStickers(); } catch(e) {}

  try { updatePhoneTime(); } catch(e) {}
  setInterval(function() { try { updatePhoneTime(); } catch(e) {} }, 30000);

  // ── 4. 重启自动 Moment 定时器 ──
  try { restartAllAutoMoments(); } catch(e) {}

  // ── 5. 控制台输出 ──
  try {
    var acct = getCurrentAccount();
    var total = getAllAccounts().length;
    console.log('🔑 当前账号: ' + (acct ? acct.name : '???') + '  (共 ' + total + ' 个账号)');
  } catch(e) {}

  console.log('🚀 init.js 执行完成');
})();
