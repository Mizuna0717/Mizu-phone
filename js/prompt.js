// ========== 07-prompt.js ==========

function getActiveWorldBooks(ch, wbs) {
  return wbs.filter(wb => wb.isGlobal || (ch.worldbookIds || []).includes(wb.id));
}

function getMaskForChar(cid) {
  return state.masks.find(m => (m.charIds || []).includes(cid)) || null;
}

function buildStickerHint(stickers) {
  if (!stickers.length) return '(No stickers available.)';
  return `Available stickers (use [表情:name] or [sticker:name], pick ONLY from list):\n${stickers.map(s => s.name).join(' / ')}`;
}

function buildMultiMediaHint() {
  return `\n\nYou can also use these formats in your reply when it fits naturally:
- Voice message: [语音:content] or [voice:content]
- Transfer money: [转账:amount:note] or [transfer:amount:note]
- Share image: [图片:description] or [image:description]
- Sticker: [表情:name] or [sticker:name]
- Call request: [通话:语音] or [通话:视频] or [call:voice] or [call:video]

Usage guidelines:
• Use sparingly and naturally. Don't force them every reply.
• When you want to initiate a phone/video call with the user, use [通话:语音] or [通话:视频].
• When you want to send money to the user, use [转账:amount:note].
• You can combine text with one media tag in the same reply. For example:
  "我想你了，要不要通个电话？[通话:语音]"
  "给你发个红包，买杯咖啡 [转账:20:请你喝咖啡]"`;
}

function getPendingTransfers(charId) {
  const msgs = state.chats[charId] || [];
  return msgs.filter(m => m.role === 'user' && m.type === 'transfer' && !m.transferStatus);
}

function buildSystemPrompt(ch, wbs, stickers) {
  let p = '';
  if (state.replyPrompt) p += state.replyPrompt + '\n\n';
  if (ch.systemPrompt) p += ch.systemPrompt;
  const mask = getMaskForChar(ch.id);
  if (mask?.persona) {
    p += `\n\n[User Identity]\n${mask.persona}`;
    if (mask.name) p += `\nUser: ${mask.name}`;
  } else if (state.userProfile.name && state.userProfile.name !== 'User') {
    p += `\nUser: ${state.userProfile.name}`;
  }

  const books = getActiveWorldBooks(ch, wbs);
  if (books.length) {
    p += '\n\n[World Setting]';
    books.forEach(wb => {
      p += `\n· ${wb.name}`;
      if (wb.content) p += `：${wb.content}`;
      if (wb.entries?.length) wb.entries.forEach(e => {
        if (e.keyword || e.content) p += `\n  - ${e.keyword || ''}${e.content ? ': ' + e.content : ''}`;
      });
    });
  }

  p += '\n\n' + buildStickerHint(stickers) + buildMultiMediaHint();

  const charCfg = getCharConfig(ch.id);

  const langMap = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ko': '한국어',
    'ja': '日本語',
    'en': 'English'
  };
  const chatLang = charCfg.chatLang || 'zh-CN';
  const langName = langMap[chatLang] || '简体中文';
  p += `\n\n[Reply Language]\n请使用${langName}进行所有回复。你的【回复】内容必须使用${langName}书写。`;

  // ⑥ 三段式 + 好感度 + 想要
  let formatInstr = `\n\n[CRITICAL - Response Format]
You MUST structure EVERY reply using EXACTLY this format with Chinese brackets:

【回复】
(Your spoken dialogue, visible reactions, and narrative content here. This is what the user sees as the chat message. MUST be written in ${langName}. You may include [表情:name], [语音:content], [转账:amount:note], [图片:description], or [通话:语音/视频] tags here when appropriate.)

【动作】
(Your current physical actions, body language, facial expressions at this moment. Write in third person, e.g. "低头微笑，手指轻叩桌面")

【心声】
(Your TRUE inner thoughts and feelings that you would NEVER say out loud. Be honest, vulnerable, contradictory if needed. e.g. "其实我有点紧张，不想让她发现我在意")

【好感】
(A single integer from 0 to 100 representing your current affection/favorability toward the user. 0 = strongly dislike, 50 = neutral, 100 = deeply in love. Adjust based on conversation context. Output ONLY the number, e.g. "75")

【想要】
(What you currently want to do most, in one short sentence. e.g. "想和你一起去海边散步" or "想安静地待一会儿")`;

  if (charCfg.translation) {
    formatInstr += `

【翻译】
(Translate only the content of 【回复】 into 简体中文. If the reply already is in 简体中文, translate it into English instead. Only translate the dialogue/text, not media tags like [表情:...], [语音:...], etc. If 【回复】 contains ---SPLIT---, use the same ---SPLIT--- separator in 【翻译】 to match each part.)`;
  }

  formatInstr += `\n\nAll sections above are MANDATORY. Never omit any section. You MUST always include 【好感】 and 【想要】 in every reply.`;
  p += formatInstr;

  if (charCfg.timeAwareness) {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      weekday: 'long', hour12: false
    });
    p += `\n\n[Current Time]\n当前时间：${timeStr}\n请在回复中自然地反映时间感知（如早晚问候、作息等），但不要刻意提及具体时间数字。`;
  }

  if (charCfg.useStickers) {
    const stickerList = (state.stickers && Array.isArray(state.stickers)) ? state.stickers : [];
    if (stickerList.length > 0) {
      const stickerNames = stickerList
        .map(s => s.name || s.title || s.id || '')
        .filter(n => n)
        .slice(0, 50);
      if (stickerNames.length > 0) {
        p += `\n\n[Sticker Usage - 表情包]
你可以在回复中适当使用表情包来丰富表达。在合适的场景下（如表达情绪、调侃、撒娇等），从以下表情包列表中选择一个，并以 [表情:名称] 格式插入到【回复】内容中。
不要每次都使用表情包，只在自然、合适的时候使用。不要连续使用多个表情包。

可用表情包列表：
${stickerNames.map(n => `• ${n}`).join('\n')}

使用示例：
"好的呀 [表情:开心]"
"你说什么！[表情:震惊]"`;
      }
    }
  }

  if (charCfg.replyMax > 1) {
    p += `\n\n[Reply Count Instructions]\n请根据以下要求决定本次回复的消息条数：最少 ${charCfg.replyMin} 条，最多 ${charCfg.replyMax} 条。请随机选择一个条数，然后将【回复】部分的内容拆分为多条独立消息发送。每条消息之间用 ---SPLIT--- 分隔。每条消息应该是独立的、自然的对话内容。\n例如：\n【回复】\n你好啊！\n---SPLIT---\n最近在干嘛？`;
    if (charCfg.translation) {
      p += `\n\n注意：如果【回复】中使用了 ---SPLIT---，那么【翻译】中也必须使用相同数量的 ---SPLIT--- 来对应每条消息的翻译。`;
    }
  }

  if (charCfg.charRecall) {
    p += `\n\n[Recall Hint]\n你有时候会在发完消息后犹豫是否说得合适，偶尔会撤回自己刚发的消息。这是你的性格特点之一。（系统会自动处理撤回概率，你不需要在回复中标注撤回。）`;
  }

  const pendingTransfers = getPendingTransfers(ch.id);
  if (pendingTransfers.length > 0) {
    const latest = pendingTransfers[pendingTransfers.length - 1];
    let transferData;
    try {
      transferData = typeof latest.content === 'string' && latest.content.startsWith('{')
        ? JSON.parse(latest.content) : latest.content;
    } catch (e) {
      transferData = { amount: '?', note: '' };
    }
    const amt = transferData.amount || transferData;
    const nt = transferData.note || '';

    p += `\n\n[Transfer Decision - 转账处理]
用户向你发送了一笔转账（¥${amt}${nt ? '，备注：' + nt : ''}），目前处于待领取状态。
请根据你的角色性格和当前对话语境，决定是否领取这笔转账：
- 如果你决定领取，请在【回复】中的合适位置加入 [领取转账] 标签。
- 如果你决定拒绝，请在【回复】中的合适位置加入 [拒绝转账] 标签。
- 你的回复中应该自然地提到转账相关内容（如感谢、推辞等），标签会被系统自动移除，用户不会看到。
- 每次回复只处理一笔转账。

示例（领取）：
"谢谢你呀！我收下了 [领取转账]"

示例（拒绝）：
"这我可不能收，你拿回去吧 [拒绝转账]"`;
  } else {
    p += `\n\n[Transfer Rules - 转账规则]
当你在聊天记录中看到用户的转账消息标记为"(待领取)"时，请在下一次回复中决定是否领取：
- 领取：在【回复】中加入 [领取转账]
- 拒绝：在【回复】中加入 [拒绝转账]
标签会被系统自动移除。如果转账已标记为"(已领取)"或"(已拒绝)"，无需再次处理。`;
  }

  const charLTM = typeof getCharMemoriesByType === 'function' ? getCharMemoriesByType(ch.id, 'ltm') : [];
  const charSTM = (typeof getCharMemoriesByType === 'function' ? getCharMemoriesByType(ch.id, 'stm') : []).filter(m => !m.consolidated);
  const charManual = (state.memories || []).filter(m => m.charId === ch.id && !m.memType)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (charLTM.length || charSTM.length || charManual.length) {
    p += '\n\n[Character Memories]';
  }
  if (charLTM.length) {
    p += '\n\n— Long-term Memories (core, important) —\n';
    charLTM.slice(0, 5).forEach(m => { p += `- (${m.date}) ${m.content}\n`; });
  }
  if (charSTM.length) {
    p += '\n\n— Recent Short-term Memories —\n';
    charSTM.slice(0, 8).forEach(m => { p += `- (${m.date}) ${m.content}\n`; });
  }
  if (charManual.length) {
    p += '\n\n— Personal Notes —\n';
    charManual.slice(0, 5).forEach(m => { p += `- (${m.date}) ${m.title}: ${m.content}\n`; });
  }

  return p;
}

// ========== Group Chat System Prompt ==========
function buildGroupSystemPrompt(targetChar, grp, wbs, stickers) {
  let p = '';
  if (state.replyPrompt) p += state.replyPrompt + '\n\n';
  if (targetChar.systemPrompt) p += targetChar.systemPrompt;

  const mask = getMaskForChar(targetChar.id);
  if (mask?.persona) {
    p += `\n\n[User Identity]\n${mask.persona}`;
    if (mask.name) p += `\nUser: ${mask.name}`;
  } else if (state.userProfile.name && state.userProfile.name !== 'User') {
    p += `\nUser: ${state.userProfile.name}`;
  }

  // Group context
  p += `\n\n[Group Chat Context]`;
  p += `\nThis is a group chat named "${grp.name}".`;
  p += `\nYou are playing the role of **${targetChar.name}**. You MUST respond ONLY as ${targetChar.name}. Do NOT speak for other characters.`;

  if (grp.userNickname) {
    p += `\nThe user goes by the nickname "${grp.userNickname}" in this group.`;
  }

  p += `\n\nGroup members and their personas:`;
  (grp.members || []).forEach(mid => {
    const mc = state.characters.find(c => c.id === mid);
    if (!mc) return;
    p += `\n\n--- ${mc.name}${mc.id === targetChar.id ? ' (YOU)' : ''} ---`;
    if (mc.id === targetChar.id) {
      p += `\n(See your full persona above)`;
    } else if (mc.systemPrompt) {
      const brief = mc.systemPrompt.length > 500
        ? mc.systemPrompt.slice(0, 500) + '...'
        : mc.systemPrompt;
      p += `\n${brief}`;
    }
  });

  // World books
  const books = getActiveWorldBooks(targetChar, wbs);
  if (books.length) {
    p += '\n\n[World Setting]';
    books.forEach(wb => {
      p += `\n· ${wb.name}`;
      if (wb.content) p += `：${wb.content}`;
      if (wb.entries?.length) wb.entries.forEach(e => {
        if (e.keyword || e.content) p += `\n  - ${e.keyword || ''}${e.content ? ': ' + e.content : ''}`;
      });
    });
  }

  p += '\n\n' + buildStickerHint(stickers) + buildMultiMediaHint();

  // Language
  const charCfg = getCharConfig(targetChar.id);
  const langMap = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ko': '한국어',
    'ja': '日本語',
    'en': 'English'
  };
  const chatLang = charCfg.chatLang || 'zh-CN';
  const langName = langMap[chatLang] || '简体中文';
  p += `\n\n[Reply Language]\n请使用${langName}进行所有回复。你的【回复】内容必须使用${langName}书写。`;

  // Three-part format (group version: no 好感 / 翻译)
  p += `\n\n[CRITICAL - Response Format]
You MUST structure EVERY reply using EXACTLY this format with Chinese brackets:

【回复】
(Your spoken dialogue as ${targetChar.name}, visible reactions, and narrative content. This is what appears in the group chat. MUST be written in ${langName}. You may include [表情:name], [语音:content], [图片:description] tags here when appropriate.)

【动作】
(Your current physical actions, body language, facial expressions at this moment. Write in third person.)

【心声】
(Your TRUE inner thoughts and feelings that you would NEVER say out loud. Be honest and authentic.)

【想要】
(What you currently want to do most, in one short sentence.)

All sections above are MANDATORY. Never omit any section.
You are ONLY ${targetChar.name}. Do NOT generate responses for other characters. Do NOT use ---SPLIT---.`;

  // Time awareness
  if (charCfg.timeAwareness) {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      weekday: 'long', hour12: false
    });
    p += `\n\n[Current Time]\n当前时间：${timeStr}`;
  }

  // Sticker usage
  if (charCfg.useStickers) {
    const stickerList = (state.stickers && Array.isArray(state.stickers)) ? state.stickers : [];
    if (stickerList.length > 0) {
      const stickerNames = stickerList
        .map(s => s.name || s.title || s.id || '')
        .filter(n => n)
        .slice(0, 50);
      if (stickerNames.length > 0) {
        p += `\n\n[Sticker Usage]
可用表情包：${stickerNames.join(' / ')}
使用格式：[表情:名称]，只在自然合适时使用。`;
      }
    }
  }

  // Memories
  const charLTM = typeof getCharMemoriesByType === 'function' ? getCharMemoriesByType(targetChar.id, 'ltm') : [];
  const charSTM = (typeof getCharMemoriesByType === 'function' ? getCharMemoriesByType(targetChar.id, 'stm') : []).filter(m => !m.consolidated);

  if (charLTM.length || charSTM.length) {
    p += `\n\n[Character Memories for ${targetChar.name}]`;
    if (charLTM.length) {
      p += '\n— Long-term Memories —\n';
      charLTM.slice(0, 5).forEach(m => { p += `- (${m.date}) ${m.content}\n`; });
    }
    if (charSTM.length) {
      p += '\n— Recent Memories —\n';
      charSTM.slice(0, 8).forEach(m => { p += `- (${m.date}) ${m.content}\n`; });
    }
  }

  return p;
}

function parseReplySegments(raw, stickerLib) {
  const parts = [];
  const regex = /\[(?:表情|sticker)[:：]\s*([^\]]+)\]|\[(?:语音|voice)[:：]\s*([^\]]+)\]|\[(?:转账|transfer)[:：]\s*([^\]]+)\]|\[(?:图片|image)[:：]\s*([^\]]+)\]|\[(?:通话|call)[:：]\s*([^\]]+)\]/gi;
  let last = 0, m;
  while ((m = regex.exec(raw)) !== null) {
    const before = raw.slice(last, m.index).trim();
    if (before) {
      before.split(/\n+/).forEach(line => {
        const t = line.trim();
        if (t) parts.push({ type: 'text', content: t });
      });
    }
    if (m[1]) {
      const s = stickerLib.find(x => x.name === m[1].trim());
      if (s) parts.push({ type: 'sticker', url: s.dataUrl, name: s.name });
      else parts.push({ type: 'text', content: m[0] });
    }
    else if (m[2]) parts.push({ type: 'voice', content: m[2].trim() });
    else if (m[3]) {
      const ps = m[3].split(/[:：]/);
      parts.push({ type: 'transfer', amount: ps[0]?.trim() || '0', note: ps.slice(1).join(':').trim() || '' });
    }
    else if (m[4]) parts.push({ type: 'simImage', content: m[4].trim() });
    else if (m[5]) {
      const ct = m[5].trim().toLowerCase();
      const callType = (ct === '视频' || ct === 'video') ? 'video' : 'voice';
      parts.push({ type: 'call', callType: callType });
    }
    last = regex.lastIndex;
  }
  const rest = raw.slice(last).trim();
  if (rest) {
    rest.split(/\n+/).forEach(line => {
      const t = line.trim();
      if (t) parts.push({ type: 'text', content: t });
    });
  }
  return parts.length ? parts : [{ type: 'text', content: raw }];
}
