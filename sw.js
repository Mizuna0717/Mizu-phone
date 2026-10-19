// ========== sw.js ==========
// Service Worker — 缓存优先，只有点"更新"才清缓存
// ⚠️ CACHE_NAME 保持固定！不要在部署时修改它

const CACHE_NAME = 'mizu-v1';

// 不缓存的路径（要实时网络请求）
const SKIP_PATHS = [
    '/version.json'
];

function shouldSkip(req) {
    if (req.method !== 'GET') return true;
    try {
        var u = new URL(req.url);
        // 只处理同源
        if (u.origin !== self.location.origin) return true;
        // 特定路径
        for (var i = 0; i < SKIP_PATHS.length; i++) {
            if (u.pathname.indexOf(SKIP_PATHS[i]) === 0) return true;
        }
        return false;
    } catch (e) {
        return true;
    }
}

// ── 安装：立即激活 ──
self.addEventListener('install', function(e) {
    console.log('[SW] install:', CACHE_NAME);
    self.skipWaiting();
});

// ── 激活：接管页面 ──
self.addEventListener('activate', function(e) {
    console.log('[SW] activate:', CACHE_NAME);
    e.waitUntil(self.clients.claim());
});

// ── 请求拦截：cache-first ──
self.addEventListener('fetch', function(e) {
    var req = e.request;
    if (shouldSkip(req)) return;   // 不拦截 → 走浏览器默认

    e.respondWith(
        caches.match(req).then(function(cached) {
            if (cached) return cached;   // ✅ 命中缓存 → 直接返回旧版

            // 没命中 → 从网络拿 → 缓存
            return fetch(req).then(function(resp) {
                if (resp.ok && resp.type === 'basic') {
                    var clone = resp.clone();
                    caches.open(CACHE_NAME).then(function(c) {
                        c.put(req, clone);
                    });
                }
                return resp;
            });
        })
    );
});

// ── 消息处理 ──
self.addEventListener('message', function(e) {
    if (e.data === 'clear-cache') {
        console.log('[SW] 收到 clear-cache 指令');
        caches.delete(CACHE_NAME).then(function() {
            console.log('[SW] ✅ 缓存已清空');
            if (e.source) e.source.postMessage('cache-cleared');
        });
    }
});