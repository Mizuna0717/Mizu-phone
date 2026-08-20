// ========== 19-init.js ==========
// 依賴：所有其他文件
// 此文件必須最後載入

loadState();
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
  const mi = document.getElementById('musicCoverImg');
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

// ★ 预渲染所有标签内容，确保切换标签时内容已就绪
try { renderCharList(); } catch (e) {}
try { renderGroups(); } catch (e) {}
try { renderMoments(); } catch (e) {}
try { renderMaskList(); } catch (e) {}
try { renderProfileInfo(); } catch (e) {}
try { renderProfileStickers(); } catch (e) {}

updatePhoneTime();

setInterval(updatePhoneTime, 30000);
