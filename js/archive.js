// ========== archive.js ==========
// 依赖：state.js, ui.js, init.js 中的渲染函数

// ========== 工具：生成时间戳文件名 ==========
function _archiveTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

// ========== 工具：触发浏览器下载 JSON ==========
function _downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== 工具：重新渲染所有界面 ==========
function _reloadAllUI() {
  try { applyLang(); } catch (e) {}
  try { renderCharList(); } catch (e) {}
  try { renderGroups(); } catch (e) {}
  try { renderMoments(); } catch (e) {}
  try { renderWbList(); } catch (e) {}
  try { renderMemoryList(); } catch (e) {}
  try { renderMaskList(); } catch (e) {}
  try { renderProfileInfo(); } catch (e) {}
  try { renderProfileStickers(); } catch (e) {}
  try { renderSettings(); } catch (e) {}
  try { updateHomeBadge(); } catch (e) {}
  try { renderHomeProfile(); } catch (e) {}
  try { switchImsgTab(state.imsgTab || 'messages'); } catch (e) {}
}

// ========== 功能一：导出全部数据 ==========
function exportAllData() {
  const exportKeys = [
    'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
    'unread', 'userProfile', 'masks', 'memories', 'replyPrompt', 'charConfig',
    'phoneData', 'bookmarks', 'groups', 'moments', 'lang', 'drawerFilter',
    'drawerSort', 'imsgTab'
  ];
  const data = {};
  exportKeys.forEach(k => {
    data[k] = state[k];
  });
  data._exportType = 'full';
  data._exportTime = new Date().toISOString();
  data._version = 1;

  const filename = `mizu_backup_${_archiveTimestamp()}.json`;
  try {
    _downloadJSON(data, filename);
    showToast('导出成功');
  } catch (e) {
    showErrorModal('导出失败：' + e.message);
  }
}

// ========== 功能二：仅导出角色 + 聊天数据 ==========
function exportCharsOnly() {
  const data = {
    characters: state.characters,
    chats: state.chats,
    unread: state.unread,
    _exportType: 'chars',
    _exportTime: new Date().toISOString(),
    _version: 1
  };

  const filename = `mizu_chars_backup_${_archiveTimestamp()}.json`;
  try {
    _downloadJSON(data, filename);
    showToast('导出成功');
  } catch (e) {
    showErrorModal('导出失败：' + e.message);
  }
}

// ========== 功能三：导入数据 ==========
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      let parsed;
      try {
        parsed = JSON.parse(ev.target.result);
      } catch (err) {
        showErrorModal('文件格式无效：不是合法的 JSON 文件');
        return;
      }

      // 校验：至少包含 characters 字段
      if (!parsed || typeof parsed !== 'object') {
        showErrorModal('文件格式无效：数据结构不正确');
        return;
      }
      if (!parsed.characters && !parsed.apis && !parsed.chats) {
        showErrorModal('文件格式无效：未找到可识别的备份数据（缺少 characters / apis / chats）');
        return;
      }

      // 弹出确认对话框
      _showArchiveConfirm(
        '确认导入',
        '导入将覆盖当前所有数据，是否继续？',
        () => {
          _applyImportData(parsed);
          saveState();
          _reloadAllUI();
          showToast('导入成功');
        }
      );
    };
    reader.onerror = () => {
      showErrorModal('文件读取失败');
    };
    reader.readAsText(file);
  });

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// 将导入的数据覆盖到 state
function _applyImportData(data) {
  const importableKeys = [
    'apis', 'activeApiId', 'characters', 'chats', 'worldbooks', 'stickers',
    'unread', 'userProfile', 'masks', 'memories', 'replyPrompt', 'charConfig',
    'phoneData', 'bookmarks', 'groups', 'moments', 'lang', 'drawerFilter',
    'drawerSort', 'imsgTab'
  ];
  importableKeys.forEach(k => {
    if (data[k] !== undefined) {
      state[k] = data[k];
    }
  });

  // 安全校验（与 loadState 相同）
  if (!Array.isArray(state.characters)) state.characters = [];
  if (!state.chats || typeof state.chats !== 'object' || Array.isArray(state.chats)) state.chats = {};
  if (!state.unread || typeof state.unread !== 'object') state.unread = {};
  if (!state.phoneData || typeof state.phoneData !== 'object') state.phoneData = {};
  if (!state.userProfile || typeof state.userProfile !== 'object') state.userProfile = { name: 'User', avatar: null };
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

// ========== 功能四：清空全部数据 ==========
function clearAllData() {
  _showArchiveConfirm(
    '确认清除',
    '确定要清除所有数据吗？此操作无法撤销！',
    () => {
      resetState();
      localStorage.removeItem('aiphone8');
      saveState();
      _reloadAllUI();
      showToast('已清空全部数据');
    }
  );
}

// ========== 确认对话框 ==========
function _showArchiveConfirm(title, message, onConfirm) {
  // 如果已有确认弹窗则先移除
  const existing = document.getElementById('archiveConfirmModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'archiveConfirmModal';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,.4);z-index:9999;
    display:flex;align-items:center;justify-content:center;
    animation:fadeIn .2s ease;
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background:#fff;border-radius:16px;padding:24px;
    max-width:300px;width:85%;text-align:center;
    box-shadow:0 8px 32px rgba(0,0,0,.15);
  `;

  dialog.innerHTML = `
    <div style="font-size:17px;font-weight:600;color:#1d1d1f;margin-bottom:8px">${title}</div>
    <div style="font-size:14px;color:#6e6e73;margin-bottom:20px;line-height:1.5">${message}</div>
    <div style="display:flex;gap:10px">
      <button id="archiveConfirmCancel" style="
        flex:1;padding:10px 0;border-radius:10px;border:1px solid #e5e5ea;
        background:#fff;font-size:15px;color:#1d1d1f;cursor:pointer;
        font-weight:500;transition:background .15s;
      ">取消</button>
      <button id="archiveConfirmOk" style="
        flex:1;padding:10px 0;border-radius:10px;border:none;
        background:#1d1d1f;font-size:15px;color:#fff;cursor:pointer;
        font-weight:500;transition:opacity .15s;
      ">确认</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById('archiveConfirmCancel').addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('archiveConfirmOk').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
}
