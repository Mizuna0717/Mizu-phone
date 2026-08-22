// ========== archive.js ==========
// 依赖：state.js, ui.js, supabase CDN

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

function _reloadAllUI() {
  try { applyLang(); } catch(e) {}
  try { renderCharList(); } catch(e) {}
  try { renderGroups(); } catch(e) {}
  try { renderMoments(); } catch(e) {}
  try { renderWbList(); } catch(e) {}
  try { renderMemoryList(); } catch(e) {}
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

// ========== 导出/导入/清除（原有功能，不变） ==========
function exportAllData() {
  var exportKeys = ['apis','activeApiId','characters','chats','worldbooks','stickers','unread','userProfile','masks','memories','replyPrompt','charConfig','phoneData','bookmarks','groups','moments','lang','drawerFilter','drawerSort','imsgTab'];
  var data = {};
  exportKeys.forEach(function(k) { data[k] = state[k]; });
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
  var keys = ['apis','activeApiId','characters','chats','worldbooks','stickers','unread','userProfile','masks','memories','replyPrompt','charConfig','phoneData','bookmarks','groups','moments','lang','drawerFilter','drawerSort','imsgTab'];
  keys.forEach(function(k) { if (data[k] !== undefined) state[k] = data[k]; });
  if (!Array.isArray(state.characters)) state.characters = [];
  if (!state.chats || typeof state.chats !== 'object' || Array.isArray(state.chats)) state.chats = {};
  if (!state.unread || typeof state.unread !== 'object') state.unread = {};
  if (!state.phoneData || typeof state.phoneData !== 'object') state.phoneData = {};
  if (!state.userProfile || typeof state.userProfile !== 'object') state.userProfile = { name:'User', avatar:null };
  if (!Array.isArray(state.masks)) state.masks = [];
  if (!Array.isArray(state.memories)) state.memories = [];
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


/* ══════════════════════════════════════════
   ★★★ 云端存储 — Supabase 完整实现 ★★★
   ══════════════════════════════════════════ */

var _supabaseClient = null;
var _cloudConnected = false;
var CLOUD_BUCKET = 'app_backup';

// ── 设备 ID ──
function _getDeviceId() {
  var id = localStorage.getItem('device_id');
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
    localStorage.setItem('device_id', id);
  }
  return id;
}

// ── 加载/保存配置 ──
function _loadCloudConfig() {
  try {
    var raw = localStorage.getItem('supabase_config');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function _saveCloudConfig(url, anonKey) {
  localStorage.setItem('supabase_config', JSON.stringify({ url: url, anonKey: anonKey }));
}

// ── 初始化 Supabase 客户端 ──
function _initSupabase(url, anonKey) {
  if (!url || !anonKey) return null;
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      return supabase.createClient(url, anonKey);
    }
    return null;
  } catch(e) {
    console.error('[Cloud] Supabase init error:', e);
    return null;
  }
}

// ── 密钥显示/隐藏 ──
function toggleCloudKeyVisibility() {
  var input = document.getElementById('cloudAnonKey');
  var icon = document.getElementById('cloudKeyEyeIcon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="3"/><path d="M3 3l14 14" stroke-width="2"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="3"/>';
  }
}

// ── 启用/禁用上传下载按钮 ──
function _setCloudButtonsEnabled(enabled) {
  var uploadBtn = document.getElementById('cloudUploadBtn');
  var downloadBtn = document.getElementById('cloudDownloadBtn');
  var uploadSub = document.getElementById('cloudUploadSub');
  var downloadSub = document.getElementById('cloudDownloadSub');

  if (uploadBtn) {
    uploadBtn.style.opacity = enabled ? '1' : '.45';
    uploadBtn.style.pointerEvents = enabled ? 'auto' : 'none';
  }
  if (downloadBtn) {
    downloadBtn.style.opacity = enabled ? '1' : '.45';
    downloadBtn.style.pointerEvents = enabled ? 'auto' : 'none';
  }
  if (uploadSub) uploadSub.textContent = enabled ? '将当前数据备份到云端服务器' : '请先配置云端连接';
  if (downloadSub) downloadSub.textContent = enabled ? '从云端恢复之前的备份数据' : '请先配置云端连接';
}

// ── 更新状态面板 ──
function updateCloudStatus(connected, lastUpload, lastDownload, dataSize) {
  var dot = document.getElementById('cloudStatusDot');
  var text = document.getElementById('cloudStatusText');
  var uploadEl = document.getElementById('cloudLastUpload');
  var downloadEl = document.getElementById('cloudLastDownload');
  var sizeEl = document.getElementById('cloudDataSize');

  if (dot) dot.style.background = connected ? '#34c759' : (connected === false ? '#ff3b30' : '#c7c7cc');
  if (text) text.textContent = connected ? '已连接' : (connected === false ? '连接失败' : '未连接云端');
  if (uploadEl) uploadEl.textContent = lastUpload || '暂无';
  if (downloadEl) downloadEl.textContent = lastDownload || '暂无';
  if (sizeEl) sizeEl.textContent = dataSize || '--';

  _cloudConnected = !!connected;
  _setCloudButtonsEnabled(!!connected);
}

// ── 保存配置 ──
function saveCloudConfig() {
  var urlEl = document.getElementById('cloudSupabaseUrl');
  var keyEl = document.getElementById('cloudAnonKey');
  if (!urlEl || !keyEl) return;
  var url = urlEl.value.trim();
  var key = keyEl.value.trim();
  if (!url || !key) { showToast('请填写完整的 URL 和 Anon Key'); return; }
  // 清理 URL 末尾斜杠
  url = url.replace(/\/+$/, '');
  _saveCloudConfig(url, key);
  showToast('配置已保存');
  testCloudConnection();
}

// ── 测试连接 ──
async function testCloudConnection() {
  var cfg = _loadCloudConfig();
  if (!cfg || !cfg.url || !cfg.anonKey) {
    updateCloudStatus(null);
    showToast('请先配置连接信息');
    return;
  }

  var dot = document.getElementById('cloudStatusDot');
  var text = document.getElementById('cloudStatusText');
  if (dot) dot.style.background = '#ff9500';
  if (text) text.textContent = '连接中...';

  _supabaseClient = _initSupabase(cfg.url, cfg.anonKey);
  if (!_supabaseClient) {
    updateCloudStatus(false);
    showToast('Supabase 客户端初始化失败');
    return;
  }

  try {
    // ★ 用上传测试文件代替 listBuckets / getBucket ★
    var testPath = '.connection_test/test_connection.txt';
    var testContent = 'ok ' + new Date().toISOString();
    var testBlob = new Blob([testContent], { type: 'text/plain' });

    var uploadResult = await _supabaseClient.storage
      .from(CLOUD_BUCKET)
      .upload(testPath, testBlob, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadResult.error) {
      console.error('[Cloud] test upload error:', uploadResult.error);

      var errMsg = uploadResult.error.message || '';
      var statusCode = uploadResult.error.statusCode || uploadResult.error.status || '';

      if (errMsg.indexOf('Bucket not found') !== -1 || errMsg.toLowerCase().indexOf('bucket') !== -1) {
        updateCloudStatus(false);
        showToast('存储桶 "' + CLOUD_BUCKET + '" 不存在，请在 Supabase 控制台创建');
      } else if (String(statusCode) === '401' || errMsg.indexOf('Invalid') !== -1 || errMsg.indexOf('invalid') !== -1) {
        updateCloudStatus(false);
        showToast('认证失败，请检查 Anon Key 是否正确');
      } else if (errMsg.indexOf('violates') !== -1 || errMsg.indexOf('policy') !== -1 || String(statusCode) === '403') {
        updateCloudStatus(false);
        showToast('权限不足，请检查存储桶 RLS 策略是否允许 INSERT');
      } else {
        updateCloudStatus(false);
        showToast('连接失败: ' + errMsg);
      }
      return;
    }

    // 上传成功 → 连接正常
    console.log('[Cloud] connection test passed');

    // 清理测试文件（静默，不阻塞主流程）
    _supabaseClient.storage
      .from(CLOUD_BUCKET)
      .remove([testPath])
      .then(function(res) {
        if (res.error) console.warn('[Cloud] test file cleanup failed:', res.error.message);
        else console.log('[Cloud] test file cleaned up');
      })
      .catch(function(e) {
        console.warn('[Cloud] test file cleanup error:', e);
      });

    // 读取本地缓存的操作时间并更新 UI
    var cloudMeta = _loadCloudMeta();
    updateCloudStatus(true, cloudMeta.lastUpload, cloudMeta.lastDownload, cloudMeta.dataSize);
    showToast('连接成功');

  } catch(e) {
    console.error('[Cloud] test error:', e);
    updateCloudStatus(false);
    showToast('连接失败: ' + e.message);
  }
}


// ── 云端操作元数据（本地缓存） ──
function _loadCloudMeta() {
  try {
    var raw = localStorage.getItem('cloud_meta');
    return raw ? JSON.parse(raw) : { lastUpload: null, lastDownload: null, dataSize: null };
  } catch(e) { return { lastUpload: null, lastDownload: null, dataSize: null }; }
}

function _saveCloudMeta(meta) {
  localStorage.setItem('cloud_meta', JSON.stringify(meta));
}

// ── 序列化当前数据 ──
function _serializeState() {
  var exportKeys = ['apis','activeApiId','characters','chats','worldbooks','stickers','unread','userProfile','masks','memories','replyPrompt','charConfig','phoneData','bookmarks','groups','moments','lang','drawerFilter','drawerSort','imsgTab'];
  var data = {};
  exportKeys.forEach(function(k) { data[k] = state[k]; });
  data._exportType = 'cloud';
  data._exportTime = new Date().toISOString();
  data._version = 1;
  data._deviceId = _getDeviceId();
  data._accountId = accountStore.currentAccountId || 'default';
  return JSON.stringify(data);
}

// ══════════════════════════════════════════
// ★★★ 上传至云端 ★★★
// ══════════════════════════════════════════
async function cloudUpload() {
  if (!_cloudConnected || !_supabaseClient) {
    showToast('请先连接云端');
    return;
  }

  _showCloudConfirm('上传至云端', '将当前账号所有数据上传至云端？这会在云端创建一个新的备份文件。', '开始上传', async function() {
    var uploadSub = document.getElementById('cloudUploadSub');
    if (uploadSub) uploadSub.textContent = '正在上传...';
    _setCloudButtonsEnabled(false);

    try {
      var deviceId = _getDeviceId();
      var jsonStr = _serializeState();
      var filename = 'backup_' + _archiveTimestamp() + '.json';
      var filePath = deviceId + '/' + filename;

      var blob = new Blob([jsonStr], { type: 'application/json' });

      var result = await _supabaseClient.storage
        .from(CLOUD_BUCKET)
        .upload(filePath, blob, {
          contentType: 'application/json',
          upsert: false
        });

      if (result.error) {
        throw new Error(result.error.message || '上传失败');
      }

      // 更新元数据
      var meta = _loadCloudMeta();
      meta.lastUpload = _shortTime(new Date().toISOString());
      meta.dataSize = _formatBytes(jsonStr.length);
      _saveCloudMeta(meta);
      updateCloudStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);

      showToast('上传成功: ' + filename);
      console.log('[Cloud] uploaded:', filePath, '| size:', _formatBytes(jsonStr.length));

    } catch(e) {
      console.error('[Cloud] upload error:', e);
      showToast('上传失败: ' + e.message);
    }

    _setCloudButtonsEnabled(true);
    if (uploadSub) uploadSub.textContent = '将当前数据备份到云端服务器';
  });
}

// ══════════════════════════════════════════
// ★★★ 从云端下载 ★★★
// ══════════════════════════════════════════
async function cloudDownload() {
  if (!_cloudConnected || !_supabaseClient) {
    showToast('请先连接云端');
    return;
  }

  var downloadSub = document.getElementById('cloudDownloadSub');
  if (downloadSub) downloadSub.textContent = '正在获取备份列表...';

  try {
    var deviceId = _getDeviceId();

    var listResult = await _supabaseClient.storage
      .from(CLOUD_BUCKET)
      .list(deviceId, {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listResult.error) {
      throw new Error(listResult.error.message || '获取列表失败');
    }

    var files = (listResult.data || []).filter(function(f) {
      return f.name && f.name.endsWith('.json');
    });

    if (files.length === 0) {
      showToast('云端暂无备份文件');
      if (downloadSub) downloadSub.textContent = '从云端恢复之前的备份数据';
      return;
    }

    // 显示备份列表
    _renderBackupList(files, deviceId);
    if (downloadSub) downloadSub.textContent = '从云端恢复之前的备份数据';

  } catch(e) {
    console.error('[Cloud] list error:', e);
    showToast('获取列表失败: ' + e.message);
    if (downloadSub) downloadSub.textContent = '从云端恢复之前的备份数据';
  }
}

// ── 渲染备份列表 ──
function _renderBackupList(files, deviceId) {
  var area = document.getElementById('cloudBackupListArea');
  var list = document.getElementById('cloudBackupList');
  if (!area || !list) return;

  var h = '';
  var recent = files.slice(0, 8);
  recent.forEach(function(f, idx) {
    var time = f.created_at ? _shortTime(f.created_at) : f.name.replace('backup_','').replace('.json','');
    var size = f.metadata && f.metadata.size ? _formatBytes(f.metadata.size) : '';
    var border = idx < recent.length - 1 ? 'border-bottom:1px solid #f2f2f7;' : '';
    h += '<div onclick="_downloadBackupFile(\'' + deviceId + '/' + f.name + '\')" ' +
      'style="display:flex;align-items:center;padding:14px 16px;gap:12px;cursor:pointer;transition:background .12s;' + border + '" ' +
      'onmousedown="this.style.background=\'#f2f2f7\'" onmouseup="this.style.background=\'\'" onmouseleave="this.style.background=\'\'">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:#f2f2f7;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
        '<svg viewBox="0 0 20 20" style="width:16px;height:16px;stroke:#636366;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M4 4h8l4 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M12 4v4h4"/></svg>' +
      '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14px;font-weight:500;color:#1d1d1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + f.name + '</div>' +
        '<div style="font-size:12px;color:#8e8e93;margin-top:2px">' + time + (size ? ' / ' + size : '') + '</div>' +
      '</div>' +
      '<svg viewBox="0 0 20 20" style="width:14px;height:14px;stroke:#c7c7cc;fill:none;stroke-width:2;flex-shrink:0"><path d="M10 3v10M6 9l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</div>';
  });

  list.innerHTML = h;
  area.style.display = 'block';

  // 滚动到列表位置
  setTimeout(function() {
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// ── 下载并恢复单个备份 ──
async function _downloadBackupFile(path) {
  _showArchiveConfirm('确认下载', '下载此备份将覆盖当前所有数据，是否继续？', async function() {
    var downloadSub = document.getElementById('cloudDownloadSub');
    if (downloadSub) downloadSub.textContent = '正在下载...';
    _setCloudButtonsEnabled(false);

    try {
      var result = await _supabaseClient.storage
        .from(CLOUD_BUCKET)
        .download(path);

      if (result.error) {
        throw new Error(result.error.message || '下载失败');
      }

      var text = await result.data.text();
      var parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('文件数据格式无效');
      }

      _applyImportData(parsed);
      saveState();

      // 更新元数据
      var meta = _loadCloudMeta();
      meta.lastDownload = _shortTime(new Date().toISOString());
      if (text.length) meta.dataSize = _formatBytes(text.length);
      _saveCloudMeta(meta);
      updateCloudStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);

      _reloadAllUI();
      showToast('下载成功，数据已恢复');
      console.log('[Cloud] downloaded:', path);

      // 隐藏备份列表
      var area = document.getElementById('cloudBackupListArea');
      if (area) area.style.display = 'none';

    } catch(e) {
      console.error('[Cloud] download error:', e);
      showToast('下载失败: ' + e.message);
    }

    _setCloudButtonsEnabled(true);
    if (downloadSub) downloadSub.textContent = '从云端恢复之前的备份数据';
  });
}

// ── 页面打开时自动加载配置 ──
function initCloudPage() {
  var cfg = _loadCloudConfig();
  var urlEl = document.getElementById('cloudSupabaseUrl');
  var keyEl = document.getElementById('cloudAnonKey');
  if (cfg) {
    if (urlEl) urlEl.value = cfg.url || '';
    if (keyEl) keyEl.value = cfg.anonKey || '';
  }

  // 如果已有配置，自动测试连接
  if (cfg && cfg.url && cfg.anonKey) {
    testCloudConnection();
  } else {
    updateCloudStatus(null);
  }
}

// ── 通用云端弹窗 ──
function _showCloudConfirm(title, message, confirmText, onConfirm) {
  var existing = document.getElementById('cloudConfirmModal');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'cloudConfirmModal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

  var cloudSvg = '<svg style="width:32px;height:32px;display:block;margin:0 auto 10px" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 19A4.5 4.5 0 016 10.3 6 6 0 0118 11a3.5 3.5 0 01.5 6.5"/><path d="M8 19h8"/></svg>';

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:14px;width:calc(100% - 48px);max-width:340px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12)">' +
      '<div style="padding:24px 24px 8px;text-align:center">' + cloudSvg +
        '<div style="font-size:17px;font-weight:700;color:#1d1d1f">' + (title||'') + '</div></div>' +
      '<div style="padding:8px 24px 24px;font-size:14px;color:#636366;line-height:1.6;text-align:center">' + (message||'') + '</div>' +
      '<div style="display:flex;border-top:1px solid #ececec">' +
        '<button id="cloudConfirmCancelBtn" style="flex:1;padding:14px;border:none;background:none;font-size:15px;color:#888;cursor:pointer;font-family:inherit;border-right:1px solid #ececec;transition:background .12s">取消</button>' +
        '<button id="cloudConfirmOkBtn" style="flex:1;padding:14px;border:none;background:none;font-size:15px;color:#1d1d1f;font-weight:600;cursor:pointer;font-family:inherit;transition:background .12s">' + (confirmText||'确认') + '</button>' +
      '</div></div>';

  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById('cloudConfirmCancelBtn').addEventListener('click', function() { overlay.remove(); });
  document.getElementById('cloudConfirmOkBtn').addEventListener('click', function() {
    overlay.remove();
    if (typeof onConfirm === 'function') onConfirm();
  });
}

// ── 全局绑定 ──
window.cloudUpload = cloudUpload;
window.cloudDownload = cloudDownload;
window.updateCloudStatus = updateCloudStatus;
window.saveCloudConfig = saveCloudConfig;
window.testCloudConnection = testCloudConnection;
window.toggleCloudKeyVisibility = toggleCloudKeyVisibility;
window.initCloudPage = initCloudPage;
window._downloadBackupFile = _downloadBackupFile;
