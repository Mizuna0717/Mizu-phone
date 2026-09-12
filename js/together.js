// ========== together.js ==========
// Together 应用 — Tab 切换 + 内容上传

/**
 * 切换 Together 底部 Tab
 * @param {'listen'|'watch'|'read'} tab
 */
function switchTogetherTab(tab) {
  var paneMap = {
    listen: 'togetherListen',
    watch:  'togetherWatch',
    read:   'togetherRead'
  };
  var tabMap = {
    listen: 'tabListen',
    watch:  'tabWatch',
    read:   'tabRead'
  };
  var titleMap = {
    listen: 'together.listen',
    watch:  'together.watch',
    read:   'together.read'
  };

  // 隐藏所有 pane & 取消所有 tab 激活
  document.querySelectorAll('.together-pane').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('.together-tab').forEach(function(el) {
    el.classList.remove('active');
  });

  // 激活目标
  var pane = document.getElementById(paneMap[tab]);
  var btn  = document.getElementById(tabMap[tab]);
  if (pane) pane.classList.add('active');
  if (btn)  btn.classList.add('active');

  // 更新顶部标题（如果有 i18n 函数则使用翻译）
  var headerEl = document.getElementById('togetherHeaderTitle');
  if (headerEl) {
    var key = titleMap[tab];
    if (typeof t === 'function') {
      headerEl.textContent = t(key);
    } else if (typeof LANG !== 'undefined') {
      var lang = (typeof state !== 'undefined' && state.settings && state.settings.language) ? state.settings.language : 'en';
      headerEl.textContent = (LANG[lang] && LANG[lang][key]) || key;
    }
  }

  console.log('[Together] Tab switched →', tab);
}

/**
 * 从桌面打开 Together
 */
function openTogether() {
  console.log('[Together] Opening Together app');
  nav('screen-together');
  // 默认选中第一个 Tab
  switchTogetherTab('listen');
}

/**
 * 初始化 Together（可选：在页面载入时调用）
 */
function initTogether() {
  switchTogetherTab('listen');
  _renderAllTogetherContent();
  console.log('[Together] Initialized');
}

// ══════════════════════════════════════════════
// 状态初始化
// ══════════════════════════════════════════════
function _ensureTogetherState() {
  if (typeof state === 'undefined') return;
  if (!state.together) {
    state.together = { songs: [], videos: [], novels: [] };
  }
  if (!state.together.songs)  state.together.songs  = [];
  if (!state.together.videos) state.together.videos = [];
  if (!state.together.novels) state.together.novels = [];
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
    _setVal('biliUrlInput', '');
    _setText('coverLocalLabel', _t('together.tapSelectImage', '点击选择图片'));
    _setText('lyricsFileLabel', _t('together.lyricsFilePh', 'txt / doc / docx'));
    _setText('audioFileLabel',  _t('together.audioFilePh', 'mp3'));
    document.getElementById('coverFileInput').value  = '';
    document.getElementById('lyricsFileInput').value = '';
    document.getElementById('audioFileInput').value  = '';
    _hide('coverPreviewWrap');
    _hide('songUploadStatus');
    switchCoverTab('local');
  } else if (type === 'video') {
    _setVal('biliUrlInput', '');
    document.getElementById('videoFileInput').value = '';
    _setText('videoFileLabel', _t('together.videoFilePh', 'mp4 / mov / avi'));
    _hide('biliResult');
    _hide('videoUploadStatus');
    switchVideoTab('bili');
  } else if (type === 'novel') {
    document.getElementById('novelFileInput').value = '';
    _setText('novelFileLabel', _t('together.novelFilePh', 'txt / pdf / doc / docx'));
    _hide('novelUploadStatus');
  }
}

function _t(key, fallback) {
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
  if (tab === 'local') {
    document.getElementById('coverUrlInput').value = '';
  }
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
  document.getElementById('coverFileInput').value = '';
  _setText('coverLocalLabel', _t('together.tapSelectImage', '点击选择图片'));
  _hide('coverPreviewWrap');
}

// ══════════════════════════════════════════════
// 歌词文件解析
// ══════════════════════════════════════════════
function handleLyricsFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('lyricsFileLabel', file.name);
  _setStatus('songUploadStatus', _t('together.parsing', '解析中...'), false);

  var name = file.name.toLowerCase();
  if (name.endsWith('.txt')) {
    var reader = new FileReader();
    reader.onload = function(e) {
      _togetherModalState.song.lyrics = e.target.result;
      _setStatus('songUploadStatus', _t('together.lyricsLoaded', '歌词已加载'), false);
    };
    reader.onerror = function() {
      _setStatus('songUploadStatus', _t('together.parseError', '解析失败'), true);
    };
    reader.readAsText(file, 'utf-8');
  } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
    var reader2 = new FileReader();
    reader2.onload = function(e) {
      _togetherModalState.song.lyrics = '[' + file.name + ']';
      _setStatus('songUploadStatus', _t('together.lyricsLoaded', '歌词已加载'), false);
    };
    reader2.readAsArrayBuffer(file);
  } else {
    _setStatus('songUploadStatus', _t('together.unsupportedFormat', '不支持的格式'), true);
  }
}

// ══════════════════════════════════════════════
// 音频文件
// ══════════════════════════════════════════════
function handleAudioFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('audioFileLabel', file.name);
  var reader = new FileReader();
  _setStatus('songUploadStatus', _t('together.loading', '加载中...'), false);
  reader.onload = function(e) {
    _togetherModalState.song.audioDataUrl = e.target.result;
    _togetherModalState.song.audioName = file.name;
    _setStatus('songUploadStatus', _t('together.audioLoaded', '音频已加载'), false);
  };
  reader.onerror = function() {
    _setStatus('songUploadStatus', _t('together.loadError', '加载失败'), true);
  };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
// 提交歌曲
// ══════════════════════════════════════════════
function submitSong() {
  var title    = (document.getElementById('songTitleInput').value  || '').trim();
  var artist   = (document.getElementById('artistNameInput').value || '').trim();
  var ms       = _togetherModalState.song;
  var coverTab = ms._coverTab || 'local';
  var cover    = coverTab === 'local'
    ? (ms.coverDataUrl || '')
    : ((document.getElementById('coverUrlInput').value || '').trim());

  if (!title)  { _setStatus('songUploadStatus', _t('together.titleRequired',  '请输入歌曲名称'), true);  return; }
  if (!artist) { _setStatus('songUploadStatus', _t('together.artistRequired', '请输入歌手名称'), true); return; }

  var song = {
    id:       Date.now(),
    title:    title,
    artist:   artist,
    cover:    cover,
    lyrics:   ms.lyrics   || '',
    audioUrl: ms.audioDataUrl || '',
    audioName:ms.audioName || ''
  };

  _ensureTogetherState();
  state.together.songs.unshift(song);
  if (typeof saveState === 'function') saveState();

  closeTogetherModal('song');
  switchTogetherTab('listen');
  _renderListenContent();
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
// B站链接解析
// ══════════════════════════════════════════════
function parseBiliUrl() {
  var raw = (document.getElementById('biliUrlInput').value || '').trim();
  if (!raw) { _setStatus('videoUploadStatus', _t('together.enterBiliUrl', '请输入 B 站链接'), true); return; }

  _setStatus('videoUploadStatus', _t('together.parsing', '解析中...'), false);

  var bvMatch  = raw.match(/BV([A-Za-z0-9]+)/i);
  var avMatch  = raw.match(/av(\d+)/i);
  var epMatch  = raw.match(/ep(\d+)/i);
  var ssMatch  = raw.match(/ss(\d+)/i);
  var shortMatch = raw.match(/b23\.tv\/([A-Za-z0-9]+)/i);

  var vid = '';
  if (bvMatch)    vid = 'BV' + bvMatch[1];
  else if (avMatch)    vid = 'av' + avMatch[1];
  else if (epMatch)    vid = 'ep' + epMatch[1];
  else if (ssMatch)    vid = 'ss' + ssMatch[1];
  else if (shortMatch) vid = shortMatch[1];
  else                 vid = raw;

  _togetherModalState.video.biliVid = vid;
  _togetherModalState.video.biliUrl = raw;
  _togetherModalState.video.title   = vid;
  _togetherModalState.video.source  = 'bili';

  var titleEl = document.getElementById('biliTitle');
  var metaEl  = document.getElementById('biliMeta');
  var thumbEl = document.getElementById('biliThumb');
  if (titleEl) titleEl.textContent = vid;
  if (metaEl)  metaEl.textContent  = 'bilibili.com';
  if (thumbEl) thumbEl.style.background = '';

  _show('biliResult');
  _setStatus('videoUploadStatus', _t('together.biliParsed', '链接已解析'), false);
}

// ══════════════════════════════════════════════
// 本地视频文件
// ══════════════════════════════════════════════
function handleVideoFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('videoFileLabel', file.name);
  _setStatus('videoUploadStatus', _t('together.loading', '加载中...'), false);
  var reader = new FileReader();
  reader.onload = function(e) {
    _togetherModalState.video.localDataUrl = e.target.result;
    _togetherModalState.video.localName   = file.name;
    _togetherModalState.video.title       = file.name.replace(/\.[^.]+$/, '');
    _togetherModalState.video.source      = 'local';
    _setStatus('videoUploadStatus', _t('together.videoLoaded', '视频已加载'), false);
  };
  reader.onerror = function() {
    _setStatus('videoUploadStatus', _t('together.loadError', '加载失败'), true);
  };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
// 提交视频
// ══════════════════════════════════════════════
function submitVideo() {
  var mv  = _togetherModalState.video;
  var tab = mv._videoTab || 'bili';

  if (tab === 'bili') {
    if (!mv.biliVid) { _setStatus('videoUploadStatus', _t('together.parseBiliFirst', '请先解析 B 站链接'), true); return; }
  } else {
    if (!mv.localDataUrl) { _setStatus('videoUploadStatus', _t('together.selectVideoFile', '请选择视频文件'), true); return; }
  }

  var video = {
    id:       Date.now(),
    title:    mv.title || mv.biliVid || mv.localName || 'Video',
    source:   mv.source || tab,
    biliUrl:  mv.biliUrl  || '',
    biliVid:  mv.biliVid  || '',
    localUrl: mv.localDataUrl || '',
    localName:mv.localName || ''
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
// 小说文件解析
// ══════════════════════════════════════════════
function handleNovelFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  _setText('novelFileLabel', file.name);
  _setStatus('novelUploadStatus', _t('together.parsing', '解析中...'), false);

  var name = file.name.toLowerCase();
  _togetherModalState.novel.fileName = file.name;
  _togetherModalState.novel.title    = file.name.replace(/\.[^.]+$/, '');

  if (name.endsWith('.txt')) {
    var reader = new FileReader();
    reader.onload = function(e) {
      _togetherModalState.novel.content = e.target.result;
      _setStatus('novelUploadStatus', _t('together.novelLoaded', '文件已加载'), false);
    };
    reader.onerror = function() {
      _setStatus('novelUploadStatus', _t('together.parseError', '解析失败'), true);
    };
    reader.readAsText(file, 'utf-8');
  } else if (name.endsWith('.pdf')) {
    _togetherModalState.novel.content = '[PDF: ' + file.name + ']';
    _setStatus('novelUploadStatus', _t('together.novelLoaded', '文件已加载'), false);
  } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
    var reader2 = new FileReader();
    reader2.onload = function() {
      _togetherModalState.novel.content = '[' + file.name + ']';
      _setStatus('novelUploadStatus', _t('together.novelLoaded', '文件已加载'), false);
    };
    reader2.readAsArrayBuffer(file);
  } else {
    _setStatus('novelUploadStatus', _t('together.unsupportedFormat', '不支持的格式'), true);
  }
}

// ══════════════════════════════════════════════
// 提交小说
// ══════════════════════════════════════════════
function submitNovel() {
  var mn = _togetherModalState.novel;
  if (!mn.fileName) { _setStatus('novelUploadStatus', _t('together.selectNovelFile', '请选择小说文件'), true); return; }

  var novel = {
    id:      Date.now(),
    title:   mn.title    || mn.fileName,
    content: mn.content  || '',
    fileName:mn.fileName || ''
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
// 内容渲染
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
  if (!songs.length) return;

  var latest = songs[0];

  var coverEl = document.querySelector('#togetherListen .tg-album-cover');
  if (coverEl && latest.cover) {
    coverEl.innerHTML = '<img src="' + latest.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  }

  var titleEl  = document.querySelector('#togetherListen .tg-song-title');
  var artistEl = document.querySelector('#togetherListen .tg-song-artist');
  if (titleEl)  titleEl.textContent  = latest.title;
  if (artistEl) artistEl.textContent = latest.artist;

  if (latest.lyrics) {
    var lines = latest.lyrics.split('\n').filter(function(l) { return l.trim(); }).slice(0, 8);
    var lyricsCard = document.querySelector('#togetherListen .tg-lyrics-card');
    if (lyricsCard) {
      lyricsCard.innerHTML = lines.map(function(line, i) {
        return '<div class="tg-lyric-line' + (i === 0 ? ' active' : '') + '">' +
          '<span class="tg-lyric-text">' + _escHtml(line) + '</span></div>';
      }).join('');
    }
  }

  var playlist = document.querySelector('#togetherListen .tg-playlist');
  if (playlist && songs.length > 1) {
    var upNext = songs.slice(1);
    playlist.innerHTML = upNext.map(function(s) {
      var coverHtml = s.cover
        ? '<img src="' + s.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">' : '';
      return '<div class="tg-playlist-item">' +
        '<div class="tg-pl-cover">' + coverHtml + '</div>' +
        '<div class="tg-pl-info">' +
          '<div class="tg-pl-title">' + _escHtml(s.title)  + '</div>' +
          '<div class="tg-pl-artist">' + _escHtml(s.artist) + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }
}

function _renderWatchContent() {
  _ensureTogetherState();
  var videos = (state.together && state.together.videos) || [];
  if (!videos.length) return;

  var latest = videos[0];

  var titleEl = document.querySelector('#togetherWatch .tg-vi-title');
  if (titleEl) titleEl.textContent = latest.title;

  var screen = document.querySelector('#togetherWatch .tg-video-screen');
  if (screen && latest.source === 'local' && latest.localUrl) {
    screen.innerHTML =
      '<video src="' + latest.localUrl + '" controls style="width:100%;height:100%;object-fit:cover;"></video>';
  } else if (screen && latest.source === 'bili') {
    var bvid = latest.biliVid || '';
    var embedSrc = bvid
      ? 'https://player.bilibili.com/player.html?bvid=' + encodeURIComponent(bvid) + '&autoplay=0'
      : '';
    if (embedSrc) {
      screen.innerHTML =
        '<iframe src="' + embedSrc + '" width="100%" height="100%" frameborder="0"' +
        ' allowfullscreen scrolling="no"></iframe>';
    } else {
      screen.innerHTML = '<div class="tg-video-bili-label">' + _escHtml(latest.title) + '</div>';
    }
  }

  var list = document.querySelector('#togetherWatch .tg-video-list');
  if (list && videos.length > 1) {
    list.innerHTML = videos.slice(1).map(function(v) {
      return '<div class="tg-vl-item">' +
        '<div class="tg-vl-thumb">' +
          '<svg viewBox="0 0 32 32" class="tg-vl-play"><path d="M12 8l12 8-12 8z"/></svg>' +
          '<span class="tg-vl-badge">' + _escHtml(v.source === 'bili' ? 'B站' : '本地') + '</span>' +
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
  if (!novels.length) return;

  var latest = novels[0];

  var titleEl = document.querySelector('#togetherRead .tg-book-meta .tg-skel');
  if (titleEl) {
    var span = document.createElement('span');
    span.style.cssText = 'font-size:15px;font-weight:600;color:#1d1d1f;';
    span.textContent   = latest.title;
    titleEl.replaceWith(span);
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
        if (textChunks[i] !== undefined) {
          p.innerHTML = '<span style="font-size:14px;line-height:1.9;color:#3a3a3c;">' +
            _escHtml(textChunks[i]) + '</span>';
        }
      });
    }
  }

  var toc = document.querySelector('#togetherRead .tg-toc');
  if (toc && novels.length > 0) {
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
 * Resolve a NetEase short link to its real URL via the /url/shorten endpoint,
 * then re-extract the playlist ID.
 * Falls back to fetching the short URL directly if the API doesn't have the endpoint.
 */
async function _resolveNeteaseShortUrl(shortUrlFragment) {
  // Build full short URL if only the path was extracted
  var full = shortUrlFragment.startsWith('http') ? shortUrlFragment : 'https://' + shortUrlFragment;
  try {
    // Try the API's shorten endpoint first
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
    console.warn('[Together] Short URL API failed, trying direct fetch:', e.message);
  }
  // Direct HEAD request to follow redirect
  try {
    var r2 = await fetch(full, { method: 'HEAD', redirect: 'follow' });
    var info2 = _extractPlaylistInfo(r2.url);
    if (info2.id) return info2.id;
  } catch (e2) {
    console.warn('[Together] Short URL direct fetch failed:', e2.message);
  }
  return null;
}

/**
 * Parse LRC-format lyrics into plain text lines, stripping timestamps.
 * e.g. "[00:12.34]Hello world" -> "Hello world"
 */
function _parseLrc(lrcText) {
  if (!lrcText) return '';
  return lrcText
    .split('\n')
    .map(function(line) { return line.replace(/\[\d+:\d+\.\d+\]/g, '').replace(/\[.*?\]/g, '').trim(); })
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

/**
 * Fetch lyrics for a single song ID via NetEase API.
 * Returns plain text (LRC timestamps stripped).
 */
async function _fetchNeteaseLyric(songId) {
  try {
    var resp = await fetch(_MUSIC_API_BASE + '/lyric?id=' + encodeURIComponent(songId));
    if (!resp.ok) return '';
    var data = await resp.json();
    var lrc = (data && data.lrc && data.lrc.lyric) || '';
    return _parseLrc(lrc);
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
    _setStatus('playlistImportStatus', 'Please paste a playlist link first.', true);
    return;
  }

  var btn = document.getElementById('parsePlaylistBtn');
  if (btn) { btn.textContent = 'Parsing...'; btn.disabled = true; }
  _setStatus('playlistImportStatus', 'Parsing playlist...', false);

  try {
    var info = _extractPlaylistInfo(raw);

    if (!info.platform) {
      throw new Error('Unrecognized link format. Please use a NetEase or QQ Music playlist link, or a numeric playlist ID.');
    }

    // Resolve short URL if needed
    if (info.isShort) {
      if (info.platform === 'netease') {
        _setStatus('playlistImportStatus', 'Resolving short link...', false);
        info.id = await _resolveNeteaseShortUrl(info.shortUrl);
        if (!info.id) throw new Error('Could not resolve short link. Please use the full playlist URL.');
      } else {
        throw new Error('QQ Music short links are not yet supported. Please use the full playlist URL.');
      }
    }

    _setStatus('playlistImportStatus', 'Fetching playlist details...', false);

    var tracks;
    if (info.platform === 'netease') {
      tracks = await _fetchNeteasePlaylist(info.id);
    } else {
      tracks = await _fetchQQPlaylist(info.id);
    }

    if (!tracks || !tracks.length) {
      throw new Error('No tracks found in this playlist.');
    }

    _setStatus('playlistImportStatus', 'Fetching audio & lyrics for ' + tracks.length + ' tracks...', false);

    // Fetch audio URL and lyrics for each track (up to 50 to avoid overload)
    var limited = tracks.slice(0, 50);
    var songs = [];
    for (var i = 0; i < limited.length; i++) {
      var t = limited[i];
      var audioUrl = '';
      var lyrics   = '';
      if (info.platform === 'netease') {
        // Fetch audio and lyrics in parallel
        var results = await Promise.allSettled([
          _fetchNeteaseAudioUrl(t.id),
          _fetchNeteaseLyric(t.id)
        ]);
        audioUrl = results[0].status === 'fulfilled' ? (results[0].value || '') : '';
        lyrics   = results[1].status === 'fulfilled' ? (results[1].value || '') : '';
      }
      // Skip tracks with no playable URL
      if (!audioUrl) continue;

      songs.push({
        id:       t.id + '_' + Date.now() + '_' + i,
        title:    t.name,
        artist:   t.artist,
        cover:    t.cover,
        lyrics:   lyrics,
        audioUrl: audioUrl,
        audioName: t.name,
        source:   'playlist',
        platform: info.platform
      });
    }

    if (!songs.length) {
      throw new Error('No playable tracks found. The audio URLs may be unavailable due to regional restrictions.');
    }

    _ensureTogetherState();
    // Prepend imported songs (newest at front)
    for (var j = songs.length - 1; j >= 0; j--) {
      state.together.songs.unshift(songs[j]);
    }
    if (typeof saveState === 'function') saveState();

    _setStatus('playlistImportStatus', 'Playlist imported successfully (' + songs.length + ' tracks added).', false);
    console.log('[Together] Playlist imported:', songs.length, 'tracks from', info.platform, 'ID', info.id);

    // Close modal and refresh listen pane after brief delay so user sees success message
    setTimeout(function() {
      closeTogetherModal('song');
      switchTogetherTab('listen');
      _renderListenContent();
    }, 900);

  } catch (err) {
    console.error('[Together] Playlist import error:', err);
    _setStatus('playlistImportStatus', 'Failed to parse playlist. ' + (err.message || 'Please check the link.'), true);
  } finally {
    if (btn) { btn.textContent = 'Parse'; btn.disabled = false; }
  }
}

// Reset playlist import field when song modal resets
(function _patchResetModalForPlaylist() {
  var _origReset = _resetModal;
  _resetModal = function(type) {
    _origReset(type);
    if (type === 'song') {
      _setVal('playlistUrlInput', '');
      _hide('playlistImportStatus');
      var btn = document.getElementById('parsePlaylistBtn');
      if (btn) { btn.textContent = 'Parse'; btn.disabled = false; }
    }
  };
})();
