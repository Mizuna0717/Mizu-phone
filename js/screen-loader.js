/**
 * ScreenLoader v2 — 容错 + 兼容 file:// 协议
 */
(async function () {
    const screenContainer = document.getElementById('screenContainer');
    const app = document.getElementById('app');

    const screenFragments = [
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

    const globalFragments = [
        'screens/drawer.html',
        'screens/modals.html',
        'screens/call-screen.html',
    ];

    /* ── 加载单个文件（fetch 失败自动回退 XHR） ── */
    function loadFragment(url) {
        return new Promise(function (resolve) {

            // 方法1: 用 fetch
            if (typeof fetch === 'function' && location.protocol !== 'file:') {
                fetch(url)
                    .then(function (r) {
                        if (!r.ok) throw new Error(r.status);
                        return r.text();
                    })
                    .then(resolve)
                    .catch(function () {
                        // fetch 失败，回退到 XHR
                        loadByXHR(url, resolve);
                    });
            } else {
                // file:// 协议直接用 XHR
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
                    console.warn('⚠️ 无法加载:', url, '状态:', xhr.status);
                    resolve('<!-- 加载失败: ' + url + ' -->');
                }
            }
        };
        xhr.onerror = function () {
            console.warn('⚠️ XHR 失败:', url);
            resolve('<!-- 加载失败: ' + url + ' -->');
        };
        try {
            xhr.send();
        } catch (e) {
            console.warn('⚠️ 发送失败:', url, e);
            resolve('<!-- 加载失败: ' + url + ' -->');
        }
    }

    /* ── 逐个加载，不用 Promise.all（一个失败不影响其他） ── */
    console.log('📦 开始加载页面片段...');

    // 加载 screen 片段
    for (var i = 0; i < screenFragments.length; i++) {
        var html = await loadFragment(screenFragments[i]);
        if (html && html.indexOf('加载失败') === -1) {
            screenContainer.insertAdjacentHTML('beforeend', html);
            console.log('✅', screenFragments[i]);
        } else {
            console.error('❌', screenFragments[i]);
        }
    }

    // 加载全局片段（注入到 toast 之前）
    var toast = document.getElementById('toast');
    for (var j = 0; j < globalFragments.length; j++) {
        var ghtml = await loadFragment(globalFragments[j]);
        if (ghtml && ghtml.indexOf('加载失败') === -1) {
            toast.insertAdjacentHTML('beforebegin', ghtml);
            console.log('✅', globalFragments[j]);
        } else {
            console.error('❌', globalFragments[j]);
        }
    }

    console.log('📦 片段加载完成，开始加载 JS...');

    /* ── 按序加载全部 JS ── */
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
        'js/chat.js',
        'js/bubble-menu.js',
        'js/chat-extras.js',
        'js/worldbook.js',
        'js/home.js',
        'js/phone.js',
        'js/memory.js',
        'js/chat-config.js',
        'js/chat-settings.js',
        'js/social.js',
        'js/call.js',
        'js/archive.js',
        'js/init.js',
    ];

    for (var k = 0; k < scripts.length; k++) {
        await new Promise(function (resolve) {
            var s = document.createElement('script');
            s.src = scripts[k];
            s.onload = function () {
                console.log('✅ JS:', scripts[k]);
                resolve();
            };
            s.onerror = function () {
                console.error('❌ JS:', scripts[k]);
                resolve(); // 不阻塞后续
            };
            document.body.appendChild(s);
        });
    }

    console.log('🚀 全部加载完成');
})();
