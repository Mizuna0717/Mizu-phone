// ========== PHONE ==========

// ========== APP LIBRARY (38 apps, line-style SVG icons) ==========
var APP_LIBRARY = {
  messages: { name:'Messages', desc:'Text messaging and chat', css:'pi-msg',
    svg:'<path d="M4 5h18a1 1 0 011 1v11a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z"/>' },
  notes: { name:'Notes', desc:'Writing memos and notes', css:'pi-notes',
    svg:'<rect x="6" y="3" width="14" height="20" rx="2"/><path d="M9 8h8M9 12h8M9 16h5"/>' },
  photos: { name:'Photos', desc:'Photo gallery and memories', css:'pi-photos',
    svg:'<rect x="3" y="5" width="20" height="16" rx="2"/><path d="M3 17l5-5 3 3 4-4 5 5"/><circle cx="18" cy="9" r="1.5"/>' },
  camera: { name:'Camera', desc:'Take photos and videos', css:'pi-camera',
    svg:'<path d="M3 9a1 1 0 011-1h3l2-3h8l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><circle cx="13" cy="14" r="3.5"/>' },
  calendar: { name:'Calendar', desc:'Schedule, events and dates', css:'pi-calendar',
    svg:'<rect x="4" y="5" width="18" height="17" rx="2"/><path d="M4 10h18M9 3v4M17 3v4"/>' },
  clock: { name:'Clock', desc:'Clock, timers and alarms', css:'pi-clock',
    svg:'<circle cx="13" cy="13" r="9"/><path d="M13 7v6l4 3"/>' },
  weather: { name:'Weather', desc:'Weather forecast and conditions', css:'pi-weather',
    svg:'<circle cx="13" cy="13" r="4"/><path d="M13 4v3M13 19v3M4 13h3M19 13h3M6.8 6.8l2.1 2.1M17.1 17.1l2.1 2.1M6.8 19.2l2.1-2.1M17.1 8.9l2.1-2.1"/>' },
  maps: { name:'Maps', desc:'Maps, navigation and directions', css:'pi-maps',
    svg:'<path d="M13 3C9 3 6 6 6 9.7c0 5.4 7 13.3 7 13.3s7-7.9 7-13.3C20 6 17 3 13 3z"/><circle cx="13" cy="10" r="2.5"/>' },
  music: { name:'Music', desc:'Music player and playlists', css:'pi-music',
    svg:'<path d="M9 19V7l10-3v12"/><circle cx="7" cy="19" r="3"/><circle cx="17" cy="16" r="3"/>' },
  videos: { name:'Videos', desc:'Video player and streaming', css:'pi-video',
    svg:'<rect x="3" y="5" width="20" height="16" rx="2"/><path d="M11 9l6 4-6 4z"/>' },
  browser: { name:'Browser', desc:'Web browsing and internet', css:'pi-browser',
    svg:'<circle cx="13" cy="13" r="9"/><path d="M4 13h18"/><path d="M13 4c-3 3-4 5.5-4 9s1 6 4 9M13 4c3 3 4 5.5 4 9s-1 6-4 9"/>' },
  mail: { name:'Mail', desc:'Email and correspondence', css:'pi-msg',
    svg:'<rect x="3" y="6" width="20" height="14" rx="2"/><path d="M3 8l10 6 10-6"/>' },
  phone_call: { name:'Phone', desc:'Make and receive phone calls', css:'pi-phone',
    svg:'<path d="M6 4s-2 3-2 5 3 6 6 9 7 5 9 5 5-2 5-2l-3-4-3 2c-1 0-4-2-6-4s-4-5-4-6l2-3z"/>' },
  contacts: { name:'Contacts', desc:'Address book and contacts', css:'pi-contacts',
    svg:'<circle cx="13" cy="9" r="4"/><path d="M5 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/>' },
  settings: { name:'Settings', desc:'System settings and preferences', css:'pi-settings',
    svg:'<circle cx="11" cy="7" r="2"/><circle cx="15" cy="13" r="2"/><circle cx="9" cy="19" r="2"/><path d="M4 7h5M13 7h9M4 13h9M17 13h5M4 19h3M11 19h11"/>' },
  calculator: { name:'Calculator', desc:'Math and calculations', css:'pi-wallet',
    svg:'<rect x="5" y="3" width="16" height="20" rx="2"/><rect x="8" y="6" width="10" height="4" rx="1"/><path d="M8 14h3M15 14h3M8 18h3M15 18h3"/>' },
  files: { name:'Files', desc:'File manager and documents', css:'pi-files',
    svg:'<path d="M4 7h7l2 2h9v12a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"/>' },
  recorder: { name:'Voice Memo', desc:'Audio and voice recording', css:'pi-recorder',
    svg:'<rect x="9" y="3" width="8" height="12" rx="4"/><path d="M6 13a7 7 0 0014 0M13 20v4"/>' },
  health: { name:'Health', desc:'Health and wellness tracking', css:'pi-health',
    svg:'<path d="M13 20C6 15.5 3 12 3 8.5 3 5.5 5.5 3 8.5 3c1.7 0 3.4 1 4.5 2.5C14.1 4 15.8 3 17.5 3 20.5 3 23 5.5 23 8.5 23 12 20 15.5 13 20z"/>' },
  wallet: { name:'Wallet', desc:'Payments, banking and cards', css:'pi-wallet',
    svg:'<rect x="3" y="6" width="20" height="14" rx="2"/><path d="M3 11h20M7 16h4"/>' },
  books: { name:'Books', desc:'E-books, reading and literature', css:'pi-notes',
    svg:'<path d="M4 19V5c3-1 5 0 9 1 4-1 6-2 9-1v14c-3-1-5 0-9 1-4-1-6-2-9-1z"/><path d="M13 6v14"/>' },
  diary: { name:'Diary', desc:'Personal journal and diary entries', css:'pi-notes',
    svg:'<rect x="6" y="3" width="15" height="20" rx="2"/><path d="M6 3h3v20H6M12 8h6M12 12h6M12 16h4"/>' },
  news: { name:'News', desc:'News, articles and current events', css:'pi-browser',
    svg:'<rect x="3" y="4" width="20" height="18" rx="2"/><path d="M3 9h20"/><rect x="6" y="12" width="5" height="5"/><path d="M15 13h5M15 16h4M15 19h3"/>' },
  shopping: { name:'Shopping', desc:'Online shopping and purchases', css:'pi-shop',
    svg:'<path d="M7 7h14l-2 9H9z"/><path d="M7 7L6 3H3"/><circle cx="10" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>' },
  social: { name:'Social', desc:'Social media and networking', css:'pi-contacts',
    svg:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="13" r="2.5"/><circle cx="18" cy="21" r="2.5"/><path d="M8 12l8-6M8 14l8 6"/>' },
  fitness: { name:'Fitness', desc:'Workouts, exercise and activity tracking', css:'pi-health',
    svg:'<rect x="4" y="15" width="3" height="6" rx="1"/><rect x="9" y="11" width="3" height="10" rx="1"/><rect x="14" y="7" width="3" height="14" rx="1"/><rect x="19" y="12" width="3" height="9" rx="1"/>' },
  meditation: { name:'Meditation', desc:'Mindfulness, relaxation and calm', css:'pi-health',
    svg:'<circle cx="13" cy="13" r="9"/><circle cx="13" cy="13" r="5"/><circle cx="13" cy="13" r="1.5"/>' },
  recipes: { name:'Recipes', desc:'Cooking recipes and meal planning', css:'pi-shop',
    svg:'<path d="M9 3v18M6 3v6a3 3 0 006 0V3"/><path d="M17 3v7l-2 2v9"/>' },
  travel: { name:'Travel', desc:'Travel planning, flights and trips', css:'pi-travel',
    svg:'<rect x="5" y="9" width="16" height="12" rx="2"/><path d="M9 9V6a1 1 0 011-1h6a1 1 0 011 1v3M5 14h16"/>' },
  games: { name:'Games', desc:'Games and entertainment', css:'pi-music',
    svg:'<rect x="3" y="9" width="20" height="10" rx="5"/><circle cx="8" cy="14" r="1.5"/><path d="M16 12v4M14 14h4"/>' },
  drawing: { name:'Drawing', desc:'Digital art, sketching and design', css:'pi-photos',
    svg:'<path d="M4 21l2-6L18 3l3 3L9 18z"/><path d="M15 6l3 3"/>' },
  coding: { name:'Code', desc:'Programming, development and terminal', css:'pi-files',
    svg:'<path d="M8 7l-5 6 5 6M18 7l5 6-5 6"/><path d="M14 4l-3 18"/>' },
  stocks: { name:'Stocks', desc:'Stock market, investments and finance', css:'pi-wallet',
    svg:'<path d="M4 18l4-5 4 3 5-8 4 4"/><path d="M4 22h18"/>' },
  podcast: { name:'Podcast', desc:'Podcast listening and audio shows', css:'pi-recorder',
    svg:'<circle cx="13" cy="13" r="3"/><path d="M7 13a6 6 0 0112 0M4 13a9 9 0 0118 0M13 16v5M10 21h6"/>' },
  translator: { name:'Translator', desc:'Language translation and dictionary', css:'pi-browser',
    svg:'<path d="M4 5h10M9 3v2M6 9c1.5 3 3.5 5 4.5 6M13 9c-1.5 3-3.5 5-4.5 6"/><path d="M15 14l3 7 3-7M16 19h4"/>' },
  reminders: { name:'Reminders', desc:'To-do lists, tasks and checklists', css:'pi-calendar',
    svg:'<path d="M4 7h3v3H4zM4 13h3v3H4zM4 19h3v3H4z"/><path d="M10 8.5h12M10 14.5h12M10 20.5h8"/>' },
  compass: { name:'Compass', desc:'Direction finding and orientation', css:'pi-maps',
    svg:'<circle cx="13" cy="13" r="9"/><path d="M16.5 9.5l-2 5-5 2 2-5z"/>' },
  check_phone: { name:'Check Phone', desc:'View phone access log', css:'pi-check',
    svg:'<path d="M3 13s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="13" cy="13" r="3"/>' }
};

// ========== PHONE TIME ==========
function updatePhoneTime() {
  var now = new Date();
  var el = document.getElementById('phoneTime');
  if (el) el.textContent = ('' + now.getHours()).padStart(2, '0') + ':' + ('' + now.getMinutes()).padStart(2, '0');
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var del = document.getElementById('phoneDate');
  if (del) del.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
}

// ========== ENTER PHONE SCREEN ==========
function enterPhoneScreen() {
  nav('screen-phone');
  if (state.phoneCharId) {
    var ch = state.characters.find(function(c) { return c.id === state.phoneCharId; });
    if (ch) { selectPhoneChar(state.phoneCharId); return; }
  }
  showPhoneCharSelect();
}

// ========== SHOW CHAR SELECT ==========
function showPhoneCharSelect() {
  closePhoneFolder();
  closePhoneApp();
  var charSelect = document.getElementById('phoneCharSelect');
  var frameWrap = document.getElementById('phoneFrameWrap');
  var navRight = document.getElementById('phoneNavRight');
  var navTitle = document.getElementById('phoneNavTitle');
  if (charSelect) charSelect.style.display = '';
  if (frameWrap) frameWrap.style.display = 'none';
  if (navRight) navRight.style.display = 'none';
  if (navTitle) navTitle.textContent = T('phone') || 'Phone';
  state.phoneCharId = null;
  renderPhoneCharList();
}

// ========== RENDER CHAR LIST ==========
function renderPhoneCharList() {
  var list = document.getElementById('phoneCharList');
  if (!list) return;
  if (!state.characters || !state.characters.length) {
    list.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#8e8e93;"><svg viewBox="0 0 48 48" width="48" height="48" style="opacity:0.3;margin-bottom:12px;"><circle cx="24" cy="16" r="10" stroke="#8e8e93" fill="none" stroke-width="2"/><path d="M8 44c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#8e8e93" fill="none" stroke-width="2" stroke-linecap="round"/></svg><p style="font-size:15px;">No characters yet</p></div>';
    return;
  }
  var h = '<div style="display:flex;flex-direction:column;gap:1px;">';
  state.characters.forEach(function(ch) {
    var avatarHtml = ch.avatar
      ? '<img src="' + ch.avatar + '" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">'
      : '<div style="width:44px;height:44px;border-radius:50%;background:#2c2c2e;display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 20 20" width="22" height="22"><circle cx="10" cy="7" r="4" stroke="#8e8e93" fill="none" stroke-width="1.5"/><path d="M3 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#8e8e93" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg></div>';
    var hasData = state.phoneData && state.phoneData[ch.id] && state.phoneData[ch.id].desktop;
    var subText = ch.notes ? '<div style="font-size:12px;color:#8e8e93;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(ch.notes) + '</div>' : '';
    var badge = hasData ? '<span style="font-size:10px;color:#30d158;background:rgba(48,209,88,.12);padding:2px 8px;border-radius:10px;font-weight:500;flex-shrink:0">Ready</span>' : '';
    h += '<div onclick="selectPhoneChar(\'' + ch.id + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#1c1c1e;cursor:pointer;border-radius:10px;margin-bottom:4px;"><div style="flex-shrink:0;">' + avatarHtml + '</div><div style="flex:1;min-width:0;"><div style="font-size:15px;color:#fff;font-weight:500;">' + esc(ch.name) + '</div>' + subText + '</div>' + badge + '<span style="color:#48484a;font-size:18px;">></span></div>';
  });
  h += '</div>';
  list.innerHTML = h;
}

// ========== SELECT CHAR ==========
function selectPhoneChar(cid) {
  var ch = state.characters.find(function(c) { return c.id === cid; });
  if (!ch) { showToast('Character not found'); showPhoneCharSelect(); return; }
  state.phoneCharId = cid; saveState(); closePhoneApp();
  var charSelect = document.getElementById('phoneCharSelect');
  var frameWrap = document.getElementById('phoneFrameWrap');
  var navRight = document.getElementById('phoneNavRight');
  var navTitle = document.getElementById('phoneNavTitle');
  if (charSelect) charSelect.style.display = 'none';
  if (frameWrap) frameWrap.style.display = '';
  if (navRight) navRight.style.display = '';
  if (navTitle) navTitle.textContent = ch.name;
  updatePhoneTime(); renderPhoneContent(cid);
}

// ========== APP TAP HANDLER ==========
function onPhoneAppTap(appId) {
  var info = APP_LIBRARY[appId];
  if (!info) return;
  if (PHONE_APP_RENDERERS[appId]) { openPhoneApp(appId); }
  else { showToast(info.name + ' -- coming soon'); }
}

// ========== RENDER PHONE CONTENT ==========
function renderPhoneContent(cid) {
  if (!state.phoneData) state.phoneData = {};
  var data = state.phoneData[cid];
  if (data && data.desktop && data.desktop.length > 0) { displayPhoneDesktop(cid, data); }
  else {
    var gridEl = document.getElementById('phoneAppGrid');
    if (gridEl) {
      gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:rgba(255,255,255,.4)"><svg viewBox="0 0 48 48" width="56" height="56" style="opacity:.25;margin-bottom:16px;stroke:rgba(255,255,255,.4);fill:none;stroke-width:1.2"><rect x="12" y="4" width="24" height="40" rx="4"/><circle cx="24" cy="38" r="2"/><path d="M18 8h12"/><rect x="16" y="14" width="6" height="6" rx="1.5"/><rect x="26" y="14" width="6" height="6" rx="1.5"/><rect x="16" y="24" width="6" height="6" rx="1.5"/></svg><p style="font-size:15px;margin-bottom:6px;color:rgba(255,255,255,.5)">Desktop not generated</p><p style="font-size:12px;margin-bottom:20px;color:rgba(255,255,255,.3)">AI will generate a personalized app layout</p><button onclick="regeneratePhone()" style="background:#0a84ff;color:#fff;border:none;border-radius:10px;padding:11px 32px;font-size:14px;cursor:pointer;font-weight:500;letter-spacing:.3px">Generate Desktop</button></div>';
    }
    renderPhoneDock(['phone_call', 'messages', 'browser', 'music']);
    var ch = state.characters.find(function(c) { return c.id === cid; });
    var ownerEl = document.getElementById('phoneOwnerName');
    if (ownerEl && ch) ownerEl.textContent = ch.name;
  }
}

var _phoneDesktopData = null;

function _phoneAppHtml(appId) {
  var info = APP_LIBRARY[appId];
  if (!info) return '';
  return '<div class="phone-app-item" onclick="onPhoneAppTap(\'' + appId + '\')"><div class="phone-app-icon ' + info.css + '"><svg viewBox="0 0 26 26">' + info.svg + '</svg></div><div class="phone-app-name">' + esc(info.name) + '</div></div>';
}

function displayPhoneDesktop(cid, data) {
  _phoneDesktopData = data;
  var ch = state.characters.find(function(c) { return c.id === cid; });
  var ownerEl = document.getElementById('phoneOwnerName');
  if (ownerEl && ch) ownerEl.textContent = ch.name;
  var gridEl = document.getElementById('phoneAppGrid');
  if (gridEl) {
    var h = '';
    (data.desktop || []).forEach(function(item, idx) {
      if (item.type === 'app') { h += _phoneAppHtml(item.appId); }
      else if (item.type === 'folder') {
        var validApps = (item.appIds || []).filter(function(id) { return !!APP_LIBRARY[id]; });
        if (validApps.length === 0) return;
        h += '<div class="phone-app-item" onclick="openPhoneFolder(' + idx + ')"><div class="phone-folder-icon"><div class="phone-folder-preview">';
        var previews = validApps.slice(0, 9); var previewCount = Math.min(previews.length, 9);
        var gridCols = previewCount <= 4 ? 2 : 3;
        h += '<div class="phone-folder-preview-grid phone-folder-grid-' + gridCols + '">';
        previews.forEach(function(aId) { var ai = APP_LIBRARY[aId]; if (!ai) return; h += '<div class="phone-folder-mini"><svg viewBox="0 0 26 26">' + ai.svg + '</svg></div>'; });
        for (var f = previewCount; f < gridCols * gridCols; f++) h += '<div class="phone-folder-mini phone-folder-mini-empty"></div>';
        h += '</div></div></div><div class="phone-app-name">' + esc(item.name || 'Folder') + '</div></div>';
      }
    });
    gridEl.innerHTML = h;
  }
  renderPhoneDock(data.dock || ['phone_call', 'messages', 'browser', 'music']);
}

function renderPhoneDock(dockApps) {
  var dock = document.getElementById('phoneDock'); if (!dock) return;
  var h = '';
  (dockApps || []).forEach(function(appId) {
    var info = APP_LIBRARY[appId]; if (!info) return;
    h += '<div class="phone-app-icon" onclick="onPhoneAppTap(\'' + appId + '\')"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + info.svg + '</svg></div>';
  });
  dock.innerHTML = h;
}

function openPhoneFolder(idx) {
  if (!_phoneDesktopData || !_phoneDesktopData.desktop) return;
  var item = _phoneDesktopData.desktop[idx];
  if (!item || item.type !== 'folder') return;
  var overlay = document.getElementById('phoneFolderOverlay');
  var titleEl = document.getElementById('phoneFolderTitle');
  var gridEl = document.getElementById('phoneFolderGrid');
  if (!overlay || !titleEl || !gridEl) return;
  titleEl.textContent = item.name || 'Folder';
  var h = ''; (item.appIds || []).forEach(function(appId) { h += _phoneAppHtml(appId); });
  gridEl.innerHTML = h;
  overlay.style.display = 'flex'; overlay.offsetHeight; overlay.classList.add('show');
}

function closePhoneFolder() {
  var overlay = document.getElementById('phoneFolderOverlay'); if (!overlay) return;
  if (overlay.style.display === 'none' && !overlay.classList.contains('show')) return;
  overlay.classList.remove('show');
  setTimeout(function() { overlay.style.display = 'none'; }, 220);
}

function validatePhoneData(data) {
  if (!data) return null;
  var result = { desktop: [], dock: [] };
  (data.desktop || []).forEach(function(item) {
    if (item.type === 'app' && APP_LIBRARY[item.appId]) result.desktop.push({ type: 'app', appId: item.appId });
    else if (item.type === 'folder') {
      var validIds = (item.appIds || []).filter(function(id) { return !!APP_LIBRARY[id]; });
      if (validIds.length > 0) result.desktop.push({ type: 'folder', name: item.name || 'Folder', appIds: validIds });
    }
  });
  (data.dock || []).forEach(function(id) { if (APP_LIBRARY[id]) result.dock.push(id); });
  if (result.dock.length === 0) result.dock = ['phone_call', 'messages', 'browser', 'music'];
  if (result.desktop.length === 0) return null;
  var hasCP = result.desktop.some(function(item) {
    if (item.type === 'app' && item.appId === 'check_phone') return true;
    if (item.type === 'folder' && item.appIds && item.appIds.indexOf('check_phone') >= 0) return true;
    return false;
  });
  if (!hasCP) result.desktop.push({ type: 'app', appId: 'check_phone' });
  return result;
}

async function regeneratePhone() {
  var cid = state.phoneCharId;
  if (!cid) { showToast('Please select a character first'); return; }
  var ch = state.characters.find(function(c) { return c.id === cid; });
  if (!ch) return;
  var api = state.apis && state.apis.find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url) { showErrorModal(T('configApi')); return; }
  var gridEl = document.getElementById('phoneAppGrid');
  if (gridEl) {
    gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:rgba(255,255,255,.4)"><div style="display:inline-flex;gap:5px;margin-bottom:16px"><span style="width:8px;height:8px;background:rgba(255,255,255,.4);border-radius:50%;animation:blink 1.4s infinite both"></span><span style="width:8px;height:8px;background:rgba(255,255,255,.4);border-radius:50%;animation:blink 1.4s infinite both;animation-delay:.2s"></span><span style="width:8px;height:8px;background:rgba(255,255,255,.4);border-radius:50%;animation:blink 1.4s infinite both;animation-delay:.4s"></span></div><p style="font-size:14px">Analyzing character</p><p style="font-size:12px;color:rgba(255,255,255,.25);margin-top:6px">Generating desktop for ' + esc(ch.name) + '</p></div>';
  }
  var appListStr = Object.keys(APP_LIBRARY).filter(function(id) { return id !== 'check_phone'; }).map(function(id) { return '- ' + id + ': ' + APP_LIBRARY[id].desc; }).join('\n');
  var charInfo = 'Character Name: ' + ch.name;
  if (ch.systemPrompt) charInfo += '\nCharacter Description/Personality: ' + ch.systemPrompt;
  if (ch.notes) charInfo += '\nAdditional Notes: ' + ch.notes;
  var prompt = 'You are simulating a fictional character\'s smartphone home screen. Based on their personality and background, decide which apps they would have installed and how they would organize them.\n\n' + charInfo + '\n\nAVAILABLE APPS (id: description):\n' + appListStr + '\n\nINSTRUCTIONS:\n1. Select ONLY apps that genuinely fit this character\'s personality, interests and lifestyle.\n2. The desktop MUST contain AT LEAST 10 apps (not counting dock apps). Choose apps that reflect different aspects of the character\'s life.\n3. You MAY group related apps into folders IF the character would logically do that. Use meaningful, personality-reflective folder names.\n4. Some characters prefer NO folders at all - just individual apps on the desktop.\n5. Choose 3-4 most-used apps for the dock (bottom bar).\n6. Use ONLY app IDs from the list above. Do NOT invent new IDs.\n7. Do NOT include every app - be selective based on the character, but ensure at least 10.\n8. Always include "check_phone" as a standalone app on the desktop (not in any folder).\n\nRespond with ONLY valid JSON, no other text or explanation:\n{\n  "desktop": [\n    { "type": "app", "appId": "notes" },\n    { "type": "folder", "name": "Social", "appIds": ["messages", "social", "contacts"] },\n    { "type": "app", "appId": "check_phone" },\n    { "type": "app", "appId": "books" }\n  ],\n  "dock": ["phone_call", "messages", "browser", "music"]\n}';
  try {
    var rawReply = await sendChat(api, [{ role: 'user', content: prompt }]);
    var phoneData = null;
    try { var jsonMatch = rawReply.match(/\{[\s\S]*\}/); if (jsonMatch) phoneData = JSON.parse(jsonMatch[0]); }
    catch (parseErr) { console.error('[regeneratePhone] JSON parse error:', parseErr); phoneData = null; }
    var validated = validatePhoneData(phoneData);
    if (!validated) { showToast('Generation failed, please retry'); renderPhoneContent(cid); return; }
    if (!state.phoneData) state.phoneData = {};
    state.phoneData[cid] = validated; saveState();
    renderPhoneContent(cid);
  } catch (e) {
    console.error('[regeneratePhone] error:', e);
    showErrorModal(typeof friendlyError === 'function' ? friendlyError(e) : String(e));
    renderPhoneContent(cid);
  }
}

// ==========================================================
//  PHONE APP RENDERERS REGISTRY
// ==========================================================

var PHONE_APP_RENDERERS = {
  // Batch 1: Communication & Social
  messages: phonePageMessages,
  phone_call: phonePagePhoneCall,
  contacts: phonePageContacts,
  mail: phonePageMail,
  social: phonePageSocial,
  browser: phonePageBrowser,
  check_phone: phonePageCheckPhone,
  // Batch 2: Creation & Recording
  notes: phonePageNotes,
  diary: phonePageDiary,
  books: phonePageBooks,
  drawing: phonePageDrawing,
  recorder: phonePageRecorder,
  files: phonePageFiles,
  translator: phonePageTranslator,
  // Batch 3: Media & Entertainment
  music: phonePageMusic,
  videos: phonePageVideos,
  photos: phonePagePhotos,
  camera: phonePageCamera,
  games: phonePageGames,
  podcast: phonePagePodcast,
  // Batch 4: Life Tools
  calendar: phonePageCalendar,
  clock: phonePageClock,
  weather: phonePageWeather,
  maps: phonePageMaps,
  compass: phonePageCompass,
  calculator: phonePageCalculator,
  reminders: phonePageReminders,
  // Batch 5: Info & Health
  news: phonePageNews,
  stocks: phonePageStocks,
  coding: phonePageCoding,
  health: phonePageHealth,
  fitness: phonePageFitness,
  meditation: phonePageMeditation,
  // Batch 6: System & Life
  settings: phonePageSettings,
  wallet: phonePageWallet,
  shopping: phonePageShopping,
  recipes: phonePageRecipes,
  travel: phonePageTravel
};


// ========== OPEN / CLOSE APP PAGE ==========
function openPhoneApp(appId) {
  var info = APP_LIBRARY[appId]; if (!info) return;
  var renderer = PHONE_APP_RENDERERS[appId]; if (!renderer) return;
  closePhoneFolder();
  var pageEl = document.getElementById('phoneAppPage');
  var frameEl = document.getElementById('phoneFrame');
  if (!pageEl || !frameEl) return;
  var ch = null;
  if (state.phoneCharId) ch = state.characters.find(function(c) { return c.id === state.phoneCharId; });
  var charName = ch ? ch.name : 'User';
  var isCheck = (appId === 'check_phone');
  var content = renderer(charName);
  var h = '';
  if (!isCheck) {
    h += '<div class="papp-header"><button class="papp-back" onclick="closePhoneApp()"><svg viewBox="0 0 20 20" width="20" height="20"><path d="M12 4l-6 6 6 6" stroke="#0a84ff" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back</button><div class="papp-title">' + esc(info.name) + '</div><div class="papp-header-right"></div></div>';
  }
  h += '<div class="papp-body' + (isCheck ? ' papp-body-check' : '') + '">' + content + '</div>';
  pageEl.innerHTML = h;
  frameEl.style.display = 'none';
  pageEl.style.display = 'flex';
}

function closePhoneApp() {
  var pageEl = document.getElementById('phoneAppPage');
  var frameEl = document.getElementById('phoneFrame');
  if (pageEl) { pageEl.style.display = 'none'; pageEl.innerHTML = ''; }
  if (frameEl) frameEl.style.display = '';
}

// ========== SVG ICON SNIPPETS ==========
var _svgSearch = '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg>';
var _svgChevron = '<span class="papp-item-chevron">></span>';

// ==========================================================
//  PHONE APP PAGES — Batch 1: Communication & Social
// ==========================================================

// ========== 1. MESSAGES ==========
function phonePageMessages(charName) {
  var convos = [
    { n:'Alex', m:'See you tomorrow!', t:'2:30 PM', u:2 },
    { n:'Mom', m:'Don\'t forget to eat dinner', t:'1:15 PM', u:0 },
    { n:'Jake', m:'lol that was hilarious', t:'12:40 PM', u:0 },
    { n:'Sarah', m:'Can you send me that file?', t:'11:20 AM', u:1 },
    { n:'Work Group', m:'Meeting at 3pm confirmed', t:'Yesterday', u:5 },
    { n:'David', m:'Thanks for helping out', t:'Yesterday', u:0 },
    { n:'Emma', m:'See you this weekend?', t:'Monday', u:0 },
    { n:'Kevin', m:'Got it, thanks', t:'Monday', u:0 },
    { n:'Lisa', m:'Call me when you can', t:'Sunday', u:0 }
  ];
  var h = '<div class="papp-search">' + _svgSearch + '<span>Search</span></div>';
  convos.forEach(function(c) {
    h += '<div class="papp-item"><div class="papp-avatar">' + c.n.charAt(0) + '</div><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(c.n) + '</span><span class="papp-item-time">' + c.t + '</span></div><div class="papp-item-sub">' + esc(c.m) + '</div></div>' + (c.u > 0 ? '<div class="papp-badge">' + c.u + '</div>' : _svgChevron) + '</div>';
  });
  return h;
}

// ========== 2. PHONE CALL ==========
function phonePagePhoneCall(charName) {
  var calls = [
    { n:'Alex', tp:'out', t:'2:45 PM' }, { n:'Mom', tp:'in', t:'1:10 PM' },
    { n:'+1 (555) 8192', tp:'missed', t:'11:30 AM' }, { n:'Sarah', tp:'out', t:'10:15 AM' },
    { n:'Jake', tp:'in', t:'Yesterday' }, { n:'David', tp:'missed', t:'Yesterday' },
    { n:'+1 (555) 0347', tp:'in', t:'Monday' }, { n:'Emma', tp:'out', t:'Monday' },
    { n:'Mom', tp:'in', t:'Sunday' }, { n:'+1 (555) 6621', tp:'missed', t:'Last week' }
  ];
  var arrows = {
    in: '<svg viewBox="0 0 16 16"><path d="M12 4L4 12M4 12V5M4 12h7" stroke="rgba(255,255,255,.4)"/></svg>',
    out: '<svg viewBox="0 0 16 16"><path d="M4 12L12 4M12 4v7M12 4H5" stroke="rgba(255,255,255,.4)"/></svg>',
    missed: '<svg viewBox="0 0 16 16"><path d="M12 4L4 12M4 12V5M4 12h7" stroke="#ff453a"/></svg>'
  };
  var h = '<div class="papp-segments"><div class="papp-seg papp-seg-active">All</div><div class="papp-seg">Missed</div></div>';
  calls.forEach(function(c) {
    var ini = c.n.charAt(0) === '+' ? '#' : c.n.charAt(0);
    h += '<div class="papp-item' + (c.tp === 'missed' ? ' papp-call-missed' : '') + '"><div class="papp-avatar papp-avatar-sm">' + ini + '</div><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(c.n) + '</span><span class="papp-item-time">' + c.t + '</span></div></div><div class="papp-call-icon papp-call-' + c.tp + '">' + arrows[c.tp] + '</div></div>';
  });
  return h;
}

// ========== 3. CONTACTS ==========
function phonePageContacts(charName) {
  var sections = { 'A':['Alex','Anna'], 'B':['Bob'], 'C':['Chris'], 'D':['David','Diana'], 'E':['Emma'], 'J':['Jake','Jessica'], 'K':['Kevin'], 'L':['Lisa'], 'M':['Mike'], 'S':['Sarah'] };
  var h = '<div class="papp-search">' + _svgSearch + '<span>Search</span></div>';
  h += '<div class="papp-mycard"><div class="papp-mycard-avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg></div><div><div class="papp-mycard-name">' + esc(charName) + '</div><div class="papp-mycard-label">My Card</div></div></div>';
  Object.keys(sections).forEach(function(letter) {
    h += '<div class="papp-section">' + letter + '</div>';
    sections[letter].forEach(function(name) { h += '<div class="papp-item"><div class="papp-avatar papp-avatar-sm">' + name.charAt(0) + '</div><div class="papp-item-content"><div class="papp-item-name">' + esc(name) + '</div></div>' + _svgChevron + '</div>'; });
  });
  return h;
}

// ========== 4. MAIL ==========
function phonePageMail(charName) {
  var emails = [
    { from:'Newsletter', subj:'Weekly digest', pre:'Here are the top stories this week...', t:'3:00 PM', ur:true },
    { from:'Alex Chen', subj:'Re: Project update', pre:'Sounds good, let\'s proceed with the plan.', t:'1:45 PM', ur:true },
    { from:'System', subj:'Your account security', pre:'We noticed a new sign-in from a device', t:'11:00 AM', ur:true },
    { from:'Store', subj:'Your order has shipped', pre:'Track your package with the following', t:'Yesterday', ur:false },
    { from:'Sarah Kim', subj:'Dinner plans', pre:'How about that new place on 5th street?', t:'Yesterday', ur:false },
    { from:'HR Dept', subj:'Schedule update', pre:'Please note the following changes to', t:'Monday', ur:false },
    { from:'App Store', subj:'New apps for you', pre:'Based on your interests, we recommend', t:'Last week', ur:false }
  ];
  var uc = emails.filter(function(e) { return e.ur; }).length;
  var h = '<div style="padding:12px 16px 4px;color:rgba(255,255,255,.3);font-size:13px">Inbox (' + uc + ' unread)</div>';
  emails.forEach(function(e) {
    h += '<div class="papp-item" style="align-items:flex-start;gap:10px">' + (e.ur ? '<div class="papp-mail-dot"></div>' : '<div class="papp-mail-dot-spacer"></div>') + '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name" style="' + (e.ur ? 'font-weight:700' : '') + '">' + esc(e.from) + '</span><span class="papp-item-time">' + e.t + '</span></div><div class="papp-mail-subject">' + esc(e.subj) + '</div><div class="papp-mail-preview">' + esc(e.pre) + '</div></div>' + _svgChevron + '</div>';
  });
  return h;
}

// ========== 5. SOCIAL ==========
function phonePageSocial(charName) {
  var posts = [
    { name:'Alex', handle:'@alex_w', time:'2h', text:'Just finished reading an amazing book. Highly recommend it to everyone who loves a good mystery.', hasImg:false, likes:24, comments:3 },
    { name:'Sarah', handle:'@sarah_k', time:'4h', text:'Beautiful sunset today. Sometimes you just need to stop and appreciate the little things in life.', hasImg:true, likes:89, comments:12 },
    { name:'News Daily', handle:'@newsdaily', time:'6h', text:'New study reveals interesting patterns in how people organize their digital lives.', hasImg:false, likes:156, comments:45 },
    { name:'Jake', handle:'@jake_m', time:'8h', text:'Weekend plans: absolutely nothing. And I couldn\'t be happier about it.', hasImg:false, likes:42, comments:7 }
  ];
  var svgH = '<svg viewBox="0 0 20 20"><path d="M10 17S3 13 3 8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 5-7 9-7 9z"/></svg>';
  var svgC = '<svg viewBox="0 0 20 20"><path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 3v-3a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>';
  var svgS = '<svg viewBox="0 0 20 20"><path d="M15 7l-5-4-5 4M10 3v10"/><path d="M4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6"/></svg>';
  var h = '';
  posts.forEach(function(p) {
    h += '<div class="papp-post"><div class="papp-post-header"><div class="papp-avatar papp-avatar-sm">' + p.name.charAt(0) + '</div><div><div class="papp-post-name">' + esc(p.name) + '</div><div class="papp-post-handle">' + esc(p.handle) + '</div></div><div class="papp-post-time">' + p.time + '</div></div><div class="papp-post-text">' + esc(p.text) + '</div>';
    if (p.hasImg) h += '<div class="papp-post-img"><svg viewBox="0 0 32 32"><rect x="3" y="5" width="26" height="20" rx="3"/><path d="M3 19l7-6 4 3 5-5 7 6"/><circle cx="22" cy="10" r="2"/></svg></div>';
    h += '<div class="papp-post-actions"><div class="papp-post-action">' + svgH + '<span>' + p.likes + '</span></div><div class="papp-post-action">' + svgC + '<span>' + p.comments + '</span></div><div class="papp-post-action">' + svgS + '</div></div></div>';
  });
  return h;
}

// ========== 6. BROWSER ==========
function phonePageBrowser(charName) {
  var h = '<div class="papp-url-bar"><svg viewBox="0 0 16 16"><rect x="4" y="2" width="8" height="12" rx="2"/><path d="M8 5v3M8 10v0"/></svg><span>www.example.com</span></div><div class="papp-skeleton">';
  h += '<div class="papp-skel-block" style="height:48px;border-radius:0;margin:0 -16px 16px;background:#1c1c1e"></div>';
  h += '<div class="papp-skel-line" style="width:70%;height:16px"></div><div style="height:8px"></div>';
  h += '<div class="papp-skel-line" style="width:100%"></div><div class="papp-skel-line" style="width:95%"></div><div class="papp-skel-line" style="width:88%"></div><div class="papp-skel-line" style="width:60%"></div>';
  h += '<div style="height:12px"></div><div class="papp-skel-block" style="height:140px"></div>';
  h += '<div class="papp-skel-line" style="width:100%"></div><div class="papp-skel-line" style="width:92%"></div><div class="papp-skel-line" style="width:75%"></div>';
  h += '<div style="height:12px"></div><div style="display:flex;gap:10px"><div class="papp-skel-block" style="flex:1;height:80px"></div><div class="papp-skel-block" style="flex:1;height:80px"></div></div>';
  h += '</div>';
  return h;
}

// ========== 7. CHECK PHONE ==========
function phonePageCheckPhone(charName) {
  var now = new Date();
  var ts = ('' + now.getHours()).padStart(2, '0') + ':' + ('' + now.getMinutes()).padStart(2, '0');
  return '<button class="papp-check-close" onclick="closePhoneApp()"><svg viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8" stroke="rgba(255,255,255,.3)" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></button><div class="papp-check-scan"></div><div class="papp-check-center"><div class="papp-check-eye"><svg viewBox="0 0 64 64"><path d="M6 32s10-16 26-16 26 16 26 16-10 16-26 16S6 32 6 32z" stroke="rgba(255,255,255,.2)" fill="none" stroke-width="1.2"/><circle cx="32" cy="32" r="8" stroke="rgba(255,255,255,.25)" fill="none" stroke-width="1"/><circle cx="32" cy="32" r="3" stroke="rgba(255,255,255,.15)" fill="rgba(255,255,255,.08)" stroke-width=".8"/></svg></div><div class="papp-check-text">Someone is viewing this phone</div><div class="papp-check-time">' + ts + '</div></div>';
}

// ==========================================================
//  PHONE APP PAGES — Batch 2: Creation & Recording
// ==========================================================

// ========== 8. NOTES ==========
function phonePageNotes(charName) {
  var notes = [
    { title:'Shopping list', pre:'Milk, eggs, bread, coffee', t:'Today', folder:'Personal' },
    { title:'Meeting notes', pre:'Discussed Q2 roadmap, key deliverables...', t:'Today', folder:'Work' },
    { title:'Ideas', pre:'App concept: a minimalist habit tracker...', t:'Yesterday', folder:'' },
    { title:'Book quotes', pre:'The only way to do great work is to love', t:'Yesterday', folder:'Personal' },
    { title:'Travel packing list', pre:'Passport, charger, headphones, jacket...', t:'Monday', folder:'Personal' },
    { title:'Project brainstorm', pre:'Feature ideas: dark mode, offline sync...', t:'Monday', folder:'Work' },
    { title:'Workout routine', pre:'Mon: chest/tri, Tue: back/bi, Wed: rest', t:'Last week', folder:'' },
    { title:'Recipe - pasta', pre:'Boil water, add salt, cook 8 min', t:'Last week', folder:'Personal' }
  ];
  var svgN = '<svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.2);fill:none;stroke-width:1.5;stroke-linecap:round;flex-shrink:0"><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M7 6h6M7 9h6M7 12h4"/></svg>';
  var svgF = '<svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.25);fill:none;stroke-width:1.5;stroke-linecap:round;flex-shrink:0"><path d="M3 6h5l2 2h7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z"/></svg>';
  var h = '<div class="papp-search">' + _svgSearch + '<span>Search</span></div><div class="papp-section" style="padding-top:4px">All Notes</div>';
  notes.forEach(function(n) { h += '<div class="papp-item">' + svgN + '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(n.title) + '</span><span class="papp-item-time">' + n.t + '</span></div><div class="papp-item-sub">' + esc(n.pre) + '</div>' + (n.folder ? '<div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:2px">' + esc(n.folder) + '</div>' : '') + '</div>' + _svgChevron + '</div>'; });
  h += '<div class="papp-section">Folders</div>';
  [{name:'Personal',count:4},{name:'Work',count:2},{name:'Archive',count:6}].forEach(function(f) { h += '<div class="papp-item">' + svgF + '<div class="papp-item-content"><div class="papp-item-name">' + esc(f.name) + '</div></div><span style="font-size:13px;color:rgba(255,255,255,.25);margin-right:4px">' + f.count + '</span>' + _svgChevron + '</div>'; });
  return h;
}

// ========== 9. DIARY ==========
function phonePageDiary(charName) {
  var ms = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var now = new Date(); var cm = ms[now.getMonth()]; var cy = now.getFullYear();
  var entries = [
    { day:now.getDate(), mood:'good', title:'A productive day', pre:'Finished the project ahead of schedule...', wc:342 },
    { day:now.getDate()-1, mood:'neutral', title:'Quiet afternoon', pre:'Spent most of the day reading...', wc:218 },
    { day:now.getDate()-2, mood:'great', title:'Weekend in the park', pre:'Met up with friends for a picnic...', wc:456 },
    { day:now.getDate()-4, mood:'low', title:'Couldn\'t sleep well', pre:'Woke up at 3am again...', wc:167 },
    { day:now.getDate()-5, mood:'good', title:'New recipe success', pre:'Tried making homemade ramen...', wc:289 },
    { day:now.getDate()-7, mood:'neutral', title:'Routine day', pre:'Nothing special happened', wc:134 }
  ];
  var mc = { great:'rgba(48,209,88,.5)', good:'rgba(10,132,255,.5)', neutral:'rgba(255,255,255,.2)', low:'rgba(255,69,58,.4)' };
  var h = '<div style="padding:20px 16px 16px;text-align:center"><div style="font-size:22px;font-weight:600;color:#fff">' + cm + ' ' + cy + '</div><div style="font-size:13px;color:rgba(255,255,255,.3);margin-top:4px">' + entries.length + ' entries this month</div></div>';
  h += '<div class="papp-diary-mood-bar">'; entries.forEach(function(e) { h += '<div class="papp-diary-mood-dot" style="background:' + (mc[e.mood]||mc.neutral) + '"></div>'; }); h += '</div>';
  entries.forEach(function(e) { var c = mc[e.mood]||mc.neutral; h += '<div class="papp-diary-entry"><div class="papp-diary-date"><div class="papp-diary-day">' + e.day + '</div><div class="papp-diary-month">' + cm + '</div></div><div class="papp-diary-content"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><div class="papp-diary-mood-indicator" style="background:' + c + '"></div><span class="papp-item-name">' + esc(e.title) + '</span></div><div class="papp-item-sub" style="white-space:normal">' + esc(e.pre) + '</div><div style="font-size:11px;color:rgba(255,255,255,.15);margin-top:4px">' + e.wc + ' words</div></div></div>'; });
  return h;
}

// ========== 10. BOOKS ==========
function phonePageBooks(charName) {
  var svgB = '<svg viewBox="0 0 20 20" style="width:16px;height:16px;stroke:rgba(255,255,255,.2);fill:none;stroke-width:1.5;stroke-linecap:round;flex-shrink:0"><path d="M3 15V4c2-1 4 0 7 1 3-1 5-2 7-1v11c-2-1-4 0-7 1-3-1-5-2-7-1z"/><path d="M10 5v11"/></svg>';
  var h = '<div class="papp-section" style="padding-top:12px">Currently Reading</div>';
  [{title:'The Silent Patient',author:'Alex Michaelides',pct:72},{title:'Atomic Habits',author:'James Clear',pct:45}].forEach(function(b) { h += '<div class="papp-books-card"><div class="papp-books-cover">' + svgB + '</div><div class="papp-item-content"><div class="papp-item-name">' + esc(b.title) + '</div><div style="font-size:12px;color:rgba(255,255,255,.3);margin-top:2px">' + esc(b.author) + '</div><div class="papp-books-progress"><div class="papp-books-progress-track"><div class="papp-books-progress-fill" style="width:' + b.pct + '%"></div></div><span class="papp-books-pct">' + b.pct + '%</span></div></div></div>'; });
  h += '<div class="papp-section">Library</div>';
  [{title:'Project Hail Mary',author:'Andy Weir',pct:100},{title:'Dune',author:'Frank Herbert',pct:100},{title:'The Midnight Library',author:'Matt Haig',pct:100},{title:'Sapiens',author:'Yuval Noah Harari',pct:68},{title:'1984',author:'George Orwell',pct:100},{title:'Brave New World',author:'Aldous Huxley',pct:30}].forEach(function(b) {
    h += '<div class="papp-item"><div class="papp-books-cover-sm">' + svgB + '</div><div class="papp-item-content"><div class="papp-item-name">' + esc(b.title) + '</div><div style="font-size:12px;color:rgba(255,255,255,.25);margin-top:1px">' + esc(b.author) + '</div></div>' + (b.pct >= 100 ? '<svg viewBox="0 0 16 16" style="width:16px;height:16px;stroke:rgba(48,209,88,.6);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0"><path d="M3 8l4 4 6-8"/></svg>' : '<span style="font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0">' + b.pct + '%</span>') + '</div>';
  });
  return h;
}

// ========== 11. DRAWING ==========
function phonePageDrawing(charName) {
  var h = '<div class="papp-draw-toolbar">';
  ['<path d="M4 16l1.5-5L15 1.5 18.5 5 9 14.5z"/><path d="M12.5 4l3 3"/>','<path d="M3 17h14"/><path d="M5 13l3-10h4l3 10"/><path d="M6.5 10h7"/>','<circle cx="10" cy="10" r="7"/>','<rect x="3" y="3" width="14" height="14" rx="2"/>','<path d="M3 17L10 3l7 14z"/>'].forEach(function(s, i) { h += '<div class="papp-draw-tool' + (i === 0 ? ' papp-draw-tool-active' : '') + '"><svg viewBox="0 0 20 20">' + s + '</svg></div>'; });
  h += '</div><div class="papp-draw-canvas"><svg viewBox="0 0 300 400" style="width:100%;height:100%;stroke:rgba(255,255,255,.06);fill:none;stroke-width:.5"><path d="M0 80h300M0 160h300M0 240h300M0 320h300"/><path d="M60 0v400M120 0v400M180 0v400M240 0v400"/><path d="M80 120 Q120 80 160 130 T240 110" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/><circle cx="190" cy="200" r="40" stroke="rgba(255,255,255,.1)" stroke-width="1.2"/><path d="M60 280 L120 240 L180 260 L240 230" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/></svg></div>';
  h += '<div class="papp-draw-palette">';
  ['rgba(255,255,255,.7)','rgba(255,69,58,.6)','rgba(10,132,255,.6)','rgba(48,209,88,.6)','rgba(255,214,10,.6)','rgba(175,130,255,.6)'].forEach(function(c, i) { h += '<div class="papp-draw-color' + (i === 0 ? ' papp-draw-color-active' : '') + '" style="background:' + c + '"></div>'; });
  h += '<div class="papp-draw-size-indicator"><div class="papp-draw-size-dot"></div></div></div>';
  return h;
}

// ========== 12. RECORDER ==========
function phonePageRecorder(charName) {
  var svgW = '<svg viewBox="0 0 40 20" style="width:40px;height:20px;flex-shrink:0"><path d="M2 10h3M7 6v8M11 4v12M15 7v6M19 3v14M23 6v8M27 8v4M31 5v10M35 7v6M38 9v2" stroke="rgba(255,255,255,.15)" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var h = '<div class="papp-recorder-hero"><div class="papp-recorder-btn"><div class="papp-recorder-btn-inner"></div></div><div style="font-size:13px;color:rgba(255,255,255,.3);margin-top:12px">Tap to record</div><div class="papp-recorder-wave"><svg viewBox="0 0 200 40" style="width:100%;height:40px"><path d="M10 20h5M20 14v12M28 10v20M36 14v12M44 8v24M52 12v16M60 16v8M68 10v20M76 14v12M84 18v4M92 12v16M100 8v24M108 14v12M116 16v8M124 10v20M132 14v12M140 18v4M148 12v16M156 14v12M164 16v8M172 18v4M180 16v8M188 18v4" stroke="rgba(255,255,255,.08)" fill="none" stroke-width="2" stroke-linecap="round"/></svg></div></div><div class="papp-section">All Recordings</div>';
  [{name:'Voice memo 007',dur:'1:23',size:'1.2 MB',t:'Today'},{name:'Meeting recording',dur:'45:12',size:'32 MB',t:'Today'},{name:'Voice memo 006',dur:'0:34',size:'0.4 MB',t:'Yesterday'},{name:'Song idea',dur:'2:08',size:'1.8 MB',t:'Yesterday'},{name:'Voice memo 005',dur:'0:15',size:'0.2 MB',t:'Monday'},{name:'Interview prep',dur:'12:45',size:'9.6 MB',t:'Last week'},{name:'Lecture notes',dur:'52:30',size:'38 MB',t:'Last week'}].forEach(function(r) { h += '<div class="papp-item">' + svgW + '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(r.name) + '</span><span class="papp-item-time">' + r.t + '</span></div><div class="papp-item-sub">' + r.dur + '  --  ' + r.size + '</div></div>' + _svgChevron + '</div>'; });
  return h;
}

// ========== 13. FILES ==========
function phonePageFiles(charName) {
  var li = { phone:'<svg viewBox="0 0 20 20"><rect x="6" y="2" width="8" height="16" rx="2"/><path d="M9 15h2"/></svg>', arrow:'<svg viewBox="0 0 20 20"><path d="M10 3v11M6 10l4 4 4-4"/><path d="M4 14v3h12v-3"/></svg>', cloud:'<svg viewBox="0 0 20 20"><path d="M6 16a4 4 0 01-.5-7.97A5 5 0 0115 7a4 4 0 01.5 7.97"/><path d="M6 16h9"/></svg>', trash:'<svg viewBox="0 0 20 20"><path d="M5 6h10l-1 11H6z"/><path d="M3 6h14M8 3h4"/></svg>' };
  var fi = { pdf:'<svg viewBox="0 0 20 20"><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M8 8h4M8 11h4M8 14h2"/></svg>', img:'<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="M3 13l4-3 2 2 3-3 5 4"/><circle cx="13" cy="7" r="1.5"/></svg>', txt:'<svg viewBox="0 0 20 20"><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M7 6h6M7 9h6M7 12h3"/></svg>', doc:'<svg viewBox="0 0 20 20"><path d="M4 4h8l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/><path d="M12 4v4h4"/></svg>', aud:'<svg viewBox="0 0 20 20"><rect x="7" y="3" width="6" height="8" rx="3"/><path d="M5 10a5 5 0 0010 0M10 15v3"/></svg>' };
  var h = '<div class="papp-search">' + _svgSearch + '<span>Search</span></div><div class="papp-section" style="padding-top:4px">Locations</div>';
  [{name:'On My Phone',icon:'phone',count:24},{name:'Downloads',icon:'arrow',count:13},{name:'Cloud Drive',icon:'cloud',count:56},{name:'Recently Deleted',icon:'trash',count:3}].forEach(function(loc) { h += '<div class="papp-item"><div class="papp-files-loc-icon">' + (li[loc.icon]||'') + '</div><div class="papp-item-content"><div class="papp-item-name">' + esc(loc.name) + '</div></div><span style="font-size:13px;color:rgba(255,255,255,.2);margin-right:4px">' + loc.count + '</span>' + _svgChevron + '</div>'; });
  h += '<div class="papp-section">Recent</div>';
  [{name:'Project_final.pdf',size:'2.4 MB',t:'Today',type:'pdf'},{name:'Photo_2024.jpg',size:'3.1 MB',t:'Today',type:'img'},{name:'Notes_backup.txt',size:'12 KB',t:'Yesterday',type:'txt'},{name:'Presentation.key',size:'18 MB',t:'Monday',type:'doc'},{name:'Budget_2024.xlsx',size:'156 KB',t:'Monday',type:'doc'},{name:'Song_draft.m4a',size:'4.2 MB',t:'Last week',type:'aud'}].forEach(function(f) { h += '<div class="papp-item"><div class="papp-files-type-icon">' + (fi[f.type]||fi.txt) + '</div><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(f.name) + '</span><span class="papp-item-time">' + f.t + '</span></div><div class="papp-item-sub">' + f.size + '</div></div>' + _svgChevron + '</div>'; });
  return h;
}

// ========== 14. TRANSLATOR ==========
function phonePageTranslator(charName) {
  var h = '<div class="papp-trans-lang-row"><div class="papp-trans-lang papp-trans-lang-active">English</div><div class="papp-trans-swap"><svg viewBox="0 0 20 20" style="width:20px;height:20px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:1.5;stroke-linecap:round"><path d="M6 4l-3 3 3 3M14 10l3 3-3 3M3 7h14M3 13h14"/></svg></div><div class="papp-trans-lang">Spanish</div></div>';
  h += '<div class="papp-trans-card"><div class="papp-trans-label">English</div><div class="papp-trans-text">Hello, how are you today? I would like to know more about the local culture and traditions.</div></div>';
  h += '<div style="margin:0 16px;border-top:1px solid rgba(255,255,255,.06)"></div>';
  h += '<div class="papp-trans-card"><div class="papp-trans-label">Spanish</div><div class="papp-trans-text papp-trans-result">Hola, como estas hoy? Me gustaria saber mas sobre la cultura y las tradiciones locales.</div></div>';
  h += '<div class="papp-section">Recent</div>';
  [{from:'Thank you very much',to:'Muchas gracias',lang:'ES'},{from:'Where is the nearest station?',to:'Donde esta la estacion mas cercana?',lang:'ES'},{from:'Good morning',to:'Buenos dias',lang:'ES'},{from:'I don\'t understand',to:'No entiendo',lang:'ES'},{from:'How much does this cost?',to:'Cuanto cuesta esto?',lang:'ES'}].forEach(function(r) { h += '<div class="papp-item" style="align-items:flex-start"><div style="flex-shrink:0;width:28px;height:28px;border-radius:6px;background:#1c1c1e;display:flex;align-items:center;justify-content:center;font-size:10px;color:rgba(255,255,255,.3);font-weight:600">' + r.lang + '</div><div class="papp-item-content"><div class="papp-item-name" style="font-size:14px">' + esc(r.from) + '</div><div class="papp-item-sub" style="font-size:13px">' + esc(r.to) + '</div></div></div>'; });
  return h;
}


// ==========================================================
//  PHONE APP PAGES — Batch 3: Media & Entertainment
// ==========================================================

// ========== 15. MUSIC ==========
function phonePageMusic(charName) {
  var h = '';
  h += '<div class="papp-music-now">' +
    '<div class="papp-music-cover"><svg viewBox="0 0 48 48" style="width:48px;height:48px;stroke:rgba(255,255,255,.15);fill:none;stroke-width:1.2;stroke-linecap:round"><path d="M18 36V14l18-6v20"/><circle cx="15" cy="36" r="5"/><circle cx="33" cy="28" r="5"/></svg></div>' +
    '<div class="papp-music-info">' +
      '<div class="papp-music-track">Midnight Drive</div>' +
      '<div class="papp-music-artist">The Echoes</div>' +
    '</div>' +
    '</div>';
  h += '<div class="papp-music-progress"><div class="papp-music-progress-track"><div class="papp-music-progress-fill" style="width:38%"></div></div><div class="papp-music-times"><span>1:24</span><span>3:42</span></div></div>';
  h += '<div class="papp-music-controls">' +
    '<svg viewBox="0 0 24 24"><path d="M19 4L9 12l10 8z"/><path d="M5 4v16"/></svg>' +
    '<div class="papp-music-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' +
    '<svg viewBox="0 0 24 24"><path d="M5 4l10 8-10 8z"/><path d="M19 4v16"/></svg>' +
    '</div>';
  h += '<div class="papp-section">Up Next</div>';
  var tracks = [
    { title:'Neon Lights',      artist:'Glass Waves',    dur:'4:15' },
    { title:'Golden Hour',      artist:'The Echoes',     dur:'3:28' },
    { title:'Distant Shores',   artist:'Lunar Drift',    dur:'5:02' },
    { title:'Paper Planes',     artist:'Skyfall',        dur:'3:51' },
    { title:'Electric Dreams',  artist:'Glass Waves',    dur:'4:33' },
    { title:'Autumn Leaves',    artist:'Silent Roads',   dur:'3:19' },
    { title:'City Lights',      artist:'The Echoes',     dur:'4:07' }
  ];
  tracks.forEach(function(t, i) {
    h += '<div class="papp-item"><div class="papp-music-num">' + (i + 2) + '</div><div class="papp-item-content"><div class="papp-item-name">' + esc(t.title) + '</div><div class="papp-item-sub">' + esc(t.artist) + '</div></div><span class="papp-item-time">' + t.dur + '</span></div>';
  });
  return h;
}

// ========== 16. VIDEOS ==========
function phonePageVideos(charName) {
  var h = '<div class="papp-segments"><div class="papp-seg papp-seg-active">All</div><div class="papp-seg">Movies</div><div class="papp-seg">Shows</div></div>';
  h += '<div class="papp-section" style="padding-top:4px">Continue Watching</div>';
  h += '<div class="papp-video-scroll">';
  [{ title:'The Last Horizon', time:'1:24:30 left' }, { title:'Through the Lens', time:'32:10 left' }].forEach(function(v) {
    h += '<div class="papp-video-card"><div class="papp-video-thumb"><svg viewBox="0 0 32 32"><path d="M12 10l10 6-10 6z"/></svg><div class="papp-video-dur">' + v.time + '</div></div><div class="papp-video-title">' + esc(v.title) + '</div></div>';
  });
  h += '</div>';
  h += '<div class="papp-section">Recent</div>';
  var vids = [
    { title:'A Quiet Night',        cat:'Drama',       dur:'1:52:00', size:'2.1 GB' },
    { title:'City Rush',            cat:'Action',      dur:'2:04:00', size:'2.8 GB' },
    { title:'The Interview',        cat:'Documentary', dur:'58:00',   size:'980 MB' },
    { title:'Coastal Roads',        cat:'Travel',      dur:'42:00',   size:'720 MB' },
    { title:'Code Breakers S01E03', cat:'Series',      dur:'48:00',   size:'850 MB' },
    { title:'Morning Light',        cat:'Short Film',  dur:'14:00',   size:'240 MB' }
  ];
  vids.forEach(function(v) {
    h += '<div class="papp-item"><div class="papp-video-list-thumb"><svg viewBox="0 0 24 24"><path d="M10 8l6 4-6 4z"/></svg></div><div class="papp-item-content"><div class="papp-item-name">' + esc(v.title) + '</div><div class="papp-item-sub">' + esc(v.cat) + ' -- ' + v.dur + '</div></div><span style="font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0">' + v.size + '</span></div>';
  });
  return h;
}

// ========== 17. PHOTOS ==========
function phonePagePhotos(charName) {
  var h = '<div class="papp-segments"><div class="papp-seg papp-seg-active">All Photos</div><div class="papp-seg">Albums</div><div class="papp-seg">For You</div></div>';
  h += '<div class="papp-photo-grid">';
  var shades = ['#1a1a1c','#222224','#1e1e20','#262628','#1c1c1e','#202022','#242426','#1a1a1c','#282828','#1e1e20','#222224','#262628','#1c1c1e','#202022','#242426','#1a1a1c','#282828','#222224','#1e1e20','#262628','#242426','#1c1c1e','#202022','#1a1a1c'];
  shades.forEach(function(s, i) {
    var isTall = (i === 4 || i === 11);
    h += '<div class="papp-photo-cell' + (isTall ? ' papp-photo-tall' : '') + '" style="background:' + s + '">';
    if (i % 5 === 0) {
      h += '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:rgba(255,255,255,.08);fill:none;stroke-width:1.2;stroke-linecap:round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-4 3 2 4-3 5 4"/><circle cx="16" cy="9" r="1.5"/></svg>';
    }
    h += '</div>';
  });
  h += '</div>';
  h += '<div style="text-align:center;padding:20px 16px;color:rgba(255,255,255,.2);font-size:12px">1,247 Photos -- 38 Videos</div>';
  return h;
}

// ========== 18. CAMERA ==========
function phonePageCamera(charName) {
  var h = '';
  h += '<div class="papp-camera-viewfinder">' +
    '<div class="papp-camera-corners">' +
      '<div class="papp-camera-corner papp-cc-tl"></div>' +
      '<div class="papp-camera-corner papp-cc-tr"></div>' +
      '<div class="papp-camera-corner papp-cc-bl"></div>' +
      '<div class="papp-camera-corner papp-cc-br"></div>' +
    '</div>' +
    '<div class="papp-camera-crosshair"><div class="papp-camera-cross-h"></div><div class="papp-camera-cross-v"></div></div>' +
    '<div class="papp-camera-grid">' +
      '<div class="papp-camera-grid-h" style="top:33%"></div>' +
      '<div class="papp-camera-grid-h" style="top:66%"></div>' +
      '<div class="papp-camera-grid-v" style="left:33%"></div>' +
      '<div class="papp-camera-grid-v" style="left:66%"></div>' +
    '</div>' +
    '</div>';
  h += '<div class="papp-camera-modes">';
  ['TIME-LAPSE','SLO-MO','VIDEO','PHOTO','PORTRAIT','PANO'].forEach(function(m) {
    h += '<div class="papp-camera-mode' + (m === 'PHOTO' ? ' papp-camera-mode-active' : '') + '">' + m + '</div>';
  });
  h += '</div>';
  h += '<div class="papp-camera-bottom">' +
    '<div class="papp-camera-preview"></div>' +
    '<div class="papp-camera-shutter"><div class="papp-camera-shutter-inner"></div></div>' +
    '<div class="papp-camera-flip"><svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:1.5;stroke-linecap:round"><path d="M20 8h-6l2-3"/><path d="M4 16h6l-2 3"/><path d="M20 8c0 6-3 10-8 12M4 16c0-6 3-10 8-12"/></svg></div>' +
    '</div>';
  return h;
}

// ========== 19. GAMES ==========
function phonePageGames(charName) {
  var h = '';
  h += '<div class="papp-game-featured"><div class="papp-game-featured-bg"><svg viewBox="0 0 40 40" style="width:48px;height:48px;stroke:rgba(255,255,255,.1);fill:none;stroke-width:1;stroke-linecap:round"><rect x="4" y="12" width="32" height="16" rx="8"/><circle cx="14" cy="20" r="3"/><path d="M26 17v6M23 20h6"/></svg></div><div class="papp-game-featured-info"><div style="font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px;font-weight:600">Featured</div><div style="font-size:18px;color:#fff;font-weight:600;margin-top:4px">Shadow Realm</div><div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:2px">Adventure -- RPG</div></div></div>';
  h += '<div class="papp-game-cats">';
  ['All','Puzzle','Action','Strategy','Casual'].forEach(function(c, i) {
    h += '<div class="papp-game-cat' + (i === 0 ? ' papp-game-cat-active' : '') + '">' + c + '</div>';
  });
  h += '</div>';
  h += '<div class="papp-section" style="padding-top:4px">My Games</div>';
  var games = [
    { name:'Puzzle Quest',    cat:'Puzzle',   rating:'4.8', size:'124 MB' },
    { name:'Shadow Realm',    cat:'RPG',      rating:'4.6', size:'1.2 GB' },
    { name:'Tower Defense X', cat:'Strategy', rating:'4.3', size:'89 MB' },
    { name:'Color Match',     cat:'Casual',   rating:'4.5', size:'45 MB' },
    { name:'Space Runner',    cat:'Action',   rating:'4.1', size:'210 MB' },
    { name:'Word Chain',      cat:'Puzzle',   rating:'4.7', size:'32 MB' },
    { name:'Chess Master',    cat:'Strategy', rating:'4.9', size:'67 MB' }
  ];
  var svgStar = '<svg viewBox="0 0 12 12" style="width:10px;height:10px;stroke:rgba(255,214,10,.6);fill:rgba(255,214,10,.3);stroke-width:1"><path d="M6 1l1.5 3.2L11 4.6 8.5 7l.6 3.4L6 8.8 2.9 10.4l.6-3.4L1 4.6l3.5-.4z"/></svg>';
  games.forEach(function(g) {
    h += '<div class="papp-item"><div class="papp-game-icon"><svg viewBox="0 0 20 20"><rect x="2" y="7" width="16" height="8" rx="4"/><circle cx="7" cy="11" r="1.2"/><path d="M13 9.5v3M11.5 11h3"/></svg></div><div class="papp-item-content"><div class="papp-item-name">' + esc(g.name) + '</div><div class="papp-item-sub" style="display:flex;align-items:center;gap:4px">' + svgStar + ' ' + g.rating + ' -- ' + esc(g.cat) + '</div></div><span style="font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0">' + g.size + '</span></div>';
  });
  return h;
}

// ========== 20. PODCAST ==========
function phonePagePodcast(charName) {
  var h = '';
  h += '<div class="papp-pod-mini"><div class="papp-pod-mini-cover"><svg viewBox="0 0 20 20" style="width:16px;height:16px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:1.5;stroke-linecap:round"><circle cx="10" cy="10" r="3"/><path d="M5 10a5 5 0 0110 0"/></svg></div><div class="papp-item-content"><div style="font-size:13px;color:#fff;font-weight:500">The Daily Brief</div><div style="font-size:11px;color:rgba(255,255,255,.3)">Episode 142 -- 24:30 left</div></div><svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.4);fill:none;stroke-width:2;stroke-linecap:round;flex-shrink:0"><path d="M7 5v10l8-5z"/></svg></div>';
  h += '<div class="papp-search">' + _svgSearch + '<span>Search</span></div>';
  h += '<div class="papp-section" style="padding-top:4px">Your Shows</div>';
  var shows = [
    { name:'The Daily Brief',      host:'News Network',  eps:142, newEps:2 },
    { name:'Creative Minds',       host:'Studio Lab',    eps:87,  newEps:1 },
    { name:'Tech Unlocked',        host:'Digital Weekly', eps:203, newEps:3 },
    { name:'Sleep Stories',        host:'Calm Studio',   eps:64,  newEps:0 },
    { name:'History Untold',       host:'Archive Media', eps:156, newEps:1 },
    { name:'Science Hour',         host:'Discovery Pod', eps:98,  newEps:0 }
  ];
  shows.forEach(function(s) {
    h += '<div class="papp-item"><div class="papp-pod-cover"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="2.5"/><path d="M5 10a5 5 0 0110 0M2 10a8 8 0 0116 0"/></svg></div><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(s.name) + '</span>' + (s.newEps > 0 ? '<div class="papp-badge" style="min-width:16px;height:16px;font-size:10px;padding:0 4px">' + s.newEps + '</div>' : '') + '</div><div class="papp-item-sub">' + esc(s.host) + ' -- ' + s.eps + ' episodes</div></div>' + _svgChevron + '</div>';
  });
  h += '<div class="papp-section">Browse</div>';
  ['News & Politics','Technology','Arts & Culture','Science','True Crime','Comedy'].forEach(function(cat) {
    h += '<div class="papp-item"><div class="papp-item-content"><div class="papp-item-name" style="font-size:14px">' + esc(cat) + '</div></div>' + _svgChevron + '</div>';
  });
  return h;
}


// ==========================================================
//  PHONE APP PAGES — Batch 4: Life Tools
// ==========================================================

// ========== 21. CALENDAR ==========
function phonePageCalendar(charName) {
  var now = new Date();
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var curMonth = now.getMonth();
  var curYear = now.getFullYear();
  var curDate = now.getDate();
  var curDay = now.getDay();

  var firstDay = new Date(curYear, curMonth, 1).getDay();
  var daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();

  var h = '';

  h += '<div class="papp-cal-month-header">' +
    '<svg viewBox="0 0 20 20" class="papp-cal-nav-arrow"><path d="M12 4l-6 6 6 6"/></svg>' +
    '<div class="papp-cal-month-title">' + months[curMonth] + ' ' + curYear + '</div>' +
    '<svg viewBox="0 0 20 20" class="papp-cal-nav-arrow"><path d="M8 4l6 6-6 6"/></svg>' +
    '</div>';

  h += '<div class="papp-cal-grid">';
  days.forEach(function(d) {
    h += '<div class="papp-cal-day-label">' + d + '</div>';
  });

  for (var e = 0; e < firstDay; e++) {
    h += '<div class="papp-cal-cell papp-cal-cell-empty"></div>';
  }

  var eventDays = [curDate, curDate + 2, curDate + 5, curDate - 1, curDate - 3];
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = (d === curDate);
    var hasEvent = eventDays.indexOf(d) >= 0 && d > 0 && d <= daysInMonth;
    h += '<div class="papp-cal-cell' + (isToday ? ' papp-cal-today' : '') + '">' +
      '<span>' + d + '</span>' +
      (hasEvent ? '<div class="papp-cal-dot"></div>' : '') +
      '</div>';
  }
  h += '</div>';

  h += '<div class="papp-cal-divider"></div>';

  var dayName = days[curDay];
  h += '<div class="papp-cal-schedule-header">' + dayName + ', ' + months[curMonth] + ' ' + curDate + '</div>';

  var events = [
    { time:'09:00', end:'09:30', title:'Morning standup', loc:'Video Call', color:'rgba(10,132,255,.5)' },
    { time:'10:00', end:'11:30', title:'Design review', loc:'Meeting Room 3', color:'rgba(48,209,88,.5)' },
    { time:'12:00', end:'13:00', title:'Lunch with Sarah', loc:'Cafe Nero', color:'rgba(255,159,10,.5)' },
    { time:'14:00', end:'15:30', title:'Project planning', loc:'Conference Room', color:'rgba(10,132,255,.5)' },
    { time:'17:00', end:'17:30', title:'Gym session', loc:'Downtown Fitness', color:'rgba(175,130,255,.5)' },
    { time:'19:00', end:'20:00', title:'Dinner reservation', loc:'The Italian Place', color:'rgba(255,69,58,.4)' }
  ];

  events.forEach(function(ev) {
    h += '<div class="papp-cal-event">' +
      '<div class="papp-cal-event-time">' +
        '<div class="papp-cal-event-start">' + ev.time + '</div>' +
        '<div class="papp-cal-event-end">' + ev.end + '</div>' +
      '</div>' +
      '<div class="papp-cal-event-bar" style="background:' + ev.color + '"></div>' +
      '<div class="papp-cal-event-info">' +
        '<div class="papp-cal-event-title">' + esc(ev.title) + '</div>' +
        '<div class="papp-cal-event-loc">' + esc(ev.loc) + '</div>' +
      '</div>' +
      '</div>';
  });

  h += '<div class="papp-section">Tomorrow</div>';
  [
    { time:'08:30', title:'Dentist appointment', loc:'City Clinic' },
    { time:'11:00', title:'Team sync', loc:'Video Call' },
    { time:'15:00', title:'Coffee with Mike', loc:'Blue Bottle' }
  ].forEach(function(ev) {
    h += '<div class="papp-item"><div class="papp-cal-upcoming-time">' + ev.time + '</div>' +
      '<div class="papp-item-content"><div class="papp-item-name">' + esc(ev.title) + '</div>' +
      '<div class="papp-item-sub">' + esc(ev.loc) + '</div></div>' + _svgChevron + '</div>';
  });

  return h;
}

// ========== 22. CLOCK ==========
function phonePageClock(charName) {
  var now = new Date();
  var hrs = now.getHours();
  var mins = now.getMinutes();
  var hrsDisplay = ('' + hrs).padStart(2, '0');
  var minsDisplay = ('' + mins).padStart(2, '0');

  var minAngle = mins * 6;
  var hrAngle = (hrs % 12) * 30 + mins * 0.5;

  var h = '';

  h += '<div class="papp-segments"><div class="papp-seg papp-seg-active">World Clock</div><div class="papp-seg">Alarm</div><div class="papp-seg">Stopwatch</div><div class="papp-seg">Timer</div></div>';

  h += '<div class="papp-clock-face-wrap">' +
    '<div class="papp-clock-face">' +
      '<svg viewBox="0 0 200 200">' +
        '<circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,.08)" fill="none" stroke-width="1"/>';

  for (var i = 0; i < 12; i++) {
    var angle = i * 30;
    var rad = angle * Math.PI / 180;
    var x1 = 100 + 78 * Math.sin(rad);
    var y1 = 100 - 78 * Math.cos(rad);
    var x2 = 100 + 86 * Math.sin(rad);
    var y2 = 100 - 86 * Math.cos(rad);
    var sw = (i % 3 === 0) ? '2' : '1';
    var op = (i % 3 === 0) ? '.4' : '.2';
    h += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="rgba(255,255,255,' + op + ')" stroke-width="' + sw + '" stroke-linecap="round"/>';
  }

  var hrRad = hrAngle * Math.PI / 180;
  var hx = 100 + 48 * Math.sin(hrRad);
  var hy = 100 - 48 * Math.cos(hrRad);
  h += '<line x1="100" y1="100" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="rgba(255,255,255,.7)" stroke-width="3" stroke-linecap="round"/>';

  var minRad = minAngle * Math.PI / 180;
  var mx = 100 + 68 * Math.sin(minRad);
  var my = 100 - 68 * Math.cos(minRad);
  h += '<line x1="100" y1="100" x2="' + mx.toFixed(1) + '" y2="' + my.toFixed(1) + '" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round"/>';

  h += '<circle cx="100" cy="100" r="4" fill="rgba(255,255,255,.5)"/>';

  h += '</svg></div>' +
    '<div class="papp-clock-digital">' + hrsDisplay + ':' + minsDisplay + '</div>' +
    '</div>';

  h += '<div class="papp-section" style="padding-top:8px">World Clock</div>';

  var cities = [
    { city:'New York',   tz:'EST',   diff:'-5h',  time:'04:' + minsDisplay },
    { city:'London',     tz:'GMT',   diff:'+0h',  time:'09:' + minsDisplay },
    { city:'Tokyo',      tz:'JST',   diff:'+9h',  time:'18:' + minsDisplay },
    { city:'Sydney',     tz:'AEDT',  diff:'+11h', time:'20:' + minsDisplay },
    { city:'Dubai',      tz:'GST',   diff:'+4h',  time:'13:' + minsDisplay },
    { city:'Paris',      tz:'CET',   diff:'+1h',  time:'10:' + minsDisplay }
  ];

  cities.forEach(function(c) {
    h += '<div class="papp-item">' +
      '<div class="papp-clock-tz">' + c.tz + '</div>' +
      '<div class="papp-item-content">' +
        '<div class="papp-item-top"><span class="papp-item-name">' + esc(c.city) + '</span>' +
        '<span class="papp-clock-city-time">' + c.time + '</span></div>' +
        '<div class="papp-item-sub">' + c.diff + ' from here</div>' +
      '</div></div>';
  });

  h += '<div class="papp-section">Alarms</div>';
  [
    { time:'06:30', label:'Weekdays',  on:true },
    { time:'07:45', label:'Weekend',   on:true },
    { time:'09:00', label:'Meeting',   on:false },
    { time:'22:00', label:'Bedtime',   on:true }
  ].forEach(function(a) {
    h += '<div class="papp-item">' +
      '<div class="papp-item-content">' +
        '<div class="papp-clock-alarm-time">' + a.time + '</div>' +
        '<div class="papp-item-sub">' + esc(a.label) + '</div>' +
      '</div>' +
      '<div class="papp-clock-toggle' + (a.on ? ' papp-clock-toggle-on' : '') + '"><div class="papp-clock-toggle-knob"></div></div>' +
      '</div>';
  });

  return h;
}

// ========== 23. WEATHER ==========
function phonePageWeather(charName) {
  var h = '';

  h += '<div class="papp-weather-current">' +
    '<div class="papp-weather-city">San Francisco</div>' +
    '<div class="papp-weather-temp">18</div>' +
    '<div class="papp-weather-desc">Partly Cloudy</div>' +
    '<div class="papp-weather-hilo">H:22  L:14</div>' +
    '</div>';

  h += '<div class="papp-weather-card">' +
    '<div class="papp-weather-card-title">Hourly Forecast</div>' +
    '<div class="papp-weather-hourly">';

  var hourlyData = [
    { t:'Now', temp:'18', icon:'cloud' },
    { t:'1PM', temp:'19', icon:'cloud' },
    { t:'2PM', temp:'20', icon:'sun' },
    { t:'3PM', temp:'21', icon:'sun' },
    { t:'4PM', temp:'22', icon:'sun' },
    { t:'5PM', temp:'21', icon:'cloud' },
    { t:'6PM', temp:'19', icon:'cloud' },
    { t:'7PM', temp:'18', icon:'moon' },
    { t:'8PM', temp:'17', icon:'moon' }
  ];

  var weatherIcons = {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M6 19a4 4 0 01-.9-7.9A5 5 0 0115 8a4 4 0 012 7.5"/><path d="M8 19h9"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M6 17a4 4 0 01-.9-7.9A5 5 0 0115 6a4 4 0 012 7.5"/><path d="M9 19v2M12 19v2M15 19v2"/></svg>'
  };

  hourlyData.forEach(function(hr) {
    h += '<div class="papp-weather-hour">' +
      '<div class="papp-weather-hour-t">' + hr.t + '</div>' +
      '<div class="papp-weather-hour-icon">' + (weatherIcons[hr.icon] || weatherIcons.cloud) + '</div>' +
      '<div class="papp-weather-hour-temp">' + hr.temp + '</div>' +
      '</div>';
  });
  h += '</div></div>';

  h += '<div class="papp-weather-card">' +
    '<div class="papp-weather-card-title">7-Day Forecast</div>';

  var dailyData = [
    { day:'Today',     icon:'cloud', lo:'14', hi:'22' },
    { day:'Tue',       icon:'sun',   lo:'15', hi:'24' },
    { day:'Wed',       icon:'sun',   lo:'16', hi:'25' },
    { day:'Thu',       icon:'rain',  lo:'13', hi:'19' },
    { day:'Fri',       icon:'rain',  lo:'12', hi:'18' },
    { day:'Sat',       icon:'cloud', lo:'14', hi:'21' },
    { day:'Sun',       icon:'sun',   lo:'15', hi:'23' }
  ];

  dailyData.forEach(function(d) {
    var loP = Math.max(0, Math.min(100, ((parseInt(d.lo) - 10) / 18) * 100));
    var hiP = Math.max(0, Math.min(100, ((parseInt(d.hi) - 10) / 18) * 100));
    h += '<div class="papp-weather-daily">' +
      '<div class="papp-weather-daily-day">' + d.day + '</div>' +
      '<div class="papp-weather-daily-icon">' + (weatherIcons[d.icon] || weatherIcons.cloud) + '</div>' +
      '<div class="papp-weather-daily-lo">' + d.lo + '</div>' +
      '<div class="papp-weather-daily-bar"><div class="papp-weather-daily-bar-track"><div class="papp-weather-daily-bar-fill" style="left:' + loP + '%;right:' + (100 - hiP) + '%"></div></div></div>' +
      '<div class="papp-weather-daily-hi">' + d.hi + '</div>' +
      '</div>';
  });

  h += '</div>';

  h += '<div class="papp-weather-card"><div class="papp-weather-card-title">Details</div>' +
    '<div class="papp-weather-details">';
  [
    { label:'Humidity',    val:'62%' },
    { label:'Wind',        val:'12 km/h' },
    { label:'Visibility',  val:'16 km' },
    { label:'Pressure',    val:'1015 hPa' },
    { label:'UV Index',    val:'5 Moderate' },
    { label:'Sunrise',     val:'06:42' }
  ].forEach(function(d) {
    h += '<div class="papp-weather-detail-item"><div class="papp-weather-detail-label">' + d.label + '</div><div class="papp-weather-detail-val">' + d.val + '</div></div>';
  });
  h += '</div></div>';

  return h;
}

// ========== 24. MAPS ==========
function phonePageMaps(charName) {
  var h = '';

  h += '<div class="papp-search">' + _svgSearch + '<span>Search places</span></div>';

  h += '<div class="papp-maps-view">' +
    '<svg viewBox="0 0 400 300" style="width:100%;height:100%">' +
      '<path d="M0 75h400M0 150h400M0 225h400" stroke="rgba(255,255,255,.04)" fill="none" stroke-width="16"/>' +
      '<path d="M100 0v300M200 0v300M300 0v300" stroke="rgba(255,255,255,.04)" fill="none" stroke-width="16"/>' +
      '<path d="M50 0L350 300" stroke="rgba(255,255,255,.05)" fill="none" stroke-width="12"/>' +
      '<rect x="30" y="20" width="50" height="35" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="120" y="85" width="60" height="45" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="220" y="30" width="65" height="30" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="310" y="90" width="55" height="40" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="40" y="160" width="45" height="50" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="250" y="170" width="50" height="35" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="130" y="200" width="55" height="40" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="320" y="210" width="45" height="55" rx="3" fill="rgba(255,255,255,.03)"/>' +
      '<rect x="140" y="105" width="80" height="35" rx="6" fill="rgba(48,209,88,.04)" stroke="rgba(48,209,88,.08)" stroke-width="1"/>' +
      '<g transform="translate(200,140)">' +
        '<circle cx="0" cy="0" r="12" fill="rgba(10,132,255,.2)" stroke="rgba(10,132,255,.4)" stroke-width="1"/>' +
        '<circle cx="0" cy="0" r="5" fill="rgba(10,132,255,.6)"/>' +
      '</g>' +
      '<g transform="translate(120,90)">' +
        '<path d="M0-12c-5 0-9 4-9 8.5C-9 1 0 8 0 8s9-7 9-11.5C9-8 5-12 0-12z" fill="rgba(255,69,58,.3)" stroke="rgba(255,69,58,.5)" stroke-width=".8"/>' +
        '<circle cx="0" cy="-3" r="2.5" fill="rgba(255,69,58,.5)"/>' +
      '</g>' +
    '</svg>' +
    '<div class="papp-maps-compass"><svg viewBox="0 0 24 24"><path d="M12 2l1 4-1 1-1-1z" fill="rgba(255,69,58,.5)"/><path d="M12 22l-1-4 1-1 1 1z" fill="rgba(255,255,255,.2)"/><path d="M2 12l4 1 1-1-1-1z" fill="rgba(255,255,255,.2)"/><path d="M22 12l-4-1-1 1 1 1z" fill="rgba(255,255,255,.2)"/></svg></div>' +
    '<div class="papp-maps-locate"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3"/><path d="M10 2v4M10 14v4M2 10h4M14 10h4"/></svg></div>' +
    '</div>';

  h += '<div class="papp-maps-actions">';
  [
    { icon:'<path d="M3 11l9-9 9 9M5 11v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8"/>', label:'Home' },
    { icon:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 4v16"/>', label:'Work' },
    { icon:'<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.04 6.04 0 0116.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/>', label:'Saved' },
    { icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', label:'Recent' }
  ].forEach(function(a) {
    h += '<div class="papp-maps-action-item"><div class="papp-maps-action-icon"><svg viewBox="0 0 24 24">' + a.icon + '</svg></div><div class="papp-maps-action-label">' + a.label + '</div></div>';
  });
  h += '</div>';

  h += '<div class="papp-section">Nearby</div>';
  [
    { name:'Central Park',       cat:'Park',        dist:'0.3 km' },
    { name:'Blue Bottle Coffee', cat:'Cafe',        dist:'0.5 km' },
    { name:'City Library',       cat:'Library',     dist:'0.8 km' },
    { name:'Metro Station',      cat:'Transport',   dist:'0.2 km' },
    { name:'Fresh Market',       cat:'Grocery',     dist:'0.6 km' },
    { name:'Downtown Gym',       cat:'Fitness',     dist:'1.1 km' }
  ].forEach(function(p) {
    h += '<div class="papp-item"><div class="papp-maps-place-icon"><svg viewBox="0 0 20 20"><path d="M10 2C7 2 5 4.5 5 7c0 4.2 5 10 5 10s5-5.8 5-10c0-2.5-2-5-5-5z"/><circle cx="10" cy="7" r="2"/></svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(p.name) + '</span><span class="papp-item-time">' + p.dist + '</span></div>' +
      '<div class="papp-item-sub">' + esc(p.cat) + '</div></div>' + _svgChevron + '</div>';
  });

  return h;
}

// ========== 25. COMPASS ==========
function phonePageCompass(charName) {
  var h = '';

  h += '<div class="papp-compass-wrap">' +
    '<div class="papp-compass-ring">' +
      '<svg viewBox="0 0 260 260">' +
        '<circle cx="130" cy="130" r="120" stroke="rgba(255,255,255,.06)" fill="none" stroke-width="1"/>' +
        '<circle cx="130" cy="130" r="100" stroke="rgba(255,255,255,.04)" fill="none" stroke-width="0.5"/>';

  for (var i = 0; i < 360; i += 5) {
    var rad = i * Math.PI / 180;
    var isMajor = (i % 30 === 0);
    var r1 = isMajor ? 108 : 112;
    var r2 = 118;
    var sx = 130 + r1 * Math.sin(rad);
    var sy = 130 - r1 * Math.cos(rad);
    var ex = 130 + r2 * Math.sin(rad);
    var ey = 130 - r2 * Math.cos(rad);
    var sw = isMajor ? '1.5' : '0.8';
    var op = isMajor ? '.3' : '.1';
    h += '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="rgba(255,255,255,' + op + ')" stroke-width="' + sw + '"/>';
  }

  var cardinals = [
    { label:'N', angle:0, color:'rgba(255,69,58,.7)' },
    { label:'E', angle:90, color:'rgba(255,255,255,.35)' },
    { label:'S', angle:180, color:'rgba(255,255,255,.35)' },
    { label:'W', angle:270, color:'rgba(255,255,255,.35)' }
  ];
  cardinals.forEach(function(c) {
    var crad = c.angle * Math.PI / 180;
    var cx = 130 + 92 * Math.sin(crad);
    var cy = 130 - 92 * Math.cos(crad);
    h += '<text x="' + cx.toFixed(1) + '" y="' + (cy + 4).toFixed(1) + '" text-anchor="middle" fill="' + c.color + '" font-size="14" font-weight="600">' + c.label + '</text>';
  });

  h += '<g transform="translate(130,130)">' +
    '<polygon points="0,-70 -7,0 0,-10 7,0" fill="rgba(255,69,58,.5)" stroke="rgba(255,69,58,.3)" stroke-width=".5"/>' +
    '<polygon points="0,70 -7,0 0,10 7,0" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.08)" stroke-width=".5"/>' +
    '<circle cx="0" cy="0" r="5" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.1)" stroke-width="1"/>' +
    '</g>';

  h += '</svg></div>';

  h += '<div class="papp-compass-readout">' +
    '<div class="papp-compass-degree">0</div>' +
    '<div class="papp-compass-dir">North</div>' +
    '</div>';

  h += '</div>';

  h += '<div class="papp-compass-coords">' +
    '<div class="papp-compass-coord-row">' +
      '<div class="papp-compass-coord-item"><div class="papp-compass-coord-label">Latitude</div><div class="papp-compass-coord-val">37.7749</div></div>' +
      '<div class="papp-compass-coord-divider"></div>' +
      '<div class="papp-compass-coord-item"><div class="papp-compass-coord-label">Longitude</div><div class="papp-compass-coord-val">-122.4194</div></div>' +
    '</div>' +
    '<div class="papp-compass-coord-row" style="margin-top:8px">' +
      '<div class="papp-compass-coord-item"><div class="papp-compass-coord-label">Elevation</div><div class="papp-compass-coord-val">16 m</div></div>' +
      '<div class="papp-compass-coord-divider"></div>' +
      '<div class="papp-compass-coord-item"><div class="papp-compass-coord-label">Accuracy</div><div class="papp-compass-coord-val">+/- 5 m</div></div>' +
    '</div>' +
    '</div>';

  return h;
}

// ========== 26. CALCULATOR ==========
function phonePageCalculator(charName) {
  var h = '';

  h += '<div class="papp-calc-display">' +
    '<div class="papp-calc-expr">384 + 216</div>' +
    '<div class="papp-calc-result">600</div>' +
    '</div>';

  h += '<div class="papp-calc-history">';
  [
    { expr:'1024 / 4', res:'256' },
    { expr:'99 x 12',  res:'1,188' },
    { expr:'500 - 187', res:'313' }
  ].forEach(function(item) {
    h += '<div class="papp-calc-history-item"><div class="papp-calc-hist-expr">' + item.expr + '</div><div class="papp-calc-hist-res">= ' + item.res + '</div></div>';
  });
  h += '</div>';

  h += '<div class="papp-calc-grid">';

  var buttons = [
    { label:'AC', type:'func' }, { label:'+/-', type:'func' }, { label:'%', type:'func' }, { label:'/', type:'op' },
    { label:'7',  type:'num' }, { label:'8',  type:'num' }, { label:'9',  type:'num' }, { label:'x', type:'op' },
    { label:'4',  type:'num' }, { label:'5',  type:'num' }, { label:'6',  type:'num' }, { label:'-', type:'op' },
    { label:'1',  type:'num' }, { label:'2',  type:'num' }, { label:'3',  type:'num' }, { label:'+', type:'op' },
    { label:'0',  type:'num zero' }, { label:'.',  type:'num' }, { label:'=', type:'op eq' }
  ];

  buttons.forEach(function(b) {
    var cls = 'papp-calc-btn';
    if (b.type === 'func') cls += ' papp-calc-func';
    else if (b.type === 'op') cls += ' papp-calc-op';
    else if (b.type === 'op eq') cls += ' papp-calc-op papp-calc-eq';
    else if (b.type === 'num zero') cls += ' papp-calc-zero';
    h += '<div class="' + cls + '">' + b.label + '</div>';
  });

  h += '</div>';

  return h;
}

// ========== 27. REMINDERS ==========
function phonePageReminders(charName) {
  var h = '';

  h += '<div class="papp-remind-summary">' +
    '<div class="papp-remind-sum-card"><div class="papp-remind-sum-count" style="color:rgba(10,132,255,.8)">3</div><div class="papp-remind-sum-label">Today</div></div>' +
    '<div class="papp-remind-sum-card"><div class="papp-remind-sum-count" style="color:rgba(255,159,10,.8)">5</div><div class="papp-remind-sum-label">Scheduled</div></div>' +
    '<div class="papp-remind-sum-card"><div class="papp-remind-sum-count" style="color:rgba(255,255,255,.5)">12</div><div class="papp-remind-sum-label">All</div></div>' +
    '<div class="papp-remind-sum-card"><div class="papp-remind-sum-count" style="color:rgba(48,209,88,.8)">8</div><div class="papp-remind-sum-label">Completed</div></div>' +
    '</div>';

  h += '<div class="papp-section" style="padding-top:8px">My Lists</div>';

  var svgCheck = '<svg viewBox="0 0 20 20" style="width:20px;height:20px;flex-shrink:0"><circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,.15)" fill="none" stroke-width="1.5"/></svg>';
  var svgChecked = '<svg viewBox="0 0 20 20" style="width:20px;height:20px;flex-shrink:0"><circle cx="10" cy="10" r="8" stroke="rgba(48,209,88,.5)" fill="rgba(48,209,88,.12)" stroke-width="1.5"/><path d="M7 10l2.5 2.5L14 8" stroke="rgba(48,209,88,.7)" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var lists = [
    { name:'Personal', color:'rgba(10,132,255,.6)',  count:4 },
    { name:'Work',     color:'rgba(255,159,10,.6)',  count:5 },
    { name:'Shopping', color:'rgba(48,209,88,.6)',   count:3 },
    { name:'Health',   color:'rgba(255,69,58,.5)',   count:2 }
  ];

  lists.forEach(function(l) {
    h += '<div class="papp-item"><div class="papp-remind-list-dot" style="background:' + l.color + '"></div>' +
      '<div class="papp-item-content"><div class="papp-item-name">' + esc(l.name) + '</div></div>' +
      '<span style="font-size:14px;color:rgba(255,255,255,.25);margin-right:4px">' + l.count + '</span>' + _svgChevron + '</div>';
  });

  h += '<div class="papp-section">Today</div>';

  var todayItems = [
    { text:'Buy groceries - milk, eggs, bread', done:false, time:'09:00', priority:'none' },
    { text:'Call dentist for appointment', done:false, time:'10:00', priority:'high' },
    { text:'Send project proposal', done:false, time:'14:00', priority:'high' },
    { text:'Morning run - 5km', done:true, time:'07:00', priority:'none' },
    { text:'Reply to Sarah email', done:true, time:'08:30', priority:'none' }
  ];

  todayItems.forEach(function(item) {
    h += '<div class="papp-remind-item' + (item.done ? ' papp-remind-done' : '') + '">' +
      (item.done ? svgChecked : svgCheck) +
      '<div class="papp-item-content">' +
        '<div class="papp-remind-text">' + esc(item.text) + '</div>' +
        '<div class="papp-remind-meta">' + item.time +
          (item.priority === 'high' ? ' -- High Priority' : '') +
        '</div>' +
      '</div>' +
      '</div>';
  });

  h += '<div class="papp-section">Upcoming</div>';

  [
    { text:'Prepare presentation slides', time:'Tomorrow, 10:00' },
    { text:'Water plants', time:'Tomorrow, 18:00' },
    { text:'Review budget spreadsheet', time:'Thu, 09:00' },
    { text:'Schedule team dinner', time:'Fri, 12:00' },
    { text:'Renew gym membership', time:'Next Mon' }
  ].forEach(function(item) {
    h += '<div class="papp-remind-item">' + svgCheck +
      '<div class="papp-item-content">' +
        '<div class="papp-remind-text">' + esc(item.text) + '</div>' +
        '<div class="papp-remind-meta">' + esc(item.time) + '</div>' +
      '</div></div>';
  });

  return h;
}

// ==========================================================
//  PHONE APP PAGES — Batch 5: Info & Health
// ==========================================================

// ========== 28. NEWS ==========
function phonePageNews(charName) {
  var h = '';

  h += '<div class="papp-segments"><div class="papp-seg papp-seg-active">For You</div><div class="papp-seg">Top Stories</div><div class="papp-seg">Following</div></div>';

  // Featured article
  h += '<div class="papp-news-featured">' +
    '<div class="papp-news-featured-img"><svg viewBox="0 0 32 32"><rect x="3" y="5" width="26" height="20" rx="3" stroke="rgba(255,255,255,.08)" fill="none" stroke-width="1"/><path d="M3 19l7-5 5 3 6-5 6 5" stroke="rgba(255,255,255,.06)" fill="none" stroke-width="1"/></svg></div>' +
    '<div class="papp-news-featured-info">' +
      '<div class="papp-news-source">World Report</div>' +
      '<div class="papp-news-headline">Global technology summit draws leaders from 40 countries to discuss AI policy</div>' +
      '<div class="papp-news-meta">2h ago</div>' +
    '</div>' +
    '</div>';

  // News list
  var articles = [
    { src:'Tech Daily', title:'New programming language gains traction among developers worldwide', time:'3h ago', cat:'Technology' },
    { src:'Finance Wire', title:'Markets close higher as investors react to economic data release', time:'4h ago', cat:'Business' },
    { src:'Science Now', title:'Researchers discover high-efficiency solar cell material', time:'5h ago', cat:'Science' },
    { src:'Health Today', title:'Study links consistent sleep schedule to improved cognitive function', time:'6h ago', cat:'Health' },
    { src:'Culture Beat', title:'Independent film festival announces lineup for upcoming season', time:'7h ago', cat:'Entertainment' },
    { src:'Sports Update', title:'Championship finals set after dramatic semifinal results', time:'8h ago', cat:'Sports' },
    { src:'World Report', title:'International cooperation agreement signed by twelve nations', time:'9h ago', cat:'World' },
    { src:'Tech Daily', title:'Open source project reaches one million contributors milestone', time:'11h ago', cat:'Technology' }
  ];

  articles.forEach(function(a) {
    h += '<div class="papp-news-item">' +
      '<div class="papp-news-item-content">' +
        '<div class="papp-news-item-source">' + esc(a.src) + '</div>' +
        '<div class="papp-news-item-title">' + esc(a.title) + '</div>' +
        '<div class="papp-news-item-meta">' + a.time + ' -- ' + esc(a.cat) + '</div>' +
      '</div>' +
      '<div class="papp-news-item-thumb"><svg viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 12l4-3 3 2 4-3 5 4"/></svg></div>' +
      '</div>';
  });

  // Topics
  h += '<div class="papp-section">Topics</div>';
  ['Technology','Business','Science','Health','Sports','Entertainment'].forEach(function(t) {
    h += '<div class="papp-item"><div class="papp-item-content"><div class="papp-item-name" style="font-size:14px">' + esc(t) + '</div></div>' + _svgChevron + '</div>';
  });

  return h;
}

// ========== 29. STOCKS ==========
function phonePageStocks(charName) {
  var h = '';

  // Portfolio summary
  h += '<div class="papp-stocks-summary">' +
    '<div class="papp-stocks-portfolio-label">Portfolio Value</div>' +
    '<div class="papp-stocks-portfolio-val">$24,831.56</div>' +
    '<div class="papp-stocks-portfolio-change papp-stocks-up">+$342.18 (+1.40%) Today</div>' +
    '</div>';

  // Mini chart
  h += '<div class="papp-stocks-chart"><svg viewBox="0 0 320 80" style="width:100%;height:80px">' +
    '<path d="M0 60 L20 55 L40 58 L60 50 L80 45 L100 48 L120 40 L140 35 L160 38 L180 30 L200 28 L220 32 L240 25 L260 22 L280 20 L300 18 L320 15" stroke="rgba(48,209,88,.5)" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M0 60 L20 55 L40 58 L60 50 L80 45 L100 48 L120 40 L140 35 L160 38 L180 30 L200 28 L220 32 L240 25 L260 22 L280 20 L300 18 L320 15 L320 80 L0 80 Z" fill="rgba(48,209,88,.06)"/>' +
    '</svg></div>';

  // Time range
  h += '<div class="papp-stocks-range">';
  ['1D','1W','1M','3M','6M','1Y','ALL'].forEach(function(r, i) {
    h += '<div class="papp-stocks-range-btn' + (i === 0 ? ' papp-stocks-range-active' : '') + '">' + r + '</div>';
  });
  h += '</div>';

  // Watchlist
  h += '<div class="papp-section" style="padding-top:8px">Watchlist</div>';

  var stocks = [
    { sym:'AAPL', name:'Apple Inc.', price:'178.52', change:'+2.34', pct:'+1.33', up:true },
    { sym:'GOOGL', name:'Alphabet Inc.', price:'141.80', change:'+1.12', pct:'+0.80', up:true },
    { sym:'MSFT', name:'Microsoft Corp.', price:'378.91', change:'-3.20', pct:'-0.84', up:false },
    { sym:'TSLA', name:'Tesla Inc.', price:'242.68', change:'+8.45', pct:'+3.61', up:true },
    { sym:'AMZN', name:'Amazon.com', price:'178.25', change:'-1.56', pct:'-0.87', up:false },
    { sym:'NVDA', name:'NVIDIA Corp.', price:'875.32', change:'+12.80', pct:'+1.48', up:true },
    { sym:'META', name:'Meta Platforms', price:'504.18', change:'+4.22', pct:'+0.84', up:true },
    { sym:'NFLX', name:'Netflix Inc.', price:'628.45', change:'-2.10', pct:'-0.33', up:false }
  ];

  stocks.forEach(function(s) {
    h += '<div class="papp-item">' +
      '<div class="papp-item-content">' +
        '<div class="papp-item-top"><span class="papp-item-name">' + esc(s.sym) + '</span><span class="papp-stocks-price">$' + s.price + '</span></div>' +
        '<div class="papp-item-top" style="margin-top:2px"><span class="papp-item-sub" style="margin-top:0">' + esc(s.name) + '</span><span class="papp-stocks-change' + (s.up ? ' papp-stocks-up' : ' papp-stocks-down') + '">' + s.change + ' (' + s.pct + '%)</span></div>' +
      '</div>' +
      '</div>';
  });

  return h;
}

// ========== 30. CODING ==========
function phonePageCoding(charName) {
  var h = '';

  // Editor area
  h += '<div class="papp-code-editor">' +
    '<div class="papp-code-tabs">' +
      '<div class="papp-code-tab papp-code-tab-active">main.js</div>' +
      '<div class="papp-code-tab">utils.js</div>' +
      '<div class="papp-code-tab">index.html</div>' +
    '</div>' +
    '<div class="papp-code-content">';

  var lines = [
    { num:1,  code:'<span class="papp-ck">const</span> <span class="papp-cv">app</span> = <span class="papp-cf">require</span>(<span class="papp-cs">\'express\'</span>);' },
    { num:2,  code:'<span class="papp-ck">const</span> <span class="papp-cv">port</span> = <span class="papp-cn">3000</span>;' },
    { num:3,  code:'' },
    { num:4,  code:'<span class="papp-cv">app</span>.<span class="papp-cf">get</span>(<span class="papp-cs">\'/\'</span>, (<span class="papp-cv">req</span>, <span class="papp-cv">res</span>) => {' },
    { num:5,  code:'  <span class="papp-cv">res</span>.<span class="papp-cf">json</span>({' },
    { num:6,  code:'    <span class="papp-cv">status</span>: <span class="papp-cs">\'ok\'</span>,' },
    { num:7,  code:'    <span class="papp-cv">time</span>: <span class="papp-ck">new</span> <span class="papp-cf">Date</span>()' },
    { num:8,  code:'  });' },
    { num:9,  code:'});' },
    { num:10, code:'' },
    { num:11, code:'<span class="papp-cv">app</span>.<span class="papp-cf">listen</span>(<span class="papp-cv">port</span>, () => {' },
    { num:12, code:'  <span class="papp-cv">console</span>.<span class="papp-cf">log</span>(<span class="papp-cs">`Running on port ${<span class="papp-cv">port</span>}`</span>);' },
    { num:13, code:'});' }
  ];

  lines.forEach(function(l) {
    h += '<div class="papp-code-line"><span class="papp-code-num">' + l.num + '</span><span class="papp-code-text">' + (l.code || '&nbsp;') + '</span></div>';
  });

  h += '</div></div>';

  // Terminal output
  h += '<div class="papp-code-terminal">' +
    '<div class="papp-code-term-header"><span class="papp-code-term-dot"></span><span class="papp-code-term-dot"></span><span class="papp-code-term-dot"></span><span class="papp-code-term-title">Terminal</span></div>' +
    '<div class="papp-code-term-body">' +
      '<div class="papp-code-term-line"><span class="papp-code-term-prompt">$</span> node main.js</div>' +
      '<div class="papp-code-term-line papp-code-term-output">Running on port 3000</div>' +
      '<div class="papp-code-term-line"><span class="papp-code-term-prompt">$</span> npm test</div>' +
      '<div class="papp-code-term-line papp-code-term-success">All 12 tests passed</div>' +
      '<div class="papp-code-term-line"><span class="papp-code-term-prompt">$</span> <span class="papp-code-term-cursor"></span></div>' +
    '</div>' +
    '</div>';

  // Recent projects
  h += '<div class="papp-section">Projects</div>';
  [
    { name:'web-app', lang:'JavaScript', files:24, modified:'Today' },
    { name:'api-server', lang:'TypeScript', files:18, modified:'Yesterday' },
    { name:'data-pipeline', lang:'Python', files:12, modified:'3 days ago' },
    { name:'mobile-ui', lang:'Swift', files:32, modified:'Last week' }
  ].forEach(function(p) {
    h += '<div class="papp-item"><div class="papp-code-proj-icon"><svg viewBox="0 0 20 20"><path d="M3 6h5l2 2h7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z"/></svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(p.name) + '</span><span class="papp-item-time">' + p.modified + '</span></div>' +
      '<div class="papp-item-sub">' + esc(p.lang) + ' -- ' + p.files + ' files</div></div>' + _svgChevron + '</div>';
  });

  return h;
}

// ========== 31. HEALTH ==========
function phonePageHealth(charName) {
  var h = '';

  // Summary cards
  h += '<div class="papp-health-cards">';
  [
    { label:'Heart Rate', val:'72', unit:'BPM', color:'rgba(255,69,58,.6)', icon:'<path d="M10 17S3 13 3 8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 5-7 9-7 9z"/>' },
    { label:'Steps', val:'8,432', unit:'steps', color:'rgba(10,132,255,.6)', icon:'<path d="M6 15l2-3 2 2 3-4 2 2 2-3"/>' },
    { label:'Sleep', val:'7h 24m', unit:'', color:'rgba(175,130,255,.6)', icon:'<path d="M17 12A7 7 0 017.2 7a5.5 5.5 0 109.8 5z"/>' },
    { label:'Calories', val:'1,847', unit:'kcal', color:'rgba(255,159,10,.6)', icon:'<path d="M10 18c-3 0-5-2.5-5-6 0-4 5-9 5-9s5 5 5 9c0 3.5-2 6-5 6z"/>' }
  ].forEach(function(c) {
    h += '<div class="papp-health-card">' +
      '<div class="papp-health-card-icon" style="color:' + c.color + '"><svg viewBox="0 0 20 20">' + c.icon + '</svg></div>' +
      '<div class="papp-health-card-label">' + c.label + '</div>' +
      '<div class="papp-health-card-val" style="color:' + c.color + '">' + c.val + '</div>' +
      (c.unit ? '<div class="papp-health-card-unit">' + c.unit + '</div>' : '') +
      '</div>';
  });
  h += '</div>';

  // Activity rings placeholder
  h += '<div class="papp-health-rings">' +
    '<svg viewBox="0 0 120 120" style="width:120px;height:120px">' +
      '<circle cx="60" cy="60" r="50" stroke="rgba(255,69,58,.15)" fill="none" stroke-width="8"/>' +
      '<circle cx="60" cy="60" r="50" stroke="rgba(255,69,58,.6)" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="80" transform="rotate(-90 60 60)"/>' +
      '<circle cx="60" cy="60" r="38" stroke="rgba(48,209,88,.15)" fill="none" stroke-width="8"/>' +
      '<circle cx="60" cy="60" r="38" stroke="rgba(48,209,88,.6)" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="239" stroke-dashoffset="50" transform="rotate(-90 60 60)"/>' +
      '<circle cx="60" cy="60" r="26" stroke="rgba(10,132,255,.15)" fill="none" stroke-width="8"/>' +
      '<circle cx="60" cy="60" r="26" stroke="rgba(10,132,255,.6)" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="163" stroke-dashoffset="25" transform="rotate(-90 60 60)"/>' +
    '</svg>' +
    '<div class="papp-health-rings-legend">' +
      '<div class="papp-health-ring-label"><span style="background:rgba(255,69,58,.6)"></span>Move 420/500 kcal</div>' +
      '<div class="papp-health-ring-label"><span style="background:rgba(48,209,88,.6)"></span>Exercise 28/30 min</div>' +
      '<div class="papp-health-ring-label"><span style="background:rgba(10,132,255,.6)"></span>Stand 10/12 hr</div>' +
    '</div>' +
    '</div>';

  // Vitals
  h += '<div class="papp-section">Vitals</div>';
  [
    { name:'Blood Pressure', val:'120/78 mmHg', time:'Today, 08:15' },
    { name:'Blood Oxygen', val:'98%', time:'Today, 07:30' },
    { name:'Body Temperature', val:'36.6 C', time:'Today, 07:00' },
    { name:'Respiratory Rate', val:'16 /min', time:'Yesterday' },
    { name:'Resting Heart Rate', val:'62 BPM', time:'Average' }
  ].forEach(function(v) {
    h += '<div class="papp-item"><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(v.name) + '</span><span class="papp-item-time">' + v.time + '</span></div><div class="papp-item-sub">' + esc(v.val) + '</div></div>' + _svgChevron + '</div>';
  });

  return h;
}

// ========== 32. FITNESS ==========
function phonePageFitness(charName) {
  var h = '';

  // Today's workout summary
  h += '<div class="papp-fit-today">' +
    '<div class="papp-fit-today-header">Today\'s Activity</div>' +
    '<div class="papp-fit-stats">' +
      '<div class="papp-fit-stat"><div class="papp-fit-stat-val">48</div><div class="papp-fit-stat-label">Minutes</div></div>' +
      '<div class="papp-fit-stat-divider"></div>' +
      '<div class="papp-fit-stat"><div class="papp-fit-stat-val">385</div><div class="papp-fit-stat-label">Calories</div></div>' +
      '<div class="papp-fit-stat-divider"></div>' +
      '<div class="papp-fit-stat"><div class="papp-fit-stat-val">142</div><div class="papp-fit-stat-label">Avg BPM</div></div>' +
    '</div>' +
    '</div>';

  // Weekly chart
  h += '<div class="papp-fit-chart">' +
    '<div class="papp-fit-chart-title">This Week</div>' +
    '<div class="papp-fit-bars">';
  var weekData = [
    { day:'Mon', val:65, done:true },
    { day:'Tue', val:45, done:true },
    { day:'Wed', val:80, done:true },
    { day:'Thu', val:30, done:true },
    { day:'Fri', val:48, done:true },
    { day:'Sat', val:0, done:false },
    { day:'Sun', val:0, done:false }
  ];
  weekData.forEach(function(d) {
    var pct = Math.min(100, (d.val / 90) * 100);
    h += '<div class="papp-fit-bar-col">' +
      '<div class="papp-fit-bar-track"><div class="papp-fit-bar-fill" style="height:' + pct + '%"></div></div>' +
      '<div class="papp-fit-bar-day">' + d.day + '</div>' +
      '</div>';
  });
  h += '</div></div>';

  // Workout history
  h += '<div class="papp-section" style="padding-top:8px">Recent Workouts</div>';

  var workouts = [
    { type:'Running', dur:'32:15', dist:'5.2 km', cal:'320', time:'Today' },
    { type:'Weight Training', dur:'45:00', dist:'', cal:'280', time:'Yesterday' },
    { type:'Cycling', dur:'1:10:00', dist:'22.5 km', cal:'450', time:'Wednesday' },
    { type:'HIIT', dur:'25:00', dist:'', cal:'310', time:'Tuesday' },
    { type:'Running', dur:'28:40', dist:'4.5 km', cal:'285', time:'Monday' },
    { type:'Yoga', dur:'40:00', dist:'', cal:'150', time:'Sunday' }
  ];

  var fitIcons = {
    Running: '<path d="M5 18l3-3 2 1 3-3 2 1 3-3"/>',
    'Weight Training': '<path d="M4 10h12M6 7v6M14 7v6M3 9v2M17 9v2"/>',
    Cycling: '<circle cx="6" cy="12" r="3.5"/><circle cx="14" cy="12" r="3.5"/><path d="M6 12l4-5h3l1 5"/>',
    HIIT: '<path d="M2 12h3l2-5 2 10 2-5h3l2-3 2 6 2-3h2"/>',
    Yoga: '<circle cx="10" cy="4" r="2"/><path d="M10 6v5M7 8h6M10 11l-3 5M10 11l3 5"/>',
    default: '<path d="M4 16l3-4 3 2 4-5 3 3"/>'
  };

  workouts.forEach(function(w) {
    var icon = fitIcons[w.type] || fitIcons.default;
    h += '<div class="papp-item"><div class="papp-fit-icon"><svg viewBox="0 0 20 20">' + icon + '</svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(w.type) + '</span><span class="papp-item-time">' + w.time + '</span></div>' +
      '<div class="papp-item-sub">' + w.dur + (w.dist ? ' -- ' + w.dist : '') + ' -- ' + w.cal + ' kcal</div></div>' + _svgChevron + '</div>';
  });

  return h;
}

// ========== 33. MEDITATION ==========
function phonePageMeditation(charName) {
  var h = '';

  // Main timer area
  h += '<div class="papp-med-hero">' +
    '<div class="papp-med-circle">' +
      '<svg viewBox="0 0 200 200" style="width:180px;height:180px">' +
        '<circle cx="100" cy="100" r="88" stroke="rgba(255,255,255,.04)" fill="none" stroke-width="1"/>' +
        '<circle cx="100" cy="100" r="78" stroke="rgba(255,255,255,.06)" fill="none" stroke-width="2" stroke-dasharray="4 8" stroke-linecap="round"/>' +
        '<circle cx="100" cy="100" r="65" stroke="rgba(175,130,255,.2)" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="408" stroke-dashoffset="102" transform="rotate(-90 100 100)"/>' +
      '</svg>' +
      '<div class="papp-med-timer">' +
        '<div class="papp-med-time">10:00</div>' +
        '<div class="papp-med-label">Minutes</div>' +
      '</div>' +
    '</div>' +
    '<div class="papp-med-start">Begin Session</div>' +
    '</div>';

  // Quick durations
  h += '<div class="papp-med-durations">';
  ['3 min','5 min','10 min','15 min','20 min','30 min'].forEach(function(d, i) {
    h += '<div class="papp-med-dur' + (i === 2 ? ' papp-med-dur-active' : '') + '">' + d + '</div>';
  });
  h += '</div>';

  // Streak
  h += '<div class="papp-med-streak">' +
    '<div class="papp-med-streak-info">' +
      '<div class="papp-med-streak-val">14</div>' +
      '<div class="papp-med-streak-label">Day Streak</div>' +
    '</div>' +
    '<div class="papp-med-streak-dots">';
  for (var i = 0; i < 7; i++) {
    var filled = i < 5;
    h += '<div class="papp-med-streak-dot' + (filled ? ' papp-med-dot-filled' : '') + '"></div>';
  }
  h += '</div></div>';

  // Sessions
  h += '<div class="papp-section">Sessions</div>';

  var sessions = [
    { name:'Morning Calm', dur:'10 min', cat:'Focus', plays:142 },
    { name:'Deep Breathing', dur:'5 min', cat:'Breathwork', plays:89 },
    { name:'Body Scan', dur:'15 min', cat:'Relaxation', plays:67 },
    { name:'Sleep Wind Down', dur:'20 min', cat:'Sleep', plays:234 },
    { name:'Stress Relief', dur:'10 min', cat:'Anxiety', plays:156 },
    { name:'Gratitude Practice', dur:'8 min', cat:'Mindfulness', plays:78 },
    { name:'Walking Meditation', dur:'12 min', cat:'Movement', plays:45 }
  ];

  sessions.forEach(function(s) {
    h += '<div class="papp-item"><div class="papp-med-session-icon"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/></svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(s.name) + '</span><span class="papp-item-time">' + s.dur + '</span></div>' +
      '<div class="papp-item-sub">' + esc(s.cat) + '</div></div>' + _svgChevron + '</div>';
  });

  // Stats
  h += '<div class="papp-section">This Month</div>';
  h += '<div class="papp-med-month-stats">' +
    '<div class="papp-med-month-stat"><div class="papp-med-month-stat-val">22</div><div class="papp-med-month-stat-label">Sessions</div></div>' +
    '<div class="papp-med-month-stat"><div class="papp-med-month-stat-val">3.5h</div><div class="papp-med-month-stat-label">Total Time</div></div>' +
    '<div class="papp-med-month-stat"><div class="papp-med-month-stat-val">9.5</div><div class="papp-med-month-stat-label">Avg Min</div></div>' +
    '</div>';

  return h;
}

// ==========================================================
//  PHONE APP PAGES — Batch 6: System & Life
// ==========================================================

// ========== 34. SETTINGS ==========
function phonePageSettings(charName) {
  var h = '';

  // Profile card
  h += '<div class="papp-settings-profile">' +
    '<div class="papp-settings-avatar"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg></div>' +
    '<div class="papp-settings-profile-info">' +
      '<div class="papp-settings-profile-name">' + esc(charName) + '</div>' +
      '<div class="papp-settings-profile-sub">Account, iCloud, Media</div>' +
    '</div>' + _svgChevron +
    '</div>';

  h += '<div class="papp-search">' + _svgSearch + '<span>Search</span></div>';

  // Settings groups
  var groups = [
    {
      items: [
        { icon:'<path d="M13 3C9 3 6 6 6 9.7c0 5.4 7 13.3 7 13.3s7-7.9 7-13.3C20 6 17 3 13 3z"/><circle cx="13" cy="10" r="2.5"/>', name:'Airplane Mode', toggle:false },
        { icon:'<path d="M3 7a4 4 0 014-4h12a4 4 0 014 4v0a4 4 0 01-4 4H7a4 4 0 01-4-4zM3 17a4 4 0 014-4h12a4 4 0 014 4v0a4 4 0 01-4 4H7a4 4 0 01-4-4z"/>', name:'Wi-Fi', val:'Home_5G' },
        { icon:'<rect x="3" y="6" width="20" height="14" rx="2"/><path d="M3 11h20"/>', name:'Bluetooth', val:'On' },
        { icon:'<rect x="6" y="2" width="14" height="22" rx="3"/><path d="M10 18h6"/>', name:'Cellular', val:'' }
      ]
    },
    {
      items: [
        { icon:'<circle cx="13" cy="13" r="9"/><path d="M13 7v6l4 3"/>', name:'Notifications', val:'' },
        { icon:'<rect x="6" y="3" width="14" height="20" rx="2"/><path d="M9 8h8M9 12h8M9 16h5"/>', name:'Sounds & Haptics', val:'' },
        { icon:'<circle cx="13" cy="13" r="5"/><path d="M13 4v3M13 19v3M4 13h3M19 13h3"/>', name:'Focus', val:'' },
        { icon:'<path d="M13 7v6l4 3"/><circle cx="13" cy="13" r="9"/>', name:'Screen Time', val:'3h 24m' }
      ]
    },
    {
      items: [
        { icon:'<circle cx="11" cy="7" r="2"/><circle cx="15" cy="13" r="2"/><circle cx="9" cy="19" r="2"/><path d="M4 7h5M13 7h9M4 13h9M17 13h5M4 19h3M11 19h11"/>', name:'General', val:'' },
        { icon:'<rect x="3" y="5" width="20" height="16" rx="2"/><path d="M3 17l5-5 3 3 4-4 5 5"/>', name:'Wallpaper', val:'' },
        { icon:'<circle cx="13" cy="13" r="9"/><path d="M4 13h18"/>', name:'Display & Brightness', val:'' },
        { icon:'<rect x="5" y="9" width="16" height="12" rx="2"/><path d="M9 9V6a1 1 0 011-1h6a1 1 0 011 1v3"/>', name:'Privacy & Security', val:'' }
      ]
    },
    {
      items: [
        { icon:'<rect x="3" y="6" width="20" height="14" rx="2"/><path d="M3 11h20M7 16h4"/>', name:'Battery', val:'85%' },
        { icon:'<path d="M4 7h7l2 2h9v12a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z"/>', name:'Storage', val:'48.2 GB used' }
      ]
    }
  ];

  groups.forEach(function(g) {
    h += '<div class="papp-settings-group">';
    g.items.forEach(function(item, idx) {
      h += '<div class="papp-item' + (idx === g.items.length - 1 ? ' papp-settings-last' : '') + '">' +
        '<div class="papp-settings-icon"><svg viewBox="0 0 26 26">' + item.icon + '</svg></div>' +
        '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(item.name) + '</span>' +
        (item.val ? '<span class="papp-item-time">' + esc(item.val) + '</span>' : '') +
        '</div></div>';
      if (item.toggle !== undefined) {
        h += '<div class="papp-clock-toggle"><div class="papp-clock-toggle-knob"></div></div>';
      } else {
        h += _svgChevron;
      }
      h += '</div>';
    });
    h += '</div>';
  });

  // Software Update
  h += '<div class="papp-settings-group"><div class="papp-item papp-settings-last">' +
    '<div class="papp-settings-icon"><svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="9"/><path d="M13 9v4l3 2"/></svg></div>' +
    '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">Software Update</span>' +
    '<div class="papp-badge" style="min-width:14px;height:14px;font-size:9px;padding:0 4px">1</div></span></div>' +
    '<div class="papp-item-sub">Update available</div></div>' + _svgChevron + '</div></div>';

  return h;
}

// ========== 35. WALLET ==========
function phonePageWallet(charName) {
  var h = '';

  // Balance
  h += '<div class="papp-wallet-balance">' +
    '<div class="papp-wallet-balance-label">Total Balance</div>' +
    '<div class="papp-wallet-balance-val">$4,286.50</div>' +
    '</div>';

  // Cards
  h += '<div class="papp-section" style="padding-top:4px">Cards</div>';
  h += '<div class="papp-wallet-cards">';
  [
    { name:'Visa Debit', last:'4821', color:'rgba(10,132,255,.15)', border:'rgba(10,132,255,.3)' },
    { name:'Mastercard', last:'7390', color:'rgba(255,159,10,.12)', border:'rgba(255,159,10,.3)' },
    { name:'Amex Platinum', last:'1055', color:'rgba(175,130,255,.12)', border:'rgba(175,130,255,.3)' }
  ].forEach(function(c) {
    h += '<div class="papp-wallet-card" style="background:' + c.color + ';border-color:' + c.border + '">' +
      '<div class="papp-wallet-card-top"><span class="papp-wallet-card-name">' + esc(c.name) + '</span><svg viewBox="0 0 20 20" class="papp-wallet-card-chip"><rect x="3" y="6" width="14" height="8" rx="2"/><path d="M3 10h14M8 6v8"/></svg></div>' +
      '<div class="papp-wallet-card-num">**** **** **** ' + c.last + '</div>' +
      '</div>';
  });
  h += '</div>';

  // Quick actions
  h += '<div class="papp-wallet-actions">';
  [
    { icon:'<path d="M12 4v16M4 12h16"/>', label:'Add' },
    { icon:'<path d="M5 12h14M12 5l7 7-7 7"/>', label:'Send' },
    { icon:'<path d="M19 12H5M12 19l-7-7 7-7"/>', label:'Request' },
    { icon:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>', label:'Pay' }
  ].forEach(function(a) {
    h += '<div class="papp-wallet-action"><div class="papp-wallet-action-icon"><svg viewBox="0 0 24 24">' + a.icon + '</svg></div><div class="papp-wallet-action-label">' + a.label + '</div></div>';
  });
  h += '</div>';

  // Transactions
  h += '<div class="papp-section">Recent Transactions</div>';
  [
    { name:'Coffee Shop', amount:'-$4.80', time:'Today, 08:32', cat:'Food' },
    { name:'Salary Deposit', amount:'+$3,200.00', time:'Yesterday', cat:'Income' },
    { name:'Grocery Store', amount:'-$67.45', time:'Yesterday', cat:'Shopping' },
    { name:'Streaming Service', amount:'-$12.99', time:'Monday', cat:'Entertainment' },
    { name:'Electric Bill', amount:'-$85.20', time:'Monday', cat:'Utilities' },
    { name:'Transfer from Savings', amount:'+$500.00', time:'Last week', cat:'Transfer' },
    { name:'Restaurant', amount:'-$42.00', time:'Last week', cat:'Food' },
    { name:'Gym Membership', amount:'-$35.00', time:'Last week', cat:'Health' }
  ].forEach(function(t) {
    var isIncome = t.amount.charAt(0) === '+';
    h += '<div class="papp-item"><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(t.name) + '</span>' +
      '<span class="papp-wallet-amount' + (isIncome ? ' papp-wallet-income' : '') + '">' + t.amount + '</span></div>' +
      '<div class="papp-item-sub">' + t.time + ' -- ' + esc(t.cat) + '</div></div></div>';
  });

  return h;
}

// ========== 36. SHOPPING ==========
function phonePageShopping(charName) {
  var h = '';

  h += '<div class="papp-search">' + _svgSearch + '<span>Search products</span></div>';

  // Categories
  h += '<div class="papp-shop-cats">';
  ['All','Electronics','Clothing','Home','Books','Sports'].forEach(function(c, i) {
    h += '<div class="papp-game-cat' + (i === 0 ? ' papp-game-cat-active' : '') + '">' + c + '</div>';
  });
  h += '</div>';

  // Featured
  h += '<div class="papp-shop-featured">' +
    '<div class="papp-shop-featured-img"><svg viewBox="0 0 32 32"><rect x="4" y="8" width="24" height="16" rx="3"/><path d="M10 14h12M10 18h8"/></svg></div>' +
    '<div class="papp-shop-featured-info">' +
      '<div style="font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;font-weight:600;letter-spacing:.3px">Featured Deal</div>' +
      '<div style="font-size:16px;color:#fff;font-weight:600;margin-top:4px">Wireless Headphones Pro</div>' +
      '<div style="font-size:14px;color:rgba(255,255,255,.5);margin-top:4px">$89.99 <span style="text-decoration:line-through;color:rgba(255,255,255,.2)">$149.99</span></div>' +
    '</div></div>';

  // Product list
  h += '<div class="papp-section" style="padding-top:8px">Recommended</div>';
  [
    { name:'Mechanical Keyboard', price:'$64.99', rating:'4.7', cat:'Electronics' },
    { name:'Running Shoes V3', price:'$129.00', rating:'4.5', cat:'Sports' },
    { name:'Minimalist Backpack', price:'$45.00', rating:'4.8', cat:'Accessories' },
    { name:'Desk Lamp LED', price:'$32.99', rating:'4.3', cat:'Home' },
    { name:'Bluetooth Speaker', price:'$39.99', rating:'4.6', cat:'Electronics' },
    { name:'Cotton T-Shirt Pack', price:'$28.00', rating:'4.4', cat:'Clothing' },
    { name:'Notebook Set (3)', price:'$12.99', rating:'4.9', cat:'Stationery' }
  ].forEach(function(p) {
    h += '<div class="papp-item"><div class="papp-shop-thumb"><svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="M5 12l3-2 2 1 3-2 4 3"/></svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(p.name) + '</span><span style="font-size:14px;color:#fff;font-weight:600;flex-shrink:0">' + p.price + '</span></div>' +
      '<div class="papp-item-sub">' + esc(p.cat) + ' -- ' + p.rating + ' stars</div></div></div>';
  });

  // Cart
  h += '<div class="papp-section">Cart (3 items)</div>';
  [
    { name:'Wireless Headphones Pro', qty:1, price:'$89.99' },
    { name:'USB-C Cable (2m)', qty:2, price:'$15.98' },
    { name:'Phone Case', qty:1, price:'$19.99' }
  ].forEach(function(c) {
    h += '<div class="papp-item"><div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(c.name) + '</span><span class="papp-item-time">' + c.price + '</span></div>' +
      '<div class="papp-item-sub">Qty: ' + c.qty + '</div></div></div>';
  });
  h += '<div style="padding:12px 16px;text-align:right;font-size:15px;color:#fff;font-weight:600;border-top:1px solid rgba(255,255,255,.06)">Total: $125.96</div>';

  return h;
}

// ========== 37. RECIPES ==========
function phonePageRecipes(charName) {
  var h = '';

  h += '<div class="papp-search">' + _svgSearch + '<span>Search recipes</span></div>';

  // Categories
  h += '<div class="papp-shop-cats">';
  ['All','Breakfast','Lunch','Dinner','Dessert','Quick'].forEach(function(c, i) {
    h += '<div class="papp-game-cat' + (i === 0 ? ' papp-game-cat-active' : '') + '">' + c + '</div>';
  });
  h += '</div>';

  // Featured recipe
  h += '<div class="papp-recipe-featured">' +
    '<div class="papp-recipe-featured-img"><svg viewBox="0 0 40 40"><path d="M15 8v24M10 8v8a5 5 0 0010 0V8" stroke="rgba(255,255,255,.1)" fill="none" stroke-width="1.5" stroke-linecap="round"/><path d="M28 8v10l-3 3v11" stroke="rgba(255,255,255,.1)" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg></div>' +
    '<div class="papp-recipe-featured-info">' +
      '<div class="papp-recipe-featured-title">Homemade Ramen Bowl</div>' +
      '<div class="papp-recipe-featured-meta">45 min -- Medium -- 4 servings</div>' +
    '</div></div>';

  // Recipe list
  h += '<div class="papp-section" style="padding-top:4px">My Recipes</div>';
  [
    { name:'Avocado Toast', time:'10 min', diff:'Easy', cat:'Breakfast' },
    { name:'Pasta Carbonara', time:'25 min', diff:'Medium', cat:'Dinner' },
    { name:'Greek Salad', time:'15 min', diff:'Easy', cat:'Lunch' },
    { name:'Chicken Stir-Fry', time:'20 min', diff:'Easy', cat:'Dinner' },
    { name:'Banana Pancakes', time:'15 min', diff:'Easy', cat:'Breakfast' },
    { name:'Tomato Soup', time:'35 min', diff:'Easy', cat:'Lunch' },
    { name:'Chocolate Mousse', time:'30 min', diff:'Medium', cat:'Dessert' },
    { name:'Grilled Salmon', time:'25 min', diff:'Medium', cat:'Dinner' }
  ].forEach(function(r) {
    h += '<div class="papp-item"><div class="papp-recipe-icon"><svg viewBox="0 0 20 20"><path d="M9 3v14M6 3v5a3 3 0 006 0V3"/><path d="M15 3v6l-2 2v7"/></svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">' + esc(r.name) + '</span><span class="papp-item-time">' + r.time + '</span></div>' +
      '<div class="papp-item-sub">' + esc(r.diff) + ' -- ' + esc(r.cat) + '</div></div>' + _svgChevron + '</div>';
  });

  // Meal plan
  h += '<div class="papp-section">This Week\'s Plan</div>';
  ['Mon: Oatmeal / Sandwich / Stir-Fry','Tue: Smoothie / Salad / Pasta','Wed: Toast / Soup / Salmon','Thu: Pancakes / Wrap / Ramen','Fri: Eggs / Rice Bowl / Pizza'].forEach(function(d) {
    h += '<div class="papp-item"><div class="papp-item-content"><div class="papp-item-name" style="font-size:13px;color:rgba(255,255,255,.6)">' + esc(d) + '</div></div></div>';
  });

  return h;
}

// ========== 38. TRAVEL ==========
function phonePageTravel(charName) {
  var h = '';

  // Upcoming trip
  h += '<div class="papp-travel-upcoming">' +
    '<div class="papp-travel-upcoming-header">Upcoming Trip</div>' +
    '<div class="papp-travel-route">' +
      '<div class="papp-travel-city"><div class="papp-travel-code">SFO</div><div class="papp-travel-city-name">San Francisco</div></div>' +
      '<div class="papp-travel-line"><svg viewBox="0 0 60 20" style="width:60px;height:20px"><path d="M5 10h50" stroke="rgba(255,255,255,.15)" fill="none" stroke-width="1" stroke-dasharray="3 3"/><path d="M45 6l8 4-8 4" stroke="rgba(255,255,255,.2)" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<div class="papp-travel-city"><div class="papp-travel-code">NRT</div><div class="papp-travel-city-name">Tokyo</div></div>' +
    '</div>' +
    '<div class="papp-travel-details">' +
      '<div class="papp-travel-detail"><div class="papp-travel-detail-label">Date</div><div class="papp-travel-detail-val">Mar 15, 2024</div></div>' +
      '<div class="papp-travel-detail"><div class="papp-travel-detail-label">Flight</div><div class="papp-travel-detail-val">JL 001</div></div>' +
      '<div class="papp-travel-detail"><div class="papp-travel-detail-label">Depart</div><div class="papp-travel-detail-val">11:30 AM</div></div>' +
    '</div>' +
    '</div>';

  // Boarding pass style
  h += '<div class="papp-travel-pass">' +
    '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Passenger</span><span class="papp-travel-pass-val">' + esc(charName) + '</span></div>' +
    '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Seat</span><span class="papp-travel-pass-val">14A Window</span></div>' +
    '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Gate</span><span class="papp-travel-pass-val">G12</span></div>' +
    '<div class="papp-travel-pass-row"><span class="papp-travel-pass-label">Boarding</span><span class="papp-travel-pass-val">10:45 AM</span></div>' +
    '<div class="papp-travel-pass-barcode"><svg viewBox="0 0 200 30" style="width:100%;height:30px">';
  for (var i = 0; i < 40; i++) {
    var w = (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1;
    var x = i * 5;
    h += '<rect x="' + x + '" y="2" width="' + w + '" height="26" fill="rgba(255,255,255,' + (0.1 + Math.random() * 0.15).toFixed(2) + ')"/>';
  }
  h += '</svg></div></div>';

  // Packing list
  h += '<div class="papp-section">Packing List</div>';
  var svgCheck = '<svg viewBox="0 0 20 20" style="width:18px;height:18px;flex-shrink:0"><circle cx="10" cy="10" r="7" stroke="rgba(255,255,255,.15)" fill="none" stroke-width="1.5"/></svg>';
  var svgChecked = '<svg viewBox="0 0 20 20" style="width:18px;height:18px;flex-shrink:0"><circle cx="10" cy="10" r="7" stroke="rgba(48,209,88,.5)" fill="rgba(48,209,88,.1)" stroke-width="1.5"/><path d="M7 10l2 2 4-4" stroke="rgba(48,209,88,.7)" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  [
    { text:'Passport', done:true },
    { text:'Phone charger', done:true },
    { text:'Headphones', done:true },
    { text:'Travel adapter', done:false },
    { text:'Jacket', done:false },
    { text:'Toiletries', done:true },
    { text:'Camera', done:false },
    { text:'Book for flight', done:true }
  ].forEach(function(p) {
    h += '<div class="papp-remind-item' + (p.done ? ' papp-remind-done' : '') + '">' +
      (p.done ? svgChecked : svgCheck) +
      '<div class="papp-item-content"><div class="papp-remind-text">' + esc(p.text) + '</div></div></div>';
  });

  // Past trips
  h += '<div class="papp-section">Past Trips</div>';
  [
    { dest:'London, UK', dates:'Jan 5-12, 2024', flights:2 },
    { dest:'Paris, France', dates:'Nov 20-25, 2023', flights:2 },
    { dest:'New York, US', dates:'Sep 8-15, 2023', flights:2 }
  ].forEach(function(t) {
    h += '<div class="papp-item"><div class="papp-travel-past-icon"><svg viewBox="0 0 20 20"><rect x="4" y="7" width="12" height="9" rx="2"/><path d="M7 7V5a1 1 0 011-1h4a1 1 0 011 1v2M4 11h12"/></svg></div>' +
      '<div class="papp-item-content"><div class="papp-item-name">' + esc(t.dest) + '</div>' +
      '<div class="papp-item-sub">' + esc(t.dates) + '</div></div>' + _svgChevron + '</div>';
  });

  return h;
}
