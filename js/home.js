// ========== 15-home.js ==========
// 依賴：02-state.js, 03-utils.js

let homePageIndex = 0;

function initHome() {
  initHomeSwipe();
  initWeatherWidget();
  updateGreeting();
  updateCalendar();
  renderHomeProfile();
  renderCalEvent();
  renderBlogWidget();
  const u = state.userProfile;
  if (u.musicSong) { const el = document.getElementById('musicSong'); if (el) el.textContent = u.musicSong; }
  if (u.musicArtist) { const el = document.getElementById('musicArtist'); if (el) el.textContent = u.musicArtist; }
  if (u.musicCover) { const img = document.getElementById('musicCoverImg'); if (img) { img.src = u.musicCover; img.style.display = 'block'; } }
  if (u.calEvent) renderCalEvent();
}

function initHomeSwipe() {
  initWeatherWidget();
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

// ========== BLOG WIDGET ==========
function _getBlogWidget() {
  if (!state.home) state.home = {};
  if (!state.home.widget) {
    state.home.widget = {
      topLeftText: 'if-kioyao.com', topRightText: 'Dorkioyao',
      avatar: { type: 'url', value: '' },
      titleText: 'Dorkioyao',
      description: ['time, record life, record everything.', 'Happy, healthy, and peaceful.'],
      images: [{ type: 'url', value: '' }, { type: 'url', value: '' }, { type: 'url', value: '' }]
    };
  }
  return state.home.widget;
}

function renderBlogWidget() {
  const w = _getBlogWidget();
  const topCenter = document.getElementById('bwTopCenterText');
  if (topCenter) topCenter.textContent = w.topLeftText || 'if-kioyao.com';
  const title = document.getElementById('bwTitle');
  if (title) title.textContent = w.titleText || 'Dorkioyao';
  const desc0 = document.getElementById('bwDesc0');
  if (desc0) desc0.textContent = (w.description && w.description[0]) || 'time, record life, record everything.';
  const desc1 = document.getElementById('bwDesc1');
  if (desc1) desc1.textContent = (w.description && w.description[1]) || 'Happy, healthy, and peaceful.';
  const avatarImg = document.getElementById('bwAvatarImg');
  const avatarPh  = document.getElementById('bwAvatarPh');
  const avatarVal = w.avatar && w.avatar.value;
  if (avatarVal) {
    avatarImg.src = avatarVal; avatarImg.style.display = 'block';
    if (avatarPh) avatarPh.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    if (avatarPh) avatarPh.style.display = 'block';
  }
  [0, 1, 2].forEach(i => {
    const img = document.getElementById('bwImg' + i);
    const ph  = document.getElementById('bwImgPh' + i);
    const val = w.images && w.images[i] && w.images[i].value;
    if (val) {
      img.src = val; img.style.display = 'block';
      if (ph) ph.style.display = 'none';
    } else {
      img.style.display = 'none';
      if (ph) ph.style.display = 'flex';
    }
  });
}

function _showBlogMediaPicker(onLocalFile, onUrlInput) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;background:rgba(0,0,0,.4);';
  modal.innerHTML = `
    <div style="background:#fff;width:100%;border-radius:20px 20px 0 0;padding:20px 20px calc(env(safe-area-inset-bottom,0px)+20px);">
      <div style="font-size:13px;color:#8e8e93;text-align:center;margin-bottom:16px;">Choose source</div>
      <button id="_bmpFile" style="display:block;width:100%;padding:14px;background:#f2f2f7;border:none;border-radius:12px;font-size:15px;margin-bottom:10px;cursor:pointer;">Upload from device</button>
      <button id="_bmpUrl" style="display:block;width:100%;padding:14px;background:#f2f2f7;border:none;border-radius:12px;font-size:15px;margin-bottom:10px;cursor:pointer;">Enter URL</button>
      <button id="_bmpCancel" style="display:block;width:100%;padding:14px;background:transparent;border:none;font-size:15px;color:#8e8e93;cursor:pointer;">Cancel</button>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('#_bmpFile').onclick = () => { document.body.removeChild(modal); onLocalFile(); };
  modal.querySelector('#_bmpUrl').onclick  = () => {
    document.body.removeChild(modal);
    const v = prompt('Image URL:');
    if (v && v.trim()) onUrlInput(v.trim());
  };
  modal.querySelector('#_bmpCancel').onclick = () => document.body.removeChild(modal);
  modal.onclick = e => { if (e.target === modal) document.body.removeChild(modal); };
}

function editBlogAvatar() {
  _showBlogMediaPicker(
    () => document.getElementById('bwAvatarInput').click(),
    url => {
      const w = _getBlogWidget();
      w.avatar = { type: 'url', value: url };
      saveState(); renderBlogWidget();
    }
  );
}

function setBlogAvatarFile(inp) {
  if (!inp.files || !inp.files[0]) return;
  const r = new FileReader();
  r.onload = e => {
    const w = _getBlogWidget();
    w.avatar = { type: 'local', value: e.target.result };
    saveState(); renderBlogWidget();
  };
  r.readAsDataURL(inp.files[0]);
}

function editBlogImage(index) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*';
  _showBlogMediaPicker(
    () => {
      fileInput.onchange = () => {
        if (!fileInput.files || !fileInput.files[0]) return;
        const r = new FileReader();
        r.onload = e => {
          const w = _getBlogWidget();
          w.images[index] = { type: 'local', value: e.target.result };
          saveState(); renderBlogWidget();
        };
        r.readAsDataURL(fileInput.files[0]);
      };
      fileInput.click();
    },
    url => {
      const w = _getBlogWidget();
      w.images[index] = { type: 'url', value: url };
      saveState(); renderBlogWidget();
    }
  );
}

function editBlogTopCenter() {
  const w = _getBlogWidget();
  const v = prompt('URL text:', w.topLeftText || 'if-kioyao.com');
  if (v !== null) { w.topLeftText = v; saveState(); renderBlogWidget(); }
}

function editBlogTopLeft() {
  editBlogTopCenter();
}

function editBlogTitle() {
  const w = _getBlogWidget();
  const v = prompt('Title:', w.titleText || 'Dorkioyao');
  if (v !== null) { w.titleText = v; saveState(); renderBlogWidget(); }
}

function editBlogDesc(index) {
  const w = _getBlogWidget();
  const cur = (w.description && w.description[index]) || '';
  const v = prompt('Description line ' + (index + 1) + ':', cur);
  if (v !== null) {
    if (!w.description) w.description = ['', ''];
    w.description[index] = v;
    saveState(); renderBlogWidget();
  }
}

function renderHomeProfile() {
  const u = state.userProfile;
  const img = document.getElementById('homeAvatarImg'), ph = document.getElementById('homeAvatarPh');
  if (img && ph) {
    if (u.avatar) { img.src = u.avatar; img.style.display = 'block'; ph.style.display = 'none'; }
    else { img.style.display = 'none'; ph.style.display = 'block'; }
  }
  const nameEl = document.getElementById('homeUserName');
  if (nameEl) nameEl.textContent = u.name || 'User';
  const bioEl = document.getElementById('homeUserBio');
  if (bioEl) bioEl.textContent = u.bio || 'Tap to add signature';
  if (u.banner) { const bi = document.getElementById('homeBannerImg'); if (bi) { bi.src = u.banner; bi.style.display = 'block'; } }
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

// ========== WEATHER WIDGET ==========
let _weatherLongPressTimer = null;

function initWeatherWidget() {
  const el = document.getElementById('weatherWidget');
  if (!el) return;
  el.addEventListener('click', () => fetchWeather());
  el.addEventListener('touchstart', () => {
    _weatherLongPressTimer = setTimeout(() => {
      _weatherLongPressTimer = null;
      weatherSetCity();
    }, 600);
  }, { passive: true });
  el.addEventListener('touchend', () => {
    if (_weatherLongPressTimer) { clearTimeout(_weatherLongPressTimer); _weatherLongPressTimer = null; }
  });
  el.addEventListener('touchmove', () => {
    if (_weatherLongPressTimer) { clearTimeout(_weatherLongPressTimer); _weatherLongPressTimer = null; }
  }, { passive: true });
  renderWeather();
  fetchWeather();
}

function renderWeather() {
  const w = (state.home && state.home.weather) ? state.home.weather : {};
  const tempEl = document.getElementById('weatherTemp');
  const condEl = document.getElementById('weatherCond');
  const humEl  = document.getElementById('weatherHum');
  const cityEl = document.getElementById('weatherCity');
  const timeEl = document.getElementById('weatherTime');
  if (tempEl) tempEl.textContent = (w.temperature && w.temperature !== '--') ? w.temperature + '\u00b0C' : '--\u00b0C';
  if (condEl) condEl.textContent = w.condition || '--';
  if (humEl)  humEl.textContent  = (w.humidity && w.humidity !== '--') ? w.humidity + '%' : '--%';
  if (cityEl) cityEl.textContent = w.city || '--';
  if (timeEl) timeEl.textContent = w.updatedAt || '';
}

function fetchWeather() {
  const w = (state.home && state.home.weather) ? state.home.weather : {};
  const city = w.city || 'auto';
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
  const indicator = document.getElementById('weatherIndicator');
  if (indicator) indicator.classList.add('loading');
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const cur = data.current_condition && data.current_condition[0];
      if (!cur) throw new Error('no data');
      const condArr = cur.weatherDesc;
      const condRaw = (condArr && condArr[0] && condArr[0].value) || '--';
      const condMap = {
        'Sunny': '\u6674', 'Clear': '\u6674', 'Partly cloudy': '\u591a\u4e91',
        'Cloudy': '\u9634', 'Overcast': '\u9634', 'Mist': '\u8584\u96fe',
        'Fog': '\u96fe', 'Light rain': '\u5c0f\u96e8', 'Moderate rain': '\u4e2d\u96e8',
        'Heavy rain': '\u5927\u96e8', 'Light snow': '\u5c0f\u96ea', 'Moderate snow': '\u4e2d\u96ea',
        'Heavy snow': '\u5927\u96ea', 'Blizzard': '\u66b4\u96ea', 'Thundery outbreaks possible': '\u96f7\u9635\u96e8',
        'Patchy rain possible': '\u9635\u96e8', 'Drizzle': '\u6bdb\u6bdb\u96e8'
      };
      const cond = condMap[condRaw] || condRaw;
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const updatedAt = `${now.getMonth()+1}/${now.getDate()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      if (!state.home) state.home = {};
      if (!state.home.weather) state.home.weather = {};
      state.home.weather.temperature = cur.temp_C || '--';
      state.home.weather.condition   = cond;
      state.home.weather.humidity    = cur.humidity || '--';
      state.home.weather.updatedAt   = updatedAt;
      saveState();
      renderWeather();
    })
    .catch(() => renderWeather())
    .finally(() => { if (indicator) indicator.classList.remove('loading'); });
}

function weatherSetCity() {
  const cur = (state.home && state.home.weather && state.home.weather.city) || '';
  const v = prompt('City name (leave blank for auto-detect):', cur);
  if (v === null) return;
  if (!state.home) state.home = {};
  if (!state.home.weather) state.home.weather = {};
  state.home.weather.city = v.trim();
  saveState();
  renderWeather();
  fetchWeather();
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
