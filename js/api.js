// ========== 06-api.js ==========

function normalizeUrl(r) {
  return (r || '').trim().replace(/\/+$/, '');
}

function getCandidates(raw) {
  const b = normalizeUrl(raw);
  return b.endsWith('/v1') ? [b] : [b + '/v1', b];
}

function friendlyError(e) {
  const m = e?.message || '';
  if (m.includes('Failed to fetch')) return T('errNetwork');
  if (m.includes('401') || m.includes('403')) return T('errAuth');
  if (m.includes('429')) return T('errRateLimit');
  return T('errUnknown') + ': ' + m.slice(0, 100);
}

async function fetchModelList(u, k) {
  const c = getCandidates(u);
  let l = null;
  for (const b of c) {
    try {
      const r = await fetch(b + '/models', { headers: { 'Authorization': 'Bearer ' + k } });
      if (!r.ok) { l = new Error('HTTP ' + r.status); continue; }
      const d = await r.json();
      const m = d.data || d.models || [];
      if (m.length > 0) { tmp.resolvedBase = b; return m; }
      l = new Error(T('errEmptyList'));
    } catch (e) { l = e; }
  }
  throw l || new Error(T('errUnknown'));
}

function _flattenMsgs(msgs) {
  var result = [];
  for (var i = 0; i < msgs.length; i++) {
    if (Array.isArray(msgs[i])) {
      for (var j = 0; j < msgs[i].length; j++) {
        result.push(msgs[i][j]);
      }
    } else {
      result.push(msgs[i]);
    }
  }
  return result;
}

async function sendChat(cfg, msgs) {
  var flatMsgs = _flattenMsgs(msgs);

  // ★ 调试探针（通过 window.__ctxDebug 开关，不影响逻辑）
  if (window.__ctxDebug) {
    try {
      var _sys = flatMsgs.filter(function (m) { return m && m.role === 'system'; })
                         .map(function (m) { return m.content; }).join('\n');
      console.log('[sendChat/ctx] 世界书:', /World Setting/i.test(_sys),
        '| 角色人设:', /Character Profile|Personality/i.test(_sys),
        '| 用户人设:', /User Identity|User Name/i.test(_sys),
        '| undefined污染:', /undefined/i.test(_sys));
    } catch (e) {}
  }

  const c = cfg._resolvedBase ? [cfg._resolvedBase] : getCandidates(cfg.url);
  let l = null;
  for (const b of c) {
    try {
      const r = await fetch(b + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
        body: JSON.stringify({
          model: cfg.model || 'gpt-3.5-turbo',
          messages: flatMsgs,
          temperature: cfg.temperature ?? 0.8,
          stream: false
        })
      });
      if (!r.ok) { l = new Error(r.status + ': ' + (await r.text().catch(() => '')).slice(0, 200)); continue; }
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return d.choices?.[0]?.message?.content ?? '';
    } catch (e) { l = e; }
  }
  throw l || new Error(T('errUnknown'));
}

async function sendGroupChats(cfg, charPrompts) {
  var settled = await Promise.allSettled(
    charPrompts.map(function(cp) {
      return sendChat(cfg, cp.messages).then(function(reply) {
        return { charId: cp.charId, reply: reply };
      });
    })
  );
  return settled
    .filter(function(r) { return r.status === 'fulfilled'; })
    .map(function(r) { return r.value; });
}

async function summarizeMeeting(textEntries, instruction) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) throw new Error('No active API configured');
  return await sendChat(api, [
    { role: 'system', content: instruction || 'Summarize the following content concisely.' },
    { role: 'user',   content: textEntries }
  ]);
}

async function generateNPCs(count, context) {
  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) {
    throw new Error('No active API configured. Please set up an API first.');
  }

  var num = Math.max(1, Math.min(10, parseInt(count) || 1));

  var worldContext = '';
  if (context.worldbookIds && context.worldbookIds.length > 0) {
    context.worldbookIds.forEach(function(wbId) {
      var wb = (state.worldbooks || []).find(function(w) { return w.id === wbId; });
      if (wb) {
        worldContext += (wb.name || 'Worldbook') + ': ';
        if (wb.entries && Array.isArray(wb.entries)) {
          wb.entries.forEach(function(e) {
            worldContext += (e.keyword || '') + ' - ' + (e.content || '') + '; ';
          });
        } else if (wb.content) {
          worldContext += wb.content;
        }
        worldContext += '\n';
      }
    });
  }

  (state.worldbooks || []).forEach(function(wb) {
    if (wb.isGlobal && worldContext.indexOf(wb.name || '') === -1) {
      worldContext += (wb.name || 'Global Worldbook') + ': ';
      if (wb.entries && Array.isArray(wb.entries)) {
        wb.entries.forEach(function(e) {
          worldContext += (e.keyword || '') + ' - ' + (e.content || '') + '; ';
        });
      } else if (wb.content) {
        worldContext += wb.content;
      }
      worldContext += '\n';
    }
  });

  var existingNpcs = '';
  if (context.characterId && Array.isArray(state.npcs)) {
    var existing = state.npcs.filter(function(n) { return n.characterId === context.characterId; });
    if (existing.length > 0) {
      existingNpcs = '\n\nExisting NPCs (do NOT duplicate these):\n';
      existing.forEach(function(n) {
        existingNpcs += '- ' + n.name + ' (' + (n.relationship || '') + ')\n';
      });
    }
  }

  // ★ 新增：用户人设块（统一构建器）
  var _userBlk = (typeof buildUserPersonaBlock === 'function') ? buildUserPersonaBlock(null) : '';

  var systemPrompt =
    'You are a creative NPC generator for a role-playing setting. ' +
    'Generate exactly ' + num + ' unique NPC(s) that would exist in the same world as the main character described below. ' +
    'Each NPC must have a distinct personality and a meaningful relationship to the main character.\n\n' +
    'IMPORTANT: Return ONLY a valid JSON array. No markdown fences, no explanation, no extra text.\n' +
    'Format:\n' +
    '[{"name":"NPC Name","personality":"Brief personality and traits","relationship":"Relationship to the main character"}]\n\n' +
    'Main Character Information:\n' +
    '- Name: ' + (context.name || 'Unknown') + '\n' +
    (context.personality ? '- Personality: ' + context.personality + '\n' : '') +
    (context.background ? '- Background: ' + context.background + '\n' : '') +
    (context.systemPrompt ? '- Setting Context: ' + context.systemPrompt.substring(0, 500) + '\n' : '') +
    (worldContext ? '\nWorld Setting:\n' + worldContext.substring(0, 800) + '\n' : '') +
    (_userBlk ? '\n' + _userBlk + '\n' : '') +     // ★ 用户人设注入
    existingNpcs +
    '\nGenerate ' + num + ' NPC(s) now:';

  var userMsg = 'Generate ' + num + ' NPC(s) for the character "' + (context.name || 'Unknown') + '". Return JSON only.';

  var raw = await sendChat(api, [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMsg }
  ]);

  var jsonStr = raw.trim();

  var fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  var arrMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    jsonStr = arrMatch[0];
  }

  var npcs;
  try {
    npcs = JSON.parse(jsonStr);
  } catch (e) {
    console.error('[generateNPCs] JSON parse failed:', e, '\nRaw:', raw);
    throw new Error('Failed to parse AI response as JSON. Please try again.');
  }

  if (!Array.isArray(npcs)) {
    throw new Error('AI response is not an array. Please try again.');
  }

  return npcs.map(function(npc) {
    return {
      name: String(npc.name || 'Unnamed NPC').trim(),
      personality: String(npc.personality || npc.description || '').trim(),
      relationship: String(npc.relationship || npc.relation || '').trim()
    };
  }).filter(function(npc) {
    return npc.name && npc.name !== 'Unnamed NPC';
  });
}

window.sendChat           = sendChat;
window.sendGroupChats     = sendGroupChats;
window.fetchModelList     = fetchModelList;
window.summarizeMeeting   = summarizeMeeting;
window.generateNPCs       = generateNPCs;
window.normalizeUrl       = normalizeUrl;
window.friendlyError      = friendlyError;
