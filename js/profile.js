// ========== 09-profile.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js

// ========== iMESSAGE TABS ==========
function switchImsgTab(tab) {
  state.imsgTab = tab;
  document.querySelectorAll('.imsg-bottom-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab)
  );
  document.getElementById('imsgTabMessages').classList.toggle('active', tab === 'messages');
  document.getElementById('imsgTabProfile').classList.toggle('active', tab === 'profile');
  document.getElementById('drawerBtnNav').style.display = tab === 'messages' ? '' : 'none';
  document.getElementById('imsgLargeTitle').textContent = tab === 'messages' ? T('messages') : T('myProfile');
}

function imsgTabAction() {
  if (state.imsgTab === 'profile') editMask(null);
  else createNewChar();
}

// ========== PROFILE ==========
function renderProfileInfo() {
  const u = state.userProfile;
  const pv = document.getElementById('userAvatarPv');
  const ph = document.getElementById('userAvatarPh');
  if (u.avatar) { pv.src = u.avatar; pv.style.display = 'block'; ph.style.display = 'none'; }
  else { pv.style.display = 'none'; ph.style.display = 'block'; }
  document.getElementById('userNameDisplay').textContent = u.name || 'User';
}

function previewUserAvatar(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => {
      state.userProfile.avatar = e.target.result;
      saveState();
      renderProfileInfo();
      showToast(T('charSaved'));
    };
    r.readAsDataURL(inp.files[0]);
  }
}

function startEditUserName() {
  document.getElementById('nameModalInput').value = state.userProfile.name || '';
  document.getElementById('nameModal').classList.add('show');
  setTimeout(() => document.getElementById('nameModalInput').focus(), 100);
}

function confirmEditUserName() {
  const v = document.getElementById('nameModalInput').value.trim();
  if (v) {
    state.userProfile.name = v;
    saveState();
    renderProfileInfo();
    renderHomeProfile();
    document.getElementById('homeUserName').textContent = v;
    showToast(T('charSaved'));
  }
  closeModal('nameModal');
  window._nameTarget = null;
}

function confirmEditMsg() {
  const newText = document.getElementById('editMsgInput').value.trim();
  if (!newText) { closeModal('editMsgModal'); return; }

  const segMatch = bubbleState.editingMsgId?.match(/^(.+)__seg(\d+)$/);
  if (segMatch) {
    const realId = segMatch[1];
    const segIdx = parseInt(segMatch[2]);
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === realId);
    if (msg) {
      const segs = parseReplySegments(msg.content, state.stickers);
      segs[segIdx].content = newText;
      msg.content = segs.map(s => s.type === 'text' ? s.content : msg.content).join('\n');
      msg.edited = true;
    }
  } else {
    const msg = (state.chats[state.currentCharId] || []).find(m => m.id === bubbleState.editingMsgId);
    if (msg) { msg.content = newText; msg.edited = true; }
  }

  bubbleState.editingMsgId = null;
  saveState();
  closeModal('editMsgModal');
  renderChat();
  showToast(T('edited'));
}

// ========== STICKERS ==========
function renderProfileStickers() {
  document.getElementById('profileStickerCount').textContent = state.stickers.length;
  const c = document.getElementById('profileStickerPreview');
  if (!state.stickers.length) { c.innerHTML = ''; return; }
  c.innerHTML = '<div class="sticker-preview-grid">' + state.stickers.map(s =>
    `<div class="sp-item"><img src="${s.dataUrl}" title="${esc(s.name)}"><button class="sp-del" onclick="event.stopPropagation();delStickerProfile('${s.id}')"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6"/></svg></button></div>`
  ).join('') + '</div>';
}

function delStickerProfile(sid) {
  state.stickers = state.stickers.filter(s => s.id !== sid);
  saveState();
  renderProfileStickers();
}

function importStickersFromFile(inp) {
  if (!inp.files) return;
  let c = 0;
  const t = inp.files.length;
  Array.from(inp.files).forEach(f => {
    const r = new FileReader();
    r.onload = e => {
      state.stickers.push({ id: uid(), name: f.name.replace(/\.[^.]+$/, ''), dataUrl: e.target.result });
      c++;
      if (c === t) { saveState(); renderProfileStickers(); renderStickerGrid(); showToast(c + ' ' + T('imported')); }
    };
    r.readAsDataURL(f);
  });
  inp.value = '';
}

function openUrlImportModal() {
  document.getElementById('urlImportText').value = '';
  document.getElementById('urlProgress').style.display = 'none';
  document.getElementById('urlStatusText').style.display = 'none';
  document.getElementById('urlImportModal').classList.add('show');
}

async function startUrlImport() {
  const text = document.getElementById('urlImportText').value.trim();
  if (!text) return;
  const urls = text.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
  if (!urls.length) return;
  document.getElementById('urlImportBtn').textContent = T('importing');
  const prog = document.getElementById('urlProgress');
  prog.style.display = 'block';
  const bar = document.getElementById('urlProgressBar');
  bar.style.width = '0%';
  const st = document.getElementById('urlStatusText');
  st.style.display = 'block';
  let ok = 0, fail = 0;
  for (let i = 0; i < urls.length; i += 3) {
    const chunk = urls.slice(i, i + 3);
    const results = await Promise.allSettled(chunk.map(async url => {
      const r = await fetch(url);
      if (!r.ok) throw 0;
      const blob = await r.blob();
      return new Promise((res, rej) => {
        const rd = new FileReader();
        rd.onload = () => res({ dataUrl: rd.result, name: url.split('/').pop().replace(/\.[^.]+$/, '') || 'sticker' });
        rd.onerror = rej;
        rd.readAsDataURL(blob);
      });
    }));
    results.forEach(r => {
      if (r.status === 'fulfilled') { state.stickers.push({ id: uid(), name: r.value.name, dataUrl: r.value.dataUrl }); ok++; }
      else fail++;
    });
    bar.style.width = Math.round(((i + chunk.length) / urls.length) * 100) + '%';
    st.textContent = `${ok} ${T('imported')}${fail ? ' · ' + fail + ' ' + T('failed') : ''}`;
  }
  saveState();
  renderProfileStickers();
  document.getElementById('urlImportBtn').textContent = T('import_');
  setTimeout(() => closeModal('urlImportModal'), 1000);
}

// ========== MASKS ==========
function renderMaskList() {
  const b = document.getElementById('maskListBody');
  if (!state.masks.length) {
    b.innerHTML = `<div class="mask-empty"><svg viewBox="0 0 44 44"><rect x="4" y="4" width="36" height="36" rx="8"/></svg><p>${T('noMasks')}<br>${T('noMasksSub')}</p></div>`;
    return;
  }
  b.innerHTML = state.masks.map(m => {
    const bc = (m.charIds || []).map(cid => state.characters.find(c => c.id === cid)).filter(Boolean);
    return `<div class="mask-card" onclick="editMask('${m.id}')"><div class="mc-avatar">${m.avatar ? `<img src="${m.avatar}">` : '<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="6"/></svg>'}</div><div class="mc-info"><div class="mc-name">${esc(m.name)}</div><div class="mc-desc">${esc((m.persona || '').slice(0, 40))}</div>${bc.length ? `<div class="mc-chars">${bc.slice(0, 3).map(c => `<span class="mc-char-tag">${esc(c.name)}</span>`).join('')}</div>` : ''}</div><span class="mc-arrow">›</span></div>`;
  }).join('');
}

function editMask(id) {
  state.editingMaskId = id;
  const m = id ? state.masks.find(x => x.id === id) : null;
  document.getElementById('maskEditTitle').textContent = m ? T('editMask') : T('newMask');
  document.getElementById('maskName').value = m ? m.name : '';
  document.getElementById('maskPersonaArea').value = m ? (m.persona || '') : '';
  document.getElementById('deleteMaskBtn').style.display = m ? 'block' : 'none';
  tmp.maskAvatar = m ? m.avatar : null;
  setAvatarPreview('maskAvatarPv', 'maskAvatarPh', tmp.maskAvatar);
  renderMaskCharList(m ? (m.charIds || []) : []);
  nav('screen-mask-edit');
}

function previewMaskAvatar(inp) {
  previewAvatarFile(inp, d => { tmp.maskAvatar = d; setAvatarPreview('maskAvatarPv', 'maskAvatarPh', d); });
}

function renderMaskCharList(sel) {
  const c = document.getElementById('maskCharList');
  if (!state.characters.length) {
    c.innerHTML = `<div style="padding:14px 16px;color:#8e8e93;font-size:14px">${T('noCharsAvailable')}</div>`;
    return;
  }
  const ob = {};
  state.masks.forEach(m => {
    if (m.id === state.editingMaskId) return;
    (m.charIds || []).forEach(cid => { ob[cid] = m.name; });
  });
  c.innerHTML = state.characters.map(ch => {
    const bd = ob[ch.id], ck = sel.includes(ch.id), dis = !!bd && !ck;
    return `<div class="wb-check-item${dis ? ' style="opacity:.5"' : ''}" onclick="${dis ? '' : `this.querySelector('.checkbox').classList.toggle('checked')`}"><div class="checkbox ${ck ? 'checked' : ''}" data-charid="${ch.id}"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div><div class="li-info"><div class="li-title">${esc(ch.name)}</div>${bd ? `<div class="li-sub">${T('maskBound')}: ${esc(bd)}</div>` : ''}</div></div>`;
  }).join('');
}

function saveMask() {
  const name = document.getElementById('maskName').value.trim();
  if (!name) { showToast(T('enterName')); return; }
  const persona = document.getElementById('maskPersonaArea').value.trim();
  const av = tmp.maskAvatar;
  const charIds = [];
  document.querySelectorAll('#maskCharList .checkbox.checked').forEach(cb => charIds.push(cb.dataset.charid));
  state.masks.forEach(m => {
    if (m.id === state.editingMaskId) return;
    m.charIds = (m.charIds || []).filter(cid => !charIds.includes(cid));
  });
  if (state.editingMaskId) {
    const m = state.masks.find(x => x.id === state.editingMaskId);
    if (m) Object.assign(m, { name, persona, avatar: av, charIds });
  } else {
    state.masks.push({ id: uid(), name, persona, avatar: av, charIds });
  }
  saveState();
  showToast(T('maskSaved'));
  nav('screen-imessage');
  switchImsgTab('profile');
}

function deleteMask() {
  if (!state.editingMaskId) return;
  const bk = JSON.parse(JSON.stringify(state.masks.find(x => x.id === state.editingMaskId)));
  state.masks = state.masks.filter(x => x.id !== state.editingMaskId);
  saveState();
  nav('screen-imessage');
  switchImsgTab('profile');
  showSnackbar(T('deleted'), () => { state.masks.push(bk); saveState(); renderMaskList(); });
}
