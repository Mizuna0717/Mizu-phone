// ========== 08-settings.js ==========
// 依赖：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 06-api.js

// ★ 初始化提示词（由 init.js 在 loadState 之后调用）
function initSystemPrompts() {
  if (!accountStore || !accountStore.currentAccountId) {
    console.warn('[initSystemPrompts] 账号未就绪，跳过');
    return;
  }

  var origChars = state.characters.length;
  var origChats = Object.keys(state.chats).length;

  var needSave = false;

  if (state.systemPromptIM == null) {
    if (state.replyPrompt && state.replyPrompt !== (typeof DEFAULT_REPLY_PROMPT !== 'undefined' ? DEFAULT_REPLY_PROMPT : '')) {
      state.systemPromptIM = state.replyPrompt;
    } else {
      state.systemPromptIM = (typeof DEFAULT_SYSTEM_PROMPT_IM_NO_PUNC !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_IM_NO_PUNC : '';
    }
    needSave = true;
  }

  if (state.systemPromptMeeting == null) {
    state.systemPromptMeeting = (typeof DEFAULT_SYSTEM_PROMPT_MEETING !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_MEETING : '';
    needSave = true;
  }

  if (needSave) {
    if (state.characters.length !== origChars) {
      console.error('[initSystemPrompts] 角色数量在初始化过程中发生变化！', origChars, '->', state.characters.length);
    }
    saveState();
    console.log('[initSystemPrompts] 已初始化默认提示词并保存 | IM长度:', state.systemPromptIM.length,
      '| Meeting长度:', state.systemPromptMeeting.length,
      '| chars:', state.characters.length, '(应为' + origChars + ')');
  } else {
    console.log('[initSystemPrompts] 提示词已存在，无需初始化 | IM长度:', state.systemPromptIM.length,
      '| Meeting长度:', state.systemPromptMeeting.length);
  }
}


function _getEffectivePromptIM() {
  if (state.systemPromptIM != null && state.systemPromptIM !== '') {
    return state.systemPromptIM;
  }
  if (state.replyPrompt && state.replyPrompt !== (typeof DEFAULT_REPLY_PROMPT !== 'undefined' ? DEFAULT_REPLY_PROMPT : '')) {
    return state.replyPrompt;
  }
  return (typeof DEFAULT_SYSTEM_PROMPT_IM !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_IM : '';
}

function _getEffectivePromptMeeting() {
  if (state.systemPromptMeeting != null && state.systemPromptMeeting !== '') {
    return state.systemPromptMeeting;
  }
  return (typeof DEFAULT_SYSTEM_PROMPT_MEETING !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_MEETING : '';
}


function renderSettings() {
  renderApiListInline();
  renderSettingsHero();

  _ensurePromptsInState();

  _restorePromptModeUI();

  if (!state.memories) state.memories = [];

  // ★ 渲染记忆检索设置面板
  if (typeof renderRetrievalSettings === 'function') {
    renderRetrievalSettings('retrievalSettingsContainer');
  }

  // ★ NEW: 渲染认证区块（退出登录 + 用户信息）
  if (typeof mizuAuth !== 'undefined' && typeof mizuAuth.renderSettingsSection === 'function') {
    try {
      mizuAuth.renderSettingsSection();
    } catch(e) {
      console.warn('[settings] renderAuthSection failed:', e);
    }
  }
}

function _ensurePromptsInState() {
  var needSave = false;

  if (state.systemPromptIM == null) {
    state.systemPromptIM = _getEffectivePromptIM();
    if (state.systemPromptIM) needSave = true;
  }

  if (state.systemPromptMeeting == null) {
    state.systemPromptMeeting = _getEffectivePromptMeeting();
    if (state.systemPromptMeeting) needSave = true;
  }

  if (needSave) {
    saveState();
    console.log('[_ensurePromptsInState] 已补写默认提示词到 state | IM:', state.systemPromptIM.length, '| Meeting:', state.systemPromptMeeting.length);
  }
}


function renderSettingsHero() {
  const a = state.apis.find(x => x.id === state.activeApiId);
  document.getElementById('heroApiName').textContent = a ? a.name : T('noApi');
  document.getElementById('heroApiModel').textContent = a ? (a.model || '—') : '—';
  document.getElementById('heroApiDot').className = 'settings-hero-dot ' + (a ? 'on' : 'off');
}

function renderApiListInline() {
  const b = document.getElementById('apiListInline');
  let h = '<div class="api-card">';
  if (!state.apis.length) {
    h += `<div style="padding:24px 16px;text-align:center;color:#8e8e93;font-size:14px">${T('noApi')}</div>`;
  } else {
    state.apis.forEach(a => {
      const isA = state.activeApiId === a.id;
      h += `<div class="api-card-item" onclick="editApi('${a.id}')"><div class="aci-indicator ${isA ? 'active' : 'inactive'}"></div><div class="aci-info"><div class="aci-name">${esc(a.name || 'Unnamed')}</div><div class="aci-model">${esc(a.model || 'No model')}</div></div><span class="aci-badge ${isA ? 'on' : 'off'}">${isA ? T('active') : ''}</span><span class="aci-arrow">›</span></div>`;
    });
  }
  h += `<div class="api-card-add" onclick="editApi(null)"><svg viewBox="0 0 18 18"><path d="M9 3v12M3 9h12" stroke-linecap="round"/></svg><span>${T('addApi')}</span></div></div>`;
  b.innerHTML = h;
}

// ========== iMessage 提示词 ==========
function savePromptIM() {
  var area = document.getElementById('promptIMArea');
  if (area) {
    state.systemPromptIM = area.value;
    saveState();
  }
}

function resetPromptIM() {
  var defaultVal = (typeof DEFAULT_SYSTEM_PROMPT_IM !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_IM : '';
  state.systemPromptIM = defaultVal;
  var area = document.getElementById('promptIMArea');
  if (area) area.value = defaultVal;
  saveState();
  showToast('Reset');
}

// ========== Meeting 提示词 ==========
function savePromptMeeting() {
  var area = document.getElementById('promptMeetingArea');
  if (area) {
    state.systemPromptMeeting = area.value;
    saveState();
  }
}

function resetPromptMeeting() {
  var defaultVal = (typeof DEFAULT_SYSTEM_PROMPT_MEETING !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_MEETING : '';
  state.systemPromptMeeting = defaultVal;
  var area = document.getElementById('promptMeetingArea');
  if (area) area.value = defaultVal;
  saveState();
  showToast('Reset');
}

// ========== 向后兼容 ==========
function saveReplyPrompt() { savePromptIM(); }
function resetReplyPrompt() { resetPromptIM(); }

// ========== API EDIT ==========
function editApi(id) {
  state.editingApiId = id;
  tmp.resolvedBase = null;
  const a = id ? state.apis.find(x => x.id === id) : null;
  document.getElementById('apiEditTitle').textContent = a ? T('editApi') : T('addApi');
  document.getElementById('apiName').value = a ? a.name : '';
  document.getElementById('apiUrl').value = a ? a.url : '';
  document.getElementById('apiKey').value = a ? a.key : '';
  document.getElementById('apiTemp').value = a ? (a.temperature ?? 0.8) : 0.8;
  document.getElementById('apiTempVal').textContent = a ? (a.temperature ?? 0.8) : 0.8;
  document.getElementById('deleteApiBtn').style.display = a ? 'block' : 'none';
  if (a?._resolvedBase) tmp.resolvedBase = a._resolvedBase;
  setUrlStatus('pending', T('urlNotTested'));
  if (a?.models?.length) {
    document.getElementById('modelSelect').innerHTML = a.models.map(m =>
      `<option value="${esc(m)}"${m === a.model ? ' selected' : ''}>${esc(m)}</option>`
    ).join('');
    document.getElementById('modelSelectGroup').style.display = 'block';
    setUrlStatus('ok', T('urlOk'));
  } else {
    document.getElementById('modelSelectGroup').style.display = 'none';
  }
  nav('screen-api-edit');
}

async function fetchModels() {
  const raw = document.getElementById('apiUrl').value.trim();
  const key = document.getElementById('apiKey').value.trim();
  if (!raw) { showToast(T('enterUrl')); return; }
  const btn = document.getElementById('fetchModelsBtn');
  const txt = document.getElementById('fetchBtnText');
  txt.textContent = T('fetching');
  btn.disabled = true;
  const sp = document.createElement('span');
  sp.className = 'spin-ring sm';
  sp.style.marginLeft = '8px';
  btn.appendChild(sp);
  setUrlStatus('pending', T('tryingUrl'));
  try {
    const models = await fetchModelList(raw, key);
    const ids = models.map(m => m.id || m).sort();
    document.getElementById('modelSelect').innerHTML = ids.map(m =>
      `<option value="${esc(m)}">${esc(m)}</option>`
    ).join('');
    document.getElementById('modelSelectGroup').style.display = 'block';
    tmp.tempModels = ids;
    setUrlStatus('ok', ids.length + ' ' + T('foundModels'));
    showToast(ids.length + ' ' + T('foundModels'));
  } catch (e) {
    setUrlStatus('fail', T('urlFail'));
    showErrorModal(friendlyError(e));
  } finally {
    txt.textContent = T('fetchModels');
    btn.disabled = false;
    sp.remove();
  }
}

function saveApi(setA) {
  document.getElementById('splitMenu')?.classList.remove('open');
  const name = document.getElementById('apiName').value.trim() || 'Unnamed';
  const url = document.getElementById('apiUrl').value.trim();
  const key = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('modelSelect').value || '';
  const temp = parseFloat(document.getElementById('apiTemp').value) || 0.8;
  const models = tmp.tempModels || [];
  const rb = tmp.resolvedBase;
  if (!url) { showToast(T('enterUrl')); return; }
  if (state.editingApiId) {
    const a = state.apis.find(x => x.id === state.editingApiId);
    if (a) { Object.assign(a, { name, url, key, model, temperature: temp, _resolvedBase: rb }); if (models.length) a.models = models; }
  } else {
    const id = uid();
    state.apis.push({ id, name, url, key, model, temperature: temp, models, _resolvedBase: rb });
    if (state.apis.length === 1 || setA) state.activeApiId = id;
  }
  if (setA && state.editingApiId) state.activeApiId = state.editingApiId;
  tmp.tempModels = null;
  saveState();
  showToast(setA ? T('savedActive') : T('apiSaved'));
  nav('screen-settings');
}

function deleteApi() {
  if (!state.editingApiId) return;
  const id = state.editingApiId;
  const a = state.apis.find(x => x.id === id);
  state.apis = state.apis.filter(x => x.id !== id);
  if (state.activeApiId === id) state.activeApiId = state.apis[0]?.id || null;
  saveState();
  nav('screen-settings');
  showSnackbar(T('deleted'), () => { state.apis.push(a); saveState(); renderSettings(); });
}

// ========== 提示词模式选择（阶段3：切换 + 覆盖 state） ==========

function _getImPromptByMode(mode) {
  var noPunc = (typeof DEFAULT_SYSTEM_PROMPT_IM_NO_PUNC !== 'undefined')
    ? DEFAULT_SYSTEM_PROMPT_IM_NO_PUNC
    : (typeof DEFAULT_SYSTEM_PROMPT_IM !== 'undefined' ? DEFAULT_SYSTEM_PROMPT_IM : '');
  var punc = (typeof DEFAULT_SYSTEM_PROMPT_IM_PUNC !== 'undefined')
    ? DEFAULT_SYSTEM_PROMPT_IM_PUNC
    : noPunc;
  if (mode === 'default_no_punc') return noPunc;
  if (mode === 'default_punc') return punc;
  return null; // custom
}

function _getMeetingPromptByMode(mode) {
  if (mode === 'default') {
    return (typeof DEFAULT_SYSTEM_PROMPT_MEETING !== 'undefined') ? DEFAULT_SYSTEM_PROMPT_MEETING : '';
  }
  return null; // custom
}

function _setPromptModeActive(groupId, mode) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.prompt-mode-opt').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function _toggleCustomWrap(wrapId, open) {
  var wrap = document.getElementById(wrapId);
  if (!wrap) return;
  wrap.classList.toggle('open', !!open);
}

function selectImPromptMode(mode) {
  var prevMode = state.imPromptMode;
  _setPromptModeActive('imPromptModeGroup', mode);
  state.imPromptMode = mode;

  var area = document.getElementById('promptIMArea');

  if (mode === 'custom') {
    _toggleCustomWrap('imPromptCustomWrap', true);
    if (prevMode !== 'custom') {
      // 从别的模式切过来 → 弹出空输入框
      if (area) area.value = '';
      state.systemPromptIM = '';
    } else {
      // 本来就是 custom（程序性调用）→ 保留
      if (area) area.value = state.systemPromptIM || '';
    }
  } else {
    _toggleCustomWrap('imPromptCustomWrap', false);
    var val = _getImPromptByMode(mode);
    if (val != null) {
      state.systemPromptIM = val;
      if (area) area.value = val;
    }
  }

  saveState();
  console.log('[selectImPromptMode]', mode,
    '| state.systemPromptIM length:', (state.systemPromptIM || '').length);
}

function selectMeetingPromptMode(mode) {
  var prevMode = state.meetingPromptMode;
  _setPromptModeActive('meetingPromptModeGroup', mode);
  state.meetingPromptMode = mode;

  var area = document.getElementById('promptMeetingArea');

  if (mode === 'custom') {
    _toggleCustomWrap('meetingPromptCustomWrap', true);
    if (prevMode !== 'custom') {
      if (area) area.value = '';
      state.systemPromptMeeting = '';
    } else {
      if (area) area.value = state.systemPromptMeeting || '';
    }
  } else {
    _toggleCustomWrap('meetingPromptCustomWrap', false);
    var val = _getMeetingPromptByMode(mode);
    if (val != null) {
      state.systemPromptMeeting = val;
      if (area) area.value = val;
    }
  }

  saveState();
  console.log('[selectMeetingPromptMode]', mode,
    '| state.systemPromptMeeting length:', (state.systemPromptMeeting || '').length);
}

// 恢复 UI（进设置页时调用）
function _restorePromptModeUI() {
  var imMode = state.imPromptMode || 'default_no_punc';
  var mtMode = state.meetingPromptMode || 'default';
  var needSave = false;

  // ★ 非 custom 模式：强制 state 对齐常量（清理历史遗留）
  if (imMode !== 'custom') {
    var v1 = _getImPromptByMode(imMode);
    if (v1 != null && state.systemPromptIM !== v1) {
      console.log('[restore] IM mode=' + imMode + '，state 与常量不一致，自动对齐 | 旧长度=' +
        (state.systemPromptIM || '').length + ' → 新长度=' + v1.length);
      state.systemPromptIM = v1;
      needSave = true;
    }
  }
  if (mtMode !== 'custom') {
    var v2 = _getMeetingPromptByMode(mtMode);
    if (v2 != null && state.systemPromptMeeting !== v2) {
      console.log('[restore] Meeting mode=' + mtMode + '，state 与常量不一致，自动对齐 | 旧长度=' +
        (state.systemPromptMeeting || '').length + ' → 新长度=' + v2.length);
      state.systemPromptMeeting = v2;
      needSave = true;
    }
  }

  if (needSave) saveState();

  // UI 状态
  _setPromptModeActive('imPromptModeGroup', imMode);
  _toggleCustomWrap('imPromptCustomWrap', imMode === 'custom');
  _setPromptModeActive('meetingPromptModeGroup', mtMode);
  _toggleCustomWrap('meetingPromptCustomWrap', mtMode === 'custom');

  var imArea = document.getElementById('promptIMArea');
  var mtArea = document.getElementById('promptMeetingArea');
  if (imArea) imArea.value = (imMode === 'custom') ? (state.systemPromptIM || '') : _getEffectivePromptIM();
  if (mtArea) mtArea.value = (mtMode === 'custom') ? (state.systemPromptMeeting || '') : _getEffectivePromptMeeting();
}

// ========== 控制台验证函数 ==========
window.__checkPromptSettings = function() {
  var imMode = state.imPromptMode;
  var mtMode = state.meetingPromptMode;

  var imGroup = document.getElementById('imPromptModeGroup');
  var imActive = imGroup ? imGroup.querySelector('.prompt-mode-opt.active') : null;
  var imActiveMode = imActive ? imActive.dataset.mode : 'NONE';

  var mtGroup = document.getElementById('meetingPromptModeGroup');
  var mtActive = mtGroup ? mtGroup.querySelector('.prompt-mode-opt.active') : null;
  var mtActiveMode = mtActive ? mtActive.dataset.mode : 'NONE';

  var imWrap = document.getElementById('imPromptCustomWrap');
  var mtWrap = document.getElementById('meetingPromptCustomWrap');

  console.log('%c=== Prompt Settings Check ===', 'color:#0a84ff;font-weight:bold;font-size:14px');

  console.log('%c[State]', 'color:#30d158;font-weight:bold');
  console.table({
    'imPromptMode': imMode,
    'meetingPromptMode': mtMode,
    'systemPromptIM 长度': (state.systemPromptIM || '').length,
    'systemPromptMeeting 长度': (state.systemPromptMeeting || '').length,
  });

  console.log('%c[UI]', 'color:#ff9f0a;font-weight:bold');
  console.table({
    'IM 按钮 active': imActiveMode,
    'Meeting 按钮 active': mtActiveMode,
    'IM 自定义框展开': imWrap ? imWrap.classList.contains('open') : 'N/A',
    'Meeting 自定义框展开': mtWrap ? mtWrap.classList.contains('open') : 'N/A',
  });

  var errors = [];
  if (imMode !== imActiveMode)
    errors.push('⚠ IM 按钮 active 与 state 不一致: state=' + imMode + ' UI=' + imActiveMode);
  if (mtMode !== mtActiveMode)
    errors.push('⚠ Meeting 按钮 active 与 state 不一致: state=' + mtMode + ' UI=' + mtActiveMode);
  if (imMode === 'custom' && imWrap && !imWrap.classList.contains('open'))
    errors.push('⚠ IM custom 模式但输入框未展开');
  if (imMode !== 'custom' && imWrap && imWrap.classList.contains('open'))
    errors.push('⚠ IM 非 custom 模式但输入框还展开着');
  if (mtMode === 'custom' && mtWrap && !mtWrap.classList.contains('open'))
    errors.push('⚠ Meeting custom 模式但输入框未展开');
  if (mtMode !== 'custom' && mtWrap && mtWrap.classList.contains('open'))
    errors.push('⚠ Meeting 非 custom 模式但输入框还展开着');
  if (!state.systemPromptIM)
    errors.push('⚠ systemPromptIM 为空');
  if (!state.systemPromptMeeting)
    errors.push('⚠ systemPromptMeeting 为空');

  if (errors.length) {
    console.log('%c[问题]', 'color:#ff453a;font-weight:bold');
    errors.forEach(function(e) { console.log(e); });
  } else {
    console.log('%c✓ 所有检查通过', 'color:#30d158;font-weight:bold;font-size:14px');
  }

  return { imMode: imMode, mtMode: mtMode, imActiveMode: imActiveMode, mtActiveMode: mtActiveMode };
};