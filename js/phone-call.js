// ==========================================================
//  PHONE CALL APP
//  - 从 messageChats 拉联系人（含 familiarity 推算）
//  - 骰子 = AI 一次生成完整数据（列表 + 对白 + 想法）
//  - 点击展开；若某条未生成，提供补生成按钮
// ==========================================================

;(function() {
  'use strict';

  // ══════════════════════════════════════════════
  //  1. 拉联系人 + familiarity 推算
  // ══════════════════════════════════════════════
  function _pcallPullContacts(ownerCharId) {
    if (!ownerCharId || !Array.isArray(state.messageChats)) return [];
    var map = {};
    state.messageChats.forEach(function(c) {
      if (!c || c.isUser) return;
      if (c.ownerCharId !== ownerCharId) return;
      var name = (c.npcName || '').trim();
      if (!name) return;
      var key = name.toLowerCase();
      if (map[key]) {
        map[key].msgCount += (c.messages || []).length;
        return;
      }
      map[key] = {
        name: name,
        nickname: c.displayName || '',
        avatar: c.avatar || null,
        msgCount: (c.messages || []).length
      };
    });
    return Object.keys(map).map(function(k) {
      var c = map[k];
      var fam;
      if (c.msgCount >= 12) fam = 'close';
      else if (c.msgCount >= 8) fam = 'friend';
      else if (c.msgCount >= 5) fam = 'acquaintance';
      else fam = 'stranger';
      return { name: c.name, nickname: c.nickname, avatar: c.avatar, familiarity: fam };
    });
  }

  // ══════════════════════════════════════════════
  //  2. 格式化辅助
  // ══════════════════════════════════════════════
  function _pcallFormatDuration(sec) {
    if (!sec) return 'Missed';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (m === 0) return s + ' sec';
    if (s === 0) return m + ' min';
    return m + ' min ' + s + ' sec';
  }

  function _pcallFormatTime12(d) {
    var h = d.getHours();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + ('' + d.getMinutes()).padStart(2,'0') + ' ' + ampm;
  }

  function _pcallFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    if (diff < 24 * 3600000) return _pcallFormatTime12(d);
    if (diff < 48 * 3600000) return 'Yesterday';
    if (diff < 7 * 24 * 3600000) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    return (d.getMonth()+1) + '/' + d.getDate();
  }

  function _pcallEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ══════════════════════════════════════════════
  //  3. 列表 HTML
  // ══════════════════════════════════════════════
  function _pcallBuildListHTML(ownerCharId) {
    var contacts = _pcallPullContacts(ownerCharId);

    if (contacts.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<path d="M14 6s-4 6-4 10 6 12 12 18 14 10 18 10 10-4 10-4l-6-8-6 4c-2 0-8-4-12-8s-8-10-8-12l4-6z"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No contacts yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Please generate chats in Messages first</div>' +
      '</div>';
    }

    var calls = (state.callHistory || []).filter(function(c){
      return c && c.ownerCharId === ownerCharId;
    }).sort(function(a, b){ return b.timestamp - a.timestamp; });

    if (calls.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<path d="M14 6s-4 6-4 10 6 12 12 18 14 10 18 10 10-4 10-4l-6-8-6 4c-2 0-8-4-12-8s-8-10-8-12l4-6z"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No call history yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var arrows = {
      in:     '<svg viewBox="0 0 16 16"><path d="M12 4L4 12M4 12V5M4 12h7" stroke="rgba(255,255,255,.4)" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
      out:    '<svg viewBox="0 0 16 16"><path d="M4 12L12 4M12 4v7M12 4H5" stroke="rgba(255,255,255,.4)" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
      missed: '<svg viewBox="0 0 16 16"><path d="M12 4L4 12M4 12V5M4 12h7" stroke="#ff453a" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>'
    };

    var h = '<div class="papp-segments"><div class="papp-seg papp-seg-active">All</div><div class="papp-seg">Missed</div></div>';

    calls.forEach(function(c) {
      var displayName = (c.contactNickname && c.contactNickname !== c.contactName)
        ? c.contactNickname + ' (' + c.contactName + ')'
        : c.contactName;
      var initial = (c.contactName || '?').charAt(0);
      var tp = c.status === 'missed' ? 'missed' : c.direction;
      var meta = c.status === 'missed' ? 'Missed' : _pcallFormatDuration(c.duration);

      h += '<div class="papp-item' + (c.status === 'missed' ? ' papp-call-missed' : '') + '" ' +
           'data-call-id="' + _pcallEscape(c.id) + '" ' +
           'onclick="pcallToggleDetail(\'' + _pcallEscape(c.id) + '\')" ' +
           'style="cursor:pointer;-webkit-tap-highlight-color:transparent">' +
        '<div class="papp-avatar papp-avatar-sm">' + (c.contactAvatar
          ? '<img src="' + _pcallEscape(c.contactAvatar) + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">'
          : _pcallEscape(initial)) + '</div>' +
        '<div class="papp-item-content">' +
          '<div class="papp-item-top">' +
            '<span class="papp-item-name">' + _pcallEscape(displayName) + '</span>' +
            '<span class="papp-item-time">' + _pcallFormatTime(c.timestamp) + '</span>' +
          '</div>' +
          '<div class="papp-item-sub">' + meta + '</div>' +
        '</div>' +
        '<div class="papp-call-icon papp-call-' + tp + '">' + arrows[tp] + '</div>' +
      '</div>';
    });

    return h;
  }

  // ══════════════════════════════════════════════
  //  4. 详情渲染
  // ══════════════════════════════════════════════
  function _pcallBuildLoadingHTML() {
    return '<div class="pcall-detail">' +
      '<div class="pcall-detail-scroll">' +
        '<div class="pcall-detail-loading">' +
          '<span></span><span></span><span></span>' +
          '<div class="pcall-detail-loading-text">Generating details…</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _pcallBuildErrorHTML(call) {
    return '<div class="pcall-detail">' +
      '<div class="pcall-detail-scroll">' +
        '<div class="pcall-detail-error">' +
          '<div class="pcall-detail-error-text">详情未生成或生成失败</div>' +
          '<button class="pcall-detail-retry-btn" onclick="event.stopPropagation();pcallRetryDetail(\'' + _pcallEscape(call.id) + '\')">生成详情</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _pcallBuildDetailHTML(call) {
    var d = call._detail;
    if (!d || d._error) return _pcallBuildErrorHTML(call);

    var h = '<div class="pcall-detail">';
    h += '<div class="pcall-detail-scroll">';

    if (call.status === 'missed') {
      if (d.voicemail && String(d.voicemail).trim()) {
        h += '<div class="pcall-voicemail">' +
          '<div class="pcall-voicemail-label">留言</div>' +
          '<div class="pcall-voicemail-text">' + _pcallEscape(d.voicemail) + '</div>' +
        '</div>';
      } else {
        h += '<div class="pcall-voicemail-empty">（无留言）</div>';
      }
    } else {
      var transcript = Array.isArray(d.transcript) ? d.transcript : [];
      if (transcript.length === 0) {
        h += '<div class="pcall-voicemail-empty">（无对白）</div>';
      } else {
        transcript.forEach(function(line){
          var speakerRaw = (line.speaker || '').toLowerCase();
          var isOwner = (speakerRaw === 'owner');
          var speakerName = isOwner
            ? (d._ownerName || '我')
            : (call.contactNickname && call.contactNickname !== call.contactName
                ? call.contactNickname
                : call.contactName);
          h += '<div class="pcall-line">' +
            '<span class="pcall-speaker' + (isOwner ? ' pcall-speaker-owner' : '') + '">' +
              _pcallEscape(speakerName) + ':' +
            '</span>' +
            '<span class="pcall-text">' + _pcallEscape(line.text || '') + '</span>' +
          '</div>';
        });
      }
    }

    h += '</div>';

    if (d.thoughts && String(d.thoughts).trim()) {
      h += '<div class="pcall-thoughts">' + _pcallEscape(d.thoughts) + '</div>';
    }

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  5. 查找 + 重绘 + 点击展开
  // ══════════════════════════════════════════════
  function _pcallFindById(callId) {
    var arr = state.callHistory || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === callId) return arr[i];
    }
    return null;
  }

  function _pcallRefreshRow(callId) {
    var row = document.querySelector('#phoneAppPage .papp-item[data-call-id="' + callId + '"]');
    if (!row) return;
    var next = row.nextElementSibling;
    var existing = (next && next.classList && next.classList.contains('pcall-detail')) ? next : null;
    if (!existing) return;
    var call = _pcallFindById(callId);
    if (!call) return;
    existing.outerHTML = _pcallBuildDetailHTML(call);
  }

  window.pcallToggleDetail = function(callId) {
    var call = _pcallFindById(callId);
    if (!call) { console.warn('[pcallToggleDetail] call not found:', callId); return; }

    var row = document.querySelector('#phoneAppPage .papp-item[data-call-id="' + callId + '"]');
    if (!row) { console.warn('[pcallToggleDetail] row not found:', callId); return; }

    var next = row.nextElementSibling;
    var existing = (next && next.classList && next.classList.contains('pcall-detail')) ? next : null;

    if (existing) { existing.remove(); console.log('[pcallToggleDetail] 收起:', call.contactName); return; }

    row.insertAdjacentHTML('afterend', _pcallBuildDetailHTML(call));
    console.log('[pcallToggleDetail] 展开:', call.contactName, '| status:', call.status,
      '| hasDetail:', !!(call._detail && !call._detail._error));
  };

  // ══════════════════════════════════════════════
  //  6. 单条补生成详情（降级方案）
  // ══════════════════════════════════════════════
  function _pcallBuildDetailPrompt(call, ownerInfo, historyBlock) {
    var ownerLang = ownerInfo.lang;
    var ownerBlock = ownerInfo.block;
    var isMissed = (call.status === 'missed');

    var timeStr = (function(){
      var d = new Date(call.timestamp);
      var h = d.getHours();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return h + ':' + ('' + d.getMinutes()).padStart(2,'0') + ' ' + ampm;
    })();

    var contactLabel = call.contactNickname && call.contactNickname !== call.contactName
      ? call.contactName + ' (备注: ' + call.contactNickname + ')'
      : call.contactName;

    var langRule = ownerLang === 'zh'
      ? '   - Phone owner is Chinese → write Chinese ONLY.\n'
      : '   - Phone owner speaks a NON-Chinese language.\n' +
        '     ALL text MUST be in native language FIRST, then Chinese translation in parentheses.\n' +
        '     Format: "こんにちは (你好)" / "Hello (你好)"\n';

    var taskBlock = isMissed
      ? '=== TASK (MISSED CALL) ===\n' +
        'RULES:\n' +
        '1. "voicemail": caller\'s message OR "" (~50% have voicemail). 1~3 sentences.\n' +
        '2. "thoughts": owner\'s inner monologue, 1~2 sentences, first person.\n\n'
      : '=== TASK (ANSWERED CALL) ===\n' +
        'RULES:\n' +
        '1. "transcript": array of { "speaker": "owner"|"contact", "text": "..." }, 6~14 lines.\n' +
        '2. "thoughts": owner\'s inner monologue after hanging up, 1~2 sentences.\n\n';

    var jsonShape = isMissed
      ? '{\n  "voicemail": "...",\n  "thoughts": "..."\n}\n'
      : '{\n  "transcript": [\n    { "speaker": "contact", "text": "..." },\n    { "speaker": "owner", "text": "..." }\n  ],\n  "thoughts": "..."\n}\n';

    return 'Write the DETAILS of a single phone call.\n\n' +
      '=== PHONE OWNER ===\n' + ownerBlock + '\n' +
      '=== THIS CALL ===\n' +
      '  - Contact: ' + contactLabel + '\n' +
      '  - Direction: ' + (call.direction === 'out' ? 'outgoing' : 'incoming') + '\n' +
      '  - Status: ' + (isMissed ? 'MISSED' : 'ANSWERED') + '\n' +
      '  - Time: ' + timeStr + '\n' +
      '  - Duration: ' + _pcallFormatDuration(call.duration) + '\n\n' +
      historyBlock +
      taskBlock +
      '=== LANGUAGE ===\n' + langRule + '\n' +
      'Return ONLY valid JSON:\n' + jsonShape;
  }

  async function _pcallGenerateDetail(call) {
    if (call._detailLoading) return;
    call._detailLoading = true;

    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { call._detailLoading = false; call._detail = { _error: true }; return; }
    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', lang: 'zh', block: '' };

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); call._detailLoading = false; call._detail = { _error: true }; return; }

    var oid = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    var recent = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(oid, 15) : [];
    var historyBlock = '';
    if (recent.length > 0) {
      historyBlock = '=== RECENT iMESSAGE ===\n';
      recent.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
      historyBlock += '\n';
    }

    var prompt = _pcallBuildDetailPrompt(call, ownerInfo, historyBlock);
    console.log('[pcallGenerateDetail] contact=' + call.contactName + ' | prompt len=' + prompt.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) {
      console.error('[pcallGenerateDetail] API error:', e);
      call._detailLoading = false; call._detail = { _error: true };
      saveState(); _pcallRefreshRow(call.id);
      return;
    }

    var detail = null;
    try { var jm = rawReply.match(/\{[\s\S]*\}/); if (jm) detail = JSON.parse(jm[0]); }
    catch(pe) { console.error('[pcallGenerateDetail] parse error:', pe); }

    if (!detail || typeof detail !== 'object') {
      call._detailLoading = false; call._detail = { _error: true };
      saveState(); _pcallRefreshRow(call.id);
      return;
    }

    var norm = {};
    if (call.status === 'missed') {
      norm.voicemail = (detail.voicemail != null) ? String(detail.voicemail).trim() : '';
    } else {
      var tr = Array.isArray(detail.transcript) ? detail.transcript : [];
      norm.transcript = tr.map(function(line){
        var sp = String(line.speaker || '').toLowerCase();
        return {
          speaker: (sp === 'owner' || sp === 'me' || sp === 'self') ? 'owner' : 'contact',
          text: String(line.text || line.content || '').trim()
        };
      }).filter(function(l){ return l.text.length > 0; });
    }
    norm.thoughts = (detail.thoughts != null) ? String(detail.thoughts).trim() : '';
    norm._ownerName = ownerInfo.name;
    norm._generatedAt = Date.now();

    call._detail = norm;
    call._detailLoading = false;
    console.log('[pcallGenerateDetail] 完成:', call.contactName);
    saveState();
    _pcallRefreshRow(call.id);
  }

  window.pcallRetryDetail = function(callId) {
    var call = _pcallFindById(callId);
    if (!call) return;
    var row = document.querySelector('#phoneAppPage .papp-item[data-call-id="' + callId + '"]');
    if (!row) return;
    var next = row.nextElementSibling;
    var existing = (next && next.classList && next.classList.contains('pcall-detail')) ? next : null;
    if (!existing) return;
    existing.outerHTML = _pcallBuildLoadingHTML();
    delete call._detail;
    _pcallGenerateDetail(call);
  };

  // ══════════════════════════════════════════════
  //  7. 骰子按钮
  // ══════════════════════════════════════════════
  function _pcallInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollCallHistory()" title="Generate Call History">' +
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
  //  8. 主渲染
  // ══════════════════════════════════════════════
  function _pcallPageRenderer(charName) {
    setTimeout(_pcallInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pcallBuildListHTML(ownerCharId);
  }

  // ══════════════════════════════════════════════
  //  9. 一次性 Prompt（列表 + 全部详情）
  // ══════════════════════════════════════════════
  function _pcallBuildPrompt(ownerInfo, contacts, historyBlock, worldbookBlk) {
    var ownerName = ownerInfo.name;
    var ownerLang = ownerInfo.lang;
    var ownerBlock = ownerInfo.block;

    var contactsText = contacts.map(function(c, i){
      var nick = (c.nickname && c.nickname !== c.name) ? ' (备注: ' + c.nickname + ')' : '';
      return (i + 1) + '. ' + c.name + nick + ' [familiarity: ' + c.familiarity + ']';
    }).join('\n');

    var langNote = ownerLang === 'zh'
      ? '   - Phone owner is Chinese — write Chinese ONLY. No translation brackets.\n'
      : '   - Phone owner speaks a NON-Chinese language.\n' +
        '     ALL text (dialogue, voicemail, thoughts) MUST be in the speaker\'s native language FIRST,\n' +
        '     then a Chinese translation in parentheses on the SAME line.\n' +
        '     Format: "こんにちは (你好)" / "Hello (你好)" / "안녕 (你好)"\n';

    var prompt =
      'You are generating a REALISTIC CALL HISTORY for a phone owner.\n' +
      'The phone owner is "' + ownerName + '".\n\n' +

      '=== PHONE OWNER ===\n' + ownerBlock + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      historyBlock +

      '=== CONTACTS (from their Messages app) ===\n' +
      contactsText + '\n\n' +

      '=== TASK ===\n' +
      'Generate call records WITH FULL DETAILS (transcript / voicemail / owner thoughts).\n' +
      'NOT every contact needs a call.\n\n' +

      '=== HOW MANY CALLS TOTAL — read phone owner personality ===\n' +
      '   - Very social / extroverted / outgoing / talkative / 热情开朗 / 社交达人\n' +
      '       → 12-16 calls total\n' +
      '   - Moderately social / ordinary\n' +
      '       → 8-12 calls total\n' +
      '   - Introverted / quiet / cold / antisocial / 孤僻冷漠 / 不善社交\n' +
      '       → 5-8 calls total\n\n' +

      '=== CALLS PER CONTACT (by familiarity) ===\n' +
      '   - close        → 2-3 calls, dialogs 8-12 lines each\n' +
      '   - friend       → 1-2 calls, dialogs 6-10 lines each\n' +
      '   - acquaintance → 1 call,   dialogs 4-6 lines\n' +
      '   - stranger     → 1 call,   dialogs 3-5 lines (or missed only)\n\n' +

      '=== FIELD SPEC ===\n' +
      'For EACH call:\n' +
      '  - "contactName" : EXACT copy from list above\n' +
      '  - "direction"   : "in" | "out"\n' +
      '  - "status"      : "answered" | "missed"\n' +
      '  - "duration"    : seconds (answered: 30~2400; missed: 0)\n' +
      '  - "hoursAgo"    : 0.1 ~ 1440 (spread!)\n' +
      '  - IF answered   : include "transcript": [ { "speaker": "owner"|"contact", "text": "..." } ]\n' +
      '  - IF missed     : include "voicemail": string OR ""\n' +
      '  - ALWAYS        : include "thoughts": 1-2 sentences (owner\'s voice)\n\n' +

      '=== CRITICAL ===\n' +
      '1. contactName MUST be exact. Do NOT invent names.\n' +
      '2. hoursAgo MUST spread across ranges: some 0.1~3, some 3~24, some 24~168, some 168~1440.\n' +
      '3. Answer rate by personality (social→80%+ answered, cold→40-60% missed).\n' +
      '4. MIXED status: include BOTH answered AND missed.\n' +
      '5. ' + langNote +
      '6. Content matches owner persona, contact persona, recent iMessage.\n\n' +

      '=== OUTPUT — return ONLY valid JSON array (no markdown) ===\n' +
      '[\n' +
      '  {\n' +
      '    "contactName": "Mom",\n' +
      '    "direction": "in",\n' +
      '    "status": "answered",\n' +
      '    "duration": 492,\n' +
      '    "hoursAgo": 2,\n' +
      '    "transcript": [\n' +
      '      { "speaker": "contact", "text": "吃了吗 (Did you eat?)" },\n' +
      '      { "speaker": "owner", "text": "吃了 (Ate)" }\n' +
      '    ],\n' +
      '    "thoughts": "..."\n' +
      '  },\n' +
      '  {\n' +
      '    "contactName": "Mr. Davis",\n' +
      '    "direction": "in",\n' +
      '    "status": "missed",\n' +
      '    "duration": 0,\n' +
      '    "hoursAgo": 26,\n' +
      '    "voicemail": "...",\n' +
      '    "thoughts": "..."\n' +
      '  }\n' +
      ']\n';

    return prompt;
  }

  // ══════════════════════════════════════════════
  //  10. 调用 AI + 解析（含截断补救）
  // ══════════════════════════════════════════════
  async function _pcallGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollCallHistory] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', lang: 'zh', block: '' };

    var contacts = _pcallPullContacts(ownerCharId);
    if (contacts.length === 0) { console.warn('[rollCallHistory] 无联系人'); return null; }

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';
    var recentHistory = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 15) : [];
    var historyBlock = '';
    if (recentHistory.length > 0) {
      historyBlock = '=== RECENT iMESSAGE (owner ↔ user) ===\n';
      recentHistory.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
      historyBlock += '\n';
    }

    var prompt = _pcallBuildPrompt(ownerInfo, contacts, historyBlock, worldbookBlk);
    console.log('[rollCallHistory] prompt 长度:', prompt.length, '| 联系人数:', contacts.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollCallHistory] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollCallHistory] raw reply 长度:', rawReply.length);

    // 尝试 1：完整 JSON
    var arr = null;
    var jm = rawReply.match(/\[[\s\S]*\]/);
    if (jm) { try { arr = JSON.parse(jm[0]); } catch(e) { console.warn('[rollCallHistory] 完整解析失败:', e.message); } }

    // 尝试 2：截断补救
    if (!arr) {
      console.warn('[rollCallHistory] 尝试截断补救...');
      var startIdx = rawReply.indexOf('[');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx + 1);
        var lastBrace = body.lastIndexOf('}');
        if (lastBrace >= 0) {
          var truncated = '[' + body.slice(0, lastBrace + 1) + ']';
          try { arr = JSON.parse(truncated); console.log('[rollCallHistory] 截断补救成功:', arr.length, '条'); }
          catch(e) { console.error('[rollCallHistory] 截断补救失败:', e); }
        }
      }
    }

    if (!Array.isArray(arr)) { console.warn('[rollCallHistory] 无法解析 JSON'); return null; }
    console.log('[rollCallHistory] AI 返回条数:', arr.length);

    // 归一化
    var now = Date.now();
    var HOUR = 3600000;
    var validNames = {};
    contacts.forEach(function(c){ validNames[c.name.toLowerCase()] = c; });

    var out = [];
    arr.forEach(function(item, i){
      if (!item || !item.contactName) return;
      var key = String(item.contactName).trim().toLowerCase();
      var ct = validNames[key];
      if (!ct) { console.warn('[rollCallHistory] 跳过未知联系人:', item.contactName); return; }

      var direction = (item.direction === 'out') ? 'out' : 'in';
      var status = (item.status === 'missed') ? 'missed' : 'answered';

      var hoursAgo = parseFloat(item.hoursAgo);
      if (!isFinite(hoursAgo) || hoursAgo < 0) hoursAgo = Math.random() * 72 + 1;
      if (hoursAgo > 1440) hoursAgo = 1440;

      var duration = parseInt(item.duration, 10);
      if (status === 'missed') duration = 0;
      else {
        if (!isFinite(duration) || duration <= 0) duration = 60 + Math.floor(Math.random() * 900);
        if (duration > 3600) duration = 3600;
      }

      var detail = null;
      if (status === 'missed') {
        var vm = (item.voicemail != null) ? String(item.voicemail).trim() : '';
        var th = (item.thoughts != null) ? String(item.thoughts).trim() : '';
        if (vm || th) detail = { voicemail: vm, thoughts: th, _ownerName: ownerInfo.name, _generatedAt: now };
      } else {
        var tr = Array.isArray(item.transcript) ? item.transcript : [];
        var trNorm = tr.map(function(line){
          var sp = String(line.speaker || '').toLowerCase();
          return { speaker: (sp === 'owner' || sp === 'me' || sp === 'self') ? 'owner' : 'contact', text: String(line.text || line.content || '').trim() };
        }).filter(function(l){ return l.text.length > 0; });
        var th2 = (item.thoughts != null) ? String(item.thoughts).trim() : '';
        if (trNorm.length > 0 || th2) detail = { transcript: trNorm, thoughts: th2, _ownerName: ownerInfo.name, _generatedAt: now };
      }

      out.push({
        id: 'call_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        contactName: ct.name,
        contactNickname: ct.nickname,
        contactAvatar: ct.avatar,
        direction: direction,
        status: status,
        duration: duration,
        timestamp: now - hoursAgo * HOUR,
        _detail: detail,
        _detailLoading: false
      });
    });

    out.sort(function(a, b){ return b.timestamp - a.timestamp; });
    var withDetail = out.filter(function(c){ return !!c._detail; }).length;
    console.log('[rollCallHistory] 生成完成:', out.length, '条，其中', withDetail, '条含详情');
    return out;
  }

  // ══════════════════════════════════════════════
  //  11. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollCallHistory = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollCallHistory] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating call history...</p></div>';
    }

    var before = (state.callHistory || []).length;
    state.callHistory = (state.callHistory || []).filter(function(c){ return c.ownerCharId !== ownerCharId; });
    console.log('[rollCallHistory] 清空旧数据:', before, '→', state.callHistory.length);

    var calls = await _pcallGenerateAll(ownerCharId);
    if (!calls || calls.length === 0) { showToast('Generation failed'); openPhoneApp('phone_call'); return; }

    calls.forEach(function(c){ state.callHistory.push(c); });
    saveState();
    openPhoneApp('phone_call');
    showToast('Generated ' + calls.length + ' call records');
  };

  // ══════════════════════════════════════════════
  //  12. 注册 + 测试挂载
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.phone_call = _pcallPageRenderer;
  } else {
    console.warn('[phone-call.js] PHONE_APP_RENDERERS 未定义');
  }

  window.__pcallTest = {
    pullContacts: _pcallPullContacts,
    buildListHTML: _pcallBuildListHTML,
    formatDuration: _pcallFormatDuration,
    formatTime: _pcallFormatTime,
    buildPrompt: _pcallBuildPrompt,
    generateAll: _pcallGenerateAll,
    renderer: _pcallPageRenderer
  };

  console.log('[phone-call.js] 已加载（模块 7：一次性生成）');
})();