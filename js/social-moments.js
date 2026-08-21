// ========== social-moments.js ==========
// Moments: render, like, comment, post, AI generation, auto-interaction

// ── Virtual image presets ──
function _makeVirtualImg(c1, c2) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + c1 + '"/>' +
    '<stop offset="1" stop-color="' + c2 + '"/>' +
    '</linearGradient></defs>' +
    '<rect fill="url(#g)" width="400" height="260" rx="0"/></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

var VIRTUAL_IMAGES = [
  { name: 'Sunset',   url: _makeVirtualImg('#ff6b6b', '#fca311') },
  { name: 'Ocean',    url: _makeVirtualImg('#4facfe', '#00f2fe') },
  { name: 'Forest',   url: _makeVirtualImg('#43e97b', '#38f9d7') },
  { name: 'Twilight', url: _makeVirtualImg('#a18cd1', '#fbc2eb') },
  { name: 'Night',    url: _makeVirtualImg('#0c3483', '#6b8cce') },
  { name: 'Dawn',     url: _makeVirtualImg('#fa709a', '#fee140') },
  { name: 'Storm',    url: _makeVirtualImg('#616161', '#9bc5c3') },
  { name: 'Aurora',   url: _makeVirtualImg('#667eea', '#764ba2') }
];


// ══════════════════════════════════════════════
//  ★ AI 生成角色 Moment（核心新增）
// ══════════════════════════════════════════════

var _momentGenLock = {};

async function generateAndPostCharMoment(charId) {
  if (_momentGenLock[charId]) return;
  _momentGenLock[charId] = true;

  try {
    var api = state.apis.find(function(a) { return a.id === state.activeApiId; });
    if (!api || !api.url || !api.model) {
      showToast('请先配置 API');
      return;
    }

    var ch = state.characters.find(function(c) { return c.id === charId; });
    if (!ch) { showToast('角色不存在'); return; }

    showToast(ch.name + ' 正在编写动态...');

    var cfg = getCharConfig(charId);
    var langMap = { 'zh-CN': '简体中文', 'zh-TW': '繁體中文', 'ko': '한국어', 'ja': '日本語', 'en': 'English' };
    var langName = langMap[cfg.chatLang || 'zh-CN'] || '简体中文';

    // 构建聊天上下文
    var recentMsgs = (state.chats[charId] || []).slice(-20);
    var chatContext = '';
    if (recentMsgs.length > 0) {
      chatContext = '\n\n最近的聊天记录：\n' + recentMsgs.map(function(m) {
        if (m.recalled) return '';
        var sender = m.role === 'user' ? (state.userProfile.name || 'User') : ch.name;
        var text = (m.content || '').slice(0, 100);
        if (m.type === 'sticker') text = '[表情包]';
        if (m.type === 'image') text = '[图片]';
        if (m.type === 'voice') text = '[语音]';
        return sender + ': ' + text;
      }).filter(Boolean).join('\n');
    }

    var sysPrompt = '你是「' + ch.name + '」。\n';
    if (ch.systemPrompt) {
      sysPrompt += '你的人设：' + ch.systemPrompt.slice(0, 600) + '\n';
    }
    sysPrompt += chatContext + '\n\n';
    sysPrompt += '请以「' + ch.name + '」的身份，写一条社交媒体动态（类似微信朋友圈）。\n\n';
    sysPrompt += '要求：\n';
    sysPrompt += '- 使用' + langName + '书写\n';
    sysPrompt += '- 保持角色性格，内容自然\n';
    sysPrompt += '- 正文不超过200字\n';
    sysPrompt += '- 不要使用话题标签或emoji\n';
    sysPrompt += '- 可以与近期聊天话题相关，也可以是日常分享\n\n';
    sysPrompt += '严格按以下格式回复：\n';
    sysPrompt += '【内容】\n(你的动态正文)\n\n';
    sysPrompt += '【虚拟图】\n(如果不需要配图写"无"；如果想配图，用一句话描述图片内容，不超过30字)\n';

    var reply = await sendChat(api, [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: '请现在发布你的动态。' }
    ]);

    // 解析回复
    var contentMatch = reply.match(/【内容】\s*([\s\S]*?)(?=【虚拟图】|$)/);
    var imageMatch = reply.match(/【虚拟图】\s*([\s\S]*?)$/);

    var momentContent = contentMatch ? contentMatch[1].trim() : reply.replace(/【[^】]+】/g, '').trim();
    var imageDesc = imageMatch ? imageMatch[1].trim() : '无';

    // 去除可能的引号包裹
    momentContent = momentContent.replace(/^["'"「」]|["'"「」]$/g, '');
    imageDesc = imageDesc.replace(/^["'"「」]|["'"「」]$/g, '');

    if (!momentContent) {
      momentContent = reply.replace(/【[\s\S]*?】/g, '').trim().slice(0, 200) || '...';
    }

    var hasVirtualImage = imageDesc && imageDesc !== '无' && imageDesc !== 'none' && imageDesc.length > 1;

    var newMoment = addMoment(
      charId,
      momentContent,
      hasVirtualImage ? 'virtual' : 'text',
      hasVirtualImage ? VIRTUAL_IMAGES[Math.floor(Math.random() * VIRTUAL_IMAGES.length)].url : null,
      hasVirtualImage ? imageDesc : ''
    );

    showToast(ch.name + ' 发布了一条动态');
    return newMoment;

  } catch (e) {
    console.error('[generateAndPostCharMoment]', e);
    showToast('动态生成失败');
  } finally {
    delete _momentGenLock[charId];
  }
}


// ══════════════════════════════════════════════
//  ★ 用户发布 Moment 后 → 角色自动点赞+评论
// ══════════════════════════════════════════════

var _autoInteractLock = {};

async function triggerAutoInteractions(momentId) {
  if (_autoInteractLock[momentId]) return;
  _autoInteractLock[momentId] = true;

  try {
    var api = state.apis.find(function(a) { return a.id === state.activeApiId; });
    if (!api || !api.url || !api.model) return;

    var moment = state.moments.find(function(x) { return x.id === momentId; });
    if (!moment) return;

    // 筛选已激活角色（有聊天记录的 + 前5个无记录的）
    var activeChars = state.characters.filter(function(c) {
      return state.chats[c.id] && state.chats[c.id].length > 0;
    });
    if (!activeChars.length) {
      activeChars = state.characters.slice(0, 5);
    }
    if (!activeChars.length) return;

    for (var i = 0; i < activeChars.length; i++) {
      var ch = activeChars[i];

      // 自动点赞
      if (!moment.likes) moment.likes = [];
      if (moment.likes.indexOf(ch.id) < 0) {
        moment.likes.push(ch.id);
      }

      // 生成评论
      try {
        var charCfg = getCharConfig(ch.id);
        var cLangMap = { 'zh-CN': '简体中文', 'zh-TW': '繁體中文', 'ko': '한국어', 'ja': '日本語', 'en': 'English' };
        var cLangName = cLangMap[charCfg.chatLang || 'zh-CN'] || '简体中文';

        var commentPrompt = '你是「' + ch.name + '」。\n';
        if (ch.systemPrompt) {
          commentPrompt += '你的人设：' + ch.systemPrompt.slice(0, 300) + '\n\n';
        }
        commentPrompt += '你的朋友刚在社交媒体上发了这条动态：\n"' + moment.content + '"\n\n';
        commentPrompt += '请写一条简短评论（1-2句话，不超过80字），使用' + cLangName + '。\n';
        commentPrompt += '保持角色性格。不要使用emoji。只输出评论内容，不要加任何标签或引号。';

        var commentReply = await sendChat(api, [
          { role: 'system', content: commentPrompt },
          { role: 'user', content: '请写你的评论。' }
        ]);

        var commentText = (commentReply || '').trim()
          .replace(/^["'"「」]|["'"「」]$/g, '')
          .replace(/^【[^】]*】\s*/g, '');

        if (commentText && commentText.length < 200) {
          if (!moment.comments) moment.comments = [];
          moment.comments.push({
            charId: ch.id,
            content: commentText,
            timestamp: Date.now() + (i * 1000)
          });
        }
      } catch (e) {
        console.warn('[autoComment] ' + ch.name + ' failed:', e.message);
      }

      // 每个角色处理完后保存并刷新
      saveState();
      if (state.imsgTab === 'moments') renderMoments();
    }

  } catch (e) {
    console.error('[triggerAutoInteractions]', e);
  } finally {
    delete _autoInteractLock[momentId];
  }
}


// ══════════════════════════════════════════════
//  ★ 虚拟图片点击切换
// ══════════════════════════════════════════════

function toggleVirtualReveal(mid) {
  var el = document.querySelector('.moment-virtual-img[data-mid="' + mid + '"]');
  if (el) el.classList.toggle('revealed');
}


// ══════════════════════════════════════════════
//  主渲染
// ══════════════════════════════════════════════

function renderMoments() {
  var momentsTab = document.getElementById('imsgTabMoments');
  if (momentsTab) {
    var hdr = momentsTab.querySelector('.social-tab-header');
    if (hdr) hdr.style.display = 'none';
  }

  var container = document.getElementById('momentsListBody');
  if (!container) return;

  if (!state.moments.length) {
    container.innerHTML =
      '<div class="moment-compose-bar" onclick="openNewMomentModal()">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>' +
        '<span>Share your first moment...</span>' +
      '</div>' +
      '<div class="social-empty">' +
        '<svg viewBox="0 0 48 48" style="width:48px;height:48px;stroke:#d1d1d6;fill:none;stroke-width:1.5;display:block;margin:0 auto 12px">' +
          '<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="8"/>' +
          '<path d="M24 6v4M24 38v4M6 24h4M38 24h4"/>' +
        '</svg>' +
        '<p style="color:#8e8e93;font-size:14px;text-align:center">No moments yet<br><span style="font-size:12px">Tap above to share</span></p>' +
      '</div>';
    return;
  }

  var sorted = state.moments.slice().sort(function(a, b) { return b.timestamp - a.timestamp; });

  var h = '<div class="moment-compose-bar" onclick="openNewMomentModal()">' +
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>' +
    '<span>What\'s on your mind...</span>' +
  '</div>';

  sorted.forEach(function(m) {
    var ch = state.characters.find(function(c) { return c.id === m.charId; });
    var isUser = !m.charId || m.charId === 'user';
    var name = isUser ? (state.userProfile.name || 'User') : (ch ? ch.name : 'System');

    var avHtml = isUser
      ? (state.userProfile.avatar
          ? '<img src="' + state.userProfile.avatar + '">'
          : '<svg viewBox="0 0 32 32" style="width:100%;height:100%"><circle cx="16" cy="12" r="5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10" stroke="#b0b0b0" stroke-width="1.5" fill="none"/></svg>')
      : (ch && ch.avatar
          ? '<img src="' + ch.avatar + '">'
          : '<svg viewBox="0 0 32 32" style="width:100%;height:100%"><circle cx="16" cy="12" r="5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10" stroke="#b0b0b0" stroke-width="1.5" fill="none"/></svg>');

    var liked = (m.likes || []).indexOf('user') >= 0;
    var likeCount  = (m.likes || []).length;
    var commentCount = (m.comments || []).length;

    var displayContent = m.content || '';
    var isLong = displayContent.length > 120;
    var shortContent = isLong ? displayContent.slice(0, 120) + '...' : displayContent;

    h += '<div class="moment-card" data-mid="' + m.id + '">';

    /* header */
    h += '<div class="moment-header">' +
      '<div class="moment-av"' + (ch ? ' onclick="openChat(\'' + ch.id + '\')"' : '') + '>' + avHtml + '</div>' +
      '<div class="moment-meta">' +
        '<div class="moment-name"' + (ch ? ' onclick="openChat(\'' + ch.id + '\')"' : '') + '>' + esc(name) + '</div>' +
        '<div class="moment-time">' + socialRelativeTime(m.timestamp) + '</div>' +
      '</div>' +
      '<button class="moment-delete-btn" onclick="deleteMoment(\'' + m.id + '\')" title="Delete">' +
        '<svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#8e8e93;fill:none;stroke-width:2"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg>' +
      '</button></div>';

    /* body */
    if (displayContent) {
      h += '<div class="moment-body">' +
        '<span class="moment-text" id="mt_' + m.id + '">' + esc(shortContent) + '</span>' +
        (isLong ? '<button class="moment-expand-btn" onclick="toggleMomentExpand(\'' + m.id + '\',this)">Expand</button>' : '') +
      '</div>';
    }

    /* ★ image: virtual with reveal, or normal */
    if (m.imageUrl) {
      if (m.virtualText) {
        h += '<div class="moment-image">' +
          '<div class="moment-virtual-img" data-mid="' + m.id + '" onclick="toggleVirtualReveal(\'' + m.id + '\')">' +
            '<img src="' + m.imageUrl + '">' +
            '<div class="virtual-text-overlay"><span>' + esc(m.virtualText) + '</span></div>' +
          '</div>' +
        '</div>';
      } else {
        h += '<div class="moment-image"><img src="' + m.imageUrl + '"></div>';
      }
    }

    /* actions bar */
    h += '<div class="moment-actions-bar">' +
      '<button class="moment-action-btn ' + (liked ? 'liked' : '') + '" onclick="toggleMomentLike(\'' + m.id + '\')">' +
        '<svg viewBox="0 0 20 20">' +
          '<path d="M10 17.5C10 17.5 3 12.5 3 8C3 5.5 5 3.5 7 3.5C8.5 3.5 9.5 4.5 10 5.5C10.5 4.5 11.5 3.5 13 3.5C15 3.5 17 5.5 17 8C17 12.5 10 17.5 10 17.5Z"/>' +
        '</svg>' +
        '<span>' + (likeCount || '') + '</span></button>' +
      '<button class="moment-action-btn" onclick="toggleMomentComment(\'' + m.id + '\')">' +
        '<svg viewBox="0 0 20 20">' +
          '<path d="M4 4.5h12c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-5l-4 3.5v-3.5H4c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2z"/>' +
        '</svg>' +
        '<span>' + (commentCount || '') + '</span></button>' +
    '</div>';

    /* comments */
    h += buildMomentComments(m);

    h += '</div>';
  });

  container.innerHTML = h;
}


// ── Comments ──
function buildMomentComments(m) {
  var comments = m.comments || [];
  var h = '<div class="moment-comments" id="mc_' + m.id + '" style="display:' + (comments.length ? 'block' : 'none') + '">';
  comments.forEach(function(c) {
    var cch = state.characters.find(function(x) { return x.id === c.charId; });
    var cName = c.charId === 'user' ? (state.userProfile.name || 'User') : (cch ? cch.name : 'Anonymous');
    h += '<div class="moment-comment-item">' +
      '<span class="mci-name"' + (cch ? ' onclick="openChat(\'' + cch.id + '\')"' : '') + '>' + esc(cName) + '</span>' +
      '<span class="mci-text">' + esc(c.content) + '</span></div>';
  });
  h += '</div>' +
    '<div class="moment-comment-input" id="mci_' + m.id + '" style="display:none">' +
    '<input type="text" placeholder="Write a comment..." id="mcinput_' + m.id + '" onkeydown="if(event.key===\'Enter\')sendMomentComment(\'' + m.id + '\')">' +
    '<button onclick="sendMomentComment(\'' + m.id + '\')">' +
    '<svg viewBox="0 0 16 16" style="width:14px;height:14px"><path d="M3 13l10-5L3 3v4l6 1-6 1z" fill="#1d1d1f" stroke="none"/></svg></button></div>';
  return h;
}


// ── Interactions ──
function toggleMomentExpand(mid, btn) {
  var m = state.moments.find(function(x) { return x.id === mid; });
  if (!m) return;
  var el = document.getElementById('mt_' + mid);
  if (btn.textContent === 'Expand') {
    el.textContent = m.content;
    btn.textContent = 'Collapse';
  } else {
    el.textContent = m.content.slice(0, 120) + '...';
    btn.textContent = 'Expand';
  }
}

function toggleMomentLike(mid) {
  var m = state.moments.find(function(x) { return x.id === mid; });
  if (!m) return;
  if (!m.likes) m.likes = [];
  var idx = m.likes.indexOf('user');
  if (idx >= 0) m.likes.splice(idx, 1);
  else m.likes.push('user');
  saveState();
  renderMoments();
}

function toggleMomentComment(mid) {
  var el = document.getElementById('mci_' + mid);
  var cmt = document.getElementById('mc_' + mid);
  if (!el) return;
  var showing = el.style.display !== 'none';
  el.style.display = showing ? 'none' : 'flex';
  if (!showing) {
    cmt.style.display = 'block';
    var inp = document.getElementById('mcinput_' + mid);
    if (inp) inp.focus();
  }
}

function sendMomentComment(mid) {
  var m = state.moments.find(function(x) { return x.id === mid; });
  if (!m) return;
  var inp = document.getElementById('mcinput_' + mid);
  var text = inp ? inp.value.trim() : '';
  if (!text) return;
  if (!m.comments) m.comments = [];
  m.comments.push({ charId: 'user', content: text, timestamp: Date.now() });
  saveState();
  renderMoments();
}

function deleteMoment(mid) {
  if (!confirm('Delete this moment?')) return;
  state.moments = state.moments.filter(function(x) { return x.id !== mid; });
  saveState();
  renderMoments();
  showToast('Deleted');
}


// ══════════════════════════════════════════════
//  发布 moment（用户手动，含虚拟图文字输入）
// ══════════════════════════════════════════════

function openNewMomentModal() {
  tmp.momentImageType = 'text';
  tmp.momentImageData = null;
  tmp.momentVirtualText = '';

  var modal = document.getElementById('newMomentModal');
  if (!modal) return;

  var body = modal.querySelector('.social-modal-body');
  if (body) {
    body.innerHTML =
      '<textarea id="newMomentContent" placeholder="What\'s on your mind..."></textarea>' +
      '<div class="moment-type-tabs">' +
        '<button class="moment-type-tab active" onclick="switchMomentType(\'text\',this)">' +
          '<svg viewBox="0 0 18 18" style="width:14px;height:14px"><path d="M3 3h12M3 7h8M3 11h10M3 15h6"/></svg> Text</button>' +
        '<button class="moment-type-tab" onclick="switchMomentType(\'image\',this)">' +
          '<svg viewBox="0 0 18 18" style="width:14px;height:14px"><rect x="2" y="2" width="14" height="14" rx="2"/><circle cx="6.5" cy="6.5" r="1.5"/><path d="M16 12l-4-4-7 7"/></svg> Photo</button>' +
        '<button class="moment-type-tab" onclick="switchMomentType(\'virtual\',this)">' +
          '<svg viewBox="0 0 18 18" style="width:14px;height:14px"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M2 9h14"/><path d="M9 2v14"/></svg> Virtual</button>' +
      '</div>' +
      '<div id="momentImageArea"></div>';
  }

  modal.classList.add('show');
}

function switchMomentType(type, btn) {
  tmp.momentImageType = type;
  tmp.momentImageData = null;
  tmp.momentVirtualText = '';

  document.querySelectorAll('.moment-type-tab').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');

  var area = document.getElementById('momentImageArea');
  if (!area) return;

  if (type === 'text') {
    area.innerHTML = '';
    return;
  }

  if (type === 'image') {
    area.innerHTML =
      '<div class="moment-upload-area" id="momentUploadArea" onclick="document.getElementById(\'momentImageInput\').click()">' +
        '<svg viewBox="0 0 32 32" style="width:36px;height:36px"><rect x="4" y="4" width="24" height="24" rx="4"/><circle cx="11" cy="11" r="2.5"/><path d="M28 20l-7-7-13 13"/></svg>' +
        '<p>Tap to upload photo</p>' +
      '</div>' +
      '<div class="moment-preview" id="momentImagePreview" style="display:none">' +
        '<img id="momentPreviewImg">' +
        '<button class="moment-preview-clear" onclick="clearMomentImage()">' +
          '<svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg></button>' +
      '</div>' +
      '<input type="file" id="momentImageInput" accept="image/*" onchange="handleMomentImage(this)" style="display:none">';
    return;
  }

  if (type === 'virtual') {
    var gh = '<div class="moment-virtual-text-wrap">' +
      '<input type="text" id="momentVirtualText" placeholder="点击图片后显示的文字..." maxlength="60">' +
    '</div>';
    gh += '<div class="virtual-image-grid">';
    VIRTUAL_IMAGES.forEach(function(vi, i) {
      gh += '<div class="virtual-image-item" onclick="selectVirtualImage(' + i + ')" data-vi="' + i + '">' +
        '<img src="' + vi.url + '">' +
        '<span>' + vi.name + '</span></div>';
    });
    gh += '</div>';
    area.innerHTML = gh;
  }
}

function handleMomentImage(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    tmp.momentImageData = e.target.result;
    var preview = document.getElementById('momentImagePreview');
    var upload  = document.getElementById('momentUploadArea');
    if (preview) {
      document.getElementById('momentPreviewImg').src = e.target.result;
      preview.style.display = 'block';
    }
    if (upload) upload.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function selectVirtualImage(index) {
  tmp.momentImageData = VIRTUAL_IMAGES[index].url;
  document.querySelectorAll('.virtual-image-item').forEach(function(el) {
    el.classList.remove('selected');
  });
  var items = document.querySelectorAll('.virtual-image-item');
  if (items[index]) items[index].classList.add('selected');
}

function clearMomentImage() {
  tmp.momentImageData = null;
  var preview = document.getElementById('momentImagePreview');
  var upload  = document.getElementById('momentUploadArea');
  if (preview) preview.style.display = 'none';
  if (upload)  upload.style.display = 'flex';
  var inp = document.getElementById('momentImageInput');
  if (inp) inp.value = '';
}

function confirmNewMoment() {
  var content  = (document.getElementById('newMomentContent').value || '').trim();
  var hasImage = !!tmp.momentImageData;

  // ★ 获取虚拟图文字
  var virtualText = '';
  if (tmp.momentImageType === 'virtual') {
    var vtInput = document.getElementById('momentVirtualText');
    virtualText = vtInput ? vtInput.value.trim() : '';
  }

  if (!content && !hasImage) {
    showToast('Please enter text or add an image');
    return;
  }

  var newMoment = addMoment(
    'user',
    content,
    tmp.momentImageType || 'text',
    tmp.momentImageData || null,
    virtualText
  );

  closeModal('newMomentModal');
  showToast('Posted');

  // ★ 触发角色自动互动（异步，不阻塞）
  if (newMoment && newMoment.id) {
    setTimeout(function() {
      triggerAutoInteractions(newMoment.id);
    }, 500);
  }
}

function addMoment(charId, content, type, imageUrl, virtualText) {
  var m = {
    id: uid(),
    charId: charId || 'user',
    content: content || '',
    type: type || 'text',
    imageUrl: imageUrl || null,
    virtualText: virtualText || '',
    timestamp: Date.now(),
    likes: [],
    comments: []
  };
  state.moments.push(m);
  saveState();
  if (state.imsgTab === 'moments') renderMoments();
  return m;
}


// ── 全局导出 ──
window.renderMoments             = renderMoments;
window.toggleMomentLike          = toggleMomentLike;
window.toggleMomentComment       = toggleMomentComment;
window.sendMomentComment         = sendMomentComment;
window.deleteMoment              = deleteMoment;
window.toggleMomentExpand        = toggleMomentExpand;
window.openNewMomentModal        = openNewMomentModal;
window.switchMomentType          = switchMomentType;
window.handleMomentImage         = handleMomentImage;
window.selectVirtualImage        = selectVirtualImage;
window.clearMomentImage          = clearMomentImage;
window.confirmNewMoment          = confirmNewMoment;
window.addMoment                 = addMoment;
window.generateAndPostCharMoment = generateAndPostCharMoment;
window.triggerAutoInteractions   = triggerAutoInteractions;
window.toggleVirtualReveal       = toggleVirtualReveal;
