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
var _ALL_STATE_KEYS = [
  'apis','activeApiId','characters','chats','worldbooks','stickers',
  'unread','userProfile','masks','memories','meetings','replyPrompt',
  'charConfig','phoneData','bookmarks','groups','moments','lang',
  'drawerFilter','drawerSort','imsgTab',
  'allowQuote','systemPromptIM','systemPromptMeeting'
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
