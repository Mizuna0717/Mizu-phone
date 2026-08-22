/**
 * ScreenLoader v3 — 修复闭包 + 错误捕获
 * ★★★ 新增 cloud.html 页面加载 ★★★
 */
(async function () {
    var screenContainer = document.getElementById('screenContainer');
    var app = document.getElementById('app');

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
                    console.warn('⚠️ 无法加载:', url);
                    resolve('<!-- 加载失败: ' + url + ' -->');
                }
            }
        };
        xhr.onerror = function () { resolve('<!-- 加载失败: ' + url + ' -->'); };
        try { xhr.send(); } catch (e) { resolve('<!-- 加载失败: ' + url + ' -->'); }
    }

    console.log('📦 开始加载页面片段...');

    for (var i = 0; i < screenFragments.length; i++) {
        var html = await loadFragment(screenFragments[i]);
        if (html && html.indexOf('加载失败') === -1) {
            screenContainer.insertAdjacentHTML('beforeend', html);
        } else {
            console.error('❌', screenFragments[i]);
        }
    }

    var toast = document.getElementById('toast');
    for (var j = 0; j < globalFragments.length; j++) {
        var ghtml = await loadFragment(globalFragments[j]);
        if (ghtml && ghtml.indexOf('加载失败') === -1) {
            toast.insertAdjacentHTML('beforebegin', ghtml);
        } else {
            console.error('❌', globalFragments[j]);
        }
    }

    console.log('📦 片段加载完成，开始加载 JS...');

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

    for (var k = 0; k < scripts.length; k++) {
        await (function(scriptSrc) {
            return new Promise(function (resolve) {
                var s = document.createElement('script');
                s.src = scriptSrc;
                s.onload = function () {
                    console.log('✅ JS:', scriptSrc);
                    resolve();
                };
                s.onerror = function () {
                    console.error('❌ JS:', scriptSrc);
                    resolve();
                };
                document.body.appendChild(s);
            });
        })(scripts[k]);
    }

    console.log('🚀 全部加载完成');
})();
