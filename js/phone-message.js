// ==========================================================
//  PHONE MESSAGE APP (Revised)
//  - NPC non-required: auto-generates fictional characters
//  - User conversation always pinned to top
//  - Only pulls current user messages (last 20)
//  - Fixed nickname (realname) display format
//  - Reuses iMessage dark-theme chat layout
// ==========================================================

;(function() {
  'use strict';

  // ========== FICTIONAL CHARACTER POOL ==========
  var FICTIONAL_POOL = [
    { id: 'fict_01', name: '陌生人A',    nickname: '',         personality: '偶尔发来消息的神秘陌生人，语气冷淡' },
    { id: 'fict_02', name: '张伟',       nickname: '同事小张', personality: '热情健谈的办公室同事，喜欢约饭' },
    { id: 'fict_03', name: '王丽',       nickname: '邻居王姐', personality: '热心肠的邻居大姐，经常帮忙收快递' },
    { id: 'fict_04', name: '外卖骑手',   nickname: '',         personality: '送餐时偶尔聊两句的骑手，总是很急' },
    { id: 'fict_05', name: '李明',       nickname: '老同学',   personality: '多年未见的高中同学，最近突然联系' },
    { id: 'fict_06', name: '周强',       nickname: '房东周叔', personality: '严肃但讲道理的房东，偶尔催租' },
    { id: 'fict_07', name: 'Mike',       nickname: '健身教练', personality: 'An energetic gym coach who keeps motivating' },
    { id: 'fict_08', name: '快递小哥',   nickname: '',         personality: '每次来都很匆忙的快递员' },
    { id: 'fict_09', name: '赵杰',       nickname: '阿杰',    personality: '搞笑幽默的大学室友，经常发段子' },
    { id: 'fict_10', name: '客服001',    nickname: '',         personality: '某平台的在线客服，语气专业礼貌' },
    { id: 'fict_11', name: '陈刚',       nickname: '陈教练',   personality: '严格但有耐心的驾校教练' },
    { id: 'fict_12', name: '林小雪',     nickname: '表妹',     personality: '活泼可爱的表妹，经常分享日常' },
    { id: 'fict_13', name: 'Sarah',      nickname: '',         personality: 'A friendly foreign colleague who mixes English and Chinese' },
    { id: 'fict_14', name: '刘叔',       nickname: '物业',     personality: '小区物业管理员，通知各种事务' },
    { id: 'fict_15', name: '美团商家',   nickname: '',         personality: '附近常点的餐厅老板，偶尔推荐新菜' }
  ];

  // ========== OVERRIDE MESSAGES RENDERER ==========
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.messages = _pmsgPageRenderer;
  }

  function _pmsgPageRenderer(charName) {
    setTimeout(_pmsgInjectDiceBtn, 0);
    _pmsgEnsureUserChat();
    return _pmsgBuildListHTML();
  }

  // ========== INJECT DICE BUTTON ==========
  function _pmsgInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollMessageChats()" title="Generate Chats">' +
        '<svg viewBox="0 0 20 20" width="20" height="20" stroke="#0a84ff" fill="none" ' +
        'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="2.5" y="2.5" width="15" height="15" rx="2.5"/>' +
          '<circle cx="7" cy="7" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="10" cy="10" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="13" cy="13" r="1.3" fill="#0a84ff" stroke="none"/>' +
        '</svg>' +
      '</button>';
  }

  // ========== DISPLAY NAME HELPERS ==========
  function _pmsgMakeDisplayName(npc) {
    var nickname = (npc.nickname || npc.displayName || '').trim();
    var realName = (npc.name || '').trim();
    if (nickname && nickname !== realName) {
      return nickname + ' (' + realName + ')';
    }
    return realName || 'Unknown';
  }

  function _pmsgMakeUserDisplayName() {
    var userName = (state.userProfile && state.userProfile.name) || 'User';
    return '\u6211 (' + userName + ')';
  }

  // ========== ENSURE USER (SELF) CHAT ==========
  function _pmsgEnsureUserChat() {
    if (!state.messageChats) state.messageChats = [];

    var displayName = _pmsgMakeUserDisplayName();
    var userMessages = _pmsgPullUserMessages();

    var userChat = null;
    for (var i = 0; i < state.messageChats.length; i++) {
      if (state.messageChats[i].roleId === 'user' || state.messageChats[i].isUser) {
        userChat = state.messageChats[i];
        break;
      }
    }

    var lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    var lastContent = lastMsg ? (lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content) : '';
    var lastTime = lastMsg ? lastMsg.timestamp : Date.now();

    if (!userChat) {
      state.messageChats.push({
        id: 'msgchat_user_self',
        roleId: 'user',
        npcId: 'user_self',
        npcName: (state.userProfile && state.userProfile.name) || 'User',
        displayName: displayName,
        isUser: true,
        messages: userMessages,
        lastMessage: lastContent,
        lastTime: lastTime
      });
    } else {
      userChat.roleId = 'user';
      userChat.isUser = true;
      userChat.displayName = displayName;
      userChat.npcName = (state.userProfile && state.userProfile.name) || 'User';
      userChat.messages = userMessages;
      userChat.lastMessage = lastContent;
      userChat.lastTime = lastTime;
    }
  }

  // ========== PULL ONLY CURRENT USER'S MESSAGES (max 20) ==========
  function _pmsgPullUserMessages() {
    var allUserMsgs = [];

    if (state.chats && typeof state.chats === 'object') {
      var chatKeys = Object.keys(state.chats);
      for (var ki = 0; ki < chatKeys.length; ki++) {
        var chatArr = state.chats[chatKeys[ki]];
        if (!Array.isArray(chatArr)) continue;
        for (var mi = 0; mi < chatArr.length; mi++) {
          var m = chatArr[mi];
          if (m.role === 'user' || m.sender === 'user' || m.isUser === true) {
            var content = (m.content || '').replace(/<[^>]*>/g, '').trim();
            if (content.length > 0) {
              allUserMsgs.push({
                sender: 'user',
                content: content,
                timestamp: m.ts || m.timestamp || Date.now()
              });
            }
          }
        }
      }
    }

    allUserMsgs.sort(function(a, b) { return a.timestamp - b.timestamp; });
    return allUserMsgs.slice(-20);
  }

  // ========== BUILD CONVERSATION LIST HTML ==========
  function _pmsgBuildListHTML() {
    if (!state.messageChats || !state.messageChats.length) {
      return '<div class="pmsg-empty">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2">' +
          '<path d="M8 10h32a2 2 0 012 2v18a2 2 0 01-2 2H22l-8 6v-6H8a2 2 0 01-2-2V12a2 2 0 012-2z"/>' +
          '<path d="M16 20h16M16 26h10"/>' +
        '</svg>' +
        '<div class="pmsg-empty-title">No conversations yet</div>' +
        '<div class="pmsg-empty-sub">Tap the dice icon to generate chats</div>' +
      '</div>';
    }

    // Sort: isUser ALWAYS first, then by lastTime desc
    var sorted = state.messageChats.slice().sort(function(a, b) {
      var aUser = a.isUser ? 1 : 0;
      var bUser = b.isUser ? 1 : 0;
      if (aUser !== bUser) return bUser - aUser;
      return (b.lastTime || 0) - (a.lastTime || 0);
    });

    var h = '';
    sorted.forEach(function(chat) {
      var name = chat.displayName || chat.npcName || '?';
      var initial = chat.isUser ? '\u6211' : name.charAt(0);
      var timeStr = _pmsgFormatTime(chat.lastTime);
      var preview = chat.lastMessage || '';
      if (preview.length > 30) preview = preview.substring(0, 30) + '...';
      var unread = chat._unread || 0;

      var avatarCls = 'papp-avatar' + (chat.isUser ? ' pmsg-avatar-user' : '');

      h += '<div class="papp-item pmsg-chat-item' + (chat.isUser ? ' pmsg-user-pinned' : '') + '" onclick="openMessageChat(\'' + _pmsgEscAttr(chat.id) + '\')">' +
        '<div class="' + avatarCls + '">' + _pmsgEscHtml(initial) + '</div>' +
        '<div class="papp-item-content">' +
          '<div class="papp-item-top">' +
            '<span class="papp-item-name">' + _pmsgEscHtml(name) + '</span>' +
            '<span class="papp-item-time">' + timeStr + '</span>' +
          '</div>' +
          '<div class="papp-item-sub">' + _pmsgEscHtml(preview) + '</div>' +
        '</div>' +
        (chat.isUser
          ? '<span class="pmsg-pin-icon">\uD83D\uDCCC</span>'
          : (unread > 0
            ? '<div class="papp-badge">' + unread + '</div>'
            : '<span class="papp-item-chevron">&gt;</span>')) +
      '</div>';
    });
    return h;
  }

  // ========== OPEN CHAT DETAIL (Dark iMessage Style) ==========
  window.openMessageChat = function(chatId) {
    var chat = _pmsgFindChat(chatId);
    if (!chat) { showToast('Chat not found'); return; }

    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;

    var name = chat.displayName || chat.npcName || '?';
    var initial = chat.isUser ? '\u6211' : name.charAt(0);

    var h = '<div class="pmsg-dark">';

    // ---- Header ----
    h += '<div class="pmsg-chat-header">' +
      '<button class="pmsg-back-btn" onclick="backToMessageList()">' +
        '<svg viewBox="0 0 20 20"><path d="M13 4l-6 6 6 6"/></svg>' +
      '</button>' +
      '<div class="pmsg-chat-center">' +
        '<div class="pmsg-chat-avatar">' + _pmsgEscHtml(initial) + '</div>' +
        '<div class="pmsg-chat-name">' + _pmsgEscHtml(name) + '</div>' +
      '</div>' +
      '<div class="pmsg-chat-header-right"></div>' +
    '</div>';

    // ---- Messages ----
    h += '<div class="pmsg-chat-messages" id="pmsgChatMessages">';

    if (chat.messages && chat.messages.length) {
      var prevSender = null;
      var prevTs = 0;

      chat.messages.forEach(function(msg, idx) {
        if (msg.timestamp && (msg.timestamp - prevTs > 1800000 || idx === 0)) {
          h += '<div class="pmsg-time-label">' + _pmsgFormatFullTime(msg.timestamp) + '</div>';
        }

        var isSent = (msg.sender === 'user');
        var isGroupFirst = (msg.sender !== prevSender);
        var cls = 'pmsg-msg-row ' + (isSent ? 'pmsg-msg-sent' : 'pmsg-msg-received');
        if (isGroupFirst) cls += ' pmsg-group-first';

        h += '<div class="' + cls + '">' +
          '<div class="pmsg-msg-bubble">' + _pmsgEscHtml(msg.content) + '</div>' +
        '</div>';

        prevSender = msg.sender;
        prevTs = msg.timestamp || 0;
      });
    } else {
      h += '<div class="pmsg-info-line">No messages</div>';
    }

    h += '</div>';

    // ---- Input Bar ----
    h += '<div class="pmsg-chat-input-bar">' +
      '<div class="pmsg-chat-input-wrap">' +
        '<input type="text" class="pmsg-chat-input" placeholder="Message" readonly />' +
      '</div>' +
      '<button class="pmsg-chat-send-btn" disabled>' +
        '<svg viewBox="0 0 20 20" stroke="#fff" fill="none" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' +
          '<path d="M3.5 10L16 3.5 12.5 17l-3-5.5z"/>' +
          '<path d="M16 3.5L9.5 11.5"/>' +
        '</svg>' +
      '</button>' +
    '</div>';

    h += '</div>';

    pageEl.innerHTML = h;

    setTimeout(function() {
      var mc = document.getElementById('pmsgChatMessages');
      if (mc) mc.scrollTop = mc.scrollHeight;
    }, 60);
  };

  // ========== BACK TO MESSAGE LIST ==========
  window.backToMessageList = function() {
    if (typeof openPhoneApp === 'function') {
      openPhoneApp('messages');
    }
  };

  // ========== ROLL GENERATE CHATS ==========
  window.rollMessageChats = async function() {
    var selectedNpcs = [];
    var usingFictional = false;

    if (state.npcs && state.npcs.length > 0) {
      var pool = state.npcs.slice();
      var pickCount = Math.min(pool.length, 5 + Math.floor(Math.random() * 6));
      pickCount = Math.max(pickCount, Math.min(pool.length, 5));
      _shuffle(pool);
      selectedNpcs = pool.slice(0, pickCount);
    } else {
      usingFictional = true;
      var fictPool = FICTIONAL_POOL.slice();
      var pickCount = 5 + Math.floor(Math.random() * 6);
      _shuffle(fictPool);
      selectedNpcs = fictPool.slice(0, pickCount);
    }

    var api = state.apis && state.apis.find(function(a) { return a.id === state.activeApiId; });
    if (!api || !api.url) {
      if (typeof showErrorModal === 'function') showErrorModal(typeof T === 'function' ? T('configApi') : 'Please configure API');
      else showToast('Please configure API first');
      return;
    }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML =
        '<div class="pmsg-loading">' +
          '<div class="pmsg-loading-dots"><span></span><span></span><span></span></div>' +
          '<p style="font-size:14px">Generating conversations...</p>' +
          '<p style="font-size:12px;color:rgba(255,255,255,.25);margin-top:6px">' +
            (usingFictional ? 'Creating fictional character chats' : 'Creating chat histories with NPCs') +
          '</p>' +
        '</div>';
    }

    var npcList = selectedNpcs.map(function(npc, idx) {
      var name = npc.name || ('NPC_' + idx);
      var pers = npc.personality || npc.systemPrompt || npc.notes || npc.desc || 'a friendly person';
      var nick = npc.nickname || npc.displayName || '';
      return (idx + 1) + '. Name: "' + name + '"' + (nick ? ', Nickname: "' + nick + '"' : '') + ', Personality: "' + pers + '"';
    }).join('\n');

    var userName = (state.userProfile && state.userProfile.name) || 'User';

    var prompt =
      'You are generating realistic text-message chat histories. The user is "' + userName + '".\n\n' +
      (usingFictional ? 'These are fictional contacts in the user\'s phone:\n' : 'NPCs:\n') +
      npcList + '\n\n' +
      'RULES:\n' +
      '1. For EACH person listed above, generate a separate conversation with 3-8 messages.\n' +
      '2. Messages alternate between "user" and "npc" (the other person). The first message can be from either side.\n' +
      '3. Content must be natural, casual, and fit the person\'s personality.\n' +
      '4. Use the language matching the person\'s name (Chinese names -> Chinese text, English names -> English text).\n' +
      '5. Each conversation should have a coherent topic (plans, daily chat, work, delivery, etc.).\n\n' +
      'Return ONLY a valid JSON array. No markdown, no explanation:\n' +
      '[\n' +
      '  { "npcIndex": 0, "messages": [ { "sender": "user", "content": "..." }, { "sender": "npc", "content": "..." } ] },\n' +
      '  { "npcIndex": 1, "messages": [ ... ] }\n' +
      ']';

    try {
      var rawReply = await sendChat(api, [{ role: 'user', content: prompt }]);

      var convos = null;
      try {
        var jm = rawReply.match(/\[[\s\S]*\]/);
        if (jm) convos = JSON.parse(jm[0]);
      } catch (pe) {
        console.error('[rollMessageChats] parse error:', pe);
      }

      if (!convos || !Array.isArray(convos) || convos.length === 0) {
        showToast('Generation failed - please retry');
        openPhoneApp('messages');
        return;
      }

      if (!state.messageChats) state.messageChats = [];

      var now = Date.now();

      convos.forEach(function(convo, ci) {
        var npcIdx = (convo.npcIndex != null) ? convo.npcIndex : ci;
        if (npcIdx < 0 || npcIdx >= selectedNpcs.length) return;

        var npc = selectedNpcs[npcIdx];
        var msgs = convo.messages;
        if (!Array.isArray(msgs) || msgs.length < 1) return;

        var npcName = npc.name || ('NPC_' + npcIdx);
        var displayName = _pmsgMakeDisplayName(npc);

        var baseTime = now - (msgs.length * 240000) - (ci * 2400000);
        var stamped = msgs.map(function(m, mi) {
          return {
            sender: (m.sender === 'user') ? 'user' : 'npc',
            content: (m.content || '').trim(),
            timestamp: baseTime + mi * (60000 + Math.floor(Math.random() * 300000))
          };
        }).filter(function(m) { return m.content.length > 0; });

        if (stamped.length === 0) return;

        var lastMsg = stamped[stamped.length - 1];
        var npcId = npc.id || ('npc_' + npcIdx);

        var found = false;
        for (var ei = 0; ei < state.messageChats.length; ei++) {
          if (state.messageChats[ei].npcId === npcId && !state.messageChats[ei].isUser) {
            state.messageChats[ei] = _pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg);
            found = true;
            break;
          }
        }
        if (!found) {
          state.messageChats.push(_pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg));
        }
      });

      _pmsgEnsureUserChat();

      saveState();
      openPhoneApp('messages');
      showToast('Generated ' + convos.length + ' conversations');

    } catch (e) {
      console.error('[rollMessageChats] error:', e);
      showToast('Error: ' + (e.message || String(e)));
      openPhoneApp('messages');
    }
  };

  function _pmsgBuildChatObj(npcId, npcName, displayName, messages, lastMsg) {
    return {
      id: 'msgchat_' + npcId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      roleId: 'npc_' + npcId,
      npcId: npcId,
      npcName: npcName,
      displayName: displayName,
      isUser: false,
      messages: messages,
      lastMessage: lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content,
      lastTime: lastMsg.timestamp
    };
  }

  // ========== HELPERS ==========
  function _shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
  }

  function _pmsgFindChat(chatId) {
    if (!state.messageChats) return null;
    for (var i = 0; i < state.messageChats.length; i++) {
      if (state.messageChats[i].id === chatId) return state.messageChats[i];
    }
    return null;
  }

  function _pmsgEscHtml(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _pmsgEscAttr(s) {
    return String(s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function _pmsgFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return ('' + d.getHours()).padStart(2, '0') + ':' + ('' + d.getMinutes()).padStart(2, '0');
    if (diff < 604800000) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  function _pmsgFormatFullTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    var time = ('' + d.getHours()).padStart(2, '0') + ':' + ('' + d.getMinutes()).padStart(2, '0');
    if (diff < 86400000) return 'Today ' + time;
    if (diff < 172800000) return 'Yesterday ' + time;
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + time;
  }

  // ==========================================================
  //  CONSOLE VERIFICATION / TEST SUITE
  //  Run:  __mizuMessageTest()
  // ==========================================================
  window.__mizuMessageTest = function() {
    var results = [];
    var pass = 0;
    var fail = 0;

    function assert(name, condition, detail) {
      if (condition) { pass++; results.push('  \u2705 ' + name); }
      else { fail++; results.push('  \u274C ' + name + (detail ? ' \u2014 ' + detail : '')); }
    }

    console.log('%c[MizuMessageTest] Starting comprehensive test suite...', 'color:#0a84ff;font-weight:bold');

    var origNpcs = state.npcs ? state.npcs.slice() : [];
    var origChats = state.messageChats ? state.messageChats.slice() : [];
    var origImChats = state.chats ? JSON.parse(JSON.stringify(state.chats)) : {};
    var now = Date.now();

    // ================================================================
    // TEST 1: No-NPC scenario - fictional character generation
    // ================================================================
    console.log('%c[Test 1] No-NPC scenario: fictional character generation', 'color:#aaa');

    state.npcs = [];
    state.messageChats = [];

    var fictPool = FICTIONAL_POOL.slice();
    var pickCount1 = 5 + Math.floor(Math.random() * 6);
    _shuffle(fictPool);
    var selectedFict = fictPool.slice(0, pickCount1);

    assert('Fictional pool has >= 10 entries', FICTIONAL_POOL.length >= 10, 'Pool size: ' + FICTIONAL_POOL.length);
    assert('Picked 5~10 fictional chars', selectedFict.length >= 5 && selectedFict.length <= 10, 'Picked: ' + selectedFict.length);

    selectedFict.forEach(function(npc, ni) {
      var msgCount = 3 + Math.floor(Math.random() * 6);
      var msgs = [];
      var baseTime = now - (msgCount * 240000) - (ni * 2400000);
      for (var mi = 0; mi < msgCount; mi++) {
        msgs.push({
          sender: (mi % 2 === 0) ? 'user' : 'npc',
          content: (mi % 2 === 0) ? 'Test user msg #' + mi : npc.name + ' reply #' + mi,
          timestamp: baseTime + mi * 180000
        });
      }
      var displayName = _pmsgMakeDisplayName(npc);
      var lastMsg = msgs[msgs.length - 1];
      state.messageChats.push(_pmsgBuildChatObj(npc.id, npc.name, displayName, msgs, lastMsg));
    });

    _pmsgEnsureUserChat();

    assert('No-NPC: chats created (fictional + user)', state.messageChats.length >= 6,
      'Expected >= 6 (5~10 fictional + 1 user), got ' + state.messageChats.length);
    assert('No-NPC: user chat exists',
      state.messageChats.some(function(c) { return c.isUser === true; }));

    // ================================================================
    // TEST 2: With-NPC scenario
    // ================================================================
    console.log('%c[Test 2] With-NPC scenario: NPC pool generation', 'color:#aaa');

    var testNpcs = [
      { id: 'test_npc_1', name: '\u5F20\u4F1F', nickname: '\u5C0F\u5F20', personality: 'test' },
      { id: 'test_npc_2', name: '\u674E\u660E', nickname: '\u963F\u660E', personality: 'test' },
      { id: 'test_npc_3', name: '\u738B\u82B3', nickname: '',              personality: 'test' },
      { id: 'test_npc_4', name: 'Alex',          nickname: '',              personality: 'test' },
      { id: 'test_npc_5', name: 'Sarah',         nickname: 'S',             personality: 'test' },
      { id: 'test_npc_6', name: '\u8D75\u516D', nickname: '\u5C0F\u8D75', personality: 'test' }
    ];

    state.npcs = testNpcs;
    state.messageChats = [];

    var npcPool = state.npcs.slice();
    var pickCount2 = Math.min(npcPool.length, 5 + Math.floor(Math.random() * 6));
    _shuffle(npcPool);
    var selectedNpcs2 = npcPool.slice(0, pickCount2);

    selectedNpcs2.forEach(function(npc, ni) {
      var msgCount = 3 + Math.floor(Math.random() * 6);
      var msgs = [];
      var baseTime = now - (msgCount * 240000) - (ni * 2400000);
      for (var mi = 0; mi < msgCount; mi++) {
        msgs.push({
          sender: (mi % 2 === 0) ? 'user' : 'npc',
          content: (mi % 2 === 0) ? 'User says #' + mi : npc.name + ' replies #' + mi,
          timestamp: baseTime + mi * 180000
        });
      }
      var displayName = _pmsgMakeDisplayName(npc);
      var lastMsg = msgs[msgs.length - 1];
      state.messageChats.push(_pmsgBuildChatObj(npc.id, npc.name, displayName, msgs, lastMsg));
    });

    _pmsgEnsureUserChat();

    assert('With-NPC: chats created', state.messageChats.length >= Math.min(testNpcs.length, 5) + 1,
      'Got ' + state.messageChats.length);

    // ================================================================
    // TEST 3: User conversation always pinned to top
    // ================================================================
    console.log('%c[Test 3] User conversation pinned to top', 'color:#aaa');

    var sorted = state.messageChats.slice().sort(function(a, b) {
      var aUser = a.isUser ? 1 : 0;
      var bUser = b.isUser ? 1 : 0;
      if (aUser !== bUser) return bUser - aUser;
      return (b.lastTime || 0) - (a.lastTime || 0);
    });

    assert('User chat is first in sorted list',
      sorted.length > 0 && sorted[0].isUser === true,
      sorted.length > 0 ? 'First item: ' + sorted[0].displayName + ' isUser=' + sorted[0].isUser : 'empty list');

    assert('User displayName starts with "\u6211 ("',
      sorted[0] && sorted[0].displayName.indexOf('\u6211 (') === 0,
      sorted[0] ? sorted[0].displayName : 'N/A');

    assert('User roleId === "user"',
      sorted[0] && sorted[0].roleId === 'user');

    // ================================================================
    // TEST 4: DisplayName format verification
    // ================================================================
    console.log('%c[Test 4] DisplayName format: nickname (realname)', 'color:#aaa');

    var zhangChat = state.messageChats.find(function(c) { return c.npcId === 'test_npc_1'; });
    assert('\u5C0F\u5F20 displayName = "\u5C0F\u5F20 (\u5F20\u4F1F)"',
      zhangChat && zhangChat.displayName === '\u5C0F\u5F20 (\u5F20\u4F1F)',
      zhangChat ? zhangChat.displayName : 'not found');

    var wangChat = state.messageChats.find(function(c) { return c.npcId === 'test_npc_3'; });
    assert('\u738B\u82B3 (no nickname) displayName = "\u738B\u82B3"',
      wangChat && wangChat.displayName === '\u738B\u82B3',
      wangChat ? wangChat.displayName : 'not found');

    var sarahChat = state.messageChats.find(function(c) { return c.npcId === 'test_npc_5'; });
    assert('Sarah nickname="S" displayName = "S (Sarah)"',
      sarahChat && sarahChat.displayName === 'S (Sarah)',
      sarahChat ? sarahChat.displayName : 'not found');

    var alexChat = state.messageChats.find(function(c) { return c.npcId === 'test_npc_4'; });
    assert('Alex (no nickname) displayName = "Alex"',
      alexChat && alexChat.displayName === 'Alex',
      alexChat ? alexChat.displayName : 'not found');

    var fictTestA = { name: '\u5F20\u4F1F', nickname: '\u540C\u4E8B\u5C0F\u5F20' };
    assert('Fictional with nickname format',
      _pmsgMakeDisplayName(fictTestA) === '\u540C\u4E8B\u5C0F\u5F20 (\u5F20\u4F1F)',
      _pmsgMakeDisplayName(fictTestA));

    var fictTestB = { name: '\u964C\u751F\u4EEBA', nickname: '' };
    assert('Fictional without nickname shows just name',
      _pmsgMakeDisplayName(fictTestB) === '\u964C\u751F\u4EEBA',
      _pmsgMakeDisplayName(fictTestB));

    var fictTestC = { name: 'TestName', nickname: 'TestName' };
    assert('Same nickname as realname shows just name',
      _pmsgMakeDisplayName(fictTestC) === 'TestName',
      _pmsgMakeDisplayName(fictTestC));

    // ================================================================
    // TEST 5: Data structure
    // ================================================================
    console.log('%c[Test 5] Data structure verification', 'color:#aaa');

    state.messageChats.forEach(function(chat, ci) {
      assert('Chat[' + ci + '] has id', !!chat.id);
      assert('Chat[' + ci + '] has npcId', !!chat.npcId);
      assert('Chat[' + ci + '] has displayName', !!chat.displayName);
      assert('Chat[' + ci + '] has lastTime (number)', typeof chat.lastTime === 'number');
      assert('Chat[' + ci + '] has isUser (boolean)', typeof chat.isUser === 'boolean');
      assert('Chat[' + ci + '] has roleId', !!chat.roleId);
      if (!chat.isUser && chat.messages && chat.messages.length) {
        assert('Chat[' + ci + '] messages have sender/content/timestamp',
          chat.messages.every(function(m) { return m.sender && m.content && m.timestamp; }));
      }
    });

    // ================================================================
    // TEST 6: Pull only user messages (max 20)
    // ================================================================
    console.log('%c[Test 6] Pull only user messages (last 20)', 'color:#aaa');

    state.chats = {
      'char_test_1': [
        { role: 'user',      content: 'Hello from user',  ts: now - 100000 },
        { role: 'assistant', content: 'Hello from char',   ts: now - 90000 },
        { role: 'user',      content: 'Another user msg',  ts: now - 80000 },
        { role: 'assistant', content: 'Char reply',        ts: now - 70000 }
      ],
      'char_test_2': [
        { role: 'user',      content: 'User msg in chat2', ts: now - 50000 },
        { role: 'assistant', content: 'Char2 reply',       ts: now - 40000 }
      ]
    };

    var pulled = _pmsgPullUserMessages();
    assert('Pulled messages are all from user',
      pulled.every(function(m) { return m.sender === 'user'; }),
      'Some non-user messages found');
    assert('Pulled 3 user messages from mock data',
      pulled.length === 3, 'Got ' + pulled.length);
    assert('Pulled messages sorted ascending by timestamp',
      pulled.length >= 2 && pulled[0].timestamp <= pulled[pulled.length - 1].timestamp);

    var bigChat = [];
    for (var bi = 0; bi < 30; bi++) {
      bigChat.push({ role: 'user', content: 'Msg ' + bi, ts: now - (30 - bi) * 10000 });
    }
    state.chats = { 'big_char': bigChat };
    var pulled20 = _pmsgPullUserMessages();
    assert('Max 20 user messages pulled', pulled20.length === 20, 'Got ' + pulled20.length);

    // ================================================================
    // TEST 7: Render conversation list
    // ================================================================
    console.log('%c[Test 7] Render conversation list', 'color:#aaa');

    state.chats = origImChats;
    state.npcs = testNpcs;
    state.messageChats = [];

    testNpcs.forEach(function(npc, ni) {
      var msgs = [
        { sender: 'user', content: 'Hi ' + npc.name, timestamp: now - 500000 + ni * 60000 },
        { sender: 'npc',  content: 'Hey!',            timestamp: now - 400000 + ni * 60000 }
      ];
      var displayName = _pmsgMakeDisplayName(npc);
      var lastMsg = msgs[msgs.length - 1];
      state.messageChats.push(_pmsgBuildChatObj(npc.id, npc.name, displayName, msgs, lastMsg));
    });
    _pmsgEnsureUserChat();

    try {
      if (typeof openPhoneApp === 'function') {
        openPhoneApp('messages');
      }

      var listItems = document.querySelectorAll('#phoneAppPage .papp-item');
      assert('List rendered with correct item count',
        listItems.length === state.messageChats.length,
        'Expected ' + state.messageChats.length + ', got ' + listItems.length);

      var diceBtn = document.querySelector('#phoneAppPage .pmsg-dice-btn');
      assert('Dice button injected in header', !!diceBtn);

      if (listItems.length > 0) {
        var firstPinned = listItems[0].classList.contains('pmsg-user-pinned');
        assert('First list item has pmsg-user-pinned class', firstPinned);

        var firstName = listItems[0].querySelector('.papp-item-name');
        assert('First item name starts with "\u6211 ("',
          firstName && firstName.textContent.indexOf('\u6211 (') === 0,
          firstName ? firstName.textContent : 'N/A');
      }
    } catch(e) {
      assert('Render list', false, e.message);
    }

    // ================================================================
    // TEST 8: Chat detail - dark iMessage theme
    // ================================================================
    console.log('%c[Test 8] Chat detail - dark iMessage theme', 'color:#aaa');

    try {
      var firstNpcChat = state.messageChats.find(function(c) { return !c.isUser; });
      if (firstNpcChat) {
        openMessageChat(firstNpcChat.id);

        var darkRoot = document.querySelector('#phoneAppPage .pmsg-dark');
        assert('Dark container (.pmsg-dark) exists', !!darkRoot);

        if (darkRoot) {
          var cs = window.getComputedStyle(darkRoot);
          var bg = cs.backgroundColor;
          var isDark = bg.indexOf('28') >= 0 || bg.indexOf('30') >= 0;
          assert('Dark background applied', isDark, 'bg = ' + bg);
        }

        var header = document.querySelector('#phoneAppPage .pmsg-chat-header');
        assert('Chat header exists', !!header);

        if (header) {
          var hcs = window.getComputedStyle(header);
          var hbg = hcs.backgroundColor;
          var isHeaderDark = hbg.indexOf('44') >= 0 || hbg.indexOf('46') >= 0;
          assert('Header has dark background', isHeaderDark, 'header bg = ' + hbg);
        }

        var sentBubbles = document.querySelectorAll('#phoneAppPage .pmsg-msg-sent .pmsg-msg-bubble');
        assert('Sent (user) bubbles rendered', sentBubbles.length > 0);
        if (sentBubbles.length > 0) {
          var sbcs = window.getComputedStyle(sentBubbles[0]);
          var sbbg = sbcs.backgroundColor;
          var isBlueBubble = sbbg.indexOf('10') >= 0 && sbbg.indexOf('132') >= 0;
          assert('User bubble is blue (#0a84ff)', isBlueBubble, 'bubble bg = ' + sbbg);
        }

        var recvBubbles = document.querySelectorAll('#phoneAppPage .pmsg-msg-received .pmsg-msg-bubble');
        assert('Received (NPC) bubbles rendered', recvBubbles.length > 0);
        if (recvBubbles.length > 0) {
          var rbcs = window.getComputedStyle(recvBubbles[0]);
          var rbbg = rbcs.backgroundColor;
          var isGrayBubble = rbbg.indexOf('58') >= 0 || rbbg.indexOf('60') >= 0;
          assert('NPC bubble is gray (#3a3a3c)', isGrayBubble, 'bubble bg = ' + rbbg);
        }

        var inputBar = document.querySelector('#phoneAppPage .pmsg-chat-input-bar');
        assert('Input bar exists', !!inputBar);

        var chatName = document.querySelector('#phoneAppPage .pmsg-chat-name');
        assert('Chat name matches displayName',
          chatName && chatName.textContent === firstNpcChat.displayName,
          chatName ? chatName.textContent : 'N/A');

        var msgRows = document.querySelectorAll('#phoneAppPage .pmsg-msg-row');
        assert('Message row count matches',
          msgRows.length === firstNpcChat.messages.length,
          'Expected ' + firstNpcChat.messages.length + ', got ' + msgRows.length);
      } else {
        assert('Find NPC chat for detail test', false, 'No NPC chat found');
      }
    } catch(e) {
      assert('Chat detail test', false, e.message);
    }

    // ================================================================
    // TEST 9: Bottom bar / layout position check
    // ================================================================
    console.log('%c[Test 9] Bottom bar position verification', 'color:#aaa');

    try {
      var appPage = document.getElementById('phoneAppPage');
      if (appPage) {
        var appCs = window.getComputedStyle(appPage);
        var hasOverflow = appCs.overflow === 'hidden' || appCs.overflowY === 'hidden';
        assert('phoneAppPage overflow: hidden', hasOverflow,
          'overflow: ' + appCs.overflow + ', overflowY: ' + appCs.overflowY);
      }

      var inputBar2 = document.querySelector('#phoneAppPage .pmsg-chat-input-bar');
      if (inputBar2) {
        var ibCs = window.getComputedStyle(inputBar2);
        assert('Input bar flex-shrink: 0', ibCs.flexShrink === '0', 'flexShrink = ' + ibCs.flexShrink);
      }

      var pmsgDark = document.querySelector('#phoneAppPage .pmsg-dark');
      if (pmsgDark) {
        var pdCs = window.getComputedStyle(pmsgDark);
        assert('.pmsg-dark is flex column',
          pdCs.display === 'flex' && pdCs.flexDirection === 'column',
          'display=' + pdCs.display + ', dir=' + pdCs.flexDirection);
        assert('.pmsg-dark overflow: hidden',
          pdCs.overflow === 'hidden',
          'overflow=' + pdCs.overflow);
      }

      var chatMsgs = document.getElementById('pmsgChatMessages');
      if (chatMsgs) {
        var cmCs = window.getComputedStyle(chatMsgs);
        assert('.pmsg-chat-messages min-height: 0',
          cmCs.minHeight === '0px' || cmCs.minHeight === '0',
          'minHeight=' + cmCs.minHeight);
      }
    } catch(e) {
      assert('Bottom bar position check', false, e.message);
    }

    // ================================================================
    // TEST 10: Back navigation
    // ================================================================
    console.log('%c[Test 10] Back navigation', 'color:#aaa');

    try {
      backToMessageList();
      setTimeout(function() {
        var listItems2 = document.querySelectorAll('#phoneAppPage .papp-item');
        assert('Back to list: items restored',
          listItems2.length === state.messageChats.length,
          'Expected ' + state.messageChats.length + ', got ' + listItems2.length);

        // ---- Cleanup ----
        state.npcs = origNpcs;
        state.messageChats = origChats;
        state.chats = origImChats;

        // ---- Summary ----
        console.log('');
        console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#0a84ff');
        console.log('%c  MizuMessageTest Results', 'color:#0a84ff;font-weight:bold;font-size:14px');
        console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#0a84ff');
        results.forEach(function(r) { console.log(r); });
        console.log('');
        console.log('%c  Total: ' + (pass + fail) + '  |  \u2705 Pass: ' + pass + '  |  \u274C Fail: ' + fail,
          fail === 0 ? 'color:#30d158;font-weight:bold' : 'color:#ff453a;font-weight:bold');
        console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#0a84ff');

        if (fail === 0) {
          console.log('%c\uD83C\uDF89 All tests passed!', 'color:#30d158;font-size:16px;font-weight:bold');
        }
      }, 400);
    } catch(e) {
      assert('Back navigation', false, e.message);
    }

    return 'Running 10 test groups... check console for results.';
  };

})();
