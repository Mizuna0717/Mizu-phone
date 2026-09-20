// ==========================================================
//  PHONE NOTES APP
//  模块 3：骰子 + AI 一次性生成（含私密文件夹密码）
// ==========================================================

;(function() {
  'use strict';

  var _pnoteView = 'all';
  var _pnotePrivateUnlocked = false;   // 会话内记忆

  // ══════════════════════════════════════════════
  //  1. 基础工具
  // ══════════════════════════════════════════════
  function _pnoteEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _pnoteFormatTime(ts) {
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
  function _pnoteFindMeta(ownerCharId) {
    var arr = state.notesData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].ownerCharId === ownerCharId && arr[i].type === 'meta') return arr[i];
    }
    return null;
  }
  function _pnoteGetAllNotes(ownerCharId, includePrivate) {
    return (state.notesData || []).filter(function(n){
      if (!n || n.ownerCharId !== ownerCharId || n.type !== 'note') return false;
      if (!includePrivate && n.folder === 'Private') return false;
      return true;
    });
  }
  function _pnoteGetFolderNotes(ownerCharId, folder) {
    return (state.notesData || []).filter(function(n){
      if (!n || n.ownerCharId !== ownerCharId || n.type !== 'note') return false;
      return n.folder === folder;
    });
  }

  // ══════════════════════════════════════════════
  //  3. SVG 图标
  // ══════════════════════════════════════════════
  var _pnoteIconText = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M7 6h6M7 9h6M7 12h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var _pnoteIconCheck = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M7 7l1.5 1.5L11 6M7 12l1.5 1.5L11 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 7.5h1M12.5 12.5h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var _pnoteIconFolder = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M3 6h5l2 2h7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  var _pnoteIconLock = '<svg viewBox="0 0 20 20" width="14" height="14" fill="none"><rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M7.5 9V6a2.5 2.5 0 015 0v3" stroke="currentColor" stroke-width="1.4"/></svg>';
  var _pnoteIconPin = '<svg viewBox="0 0 20 20" width="12" height="12" fill="none"><path d="M10 2v8M6 7l4-5 4 5M7 14h6M10 10v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var _pnoteIconBack = '<svg viewBox="0 0 20 20" width="20" height="20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function _pnoteTypeIcon(note) {
    if (note.contentType === 'checklist') return _pnoteIconCheck;
    return _pnoteIconText;
  }

  // ══════════════════════════════════════════════
  //  4. 笔记行
  // ══════════════════════════════════════════════
  function _pnoteBuildNoteRowHTML(note) {
    var isPinned = !!note.isPinned;
    var preview = note.preview || '';
    if (!preview && note.contentType === 'checklist' && note.checklistItems && note.checklistItems.length > 0) {
      preview = note.checklistItems.slice(0, 3).map(function(it){
        return (it.done ? '✓ ' : '○ ') + it.text;
      }).join('   ');
    }
    if (preview.length > 60) preview = preview.slice(0, 60) + '…';

    var h = '<div class="pnote-row" data-note-id="' + _pnoteEscape(note.id) + '" ' +
            'onclick="openNoteDetail(\'' + _pnoteEscape(note.id) + '\')" ' +
            'style="cursor:pointer;-webkit-tap-highlight-color:transparent">';
    h += '<div class="pnote-row-icon">' + _pnoteTypeIcon(note) + '</div>';
    h += '<div class="pnote-row-info">';
    h += '<div class="pnote-row-title">' +
      (isPinned ? '<span class="pnote-row-pin">' + _pnoteIconPin + '</span> ' : '') +
      _pnoteEscape(note.title) +
    '</div>';
    h += '<div class="pnote-row-preview">' + _pnoteEscape(preview) + '</div>';
    h += '<div class="pnote-row-meta">';
    if (note.folder && note.folder !== 'Private') {
      h += '<span class="pnote-row-folder">' + _pnoteEscape(note.folder) + '</span>';
      h += '<span class="pnote-row-sep">·</span>';
    }
    h += '<span>' + _pnoteFormatTime(note.updatedAt) + '</span>';
    h += '</div>';
    h += '</div>';
    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  5. 根视图
  // ══════════════════════════════════════════════
  function _pnoteBuildRootHTML(ownerCharId) {
    var meta = _pnoteFindMeta(ownerCharId);
    var allNotes = _pnoteGetAllNotes(ownerCharId, false);
    var folders = (meta && Array.isArray(meta.folders)) ? meta.folders : [];

    if (allNotes.length === 0 && folders.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<rect x="10" y="8" width="28" height="34" rx="3"/>' +
          '<path d="M17 18h14M17 24h14M17 30h9"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No notes yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var h = '';
    h += '<div class="papp-search">' +
      '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg>' +
      '<span>Search</span>' +
    '</div>';

    h += '<div class="papp-section" style="padding-top:4px">All Notes</div>';
    if (allNotes.length === 0) {
      h += '<div class="pnote-empty-row">No notes</div>';
    } else {
      var pinned = allNotes.filter(function(n){ return n.isPinned; });
      var rest = allNotes.filter(function(n){ return !n.isPinned; });
      pinned.concat(rest).forEach(function(n){
        h += _pnoteBuildNoteRowHTML(n);
      });
    }

    if (folders.length > 0) {
      h += '<div class="papp-section">Folders</div>';
      folders.forEach(function(folderName){
        var count = _pnoteGetFolderNotes(ownerCharId, folderName).length;
        var isPrivate = (folderName === 'Private');
        var lock = isPrivate ? '<span class="pnote-folder-lock">' + _pnoteIconLock + '</span>' : '';
        var onClick = isPrivate
          ? 'onclick="pnoteOpenPrivate()"'
          : 'onclick="pnoteSelectFolder(\'' + _pnoteEscape(folderName) + '\')"';

        h += '<div class="pnote-folder-row" ' + onClick + '>';
        h += '<div class="pnote-folder-icon">' + _pnoteIconFolder + '</div>';
        h += '<div class="pnote-folder-name">' + _pnoteEscape(folderName) + lock + '</div>';
        h += '<div class="pnote-folder-count">' + count + '</div>';
        h += '<div class="pnote-folder-chevron">' +
          '<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M8 4l6 6-6 6" stroke="rgba(255,255,255,.25)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>';
        h += '</div>';
      });
    }

    return h;
  }

  // ══════════════════════════════════════════════
  //  6. 文件夹视图
  // ══════════════════════════════════════════════
  function _pnoteBuildFolderHTML(ownerCharId, folderName) {
    var notes = _pnoteGetFolderNotes(ownerCharId, folderName);
    notes.sort(function(a, b){
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    var h = '';
    h += '<div class="pnote-folder-header">';
    h += '<button class="pnote-back-btn" onclick="pnoteBackToRoot()">' +
      _pnoteIconBack + '<span>Notes</span></button>';
    h += '<div class="pnote-folder-title">' + _pnoteEscape(folderName) + '</div>';
    h += '<div class="pnote-folder-header-right"></div>';
    h += '</div>';

    if (notes.length === 0) {
      h += '<div class="pnote-empty-row" style="padding:40px 20px">No notes in this folder</div>';
    } else {
      notes.forEach(function(n){
        h += _pnoteBuildNoteRowHTML(n);
      });
    }
    return h;
  }

  // ══════════════════════════════════════════════
  //  7. 主渲染
  // ══════════════════════════════════════════════
  function _pnoteBuildListHTML(ownerCharId) {
    if (_pnoteView.indexOf('folder:') === 0) {
      return _pnoteBuildFolderHTML(ownerCharId, _pnoteView.slice(7));
    }
    return _pnoteBuildRootHTML(ownerCharId);
  }
  function _pnotePageRenderer(charName) {
    setTimeout(_pnoteInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pnoteBuildListHTML(ownerCharId);
  }

  // ══════════════════════════════════════════════
  //  8. 骰子按钮
  // ══════════════════════════════════════════════
  function _pnoteInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollNotesData()" title="Generate Notes">' +
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
  //  9.5 详情页（模块 4）
  // ══════════════════════════════════════════════

  function _pnoteFindNoteById(noteId) {
    var arr = state.notesData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === noteId) return arr[i];
    }
    return null;
  }

  function _pnoteFormatFullDate(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() +
           ' ' + ('' + d.getHours()).padStart(2,'0') + ':' + ('' + d.getMinutes()).padStart(2,'0');
  }

  function _pnoteBuildDetailHTML(note) {
    var h = '<div class="pnote-detail-page">';

    // 顶栏
    h += '<div class="pnote-detail-header">' +
      '<button class="pnote-detail-back" onclick="backToNotesList()">' +
        _pnoteIconBack + '<span>Notes</span>' +
      '</button>' +
      '<div class="pnote-detail-title"></div>' +
      '<div class="pnote-detail-header-right"></div>' +
    '</div>';

    // 可滚动内容
    h += '<div class="pnote-detail-scroll">';

    // 标题 + 日期
    h += '<div class="pnote-detail-title-block">';
    h += '<div class="pnote-detail-name">' + _pnoteEscape(note.title) + '</div>';
    h += '<div class="pnote-detail-date">' + _pnoteFormatFullDate(note.updatedAt) + '</div>';
    h += '</div>';

    // 正文
    if (note.contentType === 'checklist' && note.checklistItems && note.checklistItems.length > 0) {
      h += '<div class="pnote-detail-checklist">';
      note.checklistItems.forEach(function(it){
        h += '<div class="pnote-checkitem' + (it.done ? ' pnote-checkitem-done' : '') + '">';
        h += '<span class="pnote-checkmark">' + (it.done ? '✓' : '○') + '</span>';
        h += '<span class="pnote-checktext">' + _pnoteEscape(it.text) + '</span>';
        h += '</div>';
      });
      h += '</div>';
    } else {
      h += '<div class="pnote-detail-body">' + _pnoteEscape(note.content || '(Empty)') + '</div>';
    }

    // 底部文件夹标签
    if (note.folder) {
      h += '<div class="pnote-detail-footer">';
      h += '<span class="pnote-detail-folder">' + _pnoteEscape(note.folder) + '</span>';
      h += '</div>';
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /detail-page

    return h;
  }

  window.openNoteDetail = function(noteId) {
    var note = _pnoteFindNoteById(noteId);
    if (!note) { showToast('Note not found'); return; }
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    pageEl.innerHTML = _pnoteBuildDetailHTML(note);
    pageEl.scrollTop = 0;
    var scrollEl = pageEl.querySelector('.pnote-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
    console.log('[openNoteDetail]', note.title);
  };

  window.backToNotesList = function() {
    if (typeof openPhoneApp === 'function') openPhoneApp('notes');
  };

  // ══════════════════════════════════════════════
  //  9.6 私密文件夹解锁（模块 5）
  // ══════════════════════════════════════════════

  function _pnoteBuildPasswordModalHTML() {
    return '<div class="pnote-pw-overlay" id="pnotePwOverlay" onclick="pnoteClosePasswordModal()">' +
      '<div class="pnote-pw-modal" onclick="event.stopPropagation()">' +
        '<div class="pnote-pw-icon">' + _pnoteIconLock + '</div>' +
        '<div class="pnote-pw-title">Private Folder</div>' +
        '<div class="pnote-pw-sub">Enter 4-digit password</div>' +
        '<input type="password" inputmode="numeric" maxlength="4" class="pnote-pw-input" id="pnotePwInput" onkeydown="if(event.key===\'Enter\')pnoteSubmitPassword()" />' +
        '<div class="pnote-pw-error" id="pnotePwError"></div>' +
        '<div class="pnote-pw-actions">' +
          '<button class="pnote-pw-btn pnote-pw-cancel" onclick="pnoteClosePasswordModal()">Cancel</button>' +
          '<button class="pnote-pw-btn pnote-pw-confirm" onclick="pnoteSubmitPassword()">Unlock</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  window.pnoteOpenPrivate = function() {
    // 已解锁 → 直接进
    if (_pnotePrivateUnlocked) {
      _pnoteView = 'folder:Private';
      _pnoteRerender();
      return;
    }
    // 未解锁 → 弹密码框
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    // 避免重复插入
    if (document.getElementById('pnotePwOverlay')) return;
    pageEl.insertAdjacentHTML('beforeend', _pnoteBuildPasswordModalHTML());
    setTimeout(function(){
      var input = document.getElementById('pnotePwInput');
      if (input) input.focus();
    }, 100);
  };

  window.pnoteClosePasswordModal = function() {
    var overlay = document.getElementById('pnotePwOverlay');
    if (overlay) overlay.remove();
  };

  window.pnoteSubmitPassword = function() {
    var input = document.getElementById('pnotePwInput');
    var errEl = document.getElementById('pnotePwError');
    if (!input) return;

    var entered = String(input.value || '').trim();
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var meta = _pnoteFindMeta(ownerCharId);
    var correctPass = (meta && meta.privatePassword) ? meta.privatePassword : '1234';

    if (entered === correctPass) {
      // 解锁成功
      _pnotePrivateUnlocked = true;
      window.pnoteClosePasswordModal();
      _pnoteView = 'folder:Private';
      _pnoteRerender();
      console.log('[pnoteSubmitPassword] 解锁成功');
      if (typeof showToast === 'function') showToast('Unlocked');
    } else {
      // 密码错误
      if (errEl) {
        errEl.textContent = 'Wrong password';
        errEl.style.opacity = '1';
      }
      input.value = '';
      input.classList.add('pnote-pw-input-error');
      setTimeout(function(){ input.classList.remove('pnote-pw-input-error'); }, 400);
      input.focus();
    }
  };

  // ══════════════════════════════════════════════
  //  9.7 重渲染
  // ══════════════════════════════════════════════


  // ══════════════════════════════════════════════
  //  9. 交互
  // ══════════════════════════════════════════════
  function _pnoteRerender() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;
    var bodyEl = pageEl.querySelector('.papp-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = _pnoteBuildListHTML(ownerCharId);
    setTimeout(_pnoteInjectDiceBtn, 0);
  }
  window.pnoteSelectFolder = function(folderName) {
    if (!folderName) return;
    _pnoteView = 'folder:' + folderName;
    _pnoteRerender();
  };
  window.pnoteBackToRoot = function() {
    _pnoteView = 'all';
    _pnoteRerender();
  };

  // ══════════════════════════════════════════════
  //  10. Prompt 构建
  // ══════════════════════════════════════════════
  function _pnoteBuildPrompt(ownerInfo, historyBlock, worldbookBlk, todayStr) {
    return 'You are writing the NOTES APP of a fictional phone owner.\n' +
      'The phone owner is "' + ownerInfo.name + '".\n' +
      'Today is: ' + todayStr + '\n\n' +

      '=== PHONE OWNER ===\n' + ownerInfo.block + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      historyBlock +

      '=== STEP 1: ANALYZE THE OWNER ===\n' +
      'Determine:\n' +
      '  - ORGANIZATION: high / medium / low (high = uses folders, pins, plans)\n' +
      '  - NOTE COUNT: 15-30 notes total (regardless of organization level)\n' +
      '    * High organization → closer to 25-30 (more folders, more pinned)\n' +
      '    * Medium → 18-25\n' +
      '    * Low → 15-20 (but still at least 15)\n' +
      '  - LANGUAGE: owner\'s native language\n' +
      '  - TOPICS: what they\'d note (work / study / life / ideas / diary)\n\n' +

      '=== STEP 2: PRIVATE FOLDER PASSWORD (CRITICAL) ===\n' +
      'EVERY owner has a "Private" folder containing INTIMATE/ADULT content.\n' +
      'It is protected by a 4-digit password (MMDD format).\n\n' +
      'Password extraction priority:\n' +
      '  1. Look in the PERSONA for any ANNIVERSARY (纪念日 / 記念日 / 기념일)\n' +
      '     → extract MM DD → password "MMDD" (e.g. "6月15日" → "0615")\n' +
      '  2. Look in the PERSONA for the OWNER\'S own birthday (生日)\n' +
      '     → extract MM DD → password\n' +
      '  3. Look in the CHAT HISTORY for the USER\'S birthday (mentioned dates)\n' +
      '     → extract MM DD → password\n' +
      '  4. If none of the above → use DEFAULT password "1234"\n\n' +

      '=== STEP 3: FOLDERS ===\n' +
      'Create 3-5 folders. Must include "Private" as one of them.\n' +
      'Name them in owner\'s native language (e.g. "仕事" / "プライベート" / "アイデア" / "Private").\n' +
      'IMPORTANT: The folder named "Private" MUST always be literally spelled "Private".\n\n' +

      '=== STEP 4: NOTES CONTENT ===\n' +
      'Generate notes across all folders.\n\n' +

            'Distribution (across 15-30 notes total):\n' +
      '  - 60-70% in main folders (personal / work / ideas / others)\n' +
      '  - 20-30% in Private folder (4-8 notes)\n' +
      '  - The rest distributed naturally\n\n' +

      'NOTE TYPES (choose only these two):\n' +
      '  - "text"      : plain prose (diary / thoughts / meeting notes / reminders)\n' +
      '  - "checklist" : to-do list / shopping list / packing list\n' +
      'Target ratio: 60-70% text, 30-40% checklist.\n\n' +

      'CONTENT RULES:\n' +
      '  - Normal folders: realistic notes a person would write (NOT private)\n' +
      '  - Private folder: INTIMATE / ADULT content. These are the owner\'s PRIVATE notes\n' +
      '    about their partner / desires / intimate experiences. Can be explicit.\n' +
      '    Match the owner\'s personality and the CHAT HISTORY context.\n' +
      '  - Pin 0-3 notes (the most important ones) with isPinned: true\n\n' +

      'TIME SPREAD (hoursAgo on updatedAt):\n' +
      '  - some notes: 0.1-3 (today)\n' +
      '  - some: 3-24\n' +
      '  - some: 24-168 (days ago)\n' +
      '  - some: 168-1440 (weeks ago)\n\n' +

      'LANGUAGE:\n' +
      '  - Normal notes: owner\'s native language. Non-Chinese → native FIRST, then Chinese translation in parentheses.\n' +
      '  - Private notes: SAME RULE. Keep the original language + Chinese translation.\n' +
      '  - If native language is Chinese → pure Chinese, no translation.\n\n' +

      '=== FIELD SPEC ===\n' +
      'Each note:\n' +
      '  - "title"        : short title (native language)\n' +
      '  - "preview"      : first 30-60 chars of content (or first 3 checklist items summarized)\n' +
      '  - "content"      : full text body (only for text type; "" for checklist)\n' +
      '  - "contentType"  : "text" | "checklist"\n' +
      '  - "checklistItems": [{ "text": "...", "done": true|false }] — only for checklist\n' +
      '  - "folder"       : one of the folders you defined above\n' +
      '  - "isPinned"     : true | false\n' +
      '  - "hoursAgo"     : number for updatedAt\n\n' +

      '=== OUTPUT — valid JSON only ===\n' +
      '{\n' +
      '  "privatePassword": "0615",\n' +
      '  "folders": ["仕事", "プライベート", "アイデア", "Private"],\n' +
      '  "notes": [\n' +
      '    {\n' +
      '      "title": "禅院家定例会議メモ (禅院家定期会议备忘录)",\n' +
      '      "preview": "次回の集会は12月15日。父上からの連絡事項...",\n' +
      '      "content": "次回の集会は12月15日。\\n父上からの連絡事項：\\n• 本家の年末挨拶は12月28日\\n• 財務報告書を持参すること",\n' +
      '      "contentType": "text",\n' +
      '      "folder": "仕事",\n' +
      '      "isPinned": true,\n' +
      '      "hoursAgo": 2\n' +
      '    },\n' +
      '    {\n' +
      '      "title": "買い物リスト (购物清单)",\n' +
      '      "preview": "✓ 牛乳   ○ 卵   ○ パン",\n' +
      '      "content": "",\n' +
      '      "contentType": "checklist",\n' +
      '      "checklistItems": [\n' +
      '        { "text": "牛乳", "done": true },\n' +
      '        { "text": "卵", "done": false }\n' +
      '      ],\n' +
      '      "folder": "プライベート",\n' +
      '      "isPinned": false,\n' +
      '      "hoursAgo": 26\n' +
      '    }\n' +
      '  ]\n' +
      '}\n';
  }

  // ══════════════════════════════════════════════
  //  11. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _pnoteGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollNotesData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', block: '' };

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 20) : [];
    var historyBlock = '';
    if (recent.length > 0) {
      historyBlock = '=== CHAT HISTORY (HIGH PRIORITY — extract anniversaries / birthdays / private context) ===\n';
      recent.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
      historyBlock += '\n';
    }

    var now = new Date();
    var todayStr = now.getFullYear() + '-' + ('' + (now.getMonth()+1)).padStart(2,'0') + '-' + ('' + now.getDate()).padStart(2,'0');

    var prompt = _pnoteBuildPrompt(ownerInfo, historyBlock, worldbookBlk, todayStr);
    console.log('[rollNotesData] prompt 长度:', prompt.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollNotesData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollNotesData] raw reply 长度:', rawReply.length);

    var obj = null;
    try { var jm = rawReply.match(/\{[\s\S]*\}/); if (jm) obj = JSON.parse(jm[0]); }
    catch(e) { console.warn('[rollNotesData] 完整解析失败:', e.message); }

    if (!obj) {
      console.warn('[rollNotesData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('{');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx);
        for (var cut = body.length; cut > 0; cut -= 50) {
          var probe = body.slice(0, cut);
          var opens = (probe.match(/\[/g) || []).length - (probe.match(/\]/g) || []).length;
          var bopens = (probe.match(/\{/g) || []).length - (probe.match(/\}/g) || []).length;
          for (var q = 0; q < opens; q++) probe += ']';
          for (var w = 0; w < bopens; w++) probe += '}';
          try { obj = JSON.parse(probe); console.log('[rollNotesData] 截断补救成功'); break; }
          catch(e2) {}
        }
      }
    }

    if (!obj || typeof obj !== 'object') { console.warn('[rollNotesData] 无法解析'); return null; }
    if (!Array.isArray(obj.notes)) { console.warn('[rollNotesData] 无 notes 数组'); return null; }

    // folders 归一化
    var folders = Array.isArray(obj.folders) ? obj.folders.filter(function(f){ return f && String(f).trim(); }).map(function(f){ return String(f).trim(); }) : [];
    if (folders.indexOf('Private') < 0) folders.push('Private');
    if (folders.length === 0) folders = ['Personal', 'Private'];

    // 密码归一化
    var rawPass = obj.privatePassword != null ? String(obj.privatePassword).trim() : '';
    var password = /^\d{4}$/.test(rawPass) ? rawPass : '1234';
    console.log('[rollNotesData] 密码:', password, '(AI 原始:', rawPass, ')');

    var nowTs = Date.now();
    var HOUR = 3600000;
    var out = [];

    // meta 记录
    out.push({
      id: 'notes_meta_' + ownerCharId + '_' + Date.now(),
      ownerCharId: ownerCharId,
      type: 'meta',
      privatePassword: password,
      privatePasswordHint: '',
      folders: folders
    });

    // 笔记归一化
    obj.notes.forEach(function(n, i){
      if (!n || !n.title) return;

      var contentType = (n.contentType === 'checklist') ? 'checklist' : 'text';
      var folderName = String(n.folder || folders[0]).trim();
      if (folders.indexOf(folderName) < 0) folderName = folders[0];

      var hoursAgo = parseFloat(n.hoursAgo);
      if (!isFinite(hoursAgo) || hoursAgo < 0) hoursAgo = Math.random() * 72 + 1;
      if (hoursAgo > 1440) hoursAgo = 1440;
      var updatedAt = nowTs - hoursAgo * HOUR;
      var createdAt = updatedAt - (Math.random() * 20 * 24 * HOUR);

      var checklistItems = [];
      if (contentType === 'checklist' && Array.isArray(n.checklistItems)) {
        n.checklistItems.forEach(function(it){
          if (!it || !it.text) return;
          checklistItems.push({
            text: String(it.text).trim(),
            done: !!it.done
          });
        });
      }

      var content = (contentType === 'text' && n.content != null) ? String(n.content) : '';
      var preview = (n.preview != null) ? String(n.preview).trim() : '';
      if (!preview && content) preview = content.slice(0, 60).replace(/\n/g, ' ');
      if (!preview && checklistItems.length > 0) {
        preview = checklistItems.slice(0, 3).map(function(it){ return (it.done?'✓ ':'○ ') + it.text; }).join('   ');
      }

      out.push({
        id: 'note_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        type: 'note',
        title: String(n.title).trim(),
        preview: preview,
        content: content,
        contentType: contentType,
        checklistItems: checklistItems,
        folder: folderName,
        isPinned: !!n.isPinned,
        createdAt: createdAt,
        updatedAt: updatedAt
      });
    });

    var privateCount = out.filter(function(x){ return x.type === 'note' && x.folder === 'Private'; }).length;
    console.log('[rollNotesData] 生成完成:', (out.length - 1), '条笔记（其中', privateCount, '条私密）| 文件夹:', folders.join(', '));
    return out;
  }

  // ══════════════════════════════════════════════
  //  12. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollNotesData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollNotesData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating notes...</p></div>';
    }

    var before = (state.notesData || []).length;
    state.notesData = (state.notesData || []).filter(function(n){ return n.ownerCharId !== ownerCharId; });
    console.log('[rollNotesData] 清空旧数据:', before, '→', state.notesData.length);

    _pnotePrivateUnlocked = false;   // 重新生成时锁回去
    _pnoteView = 'all';

    var notes = await _pnoteGenerateAll(ownerCharId);
    if (!notes || notes.length === 0) { showToast('Generation failed'); openPhoneApp('notes'); return; }

    notes.forEach(function(n){ state.notesData.push(n); });
    saveState();
    openPhoneApp('notes');
    showToast('Generated ' + (notes.length - 1) + ' notes');
  };

  // ══════════════════════════════════════════════
  //  13. 注册
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.notes = _pnotePageRenderer;
  } else {
    console.warn('[phone-notes.js] PHONE_APP_RENDERERS 未定义');
  }

  window.__pnoteTest = {
    buildListHTML: _pnoteBuildListHTML,
    buildPrompt: _pnoteBuildPrompt,
    generateAll: _pnoteGenerateAll,
    renderer: _pnotePageRenderer
  };

  console.log('[phone-notes.js] 已加载（模块 3）');
})();