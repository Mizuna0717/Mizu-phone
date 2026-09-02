// ========== meeting-prompt.js ==========
// Meeting Prompt — 提示詞構建器
// ★★★ v2.1 FIX: 世界书 + 角色人设 + 面具 提示词修复 ★★★
// requires: meeting-core.js (mtgGetCharById, mtgEsc, state globals)

/* ══════════════════════════════════════════════════════════════
   ★★★ v2.1 FIX: Build System Prompt — 世界书 + 人设 + 面具 ★★★
   ══════════════════════════════════════════════════════════════ */
function mtgBuildSystemPrompt(session, ch) {
  var p = '';

  // ★ 1. Meeting 专用系统提示词（来自 prompt.js 的 getActiveSystemPrompt）
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
      console.log('[Meeting-Prompt] Active system prompt injected | length:', activePrompt.length);
    }
  } else {
    console.log('[Meeting-Prompt] getActiveSystemPrompt not available, skipping base prompt');
  }

  // ★ 2. 角色完整人设信息
  p += '--- CHARACTER PROFILE ---\n';
  p += 'Name: ' + ch.name + '\n';

  if (ch.identity) {
    p += 'Identity: ' + ch.identity + '\n';
    console.log('[Meeting-Prompt] Identity included for', ch.name, '| length:', ch.identity.length);
  }

  if (ch.age) {
    p += 'Age: ' + ch.age + '\n';
    console.log('[Meeting-Prompt] Age included for', ch.name, ':', ch.age);
  }

  if (ch.personality) {
    p += 'Personality: ' + ch.personality + '\n';
    console.log('[Meeting-Prompt] Personality included for', ch.name, '| length:', ch.personality.length);
  }

  if (ch.background) {
    p += 'Background: ' + ch.background + '\n';
    console.log('[Meeting-Prompt] Background included for', ch.name, '| length:', ch.background.length);
  }

  if (ch.systemPrompt) {
    p += '\n' + ch.systemPrompt + '\n';
    console.log('[Meeting-Prompt] systemPrompt included for', ch.name, '| length:', ch.systemPrompt.length);
  } else if (ch.prompt) {
    p += '\n' + ch.prompt + '\n';
    console.log('[Meeting-Prompt] prompt (legacy) included for', ch.name, '| length:', ch.prompt.length);
  }

  if (ch.notes) {
    p += '\nNotes: ' + ch.notes + '\n';
    console.log('[Meeting-Prompt] Notes included for', ch.name, '| length:', ch.notes.length);
  }

  p += '--- END CHARACTER PROFILE ---\n\n';

  // ★ 3. 关联面具（Mask）信息
  var mask = null;
  if (typeof getMaskForChar === 'function') {
    mask = getMaskForChar(ch.id);
  } else {
    // Fallback: 手动查找面具
    mask = (state.masks || []).find(function(m) {
      return (m.charIds || []).indexOf(ch.id) >= 0;
    }) || null;
  }

  if (mask) {
    p += '[User Identity / Mask]\n';
    if (mask.name) {
      p += 'User Name: ' + mask.name + '\n';
    }
    if (mask.persona) {
      p += mask.persona + '\n';
    }
    if (mask.description) {
      p += mask.description + '\n';
    }
    p += '\n';
    console.log('[Meeting-Prompt] Mask included for', ch.name,
      '| maskName:', mask.name || '(none)',
      '| persona length:', (mask.persona || '').length);
  } else {
    // 没有面具时使用用户基本信息
    if (state.userProfile && state.userProfile.name && state.userProfile.name !== 'User') {
      p += 'User: ' + state.userProfile.name + '\n\n';
    }
    console.log('[Meeting-Prompt] No mask found for', ch.name);
  }

  // ★ 4. 世界书（Worldbook）信息
  var worldbooks = state.worldbooks || [];
  var activeBooks = [];

  if (typeof getActiveWorldBooks === 'function') {
    activeBooks = getActiveWorldBooks(ch, worldbooks);
    console.log('[Meeting-Prompt] getActiveWorldBooks returned', activeBooks.length, 'books for', ch.name);
  } else {
    // Fallback: 手动筛选
    var charWbIds = ch.worldbookIds || [];
    activeBooks = worldbooks.filter(function(wb) {
      return wb.isGlobal || charWbIds.indexOf(wb.id) >= 0;
    });
    console.log('[Meeting-Prompt] Manual worldbook filter:', activeBooks.length, 'books for', ch.name);
  }

  if (activeBooks.length > 0) {
    p += '[World Setting]\n';
    activeBooks.forEach(function(wb) {
      var tag = wb.isGlobal ? '[Global]' : '[Character]';
      p += '\u00b7 ' + tag + ' ' + (wb.name || 'Unnamed Worldbook');
      if (wb.content) p += '\uff1a' + wb.content;
      p += '\n';

      if (wb.entries && Array.isArray(wb.entries) && wb.entries.length > 0) {
        wb.entries.forEach(function(e) {
          if (e.keyword || e.content) {
            p += '  - ' + (e.keyword || '') + (e.content ? ': ' + e.content : '') + '\n';
          }
        });
      }

      console.log('[Meeting-Prompt] Worldbook "' + (wb.name || 'unnamed') + '"',
        '| global:', !!wb.isGlobal,
        '| entries:', (wb.entries || []).length,
        '| content length:', (wb.content || '').length);
    });
    p += '\n';
  } else {
    console.log('[Meeting-Prompt] No active worldbooks for', ch.name,
      '| total worldbooks:', worldbooks.length,
      '| char worldbookIds:', JSON.stringify(ch.worldbookIds || []));
  }

  // ★ 5. IF 模式专用字段
  if (session.mode === 'if') {
    if (session.worldview) {
      p += 'WORLDVIEW:\n' + session.worldview + '\n\n';
    }
    if (session.identity) {
      p += 'USER IDENTITY IN THIS SCENARIO:\n' + session.identity + '\n\n';
    }
  }

  // ★ 6. 协作写作规则
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

  // ★ 7. 多角色场景上下文
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

  // ★ 8. 会话内记忆摘要（原有逻辑保留）
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

  // ★ 9. 角色的长期/短期记忆（来自记忆库 state.memories）
  if (typeof getCharMemoriesByType === 'function') {
    var charLTM = getCharMemoriesByType(ch.id, 'ltm') || [];
    var charSTM = (getCharMemoriesByType(ch.id, 'stm') || []).filter(function(m) { return !m.consolidated; });
    var charFTM = getCharMemoriesByType(ch.id, 'ftm') || [];

    if (charLTM.length > 0 || charSTM.length > 0 || charFTM.length > 0) {
      p += '\n[Character Memories for ' + ch.name + ']\n';

      if (charLTM.length > 0) {
        p += '\u2014 Long-term Memories (core, important) \u2014\n';
        charLTM.slice(0, 5).forEach(function(m) {
          p += '- (' + (m.date || '') + ') ' + m.content + '\n';
        });
      }

      if (charSTM.length > 0) {
        p += '\u2014 Recent Short-term Memories \u2014\n';
        charSTM.slice(0, 8).forEach(function(m) {
          p += '- (' + (m.date || '') + ') ' + m.content + '\n';
        });
      }

      if (charFTM.length > 0) {
        p += '\u2014 Vague / Forgettable Memories \u2014\n';
        charFTM.slice(0, 3).forEach(function(m) {
          p += '- (' + (m.date || '') + ') ' + m.content + '\n';
        });
      }

      p += '\n';
      console.log('[Meeting-Prompt] Character memories included | LTM:', charLTM.length,
        '| STM:', charSTM.length, '| FTM:', charFTM.length);
    }
  } else {
    // Fallback: 手动读取 state.memories
    var _allMem = (state.memories || []).filter(function(m) { return m.charId === ch.id; });
    if (_allMem.length > 0) {
      p += '\n[Character Memories for ' + ch.name + ']\n';
      _allMem.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
      _allMem.slice(0, 10).forEach(function(m) {
        p += '- (' + (m.date || '') + ') ' + (m.title ? m.title + ': ' : '') + m.content + '\n';
      });
      p += '\n';
      console.log('[Meeting-Prompt] Fallback memories included:', _allMem.length);
    }
  }

  // ★ 最终日志
  console.log('[Meeting-Prompt] ======= System Prompt Built =======',
    '\n| Character:', ch.name,
    '\n| Session:', session.name,
    '\n| Mode:', session.mode,
    '\n| Has personality:', !!ch.personality,
    '\n| Has background:', !!ch.background,
    '\n| Has identity:', !!ch.identity,
    '\n| Has systemPrompt:', !!ch.systemPrompt,
    '\n| Has mask:', !!mask,
    '\n| Active worldbooks:', activeBooks.length,
    '\n| Session memories:', (session.shortTermMemories || []).length,
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
