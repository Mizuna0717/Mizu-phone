// ========== cloud.js ==========
// Mizu Phone 云端同步模块（Supabase Database 方式）
// ──────────────────────────────────────────────
// 依赖:
//   state.js   → state / accountStore / SAVE_KEYS / saveState
//               → _applyDataToState / _validateState
//   archive.js → _reloadAllUI / _formatBytes / _shortTime / _applyImportData
//   ui.js      → showToast / showErrorModal
// ──────────────────────────────────────────────
// ★ 本模块不替换 cloud.html 的 DOM，只读写页面上已有的元素 ★
// ★ 使用 Supabase Database（PostgREST），不使用 Storage ★

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  常量
  // ═══════════════════════════════════════════
  var CONFIG_KEY    = 'supabase_config';   // localStorage 中保存配置的 key
  var META_KEY      = 'cloud_meta';        // localStorage 中保存上传/下载时间的 key
  var TABLE         = 'user_data';         // Supabase 表名
  var MAX_UPLOAD_MB = 6;                   // PostgREST 默认 ~8MB，留 2MB 余量

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
  //  3. 友好错误信息
  // ═══════════════════════════════════════════
  function _friendlyError(err) {
    if (!err) return '未知错误';
    var m      = err.message || err.msg || String(err);
    var code   = err.code || '';
    var status = err.statusCode || err.status || '';

    if (code === '42P01' || (m.indexOf('relation') > -1 && m.indexOf('does not exist') > -1)) {
      return '表 "' + TABLE + '" 不存在。请在 Supabase → SQL Editor 中运行建表 SQL。';
    }
    if (code === '42501' || m.indexOf('permission denied') > -1 ||
        m.indexOf('policy') > -1 || String(status) === '403' ||
        m.indexOf('new row violates') > -1) {
      return '权限不足 (RLS)。请在 SQL Editor 中执行 CREATE POLICY 语句。';
    }
    if (code === 'PGRST116') {
      return '云端未找到该账号的数据。';
    }
    if (m.indexOf('FetchError') > -1 || m.indexOf('Failed to fetch') > -1 ||
        m.indexOf('NetworkError') > -1 || m.indexOf('ERR_NAME') > -1) {
      return '网络错误 — 请检查网络连接和 URL 是否正确。';
    }
    if (m.indexOf('Invalid API key') > -1 || m.indexOf('apikey') > -1 ||
        m.indexOf('invalid_api_key') > -1 || String(status) === '401') {
      return 'API Key 无效 — 请使用 Supabase → Settings → API 中的 anon public key。';
    }
    if (m.indexOf('JWT') > -1 || m.indexOf('token') > -1) {
      return 'Key 格式错误 — 应为以 eyJ 开头的长 JWT 字符串。';
    }
    if (m.indexOf('Payload Too Large') > -1 || String(status) === '413') {
      return '数据过大，请清理部分头像或聊天记录后重试。';
    }
    return m.length > 250 ? m.substring(0, 250) + '…' : m;
  }

  // ═══════════════════════════════════════════
  //  4. 时间/大小格式化（尝试复用 archive.js 的，否则内置）
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
  //  5. State 序列化 / 反序列化
  // ═══════════════════════════════════════════
  function _exportState() {
    var data = {};
    // 优先使用 state.js 中的 SAVE_KEYS，其次使用 archive.js 中的 _ALL_STATE_KEYS
    var keys = (typeof SAVE_KEYS !== 'undefined' && Array.isArray(SAVE_KEYS)) ? SAVE_KEYS :
               (typeof _ALL_STATE_KEYS !== 'undefined' && Array.isArray(_ALL_STATE_KEYS)) ? _ALL_STATE_KEYS : [];
    keys.forEach(function (k) { data[k] = state[k]; });
    data._cloudExportTime = new Date().toISOString();
    data._version = 1;
    return data;
  }

  function _importState(data) {
    if (!data || typeof data !== 'object') return false;

    // 优先用 state.js 的 _applyDataToState
    if (typeof window._applyDataToState === 'function') {
      window._applyDataToState(data);
    } else if (typeof window._applyImportData === 'function') {
      window._applyImportData(data);
    } else {
      // 最后的 fallback
      var keys = (typeof SAVE_KEYS !== 'undefined') ? SAVE_KEYS : [];
      keys.forEach(function (k) { if (data[k] !== undefined) state[k] = data[k]; });
    }

    if (typeof window._validateState === 'function') window._validateState();
    return true;
  }

  function _getStateSizeKB() {
    try { return Math.round(JSON.stringify(_exportState()).length / 1024); }
    catch (e) { return -1; }
  }

  // ═══════════════════════════════════════════
  //  6. UI — 按钮启用/禁用
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
    if (us) us.textContent = enabled ? '将当前数据备份到云端服务器' : '请先配置云端连接';
    if (ds) ds.textContent = enabled ? '从云端恢复之前的备份数据' : '请先配置云端连接';
  }

  // ═══════════════════════════════════════════
  //  7. UI — 更新状态面板
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
  //  8. 密钥显示/隐藏
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
  //  9. 保存配置
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
  //  10. 测试连接（核心！用 SELECT 测试表是否可访问）
  // ═══════════════════════════════════════════
  async function testCloudConnection() {
    var cfg = _loadConfig();
    if (!cfg || !cfg.url || !cfg.anonKey) {
      _updateStatus(null);
      showToast('请先配置连接信息');
      return;
    }

    // 显示"连接中"状态
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

    // 2) 用 SELECT 测试表是否存在且可访问
    try {
      console.log('[Cloud] Testing connection → SELECT from "' + TABLE + '"…');

      var resp = await _client
        .from(TABLE)
        .select('account_id')
        .limit(1);

      if (resp.error) {
        console.error('[Cloud] Connection test error:', JSON.stringify(resp.error));
        _updateStatus(false);
        showToast(_friendlyError(resp.error));
        _client = null;
        return;
      }

      // 成功
      console.log('[Cloud] ✅ Connection OK | rows sampled:', (resp.data || []).length);
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
  //  11. 上传至云端（upsert 覆盖式写入）
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

    _showConfirm(
      '上传至云端',
      '将当前账号的所有数据上传至云端。\n如果云端已有该账号的数据，将被覆盖。',
      '开始上传',
      async function () {
        var sub = document.getElementById('cloudUploadSub');
        if (sub) sub.textContent = '正在上传…';
        _setButtonsEnabled(false);

        try {
          var payload = _exportState();
          var jsonStr = JSON.stringify(payload);
          var sizeKB  = Math.round(jsonStr.length / 1024);
          var sizeMB  = jsonStr.length / (1024 * 1024);

          if (sizeMB > MAX_UPLOAD_MB) {
            throw new Error('数据过大 (' + sizeMB.toFixed(1) + ' MB)，超出 ' + MAX_UPLOAD_MB + ' MB 限制。请清理部分数据后重试。');
          }

          console.log('[Cloud] Uploading', sizeKB, 'KB for account:', accountId);

          var resp = await _client.from(TABLE).upsert({
            account_id: accountId,
            data:       payload,
            updated_at: new Date().toISOString()
          }, { onConflict: 'account_id' });

          if (resp.error) {
            console.error('[Cloud] Upload error:', JSON.stringify(resp.error));
            throw resp.error;
          }

          // 更新本地元数据
          var now  = new Date().toISOString();
          var meta = _loadMeta();
          meta.lastUpload = _fmtTime(now);
          meta.dataSize   = _fmtBytes(jsonStr.length);
          _saveMeta(meta);
          _updateStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);

          var chars = (payload.characters || []).length;
          var chats = Object.keys(payload.chats || {}).length;
          console.log('[Cloud] ✅ Upload OK |', sizeKB, 'KB |', chars, 'chars |', chats, 'chats');
          showToast('上传成功 (' + sizeKB + ' KB)');

        } catch (e) {
          console.error('[Cloud] Upload failed:', e);
          showToast('上传失败: ' + _friendlyError(e));
        }

        _setButtonsEnabled(true);
        if (sub) sub.textContent = '将当前数据备份到云端服务器';
      }
    );
  }

  // ═══════════════════════════════════════════
  //  12. 从云端下载
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
      console.log('[Cloud] Querying cloud for account:', accountId);

      var resp = await _client
        .from(TABLE)
        .select('data, updated_at')
        .eq('account_id', accountId)
        .maybeSingle();

      if (resp.error) {
        console.error('[Cloud] Download query error:', JSON.stringify(resp.error));
        throw resp.error;
      }

      if (!resp.data) {
        showToast('云端暂无该账号的备份数据');
        if (sub) sub.textContent = '从云端恢复之前的备份数据';
        return;
      }

      if (!resp.data.data || typeof resp.data.data !== 'object') {
        showToast('云端数据为空或已损坏');
        if (sub) sub.textContent = '从云端恢复之前的备份数据';
        return;
      }

      var cloudData  = resp.data.data;
      var cloudTime  = resp.data.updated_at;
      var cloudChars = (cloudData.characters || []).length;
      var cloudChats = Object.keys(cloudData.chats || {}).length;
      var cloudMasks = (cloudData.masks || []).length;
      var cloudBytes = JSON.stringify(cloudData).length;
      var cloudSize  = _fmtBytes(cloudBytes);

      if (sub) sub.textContent = '从云端恢复之前的备份数据';

      console.log('[Cloud] Cloud data found | time:', cloudTime,
        '| chars:', cloudChars, '| chats:', cloudChats, '| size:', cloudSize);

      // 弹出确认框
      _showConfirm(
        '从云端下载',
        '云端备份信息：\n'
          + '• 备份时间：' + _fmtTime(cloudTime) + '\n'
          + '• 角色数量：' + cloudChars + '\n'
          + '• 对话数量：' + cloudChats + '\n'
          + '• 面具数量：' + cloudMasks + '\n'
          + '• 数据大小：' + cloudSize + '\n\n'
          + '⚠️ 下载将覆盖当前本地所有数据！',
        '确认下载',
        async function () {
          if (sub) sub.textContent = '正在恢复数据…';
          _setButtonsEnabled(false);

          try {
            var ok = _importState(cloudData);
            if (!ok) throw new Error('数据导入失败');

            // force=true 绕过防空覆写保护
            saveState(true);

            // 更新本地元数据
            var meta = _loadMeta();
            meta.lastDownload = _fmtTime(new Date().toISOString());
            meta.dataSize     = cloudSize;
            _saveMeta(meta);
            _updateStatus(true, meta.lastUpload, meta.lastDownload, meta.dataSize);

            // 刷新整个 UI
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
          if (sub) sub.textContent = '从云端恢复之前的备份数据';
        }
      );

    } catch (e) {
      console.error('[Cloud] Download error:', e);
      showToast('下载失败: ' + _friendlyError(e));
      if (sub) sub.textContent = '从云端恢复之前的备份数据';
    }
  }

  // ═══════════════════════════════════════════
  //  13. 页面初始化（★ 不替换 HTML，只读写 DOM ★）
  // ═══════════════════════════════════════════
  function initCloudPage() {
    console.log('[Cloud] initCloudPage called');

    var cfg   = _loadConfig();
    var urlEl = document.getElementById('cloudSupabaseUrl');
    var keyEl = document.getElementById('cloudAnonKey');

    // 填充已保存的配置值
    if (cfg) {
      if (urlEl) urlEl.value = cfg.url     || '';
      if (keyEl) keyEl.value = cfg.anonKey || '';
    }

    // 隐藏备份列表区域（Database 模式不需要文件列表 UI）
    var area = document.getElementById('cloudBackupListArea');
    if (area) area.style.display = 'none';

    // 如果有配置则自动测试连接，否则显示未连接
    if (cfg && cfg.url && cfg.anonKey) {
      testCloudConnection();
    } else {
      _updateStatus(null);
    }
  }

  // ═══════════════════════════════════════════
  //  14. 确认弹窗（复用 iOS 风格）
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
  //  15. 控制台验证脚本
  // ═══════════════════════════════════════════

  /**
   * ★ 一键完整测试 ★
   * 在浏览器控制台中运行: __mizuCloudTest()
   *
   * 流程: 检查配置 → 检查库 → 初始化客户端 → SELECT测试
   *       → 数据大小检查 → UPSERT上传 → SELECT回读验证
   */
  window.__mizuCloudTest = async function () {
    var SEP = '═══════════════════════════════════════';
    console.log(SEP);
    console.log('  Mizu Phone — Cloud Full Test');
    console.log(SEP);

    var results = { steps: [] };

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

    // ── Step 4: SELECT 连接测试 ──
    console.log('[4/7] Testing SELECT from "' + TABLE + '"…');
    try {
      var selResp = await _client.from(TABLE).select('account_id').limit(1);
      if (selResp.error) throw selResp.error;
      console.log('  ✅ SELECT OK | rows sampled:', (selResp.data || []).length);
      results.steps.push({ step: '4/7 SELECT', ok: true, rows: (selResp.data || []).length });
    } catch (e) {
      console.error('  ❌ SELECT failed:', _friendlyError(e));
      console.error('  Raw error:', JSON.stringify(e));
      return { success: false, step: 'select', error: _friendlyError(e), steps: results.steps };
    }

    // ── Step 5: 数据大小检查 ──
    var sizeKB = _getStateSizeKB();
    var sizeMB = (sizeKB / 1024).toFixed(2);
    var sizeOk = sizeKB < MAX_UPLOAD_MB * 1024;
    console.log('[5/7] Data size:', sizeKB, 'KB (' + sizeMB + ' MB)',
      sizeOk ? '✅ within limit' : '⚠️ EXCEEDS ' + MAX_UPLOAD_MB + 'MB LIMIT');
    results.steps.push({ step: '5/7 Size', sizeKB: sizeKB, sizeMB: sizeMB, ok: sizeOk });

    if (!sizeOk) {
      console.warn('  ⚠️ Data exceeds upload limit, but will attempt anyway…');
    }

    // ── Step 6: UPSERT 上传测试 ──
    var accountId = (typeof accountStore !== 'undefined' && accountStore.currentAccountId)
      ? accountStore.currentAccountId
      : 'test_account';
    console.log('[6/7] UPSERT upload for account:', accountId, '…');
    try {
      var payload = _exportState();
      var upResp = await _client.from(TABLE).upsert({
        account_id: accountId,
        data:       payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'account_id' });

      if (upResp.error) throw upResp.error;

      var uploadChars = (payload.characters || []).length;
      var uploadChats = Object.keys(payload.chats || {}).length;
      var uploadMasks = (payload.masks || []).length;
      console.log('  ✅ Upload OK | chars:', uploadChars, '| chats:', uploadChats, '| masks:', uploadMasks);
      results.steps.push({
        step: '6/7 Upload', ok: true,
        chars: uploadChars, chats: uploadChats, masks: uploadMasks
      });
    } catch (e) {
      console.error('  ❌ Upload failed:', _friendlyError(e));
      console.error('  Raw error:', JSON.stringify(e));
      return { success: false, step: 'upload', error: _friendlyError(e), steps: results.steps };
    }

    // ── Step 7: SELECT 回读验证 ──
    console.log('[7/7] Read-back verification…');
    try {
      var readResp = await _client
        .from(TABLE)
        .select('data, updated_at')
        .eq('account_id', accountId)
        .maybeSingle();

      if (readResp.error) throw readResp.error;
      if (!readResp.data || !readResp.data.data) throw new Error('Read-back returned empty');

      var cloudChars = (readResp.data.data.characters || []).length;
      var cloudChats = Object.keys(readResp.data.data.chats || {}).length;
      var cloudMasks = (readResp.data.data.masks || []).length;
      var localChars = state.characters.length;
      var localChats = Object.keys(state.chats).length;
      var localMasks = state.masks.length;
      var match = (cloudChars === localChars && cloudChats === localChats && cloudMasks === localMasks);

      console.log('  Cloud → chars:', cloudChars, '| chats:', cloudChats, '| masks:', cloudMasks);
      console.log('  Local → chars:', localChars, '| chats:', localChats, '| masks:', localMasks);
      console.log('  ' + (match ? '✅ Data matches!' : '⚠️ Mismatch (may be OK if data changed during test)'));
      console.log('  updated_at:', readResp.data.updated_at);
      results.steps.push({
        step: '7/7 Verify', ok: true, match: match,
        cloud: { chars: cloudChars, chats: cloudChats, masks: cloudMasks },
        local: { chars: localChars, chats: localChats, masks: localMasks }
      });
    } catch (e) {
      console.error('  ❌ Read-back failed:', _friendlyError(e));
      return { success: false, step: 'verify', error: _friendlyError(e), steps: results.steps };
    }

    console.log(SEP);
    console.log('  ✅ ALL 7 TESTS PASSED');
    console.log(SEP);
    return { success: true, steps: results.steps };
  };

  /**
   * ★ 快速调试信息 ★
   * 在浏览器控制台中运行: __mizuCloudDebug()
   */
  window.__mizuCloudDebug = function () {
    var cfg    = _loadConfig();
    var meta   = _loadMeta();
    var sizeKB = _getStateSizeKB();
    var sizeMB = (sizeKB / 1024).toFixed(2);

    console.log('═══ Mizu Cloud Debug Info ═══');
    console.log('Supabase JS lib:', (window.supabase && window.supabase.createClient) ? '✅ loaded' : '❌ NOT loaded');
    console.log('Client instance:', _client ? '✅ initialized' : '❌ null');
    console.log('Connected flag:', _connected);
    console.log('Config URL:', cfg ? cfg.url : '(none)');
    console.log('Config Key:', cfg && cfg.anonKey ? cfg.anonKey.substring(0, 15) + '…' : '(none)');
    console.log('Account ID:', (typeof accountStore !== 'undefined') ? accountStore.currentAccountId : 'N/A');
    console.log('Data size:', sizeKB, 'KB (' + sizeMB + ' MB)');
    console.log('Max upload:', MAX_UPLOAD_MB, 'MB |', (sizeKB < MAX_UPLOAD_MB * 1024) ? '✅ OK' : '⚠️ TOO LARGE');
    console.log('Meta:', JSON.stringify(meta));
    console.log('State summary:',
      'chars:', state.characters.length,
      '| chats:', Object.keys(state.chats).length,
      '| masks:', state.masks.length,
      '| worldbooks:', (state.worldbooks || []).length,
      '| meetings:', (state.meetings || []).length,
      '| moments:', (state.moments || []).length,
      '| groups:', (state.groups || []).length);
    console.log('Table name:', TABLE);
    console.log('═════════════════════════════');

    return {
      lib: !!(window.supabase && window.supabase.createClient),
      client: !!_client,
      connected: _connected,
      url: cfg ? cfg.url : null,
      hasKey: !!(cfg && cfg.anonKey),
      accountId: (typeof accountStore !== 'undefined') ? accountStore.currentAccountId : null,
      sizeKB: sizeKB,
      sizeMB: sizeMB,
      meta: meta,
      table: TABLE
    };
  };

  /**
   * ★ 手动触发上传（控制台用）★
   * 在浏览器控制台中运行: __mizuCloudManualUpload()
   */
  window.__mizuCloudManualUpload = async function () {
    console.log('[Manual] Starting upload…');
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

    try {
      var payload = _exportState();
      var jsonStr = JSON.stringify(payload);
      var sizeKB  = Math.round(jsonStr.length / 1024);

      var resp = await client.from(TABLE).upsert({
        account_id: accountId,
        data:       payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'account_id' });

      if (resp.error) throw resp.error;

      console.log('✅ Upload successful |', sizeKB, 'KB |',
        'chars:', (payload.characters || []).length,
        '| chats:', Object.keys(payload.chats || {}).length);
      return { success: true, sizeKB: sizeKB };
    } catch (e) {
      console.error('❌ Upload failed:', _friendlyError(e));
      return { success: false, error: _friendlyError(e) };
    }
  };

  /**
   * ★ 手动触发下载（控制台用）★
   * 在浏览器控制台中运行: __mizuCloudManualDownload()
   */
  window.__mizuCloudManualDownload = async function () {
    console.log('[Manual] Starting download…');
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

    try {
      var resp = await client
        .from(TABLE)
        .select('data, updated_at')
        .eq('account_id', accountId)
        .maybeSingle();

      if (resp.error) throw resp.error;
      if (!resp.data || !resp.data.data) {
        console.warn('⚠️ No cloud data found for account:', accountId);
        return { success: false, error: 'no data' };
      }

      var cloudData  = resp.data.data;
      var cloudChars = (cloudData.characters || []).length;
      var cloudChats = Object.keys(cloudData.chats || {}).length;

      console.log('✅ Cloud data retrieved | chars:', cloudChars, '| chats:', cloudChats,
        '| updated_at:', resp.data.updated_at);
      console.log('⚠️ Data NOT applied to state. To apply, run: __mizuCloudManualApply()');

      // 存到临时变量，供用户手动确认后导入
      window.__mizuCloudTempData = cloudData;
      return { success: true, chars: cloudChars, chats: cloudChats, updatedAt: resp.data.updated_at };
    } catch (e) {
      console.error('❌ Download failed:', _friendlyError(e));
      return { success: false, error: _friendlyError(e) };
    }
  };

  /**
   * ★ 将手动下载的数据应用到本地 state（控制台用）★
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
  //  16. 全局导出
  // ═══════════════════════════════════════════
  window.initCloudPage              = initCloudPage;
  window.saveCloudConfig            = saveCloudConfig;
  window.testCloudConnection        = testCloudConnection;
  window.cloudUpload                = cloudUpload;
  window.cloudDownload              = cloudDownload;
  window.toggleCloudKeyVisibility   = toggleCloudKeyVisibility;
  window.updateCloudStatus          = _updateStatus;

  console.log('[cloud.js] ✅ Cloud module loaded (Database mode)');
})();
