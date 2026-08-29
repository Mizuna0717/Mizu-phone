// ==========================================================
//  PHONE MESSAGE APP
//  - Dynamic conversation list with 🎲 Roll generation
//  - Dark-theme chat detail (iMessage layout replication)
//  - Data stored in state.messageChats
// ==========================================================

;(function() {
  'use strict';

  // ========== OVERRIDE MESSAGES RENDERER ==========
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.messages = _pmsgPageRenderer;
  }

  function _pmsgPageRenderer(charName) {
    // Inject dice button into header-right after render
    setTimeout(_pmsgInjectDiceBtn, 0);
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

    // Sort: character chats pinned to top, then by lastTime desc
    var sorted = state.messageChats.slice().sort(function(a, b) {
      var aPin = a.isCharacter ? 1 : 0;
      var bPin = b.isCharacter ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return (b.lastTime || 0) - (a.lastTime || 0);
    });

    var h = '';
    sorted.forEach(function(chat) {
      var initial = (chat.displayName || chat.npcName || '?').charAt(0);
      var timeStr = _pmsgFormatTime(chat.lastTime);
      var preview = chat.lastMessage || '';
      if (preview.length > 30) preview = preview.substring(0, 30) + '...';
      var unread = chat._unread || 0;

      h += '<div class="papp-item" onclick="openMessageChat(\'' + _pmsgEscAttr(chat.id) + '\')">' +
        '<div class="papp-avatar">' + _pmsgEscHtml(initial) + '</div>' +
        '<div class="papp-item-content">' +
          '<div class="papp-item-top">' +
            '<span class="papp-item-name">' + _pmsgEscHtml(chat.displayName || chat.npcName) + '</span>' +
            '<span class="papp-item-time">' + timeStr + '</span>' +
          '</div>' +
          '<div class="papp-item-sub">' + _pmsgEscHtml(preview) + '</div>' +
        '</div>' +
        (unread > 0
          ? '<div class="papp-badge">' + unread + '</div>'
          : '<span class="papp-item-chevron">&gt;</span>') +
      '</div>';
    });
    return h;
  }

  // ========== OPEN CHAT DETAIL (Dark Theme) ==========
  window.openMessageChat = function(chatId) {
    var chat = _pmsgFindChat(chatId);
    if (!chat) { showToast('Chat not found'); return; }

    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;

    var initial = (chat.displayName || chat.npcName || '?').charAt(0);

    var h = '<div class="pmsg-dark">';

    // ---- Header ----
    h += '<div class="pmsg-chat-header">' +
      '<button class="pmsg-back-btn" onclick="backToMessageList()">' +
        '<svg viewBox="0 0 20 20"><path d="M13 4l-6 6 6 6"/></svg>' +
      '</button>' +
      '<div class="pmsg-chat-center">' +
        '<div class="pmsg-chat-avatar">' + _pmsgEscHtml(initial) + '</div>' +
        '<div class="pmsg-chat-name">' + _pmsgEscHtml(chat.displayName || chat.npcName) + '</div>' +
      '</div>' +
      '<div class="pmsg-chat-header-right"></div>' +
    '</div>';

    // ---- Messages ----
    h += '<div class="pmsg-chat-messages" id="pmsgChatMessages">';

    if (chat.messages && chat.messages.length) {
      var prevSender = null;
      var prevTs = 0;

      chat.messages.forEach(function(msg, idx) {
        // Time label if gap > 30min
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

    h += '</div>'; // close .pmsg-dark

    pageEl.innerHTML = h;

    // Scroll to bottom
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
    if (!state.npcs || state.npcs.length === 0) {
      showToast('No NPCs available — create NPCs first');
      return;
    }

    var api = state.apis && state.apis.find(function(a) { return a.id === state.activeApiId; });
    if (!api || !api.url) {
      if (typeof showErrorModal === 'function') showErrorModal(typeof T === 'function' ? T('configApi') : 'Please configure API');
      else showToast('Please configure API first');
      return;
    }

    // Show loading
    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML =
        '<div class="pmsg-loading">' +
          '<div class="pmsg-loading-dots"><span></span><span></span><span></span></div>' +
          '<p style="font-size:14px">Generating conversations...</p>' +
          '<p style="font-size:12px;color:rgba(255,255,255,.25);margin-top:6px">Creating chat histories with NPCs</p>' +
        '</div>';
    }

    // Pick 5~10 random NPCs (or all if fewer)
    var pool = state.npcs.slice();
    var pickCount = Math.min(pool.length, 5 + Math.floor(Math.random() * 6));

    // Fisher-Yates shuffle
    for (var si = pool.length - 1; si > 0; si--) {
      var sj = Math.floor(Math.random() * (si + 1));
      var st = pool[si]; pool[si] = pool[sj]; pool[sj] = st;
    }
    var selectedNpcs = pool.slice(0, pickCount);

    // Build NPC descriptions for prompt
    var npcList = selectedNpcs.map(function(npc, idx) {
      var name = npc.name || ('NPC_' + idx);
      var pers = npc.personality || npc.systemPrompt || npc.notes || npc.desc || 'a friendly person';
      var nick = npc.nickname || npc.displayName || '';
      return (idx + 1) + '. Name: "' + name + '"' + (nick ? ', Nickname: "' + nick + '"' : '') + ', Personality: "' + pers + '"';
    }).join('\n');

    var userName = (state.userProfile && state.userProfile.name) || 'User';

    var prompt =
      'You are generating realistic text-message chat histories. The user is "' + userName + '".\n\n' +
      'NPCs:\n' + npcList + '\n\n' +
      'RULES:\n' +
      '1. For EACH NPC, generate a separate conversation with 3-8 messages.\n' +
      '2. Messages alternate between "user" and "npc" (the NPC). The first message can be from either side.\n' +
      '3. Content must be natural, casual, and fit the NPC\'s personality.\n' +
      '4. Use the language matching the NPC names (Chinese names → Chinese text, English names → English text).\n' +
      '5. Each conversation should have a coherent topic (plans, daily chat, work, etc.).\n\n' +
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
        showToast('Generation failed — please retry');
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
        var nickname = npc.nickname || npc.displayName || '';
        var displayName = nickname ? (nickname + ' (' + npcName + ')') : npcName;

        // Assign timestamps (stagger conversations)
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

        // Upsert: replace existing chat for same NPC
        var found = false;
        for (var ei = 0; ei < state.messageChats.length; ei++) {
          if (state.messageChats[ei].npcId === npcId) {
            state.messageChats[ei] = _pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg);
            found = true;
            break;
          }
        }
        if (!found) {
          state.messageChats.push(_pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg));
        }
      });

      // Step 2: pull iMessage character chats
      _pmsgPullImessageChats();

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
      npcId: npcId,
      npcName: npcName,
      displayName: displayName,
      messages: messages,
      lastMessage: lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content,
      lastTime: lastMsg.timestamp
    };
  }

  // ========== PULL iMESSAGE CHATS ==========
  function _pmsgPullImessageChats() {
    if (!state.chats || !state.characters || !state.characters.length) return;
    if (!state.messageChats) state.messageChats = [];

    state.characters.forEach(function(ch) {
      var raw = state.chats[ch.id];
      if (!Array.isArray(raw) || raw.length === 0) return;

      var recent = raw.slice(-20);
      var stamped = recent.map(function(m) {
        return {
          sender: (m.role === 'user') ? 'user' : 'npc',
          content: (m.content || '').replace(/<[^>]*>/g, '').trim(),
          timestamp: m.ts || m.timestamp || Date.now()
        };
      }).filter(function(m) { return m.content.length > 0; });

      if (stamped.length === 0) return;

      var lastMsg = stamped[stamped.length - 1];
      var charDisplayName = ch.name || 'Character';
      var charNpcId = 'imsg_char_' + ch.id;

      // Upsert
      var found = false;
      for (var i = 0; i < state.messageChats.length; i++) {
        if (state.messageChats[i].npcId === charNpcId) {
          state.messageChats[i].messages = stamped;
          state.messageChats[i].lastMessage = lastMsg.content.substring(0, 50);
          state.messageChats[i].lastTime = lastMsg.timestamp;
          state.messageChats[i].isCharacter = true;
          found = true;
          break;
        }
      }
      if (!found) {
        state.messageChats.push({
          id: 'msgchat_imsg_' + ch.id,
          npcId: charNpcId,
          npcName: ch.name,
          displayName: charDisplayName,
          messages: stamped,
          lastMessage: lastMsg.content.substring(0, 50),
          lastTime: lastMsg.timestamp,
          isCharacter: true
        });
      }
    });
  }

  // ========== HELPERS ==========
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
      if (condition) { pass++; results.push('  ✅ ' + name); }
      else { fail++; results.push('  ❌ ' + name + (detail ? ' — ' + detail : '')); }
    }

    console.log('%c[MizuMessageTest] Starting...', 'color:#0a84ff;font-weight:bold');

    // ---- Test 1: Generate test data (without API) ----
    console.log('%c[Test 1] Generating test NPC chat data...', 'color:#aaa');

    var origNpcs = state.npcs;
    var origChats = state.messageChats;

    // Inject temporary NPCs if none exist
    var testNpcs = [
      { id: 'test_npc_1', name: '张伟', nickname: '小张', personality: '热情开朗的同事' },
      { id: 'test_npc_2', name: '李明', nickname: '阿明', personality: '安静内向的朋友' },
      { id: 'test_npc_3', name: '王芳', nickname: '', personality: '直爽的邻居' },
      { id: 'test_npc_4', name: 'Alex', nickname: '', personality: 'Energetic coworker who loves coding' },
      { id: 'test_npc_5', name: 'Sarah', nickname: 'S', personality: 'Calm and thoughtful friend' },
      { id: 'test_npc_6', name: '赵六', nickname: '小赵', personality: '幽默的大学同学' }
    ];

    // Build mock messageChats directly (simulating API result)
    var mockChats = [];
    var now = Date.now();

    testNpcs.forEach(function(npc, ni) {
      var msgCount = 3 + Math.floor(Math.random() * 6); // 3~8
      var msgs = [];
      var baseTime = now - (msgCount * 240000) - (ni * 2400000);
      for (var mi = 0; mi < msgCount; mi++) {
        msgs.push({
          sender: (mi % 2 === 0) ? 'user' : 'npc',
          content: (mi % 2 === 0) ? 'Test message from user #' + mi : 'Reply from ' + npc.name + ' #' + mi,
          timestamp: baseTime + mi * 180000
        });
      }
      var displayName = npc.nickname ? (npc.nickname + ' (' + npc.name + ')') : npc.name;
      var lastMsg = msgs[msgs.length - 1];
      mockChats.push({
        id: 'msgchat_' + npc.id + '_test',
        npcId: npc.id,
        npcName: npc.name,
        displayName: displayName,
        messages: msgs,
        lastMessage: lastMsg.content,
        lastTime: lastMsg.timestamp
      });
    });

    state.messageChats = mockChats;

    assert('Test data created', state.messageChats.length === testNpcs.length,
      'Expected ' + testNpcs.length + ', got ' + state.messageChats.length);

    // ---- Test 2: Verify each NPC has 3~8 messages ----
    console.log('%c[Test 2] Verifying message counts (3-8 per NPC)...', 'color:#aaa');

    var allValid = true;
    state.messageChats.forEach(function(chat) {
      var count = chat.messages ? chat.messages.length : 0;
      if (count < 3 || count > 8) {
        allValid = false;
        assert('NPC "' + chat.npcName + '" message count', false, 'Got ' + count + ', expected 3-8');
      }
    });
    if (allValid) {
      assert('All NPCs have 3-8 messages', true);
    }

    // ---- Test 3: Verify data structure ----
    console.log('%c[Test 3] Verifying data structure...', 'color:#aaa');

    state.messageChats.forEach(function(chat, ci) {
      assert('Chat[' + ci + '] has id', !!chat.id);
      assert('Chat[' + ci + '] has npcId', !!chat.npcId);
      assert('Chat[' + ci + '] has npcName', !!chat.npcName);
      assert('Chat[' + ci + '] has displayName', !!chat.displayName);
      assert('Chat[' + ci + '] has lastMessage', !!chat.lastMessage);
      assert('Chat[' + ci + '] has lastTime', typeof chat.lastTime === 'number');
      assert('Chat[' + ci + '] messages have sender/content/timestamp',
        chat.messages.every(function(m) { return m.sender && m.content && m.timestamp; }));
    });

    // ---- Test 4: Verify displayName format ----
    console.log('%c[Test 4] Verifying displayName format...', 'color:#aaa');

    var zhangChat = state.messageChats.find(function(c) { return c.npcId === 'test_npc_1'; });
    assert('小张 displayName = "小张 (张伟)"',
      zhangChat && zhangChat.displayName === '小张 (张伟)',
      zhangChat ? zhangChat.displayName : 'not found');

    var wangChat = state.messageChats.find(function(c) { return c.npcId === 'test_npc_3'; });
    assert('王芳 (no nickname) displayName = "王芳"',
      wangChat && wangChat.displayName === '王芳',
      wangChat ? wangChat.displayName : 'not found');

    // ---- Test 5: Render conversation list ----
    console.log('%c[Test 5] Rendering conversation list...', 'color:#aaa');

    try {
      openPhoneApp('messages');
      var listItems = document.querySelectorAll('#phoneAppPage .papp-item');
      assert('Conversation list rendered', listItems.length === state.messageChats.length,
        'Expected ' + state.messageChats.length + ' items, got ' + listItems.length);

      var diceBtn = document.querySelector('#phoneAppPage .pmsg-dice-btn');
      assert('Dice button injected in header', !!diceBtn);
    } catch(e) {
      assert('Render conversation list', false, e.message);
    }

    // ---- Test 6: Open chat detail & verify dark theme ----
    console.log('%c[Test 6] Opening chat detail & checking dark theme...', 'color:#aaa');

    try {
      var firstChat = state.messageChats[0];
      openMessageChat(firstChat.id);

      var darkRoot = document.querySelector('#phoneAppPage .pmsg-dark');
      assert('Dark theme container (.pmsg-dark) exists', !!darkRoot);

      if (darkRoot) {
        var cs = window.getComputedStyle(darkRoot);
        var bg = cs.backgroundColor;
        // #1c1c1e => rgb(28, 28, 30)
        var isDark = bg.indexOf('28') >= 0 || bg.indexOf('30') >= 0 || bg.indexOf('1c') >= 0;
        assert('Dark background applied', isDark, 'bg = ' + bg);
      }

      var header = document.querySelector('#phoneAppPage .pmsg-chat-header');
      assert('Chat header exists', !!header);
      if (header) {
        var hcs = window.getComputedStyle(header);
        var hbg = hcs.backgroundColor;
        // #2c2c2e => rgb(44, 44, 46)
        var isHeaderDark = hbg.indexOf('44') >= 0 || hbg.indexOf('46') >= 0;
        assert('Header dark background', isHeaderDark, 'header bg = ' + hbg);
      }

      var sentBubbles = document.querySelectorAll('#phoneAppPage .pmsg-msg-sent .pmsg-msg-bubble');
      assert('Sent (user) bubbles exist', sentBubbles.length > 0);
      if (sentBubbles.length > 0) {
        var sbcs = window.getComputedStyle(sentBubbles[0]);
        var sbbg = sbcs.backgroundColor;
        // #0a84ff => rgb(10, 132, 255)
        var isBlueBubble = sbbg.indexOf('10') >= 0 && sbbg.indexOf('132') >= 0;
        assert('User bubble is deep blue (#0a84ff)', isBlueBubble, 'bubble bg = ' + sbbg);
      }

      var recvBubbles = document.querySelectorAll('#phoneAppPage .pmsg-msg-received .pmsg-msg-bubble');
      assert('Received (NPC) bubbles exist', recvBubbles.length > 0);
      if (recvBubbles.length > 0) {
        var rbcs = window.getComputedStyle(recvBubbles[0]);
        var rbbg = rbcs.backgroundColor;
        // #3a3a3c => rgb(58, 58, 60)
        var isGrayBubble = rbbg.indexOf('58') >= 0 || rbbg.indexOf('60') >= 0;
        assert('NPC bubble is mid gray (#3a3a3c)', isGrayBubble, 'bubble bg = ' + rbbg);
      }

      var inputBar = document.querySelector('#phoneAppPage .pmsg-chat-input-bar');
      assert('Input bar exists', !!inputBar);

      var inputField = document.querySelector('#phoneAppPage .pmsg-chat-input');
      assert('Input field exists', !!inputField);

      var chatName = document.querySelector('#phoneAppPage .pmsg-chat-name');
      assert('Chat name displayed', chatName && chatName.textContent === firstChat.displayName,
        chatName ? chatName.textContent : 'not found');

      var msgRows = document.querySelectorAll('#phoneAppPage .pmsg-msg-row');
      assert('Message rows rendered', msgRows.length === firstChat.messages.length,
        'Expected ' + firstChat.messages.length + ', got ' + msgRows.length);

    } catch(e) {
      assert('Open chat detail', false, e.message);
    }

    // ---- Test 7: Back navigation ----
    console.log('%c[Test 7] Testing back navigation...', 'color:#aaa');

    try {
      backToMessageList();
      setTimeout(function() {
        var listItems2 = document.querySelectorAll('#phoneAppPage .papp-item');
        assert('Back to list: items restored', listItems2.length === state.messageChats.length,
          'Expected ' + state.messageChats.length + ', got ' + listItems2.length);

        // ---- Final cleanup ----
        state.messageChats = origChats || [];

        // ---- Summary ----
        console.log('');
        console.log('%c═══════════════════════════════════════', 'color:#0a84ff');
        console.log('%c  MizuMessageTest Results', 'color:#0a84ff;font-weight:bold;font-size:14px');
        console.log('%c═══════════════════════════════════════', 'color:#0a84ff');
        results.forEach(function(r) { console.log(r); });
        console.log('');
        console.log('%c  Total: ' + (pass + fail) + '  |  ✅ Pass: ' + pass + '  |  ❌ Fail: ' + fail,
          fail === 0 ? 'color:#30d158;font-weight:bold' : 'color:#ff453a;font-weight:bold');
        console.log('%c═══════════════════════════════════════', 'color:#0a84ff');

        if (fail === 0) {
          console.log('%c🎉 All tests passed!', 'color:#30d158;font-size:16px;font-weight:bold');
        }
      }, 300);
    } catch(e) {
      assert('Back navigation', false, e.message);
    }

    return 'Running tests... check console for results.';
  };

})();
