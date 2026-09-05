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
