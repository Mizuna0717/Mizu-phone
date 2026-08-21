// ========== 19-init.js ==========
// 依赖：所有其他文件
// 此文件必须最后载入

// ── 1. 加载多账号数据 ──
loadState();

// ── 2. 首页初始化 ──
initHomeSwipe();
updateGreeting();
updateCalendar();
renderHomeProfile();
renderCalEvent();

if (state.userProfile.musicSong)
  document.getElementById('musicSong').textContent = state.userProfile.musicSong;
if (state.userProfile.musicArtist)
  document.getElementById('musicArtist').textContent = state.userProfile.musicArtist;
if (state.userProfile.musicCover) {
  var mi = document.getElementById('musicCoverImg');
  mi.src = state.userProfile.musicCover;
  mi.style.display = 'block';
}

applyLang();

document.getElementById('chatInput')?.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

updateHomeBadge();
switchImsgTab(state.imsgTab || 'messages');

// ★ 预渲染所有标签内容
try { renderCharList(); }       catch (e) {}
try { renderGroups(); }         catch (e) {}
try { renderMoments(); }        catch (e) {}
try { renderMaskList(); }       catch (e) {}
try { renderProfileInfo(); }    catch (e) {}
try { renderProfileStickers(); } catch (e) {}

updatePhoneTime();
setInterval(updatePhoneTime, 30000);

// ── 3. 重启所有自动 Moment 定时器 ──
try { restartAllAutoMoments(); } catch (e) {}

// ── 4. 输出账号信息到控制台 ──
(function () {
  var acct = getCurrentAccount();
  var total = getAllAccounts().length;
  console.log('🔑 当前账号: ' + (acct ? acct.name : '???') + '  (共 ' + total + ' 个账号)');
})();

