// ========== 04-i18n.js ==========
// 依賴：01-config.js (LANG), 02-state.js (state)

function T(k) {
  return LANG[state.lang]?.[k] || LANG.en[k] || k;
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = T(el.dataset.i18n);
    else el.textContent = T(el.dataset.i18n);
  });
  document.querySelectorAll('.seg-option').forEach(el =>
    el.classList.toggle('active', el.dataset.lang === state.lang)
  );
  renderHelpAccordion();
  const a = document.querySelector('.screen.active');
  if (a?.id === 'screen-settings') renderSettings();
  if (a?.id === 'screen-imessage') { renderCharList(); renderMaskList(); renderProfileInfo(); renderProfileStickers(); }
  if (a?.id === 'screen-worldbook') renderWbList();
  if (a?.id === 'screen-chat') renderChat();
}

function setLang(l) {
  state.lang = l;
  saveState();
  applyLang();
}

// ★ Schedule Awareness i18n keys (injected into LANG if available)
(function _injectScheduleAwareI18n() {
  if (typeof LANG === 'undefined') return;
  var keys = {
    csScheduleAware: { en: 'Schedule Awareness', zh: '日程感知' },
    csScheduleAwareDesc: { en: 'Auto-adjust replies based on schedule', zh: '根据日程自动调整回复行为' },
    csScheduleAwareRequireTime: { en: 'Requires Time Awareness', zh: '请先开启时间感知' },
    csEnableScheduleAware: { en: 'Enable Schedule Awareness', zh: '开启日程感知' }
  };
  Object.keys(keys).forEach(function(k) {
    Object.keys(keys[k]).forEach(function(lang) {
      if (LANG[lang]) LANG[lang][k] = keys[k][lang];
    });
  });
})();

function renderHelpAccordion() {
  document.getElementById('helpAccordion').innerHTML = [1, 2, 3, 4].map(i =>
    `<div class="accordion-item"><div class="accordion-head" onclick="toggleAcc(this)"><span>${T('helpQ' + i)}</span><span class="chev">⌄</span></div><div class="accordion-body"><div class="accordion-inner">${T('helpA' + i)}</div></div></div>`
  ).join('');
}

function applyDataI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');  applyTextI18n();   // ★ 新增
    if (!key) return;
    var val = T(key);
    if (val && val !== key) {
      el.textContent = val;
    }
  });
}


// ═══════════════════════════════════════════
//  Theme 子页面 — 运行时文本替换
//  不改 HTML，只在渲染后扫描替换
// ═══════════════════════════════════════════
var _THEME_TEXT_MAP_ZH = {
  // ─── 主页面 + nav-title ───
  'Theme': '主题',

  // ─── General ───
  'General': '通用',
  'Font Size': '字号',
  'Desktop Background': '桌面背景',
  'Clear': '清除',
  'Local Upload': '本地上传',
  'Choose Image': '选择图片',
  'Image URL': '图片 URL',
  'Desktop Icons': '桌面图标',
  'Customize each icon individually — name and image': '单独调整每个图标的名称和图片',
  'Upload': '上传',
  'Reset All': '全部重置',
  'Chat Background': '聊天背景',
  'Apply Changes': '应用更改',
  'Apply All': '全部应用',
  'Reset': '重置',
  'Small': '小',
  'Medium': '中',
  'Large': '大',
  'Extra Large': '特大',

  // ─── Bubble Style ───
  'Bubble Style': '气泡样式',
  'Preview': '预览',
  'Parameters': '参数',
  'Bubble Font Size': '气泡字号',
  'Bubble Font Color': '气泡字体颜色',
  'User Bubble Background': '用户气泡背景',
  'Character Bubble Background': '角色气泡背景',
  'Avatar Display': '头像显示',
  'Show on every message': '每条消息都显示',
  'Show on last in group': '仅组末显示',
  'Avatar Corner Radius': '头像圆角',
  'Bubble Corner Radius': '气泡圆角',

  // ─── 通用（Chat/Meeting/Heart/Archive/Call 共用）───
  'Chat Interface': '聊天界面',
  'Meeting Style': 'Meeting 样式',
  'Heart Panel': '心声面板',
  'Meeting Archive': 'Meeting 存档',
  'Call Interface': '通话界面',
  'CSS Editor': 'CSS 编辑器',
  'Custom CSS': '自定义 CSS',
  'Apply': '应用',
  'Copy Source Code': '复制源码',
  'Copy Source': '复制源码',
  'Copy Source CSS': '复制源码',
};

function applyTextI18n() {
  if ((state.lang || 'en') === 'en') return;   // 英文环境不动

  // 只处理 theme 系列页面，避免误伤其他界面
  var roots = [
    document.getElementById('screen-theme'),
    document.getElementById('screen-theme-fontsize'),
    document.getElementById('screen-theme-bubble'),
    document.getElementById('screen-theme-chat'),
    document.getElementById('screen-theme-meeting'),
    document.getElementById('screen-theme-heart'),
    document.getElementById('screen-theme-archive'),
    document.getElementById('screen-theme-call'),
  ].filter(Boolean);

  roots.forEach(function(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var t = p.tagName;
        if (t === 'SCRIPT' || t === 'STYLE' || t === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (t === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (p.hasAttribute('data-i18n') || p.closest('[data-i18n]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var text = (node.textContent || '').trim();
      if (!text) continue;
      var zh = _THEME_TEXT_MAP_ZH[text];
      if (zh && zh !== text) {
        // 保留前后空白
        var before = node.textContent.match(/^\s*/)[0];
        var after  = node.textContent.match(/\s*$/)[0];
        node.textContent = before + zh + after;
      }
    }
  });
}