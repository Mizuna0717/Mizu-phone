// ========== mcp.js ==========
// Depends: state.js, utils.js

const _MCP_DEFAULTS = [
  {
    id: 'mcp-browser',
    name: 'Browser',
    desc: 'Allows AI to browse web pages and extract content.',
    enabled: true,
    tools: ['open_url', 'search', 'screenshot'],
  },
  {
    id: 'mcp-filesystem',
    name: 'File System',
    desc: 'Read and write local files within a sandboxed directory.',
    enabled: false,
    tools: ['read_file', 'write_file', 'list_dir'],
  },
  {
    id: 'mcp-calendar',
    name: 'Calendar',
    desc: 'Access and create calendar events for schedule awareness.',
    enabled: true,
    tools: ['list_events', 'create_event', 'delete_event'],
  },
  {
    id: 'mcp-memory',
    name: 'Persistent Memory',
    desc: 'Long-term key-value store for cross-session memory.',
    enabled: true,
    tools: ['remember', 'recall', 'forget'],
  },
  {
    id: 'mcp-weather',
    name: 'Weather',
    desc: 'Fetch real-time weather data for any location.',
    enabled: false,
    tools: ['get_current', 'get_forecast'],
  },
  {
    id: 'mcp-translate',
    name: 'Translator',
    desc: 'Translate text between languages during conversations.',
    enabled: false,
    tools: ['translate', 'detect_lang'],
  },
];

function _getMcpServers() {
  if (!state.mcp) state.mcp = {};
  if (!state.mcp.servers) {
    state.mcp.servers = JSON.parse(JSON.stringify(_MCP_DEFAULTS));
    saveState();
  }
  return state.mcp.servers;
}

// ── Init ──────────────────────────────────────────────────────
function initMcp() {
  _renderMcpList();
}

// ── Render ────────────────────────────────────────────────────
function _renderMcpList() {
  const list = document.getElementById('mcpList');
  if (!list) return;
  const servers = _getMcpServers();
  if (servers.length === 0) {
    list.innerHTML = '<div class="mcp-empty">No MCP servers configured.</div>';
    return;
  }
  list.innerHTML = servers.map((srv, idx) => `
    <div class="mcp-item" id="mcpItem-${idx}">
      <div class="mcp-item-left">
        <div class="mcp-item-icon">
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        </div>
        <div class="mcp-item-info">
          <div class="mcp-item-name">${_mcpEscape(srv.name)}</div>
          <div class="mcp-item-desc">${_mcpEscape(srv.desc)}</div>
          <div class="mcp-item-tools">${srv.tools.join(' · ')}</div>
        </div>
      </div>
      <div class="mcp-item-right">
        <div class="mcp-toggle ${srv.enabled ? 'on' : ''}" onclick="mcpToggle(${idx})" title="${srv.enabled ? 'Enabled' : 'Disabled'}">
          <div class="mcp-toggle-thumb"></div>
        </div>
        <div class="mcp-item-status ${srv.enabled ? 'enabled' : 'disabled'}">${srv.enabled ? 'Enabled' : 'Disabled'}</div>
      </div>
    </div>`).join('');
}

// ── Toggle ────────────────────────────────────────────────────
function mcpToggle(idx) {
  const servers = _getMcpServers();
  if (!servers[idx]) return;
  servers[idx].enabled = !servers[idx].enabled;
  saveState();
  // Update only this item's toggle & status without full re-render
  const toggleEl = document.querySelector(`#mcpItem-${idx} .mcp-toggle`);
  const statusEl = document.querySelector(`#mcpItem-${idx} .mcp-item-status`);
  const enabled = servers[idx].enabled;
  if (toggleEl) toggleEl.classList.toggle('on', enabled);
  if (statusEl) {
    statusEl.textContent = enabled ? 'Enabled' : 'Disabled';
    statusEl.className = 'mcp-item-status ' + (enabled ? 'enabled' : 'disabled');
  }
  mcpToast(servers[idx].name + (enabled ? ' enabled' : ' disabled'));
}

// ── Add Server (UI only) ──────────────────────────────────────
function mcpAddServer() {
  mcpToast('Coming soon');
}

// ── Toast ─────────────────────────────────────────────────────
function mcpToast(msg) {
  const toast = document.getElementById('mcpToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Helper ────────────────────────────────────────────────────
function _mcpEscape(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}