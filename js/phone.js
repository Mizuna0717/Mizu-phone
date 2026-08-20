// ========== PHONE ==========

// ========== PHONE TIME ==========
function updatePhoneTime() {
  const now = new Date();
  const el = document.getElementById('phoneTime');
  if (el) el.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const del = document.getElementById('phoneDate');
  if (del) del.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
}

// ========== 进入 Phone 界面 ==========
// ★ 在 nav('screen-phone') 后应调用此函数（或在 nav 函数中自动调用）
function enterPhoneScreen() {
  // 如果之前已选中角色且有数据，直接显示
  if (state.phoneCharId) {
    const ch = state.characters.find(c => c.id === state.phoneCharId);
    if (ch) {
      selectPhoneChar(state.phoneCharId);
      return;
    }
  }
  // 否则显示角色选择界面
  showPhoneCharSelect();
}

// ========== 显示角色选择列表 ==========
function showPhoneCharSelect() {
  const charSelect = document.getElementById('phoneCharSelect');
  const frameWrap = document.getElementById('phoneFrameWrap');
  const navRight = document.getElementById('phoneNavRight');
  const navTitle = document.getElementById('phoneNavTitle');

  if (charSelect) charSelect.style.display = '';
  if (frameWrap) frameWrap.style.display = 'none';
  if (navRight) navRight.style.display = 'none';
  if (navTitle) navTitle.textContent = T('phone') || 'Phone';

  renderPhoneCharList();
}

// ========== 渲染角色列表 ==========
function renderPhoneCharList() {
  const list = document.getElementById('phoneCharList');
  if (!list) return;

  if (!state.characters || !state.characters.length) {
    list.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#8e8e93;">
        <svg viewBox="0 0 48 48" width="48" height="48" style="opacity:0.3;margin-bottom:12px;">
          <circle cx="24" cy="16" r="10" stroke="#8e8e93" fill="none" stroke-width="2"/>
          <path d="M8 44c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#8e8e93" fill="none" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p style="font-size:15px;">请先创建角色</p>
      </div>`;
    return;
  }

  let h = '<div style="display:flex;flex-direction:column;gap:1px;">';

  state.characters.forEach(ch => {
    const avatarHtml = ch.avatar
      ? `<img src="${ch.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`
      : `<div style="width:44px;height:44px;border-radius:50%;background:#2c2c2e;display:flex;align-items:center;justify-content:center;">
           <svg viewBox="0 0 20 20" width="22" height="22">
             <circle cx="10" cy="7" r="4" stroke="#8e8e93" fill="none" stroke-width="1.5"/>
             <path d="M3 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#8e8e93" fill="none" stroke-width="1.5" stroke-linecap="round"/>
           </svg>
         </div>`;

    const notesHtml = ch.notes
      ? `<div style="font-size:12px;color:#8e8e93;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(ch.notes)}</div>`
      : '';

    h += `
      <div onclick="selectPhoneChar('${ch.id}')" 
           style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#1c1c1e;cursor:pointer;border-radius:10px;margin-bottom:4px;">
        <div style="flex-shrink:0;">${avatarHtml}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;color:#fff;font-weight:500;">${esc(ch.name)}</div>
          ${notesHtml}
        </div>
        <span style="color:#48484a;font-size:18px;">›</span>
      </div>`;
  });

  h += '</div>';
  list.innerHTML = h;
}

// ========== 选择角色 ==========
function selectPhoneChar(cid) {
  const ch = state.characters.find(c => c.id === cid);
  if (!ch) {
    showToast('角色不存在');
    showPhoneCharSelect();
    return;
  }

  state.phoneCharId = cid;
  saveState();

  const charSelect = document.getElementById('phoneCharSelect');
  const frameWrap = document.getElementById('phoneFrameWrap');
  const navRight = document.getElementById('phoneNavRight');
  const navTitle = document.getElementById('phoneNavTitle');

  if (charSelect) charSelect.style.display = 'none';
  if (frameWrap) frameWrap.style.display = '';
  if (navRight) navRight.style.display = '';
  if (navTitle) navTitle.textContent = ch.name;

  // 渲染手机内容（若已有数据则直接显示，否则生成）
  renderPhoneContent(cid);
}

// ========== 渲染手机内容 ==========
function renderPhoneContent(cid) {
  const el = document.getElementById('phoneContent');
  if (!el) return;

  // 检查是否已有生成的手机数据
  if (!state.phoneData) state.phoneData = {};

  if (state.phoneData[cid]) {
    // 已有数据，直接显示
    displayPhoneData(el, state.phoneData[cid]);
  } else {
    // 尚无数据，显示提示，用户可点击 regenerate 生成
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#8e8e93;">
        <svg viewBox="0 0 48 48" width="48" height="48" style="opacity:0.3;margin-bottom:12px;">
          <rect x="12" y="4" width="24" height="40" rx="4" stroke="#8e8e93" fill="none" stroke-width="2"/>
          <circle cx="24" cy="38" r="2" stroke="#8e8e93" fill="none" stroke-width="1.5"/>
          <line x1="18" y1="8" x2="30" y2="8" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p style="font-size:15px;margin-bottom:16px;">尚未生成手机数据</p>
        <button onclick="regeneratePhone()" 
                style="background:#0a84ff;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:15px;cursor:pointer;">
          生成手机内容
        </button>
      </div>`;
  }
}

// ========== 显示手机数据 ==========
function displayPhoneData(el, data) {
  // data 结构取决于你的 AI 生成逻辑，这里提供基础框架
  let h = '<div style="color:#fff;">';

  if (data.wallpaper) {
    h += `<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;">
            <img src="${data.wallpaper}" style="width:100%;display:block;">
          </div>`;
  }

  if (data.notifications && data.notifications.length) {
    h += '<div style="margin-bottom:12px;">';
    data.notifications.forEach(n => {
      h += `<div style="background:#2c2c2e;border-radius:10px;padding:12px;margin-bottom:6px;">
              <div style="font-size:13px;color:#8e8e93;margin-bottom:4px;">${esc(n.app || '')}</div>
              <div style="font-size:14px;">${esc(n.text || '')}</div>
            </div>`;
    });
    h += '</div>';
  }

  if (data.recentCalls && data.recentCalls.length) {
    h += '<div style="background:#2c2c2e;border-radius:12px;padding:12px;margin-bottom:12px;">';
    h += '<div style="font-size:13px;color:#8e8e93;margin-bottom:8px;">最近通话</div>';
    data.recentCalls.forEach(c => {
      h += `<div style="padding:8px 0;border-bottom:1px solid #3a3a3c;font-size:14px;">
              ${esc(c.name || c.number || '')} <span style="color:#8e8e93;float:right;">${esc(c.time || '')}</span>
            </div>`;
    });
    h += '</div>';
  }

  if (!data.notifications?.length && !data.recentCalls?.length && !data.wallpaper) {
    h += `<div style="text-align:center;padding:40px;color:#8e8e93;">
            <p>手机数据已生成</p>
            <pre style="text-align:left;font-size:12px;background:#2c2c2e;padding:12px;border-radius:8px;overflow-x:auto;white-space:pre-wrap;">${esc(JSON.stringify(data, null, 2))}</pre>
          </div>`;
  }

  h += '</div>';
  el.innerHTML = h;
}

// ========== 重新生成手机内容 ==========
async function regeneratePhone() {
  const cid = state.phoneCharId;
  if (!cid) {
    showToast('请先选择角色');
    return;
  }

  const ch = state.characters.find(c => c.id === cid);
  if (!ch) return;

  const api = state.apis?.find(a => a.id === state.activeApiId);
  if (!api?.url) {
    showErrorModal(T('configApi'));
    return;
  }

  const el = document.getElementById('phoneContent');
  if (el) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#8e8e93;">
        <div class="typing-indicator" style="display:inline-flex;gap:4px;">
          <span style="width:8px;height:8px;background:#8e8e93;border-radius:50%;animation:blink 1.4s infinite both;"></span>
          <span style="width:8px;height:8px;background:#8e8e93;border-radius:50%;animation:blink 1.4s infinite both;animation-delay:0.2s;"></span>
          <span style="width:8px;height:8px;background:#8e8e93;border-radius:50%;animation:blink 1.4s infinite both;animation-delay:0.4s;"></span>
        </div>
        <p style="margin-top:12px;">正在生成手机内容...</p>
      </div>`;
  }

  try {
    const prompt = `You are generating the phone screen data for a character named "${ch.name}".
${ch.systemPrompt ? 'Character info: ' + ch.systemPrompt : ''}
${ch.notes ? 'Notes: ' + ch.notes : ''}

Generate a JSON object representing what would be on this character's phone, including:
- wallpaper: description of their phone wallpaper (string)
- notifications: array of {app, text} objects (2-5 recent notifications)
- recentCalls: array of {name, number, time} objects (3-6 recent calls)

Respond ONLY with valid JSON, no other text.`;

    const rawReply = await sendChat(api, [{ role: 'user', content: prompt }]);

    let phoneData;
    try {
      // 尝试从回复中提取 JSON
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      phoneData = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: rawReply };
    } catch (parseErr) {
      phoneData = { raw: rawReply };
    }

    if (!state.phoneData) state.phoneData = {};
    state.phoneData[cid] = phoneData;
    saveState();
    renderPhoneContent(cid);

  } catch (e) {
    console.error('[regeneratePhone] error:', e);
    showErrorModal(typeof friendlyError === 'function' ? friendlyError(e) : String(e));
    renderPhoneContent(cid);
  }
}
