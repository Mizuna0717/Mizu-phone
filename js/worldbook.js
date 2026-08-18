// ========== 14-worldbook.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js

function renderWbList() {
  const body = document.getElementById('wbListBody');
  if (!state.worldbooks.length) {
    body.innerHTML = `<div class="empty-state"><svg viewBox="0 0 48 48"><path d="M8 6h12a4 4 0 014 4v28s-3-4-10-4H8V6z"/><path d="M40 6H28a4 4 0 00-4 4v28s3-4 10-4h6V6z"/></svg><p>${T('noWorldbooks')}<br>${T('tapCreateWb')}</p></div>`;
    return;
  }
  const g = {};
  state.worldbooks.forEach(wb => { const k = wb.group || '—'; if (!g[k]) g[k] = []; g[k].push(wb); });
  let h = '';
  Object.keys(g).sort().forEach(k => {
    h += `<div class="section-header">${esc(k)}</div><div class="list-group">`;
    g[k].forEach(wb => {
      h += `<div class="list-item" onclick="editWb('${wb.id}')"><div class="li-info"><div class="li-title">${esc(wb.name)}</div><div class="li-sub">${esc((wb.content || '').slice(0, 40))}</div></div><span class="tag ${wb.isGlobal ? 'global' : 'local'}">${wb.isGlobal ? T('global') : T('local')}</span><span class="li-arrow">›</span></div>`;
    });
    h += '</div>';
  });
  body.innerHTML = h + '<div style="height:60px"></div>';
}

function editWb(id) {
  state.editingWbId = id;
  const wb = id ? state.worldbooks.find(w => w.id === id) : null;
  document.getElementById('wbEditTitle').textContent = wb ? T('editWb') : T('newWb');
  document.getElementById('wbName').value = wb ? wb.name : '';
  document.getElementById('wbGroup').value = wb ? (wb.group || '') : '';
  document.getElementById('wbContentArea').value = wb ? (wb.content || '') : '';
  document.getElementById('deleteWbBtn').style.display = wb ? 'block' : 'none';
  tmp.wbGlobal = wb ? wb.isGlobal : false;
  tmp.wbEntries = wb ? JSON.parse(JSON.stringify(wb.entries || [])) : [];
  document.getElementById('wbGlobalToggle').classList.toggle('on', tmp.wbGlobal);
  renderWbEntries();
  nav('screen-wb-edit');
}

function toggleWbGlobal() {
  tmp.wbGlobal = !tmp.wbGlobal;
  document.getElementById('wbGlobalToggle').classList.toggle('on', tmp.wbGlobal);
}

function renderWbEntries() {
  const b = document.getElementById('wbEntriesBody');
  if (!tmp.wbEntries.length) {
    b.innerHTML = `<div style="text-align:center;color:#8e8e93;padding:16px;font-size:14px">${T('noEntries')}</div>`;
    return;
  }
  let h = '<div class="list-group">';
  tmp.wbEntries.forEach((e, i) => {
    h += `<div class="list-item" style="align-items:flex-start"><div class="li-info"><div class="li-title" contenteditable="true" oninput="tmp.wbEntries[${i}].keyword=this.textContent" style="outline:none;min-width:40px">${esc(e.keyword || '')}</div><div class="li-sub" contenteditable="true" oninput="tmp.wbEntries[${i}].content=this.textContent" style="outline:none;white-space:normal">${esc(e.content || '')}</div></div><button onclick="rmWbEntry(${i})" style="background:none;border:none;cursor:pointer;padding:8px"><svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:#ff3b30;fill:none;stroke-width:2"><circle cx="10" cy="10" r="8"/><path d="M7 10h6"/></svg></button></div>`;
  });
  b.innerHTML = h + '</div>';
}

function addWbEntry() {
  tmp.wbEntries.push({ id: uid(), keyword: '', content: '' });
  renderWbEntries();
  showToast(T('entryAdded'));
}

function rmWbEntry(i) {
  tmp.wbEntries.splice(i, 1);
  renderWbEntries();
}

function saveWb() {
  const name = document.getElementById('wbName').value.trim();
  if (!name) { showToast(T('enterName')); return; }
  const group = document.getElementById('wbGroup').value.trim();
  const content = document.getElementById('wbContentArea').value.trim();
  if (state.editingWbId) {
    const wb = state.worldbooks.find(w => w.id === state.editingWbId);
    if (wb) Object.assign(wb, { name, group, content, isGlobal: tmp.wbGlobal, entries: tmp.wbEntries });
  } else {
    state.worldbooks.push({ id: uid(), name, group, content, isGlobal: tmp.wbGlobal, entries: tmp.wbEntries });
  }
  saveState();
  showToast(T('wbSaved'));
  nav('screen-worldbook');
}

function deleteWb() {
  if (!state.editingWbId) return;
  const wid = state.editingWbId;
  const bk = JSON.parse(JSON.stringify(state.worldbooks.find(w => w.id === wid)));
  state.worldbooks = state.worldbooks.filter(w => w.id !== wid);
  state.characters.forEach(ch => {
    if (ch.worldbookIds) ch.worldbookIds = ch.worldbookIds.filter(id => id !== wid);
  });
  saveState();
  nav('screen-worldbook');
  showSnackbar(T('deleted'), () => { state.worldbooks.push(bk); saveState(); renderWbList(); });
}
