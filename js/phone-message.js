// ==========================================================
//  PHONE MESSAGE APP (Revised)
//  - Contained within Phone container (no viewport escape)
//  - NPC non-required: auto-generates fictional characters
//  - User conversation always pinned to top
//  - Only pulls current user messages (last 20)
//  - Fixed nickname (realname) display format
// ==========================================================

// ==========================================================
//  PHONE MESSAGE APP (Revised)
// ==========================================================

// ★ 复用全局统一构建器（去重 + 防 undefined）
function _pmsgBuildUserPersonaBlock() {
  if (typeof buildUserPersonaBlock === 'function') return buildUserPersonaBlock(null);
  var up = state.userProfile || {};
  return '  - Name: "' + (up.name || 'User') + '"';
}

function _pmsgBuildWorldbookBlock() {
  if (typeof buildWorldbookBlock === 'function') return buildWorldbookBlock(null, state.worldbooks);
  return '';
}

function _pmsgResolveFullPersona(npc) {
  if (!npc) return '';
  var chars = (state.characters && Array.isArray(state.characters)) ? state.characters : [];
  for (var i = 0; i < chars.length; i++) {
    if (chars[i].id === npc.id || chars[i].name === npc.name) {
      if (typeof buildCharacterPersonaBlock === 'function') return buildCharacterPersonaBlock(chars[i]);
      var sp = (chars[i].systemPrompt || '').trim();
      return sp;
    }
  }
  return '';
}

// ★ 手机主人 = 当前角色卡角色（不是 userProfile）
function _pmsgResolveOwnerCharacter() {
  if (!state.characters || !Array.isArray(state.characters) || state.characters.length === 0) {
    return null;
  }
  // 优先用 currentCharId
  if (state.currentCharId) {
    for (var i = 0; i < state.characters.length; i++) {
      if (state.characters[i].id === state.currentCharId) return state.characters[i];
    }
  }
  // 只有在「只有一个角色卡」时才 fallback
  if (state.characters.length === 1) return state.characters[0];
  // 多卡且没选中 → 返回 null，让 prompt 里显示 "the character"
  return null;
}

// ★ 手机主人完整人设（用于 prompt）
function _pmsgBuildOwnerBlock(ownerChar) {
  if (!ownerChar) return { name: 'the character', block: '', lang: 'zh' };
  var name = ownerChar.name || 'the character';
  var nick = ownerChar.nickname || ownerChar.displayName || '';
  var pers = ownerChar.personality || ownerChar.persona || ownerChar.notes || ownerChar.desc || ownerChar.description || '';
  var bg   = ownerChar.background || ownerChar.setting || ownerChar.bio || '';
  var style= ownerChar.speakingStyle || ownerChar.speaking_style || ownerChar.style || ownerChar.tone || '';
  var full = '';
  if (typeof buildCharacterPersonaBlock === 'function') {
    try { full = buildCharacterPersonaBlock(ownerChar) || ''; } catch(e) {}
  }
  if (!full) full = ownerChar.systemPrompt || '';

  var lang = _pmsgDetectOwnerLang(ownerChar);

  var b = '  - Name: "' + name + '"\n';
  if (nick)  b += '  - Nickname: "' + nick + '"\n';
  if (pers)  b += '  - Personality: "' + pers + '"\n';
  if (bg)    b += '  - Background: "' + bg + '"\n';
  if (style) b += '  - Speaking style: "' + style + '"\n';
  if (full)  b += '  - Full persona: "' + full.replace(/\s+/g,' ').slice(0, 800) + '"\n';
  b += '  - Native language: "' + lang + '"\n';

  return { name: name, block: b, lang: lang, char: ownerChar };
}

// ★ 侦测角色母语（ja / ko / en / zh）
// ★ 只判斷「是不是中文角色」；其他語言交給 AI 自己識別
function _pmsgDetectOwnerLang(ownerChar) {
  if (!ownerChar) return 'zh';
  var wbText = '';
  try {
    wbText = (state.worldbooks || []).map(function(w){
      return (w.name || '') + ' ' + (w.content || w.description || '');
    }).join(' ');
  } catch(e) {}
  var blob = [
    ownerChar.name || '',
    ownerChar.nickname || '',
    ownerChar.systemPrompt || '',
    ownerChar.personality || '',
    ownerChar.background || '',
    wbText
  ].join(' ').toLowerCase();

  // 明確是中國背景 → zh
  if (/中国|中國|北京|上海|廣州|广州|深圳|杭州|成都|中文|汉语|漢語|普通话|china|chinese|beijing|shanghai/.test(blob)) {
    return 'zh';
  }
  // 名字全中文 且 人設無任何外文跡象 → zh
  var nm = (ownerChar.name || '').trim();
  var hasChineseName = /^[\u4e00-\u9fa5·]+$/.test(nm);
  var hasForeignHint = /日本|japan|korea|한국|russia|россия|spain|españa|france|français|germany|deutsch|thai|ไทย|vietnam|tiếng việt|[a-zA-Zа-яА-ЯёЁ]/.test(blob);
  if (hasChineseName && !hasForeignHint) return 'zh';

  return 'other'; // ★ 其他所有語言（日/韓/英/西/俄/法/德/泰/越...）
}

// —— 以下 ;(function(){ ... })(); 整个 IIFE 保持你当前文件不变 ——

;(function() {
  'use strict';

  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.messages = _pmsgPageRenderer;
  }

  function _pmsgPageRenderer(charName) {
    setTimeout(_pmsgInjectDiceBtn, 0);
    _pmsgEnsureUserChat();
    return _pmsgBuildListHTML();
  }

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

  function _pmsgMakeDisplayName(npc) {
    var nickname = (npc.nickname || npc.displayName || '').trim();
    var realName = (npc.name || '').trim();
    if (nickname && nickname !== realName) return nickname + ' (' + realName + ')';
    return realName || 'Unknown';
  }

    function _pmsgMakeUserDisplayName() {
    var userName = (typeof getCurrentUserMaskName === 'function') ? getCurrentUserMaskName() : ((state.userProfile && state.userProfile.name) || 'User');
    return '\u6211 (' + userName + ')';
  }

    function _pmsgEnsureUserChat() {
    if (!state.messageChats) state.messageChats = [];

    // ★ 手机主人 = 角色卡角色；没角色时才 fallback 到 userProfile
    var ownerChar = _pmsgResolveOwnerCharacter();
    var resolvedUserName   = ownerChar ? (ownerChar.name || 'Character')
                                       : ((typeof getCurrentUserMaskName === 'function')
                                           ? getCurrentUserMaskName()
                                           : ((state.userProfile && state.userProfile.name) || 'User'));
    var resolvedUserAvatar = ownerChar ? (ownerChar.avatar || null)
                                       : ((typeof getCurrentUserMaskAvatar === 'function')
                                           ? getCurrentUserMaskAvatar()
                                           : ((state.userProfile && state.userProfile.avatar) || null));
    var displayName = '\u6211 (' + resolvedUserName + ')';

    var userMessages = _pmsgPullUserMessages();
    var userChat = null;
    for (var i = 0; i < state.messageChats.length; i++) {
      if (state.messageChats[i].roleId === 'user' || state.messageChats[i].isUser) {
        userChat = state.messageChats[i]; break;
      }
    }
    var lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    var lastContent = lastMsg
      ? (lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content)
      : '';
    var lastTime = lastMsg ? lastMsg.timestamp : Date.now();

    if (!userChat) {
      state.messageChats.push({
        id: 'msgchat_user_self', roleId: 'user', npcId: 'user_self',
        npcName: resolvedUserName, displayName: displayName,
        avatar: resolvedUserAvatar, isUser: true,
        messages: userMessages, lastMessage: lastContent, lastTime: lastTime
      });
    } else {
      userChat.roleId = 'user'; userChat.isUser = true;
      userChat.displayName = displayName;
      userChat.npcName = resolvedUserName;
      userChat.avatar = resolvedUserAvatar;
      userChat.messages = userMessages;
      userChat.lastMessage = lastContent;
      userChat.lastTime = lastTime;
    }
  }

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
              allUserMsgs.push({ sender:'user', content:content, timestamp:m.ts||m.timestamp||Date.now() });
            }
          }
        }
      }
    }
    allUserMsgs.sort(function(a,b){return a.timestamp-b.timestamp;});
    return allUserMsgs.slice(-20);
  }

  function _pmsgBuildListHTML() {
    if (!state.messageChats || !state.messageChats.length) {
      return '<div class="pmsg-empty">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2">' +
          '<path d="M8 10h32a2 2 0 012 2v18a2 2 0 01-2 2H22l-8 6v-6H8a2 2 0 01-2-2V12a2 2 0 012-2z"/>' +
          '<path d="M16 20h16M16 26h10"/></svg>' +
        '<div class="pmsg-empty-title">No conversations yet</div>' +
        '<div class="pmsg-empty-sub">Tap the dice icon to generate chats</div></div>';
    }
    var sorted = state.messageChats.slice().sort(function(a,b) {
      var aU=a.isUser?1:0, bU=b.isUser?1:0;
      if(aU!==bU) return bU-aU;
      return (b.lastTime||0)-(a.lastTime||0);
    });
    var h = '';
        sorted.forEach(function(chat) {
      var name=chat.displayName||chat.npcName||'?';
      var initial=chat.isUser?'\u6211':name.charAt(0);
      var timeStr=_pmsgFormatTime(chat.lastTime);
      var preview=chat.lastMessage||'';
      if(preview.length>30) preview=preview.substring(0,30)+'...';
      var unread=chat._unread||0;
      var avatarCls='papp-avatar'+(chat.isUser?' pmsg-avatar-user':'');
      var avatarInner=chat.avatar
        ? '<img src="'+_pmsgEscHtml(chat.avatar)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'
        : _pmsgEscHtml(initial);
      h+='<div class="papp-item pmsg-chat-item'+(chat.isUser?' pmsg-user-pinned':'')+'" onclick="openMessageChat(\''+_pmsgEscAttr(chat.id)+'\')">' +
        '<div class="'+avatarCls+'">'+avatarInner+'</div>' +
        '<div class="papp-item-content"><div class="papp-item-top"><span class="papp-item-name">'+_pmsgEscHtml(name)+'</span><span class="papp-item-time">'+timeStr+'</span></div>' +
        '<div class="papp-item-sub">'+_pmsgEscHtml(preview)+'</div></div>' +
        (chat.isUser?'<span class="pmsg-pin-icon">\uD83D\uDCCC</span>':(unread>0?'<div class="papp-badge">'+unread+'</div>':'<span class="papp-item-chevron">&gt;</span>')) +
        '</div>';
    });
    return h;
  }

    window.openMessageChat = function(chatId) {
    var chat=_pmsgFindChat(chatId);
    if(!chat){showToast('Chat not found');return;}
    var pageEl=document.getElementById('phoneAppPage');
    if(!pageEl) return;
    var name=chat.displayName||chat.npcName||'?';
    var initial=chat.isUser?'\u6211':name.charAt(0);
    var headerAvatarInner=chat.avatar
      ? '<img src="'+_pmsgEscHtml(chat.avatar)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'
      : _pmsgEscHtml(initial);
    var h='<div class="pmsg-dark">';
    h+='<div class="pmsg-chat-header">' +
      '<button class="pmsg-back-btn" onclick="backToMessageList()"><svg viewBox="0 0 20 20"><path d="M13 4l-6 6 6 6"/></svg></button>' +
      '<div class="pmsg-chat-center"><div class="pmsg-chat-avatar">'+headerAvatarInner+'</div><div class="pmsg-chat-name">'+_pmsgEscHtml(name)+'</div></div>' +
      '<div class="pmsg-chat-header-right"></div></div>';
        h+='<div class="pmsg-chat-messages" id="pmsgChatMessages">';
    if(chat.messages&&chat.messages.length){
  // ★ 只保留有内容且 sender 合法的消息，按时间正序
  var msgs=chat.messages.slice()
    .filter(function(m){ return m && (m.content||'').toString().trim().length>0; })
    .sort(function(a,b){return (a.timestamp||0)-(b.timestamp||0);});

  // ★ 断言：本会话所有消息 sender 只能是 user / npc 两类
  var _bad = msgs.filter(function(m){ var s=_pmsgNormSender(m); return s!=='user'&&s!=='npc'; });
  if(_bad.length) console.warn('[openMessageChat] 发现异常 sender 消息', _bad);

  var prevSender=null, prevTs=0;
  msgs.forEach(function(msg,idx){
    var sender=_pmsgNormSender(msg);
    if(msg.timestamp&&(msg.timestamp-prevTs>1800000||idx===0)) h+='<div class="pmsg-time-label">'+_pmsgFormatFullTime(msg.timestamp)+'</div>';
    var isSent=(sender==='user'), isGF=(sender!==prevSender);
    var cls='pmsg-msg-row '+(isSent?'pmsg-msg-sent':'pmsg-msg-received'); if(isGF) cls+=' pmsg-group-first';
    h+='<div class="'+cls+'"><div class="pmsg-msg-bubble">'+_pmsgEscHtml(msg.content)+'</div></div>';
    prevSender=sender; prevTs=msg.timestamp||0;
  });
} else { h+='<div class="pmsg-info-line">No messages</div>'; }


       // ★ FIX: 输入栏必须是 .pmsg-dark 的直接子元素，先关闭 .pmsg-chat-messages
    h+='</div>';
    h+='<div class="pmsg-chat-input-bar"><div class="pmsg-chat-input-wrap"><input type="text" class="pmsg-chat-input" placeholder="Message" readonly /></div>' +
      '<button class="pmsg-chat-send-btn" disabled><svg viewBox="0 0 20 20" stroke="#fff" fill="none" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M3.5 10L16 3.5 12.5 17l-3-5.5z"/><path d="M16 3.5L9.5 11.5"/></svg></button></div>';
    h+='</div>';
    pageEl.innerHTML=h;
    setTimeout(function(){var mc=document.getElementById('pmsgChatMessages');if(mc)mc.scrollTop=mc.scrollHeight;},60);
  };

  window.backToMessageList = function() {
    if(typeof openPhoneApp==='function') openPhoneApp('messages');
  };

        window.rollMessageChats = async function() {

      // ===== 0. 手机主人 = 当前角色卡角色 =====
      var ownerInfo = _pmsgBuildOwnerBlock(_pmsgResolveOwnerCharacter());
      var ownerName  = ownerInfo.name;
      var ownerLang  = ownerInfo.lang;
      var ownerBlock = ownerInfo.block;

      // ===== 1. 选联络人 =====
      var selectedNpcs = [];
      var useGeneratedContacts = false;

      if (state.npcs && state.npcs.length > 0) {
        // 有 NPC 池 → 用 NPC 池
        var pool = state.npcs.slice();
        var pickCount = Math.min(pool.length, 5 + Math.floor(Math.random()*6));
        pickCount = Math.max(pickCount, Math.min(pool.length, 5));
        _shuffle(pool);
        selectedNpcs = pool.slice(0, pickCount);
      } else {
        // 没 NPC 池 → 让 AI 现场生成虚拟人物
        useGeneratedContacts = true;
      }

      // ===== 2. API 检查 =====
      var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
      if (!api || !api.url) {
        if (typeof showErrorModal === 'function')
          showErrorModal(typeof T === 'function' ? T('configApi') : 'Please configure API');
        else showToast('Please configure API first');
        return;
      }

      // ===== 3. Loading =====
      var bodyEl = document.querySelector('#phoneAppPage .papp-body');
      if (bodyEl) {
        bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating conversations...</p></div>';
      }

      // ===== 4. 构建 prompt =====
      var worldbookBlk = _pmsgBuildWorldbookBlock();

      var contactsBlock = '';
      if (useGeneratedContacts) {
        contactsBlock =
          '=== CONTACTS ===\n' +
          'There is NO predefined contact list. You MUST invent 5-8 fictional contacts\n' +
          'that would realistically exist in the PHONE OWNER\'s world — based on their\n' +
          'name, culture, background, occupation, and the world setting above.\n' +
          'Each contact needs: Name, Nickname (optional), Personality, Background, Language.\n\n';
      } else {
        var npcList = selectedNpcs.map(function(npc, idx){
          var name  = npc.name || ('NPC_'+idx);
          var nick  = npc.nickname || npc.displayName || '';
          var pers  = npc.personality || npc.persona || npc.systemPrompt || npc.notes || npc.desc || npc.description || '';
          var bg    = npc.background || npc.setting || npc.bio || '';
          var style = npc.speakingStyle || npc.speaking_style || npc.style || npc.tone || '';
          var full  = _pmsgResolveFullPersona(npc);
          var line = 'Index ' + idx + ':\n  - Name: "' + name + '"';
          if (nick)  line += '\n  - Nickname: "' + nick + '"';
          if (pers)  line += '\n  - Personality: "' + pers + '"';
          if (bg)    line += '\n  - Background: "' + bg + '"';
          if (style) line += '\n  - Speaking style: "' + style + '"';
          if (full)  line += '\n  - Full setting: "' + full.replace(/\s+/g,' ').slice(0, 600) + '"';
          return line;
        }).join('\n\n');
        contactsBlock = '=== CONTACTS (predefined) ===\n' + npcList + '\n\n';
      }

            var langRule = '';
      if (ownerLang === 'zh') {
        langRule =
          '   - Phone owner is CHINESE-speaking → write Chinese ONLY (no parentheses translation).\n';
      } else {
        // ★ 通用规则：母语 + 括号中文翻译（AI 自己判断是哪种语言）
        langRule =
          '   - Phone owner speaks a NON-CHINESE language.\n' +
          '     STEP 1: Detect their native language from Name / Persona / World Setting\n' +
          '             (Japanese / Korean / English / Spanish / Russian / French / German /\n' +
          '              Thai / Vietnamese / etc. — whatever fits the character).\n' +
          '     STEP 2: ALL messages MUST be written in that native language FIRST,\n' +
          '             then a Chinese translation in parentheses on the SAME line.\n' +
          '     Format examples:\n' +
          '       Japanese : "おはよう (早上好)"\n' +
          '       Korean   : "안녕 (你好)"\n' +
          '       English  : "Good morning (早上好)"\n' +
          '       Spanish  : "Buenos días (早上好)"\n' +
          '       Russian  : "Доброе утро (早上好)"\n' +
          '       French   : "Bonjour (早上好)"\n' +
          '     DO NOT default to English — use the character\'s TRUE native language.\n' +
          '     If a message contains an emoji or symbol only (e.g. "😊"), no translation needed.\n' +
          '   - Brands must match that culture (NEVER inject 美团 / 微信 / 淘宝 into foreign worlds).\n';
      }     

      var prompt =
        'You are generating realistic text-message chat histories FROM a character\'s phone.\n' +
        'The phone owner is "' + ownerName + '". We (the reader) are looking at HIS/HER phone.\n\n' +

        '=== PHONE OWNER (whose phone we are viewing) ===\n' +
        ownerBlock + '\n' +

        (worldbookBlk
          ? '=== WORLD SETTING (all messages MUST stay consistent with this) ===\n' + worldbookBlk + '\n\n'
          : '') +

        contactsBlock +

        'RULES:\n' +
        '1. Generate ONE separate conversation for EACH contact (3-8 messages each).\n' +
        '2. Tag every message with "sender": use "owner" for ' + ownerName + ', "contact" for the other side.\n' +

        // ★★★ 核心：owner 的讯息必须符合 owner 人设 ★★★
        '3. CRITICAL — OWNER VOICE: every "owner" message MUST match the phone owner\'s\n' +
        '   Personality / Background / Speaking style / Full persona above.\n' +
        '   - A shy character speaks briefly and politely.\n' +
        '   - A cheerful character uses emoji and exclamations.\n' +
        '   - A cold character uses short, blunt sentences.\n' +
        '   - Tone to DIFFERENT contacts should DIFFER (boss vs friend vs family).\n' +
        '   NEVER write generic filler that could belong to anyone.\n' +

        '4. CRITICAL — CONTACT VOICE: every "contact" message MUST match THAT contact\'s\n' +
        '   Personality / Background / Speaking style. Two different contacts must sound obviously different.\n' +
        '5. ALL content MUST stay consistent with the WORLD SETTING above (no out-of-world references).\n' +
        '6. Messages should alternate naturally between "owner" and "contact".\n' +

        // ★★★ 语言 + 翻译规则 ★★★
        '7. LANGUAGE RULE (HIGHEST PRIORITY):\n' + langRule +
        '   - This language rule applies to BOTH "owner" and "contact" messages.\n' +
        '   - ABSOLUTELY FORBIDDEN to inject brands / apps / places / slang that do not exist\n' +
        '     in the phone owner\'s world. When unsure, OMIT the brand.\n\n' +

        'Return ONLY a valid JSON array. One object per contact:\n' +
        (useGeneratedContacts
          ? '[\n  {\n    "contact": { "name":"...", "nickname":"...", "personality":"...", "background":"...", "language":"ja" },\n    "messages": [ { "sender":"owner", "content":"..." }, { "sender":"contact", "content":"..." } ]\n  }\n]\n'
          : '[\n  { "npcIndex": 0, "messages": [ { "sender":"owner", "content":"..." }, { "sender":"contact", "content":"..." } ] }\n]\n');

      console.log('[rollMessageChats] owner:', ownerName, '| lang:', ownerLang,
        '| generated:', useGeneratedContacts, '| npcs:', selectedNpcs.length);

      // ===== 5. system prompt =====
      var _systemContent = (typeof buildUnifiedContext === 'function')
        ? buildUnifiedContext({ character: ownerInfo.char || null, worldbooks: state.worldbooks, includeCharacter: false })
        : '';
      var _chatMessages = _systemContent
        ? [{ role: 'system', content: _systemContent }, { role: 'user', content: prompt }]
        : [{ role: 'user', content: prompt }];

      // ===== 6. 呼叫 API =====
      try {
        var rawReply = await sendChat(api, _chatMessages);
        var convos = null;
        try {
          var jm = rawReply.match(/\[[\s\S]*\]/);
          if (jm) convos = JSON.parse(jm[0]);
        } catch (pe) { console.error('[rollMessageChats] parse error:', pe); }

        if (!convos || !Array.isArray(convos) || convos.length === 0) {
          showToast('Generation failed'); openPhoneApp('messages'); return;
        }
        if (!state.messageChats) state.messageChats = [];
        var now = Date.now();

        // ===== 7. 解析结果 =====
        convos.forEach(function(convo, ci){
          var npc, npcId, npcName, displayName;

          if (useGeneratedContacts) {
            // AI 生成的虚拟联络人
            if (!convo.contact || !convo.contact.name) return;
            npc = convo.contact;
            npcId = 'gen_' + (npc.name || 'c').replace(/\W/g,'_') + '_' + ci + '_' + Date.now();
            npcName = npc.name;
            displayName = _pmsgMakeDisplayName(npc);
          } else {
            // 预定义 NPC
            var npcIdx = (convo.npcIndex != null && convo.npcIndex >= 0 && convo.npcIndex < selectedNpcs.length)
              ? convo.npcIndex : ci;
            if (npcIdx < 0 || npcIdx >= selectedNpcs.length) return;
            npc = selectedNpcs[npcIdx];
            npcId = npc.id || ('npc_' + npcIdx);
            npcName = npc.name || ('NPC_' + npcIdx);
            displayName = _pmsgMakeDisplayName(npc);
          }

          var msgs = convo.messages;
          if (!Array.isArray(msgs) || msgs.length < 1) return;

          var baseTime = now - (msgs.length * 240000) - (ci * 2400000);
          var stamped = msgs.map(function(m, mi){
            return {
              sender: _pmsgNormSender(m),
              content: (m.content || m.text || m.message || '').toString().trim(),
              timestamp: baseTime + mi * (60000 + Math.floor(Math.random()*300000))
            };
          }).filter(function(m){ return m.content.length > 0; });

          if (stamped.length === 0) return;
          var lastMsg = stamped[stamped.length - 1];

          var found = false;
          for (var ei = 0; ei < state.messageChats.length; ei++) {
            if (state.messageChats[ei].npcId === npcId && !state.messageChats[ei].isUser) {
              state.messageChats[ei] = _pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg);
              found = true; break;
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

  function _pmsgBuildChatObj(npcId,npcName,displayName,messages,lastMsg){
    return {id:'msgchat_'+npcId+'_'+Date.now()+'_'+Math.random().toString(36).substr(2,4),roleId:'npc_'+npcId,npcId:npcId,npcName:npcName,displayName:displayName,isUser:false,messages:messages,lastMessage:lastMsg.content.length>50?lastMsg.content.substring(0,50)+'...':lastMsg.content,lastTime:lastMsg.timestamp};
  }

  function _shuffle(arr){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}}
  function _pmsgFindChat(chatId){if(!state.messageChats)return null;for(var i=0;i<state.messageChats.length;i++){if(state.messageChats[i].id===chatId)return state.messageChats[i];}return null;}
  function _pmsgEscHtml(s){if(typeof esc==='function')return esc(s);if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function _pmsgEscAttr(s){return String(s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');}
  function _pmsgFormatTime(ts){if(!ts)return '';var d=new Date(ts);var now=new Date();var diff=now.getTime()-d.getTime();if(diff<60000)return 'now';if(diff<3600000)return Math.floor(diff/60000)+'m';if(diff<86400000)return(''+d.getHours()).padStart(2,'0')+':'+(''+d.getMinutes()).padStart(2,'0');if(diff<604800000)return['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];return(d.getMonth()+1)+'/'+d.getDate();}
  function _pmsgFormatFullTime(ts){if(!ts)return '';var d=new Date(ts);var now=new Date();var diff=now.getTime()-d.getTime();var time=(''+d.getHours()).padStart(2,'0')+':'+(''+d.getMinutes()).padStart(2,'0');if(diff<86400000)return 'Today '+time;if(diff<172800000)return 'Yesterday '+time;return(d.getMonth()+1)+'/'+d.getDate()+' '+time;}
  function _pmsgNormSender(m){
    if(!m) return 'npc';
    if(m.isUser===true) return 'user';
    var s = (m.sender!=null ? m.sender : (m.role!=null ? m.role : (m.from!=null ? m.from : '')));
    s = String(s).trim().toLowerCase();
    // 手机主人（角色本人）
    if(s==='owner'||s==='user'||s==='me'||s==='self'||s==='u'||s==='我') return 'user';
    // 联络人
    return 'npc';
  }

  // ==========================================================
  //  CONSOLE TEST SUITE — __mizuMessageTest()
  // ==========================================================
  window.__mizuMessageTest = function() {
    var results=[], pass=0, fail=0;
    function assert(name,condition,detail){
      if(condition){pass++;results.push('  \u2705 '+name);}
      else{fail++;results.push('  \u274C '+name+(detail?' \u2014 '+detail:''));}
    }
    console.log('%c[MizuMessageTest] Starting...','color:#0a84ff;font-weight:bold');
    var origNpcs=state.npcs?state.npcs.slice():[];
    var origChats=state.messageChats?state.messageChats.slice():[];
    var origImChats=state.chats?JSON.parse(JSON.stringify(state.chats)):{};
    var now=Date.now();

        // === TEST 1: No-NPC → 已改为 AI 生成，本地无池可测 ===
    console.log('%c[Test 1] No-NPC: now uses AI-generated contacts','color:#aaa');
    assert('useGeneratedContacts path exists',
      typeof window.rollMessageChats === 'function');
      
    // === TEST 2: With-NPC generation ===
    console.log('%c[Test 2] With-NPC','color:#aaa');
    var testNpcs=[
      {id:'t1',name:'\u5F20\u4F1F',nickname:'\u5C0F\u5F20',personality:'t'},
      {id:'t2',name:'\u674E\u660E',nickname:'\u963F\u660E',personality:'t'},
      {id:'t3',name:'\u738B\u82B3',nickname:'',personality:'t'},
      {id:'t4',name:'Alex',nickname:'',personality:'t'},
      {id:'t5',name:'Sarah',nickname:'S',personality:'t'},
      {id:'t6',name:'\u8D75\u516D',nickname:'\u5C0F\u8D75',personality:'t'}
    ];
    state.npcs=testNpcs; state.messageChats=[];
    testNpcs.forEach(function(npc,ni){var msgs=[{sender:'user',content:'Hi',timestamp:now-500000+ni*60000},{sender:'npc',content:'Hey',timestamp:now-400000+ni*60000}];var dn=_pmsgMakeDisplayName(npc);var lm=msgs[1];state.messageChats.push(_pmsgBuildChatObj(npc.id,npc.name,dn,msgs,lm));});
    _pmsgEnsureUserChat();
    assert('With-NPC: chats >= 7',state.messageChats.length>=7,'Got '+state.messageChats.length);

    // === TEST 3: User pinned to top ===
    console.log('%c[Test 3] User pinned','color:#aaa');
    var sorted=state.messageChats.slice().sort(function(a,b){var aU=a.isUser?1:0,bU=b.isUser?1:0;if(aU!==bU)return bU-aU;return(b.lastTime||0)-(a.lastTime||0);});
    assert('User is first',sorted.length>0&&sorted[0].isUser===true,sorted[0]?sorted[0].displayName:'empty');
    assert('User displayName = "\u6211 (...)"',sorted[0]&&sorted[0].displayName.indexOf('\u6211 (')===0,sorted[0]?sorted[0].displayName:'N/A');

    // === TEST 4: DisplayName format ===
    console.log('%c[Test 4] DisplayName format','color:#aaa');
    var c1=state.messageChats.find(function(c){return c.npcId==='t1';});
    assert('\u5C0F\u5F20 (\u5F20\u4F1F)',c1&&c1.displayName==='\u5C0F\u5F20 (\u5F20\u4F1F)',c1?c1.displayName:'N/A');
    var c3=state.messageChats.find(function(c){return c.npcId==='t3';});
    assert('\u738B\u82B3 (no nickname)',c3&&c3.displayName==='\u738B\u82B3',c3?c3.displayName:'N/A');
    var c5=state.messageChats.find(function(c){return c.npcId==='t5';});
    assert('S (Sarah)',c5&&c5.displayName==='S (Sarah)',c5?c5.displayName:'N/A');

    // === TEST 5: Pull only user messages ===
    console.log('%c[Test 5] Pull user messages only','color:#aaa');
    state.chats={'c1':[{role:'user',content:'U1',ts:now-100000},{role:'assistant',content:'A1',ts:now-90000},{role:'user',content:'U2',ts:now-80000}]};
    var pulled=_pmsgPullUserMessages();
    assert('All pulled are user',pulled.every(function(m){return m.sender==='user';}));
    assert('Pulled 2 user msgs',pulled.length===2,'Got '+pulled.length);

    // === TEST 6: Render list ===
    console.log('%c[Test 6] Render list','color:#aaa');
    state.chats=origImChats;
    try{
      if(typeof openPhoneApp==='function') openPhoneApp('messages');
      var items=document.querySelectorAll('#phoneAppPage .papp-item');
      assert('List item count matches',items.length===state.messageChats.length,'Expected '+state.messageChats.length+', got '+items.length);
      assert('Dice button exists',!!document.querySelector('#phoneAppPage .pmsg-dice-btn'));
      if(items.length>0){
        assert('First item is user-pinned',items[0].classList.contains('pmsg-user-pinned'));
        var fn=items[0].querySelector('.papp-item-name');
        assert('First item name = "\u6211 (...)"',fn&&fn.textContent.indexOf('\u6211 (')===0,fn?fn.textContent:'N/A');
      }
    }catch(e){assert('Render list',false,e.message);}

    // === TEST 7: Chat detail ===
    console.log('%c[Test 7] Chat detail','color:#aaa');
    try{
      var npcChat=state.messageChats.find(function(c){return !c.isUser;});
      if(npcChat){
        openMessageChat(npcChat.id);
        assert('.pmsg-dark exists',!!document.querySelector('#phoneAppPage .pmsg-dark'));
        assert('Chat header exists',!!document.querySelector('#phoneAppPage .pmsg-chat-header'));
        assert('Input bar exists',!!document.querySelector('#phoneAppPage .pmsg-chat-input-bar'));
        var rows=document.querySelectorAll('#phoneAppPage .pmsg-msg-row');
        assert('Message rows match',rows.length===npcChat.messages.length,'Expected '+npcChat.messages.length+', got '+rows.length);
      }
    }catch(e){assert('Chat detail',false,e.message);}

    // === TEST 8: Back navigation ===
    console.log('%c[Test 8] Back navigation','color:#aaa');
    try{ backToMessageList(); }catch(e){assert('backToMessageList',false,e.message);}

    // === TEST 9: CONTAINMENT — Message stays inside Phone container ===
    console.log('%c[Test 9] Containment: Message inside Phone container','color:#ff9500');
    setTimeout(function(){
      try{
        // Re-open for containment check
        var nc2=state.messageChats.find(function(c){return !c.isUser;});
        if(nc2) openMessageChat(nc2.id);

        var phoneScreen=document.getElementById('screen-phone');
        var appPage=document.getElementById('phoneAppPage');
        var frameWrap=document.getElementById('phoneFrameWrap');
        var pmsgDark=document.querySelector('#phoneAppPage .pmsg-dark');

        // Check #phoneAppPage is descendant of #screen-phone
        assert('phoneAppPage is inside screen-phone',
          phoneScreen&&appPage&&phoneScreen.contains(appPage));

        // Check #phoneAppPage is inside #phoneFrameWrap
        assert('phoneAppPage is inside phoneFrameWrap',
          frameWrap&&appPage&&frameWrap.contains(appPage));

        // Check #phoneFrameWrap overflow is hidden (not auto)
        if(frameWrap){
          var fwCs=window.getComputedStyle(frameWrap);
          assert('phoneFrameWrap overflow: hidden',
            fwCs.overflow==='hidden'||fwCs.overflowX==='hidden'||fwCs.overflowY==='hidden',
            'overflow='+fwCs.overflow);
        }

        // Check .phone-app-page does NOT use viewport-relative height
        if(appPage){
          var apCs=window.getComputedStyle(appPage);
          var apH=apCs.height;
          assert('phoneAppPage height is NOT calc(100vh-...)',
            apH.indexOf('calc')===-1,
            'computed height='+apH);
        }

        // Check bounding rect: appPage should not exceed phoneScreen
        if(phoneScreen&&appPage){
          var psRect=phoneScreen.getBoundingClientRect();
          var apRect=appPage.getBoundingClientRect();
          assert('appPage top >= phoneScreen top',
            apRect.top>=psRect.top-1,
            'appPage.top='+apRect.top.toFixed(0)+' phoneScreen.top='+psRect.top.toFixed(0));
          assert('appPage bottom <= phoneScreen bottom',
            apRect.bottom<=psRect.bottom+1,
            'appPage.bottom='+apRect.bottom.toFixed(0)+' phoneScreen.bottom='+psRect.bottom.toFixed(0));
          assert('appPage left >= phoneScreen left',
            apRect.left>=psRect.left-1);
          assert('appPage right <= phoneScreen right',
            apRect.right<=psRect.right+1);
        }

        // Check .pmsg-dark is inside appPage and not escaping
        if(pmsgDark&&appPage){
          var dRect=pmsgDark.getBoundingClientRect();
          var aRect=appPage.getBoundingClientRect();
          assert('.pmsg-dark contained in appPage',
            dRect.top>=aRect.top-1&&dRect.bottom<=aRect.bottom+1,
            'dark.top='+dRect.top.toFixed(0)+' dark.bottom='+dRect.bottom.toFixed(0)+
            ' appPage.top='+aRect.top.toFixed(0)+' appPage.bottom='+aRect.bottom.toFixed(0));
        }

        // Check no position:fixed on message elements
        if(pmsgDark){
          var darkCs=window.getComputedStyle(pmsgDark);
          assert('.pmsg-dark position is not fixed',
            darkCs.position!=='fixed',
            'position='+darkCs.position);
        }
        var inputBar=document.querySelector('#phoneAppPage .pmsg-chat-input-bar');
        if(inputBar){
          var ibCs=window.getComputedStyle(inputBar);
          assert('Input bar position is not fixed',
            ibCs.position!=='fixed',
            'position='+ibCs.position);
        }

      }catch(e){
        assert('Containment check',false,e.message);
      }

      // === TEST 10: Close app back to Phone home ===
      console.log('%c[Test 10] Close app -> Phone home','color:#aaa');
      try{
        if(typeof closePhoneApp==='function') closePhoneApp();
        var phoneFrame=document.getElementById('phoneFrame');
        var phoneAppPage=document.getElementById('phoneAppPage');
        assert('After close: phoneFrame visible',
          phoneFrame&&phoneFrame.style.display!=='none');
        assert('After close: phoneAppPage hidden',
          phoneAppPage&&(phoneAppPage.style.display==='none'||phoneAppPage.innerHTML===''));
      }catch(e){assert('Close app',false,e.message);}

      // Cleanup
      state.npcs=origNpcs; state.messageChats=origChats; state.chats=origImChats;

      // Summary
      console.log('');
      console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550','color:#0a84ff');
      console.log('%c  MizuMessageTest Results','color:#0a84ff;font-weight:bold;font-size:14px');
      console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550','color:#0a84ff');
      results.forEach(function(r){console.log(r);});
      console.log('');
      console.log('%c  Total: '+(pass+fail)+'  |  \u2705 Pass: '+pass+'  |  \u274C Fail: '+fail,
        fail===0?'color:#30d158;font-weight:bold':'color:#ff453a;font-weight:bold');
      console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550','color:#0a84ff');
      if(fail===0) console.log('%c\uD83C\uDF89 All tests passed!','color:#30d158;font-size:16px;font-weight:bold');
    }, 500);

    return 'Running 10 test groups... check console.';
  };

})();

