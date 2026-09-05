// ========== meeting.js ==========
// Meeting — Entry Point (v2.1)
// I18n 鍵值注入、全局函數掛載、測試模組
// ★★★ v2.1: 世界书 + 角色人设 + 面具 提示词修复 ★★★
// requires: meeting-core.js
// requires: meeting-prompt.js
// requires: meeting-memory.js
// requires: meeting-chat.js
// requires: meeting-ui.js

/* ══════════════════════════════════
   i18n Keys
   ══════════════════════════════════ */
(function() {
  if (typeof LANG === 'undefined') return;
  function _add(lang, keys) {
    if (!LANG[lang]) LANG[lang] = {};
    for (var k in keys) {
      if (!LANG[lang][k]) LANG[lang][k] = keys[k];
    }
  }
  _add('en', {
    meetingTitle:           'Meeting',
    meetingNewArchive:      'New Archive',
    meetingArchiveName:     'Archive Name',
    meetingArchiveNamePh:   'Enter archive name',
    meetingMode:            'Mode',
    meetingContinue:        'Continue',
    meetingIF:              'IF',
    meetingCharacters:      'Characters',
    meetingPerspective:     'Perspective',
    meetingCharPerspectiveShort: 'Character',
    meetingUserPerspectiveShort: 'User',
    meetingFirstPerson:     'First',
    meetingSecondPerson:    'Second',
    meetingThirdPerson:     'Third',
    meetingWordCount:       'Word Count',
    meetingMin:             'Min',
    meetingMax:             'Max',
    meetingTurnSummary:     'Turn Summary',
    meetingTurnSummaryEnable: 'Enable turn summary',
    meetingSummaryInterval: 'Interval (turns)',
    meetingSummarySettings: 'Summary',
    meetingWorldview:       'Worldview',
    meetingWorldviewPh:     'Describe the world setting...',
    meetingIdentity:        'Identity',
    meetingIdentityPh:      'Your character identity...',
    meetingCreate:          'Create',
    meetingCancel:          'Cancel',
    meetingEnter:           'Enter',
    meetingNoArchives:      'No archives yet',
    meetingNoArchivesSub:   'Create your first archive to start',
    meetingNoCharsAvail:    'No characters available',
    meetingNoCharsSelected: 'No characters selected',
    meetingNameRequired:    'Please enter an archive name',
    meetingArchiveCreated:  'Archive created',
    meetingDeleteConfirm:   'Delete this archive?',
    meetingDeleted:         'Archive deleted',
    meetingDelete:          'Delete',
    meetingEdit:            'Edit',
    meetingRetry:           'Retry',
    meetingEditing:         'Editing...',
    meetingEdited:          'Edited',
    meetingInputPh:         'Enter message...',
    meetingDeleteMsgConfirm:'Delete this message?',
    meetingYou:             'Me',
    meetingSystem:          'System',
    meetingBeginStory:      'Send a message to begin',
    meetingWords:           'words',
    meetingTurns:           'turns',
    meetingSummaryRound:    'Round',
    meetingNoMemories:      'No memories yet',
    meetingManageTitle:     'Manage',
    meetingArchiveSettings: 'Settings',
    meetingSaveChanges:     'Save Changes',
    meetingShortTermMemory: 'Short-term Memory',
    meetingStatusActive:    'Active',
    meetingStatusEnded:     'Ended',
    meetingEndSession:      'End Session',
    meetingEndTitle:        'End Session',
    meetingEndMsg:          'This session has {turns} rounds, {msgs} messages.',
    meetingEndWriteQ:       'Write short-term memory to the memory library?',
    meetingEndNoMem:        'No short-term memories to write.',
    meetingSaveAndWrite:    'Save & Write to Memory',
    meetingSaveOnly:        'Save Only',
    meetingContinueWrite:   'Continue Writing',
    meetingMemWrittenPre:   'Written ',
    meetingMemWrittenPost:  ' memories to library',
    meetingSavedNoWrite:    'Saved, not written to memory library',
    meetingSessionName:     'Session Name',
    meetingStatusLabel:     'Status',
    meetingNoSessions:      'No sessions',
    meetingCreateFirst:     'Create one to start',
        meetingArchiveBtn:      'Archive'
  });
  _add('zh', {
    meetingTitle:           '\u89c1\u9762',
    meetingNewArchive:      '\u65b0\u5efa\u5b58\u6863',
    meetingArchiveName:     '\u5b58\u6863\u540d\u79f0',
    meetingArchiveNamePh:   '\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingMode:            '\u6a21\u5f0f',
    meetingContinue:        '\u7eed\u5199',
    meetingIF:              'IF',
    meetingCharacters:      '\u89d2\u8272',
    meetingPerspective:     '\u89c6\u89d2',
    meetingCharPerspectiveShort: '\u89d2\u8272',
    meetingUserPerspectiveShort: '\u7528\u6237',
    meetingFirstPerson:     '\u7b2c\u4e00',
    meetingSecondPerson:    '\u7b2c\u4e8c',
    meetingThirdPerson:     '\u7b2c\u4e09',
    meetingWordCount:       '\u5b57\u6570',
    meetingMin:             '\u6700\u5c11',
    meetingMax:             '\u6700\u591a',
    meetingTurnSummary:     '\u56de\u5408\u6458\u8981',
    meetingTurnSummaryEnable: '\u542f\u7528\u56de\u5408\u6458\u8981',
    meetingSummaryInterval: '\u95f4\u9694\uff08\u56de\u5408\uff09',
    meetingSummarySettings: '\u6458\u8981',
    meetingWorldview:       '\u4e16\u754c\u89c2',
    meetingWorldviewPh:     '\u63cf\u8ff0\u4e16\u754c\u8bbe\u5b9a...',
    meetingIdentity:        '\u8eab\u4efd',
    meetingIdentityPh:      '\u4f60\u7684\u89d2\u8272\u8eab\u4efd...',
    meetingCreate:          '\u521b\u5efa',
    meetingCancel:          '\u53d6\u6d88',
    meetingEnter:           '\u8fdb\u5165',
    meetingNoArchives:      '\u6682\u65e0\u5b58\u6863',
    meetingNoArchivesSub:   '\u521b\u5efa\u7b2c\u4e00\u4e2a\u5b58\u6863\u5f00\u59cb',
    meetingNoCharsAvail:    '\u6ca1\u6709\u53ef\u7528\u89d2\u8272',
    meetingNoCharsSelected: '\u672a\u9009\u62e9\u89d2\u8272',
    meetingNameRequired:    '\u8bf7\u8f93\u5165\u5b58\u6863\u540d\u79f0',
    meetingArchiveCreated:  '\u5b58\u6863\u5df2\u521b\u5efa',
    meetingDeleteConfirm:   '\u786e\u5b9a\u5220\u9664\u6b64\u5b58\u6863\uff1f',
    meetingDeleted:         '\u5b58\u6863\u5df2\u5220\u9664',
    meetingDelete:          '\u5220\u9664',
    meetingEdit:            '\u4fee\u6539',
    meetingRetry:           '\u91cd\u56de',
    meetingEditing:         '\u6b63\u5728\u7f16\u8f91...',
    meetingEdited:          '\u5df2\u4fee\u6539',
    meetingInputPh:         '\u8f93\u5165\u6d88\u606f...',
    meetingDeleteMsgConfirm:'\u786e\u5b9a\u5220\u9664\u8fd9\u6761\u6d88\u606f\uff1f',
    meetingYou:             '\u6211',
    meetingSystem:          '\u7cfb\u7edf',
    meetingBeginStory:      '\u53d1\u9001\u6d88\u606f\u5f00\u59cb',
    meetingWords:           '\u5b57',
    meetingTurns:           '\u56de\u5408',
    meetingSummaryRound:    '\u7b2c',
    meetingNoMemories:      '\u6682\u65e0\u8bb0\u5fc6',
    meetingManageTitle:     '\u7ba1\u7406',
    meetingArchiveSettings: '\u8bbe\u7f6e',
    meetingSaveChanges:     '\u4fdd\u5b58\u66f4\u6539',
    meetingShortTermMemory: '\u77ed\u671f\u8bb0\u5fc6',
    meetingStatusActive:    '\u8fdb\u884c\u4e2d',
    meetingStatusEnded:     '\u5df2\u7ed3\u675f',
    meetingEndSession:      '\u7ed3\u675f\u89c1\u9762',
    meetingEndTitle:        '\u7ed3\u675f\u89c1\u9762',
    meetingEndMsg:          '\u672c\u6b21\u4f1a\u8bdd\u5df2\u8fdb\u884c {turns} \u8f6e\uff0c\u5171 {msgs} \u6761\u6d88\u606f\u3002',
    meetingEndWriteQ:       '\u662f\u5426\u5c06\u77ed\u671f\u8bb0\u5fc6\u5199\u5165\u603b\u8bb0\u5fc6\u5e93\uff1f',
    meetingEndNoMem:        '\u6682\u65e0\u77ed\u671f\u8bb0\u5fc6\u53ef\u5199\u5165\u3002',
    meetingSaveAndWrite:    '\u4fdd\u5b58\u5e76\u5199\u5165\u8bb0\u5fc6\u5e93',
    meetingSaveOnly:        '\u4ec5\u4fdd\u5b58',
    meetingContinueWrite:   '\u7ee7\u7eed\u5199\u4f5c',
    meetingMemWrittenPre:   '\u5df2\u5199\u5165 ',
    meetingMemWrittenPost:  ' \u6761\u8bb0\u5fc6',
    meetingSavedNoWrite:    '\u5df2\u4fdd\u5b58\uff0c\u672a\u5199\u5165\u8bb0\u5fc6\u5e93',
    meetingSessionName:     '\u4f1a\u8bdd\u540d\u79f0',
    meetingStatusLabel:     '\u72b6\u6001',
    meetingNoSessions:      '\u6682\u65e0\u4f1a\u8bdd',
    meetingCreateFirst:     '\u521b\u5efa\u4e00\u4e2a\u5f00\u59cb',
        meetingArchiveBtn:      '\u5b58\u6863'
  });
})();


/* ══════════════════════════════════
   Init Entry Point
   ══════════════════════════════════ */
function initMeetingPage() {
  mtgEnsureState();
  mtgRenderArchiveList();
}


/* ══════════════════════════════════
   ★★★ NEW: Archive Button Handler (UI placeholder) ★★★
   ══════════════════════════════════ */
function mtgArchiveSession() {
  console.log('[Meeting] Archive button clicked (UI placeholder — no actual archive logic)');
  var btn = document.getElementById('mtgManageArchiveBtn');
  if (btn) {
    btn.classList.add('mtg-btn-pressed');
    setTimeout(function() { btn.classList.remove('mtg-btn-pressed'); }, 300);
  }
  if (typeof showToast === 'function') {
    showToast(T('meetingArchiveBtn'));
  }
}

/* ══════════════════════════════════
   New Archive toggles (meeting-settings.html)
   ══════════════════════════════════ */
function mtgNewBanNsfwToggled() {
  var isActive = document.getElementById('mtgNewToggleBanNsfw').classList.contains('active');
  console.log('[Meeting] New archive banNsfw:', isActive);
}

function mtgNewAntiSnatchToggled() {
  var isActive = document.getElementById('mtgNewToggleAntiSnatch').classList.contains('active');
  console.log('[Meeting] New archive antiSnatch:', isActive);
}

/* ══════════════════════════════════
   Manage page toggles (meeting-manage.html)
   ══════════════════════════════════ */
function mtgManageBanNsfwToggled() {
  var isActive = document.getElementById('mtgManageToggleBanNsfw').classList.contains('active');
  console.log('[Meeting] Manage banNsfw:', isActive);
}

function mtgManageAntiSnatchToggled() {
  var isActive = document.getElementById('mtgManageToggleAntiSnatch').classList.contains('active');
  console.log('[Meeting] Manage antiSnatch:', isActive);
}


/* ══════════════════════════════════
   Backward Compatibility
   ══════════════════════════════════ */
function openMeetingSettings() { openMeetingNewArchive(); }
function startMeetingSession() { mtgCreateArchive(); }
function renderMeetingCards() { mtgRenderArchiveList(); }
function openMeetingManageFromWrite() { openMeetingSettingsFromWrite(); }
function mtgSetToggleSeg(el) { mtgSegToggle(el); }
function mtgSetModeChanged() { mtgNewModeChanged(); }
function mtgSetSummaryToggled() { mtgNewSummaryToggled(); }
function mtgSetRenderCharSelect() { mtgRenderCharSelectList('mtgNewCharList', []); }
function exitMeetingSettings_legacy() { exitMeetingSettings(); }
function mtgCloseEndModal() { var el = document.getElementById('mtgEndModal'); if (el) el.remove(); }
function mtgConfirmEnd(writeToMemory) { /* replaced by mtgEndSession */ }
function mtgRenderSessionMemories(session) { mtgRenderSettingsMemory(); }


/* ══════════════════════════════════════════════════════════════
   ★★★ Diagnostic Test — __mizuMeetingTest ★★★
   ══════════════════════════════════════════════════════════════ */
function __mizuMeetingTest() {
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550 Mizu Meeting Memory Test \u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');

  var funcs = [
    { name: 'mtgEnsureMemoryFields',     ref: mtgEnsureMemoryFields },
    { name: 'mtgCheckAutoSummarize',     ref: mtgCheckAutoSummarize },
    { name: 'mtgSummarizeRemaining',     ref: mtgSummarizeRemaining },
    { name: 'mtgWriteToMemoryLibrary',   ref: mtgWriteToMemoryLibrary },
    { name: 'mtgEndSession',             ref: mtgEndSession },
    { name: 'mtgCallSummarize',          ref: mtgCallSummarize },
    { name: 'mtgCallConsolidate',        ref: mtgCallConsolidate },
    { name: 'mtgCountUnsummarizedTurns', ref: mtgCountUnsummarizedTurns },
    { name: 'mtgGetUnsummarizedEntries', ref: mtgGetUnsummarizedEntries },
    { name: 'mtgManualWriteToMemory',    ref: mtgManualWriteToMemory }
  ];

  var pass = 0, fail = 0;
  funcs.forEach(function(f) {
    var windowOk = typeof window[f.name] === 'function';
    var localOk  = typeof f.ref === 'function';
    if (windowOk && localOk) {
      console.log('%c  \u2705 ' + f.name, 'color:#34c759');
      pass++;
    } else {
      console.log('%c  \u274c ' + f.name +
        ' (window: ' + (windowOk ? 'OK' : 'MISSING') +
        ', local: ' + (localOk ? 'OK' : 'MISSING') + ')', 'color:#ff3b30');
      fail++;
    }
  });

  console.log('%c\u2500\u2500 Helper Functions \u2500\u2500', 'color:#8e8e93');
  var helpers = [
    { name: 'saveMemoryEntry',      avail: typeof saveMemoryEntry === 'function' },
    { name: 'getUnconsolidatedSTM', avail: typeof getUnconsolidatedSTM === 'function' },
    { name: 'sendChat',             avail: typeof sendChat === 'function' },
    { name: 'saveState',            avail: typeof saveState === 'function' },
    { name: 'showToast',            avail: typeof showToast === 'function' },
    { name: 'T (i18n)',             avail: typeof T === 'function' },
    { name: 'getActiveWorldBooks',  avail: typeof getActiveWorldBooks === 'function' },
    { name: 'getMaskForChar',       avail: typeof getMaskForChar === 'function' },
    { name: 'getActiveSystemPrompt',avail: typeof getActiveSystemPrompt === 'function' },
    { name: 'getCharMemoriesByType',avail: typeof getCharMemoriesByType === 'function' }
  ];
  helpers.forEach(function(h) {
    console.log('  ' + (h.avail ? '\u2705' : '\u26a0\ufe0f') + ' ' + h.name +
      (h.avail ? '' : ' (not found, fallback will be used)'));
  });

  console.log('%c\u2500\u2500 State Check \u2500\u2500', 'color:#8e8e93');
  var stateOk = typeof state !== 'undefined';
  console.log('  ' + (stateOk ? '\u2705' : '\u274c') + ' state object');
  if (stateOk) {
    console.log('    meetings: ' + (state.meetings || []).length);
    console.log('    memories: ' + (state.memories || []).length);
    console.log('    characters: ' + (state.characters || []).length);
    console.log('    worldbooks: ' + (state.worldbooks || []).length);
    console.log('    masks: ' + (state.masks || []).length);
    console.log('    apis: ' + (state.apis || []).length);
    console.log('    activeApiId: ' + (state.activeApiId || 'null'));
  }

  console.log('%c\u2500\u2500 Functional Test \u2500\u2500', 'color:#8e8e93');
  try {
    var testSession = {
      id: 'test-' + Date.now(),
      name: 'Test Session',
      history: [
        { id: 't1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: 't2', role: 'char', content: 'Hi there', charName: 'Test', timestamp: Date.now() }
      ],
      turnCount: 1,
      turnSummary: true,
      summaryInterval: 5,
      charIds: [],
      characters: ['Test']
    };

    mtgEnsureMemoryFields(testSession);
    console.log('  \u2705 mtgEnsureMemoryFields: shortTermMemories=' +
      testSession.shortTermMemories.length + ', lastIdx=' + testSession.lastSummarizedEntryIdx);

    var count = mtgCountUnsummarizedTurns(testSession);
    console.log('  \u2705 mtgCountUnsummarizedTurns: ' + count);

    var entries = mtgGetUnsummarizedEntries(testSession);
    console.log('  \u2705 mtgGetUnsummarizedEntries: ' + entries.length + ' entries');
  } catch (e) {
    console.error('  \u274c Functional test failed:', e);
    fail++;
  }

  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550 Result: ' + pass + '/' + funcs.length + ' passed \u2550\u2550\u2550\u2550\u2550\u2550',
    fail === 0 ? 'color:#34c759;font-weight:bold;font-size:14px' : 'color:#ff3b30;font-weight:bold;font-size:14px');

  if (fail === 0) {
    console.log('%c All meeting memory functions are properly defined and exported!', 'color:#34c759;font-size:12px');
  } else {
    console.log('%c ' + fail + ' functions are missing. Ensure meeting.js is properly loaded.', 'color:#ff3b30;font-size:12px');
  }

  return { pass: pass, fail: fail, total: funcs.length };
}


/* ══════════════════════════════════════════════════════════════
   ★★★ Prompt Integrity Test — __mizuMeetingPromptTest ★★★
   ══════════════════════════════════════════════════════════════ */
function __mizuMeetingPromptTest() {
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');
  console.log('%c  Mizu Meeting Prompt Integrity Test v2.1', 'color:#007aff;font-weight:bold;font-size:14px');
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');

  var pass = 0, fail = 0, warn = 0;

  function _pass(msg) { pass++; console.log('%c  \u2705 ' + msg, 'color:#34c759'); }
  function _fail(msg) { fail++; console.log('%c  \u274c ' + msg, 'color:#ff3b30'); }
  function _warn(msg) { warn++; console.log('%c  \u26a0\ufe0f ' + msg, 'color:#ff9500'); }

  // Step 0: Prerequisites
  console.log('%c\u2500\u2500 Step 0: Prerequisites \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (typeof state === 'undefined' || !state) { _fail('state object not found'); return; }
  else _pass('state object exists');

  if (typeof mtgBuildSystemPrompt !== 'function') { _fail('mtgBuildSystemPrompt function not found'); return; }
  else _pass('mtgBuildSystemPrompt function exists');

  var chars = state.characters || [];
  if (chars.length === 0) { _fail('No characters in state. Create a character first.'); return; }
  else _pass('Characters found: ' + chars.length);

  var worldbooks = state.worldbooks || [];
  console.log('  Total worldbooks: ' + worldbooks.length);
  var globalWbs = worldbooks.filter(function(wb) { return wb.isGlobal; });
  console.log('  Global worldbooks: ' + globalWbs.length);

  var masks = state.masks || [];
  console.log('  Total masks: ' + masks.length);

  // Step 1: Select test character
  console.log('%c\u2500\u2500 Step 1: Select Test Character \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var testChar = null;
  for (var i = 0; i < chars.length; i++) {
    if (chars[i].worldbookIds && chars[i].worldbookIds.length > 0) {
      testChar = chars[i];
      break;
    }
  }
  if (!testChar) testChar = chars[0];

  console.log('  Test character: ' + testChar.name + ' (id: ' + testChar.id + ')');
  console.log('  Has personality: ' + !!testChar.personality + (testChar.personality ? ' (' + testChar.personality.length + ' chars)' : ''));
  console.log('  Has background: ' + !!testChar.background + (testChar.background ? ' (' + testChar.background.length + ' chars)' : ''));
  console.log('  Has identity: ' + !!testChar.identity);
  console.log('  Has age: ' + !!testChar.age);
  console.log('  Has systemPrompt: ' + !!testChar.systemPrompt + (testChar.systemPrompt ? ' (' + testChar.systemPrompt.length + ' chars)' : ''));
  console.log('  worldbookIds: ' + JSON.stringify(testChar.worldbookIds || []));

  // Step 2: Mock session
  console.log('%c\u2500\u2500 Step 2: Build Mock Session \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var mockSession = {
    id: 'test-prompt-' + Date.now(),
    name: 'Prompt Test Session',
    mode: 'continue',
    charPerson: 'first',
    userPerson: 'first',
    wc: { min: 100, max: 300 },
    charIds: [testChar.id],
    characters: [testChar.name],
    worldview: 'A fantasy world with magic and dragons.',
    identity: 'A traveling merchant.',
    turnSummary: false,
    summaryInterval: 5,
    contextCount: 50,
    history: [],
    shortTermMemories: [],
    shortTermMemory: [],
    lastSummarizedEntryIdx: 0,
    status: 'active'
  };

  console.log('  Mock session created (mode: continue)');

  // Step 3: Generate prompt
  console.log('%c\u2500\u2500 Step 3: Generate System Prompt \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var prompt = '';
  try {
    prompt = mtgBuildSystemPrompt(mockSession, testChar);
    _pass('mtgBuildSystemPrompt executed | length: ' + prompt.length + ' chars');
  } catch (e) {
    _fail('mtgBuildSystemPrompt threw error: ' + e.message);
    return;
  }

  // Step 4: Verify character profile
  console.log('%c\u2500\u2500 Step 4: Verify Character Profile \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (prompt.indexOf(testChar.name) >= 0) _pass('Character name "' + testChar.name + '" found');
  else _fail('Character name "' + testChar.name + '" NOT found');

    var hasCharProfileMarker = prompt.indexOf('CHARACTER PROFILE') >= 0;
  var hasCharProfileViaSystemPrompt = testChar.systemPrompt && prompt.indexOf('[Character Profile]') >= 0;
  if (hasCharProfileMarker || hasCharProfileViaSystemPrompt) _pass('CHARACTER PROFILE section found');
  else _fail('CHARACTER PROFILE section NOT found');

    var charProfileInjected = testChar.systemPrompt && prompt.indexOf('[Character Profile]') >= 0;

  if (testChar.personality) {
    if (prompt.indexOf(testChar.personality.substring(0, 30)) >= 0) _pass('Personality content found');
    else _fail('Personality content NOT found');
  } else if (charProfileInjected) {
    _pass('No personality field, but [Character Profile] injected via systemPrompt');
  } else _warn('No personality field on character');

  if (testChar.background) {
    if (prompt.indexOf(testChar.background.substring(0, 30)) >= 0) _pass('Background content found');
    else _fail('Background content NOT found');
  } else if (charProfileInjected) {
    _pass('No background field, but [Character Profile] injected via systemPrompt');
  } else _warn('No background field on character');

  if (testChar.identity) {
    if (prompt.indexOf(testChar.identity.substring(0, 20)) >= 0) _pass('Identity content found');
    else _fail('Identity content NOT found');
  } else if (charProfileInjected) {
    _pass('No identity field, but [Character Profile] injected via systemPrompt');
  } else _warn('No identity field on character');

  if (testChar.systemPrompt) {
    if (prompt.indexOf(testChar.systemPrompt.substring(0, 30)) >= 0) _pass('systemPrompt content found');
    else _fail('systemPrompt content NOT found');
  } else _warn('No systemPrompt field on character');

  // Step 5: Verify worldbooks
  console.log('%c\u2500\u2500 Step 5: Verify Worldbooks \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var charWbIds = testChar.worldbookIds || [];
  var expectedWbs = worldbooks.filter(function(wb) {
    return wb.isGlobal || charWbIds.indexOf(wb.id) >= 0;
  });

  if (expectedWbs.length === 0) {
    _warn('No worldbooks expected (no global + no character-bound)');
  } else {
    if (prompt.indexOf('World Setting') >= 0) _pass('World Setting section found');
    else _fail('World Setting section NOT found');

    expectedWbs.forEach(function(wb) {
      if (prompt.indexOf(wb.name) >= 0) _pass('Worldbook "' + wb.name + '" (' + (wb.isGlobal ? 'global' : 'char') + ') found');
      else _fail('Worldbook "' + wb.name + '" (' + (wb.isGlobal ? 'global' : 'char') + ') NOT found');
    });
  }

  // Step 6: Verify mask
  console.log('%c\u2500\u2500 Step 6: Verify Mask \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var expectedMask = masks.find(function(m) {
    return (m.charIds || []).indexOf(testChar.id) >= 0;
  });

  if (expectedMask) {
    if (prompt.indexOf('User Identity') >= 0 || prompt.indexOf('Mask') >= 0) _pass('Mask section found');
    else _fail('Mask section NOT found');

    if (expectedMask.persona && prompt.indexOf(expectedMask.persona.substring(0, 20)) >= 0) _pass('Mask persona found');
    else if (expectedMask.persona) _fail('Mask persona NOT found');

    if (expectedMask.name && prompt.indexOf(expectedMask.name) >= 0) _pass('Mask name found');
    else if (expectedMask.name) _fail('Mask name NOT found');
  } else {
    _warn('No mask bound to "' + testChar.name + '"');
  }

  // Step 7: Verify writing rules
  console.log('%c\u2500\u2500 Step 7: Verify Writing Rules \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (prompt.indexOf('COLLABORATIVE WRITING') >= 0) _pass('Writing rules section found');
  else _fail('Writing rules section NOT found');

  // Step 8: IF mode test
  console.log('%c\u2500\u2500 Step 8: IF Mode Test \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  var ifSession = JSON.parse(JSON.stringify(mockSession));
  ifSession.mode = 'if';
  try {
    var ifPrompt = mtgBuildSystemPrompt(ifSession, testChar);
    if (ifPrompt.indexOf('WORLDVIEW') >= 0) _pass('IF mode: WORLDVIEW section found');
    else _fail('IF mode: WORLDVIEW section missing');
    if (ifPrompt.indexOf('USER IDENTITY') >= 0 || ifPrompt.indexOf('traveling merchant') >= 0) _pass('IF mode: USER IDENTITY found');
    else _fail('IF mode: USER IDENTITY missing');
  } catch (e) {
    _fail('IF mode prompt failed: ' + e.message);
  }

  // Step 9: Multi-char test
  console.log('%c\u2500\u2500 Step 9: Multi-Character Test \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  if (chars.length >= 2) {
    var multiSession = JSON.parse(JSON.stringify(mockSession));
    multiSession.charIds = [chars[0].id, chars[1].id];
    multiSession.characters = [chars[0].name, chars[1].name];
    try {
      var multiPrompt = mtgBuildSystemPrompt(multiSession, chars[0]);
      if (multiPrompt.indexOf('Group Scene') >= 0 || multiPrompt.indexOf(chars[1].name) >= 0)
        _pass('Multi-char: Other character "' + chars[1].name + '" mentioned');
      else _fail('Multi-char: Other character NOT mentioned');
    } catch (e) {
      _fail('Multi-char prompt failed: ' + e.message);
    }
  } else _warn('Only 1 character, skipping multi-char test');

  // Step 10: Helper functions
  console.log('%c\u2500\u2500 Step 10: Helper Functions \u2500\u2500', 'color:#8e8e93;font-weight:bold');

  [
    ['getActiveWorldBooks', typeof getActiveWorldBooks],
    ['getMaskForChar', typeof getMaskForChar],
    ['getActiveSystemPrompt', typeof getActiveSystemPrompt],
    ['getCharMemoriesByType', typeof getCharMemoriesByType],
    ['sendChat', typeof sendChat]
  ].forEach(function(h) {
    if (h[1] === 'function') _pass(h[0] + ' available');
    else _warn(h[0] + ' NOT available (fallback used)');
  });

  // Step 11: Print full prompt
  console.log('%c\u2500\u2500 Step 11: Full Prompt Output \u2500\u2500', 'color:#8e8e93;font-weight:bold');
  console.log('%c BEGIN SYSTEM PROMPT (' + prompt.length + ' chars)', 'color:#007aff');
  var lines = prompt.split('\n');
  var section = '';
  var sn = 0;
  for (var li = 0; li < lines.length; li++) {
    section += lines[li] + '\n';
    if (section.length > 800 || li === lines.length - 1) {
      sn++;
      console.log('  [Part ' + sn + ']\n' + section);
      section = '';
    }
  }
  console.log('%c END SYSTEM PROMPT', 'color:#007aff');

  // Step 12: Full messages array
  console.log('%c\u2500\u2500 Step 12: Full Messages Array \u2500\u2500', 'color:#8e8e93;font-weight:bold');
  try {
    var ctxMsgs = mtgBuildContextMessages(mockSession, testChar);
    var fullMessages = [{ role: 'system', content: prompt }].concat(ctxMsgs);
    console.log('  Total messages: ' + fullMessages.length);
    fullMessages.forEach(function(m, idx) {
      console.log('    [' + idx + '] role: ' + m.role + ' | length: ' + (m.content || '').length);
    });
    _pass('Full messages array: ' + fullMessages.length + ' messages');
  } catch (e) {
    _fail('mtgBuildContextMessages failed: ' + e.message);
  }

  // Summary
  console.log('%c\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'color:#007aff;font-weight:bold;font-size:14px');
  var total = pass + fail;
  var summary = '  Results: ' + pass + ' passed, ' + fail + ' failed, ' + warn + ' warnings / ' + total + ' checks';
  console.log('%c' + summary, fail === 0 ? 'color:#34c759;font-weight:bold;font-size:13px' : 'color:#ff3b30;font-weight:bold;font-size:13px');

  if (fail > 0 || warn > 0) {
    console.log('%c\u2500\u2500 Quick Fix Suggestions \u2500\u2500', 'color:#ff9500;font-weight:bold');
    if (!testChar.personality) console.log('  Add personality: state.characters.find(c=>c.id==="' + testChar.id + '").personality = "..."; saveState();');
    if (!testChar.background) console.log('  Add background: state.characters.find(c=>c.id==="' + testChar.id + '").background = "..."; saveState();');
    if (expectedWbs.length === 0 && worldbooks.length > 0) console.log('  Bind worldbook or set one as global');
    if (!expectedMask && masks.length === 0) console.log('  Create a mask and bind it to a character');
  }

  return { pass: pass, fail: fail, warn: warn, total: total, promptLength: prompt.length };
}


/* ══════════════════════════════════
   ★★★ Global Exports ★★★
   ══════════════════════════════════ */
;(function _exportMeetingGlobals() {
  'use strict';
  try {
    // Core business functions
    window.mtgEnsureMemoryFields     = mtgEnsureMemoryFields;
    window.mtgCheckAutoSummarize     = mtgCheckAutoSummarize;
    window.mtgSummarizeRemaining     = mtgSummarizeRemaining;
    window.mtgWriteToMemoryLibrary   = mtgWriteToMemoryLibrary;
    window.mtgEndSession             = mtgEndSession;
    window.mtgCallSummarize          = mtgCallSummarize;
    window.mtgCallConsolidate        = mtgCallConsolidate;
    window.mtgCountUnsummarizedTurns = mtgCountUnsummarizedTurns;
    window.mtgGetUnsummarizedEntries = mtgGetUnsummarizedEntries;
    window.mtgManualWriteToMemory    = mtgManualWriteToMemory;

    // UI & page functions
    window.initMeetingPage           = initMeetingPage;
    window.mtgRenderArchiveList      = mtgRenderArchiveList;
    window.openMeetingNewArchive     = openMeetingNewArchive;
    window.exitMeetingNew            = exitMeetingNew;
    window.mtgNewModeChanged         = mtgNewModeChanged;
    window.mtgNewSummaryToggled      = mtgNewSummaryToggled;
    window.mtgCreateArchive          = mtgCreateArchive;
    window.openMeetingManage         = openMeetingManage;
    window.exitMeetingManage         = exitMeetingManage;
    window.mtgOpenSettingsForArchive = mtgOpenSettingsForArchive;
    window.openMeetingSettingsFromWrite = openMeetingSettingsFromWrite;
    window.exitMeetingSettings       = exitMeetingSettings;
    window.mtgSaveSettings           = mtgSaveSettings;
    window.mtgDeleteArchive          = mtgDeleteArchive;
    window.openMeetingWrite          = openMeetingWrite;
    window.exitMeetingWrite          = exitMeetingWrite;
    window.meetingWriteSend          = meetingWriteSend;
    window.mtgDeleteEntry            = mtgDeleteEntry;
    window.mtgEditEntry              = mtgEditEntry;
    window.mtgRegenerateEntry        = mtgRegenerateEntry;
    window.mtgCancelEdit             = mtgCancelEdit;
    window.mtgSegToggle              = mtgSegToggle;
    window.mtgRenderSettingsMemory   = mtgRenderSettingsMemory;
    window.mtgRenderSessionMemories  = mtgRenderSessionMemories;

    // ★★★ v2.1: Prompt builder (exported for testing)
    window.mtgBuildSystemPrompt      = mtgBuildSystemPrompt;
    window.mtgBuildContextMessages   = mtgBuildContextMessages;

        window.mtgArchiveSession              = mtgArchiveSession;
    window.mtgNewBanNsfwToggled           = mtgNewBanNsfwToggled;
    window.mtgNewAntiSnatchToggled        = mtgNewAntiSnatchToggled;
    window.mtgManageBanNsfwToggled        = mtgManageBanNsfwToggled;
    window.mtgManageAntiSnatchToggled     = mtgManageAntiSnatchToggled;

    // Backward compat
    window.openMeetingSettings       = openMeetingSettings;
    window.startMeetingSession       = startMeetingSession;
    window.renderMeetingCards        = renderMeetingCards;
    window.mtgCloseEndModal          = mtgCloseEndModal;

    // Test functions
    window.__mizuMeetingTest         = __mizuMeetingTest;
    window.__mizuMeetingPromptTest   = __mizuMeetingPromptTest;

        console.log('[Meeting v2.1] All globals exported.',
      '| Core: 10 | Prompt: mtgBuildSystemPrompt + mtgBuildContextMessages',
      '| Toggles: mtgNewBanNsfwToggled + mtgNewAntiSnatchToggled + mtgManageBanNsfwToggled + mtgManageAntiSnatchToggled',
      '| Tests: __mizuMeetingTest + __mizuMeetingPromptTest');
  } catch (exportErr) {
    console.error('[Meeting v2.1] Global export FAILED:', exportErr);
  }
})();


window.mtgSettingsSummaryToggled = mtgSettingsSummaryToggled;
