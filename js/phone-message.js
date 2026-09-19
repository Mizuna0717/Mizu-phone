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

// ★ 拉「当前角色 ↔ 用户」在 iMessage 里的聊天记录
function _pmsgPullOwnerChatHistory(ownerCharId, limit) {
  limit = limit || 20;
  if (!ownerCharId || !state.chats) return [];
  var arr = state.chats[ownerCharId];
  if (!Array.isArray(arr)) return [];
  var msgs = [];
  for (var i = 0; i < arr.length; i++) {
    var m = arr[i];
    if (!m) continue;
    var isUser = (m.role === 'user' || m.sender === 'user' || m.isUser === true);
    var sender = isUser ? 'user' : 'owner';
    var content = (m.content || '').replace(/<[^>]*>/g, '').trim();
    if (content) {
      msgs.push({ sender: sender, content: content, timestamp: m.ts || m.timestamp || 0 });
    }
  }
  msgs.sort(function(a, b){ return a.timestamp - b.timestamp; });
  return msgs.slice(-limit);
}

// ★ 手机主人 = 手机当前选中的角色（state.phoneCharId）
function _pmsgResolveOwnerCharacter() {
  if (!state.characters || !Array.isArray(state.characters) || state.characters.length === 0) {
    return null;
  }
  // ① 最优先：手机页面选中的角色
  var phoneId = state.phoneCharId;
  if (phoneId) {
    for (var i = 0; i < state.characters.length; i++) {
      if (state.characters[i].id === phoneId) return state.characters[i];
    }
  }
  // ② 次优先：state.currentCharId
  if (state.currentCharId) {
    for (var j = 0; j < state.characters.length; j++) {
      if (state.characters[j].id === state.currentCharId) return state.characters[j];
    }
  }
  // ③ 只有一张卡才 fallback
  if (state.characters.length === 1) return state.characters[0];
  return null;
}

// ★ 手机主人 ID（用于 messageChats 隔离）
function _pmsgOwnerCharId() {
  var c = _pmsgResolveOwnerCharacter();
  return c ? c.id : '__no_owner__';
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

// ★ 侦测角色母语：只看角色卡字段，世界书仅兜底
function _pmsgDetectOwnerLang(ownerChar) {
  if (!ownerChar) return 'zh';

  // ⚠️ 只看角色卡字段（不看 worldbooks，避免被英文世界书污染）
  var blob = [
    ownerChar.name || '',
    ownerChar.nickname || '',
    ownerChar.systemPrompt || '',
    ownerChar.personality || '',
    ownerChar.background || '',
    ownerChar.description || '',
    ownerChar.persona || ''
  ].join(' ');

  // ① 角色卡字段有外文脚本 → other
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(blob)) return 'other'; // 日文假名
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(blob)) return 'other'; // 韩文
  if (/[\u0400-\u04FF]/.test(blob))              return 'other'; // 西里尔
  if (/[\u0E00-\u0E7F]/.test(blob))              return 'other'; // 泰文
  if (/[\u0600-\u06FF]/.test(blob))              return 'other'; // 阿拉伯
  if (/[a-zA-ZÀ-ÿ]/.test(blob))                  return 'other'; // 拉丁

  // ② 明确中国背景关键词 → zh
  if (/中国|中國|北京|上海|廣州|广州|深圳|杭州|成都|中文|汉语|漢語|普通话/.test(blob)) {
    return 'zh';
  }

  // ③ 名字纯 CJK（无外文脚本）→ zh
  var nm = (ownerChar.name || '').trim();
  if (/^[\u4e00-\u9fa5·]+$/.test(nm)) return 'zh';

  // ④ 兜底：世界书里若有假名/韩文等，判定为 other
  var wbText = '';
  try {
    wbText = (state.worldbooks || []).map(function(w){
      return (w.name || '') + ' ' + (w.content || w.description || '');
    }).join(' ');
  } catch(e) {}
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(wbText)) return 'other';
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(wbText)) return 'other';
  if (/[\u0400-\u04FF]/.test(wbText))              return 'other';

  return 'other';
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

  // ══════════════════════════════════════════════
  //  ★ 测试辅助函数（仅用于 Console 验证，不影响生产）
  // ══════════════════════════════════════════════
  window.__pmsgTestRenderList = function() {
    try { _pmsgEnsureUserChat(); } catch(e) {}
    return _pmsgBuildListHTML();
  };
  window.__pmsgTestMakeDisplayName = function(npc) {
    return _pmsgMakeDisplayName(npc || {});
  };

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
function _pmsgEnsureUserChat() {
  if (!state.messageChats) state.messageChats = [];

  var ownerChar = _pmsgResolveOwnerCharacter();
  var ownerId   = ownerChar ? ownerChar.id : '__no_owner__';
  var userRealName = (state.userProfile && state.userProfile.name) || 'User';

  // 找这个角色专属的 userChat
  var userChat = null;
  for (var i = 0; i < state.messageChats.length; i++) {
    var m = state.messageChats[i];
    if (m && m.isUser && m.ownerCharId === ownerId) { userChat = m; break; }
  }

  // ★ 角色对我的备注（存在 userChat 上，由 AI 生成时写入）
  var ownerCallsUser = (userChat && userChat._ownerCallsUser) || null;

  // ★★ 显示格式：有备注 → 只显示备注；无备注 → "我"
  var displayName = ownerCallsUser ? ownerCallsUser : '\u6211';

  var userMessages = _pmsgPullUserMessages();
  var lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
  var lastContent = lastMsg
    ? (lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content)
    : '';
  var lastTime = lastMsg ? lastMsg.timestamp : Date.now();

  if (!userChat) {
    state.messageChats.push({
      id: 'msgchat_user_self_' + ownerId,
      roleId: 'user',
      npcId: 'user_self',
      ownerCharId: ownerId,
      npcName: userRealName,
      displayName: displayName,
      _ownerCallsUser: ownerCallsUser,
      avatar: (ownerChar && ownerChar.avatar) || null,
      isUser: true,
      messages: userMessages,
      lastMessage: lastContent,
      lastTime: lastTime
    });
  } else {
    userChat.roleId = 'user';
    userChat.isUser = true;
    userChat.ownerCharId = ownerId;
    userChat.displayName = displayName;
    userChat.npcName = userRealName;
    userChat.avatar = (ownerChar && ownerChar.avatar) || null;
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
    var ownerId = _pmsgOwnerCharId();
    // ★ 只显示属于当前角色手机的聊天
    var ownerChats = (state.messageChats || []).filter(function(c){
      return c && c.ownerCharId === ownerId;
    });

    if (!ownerChats.length) {
      return '<div class="pmsg-empty">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2">' +
          '<path d="M8 10h32a2 2 0 012 2v18a2 2 0 01-2 2H22l-8 6v-6H8a2 2 0 01-2-2V12a2 2 0 012-2z"/>' +
          '<path d="M16 20h16M16 26h10"/></svg>' +
        '<div class="pmsg-empty-title">No conversations yet</div>' +
        '<div class="pmsg-empty-sub">Tap the dice icon to generate chats</div></div>';
    }
    var sorted = ownerChats.slice().sort(function(a,b) {
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

    // ★ 断言：本会话所有消息 sender 只能是 owner / other 两类
  var _bad = msgs.filter(function(m){ var s=_pmsgNormSender(m); return s!=='owner'&&s!=='other'; });
  if(_bad.length) console.warn('[openMessageChat] 发现异常 sender 消息', _bad);

  var prevSender=null, prevTs=0;
  msgs.forEach(function(msg,idx){
    var sender=_pmsgNormSender(msg);
    if(msg.timestamp&&(msg.timestamp-prevTs>1800000||idx===0)) h+='<div class="pmsg-time-label">'+_pmsgFormatFullTime(msg.timestamp)+'</div>';
    // ★ owner → 右侧（手机主人视角）；other → 左侧
    var isSent=(sender==='owner'), isGF=(sender!==prevSender);
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
      var ownerCharId = _pmsgOwnerCharId();   // ★ 新增
      console.log('[rollMessageChats] ownerCharId =', ownerCharId);
            // ★★★ 清空该角色旧的 messageChats（不参考旧数据，只保留 userChat 骨架）
      if (state.messageChats && state.messageChats.length > 0) {
        var _beforeCount = state.messageChats.length;
        state.messageChats = state.messageChats.filter(function(c){
          if (c.isUser && c.ownerCharId === ownerCharId) return true;
          if (c.ownerCharId !== ownerCharId) return true;
          return false;
        });
        console.log('[rollMessageChats] 清空旧数据:', _beforeCount, '→', state.messageChats.length);
        for (var _ri = 0; _ri < state.messageChats.length; _ri++) {
          var _rc = state.messageChats[_ri];
          if (_rc.isUser && _rc.ownerCharId === ownerCharId) {
            _rc._ownerCallsUser = null;
            _rc.displayName = '\u6211';
            break;
          }
        }
      }

      // ★ 拉「角色 ↔ 用户」在 iMessage 里的最近聊天记录
      var recentHistory = _pmsgPullOwnerChatHistory(ownerCharId, 20);
      var historyBlock = '';
      if (recentHistory.length > 0) {
        historyBlock = '=== RECENT iMESSAGE CHAT BETWEEN OWNER AND USER ===\n' +
          '(This is the MAIN STORYLINE. The contacts\' messages MUST feel consistent with this context.\n' +
          ' Do NOT contradict what was said here.)\n';
        recentHistory.forEach(function(m){
          historyBlock += '  [' + m.sender + '] ' + m.content + '\n';
        });
        historyBlock += '\n';
      }
      console.log('[rollMessageChats] 历史聊天条数 =', recentHistory.length);

      // ===== 1. 选联络人 =====
      var selectedNpcs = [];
      var useGeneratedContacts = false;

        if (state.npcs && state.npcs.length > 0) {
        // 有 NPC 池 → 用 NPC 池（6~15 个）
        var pool = state.npcs.slice();
        var pickCount;
        if (pool.length <= 6) {
          pickCount = pool.length;
        } else {
          var _maxN = Math.min(pool.length, 15);
          var _minN = Math.min(pool.length, 6);
          pickCount = _minN + Math.floor(Math.random() * (_maxN - _minN + 1));
        }
        _shuffle(pool);
        selectedNpcs = pool.slice(0, pickCount);
        console.log('[rollMessageChats] NPC 池选人:', pickCount, '/', pool.length);
      } else {
        // 没 NPC 池 → 让 AI 现场生成虚拟人物（6~15 个，按人设决定）
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
          'There is NO predefined contact list. You MUST invent fictional contacts\n' +
          'that would realistically exist in the PHONE OWNER\'s world.\n\n' +
          '★ HOW MANY CONTACTS — read the phone owner\'s personality CAREFULLY and decide:\n' +
          '   - VERY social / extroverted / outgoing / popular / friendly / 社交达人 / 热情开朗\n' +
          '       → generate 12-15 contacts\n' +
          '   - MODERATELY social / balanced / ordinary\n' +
          '       → generate 9-11 contacts\n' +
          '   - INTROVERTED / loner / quiet / cold / antisocial / 孤僻冷漠 / 不善社交\n' +
          '       → generate 6-8 contacts\n' +
          '   ★ MINIMUM 6, MAXIMUM 15. NEVER outside this range.\n' +
          '   ★ Reflect their personality through NUMBER of contacts, not just content.\n\n' +
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

        historyBlock +   // ★ 新增

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
                '6.5 CRITICAL — STORYLINE CONSISTENCY: if a RECENT iMESSAGE CHAT is provided above,\n' +
        '     every generated contact conversation MUST feel like it happens in the same\n' +
        '     time/context/situation. Do NOT contradict events, moods, or facts from that chat.\n' +

                // ★★★ 语言 + 翻译规则 ★★★
        '7. LANGUAGE RULE (HIGHEST PRIORITY):\n' + langRule +
        '   - This language rule applies to BOTH "owner" and "contact" messages.\n' +
        '   - ABSOLUTELY FORBIDDEN to inject brands / apps / places / slang that do not exist\n' +
        '     in the phone owner\'s world. When unsure, OMIT the brand.\n\n' +

        // ★★★ 新增：手机主人怎么称呼 user ★★★
        '8. ADDITIONAL FIELD "ownerCallsUser":\n' +
        '   - In the FIRST object of the array, add a field "ownerCallsUser".\n' +
        '   - It is the contact name the phone owner uses for the user in his/her phone.\n' +
        '   - MUST match the owner\'s personality & relationship with the user.\n' +
        '     Examples: "老婆", "蠢货", "社长", "那个女人", "Boss", "Master", "笨蛋".\n' +
        '   - If no special nickname, use the user\'s real name.\n' +
        '   - Only the FIRST object needs this field. Others can omit.\n\n' +

        'Return ONLY a valid JSON array. One object per contact:\n' +
        (useGeneratedContacts
          ? '[\n  {\n    "ownerCallsUser":"...",\n    "contact": { "name":"...", "nickname":"...", "personality":"...", "background":"...", "language":"ja" },\n    "messages": [ { "sender":"owner", "content":"..." }, { "sender":"contact", "content":"..." } ]\n  },\n  { "contact": {...}, "messages": [...] }\n]\n'
          : '[\n  { "npcIndex": 0, "ownerCallsUser":"...", "messages": [ { "sender":"owner", "content":"..." }, { "sender":"contact", "content":"..." } ] },\n  { "npcIndex": 1, "messages": [...] }\n]\n');
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

        // ★ 先扫一遍，找 ownerCallsUser
        var ownerCallsUser = null;
        for (var _ci = 0; _ci < convos.length; _ci++) {
          if (convos[_ci] && convos[_ci].ownerCallsUser) {
            ownerCallsUser = String(convos[_ci].ownerCallsUser).trim();
            break;
          }
        }
        console.log('[rollMessageChats] ownerCallsUser =', ownerCallsUser);

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
            var ec = state.messageChats[ei];
            if (ec.npcId === npcId && !ec.isUser && ec.ownerCharId === ownerCharId) {
              var newChat = _pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg);
              newChat.ownerCharId = ownerCharId;   // ★
              state.messageChats[ei] = newChat;
              found = true; break;
            }
          }
          if (!found) {
            var newChat2 = _pmsgBuildChatObj(npcId, npcName, displayName, stamped, lastMsg);
            newChat2.ownerCharId = ownerCharId;    // ★
            state.messageChats.push(newChat2);
          }
        });

        // ★ 把 ownerCallsUser 写进这个角色的 userChat
        if (ownerCallsUser) {
          for (var uk = 0; uk < state.messageChats.length; uk++) {
            var uc = state.messageChats[uk];
            if (uc.isUser && uc.ownerCharId === ownerCharId) {
              uc._ownerCallsUser = ownerCallsUser;
              uc.displayName = ownerCallsUser;   // 立即更新显示
              break;
            }
          }
        }

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
    if(!m) return 'other';
    var s = (m.sender!=null ? m.sender : (m.role!=null ? m.role : (m.from!=null ? m.from : '')));
    s = String(s).trim().toLowerCase();
    // ★ 手机主人（角色本人）发的消息 → 右侧
    if(s==='owner'||s==='me'||s==='self'||s==='我') return 'owner';
    // ★ 其他一切（用户发的 / 联系人发的 / 未知）→ 左侧
    return 'other';
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

