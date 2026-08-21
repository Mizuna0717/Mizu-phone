/**
 * ScreenLoader — 启动时并行 fetch 所有 HTML 片段，注入 DOM 后再按序加载 JS。
 * 全部完成后现有代码无需任何改动即可正常运行。
 */
(async function () {
    const screenContainer = document.getElementById('screenContainer');
    const app = document.getElementById('app');

    /* ──────────────────────────────────────
     *  1. 声明所有片段（顺序与原 HTML 一致）
     * ────────────────────────────────────── */

    // 注入到 .screen-container 内部的片段
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

    // 注入到 #app 内部（screen-container 之后）的全局片段
    const globalFragments = [
        'screens/drawer.html',
        'screens/modals.html',
        'screens/call-screen.html',
    ];

    /* ──────────────────────────────────────
     *  2. 并行拉取所有 HTML 片段
     * ────────────────────────────────────── */
    const fetchText = (url) => fetch(url).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
        return r.text();
    });

    const [screenHtmls, globalHtmls] = await Promise.all([
        Promise.all(screenFragments.map(fetchText)),
        Promise.all(globalFragments.map(fetchText)),
    ]);

    /* ──────────────────────────────────────
     *  3. 按序注入 DOM
     * ────────────────────────────────────── */
    screenHtmls.forEach((html) => {
        screenContainer.insertAdjacentHTML('beforeend', html);
    });

    globalHtmls.forEach((html) => {
        app.insertAdjacentHTML('beforeend', html);
    });

    /* ──────────────────────────────────────
     *  4. 按序加载 JS（保持依赖顺序）
     * ────────────────────────────────────── */
    const scripts = [
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

    for (const src of scripts) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error(`Script load failed: ${src}`));
            document.body.appendChild(s);
        });
    }
})();
