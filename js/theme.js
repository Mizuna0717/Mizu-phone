// ============================================================
//  Theme Editor — Navigation
// ============================================================

// ═══════════════════════════════════════════
//  Theme Apply 成功提示弹窗
// ═══════════════════════════════════════════
function showThemeSuccessDialog(title, subtitle, onClose) {
  var existing = document.getElementById('themeSuccessDialog');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'themeSuccessDialog';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.32);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
    'opacity:0;transition:opacity .22s ease;padding:20px;';

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:20px;width:100%;max-width:300px;overflow:hidden;' +
      'box-shadow:0 20px 60px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.06);' +
      'transform:scale(.92);transition:transform .22s cubic-bezier(.2,.9,.3,1);text-align:center;">' +
      '<div style="padding:28px 24px 0">' +
        '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;' +
          'background:#f2f2f7;display:flex;align-items:center;justify-content:center;">' +
          '<svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:#1d1d1f;fill:none;' +
            'stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;">' +
            '<path d="M5 12.5l4.5 4.5L19 7"/>' +
          '</svg>' +
        '</div>' +
        '<div style="font-size:17px;font-weight:700;color:#1d1d1f;letter-spacing:-.3px;margin-bottom:6px;">' +
          (title || '已应用') +
        '</div>' +
        '<div style="font-size:13px;color:#8e8e93;line-height:1.5;margin-bottom:24px;">' +
          (subtitle || '设置已保存') +
        '</div>' +
      '</div>' +
      '<div style="padding:0 20px 20px;">' +
        '<button id="themeSuccessOk" style="width:100%;padding:13px;border:none;' +
          'background:#1d1d1f;color:#fff;border-radius:12px;font-size:15px;font-weight:600;' +
          'cursor:pointer;font-family:inherit;transition:transform .1s,opacity .1s;">' +
          '完成' +
        '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  requestAnimationFrame(function() {
    overlay.style.opacity = '1';
    var card = overlay.firstElementChild;
    if (card) card.style.transform = 'scale(1)';
  });

  var close = function() {
    overlay.style.opacity = '0';
    var card = overlay.firstElementChild;
    if (card) card.style.transform = 'scale(.92)';
    setTimeout(function() {
      overlay.remove();
      if (typeof onClose === 'function') onClose();
    }, 220);
  };

  document.getElementById('themeSuccessOk').onclick = close;
  overlay.onclick = function(e) { if (e.target === overlay) close(); };

  // 3 秒后自动关闭
  setTimeout(function() {
    if (document.getElementById('themeSuccessDialog')) close();
  }, 3000);
}
window.showThemeSuccessDialog = showThemeSuccessDialog;

// ═══════════════════════════════════════════
//  移动端 click 修复：全局代理
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
//  移动端 click 修复：全局代理
//  - 处理 <button onclick="...">
//  - 处理 <label> 内嵌 file input
// ═══════════════════════════════════════════
(function fixTeBtnMobile(){
  var _lastTouch = 0;

  document.addEventListener('touchend', function(e) {
    var btn = e.target.closest('.te-btn, .te-upload-btn, .te-general-apply-btn');
    if (!btn) return;

    // ★ 防抖
    var now = Date.now();
    if (now - _lastTouch < 300) return;
    _lastTouch = now;

    e.preventDefault();
    e.stopPropagation();

    var onclickAttr = btn.getAttribute('onclick');

    // ★ 情况 1：有 onclick，直接执行
    if (onclickAttr) {
      console.log('[Mobile] touchend → onclick:', onclickAttr);
      try {
        var fn = new Function('event', onclickAttr);
        fn.call(btn, e);
      } catch(err) {
        console.error('[Mobile] 执行失败:', err);
      }
      return;
    }

    // ★ 情况 2：没 onclick，但里面包着 file input（label 场景）
    var fileInput = btn.querySelector('input[type="file"]');
    if (fileInput) {
      console.log('[Mobile] touchend → 触发内部 file input:', fileInput.id);
      fileInput.click();
      return;
    }

    console.log('[Mobile] 按钮无 onclick 也无 file input，忽略:', btn.className);
  }, { passive: false });

  console.log('[Mobile]  theme 按钮代理已安装');
})();

// ═══════════════════════════════════════════
//  Apply All 移动端安全版（防止 touch 后不触发 click）
// ═══════════════════════════════════════════
function applyAllGeneralSettingsSafe() {
  var now = Date.now();
  if (applyAllGeneralSettingsSafe._lastCall && 
      (now - applyAllGeneralSettingsSafe._lastCall) < 500) {
    return;
  }
  applyAllGeneralSettingsSafe._lastCall = now;

  try {
    if (typeof applyAllGeneralSettings === 'function') {
      applyAllGeneralSettings();
      console.log('[ApplyAll] ✅ 执行成功');
    } else {
      console.error('[ApplyAll] applyAllGeneralSettings 不存在');
    }
  } catch (e) {
    console.error('[ApplyAll] ❌ 报错:', e);
    alert('应用失败: ' + e.message);
  }
}
window.applyAllGeneralSettingsSafe = applyAllGeneralSettingsSafe;

// ============================================================
//  Call Interface Module
// ============================================================
const CALL_CSS_FILES = ['css/call.css', 'css/chat-extras.css'];

function extractCallCSS(src, fileLabel) {
	var blocks = [];
	var re = /([^{}]+)\{([^{}]*)\}/g;
	var m;
	while ((m = re.exec(src)) !== null) {
		var sel = m[1].trim();
		if (!sel || sel.charAt(0) === '@') continue;
		if (/call/i.test(sel)) {
			blocks.push(sel + ' {\n' + m[2].trim() + '\n}');
		}
	}
	if (!blocks.length) return '';
	return '/* === From ' + fileLabel + ' === */\n' + blocks.join('\n\n');
}

function loadCallSourceCSS() {
	return Promise.all(CALL_CSS_FILES.map(function(f) {
		return fetch(f).then(function(r) { return r.text(); }).catch(function() { return ''; });
	})).then(function(contents) {
		var parts = [];
		contents.forEach(function(txt, i) {
			if (!txt) return;
			var extracted = extractCallCSS(txt, CALL_CSS_FILES[i]);
			if (extracted) parts.push(extracted);
		});
		return parts.join('\n\n');
	});
}

function initCallInterfaceEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
	}

	var textarea = document.getElementById('te-css-call');
	if (!textarea) return;

	var saved = (window.state && window.state.theme && window.state.theme.callScreen)
		|| localStorage.getItem('theme-css-call');

	if (saved) {
		textarea.value = saved;
		if (window.state) window.state.theme.callScreen = saved;
		renderCallAfter(saved);
	} else {
		loadCallSourceCSS().then(function(css) {
			if (!textarea.value) {
				textarea.value = css;
				if (window.state) window.state.theme.callScreen = css;
			}
			renderCallAfter(textarea.value);
		}).catch(function() {
			renderCallAfter('');
		});
	}

	textarea.removeEventListener('input', _onCallCSSChange);
	textarea.addEventListener('input', _onCallCSSChange);
}

function _onCallCSSChange() {
	var textarea = document.getElementById('te-css-call');
	if (!textarea) return;
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.callScreen = textarea.value;
	}
	renderCallAfter(textarea.value);
}

function renderCallAfter(css) {
	var styleEl = document.getElementById('call-after-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'call-after-style';
		document.head.appendChild(styleEl);
	}

	// ① 预览容器样式 —— 对齐其他预览框
	var override = [
		// 外层容器：透明、无 padding、圆角归零
		'#call-mock-after {',
		'  position: relative;',
		'  width: calc(100% - 40px);',
		'  margin: 0 20px;',
		'  padding: 0;',
		'  background: transparent;',
		'  border: none;',
		'  border-radius: 0;',
		'  overflow: visible;',
		'}',

		// 内层 call-screen：卡片样式
		'#call-mock-after .call-screen {',
		'  position: relative !important;',
		'  inset: auto !important;',
		'  width: 100% !important;',
		'  height: auto !important;',
		'  aspect-ratio: 9 / 14;',
		'  max-height: 500px;',
		'  border-radius: 14px !important;',
		'  overflow: hidden !important;',
		'  opacity: 1 !important;',
		'  display: block !important;',
		'  pointer-events: auto !important;',
		'  transform: none !important;',
		'  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);',
		'}',

		// 内层容器布局
		'#call-mock-after .call-container {',
		'  position: absolute !important;',
		'  inset: 0 !important;',
		'  display: flex !important;',
		'  flex-direction: column !important;',
		'}',

		// messages 区自适应
		'#call-mock-after .call-messages {',
		'  flex: 1 !important;',
		'  overflow-y: auto !important;',
		'  min-height: 0 !important;',
		'}',

		// 强制显示 thought-bar / input-bar（真实默认 display:none）
		'#call-mock-after .call-thought-bar.show {',
		'  display: flex !important;',
		'}',
		'#call-mock-after .call-input-bar.show {',
		'  display: flex !important;',
		'}',

		// 预览背景（替代真实头像背景）
		'#call-mock-after .call-bg {',
		'  background-image: linear-gradient(135deg, #e8e8ed 0%, #d4d4da 100%) !important;',
		'}',
	].join('\n');

	// ② 用户 CSS 作用域限定到 #call-mock-after
	var userScoped = scopeCSS(css || '', '#call-mock-after');

	styleEl.textContent = override + '\n\n' + userScoped;
}

function copyCallSource() {
	loadCallSourceCSS().then(function(css) {
		return navigator.clipboard.writeText(css);
	}).then(function() {
		showThemeFeedback('Copied!');
	}).catch(function(err) {
		console.error('copyCallSource error:', err);
		showThemeFeedback('Copy failed');
	});
}

function resetCallCSS() {
	var textarea = document.getElementById('te-css-call');
	localStorage.removeItem('theme-css-call');
	var styleEl = document.getElementById('custom-theme-call');
	if (styleEl) styleEl.remove();
	if (window.state && window.state.theme) window.state.theme.callScreen = '';
	loadCallSourceCSS().then(function(css) {
		if (textarea) {
			textarea.value = css;
			if (window.state) window.state.theme.callScreen = css;
		}
		renderCallAfter(textarea ? textarea.value : '');
	});
	showThemeFeedback('Reset');
}

function openThemeEditor(type) {
	document.getElementById('screen-theme').classList.remove('active');
	const editorScreen = document.getElementById(`screen-theme-${type}`);
	if (editorScreen) {
		editorScreen.classList.add('active');
				if (type === 'bubble') {
					initBubbleEditor();
				} else if (type === 'fontsize') {
					initFontSizeEditor();
					initGeneralEditor();
				} else if (type === 'chat') {
					initChatInterfaceEditor();
								} else if (type === 'meeting') {
					initMeetingStyleEditor();
								} else if (type === 'heart') {
					initHeartPanelEditor();
				} else if (type === 'archive') {
    initMeetingArchiveEditor();
} else if (type === 'call') {
    initCallInterfaceEditor();
} else {
    loadThemeCSS(type);
}
	}
}

function closeThemeEditor() {
	const editors = ['fontsize', 'bubble', 'chat', 'meeting', 'heart', 'archive', 'call'];
	editors.forEach(type => {
		const screen = document.getElementById(`screen-theme-${type}`);
		if (screen) screen.classList.remove('active');
	});
	document.getElementById('screen-theme').classList.add('active');
}

// ============================================================
//  Font Size Module
// ============================================================

const FONT_SIZE_MAP = {
	small:  '13px',
	medium: '15px',
	large:  '17px',
	xlarge: '20px',
};

function initFontSizeEditor() {
	const saved = (window.state && window.state.theme && window.state.theme.fontSize)
		|| localStorage.getItem('theme-font-size') || 'medium';
	const sel = document.getElementById('fs-select');
	if (sel) sel.value = saved;
}











function applyFontSize(value) {
	const size = FONT_SIZE_MAP[value] || '15px';
	document.documentElement.style.setProperty('--global-font-size', size);
	document.documentElement.style.fontSize = size;
	localStorage.setItem('theme-font-size', value);
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.fontSize = value;
		if (!window.state.theme.general) window.state.theme.general = {};
		window.state.theme.general.fontSize = value;
	}
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

// ============================================================
//  Bubble Style Module — Defaults
// ============================================================

const BUBBLE_DEFAULTS = {
	fontSize:      '14px',
	fontColor:     '#000000',
	bgUser:        '#A0A0A0',
	bgChar:        '#E9E9EA',
	avatarMode:    'last',
	avatarRadius:  50,
	bubbleRadius:  20,
	customCSS:     '',
};

// ============================================================
//  Bubble Editor — Init
// ============================================================

function initBubbleEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		if (!window.state.theme.bubble) window.state.theme.bubble = Object.assign({}, BUBBLE_DEFAULTS);
	}
	const saved = loadBubbleState();
	setParamControls(saved);
	syncCSSFromParams(saved);
	renderAfterPreview(saved);
	attachBubbleListeners();
}

function loadBubbleState() {
	const raw = localStorage.getItem('theme-bubble-params');
	const params = raw ? Object.assign({}, BUBBLE_DEFAULTS, JSON.parse(raw)) : Object.assign({}, BUBBLE_DEFAULTS);
	if (window.state && window.state.theme) window.state.theme.bubble = Object.assign({}, params);
	return params;
}

function saveBubbleState(params) {
	localStorage.setItem('theme-bubble-params', JSON.stringify(params));
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.bubble = Object.assign({}, params);
	}
}

// ============================================================
//  Bubble Editor — Control <-> Params
// ============================================================

function readParamControls() {
	return {
		fontSize:     document.getElementById('bp-font-size') ? document.getElementById('bp-font-size').value : BUBBLE_DEFAULTS.fontSize,
		fontColor:    document.getElementById('bp-font-color') ? document.getElementById('bp-font-color').value : BUBBLE_DEFAULTS.fontColor,
		bgUser:       document.getElementById('bp-bg-user') ? document.getElementById('bp-bg-user').value : BUBBLE_DEFAULTS.bgUser,
		bgChar:       document.getElementById('bp-bg-char') ? document.getElementById('bp-bg-char').value : BUBBLE_DEFAULTS.bgChar,
		avatarMode:   document.getElementById('bp-avatar-mode') ? document.getElementById('bp-avatar-mode').value : BUBBLE_DEFAULTS.avatarMode,
		avatarRadius: parseInt(document.getElementById('bp-avatar-radius') ? document.getElementById('bp-avatar-radius').value : BUBBLE_DEFAULTS.avatarRadius, 10),
		bubbleRadius: parseInt(document.getElementById('bp-bubble-radius') ? document.getElementById('bp-bubble-radius').value : BUBBLE_DEFAULTS.bubbleRadius, 10),
		customCSS:    document.getElementById('te-css-bubble') ? document.getElementById('te-css-bubble').value : '',
	};
}

function setParamControls(params) {
	_setVal('bp-font-size',     params.fontSize);
	_setVal('bp-font-color',    params.fontColor);
	_setVal('bp-bg-user',       params.bgUser);
	_setVal('bp-bg-char',       params.bgChar);
	_setVal('bp-avatar-mode',   params.avatarMode);
	_setVal('bp-avatar-radius', params.avatarRadius);
	_setVal('bp-bubble-radius', params.bubbleRadius);
	_setVal('te-css-bubble',    params.customCSS);
	updateSliderLabel('bp-avatar-radius', params.avatarRadius + '%');
	updateSliderLabel('bp-bubble-radius', params.bubbleRadius + 'px');
}

function _setVal(id, value) {
	const el = document.getElementById(id);
	if (el && value !== undefined && value !== null) el.value = value;
}

function updateSliderLabel(sliderId, text) {
	const valEl = document.getElementById(sliderId + '-val');
	if (valEl) valEl.textContent = text;
}

// ============================================================
//  Bubble Editor — CSS Generation
// ============================================================

function generateBubbleCSS(params) {
	const r  = params.bubbleRadius;
	const ar = params.avatarRadius;
	const avatarVis = params.avatarMode === 'always'
		? '.msg-avatar { visibility: visible !important; }'
		: '.msg-row.group-first .msg-avatar, .msg-row.group-middle .msg-avatar { visibility: hidden; }\n.msg-row.group-last .msg-avatar, .msg-row.group-solo .msg-avatar { visibility: visible; }';

	return [
		'/* === Bubble Style — auto-generated === */',
		'.msg-bubble {',
		'  font-size: ' + params.fontSize + ';',
		'  color: ' + params.fontColor + ';',
		'  border-radius: ' + r + 'px;',
		'}',
		'.msg-row.sent .msg-bubble {',
		'  background: ' + params.bgUser + ';',
		'  border-radius: ' + r + 'px;',
		'}',
		'.msg-row.received .msg-bubble {',
		'  background: ' + params.bgChar + ';',
		'  border-radius: ' + r + 'px;',
		'}',
		'.msg-row.sent .msg-bubble, .msg-row.received .msg-bubble,',
		'.msg-row.sent.group-first .msg-bubble, .msg-row.sent.group-middle .msg-bubble,',
		'.msg-row.sent.group-last .msg-bubble, .msg-row.sent.group-solo .msg-bubble,',
		'.msg-row.received.group-first .msg-bubble, .msg-row.received.group-middle .msg-bubble,',
		'.msg-row.received.group-last .msg-bubble, .msg-row.received.group-solo .msg-bubble {',
		'  border-radius: ' + r + 'px;',
		'}',
		'.msg-avatar { border-radius: ' + ar + '%; }',
		avatarVis,
	].join('\n');
}

function syncCSSFromParams(params) {
	const css = generateBubbleCSS(params);
	const textarea = document.getElementById('te-css-bubble');
	if (textarea) textarea.value = params.customCSS || css;
}

// ============================================================
//  Bubble Editor — CSS -> Params sync
// ============================================================

function parseCSSToParams(css) {
	const params = Object.assign({}, BUBBLE_DEFAULTS);
	function extract(re) { var m = css.match(re); return m ? m[1].trim() : null; }

	var fs = extract(/font-size:\s*([^;]+);/);
	if (fs) params.fontSize = fs;

	var fc = extract(/\.msg-bubble\s*\{[^}]*?\bcolor:\s*(#[0-9a-fA-F]{6})/);
	if (fc) params.fontColor = fc;

	var bgUser = extract(/\.msg-row\.sent\s+\.msg-bubble\s*\{[^}]*?background:\s*(#[0-9a-fA-F]{3,8})/);
	if (bgUser) params.bgUser = bgUser;

	var bgChar = extract(/\.msg-row\.received\s+\.msg-bubble\s*\{[^}]*?background:\s*(#[0-9a-fA-F]{3,8})/);
	if (bgChar) params.bgChar = bgChar;

	var br = extract(/\.msg-bubble\s*\{[^}]*?border-radius:\s*(\d+)px/);
	if (br) params.bubbleRadius = parseInt(br, 10);

	var ar = extract(/\.msg-avatar\s*\{\s*border-radius:\s*(\d+)%/);
	if (ar) params.avatarRadius = parseInt(ar, 10);

	params.customCSS = css;
	return params;
}

// ============================================================
//  Bubble Editor — Preview Rendering
// ============================================================

function renderAfterPreview(params) {
	const after = document.getElementById('bubble-preview-after');
	if (!after) return;

	const inBubbles  = after.querySelectorAll('.bp-bubble-received');
	const outBubbles = after.querySelectorAll('.bp-bubble-sent');
	const avatars    = after.querySelectorAll('.bp-avatar');

	inBubbles.forEach(function(b) {
		b.style.fontSize     = params.fontSize;
		b.style.color        = params.fontColor;
		b.style.background   = params.bgChar;
		b.style.borderRadius = params.bubbleRadius + 'px';
	});
	outBubbles.forEach(function(b) {
		b.style.fontSize     = params.fontSize;
		b.style.color        = '#ffffff';
		b.style.background   = params.bgUser;
		b.style.borderRadius = params.bubbleRadius + 'px';
	});
	avatars.forEach(function(av, i) {
		av.style.borderRadius = params.avatarRadius + '%';
		if (params.avatarMode === 'last') {
			av.style.visibility = (i === avatars.length - 1) ? 'visible' : 'hidden';
		} else {
			av.style.visibility = 'visible';
		}
	});

	var scopedStyle = document.getElementById('bubble-preview-after-style');
	if (!scopedStyle) {
		scopedStyle = document.createElement('style');
		scopedStyle.id = 'bubble-preview-after-style';
		document.head.appendChild(scopedStyle);
	}
	const custom = params.customCSS || '';
	const scoped = custom.replace(/(^|\})\s*([^{@\s][^{]*)\{/g, function(match, brace, sel) {
		var prefixed = sel.split(',').map(function(s) { return '#bubble-preview-after ' + s.trim(); }).join(', ');
		return brace + ' ' + prefixed + ' {';
	});
	scopedStyle.textContent = scoped;
}

// ============================================================
//  Bubble Editor — Event Listeners
// ============================================================

function attachBubbleListeners() {
	var paramIds = ['bp-font-size', 'bp-font-color', 'bp-bg-user', 'bp-bg-char', 'bp-avatar-mode', 'bp-avatar-radius', 'bp-bubble-radius'];
	paramIds.forEach(function(id) {
		var el = document.getElementById(id);
		if (!el) return;
		el.removeEventListener('input',  _onParamChange);
		el.removeEventListener('change', _onParamChange);
		el.addEventListener('input',  _onParamChange);
		el.addEventListener('change', _onParamChange);
	});
	var cssTA = document.getElementById('te-css-bubble');
	if (cssTA) {
		cssTA.removeEventListener('input', _onCSSChange);
		cssTA.addEventListener('input', _onCSSChange);
	}
}

function _onParamChange() {
	var params = readParamControls();
	updateSliderLabel('bp-avatar-radius', params.avatarRadius + '%');
	updateSliderLabel('bp-bubble-radius', params.bubbleRadius + 'px');
	var css = generateBubbleCSS(params);
	var cssTA = document.getElementById('te-css-bubble');
	if (cssTA) {
		if (!cssTA.value || cssTA.value.indexOf('/* === Bubble Style') === 0) {
			cssTA.value = css;
			params.customCSS = css;
		} else {
			params.customCSS = cssTA.value;
		}
	}
	renderAfterPreview(params);
}

function _onCSSChange() {
	var cssTA = document.getElementById('te-css-bubble');
	if (!cssTA) return;
	var params = parseCSSToParams(cssTA.value);
	setParamControls(params);
	renderAfterPreview(params);
}

// ============================================================
//  Bubble Editor — Apply
// ============================================================


















function applyBubbleParams() {
	var params = readParamControls();
	saveBubbleState(params);

	var generated = generateBubbleCSS(params);
	var custom = params.customCSS || '';
	var finalCSS = (custom.indexOf('/* === Bubble Style') === 0) ? custom : generated + '\n' + custom;

	var styleEl = document.getElementById('custom-theme-bubble');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-bubble';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = finalCSS;
	localStorage.setItem('theme-css-bubble', finalCSS);
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.chatBubble = finalCSS;
	}
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

// ============================================================
//  Bubble Editor — Copy Source Code
// ============================================================

function copyBubbleSourceCSS() {
	Promise.all([
		fetch('css/chat.css').then(function(r) { return r.text(); }),
		fetch('css/bubble-menu.css').then(function(r) { return r.text(); }),
	]).then(function(results) {
		var chatCSS   = results[0];
		var bubbleCSS = results[1];

		var bubbleSelectors = ['.msg-bubble', '.msg-row', '.msg-avatar', '.bubble-action-bar', '.bubble-menu'];

		function extract(src) {
			var blocks = [];
			var re = /([^{}]+)\{([^{}]*)\}/g;
			var m;
			while ((m = re.exec(src)) !== null) {
				var sel = m[1].trim();
				var relevant = bubbleSelectors.some(function(s) { return sel.indexOf(s) !== -1; });
				if (relevant) blocks.push(sel + ' {\n' + m[2].trim() + '\n}');
			}
			return blocks.join('\n\n');
		}

		var extracted = [
			'/* === From css/chat.css === */',
			extract(chatCSS),
			'',
			'/* === From css/bubble-menu.css === */',
			extract(bubbleCSS),
		].join('\n');

		return navigator.clipboard.writeText(extracted);
	}).then(function() {
		showThemeFeedback('Copied!');
	}).catch(function(err) {
		console.error('copyBubbleSourceCSS error:', err);
		showThemeFeedback('Copy failed');
	});
}

// ============================================================
//  Bubble Editor — Reset
// ============================================================

function resetBubbleParams() {
	var params = Object.assign({}, BUBBLE_DEFAULTS);
	saveBubbleState(params);
	setParamControls(params);
	syncCSSFromParams(params);
	renderAfterPreview(params);
	var styleEl = document.getElementById('custom-theme-bubble');
	if (styleEl) styleEl.textContent = '';
	localStorage.removeItem('theme-css-bubble');
	showThemeFeedback('Reset');
}

// ============================================================
//  Chat Interface Module
// ============================================================
//  Builds a realistic chat-interface mock (header + messages +
//  input bar) reusing the real chat class names so the preview
//  reflects the actual styling. Users edit CSS which is applied
//  live (scoped) to the "After" preview and globally to the app.
// ============================================================

const CHAT_INTERFACE_CSS_FILES = ['css/chat.css', 'css/chat-extras.css', 'css/call.css'];

// Selector fragments that identify chat-interface-related rules
const CHAT_INTERFACE_SELECTORS = [
	'#screen-chat', '.chat-header', '.ch-back', '.ch-center', '.ch-avatar', '.ch-name', '.ch-notes', '.ch-edit',
	'.chat-messages', '.msg-time', '.msg-row', '.msg-avatar', '.msg-bubble',
	'.voice-row', '.voice-wave', '.voice-text',
	'.sticker-msg', '.image-msg', '.sim-image', '.transfer-msg', '.transfer-card', '.transfer-actions', '.transfer-status', '.tc-',
	'.call-msg', '.call-card', '.call-icon-wrap', '.call-type-icon', '.call-info', '.call-label', '.call-status', '.call-actions', '.call-accept-btn', '.call-decline-btn',
	'.msg-quote', '.msg-translation', '.msg-system-center', '.moment-bubble', '.recalled',
	'.chat-input-bar', '.chat-btn', '.respond-btn', '.chat-input-wrap', '.chat-send-btn',
	'.chat-quote-bar', '.cqb-', '.plus-menu', '.sticker-panel', '.sticker-grid', '.sticker-item',
	'.typing-indicator', '#typingInd'
];

function buildChatMockHTML() {
	return '' +
		'<div class="chat-header">' +
			'<button class="ch-back"><svg viewBox="0 0 22 22"><path d="M14 4l-8 7 8 7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
			'<div class="ch-center">' +
				'<div class="ch-avatar"></div>' +
				'<span class="ch-name">Alex</span>' +
			'</div>' +
			'<button class="ch-edit"><svg viewBox="0 0 22 22"><circle cx="11" cy="5" r="1.5" fill="#1d1d1f" stroke="none"/><circle cx="11" cy="11" r="1.5" fill="#1d1d1f" stroke="none"/><circle cx="11" cy="17" r="1.5" fill="#1d1d1f" stroke="none"/></svg></button>' +
		'</div>' +
		'<div class="chat-messages">' +
			'<div class="msg-time">Today 10:24</div>' +
			'<div class="msg-row received group-solo"><div class="msg-avatar"></div>' +
				'<div class="msg-bubble">Hey, how are you?</div></div>' +
			'<div class="msg-row sent group-solo"><div class="msg-avatar"></div>' +
				'<div class="msg-bubble"><div class="msg-quote"><div class="msg-quote-sender">Alex</div>' +
				'<div class="msg-quote-text">Hey, how are you?</div></div><div class="msg-quote-divider"></div>' +
				'I\'m good, thanks!</div></div>' +
			'<div class="msg-row received group-solo"><div class="msg-avatar"></div>' +
				'<div class="msg-bubble voice"><div class="voice-row">' +
				'<svg viewBox="0 0 20 20"><polygon points="4,2 18,10 4,18" fill="currentColor" stroke="none"/></svg>' +
				'<div class="voice-wave"><span style="height:8px"></span><span style="height:14px"></span><span style="height:10px"></span><span style="height:16px"></span><span style="height:7px"></span></div>' +
				'</div></div></div>' +
			'<div class="msg-row sent group-solo"><div class="msg-avatar"></div>' +
				'<div class="msg-bubble transfer-msg"><div class="transfer-card">' +
				'<div class="tc-label">Transfer</div><div class="tc-amount">\u00A5188</div>' +
				'<div class="tc-note">For dinner</div><div class="transfer-status pending">Pending</div>' +
				'</div></div></div>' +
			'<div class="msg-row received group-solo"><div class="msg-avatar"></div>' +
				'<div class="msg-bubble call-msg"><div class="call-card"><div class="call-icon-wrap">' +
				'<svg viewBox="0 0 20 20" class="call-type-icon"><path d="M6.6 3H5A2 2 0 003 5c0 7.2 5.8 13 13 13a2 2 0 002-2v-1.6a1.5 1.5 0 00-1-1.4l-2.7-.8a1.5 1.5 0 00-1.5.4l-1 1A9.4 9.4 0 017.4 9l1-1a1.5 1.5 0 00.4-1.5l-.8-2.7A1.5 1.5 0 006.6 3z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
				'</div><div class="call-info"><div class="call-label">Voice Call</div>' +
				'<div class="call-actions"><button class="call-accept-btn">Accept</button>' +
				'<button class="call-decline-btn">Decline</button></div></div></div></div></div>' +
			'<div class="msg-system-center">You recalled a message</div>' +
		'</div>' +
				'<div class="chat-input-bar chat-input-area chat-bottom-bar">' +
			'<button class="chat-btn"><svg viewBox="0 0 22 22"><path d="M11 4v14M4 11h14" stroke-width="2" stroke-linecap="round"/></svg></button>' +
			'<button class="chat-btn respond-btn"><svg viewBox="0 0 22 22"><path d="M4 18V8a2 2 0 012-2h6l4 4v8a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M12 6v4h4"/><path d="M8 13h6M8 16h4"/></svg></button>' +
			'<div class="chat-input-wrap"><textarea rows="1" placeholder="iMessage"></textarea></div>' +
			'<button class="chat-send-btn"><svg viewBox="0 0 20 20"><path d="M3.5 10L16 3.5 12.5 17l-3-5.5z" stroke-linejoin="round"/><path d="M16 3.5L9.5 11.5" stroke-linecap="round"/></svg></button>' +
		'</div>';
}

function initChatInterfaceEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
	}

	// Render the mock structure into both preview panes
	var mock = buildChatMockHTML();
	var beforeEl = document.getElementById('ci-mock-before');
	var afterEl = document.getElementById('ci-mock-after');
	if (beforeEl) beforeEl.innerHTML = mock;
	if (afterEl) afterEl.innerHTML = mock;

	var textarea = document.getElementById('te-css-chat');
	if (!textarea) return;

	var saved = (window.state && window.state.theme && window.state.theme.chatInterface)
		|| localStorage.getItem('theme-css-chat');

	if (saved) {
		textarea.value = saved;
		if (window.state) window.state.theme.chatInterface = saved;
		renderChatInterfaceAfter(saved);
	} else {
		// Populate with real CSS extracted from the source files
		loadChatInterfaceSourceCSS().then(function(css) {
			if (!textarea.value) {
				textarea.value = css;
				if (window.state) window.state.theme.chatInterface = css;
			}
			renderChatInterfaceAfter(textarea.value);
		}).catch(function() {
			renderChatInterfaceAfter(textarea.value);
		});
	}

	textarea.removeEventListener('input', _onChatInterfaceCSSChange);
	textarea.addEventListener('input', _onChatInterfaceCSSChange);
}

function _onChatInterfaceCSSChange() {
	var textarea = document.getElementById('te-css-chat');
	if (!textarea) return;
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.chatInterface = textarea.value;
	}
	renderChatInterfaceAfter(textarea.value);
}

// Scope user CSS to the #ci-mock-after container and inject it
function renderChatInterfaceAfter(css) {
	var styleEl = document.getElementById('ci-after-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'ci-after-style';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = scopeCSS(css || '', '#ci-mock-after');
}

// Prefix every selector in a CSS string with a scope selector.
// Leaves @-rules (media/keyframes) blocks intact where possible.
function scopeCSS(css, scope) {
	if (!css) return '';
	return css.replace(/(^|\})\s*([^{}@]+)\{/g, function(match, brace, selectors) {
		var scoped = selectors.split(',').map(function(sel) {
			sel = sel.trim();
			if (!sel) return sel;
			return scope + ' ' + sel;
		}).join(', ');
		return brace + ' ' + scoped + ' {';
	});
}

// Extract chat-interface-relevant rule blocks from the source CSS files
function extractChatInterfaceCSS(src, fileLabel) {
	var blocks = [];
	var re = /([^{}]+)\{([^{}]*)\}/g;
	var m;
	while ((m = re.exec(src)) !== null) {
		var sel = m[1].trim();
		if (!sel || sel.charAt(0) === '@') continue;
		var relevant = CHAT_INTERFACE_SELECTORS.some(function(s) { return sel.indexOf(s) !== -1; });
		if (relevant) blocks.push(sel + ' {\n' + m[2].trim() + '\n}');
	}
	if (!blocks.length) return '';
	return '/* === From ' + fileLabel + ' === */\n' + blocks.join('\n\n');
}

function loadChatInterfaceSourceCSS() {
	return Promise.all(CHAT_INTERFACE_CSS_FILES.map(function(f) {
		return fetch(f).then(function(r) { return r.text(); }).catch(function() { return ''; });
	})).then(function(contents) {
		var parts = [];
		contents.forEach(function(txt, i) {
			if (!txt) return;
			var extracted = extractChatInterfaceCSS(txt, CHAT_INTERFACE_CSS_FILES[i]);
			if (extracted) parts.push(extracted);
		});
		return parts.join('\n\n');
	});
}



















function applyChatInterfaceCSS() {
	var textarea = document.getElementById('te-css-chat');
	if (!textarea) return;
	var css = textarea.value;
	localStorage.setItem('theme-css-chat', css);
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.chatInterface = css;
	}
	var styleEl = document.getElementById('custom-theme-chat');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-chat';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
	renderChatInterfaceAfter(css);
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

function copyChatInterfaceSource() {
	loadChatInterfaceSourceCSS().then(function(css) {
		return navigator.clipboard.writeText(css);
	}).then(function() {
		showThemeFeedback('Copied!');
	}).catch(function(err) {
		console.error('copyChatInterfaceSource error:', err);
		showThemeFeedback('Copy failed');
	});
}

function resetChatInterfaceCSS() {
	var textarea = document.getElementById('te-css-chat');
	localStorage.removeItem('theme-css-chat');
	var styleEl = document.getElementById('custom-theme-chat');
	if (styleEl) styleEl.remove();
	if (window.state && window.state.theme) window.state.theme.chatInterface = '';
	// Reload real source CSS defaults back into the editor
	loadChatInterfaceSourceCSS().then(function(css) {
		if (textarea) {
			textarea.value = css;
			if (window.state) window.state.theme.chatInterface = css;
		}
		renderChatInterfaceAfter(textarea ? textarea.value : '');
	});
	showThemeFeedback('Reset');
}

// ============================================================
//  Heart Panel Module
// ============================================================
//  Uses real class names from .heart-voice-card so the preview
//  reflects the actual panel styling.
// ============================================================

const HEART_PANEL_CSS_FILE = 'css/chat-extras.css';

const HEART_PANEL_SELECTORS = [
	'.heart-voice-card', '.hv-header', '.hv-title', '.hv-close',
	'.hv-avatar-section', '.hv-avatar', '.hv-char-name',
	'.hv-content', '.hv-section', '.hv-section-label', '.hv-section-text',
	'.hv-thought', '.hv-divider', '.center-modal-overlay',
];

function extractHeartPanelCSS(src) {
	var blocks = [];
	var re = /([^{}]+)\{([^{}]*)\}/g;
	var m;
	while ((m = re.exec(src)) !== null) {
		var sel = m[1].trim();
		if (!sel || sel.charAt(0) === '@') continue;
		var relevant = HEART_PANEL_SELECTORS.some(function(s) { return sel.indexOf(s) !== -1; });
		if (relevant) blocks.push(sel + ' {\n' + m[2].trim() + '\n}');
	}
	return blocks.length ? '/* === From css/chat-extras.css === */\n' + blocks.join('\n\n') : '';
}

function loadHeartPanelSourceCSS() {
	return fetch(HEART_PANEL_CSS_FILE)
		.then(function(r) { return r.text(); })
		.then(function(txt) { return extractHeartPanelCSS(txt); })
		.catch(function() { return ''; });
}

function initHeartPanelEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
	}

	var textarea = document.getElementById('te-css-heart');
	if (!textarea) return;

	var saved = (window.state && window.state.theme && window.state.theme.heartPanel)
		|| localStorage.getItem('theme-css-heart');

	if (saved) {
		textarea.value = saved;
		if (window.state) window.state.theme.heartPanel = saved;
		renderHeartPanelAfter(saved);
	} else {
		loadHeartPanelSourceCSS().then(function(css) {
			if (!textarea.value) {
				textarea.value = css;
				if (window.state) window.state.theme.heartPanel = css;
			}
			renderHeartPanelAfter(textarea.value);
		}).catch(function() {
			renderHeartPanelAfter('');
		});
	}

	textarea.removeEventListener('input', _onHeartPanelCSSChange);
	textarea.addEventListener('input', _onHeartPanelCSSChange);
}

function _onHeartPanelCSSChange() {
	var textarea = document.getElementById('te-css-heart');
	if (!textarea) return;
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.heartPanel = textarea.value;
	}
	renderHeartPanelAfter(textarea.value);
}

function renderHeartPanelAfter(css) {
	var styleEl = document.getElementById('hp-after-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'hp-after-style';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = scopeCSS(css || '', '#hp-mock-after');
}



















function applyHeartPanelCSS() {
	var textarea = document.getElementById('te-css-heart');
	if (!textarea) return;
	var css = textarea.value;
	localStorage.setItem('theme-css-heart', css);
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.heartPanel = css;
	}
	var styleEl = document.getElementById('custom-theme-heart');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-heart';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
	renderHeartPanelAfter(css);
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

function copyHeartPanelSourceCSS() {
	loadHeartPanelSourceCSS().then(function(css) {
		return navigator.clipboard.writeText(css);
	}).then(function() {
		showThemeFeedback('Copied!');
	}).catch(function(err) {
		console.error('copyHeartPanelSourceCSS error:', err);
		showThemeFeedback('Copy failed');
	});
}

function resetHeartPanelCSS() {
	var textarea = document.getElementById('te-css-heart');
	localStorage.removeItem('theme-css-heart');
	var styleEl = document.getElementById('custom-theme-heart');
	if (styleEl) styleEl.remove();
	if (window.state && window.state.theme) window.state.theme.heartPanel = '';
	loadHeartPanelSourceCSS().then(function(css) {
		if (textarea) {
			textarea.value = css;
			if (window.state) window.state.theme.heartPanel = css;
		}
		renderHeartPanelAfter(textarea ? textarea.value : '');
	});
	showThemeFeedback('Reset');
}

// ============================================================
//  Generic CSS Management (other editors)
// ============================================================

function loadThemeCSS(type) {
	var textarea = document.getElementById('te-css-' + type);
	if (!textarea) return;
	var saved = localStorage.getItem('theme-css-' + type);
	if (saved) textarea.value = saved;
}














function applyThemeCSS(type) {
	var textarea = document.getElementById('te-css-' + type);
	if (!textarea) return;
	var css = textarea.value;
	localStorage.setItem('theme-css-' + type, css);
	// Mirror into state.theme for cloud sync
	var themeKeyMap = { call: 'callScreen', topbar: 'chatTopBar', input: 'chatInput', cards: 'chatCards' };
	var stateKey = themeKeyMap[type] || type;
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme[stateKey] = css;
	}
	var styleEl = document.getElementById('custom-theme-' + type);
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-' + type;
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

function copyThemeSource(type) {
	var textarea = document.getElementById('te-css-' + type);
	if (!textarea) return;
	navigator.clipboard.writeText(textarea.value).then(function() {
		showThemeFeedback('Copied');
	}).catch(function(err) {
		console.error('Copy failed:', err);
	});
}

function resetThemeCSS(type) {
	var textarea = document.getElementById('te-css-' + type);
	if (!textarea) return;
	localStorage.removeItem('theme-css-' + type);
	textarea.value = '';
	var styleEl = document.getElementById('custom-theme-' + type);
	if (styleEl) styleEl.remove();
	showThemeFeedback('Reset');
}

// ============================================================
//  Feedback
// ============================================================

// ─── 页面 → 标签 ───
var _THEME_APPLY_LABELS = {
  'screen-theme-fontsize': '通用设置',
  'screen-theme-bubble':   '气泡样式',
  'screen-theme-chat':     '聊天界面',
  'screen-theme-meeting':  'Meeting 样式',
  'screen-theme-heart':    '心声面板',
  'screen-theme-archive':  '存档卡片',
  'screen-theme-call':     '通话界面'
};

// ─── 验证 Apply 是否真的写入了东西 ───
function _validateThemeApply(screenId) {
  function styleHasContent(id) {
    var el = document.getElementById(id);
    return !!(el && el.textContent && el.textContent.trim().length > 0);
  }
  function stateHasContent(key) {
    if (!window.state || !window.state.theme) return false;
    var v = window.state.theme[key];
    return !!(v && String(v).trim().length > 0);
  }

  switch (screenId) {
    case 'screen-theme-fontsize': {
      // 字体大小 或 任意 general 设置
      var hasFont = stateHasContent('fontSize');
      var hasDesktopBg   = styleHasContent('custom-desktop-bg-style');
      var hasDesktopIcon = styleHasContent('custom-desktop-icon-style');
      var hasChatBg      = styleHasContent('custom-chat-bg-style');
      var g = (typeof _getGeneralState === 'function') ? _getGeneralState() : null;
      var hasHomeIcons = !!(g && g.homeIcons && Object.keys(g.homeIcons).length > 0);
      return hasFont || hasDesktopBg || hasDesktopIcon || hasChatBg || hasHomeIcons;
    }
    case 'screen-theme-bubble':
      return styleHasContent('custom-theme-bubble') && stateHasContent('chatBubble');
    case 'screen-theme-chat':
      return styleHasContent('custom-theme-chat') && stateHasContent('chatInterface');
    case 'screen-theme-meeting':
      return styleHasContent('custom-theme-meeting') && stateHasContent('meetingStyle');
    case 'screen-theme-heart':
      return styleHasContent('custom-theme-heart') && stateHasContent('heartPanel');
    case 'screen-theme-archive':
      return styleHasContent('custom-theme-archive') && stateHasContent('meetingArchive');
    case 'screen-theme-call':
      return styleHasContent('custom-theme-call') && stateHasContent('callScreen');
    default:
      return null;   // 不在映射中 → 不弹窗
  }
}

function showThemeFeedback(message) {
	console.log('Theme: ' + message);
	var navTitle = document.querySelector('.screen.active .nav-title');
	if (navTitle) {
		var original = navTitle.textContent;
		navTitle.textContent = message;
		setTimeout(function() { navTitle.textContent = original; }, 800);
	}

	// ★ 只在 'Applied' 时做验证 + 弹窗
	if (message !== 'Applied') return;

	var activeScreen = document.querySelector('.screen.active');
	if (!activeScreen) return;
	var sid = activeScreen.id;

	var ok = _validateThemeApply(sid);

	if (ok === true) {
		var label = _THEME_APPLY_LABELS[sid] || '设置';
		console.log('[Theme] Apply 验证通过 |', label);
		showThemeSuccessDialog('已应用', label + ' 已保存 · 可退出查看效果');
	} else if (ok === false) {
		console.warn('[Theme] Apply 验证失败 | screen:', sid, '（style 或 state 没写入）');
	} else {
		console.log('[Theme] 当前页面不在 Apply 映射中，不弹窗');
	}
}

// ============================================================
//  Meeting Style Module
// ============================================================

const MEETING_STYLE_CSS_FILES = ['css/meeting.css'];

// Selector fragments that identify meeting-main-interface rules.
// Covers the chat scroll area, message cards, top nav, and bottom bar.
const MEETING_STYLE_SELECTORS = [
	'.mtg-chat-scroll', '.mtg-chat-content', '.mtg-chat-bar', '.mtg-chat-bar-row',
	'.mtg-chat-input', '.mtg-chat-send', '.mtg-edit-banner',
	'.mtg-msg-card', '.mtg-msg-header', '.mtg-msg-avatar', '.mtg-msg-avatar-placeholder',
	'.mtg-msg-meta', '.mtg-msg-sender', '.mtg-msg-time', '.mtg-msg-body',
	'.mtg-msg-actions', '.mtg-msg-action-btn', '.mtg-msg-card-system',
	'.mtg-summary-card', '.mtg-summary-header', '.mtg-summary-text',
	'.mtg-typing-indicator', '.mtg-chat-empty',
	'.mtg-write-nav-center', '.mtg-write-nav-name', '.mtg-write-nav-char',
];

function buildMeetingMockHTML() {
	return (
		'<div class="ms-mock-topbar">' +
			'<div class="ms-mock-topbar-left">' +
				'<div class="ms-mock-avatar"></div>' +
				'<div class="ms-mock-name-col">' +
					'<div class="ms-mock-name"></div>' +
					'<div class="ms-mock-sub"></div>' +
				'</div>' +
			'</div>' +
			'<div class="ms-mock-topbar-btns">' +
				'<div class="ms-mock-icon-btn"></div>' +
				'<div class="ms-mock-icon-btn"></div>' +
			'</div>' +
		'</div>' +
		'<div class="ms-mock-messages">' +
			'<div class="ms-mock-card meeting-card">' +
				'<div class="ms-mock-card-header">' +
					'<div class="ms-mock-card-avatar meeting-header"></div>' +
					'<div class="ms-mock-card-meta">' +
						'<div class="ms-mock-card-sender"></div>' +
						'<div class="ms-mock-card-time"></div>' +
					'</div>' +
				'</div>' +
				'<div class="ms-mock-card-body"><div class="ms-mock-line" style="width:88%"></div><div class="ms-mock-line" style="width:72%"></div></div>' +
			'</div>' +
			'<div class="ms-mock-card meeting-card">' +
				'<div class="ms-mock-card-header">' +
					'<div class="ms-mock-card-avatar meeting-header"></div>' +
					'<div class="ms-mock-card-meta">' +
						'<div class="ms-mock-card-sender"></div>' +
						'<div class="ms-mock-card-time" style="width:28px"></div>' +
					'</div>' +
				'</div>' +
				'<div class="ms-mock-card-body"><div class="ms-mock-line" style="width:60%"></div></div>' +
			'</div>' +
			'<div class="ms-mock-card meeting-card">' +
				'<div class="ms-mock-card-header">' +
					'<div class="ms-mock-card-avatar meeting-header"></div>' +
					'<div class="ms-mock-card-meta">' +
						'<div class="ms-mock-card-sender" style="width:50px"></div>' +
						'<div class="ms-mock-card-time" style="width:24px"></div>' +
					'</div>' +
				'</div>' +
				'<div class="ms-mock-card-body"><div class="ms-mock-line" style="width:94%"></div><div class="ms-mock-line" style="width:80%"></div><div class="ms-mock-line" style="width:55%"></div></div>' +
			'</div>' +
		'</div>' +
		'<div class="ms-mock-bottombar meeting-input-area">' +
			'<div class="ms-mock-input"></div>' +
			'<div class="ms-mock-send"></div>' +
		'</div>'
	);
}

function extractMeetingStyleCSS(src) {
	var blocks = [];
	var re = /([^{}]+)\{([^{}]*)\}/g;
	var m;
	while ((m = re.exec(src)) !== null) {
		var sel = m[1].trim();
		if (!sel || sel.charAt(0) === '@') continue;
		var relevant = MEETING_STYLE_SELECTORS.some(function(s) { return sel.indexOf(s) !== -1; });
		if (relevant) blocks.push(sel + ' {\n' + m[2].trim() + '\n}');
	}
	return blocks.length ? '/* === From css/meeting.css === */\n' + blocks.join('\n\n') : '';
}

function loadMeetingStyleSourceCSS() {
	return fetch('css/meeting.css')
		.then(function(r) { return r.text(); })
		.then(function(txt) { return extractMeetingStyleCSS(txt); })
		.catch(function() { return ''; });
}

function initMeetingStyleEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
	}

	var mock = buildMeetingMockHTML();
	var beforeEl = document.getElementById('ms-mock-before');
	var afterEl  = document.getElementById('ms-mock-after');
	if (beforeEl) beforeEl.innerHTML = mock;
	if (afterEl)  afterEl.innerHTML  = mock;

	var textarea = document.getElementById('te-css-meeting');
	if (!textarea) return;

	var saved = (window.state && window.state.theme && window.state.theme.meetingStyle)
		|| localStorage.getItem('theme-css-meeting');

	if (saved) {
		textarea.value = saved;
		if (window.state) window.state.theme.meetingStyle = saved;
		renderMeetingStyleAfter(saved);
	} else {
		loadMeetingStyleSourceCSS().then(function(css) {
			if (!textarea.value) {
				textarea.value = css;
				if (window.state) window.state.theme.meetingStyle = css;
			}
			renderMeetingStyleAfter(textarea.value);
		}).catch(function() {
			renderMeetingStyleAfter('');
		});
	}

	textarea.removeEventListener('input', _onMeetingStyleCSSChange);
	textarea.addEventListener('input', _onMeetingStyleCSSChange);
}

function _onMeetingStyleCSSChange() {
	var textarea = document.getElementById('te-css-meeting');
	if (!textarea) return;
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.meetingStyle = textarea.value;
	}
	renderMeetingStyleAfter(textarea.value);
}

function renderMeetingStyleAfter(css) {
	var styleEl = document.getElementById('ms-after-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'ms-after-style';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = scopeCSS(css || '', '#ms-mock-after');
}



















function applyMeetingStyleCSS() {
	var textarea = document.getElementById('te-css-meeting');
	if (!textarea) return;
	var css = textarea.value;
	localStorage.setItem('theme-css-meeting', css);
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.meetingStyle = css;
	}
	var styleEl = document.getElementById('custom-theme-meeting');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-meeting';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
	renderMeetingStyleAfter(css);
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

function copyMeetingSourceCSS() {
	loadMeetingStyleSourceCSS().then(function(css) {
		return navigator.clipboard.writeText(css);
	}).then(function() {
		showThemeFeedback('Copied!');
	}).catch(function(err) {
		console.error('copyMeetingSourceCSS error:', err);
		showThemeFeedback('Copy failed');
	});
}

function resetMeetingStyleCSS() {
	var textarea = document.getElementById('te-css-meeting');
	localStorage.removeItem('theme-css-meeting');
	var styleEl = document.getElementById('custom-theme-meeting');
	if (styleEl) styleEl.remove();
	if (window.state && window.state.theme) window.state.theme.meetingStyle = '';
	loadMeetingStyleSourceCSS().then(function(css) {
		if (textarea) {
			textarea.value = css;
			if (window.state) window.state.theme.meetingStyle = css;
		}
		renderMeetingStyleAfter(textarea ? textarea.value : '');
	});
	showThemeFeedback('Reset');
}

// ============================================================
//  Meeting Archive Module
// ============================================================
//  Renders real .mtg-archive-card mock cards in Before/After
//  panes. The textarea is pre-filled with archive-related rules
//  extracted live from css/meeting.css.
// ============================================================

const MEETING_ARCHIVE_CSS_FILE = 'css/meeting.css';

const MEETING_ARCHIVE_SELECTORS = [
	'.mtg-archive-card',
	'.mtg-archive-card-body',
	'.mtg-archive-card-name',
	'.mtg-archive-card-info',
	'.mtg-archive-info-row',
	'.mtg-archive-actions',
	'.mtg-archive-action-btn',
	'.mtg-manage-card',
	'.mtg-manage-card-name',
	'.mtg-manage-card-info',
	'.mtg-manage-info-row',
	'.mtg-status-dot',
	'.mtg-empty-state',
];

function buildArchiveMockHTML() {
	return (
		'<div class="mtg-archive-card">' +
			'<div class="mtg-archive-card-body">' +
				'<div class="mtg-archive-card-name">Evening Conversation</div>' +
				'<div class="mtg-archive-card-info">' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5"/><path d="M8 5v3l2 1"/></svg>' +
						'<span>2025-06-10 · 12 rounds</span>' +
					'</div>' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><circle cx="6" cy="5" r="2"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="12" cy="5" r="1.5"/><path d="M11 13c0-1.7 1-3 2-3"/></svg>' +
						'<span>Aria, Luna</span>' +
					'</div>' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/><path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4"/></svg>' +
						'<span>A quiet evening chat about dreams…</span>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="mtg-archive-actions">' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="2"/></svg>' +
					'<span>View</span>' +
				'</button>' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M2 10V13h3l7-7-3-3-7 7z"/><path d="M11 4l1-1 1 1-1 1-1-1z"/></svg>' +
					'<span>Edit</span>' +
				'</button>' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l.5 9h7l.5-9"/></svg>' +
					'<span>Delete</span>' +
				'</button>' +
			'</div>' +
		'</div>' +
		'<div class="mtg-archive-card">' +
			'<div class="mtg-archive-card-body">' +
				'<div class="mtg-archive-card-name">Weekend Getaway</div>' +
				'<div class="mtg-archive-card-info">' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5"/><path d="M8 5v3l2 1"/></svg>' +
						'<span>2025-06-08 · 8 rounds</span>' +
					'</div>' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><circle cx="6" cy="5" r="2"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="12" cy="5" r="1.5"/><path d="M11 13c0-1.7 1-3 2-3"/></svg>' +
						'<span>Aria</span>' +
					'</div>' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/><path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4"/></svg>' +
						'<span>Planning a trip together…</span>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="mtg-archive-actions">' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="2"/></svg>' +
					'<span>View</span>' +
				'</button>' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M2 10V13h3l7-7-3-3-7 7z"/><path d="M11 4l1-1 1 1-1 1-1-1z"/></svg>' +
					'<span>Edit</span>' +
				'</button>' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l.5 9h7l.5-9"/></svg>' +
					'<span>Delete</span>' +
				'</button>' +
			'</div>' +
		'</div>' +
		'<div class="mtg-archive-card">' +
			'<div class="mtg-archive-card-body">' +
				'<div class="mtg-archive-card-name">Late Night Thoughts</div>' +
				'<div class="mtg-archive-card-info">' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5"/><path d="M8 5v3l2 1"/></svg>' +
						'<span>2025-06-05 · 20 rounds</span>' +
					'</div>' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><circle cx="6" cy="5" r="2"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="12" cy="5" r="1.5"/><path d="M11 13c0-1.7 1-3 2-3"/></svg>' +
						'<span>Luna</span>' +
					'</div>' +
					'<div class="mtg-archive-info-row">' +
						'<svg viewBox="0 0 16 16"><path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/><path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4"/></svg>' +
						'<span>Sharing thoughts under the stars…</span>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="mtg-archive-actions">' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="2"/></svg>' +
					'<span>View</span>' +
				'</button>' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M2 10V13h3l7-7-3-3-7 7z"/><path d="M11 4l1-1 1 1-1 1-1-1z"/></svg>' +
					'<span>Edit</span>' +
				'</button>' +
				'<button class="mtg-archive-action-btn">' +
					'<svg viewBox="0 0 16 16"><path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l.5 9h7l.5-9"/></svg>' +
					'<span>Delete</span>' +
				'</button>' +
			'</div>' +
		'</div>'
	);
}

function extractMeetingArchiveCSS(src) {
	var blocks = [];
	var re = /([^{}]+)\{([^{}]*)\}/g;
	var m;
	while ((m = re.exec(src)) !== null) {
		var sel = m[1].trim();
		if (!sel || sel.charAt(0) === '@') continue;
		var relevant = MEETING_ARCHIVE_SELECTORS.some(function(s) { return sel.indexOf(s) !== -1; });
		if (relevant) blocks.push(sel + ' {\n' + m[2].trim() + '\n}');
	}
	return blocks.length ? '/* === From css/meeting.css === */\n' + blocks.join('\n\n') : '';
}

function loadMeetingArchiveSourceCSS() {
	return fetch(MEETING_ARCHIVE_CSS_FILE)
		.then(function(r) { return r.text(); })
		.then(function(txt) { return extractMeetingArchiveCSS(txt); })
		.catch(function() { return ''; });
}

function initMeetingArchiveEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
	}

	var mock = buildArchiveMockHTML();
	var beforeEl = document.getElementById('archive-mock-before');
	var afterEl  = document.getElementById('archive-mock-after');
	if (beforeEl) beforeEl.innerHTML = mock;
	if (afterEl)  afterEl.innerHTML  = mock;

	var textarea = document.getElementById('te-css-archive');
	if (!textarea) return;

	var saved = (window.state && window.state.theme && window.state.theme.meetingArchive)
		|| localStorage.getItem('theme-css-archive');

	if (saved) {
		textarea.value = saved;
		if (window.state) window.state.theme.meetingArchive = saved;
		renderMeetingArchiveAfter(saved);
	} else {
		loadMeetingArchiveSourceCSS().then(function(css) {
			if (!textarea.value) {
				textarea.value = css;
				if (window.state) window.state.theme.meetingArchive = css;
			}
			renderMeetingArchiveAfter(textarea.value);
		}).catch(function() {
			renderMeetingArchiveAfter('');
		});
	}

	textarea.removeEventListener('input', _onMeetingArchiveCSSChange);
	textarea.addEventListener('input', _onMeetingArchiveCSSChange);
}

function _onMeetingArchiveCSSChange() {
	var textarea = document.getElementById('te-css-archive');
	if (!textarea) return;
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.meetingArchive = textarea.value;
	}
	renderMeetingArchiveAfter(textarea.value);
}

function renderMeetingArchiveAfter(css) {
	var styleEl = document.getElementById('archive-after-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'archive-after-style';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = scopeCSS(css || '', '#archive-mock-after');
}



















function applyMeetingArchiveCSS() {
	var textarea = document.getElementById('te-css-archive');
	if (!textarea) return;
	var css = textarea.value;
	localStorage.setItem('theme-css-archive', css);
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.meetingArchive = css;
	}
	var styleEl = document.getElementById('custom-theme-archive');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-archive';
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
	renderMeetingArchiveAfter(css);
	if (typeof saveState === 'function') saveState();
	showThemeFeedback('Applied');
}

function copyMeetingArchiveSourceCSS() {
	loadMeetingArchiveSourceCSS().then(function(css) {
		return navigator.clipboard.writeText(css);
	}).then(function() {
		showThemeFeedback('Copied!');
	}).catch(function(err) {
		console.error('copyMeetingArchiveSourceCSS error:', err);
		showThemeFeedback('Copy failed');
	});
}

function resetMeetingArchiveCSS() {
	var textarea = document.getElementById('te-css-archive');
	localStorage.removeItem('theme-css-archive');
	var styleEl = document.getElementById('custom-theme-archive');
	if (styleEl) styleEl.remove();
	var afterStyle = document.getElementById('archive-after-style');
	if (afterStyle) afterStyle.textContent = '';
	if (window.state && window.state.theme) window.state.theme.meetingArchive = '';
	loadMeetingArchiveSourceCSS().then(function(css) {
		if (textarea) {
			textarea.value = css;
			if (window.state) window.state.theme.meetingArchive = css;
		}
		renderMeetingArchiveAfter(textarea ? textarea.value : '');
	});
	showThemeFeedback('Reset');
}

// ============================================================
//  Init on load
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
	// Restore font size
	var savedFontSize = localStorage.getItem('theme-font-size');
	if (savedFontSize && FONT_SIZE_MAP[savedFontSize]) {
		document.documentElement.style.setProperty('--global-font-size', FONT_SIZE_MAP[savedFontSize]);
		document.documentElement.style.fontSize = FONT_SIZE_MAP[savedFontSize];
		if (window.state) {
			if (!window.state.theme) window.state.theme = {};
			window.state.theme.fontSize = savedFontSize;
		}
	}

		// Restore heart panel CSS into state
	var savedHeartCSS = localStorage.getItem('theme-css-heart');
	if (savedHeartCSS && window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.heartPanel = savedHeartCSS;
	}

		// Restore generic CSS for other editors
	var types = ['chat', 'meeting', 'call'];
	types.forEach(function(type) {
		var saved = localStorage.getItem('theme-css-' + type);
		if (saved) {
			var styleEl = document.getElementById('custom-theme-' + type);
			if (!styleEl) {
				styleEl = document.createElement('style');
				styleEl.id = 'custom-theme-' + type;
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = saved;
		}
	});

	// Restore Meeting Archive CSS
	var savedArchiveCSS = localStorage.getItem('theme-css-archive');
	if (savedArchiveCSS) {
		var archiveStyleEl = document.getElementById('custom-theme-archive');
		if (!archiveStyleEl) {
			archiveStyleEl = document.createElement('style');
			archiveStyleEl.id = 'custom-theme-archive';
			document.head.appendChild(archiveStyleEl);
		}
		archiveStyleEl.textContent = savedArchiveCSS;
		if (window.state) {
			if (!window.state.theme) window.state.theme = {};
			window.state.theme.meetingArchive = savedArchiveCSS;
		}
	}

		// Mirror the chat-interface CSS into state.theme.chatInterface
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.chatInterface = localStorage.getItem('theme-css-chat') || '';
	}

	// Restore bubble CSS
	var savedBubbleCSS = localStorage.getItem('theme-css-bubble');
	if (savedBubbleCSS) {
		var styleEl = document.getElementById('custom-theme-bubble');
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = 'custom-theme-bubble';
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = savedBubbleCSS;
	}

		// Restore bubble params into state
	var savedParams = localStorage.getItem('theme-bubble-params');
	if (savedParams && window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.bubble = Object.assign({}, BUBBLE_DEFAULTS, JSON.parse(savedParams));
	}

	// Restore General settings
	restoreGeneralSettings();
});// ============================================================
//  General Module — init
// ============================================================

function initGeneralEditor() {
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		if (!window.state.theme.general) window.state.theme.general = {};
	}
	var g = _getGeneralState();
	_setGeneralThumbAndUrl('desktopBackground', g.desktopBackground);
	_setGeneralThumbAndUrl('desktopIcon', g.desktopIcon);
	_setGeneralThumbAndUrl('chatBackground', g.chatBackground);
	_migrateIconNamesToHomeIcons();
    _renderIconSettingsList();
}

function _getGeneralState() {
	var defaults = {
     desktopBackground: { type: 'url', value: '' },
     desktopIcon:       { type: 'url', value: '' },
     iconNames:         {},
     homeIcons:         {},
     chatBackground:    { type: 'url', value: '' }
	};
	var result = null;
	try {
		var raw = localStorage.getItem('theme-general');
		if (raw) {
			var parsed = JSON.parse(raw);
			result = Object.assign({}, defaults, parsed);
			if (!result.desktopBackground || typeof result.desktopBackground !== 'object') result.desktopBackground = defaults.desktopBackground;
			if (!result.chatBackground || typeof result.chatBackground !== 'object') result.chatBackground = defaults.chatBackground;
			if (!result.desktopIcon || typeof result.desktopIcon !== 'object') result.desktopIcon = defaults.desktopIcon;
		}
	} catch(e) { console.warn('[General] Failed to parse theme-general:', e); }
	if (!result) result = defaults;

	// ★★★ 关键：从 state 合并图标图片（LS 里现在只有 name/type，图片在 state）
	if (window.state && window.state.theme && window.state.theme.general &&
	    window.state.theme.general.homeIcons) {
		var stateIcons = window.state.theme.general.homeIcons;
		if (!result.homeIcons) result.homeIcons = {};
		Object.keys(stateIcons).forEach(function(k) {
			var si = stateIcons[k];
			if (!si) return;
			if (!result.homeIcons[k]) result.homeIcons[k] = {};
			// name 从 state 补
			if (!result.homeIcons[k].name && si.name) {
				result.homeIcons[k].name = si.name;
			}
			// icon.value 从 state 补（LS 里是空的）
			if (si.icon && si.icon.value) {
    result.homeIcons[k].icon = {
        type: si.icon.type,
        value: si.icon.value
    };
}
		});
	}
	return result;
}

function _saveGeneralState(g) {
	// ★ 不再深拷贝整个 g（16 个 8KB 图标 = 128KB × 2 份），
	//   改为手动构造只含 name + type 的 LS 版
	var gLS;
	if (g.homeIcons) {
		gLS = {
			desktopBackground: g.desktopBackground,
			desktopIcon:       g.desktopIcon,
			chatBackground:    g.chatBackground,
			iconNames:         g.iconNames || {},
			homeIcons: {}
		};
		Object.keys(g.homeIcons).forEach(function(k) {
			var item = g.homeIcons[k];
			gLS.homeIcons[k] = {
				name: item.name,
				icon: {
					type: (item.icon && item.icon.type) || 'default',
					value: ''
				}
			};
		});
	} else {
		gLS = g;
	}

	try {
		localStorage.setItem('theme-general', JSON.stringify(gLS));
	} catch(e) {
		console.warn('[General] LS 写入失败（已忽略）:', e.name);
	}

	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.general = g;
	}

	if (typeof window.saveState === 'function') {
		try { window.saveState(); } catch(e) {}
	}

	console.log('[General] State saved | desktopBg:', !!(g.desktopBackground && g.desktopBackground.value),
		'| chatBg:', !!(g.chatBackground && g.chatBackground.value),
		'| homeIcons:', g.homeIcons ? Object.keys(g.homeIcons).length : 0);
}

function _setGeneralThumbAndUrl(setting, data) {
	var thumbMap = { desktopBackground: 'desktopBgThumb', desktopIcon: 'desktopIconThumb', chatBackground: 'chatBgThumb' };
	var urlMap   = { desktopBackground: 'desktopBgUrl',   desktopIcon: 'desktopIconUrl',   chatBackground: 'chatBgUrl' };
	var thumb = document.getElementById(thumbMap[setting]);
	var urlEl = document.getElementById(urlMap[setting]);
	var val = (data && data.value) ? data.value : '';
	if (thumb) {
		thumb.style.backgroundImage = val ? 'url("' + val + '")' : '';
		thumb.classList.toggle('te-general-thumb--empty', !val);
	}
	if (urlEl && (!data || data.type !== 'local')) urlEl.value = val;
}

function onGeneralFileUpload(setting, inputEl) {
	var file = inputEl.files && inputEl.files[0];
	if (!file) { console.warn('[General] No file selected for', setting); return; }
	console.log('[General] Uploading file for', setting, '| name:', file.name, '| size:', file.size);
	var reader = new FileReader();
	reader.onload = function(e) {
		var dataUrl = e.target.result;
		console.log('[General] File read complete for', setting, '| dataUrl length:', dataUrl.length);
		var g = _getGeneralState();
		g[setting] = { type: 'local', value: dataUrl };
		_saveGeneralState(g);
		_setGeneralThumbAndUrl(setting, g[setting]);
		var urlMap = { desktopBackground: 'desktopBgUrl', desktopIcon: 'desktopIconUrl', chatBackground: 'chatBgUrl' };
		var urlEl = document.getElementById(urlMap[setting]);
		if (urlEl) urlEl.value = '';
		console.log('[General] Staged', setting, '| click Apply All to apply');
	};
	reader.onerror = function(e) {
		console.error('[General] FileReader error for', setting, e);
	};
	reader.readAsDataURL(file);
}

function onGeneralUrlInput(setting, value) {
	var trimmed = value.trim();
	console.log('[General] URL input for', setting, '| value:', trimmed.substring(0, 80));
	var g = _getGeneralState();
	g[setting] = { type: 'url', value: trimmed };
	_saveGeneralState(g);
	_setGeneralThumbAndUrl(setting, g[setting]);
}

function clearGeneralSetting(setting) {
	console.log('[General] Clearing setting:', setting);
	var g = _getGeneralState();
	g[setting] = { type: 'default', value: '' };
	_saveGeneralState(g);
	_setGeneralThumbAndUrl(setting, g[setting]);
	_applyGeneralSetting(setting, '');
	var fileMap = { desktopBackground: 'desktopBgFile', desktopIcon: 'desktopIconFile', chatBackground: 'chatBgFile' };
	var urlMap  = { desktopBackground: 'desktopBgUrl',  desktopIcon: 'desktopIconUrl',  chatBackground: 'chatBgUrl' };
	var fEl = document.getElementById(fileMap[setting]);
	var uEl = document.getElementById(urlMap[setting]);
	if (fEl) fEl.value = '';
	if (uEl) uEl.value = '';
	showThemeFeedback('Cleared');
}

function _applyGeneralSetting(setting, value) {
	console.log('[General] Applying setting:', setting, '| has value:', !!value);
	if (setting === 'desktopBackground') {
		_applyDesktopBackground(value);
	} else if (setting === 'desktopIcon') {
		_applyDesktopIconStyle(value);
	} else if (setting === 'chatBackground') {
		_applyChatBackground(value);
	}
}

function _applyDesktopBackground(value) {
	// Use a <style> tag approach for reliability (avoids specificity issues)
	var styleEl = document.getElementById('custom-desktop-bg-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-desktop-bg-style';
		document.head.appendChild(styleEl);
	}
	if (value) {
		styleEl.textContent = [
			'div#screen-home {',
			'  background: url("' + value + '") center / cover no-repeat !important;',
			'}',
			'#screen-home .home-pages,',
			'#screen-home .home-page {',
			'  background: transparent !important;',
			'}',
			'#screen-home .home-dock {',
			'  background: transparent !important;',
			'}'
		].join('\n');
		console.log('[General] Desktop background style injected');
	} else {
		styleEl.textContent = '';
		console.log('[General] Desktop background style cleared');
	}
}

function _applyDesktopIconStyle(value) {
	var styleEl = document.getElementById('custom-desktop-icon-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-desktop-icon-style';
		document.head.appendChild(styleEl);
	}
	if (value) {
		styleEl.textContent = [
			'#screen-home .app-icon svg { display: none !important; }',
			'#screen-home .app-icon::after {',
			'  content: "";',
			'  display: block;',
			'  width: 68%;',
			'  height: 68%;',
			'  background-image: url("' + value + '");',
			'  background-size: contain;',
			'  background-repeat: no-repeat;',
			'  background-position: center;',
			'}'
		].join('\n');
	} else {
		styleEl.textContent = '';
	}
}

function _applyChatBackground(value) {
	var styleEl = document.getElementById('custom-chat-bg-style');
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-chat-bg-style';
		document.head.appendChild(styleEl);
	}
	if (value) {
		styleEl.textContent = [
			'div#screen-chat {',
			'  background: url("' + value + '") center / cover no-repeat !important;',
			'}',
			'#screen-chat .chat-messages {',
			'  background: transparent !important;',
			'}',
			'#screen-chat .chat-header::before {',
			'  background: linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 50%, transparent 100%) !important;',
			'}',
			'#screen-chat .chat-input-bar::before {',
			'  background: linear-gradient(to top, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%) !important;',
			'}'
		].join('\n');
		console.log('[General] Chat background style injected');
	} else {
		styleEl.textContent = '';
		console.log('[General] Chat background style cleared');
	}
}

// ============================================================
//  General Module — Apply All
// ============================================================

function applyAllGeneralSettings() {
	// 1. Collect icon names from inputs
	var container = document.getElementById('iconSettingsList');
	var g = _getGeneralState();
	if (!g.homeIcons) g.homeIcons = {};
	if (container) {
		container.querySelectorAll('.te-icon-setting-name').forEach(function(inp) {
			var key = inp.dataset.iconKey;
			if (!g.homeIcons[key]) g.homeIcons[key] = {};
			g.homeIcons[key].name = inp.value.trim();
		});
		if (!g.iconNames) g.iconNames = {};
		Object.keys(g.homeIcons).forEach(function(key) {
			if (g.homeIcons[key].name) g.iconNames[key] = g.homeIcons[key].name;
		});
	}

	// 2. Apply desktop background
	var dbg = g.desktopBackground;
	_applyGeneralSetting('desktopBackground', (dbg && dbg.value) ? dbg.value : '');

	// 3. Apply desktop icon style
	var di = g.desktopIcon;
	_applyGeneralSetting('desktopIcon', (di && di.value) ? di.value : '');

	// 4. Apply chat background
	var cbg = g.chatBackground;
	_applyGeneralSetting('chatBackground', (cbg && cbg.value) ? cbg.value : '');

	// 5. Apply home icon names + images（先同步应用一次）
_applyHomeIconsToDOM(g.homeIcons);

// 6. Persist everything
_saveGeneralState(g);

// 7. ★ 200ms 后再用重试版应用一次（保险，防止 DOM 未就绪）
setTimeout(function () {
    if (window.__reapplyHomeIcons) window.__reapplyHomeIcons();
}, 200);

showThemeFeedback('Applied');
}

// ============================================================
//  General Module — Home Icons (name + image per icon)
// ============================================================

function _getDesktopIconDefs() {
	var defs = [];
	var wraps = document.querySelectorAll(
		'#screen-home .home-page .app-icon-wrap, #screen-home .home-dock .app-icon-wrap'
	);
	wraps.forEach(function(el) {
		var labelEl = el.querySelector('.app-label');
		if (!labelEl) return;
		// Skip blank placeholder icons
		if (labelEl.classList.contains('blank-label')) return;
		if (!labelEl.dataset.defaultLabel) {
			labelEl.dataset.defaultLabel = labelEl.textContent.trim();
		}
		var key = el.dataset.iconKey;
		if (!key) {
			var onclick = el.getAttribute('onclick') || '';
			key = labelEl.dataset.defaultLabel.replace(/\s+/g, '_').toLowerCase()
				+ '__' + onclick.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 18);
			el.dataset.iconKey = key;
		}
		// Store original SVG for reset
		var iconEl = el.querySelector('.app-icon');
		if (iconEl && !iconEl.dataset.originalSvg) {
			var svgEl = iconEl.querySelector('svg');
			if (svgEl) iconEl.dataset.originalSvg = svgEl.outerHTML;
		}
		defs.push({ key: key, defaultLabel: labelEl.dataset.defaultLabel, el: el });
	});
	return defs;
}

function _escHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function _keyToSafeId(key) {
	return key.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function _migrateIconNamesToHomeIcons() {
	var g = _getGeneralState();
	if (g.iconNames && Object.keys(g.iconNames).length && (!g.homeIcons || !Object.keys(g.homeIcons).length)) {
		g.homeIcons = {};
		Object.keys(g.iconNames).forEach(function(key) {
			if (g.iconNames[key]) {
				g.homeIcons[key] = {
					name: g.iconNames[key],
					icon: { type: 'default', value: '' }
				};
			}
		});
		_saveGeneralState(g);
	}
}

function _renderIconSettingsList() {
	var container = document.getElementById('iconSettingsList');
	if (!container) return;
	var defs = _getDesktopIconDefs();
	if (!defs.length) {
		container.innerHTML = '<div class="te-editor-label" style="color:#c7c7cc">No desktop icons found — navigate to the Home screen first, then re-open this editor.</div>';
		return;
	}
	var g = _getGeneralState();
	var homeIcons = g.homeIcons || {};

	container.innerHTML = defs.map(function(def) {
		var config = homeIcons[def.key] || {};
		var curName = (config.name !== undefined && config.name !== '') ? config.name : def.defaultLabel;
		var iconConfig = config.icon || { type: 'default', value: '' };
		var hasCustomIcon = iconConfig.type !== 'default' && iconConfig.value;
		var previewStyle = '';
		if (hasCustomIcon) {
			previewStyle = 'background-image:url(&quot;' + _escHtml(iconConfig.value) + '&quot;);';
		}
		// Get SVG for preview
		// Get SVG for preview — clone with proper attributes for visibility
var svgHtml = '';
if (!hasCustomIcon) {
	var iconEl = def.el.querySelector('.app-icon');
	if (iconEl) {
		var svgEl = iconEl.querySelector('svg');
		if (svgEl) {
			var clonedSvg = svgEl.cloneNode(true);
			// Ensure the SVG has a viewBox so it scales properly
			if (!clonedSvg.getAttribute('viewBox')) {
				clonedSvg.setAttribute('viewBox', '0 0 32 32');
			}
			// Remove any width/height that could conflict
			clonedSvg.removeAttribute('width');
			clonedSvg.removeAttribute('height');
			svgHtml = clonedSvg.outerHTML;
		}
	}
}
		var urlValue = (iconConfig.type === 'url') ? (iconConfig.value || '') : '';
		var safeId = _keyToSafeId(def.key);

		return '<div class="te-icon-setting-item">'
			+ '<div class="te-icon-setting-header">'
			+ '<div class="te-icon-setting-preview" id="iconPrev_' + safeId + '" style="' + previewStyle + '">'
			+ (hasCustomIcon ? '' : svgHtml)
			+ '</div>'
			+ '<div class="te-icon-setting-info">'
			+ '<span class="te-icon-setting-default">' + _escHtml(def.defaultLabel) + '</span>'
			+ '<input class="te-icon-setting-name" type="text" data-icon-key="' + _escHtml(def.key) + '" value="' + _escHtml(curName) + '" placeholder="' + _escHtml(def.defaultLabel) + '">'
			+ '</div>'
			+ '<button class="te-btn te-btn-ghost te-btn-sm te-icon-reset-btn" onclick="resetSingleHomeIcon(' + JSON.stringify(def.key).replace(/"/g, '&quot;') + ')">Reset</button>'
			+ '</div>'
			+ '<div class="te-icon-setting-image-row">'
			+ '<label class="te-upload-btn te-upload-btn-icon">'
			+ '<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onchange="onHomeIconFileUpload(' + JSON.stringify(def.key).replace(/"/g, '&quot;') + ', this)">'
			+ 'Upload'
			+ '</label>'
			+ '<input type="url" class="te-url-input te-url-input-icon" id="iconUrl_' + safeId + '" data-icon-key="' + _escHtml(def.key) + '" value="' + _escHtml(urlValue) + '" placeholder="Image URL..." oninput="onHomeIconUrlInput(' + JSON.stringify(def.key).replace(/"/g, '&quot;') + ', this.value)">'
			+ '</div>'
			+ '</div>';
	}).join('');
}

function onHomeIconFileUpload(key, inputEl) {
	var file = inputEl.files && inputEl.files[0];
	if (!file) return;

	console.log('[IconUpload] 开始 | key:', key,
		'| 文件名:', file.name,
		'| 原始大小:', (file.size / 1024).toFixed(1) + ' KB',
		'| MIME:', file.type);

	// ★ 小文件或 SVG 直接读；大图走压缩
	if (file.type === 'image/svg+xml' || file.size < 200 * 1024) {
		_readIconAsDataURL(file, function(dataUrl) {
			_finishIconUpload(key, dataUrl, inputEl);
		}, function(err) {
			_showIconUploadError(key, err);
		});
		return;
	}

	console.log('[IconUpload] 大图片，启用压缩 →');
	_compressImageFile(file, 256, 0.85, function(dataUrl) {
		console.log('[IconUpload] 压缩完成 | 新长度:', (dataUrl.length / 1024).toFixed(1) + ' KB');
		_finishIconUpload(key, dataUrl, inputEl);
	}, function(err) {
		console.error('[IconUpload] 压缩失败，退回原图:', err);
		_readIconAsDataURL(file, function(dataUrl) {
			_finishIconUpload(key, dataUrl, inputEl);
		}, function(err2) {
			_showIconUploadError(key, err2);
		});
	});
}

function _readIconAsDataURL(file, onOk, onErr) {
	var reader = new FileReader();
	var timeout = setTimeout(function() {
		try { reader.abort(); } catch(e) {}
		onErr(new Error('FileReader 超时（文件可能太大）'));
	}, 15000);
	reader.onload = function(e) {
		clearTimeout(timeout);
		onOk(e.target.result);
	};
	reader.onerror = function(e) {
		clearTimeout(timeout);
		onErr(new Error('FileReader 读取失败: ' + (e.target.error && e.target.error.message || 'unknown')));
	};
	reader.readAsDataURL(file);
}

function _compressImageFile(file, maxDim, quality, onOk, onErr) {
	var url = URL.createObjectURL(file);
	var img = new Image();
	var done = false;

	var timeout = setTimeout(function() {
		if (done) return;
		done = true;
		URL.revokeObjectURL(url);
		onErr(new Error('图片加载超时'));
	}, 20000);

	img.onload = function() {
		if (done) return;
		done = true;
		clearTimeout(timeout);
		try {
			var w = img.naturalWidth || img.width;
			var h = img.naturalHeight || img.height;
			var scale = Math.min(1, maxDim / Math.max(w, h));
			var tw = Math.round(w * scale);
			var th = Math.round(h * scale);

			var canvas = document.createElement('canvas');
			canvas.width = tw;
			canvas.height = th;
			var ctx = canvas.getContext('2d');
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(img, 0, 0, tw, th);

			var outType = (file.type === 'image/png') ? 'image/png' : 'image/jpeg';
			var dataUrl = canvas.toDataURL(outType, quality);

			URL.revokeObjectURL(url);
			canvas.width = 0;
			canvas.height = 0;

			if (!dataUrl || dataUrl.length < 50) {
				onErr(new Error('canvas 输出为空'));
				return;
			}
			onOk(dataUrl);
		} catch (e) {
			URL.revokeObjectURL(url);
			onErr(e);
		}
	};
	img.onerror = function() {
		if (done) return;
		done = true;
		clearTimeout(timeout);
		URL.revokeObjectURL(url);
		onErr(new Error('图片解码失败'));
	};
	img.src = url;
}

function _finishIconUpload(key, dataUrl, inputEl) {
	try {
		var g = _getGeneralState();
		if (!g.homeIcons) g.homeIcons = {};
		if (!g.homeIcons[key]) g.homeIcons[key] = {};
		g.homeIcons[key].icon = { type: 'local', value: dataUrl };
		_saveGeneralState(g);
		_updateIconPreview(key, dataUrl);

		var safeId = _keyToSafeId(key);
		var urlEl = document.getElementById('iconUrl_' + safeId);
		if (urlEl) urlEl.value = '';

		if (inputEl) inputEl.value = '';

		console.log('[IconUpload] ✅ 完成 | key:', key, '| dataUrl 长度:', dataUrl.length);
	} catch (e) {
		console.error('[IconUpload] 完成阶段异常:', e);
		_showIconUploadError(key, e);
	}
}

function _showIconUploadError(key, err) {
	var msg = (err && err.message) || String(err);
	console.error('[IconUpload] ❌ 失败 | key:', key, '| error:', msg);
	try { showToast('上传失败: ' + msg); } catch(e) {}
}

function onHomeIconUrlInput(key, value) {
	var trimmed = value.trim();
	var g = _getGeneralState();
	if (!g.homeIcons) g.homeIcons = {};
	if (!g.homeIcons[key]) g.homeIcons[key] = {};
	g.homeIcons[key].icon = { type: 'url', value: trimmed };
	_saveGeneralState(g);
	_updateIconPreview(key, trimmed);
}

function _updateIconPreview(key, imageUrl) {
	var safeId = _keyToSafeId(key);
	var preview = document.getElementById('iconPrev_' + safeId);
	if (!preview) return;
	if (imageUrl) {
		preview.style.backgroundImage = 'url("' + imageUrl + '")';
		preview.innerHTML = '';
	} else {
		preview.style.backgroundImage = '';
		// Restore original SVG from the Home page
		var defs = _getDesktopIconDefs();
		for (var i = 0; i < defs.length; i++) {
			if (defs[i].key === key) {
				var iconEl = defs[i].el.querySelector('.app-icon');
				if (iconEl) {
					var svgEl = iconEl.querySelector('svg');
					if (svgEl) {
						var clonedSvg = svgEl.cloneNode(true);
						if (!clonedSvg.getAttribute('viewBox')) {
							clonedSvg.setAttribute('viewBox', '0 0 32 32');
						}
						clonedSvg.removeAttribute('width');
						clonedSvg.removeAttribute('height');
						// Make sure display is not none (in case it was hidden by custom icon)
						clonedSvg.style.display = '';
						preview.innerHTML = clonedSvg.outerHTML;
					} else if (iconEl.dataset.originalSvg) {
						preview.innerHTML = iconEl.dataset.originalSvg;
					}
				}
				break;
			}
		}
	}
}

function applyHomeIcons() {
	var container = document.getElementById('iconSettingsList');
	if (!container) return;
	var g = _getGeneralState();
	if (!g.homeIcons) g.homeIcons = {};

	// Read names from inputs
	container.querySelectorAll('.te-icon-setting-name').forEach(function(inp) {
		var key = inp.dataset.iconKey;
		if (!g.homeIcons[key]) g.homeIcons[key] = {};
		g.homeIcons[key].name = inp.value.trim();
	});

	// Also sync iconNames for backward compat
	if (!g.iconNames) g.iconNames = {};
	Object.keys(g.homeIcons).forEach(function(key) {
		if (g.homeIcons[key].name) {
			g.iconNames[key] = g.homeIcons[key].name;
		}
	});

	_saveGeneralState(g);
	_applyHomeIconsToDOM(g.homeIcons);
	showThemeFeedback('Applied');
}

function resetSingleHomeIcon(key) {
	var g = _getGeneralState();
	if (!g.homeIcons) g.homeIcons = {};
	delete g.homeIcons[key];
	if (g.iconNames) delete g.iconNames[key];
	_saveGeneralState(g);
	_applyHomeIconsToDOM(g.homeIcons);
	_renderIconSettingsList();
	showThemeFeedback('Reset');
}

function resetAllHomeIcons() {
	var g = _getGeneralState();
	g.homeIcons = {};
	g.iconNames = {};
	_saveGeneralState(g);
	_applyHomeIconsToDOM({});
	_renderIconSettingsList();
	showThemeFeedback('Reset All');
}

// ★ 安全版：DOM 未就绪时自动重试
window.__reapplyHomeIcons = function (maxAttempts) {
	maxAttempts = maxAttempts || 15;
	var attempt = 0;

	function tryOnce() {
		attempt++;
		var defs = _getDesktopIconDefs();

		if (defs.length === 0) {
			if (attempt < maxAttempts) {
				console.log('[HomeIcons] 第 ' + attempt + ' 次尝试：图标元素还没就绪，150ms 后重试');
				setTimeout(tryOnce, 150);
			} else {
				console.warn('[HomeIcons] ⚠️ 重试 ' + maxAttempts + ' 次仍没找到图标元素');
			}
			return;
		}

		var g = _getGeneralState();
		var iconCount = g.homeIcons ? Object.keys(g.homeIcons).length : 0;
		console.log('[HomeIcons] ✅ 第 ' + attempt + ' 次尝试成功 | 图标元素:', defs.length,
			'| 已存图标:', iconCount);

		_applyHomeIconsToDOM(g.homeIcons || {});
	}

	tryOnce();
};

function _applyHomeIconsToDOM(homeIcons) {
	var defs = _getDesktopIconDefs();
	if (!defs.length) {
		console.warn('[HomeIcons] _getDesktopIconDefs 返回空，跳过');
		return;
	}

	console.log('[HomeIcons] 开始应用 | defs 数量:', defs.length,
		'| homeIcons keys:', homeIcons ? Object.keys(homeIcons).length : 0);

	// ★ 先同步处理名称和"恢复默认图标"的部分（不需要 img，无渲染压力）
	var imgQueue = [];   // 待加载的 img 任务

	defs.forEach(function (def) {
		var labelEl = def.el.querySelector('.app-label');
		var iconEl = def.el.querySelector('.app-icon');
		var config = homeIcons[def.key];

		// Apply name（同步）
		if (labelEl) {
			if (config && config.name !== undefined && config.name !== '') {
				labelEl.textContent = config.name;
			} else {
				labelEl.textContent = def.defaultLabel;
			}
		}

		if (!iconEl) return;

		var existingOverlay = iconEl.querySelector('.home-icon-custom-img');
		var hasCustom = config && config.icon && config.icon.type !== 'default' && config.icon.value;

		if (hasCustom) {
			// 先把原 SVG 隐藏
			var svgEl = iconEl.querySelector('svg');
			if (svgEl) svgEl.style.display = 'none';

			// 创建/取出 img 元素
			if (!existingOverlay) {
				existingOverlay = document.createElement('img');
				existingOverlay.className = 'home-icon-custom-img';
				existingOverlay.style.display = 'none';   // 先隐藏，等 src 加载完再显示
				iconEl.appendChild(existingOverlay);
			}
			// 加入队列，后面分批异步加载
			imgQueue.push({ img: existingOverlay, src: config.icon.value });
		} else {
			// 恢复默认
			var svgEl2 = iconEl.querySelector('svg');
			if (svgEl2) svgEl2.style.display = '';
			if (existingOverlay) {
				existingOverlay.style.display = 'none';
				existingOverlay.removeAttribute('src');
			}
		}
	});

	if (imgQueue.length === 0) {
		console.log('[HomeIcons] 没有自定义图片需要加载');
		return;
	}

	console.log('[HomeIcons] 准备加载 ' + imgQueue.length + ' 个自定义图片（分批）');

	// ★ 分批加载，每批间隔 50ms，避免 iOS 批量渲染 bug
	var idx = 0;
	function loadNext() {
		if (idx >= imgQueue.length) {
			console.log('[HomeIcons] ✅ 全部图片加载完成');
			return;
		}
		var task = imgQueue[idx];
		idx++;

		var img = task.img;

		// 用 onload 保证真正加载完再显示
		img.onload = function () {
			img.style.display = 'block';
			// 加载完就释放 onload，避免下次赋值时旧回调触发
			img.onload = null;
			img.onerror = null;
		};
		img.onerror = function () {
			console.error('[HomeIcons] 图片加载失败:', task.src.slice(0, 60));
			img.onload = null;
			img.onerror = null;
			img.style.display = 'none';
		};

		img.src = task.src;

		// 50ms 后再加载下一个
		setTimeout(loadNext, 50);
	}
	loadNext();
}

// ============================================================
//  General Module — restore on page load
// ============================================================

function restoreGeneralSettings() {
	var g = _getGeneralState();

	// Also check state.theme.general as a fallback source
	if (window.state && window.state.theme && window.state.theme.general) {
		var stateG = window.state.theme.general;
		if ((!g.desktopBackground || !g.desktopBackground.value) && stateG.desktopBackground && stateG.desktopBackground.value) {
			g.desktopBackground = stateG.desktopBackground;
		}
		if ((!g.chatBackground || !g.chatBackground.value) && stateG.chatBackground && stateG.chatBackground.value) {
			g.chatBackground = stateG.chatBackground;
		}
		if ((!g.desktopIcon || !g.desktopIcon.value) && stateG.desktopIcon && stateG.desktopIcon.value) {
			g.desktopIcon = stateG.desktopIcon;
		}
				// ★ 从 state 恢复完整 homeIcons（含图标图片，state 已经过 IDB 加载）
		if (stateG.homeIcons && Object.keys(stateG.homeIcons).length) {
			g.homeIcons = g.homeIcons || {};
			Object.keys(stateG.homeIcons).forEach(function(k) {
				var si = stateG.homeIcons[k];
				if (!si) return;
				if (!g.homeIcons[k]) g.homeIcons[k] = {};
				if (si.name) g.homeIcons[k].name = si.name;
				if (si.icon && si.icon.value) {
					g.homeIcons[k].icon = si.icon;   // ★ 图片从 state 拿
				}
			});
		}
	}

	console.log('[General] Restoring settings:',
		'desktopBg:', !!(g.desktopBackground && g.desktopBackground.value),
		'chatBg:', !!(g.chatBackground && g.chatBackground.value),
		'icon:', !!(g.desktopIcon && g.desktopIcon.value));

	if (g.desktopBackground && g.desktopBackground.value) {
		_applyGeneralSetting('desktopBackground', g.desktopBackground.value);
	}
	if (g.desktopIcon && g.desktopIcon.value) {
		_applyGeneralSetting('desktopIcon', g.desktopIcon.value);
	}
	if (g.chatBackground && g.chatBackground.value) {
		_applyGeneralSetting('chatBackground', g.chatBackground.value);
	}
	if (g.homeIcons && Object.keys(g.homeIcons).length) {
    setTimeout(function () {
        if (window.__reapplyHomeIcons) window.__reapplyHomeIcons();
        else _applyHomeIconsToDOM(g.homeIcons);
    }, 300);
} else if (g.iconNames && Object.keys(g.iconNames).length) {
    setTimeout(function () {
        _migrateIconNamesToHomeIcons();
        if (window.__reapplyHomeIcons) window.__reapplyHomeIcons();
    }, 300);
}
}