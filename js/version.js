// ========== version.js ==========
// 版本管理 — 读取 Cloudflare 构建时自动生成的 version.json

var VERSION_STORAGE_KEY = 'app_version_installed';

function getInstalledVersion() {
    return localStorage.getItem(VERSION_STORAGE_KEY) || null;
}

function setInstalledVersion(v) {
    localStorage.setItem(VERSION_STORAGE_KEY, v);
    syncVersionLabel();
}

function syncVersionLabel() {
    var v = getInstalledVersion();
    var el = document.getElementById('currentVersionLabel');
    if (el) el.textContent = v ? ('v' + v) : 'v—';
}

async function fetchVersionData(force) {
    var url = '/version.json' + (force ? '?t=' + Date.now() : '');
    try {
        var r = await fetch(url, { cache: force ? 'no-store' : 'default' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
    } catch (e) {
        console.warn('[Version] fetch failed:', e.message);
        return null;
    }
}

async function initVersionPage(forceCheck) {
    var list = document.getElementById('versionListBody');
    var heroVer = document.getElementById('versionHeroCurrent');
    var heroStatus = document.getElementById('versionHeroStatus');
    if (!list) return;

    var installed = getInstalledVersion();
    if (heroVer) heroVer.textContent = installed ? ('v' + installed) : 'v—';
    if (heroStatus) {
        heroStatus.textContent = '正在检查更新…';
        heroStatus.className = 'ver-hero-status checking';
    }

    list.innerHTML = '<div class="ver-empty">加载中…</div>';

    var data = await fetchVersionData(forceCheck);
    if (!data || !Array.isArray(data.versions)) {
        list.innerHTML = '<div class="ver-empty">无法获取版本信息<br><span style="font-size:12px;color:#c7c7cc">请稍后重试</span></div>';
        if (heroStatus) {
            heroStatus.textContent = '检查失败';
            heroStatus.className = 'ver-hero-status';
        }
        return;
    }

    var versions = data.versions;
    var latest = versions[0] ? versions[0].version : null;

// ★ 只在"真正的首次访问"才记录当前版本
var _initKey = 'app_version_initialized';
var _hasInit = localStorage.getItem(_initKey);
if (!installed && latest && !_hasInit) {
    installed = latest;
    setInstalledVersion(latest);
    localStorage.setItem(_initKey, '1');
    if (heroVer) heroVer.textContent = 'v' + latest;
    console.log('[Version] 首次访问，记录初始版本:', latest);
}

    if (heroStatus) {
        if (!installed || !latest) {
            heroStatus.textContent = '—';
            heroStatus.className = 'ver-hero-status';
        } else if (installed === latest) {
            heroStatus.textContent = '已是最新版本';
            heroStatus.className = 'ver-hero-status up-to-date';
        } else {
            heroStatus.textContent = '有新版本 v' + latest + ' 可更新';
            heroStatus.className = 'ver-hero-status has-update';
        }
    }

    // 只显示：最新版本 + 当前已安装版本
var displayList = [];
if (latest) displayList.push(versions[0]);
if (installed && installed !== latest) {
    var installedItem = versions.find(function(v) { return v.version === installed; });
    if (installedItem) displayList.push(installedItem);
}

list.innerHTML = displayList.map(function(v) {
    var isInstalled = installed === v.version;
    var isLatest = latest === v.version;

    var badge = '';
    if (isInstalled && isLatest) badge = '<span class="ver-badge ver-badge-installed">当前版本</span>';
    else if (isInstalled) badge = '<span class="ver-badge ver-badge-installed">已安装</span>';
    else if (isLatest) badge = '<span class="ver-badge ver-badge-latest">最新</span>';

    var btn;
    if (isInstalled) {
        btn = '<span class="ver-btn ver-btn-disabled">当前版本</span>';
    } else {
        btn = '<button class="ver-btn ver-btn-primary" onclick="applyVersion(\'' + v.version + '\')">更新</button>';
    }

    var notesHtml = (v.notes || []).map(function(n) {
        return '<li>' + esc(n) + '</li>';
    }).join('');

    return '<div class="ver-item' + (isInstalled ? ' ver-item-installed' : '') + '">' +
        '<div class="ver-item-head">' +
            '<div class="ver-item-version">v' + esc(v.version) + badge + '</div>' +
            '<div class="ver-item-date">' + esc(v.date || '') + '</div>' +
        '</div>' +
        (notesHtml ? '<ul class="ver-item-notes">' + notesHtml + '</ul>' : '') +
        '<div class="ver-item-foot">' + btn + '</div>' +
    '</div>';
}).join('');
}

function applyVersion(version) {
    if (!version) return;
    var fromVersion = getInstalledVersion();
    showUpdateConfirm(fromVersion, version, function() {
        setInstalledVersion(version);
        showToast('正在应用 v' + version + '…');

        // 优先：通知 SW 清缓存
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            console.log('[Version] 通知 SW 清缓存');
            navigator.serviceWorker.controller.postMessage('clear-cache');

            var done = false;
            var handler = function(e) {
                if (e.data === 'cache-cleared' && !done) {
                    done = true;
                    navigator.serviceWorker.removeEventListener('message', handler);
                    console.log('[Version] 缓存已清，刷新');
                    setTimeout(function() { location.reload(); }, 200);
                }
            };
            navigator.serviceWorker.addEventListener('message', handler);

            // 兜底：2 秒没响应也刷新
            setTimeout(function() {
                if (!done) {
                    done = true;
                    navigator.serviceWorker.removeEventListener('message', handler);
                    location.reload();
                }
            }, 2000);
            return;
        }

        // 兜底：没有 SW（首次访问 / 未注册成功）
        if ('caches' in window) {
            caches.keys().then(function(names) {
                return Promise.all(names.map(function(n) { return caches.delete(n); }));
            }).then(function() {
                location.reload();
            });
        } else {
            location.reload();
        }
    });
}

window.applyVersion = applyVersion;

window.initVersionPage = initVersionPage;
window.getInstalledVersion = getInstalledVersion;
window.setInstalledVersion = setInstalledVersion;

document.addEventListener('DOMContentLoaded', syncVersionLabel);

// ═══════════════════════════════════════════
//  自定义确认弹窗（版本更新用）
// ═══════════════════════════════════════════
function showUpdateConfirm(fromVersion, toVersion, onConfirm) {
    var existing = document.getElementById('versionConfirmDialog');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'versionConfirmDialog';
    overlay.style.cssText =
        'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(0,0,0,.32);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'opacity:0;transition:opacity .22s ease;padding:20px;';

    overlay.innerHTML =
        '<div style="background:#fff;border-radius:20px;width:100%;max-width:320px;overflow:hidden;' +
            'box-shadow:0 20px 60px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.06);' +
            'transform:scale(.92);transition:transform .22s cubic-bezier(.2,.9,.3,1);text-align:center;">' +
            '<div style="padding:28px 24px 0">' +
                '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;' +
                    'background:#f2f2f7;display:flex;align-items:center;justify-content:center;">' +
                    '<svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:#1d1d1f;fill:none;' +
                        'stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;">' +
                        '<path d="M4 10a6 6 0 0110.5-4M16 10a6 6 0 01-10.5 4"/>' +
                        '<path d="M14 4v2.5h-2.5M6 16v-2.5h2.5"/>' +
                    '</svg>' +
                '</div>' +
                '<div style="font-size:17px;font-weight:700;color:#1d1d1f;letter-spacing:-.3px;margin-bottom:8px;">' +
                    '确认更新' +
                '</div>' +
                '<div style="font-size:13px;color:#8e8e93;line-height:1.6;margin-bottom:8px;">' +
                    '将更新至 <span style="color:#1d1d1f;font-weight:600;font-family:ui-monospace,Menlo,monospace;">v' + esc(toVersion) + '</span>' +
                '</div>' +
                (fromVersion
                    ? '<div style="font-size:12px;color:#c7c7cc;font-family:ui-monospace,Menlo,monospace;margin-bottom:20px;">当前 v' + esc(fromVersion) + '</div>'
                    : '<div style="margin-bottom:20px;"></div>'
                ) +
                '<div style="font-size:12px;color:#aeaeb2;line-height:1.5;margin-bottom:20px;">' +
                    '页面将刷新以应用更改' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:0;border-top:1px solid #f2f2f7;">' +
                '<button id="versionConfirmCancel" style="flex:1;padding:15px;border:none;' +
                    'background:none;font-size:15px;color:#8e8e93;cursor:pointer;font-family:inherit;' +
                    'font-weight:500;border-right:1px solid #f2f2f7;transition:background .12s;">取消</button>' +
                '<button id="versionConfirmOk" style="flex:1;padding:15px;border:none;' +
                    'background:none;font-size:15px;color:#1d1d1f;cursor:pointer;font-family:inherit;' +
                    'font-weight:600;transition:background .12s;">更新</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);

    requestAnimationFrame(function() {
        overlay.style.opacity = '1';
        var card = overlay.firstElementChild;
        if (card) card.style.transform = 'scale(1)';
    });

    var close = function(cb) {
        overlay.style.opacity = '0';
        var card = overlay.firstElementChild;
        if (card) card.style.transform = 'scale(.92)';
        setTimeout(function() {
            overlay.remove();
            if (typeof cb === 'function') cb();
        }, 220);
    };

    document.getElementById('versionConfirmCancel').onclick = function() { close(); };
    document.getElementById('versionConfirmOk').onclick = function() { close(onConfirm); };
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    // hover 高亮
    ['versionConfirmCancel', 'versionConfirmOk'].forEach(function(id) {
        var btn = document.getElementById(id);
        if (!btn) return;
        btn.onmouseenter = function() { btn.style.background = '#f9f9fb'; };
        btn.onmouseleave = function() { btn.style.background = 'none'; };
    });
}
window.showUpdateConfirm = showUpdateConfirm;