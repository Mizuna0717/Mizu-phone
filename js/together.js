// ========== together.js ==========
// Together — Tab switch + upload + playback engine

// ══════════════════════════════════════════════
// Utilities
// ══════════════════════════════════════════════

var _togetherIdCounter = 0;
function _nextTogetherId() {
  return Date.now() + '_' + (_togetherIdCounter++);
}

var _togetherPlaylistImportToken = 0;

function _truncate(str, n) {
  str = String(str || '');
  return str.length > n ? str.slice(0, n) + '...' : str;
}

// ══════════════════════════════════════════════
// Audio engine
// ══════════════════════════════════════════════

var _tgAudio = null;          // single HTMLAudioElement
var _tgCurrentIndex = 0;      // index into state.together.songs
var _tgIsPlaying = false;
var _tgLrcLines  = [];        // [{ time: seconds, text: string }]
var _tgProgressDragging = false;

function _getTgAudio() {
  if (!_tgAudio) {
    _tgAudio = new Audio();
    _tgAudio.preload = 'auto';
    _tgAudio.addEventListener('timeupdate', _onTgTimeUpdate);
    _tgAudio.addEventListener('ended',      _onTgEnded);
    _tgAudio.addEventListener('play',  function() { _tgIsPlaying = true;  _updatePlayBtn(); });
    _tgAudio.addEventListener('pause', function() { _tgIsPlaying = false; _updatePlayBtn(); });
    _tgAudio.addEventListener('error', function() {
      _setStatus('songPlayStatus', 'Audio not available', true);
    });
  }
  return _tgAudio;
}

function _onTgTimeUpdate() {
  if (_tgProgressDragging) return;
  var audio = _tgAudio;
  if (!audio || !audio.duration) return;
  var pct = audio.currentTime / audio.duration;
  _updateProgressUI(pct, audio.currentTime, audio.duration);
  _syncLyrics(audio.currentTime);
}

function _onTgEnded() {
  _tgIsPlaying = false;
  _updatePlayBtn();
  tgPlayNext();
}

// Load song at index; autoPlay=true starts playback immediately
function _tgLoadSong(index, autoPlay) {
  _ensureTogetherState();
  var songs = state.together.songs || [];
  if (!songs.length) return;
  index = ((index % songs.length) + songs.length) % songs.length;
  _tgCurrentIndex = index;
  state.together.currentIndex = index;

  var song  = songs[index];
  var audio = _getTgAudio();

  _updateProgressUI(0, 0, 0);
  _tgLastLrcIdx = -1;

  // Cover
  var coverEl = document.querySelector('#togetherListen .tg-album-cover');
  if (coverEl) {
    coverEl.innerHTML = song.cover
      ? '<img src="' + song.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
      : '<svg viewBox="0 0 80 80" class="tg-album-icon"><circle cx="40" cy="40" r="28"/><circle cx="40" cy="40" r="8"/><path d="M40 12v8M40 60v8M12 40h8M60 40h8"/></svg>';
  }

  // Title / artist
  var titleEl  = document.querySelector('#togetherListen .tg-song-title');
  var artistEl = document.querySelector('#togetherListen .tg-song-artist');
  if (titleEl)  titleEl.textContent  = song.title  || 'Unknown';
  if (artistEl) artistEl.textContent = song.artist || 'Unknown';

  // Lyrics
  _tgLrcLines = _parseLrcToLines(song.lyrics || '');
  _renderLyricsStatic(_tgLrcLines, song.lyrics);

  // Up Next (all tracks, current highlighted)
  _renderUpNext(index);

  // Audio
  _hide('songPlayStatus');
  if (song.audioUrl) {
    audio.src = song.audioUrl;
    audio.load();
    if (autoPlay) {
      var p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function(e) {
          console.warn('[Together] play() blocked:', e.message);
          _setStatus('songPlayStatus', 'Playback blocked. Tap play to start.', true);
        });
      }
    }
  } else {
    audio.src = '';
    _setStatus('songPlayStatus', 'Audio not available', true);
  }
}

// ── Public playback controls ─────────────────
function tgTogglePlay() {
  _ensureTogetherState();
  var songs = state.together.songs || [];
  if (!songs.length) return;
  var audio = _getTgAudio();
  if (!audio.src || audio.src === window.location.href) {
    _tgLoadSong(_tgCurrentIndex, true);
    return;
  }
  if (_tgIsPlaying) {
    audio.pause();
  } else {
    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function(e) { console.warn('[Together] play():', e.message); });
    }
  }
}

function tgPlayPrev() {
  _ensureTogetherState();
  if (!(state.together.songs || []).length) return;
  _tgLoadSong(_tgCurrentIndex - 1, true);
}

function tgPlayNext() {
  _ensureTogetherState();
  if (!(state.together.songs || []).length) return;
  _tgLoadSong(_tgCurrentIndex + 1, true);
}

function tgPlayAt(index) {
  _tgLoadSong(index, true);
}

// ── Progress bar ─────────────────────────────
function _fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function _updateProgressUI(pct, current, duration) {
  var fill  = document.querySelector('#togetherListen .tg-progress-fill');
  var thumb = document.querySelector('#togetherListen .tg-progress-thumb');
  var times = document.querySelectorAll('#togetherListen .tg-progress-time span');
  var p = Math.max(0, Math.min(1, pct || 0));
  if (fill)     fill.style.width  = (p * 100) + '%';
  if (thumb)    thumb.style.left  = (p * 100) + '%';
  if (times[0]) times[0].textContent = _fmtTime(current);
  if (times[1]) times[1].textContent = _fmtTime(duration);
}

function tgSeek(event) {
  var audio = _getTgAudio();
  if (!audio.duration) return;
  var track = document.querySelector('#togetherListen .tg-progress-track');
  if (!track) return;
  var rect = track.getBoundingClientRect();
  var x    = event.touches ? event.touches[0].clientX : event.clientX;
  var pct  = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  _updateProgressUI(pct, audio.currentTime, audio.duration);
}

// ── Play button icon ─────────────────────────
function _updatePlayBtn() {
  var btn = document.querySelector('#togetherListen .tg-ctrl-play');
  if (!btn) return;
  if (_tgIsPlaying) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round"><path d="M8 5v14l11-7z"/></svg>';
  }
}

// ══════════════════════════════════════════════
// LRC lyrics parsing + rendering
// ══════════════════════════════════════════════

// Parse LRC text into [{time, text}] sorted by time.
function _parseLrcToLines(lrc) {
  if (!lrc) return [];
  var results = [];
  var RE      = /\[(\d+):(\d+)\.(\d+)\]/g;
  lrc.split('\n').forEach(function(line) {
    var text = line.replace(/\[\d+:\d+[.:]\d+\]/g, '').replace(/\[.*?\]/g, '').trim();
    if (!text) return;
    RE.lastIndex = 0;
    var match;
    while ((match = RE.exec(line)) !== null) {
      var sec = parseInt(match[1], 10) * 60 + parseInt(match[2], 10) + parseInt(match[3], 10) / 100;
      results.push({ time: sec, text: text });
    }
  });
  results.sort(function(a, b) { return a.time - b.time; });
  return results;
}

function _renderLyricsStatic(lines, rawLyrics) {
  var card = document.querySelector('#togetherListen .tg-lyrics-card');
  if (!card) return;
  if (!lines.length) {
    if (rawLyrics && rawLyrics.trim()) {
      var plainLines = rawLyrics.split('\n').filter(function(l) { return l.trim(); }).slice(0, 10);
      card.innerHTML = plainLines.map(function(l, i) {
        return '<div class="tg-lyric-line' + (i === 0 ? ' active' : '') + '">' +
          '<span class="tg-lyric-text">' + _escHtml(_truncate(l, 60)) + '</span></div>';
      }).join('');
    } else {
      card.innerHTML = '<div class="tg-lyric-line"><span class="tg-lyric-text tg-lyric-empty">No lyrics available</span></div>';
    }
    return;
  }
  card.innerHTML = lines.map(function(l, i) {
    return '<div class="tg-lyric-line" data-lrc-idx="' + i + '">' +
      '<span class="tg-lyric-text">' + _escHtml(_truncate(l.text, 60)) + '</span></div>';
  }).join('');
}

var _tgLastLrcIdx = -1;

function _syncLyrics(currentTime) {
  var lines = _tgLrcLines;
  if (!lines.length) return;
  var idx = 0;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime) idx = i; else break;
  }
  if (idx === _tgLastLrcIdx) return;
  _tgLastLrcIdx = idx;
  var card = document.querySelector('#togetherListen .tg-lyrics-card');
  if (!card) return;
  var allLines = card.querySelectorAll('.tg-lyric-line');
  allLines.forEach(function(el, i) { el.classList.toggle('active', i === idx); });
  if (allLines[idx]) allLines[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ══════════════════════════════════════════════
// Up Next rendering (all tracks, current highlighted)
// ══════════════════════════════════════════════

function _renderUpNext(currentIdx) {
  _ensureTogetherState();
  var songs    = (state.together && state.together.songs) || [];
  var playlist = document.querySelector('#togetherListen .tg-playlist');
  if (!playlist) return;

  if (!songs.length) {
    playlist.innerHTML = '';
    return;
  }
  if (songs.length === 1 && currentIdx === 0) {
    playlist.innerHTML = '<div style="padding:12px 0;font-size:12px;color:#a0a0a5;text-align:center;">No other tracks</div>';
    return;
  }

  playlist.innerHTML = songs.map(function(s, i) {
    var isCurrent = (i === currentIdx);
    var coverHtml = s.cover
      ? '<img src="' + s.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">'
      : '';
    return '<div class="tg-playlist-item' + (isCurrent ? ' tg-pl-active' : '') + '" onclick="tgPlayAt(' + i + ')" style="cursor:pointer;">' +
      '<div class="tg-pl-cover">' + coverHtml + '</div>' +
      '<div class="tg-pl-info">' +
        '<div class="tg-pl-title">'  + _escHtml(s.title)  + '</div>' +
        '<div class="tg-pl-artist">' + _escHtml(s.artist) + '</div>' +
      '</div>' +
      (isCurrent
        ? '<span class="tg-pl-now">Now Playing</span>'
        : '<span class="tg-pl-dur">&#9654;</span>') +
      '</div>';
  }).join('');
}

// ══════════════════════════════════════════════
// Tab switching
// ══════════════════════════════════════════════

function switchTogetherTab(tab) {
  var paneMap  = { listen: 'togetherListen', watch: 'togetherWatch', read: 'togetherRead' };
  var tabMap   = { listen: 'tabListen',      watch: 'tabWatch',      read: 'tabRead'      };
  var titleMap = { listen: 'together.listen',watch: 'together.watch',read: 'together.read' };
  var labelMap = { 'together.listen': 'Listen Together', 'together.watch': 'Watch Together', 'together.read': 'Read Together' };

  document.querySelectorAll('.together-pane').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.together-tab').forEach(function(el)  { el.classList.remove('active'); });

  var pane = document.getElementById(paneMap[tab]);
  var btn  = document.getElementById(tabMap[tab]);
  if (pane) pane.classList.add('active');
  if (btn)  btn.classList.add('active');

  var headerEl = document.getElementById('togetherHeaderTitle');
  if (headerEl) {
    var key = titleMap[tab];
    if (typeof t === 'function')      headerEl.textContent = t(key) || labelMap[key];
    else if (typeof T === 'function') headerEl.textContent = T(key) || labelMap[key];
    else                              headerEl.textContent = labelMap[key] || key;
  }
  console.log('[Together] Tab ->', tab);
}

function openTogether() {
  nav('screen-together');
  switchTogetherTab('listen');
}

function initTogether() {
  _ensureTogetherState();
  _tgCurrentIndex = state.together.currentIndex || 0;
  switchTogetherTab('listen');
  _renderAllTogetherContent();
  // Load saved track without auto-playing
  if (state.together.songs && state.together.songs.length) {
    _tgLoadSong(_tgCurrentIndex, false);
  }
  // Wire progress track tap-to-seek
  var track = document.querySelector('#togetherListen .tg-progress-track');
  if (track && !track._tgSeekBound) {
    track.addEventListener('click', tgSeek);
    track._tgSeekBound = true;
  }
  console.log('[Together] Initialized');
}

// ══════════════════════════════════════════════
// State helpers
// ══════════════════════════════════════════════
function _ensureTogetherState() {
  if (typeof state === 'undefined') return;
  if (!state.together) state.together = { songs: [], videos: [], novels: [], currentIndex: 0 };
  if (!state.together.songs)  state.together.songs  = [];
  if (!state.together.videos) state.together.videos = [];
  if (!state.together.novels) state.together.novels = [];
  if (state.together.currentIndex == null) state.together.currentIndex = 0;
}

// ══════════════════════════════════════════════
// + 按钮菜单
// ══════════════════════════════════════════════
function openTogetherAddMenu() {
  var overlay = document.getElementById('togetherAddOverlay');
  var menu    = document.getElementById('togetherAddMenu');
  if (!overlay || !menu) return;
  overlay.classList.add('active');
  menu.classList.add('active');
}

function closeTogetherAddMenu() {
  var overlay = document.getElementById('togetherAddOverlay');
  var menu    = document.getElementById('togetherAddMenu');
  if (overlay) overlay.classList.remove('active');
  if (menu)    menu.classList.remove('active');
}

// ══════════════════════════════════════════════
// 弹窗开关
// ══════════════════════════════════════════════
var _togetherModalState = { song: {}, video: {}, novel: {} };

function openTogetherModal(type) {
  closeTogetherAddMenu();
  // 【问题8】打开 song 弹窗时递增 token，使旧的定时器失效
  if (type === 'song') {
    _togetherPlaylistImportToken++;
  }
  var overlay = document.getElementById('modalOverlay' + _cap(type));
  var modal   = document.getElementById('modal'       + _cap(type));
  if (overlay) overlay.classList.add('active');
  if (modal)   modal.classList.add('active');
  _resetModal(type);
}

function closeTogetherModal(type) {
  var overlay = document.getElementById('modalOverlay' + _cap(type));
  var modal   = document.getElementById('modal'       + _cap(type));
  if (overlay) overlay.classList.remove('active');
  if (modal)   modal.classList.remove('active');
}

function _cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function _resetModal(type) {
  _togetherModalState[type] = {};
  if (type === 'song') {
    _setVal('songTitleInput', '');
    _setVal('artistNameInput', '');
    _setVal('coverUrlInput', '');
    _setText('coverLocalLabel', 'Tap to select image');
    _setText('lyricsFileLabel', 'txt / doc / docx');
    _setText('audioFileLabel',  'mp3');
    var cfi = document.getElementById('coverFileInput');
    var lfi = document.getElementById('lyricsFileInput');
    var afi = document.getElementById('audioFileInput');
    if (cfi) cfi.value = '';
    if (lfi) lfi.value = '';
    if (afi) afi.value = '';
    _hide('coverPreviewWrap');
    _hide('songUploadStatus');
    switchCoverTab('local');
    _setVal('playlistUrlInput', '');
    _hide('playlistImportStatus');
    var parseBtn = document.getElementById('parsePlaylistBtn');
    if (parseBtn) { parseBtn.textContent = 'Parse'; parseBtn.disabled = false; }
  } else if (type === 'video') {
    _setVal('biliUrlInput', '');
    var vfi = document.getElementById('videoFileInput');
    if (vfi) vfi.value = '';
    _setText('videoFileLabel', 'mp4 / mov / avi');
    _hide('biliResult');
    _hide('videoUploadStatus');
    switchVideoTab('bili');
  } else if (type === 'novel') {
    var nfi = document.getElementById('novelFileInput');
    if (nfi) nfi.value = '';
    _setText('novelFileLabel', 'txt / pdf / doc / docx');
    _hide('novelUploadStatus');
  }
}

function _t(key, fallback) {
  if (typeof t === 'function') return t(key) || fallback;
  if (typeof T === 'function') return T(key) || fallback;
  return fallback;
}
function _setVal(id, v)  { var el = document.getElementById(id); if (el) el.value = v; }
function _setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
function _show(id)  { var el = document.getElementById(id); if (el) el.style.display = ''; }
function _hide(id)  { var el = document.getElementById(id); if (el) el.style.display = 'none'; }
function _setStatus(id, msg, isErr) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'tg-upload-status' + (isErr ? ' tg-status-error' : ' tg-status-ok');
  el.style.display = msg ? '' : 'none';
}

// ══════════════════════════════════════════════
// 封面 Tab
// ══════════════════════════════════════════════
function switchCoverTab(tab) {
  document.getElementById('coverTabLocal').classList.toggle('active', tab === 'local');
  document.getElementById('coverTabUrl').classList.toggle('active', tab === 'url');
  document.getElementById('coverLocalPane').style.display = tab === 'local' ? '' : 'none';
  document.getElementById('coverUrlPane').style.display   = tab === 'url'   ? '' : 'none';
  _togetherModalState.song._coverTab = tab;
}

function handleCoverFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    _togetherModalState.song.coverDataUrl = e.target.result;
    _setText('coverLocalLabel', file.name);
    var img = document.getElementById('coverPreviewImg');
    img.src = e.target.result;
    _show('coverPreviewWrap');
  };
  reader.readAsDataURL(file);
}

function clearCoverPreview() {
  _togetherModalState.song.coverDataUrl = null;
  var cfi = document.getElementById('coverFileInput');
  if (cfi) cfi.value = '';
  _setText('coverLocalLabel', 'Tap to select image');
  _hide('coverPreviewWrap');
}

// ══════════════════════════════════════════════
// Lyrics file handler
// ══════════════════════════════════════════════
function handleLyricsFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('lyricsFileLabel', file.name);
  _setStatus('songUploadStatus', 'Parsing...', false);
  var name = file.name.toLowerCase();
  if (name.endsWith('.txt')) {
    var reader = new FileReader();
    reader.onload = function(e) {
      _togetherModalState.song.lyrics = e.target.result;
      _setStatus('songUploadStatus', 'Lyrics loaded', false);
    };
    reader.onerror = function() { _setStatus('songUploadStatus', 'Parse failed', true); };
    reader.readAsText(file, 'utf-8');
  } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
    var reader2 = new FileReader();
    reader2.onload = function() {
      _togetherModalState.song.lyrics = '[' + file.name + ']';
      _setStatus('songUploadStatus', 'Lyrics loaded', false);
    };
    reader2.readAsArrayBuffer(file);
  } else {
    _setStatus('songUploadStatus', 'Unsupported format', true);
  }
}

// ══════════════════════════════════════════════
// Audio file handler
// ══════════════════════════════════════════════
function handleAudioFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('audioFileLabel', file.name);
  _setStatus('songUploadStatus', 'Loading...', false);
  var reader = new FileReader();
  reader.onload = function(e) {
    _togetherModalState.song.audioDataUrl = e.target.result;
    _togetherModalState.song.audioName    = file.name;
    _setStatus('songUploadStatus', 'Audio loaded', false);
  };
  reader.onerror = function() { _setStatus('songUploadStatus', 'Load failed', true); };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
// Submit song
// ══════════════════════════════════════════════
function submitSong() {
  var title  = (document.getElementById('songTitleInput').value  || '').trim();
  var artist = (document.getElementById('artistNameInput').value || '').trim();
  var ms      = _togetherModalState.song;
  var coverTab = ms._coverTab || 'local';
  var cover    = coverTab === 'local'
    ? (ms.coverDataUrl || '')
    : ((document.getElementById('coverUrlInput').value || '').trim());

  if (!title)  { _setStatus('songUploadStatus', 'Please enter a song title',   true); return; }
  if (!artist) { _setStatus('songUploadStatus', 'Please enter an artist name', true); return; }

  var song = {
    id:        _nextTogetherId(),
    title:     title,
    artist:    artist,
    cover:     cover,
    lyrics:    ms.lyrics       || '',
    audioUrl:  ms.audioDataUrl || '',
    audioName: ms.audioName    || ''
  };

  _ensureTogetherState();
  state.together.songs.unshift(song);
  _tgCurrentIndex = 0;
  state.together.currentIndex = 0;
  if (typeof saveState === 'function') saveState();

  closeTogetherModal('song');
  switchTogetherTab('listen');
  _tgLoadSong(0, false);
  console.log('[Together] Song added:', title);
}

// ══════════════════════════════════════════════
// 视频 Tab
// ══════════════════════════════════════════════
function switchVideoTab(tab) {
  document.getElementById('videoTabBili').classList.toggle('active',  tab === 'bili');
  document.getElementById('videoTabLocal').classList.toggle('active', tab === 'local');
  document.getElementById('videoBiliPane').style.display  = tab === 'bili'  ? '' : 'none';
  document.getElementById('videoLocalPane').style.display = tab === 'local' ? '' : 'none';
  _togetherModalState.video._videoTab = tab;
}

// ══════════════════════════════════════════════
// Bilibili URL parser
// ══════════════════════════════════════════════
function parseBiliUrl() {
  var raw = (document.getElementById('biliUrlInput').value || '').trim();
  if (!raw) { _setStatus('videoUploadStatus', 'Please enter a Bilibili URL', true); return; }
  if (/b23\.tv\//i.test(raw)) {
    _setStatus('videoUploadStatus', 'Short b23.tv links are not supported. Please use the full Bilibili URL.', true);
    return;
  }
  _setStatus('videoUploadStatus', 'Parsing...', false);
  var bvMatch = raw.match(/BV[0-9A-Za-z]{10}/);
  var avMatch = raw.match(/av(\d+)/i);
  var epMatch = raw.match(/ep(\d+)/i);
  var ssMatch = raw.match(/ss(\d+)/i);
  var vid = '';
  if (bvMatch)      vid = bvMatch[0];
  else if (avMatch) vid = 'av' + avMatch[1];
  else if (epMatch) vid = 'ep' + epMatch[1];
  else if (ssMatch) vid = 'ss' + ssMatch[1];
  else { _setStatus('videoUploadStatus', 'Could not identify Bilibili video ID. Please check the link.', true); return; }
  _togetherModalState.video.biliVid = vid;
  _togetherModalState.video.biliUrl = raw;
  _togetherModalState.video.title   = vid;
  _togetherModalState.video.source  = 'bili';
  var titleEl = document.getElementById('biliTitle');
  var metaEl  = document.getElementById('biliMeta');
  if (titleEl) titleEl.textContent = vid;
  if (metaEl)  metaEl.textContent  = 'bilibili.com';
  _show('biliResult');
  _setStatus('videoUploadStatus', 'Link parsed', false);
}

// ══════════════════════════════════════════════
// 本地视频文件
// ══════════════════════════════════════════════
var _VIDEO_SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB

function handleVideoFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  if (file.size > _VIDEO_SIZE_LIMIT) {
    _setStatus('videoUploadStatus', 'File too large. Please select a file under 50MB.', true);
    input.value = '';
    return;
  }
  _setText('videoFileLabel', file.name);
  _setStatus('videoUploadStatus', 'Loading...', false);
  var reader = new FileReader();
  reader.onload = function(e) {
    _togetherModalState.video.localDataUrl = e.target.result;
    _togetherModalState.video.localName    = file.name;
    _togetherModalState.video.title        = file.name.replace(/\.[^.]+$/, '');
    _togetherModalState.video.source       = 'local';
    _setStatus('videoUploadStatus', 'Video loaded', false);
  };
  reader.onerror = function() { _setStatus('videoUploadStatus', 'Load failed', true); };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
// Submit video
// ══════════════════════════════════════════════
function submitVideo() {
  var mv  = _togetherModalState.video;
  var tab = mv._videoTab || 'bili';
  if (tab === 'bili') {
    if (!mv.biliVid) { _setStatus('videoUploadStatus', 'Please parse a Bilibili link first', true); return; }
  } else {
    if (!mv.localDataUrl) { _setStatus('videoUploadStatus', 'Please select a video file', true); return; }
  }
  var video = {
    id:        _nextTogetherId(),
    title:     mv.title || mv.biliVid || mv.localName || 'Video',
    source:    mv.source || tab,
    biliUrl:   mv.biliUrl     || '',
    biliVid:   mv.biliVid     || '',
    localUrl:  mv.localDataUrl || '',
    localName: mv.localName    || ''
  };
  _ensureTogetherState();
  state.together.videos.unshift(video);
  if (typeof saveState === 'function') saveState();
  closeTogetherModal('video');
  switchTogetherTab('watch');
  _renderWatchContent();
  console.log('[Together] Video added:', video.title);
}

// ══════════════════════════════════════════════
// Novel file handler
// ══════════════════════════════════════════════
function handleNovelFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('novelFileLabel', file.name);
  _setStatus('novelUploadStatus', 'Parsing...', false);
  var name = file.name.toLowerCase();
  _togetherModalState.novel.fileName = file.name;
  _togetherModalState.novel.title    = file.name.replace(/\.[^.]+$/, '');
  if (name.endsWith('.txt')) {
    var reader = new FileReader();
    reader.onload = function(e) {
      _togetherModalState.novel.content = e.target.result;
      _setStatus('novelUploadStatus', 'File loaded', false);
    };
    reader.onerror = function() { _setStatus('novelUploadStatus', 'Parse failed', true); };
    reader.readAsText(file, 'utf-8');
  } else if (name.endsWith('.pdf')) {
    _togetherModalState.novel.content = '[PDF: ' + file.name + ']';
    _setStatus('novelUploadStatus', 'File loaded', false);
  } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
    var reader2 = new FileReader();
    reader2.onload = function() {
      _togetherModalState.novel.content = '[' + file.name + ']';
      _setStatus('novelUploadStatus', 'File loaded', false);
    };
    reader2.readAsArrayBuffer(file);
  } else {
    _setStatus('novelUploadStatus', 'Unsupported format', true);
  }
}

// ══════════════════════════════════════════════
// Submit novel
// ══════════════════════════════════════════════
function submitNovel() {
  var mn = _togetherModalState.novel;
  if (!mn.fileName) { _setStatus('novelUploadStatus', 'Please select a novel file', true); return; }
  var novel = {
    id:       _nextTogetherId(),
    title:    mn.title    || mn.fileName,
    content:  mn.content  || '',
    fileName: mn.fileName || ''
  };
  _ensureTogetherState();
  state.together.novels.unshift(novel);
  if (typeof saveState === 'function') saveState();
  closeTogetherModal('novel');
  switchTogetherTab('read');
  _renderReadContent();
  console.log('[Together] Novel added:', novel.title);
}

// ══════════════════════════════════════════════
// Content renderers
// ══════════════════════════════════════════════
function _renderAllTogetherContent() {
  _ensureTogetherState();
  _renderListenContent();
  _renderWatchContent();
  _renderReadContent();
}

function _renderListenContent() {
  _ensureTogetherState();
  var songs = (state.together && state.together.songs) || [];
  var idx   = _tgCurrentIndex;

  if (songs.length) {
    var song = songs[Math.min(idx, songs.length - 1)];
    var coverEl = document.querySelector('#togetherListen .tg-album-cover');
    if (coverEl && song.cover) {
      coverEl.innerHTML = '<img src="' + song.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    }
    var titleEl  = document.querySelector('#togetherListen .tg-song-title');
    var artistEl = document.querySelector('#togetherListen .tg-song-artist');
    if (titleEl)  titleEl.textContent  = song.title  || 'Unknown';
    if (artistEl) artistEl.textContent = song.artist || 'Unknown';

    var lyricsCard = document.querySelector('#togetherListen .tg-lyrics-card');
    if (lyricsCard) {
      var lrcLines = _parseLrcToLines(song.lyrics || '');
      _renderLyricsStatic(lrcLines, song.lyrics);
    }
  }

  _renderUpNext(idx);
}

function _renderWatchContent() {
  _ensureTogetherState();
  var videos = (state.together && state.together.videos) || [];

  if (videos.length) {
    var latest = videos[0];

    var titleEl = document.querySelector('#togetherWatch .tg-vi-title');
    if (titleEl) titleEl.textContent = latest.title;

    var screen = document.querySelector('#togetherWatch .tg-video-screen');
    if (screen) {
      if (latest.source === 'local' && latest.localUrl) {
        screen.innerHTML =
          '<video src="' + latest.localUrl + '" controls style="width:100%;height:100%;object-fit:cover;"></video>';
      } else if (latest.source === 'bili' && latest.biliVid) {
        // 【问题4b】bvid 本身只含安全字符，直接拼接；补上 &page=1
        var embedSrc = 'https://player.bilibili.com/player.html?bvid=' +
          latest.biliVid + '&page=1&autoplay=0';
        screen.innerHTML =
          '<iframe src="' + embedSrc + '" width="100%" height="100%" frameborder="0"' +
          ' allowfullscreen scrolling="no"></iframe>';
      } else {
        screen.innerHTML = '<div class="tg-video-bili-label">' + _escHtml(latest.title) + '</div>';
      }
    }
  }

  // 【问题2】无论有几个视频都处理列表容器；无内容时清空
  var list = document.querySelector('#togetherWatch .tg-video-list');
  if (list) {
    var rest = videos.length > 1 ? videos.slice(1) : [];
    list.innerHTML = rest.map(function(v) {
      return '<div class="tg-vl-item">' +
        '<div class="tg-vl-thumb">' +
          '<svg viewBox="0 0 32 32" class="tg-vl-play"><path d="M12 8l12 8-12 8z"/></svg>' +
          '<span class="tg-vl-badge">' + _escHtml(v.source === 'bili' ? 'Bili' : 'Local') + '</span>' +
        '</div>' +
        '<div class="tg-vl-info">' +
          '<div class="tg-vl-title">' + _escHtml(v.title) + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }
}

function _renderReadContent() {
  _ensureTogetherState();
  var novels = (state.together && state.together.novels) || [];

  if (novels.length) {
    var latest = novels[0];

    // 【问题1】以 .tg-book-meta 为稳定容器，直接写 innerHTML，不 replaceWith
    var metaEl = document.querySelector('#togetherRead .tg-book-meta');
    if (metaEl) {
      metaEl.innerHTML =
        '<span style="font-size:15px;font-weight:600;color:#1d1d1f;">' +
        _escHtml(latest.title) + '</span>';
    }

    if (latest.content) {
      var pageCard = document.querySelector('#togetherRead .tg-page-card');
      if (pageCard) {
        var chapterTitle = pageCard.querySelector('.tg-chapter-title');
        if (chapterTitle) {
          chapterTitle.innerHTML = '<span style="font-size:14px;font-weight:600;color:#3a3a3c;">' +
            _escHtml(latest.title) + '</span>';
        }
        var paragraphs = pageCard.querySelectorAll('.tg-paragraph');
        var textChunks = _splitNovelContent(latest.content);
        paragraphs.forEach(function(p, i) {
          p.innerHTML = textChunks[i] !== undefined
            ? '<span style="font-size:14px;line-height:1.9;color:#3a3a3c;">' +
              _escHtml(textChunks[i]) + '</span>'
            : '';
        });
      }
    }
  }

  // 【问题2、11】TOC 每次都全量重新生成，幂等，无内容时清空
  var toc = document.querySelector('#togetherRead .tg-toc');
  if (toc) {
    toc.innerHTML = novels.map(function(n, i) {
      var isActive = i === 0;
      return '<div class="tg-toc-item' + (isActive ? ' active' : '') + '">' +
        '<span class="tg-toc-num">' + (i + 1) + '</span>' +
        '<span style="font-size:12px;color:' + (isActive ? '#3a3a3c' : '#8e8e93') + ';">' +
          _escHtml(n.title) + '</span>' +
        (isActive ? '<span class="tg-toc-current">Reading</span>' : '') +
        '</div>';
    }).join('');
  }
}

function _splitNovelContent(text) {
  var clean  = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  var paras  = clean.split(/\n\s*\n/).filter(function(p) { return p.trim(); });
  if (paras.length >= 3) return paras.slice(0, 3);
  var sentences = clean.split(/[。！？.!?\n]+/).filter(function(s) { return s.trim().length > 10; });
  if (sentences.length >= 3) {
    var chunk = Math.floor(sentences.length / 3);
    return [
      sentences.slice(0, chunk).join('。'),
      sentences.slice(chunk, chunk * 2).join('。'),
      sentences.slice(chunk * 2).join('。')
    ];
  }
  return [clean.slice(0, 200), clean.slice(200, 400), clean.slice(400, 600)];
}

function _escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════════
// 歌单导入 — Playlist Import
// API base: https://together-music-zeta.vercel.app
// ══════════════════════════════════════════════
var _MUSIC_API_BASE = 'https://together-music-zeta.vercel.app';

/**
 * Extract platform and playlist ID from a raw input string.
 * Supports:
 *   NetEase long:  https://music.163.com/#/playlist?id=123
 *                  https://music.163.com/playlist?id=123
 *   NetEase short: https://163cn.tv/xxxxxx  (resolved via API)
 *   Pure numeric:  123456  (treated as NetEase by default)
 *   QQ long:       https://y.qq.com/n/ryqq/playlist/12345
 *   QQ short:      https://c.y.qq.com/...  (reserved)
 * @returns {{ platform: 'netease'|'qq'|null, id: string|null, isShort: boolean }}
 */
function _extractPlaylistInfo(raw) {
  raw = (raw || '').trim();
  if (!raw) return { platform: null, id: null, isShort: false };

  // NetEase long
  var neMatch = raw.match(/music\.163\.com\/(?:#\/)?playlist[?&]id=(\d+)/);
  if (neMatch) return { platform: 'netease', id: neMatch[1], isShort: false };

  // NetEase short
  if (/163cn\.tv\/[A-Za-z0-9]+/i.test(raw)) {
    return { platform: 'netease', id: null, isShort: true, shortUrl: raw.match(/163cn\.tv\/[A-Za-z0-9]+/i)[0] };
  }

  // QQ Music long: y.qq.com/n/ryqq/playlist/12345  or  /playlist/12345.html
  var qqMatch = raw.match(/y\.qq\.com\/.*?playlist[/\\](\d+)/);
  if (qqMatch) return { platform: 'qq', id: qqMatch[1], isShort: false };

  // QQ short / content domain — reserved, mark as qq short
  if (/c\.y\.qq\.com|qmusic\.cn/i.test(raw)) {
    return { platform: 'qq', id: null, isShort: true, shortUrl: raw };
  }

  // Pure numeric — assume NetEase
  if (/^\d{5,}$/.test(raw)) {
    return { platform: 'netease', id: raw, isShort: false };
  }

  return { platform: null, id: null, isShort: false };
}

/**
 * 【问题6】Resolve a NetEase short link via the /url/shorten API endpoint.
 * 浏览器环境下受 CORS 限制，不能直接 fetch 163cn.tv，
 * 所以只走后端 API 路径；不再做直连 HEAD 兜底。
 */
async function _resolveNeteaseShortUrl(shortUrlFragment) {
  var full = shortUrlFragment.startsWith('http') ? shortUrlFragment : 'https://' + shortUrlFragment;
  try {
    var resp = await fetch(_MUSIC_API_BASE + '/url/shorten?url=' + encodeURIComponent(full));
    if (resp.ok) {
      var data = await resp.json();
      var realUrl = (data && data.data && data.data.url) || (data && data.url) || '';
      if (realUrl) {
        var info = _extractPlaylistInfo(realUrl);
        if (info.id) return info.id;
      }
    }
  } catch (e) {
    console.warn('[Together] Short URL API failed:', e.message);
    // 浏览器下无法直连 163cn.tv（CORS），不做直连兜底
  }
  return null;
}

// _parseLrc: strip LRC timestamps to plain text (used in lyric fetch)
function _parseLrc(lrcText) {
  if (!lrcText) return '';
  return lrcText
    .split('\n')
    .map(function(line) { return line.replace(/\[\d+:\d+[.:]\d+\]/g, '').replace(/\[.*?\]/g, '').trim(); })
    .filter(function(line) { return line.length > 0; })
    .join('\n');
}

/**
 * Fetch playlist detail from NetEase API and return array of track objects.
 * Each track: { id, name, artist, cover }
 */
async function _fetchNeteasePlaylist(playlistId) {
  var url = _MUSIC_API_BASE + '/playlist/detail?id=' + encodeURIComponent(playlistId);
  var resp = await fetch(url);
  if (!resp.ok) throw new Error('Playlist request failed: HTTP ' + resp.status);
  var data = await resp.json();
  // NeteaseCloudMusicApi: data.playlist.tracks  or  data.playlist.trackIds
  var playlist = data && data.playlist;
  if (!playlist) throw new Error('Invalid playlist response');

  var tracks = playlist.tracks || [];
  if (!tracks.length && playlist.trackIds && playlist.trackIds.length) {
    // Tracks not embedded — need separate song/detail call
    var ids = playlist.trackIds.slice(0, 50).map(function(t) { return t.id; }).join(',');
    var detailResp = await fetch(_MUSIC_API_BASE + '/song/detail?ids=' + encodeURIComponent(ids));
    if (detailResp.ok) {
      var detailData = await detailResp.json();
      tracks = (detailData && detailData.songs) || [];
    }
  }

  return tracks.map(function(t) {
    var artist = '';
    if (t.ar && t.ar.length) {
      artist = t.ar.map(function(a) { return a.name; }).join(' / ');
    } else if (t.artists && t.artists.length) {
      artist = t.artists.map(function(a) { return a.name; }).join(' / ');
    }
    var cover = (t.al && t.al.picUrl) || (t.album && t.album.picUrl) || '';
    return { id: String(t.id), name: t.name || 'Unknown', artist: artist || 'Unknown', cover: cover };
  });
}

/**
 * Fetch audio URL for a single song ID via NetEase API.
 * Returns a string URL or empty string.
 */
async function _fetchNeteaseAudioUrl(songId) {
  try {
    var resp = await fetch(_MUSIC_API_BASE + '/song/url?id=' + encodeURIComponent(songId));
    if (!resp.ok) return '';
    var data = await resp.json();
    var item = data && data.data && data.data[0];
    return (item && item.url) || '';
  } catch (e) {
    console.warn('[Together] Audio URL fetch failed for', songId, e.message);
    return '';
  }
}

// Returns raw LRC text (timestamps preserved for time-sync)
async function _fetchNeteaseLyric(songId) {
  try {
    var resp = await fetch(_MUSIC_API_BASE + '/lyric?id=' + encodeURIComponent(songId));
    if (!resp.ok) return '';
    var data = await resp.json();
    return (data && data.lrc && data.lrc.lyric) || '';
  } catch (e) {
    console.warn('[Together] Lyric fetch failed for', songId, e.message);
    return '';
  }
}

/**
 * QQ Music playlist import — reserved for future implementation.
 * Returns a user-facing error so they know it's not yet supported.
 */
async function _fetchQQPlaylist(playlistId) {
  // TODO: implement when QQ Music API is available on the deployed service
  throw new Error('QQ Music playlist import is not yet supported. Please use a NetEase Music link.');
}

/**
 * Main entry point: called by the Parse button in the song modal.
 * Reads playlistUrlInput, detects platform+ID, fetches all songs
 * (with audio URLs and lyrics), bulk-adds them to state.together.songs,
 * saves state, closes the modal, and refreshes the listen pane.
 */
async function parseMusicPlaylist() {
  var raw = (document.getElementById('playlistUrlInput').value || '').trim();
  if (!raw) {
    _setStatus('playlistImportStatus',
      _t('together.pastePlaylistFirst', 'Please paste a playlist link first.'), true);
    return;
  }

  // 【问题8】记录本次导入的 token；定时器回调里比对，不一致则放弃
  _togetherPlaylistImportToken++;
  var currentToken = _togetherPlaylistImportToken;

  var btn = document.getElementById('parsePlaylistBtn');
  if (btn) { btn.textContent = 'Parsing...'; btn.disabled = true; }
  _setStatus('playlistImportStatus',
    _t('together.parsingPlaylist', 'Parsing playlist...'), false);

  try {
    var info = _extractPlaylistInfo(raw);

    if (!info.platform) {
      throw new Error(_t('together.unrecognizedLink',
        'Unrecognized link format. Please use a NetEase or QQ Music playlist link, or a numeric playlist ID.'));
    }

    if (info.isShort) {
      if (info.platform === 'netease') {
        _setStatus('playlistImportStatus',
          _t('together.resolvingShortLink', 'Resolving short link...'), false);
        info.id = await _resolveNeteaseShortUrl(info.shortUrl);
        if (!info.id) throw new Error(
          _t('together.shortLinkFailed', 'Could not resolve short link. Please use the full playlist URL.'));
      } else {
        throw new Error(
          _t('together.qqShortNotSupported', 'QQ Music short links are not yet supported. Please use the full playlist URL.'));
      }
    }

    _setStatus('playlistImportStatus',
      _t('together.fetchingPlaylist', 'Fetching playlist details...'), false);

    var tracks;
    if (info.platform === 'netease') {
      tracks = await _fetchNeteasePlaylist(info.id);
    } else {
      tracks = await _fetchQQPlaylist(info.id);
    }

    if (!tracks || !tracks.length) {
      throw new Error(_t('together.noTracksFound', 'No tracks found in this playlist.'));
    }

    _setStatus('playlistImportStatus',
      _t('together.fetchingAudio', 'Fetching audio & lyrics for ' + tracks.length + ' tracks...'), false);

    // Fetch audio URL and lyrics for each track (up to 50 to avoid overload)
    var limited = tracks.slice(0, 50);
    var songs = [];
    for (var i = 0; i < limited.length; i++) {
      var tr = limited[i];
      var audioUrl = '';
      var lyrics   = '';
      if (info.platform === 'netease') {
        // Fetch audio and lyrics in parallel
        var results = await Promise.allSettled([
          _fetchNeteaseAudioUrl(tr.id),
          _fetchNeteaseLyric(tr.id)
        ]);
        audioUrl = results[0].status === 'fulfilled' ? (results[0].value || '') : '';
        lyrics   = results[1].status === 'fulfilled' ? (results[1].value || '') : '';
      }
      // Skip tracks with no playable URL
      if (!audioUrl) continue;

      songs.push({
        id:       _nextTogetherId(), // 【问题3】
        title:    tr.name,
        artist:   tr.artist,
        cover:    tr.cover,
        lyrics:   lyrics,
        audioUrl: audioUrl,
        audioName: tr.name,
        source:   'playlist',
        platform: info.platform
      });
    }

    if (!songs.length) {
      throw new Error(_t('together.noPlayableTracks',
        'No playable tracks found. The audio URLs may be unavailable due to regional restrictions.'));
    }

    _ensureTogetherState();
    // Prepend imported songs (newest at front)
    for (var j = songs.length - 1; j >= 0; j--) {
      state.together.songs.unshift(songs[j]);
    }
    if (typeof saveState === 'function') saveState();

        _setStatus('playlistImportStatus', 'Playlist imported (' + songs.length + ' tracks added).', false);
    console.log('[Together] Playlist imported:', songs.length, 'tracks from', info.platform, 'ID', info.id);

    setTimeout(function() {
      if (_togetherPlaylistImportToken !== currentToken) return;
      _tgCurrentIndex = 0;
      state.together.currentIndex = 0;
      closeTogetherModal('song');
      switchTogetherTab('listen');
      _tgLoadSong(0, true);
    }, 900);

  } catch (err) {
    console.error('[Together] Playlist import error:', err);
        _setStatus('playlistImportStatus', 'Failed: ' + (err.message || 'Please check the link.'), true);
  } finally {
    if (btn) { btn.textContent = 'Parse'; btn.disabled = false; }
  }
}
