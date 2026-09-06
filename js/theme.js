// ============================================================
//  Theme Editor — Navigation
// ============================================================

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
	}
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
	var styleEl = document.getElementById('custom-theme-' + type);
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'custom-theme-' + type;
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
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

function showThemeFeedback(message) {
	console.log('Theme: ' + message);
	var navTitle = document.querySelector('.screen.active .nav-title');
	if (navTitle) {
		var original = navTitle.textContent;
		navTitle.textContent = message;
		setTimeout(function() { navTitle.textContent = original; }, 800);
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
	try {
		var raw = localStorage.getItem('theme-general');
		if (raw) {
			var parsed = JSON.parse(raw);
			var result = Object.assign({}, defaults, parsed);
			// Ensure nested objects are proper
			if (!result.desktopBackground || typeof result.desktopBackground !== 'object') result.desktopBackground = defaults.desktopBackground;
			if (!result.chatBackground || typeof result.chatBackground !== 'object') result.chatBackground = defaults.chatBackground;
			if (!result.desktopIcon || typeof result.desktopIcon !== 'object') result.desktopIcon = defaults.desktopIcon;
			return result;
		}
	} catch(e) { console.warn('[General] Failed to parse theme-general:', e); }
	return defaults;
}

function _saveGeneralState(g) {
	try {
		localStorage.setItem('theme-general', JSON.stringify(g));
	} catch(e) {
		console.warn('[General] Failed to save to localStorage (may be quota exceeded for large images):', e);
	}
	if (window.state) {
		if (!window.state.theme) window.state.theme = {};
		window.state.theme.general = Object.assign({}, g);
		if (g.desktopBackground) window.state.theme.general.desktopBackground = Object.assign({}, g.desktopBackground);
		if (g.chatBackground) window.state.theme.general.chatBackground = Object.assign({}, g.chatBackground);
		if (g.desktopIcon) window.state.theme.general.desktopIcon = Object.assign({}, g.desktopIcon);
	}
	console.log('[General] State saved | desktopBg:', !!(g.desktopBackground && g.desktopBackground.value),
		'| chatBg:', !!(g.chatBackground && g.chatBackground.value));
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
		_applyGeneralSetting(setting, dataUrl);
		console.log('[General] Applied', setting, '| value set:', !!dataUrl);
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
	_applyGeneralSetting(setting, trimmed);
}

function clearGeneralSetting(setting) {
	console.log('[General] Clearing setting:', setting);
	var g = _getGeneralState();
	g[setting] = { type: 'url', value: '' };
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
	var reader = new FileReader();
	reader.onload = function(e) {
		var dataUrl = e.target.result;
		var g = _getGeneralState();
		if (!g.homeIcons) g.homeIcons = {};
		if (!g.homeIcons[key]) g.homeIcons[key] = {};
		g.homeIcons[key].icon = { type: 'local', value: dataUrl };
		_saveGeneralState(g);
		_updateIconPreview(key, dataUrl);
		// Clear url input
		var safeId = _keyToSafeId(key);
		var urlEl = document.getElementById('iconUrl_' + safeId);
		if (urlEl) urlEl.value = '';
	};
	reader.readAsDataURL(file);
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

function _applyHomeIconsToDOM(homeIcons) {
	var defs = _getDesktopIconDefs();
	defs.forEach(function(def) {
		var labelEl = def.el.querySelector('.app-label');
		var iconEl = def.el.querySelector('.app-icon');
		var config = homeIcons[def.key];

		// Apply name
		if (labelEl) {
			if (config && config.name !== undefined && config.name !== '') {
				labelEl.textContent = config.name;
			} else {
				labelEl.textContent = def.defaultLabel;
			}
		}

		// Apply icon image
		if (iconEl) {
			var existingOverlay = iconEl.querySelector('.home-icon-custom-img');
			if (config && config.icon && config.icon.type !== 'default' && config.icon.value) {
				// Hide original SVG
				var svgEl = iconEl.querySelector('svg');
				if (svgEl) svgEl.style.display = 'none';
				// Show custom image
				if (!existingOverlay) {
					existingOverlay = document.createElement('img');
					existingOverlay.className = 'home-icon-custom-img';
					iconEl.appendChild(existingOverlay);
				}
				existingOverlay.src = config.icon.value;
				existingOverlay.style.display = 'block';
			} else {
				// Restore original SVG
				var svgEl = iconEl.querySelector('svg');
				if (svgEl) svgEl.style.display = '';
				if (existingOverlay) existingOverlay.style.display = 'none';
			}
		}
	});
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
		if ((!g.homeIcons || !Object.keys(g.homeIcons).length) && stateG.homeIcons && Object.keys(stateG.homeIcons).length) {
			g.homeIcons = stateG.homeIcons;
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
		setTimeout(function() { _applyHomeIconsToDOM(g.homeIcons); }, 150);
	} else if (g.iconNames && Object.keys(g.iconNames).length) {
		setTimeout(function() {
			_migrateIconNamesToHomeIcons();
			var migrated = _getGeneralState();
			if (migrated.homeIcons && Object.keys(migrated.homeIcons).length) {
				_applyHomeIconsToDOM(migrated.homeIcons);
			}
		}, 150);
	}
}