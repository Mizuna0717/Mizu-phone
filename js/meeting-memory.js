// ========== meeting-memory.js ==========
// Meeting Memory — 摘要、合併、寫入記憶庫、結束會話等涉及 AI 呼叫的記憶操作
// ★★★ v2.0 MEETING MEMORY SYSTEM ★★★
// requires: meeting-core.js (mtgUid, mtgEsc, mtgEnsureMemoryFields, mtgCountUnsummarizedTurns, mtgGetUnsummarizedEntries, _mtgSliceByTurns, mtgFindSession, mtgGetCharById, mtgEnsureState, state globals)
// requires: meeting-prompt.js (mtgBuildSystemPrompt, mtgBuildContextMessages — indirectly via chat)
// requires: meeting-ui.js (mtgAppendSummary, mtgRenderSettingsMemory, mtgRenderArchiveList — called at end of flows)

async function mtgCallSummarize(session, entries, api) {
  console.log('[Meeting-Memory] mtgCallSummarize called | entries:', entries.length);

  if (!api || !api.url || !api.model) {
    throw new Error('[Meeting-Memory] No valid API config for summarize');
  }
  if (typeof sendChat !== 'function') {
    throw new Error('[Meeting-Memory] sendChat is not available');
  }

    var userName = (typeof mtgGetUserName === 'function') ? mtgGetUserName() : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '\u7528\u6237');
  var charNames = (session.characters && session.characters.length)
    ? session.characters.join('\u3001') : '\u89d2\u8272';

  // ★★★ 修复 Bug 2：获取主要角色名，用于角色第一人称视角 ★★★
  var primaryCharId = (session.charIds && session.charIds.length > 0) ? session.charIds[0] : null;
  var primaryChar = primaryCharId ? mtgGetCharById(primaryCharId) : null;
  var primaryCharName = primaryChar ? primaryChar.name : charNames;

  var formatted = entries.map(function(e) {
    var who;
    if (e.role === 'user') {
      who = session.identity ? (session.identity.split(/[,\uff0c]/)[0].trim() || userName) : userName;
    } else if (e.role === 'system') {
      who = '[\u65c1\u767d]';
    } else {
      var ch = e.charId ? mtgGetCharById(e.charId) : null;
      who = ch ? ch.name : (e.charName || charNames);
    }
    return who + ':\n' + (e.content || '').slice(0, 3000);
  }).join('\n\n---\n\n');

  var sessionLabel = session.name ? '\u300c' + session.name + '\u300d' : '\u8fd9\u6b21\u89c1\u9762';

  // ★★★ 修复 Bug 2：将提示词从「用户第一人称」改为「角色第一人称」★★★
  var prompt = '\u4f60\u662f\u4e00\u4f4d\u7ec6\u817b\u7684\u6545\u4e8b\u8bb0\u5fc6\u8005\u3002\u8bf7\u5c06\u4ee5\u4e0b' + sessionLabel + '\u573a\u666f\u4e2d\u53d1\u751f\u7684\u4e8b\uff0c\u4ee5 ' + primaryCharName + ' \u7684\u7b2c\u4e00\u4eba\u79f0\uff08\u300c\u6211\u300d\u5373 ' + primaryCharName + '\uff09\u7684\u89c6\u89d2\uff0c\u5199\u6210\u4e00\u6bb5\u79c1\u5bc6\u7684\u8bb0\u5fc6\u7247\u6bb5\u3002\n\n' +
    '\u91cd\u8981\uff1a\u4f60\u73b0\u5728\u662f ' + primaryCharName + '\uff0c\u4e0d\u662f ' + userName + '\u3002\u6240\u6709\u7684\u300c\u6211\u300d\u90fd\u6307\u7684\u662f ' + primaryCharName + '\u3002' + userName + ' \u662f\u4f60\u7684\u5bf9\u8bdd\u5bf9\u8c61\uff0c\u8bf7\u79f0\u547c\u5176\u4e3a\u300c' + userName + '\u300d\u6216\u300c\u4ed6/\u5979\u300d\u3002\n\n' +
    '\u3010\u5199\u4f5c\u89c4\u5219\u3011\n\n' +
    '1. \u8fc7\u6ee4\u5e9f\u8bdd\n' +
    '   - \u8df3\u8fc7\u65e0\u5b9e\u8d28\u5185\u5bb9\u7684\u5bd2\u6684\u3001\u91cd\u590d\u63cf\u5199\u548c\u8fc7\u6e21\u53e5\u3002\n' +
    '   - \u5982\u679c\u6574\u6bb5\u573a\u666f\u90fd\u662f\u65e5\u5e38\uff0c\u53ea\u7528\u4e00\u53e5\u8bdd\u6982\u62ec\u6c1b\u56f4\u3002\n\n' +
    '2. \u4fdd\u7559\u6838\u5fc3\n' +
    '   - \u63d0\u53d6\u5173\u952e\u5267\u60c5\u4e8b\u4ef6\u3001\u89d2\u8272\u4e92\u52a8\u3001\u60c5\u611f\u8f6c\u6298\u3001\u5173\u7cfb\u91cc\u7a0b\u7891\u3002\n' +
    '   - \u5982\u679c\u51fa\u73b0\u627f\u8bfa\u3001\u7ea6\u5b9a\u3001\u8eab\u4f53\u63a5\u89e6\u3001\u8868\u767d\u3001\u4e89\u6267\u7b49\u91cd\u8981\u8282\u70b9\uff0c\u5fc5\u987b\u8bb0\u5f55\u3002\n\n' +
    '3. \u8bb0\u5f55\u65f6\u7a7a\u4e0e\u4e8b\u4ef6\n' +
    '   - \u8fd8\u539f\u573a\u666f\u4e2d\u7684\u65f6\u95f4\u3001\u5730\u70b9\u548c\u5177\u4f53\u4e8b\u4ef6\u3002\n\n' +
    '4. \u60c5\u611f\u6e29\u5ea6\n' +
    '   - \u6355\u6349\u8ba9\u6211\uff08' + primaryCharName + '\uff09\u5fc3\u52a8\u3001\u5fc3\u75bc\u3001\u7d27\u5f20\u3001\u5931\u843d\u7684\u77ac\u95f4\u3002\n' +
    '   - \u4e0d\u8981\u5199\u6210\u51b0\u51b7\u7684\u5267\u60c5\u6458\u8981\uff0c\u8981\u5199\u6210\u771f\u5b9e\u7684\u8bb0\u5fc6\u3002\n\n' +
    '5. \u771f\u4eba\u8bb0\u5fc6\u611f\n' +
    '   - \u4fdd\u7559\u5177\u4f53\u7684\u3001\u6709\u753b\u9762\u611f\u7684\u7ec6\u8282\u3002\n\n' +
    '6. \u683c\u5f0f\n' +
    '   - \u5168\u7a0b\u4e2d\u6587\uff0c\u4ee5\u300c\u6211\u300d\uff08\u5373 ' + primaryCharName + '\uff09\u7684\u53e3\u543b\u3002\u63a7\u5236\u5728 80\uff5e200 \u5b57\u3002\n' +
    '   - \u4e0d\u52a0\u6807\u9898\u3001\u6807\u7b7e\u3001\u7f16\u53f7\u3002\u5fe0\u4e8e\u5185\u5bb9\uff0c\u7edd\u4e0d\u865a\u6784\u3002\u76f4\u63a5\u8f93\u51fa\u8bb0\u5fc6\u6587\u672c\u3002\n\n' +
    '\u573a\u666f\u5185\u5bb9\uff1a\n' + formatted + '\n\n\u8bf7\u76f4\u63a5\u4ee5\u300c\u6211\u300d\uff08' + primaryCharName + '\uff09\u7684\u7b2c\u4e00\u4eba\u79f0\u5199\u4e0b\u8fd9\u6bb5\u8bb0\u5fc6\u3002';

  console.log('[Meeting-Memory] Summary prompt perspective: Character "' + primaryCharName + '" as "I", User "' + userName + '" as third person');

  var result = await sendChat(api, [
    { role: 'system', content: prompt },
    { role: 'user', content: '\u8bf7\u5f00\u59cb\u8bb0\u5fc6\u3002' }
  ]);

  console.log('[Meeting-Memory] mtgCallSummarize result length:', (result || '').length);
  return result;
}


async function mtgCallConsolidate(session, stmList, api) {
  console.log('[Meeting-Memory] mtgCallConsolidate called | stmList:', stmList.length);

  if (!api || !api.url || !api.model) {
    throw new Error('[Meeting-Memory] No valid API config for consolidate');
  }
  if (typeof sendChat !== 'function') {
    throw new Error('[Meeting-Memory] sendChat is not available');
  }

    var userName = (typeof mtgGetUserName === 'function') ? mtgGetUserName() : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '\u7528\u6237');
  var charNames = (session.characters && session.characters.length)
    ? session.characters.join('\u3001') : '\u89d2\u8272';

  // ★★★ 修复 Bug 2：获取主要角色名 ★★★
  var primaryCharId = (session.charIds && session.charIds.length > 0) ? session.charIds[0] : null;
  var primaryChar = primaryCharId ? mtgGetCharById(primaryCharId) : null;
  var primaryCharName = primaryChar ? primaryChar.name : charNames;

  var formatted = stmList.map(function(m, i) {
    return '[\u7247\u6bb5 ' + (i + 1) + ' - ' + (m.date || '') + ']\n' + m.content;
  }).join('\n\n');

  var sessionLabel = session.name ? '\u300c' + session.name + '\u300d' : '\u8fd9\u6bb5\u7ecf\u5386';

  // ★★★ 修复 Bug 2：角色第一人称 ★★★
  var prompt = '\u4f60\u662f ' + primaryCharName + '\u3002\u4e0b\u9762\u662f\u4f60\u5728' + sessionLabel + '\u4e2d\u8bb0\u4e0b\u7684 ' + stmList.length + ' \u6bb5\u77ed\u671f\u8bb0\u5fc6\u788e\u7247\uff0c\u6d89\u53ca\u7684\u5bf9\u8bdd\u5bf9\u8c61\u6709 ' + userName + '\u3002\n' +
    '\u73b0\u5728\u4f60\u8981\u628a\u5b83\u4eec\u6574\u7406\u6210\u4e00\u6bb5\u5b8c\u6574\u7684\u957f\u671f\u8bb0\u5fc6\u3002\n\n' +
    '\u91cd\u8981\uff1a\u4f60\u662f ' + primaryCharName + '\uff0c\u300c\u6211\u300d\u6307\u7684\u662f ' + primaryCharName + '\u3002' + userName + ' \u662f\u4f60\u7684\u5bf9\u8bdd\u5bf9\u8c61\u3002\n\n' +
    '\u3010\u5199\u4f5c\u89c4\u5219\u3011\n\n' +
    '1. \u5408\u5e76\u91cd\u590d\u5185\u5bb9\uff0c\u53ea\u4fdd\u7559\u6700\u6709\u60c5\u611f\u91cd\u91cf\u7684\u7248\u672c\u3002\n' +
    '2. \u4fdd\u7559\u6240\u6709\u5173\u952e\u8f6c\u6298\u548c\u89d2\u8272\u7279\u5f81\u3002\n' +
    '3. \u6309\u65f6\u95f4\u987a\u5e8f\u7ec4\u7ec7\u3002\n' +
    '4. \u5199\u51fa\u60c5\u611f\u7684\u53d8\u5316\u548c\u5c42\u6b21\u3002\n' +
    '5. \u4fdd\u7559\u5177\u4f53\u7684\u3001\u6709\u753b\u9762\u611f\u7684\u7ec6\u8282\u3002\n' +
    '6. \u5168\u7a0b\u4e2d\u6587\uff0c\u4ee5\u300c\u6211\u300d\uff08\u5373 ' + primaryCharName + '\uff09\u7684\u53e3\u543b\u3002\u63a7\u5236\u5728 150\uff5e400 \u5b57\u3002\n' +
    '   \u4e0d\u52a0\u6807\u9898\u3001\u7f16\u53f7\u3002\u4e0d\u865a\u6784\u3002\u76f4\u63a5\u8f93\u51fa\u8bb0\u5fc6\u6587\u672c\u3002\n\n' +
    '\u77ed\u671f\u8bb0\u5fc6\u7247\u6bb5\uff1a\n' + formatted + '\n\n\u8bf7\u76f4\u63a5\u4ee5\u300c\u6211\u300d\uff08' + primaryCharName + '\uff09\u7684\u7b2c\u4e00\u4eba\u79f0\u5199\u4e0b\u8fd9\u6bb5\u957f\u671f\u8bb0\u5fc6\u3002';

  console.log('[Meeting-Memory] Consolidate prompt perspective: Character "' + primaryCharName + '" as "I"');

  var result = await sendChat(api, [
    { role: 'system', content: prompt },
    { role: 'user', content: '\u8bf7\u5f00\u59cb\u6574\u7406\u8bb0\u5fc6\u3002' }
  ]);

  console.log('[Meeting-Memory] mtgCallConsolidate result length:', (result || '').length);
  return result;
}


async function mtgCheckAutoSummarize(session) {
  if (!session) {
    console.log('[Meeting-Memory] mtgCheckAutoSummarize: no session, skip');
    return;
  }

  if (_mtgSummarizing) {
    console.log('[Meeting-Memory] Already summarizing, skip concurrent call');
    return;
  }

  mtgEnsureMemoryFields(session);

  if (!session.turnSummary) {
    console.log('[Meeting-Memory] Turn summary disabled for session:', session.id);
    return;
  }

  var interval = session.summaryInterval || MTG_DEFAULT_SUMMARY_INTERVAL;
  var unsummarizedTurns = mtgCountUnsummarizedTurns(session);

  console.log('[Meeting-Memory] Auto-check | unsummarized:', unsummarizedTurns,
    '| interval:', interval,
    '| lastIdx:', session.lastSummarizedEntryIdx,
    '| totalHistory:', session.history.length);

  if (unsummarizedTurns < interval) {
    console.log('[Meeting-Memory] Not yet reached interval (' + unsummarizedTurns + '/' + interval + '), skip');
    return;
  }

  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) {
    console.warn('[Meeting-Memory] No active API, cannot auto-summarize');
    return;
  }

  _mtgSummarizing = true;

  try {
    var allUnsummarized = mtgGetUnsummarizedEntries(session);
    var entriesToSummarize = _mtgSliceByTurns(allUnsummarized, interval);

    console.log('[Meeting-Memory] Auto-summarizing', entriesToSummarize.length,
      'entries (', interval, 'turns)...');

    var summary = await mtgCallSummarize(session, entriesToSummarize, api);

    if (!summary || !summary.trim()) {
      console.warn('[Meeting-Memory] Empty summary returned, skip saving');
      return;
    }

    var stm = {
      id: mtgUid(),
      date: new Date().toISOString().split('T')[0],
      content: summary.trim(),
      turnRange: [session.lastSummarizedEntryIdx,
                  session.lastSummarizedEntryIdx + entriesToSummarize.length],
      timestamp: Date.now(),
      _writtenToLibrary: false
    };
    session.shortTermMemories.push(stm);

    session.shortTermMemory.push({
      id: stm.id,
      round: session.turnCount || session.shortTermMemories.length,
      content: summary.trim(),
      timestamp: stm.timestamp
    });

    session.lastSummarizedEntryIdx += entriesToSummarize.length;
    saveState();

    console.log('[Meeting-Memory] STM #' + session.shortTermMemories.length + ' saved',
      '| length:', summary.length,
      '| preview:', summary.slice(0, 60) + '...');

    mtgAppendSummary(session.turnCount || session.shortTermMemories.length, summary);
    mtgRenderSettingsMemory();

    if (typeof showToast === 'function') {
      showToast(T('summarized') || '\u5df2\u603b\u7ed3');
    }

    _mtgSummarizing = false;
    var remainingTurns = mtgCountUnsummarizedTurns(session);
    if (remainingTurns >= interval) {
      console.log('[Meeting-Memory] Still', remainingTurns, 'turns unsummarized, continuing...');
      await mtgCheckAutoSummarize(session);
    }
  } catch (e) {
    console.error('[Meeting-Memory] Auto-summarize failed:', e);
  } finally {
    _mtgSummarizing = false;
  }
}

async function mtgSummarizeRemaining(session) {
  if (!session) {
    console.warn('[Meeting-Memory] mtgSummarizeRemaining: no session');
    return false;
  }
  mtgEnsureMemoryFields(session);

  var entries = mtgGetUnsummarizedEntries(session);
  var unsummarizedTurns = mtgCountUnsummarizedTurns(session);

  console.log('[Meeting-Memory] Summarize remaining | entries:', entries.length,
    '| turns:', unsummarizedTurns);

  if (entries.length < 2 || unsummarizedTurns < 1) {
    console.log('[Meeting-Memory] Not enough remaining entries to summarize');
    return false;
  }

  var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
  if (!api || !api.url || !api.model) {
    console.warn('[Meeting-Memory] No active API for remaining summarize');
    return false;
  }
  if (typeof sendChat !== 'function') {
    console.warn('[Meeting-Memory] sendChat not available');
    return false;
  }

  console.log('[Meeting-Memory] Summarizing remaining', entries.length,
    'entries (', unsummarizedTurns, 'turns)...');

  try {
    var summary = await mtgCallSummarize(session, entries, api);

    if (!summary || !summary.trim()) {
      console.warn('[Meeting-Memory] Empty remaining summary, skip');
      return false;
    }

    var stm = {
      id: mtgUid(),
      date: new Date().toISOString().split('T')[0],
      content: summary.trim(),
      turnRange: [session.lastSummarizedEntryIdx,
                  session.lastSummarizedEntryIdx + entries.length],
      timestamp: Date.now(),
      _writtenToLibrary: false
    };
    session.shortTermMemories.push(stm);

    session.shortTermMemory.push({
      id: stm.id,
      round: session.turnCount || session.shortTermMemories.length,
      content: summary.trim(),
      timestamp: stm.timestamp
    });

    session.lastSummarizedEntryIdx += entries.length;
    saveState();

    console.log('[Meeting-Memory] Remaining STM saved',
      '| length:', summary.length,
      '| preview:', summary.slice(0, 60) + '...');
    return true;
  } catch (e) {
    console.error('[Meeting-Memory] Remaining summarize failed:', e);
    return false;
  }
}

async function mtgWriteToMemoryLibrary(sessionId) {
  var session;
  if (typeof sessionId === 'string') {
    session = mtgFindSession(sessionId);
  } else if (sessionId && sessionId.id) {
    session = sessionId;
  }
  if (!session) {
    console.error('[Meeting-Memory] mtgWriteToMemoryLibrary: session not found:', sessionId);
    return 0;
  }
  mtgEnsureMemoryFields(session);

  var unsummarized = mtgGetUnsummarizedEntries(session);
  if (unsummarized.length >= 2 && mtgCountUnsummarizedTurns(session) >= 1) {
    console.log('[Meeting-Memory] Step 1: Summarizing remaining', unsummarized.length, 'entries...');
    if (typeof showToast === 'function') {
      showToast(T('summarizing') || '\u6b63\u5728\u603b\u7ed3\u5269\u4f59\u5185\u5bb9...');
    }
    await mtgSummarizeRemaining(session);
  } else {
    console.log('[Meeting-Memory] Step 1: No remaining entries to summarize');
  }

  var stms = session.shortTermMemories || [];
  if (stms.length === 0) {
    console.log('[Meeting-Memory] No STMs to write');
    if (typeof showToast === 'function') {
      showToast(T('meetingEndNoMem') || '\u6682\u65e0\u77ed\u671f\u8bb0\u5fc6\u53ef\u5199\u5165');
    }
    return 0;
  }

  var primaryCharId = (session.charIds && session.charIds.length > 0)
    ? session.charIds[0] : null;
  var charNames = (session.characters && session.characters.length)
    ? session.characters.join('\u3001') : 'Meeting';

  console.log('[Meeting-Memory] Step 2: Writing', stms.length, 'STMs to memory library',
    '| primaryCharId:', primaryCharId, '| chars:', charNames);

  if (!Array.isArray(state.memories)) state.memories = [];

  var writtenCount = 0;
  stms.forEach(function(stm) {
    if (!stm._writtenToLibrary) {
      if (typeof saveMemoryEntry === 'function') {
        saveMemoryEntry(
          primaryCharId,
          'stm',
          (session.name || 'Meeting') + ' \u00b7 ' + charNames,
          stm.content
        );
      } else {
        state.memories.push({
          id: mtgUid(),
          title: (session.name || 'Meeting') + ' \u00b7 ' + charNames,
          date: stm.date || new Date().toISOString().split('T')[0],
          content: stm.content,
          mood: '', photo: null,
          charId: primaryCharId,
          memType: 'stm',
          autoGenerated: true,
          timestamp: stm.timestamp || Date.now()
        });
        console.log('[Meeting-Memory] Fallback: wrote STM directly to state.memories');
      }
      stm._writtenToLibrary = true;
      writtenCount++;
    }
  });

  saveState();
  console.log('[Meeting-Memory] Written', writtenCount, 'STMs to state.memories',
    '| Total memories now:', (state.memories || []).length);

  var threshold = session.consolidateThreshold || MTG_MEM_CONSOLIDATE_THRESHOLD;

  if (primaryCharId && typeof getUnconsolidatedSTM === 'function') {
    var unconsolidatedSTMs = getUnconsolidatedSTM(primaryCharId);

    console.log('[Meeting-Memory] Step 4: Consolidation check',
      '| unconsolidated:', unconsolidatedSTMs.length,
      '| threshold:', threshold);

    if (unconsolidatedSTMs.length >= threshold) {
      console.log('[Meeting-Memory] Threshold reached! Starting LTM consolidation...');
      if (typeof showToast === 'function') {
        showToast(T('consolidating') || '\u6b63\u5728\u5408\u5e76\u957f\u671f\u8bb0\u5fc6...');
      }

      var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
      if (api && api.url && api.model && typeof sendChat === 'function') {
        var toMerge = unconsolidatedSTMs.slice(0, threshold);

        try {
          var ltmContent = await mtgCallConsolidate(session, toMerge, api);

          if (ltmContent && ltmContent.trim()) {
            if (typeof saveMemoryEntry === 'function') {
              saveMemoryEntry(
                primaryCharId,
                'ltm',
                (T('longTermMemory') || 'LTM') + ': ' + (session.name || charNames),
                ltmContent.trim()
              );
            } else {
              state.memories.push({
                id: mtgUid(),
                title: (T('longTermMemory') || 'LTM') + ': ' + (session.name || charNames),
                date: new Date().toISOString().split('T')[0],
                content: ltmContent.trim(),
                mood: '', photo: null,
                charId: primaryCharId,
                memType: 'ltm',
                autoGenerated: true,
                timestamp: Date.now()
              });
            }

            toMerge.forEach(function(m) { m.consolidated = true; });
            saveState();

            console.log('[Meeting-Memory] LTM created!',
              '| length:', ltmContent.length,
              '| merged', toMerge.length, 'STMs',
              '| preview:', ltmContent.slice(0, 60) + '...');
          }
        } catch (e) {
          console.error('[Meeting-Memory] LTM consolidation failed:', e);
        }
      } else {
        console.warn('[Meeting-Memory] No API for consolidation');
      }
    } else {
      console.log('[Meeting-Memory] Consolidation not triggered (' +
        unconsolidatedSTMs.length + '/' + threshold + ')');
    }
  } else {
    console.log('[Meeting-Memory] getUnconsolidatedSTM not available, using session-level check');
    var unwritten = stms.filter(function(s) { return !s.consolidated; });
    if (unwritten.length >= threshold) {
      console.log('[Meeting-Memory] Session-level threshold reached:', unwritten.length, '/', threshold);
      var api2 = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
      if (api2 && api2.url && api2.model && typeof sendChat === 'function') {
        var toMerge2 = unwritten.slice(0, threshold);
        try {
          var ltm2 = await mtgCallConsolidate(session, toMerge2, api2);
          if (ltm2 && ltm2.trim()) {
            state.memories.push({
              id: mtgUid(),
              title: (T('longTermMemory') || 'LTM') + ': ' + (session.name || charNames),
              date: new Date().toISOString().split('T')[0],
              content: ltm2.trim(),
              mood: '', photo: null,
              charId: primaryCharId,
              memType: 'ltm',
              autoGenerated: true,
              timestamp: Date.now()
            });
            toMerge2.forEach(function(m) { m.consolidated = true; });
            saveState();
            console.log('[Meeting-Memory] Fallback LTM created! length:', ltm2.length);
          }
        } catch (e2) {
          console.error('[Meeting-Memory] Fallback LTM consolidation failed:', e2);
        }
      }
    }
  }

  mtgRenderSettingsMemory();
  if (typeof showToast === 'function') {
    showToast((T('meetingMemWrittenPre') || '\u5df2\u5199\u5165 ') + writtenCount +
      (T('meetingMemWrittenPost') || ' \u6761\u8bb0\u5fc6'));
  }

  return writtenCount;
}


async function mtgManualWriteToMemory() {
  if (!mtgCurrentSession) {
    console.warn('[Meeting-Memory] mtgManualWriteToMemory: no active session');
    if (typeof showToast === 'function') showToast('No active session');
    return 0;
  }
  console.log('[Meeting-Memory] Manual write triggered for session:', mtgCurrentSession.id);
  var count = await mtgWriteToMemoryLibrary(mtgCurrentSession.id);
  mtgRenderSettingsMemory();
  return count;
}


/* ══════════════════════════════════
   End Session
   ══════════════════════════════════ */
function mtgEndSession(sessionId) {
  var session;
  if (sessionId) {
    session = mtgFindSession(sessionId);
  } else {
    session = mtgCurrentSession;
  }
  if (!session) {
    console.warn('[Meeting-Memory] mtgEndSession: no session found');
    return;
  }
  if (mtgGenerating) {
    if (typeof showToast === 'function') showToast(T('error'));
    return;
  }

  mtgEnsureMemoryFields(session);

  var turnCount = session.turnCount || 0;
  var msgCount = 0;
  (session.history || []).forEach(function(e) { if (e.role !== 'summary') msgCount++; });
  var memCount = session.shortTermMemories.length;
  var unsummarizedTurns = mtgCountUnsummarizedTurns(session);

  console.log('[Meeting-Memory] mtgEndSession called | turns:', turnCount,
    '| msgs:', msgCount, '| STMs:', memCount, '| unsummarized:', unsummarizedTurns);

  var msgText = (T('meetingEndMsg') || '\u672c\u6b21\u4f1a\u8bdd\u5df2\u8fdb\u884c {turns} \u8f6e\uff0c\u5171 {msgs} \u6761\u6d88\u606f\u3002')
    .replace('{turns}', turnCount)
    .replace('{msgs}', msgCount);

  if (unsummarizedTurns > 0) {
    msgText += '\n' + (state.lang === 'zh'
      ? '\u8fd8\u6709 ' + unsummarizedTurns + ' \u8f6e\u672a\u603b\u7ed3\uff0c\u5c06\u81ea\u52a8\u603b\u7ed3\u540e\u5199\u5165\u3002'
      : unsummarizedTurns + ' turns not yet summarized, will be summarized first.');
  }

  if (memCount > 0) {
    msgText += '\n' + (state.lang === 'zh'
      ? '\u5f53\u524d\u5df2\u6709 ' + memCount + ' \u6761\u77ed\u671f\u8bb0\u5fc6\u3002'
      : memCount + ' short-term memories ready.');
  }

  var subText = (memCount > 0 || unsummarizedTurns > 0)
    ? (T('meetingEndWriteQ') || '\u662f\u5426\u5c06\u77ed\u671f\u8bb0\u5fc6\u5199\u5165\u603b\u8bb0\u5fc6\u5e93\uff1f')
    : (T('meetingEndNoMem') || '\u6682\u65e0\u77ed\u671f\u8bb0\u5fc6\u53ef\u5199\u5165\u3002');

  var oldModal = document.getElementById('mtgEndModal');
  if (oldModal) oldModal.remove();

  var overlay = document.createElement('div');
  overlay.id = 'mtgEndModal';
  overlay.className = 'mtg-modal-overlay';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  var theSessionId = session.id;

  var mh = '<div class="mtg-modal">';
  mh += '<div class="mtg-modal-icon">';
  mh += '<svg viewBox="0 0 32 32" style="width:32px;height:32px;stroke:#86868b;fill:none;stroke-width:1.5">';
  mh += '<rect x="6" y="6" width="20" height="20" rx="4"/>';
  mh += '<path d="M12 16l3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/>';
  mh += '</svg></div>';
  mh += '<div class="mtg-modal-title">' + T('meetingEndTitle') + '</div>';
  mh += '<div class="mtg-modal-body">';
  mh += '<p>' + mtgEsc(msgText) + '</p>';
  mh += '<p class="mtg-modal-sub">' + mtgEsc(subText) + '</p>';
  mh += '</div>';
  mh += '<div class="mtg-modal-btns">';
  mh += '<button id="mtgEndWriteBtn" class="mtg-modal-btn mtg-modal-btn-primary">' + T('meetingSaveAndWrite') + '</button>';
  mh += '<button id="mtgEndSaveBtn" class="mtg-modal-btn mtg-modal-btn-secondary">' + T('meetingSaveOnly') + '</button>';
  mh += '<button id="mtgEndCancelBtn" class="mtg-modal-btn mtg-modal-btn-cancel">' + T('meetingContinueWrite') + '</button>';
  mh += '</div></div>';

  overlay.innerHTML = mh;
  document.body.appendChild(overlay);

  document.getElementById('mtgEndWriteBtn').onclick = async function() {
    this.disabled = true;
    this.textContent = '\u5904\u7406\u4e2d...';
    session.status = 'ended';
    saveState();
    await mtgWriteToMemoryLibrary(theSessionId);
    overlay.remove();
    mtgCurrentSession = null;
    mtgRenderArchiveList();
    nav('screen-meeting');
  };

  document.getElementById('mtgEndSaveBtn').onclick = function() {
    session.status = 'ended';
    saveState();
    if (typeof showToast === 'function') showToast(T('meetingSavedNoWrite'));
    overlay.remove();
    mtgCurrentSession = null;
    mtgRenderArchiveList();
    nav('screen-meeting');
  };

  document.getElementById('mtgEndCancelBtn').onclick = function() {
    overlay.remove();
  };
}
