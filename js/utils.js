// ========== 03-utils.js ==========
// 無外部依賴

// ★ 防碰撞 UID 生成器
var _uidCounter = 0;
function uid() {
  _uidCounter++;
  return Date.now().toString(36) + '_' + _uidCounter + '_' + Math.random().toString(36).substr(2, 5);
}


function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function fmtMsg(t) {
  return esc(t).replace(/\n/g, '<br>');
}

function fmtTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

function makeWaveBars() {
  return Array.from({ length: 12 }, () => Math.random() * 12 + 4)
    .map(v => `<span style="height:${v}px"></span>`).join('');
}

// ========== AVATAR HELPERS ==========
function avatarHtml(src, fallbackSvg, cls) {
  if (src) return `<img src="${src}">`;
  return fallbackSvg || '';
}

const PERSON_SVG = '<svg viewBox="0 0 32 32" style="width:24px;height:24px;stroke:#8e8e93;fill:none;stroke-width:1.5"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>';

function charAvatarImg(ch) {
  return ch?.avatar ? `<img src="${ch.avatar}">` : PERSON_SVG;
}

function msgAvatarHtml(src) {
  return src ? `<img src="${src}">` : '';
}

function setAvatarPreview(pvId, phId, src) {
  const pv = document.getElementById(pvId), ph = document.getElementById(phId);
  if (src) { pv.src = src; pv.style.display = 'block'; ph.style.display = 'none'; }
  else { pv.style.display = 'none'; ph.style.display = 'block'; }
}

function previewAvatarFile(inp, cb) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => cb(e.target.result);
    r.readAsDataURL(inp.files[0]);
  }
}
