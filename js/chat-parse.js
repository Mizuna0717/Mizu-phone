// ========== chat-parse.js ==========
// Three-part reply parsing, transfer processing, group positions

function parseThreePartReply(raw) {
  var result = {
    content: raw,
    innerAction: '',
    innerThought: '',
    translation: '',
    affection: '',
    wannaDo: ''
  };

  var tags = ['回复','动作','心声','翻译','好感','想要'];
  var tagPattern = tags.map(function(t) { return '【' + t + '】'; }).join('|');
  var hasAny = new RegExp(tagPattern).test(raw);
  if (!hasAny) return result;

  var replyMatch       = raw.match(/【回复】\s*([\s\S]*?)(?=【动作】|【心声】|【翻译】|【好感】|【想要】|$)/);
  var actionMatch      = raw.match(/【动作】\s*([\s\S]*?)(?=【回复】|【心声】|【翻译】|【好感】|【想要】|$)/);
  var thoughtMatch     = raw.match(/【心声】\s*([\s\S]*?)(?=【回复】|【动作】|【翻译】|【好感】|【想要】|$)/);
  var translationMatch = raw.match(/【翻译】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|【好感】|【想要】|$)/);
  var affectionMatch   = raw.match(/【好感】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|【翻译】|【想要】|$)/);
  var wannaMatch       = raw.match(/【想要】\s*([\s\S]*?)(?=【回复】|【动作】|【心声】|【翻译】|【好感】|$)/);

  if (replyMatch)       result.content      = replyMatch[1].trim();
  if (actionMatch)      result.innerAction  = actionMatch[1].trim();
  if (thoughtMatch)     result.innerThought = thoughtMatch[1].trim();
  if (translationMatch) result.translation  = translationMatch[1].trim();
  if (affectionMatch)   result.affection    = affectionMatch[1].trim();
  if (wannaMatch)       result.wannaDo      = wannaMatch[1].trim();

  return result;
}

function processTransferDecision(charId, rawText) {
  var hasAccept  = /\[\s*领取转账\s*\]/.test(rawText);
  var hasDecline = /\[\s*拒绝转账\s*\]/.test(rawText);
  if (hasAccept || hasDecline) {
    var msgs = state.chats[charId] || [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user' && msgs[i].type === 'transfer' && !msgs[i].transferStatus) {
        msgs[i].transferStatus = hasAccept ? 'accepted' : 'declined';
        saveState();
        break;
      }
    }
  }
}

function stripTransferTags(contentStr) {
  return contentStr
    .replace(/\[\s*领取转账\s*\]/g, '')
    .replace(/\[\s*拒绝转账\s*\]/g, '')
    .trim();
}

// ========== Compute group positions (1:1 chat) ==========
function _computeGroupPositions(msgs) {
  var positions = new Array(msgs.length);
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].type === 'call-summary') {
      positions[i] = 'system';
      continue;
    }
    var prevIdx = -1;
    for (var j = i - 1; j >= 0; j--) {
      if (msgs[j].type !== 'call-summary') { prevIdx = j; break; }
    }
    var nextIdx = -1;
    for (var k = i + 1; k < msgs.length; k++) {
      if (msgs[k].type !== 'call-summary') { nextIdx = k; break; }
    }

    var prevSameGroup = prevIdx >= 0 &&
      msgs[prevIdx].role === msgs[i].role &&
      (msgs[i].timestamp - msgs[prevIdx].timestamp <= 180000);

    var nextSameGroup = nextIdx >= 0 &&
      msgs[nextIdx].role === msgs[i].role &&
      (msgs[nextIdx].timestamp - msgs[i].timestamp <= 180000);

    if      (prevSameGroup && nextSameGroup)  positions[i] = 'middle';
    else if (prevSameGroup && !nextSameGroup) positions[i] = 'last';
    else if (!prevSameGroup && nextSameGroup) positions[i] = 'first';
    else                                      positions[i] = 'solo';
  }
  return positions;
}

// ========== Compute group positions (group chat, by sender) ==========
function _computeGroupChatPositions(msgs) {
  var positions = new Array(msgs.length);
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].type === 'call-summary') {
      positions[i] = 'system';
      continue;
    }
    var mySender = msgs[i].role === 'user' ? '__user__' : (msgs[i].senderId || '__unknown__');

    var prevIdx = -1;
    for (var j = i - 1; j >= 0; j--) {
      if (msgs[j].type !== 'call-summary') { prevIdx = j; break; }
    }
    var nextIdx = -1;
    for (var k = i + 1; k < msgs.length; k++) {
      if (msgs[k].type !== 'call-summary') { nextIdx = k; break; }
    }

    var prevSender = prevIdx >= 0 ? (msgs[prevIdx].role === 'user' ? '__user__' : (msgs[prevIdx].senderId || '__unknown__')) : null;
    var nextSender = nextIdx >= 0 ? (msgs[nextIdx].role === 'user' ? '__user__' : (msgs[nextIdx].senderId || '__unknown__')) : null;

    var prevSameGroup = prevSender !== null && prevSender === mySender && (msgs[i].timestamp - msgs[prevIdx].timestamp <= 180000);
    var nextSameGroup = nextSender !== null && nextSender === mySender && (msgs[nextIdx].timestamp - msgs[i].timestamp <= 180000);

    if      (prevSameGroup && nextSameGroup)  positions[i] = 'middle';
    else if (prevSameGroup && !nextSameGroup) positions[i] = 'last';
    else if (!prevSameGroup && nextSameGroup) positions[i] = 'first';
    else                                      positions[i] = 'solo';
  }
  return positions;
}

// ========== Pick a group responder (backward compat) ==========
function pickGroupResponder(groupId) {
  var grp = getGroupById(groupId);
  if (!grp || !grp.members || !grp.members.length) return null;
  var idx = Math.floor(Math.random() * grp.members.length);
  return state.characters.find(function(c) { return c.id === grp.members[idx]; }) || null;
}

// ========== Build per-character chat messages for group API call ==========
function _buildGroupChatMsgsForChar(groupId, targetCharId, contextCount) {
  var grp = getGroupById(groupId);
  var userName = (grp && grp.userNickname) ? grp.userNickname : (state.userProfile.name || 'User');
  var rawMsgs = (state.chats[groupId] || []);

  var transformed = rawMsgs.map(function(m) {
    var content = m.content;
    if (m.recalled) content = '[Message recalled]';
    else if (m.type === 'voice') content = '[Voice]: ' + m.content;
    else if (m.type === 'sticker') content = '[Sent sticker]';
    else if (m.type === 'transfer') {
      var d;
      try {
        d = typeof m.content === 'string' && m.content.startsWith('{')
          ? JSON.parse(m.content) : m.content;
      } catch(e) { d = m.content; }
      content = '[Transfer $' + (d.amount || d) + ']';
    }
    else if (m.type === 'image') content = '[Image]';
    else if (m.type === 'simImage') content = '[Image: ' + m.content + ']';
    else if (m.type === 'call') {
      var ct2 = m.callType === 'video' ? 'Video' : 'Voice';
      content = '[' + ct2 + ' Call]';
    }
    else if (m.role === 'system' || m.type === 'call-summary') {
      return { role: 'system', content: m.content };
    }

    if (m.role === 'user') {
      return { role: 'user', content: '[' + userName + ']: ' + content };
    }

    if (m.senderId === targetCharId) {
      return { role: 'assistant', content: content };
    } else {
      var sc = state.characters.find(function(c) { return c.id === m.senderId; });
      var sn = sc ? sc.name : 'Unknown';
      return { role: 'user', content: '[' + sn + ']: ' + content };
    }
  });

  return transformed.slice(-(contextCount || 50));
}

window.pickGroupResponder = pickGroupResponder;
