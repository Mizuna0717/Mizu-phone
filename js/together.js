// ========== together.js ==========
// Together 应用 — Tab 切换逻辑（纯 UI，无实际功能）

/**
 * 切换 Together 底部 Tab
 * @param {'listen'|'watch'|'read'} tab
 */
function switchTogetherTab(tab) {
  var paneMap = {
    listen: 'togetherListen',
    watch:  'togetherWatch',
    read:   'togetherRead'
  };
  var tabMap = {
    listen: 'tabListen',
    watch:  'tabWatch',
    read:   'tabRead'
  };
  var titleMap = {
    listen: 'together.listen',
    watch:  'together.watch',
    read:   'together.read'
  };

  // 隐藏所有 pane & 取消所有 tab 激活
  document.querySelectorAll('.together-pane').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('.together-tab').forEach(function(el) {
    el.classList.remove('active');
  });

  // 激活目标
  var pane = document.getElementById(paneMap[tab]);
  var btn  = document.getElementById(tabMap[tab]);
  if (pane) pane.classList.add('active');
  if (btn)  btn.classList.add('active');

  // 更新顶部标题（如果有 i18n 函数则使用翻译）
  var headerEl = document.getElementById('togetherHeaderTitle');
  if (headerEl) {
    var key = titleMap[tab];
    if (typeof t === 'function') {
      headerEl.textContent = t(key);
    } else if (typeof LANG !== 'undefined') {
      var lang = (typeof state !== 'undefined' && state.settings && state.settings.language) ? state.settings.language : 'en';
      headerEl.textContent = (LANG[lang] && LANG[lang][key]) || key;
    }
  }

  console.log('[Together] Tab switched →', tab);
}

/**
 * 从桌面打开 Together
 */
function openTogether() {
  console.log('[Together] Opening Together app');
  nav('screen-together');
  // 默认选中第一个 Tab
  switchTogetherTab('listen');
}

/**
 * 初始化 Together（可选：在页面载入时调用）
 */
function initTogether() {
  switchTogetherTab('listen');
  console.log('[Together] Initialized');
}
