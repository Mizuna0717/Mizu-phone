// ========== 07-prompt.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 17-memory.js (getCharMemoriesByType)

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
Use sparingly and naturally. Don't force them every reply.`;
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

  // 記憶注入
  const charLTM = getCharMemoriesByType(ch.id, 'ltm');
  const charSTM = getCharMemoriesByType(ch.id, 'stm').filter(m => !m.consolidated);
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

  p += '\n\n' + buildStickerHint(stickers) + buildMultiMediaHint();
  return p;
}

// ========== PARSE AI REPLY ==========
function parseReplySegments(raw, stickerLib) {
  const parts = [];
  const regex = /\[(?:表情|sticker)[:：]\s*([^\]]+)\]|\[(?:语音|voice)[:：]\s*([^\]]+)\]|\[(?:转账|transfer)[:：]\s*([^\]]+)\]|\[(?:图片|image)[:：]\s*([^\]]+)\]/gi;
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
