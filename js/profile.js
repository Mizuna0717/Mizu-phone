// ========== 09-profile.js ==========
// 依赖：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js

// =============================================
//  PROFILE INFO
// =============================================
function renderProfileInfo() {
  var u = state.userProfile;
  var pv = document.getElementById('userAvatarPv');
  var ph = document.getElementById('userAvatarPh');
  if (u.avatar) {
    pv.src = u.avatar;
    pv.style.display = 'block';
    ph.style.display = 'none';
  } else {
    pv.style.display = 'none';
    ph.style.display = 'block';
  }
  document.getElementById('userNameDisplay').textContent = u.name || 'User';
  renderAcctInfoCard();  renderProfileHero();
}

function renderAcctInfoCard() {
  var card = document.getElementById('acctInfoCard');
  if (!card) return;
  var acct = getCurrentAccount();
  var total = getAllAccounts().length;
  if (!acct) { card.innerHTML = ''; return; }

  var charCount = Array.isArray(state.characters) ? state.characters.length : 0;
  var momentCount = Array.isArray(state.moments) ? state.moments.length : 0;
  var chatCount = state.chats ? Object.keys(state.chats).length : 0;

  card.innerHTML =
    '<div class="acct-info-row" onclick="openAccountDrawer()" style="cursor:pointer">' +
      '<div class="acct-info-left">' +
        '<svg viewBox="0 0 20 20" class="acct-info-icon"><circle cx="10" cy="8" r="4"/><path d="M3 19c0-4 3-7 7-7s7 3 7 7"/></svg>' +
        '<div>' +
          '<div class="acct-info-label">当前账号</div>' +
          '<div class="acct-info-name">' + esc(acct.name) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="acct-info-badge">' + total + ' 个账号</div>' +
    '</div>' +
    '<div class="acct-stats-row">' +
      '<div class="acct-stat"><span class="acct-stat-num">' + charCount + '</span><span class="acct-stat-label">角色</span></div>' +
      '<div class="acct-stat"><span class="acct-stat-num">' + chatCount + '</span><span class="acct-stat-label">对话</span></div>' +
      '<div class="acct-stat"><span class="acct-stat-num">' + momentCount + '</span><span class="acct-stat-label">动态</span></div>' +
    '</div>';
}

/** 同步 userProfile → accountStore 元数据 */
function syncProfileToAccountMeta() {
  var acct = getCurrentAccount();
  if (acct) {
    acct.name = state.userProfile.name;
    acct.avatar = state.userProfile.avatar;
    _saveAccountMeta();
  }
}

function previewUserAvatar(inp) {
  if (inp.files && inp.files[0]) {
    var r = new FileReader();
    r.onload = function (e) {
      state.userProfile.avatar = e.target.result;
      syncProfileToAccountMeta();
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
  setTimeout(function () { document.getElementById('nameModalInput').focus(); }, 100);
}

function confirmEditUserName() {
  var v = document.getElementById('nameModalInput').value.trim();
  if (v) {
    state.userProfile.name = v;
    syncProfileToAccountMeta();
    saveState();
    renderProfileInfo();
    try { renderHomeProfile(); } catch (e) {}
    var el = document.getElementById('homeUserName');
    if (el) el.textContent = v;
    showToast(T('charSaved'));
  }
  closeModal('nameModal');
  window._nameTarget = null;
}

function confirmEditMsg() {
  var newText = document.getElementById('editMsgInput').value.trim();
  if (!newText) { closeModal('editMsgModal'); return; }

  var segMatch = bubbleState.editingMsgId ? bubbleState.editingMsgId.match(/^(.+)__seg(\d+)$/) : null;
  if (segMatch) {
    var realId = segMatch[1];
    var segIdx = parseInt(segMatch[2]);
    var msg = (state.chats[state.currentCharId] || []).find(function (m) { return m.id === realId; });
    if (msg) {
      var segs = parseReplySegments(msg.content, state.stickers);
      segs[segIdx].content = newText;
      msg.content = segs.map(function (s) { return s.type === 'text' ? s.content : msg.content; }).join('\n');
      msg.edited = true;
    }
  } else {
    var msg2 = (state.chats[state.currentCharId] || []).find(function (m) { return m.id === bubbleState.editingMsgId; });
    if (msg2) { msg2.content = newText; msg2.edited = true; }
  }

  bubbleState.editingMsgId = null;
  saveState();
  closeModal('editMsgModal');
  renderChat();
  showToast(T('edited'));
}

// =============================================
//  STICKERS
// =============================================
function renderProfileStickers() {
  document.getElementById('profileStickerCount').textContent = state.stickers.length;
  var c = document.getElementById('profileStickerPreview');
  if (!state.stickers.length) { c.innerHTML = ''; return; }
  c.innerHTML = '<div class="sticker-preview-grid">' + state.stickers.map(function (s) {
    return '<div class="sp-item"><img src="' + s.dataUrl + '" title="' + esc(s.name) + '"><button class="sp-del" onclick="event.stopPropagation();delStickerProfile(\'' + s.id + '\')"><svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6"/></svg></button></div>';
  }).join('') + '</div>';
}

function delStickerProfile(sid) {
  state.stickers = state.stickers.filter(function (s) { return s.id !== sid; });
  saveState();
  renderProfileStickers();
}

function importStickersFromFile(inp) {
  if (!inp.files) return;
  var cnt = 0;
  var total = inp.files.length;
  Array.from(inp.files).forEach(function (f) {
    var r = new FileReader();
    r.onload = function (e) {
      state.stickers.push({ id: uid(), name: f.name.replace(/\.[^.]+$/, ''), dataUrl: e.target.result });
      cnt++;
      if (cnt === total) {
        saveState();
        renderProfileStickers();
        try { renderStickerGrid(); } catch (err) {}
        showToast(cnt + ' ' + T('imported'));
      }
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
  var text = document.getElementById('urlImportText').value.trim();
  if (!text) {
    alert('请输入 URL');
    return;
  }

  // ★ 关键修复：从文本里「提取」URL，不要求行首
  var urlRegex = /https?:\/\/[^\s<>"']+/gi;
  var matches = text.match(urlRegex) || [];
  var urls = matches
    .map(function(u) { return u.replace(/[.,;:!?）】]+$/, ''); })  // 去掉尾部标点
    .filter(function(u, i, arr) { return arr.indexOf(u) === i; }); // 去重

  if (!urls.length) {
    alert('没有找到有效的 URL\n\n请确保每行都包含 http:// 或 https:// 开头的链接\n' +
          '示例：\nhttps://example.com/1.png\nhttps://example.com/2.png');
    return;
  }

  var btn = document.getElementById('urlImportBtn');
  var prog = document.getElementById('urlProgress');
  var bar = document.getElementById('urlProgressBar');
  var st = document.getElementById('urlStatusText');

  btn.textContent = '导入中...';
  btn.disabled = true;
  prog.style.display = 'block';
  bar.style.width = '0%';
  st.style.display = 'block';

  var ok = 0, fail = 0;
  var failReasons = [];
  var seen = new Set(state.stickers.map(function(s){ return s.dataUrl; }));

  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];

    if (seen.has(url)) {
      fail++;
      failReasons.push(url + ' → 重复');
      continue;
    }

    // 只接受图片后缀
    var isImg = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|#|$)/i.test(url);
    if (!isImg) {
      fail++;
      failReasons.push(url + ' → 不是图片链接（需 .jpg/.png 等结尾）');
      continue;
    }

    // ★ 关键修复：直接存 URL，不 fetch
    state.stickers.push({
      id: uid(),
      name: url.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '') || 'sticker',
      dataUrl: url,
      _isUrl: true
    });
    seen.add(url);
    ok++;

    bar.style.width = Math.round(((i + 1) / urls.length) * 100) + '%';
    st.textContent = ok + ' 已导入' + (fail ? ' · ' + fail + ' 失败' : '');
    await new Promise(function(r){ setTimeout(r, 0); });
  }

  saveState();
  if (typeof renderProfileStickers === 'function') renderProfileStickers();
  if (typeof renderStickerGrid === 'function') renderStickerGrid();

  btn.textContent = '导入';
  btn.disabled = false;

  if (fail > 0) {
    console.warn('%c导入完成', 'font-weight:bold;');
    console.log('成功:', ok, '| 失败:', fail);
    failReasons.slice(0, 20).forEach(function(r){ console.log('  ❌', r); });
    st.innerHTML = ok + ' 成功 · <span style="color:#ff3b30">' + fail +
                   ' 失败</span>（详情看 F12 Console）';
  } else {
    st.textContent = ok + ' 已导入';
  }

  setTimeout(function () { closeModal('urlImportModal'); }, 1200);
}

// =============================================
//  MASKS
// =============================================
function renderMaskList() {
  var b = document.getElementById('maskListBody');
  if (!b) return;
  if (!Array.isArray(state.masks)) state.masks = [];
  if (!state.masks.length) {
    b.innerHTML = '<div class="mask-empty"><svg viewBox="0 0 44 44"><rect x="4" y="4" width="36" height="36" rx="8"/></svg><p>' + T('noMasks') + '<br>' + T('noMasksSub') + '</p></div>';
    return;
  }
  b.innerHTML = state.masks.map(function (m) {
    var bc = (m.charIds || []).map(function (cid) { return state.characters.find(function (c) { return c.id === cid; }); }).filter(Boolean);
    return '<div class="mask-card" onclick="editMask(\'' + m.id + '\')"><div class="mc-avatar">' + (m.avatar ? '<img src="' + m.avatar + '">' : '<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="6"/></svg>') + '</div><div class="mc-info"><div class="mc-name">' + esc(m.name) + '</div><div class="mc-desc">' + esc((m.persona || '').slice(0, 40)) + '</div>' + (bc.length ? '<div class="mc-chars">' + bc.slice(0, 3).map(function (c) { return '<span class="mc-char-tag">' + esc(c.name) + '</span>'; }).join('') + '</div>' : '') + '</div><span class="mc-arrow">›</span></div>';
  }).join('');
}

function editMask(id) {
  state.editingMaskId = id;
  var m = id ? state.masks.find(function (x) { return x.id === id; }) : null;
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
  previewAvatarFile(inp, function (d) { tmp.maskAvatar = d; setAvatarPreview('maskAvatarPv', 'maskAvatarPh', d); });
}

function renderMaskCharList(sel) {
  var c = document.getElementById('maskCharList');
  if (!state.characters.length) {
    c.innerHTML = '<div class="mask-bind-empty"><svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg><span>' + T('noCharsAvailable') + '</span></div>';
    return;
  }
  var ob = {};
  state.masks.forEach(function (m) {
    if (m.id === state.editingMaskId) return;
    (m.charIds || []).forEach(function (cid) { ob[cid] = m.name; });
  });
  c.innerHTML = state.characters.map(function (ch) {
    var bd = ob[ch.id];
    var ck = sel.includes(ch.id);
    var dis = !!bd && !ck;
    return '<div class="mask-bind-item' + (dis ? ' mask-bind-disabled' : '') + '" onclick="' + (dis ? '' : 'toggleMaskBind(this)') + '"><div class="mask-bind-avatar">' + charAvatarImg(ch) + '</div><div class="mask-bind-info"><div class="mask-bind-name">' + esc(ch.name) + '</div>' + (bd ? '<div class="mask-bind-status"><svg viewBox="0 0 12 12"><path d="M6 1v4l2.5 1.5"/><circle cx="6" cy="6" r="5"/></svg><span>' + T('maskBound') + ': ' + esc(bd) + '</span></div>' : '') + '</div><div class="mask-bind-check' + (ck ? ' checked' : '') + '" data-charid="' + ch.id + '"><svg viewBox="0 0 14 14"><path d="M2 7l4 4 6-7"/></svg></div></div>';
  }).join('');
}

function toggleMaskBind(el) {
  var check = el.querySelector('.mask-bind-check');
  if (check) check.classList.toggle('checked');
}

function saveMask() {
  var name = document.getElementById('maskName').value.trim();
  if (!name) { showToast(T('enterName')); return; }
  var persona = document.getElementById('maskPersonaArea').value.trim();
  var av = tmp.maskAvatar;
  var charIds = [];
  document.querySelectorAll('#maskCharList .mask-bind-check.checked').forEach(function (cb) { charIds.push(cb.dataset.charid); });
  state.masks.forEach(function (m) {
    if (m.id === state.editingMaskId) return;
    m.charIds = (m.charIds || []).filter(function (cid) { return !charIds.includes(cid); });
  });
  if (state.editingMaskId) {
    var m = state.masks.find(function (x) { return x.id === state.editingMaskId; });
    if (m) Object.assign(m, { name: name, persona: persona, avatar: av, charIds: charIds });
  } else {
    state.masks.push({ id: uid(), name: name, persona: persona, avatar: av, charIds: charIds });
  }

  saveState();
  showToast(T('maskSaved'));

  state.imsgTab = 'profile';
  nav('screen-imessage');

  setTimeout(function() {
    try { renderMaskList(); } catch(e) {}
  }, 100);
}


function deleteMask() {
  if (!state.editingMaskId) return;
  var bk = JSON.parse(JSON.stringify(state.masks.find(function (x) { return x.id === state.editingMaskId; })));
  state.masks = state.masks.filter(function (x) { return x.id !== state.editingMaskId; });
  saveState();
  nav('screen-imessage');
  switchImsgTab('profile');
  showSnackbar(T('deleted'), function () { state.masks.push(bk); saveState(); renderMaskList(); });
}

// =============================================
//  多账号 — 创建模态框（★ 适配新 HTML 类名）
// =============================================
function openAccountCreateModal() {
  tmp.acctAvatar = null;
  var pv = document.getElementById('acctAvatarPv');
  var ph = document.getElementById('acctAvatarPh');
  if (pv) { pv.style.display = 'none'; pv.removeAttribute('src'); }
  if (ph) ph.style.display = 'block';
  var inp = document.getElementById('acctNameInput');
  if (inp) inp.value = '';
  document.getElementById('accountCreateModal').classList.add('show');
  setTimeout(function () { if (inp) inp.focus(); }, 200);
}

function previewAccountAvatar(fileInput) {
  if (!fileInput.files || !fileInput.files[0]) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    tmp.acctAvatar = e.target.result;
    var pv = document.getElementById('acctAvatarPv');
    var ph = document.getElementById('acctAvatarPh');
    if (pv) { pv.src = e.target.result; pv.style.display = 'block'; }
    if (ph) ph.style.display = 'none';
  };
  reader.readAsDataURL(fileInput.files[0]);
  fileInput.value = '';
}

function confirmCreateAccount() {
  var nameInput = document.getElementById('acctNameInput');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) { showToast('请输入账号名称'); return; }

  var avatar = tmp.acctAvatar || null;

  saveState();

  var acct = createAccount(name, avatar);

  closeModal('accountCreateModal');

  switchAccount(acct.id);
  reloadUI(false);
  switchImsgTab('profile');
  showToast('已创建并切换: ' + name);
}

// =============================================
//  多账号 — 抽屉切换（★ 适配新 HTML 结构）
// =============================================
function openAccountDrawer() {
  renderAccountDrawerList();
  var mask = document.getElementById('acctDrawerMask');
  if (!mask) return;
  mask.classList.add('show');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      mask.classList.add('visible');
    });
  });
}

function closeAccountDrawer() {
  var mask = document.getElementById('acctDrawerMask');
  if (!mask) return;
  mask.classList.remove('visible');
  setTimeout(function () { mask.classList.remove('show'); }, 320);
}

/* ★ 重写：生成美化版账号列表 */
function renderAccountDrawerList() {
  var accounts = getAllAccounts();
  var currentId = accountStore.currentAccountId;
  var container = document.getElementById('acctDrawerList');
  if (!container) return;

  container.innerHTML = accounts.map(function (a) {
    var isCurrent = (a.id === currentId);

    var avatarInner = a.avatar
      ? '<img src="' + a.avatar + '" alt="">'
      : '<svg viewBox="0 0 32 32"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>';

    /* ★ 右侧：当前账号显示对勾，其他账号显示删除按钮 */
    var rightHtml = '';
    if (isCurrent) {
      rightHtml =
        '<div class="acct-item-check-wrap">' +
          '<svg class="acct-item-check" viewBox="0 0 16 16"><path d="M3 8l4 4 6-7"/></svg>' +
        '</div>';
    } else if (accounts.length > 1) {
      rightHtml =
        '<button class="acct-item-del" data-acctid="' + a.id + '" onclick="event.stopPropagation();handleDeleteAccount(\'' + a.id + '\')" title="删除账号">' +
          '<svg viewBox="0 0 16 16">' +
            '<path d="M4.5 4.5h7l-.6 7.5a1 1 0 01-1 .9H6.1a1 1 0 01-1-.9L4.5 4.5z"/>' +
            '<path d="M6.5 2.5h3"/>' +
            '<path d="M3 4.5h10"/>' +
          '</svg>' +
        '</button>';
    }

    return '' +
      '<div class="acct-item' + (isCurrent ? ' active' : '') + '" onclick="performAccountSwitch(\'' + a.id + '\')">' +
        '<div class="acct-item-avatar">' + avatarInner + '</div>' +
        '<div class="acct-item-info">' +
          '<div class="acct-item-name">' + esc(a.name) + '</div>' +
          (isCurrent ? '<div class="acct-item-label">当前使用中</div>' : '') +
        '</div>' +
        rightHtml +
      '</div>';
  }).join('');
}

function performAccountSwitch(id) {
  if (id === accountStore.currentAccountId) {
    closeAccountDrawer();
    return;
  }

  console.log('[UI] 切换前 | 账号:', accountStore.currentAccountId, '| 角色:', state.characters.length, '| 面具:', state.masks.length);

  saveState();

  var ok = switchAccount(id);
  if (!ok) { showToast('切换失败'); return; }

  console.log('[UI] 切换后 | 账号:', accountStore.currentAccountId, '| 角色:', state.characters.length, '| 面具:', state.masks.length);

  closeAccountDrawer();

  reloadUI(false);

  switchImsgTab('profile', true);

  var acct = getCurrentAccount();
  showToast('已切换: ' + (acct ? acct.name : ''));
}

function handleDeleteAccount(id) {
  var all = getAllAccounts();
  var target = null;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) { target = all[i]; break; }
  }
  if (!target) return;
  if (!confirm('确认删除账号 "' + target.name + '"？\n此操作不可撤销，该账号的所有数据将被清除。')) return;

  var wasName = target.name;
  deleteAccount(id);

  renderAccountDrawerList();
  reloadUI(false);
  switchImsgTab('profile');
  showToast('已删除: ' + wasName);
}

// =============================================
//  Profile Hero — 背景 + 身份文字
// =============================================

function renderProfileHero() {
  // 背景
  var hero = document.getElementById('profileHero');
  if (hero) {
    var bg = state.userProfile.heroBg;
    if (bg) {
      hero.style.backgroundImage = 'url("' + bg + '")';
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
      hero.style.backgroundColor = '';
    } else {
      hero.style.backgroundImage = '';
      hero.style.backgroundSize = '';
      hero.style.backgroundPosition = '';
      hero.style.backgroundColor = '#1d1d1f';
    }
  }

  // 身份文字
  var sub = document.getElementById('profileSubText');
  if (sub) {
    sub.textContent = state.userProfile.subText || '你在对话中的身份';
  }
}

function startEditProfileSub() {
  var cur = state.userProfile.subText || '你在对话中的身份';
  _showTextInputModal(
    '编辑身份文字',
    '例如：你在对话中的身份',
    cur,
    function (v) {
      if (v === null || v === undefined) return;
      state.userProfile.subText = v;
      saveState();
      renderProfileHero();
      showToast('已保存');
    }
  );
}

function editProfileHeroBg(event) {
  // 只处理点击 hero 空白区域（自己），子元素已被 stopPropagation 拦下
  if (event && event.target !== event.currentTarget) return;

  _showBlogMediaPicker(
    // 本地文件
    function () {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = function () {
        if (!inp.files || !inp.files[0]) return;
        var r = new FileReader();
        r.onload = function (e) {
          state.userProfile.heroBg = e.target.result;
          saveState();
          renderProfileHero();
          showToast('背景已更新');
        };
        r.readAsDataURL(inp.files[0]);
      };
      inp.click();
    },
    // URL
    function (url) {
      state.userProfile.heroBg = url;
      saveState();
      renderProfileHero();
      showToast('背景已更新');
    }
  );
}