/**

ScreenLoader v7 — Mizu Phone 10s 沉浸开屏
时间线（目标 ≈10.2 秒）：
0s ─────── 页面加载开始，涟漪动画立即播放
0~8.5s ─── 视觉进度 0→92%（ease-out 曲线，每 80ms 刷新）
8.5s ───── 进度填满至 100%
8.5~9.0s ─ 驻留展示完成状态（500ms）
9.0~10.1s ─ 退场淡出（CSS 1.1s transition）
~10.2s ──── DOM 移除
* */
(async function () {
'use strict';
// ══════════════════════════════════════════════
//  防重复执行守卫
// ══════════════════════════════════════════════
if (window.__screenLoaderExecuted) {
    console.warn('[screen-loader] ⚠️ 重复执行已阻止');
    return;
}
window.__screenLoaderExecuted = true;

var _loadStart = performance.now();

// ══════════════════════════════════════════════
//  ★ 核心时间配置（所有时间在此集中管理）
// ══════════════════════════════════════════════
var MIN_DISPLAY    = 8500;   /* ★ FIX: 视觉进度走完时间 (ms)                    */
var DISMISS_PAUSE  = 500;    /*         进度满后驻留 (ms)                         */
var FADEOUT_WAIT   = 1200;   /* ★ FIX: CSS 退场完成 + 缓冲 (ms)                 */
var FALLBACK_KILL  = 15000;  /* ★ FIX: 兜底强杀 (ms)，远大于 8500+500+1200=10200 */

// ══════════════════════════════════════════════
//  调试时间线记录
// ══════════════════════════════════════════════
var _timeline = {
    loadStart:      0,
    htmlDone:       null,
    jsDone:         null,
    realLoadDone:   null,
    visualTimerEnd: null,
    dismissCalled:  null,
    fadeoutStart:   null,
    domRemoved:     null
};
window.__mizuTimeline = _timeline;   /* ★ FIX: 暴露给控制台 */

/* ── DOM 引用 ── */
var screenContainer = document.getElementById('screenContainer');
var app             = document.getElementById('app');
var toast           = document.getElementById('toast');
var loadingEl       = document.getElementById('loadingIndicator');
var statusEl        = document.getElementById('mizuStatus');
var progressEl      = document.getElementById('mizuProgress');

/* ── 状态标志 ── */
var _realLoadDone = false;
var _dismissed    = false;

/* ── 视觉更新函数 ── */
function updateLoading(text) {
    if (statusEl) statusEl.textContent = text;
}
function updateProgress(pct) {
    if (progressEl) progressEl.style.width = Math.min(100, Math.max(0, pct)) + '%';
}

function elapsed() {
    return Math.round(performance.now() - _loadStart);
}

// ══════════════════════════════════════════════
//  平滑视觉进度驱动器
//  8.5 秒内以 ease-out 曲线从 0% → 92%
// ══════════════════════════════════════════════
var _smoothTimer = setInterval(function () {
    var ms = performance.now() - _loadStart;
    var t = Math.min(ms / MIN_DISPLAY, 1);

    var pct = 92 * (1 - Math.pow(1 - t, 2.8));
    updateProgress(pct);

    if (t < 0.18)        updateLoading('Loading screens');
    else if (t < 0.42)   updateLoading('Loading scripts');
    else if (t < 0.68)   updateLoading('Initializing');
    else if (t < 0.90)   updateLoading('Almost ready');
    else                  updateLoading('Ready');

    if (t >= 1) {
        clearInterval(_smoothTimer);
        _smoothTimer = null;
        _timeline.visualTimerEnd = elapsed();
        console.log('[screen-loader] ⏱ 视觉计时器结束 (' + _timeline.visualTimerEnd + 'ms)');

        if (_realLoadDone) {
            dismissLoading();
        }
    }
}, 80);

// ══════════════════════════════════════════════
//  退场控制
// ══════════════════════════════════════════════
function dismissLoading() {
    if (_dismissed || !loadingEl) return;
    _dismissed = true;

    if (_smoothTimer) {
        clearInterval(_smoothTimer);
        _smoothTimer = null;
    }

    updateProgress(100);
    updateLoading('');

    _timeline.dismissCalled = elapsed();
    console.log('[screen-loader] 🎬 dismissLoading 被调用 (' + _timeline.dismissCalled + 'ms)');

    setTimeout(function () {
        _timeline.fadeoutStart = elapsed();
        console.log('[screen-loader] 🌊 开始退场淡出 (' + _timeline.fadeoutStart + 'ms)');
        loadingEl.classList.add('mizu-fadeout');

        setTimeout(function () {
            loadingEl.style.display = 'none';
            if (loadingEl.parentNode) {
                loadingEl.parentNode.removeChild(loadingEl);
            }
            _timeline.domRemoved = elapsed();

            console.log('[screen-loader] ✅ Loading 遮罩已移除 (' + _timeline.domRemoved + 'ms)');
            console.log('[screen-loader] 📊 总展示时长: ' + _timeline.domRemoved + 'ms');
        }, FADEOUT_WAIT);
    }, DISMISS_PAUSE);
}

function onRealLoadComplete() {
    _realLoadDone = true;
    _timeline.realLoadDone = elapsed();
    console.log('[screen-loader] 📦 实际加载完成 (' + _timeline.realLoadDone + 'ms)' +
        (_smoothTimer ? '，等待视觉计时器...' : '，视觉计时器已结束，立即退场'));

    if (!_smoothTimer) {
        dismissLoading();
    }
}

// ══════════════════════════════════════════════
//  HTML / JS 加载
// ══════════════════════════════════════════════

var screenFragments = [
    'screens/home.html',
    'screens/settings.html',
    'screens/api-edit.html',
    'screens/imessage.html',
    'screens/char-edit.html',
    'screens/mask-edit.html',
    'screens/chat.html',
    'screens/group-modals.html',
    'screens/worldbook.html',
    'screens/wb-edit.html',
    'screens/game.html',
    'screens/phone.html',
    'screens/meeting.html',
    'screens/meeting-settings.html',
    'screens/meeting-manage.html',
    'screens/couple.html',
    'screens/archive.html',
    'screens/cloud.html',
    'screens/theme.html',
    'screens/forum.html',
    'screens/ao3.html',
    'screens/dice.html',
    'screens/wiki.html',
    'screens/memory.html',
    'screens/memory-edit.html',
    'screens/bookmarks.html',
    'screens/chat-config.html',
    'screens/phone-message.html',
    'screens/chat-settings.html',
];

var globalFragments = [
    'screens/drawer.html',
    'screens/modals.html',
    'screens/call-screen.html',
];

function loadFragment(url) {
    return new Promise(function (resolve) {
        if (typeof fetch === 'function' && location.protocol !== 'file:') {
            fetch(url)
                .then(function (r) {
                    if (!r.ok) throw new Error(r.status);
                    return r.text();
                })
                .then(resolve)
                .catch(function () { loadByXHR(url, resolve); });
        } else {
            loadByXHR(url, resolve);
        }
    });
}

function loadByXHR(url, resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 0 || xhr.status === 200) {
                resolve(xhr.responseText || '');
            } else {
                console.warn('无法加载:', url);
                resolve('');
            }
        }
    };
    xhr.onerror = function () { resolve(''); };
    try { xhr.send(); } catch (e) { resolve(''); }
}

// ═══════════════════════════════════════════════
//  阶段 1：并行加载 HTML 片段
// ═══════════════════════════════════════════════

console.log('📦 开始并行加载页面片段...');

var screenResultsPromise = Promise.all(screenFragments.map(loadFragment));
var globalResultsPromise = Promise.all(globalFragments.map(loadFragment));

var results = await Promise.all([screenResultsPromise, globalResultsPromise]);
var screenResults = results[0];
var globalResults = results[1];

var screenHtml = '';
for (var i = 0; i < screenResults.length; i++) {
    if (screenResults[i]) {
        screenHtml += screenResults[i];
    } else {
        console.error('❌', screenFragments[i]);
    }
}
screenContainer.insertAdjacentHTML('beforeend', screenHtml);

var globalHtml = '';
for (var j = 0; j < globalResults.length; j++) {
    if (globalResults[j]) {
        globalHtml += globalResults[j];
    } else {
        console.error('❌', globalFragments[j]);
    }
}
toast.insertAdjacentHTML('beforebegin', globalHtml);

var htmlDone = performance.now();
_timeline.htmlDone = Math.round(htmlDone - _loadStart);
console.log('📦 HTML 片段加载完成 (' + _timeline.htmlDone + 'ms)');

// ═══════════════════════════════════════════════
//  阶段 2：预加载 + 顺序执行 JS（含去重）
// ═══════════════════════════════════════════════

var scripts = [
    'js/config.js',
    'js/state.js',
    'js/utils.js',
    'js/i18n.js',
    'js/ui.js',
    'js/api.js',
    'js/prompt.js',
    'js/settings.js',
    'js/profile.js',
    'js/characters.js',
    'js/chat-utils.js',
    'js/chat-bubbles.js',
    'js/chat-parse.js',
    'js/chat-render.js',
    'js/chat-actions.js',
    'js/chat-ai.js',
    'js/bubble-menu.js',
    'js/chat-extras.js',
    'js/worldbook.js',
    'js/meeting.js',
    'js/home.js',
    'js/phone.js',
    'js/memory.js',
    'js/chat-config.js',
    'js/chat-settings.js',
    'js/social-utils.js',
    'js/social-groups.js',
    'js/social-moments.js',
    'js/call.js',
    'js/archive.js',
    'js/cloud.js',
    'js/auth.js',
    'js/wiki.js',
    'js/phone-message.js',
    'js/init.js',
];

scripts.forEach(function(src) {
    if (!document.querySelector('link[rel="preload"][href="' + src + '"]')) {
        var link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        document.head.appendChild(link);
    }
});

var _dupeCount = 0;

for (var k = 0; k < scripts.length; k++) {
    await (function(scriptSrc) {
        return new Promise(function (resolve) {
            if (document.querySelector('script[src="' + scriptSrc + '"]')) {
                _dupeCount++;
                console.warn('[screen-loader] ⚠️ 跳过重复脚本:', scriptSrc);
                resolve();
                return;
            }

            var s = document.createElement('script');
            s.src = scriptSrc;
            s.onload = function () { resolve(); };
            s.onerror = function () {
                console.error('❌ JS 加载失败:', scriptSrc);
                resolve();
            };
            document.body.appendChild(s);
        });
    })(scripts[k]);
}

if (_dupeCount > 0) {
    console.warn('[screen-loader] ⚠️ 共跳过 ' + _dupeCount + ' 个重复脚本');
}

_timeline.jsDone = elapsed();
console.log('📦 JS 加载完成 (' + _timeline.jsDone + 'ms)');

// ═══════════════════════════════════════════════
//  阶段 3：确保 app 可见 + 首屏激活
// ═══════════════════════════════════════════════

if (app) {
    app.style.display = '';
    app.style.visibility = 'visible';
    app.style.opacity = '1';
}

try {
    var hasActive = document.querySelector('.screen.active');
    if (!hasActive) {
        console.warn('[screen-loader] ⚠️ 未检测到活跃屏幕，自动导航到 home');
        if (typeof nav === 'function') {
            nav('screen-home');
        } else {
            var fallbackHome = document.getElementById('screen-home');
            if (fallbackHome) {
                document.querySelectorAll('.screen').forEach(function(s) {
                    s.classList.remove('active');
                });
                fallbackHome.classList.add('active');
            } else {
                console.error('[screen-loader] ❌ #screen-home 不存在！');
            }
        }
    } else {
        console.log('[screen-loader] ✅ 已有活跃屏幕:', hasActive.id);
    }
} catch (e) {
    console.error('[screen-loader] failsafe navigation error:', e);
}

// ═══════════════════════════════════════════════
//  阶段 4：通知实际加载完成
// ═══════════════════════════════════════════════

onRealLoadComplete();

// ═══════════════════════════════════════════════
//  阶段 5：广播完成事件
//  ★ FIX: 将 appReady 延迟到退场完成后再 dispatch
//         防止 index.html 安全网被过早清除后
//         又有其他代码在 appReady 中干扰 loading
// ═══════════════════════════════════════════════

window.__bootTime     = _timeline.jsDone;
window.__bootHtmlTime = _timeline.htmlDone;
window.__bootComplete = true;

/* ★ FIX: appReady 推迟到视觉展示完成后触发 */
var _appReadyDelay = Math.max(0, MIN_DISPLAY - elapsed()) + DISMISS_PAUSE + FADEOUT_WAIT + 200;
setTimeout(function () {
    try {
        window.dispatchEvent(new CustomEvent('appReady', {
            detail: {
                bootTime: _timeline.jsDone,
                htmlTime: _timeline.htmlDone,
                displayTime: _timeline.domRemoved || elapsed()
            }
        }));
        console.log('[screen-loader] 📡 appReady 事件已广播');
    } catch (e) {}
}, _appReadyDelay);

console.log('🚀 JS 加载完成 (' + _timeline.jsDone + 'ms)，开屏动画继续播放中...');
console.log('   视觉进度剩余: ' + Math.max(0, MIN_DISPLAY - _timeline.jsDone) + 'ms');
console.log('   预计退场时间: ≈' + (MIN_DISPLAY + DISMISS_PAUSE + FADEOUT_WAIT) + 'ms');

// ═══════════════════════════════════════════════
//  ★ FIX: 兜底强杀 — 设为 15 秒（远大于 10.2s 正常流程）
//  只在极端异常时生效，正常情况下永远不会触发
// ═══════════════════════════════════════════════
setTimeout(function () {
    var zombie = document.getElementById('loadingIndicator');
    if (zombie) {
        console.error('[screen-loader] ⚠️ 兜底强杀触发 (' + elapsed() + 'ms)');
        zombie.style.display = 'none';
        if (zombie.parentNode) zombie.parentNode.removeChild(zombie);
        _timeline.domRemoved = elapsed();
    }
    var appEl = document.getElementById('app');
    if (appEl) {
        appEl.style.visibility = 'visible';
        appEl.style.opacity = '1';
    }
    if (!document.querySelector('.screen.active')) {
        if (typeof nav === 'function') {
            try { nav('screen-home'); } catch(e) {}
        }
    }
}, FALLBACK_KILL);   /* ★ FIX: 使用配置常量 15000，而非硬编码 6000/13000 */
})();

