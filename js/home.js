// ========== 15-home.js ==========
// 依賴：02-state.js, 03-utils.js

let homePageIndex = 0;

function initHomeSwipe() {
  const pages = document.getElementById('homePages');
  if (!pages) return;
  let startX = 0, startY = 0, diffX = 0, moving = false;
  pages.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; moving = true; diffX = 0; });
  pages.addEventListener('touchmove', e => {
    if (!moving) return;
    diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) e.preventDefault();
  }, { passive: false });
  pages.addEventListener('touchend', () => {
    if (!moving) return;
    moving = false;
    if (diffX < -50 && homePageIndex < 1) { homePageIndex = 1; updateHomePages(); }
    else if (diffX > 50 && homePageIndex > 0) { homePageIndex = 0; updateHomePages(); }
  });
}

function updateHomePages() {
  document.getElementById('homePage1').style.transform = `translateX(${-homePageIndex * 100}%)`;
  document.getElementById('homePage2').style.transform = `translateX(${-homePageIndex * 100}%)`;
  document.getElementById('homeDot0').classList.toggle('active', homePageIndex === 0);
  document.getElementById('homeDot1').classList.toggle('active', homePageIndex === 1);
}

// ========== Together 入口 ==========
function openTogether() {
  console.log('[Together] Opening Together app');
  nav('screen-together');
}

// ========== HOME WIDGETS ==========
function setHomeBanner(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById('homeBannerImg');
      img.src = e.target.result;
      img.style.display = 'block';
      state.userProfile.banner = e.target.result;
      saveState();
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function setHomeAvatar(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => { state.userProfile.avatar = e.target.result; saveState(); renderHomeProfile(); };
    r.readAsDataURL(inp.files[0]);
  }
}

function renderHomeProfile() {
  const u = state.userProfile;
  const img = document.getElementById('homeAvatarImg'), ph = document.getElementById('homeAvatarPh');
  if (u.avatar) { img.src = u.avatar; img.style.display = 'block'; ph.style.display = 'none'; }
  else { img.style.display = 'none'; ph.style.display = 'block'; }
  document.getElementById('homeUserName').textContent = u.name || 'User';
  document.getElementById('homeUserBio').textContent = u.bio || 'Tap to add signature';
  if (u.banner) { const bi = document.getElementById('homeBannerImg'); bi.src = u.banner; bi.style.display = 'block'; }
}

function startEditHomeName() {
  document.getElementById('nameModalInput').value = state.userProfile.name || '';
  document.getElementById('nameModal').classList.add('show');
  document.getElementById('nameModalInput').focus();
  window._nameTarget = 'home';
}

function startEditHomeBio() {
  const v = prompt('Signature:', (state.userProfile.bio || ''));
  if (v !== null) { state.userProfile.bio = v; saveState(); renderHomeProfile(); }
}

// ========== GREETING WIDGET ==========
function setGreetingBg(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById('greetingBgImg');
      img.src = e.target.result;
      img.style.display = 'block';
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function updateGreeting() {
  const h = new Date().getHours();
  let t = 'Good Evening';
  if (h >= 5 && h < 12) t = 'Good Morning';
  else if (h >= 12 && h < 18) t = 'Good Afternoon';
  document.getElementById('greetingText').textContent = t;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  document.getElementById('greetingDots').innerHTML = days.map((d, i) =>
    `<div class="gw-day${i === today ? ' today' : ''}"><span>${d}</span><div class="gd-dot"></div></div>`
  ).join('');
}

// ========== MUSIC WIDGET ==========
function setMusicCover(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById('musicCoverImg');
      img.src = e.target.result;
      img.style.display = 'block';
      state.userProfile.musicCover = e.target.result;
      saveState();
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function editMusicInfo(type) {
  const key = type === 'song' ? 'musicSong' : 'musicArtist';
  const cur = state.userProfile[key] || '';
  const v = prompt(type === 'song' ? 'Song name:' : 'Artist:', cur);
  if (v !== null) {
    state.userProfile[key] = v;
    saveState();
    document.getElementById(key === 'musicSong' ? 'musicSong' : 'musicArtist').textContent = v || (type === 'song' ? 'Song Title' : 'Artist');
  }
}

// ========== CALENDAR WIDGET ==========
function updateCalendar() {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  document.getElementById('calMonth').textContent = months[now.getMonth()];
  document.getElementById('calDate').textContent = now.getDate();
  document.getElementById('calWeekday').textContent = days[now.getDay()];
}

function editCalEvent() {
  const v = prompt('Event name:', state.userProfile.calEvent || '');
  if (v !== null) {
    state.userProfile.calEvent = v;
    if (v) {
      const d = prompt('Days until event:', '0');
      state.userProfile.calDays = parseInt(d) || 0;
    }
    saveState();
    renderCalEvent();
  }
}

function renderCalEvent() {
  const ev = state.userProfile.calEvent;
  const el = document.getElementById('calEvent'), cd = document.getElementById('calCountdown');
  if (ev) { el.textContent = ev; cd.textContent = state.userProfile.calDays || 0; cd.style.display = 'block'; }
  else { el.textContent = 'Tap to set event'; cd.style.display = 'none'; }
}
