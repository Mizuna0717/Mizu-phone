// ========== 15-home.js ==========
// 依賴：02-state.js, 03-utils.js

let homePageIndex = 0;

function initHome() {
  initHomeSwipe();
  updateGreeting();
  updateCalendar();
  renderHomeProfile();
  renderCalEvent();

  renderBlogWidget();
  renderWeatherWidget();

  const u = state.userProfile;
    _renderMusicWidget();
  if (u.calEvent) renderCalEvent();
}

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

// ========== BLOG WIDGET ==========
function _getBlogWidget() {
  if (!state.home) state.home = {};
    if (!state.home.widget) {
    state.home.widget = {
      topLeftText: 'Mizu phone.com', topRightText: 'Mizu',
      avatar: { type: 'url', value: '' },
      titleText: 'Mizu',
      description: ['🤍ineedu…^', '너에 대한 그리움은 사랑니처럼 은근히 아파 ⊹ '],
      images: [{ type: 'url', value: '' }, { type: 'url', value: '' }, { type: 'url', value: '' }]
    };
  }
  if (!state.home.widget.avatar || !state.home.widget.avatar.value) {
    state.home.widget.avatar = { type: 'url', value: 'images/blog-avatar.jpg' };
    saveState(true);
  }
  const _defaultImgs = ['images/blog-1.jpg', 'images/blog-2.jpg', 'images/blog-3.jpg'];
  let _imgChanged = false;
  [0, 1, 2].forEach(i => {
    if (!state.home.widget.images[i] || !state.home.widget.images[i].value) {
      state.home.widget.images[i] = { type: 'url', value: _defaultImgs[i] };
      _imgChanged = true;
    }
  });
  if (_imgChanged) saveState(true);
  const defaultImgs = ['images/blog-1.jpg', 'images/blog-2.jpg', 'images/blog-3.jpg'];
  let changed = false;
  [0, 1, 2].forEach(i => {
    if (!state.home.widget.images[i] || !state.home.widget.images[i].value) {
      state.home.widget.images[i] = { type: 'url', value: defaultImgs[i] };
      changed = true;
    }
  });
  if (changed) saveState(true);
  return state.home.widget;
}

function renderBlogWidget() {
  const w = _getBlogWidget();
  const topCenter = document.getElementById('bwTopCenterText');
  if (topCenter) topCenter.textContent = w.topLeftText || 'Mizu phone.com';
  const title = document.getElementById('bwTitle');
  if (title) title.textContent = w.titleText || 'Mizu';
  const desc0 = document.getElementById('bwDesc0');
  if (desc0) desc0.textContent = (w.description && w.description[0]) || '🤍ineedu…^';
  const desc1 = document.getElementById('bwDesc1');
  if (desc1) desc1.textContent = (w.description && w.description[1]) || '너에 대한 그리움은 사랑니처럼 은근히 아파 ⊹ ';
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
  const overlay = document.createElement('div');
  overlay.className = 'modern-modal-overlay';
  overlay.innerHTML = `
    <div class="modern-modal">
      <div class="modern-modal-header">
        <div class="modern-modal-title">Choose Image Source</div>
        <div class="modern-modal-subtitle">Select how you want to add an image</div>
      </div>
      <div class="modern-modal-body">
                <div class="modern-modal-option" id="_mmpFile">
          <div class="modern-modal-option-icon">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          </div>
          <div class="modern-modal-option-text">
            <div class="modern-modal-option-title">Upload from Device</div>
            <div class="modern-modal-option-desc">Choose a photo from your gallery</div>
          </div>
        </div>
        <div class="modern-modal-option" id="_mmpUrl">
          <div class="modern-modal-option-icon">
            <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          </div>
          <div class="modern-modal-option-text">
            <div class="modern-modal-option-title">Enter Image URL</div>
            <div class="modern-modal-option-desc">Paste a link from the web</div>
          </div>
        </div>
      </div>
      <div class="modern-modal-buttons">
        <button class="modern-modal-btn modern-modal-btn-secondary" id="_mmpCancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  
  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => document.body.removeChild(overlay), 250);
  };
  
  overlay.querySelector('#_mmpFile').onclick = () => { closeModal(); onLocalFile(); };
  overlay.querySelector('#_mmpUrl').onclick = () => {
    closeModal();
    setTimeout(() => _showTextInputModal('Enter Image URL', 'Paste the image URL here', '', url => {
      if (url && url.trim()) onUrlInput(url.trim());
    }), 300);
  };
  overlay.querySelector('#_mmpCancel').onclick = closeModal;
  overlay.onclick = e => { if (e.target === overlay) closeModal(); };
}

function _showTextInputModal(title, placeholder, defaultValue, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modern-modal-overlay';
  overlay.innerHTML = `
    <div class="modern-modal">
      <div class="modern-modal-header">
        <div class="modern-modal-title">${title}</div>
      </div>
      <div class="modern-modal-body">
        <input type="text" class="modern-modal-input" id="_timInput" placeholder="${placeholder}" value="${defaultValue}">
      </div>
      <div class="modern-modal-buttons">
        <button class="modern-modal-btn modern-modal-btn-primary" id="_timConfirm">Confirm</button>
        <button class="modern-modal-btn modern-modal-btn-secondary" id="_timCancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  
  const input = overlay.querySelector('#_timInput');
  setTimeout(() => input.focus(), 300);
  
  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => document.body.removeChild(overlay), 250);
  };
  
  const confirm = () => {
    const val = input.value;
    closeModal();
    onConfirm(val);
  };
  
  overlay.querySelector('#_timConfirm').onclick = confirm;
  overlay.querySelector('#_timCancel').onclick = closeModal;
  overlay.onclick = e => { if (e.target === overlay) closeModal(); };
  input.onkeydown = e => { if (e.key === 'Enter') confirm(); };
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
  _showTextInputModal('Edit URL Text', 'Enter the URL or domain name', w.topLeftText || 'Mizu phone.com', v => {
    if (v !== null && v !== undefined) { w.topLeftText = v; saveState(); renderBlogWidget(); }
  });
}

function editBlogTopLeft() {
  editBlogTopCenter();
}

function editBlogTitle() {
  const w = _getBlogWidget();
  _showTextInputModal('Edit Title', 'Enter your name or title', w.titleText || 'Mizu', v => {
    if (v !== null && v !== undefined) { w.titleText = v; saveState(); renderBlogWidget(); }
  });
}

function editBlogDesc(index) {
  const w = _getBlogWidget();
  const cur = (w.description && w.description[index]) || '';
  _showTextInputModal('Edit Description Line ' + (index + 1), 'Enter description text', cur, v => {
    if (v !== null && v !== undefined) {
      if (!w.description) w.description = ['', ''];
      w.description[index] = v;
      saveState(); renderBlogWidget();
    }
  });
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
  _showTextInputModal('Edit Signature', 'Enter your signature or bio', state.userProfile.bio || '', v => {
    if (v !== null && v !== undefined) { state.userProfile.bio = v; saveState(); renderHomeProfile(); }
  });
}

// ========== GREETING WIDGET ==========
function _getGreetingWidget() {
  if (!state.home) state.home = {};
  if (!state.home.greetingWidget) {
    state.home.greetingWidget = {
      bubbles: ['o•ᴗ•o', 'ᴗ ∧ ᴗ'],
      names: ['Janice', 'James'],
      tags: ['infp | Aries', 'entp | Capricorn'],
      avatars: ['', '']
    };
  }
  return state.home.greetingWidget;
}

function updateGreeting() {
  const gw = _getGreetingWidget();
  [0, 1].forEach(i => {
    const b = document.getElementById('gwBubble' + i);
    const n = document.getElementById('gwName' + i);
    const t = document.getElementById('gwTag' + i);
    if (b) b.textContent = (gw.bubbles && gw.bubbles[i]) || (i === 0 ? 'o•ᴗ•o' : 'ᴗ ∧ ᴗ');
    if (n) n.textContent = (gw.names && gw.names[i]) || (i === 0 ? 'Janice' : 'James');
    if (t) t.textContent = (gw.tags && gw.tags[i]) || (i === 0 ? 'infp | Aries' : 'entp | Capricorn');
    const img = document.getElementById('gwAvatar' + i);
    const ph  = document.getElementById('gwAvatarPh' + i);
    const val = gw.avatars && gw.avatars[i];
    if (img && ph) {
      if (val) { img.src = val; img.style.display = 'block'; ph.style.display = 'none'; }
      else { img.style.display = 'none'; ph.style.display = 'block'; }
    }
  });
}

function syncGwTemp() {}

function editGwChar(index) {
  const gw = _getGreetingWidget();
  const cur = (gw.bubbles && gw.bubbles[index]) || '';
  _showTextInputModal('Edit Bubble Text', 'Enter bubble text', cur, v => {
    if (v !== null && v !== undefined) {
      if (!gw.bubbles) gw.bubbles = ['', ''];
      gw.bubbles[index] = v;
      saveState();
      updateGreeting();
    }
  });
}

function editGwName(index) {
  const gw = _getGreetingWidget();
  const cur = (gw.names && gw.names[index]) || '';
  _showTextInputModal('Edit Name', 'Enter name', cur, v => {
    if (v !== null && v !== undefined) {
      if (!gw.names) gw.names = ['', ''];
      gw.names[index] = v;
      saveState();
      updateGreeting();
    }
  });
}

function editGwTag(index) {
  const gw = _getGreetingWidget();
  const cur = (gw.tags && gw.tags[index]) || '';
  _showTextInputModal('Edit Tag', 'e.g. infp | Aries', cur, v => {
    if (v !== null && v !== undefined) {
      if (!gw.tags) gw.tags = ['', ''];
      gw.tags[index] = v;
      saveState();
      updateGreeting();
    }
  });
}

function editGwAvatar(index) {
  _showBlogMediaPicker(
    () => document.getElementById('gwAvatarInput' + index).click(),
    url => {
      const gw = _getGreetingWidget();
      if (!gw.avatars) gw.avatars = ['', ''];
      gw.avatars[index] = url;
      saveState();
      updateGreeting();
    }
  );
}

function setGwAvatar(index, inp) {
  if (!inp.files || !inp.files[0]) return;
  const r = new FileReader();
  r.onload = e => {
    const gw = _getGreetingWidget();
    if (!gw.avatars) gw.avatars = ['', ''];
    gw.avatars[index] = e.target.result;
    saveState();
    updateGreeting();
  };
  r.readAsDataURL(inp.files[0]);
}

// ========== MUSIC WIDGET ==========
function setMusicCover(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById('musicCoverImg');
      const ph  = document.getElementById('musicCoverPh');
      img.src = e.target.result;
      img.style.display = 'block';
      if (ph) ph.style.display = 'none';
      state.userProfile.musicCover = e.target.result;
      saveState();
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function _renderMusicWidget() {
  const u = state.userProfile;
  const song   = document.getElementById('musicSong');
  const artist = document.getElementById('musicArtist');
  const img    = document.getElementById('musicCoverImg');
  const ph     = document.getElementById('musicCoverPh');
  if (song)   song.textContent   = u.musicSong   || 'Collect,';
  if (artist) artist.textContent = u.musicArtist || 'My album.';
  if (img && ph) {
    if (u.musicCover) {
      img.src = u.musicCover; img.style.display = 'block'; ph.style.display = 'none';
    } else {
      img.style.display = 'none'; ph.style.display = 'flex';
    }
  }
}

function editMusicInfo(type) {
  const key = type === 'song' ? 'musicSong' : 'musicArtist';
  const cur = state.userProfile[key] || '';
  const title = type === 'song' ? 'Edit Song Name' : 'Edit Artist Name';
  const placeholder = type === 'song' ? 'Enter song name' : 'Enter artist name';
  _showTextInputModal(title, placeholder, cur, v => {
    if (v !== null && v !== undefined) {
        state.userProfile[key] = v;
        saveState();
        _renderMusicWidget();
      }
  });
}

// ========== WEATHER WIDGET (NEW) ==========
function _getWeatherWidget() {
  if (!state.home) state.home = {};
    if (!state.home.weatherWidget) {
    state.home.weatherWidget = {
      recordText: ['♡ㅠ ㅠ…？', 'i 🤍uuu so..'],
      image: { type: 'url', value: '' }
    };
  }
  if (!state.home.weatherWidget.image || !state.home.weatherWidget.image.value) {
    state.home.weatherWidget.image = { type: 'url', value: 'images/weather-1.jpg' };
    saveState(true);
  }
  return state.home.weatherWidget;
}

function renderWeatherWidget() {
  const ww = _getWeatherWidget();
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayEl = document.getElementById('nwwDay');
  const wdEl  = document.getElementById('nwwWeekday');
  if (dayEl) dayEl.textContent = now.getDate();
  if (wdEl)  wdEl.textContent  = days[now.getDay()];
  const r1 = document.getElementById('nwwRecord1');
  const r2 = document.getElementById('nwwRecord2');
  if (r1) r1.textContent = (ww.recordText && ww.recordText[0]) || '♡ㅠ ㅠ…？';
  if (r2) r2.textContent = (ww.recordText && ww.recordText[1]) || 'i 🤍uuu so..';
  const img = document.getElementById('nwwImg');
  const ph  = document.getElementById('nwwImgPh');
  const val = ww.image && ww.image.value;
  if (img && ph) {
    if (val) { img.src = val; img.style.display = 'block'; ph.style.display = 'none'; }
    else { img.style.display = 'none'; ph.style.display = 'flex'; }
  }
}

function editWeatherRecord(index) {
  const ww = _getWeatherWidget();
  const cur = (ww.recordText && ww.recordText[index]) || '';
  _showTextInputModal('Edit Record Text', 'Enter description text', cur, v => {
    if (v !== null && v !== undefined) {
      if (!ww.recordText) ww.recordText = ['', ''];
      ww.recordText[index] = v;
      saveState();
      renderWeatherWidget();
    }
  });
}

function editWeatherImage() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*';
  _showBlogMediaPicker(
    () => {
      fileInput.onchange = () => {
        if (!fileInput.files || !fileInput.files[0]) return;
        const r = new FileReader();
        r.onload = e => {
          const ww = _getWeatherWidget();
          ww.image = { type: 'local', value: e.target.result };
          saveState(); renderWeatherWidget();
        };
        r.readAsDataURL(fileInput.files[0]);
      };
      fileInput.click();
    },
    url => {
      const ww = _getWeatherWidget();
      ww.image = { type: 'url', value: url };
      saveState(); renderWeatherWidget();
    }
  );
}

function setWeatherWidgetImageFile(inp) {
  if (!inp.files || !inp.files[0]) return;
  const r = new FileReader();
  r.onload = e => {
    const ww = _getWeatherWidget();
    ww.image = { type: 'local', value: e.target.result };
    saveState(); renderWeatherWidget();
  };
  r.readAsDataURL(inp.files[0]);
}

// ========== WEATHER WIDGET (DATA FETCH) ==========
let _weatherLongPressTimer = null;
let _weatherWidgetInited = false;

function initWeatherWidget() {
  const el = document.getElementById('weatherWidget');
  if (!el) return;
  if (_weatherWidgetInited) { renderWeather(); fetchWeather(); return; }
  _weatherWidgetInited = true;
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
      syncGwTemp();
    })
    .catch(() => renderWeather())
    .finally(() => { if (indicator) indicator.classList.remove('loading'); });
}

function weatherSetCity() {
  const cur = (state.home && state.home.weather && state.home.weather.city) || '';
  _showTextInputModal('Set Weather Location', 'Enter city name or leave blank for auto-detect', cur, v => {
    if (v === null || v === undefined) return;
    if (!state.home) state.home = {};
    if (!state.home.weather) state.home.weather = {};
    state.home.weather.city = v.trim();
    saveState();
    renderWeather();
    fetchWeather();
  });
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
  _showTextInputModal('Edit Event Name', 'Enter event name', state.userProfile.calEvent || '', v => {
    if (v !== null && v !== undefined) {
      state.userProfile.calEvent = v;
      if (v) {
        setTimeout(() => {
          _showTextInputModal('Days Until Event', 'Enter number of days', '0', d => {
            state.userProfile.calDays = parseInt(d) || 0;
            saveState();
            renderCalEvent();
          });
        }, 300);
      } else {
        saveState();
        renderCalEvent();
      }
    }
  });
}

function renderCalEvent() {
  const ev = state.userProfile.calEvent;
  const el = document.getElementById('calEvent'), cd = document.getElementById('calCountdown');
  if (ev) { el.textContent = ev; cd.textContent = state.userProfile.calDays || 0; cd.style.display = 'block'; }
  else { el.textContent = 'Tap to set event'; cd.style.display = 'none'; }
}
