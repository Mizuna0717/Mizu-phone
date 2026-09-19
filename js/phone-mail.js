// ==========================================================
//  PHONE MAIL APP
//  模块 3：骰子 + AI 一次性生成（列表 + 正文 + 反应）
// ==========================================================

;(function() {
  'use strict';

  // ══════════════════════════════════════════════
  //  1. 从 messageChats 拉联系人 + familiarity 推算
  // ══════════════════════════════════════════════
  function _pmailPullContacts(ownerCharId) {
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
      return { name: c.name, nickname: c.nickname, familiarity: fam };
    });
  }

  // ══════════════════════════════════════════════
  //  2. 时间格式化
  // ══════════════════════════════════════════════
  function _pmailFormatTime12(d) {
    var h = d.getHours();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + ('' + d.getMinutes()).padStart(2,'0') + ' ' + ampm;
  }
  function _pmailFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    if (diff < 24 * 3600000) return _pmailFormatTime12(d);
    if (diff < 48 * 3600000) return 'Yesterday';
    if (diff < 7 * 24 * 3600000) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    return (d.getMonth()+1) + '/' + d.getDate();
  }

  // ══════════════════════════════════════════════
  //  3. HTML 转义
  // ══════════════════════════════════════════════
  function _pmailEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ══════════════════════════════════════════════
  //  4. 列表 HTML
  // ══════════════════════════════════════════════
  function _pmailBuildListHTML(ownerCharId) {
    var mails = (state.mailData || []).filter(function(m){
      return m && m.ownerCharId === ownerCharId;
    }).sort(function(a, b){ return b.timestamp - a.timestamp; });

    if (mails.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<rect x="6" y="12" width="36" height="26" rx="3"/>' +
          '<path d="M6 16l18 12 18-12"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">Inbox is empty</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var unreadCount = mails.filter(function(m){ return !m.isRead; }).length;

    var h = '';
    h += '<div style="padding:12px 16px 4px;color:rgba(255,255,255,.3);font-size:13px">' +
      'Inbox (' + unreadCount + ' unread)' +
    '</div>';

    mails.forEach(function(m) {
      var isUnread = !m.isRead;
      var isStarred = !!m.isStarred;
      var from = m.from || '(No sender)';
      var subject = m.subject || '(No subject)';
      var fromEmail = m.fromEmail || '';

      h += '<div class="papp-item" style="align-items:flex-start;gap:10px;cursor:pointer;-webkit-tap-highlight-color:transparent" data-mail-id="' + _pmailEscape(m.id) + '" onclick="openMailDetail(\'' + _pmailEscape(m.id) + '\')">';
      h += isUnread ? '<div class="papp-mail-dot"></div>' : '<div class="papp-mail-dot-spacer"></div>';
      h += '<div class="papp-item-content">';

      h += '<div class="papp-item-top">';
      h += '<span class="papp-item-name"' + (isUnread ? ' style="font-weight:700"' : '') + '>' +
        _pmailEscape(from) +
        (isStarred ? ' <span class="papp-mail-star">' + _pmailIconStar + '</span>' : '') +
      '</span>';
      h += '<span class="papp-item-time">' + _pmailFormatTime(m.timestamp) + '</span>';
      h += '</div>';

      if (fromEmail) {
        h += '<div class="papp-mail-from-email">' + _pmailEscape(fromEmail) + '</div>';
      }

      h += '<div class="papp-mail-subject">' + _pmailEscape(subject) + '</div>';
      h += '</div>';
      h += '<span class="papp-item-chevron">></span>';
      h += '</div>';
    });

    return h;
  }

  // ══════════════════════════════════════════════
  //  5. 骰子按钮
  // ══════════════════════════════════════════════
  function _pmailInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollMailData()" title="Generate Mail">' +
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
  //  6. 主渲染
  // ══════════════════════════════════════════════
  function _pmailPageRenderer(charName) {
    setTimeout(_pmailInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _pmailBuildListHTML(ownerCharId);
  }

    // ══════════════════════════════════════════════
  //  6.5 详情页（模块 4）
  // ══════════════════════════════════════════════

    // 头像颜色（基于名字 hash 到固定调色板）
  function _pmailAvatarColor(name) {
    var palette = ['#5e5ce6','#0a84ff','#30d158','#ff9f0a','#ff375f','#bf5af2','#32ade6','#5ac8fa'];
    var sum = 0;
    name = String(name || '?');
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return palette[sum % palette.length];
  }

  // SVG 图标常量
  var _pmailIconCheck = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M3.5 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var _pmailIconEye   = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg>';
  var _pmailIconStar  = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none"><path d="M8 1.8l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.7 4 13.8l.9-4.4-3.3-3 4.5-.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  var _pmailIconDot   = '<svg viewBox="0 0 16 16" width="10" height="10"><circle cx="8" cy="8" r="3.5" fill="currentColor"/></svg>';
  var _pmailIconQuote = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M5 4.5c-1.7 0-3 1.3-3 3s1.3 3 3 3c0 1.5-1 2.5-2.5 2.5M12 4.5c-1.7 0-3 1.3-3 3s1.3 3 3 3c0 1.5-1 2.5-2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // 角色自己的邮箱（确定性生成，同一角色永远一样）
  function _pmailOwnerEmail(ownerCharId) {
    var s = String(ownerCharId || 'x');
    var sum = 0;
    for (var i = 0; i < s.length; i++) sum = ((sum * 31) + s.charCodeAt(i)) >>> 0;

    var users = ['nao','kai','rin','ren','yuki','sora','aki','ken','ryo','shin','haru','tsuki','ao','makoto','sou','jin','hiro','minato'];
    var providers = ['icloud.com','gmail.com','outlook.com','yahoo.com','proton.me'];

    var u = users[sum % users.length];
    var p = providers[(sum >>> 5) % providers.length];
    var n = 10 + (sum % 90);
    return u + n + '@' + p;
  }

  // 查找 mail by id
  function _pmailFindById(mailId) {
    var arr = state.mailData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === mailId) return arr[i];
    }
    return null;
  }

    // 构建详情页 HTML
  function _pmailBuildDetailHTML(mail) {
    var d = new Date(mail.timestamp);
    var timeStr = (function() {
      var h = d.getHours();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return h + ':' + ('' + d.getMinutes()).padStart(2,'0') + ' ' + ampm;
    })();
    var dateStr = (function() {
      var now = new Date();
      var isToday = now.toDateString() === d.toDateString();
      var yest = new Date(now); yest.setDate(yest.getDate() - 1);
      var isYesterday = yest.toDateString() === d.toDateString();
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return months[d.getMonth()] + ' ' + d.getDate();
    })();

    var avatarColor = _pmailAvatarColor(mail.from);
    var initial = String(mail.from || '?').trim().charAt(0).toUpperCase();

    var h = '<div class="pmail-detail-page">';

    // ── 顶栏 ──
    h += '<div class="pmail-detail-header">' +
      '<button class="pmail-detail-back" onclick="backToMailList()">' +
        '<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><path d="M12 4l-6 6 6 6" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="pmail-detail-title">Mail</div>' +
      '<div class="pmail-detail-header-right"></div>' +
    '</div>';

    // ── 可滚动内容 ──
    h += '<div class="pmail-detail-scroll">';

    // 发件人区
    h += '<div class="pmail-sender-block">';
    h += '<div class="pmail-sender-avatar" style="background:' + avatarColor + '">' + _pmailEscape(initial) + '</div>';
    h += '<div class="pmail-sender-info">';
    h += '<div class="pmail-sender-name">' + _pmailEscape(mail.from) + '</div>';
    if (mail.fromEmail) {
      h += '<div class="pmail-sender-email">' + _pmailEscape(mail.fromEmail) + '</div>';
    }
    h += '</div>';
    h += '<div class="pmail-sender-time">' + dateStr + ' ' + timeStr + '</div>';
    h += '</div>';

    // 收件人
       // 收件人（角色自己的邮箱）
    var ownerEmail = _pmailOwnerEmail(mail.ownerCharId);
    h += '<div class="pmail-recipient-line">To: ' + _pmailEscape(ownerEmail) + '</div>';

    // 主题
    h += '<div class="pmail-subject-line">' + _pmailEscape(mail.subject || '(No subject)') + '</div>';

    // 正文
    h += '<div class="pmail-body-text">' + _pmailEscape(mail.body || '(No content)') + '</div>';

    // ── 反应区 ──
    if (mail.reaction) {
      var r = mail.reaction;
      h += '<div class="pmail-reaction-section">';

            // 反应标记（无图标，纯文字）
      h += '<div class="pmail-reaction-tag pmail-reaction-tag-' + r.type + '">';
      if (r.type === 'replied') {
        h += '<span>已回复</span>';
      } else if (r.type === 'read_no_reply') {
        h += '<span>已读 · 未回复</span>';
      } else if (r.type === 'unread') {
        h += '<span>未读</span>';
      } else if (r.type === 'starred_only') {
        h += '<span>已加星标</span>';
      }
      h += '</div>';

      // 回信卡片（仅 replied）
      if (r.type === 'replied' && r.replyBody) {
        var rt = '';
        if (r.replyTimestamp) {
          var rd = new Date(r.replyTimestamp);
          var rh = rd.getHours();
          var ramp = rh >= 12 ? 'PM' : 'AM';
          rh = rh % 12 || 12;
          rt = rh + ':' + ('' + rd.getMinutes()).padStart(2,'0') + ' ' + ramp;
        }
        h += '<div class="pmail-reply-card">';
        h += '<div class="pmail-reply-card-header">';
        h += '<span class="pmail-reply-card-to">回复 ' + _pmailEscape(mail.from) + '</span>';
        if (rt) h += '<span class="pmail-reply-card-time">' + rt + '</span>';
        h += '</div>';
        h += '<div class="pmail-reply-card-body">' + _pmailEscape(r.replyBody) + '</div>';
        h += '</div>';
      }

      // 想法
      if (r.thoughts) {
        h += '<div class="pmail-thoughts-block">';
        h += '<div class="pmail-thoughts-label"><span class="pmail-tag-icon">' + _pmailIconQuote + '</span><span>内心想法</span></div>';
        h += '<div class="pmail-thoughts-text">' + _pmailEscape(r.thoughts) + '</div>';
        h += '</div>';
      }

      h += '</div>'; // /reaction-section
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /detail-page

    return h;
  }

  // 打开详情页（替换 #phoneAppPage）
  window.openMailDetail = function(mailId) {
    var mail = _pmailFindById(mailId);
    if (!mail) { showToast('Mail not found'); return; }

    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;

    // 标记已读
    if (!mail.isRead) {
      mail.isRead = true;
      saveState();
    }

    pageEl.innerHTML = _pmailBuildDetailHTML(mail);
    pageEl.scrollTop = 0;

    var scrollEl = pageEl.querySelector('.pmail-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;

    console.log('[openMailDetail]', mail.from, '|', mail.subject);
  };

  // 返回列表
  window.backToMailList = function() {
    if (typeof openPhoneApp === 'function') openPhoneApp('mail');
  };


  // ══════════════════════════════════════════════
  //  7. Prompt 构建
  // ══════════════════════════════════════════════
  function _pmailBuildPrompt(ownerInfo, contacts, historyBlock, worldbookBlk) {
    var ownerName = ownerInfo.name;
    var ownerLang = ownerInfo.lang;
    var ownerBlock = ownerInfo.block;

    var contactsText = contacts.length > 0
      ? contacts.map(function(c, i){
          var nick = (c.nickname && c.nickname !== c.name) ? ' (备注: ' + c.nickname + ')' : '';
          return (i + 1) + '. ' + c.name + nick + ' [familiarity: ' + c.familiarity + ']';
        }).join('\n')
      : '(none — you must invent plausible personal contacts too)';

    var langRule = ownerLang === 'zh'
      ? '   - Phone owner is Chinese → write Chinese ONLY. No translation brackets.\n'
      : '   - Phone owner speaks a NON-Chinese language.\n' +
        '     ALL text (subject, body, thoughts, replyBody) MUST be written in the native language FIRST,\n' +
        '     then a Chinese translation in parentheses on the SAME line.\n' +
        '     Format: "おはよう (早上好)" / "Hello (你好)" / "안녕 (你好)"\n' +
        '   - Even commercial / system emails follow this rule.\n';

    var prompt =
      'You are writing a realistic INBOX for a fictional phone owner.\n' +
      'The phone owner is "' + ownerName + '".\n\n' +

      '=== PHONE OWNER ===\n' + ownerBlock + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      historyBlock +

      '=== CONTACTS (from their Messages app) ===\n' +
      contactsText + '\n\n' +

      '=== TASK ===\n' +
      'Generate a complete inbox WITH full email bodies AND the owner\'s reaction.\n\n' +

      '=== TOTAL EMAILS — based on phone owner personality ===\n' +
      '   - Very social / extroverted / outgoing / talkative / 热情开朗 / 社交达人 → 10-15\n' +
      '   - Moderately social / ordinary → 7-12\n' +
      '   - Introverted / quiet / cold / antisocial / 孤僻冷漠 / 不善社交 → 5-8\n\n' +

      '=== EMAIL SOURCES (must be mixed) ===\n' +
      '   - 40-50% from the contacts above (personal emails, use their exact names)\n' +
      '   - 30-40% commercial/subscription (Netflix / Spotify / Amazon / 银行 / 促销 等)\n' +
      '   - 10-20% system/transactional (验证码 / 快递 / 账单 / 发票 等)\n\n' +

      '=== TIME SPREAD (hoursAgo) ===\n' +
      '   Must span across all ranges:\n' +
      '   - some: 0.1 ~ 3     (just now / today)\n' +
      '   - some: 3 ~ 24      (earlier / yesterday)\n' +
      '   - some: 24 ~ 168    (a few days ago)\n' +
      '   - some: 168 ~ 1440  (weeks / months ago)\n\n' +

      '=== READ STATE ===\n' +
      '   - 60-70% isRead: true\n' +
      '   - 30-40% isRead: false\n' +
      '   - 10-20% can be starred (isStarred: true)\n\n' +

      '=== REACTION (must include on EVERY email) ===\n' +
      '   reaction.type MUST be one of: "replied" | "read_no_reply" | "unread" | "starred_only"\n' +
      '   Distribution:\n' +
      '   - Personal emails : 60% "replied", 30% "read_no_reply", 10% "unread"\n' +
      '   - Commercial      : 90% "read_no_reply", 10% "unread"\n' +
      '   - System          : 80% "read_no_reply", 20% "unread"\n' +
      '   Rules:\n' +
      '   - If type = "replied" → MUST include "replyBody" (30-100 chars) AND "replyHoursAgo"\n' +
      '   - If type = "starred_only" → set isStarred: true on the email itself\n' +
      '   - ALWAYS include "thoughts" — owner\'s inner voice, 1-2 sentences\n\n' +

      '=== LANGUAGE ===\n' + langRule + '\n' +

      '=== FIELD SPEC ===\n' +
      'Each email:\n' +
      '  - "from"       : sender display name (use exact contact name if personal)\n' +
      '  - "fromEmail"  : sender email (e.g. "alex@example.com" / "info@netflix.com")\n' +
      '  - "to"         : "我"\n' +
      '  - "subject"    : email subject line\n' +
      '  - "body"       : email body (50-200 chars, use \\n for line breaks)\n' +
      '  - "hoursAgo"   : number\n' +
      '  - "isRead"     : true | false\n' +
      '  - "isStarred"  : true | false\n' +
      '  - "isCommercial": true (commercial/system) | false (personal)\n' +
      '  - "reaction"   : { "type": "...", "replyBody": "...", "replyHoursAgo": N, "thoughts": "..." }\n\n' +

      '=== OUTPUT — return ONLY a valid JSON array ===\n' +
      '[\n' +
      '  {\n' +
      '    "from": "Alex Chen",\n' +
      '    "fromEmail": "alex@example.com",\n' +
      '    "to": "我",\n' +
      '    "subject": "Re: Project update",\n' +
      '    "body": "...",\n' +
      '    "hoursAgo": 2,\n' +
      '    "isRead": false,\n' +
      '    "isStarred": false,\n' +
      '    "isCommercial": false,\n' +
      '    "reaction": {\n' +
      '      "type": "read_no_reply",\n' +
      '      "thoughts": "..."\n' +
      '    }\n' +
      '  }\n' +
      ']\n';

    return prompt;
  }

  // ══════════════════════════════════════════════
  //  8. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _pmailGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollMailData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', lang: 'zh', block: '' };

    var contacts = _pmailPullContacts(ownerCharId);

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

    var prompt = _pmailBuildPrompt(ownerInfo, contacts, historyBlock, worldbookBlk);
    console.log('[rollMailData] prompt 长度:', prompt.length, '| 联系人数:', contacts.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollMailData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollMailData] raw reply 长度:', rawReply.length);

    // 尝试完整 JSON
    var arr = null;
    var jm = rawReply.match(/\[[\s\S]*\]/);
    if (jm) { try { arr = JSON.parse(jm[0]); } catch(e) { console.warn('[rollMailData] 完整解析失败:', e.message); } }

    // 截断补救
    if (!arr) {
      console.warn('[rollMailData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('[');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx + 1);
        var lastBrace = body.lastIndexOf('}');
        if (lastBrace >= 0) {
          var truncated = '[' + body.slice(0, lastBrace + 1) + ']';
          try { arr = JSON.parse(truncated); console.log('[rollMailData] 截断补救成功:', arr.length, '条'); }
          catch(e) { console.error('[rollMailData] 截断补救失败:', e); }
        }
      }
    }

    if (!Array.isArray(arr)) { console.warn('[rollMailData] 无法解析 JSON'); return null; }
    console.log('[rollMailData] AI 返回条数:', arr.length);

    // 归一化
    var now = Date.now();
    var HOUR = 3600000;
    var out = [];

    arr.forEach(function(item, i){
      if (!item || !item.from) return;

      var hoursAgo = parseFloat(item.hoursAgo);
      if (!isFinite(hoursAgo) || hoursAgo < 0) hoursAgo = Math.random() * 72 + 1;
      if (hoursAgo > 1440) hoursAgo = 1440;

      // 归一化 reaction
      var reaction = null;
      var r = item.reaction;
      if (r && typeof r === 'object') {
        var type = String(r.type || '').toLowerCase();
        var validTypes = ['replied', 'read_no_reply', 'unread', 'starred_only'];
        if (validTypes.indexOf(type) < 0) type = 'read_no_reply';

        reaction = {
          type: type,
          thoughts: (r.thoughts != null) ? String(r.thoughts).trim() : ''
        };
        if (type === 'replied') {
          reaction.replyBody = (r.replyBody != null) ? String(r.replyBody).trim() : '';
          var rHours = parseFloat(r.replyHoursAgo);
          if (!isFinite(rHours) || rHours < 0) rHours = hoursAgo - 0.1;
          if (rHours > hoursAgo) rHours = Math.max(0.1, hoursAgo - 0.1);
          reaction.replyTimestamp = now - rHours * HOUR;
        }
      }

      // 归一化 isStarred（starred_only 强制 true）
      var isStarred = !!item.isStarred;
      if (reaction && reaction.type === 'starred_only') isStarred = true;

      out.push({
        id: 'mail_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        from: String(item.from).trim(),
        fromEmail: (item.fromEmail != null) ? String(item.fromEmail).trim() : '',
        to: (item.to != null) ? String(item.to).trim() : '我',
        subject: (item.subject != null) ? String(item.subject).trim() : '(No subject)',
        body: (item.body != null) ? String(item.body) : '',
        timestamp: now - hoursAgo * HOUR,
        isRead: !!item.isRead,
        isStarred: isStarred,
        isCommercial: !!item.isCommercial,
        reaction: reaction
      });
    });

    out.sort(function(a, b){ return b.timestamp - a.timestamp; });
    var withReaction = out.filter(function(m){ return !!m.reaction; }).length;
    console.log('[rollMailData] 生成完成:', out.length, '条，其中', withReaction, '条含 reaction');
    return out;
  }

  // ══════════════════════════════════════════════
  //  9. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollMailData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollMailData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating inbox...</p></div>';
    }

    var before = (state.mailData || []).length;
    state.mailData = (state.mailData || []).filter(function(m){ return m.ownerCharId !== ownerCharId; });
    console.log('[rollMailData] 清空旧数据:', before, '→', state.mailData.length);

    var mails = await _pmailGenerateAll(ownerCharId);
    if (!mails || mails.length === 0) { showToast('Generation failed'); openPhoneApp('mail'); return; }

    mails.forEach(function(m){ state.mailData.push(m); });
    saveState();
    openPhoneApp('mail');
    showToast('Generated ' + mails.length + ' emails');
  };

  // ══════════════════════════════════════════════
  //  10. 注册 renderer
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.mail = _pmailPageRenderer;
  } else {
    console.warn('[phone-mail.js] PHONE_APP_RENDERERS 未定义');
  }

  // ══════════════════════════════════════════════
  //  11. 测试挂载
  // ══════════════════════════════════════════════
  window.__pmailTest = {
    pullContacts: _pmailPullContacts,
    buildListHTML: _pmailBuildListHTML,
    buildPrompt: _pmailBuildPrompt,
    generateAll: _pmailGenerateAll,
    renderer: _pmailPageRenderer
  };

  console.log('[phone-mail.js] 已加载（模块 3）');
})();