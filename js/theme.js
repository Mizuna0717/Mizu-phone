// ========== theme.js ==========
// 主题定制系统

var _themeActiveModule = 'fontSize';

var _themeOriginalCSS = {
  chatBubble: [
    '/* 气泡背景色 */',
    '.msg-row.sent .msg-bubble {',
    '  background: #a0a0a0;',
    '  color: #ffffff;',
    '}',
    '.msg-row.received .msg-bubble {',
    '  background: #e9e9ea;',
    '  color: #000000;',
    '}',
    '/* 气泡圆角 */',
    '.msg-bubble {',
    '  border-radius: 20px;',
    '  padding: 8px 14px;',
    '}',
    '/* 气泡阴影 */',
    '/* .msg-bubble { box-shadow: 0 1px 4px rgba(0,0,0,.08); } */'
  ].join('\n'),

  chatInterface: [
    '/* 聊天顶部栏 */',
    '.chat-header {',
    '  background: rgba(255,255,255,.5);',
    '}',
    '/* 输入栏 */',
    '.chat-input-bar {',
    '  background: transparent;',
    '}',
    '.chat-input-wrap {',
    '  background: rgba(255,255,255,.35);',
    '  border-radius: 18px;',
    '}',
    '/* 发送按钮 */',
    '.chat-send-btn {',
    '  background: #c7c7cc;',
    '}',
    '/* 功能按钮 */',
    '.chat-btn {',
    '  background: rgba(255,255,255,.35);',
    '  border-radius: 50%;',
    '}',
    '/* 头像 */',
    '.ch-avatar {',
    '  width: 58px;',
    '  height: 58px;',
    '  border-radius: 50%;',
    '}'
  ].join('\n'),

  meetingStyle: [
    '/* Meeting 顶部栏 */',
    '.meeting-header {',
    '  background: #f9f9fb;',
    '  border-bottom: 1px solid #ececec;',
    '}',
    '/* Meeting 输入栏 */',
    '.meeting-input-bar {',
    '  background: #fff;',
    '  border-top: 1px solid #f2f2f7;',
    '}',
    '/* Meeting 卡片 */',
    '.meeting-card {',
    '  background: #fff;',
    '  border-radius: 12px;',
    '  border: 1px solid #ececec;',
    '}',
    '/* Meeting 发送按钮 */',
    '.meeting-send-btn {',
    '  background: #1d1d1f;',
    '  border-radius: 50%;',
    '}'
  ].join('\n'),

  heartPanel: [
    '/* 心声面板容器 */',
    '.hv-panel {',
    '  background: #f9f9fb;',
    '}',
    '/* 心声面板条目 */',
    '.hv-item {',
    '  background: #fff;',
    '  border-radius: 12px;',
    '  border: 1px solid #ececec;',
    '}',
    '/* 心声面板标题 */',
    '.hv-title {',
    '  font-size: 15px;',
    '  font-weight: 600;',
    '  color: #1d1d1f;',
    '}'
  ].join('\n'),

  meetingArchive: [
    '/* 存档卡片容器 */',
    '.meeting-session-card {',
    '  background: #fff;',
    '  border-radius: 14px;',
    '  border: 1px solid #ececec;',
    '}',
    '/* 存档卡片标题 */',
    '.meeting-session-name {',
    '  font-size: 16px;',
    '  font-weight: 600;',
    '  color: #1d1d1f;',
    '}',
    '/* 存档卡片描述 */',
    '.meeting-session-meta {',
    '  font-size: 12px;',
    '  color: #8e8e93;',
    '}'
  ].join('\n')
};

var _fontSizeMap = {
  small:  '12px',
  medium: '14px',
  large:  '16px',
  xlarge: '18px'
};

function initThemeScreen() {
  _renderThemeTabs();
  _renderThemeModule(_themeActiveModule);
  _applyAllThemeStyles();
}

function _renderThemeTabs() {
  var tabs = document.getElementById('themeModuleTabs');
  if (!tabs) return;
  var modules = [
    { id: 'fontSize',      label: '字号' },
    { id: 'chatBubble',    label: '气泡样式' },
    { id: 'chatInterface', label: '聊天界面' },
    { id: 'meetingStyle',  label: 'Meeting' },
    { id: 'heartPanel',    label: '心声面板' },
    { id: 'meetingArchive',label: '存档页面' }
  ];
  tabs.innerHTML = modules.map(function(m) {
    return '<div class="theme-tab' + (m.id === _themeActiveModule ? ' active' : '') + '" onclick="switchThemeModule(\'' + m.id + '\')">' + m.label + '</div>';
  }).join('');
}

function switchThemeModule(moduleId) {
  _themeActiveModule = moduleId;
  document.querySelectorAll('.theme-tab').forEach(function(t) {
    t.classList.toggle('active', t.textContent === _getTabLabel(moduleId));
  });
  _renderThemeTabs();
  var panels = document.querySelectorAll('.theme-module');
  panels.forEach(function(p) { p.classList.remove('active'); });
  var target = document.getElementById('themeModule-' + moduleId);
  if (target) target.classList.add('active');
}

function _getTabLabel(id) {
  var map = { fontSize: '字号', chatBubble: '气泡样式', chatInterface: '聊天界面', meetingStyle: 'Meeting', heartPanel: '心声面板', meetingArchive: '存档页面' };
  return map[id] || id;
}

function _renderThemeModule(moduleId) {
  var panels = document.querySelectorAll('.theme-module');
  panels.forEach(function(p) { p.classList.remove('active'); });
  var target = document.getElementById('themeModule-' + moduleId);
  if (target) target.classList.add('active');
}

function selectFontSize(size) {
  document.querySelectorAll('.theme-font-option').forEach(function(el) {
    el.classList.toggle('active', el.dataset.size === size);
  });
  var preview = document.getElementById('themeFontPreviewText');
  if (preview) {
    var px = _fontSizeMap[size] || '14px';
    preview.style.fontSize = px;
  }
  state.theme.fontSize = size;
  saveState();
  _applyFontSize();
}

function _applyFontSize() {
  var size = (state.theme && state.theme.fontSize) || 'medium';
  var px = _fontSizeMap[size] || '14px';
  var el = document.getElementById('theme-fontsize-style');
  if (!el) {
    el = document.createElement('style');
    el.id = 'theme-fontsize-style';
    document.head.appendChild(el);
  }
  el.textContent = '.msg-bubble { font-size: ' + px + ' !important; } .chat-input-wrap textarea { font-size: ' + px + ' !important; }';
}

function themeEditorInput(moduleId) {
  var ta = document.getElementById('themeEditor-' + moduleId);
  if (!ta) return;
  _validateCSS(ta);
  _applyPreviewStyle(moduleId, ta.value);
}

function _validateCSS(textarea) {
  var val = textarea.value.trim();
  var errEl = textarea.parentElement && textarea.parentElement.querySelector('.theme-editor-error');
  if (!val) {
    textarea.classList.remove('has-error');
    if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
    return true;
  }
  var hasError = false;
  var openBraces = (val.match(/\{/g) || []).length;
  var closeBraces = (val.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    hasError = true;
    textarea.classList.add('has-error');
    if (errEl) { errEl.classList.add('show'); errEl.textContent = '括号不匹配，请检查 { } 是否成对'; }
  } else {
    textarea.classList.remove('has-error');
    if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
  }
  return !hasError;
}

function _applyPreviewStyle(moduleId, css) {
  var previewId = 'themePreviewStyle-' + moduleId;
  var el = document.getElementById(previewId);
  if (!el) {
    el = document.createElement('style');
    el.id = previewId;
    document.head.appendChild(el);
  }
  var scoped = _scopeCSS(css, '#themePreview-' + moduleId);
  el.textContent = scoped;
}

function _scopeCSS(css, scope) {
  if (!css || !css.trim()) return '';
  return css.replace(/([^{},\s][^{},]*)\s*\{/g, function(match, selector) {
    var parts = selector.split(',').map(function(s) {
      s = s.trim();
      if (!s) return '';
      return scope + ' ' + s;
    });
    return parts.join(', ') + ' {';
  });
}

function copyThemeSourceCSS(moduleId) {
  var original = _themeOriginalCSS[moduleId] || '';
  if (!original) return;
  var ta = document.getElementById('themeEditor-' + moduleId);
  if (ta && !ta.value.trim()) {
    ta.value = original;
    _applyPreviewStyle(moduleId, original);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(original).then(function() {
      showToast('已复制源代码');
    }).catch(function() {
      _fallbackCopy(original);
    });
  } else {
    _fallbackCopy(original);
  }
}

function _fallbackCopy(text) {
  var tmp = document.createElement('textarea');
  tmp.value = text;
  tmp.style.position = 'fixed';
  tmp.style.opacity = '0';
  document.body.appendChild(tmp);
  tmp.select();
  try { document.execCommand('copy'); showToast('已复制源代码'); } catch(e) {}
  document.body.removeChild(tmp);
}

function applyThemeCSS(moduleId) {
  var ta = document.getElementById('themeEditor-' + moduleId);
  if (!ta) return;
  if (!_validateCSS(ta)) return;
  state.theme[moduleId] = ta.value;
  saveState();
  _injectGlobalStyle(moduleId, ta.value);
  showToast('已应用');
}

function resetThemeCSS(moduleId) {
  var ta = document.getElementById('themeEditor-' + moduleId);
  if (ta) {
    ta.value = '';
    ta.classList.remove('has-error');
    var errEl = ta.parentElement && ta.parentElement.querySelector('.theme-editor-error');
    if (errEl) { errEl.classList.remove('show'); errEl.textContent = ''; }
    _applyPreviewStyle(moduleId, '');
  }
  state.theme[moduleId] = '';
  saveState();
  _injectGlobalStyle(moduleId, '');
  showToast('已重置');
}

function _injectGlobalStyle(moduleId, css) {
  var id = 'theme-global-' + moduleId;
  var el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css || '';
}

function _applyAllThemeStyles() {
  if (!state.theme) return;
  _applyFontSize();
  var modules = ['chatBubble', 'chatInterface', 'meetingStyle', 'heartPanel', 'meetingArchive'];
  modules.forEach(function(m) {
    if (state.theme[m]) {
      _injectGlobalStyle(m, state.theme[m]);
    }
  });
}

function onThemeScreenOpen() {
  initThemeScreen();
  var modules = ['chatBubble', 'chatInterface', 'meetingStyle', 'heartPanel', 'meetingArchive'];
  modules.forEach(function(m) {
    var ta = document.getElementById('themeEditor-' + m);
    if (ta && state.theme && state.theme[m]) {
      ta.value = state.theme[m];
    }
  });
  var currentSize = (state.theme && state.theme.fontSize) || 'medium';
  document.querySelectorAll('.theme-font-option').forEach(function(el) {
    el.classList.toggle('active', el.dataset.size === currentSize);
  });
  var preview = document.getElementById('themeFontPreviewText');
  if (preview) {
    preview.style.fontSize = _fontSizeMap[currentSize] || '14px';
  }
  switchThemeModule('fontSize');
}

;(function() {
  window.initThemeScreen        = initThemeScreen;
  window.switchThemeModule      = switchThemeModule;
  window.selectFontSize         = selectFontSize;
  window.themeEditorInput       = themeEditorInput;
  window.copyThemeSourceCSS     = copyThemeSourceCSS;
  window.applyThemeCSS          = applyThemeCSS;
  window.resetThemeCSS          = resetThemeCSS;
  window.onThemeScreenOpen      = onThemeScreenOpen;
  window._applyAllThemeStyles   = _applyAllThemeStyles;
})();