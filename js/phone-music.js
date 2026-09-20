// ==========================================================
//  PHONE MUSIC APP
//  模块 2：列表渲染 + 假数据测试版
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
  //  3. 封面颜色（灰调）
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
  var _pmusIconHeart = '<svg viewBox="0 0 20 20" width="14" height="14" fill="none"><path d="M10 17S3 13 3 8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 5-7 9-7 9z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  var _pmusIconChevron = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M8 4l6 6-6 6" stroke="rgba(255,255,255,.25)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ══════════════════════════════════════════════
  //  5. Now Playing 卡片
  // ══════════════════════════════════════════════
  function _pmusBuildNowPlayingHTML(ownerCharId, meta, songs) {
    var nowSong = meta && meta.nowPlayingId ? _pmusGetById(ownerCharId, meta.nowPlayingId) : null;
    if (!nowSong && songs.length > 0) nowSong = songs[0];
    if (!nowSong) return '';

    var coverColor = _pmusCoverColor(nowSong.title);

    var h = '<div class="pmus-now">';
    h += '<div class="pmus-now-label">Now Playing</div>';
    h += '<div class="pmus-now-row">';
    h += '<div class="pmus-cover" style="background:' + coverColor + '">' + _pmusIconNote + '</div>';
    h += '<div class="pmus-now-info">';
    h += '<div class="pmus-now-title">' + _pmusEscape(nowSong.title) + '</div>';
    h += '<div class="pmus-now-artist">' + _pmusEscape(nowSong.artist) + '</div>';
    h += '</div>';
    h += '</div>';

    // 进度条（假 38%）
    var pct = 38;
    h += '<div class="pmus-progress">';
    h += '<div class="pmus-progress-track"><div class="pmus-progress-fill" style="width:' + pct + '%"></div></div>';
    h += '<div class="pmus-progress-times">' +
      '<span>' + _pmusFormatDuration(Math.round(nowSong.duration * pct / 100)) + '</span>' +
      '<span>' + _pmusFormatDuration(nowSong.duration) + '</span>' +
    '</div>';
    h += '</div>';

    // 控件
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

    var h = '<div class="pmus-row" data-song-id="' + _pmusEscape(song.id) + '">';
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

    // ── ① Now Playing ──
    h += _pmusBuildNowPlayingHTML(ownerCharId, meta, songs);

    // ── ② Up Next（按播放次数高）──
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

    // ── ③ Recently Played（按 lastPlayedAt）──
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

    // ── ④ Playlists ──
    var playlists = (meta && Array.isArray(meta.playlists)) ? meta.playlists : [];
    if (playlists.length > 0) {
      h += '<div class="pmus-section-title">Playlists</div>';
      h += '<div class="pmus-playlists">';
      playlists.forEach(function(pName){
        var count = _pmusGetPlaylist(ownerCharId, pName).length;
        h += '<div class="pmus-playlist-row" data-playlist="' + _pmusEscape(pName) + '">';
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
  //  8. 主渲染
  // ══════════════════════════════════════════════
  function _pmusPageRenderer(charName) {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pmusBuildListHTML(ownerCharId);
  }

  // ══════════════════════════════════════════════
  //  9. 注册 renderer
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.music = _pmusPageRenderer;
  } else {
    console.warn('[phone-music.js] PHONE_APP_RENDERERS 未定义');
  }

  // ══════════════════════════════════════════════
  //  10. 测试挂载
  // ══════════════════════════════════════════════
  window.__pmusTest = {
    buildListHTML: _pmusBuildListHTML,
    renderer: _pmusPageRenderer,
    injectFakeData: function(ownerCharId) {
      var oid = ownerCharId || _pmsgOwnerCharId();
      var now = Date.now();
      var HOUR = 3600000, DAY = 86400000;

      var fake = [
        // meta
        {
          id: 'music_meta_' + oid,
          ownerCharId: oid,
          type: 'meta',
          nowPlayingId: 'song_fake_1',
          playlists: ['Favorites', '夜のドライブ', 'Study']
        },
        // 歌曲
        {
          id: 'song_fake_1', ownerCharId: oid, type: 'song',
          title: '夜に駆ける (向夜晚奔去)', artist: 'YOASOBI', album: 'THE BOOK',
          duration: 261, genre: 'jpop', language: 'ja', year: 2019,
          playCount: 47, lastPlayedAt: now - 2*HOUR,
          isFavorite: true, isInPlaylist: '夜のドライブ',
          favoriteLyric: '沈むように溶けてゆくように (像沉没一样，像融化一样)',
          favoriteLyricThoughts: 'This line never fails to get me.',
          thoughts: ''
        },
        {
          id: 'song_fake_2', ownerCharId: oid, type: 'song',
          title: 'ドライフラワー (干花)', artist: '優里', album: '壱',
          duration: 305, genre: 'jpop', language: 'ja', year: 2020,
          playCount: 32, lastPlayedAt: now - 5*HOUR,
          isFavorite: true, isInPlaylist: '夜のドライブ',
          favoriteLyric: '',
          favoriteLyricThoughts: '',
          thoughts: ''
        },
        {
          id: 'song_fake_3', ownerCharId: oid, type: 'song',
          title: '白日', artist: 'King Gnu', album: 'Sympa',
          duration: 290, genre: 'rock', language: 'ja', year: 2019,
          playCount: 28, lastPlayedAt: now - 26*HOUR,
          isFavorite: false, isInPlaylist: '',
          favoriteLyric: '',
          favoriteLyricThoughts: '',
          thoughts: ''
        },
        {
          id: 'song_fake_4', ownerCharId: oid, type: 'song',
          title: 'Nocturne in E-flat major, Op. 9 No. 2',
          artist: 'Chopin', album: 'Nocturnes',
          duration: 269, genre: 'classical', language: 'instrumental', year: 1832,
          playCount: 89, lastPlayedAt: now - 3*DAY,
          isFavorite: true, isInPlaylist: 'Study',
          favoriteLyric: '',
          favoriteLyricThoughts: 'Quiet. Calm. Perfect for late nights.',
          thoughts: ''
        },
        {
          id: 'song_fake_5', ownerCharId: oid, type: 'song',
          title: 'Fly Me to the Moon',
          artist: 'Frank Sinatra', album: 'It Might as Well Be Swing',
          duration: 148, genre: 'jazz', language: 'en', year: 1964,
          playCount: 22, lastPlayedAt: now - 5*DAY,
          isFavorite: false, isInPlaylist: '',
          favoriteLyric: '',
          favoriteLyricThoughts: '',
          thoughts: ''
        },
        {
          id: 'song_fake_6', ownerCharId: oid, type: 'song',
          title: 'Mary on a Cross',
          artist: 'Ghost', album: 'Prequelle',
          duration: 245, genre: 'rock', language: 'en', year: 2019,
          playCount: 15, lastPlayedAt: now - 8*DAY,
          isFavorite: false, isInPlaylist: '',
          favoriteLyric: '',
          favoriteLyricThoughts: '',
          thoughts: ''
        },
        {
          id: 'song_fake_7', ownerCharId: oid, type: 'song',
          title: 'Dynamite',
          artist: 'BTS', album: 'BE',
          duration: 199, genre: 'kpop', language: 'en', year: 2020,
          playCount: 8, lastPlayedAt: now - 15*DAY,
          isFavorite: false, isInPlaylist: '',
          favoriteLyric: '',
          favoriteLyricThoughts: '',
          thoughts: ''
        }
      ];

      state.musicData = (state.musicData || []).filter(function(x){
        return x.ownerCharId !== oid;
      });
      fake.forEach(function(x){ state.musicData.push(x); });
      console.log('[__pmusTest] 已注入 ' + fake.length + ' 条到 ownerCharId=' + oid);
      return fake.length;
    },
    clearData: function(ownerCharId) {
      var oid = ownerCharId || _pmsgOwnerCharId();
      var before = (state.musicData || []).length;
      state.musicData = (state.musicData || []).filter(function(x){
        return x.ownerCharId !== oid;
      });
      console.log('[__pmusTest] 清空 ' + (before - state.musicData.length) + ' 条');
    }
  };

  console.log('[phone-music.js] 已加载（模块 2）');
})();