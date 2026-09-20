// ==========================================================
//  PHONE MUSIC APP
//  模块 3：骰子 + AI 一次性生成（含歌词）
// ==========================================================

;(function() {
  'use strict';

  // ══════════════════════════════════════════════
  //  1. 基础工具
  // ══════════════════════════════════════════════
  function _pmusEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _pmusFormatDuration(sec) {
    if (!sec || sec < 0) return '0:00';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + ('' + s).padStart(2, '0');
  }
  function _pmusFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    var MIN = 60000, HOUR = 3600000, DAY = 86400000;
    if (diff < MIN) return 'now';
    if (diff < HOUR) return Math.floor(diff/MIN) + 'm';
    if (diff < DAY) return Math.floor(diff/HOUR) + 'h';
    if (diff < 7*DAY) return Math.floor(diff/DAY) + 'd';
    if (diff < 30*DAY) return Math.floor(diff/(7*DAY)) + 'w';
    return (d.getMonth()+1) + '/' + d.getDate();
  }
  function _pmusFormatFullTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    var time = ('' + d.getHours()).padStart(2,'0') + ':' + ('' + d.getMinutes()).padStart(2,'0');
    if (diff < 86400000) return 'Today ' + time;
    if (diff < 172800000) return 'Yesterday ' + time;
    return months[d.getMonth()] + ' ' + d.getDate() + ' ' + time;
  }

  // ══════════════════════════════════════════════
  //  2. 数据访问
  // ══════════════════════════════════════════════
  function _pmusFindMeta(ownerCharId) {
    var arr = state.musicData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].ownerCharId === ownerCharId && arr[i].type === 'meta') return arr[i];
    }
    return null;
  }
  function _pmusGetSongs(ownerCharId) {
    return (state.musicData || []).filter(function(s){
      return s && s.ownerCharId === ownerCharId && s.type === 'song';
    });
  }
  function _pmusGetById(ownerCharId, songId) {
    var songs = _pmusGetSongs(ownerCharId);
    for (var i = 0; i < songs.length; i++) {
      if (songs[i].id === songId) return songs[i];
    }
    return null;
  }
  function _pmusGetPlaylist(ownerCharId, playlistName) {
    return _pmusGetSongs(ownerCharId).filter(function(s){
      return s.isInPlaylist === playlistName;
    });
  }

  // ══════════════════════════════════════════════
  //  3. 封面颜色
  // ══════════════════════════════════════════════
  function _pmusCoverColor(str) {
    var palette = ['#4a4f5a','#5a4a5a','#4a5a55','#5a554a','#5a4a4f','#4a5a4a','#4a4a5a','#55555a'];
    var sum = 0;
    str = String(str || '?');
    for (var i = 0; i < str.length; i++) sum += str.charCodeAt(i);
    return palette[sum % palette.length];
  }

  // ══════════════════════════════════════════════
  //  4. SVG 图标
  // ══════════════════════════════════════════════
  var _pmusIconPlay = '<svg viewBox="0 0 20 20" width="22" height="22" fill="currentColor"><path d="M6 3.5l11 6.5-11 6.5z"/></svg>';
  var _pmusIconPrev = '<svg viewBox="0 0 20 20" width="22" height="22" fill="currentColor"><path d="M16 3.5l-10 6.5 10 6.5zM4 3v14h2V3z"/></svg>';
  var _pmusIconNext = '<svg viewBox="0 0 20 20" width="22" height="22" fill="currentColor"><path d="M4 3.5l10 6.5-10 6.5zM14 3v14h2V3z"/></svg>';
  var _pmusIconNote = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M8 16V5l8-2v11" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="6" cy="16" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="14" cy="14" r="2" stroke="currentColor" stroke-width="1.4"/></svg>';
  var _pmusIconFolder = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M3 6h5l2 2h7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  var _pmusIconHeart = '<svg viewBox="0 0 20 20" width="13" height="13" fill="none"><path d="M10 17S3 13 3 8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 5-7 9-7 9z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  var _pmusIconChevron = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M8 4l6 6-6 6" stroke="rgba(255,255,255,.25)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ══════════════════════════════════════════════
  //  5. Now Playing 卡片
  // ══════════════════════════════════════════════
  function _pmusBuildNowPlayingHTML(ownerCharId, meta, songs) {
    var nowSong = meta && meta.nowPlayingId ? _pmusGetById(ownerCharId, meta.nowPlayingId) : null;
    if (!nowSong && songs.length > 0) nowSong = songs[0];
    if (!nowSong) return '';

    var coverColor = _pmusCoverColor(nowSong.title);
    var pct = 38;

    var h = '<div class="pmus-now">';
    h += '<div class="pmus-now-label">Now Playing</div>';
    h += '<div class="pmus-now-row">';
    h += '<div class="pmus-cover" style="background:' + coverColor + ';cursor:pointer" ' +
         'onclick="openMusicDetail(\'' + _pmusEscape(nowSong.id) + '\')">' + _pmusIconNote + '</div>';
    h += '<div class="pmus-now-info">';
    h += '<div class="pmus-now-title">' + _pmusEscape(nowSong.title) + '</div>';
    h += '<div class="pmus-now-artist">' + _pmusEscape(nowSong.artist) + '</div>';
    h += '</div>';
    h += '</div>';

    h += '<div class="pmus-progress">';
    h += '<div class="pmus-progress-track"><div class="pmus-progress-fill" style="width:' + pct + '%"></div></div>';
    h += '<div class="pmus-progress-times">' +
      '<span>' + _pmusFormatDuration(Math.round(nowSong.duration * pct / 100)) + '</span>' +
      '<span>' + _pmusFormatDuration(nowSong.duration) + '</span>' +
    '</div>';
    h += '</div>';

    h += '<div class="pmus-controls">';
    h += '<button class="pmus-ctrl-btn">' + _pmusIconPrev + '</button>';
    h += '<button class="pmus-ctrl-btn pmus-ctrl-play">' + _pmusIconPlay + '</button>';
    h += '<button class="pmus-ctrl-btn">' + _pmusIconNext + '</button>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  6. 通用歌曲行
  // ══════════════════════════════════════════════
  function _pmusBuildSongRowHTML(song, opts) {
    opts = opts || {};
    var showIndex = !!opts.showIndex;
    var index = opts.index;
    var showTime = !!opts.showTime;
    var showArtist = opts.showArtist !== false;
    var coverColor = _pmusCoverColor(song.title);

    var h = '<div class="pmus-row" data-song-id="' + _pmusEscape(song.id) + '" ' +
            'style="-webkit-tap-highlight-color:transparent">';
    // 主点击区：设为正在播放
    h += '<div class="pmus-row-tap" onclick="pmsPlaySong(\'' + _pmusEscape(song.id) + '\')"></div>';
    if (showIndex) {
      h += '<div class="pmus-row-index">' + (index != null ? (index + 1) : '') + '</div>';
    } else {
      h += '<div class="pmus-row-cover" style="background:' + coverColor + '">' + _pmusIconNote + '</div>';
    }
    h += '<div class="pmus-row-info">';
    h += '<div class="pmus-row-title">' +
      (song.isFavorite ? '<span class="pmus-row-fav">' + _pmusIconHeart + '</span>' : '') +
      _pmusEscape(song.title) +
    '</div>';
    if (showArtist) {
      h += '<div class="pmus-row-artist">' + _pmusEscape(song.artist) + '</div>';
    }
    h += '</div>';
     if (showTime) {
      h += '<div class="pmus-row-time">' + _pmusFormatTime(song.lastPlayedAt) + '</div>';
    } else {
      h += '<div class="pmus-row-duration">' + _pmusFormatDuration(song.duration) + '</div>';
    }
    // 右侧 ⋯ 按钮 → 打开详情
    h += '<button class="pmus-row-more" onclick="event.stopPropagation();openMusicDetail(\'' + _pmusEscape(song.id) + '\')">' +
      '<svg viewBox="0 0 20 20" width="16" height="16" fill="none">' +
        '<circle cx="10" cy="5" r="1.3" fill="currentColor"/>' +
        '<circle cx="10" cy="10" r="1.3" fill="currentColor"/>' +
        '<circle cx="10" cy="15" r="1.3" fill="currentColor"/>' +
      '</svg>' +
    '</button>';
    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  7. 列表主渲染
  // ══════════════════════════════════════════════
  function _pmusBuildListHTML(ownerCharId) {
    var meta = _pmusFindMeta(ownerCharId);
    var songs = _pmusGetSongs(ownerCharId);

    if (songs.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<path d="M20 36V14l18-6v20"/>' +
          '<circle cx="16" cy="36" r="4"/><circle cx="34" cy="28" r="4"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No music yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var h = '';
    h += _pmusBuildNowPlayingHTML(ownerCharId, meta, songs);

    var upNext = songs.slice().sort(function(a, b){
      return (b.playCount || 0) - (a.playCount || 0);
    }).slice(0, 5);

    if (upNext.length > 0) {
      h += '<div class="pmus-section-title">Up Next</div>';
      h += '<div class="pmus-queue">';
      upNext.forEach(function(s, i){
        h += _pmusBuildSongRowHTML(s, { showIndex: true, index: i });
      });
      h += '</div>';
    }

    var recent = songs.slice()
      .filter(function(s){ return s.lastPlayedAt; })
      .sort(function(a, b){ return (b.lastPlayedAt||0) - (a.lastPlayedAt||0); })
      .slice(0, 6);

    if (recent.length > 0) {
      h += '<div class="pmus-section-title">Recently Played</div>';
      h += '<div class="pmus-recent">';
      recent.forEach(function(s){
        h += _pmusBuildSongRowHTML(s, { showTime: true });
      });
      h += '</div>';
    }

    var playlists = (meta && Array.isArray(meta.playlists)) ? meta.playlists : [];
    if (playlists.length > 0) {
      h += '<div class="pmus-section-title">Playlists</div>';
      h += '<div class="pmus-playlists">';
      playlists.forEach(function(pName){
        var count = _pmusGetPlaylist(ownerCharId, pName).length;
        h += '<div class="pmus-playlist-row" data-playlist="' + _pmusEscape(pName) + '" ' +
             'onclick="openMusicPlaylist(\'' + _pmusEscape(pName) + '\')" ' +
             'style="cursor:pointer;-webkit-tap-highlight-color:transparent">';
        h += '<div class="pmus-playlist-icon">' + _pmusIconFolder + '</div>';
        h += '<div class="pmus-playlist-name">' + _pmusEscape(pName) + '</div>';
        h += '<div class="pmus-playlist-count">' + count + '</div>';
        h += '<div class="pmus-playlist-chevron">' + _pmusIconChevron + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }

    return h;
  }

    // ══════════════════════════════════════════════
  //  8.5 正在播放 / 歌单视图（模块 5+6）
  // ══════════════════════════════════════════════

  function _pmusRerender() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    var bodyEl = pageEl.querySelector('.papp-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = _pmusBuildListHTML(ownerCharId);
    setTimeout(_pmusInjectDiceBtn, 0);
  }

  // 设为正在播放
  window.pmsPlaySong = function(songId) {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var meta = _pmusFindMeta(ownerCharId);
    if (!meta) return;
    var song = _pmusGetById(ownerCharId, songId);
    if (!song) return;

    meta.nowPlayingId = songId;
    song.playCount = (song.playCount || 0) + 1;
    song.lastPlayedAt = Date.now();

    saveState();
    _pmusRerender();
    console.log('[pmsPlaySong] 正在播放:', song.title);
  };

  // 进入歌单视图
  window.openMusicPlaylist = function(playlistName) {
    if (!playlistName) return;
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    var bodyEl = pageEl.querySelector('.papp-body');
    if (!bodyEl) return;

    var songs = _pmusGetPlaylist(ownerCharId, playlistName);

    var h = '';
    h += '<div class="pmus-playlist-header">';
    h += '<button class="pmus-playlist-back" onclick="pmsBackToRoot()">' +
      '<svg viewBox="0 0 20 20" width="20" height="20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span>Music</span></button>';
    h += '<div class="pmus-playlist-title">' + _pmusEscape(playlistName) + '</div>';
    h += '<div class="pmus-playlist-header-right"></div>';
    h += '</div>';

    if (songs.length === 0) {
      h += '<div class="pmus-empty-row" style="padding:40px 20px">No songs in this playlist</div>';
    } else {
      songs.forEach(function(s){
        h += _pmusBuildSongRowHTML(s);
      });
    }

    bodyEl.innerHTML = h;
    setTimeout(_pmusInjectDiceBtn, 0);
    console.log('[openMusicPlaylist]', playlistName, '| 歌曲:', songs.length);
  };

  // 返回列表
  window.pmsBackToRoot = function() {
    _pmusRerender();
  };


  // ══════════════════════════════════════════════
  //  8. 骰子按钮
  // ══════════════════════════════════════════════
  function _pmusInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollMusicData()" title="Generate Music">' +
        '<svg viewBox="0 0 20 20" width="20" height="20" stroke="#0a84ff" fill="none" ' +
        'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="2.5" y="2.5" width="15" height="15" rx="2.5"/>' +
          '<circle cx="7" cy="7" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="10" cy="10" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="13" cy="13" r="1.3" fill="#0a84ff" stroke="none"/>' +
        '</svg>' +
      '</button>';
  }

  // ══════════════════════════════════════════════
  //  9. 主渲染
  // ══════════════════════════════════════════════
  function _pmusPageRenderer(charName) {
    setTimeout(_pmusInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pmusBuildListHTML(ownerCharId);
  }

    // ══════════════════════════════════════════════
  //  9.5 详情页（模块 4）
  // ══════════════════════════════════════════════

  function _pmusFindSongById(songId) {
    var arr = state.musicData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === songId && arr[i].type === 'song') return arr[i];
    }
    return null;
  }

  function _pmusGenreLabel(g) {
    var m = {
      jpop:'J-Pop', kpop:'K-Pop', cpop:'C-Pop', pop:'Pop',
      rock:'Rock', metal:'Metal', indie:'Indie',
      classical:'Classical', jazz:'Jazz', blues:'Blues',
      electronic:'Electronic', ambient:'Ambient',
      folk:'Folk', hiphop:'Hip-Hop', rap:'Rap',
      rnb:'R&B', soul:'Soul', opera:'Opera',
      instrumental:'Instrumental', other:'Other'
    };
    return m[g] || (g ? g.charAt(0).toUpperCase() + g.slice(1) : '—');
  }
  function _pmusLanguageLabel(l) {
    var m = {
      ja:'Japanese', en:'English', ko:'Korean', zh:'Chinese',
      es:'Spanish', ru:'Russian', fr:'French', de:'German',
      instrumental:'Instrumental', other:'—'
    };
    return m[l] || (l ? l.toUpperCase() : '—');
  }

  function _pmusBuildDetailHTML(song) {
    var coverColor = _pmusCoverColor(song.title);

    var h = '<div class="pmus-detail-page">';

    // 顶栏
    h += '<div class="pmus-detail-header">' +
      '<button class="pmus-detail-back" onclick="backToMusicList()">' +
        '<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><path d="M12 4l-6 6 6 6" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<span>Music</span>' +
      '</button>' +
      '<div class="pmus-detail-title"></div>' +
      '<div class="pmus-detail-header-right"></div>' +
    '</div>';

    // 可滚动内容
    h += '<div class="pmus-detail-scroll">';

    // 专辑封面 + 标题区
    h += '<div class="pmus-detail-hero">';
    h += '<div class="pmus-detail-cover" style="background:' + coverColor + '">' + _pmusIconNote + '</div>';
    h += '<div class="pmus-detail-name">' + _pmusEscape(song.title) + '</div>';
    h += '<div class="pmus-detail-artist">' + _pmusEscape(song.artist) + '</div>';
    if (song.album) {
      h += '<div class="pmus-detail-album">' +
        _pmusEscape(song.album) +
        (song.year ? ' · ' + song.year : '') +
      '</div>';
    }
    h += '</div>';

    // 歌词卡片
    if (song.favoriteLyric && String(song.favoriteLyric).trim()) {
      h += '<div class="pmus-lyric-card">';
      h += '<div class="pmus-lyric-label">最喜欢的歌词</div>';
      h += '<div class="pmus-lyric-text">' + _pmusEscape(song.favoriteLyric) + '</div>';
      if (song.favoriteLyricThoughts && String(song.favoriteLyricThoughts).trim()) {
        h += '<div class="pmus-lyric-thoughts">' + _pmusEscape(song.favoriteLyricThoughts) + '</div>';
      }
      h += '</div>';
    }

    // 字段区
    h += '<div class="pmus-detail-fields">';

    h += '<div class="pmus-field-row">';
    h += '<span class="pmus-field-label">Duration</span>';
    h += '<span class="pmus-field-value">' + _pmusFormatDuration(song.duration) + '</span>';
    h += '</div>';

    if (song.genre) {
      h += '<div class="pmus-field-row">';
      h += '<span class="pmus-field-label">Genre</span>';
      h += '<span class="pmus-field-value">' + _pmusGenreLabel(song.genre) + '</span>';
      h += '</div>';
    }

    if (song.language) {
      h += '<div class="pmus-field-row">';
      h += '<span class="pmus-field-label">Language</span>';
      h += '<span class="pmus-field-value">' + _pmusLanguageLabel(song.language) + '</span>';
      h += '</div>';
    }

    if (song.playCount) {
      h += '<div class="pmus-field-row">';
      h += '<span class="pmus-field-label">Played</span>';
      h += '<span class="pmus-field-value pmus-field-played">' +
        song.playCount + ' ' + (song.playCount === 1 ? 'time' : 'times') +
      '</span>';
      h += '</div>';
    }

    if (song.lastPlayedAt) {
      h += '<div class="pmus-field-row">';
      h += '<span class="pmus-field-label">Last played</span>';
      h += '<span class="pmus-field-value">' + _pmusFormatFullTime(song.lastPlayedAt) + '</span>';
      h += '</div>';
    }

    if (song.isInPlaylist) {
      h += '<div class="pmus-field-row">';
      h += '<span class="pmus-field-label">Playlist</span>';
      h += '<span class="pmus-field-value">' + _pmusEscape(song.isInPlaylist) + '</span>';
      h += '</div>';
    }

    h += '</div>'; // /fields

    // 整首歌想法（若有）
    if (song.thoughts && String(song.thoughts).trim()) {
      h += '<div class="pmus-detail-thoughts">' +
        _pmusEscape(song.thoughts) +
      '</div>';
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /detail-page

    return h;
  }

  window.openMusicDetail = function(songId) {
    var song = _pmusFindSongById(songId);
    if (!song) { showToast('Song not found'); return; }
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    pageEl.innerHTML = _pmusBuildDetailHTML(song);
    pageEl.scrollTop = 0;
    var scrollEl = pageEl.querySelector('.pmus-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
    console.log('[openMusicDetail]', song.title, '| played', song.playCount, 'times');
  };

  window.backToMusicList = function() {
    if (typeof openPhoneApp === 'function') openPhoneApp('music');
  };

  // ══════════════════════════════════════════════
  //  10. Prompt 构建
  // ══════════════════════════════════════════════
  function _pmusBuildPrompt(ownerInfo, historyBlock, worldbookBlk) {
    return 'You are writing the MUSIC APP library of a fictional phone owner.\n' +
      'The phone owner is "' + ownerInfo.name + '".\n\n' +

      '=== PHONE OWNER ===\n' + ownerInfo.block + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      historyBlock +

      '=== STEP 1: MUSIC PROFILE ===\n' +
      'Analyze the persona to determine:\n' +
      '  - Genres they listen to (jpop / rock / classical / jazz / pop / kpop / electronic /\n' +
      '    folk / hip-hop / rap / r&b / soul / opera / instrumental / ambient / indie / metal)\n' +
      '  - Era: modern / retro (80s-90s) / classic / a mix\n' +
      '  - Language preference: native language mostly + some foreign\n' +
      '  - Mood: healing / energetic / melancholic / romantic / fierce\n' +
      '  - How many songs they have in their library:\n' +
      '      music-lover / artist / young → 25-40 songs\n' +
      '      ordinary → 15-25 songs\n' +
      '      rarely listens / elderly → 8-15 songs\n\n' +

      '=== STEP 2: REAL vs FICTIONAL ===\n' +
      'You MAY use REAL songs/artists that fit the persona (e.g. YOASOBI / 米津玄師 /\n' +
      'Chopin / Frank Sinatra / BTS / Taylor Swift).\n' +
      'You MAY also invent fictional songs if a real one doesn\'t fit (especially for\n' +
      'classical pieces, indie bands, or era-specific music).\n' +
      'Make it feel AUTHENTIC to the owner — a Japanese noble listening to YOASOBI,\n' +
      'a Korean student listening to BTS, a European aristocrat listening to Chopin.\n\n' +

      '=== STEP 3: FAVORITE LYRIC ===\n' +
      'For 30-50% of songs (especially high-playCount or favorite ones), include a\n' +
      '"favoriteLyric" — 1-2 lines the owner loves most + Chinese translation in ().\n' +
      'Format: "沈むように溶けてゆくように (像沉没一样，像融化一样)"\n' +
      'For instrumental / classical songs, "favoriteLyric" can be "" (empty).\n' +
      'Also include "favoriteLyricThoughts" — 1 sentence in owner\'s voice about WHY\n' +
      'this line moves them. In owner\'s native language.\n\n' +

      '=== STEP 4: PLAYLISTS ===\n' +
      'Create 2-5 playlists that fit the owner. Names in owner\'s native language.\n' +
      'Always include a "Favorites" playlist (literally spelled "Favorites").\n' +
      'Examples: "夜のドライブ" / "Study" / "Workout" / "Late Night" / "Chill"\n' +
      'Assign 30-60% of songs to one playlist (via "isInPlaylist").\n' +
      'Mark 20-40% of songs as "isFavorite": true.\n\n' +

      '=== STEP 5: PLAY STATS ===\n' +
      'Each song:\n' +
      '  - "playCount": how many times played (high 20-100, medium 5-20, low 1-5)\n' +
      '  - "lastPlayedAt": "hoursAgo" relative to now. Spread across:\n' +
      '      some songs: 0.1-3 (just played)\n' +
      '      some: 3-24\n' +
      '      some: 24-168 (days ago)\n' +
      '      some: 168-1440 (weeks ago)\n\n' +

      '=== STEP 6: FIELD SPEC ===\n' +
      'Each song:\n' +
      '  - "title"        : song title (native language)\n' +
      '  - "artist"       : artist name\n' +
      '  - "album"        : album name\n' +
      '  - "duration"     : seconds (120-420 typically)\n' +
      '  - "genre"        : lowercase (jpop / rock / classical / jazz / etc.)\n' +
      '  - "language"     : ISO code (ja / en / ko / zh / instrumental)\n' +
      '  - "year"         : release year\n' +
      '  - "playCount"    : integer\n' +
      '  - "hoursAgo"     : number for lastPlayedAt\n' +
      '  - "isFavorite"   : true | false\n' +
      '  - "isInPlaylist" : playlist name or ""\n' +
      '  - "favoriteLyric": lyric snippet + Chinese translation, or ""\n' +
      '  - "favoriteLyricThoughts": owner\'s feeling about the lyric, or ""\n' +
      '  - "thoughts"     : optional general comment (can be "")\n\n' +

      '=== OUTPUT — valid JSON only ===\n' +
      '{\n' +
      '  "nowPlayingIndex": 0,\n' +
      '  "playlists": ["Favorites", "夜のドライブ", "Study"],\n' +
      '  "songs": [\n' +
      '    {\n' +
      '      "title": "夜に駆ける (向夜晚奔去)",\n' +
      '      "artist": "YOASOBI",\n' +
      '      "album": "THE BOOK",\n' +
      '      "duration": 261,\n' +
      '      "genre": "jpop",\n' +
      '      "language": "ja",\n' +
      '      "year": 2019,\n' +
      '      "playCount": 47,\n' +
      '      "hoursAgo": 2,\n' +
      '      "isFavorite": true,\n' +
      '      "isInPlaylist": "夜のドライブ",\n' +
      '      "favoriteLyric": "沈むように溶けてゆくように (像沉没一样，像融化一样)",\n' +
      '      "favoriteLyricThoughts": "This line never fails to get me.",\n' +
      '      "thoughts": ""\n' +
      '    }\n' +
      '  ]\n' +
      '}\n';
  }

  // ══════════════════════════════════════════════
  //  11. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _pmusGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollMusicData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', block: '' };

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 20) : [];
    var historyBlock = '';
    if (recent.length > 0) {
      historyBlock = '=== CHAT HISTORY (to understand owner\'s mood/context) ===\n';
      recent.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
      historyBlock += '\n';
    }

    var prompt = _pmusBuildPrompt(ownerInfo, historyBlock, worldbookBlk);
    console.log('[rollMusicData] prompt 长度:', prompt.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollMusicData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollMusicData] raw reply 长度:', rawReply.length);

    var obj = null;
    try { var jm = rawReply.match(/\{[\s\S]*\}/); if (jm) obj = JSON.parse(jm[0]); }
    catch(e) { console.warn('[rollMusicData] 完整解析失败:', e.message); }

    if (!obj) {
      console.warn('[rollMusicData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('{');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx);
        for (var cut = body.length; cut > 0; cut -= 50) {
          var probe = body.slice(0, cut);
          var opens = (probe.match(/\[/g) || []).length - (probe.match(/\]/g) || []).length;
          var bopens = (probe.match(/\{/g) || []).length - (probe.match(/\}/g) || []).length;
          for (var q = 0; q < opens; q++) probe += ']';
          for (var w = 0; w < bopens; w++) probe += '}';
          try { obj = JSON.parse(probe); console.log('[rollMusicData] 截断补救成功'); break; }
          catch(e2) {}
        }
      }
    }

    if (!obj || typeof obj !== 'object') { console.warn('[rollMusicData] 无法解析'); return null; }
    if (!Array.isArray(obj.songs)) { console.warn('[rollMusicData] 无 songs 数组'); return null; }

    // playlists 归一化
    var playlists = Array.isArray(obj.playlists) ? obj.playlists.filter(function(p){
      return p && String(p).trim();
    }).map(function(p){ return String(p).trim(); }) : [];
    if (playlists.indexOf('Favorites') < 0) playlists.unshift('Favorites');

    var nowTs = Date.now();
    var HOUR = 3600000;
    var out = [];

    // 先处理歌曲
    var songsOut = [];
    obj.songs.forEach(function(s, i){
      if (!s || !s.title || !s.artist) return;

      var duration = parseInt(s.duration, 10);
      if (!isFinite(duration) || duration <= 0) duration = 180 + Math.floor(Math.random() * 180);

      var playCount = parseInt(s.playCount, 10);
      if (!isFinite(playCount) || playCount < 0) playCount = 1;

      var hoursAgo = parseFloat(s.hoursAgo);
      if (!isFinite(hoursAgo) || hoursAgo < 0) hoursAgo = Math.random() * 72 + 1;
      if (hoursAgo > 1440) hoursAgo = 1440;

      var folderName = (s.isInPlaylist != null) ? String(s.isInPlaylist).trim() : '';
      if (folderName && playlists.indexOf(folderName) < 0) folderName = '';

      songsOut.push({
        id: 'song_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        type: 'song',
        title: String(s.title).trim(),
        artist: String(s.artist).trim(),
        album: (s.album != null) ? String(s.album).trim() : '',
        duration: duration,
        genre: (s.genre != null) ? String(s.genre).trim().toLowerCase() : '',
        language: (s.language != null) ? String(s.language).trim().toLowerCase() : '',
        year: parseInt(s.year, 10) || 0,
        playCount: playCount,
        lastPlayedAt: nowTs - hoursAgo * HOUR,
        isFavorite: !!s.isFavorite,
        isInPlaylist: folderName,
        favoriteLyric: (s.favoriteLyric != null) ? String(s.favoriteLyric).trim() : '',
        favoriteLyricThoughts: (s.favoriteLyricThoughts != null) ? String(s.favoriteLyricThoughts).trim() : '',
        thoughts: (s.thoughts != null) ? String(s.thoughts).trim() : ''
      });
    });

    if (songsOut.length === 0) { console.warn('[rollMusicData] 无有效歌曲'); return null; }

    // meta 记录
    var nowIdx = parseInt(obj.nowPlayingIndex, 10);
    if (!isFinite(nowIdx) || nowIdx < 0 || nowIdx >= songsOut.length) nowIdx = 0;

    out.push({
      id: 'music_meta_' + ownerCharId + '_' + Date.now(),
      ownerCharId: ownerCharId,
      type: 'meta',
      nowPlayingId: songsOut[nowIdx].id,
      playlists: playlists
    });
    songsOut.forEach(function(s){ out.push(s); });

    var favCount = songsOut.filter(function(s){ return s.isFavorite; }).length;
    var lyricCount = songsOut.filter(function(s){ return s.favoriteLyric; }).length;
    console.log('[rollMusicData] 生成完成:', songsOut.length, '首歌 | 收藏', favCount, '| 含歌词', lyricCount, '| 歌单:', playlists.join(', '));
    return out;
  }

  // ══════════════════════════════════════════════
  //  12. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollMusicData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollMusicData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating music...</p></div>';
    }

    var before = (state.musicData || []).length;
    state.musicData = (state.musicData || []).filter(function(x){ return x.ownerCharId !== ownerCharId; });
    console.log('[rollMusicData] 清空旧数据:', before, '→', state.musicData.length);

    var data = await _pmusGenerateAll(ownerCharId);
    if (!data || data.length === 0) { showToast('Generation failed'); openPhoneApp('music'); return; }

    data.forEach(function(x){ state.musicData.push(x); });
    saveState();
    openPhoneApp('music');
    showToast('Generated ' + (data.length - 1) + ' songs');
  };

  // ══════════════════════════════════════════════
  //  13. 注册
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.music = _pmusPageRenderer;
  } else {
    console.warn('[phone-music.js] PHONE_APP_RENDERERS 未定义');
  }

  window.__pmusTest = {
    buildListHTML: _pmusBuildListHTML,
    buildPrompt: _pmusBuildPrompt,
    generateAll: _pmusGenerateAll,
    renderer: _pmusPageRenderer
  };

  console.log('[phone-music.js] 已加载（模块 3）');
})();