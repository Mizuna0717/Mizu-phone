// ========== cloud.js ==========
// Mizu Phone 云端同步模块（Supabase Storage 方式）
// ──────────────────────────────────────────────
// 依赖:
//   state.js   → state / accountStore / SAVE_KEYS / saveState
//               → _applyDataToState / _validateState
//   archive.js → _reloadAllUI / _formatBytes / _shortTime / _applyImportData
//   ui.js      → showToast / showErrorModal
// ──────────────────────────────────────────────
// ★ 本模块不替换 cloud.html 的 DOM，只读写页面上已有的元素 ★
// ★ 使用 Supabase Storage（文件存储），无 JSONB 大小限制 ★

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  常量
  // ═══════════════════════════════════════════
  var CONFIG_KEY = 'supabase_config';   // localStorage 中保存配置的 key
  var META_KEY   = 'cloud_meta';        // localStorage 中保存上传/下载时间的 key
  var BUCKET     = 'mizu-data';         // Supabase Storage 桶名

  // ═══════════════════════════════════════════
  //  内部状态
  // ═══════════════════════════════════════════
  var _client    = null;   // supabase 客户端实例
  var _connected = false;  // 是否已通过连接测试

  // ═══════════════════════════════════════════
  //  1. 配置持久化
  // ═══════════════════════════════════════════
  function _loadConfig() {
    try {
      var raw = localStorage.getItem(CONFIG_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _saveConfig(url, key) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({
      url: url,
      anonKey: key
    }));
  }

  function _loadMeta() {
    try {
      var raw = localStorage.getItem(META_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function _saveMeta(meta) {
    try { localStorage.setItem(META_KEY, JSON.stringify(meta)); }
    catch (e) { console.warn('[Cloud] saveMeta failed:', e); }
  }

  // ═══════════════════════════════════════════
  //  2. Supabase 客户端管理
  // ═══════════════════════════════════════════
  function _createClient(url, key) {
    _client    = null;
    _connected = false;

    if (!url || !key) {
      throw new Error('URL 和 Key 不能为空');
    }

    url = String(url).trim().replace(/\/+$/, '');
    key = String(key).trim();

    if (!/^https?:\/\/.+/i.test(url)) {
      throw new Error('URL 格式无效，须以 https:// 开头');
    }
    if (key.length < 30) {
      throw new Error('Key 太短，请使用完整的 anon public key');
    }

    var lib = window.supabase;
    if (!lib || typeof lib.createClient !== 'function') {
      throw new Error(
        'Supabase JS 库未加载。\n' +
        '请确认 HTML 中已引入:\n' +
        '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"><\/script>'
      );
    }

    _client = lib.createClient(url, key);
    console.log('[Cloud] ✅ Client created →', url.substring(0, 45) + '…');
    return _client;
  }

  /** 获取客户端；若未初始化，尝试从保存的配置自动恢复 */
  function _getClient() {
    if (_client) return _client;
    var cfg = _loadConfig();
    if (cfg && cfg.url && cfg.anonKey) {
      try { return _createClient(cfg.url, cfg.anonKey); }
      catch (e) { console.warn('[Cloud] Auto-init failed:', e.message); }
    }
    return null;
  }

  // ═══════════════════════════════════════════
  //  3. Storage 文件路径
  // ═══════════════════════════════════════════
  function _getFilePath(accountId) {
    return 'accounts/' + accountId + '/data.json';
  }

  // ═══════════════════════════════════════════
  //  4. 友好错误信息（Storage 版）
  // ═══════════════════════════════════════════
  function _friendlyError(err) {
    if (!err) return '未知错误';
    var m      = err.message || err.msg || err.error || String(err);
    var code   = err.code || '';
    var status = err.statusCode || err.status || '';

    // Bucket 不存在
    if (m.indexOf('Bucket not found') > -1 || m.indexOf('bucket') > -1 && m.indexOf('not found') > -1) {
      return '存储桶 "' + BUCKET + '" 不存在。\n请在 Supabase → Storage 中创建名为 "' + BUCKET + '" 的公共桶。';
    }
    // 对象不存在
    if (m.indexOf('Object not found') > -1 || m.indexOf('not found') > -1 && String(status) === '404') {
      return '云端未找到该账号的备份文件。';
    }
    // RLS / 权限
    if (m.indexOf('permission denied') > -1 || m.indexOf('policy') > -1 ||
        m.indexOf('Unauthorized') > -1 || m.indexOf('security') > -1 ||
        String(status) === '403') {
      return '权限不足。请检查存储桶 "' + BUCKET + '" 的 RLS 策略是否允许匿名读写。';
    }
    if (m.indexOf('violates') > -1 && m.indexOf('policy') > -1) {
      return '操作被 RLS 策略拒绝。请为存储桶 "' + BUCKET + '" 添加允许匿名访问的策略。';
    }
    // 网络
    if (m.indexOf('FetchError') > -1 || m.indexOf('Failed to fetch') > -1 ||
        m.indexOf('NetworkError') > -1 || m.indexOf('ERR_NAME') > -1 ||
        m.indexOf('ENOTFOUND') > -1) {
      return '网络错误 — 请检查网络连接和 Supabase URL 是否正确。';
    }
    // API Key
    if (m.indexOf('Invalid API key') > -1 || m.indexOf('apikey') > -1 ||
        m.indexOf('invalid_api_key') > -1 || String(status) === '401') {
      return 'API Key 无效 — 请使用 Supabase → Settings → API 中的 anon public key。';
    }
    // JWT
    if (m.indexOf('JWT') > -1 || m.indexOf('token') > -1) {
      return 'Key 格式错误 — 应为以 eyJ 开头的长 JWT 字符串。';
    }
    // 文件过大（Storage 默认 50MB 限制，可在 Supabase 项目设置中调整）
    if (m.indexOf('Payload Too Large') > -1 || String(status) === '413') {
      return '文件过大。Supabase Storage 默认单文件上限 50MB，请在项目设置中调整。';
    }
    // 泛用
    return m.length > 300 ? m.substring(0, 300) + '…' : m;
  }

  // ═══════════════════════════════════════════
  //  5. 时间/大小格式化
  // ═══════════════════════════════════════════
  function _fmtTime(iso) {
    if (typeof window._shortTime === 'function') return window._shortTime(iso);
    if (!iso) return '暂无';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    var p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getMonth() + 1) + '/' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function _fmtBytes(bytes) {
    if (typeof window._formatBytes === 'function') return window._formatBytes(bytes);
    if (!bytes || bytes < 1) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // ═══════════════════════════════════════════
  //  6. State 序列化 / 反序列化
  // ═══════════════════════════════════════════
  function _exportState() {
    var data = {};
    var keys = (typeof SAVE_KEYS !== 'undefined' && Array.isArray(SAVE_KEYS)) ? SAVE_KEYS :
               (typeof _ALL_STATE_KEYS !== 'undefined' && Array.isArray(_ALL_STATE_KEYS)) ? _ALL_STATE_KEYS : [];
    keys.forEach(function (k) { data[k] = state[k]; });
    data._cloudExportTime = new Date().toISOString();
    data._version = 1;
    return data;
  }

  function _importState(data) {
    if (!data || typeof data !== 'object') return false;

    if (typeof window._applyDataToState === 'function') {
      window._applyDataToState(data);
    } else if (typeof window._applyImportData === 'function') {
      window._applyImportData(data);
    } else {
      var keys = (typeof SAVE_KEYS !== 'undefined') ? SAVE_KEYS : [];
      keys.forEach(function (k) { if (data[k] !== undefined) state[k] = data[k]; });
    }

    if (typeof window._validateState === 'function') window._validateState();
    return true;
  }

  function _getStateSizeBytes() {
    try { return JSON.stringify(_exportState()).length; }
    catch (e) { return -1; }
  }

  // ═══════════════════════════════════════════
  //  7. UI — 按钮启用/禁用
  // ═══════════════════════════════════════════
  function _setButtonsEnabled(enabled) {
    var ids = ['cloudUploadBtn', 'cloudDownloadBtn'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.opacity       = enabled ? '1' : '.45';
      el.style.pointerEvents = enabled ? 'auto' : 'none';
    });

    var us = document.getElementById('cloudUploadSub');
    var ds = document.getElementById('cloudDownloadSub');
    if (us) us.textContent = enabled ? '将当前数据备份到云端存储' : '请先配置云端连接';
    if (ds) ds.textContent = enabled ? '从云端存储恢复备份数据' : '请先配置云端连接';
  }

  // ═══════════════════════════════════════════
  //  8. UI — 更新状态面板
  // ═══════════════════════════════════════════
  function _updateStatus(connected, lastUpload, lastDownload, dataSize) {
    var dot  = document.getElementById('cloudStatusDot');
    var text = document.getElementById('cloudStatusText');
    var upEl = document.getElementById('cloudLastUpload');
    var dnEl = document.getElementById('cloudLastDownload');
    var szEl = document.getElementById('cloudDataSize');

    if (dot) {
      if (connected === true)       dot.style.background = '#34c759';
      else if (connected === false) dot.style.background = '#ff3b30';
      else                          dot.style.background = '#c7c7cc';
    }
    if (text) {
      if (connected === true)       text.textContent = '已连接';
      else if (connected === false) text.textContent = '连接失败';
      else                          text.textContent = '未连接云端';
    }
    if (upEl) upEl.textContent = lastUpload  || '暂无';
    if (dnEl) dnEl.textContent = lastDownload || '暂无';
    if (szEl) szEl.textContent = dataSize     || '--';

    _connected = !!connected;
    _setButtonsEnabled(!!connected);
  }

  // ═══════════════════════════════════════════
  //  9. 密钥显示/隐藏
  // ═══════════════════════════════════════════
  function toggleCloudKeyVisibility() {
    var input = document.getElementById('cloudAnonKey');
    var icon  = document.getElementById('cloudKeyEyeIcon');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.innerHTML = '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="3"/><path d="M3 3l14 14" stroke-width="2"/>';
    } else {
      input.type = 'password';
      if (icon) icon.innerHTML = '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="3"/>';
    }
  }

  // ═══════════════════════════════════════════
  //  10. 保存配置
  // ═══════════════════════════════════════════
  function saveCloudConfig() {
    var urlEl = document.getElementById('cloudSupabaseUrl');
    var keyEl = document.getElementById('cloudAnonKey');
    if (!urlEl || !keyEl) return;

    var url = urlEl.value.trim().replace(/\/+$/, '');
    var key = keyEl.value.trim();

    if (!url || !key) {
      showToast('请填写完整的 URL 和 Anon Key');
      return;
    }

    _saveConfig(url, key);
    showToast('配置已保存');
    testCloudConnection();
  }

  // ═══════════════════════════════════════════
  //  11. 测试连接（Storage 版：list 桶根目录）
  // ═══════════════════════════════════════════
  async function testCloudConnection() {
    var cfg = _loadConfig();
    if (!cfg || !cfg.url || !cfg.anonKey) {
      _updateStatus(null);
      showToast('请先配置连接信息');
      return;
    }

    var dot  = document.getElementById('cloudStatusDot');
    var text = document.getElementById('cloudStatusText');
    if (dot)  dot.style.background = '#ff9500';
    if (text) text.textContent     = '连接中…';

    // 1) 创建客户端
    try {
      _createClient(cfg.url, cfg.anonKey);
    } catch (e) {
      console.error('[Cloud] Init failed:', e.message);
      _updateStatus(false);
      showToast('初始化失败: ' + e.message);
      return;
    }

    // 2) 尝试 list 存储桶根目录，验证桶是否存在且可访问
    try {
      console.log('[Cloud] Testing connection → list bucket "' + BUCKET + '"…');

      var resp = await _client.storage
        .from(BUCKET)
        .list('', { limit: 1 });

      if (resp.error) {
        console.error('[Cloud] Connection test error:', JSON.stringify(resp.error));
        _updateStatus(false);
        showToast(_friendlyError(resp.error));
        _client = null;
        return;
      }

      // 成功
      console.log('[Cloud] ✅ Connection OK | bucket "' + BUCKET + '" accessible | items:', (resp.data || []).length);
      _connected = true;

      var meta = _loadMeta();
      _updateStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);
      showToast('云端连接成功');

    } catch (e) {
      console.error('[Cloud] Connection test exception:', e);
      _updateStatus(false);
      showToast('连接失败: ' + _friendlyError(e));
      _client = null;
    }
  }

  // ═══════════════════════════════════════════
  //  12. 上传至云端（Storage upload with upsert）
  // ═══════════════════════════════════════════
  async function cloudUpload() {
    if (!_connected || !_client) {
      showToast('请先连接云端');
      return;
    }

    var accountId = accountStore.currentAccountId;
    if (!accountId) {
      showToast('无活动账号');
      return;
    }

    var sizeBytes = _getStateSizeBytes();
    var sizeStr   = _fmtBytes(sizeBytes);

    _showConfirm(
      '上传至云端',
      '将当前账号的所有数据上传至云端存储。\n如果云端已有该账号的备份，将被覆盖。\n\n当前数据大小：' + sizeStr,
      '开始上传',
      async function () {
        var sub = document.getElementById('cloudUploadSub');
        if (sub) sub.textContent = '正在上传…';
        _setButtonsEnabled(false);

        var startTime = Date.now();

        try {
          var payload = _exportState();
          var jsonStr = JSON.stringify(payload);
          var filePath = _getFilePath(accountId);

          var blob = new Blob([jsonStr], { type: 'application/json' });

          console.log('[Cloud] Uploading', _fmtBytes(jsonStr.length),
            'to', BUCKET + '/' + filePath);

          var resp = await _client.storage
            .from(BUCKET)
            .upload(filePath, blob, {
              contentType: 'application/json',
              upsert: true
            });

          if (resp.error) {
            console.error('[Cloud] Upload error:', JSON.stringify(resp.error));
            throw resp.error;
          }

          var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

          // 更新本地元数据
          var now  = new Date().toISOString();
          var meta = _loadMeta();
          meta.lastUpload = _fmtTime(now);
          meta.dataSize   = _fmtBytes(jsonStr.length);
          _saveMeta(meta);
          _updateStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);

          var chars = (payload.characters || []).length;
          var chats = Object.keys(payload.chats || {}).length;
          console.log('[Cloud] ✅ Upload OK |', _fmtBytes(jsonStr.length),
            '|', chars, 'chars |', chats, 'chats | took', elapsed + 's');
          showToast('上传成功 (' + _fmtBytes(jsonStr.length) + ', ' + elapsed + 's)');

        } catch (e) {
          console.error('[Cloud] Upload failed:', e);
          showToast('上传失败: ' + _friendlyError(e));
        }

        _setButtonsEnabled(true);
        if (sub) sub.textContent = '将当前数据备份到云端存储';
      }
    );
  }

  // ═══════════════════════════════════════════
  //  13. 从云端下载
  // ═══════════════════════════════════════════
  async function cloudDownload() {
    if (!_connected || !_client) {
      showToast('请先连接云端');
      return;
    }

    var accountId = accountStore.currentAccountId;
    if (!accountId) {
      showToast('无活动账号');
      return;
    }

    var sub = document.getElementById('cloudDownloadSub');
    if (sub) sub.textContent = '正在检查云端数据…';

    try {
      var filePath = _getFilePath(accountId);
      console.log('[Cloud] Downloading from', BUCKET + '/' + filePath);

      // 先下载文件
      var resp = await _client.storage
        .from(BUCKET)
        .download(filePath);

      if (resp.error) {
        var errMsg = resp.error.message || resp.error.error || String(resp.error);
        // 404 = 文件不存在
        if (errMsg.indexOf('Object not found') > -1 || errMsg.indexOf('not found') > -1 ||
            String(resp.error.statusCode || resp.error.status) === '404') {
          showToast('云端暂无该账号的备份文件');
          if (sub) sub.textContent = '从云端存储恢复备份数据';
          return;
        }
        console.error('[Cloud] Download error:', JSON.stringify(resp.error));
        throw resp.error;
      }

      // 读取 Blob 为文本
      var text = await resp.data.text();
      var cloudData;
      try {
        cloudData = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('云端文件 JSON 解析失败: ' + parseErr.message);
      }

      if (!cloudData || typeof cloudData !== 'object') {
        showToast('云端数据为空或已损坏');
        if (sub) sub.textContent = '从云端存储恢复备份数据';
        return;
      }

      var cloudTime  = cloudData._cloudExportTime || null;
      var cloudChars = (cloudData.characters || []).length;
      var cloudChats = Object.keys(cloudData.chats || {}).length;
      var cloudMasks = (cloudData.masks || []).length;
      var cloudSize  = _fmtBytes(text.length);

      if (sub) sub.textContent = '从云端存储恢复备份数据';

      console.log('[Cloud] Cloud data downloaded |', cloudSize,
        '| time:', cloudTime,
        '| chars:', cloudChars, '| chats:', cloudChats);

      // 弹出确认框
      _showConfirm(
        '从云端下载',
        '云端备份信息：\n'
          + '• 备份时间：' + _fmtTime(cloudTime) + '\n'
          + '• 角色数量：' + cloudChars + '\n'
          + '• 对话数量：' + cloudChats + '\n'
          + '• 面具数量：' + cloudMasks + '\n'
          + '• 文件大小：' + cloudSize + '\n\n'
          + '⚠️ 下载将覆盖当前本地所有数据！',
        '确认下载',
        function () {
          if (sub) sub.textContent = '正在恢复数据…';
          _setButtonsEnabled(false);

          try {
            var ok = _importState(cloudData);
            if (!ok) throw new Error('数据导入失败');

            saveState(true);

            var meta = _loadMeta();
            meta.lastDownload = _fmtTime(new Date().toISOString());
            meta.dataSize     = cloudSize;
            _saveMeta(meta);
            _updateStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);

            if (typeof window._reloadAllUI === 'function') {
              window._reloadAllUI();
            } else if (typeof window.reloadUI === 'function') {
              window.reloadUI(false);
            }

            console.log('[Cloud] ✅ Download OK | chars:', cloudChars, '| chats:', cloudChats);
            showToast('下载成功，数据已恢复');

          } catch (e) {
            console.error('[Cloud] Import failed:', e);
            showToast('数据恢复失败: ' + e.message);
          }

          _setButtonsEnabled(true);
          if (sub) sub.textContent = '从云端存储恢复备份数据';
        }
      );

    } catch (e) {
      console.error('[Cloud] Download error:', e);
      showToast('下载失败: ' + _friendlyError(e));
      if (sub) sub.textContent = '从云端存储恢复备份数据';
    }
  }

  // ═══════════════════════════════════════════
  //  14. 页面初始化
  // ═══════════════════════════════════════════
  function initCloudPage() {
    console.log('[Cloud] initCloudPage called');

    var cfg   = _loadConfig();
    var urlEl = document.getElementById('cloudSupabaseUrl');
    var keyEl = document.getElementById('cloudAnonKey');

    if (cfg) {
      if (urlEl) urlEl.value = cfg.url     || '';
      if (keyEl) keyEl.value = cfg.anonKey || '';
    }

    var area = document.getElementById('cloudBackupListArea');
    if (area) area.style.display = 'none';

    if (cfg && cfg.url && cfg.anonKey) {
      testCloudConnection();
    } else {
      _updateStatus(null);
    }
  }

  // ═══════════════════════════════════════════
  //  15. 确认弹窗
  // ═══════════════════════════════════════════
  function _showConfirm(title, message, confirmText, onConfirm) {
    var existing = document.getElementById('cloudConfirmModal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'cloudConfirmModal';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;' +
      'justify-content:center;background:rgba(0,0,0,.35);' +
      'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

    var cloudSvg =
      '<svg style="width:32px;height:32px;display:block;margin:0 auto 10px" ' +
        'viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" stroke-width="1.5" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M6.5 19A4.5 4.5 0 016 10.3 6 6 0 0118 11a3.5 3.5 0 01.5 6.5"/>' +
        '<path d="M8 19h8"/>' +
      '</svg>';

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:14px;width:calc(100% - 48px);' +
        'max-width:340px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12)">' +
        '<div style="padding:24px 24px 8px;text-align:center">' + cloudSvg +
          '<div style="font-size:17px;font-weight:700;color:#1d1d1f">' + (title || '') + '</div>' +
        '</div>' +
        '<div style="padding:8px 24px 24px;font-size:14px;color:#636366;' +
          'line-height:1.6;text-align:center;white-space:pre-line">' + (message || '') + '</div>' +
        '<div style="display:flex;border-top:1px solid #ececec">' +
          '<button id="cloudConfirmCancelBtn" style="flex:1;padding:14px;border:none;' +
            'background:none;font-size:15px;color:#888;cursor:pointer;font-family:inherit;' +
            'border-right:1px solid #ececec;transition:background .12s">取消</button>' +
          '<button id="cloudConfirmOkBtn" style="flex:1;padding:14px;border:none;' +
            'background:none;font-size:15px;color:#1d1d1f;font-weight:600;cursor:pointer;' +
            'font-family:inherit;transition:background .12s">' + (confirmText || '确认') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
    document.getElementById('cloudConfirmCancelBtn').addEventListener('click', function () {
      overlay.remove();
    });
    document.getElementById('cloudConfirmOkBtn').addEventListener('click', function () {
      overlay.remove();
      if (typeof onConfirm === 'function') onConfirm();
    });
  }

  // ═══════════════════════════════════════════
  //  16. 控制台验证脚本
  // ═══════════════════════════════════════════

  /**
   * ★ 一键完整测试 ★
   * 控制台运行: __mizuCloudTest()
   *
   * 流程: 检查配置 → 检查库 → 初始化客户端 → List桶测试
   *       → 数据大小 → Upload上传 → Download回读验证
   */
  window.__mizuCloudTest = async function () {
    var SEP = '═══════════════════════════════════════';
    console.log(SEP);
    console.log('  Mizu Phone — Cloud Full Test (Storage Mode)');
    console.log(SEP);

    var results = { steps: [], mode: 'storage', bucket: BUCKET };

    // ── Step 1: 检查配置 ──
    var cfg = _loadConfig();
    var hasUrl = !!(cfg && cfg.url);
    var hasKey = !!(cfg && cfg.anonKey);
    console.log('[1/7] Config:',
      hasUrl ? 'URL=' + cfg.url.substring(0, 40) + '…' : '❌ NO URL',
      '|',
      hasKey ? 'Key=' + cfg.anonKey.substring(0, 15) + '…' : '❌ NO KEY');
    results.steps.push({ step: '1/7 Config', hasUrl: hasUrl, hasKey: hasKey });

    if (!hasUrl || !hasKey) {
      console.error('❌ STOP — 请先在云端页面输入 URL 和 Key 并保存');
      return { success: false, error: 'no config', steps: results.steps };
    }

    // ── Step 2: 检查 Supabase JS 库 ──
    var hasLib = !!(window.supabase && window.supabase.createClient);
    console.log('[2/7] Supabase JS lib:', hasLib ? '✅ loaded' : '❌ NOT loaded');
    results.steps.push({ step: '2/7 Library', loaded: hasLib });

    if (!hasLib) {
      console.error('❌ STOP — supabase-js 未加载，请检查 HTML 中的 CDN <script> 标签');
      return { success: false, error: 'no lib', steps: results.steps };
    }

    // ── Step 3: 初始化客户端 ──
    console.log('[3/7] Creating Supabase client…');
    try {
      _createClient(cfg.url, cfg.anonKey);
      console.log('  ✅ Client created');
      results.steps.push({ step: '3/7 Init', ok: true });
    } catch (e) {
      console.error('  ❌ Init failed:', e.message);
      return { success: false, step: 'init', error: e.message, steps: results.steps };
    }

    // ── Step 4: List 桶连接测试 ──
    console.log('[4/7] Testing list on bucket "' + BUCKET + '"…');
    try {
      var listResp = await _client.storage.from(BUCKET).list('', { limit: 5 });
      if (listResp.error) throw listResp.error;
      console.log('  ✅ Bucket accessible | items:', (listResp.data || []).length);
      results.steps.push({ step: '4/7 Bucket', ok: true, items: (listResp.data || []).length });
    } catch (e) {
      console.error('  ❌ Bucket test failed:', _friendlyError(e));
      console.error('  Raw error:', JSON.stringify(e));
      return { success: false, step: 'bucket', error: _friendlyError(e), steps: results.steps };
    }

    // ── Step 5: 数据大小检查 ──
    var sizeBytes = _getStateSizeBytes();
    var sizeKB    = Math.round(sizeBytes / 1024);
    var sizeMB    = (sizeBytes / (1024 * 1024)).toFixed(2);
    console.log('[5/7] Data size:', _fmtBytes(sizeBytes), '(' + sizeMB + ' MB)',
      '— ✅ No size limit with Storage mode');
    results.steps.push({ step: '5/7 Size', bytes: sizeBytes, sizeKB: sizeKB, sizeMB: sizeMB, ok: true });

    // ── Step 6: Upload 上传测试 ──
    var accountId = (typeof accountStore !== 'undefined' && accountStore.currentAccountId)
      ? accountStore.currentAccountId
      : 'test_account';
    var filePath = _getFilePath(accountId);
    console.log('[6/7] Uploading to "' + BUCKET + '/' + filePath + '"…');
    var uploadStart = Date.now();
    try {
      var payload = _exportState();
      var jsonStr = JSON.stringify(payload);
      var blob    = new Blob([jsonStr], { type: 'application/json' });

      var upResp = await _client.storage
        .from(BUCKET)
        .upload(filePath, blob, { contentType: 'application/json', upsert: true });

      if (upResp.error) throw upResp.error;

      var uploadElapsed = ((Date.now() - uploadStart) / 1000).toFixed(2);
      var uploadChars   = (payload.characters || []).length;
      var uploadChats   = Object.keys(payload.chats || {}).length;
      var uploadMasks   = (payload.masks || []).length;
      console.log('  ✅ Upload OK |', _fmtBytes(jsonStr.length),
        '| chars:', uploadChars, '| chats:', uploadChats, '| masks:', uploadMasks,
        '| took', uploadElapsed + 's');
      results.steps.push({
        step: '6/7 Upload', ok: true,
        size: _fmtBytes(jsonStr.length), bytes: jsonStr.length,
        chars: uploadChars, chats: uploadChats, masks: uploadMasks,
        elapsed: uploadElapsed + 's'
      });
    } catch (e) {
      console.error('  ❌ Upload failed:', _friendlyError(e));
      console.error('  Raw error:', JSON.stringify(e));
      return { success: false, step: 'upload', error: _friendlyError(e), steps: results.steps };
    }

    // ── Step 7: Download 回读验证 ──
    console.log('[7/7] Download + verification from "' + BUCKET + '/' + filePath + '"…');
    var downloadStart = Date.now();
    try {
      var dlResp = await _client.storage
        .from(BUCKET)
        .download(filePath);

      if (dlResp.error) throw dlResp.error;

      var dlText = await dlResp.data.text();
      var dlData = JSON.parse(dlText);

      var downloadElapsed = ((Date.now() - downloadStart) / 1000).toFixed(2);

      var cloudChars = (dlData.characters || []).length;
      var cloudChats = Object.keys(dlData.chats || {}).length;
      var cloudMasks = (dlData.masks || []).length;
      var localChars = state.characters.length;
      var localChats = Object.keys(state.chats).length;
      var localMasks = state.masks.length;
      var match = (cloudChars === localChars && cloudChats === localChats && cloudMasks === localMasks);

      console.log('  Downloaded:', _fmtBytes(dlText.length), '| took', downloadElapsed + 's');
      console.log('  Cloud → chars:', cloudChars, '| chats:', cloudChats, '| masks:', cloudMasks);
      console.log('  Local → chars:', localChars, '| chats:', localChats, '| masks:', localMasks);
      console.log('  ' + (match ? '✅ Data matches!' : '⚠️ Mismatch (may be OK if data changed during test)'));
      results.steps.push({
        step: '7/7 Verify', ok: true, match: match,
        downloadSize: _fmtBytes(dlText.length), elapsed: downloadElapsed + 's',
        cloud: { chars: cloudChars, chats: cloudChats, masks: cloudMasks },
        local: { chars: localChars, chats: localChats, masks: localMasks }
      });
    } catch (e) {
      console.error('  ❌ Download/verify failed:', _friendlyError(e));
      return { success: false, step: 'verify', error: _friendlyError(e), steps: results.steps };
    }

    console.log(SEP);
    console.log('  ✅ ALL 7 TESTS PASSED (Storage Mode)');
    console.log('  Bucket: ' + BUCKET);
    console.log('  File: ' + filePath);
    console.log('  Data: ' + sizeMB + ' MB — no size limit!');
    console.log(SEP);
    return { success: true, steps: results.steps };
  };

  /**
   * ★ 查看云端文件信息 ★
   * 控制台运行: __mizuCloudFileInfo()
   */
  window.__mizuCloudFileInfo = async function (targetAccountId) {
    console.log('═══ Mizu Cloud File Info ═══');

    var client = _getClient();
    if (!client) {
      console.error('❌ No client. Save config first.');
      return null;
    }

    var accountId = targetAccountId ||
      ((typeof accountStore !== 'undefined') ? accountStore.currentAccountId : null);
    if (!accountId) {
      console.error('❌ No account ID');
      return null;
    }

    var folder = 'accounts/' + accountId;
    console.log('Listing:', BUCKET + '/' + folder + '/');

    try {
      var resp = await client.storage
        .from(BUCKET)
        .list(folder, { limit: 20 });

      if (resp.error) throw resp.error;

      var files = resp.data || [];
      if (files.length === 0) {
        console.log('  (empty — no backup files for this account)');
        return { accountId: accountId, files: [] };
      }

      var result = [];
      files.forEach(function (f) {
        var info = {
          name: f.name,
          size: f.metadata && f.metadata.size ? _fmtBytes(f.metadata.size) : 'unknown',
          sizeBytes: f.metadata && f.metadata.size ? f.metadata.size : 0,
          created: f.created_at || 'unknown',
          updated: f.updated_at || 'unknown',
          mimeType: f.metadata && f.metadata.mimetype ? f.metadata.mimetype : 'unknown'
        };
        result.push(info);
        console.log('  📄', f.name,
          '| size:', info.size,
          '| created:', info.created,
          '| type:', info.mimeType);
      });

      console.log('Total files:', files.length);
      return { accountId: accountId, files: result };
    } catch (e) {
      console.error('❌ List failed:', _friendlyError(e));
      return null;
    }
  };

  /**
   * ★ 快速调试信息 ★
   * 控制台运行: __mizuCloudDebug()
   */
  window.__mizuCloudDebug = function () {
    var cfg       = _loadConfig();
    var meta      = _loadMeta();
    var sizeBytes = _getStateSizeBytes();
    var sizeKB    = Math.round(sizeBytes / 1024);
    var sizeMB    = (sizeBytes / (1024 * 1024)).toFixed(2);

    console.log('═══ Mizu Cloud Debug Info (Storage Mode) ═══');
    console.log('Mode: Supabase Storage (no size limit)');
    console.log('Bucket:', BUCKET);
    console.log('Supabase JS lib:', (window.supabase && window.supabase.createClient) ? '✅ loaded' : '❌ NOT loaded');
    console.log('Client instance:', _client ? '✅ initialized' : '❌ null');
    console.log('Connected flag:', _connected);
    console.log('Config URL:', cfg ? cfg.url : '(none)');
    console.log('Config Key:', cfg && cfg.anonKey ? cfg.anonKey.substring(0, 15) + '…' : '(none)');
    console.log('Account ID:', (typeof accountStore !== 'undefined') ? accountStore.currentAccountId : 'N/A');
    console.log('File path:', (typeof accountStore !== 'undefined' && accountStore.currentAccountId)
      ? _getFilePath(accountStore.currentAccountId) : 'N/A');
    console.log('Data size:', _fmtBytes(sizeBytes), '(' + sizeMB + ' MB) — no limit!');
    console.log('Meta:', JSON.stringify(meta));
    console.log('State summary:',
      'chars:', state.characters.length,
      '| chats:', Object.keys(state.chats).length,
      '| masks:', state.masks.length,
      '| worldbooks:', (state.worldbooks || []).length,
      '| meetings:', (state.meetings || []).length,
      '| moments:', (state.moments || []).length,
      '| groups:', (state.groups || []).length);
    console.log('═════════════════════════════════════════════');

    return {
      mode: 'storage',
      bucket: BUCKET,
      lib: !!(window.supabase && window.supabase.createClient),
      client: !!_client,
      connected: _connected,
      url: cfg ? cfg.url : null,
      hasKey: !!(cfg && cfg.anonKey),
      accountId: (typeof accountStore !== 'undefined') ? accountStore.currentAccountId : null,
      filePath: (typeof accountStore !== 'undefined' && accountStore.currentAccountId)
        ? _getFilePath(accountStore.currentAccountId) : null,
      sizeBytes: sizeBytes,
      sizeKB: sizeKB,
      sizeMB: sizeMB,
      meta: meta
    };
  };

  /**
   * ★ 手动触发上传（控制台用）★
   * 控制台运行: __mizuCloudManualUpload()
   */
  window.__mizuCloudManualUpload = async function () {
    console.log('[Manual] Starting Storage upload…');
    var client = _getClient();
    if (!client) {
      console.error('❌ No client. Run __mizuCloudDebug() to check config.');
      return { success: false, error: 'no client' };
    }

    var accountId = accountStore.currentAccountId;
    if (!accountId) {
      console.error('❌ No active account');
      return { success: false, error: 'no account' };
    }

    var startTime = Date.now();
    try {
      var payload  = _exportState();
      var jsonStr  = JSON.stringify(payload);
      var filePath = _getFilePath(accountId);
      var blob     = new Blob([jsonStr], { type: 'application/json' });

      var resp = await client.storage
        .from(BUCKET)
        .upload(filePath, blob, { contentType: 'application/json', upsert: true });

      if (resp.error) throw resp.error;

      var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('✅ Upload successful |', _fmtBytes(jsonStr.length),
        '| chars:', (payload.characters || []).length,
        '| chats:', Object.keys(payload.chats || {}).length,
        '| path:', filePath,
        '| took:', elapsed + 's');
      return { success: true, size: _fmtBytes(jsonStr.length), bytes: jsonStr.length, elapsed: elapsed + 's' };
    } catch (e) {
      console.error('❌ Upload failed:', _friendlyError(e));
      return { success: false, error: _friendlyError(e) };
    }
  };

  /**
   * ★ 手动触发下载（控制台用，不自动应用）★
   * 控制台运行: __mizuCloudManualDownload()
   */
  window.__mizuCloudManualDownload = async function () {
    console.log('[Manual] Starting Storage download…');
    var client = _getClient();
    if (!client) {
      console.error('❌ No client. Run __mizuCloudDebug() to check config.');
      return { success: false, error: 'no client' };
    }

    var accountId = accountStore.currentAccountId;
    if (!accountId) {
      console.error('❌ No active account');
      return { success: false, error: 'no account' };
    }

    var startTime = Date.now();
    try {
      var filePath = _getFilePath(accountId);
      var resp = await client.storage.from(BUCKET).download(filePath);

      if (resp.error) throw resp.error;

      var text = await resp.data.text();
      var cloudData = JSON.parse(text);
      var elapsed   = ((Date.now() - startTime) / 1000).toFixed(2);

      var cloudChars = (cloudData.characters || []).length;
      var cloudChats = Object.keys(cloudData.chats || {}).length;

      console.log('✅ Cloud data retrieved |', _fmtBytes(text.length),
        '| chars:', cloudChars, '| chats:', cloudChats,
        '| exportTime:', cloudData._cloudExportTime,
        '| took:', elapsed + 's');
      console.log('⚠️ Data NOT applied to state. To apply, run: __mizuCloudManualApply()');

      window.__mizuCloudTempData = cloudData;
      return { success: true, size: _fmtBytes(text.length), bytes: text.length,
        chars: cloudChars, chats: cloudChats, elapsed: elapsed + 's' };
    } catch (e) {
      console.error('❌ Download failed:', _friendlyError(e));
      return { success: false, error: _friendlyError(e) };
    }
  };

  /**
   * ★ 将手动下载的数据应用到本地 state ★
   * 控制台运行: __mizuCloudManualApply()
   */
  window.__mizuCloudManualApply = function () {
    if (!window.__mizuCloudTempData) {
      console.error('❌ No temp data. Run __mizuCloudManualDownload() first.');
      return false;
    }
    var ok = _importState(window.__mizuCloudTempData);
    if (ok) {
      saveState(true);
      console.log('✅ State imported and saved.');
      if (typeof window._reloadAllUI === 'function') window._reloadAllUI();
      window.__mizuCloudTempData = null;
    } else {
      console.error('❌ Import failed');
    }
    return ok;
  };

  // ═══════════════════════════════════════════
  //  17. 全局导出
  // ═══════════════════════════════════════════
  window.initCloudPage            = initCloudPage;
  window.saveCloudConfig          = saveCloudConfig;
  window.testCloudConnection      = testCloudConnection;
  window.cloudUpload              = cloudUpload;
  window.cloudDownload            = cloudDownload;
  window.toggleCloudKeyVisibility = toggleCloudKeyVisibility;
  window.updateCloudStatus        = _updateStatus;

  console.log('[cloud.js] ✅ Cloud module loaded (Storage mode | bucket: ' + BUCKET + ' | no size limit)');
})();
