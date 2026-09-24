// ========== archive.js ==========
// 依赖：state.js, ui.js
// ★ 本文件只负责 本地 导入/导出/清除
// ★ 云端功能全部由 cloud.js 负责

// ========== 工具 ==========
function _archiveTimestamp() {
  var d = new Date();
  var pad = function(n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '_' + pad(d.getHours()) + '-' + pad(d.getMinutes()) + '-' + pad(d.getSeconds());
}

function _downloadJSON(data, filename) {
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ★ 统一维护导出/导入的 key 列表 ★
// ★ 统一维护导出/导入的 key 列表 ★
// 直接从 SAVE_KEYS 派生，保证永远一致
var _ALL_STATE_KEYS = (typeof SAVE_KEYS !== 'undefined' && Array.isArray(SAVE_KEYS))
  ? SAVE_KEYS.slice()
  : [
      'apis','activeApiId','characters','chats','worldbooks','stickers',
      'unread','drawerFilter','drawerSort','lang','userProfile','masks',
      'memories','replyPrompt','charConfig','phoneData','bookmarks','mailData',
      'calendarData','groups','moments','imsgTab','messageChats','callHistory',
      'socialData','walletData','meetings','npcs','allowQuote',
      'systemPromptIM','systemPromptMeeting','theme','imPromptMode',
      'meetingPromptMode','wikiSchedule','together','home','settings',
      'notesData','musicData','travelData','shoppingData'
    ];

function _reloadAllUI() {
  try { applyLang(); } catch(e) {}
  try { renderCharList(); } catch(e) {}
  try { renderGroups(); } catch(e) {}
  try { renderMoments(); } catch(e) {}
  try { renderWbList(); } catch(e) {}
  try { renderMemoryList(); } catch(e) {}
  try { renderMeetingList(); } catch(e) {}
  try { renderMaskList(); } catch(e) {}
  try { renderProfileInfo(); } catch(e) {}
  try { renderProfileStickers(); } catch(e) {}
  try { renderSettings(); } catch(e) {}
  try { updateHomeBadge(); } catch(e) {}
  try { renderHomeProfile(); } catch(e) {}
  try { switchImsgTab(state.imsgTab || 'messages'); } catch(e) {}
}

function _formatBytes(bytes) {
  if (!bytes || bytes < 1) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function _shortTime(iso) {
  if (!iso) return '暂无';
  var d = new Date(iso);
  if (isNaN(d)) return iso;
  var pad = function(n) { return String(n).padStart(2,'0'); };
  return pad(d.getMonth()+1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// ========== 导出/导入/清除 ==========
function exportAllData() {
  var data = {};
  _ALL_STATE_KEYS.forEach(function(k) { data[k] = state[k]; });
  data._exportType = 'full'; data._exportTime = new Date().toISOString(); data._version = 1;
  try { _downloadJSON(data, 'mizu_backup_' + _archiveTimestamp() + '.json'); showToast('导出成功'); }
  catch(e) { showErrorModal('导出失败：' + e.message); }
}

function exportCharsOnly() {
  var data = { characters: state.characters, chats: state.chats, unread: state.unread, _exportType:'chars', _exportTime: new Date().toISOString(), _version:1 };
  try { _downloadJSON(data, 'mizu_chars_backup_' + _archiveTimestamp() + '.json'); showToast('导出成功'); }
  catch(e) { showErrorModal('导出失败：' + e.message); }
}

function importData() {
  var input = document.createElement('input');
  input.type = 'file'; input.accept = '.json'; input.style.display = 'none';
  input.addEventListener('change', function(e) {
    var file = e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var parsed;
      try { parsed = JSON.parse(ev.target.result); } catch(err) { showErrorModal('文件格式无效'); return; }
      if (!parsed || typeof parsed !== 'object') { showErrorModal('数据结构不正确'); return; }
      if (!parsed.characters && !parsed.apis && !parsed.chats) { showErrorModal('未找到可识别的备份数据'); return; }
      _showArchiveConfirm('确认导入', '导入将覆盖当前所有数据，是否继续？', function() {
        _applyImportData(parsed); saveState(); _reloadAllUI(); showToast('导入成功');
      });
    };
    reader.onerror = function() { showErrorModal('文件读取失败'); };
    reader.readAsText(file);
  });
  document.body.appendChild(input); input.click(); document.body.removeChild(input);
}

function _applyImportData(data) {
  _ALL_STATE_KEYS.forEach(function(k) { if (data[k] !== undefined) state[k] = data[k]; });
  if (!Array.isArray(state.characters)) state.characters = [];
  if (!state.chats || typeof state.chats !== 'object' || Array.isArray(state.chats)) state.chats = {};
  if (!state.unread || typeof state.unread !== 'object') state.unread = {};
  if (!state.phoneData || typeof state.phoneData !== 'object') state.phoneData = {};
  if (!state.userProfile || typeof state.userProfile !== 'object') state.userProfile = { name:'User', avatar:null };
  if (!Array.isArray(state.masks)) state.masks = [];
  if (!Array.isArray(state.memories)) state.memories = [];
  if (!Array.isArray(state.meetings)) state.meetings = [];
  if (!Array.isArray(state.bookmarks)) state.bookmarks = [];
  if (!state.charConfig || typeof state.charConfig !== 'object') state.charConfig = {};
  if (!Array.isArray(state.groups)) state.groups = [];
  if (!Array.isArray(state.moments)) state.moments = [];
  if (!Array.isArray(state.worldbooks)) state.worldbooks = [];
  if (!Array.isArray(state.stickers)) state.stickers = [];
  if (!Array.isArray(state.apis)) state.apis = [];
}

function clearAllData() {
  _showArchiveConfirm('确认清除', '确定要清除所有数据吗？此操作无法撤销！', function() {
    resetState(); localStorage.removeItem('aiphone8'); saveState(); _reloadAllUI(); showToast('已清空全部数据');
  });
}

function _showArchiveConfirm(title, message, onConfirm) {
  var existing = document.getElementById('archiveConfirmModal');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'archiveConfirmModal';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:9999;display:flex;align-items:center;justify-content:center;';
  var dialog = document.createElement('div');
  dialog.style.cssText = 'background:#fff;border-radius:16px;padding:24px;max-width:300px;width:85%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.15);';
  dialog.innerHTML = '<div style="font-size:17px;font-weight:600;color:#1d1d1f;margin-bottom:8px">' + title + '</div><div style="font-size:14px;color:#6e6e73;margin-bottom:20px;line-height:1.5">' + message + '</div><div style="display:flex;gap:10px"><button id="archiveConfirmCancel" style="flex:1;padding:10px 0;border-radius:10px;border:1px solid #e5e5ea;background:#fff;font-size:15px;color:#1d1d1f;cursor:pointer;font-weight:500">取消</button><button id="archiveConfirmOk" style="flex:1;padding:10px 0;border-radius:10px;border:none;background:#1d1d1f;font-size:15px;color:#fff;cursor:pointer;font-weight:500">确认</button></div>';
  overlay.appendChild(dialog); document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById('archiveConfirmCancel').addEventListener('click', function() { overlay.remove(); });
  document.getElementById('archiveConfirmOk').addEventListener('click', function() { overlay.remove(); onConfirm(); });
}

// ★ 全局导出（供 cloud.js 复用）★
window._reloadAllUI      = _reloadAllUI;
window._formatBytes      = _formatBytes;
window._shortTime        = _shortTime;
window._applyImportData  = _applyImportData;
window._ALL_STATE_KEYS   = _ALL_STATE_KEYS;
window._showArchiveConfirm = _showArchiveConfirm;

// ═══════════════════════════════════════════
//  选择性导出 — 分组定义
// ═══════════════════════════════════════════
var ARCHIVE_GROUPS = [
  {
    id: 'characters',
    label: '角色',
    desc: '角色本体、人设、聊天设置、面具、分组',
    keys: ['characters','charConfig','groups','masks']
  },
  {
    id: 'chats',
    label: '聊天记录',
    desc: '聊天消息、记忆、收藏、未读状态',
    keys: ['chats','memories','bookmarks','unread']
  },
  {
    id: 'worldbooks',
    label: '世界书',
    desc: '所有世界书条目',
    keys: ['worldbooks']
  },
  {
    id: 'api',
    label: 'API 与提示词',
    desc: 'API 配置、系统提示词、模式',
    keys: ['apis','activeApiId','replyPrompt','systemPromptIM','systemPromptMeeting','imPromptMode','meetingPromptMode']
  },
  {
    id: 'theme',
    label: '主题与美化',
    desc: '主题、桌面、图标、背景、CSS',
    keys: ['theme','home']
  },
  {
    id: 'stickers',
    label: '表情包',
    desc: '所有表情包',
    keys: ['stickers']
  },
  {
    id: 'profile',
    label: '用户资料',
    desc: '头像、昵称、个性签名',
    keys: ['userProfile']
  },
  {
    id: 'moments',
    label: '社交动态',
    desc: 'Moments 动态',
    keys: ['moments','imsgTab']
  },
  {
    id: 'meeting',
    label: 'Meeting 存档',
    desc: 'Meeting 对话存档',
    keys: ['meetings']
  },
  {
    id: 'phone',
    label: '手机数据',
    desc: '邮件、日历、钱包、便签、音乐等',
    keys: ['phoneData','messageChats','callHistory','mailData','calendarData','socialData','walletData','notesData','musicData','travelData','shoppingData']
  },
  {
    id: 'wiki',
    label: 'NPC 与 Wiki',
    desc: 'NPC、日程表',
    keys: ['npcs','wikiSchedule']
  },
  {
    id: 'together',
    label: 'Together',
    desc: '一起听 / 看 / 读的数据',
    keys: ['together']
  },
  {
    id: 'settings',
    label: '设置与偏好',
    desc: '语言、排序、引用设置',
    keys: ['settings','lang','drawerFilter','drawerSort','allowQuote']
  }
];

// ═══════════════════════════════════════════
//  关联解析 — 根据勾选的组决定实际导出内容
// ═══════════════════════════════════════════
function _resolveExportData(selectedGroupIds) {
  var hasGroup = function(id) { return selectedGroupIds.indexOf(id) !== -1; };

  // ① 收集基础 key
  var keys = [];
  selectedGroupIds.forEach(function(gid) {
    var g = ARCHIVE_GROUPS.find(function(x) { return x.id === gid; });
    if (g) keys = keys.concat(g.keys);
  });
  keys = keys.filter(function(k, i, arr) { return arr.indexOf(k) === i; });

  var data = {};
  keys.forEach(function(k) {
    if (state[k] !== undefined) data[k] = state[k];
  });

  var autoAdded = [];

  // ② 规则 1：用户资料单独导出 → 带当前面具
  if (hasGroup('profile') && !hasGroup('characters')) {
    var curMaskId = state.userProfile && state.userProfile.currentMaskId;
    if (curMaskId) {
      var curMask = (state.masks || []).find(function(m) { return m.id === curMaskId; });
      if (curMask) {
        data.masks = [curMask];
        autoAdded.push('当前面具 ' + curMask.name);
      }
    }
  }

  // ③ 规则 2：聊天记录单独导出 → 带角色骨架 + 用到的贴纸
  if (hasGroup('chats') && !hasGroup('characters')) {
    var chatCharIds = Object.keys(state.chats || {});
    var minimalChars = (state.characters || [])
      .filter(function(c) { return chatCharIds.indexOf(c.id) !== -1; })
      .map(function(c) {
        return { id: c.id, name: c.name, avatar: c.avatar };
      });
    if (minimalChars.length > 0) {
      data.characters = minimalChars;
      autoAdded.push('角色骨架 ' + minimalChars.length + ' 个');
    }
  }

  if (hasGroup('chats') && !hasGroup('stickers')) {
    var usedStickerUrls = {};
    Object.keys(state.chats || {}).forEach(function(cid) {
      (state.chats[cid] || []).forEach(function(m) {
        if (m.type === 'sticker' && m.content) {
          usedStickerUrls[m.content] = true;
        }
      });
    });
    var usedStickers = (state.stickers || []).filter(function(s) {
      return usedStickerUrls[s.dataUrl];
    });
    if (usedStickers.length > 0) {
      data.stickers = usedStickers;
      autoAdded.push('用到的贴纸 ' + usedStickers.length + ' 个');
    }
  }

  // ④ 元信息
  data._exportType = 'partial';
  data._exportTime = new Date().toISOString();
  data._version = 1;
  data._groups = selectedGroupIds;
  data._keys = Object.keys(data).filter(function(k) { return k.indexOf('_') !== 0; });
  data._autoAdded = autoAdded;

  return { data: data, autoAdded: autoAdded };
}

// ═══════════════════════════════════════════
//  选择性导出 — 弹窗
// ═══════════════════════════════════════════
function openPartialExportModal() {
  var existing = document.getElementById('partialExportModal');
  if (existing) existing.remove();

  // 分组图标
  var GROUP_ICONS = {
    characters:  '<circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.5 3-6 7-6s7 2.5 7 6"/>',
    chats:       '<path d="M3 5h14a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 3v-3H4a2 2 0 01-1-2z"/>',
    worldbooks:  '<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 8h6M7 11h6M7 14h4"/>',
    api:         '<circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/>',
    theme:       '<circle cx="10" cy="10" r="7"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2"/>',
    stickers:    '<rect x="3" y="3" width="14" height="14" rx="3"/><circle cx="7.5" cy="8" r="1.5"/><path d="M3 14l4-4 3 3 4-5 3 5"/>',
    profile:     '<circle cx="10" cy="7" r="3"/><path d="M4 17c0-3 3-5 6-5s6 2 6 5"/>',
    moments:     '<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/>',
    meeting:     '<circle cx="7" cy="7" r="3"/><circle cx="14" cy="8" r="2"/><path d="M2 16c0-3 2.5-5 5-5M13 16c0-2 1.5-3.5 3.5-3.5"/>',
    phone:       '<rect x="5" y="3" width="10" height="14" rx="2"/><circle cx="10" cy="14" r="1"/>',
    wiki:        '<path d="M4 3h12v14H4z"/><path d="M7 7h6M7 10h6M7 13h4"/>',
    together:    '<path d="M10 16s-6-4-6-8a3.5 3.5 0 016-2 3.5 3.5 0 016 2c0 4-6 8-6 8z"/>',
    settings:    '<circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M3.5 6l1.7 1M14.8 13l1.7 1M3.5 14l1.7-1M14.8 7l1.7-1"/>'
  };

  function getGroupStat(g) {
    var total = 0;
    g.keys.forEach(function(k) {
      var v = state[k];
      if (Array.isArray(v)) total += v.length;
      else if (v && typeof v === 'object') total += Object.keys(v).length;
    });
    return total;
  }

  var overlay = document.createElement('div');
  overlay.id = 'partialExportModal';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.42);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
    'opacity:0;transition:opacity .22s ease;';

  var itemsHtml = ARCHIVE_GROUPS.map(function(g) {
    var n = getGroupStat(g);
    var icon = GROUP_ICONS[g.id] || GROUP_ICONS.settings;
    return '' +
      '<label class="pem-item" data-id="' + g.id + '" style="' +
        'display:flex;align-items:center;gap:14px;padding:14px 16px;' +
        'cursor:pointer;transition:background .12s;position:relative;' +
        'border-bottom:1px solid #f2f2f7' +
      '">' +
        '<div style="width:20px;height:20px;border-radius:6px;' +
          'border:1.5px solid #d1d1d6;background:#fff;flex-shrink:0;' +
          'display:flex;align-items:center;justify-content:center;' +
          'transition:all .15s" class="pem-checkbox">' +
          '<svg viewBox="0 0 14 14" style="width:12px;height:12px;opacity:0;transition:opacity .15s" class="pem-check-mark"><path d="M2 7l4 4 6-7" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<div style="width:36px;height:36px;border-radius:10px;background:#f2f2f7;' +
          'display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          '<svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:#3a3a3c;' +
            'fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round">' + icon + '</svg>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:600;color:#1d1d1f;line-height:1.2">' + g.label + '</div>' +
          '<div style="font-size:12px;color:#8e8e93;margin-top:3px;line-height:1.3">' + g.desc + '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:#8e8e93;background:#f2f2f7;' +
          'padding:3px 9px;border-radius:8px;font-weight:600;flex-shrink:0">' + n + '</div>' +
        '<input type="checkbox" data-group="' + g.id + '" checked style="display:none">' +
      '</label>';
  }).join('');

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:18px;' +
      'width:calc(100% - 32px);max-width:420px;max-height:82vh;display:flex;flex-direction:column;' +
      'box-shadow:0 20px 60px rgba(0,0,0,.25),0 2px 8px rgba(0,0,0,.08);' +
      'transform:scale(.94);transition:transform .22s cubic-bezier(.2,.9,.3,1);overflow:hidden">' +

      // 标题栏
      '<div style="padding:20px 22px 14px;border-bottom:1px solid #f2f2f7;flex-shrink:0">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
          '<div>' +
            '<div style="font-size:18px;font-weight:700;color:#1d1d1f;letter-spacing:-.3px">选择性导出</div>' +
            '<div id="pemCount" style="font-size:12px;color:#8e8e93;margin-top:3px">已选 13 / 13 组</div>' +
          '</div>' +
          '<button id="pemClose" style="width:30px;height:30px;border:none;background:#f2f2f7;' +
            'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
            'cursor:pointer;padding:0;transition:background .15s">' +
            '<svg viewBox="0 0 14 14" style="width:12px;height:12px" fill="none" stroke="#8e8e93" stroke-width="2" stroke-linecap="round">' +
              '<path d="M2 2l10 10M12 2L2 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button id="pemSelectAll" class="pem-quick-btn" ' +
            'style="flex:1;padding:8px 0;border:1px solid #e5e5ea;background:#fff;border-radius:9px;' +
            'font-size:12px;color:#3a3a3c;cursor:pointer;font-weight:500;font-family:inherit;' +
            'transition:background .15s">全选</button>' +
          '<button id="pemSelectNone" class="pem-quick-btn" ' +
            'style="flex:1;padding:8px 0;border:1px solid #e5e5ea;background:#fff;border-radius:9px;' +
            'font-size:12px;color:#3a3a3c;cursor:pointer;font-weight:500;font-family:inherit;' +
            'transition:background .15s">清空</button>' +
          '<button id="pemInvert" class="pem-quick-btn" ' +
            'style="flex:1;padding:8px 0;border:1px solid #e5e5ea;background:#fff;border-radius:9px;' +
            'font-size:12px;color:#3a3a3c;cursor:pointer;font-weight:500;font-family:inherit;' +
            'transition:background .15s">反选</button>' +
        '</div>' +
      '</div>' +

      // 分组列表
      '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch">' + itemsHtml + '</div>' +

      // 底部按钮
      '<div style="padding:14px 18px;border-top:1px solid #f2f2f7;display:flex;gap:10px;flex-shrink:0;background:#fafafa">' +
        '<button id="pemCancel" ' +
          'style="flex:1;padding:13px;border:none;background:#fff;border-radius:11px;' +
          'font-size:15px;color:#3a3a3c;cursor:pointer;font-weight:600;font-family:inherit;' +
          'box-shadow:0 1px 3px rgba(0,0,0,.05);transition:transform .1s">取消</button>' +
        '<button id="pemConfirm" ' +
          'style="flex:2;padding:13px;border:none;background:#1d1d1f;color:#fff;border-radius:11px;' +
          'font-size:15px;cursor:pointer;font-weight:600;font-family:inherit;' +
          'box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .1s">' +
          '导出 <span id="pemBtnCount">13</span> 组 →</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  // 动画
  requestAnimationFrame(function() {
    overlay.style.opacity = '1';
    var card = overlay.firstElementChild;
    if (card) card.style.transform = 'scale(1)';
  });

  var close = function() {
    overlay.style.opacity = '0';
    var card = overlay.firstElementChild;
    if (card) card.style.transform = 'scale(.94)';
    setTimeout(function() { overlay.remove(); }, 220);
  };

  // 更新选中状态视觉
  function updateItemStyle(labelEl, checked) {
    var cb = labelEl.querySelector('.pem-checkbox');
    var mk = labelEl.querySelector('.pem-check-mark');
    if (!cb || !mk) return;
    if (checked) {
      cb.style.background = '#1d1d1f';
      cb.style.borderColor = '#1d1d1f';
      mk.style.opacity = '1';
    } else {
      cb.style.background = '#fff';
      cb.style.borderColor = '#d1d1d6';
      mk.style.opacity = '0';
    }
  }

  // 更新底部计数
  function updateCount() {
    var checked = overlay.querySelectorAll('input[data-group]:checked');
    var n = checked.length;
    document.getElementById('pemCount').textContent = '已选 ' + n + ' / ' + ARCHIVE_GROUPS.length + ' 组';
    document.getElementById('pemBtnCount').textContent = n;
    var btn = document.getElementById('pemConfirm');
    btn.style.opacity = n === 0 ? '.4' : '1';
    btn.style.pointerEvents = n === 0 ? 'none' : 'auto';
  }

  // 初始化勾选样式
  overlay.querySelectorAll('.pem-item').forEach(function(label) {
    var cb = label.querySelector('input[data-group]');
    updateItemStyle(label, cb.checked);

    cb.addEventListener('change', function() {
      updateItemStyle(label, cb.checked);
      updateCount();
    });
  });

  updateCount();

  // 事件
  document.getElementById('pemClose').onclick = close;
  document.getElementById('pemCancel').onclick = close;
  overlay.onclick = function(e) { if (e.target === overlay) close(); };

  function setAll(v) {
    overlay.querySelectorAll('.pem-item').forEach(function(label) {
      var cb = label.querySelector('input[data-group]');
      cb.checked = v;
      updateItemStyle(label, v);
    });
    updateCount();
  }

  document.getElementById('pemSelectAll').onclick = function() { setAll(true); };
  document.getElementById('pemSelectNone').onclick = function() { setAll(false); };
  document.getElementById('pemInvert').onclick = function() {
    overlay.querySelectorAll('.pem-item').forEach(function(label) {
      var cb = label.querySelector('input[data-group]');
      cb.checked = !cb.checked;
      updateItemStyle(label, cb.checked);
    });
    updateCount();
  };

  document.getElementById('pemConfirm').onclick = function() {
    var selected = [];
    overlay.querySelectorAll('input[data-group]:checked').forEach(function(cb) {
      selected.push(cb.getAttribute('data-group'));
    });
    if (selected.length === 0) return;
    close();
    setTimeout(function() { doPartialExport(selected); }, 120);
  };
}

// ═══════════════════════════════════════════
//  执行选择性导出
// ═══════════════════════════════════════════
function doPartialExport(selectedGroupIds) {
  var result = _resolveExportData(selectedGroupIds);
  var data = result.data;
  var autoAdded = result.autoAdded;

  var size = JSON.stringify(data).length;
  var sizeStr = size < 1024 ? size + ' B' :
                size < 1048576 ? (size/1024).toFixed(1) + ' KB' :
                (size/1048576).toFixed(2) + ' MB';

  var filename = 'mizu_partial_' + selectedGroupIds.join('-') + '_' + _archiveTimestamp() + '.json';

  try {
    _downloadJSON(data, filename);
    if (typeof showToast === 'function') {
      var msg = '已导出 ' + selectedGroupIds.length + ' 组 · ' + sizeStr;
      if (autoAdded.length) msg += '（附带 ' + autoAdded.length + ' 项）';
      showToast(msg);
    }
    console.log('[Partial Export]', {
      勾选组: selectedGroupIds,
      导出key: data._keys,
      自动附带: autoAdded,
      大小: sizeStr,
      文件名: filename
    });
  } catch (e) {
    if (typeof showErrorModal === 'function') {
      showErrorModal('导出失败：' + e.message);
    } else {
      alert('导出失败：' + e.message);
    }
  }
}

// 全局导出
window.ARCHIVE_GROUPS = ARCHIVE_GROUPS;
window.openPartialExportModal = openPartialExportModal;
window.doPartialExport = doPartialExport;