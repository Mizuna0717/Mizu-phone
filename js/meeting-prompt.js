// ========== meeting-prompt.js ==========
// Meeting Prompt — 提示詞構建器（v3：统一上下文构建器）

function mtgBuildSystemPrompt(session, ch) {
  var p = '';

  // ★ 1. Meeting 专用系统提示词
  if (typeof getActiveSystemPrompt === 'function') {
    var prevMode = (typeof tmp !== 'undefined' && tmp.chatMode) ? tmp.chatMode : undefined;
    if (typeof tmp !== 'undefined') tmp.chatMode = 'meeting';
    var activePrompt = getActiveSystemPrompt();
    if (typeof tmp !== 'undefined') {
      if (prevMode !== undefined) tmp.chatMode = prevMode;
      else delete tmp.chatMode;
    }
    if (activePrompt) {
      var _userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : 'User';
      activePrompt = activePrompt.replace(/\{\{user\}\}/g, _userName).replace(/\{\{char\}\}/g, ch.name);
      p += activePrompt + '\n\n';
    }
  }

  // ★★★ 2. 统一注入三要素（角色人设 + 用户/面具人设 + 世界书）★★★
  if (typeof buildUnifiedContext === 'function') {
    p += buildUnifiedContext({ character: ch, worldbooks: state.worldbooks }) + '\n\n';
    console.log('[Meeting-Prompt] Unified context injected for', ch.name);
  } else {
    // 兜底：极简人设
    p += '[Character Profile]\nName: ' + ch.name +
      (ch.personality ? '\nPersonality: ' + ch.personality : '') +
      (ch.background ? '\nBackground: ' + ch.background : '') +
      (ch.systemPrompt ? '\n' + ch.systemPrompt : '') + '\n\n';
  }

  // ★ 3. IF 模式专用字段
  if (session.mode === 'if') {
    if (session.worldview) {
      p += 'WORLDVIEW:\n' + session.worldview + '\n\n';
    }
    if (session.identity) {
      p += 'USER IDENTITY IN THIS SCENARIO:\n' + session.identity + '\n\n';
    }
  }

  // ★ 4. 协作写作规则
  var cpDesc = {
    first: 'first person (I, me, my)',
    second: 'second person (you, your)',
    third: 'third person (' + ch.name + ', he/she/they)'
  };
  var upDesc = {
    first: 'first person (I, me, my)',
    second: 'second person (you, your)',
    third: 'third person'
  };

  p += '--- COLLABORATIVE WRITING SESSION RULES ---\n';
  p += '1. Write your response using ' + (cpDesc[session.charPerson] || cpDesc.first) + ' narration.\n';
  p += '2. The user writes in ' + (upDesc[session.userPerson] || upDesc.first) + '.\n';
  p += '3. Your response MUST be between ' + session.wc.min + ' and ' + session.wc.max + ' words. Count carefully.\n';
  p += '4. Stay completely in character.\n';
  p += '5. Advance the story naturally. Do not repeat the user\'s content.\n';
  p += '6. Output only narrative prose. No meta-commentary, no character name prefix.\n';
  p += '---\n';

  // ★ 5. 多角色场景上下文
  if (session.charIds && session.charIds.length > 1) {
    p += '\n[Group Scene Context]\n';
    p += 'This is a meeting/group scene with multiple characters.\n';
    p += 'You are playing the role of **' + ch.name + '**. Respond ONLY as ' + ch.name + '.\n';
    p += 'Other characters in this scene:\n';
    session.charIds.forEach(function(cid) {
      if (cid === ch.id) return;
      var otherCh = mtgGetCharById(cid);
      if (otherCh) {
        p += '- ' + otherCh.name;
        if (otherCh.personality) p += ' (' + otherCh.personality.substring(0, 100) + ')';
        p += '\n';
      }
    });
    p += 'Interact naturally with the other characters. Do not speak for them.\n\n';
  }

  // ★ 6. 会话内记忆摘要
  if (session.shortTermMemories && session.shortTermMemories.length > 0) {
    p += '\nSTORY SUMMARIES (for context):\n';
    session.shortTermMemories.forEach(function(mem, idx) {
      p += '- Summary ' + (idx + 1) + ': ' + mem.content + '\n';
    });
    p += '\n';
  } else if (session.shortTermMemory && session.shortTermMemory.length > 0) {
    p += '\nSTORY SUMMARIES (for context):\n';
    session.shortTermMemory.forEach(function(mem) {
      p += '- Round ' + mem.round + ': ' + mem.content + '\n';
    });
    p += '\n';
  }

    // ★ 7. 角色的记忆注入（统一使用 buildMemoryContext）
  var _mtgMemCtx = (typeof buildMemoryContext === 'function')
    ? buildMemoryContext(ch.id)
    : (function() {
        // 兜底：直接读 state.memories
        var _allMem = (state.memories || []).filter(function(m) { return m.charId === ch.id; });
        if (!_allMem.length) return '';
        _allMem.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        return '[近期发生的事情]\n' + _allMem.slice(0, 10).map(function(m) {
          return '- (' + (m.date || '') + ') ' + (m.title ? m.title + ': ' : '') + m.content;
        }).join('\n');
      })();

  if (_mtgMemCtx) {
    var _mtgUserName = (typeof mtgGetUserName === 'function') ? mtgGetUserName()
      : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '用户');
    p += '\n[系统设定]\n你是' + ch.name + '，你正在和' + _mtgUserName + '进行协作写作。';
    p += '\n\n[以下是你脑海中关于' + _mtgUserName + '的记忆]\n' + _mtgMemCtx;
    p += '\n\n[对话规则]\n1. 请自然地结合你脑海中的记忆来回应，不要机械地复述记忆。\n2. 如果记忆中的事件与当前对话无关，不要强行提起，以免显得生硬。\n3. 你的语气要带有回忆的温度，就像是一个真的在努力记住对方的人。\n4. 保持你原本的角色设定，不要跳出角色。';
    p += '\n';
  }

    // ★ 8. Ban NSFW 指令注入
  if (session.banNsfw) {
    p += '\n[CONTENT RESTRICTION]\n';
    p += '禁止生成任何 NSFW 内容，包括色情、成人、暴力、血腥等相关描写。Do NOT generate any NSFW content, including pornographic, adult, violent, or gory depictions.\n';
    console.log('[Meeting-Prompt] Ban-NSFW instruction injected.');
  }

  // ★ 9. Anti-Snatch 指令注入
  if (session.antiSnatch) {
    p += '\n[TURN DISCIPLINE]\n';
    p += '等待用户完整说完后再回复，禁止在用户发言中间插话或抢话。Wait for the user to finish their full message before responding. Do NOT interrupt mid-speech.\n';
    console.log('[Meeting-Prompt] Anti-snatch instruction injected.');
  }

  console.log('[Meeting-Prompt] ======= System Prompt Built =======',
    '\n| Character:', ch.name,
    '\n| Session:', session.name,
    '\n| Mode:', session.mode,
    '\n| banNsfw:', !!session.banNsfw,
    '\n| antiSnatch:', !!session.antiSnatch,
    '\n| Prompt length:', p.length, 'chars');

  return p;
}


/* ── Build Context Messages ── */
function mtgBuildContextMessages(session, ch) {
  var N = session.contextCount || 50;
  var msgs = [];

  var meetingEntries = (session.history || []).filter(function(e) {
    return e.role !== 'summary';
  });
  var M = meetingEntries.length;
  var meetingToSend = (M >= N) ? meetingEntries.slice(-N) : meetingEntries;

  if (session.mode === 'continue' && M < N && ch) {
    var imsgNeeded = N - M;
    var chatHist = (state.chats && state.chats[ch.id]) ? state.chats[ch.id] : [];
    var recent = chatHist.slice(-imsgNeeded);
    if (recent.length > 0) {
      var ctx = '[Previous conversation between ' + ch.name + ' and the user \u2014 for context only]\n\n';
      recent.forEach(function(m) {
        if (m.recalled) return;
        var lbl = m.role === 'assistant' ? ch.name : 'User';
        var txt = m.content || '';
        if (m.type === 'voice') txt = '[Voice]: ' + txt;
        else if (m.type === 'sticker') txt = '[Sticker]';
        else if (m.type === 'image') txt = '[Image]';
        ctx += lbl + ': ' + txt + '\n';
      });
      ctx += '\n[End of previous context. Now continue the collaborative story.]\n';
      msgs.push({ role: 'system', content: ctx });
    }
  }

  meetingToSend.forEach(function(entry) {
    if (entry.role === 'user') {
      msgs.push({ role: 'user', content: entry.content });
    } else if (entry.role === 'char') {
      if (entry.charName === ch.name) {
        msgs.push({ role: 'assistant', content: entry.content });
      } else {
        msgs.push({ role: 'system', content: '[' + (entry.charName || 'Character') + ' wrote]: ' + entry.content });
      }
    } else if (entry.role === 'system') {
      msgs.push({ role: 'system', content: entry.content });
    }
  });

  return msgs;
}
