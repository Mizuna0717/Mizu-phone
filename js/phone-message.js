// ==========================================================
//  PHONE MESSAGE APP (Revised)
//  - Contained within Phone container (no viewport escape)
//  - NPC non-required: auto-generates fictional characters
//  - User conversation always pinned to top
//  - Only pulls current user messages (last 20)
//  - Fixed nickname (realname) display format
// ==========================================================

// ★★★ NEW: 读取用户人设（问题③ - 用户人设）★★★
function _pmsgBuildUserPersonaBlock() {
  var up = state.userProfile || {};
  var u  = state.user || {};
  var name = up.name || u.name || 'User';
  var persona = up.persona || up.personality || u.personality || u.persona || '';
  var bg      = up.background || up.bio || u.background || '';
  var lines = ['  - Name: "' + name + '"'];
  if (persona) lines.push('  - Personality: "' + persona + '"');
  if (bg)      lines.push('  - Background: "' + bg + '"');
  return lines.join('\n');
}

// ★★★ NEW: 读取世界书（问题③ - 世界书）★★★
function _pmsgBuildWorldbookBlock() {
  var wbs = (state.worldbooks && Array.isArray(state.worldbooks)) ? state.worldbooks : [];
  if (!wbs.length) return '';
  var parts = [];
  wbs.forEach(function(wb) {
    if (!wb.isGlobal) return;            // 手机短信是全局语境，注入全局世界书
    var seg = '· ' + (wb.name || 'World');
    if (wb.content) seg += '：' + wb.content;
    if (wb.entries && wb.entries.length) {
      wb.entries.forEach(function(e) {
        if (e.keyword || e.content)
          seg += '\n    - ' + (e.keyword || '') + (e.content ? ': ' + e.content : '');
      });
    }
    parts.push(seg);
  });
  return parts.join('\n');
}

// ★★★ NEW: 把 npc 关联到 state.characters，补齐完整 systemPrompt（问题① - 角色人设）★★★
function _pmsgResolveFullPersona(npc) {
  if (!npc) return '';
  var chars = (state.characters && Array.isArray(state.characters)) ? state.characters : [];
  var matched = null;
  for (var i = 0; i < chars.length; i++) {
    if (chars[i].id === npc.id || chars[i].name === npc.name) { matched = chars[i]; break; }
  }
  if (matched && matched.systemPrompt) return matched.systemPrompt.trim();
  return '';
}

;(function() {
  'use strict';

  var FICTIONAL_POOL = [
    { id: 'fict_01', name: '\u964C\u751F\u4EEBA',  nickname: '',             personality: '\u5076\u5C14\u53D1\u6765\u6D88\u606F\u7684\u795E\u79D8\u964C\u751F\u4EBA' },
    { id: 'fict_02', name: '\u5F20\u4F1F',          nickname: '\u540C\u4E8B\u5C0F\u5F20', personality: '\u70ED\u60C5\u5065\u8C08\u7684\u529E\u516C\u5BA4\u540C\u4E8B' },
    { id: 'fict_03', name: '\u738B\u4E3D',          nickname: '\u90BB\u5C45\u738B\u59D0', personality: '\u70ED\u5FC3\u80A0\u7684\u90BB\u5C45\u5927\u59D0' },
    { id: 'fict_04', name: '\u5916\u5356\u9A91\u624B', nickname: '',          personality: '\u9001\u9910\u65F6\u5076\u5C14\u804A\u4E24\u53E5\u7684\u9A91\u624B' },
    { id: 'fict_05', name: '\u674E\u660E',          nickname: '\u8001\u540C\u5B66',       personality: '\u591A\u5E74\u672A\u89C1\u7684\u9AD8\u4E2D\u540C\u5B66' },
    { id: 'fict_06', name: '\u5468\u5F3A',          nickname: '\u623F\u4E1C\u5468\u53D4', personality: '\u4E25\u8083\u4F46\u8BB2\u9053\u7406\u7684\u623F\u4E1C' },
    { id: 'fict_07', name: 'Mike',                   nickname: '\u5065\u8EAB\u6559\u7EC3', personality: 'An energetic gym coach' },
    { id: 'fict_08', name: '\u5FEB\u9012\u5C0F\u54E5', nickname: '',          personality: '\u6BCF\u6B21\u6765\u90FD\u5F88\u5306\u5FD9\u7684\u5FEB\u9012\u5458' },
    { id: 'fict_09', name: '\u8D75\u6770',          nickname: '\u963F\u6770',             personality: '\u641E\u7B11\u5E7D\u9ED8\u7684\u5927\u5B66\u5BA4\u53CB' },
    { id: 'fict_10', name: '\u5BA2\u670D001',       nickname: '',             personality: '\u67D0\u5E73\u53F0\u7684\u5728\u7EBF\u5BA2\u670D' },
    { id: 'fict_11', name: '\u9648\u521A',          nickname: '\u9648\u6559\u7EC3',       personality: '\u4E25\u683C\u4F46\u6709\u8010\u5FC3\u7684\u9A7E\u6821\u6559\u7EC3' },
    { id: 'fict_12', name: '\u6797\u5C0F\u96EA',    nickname: '\u8868\u59B9',             personality: '\u6D3B\u6CFC\u53EF\u7231\u7684\u8868\u59B9' },
    { id: 'fict_13', name: 'Sarah',                  nickname: '',             personality: 'A friendly foreign colleague' },
    { id: 'fict_14', name: '\u5218\u53D4',          nickname: '\u7269\u4E1A',             personality: '\u5C0F\u533A\u7269\u4E1A\u7BA1\u7406\u5458' },
    { id: 'fict_15', name: '\u7F8E\u56E2\u5546\u5BB6', nickname: '',          personality: '\u9644\u8FD1\u5E38\u70B9\u7684\u9910\u5385\u8001\u677F' }
  ];

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
    var userName = (state.userProfile && state.userProfile.name) || 'User';
    return '\u6211 (' + userName + ')';
  }

  function _pmsgEnsureUserChat() {
    if (!state.messageChats) state.messageChats = [];
    var displayName = _pmsgMakeUserDisplayName();
    var userMessages = _pmsgPullUserMessages();
    var userChat = null;
    for (var i = 0; i < state.messageChats.length; i++) {
      if (state.messageChats[i].roleId === 'user' || state.messageChats[i].isUser) {
        userChat = state.messageChats[i]; break;
      }
    }
    var lastMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    var lastContent = lastMsg ? (lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content) : '';
    var lastTime = lastMsg ? lastMsg.timestamp : Date.now();
    if (!userChat) {
      state.messageChats.push({ id:'msgchat_user_self', roleId:'user', npcId:'user_self', npcName:(state.userProfile&&state.userProfile.name)||'User', displayName:displayName, isUser:true, messages:userMessages, lastMessage:lastContent, lastTime:lastTime });
    } else {
      userChat.roleId='user'; userChat.isUser=true; userChat.displayName=displayName;
      userChat.npcName=(state.userProfile&&state.userProfile.name)||'User';
      userChat.messages=userMessages; userChat.lastMessage=lastContent; userChat.lastTime=lastTime;
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
      h+='<div class="papp-item pmsg-chat-item'+(chat.isUser?' pmsg-user-pinned':'')+'" onclick="openMessageChat(\''+_pmsgEscAttr(chat.id)+'\')">' +
        '<div class="'+avatarCls+'">'+_pmsgEscHtml(initial)+'</div>' +
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
    var h='<div class="pmsg-dark">';
    h+='<div class="pmsg-chat-header">' +
      '<button class="pmsg-back-btn" onclick="backToMessageList()"><svg viewBox="0 0 20 20"><path d="M13 4l-6 6 6 6"/></svg></button>' +
      '<div class="pmsg-chat-center"><div class="pmsg-chat-avatar">'+_pmsgEscHtml(initial)+'</div><div class="pmsg-chat-name">'+_pmsgEscHtml(name)+'</div></div>' +
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
    var selectedNpcs=[], usingFictional=false;
    if(state.npcs&&state.npcs.length>0){
      var pool=state.npcs.slice(); var pickCount=Math.min(pool.length,5+Math.floor(Math.random()*6));
      pickCount=Math.max(pickCount,Math.min(pool.length,5)); _shuffle(pool); selectedNpcs=pool.slice(0,pickCount);
    } else {
      usingFictional=true; var fictPool=FICTIONAL_POOL.slice(); var pickCount=5+Math.floor(Math.random()*6);
      _shuffle(fictPool); selectedNpcs=fictPool.slice(0,pickCount);
    }
    var api=state.apis&&state.apis.find(function(a){return a.id===state.activeApiId;});
    if(!api||!api.url){if(typeof showErrorModal==='function')showErrorModal(typeof T==='function'?T('configApi'):'Please configure API');else showToast('Please configure API first');return;}
    var bodyEl=document.querySelector('#phoneAppPage .papp-body');
    if(bodyEl){bodyEl.innerHTML='<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating conversations...</p></div>';}

    // ★★★ 人设注入：0-based Index + 尽量多字段（性格/背景/说话风格）★★★
    var npcList = selectedNpcs.map(function(npc, idx){
  var name  = npc.name || ('NPC_'+idx);
  var nick  = npc.nickname || npc.displayName || '';
  var pers  = npc.personality || npc.persona || npc.systemPrompt || npc.notes || npc.desc || npc.description || 'a friendly person';
  var bg    = npc.background || npc.setting || npc.bio || '';
  var style = npc.speakingStyle || npc.speaking_style || npc.style || npc.tone || '';
  var full  = _pmsgResolveFullPersona(npc);   // ★ 补齐完整人设

  var line = 'Index ' + idx + ':\n  - Name: "' + name + '"';
  if (nick)  line += '\n  - Nickname: "' + nick + '"';
  line += '\n  - Personality: "' + pers + '"';
  if (bg)    line += '\n  - Background: "' + bg + '"';
  if (style) line += '\n  - Speaking style: "' + style + '"';
  if (full)  line += '\n  - Full character setting: "' + full.replace(/\s+/g,' ').slice(0, 600) + '"'; // ★
  return line;
}).join('\n\n');

    var userName=(state.userProfile&&state.userProfile.name)||'User';
    var userName       = (state.userProfile && state.userProfile.name) || 'User';
var userPersonaBlk = _pmsgBuildUserPersonaBlock();   // ★ 用户人设
var worldbookBlk   = _pmsgBuildWorldbookBlock();     // ★ 世界书

var prompt =
  'You are generating realistic text-message chat histories. The phone owner (the "user") is "'+userName+'".\n\n'+

  // ★★★ ② 用户人设 ★★★
  '=== THE USER (phone owner) — who these contacts are talking TO ===\n'+
  userPersonaBlk + '\n\n'+

  // ★★★ ③ 世界书 ===
  (worldbookBlk
    ? '=== WORLD SETTING (all messages MUST stay consistent with this) ===\n'+worldbookBlk+'\n\n'
    : '') +

  // ★★★ ① 角色人设 ★★★
  (usingFictional?'These are fictional contacts:\n\n':'These are the contacts:\n\n')+npcList+'\n\n'+

  'RULES:\n'+
  '1. Generate ONE separate conversation for EACH contact listed above (3-8 messages each).\n'+
  '2. Tag every message with "sender": use exactly "user" for '+userName+', and exactly "npc" for the contact.\n'+
  '3. CRITICAL: every "npc" message MUST clearly reflect THAT contact\'s Personality, Background, Speaking style and Full character setting. '+
     'Do NOT write generic/interchangeable filler. Two different contacts must sound obviously different.\n'+
  '4. The contact must talk to the user based on the USER persona above (adjust tone/intimacy accordingly).\n'+
  '5. All content MUST stay consistent with the WORLD SETTING above (no out-of-world references).\n'+
  '6. Messages should alternate naturally between "user" and "npc".\n'+
  '7. Use the language that matches the contact\'s name/persona.\n'+
  '8. "npcIndex" MUST equal the exact Index number shown above for that contact (0-based). Never shift it.\n\n'+
  'Return ONLY a valid JSON array, one object per contact:\n'+
  '[\n'+
  '  { "npcIndex": 0, "messages": [ { "sender": "user", "content": "..." }, { "sender": "npc", "content": "..." } ] }\n'+
  ']';

// ★★★ 调试：确认三要素已注入 ★★★
console.log('[rollMessageChats] payload check =>',
  '| userPersona:', userPersonaBlk.length>0,
  '| worldbook:',   worldbookBlk.length>0,
  '| npcCount:',    selectedNpcs.length);

    try {
      var rawReply=await sendChat(api,[{role:'user',content:prompt}]);
      var convos=null;
      try{var jm=rawReply.match(/\[[\s\S]*\]/);if(jm)convos=JSON.parse(jm[0]);}catch(pe){console.error('[rollMessageChats] parse error:',pe);}
      if(!convos||!Array.isArray(convos)||convos.length===0){showToast('Generation failed');openPhoneApp('messages');return;}
      if(!state.messageChats)state.messageChats=[];
      var now=Date.now();
      convos.forEach(function(convo,ci){
        // ★ 严格校验 npcIndex，非法则回退到顺序索引，避免错位/越界导致 A 混入 B
        var npcIdx=(convo.npcIndex!=null && convo.npcIndex>=0 && convo.npcIndex<selectedNpcs.length)
          ? convo.npcIndex : ci;
        if(npcIdx<0||npcIdx>=selectedNpcs.length)return;
        var npc=selectedNpcs[npcIdx]; var msgs=convo.messages;
        if(!Array.isArray(msgs)||msgs.length<1)return;
        var npcName=npc.name||('NPC_'+npcIdx); var displayName=_pmsgMakeDisplayName(npc);
        var baseTime=now-(msgs.length*240000)-(ci*2400000);
        var stamped=msgs.map(function(m,mi){
          return {
            sender:_pmsgNormSender(m),   // ★ 归一化 sender，防止全挤一边
            content:(m.content||m.text||m.message||'').toString().trim(),
            timestamp:baseTime+mi*(60000+Math.floor(Math.random()*300000))
          };
        }).filter(function(m){return m.content.length>0;});
        if(stamped.length===0)return;
        var lastMsg=stamped[stamped.length-1]; var npcId=npc.id||('npc_'+npcIdx);
        var found=false;
        for(var ei=0;ei<state.messageChats.length;ei++){if(state.messageChats[ei].npcId===npcId&&!state.messageChats[ei].isUser){state.messageChats[ei]=_pmsgBuildChatObj(npcId,npcName,displayName,stamped,lastMsg);found=true;break;}}
        if(!found)state.messageChats.push(_pmsgBuildChatObj(npcId,npcName,displayName,stamped,lastMsg));
      });
      _pmsgEnsureUserChat(); saveState(); openPhoneApp('messages'); showToast('Generated '+convos.length+' conversations');
    } catch(e){console.error('[rollMessageChats] error:',e);showToast('Error: '+(e.message||String(e)));openPhoneApp('messages');}
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
   if(s==='user'||s==='me'||s==='self'||s==='u') return 'user';
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

    // === TEST 1: No-NPC fictional generation ===
    console.log('%c[Test 1] No-NPC: fictional chars','color:#aaa');
    state.npcs=[]; state.messageChats=[];
    var fp=FICTIONAL_POOL.slice(); var pc=5+Math.floor(Math.random()*6); _shuffle(fp); var sf=fp.slice(0,pc);
    assert('Fictional pool >= 10',FICTIONAL_POOL.length>=10,'Pool: '+FICTIONAL_POOL.length);
    assert('Picked 5~10 fictional',sf.length>=5&&sf.length<=10,'Picked: '+sf.length);
    sf.forEach(function(npc,ni){var msgs=[];for(var mi=0;mi<4;mi++)msgs.push({sender:mi%2===0?'user':'npc',content:'Test #'+mi,timestamp:now-ni*240000-mi*60000});var dn=_pmsgMakeDisplayName(npc);var lm=msgs[msgs.length-1];state.messageChats.push(_pmsgBuildChatObj(npc.id,npc.name,dn,msgs,lm));});
    _pmsgEnsureUserChat();
    assert('No-NPC: chats created',state.messageChats.length>=6,'Got '+state.messageChats.length);
    assert('No-NPC: user chat exists',state.messageChats.some(function(c){return c.isUser===true;}));

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

