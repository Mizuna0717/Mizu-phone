// ========== 18-chat-config.js ==========
// 依賴：02-state.js, 04-i18n.js, 17-memory.js

let cfgMemTypeFilter = 'all';

function getCharConfig(cid) {
  if (!state.charConfig) state.charConfig = {};
  if (!state.charConfig[cid]) state.charConfig[cid] = {
    autoMemory: false,
    memoryInterval: 20,
    contextCount: 50,
    consolidateInterval: 5,
    lastSummaryMsgCount: 0,
    lastConsolidateCount: 0
  };
  const cfg = state.charConfig[cid];
  // 已有字段兼容
  if (cfg.consolidateInterval === undefined) cfg.consolidateInterval = 5;
  if (cfg.lastConsolidateCount === undefined) cfg.lastConsolidateCount = 0;

  // ★ 聊天设置新增字段默认值 ★
  if (cfg.replyMin === undefined) cfg.replyMin = 1;
  if (cfg.replyMax === undefined) cfg.replyMax = 3;
  if (cfg.timeAwareness === undefined) cfg.timeAwareness = false;
  if (cfg.charRecall === undefined) cfg.charRecall = false;
  if (cfg.autoMoments === undefined) cfg.autoMoments = false;
  if (cfg.momentsInterval === undefined) cfg.momentsInterval = 6;
  if (cfg.translation === undefined) cfg.translation = false;
  if (cfg.autoMessage === undefined) cfg.autoMessage = false;
  if (cfg.autoMessageInterval === undefined) cfg.autoMessageInterval = 10;

  return cfg;
}

function saveCharConfig() { saveState(); }

function openChatConfig() {
  if (!state.currentCharId) return;
  const cfg = getCharConfig(state.currentCharId);
  document.getElementById('cfgAutoMemToggle').classList.toggle('on', !!cfg.autoMemory);
  document.getElementById('cfgMemInterval').value = cfg.memoryInterval || 20;
  document.getElementById('cfgMemIntervalVal').textContent = cfg.memoryInterval || 20;
  document.getElementById('cfgContextCount').value = cfg.contextCount || 50;
  document.getElementById('cfgContextCountVal').textContent = cfg.contextCount || 50;
  document.getElementById('cfgConsolidateInterval').value = cfg.consolidateInterval || 5;
  document.getElementById('cfgConsolidateIntervalVal').textContent = cfg.consolidateInterval || 5;
  cfgMemTypeFilter = 'all';
  document.querySelectorAll('#cfgMemTypeTabs .cfg-mem-type-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.memtype === 'all')
  );
  renderCfgCharMemories();
}

function toggleCfgAutoMem() {
  const cfg = getCharConfig(state.currentCharId);
  cfg.autoMemory = !cfg.autoMemory;
  document.getElementById('cfgAutoMemToggle').classList.toggle('on', cfg.autoMemory);
  saveCharConfig();
}

function updateCfgMemInterval(v) {
  const cfg = getCharConfig(state.currentCharId);
  cfg.memoryInterval = parseInt(v) || 20;
  document.getElementById('cfgMemIntervalVal').textContent = v;
  saveCharConfig();
}

function updateCfgContextCount(v) {
  const cfg = getCharConfig(state.currentCharId);
  cfg.contextCount = parseInt(v) || 50;
  document.getElementById('cfgContextCountVal').textContent = v;
  saveCharConfig();
}

function updateCfgConsolidateInterval(v) {
  const cfg = getCharConfig(state.currentCharId);
  cfg.consolidateInterval = parseInt(v) || 5;
  document.getElementById('cfgConsolidateIntervalVal').textContent = v;
  saveCharConfig();
}

function setCfgMemTypeFilter(type, el) {
  cfgMemTypeFilter = type;
  document.querySelectorAll('#cfgMemTypeTabs .cfg-mem-type-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderCfgCharMemories();
}

function renderCfgCharMemories() {
  const el = document.getElementById('cfgCharMemList');
  const mems = getCharMemoriesByType(state.currentCharId, cfgMemTypeFilter);
  if (!mems.length) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:#8e8e93;font-size:14px">${T('noCharMemories')}</div>`;
    return;
  }
  el.innerHTML = '<div class="config-mem-list">' + mems.map(m => {
    const typeClass = m.memType === 'ltm' ? 'mem-type-ltm' : (m.memType === 'stm' ? 'mem-type-stm' : 'mem-type-manual');
    const typeLabel = m.memType === 'ltm' ? T('ltmLabel') : (m.memType === 'stm' ? T('stmLabel') : 'Manual');
    return `<div class="config-mem-item" onclick="editMemory('${m.id}')">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <div class="cmi-title" style="flex:1">${esc(m.title || 'Untitled')}</div>
        <span class="${typeClass}">${typeLabel}</span>
      </div>
      <div class="cmi-text">${esc(m.content || '')}</div>
      <div class="cmi-date">${fmtMemDate(m.date)}</div>
    </div>`;
  }).join('') + '</div>';
}
