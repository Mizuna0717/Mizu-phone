/**
 * ScreenLoader v5.1 — Mizu Phone v4 水の波紋 开屏 + 并行加载 + 进度条
 */
(async function () {
    'use strict';

    var _loadStart = performance.now();

    var screenContainer = document.getElementById('screenContainer');
    var app = document.getElementById('app');
    var toast = document.getElementById('toast');

    // ── Loading 元素引用 ──
    var loadingEl = document.getElementById('loadingIndicator');
    var statusEl = document.getElementById('mizuStatus');
    var progressEl = document.getElementById('mizuProgress');

    // ── 更新加载状态文字 ──
    function updateLoading(text) {
        if (statusEl) statusEl.textContent = text;
    }

    // ── 更新进度条（0~100） ──
    function updateProgress(pct) {
        if (progressEl) progressEl.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    // ── 优雅隐藏 Loading 遮罩 ──
    function dismissLoading() {
        if (!loadingEl) return;

        updateProgress(100);
        updateLoading('');

        /* ★ v4 CHANGED — 最低展示 3.5 秒，保证动画从容播完 */
        var elapsed = performance.now() - _loadStart;
        var wait = Math.max(500, 3500 - elapsed);

        setTimeout(function () {
            loadingEl.classList.add('mizu-fadeout');

            /* ★ v4 CHANGED — 匹配 CSS 1s transition + 150ms 缓冲 */
            setTimeout(function () {
                loadingEl.style.display = 'none';
                if (loadingEl.parentNode) {
                    loadingEl.parentNode.removeChild(loadingEl);
                }
                console.log('[screen-loader] ✅ Loading 遮罩已移除');
            }, 1150);
        }, wait);
    }

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
    //  阶段 1：并行加载所有 HTML 片段（进度 0→40%）
    // ═══════════════════════════════════════════════

    console.log('📦 开始并行加载页面片段...');
    updateLoading('Loading screens');
    updateProgress(5);

    var screenResultsPromise = Promise.all(screenFragments.map(loadFragment));
    var globalResultsPromise = Promise.all(globalFragments.map(loadFragment));

    var results = await Promise.all([screenResultsPromise, globalResultsPromise]);
    var screenResults = results[0];
    var globalResults = results[1];

    updateProgress(30);

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

    updateProgress(40);

    var htmlDone = performance.now();
    console.log('📦 片段加载完成 (' + Math.round(htmlDone - _loadStart) + 'ms)，开始加载 JS...');

    // ═══════════════════════════════════════════════
    //  阶段 2：预加载 + 顺序执行 JS（进度 40→95%）
    // ═══════════════════════════════════════════════

    updateLoading('Loading scripts');

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
        'js/init.js',
    ];

    scripts.forEach(function(src) {
        var link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        document.head.appendChild(link);
    });

    var jsProgressStart = 40;
    var jsProgressEnd = 95;
    var jsProgressRange = jsProgressEnd - jsProgressStart;

    for (var k = 0; k < scripts.length; k++) {
        await (function(scriptSrc, index) {
            return new Promise(function (resolve) {
                var s = document.createElement('script');
                s.src = scriptSrc;
                s.onload = function () {
                    var pct = jsProgressStart + ((index + 1) / scripts.length) * jsProgressRange;
                    updateProgress(pct);
                    resolve();
                };
                s.onerror = function () {
                    console.error('❌ JS:', scriptSrc);
                    resolve();
                };
                document.body.appendChild(s);
            });
        })(scripts[k], k);
    }

    updateLoading('Almost ready');
    updateProgress(95);

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
                    console.error('[screen-loader] ❌ #screen-home 不存在！检查 home.html');
                }
            }
        } else {
            console.log('[screen-loader] ✅ 已有活跃屏幕:', hasActive.id);
        }
    } catch (e) {
        console.error('[screen-loader] failsafe navigation error:', e);
    }

    // ═══════════════════════════════════════════════
    //  阶段 4：优雅退场 Loading 遮罩
    // ═══════════════════════════════════════════════

    dismissLoading();

    // ═══════════════════════════════════════════════
    //  阶段 5：广播完成事件 + 兜底检查
    // ═══════════════════════════════════════════════

    var totalTime = Math.round(performance.now() - _loadStart);
    console.log('🚀 全部加载完成 (' + totalTime + 'ms)');

    window.__bootTime = totalTime;
    window.__bootHtmlTime = Math.round(htmlDone - _loadStart);
    window.__bootComplete = true;

    try {
        window.dispatchEvent(new CustomEvent('appReady', {
            detail: { bootTime: totalTime, htmlTime: Math.round(htmlDone - _loadStart) }
        }));
    } catch (e) {}

    /* ★ v4 CHANGED — 兜底延长到 6 秒（3.5s 最低展示 + 1.15s 退场 + 余量） */
    setTimeout(function () {
        var zombie = document.getElementById('loadingIndicator');
        if (zombie) {
            console.error('[screen-loader] ⚠️ Loading 遮罩仍然存在，强制移除');
            zombie.style.display = 'none';
            if (zombie.parentNode) zombie.parentNode.removeChild(zombie);
        }
        var appEl = document.getElementById('app');
        if (appEl) {
            appEl.style.visibility = 'visible';
            appEl.style.opacity = '1';
        }
        if (!document.querySelector('.screen.active')) {
            console.error('[screen-loader] ⚠️ 仍无活跃屏幕，再次尝试导航');
            if (typeof nav === 'function') {
                try { nav('screen-home'); } catch(e) {}
            }
        }
    }, 6000);

})();
