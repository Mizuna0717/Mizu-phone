// ========== 08-settings.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 06-api.js

function renderSettings() {
  renderApiListInline();
  renderSettingsHero();
  renderHelpAccordion();
  document.getElementById('replyPromptArea').value = state.replyPrompt;
  if (!state.memories) state.memories = [];
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

function saveReplyPrompt() {
  state.replyPrompt = document.getElementById('replyPromptArea').value;
  saveState();
}

function resetReplyPrompt() {
  state.replyPrompt = DEFAULT_REPLY_PROMPT;
  document.getElementById('replyPromptArea').value = DEFAULT_REPLY_PROMPT;
  saveState();
  showToast('Reset');
}

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
