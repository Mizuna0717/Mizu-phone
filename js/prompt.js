// ========== 07-prompt.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 17-memory.js, 18-chat-config.js

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

  // ====== 三段式输出格式 ======
  p += `\n\n[CRITICAL - Response Format]
You MUST structure EVERY reply using EXACTLY this three-part format with Chinese brackets:

【回复】
(Your spoken dialogue, visible reactions, and narrative content here. This is what the user sees as the chat message. You may include [表情:name], [语音:content], [转账:amount:note], [图片:description], or [通话:语音/视频] tags here when appropriate.)

【动作】
(Your current physical actions, body language, facial expressions at this moment. Write in third person, e.g. "低头微笑，手指轻叩桌面")

【心声】
(Your TRUE inner thoughts and feelings that you would NEVER say out loud. Be honest, vulnerable, contradictory if needed. e.g. "其实我有点紧张，不想让她发现我在意")

All three sections are MANDATORY. Never omit any section.`;

  // ★★★ 时间感知注入 ★★★
  const charCfg = getCharConfig(ch.id);
  if (charCfg.timeAwareness) {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      weekday: 'long', hour12: false
    });
    p += `\n\n[Current Time]\n当前时间：${timeStr}\n请在回复中自然地反映时间感知（如早晚问候、作息等），但不要刻意提及具体时间数字。`;
  }

  // ★★★ 表情包使用开关注入 ★★★
  if (charCfg.useStickers) {
    // 从 state.stickers 中获取可用表情包列表
    const stickerList = (state.stickers && Array.isArray(state.stickers)) ? state.stickers : [];
    if (stickerList.length > 0) {
      const stickerNames = stickerList
        .map(s => s.name || s.title || s.id || '')
        .filter(n => n)
        .slice(0, 50); // 最多列出50个，避免提示词过长

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

  // ★★★ 回复条数指令注入 ★★★
  if (charCfg.replyMax > 1) {
    p += `\n\n[Reply Count Instructions]\n请根据以下要求决定本次回复的消息条数：最少 ${charCfg.replyMin} 条，最多 ${charCfg.replyMax} 条。请随机选择一个条数，然后将【回复】部分的内容拆分为多条独立消息发送。每条消息之间用 ---SPLIT--- 分隔。每条消息应该是独立的、自然的对话内容。\n例如：\n【回复】\n你好啊！\n---SPLIT---\n最近在干嘛？`;
  }

  // 记忆注入
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


// ========== PARSE AI REPLY ==========
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
