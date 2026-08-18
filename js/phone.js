// ========== 16-phone.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 06-api.js, 07-prompt.js, 17-memory.js

// ========== PHONE APP REGISTRY ==========
const PHONE_APPS = {
  wechat: {
    id: 'wechat',
    name: { en: 'WeChat', zh: '微信' },
    icon: 'msg',
    iconClass: 'pi-msg',
    prompt: `Generate this character's WeChat/messaging app data. Include:
- 3-5 recent chat threads with different contacts (friends, family, coworkers, etc.)
- Each thread has 2-4 recent messages
- Some unread messages
- Messages should reflect the character's social relationships and communication style

Return JSON:
{"chats":[{"contact":"Name","avatar_desc":"brief description","unread":0,"messages":[{"from":"name","text":"content","time":"HH:MM"}]}]}`,
    getCount(data) { return data?.chats?.reduce((n, c) => n + (c.unread || 0), 0) || 0; },
    renderList(data, charName) {
      if (!data?.chats?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3);font-size:14px">No messages</div>';
      return data.chats.map((c, i) => `<div style="display:flex;align-items:center;padding:14px 16px;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('wechat',${i})">
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">${(c.contact || '?')[0]}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between"><span style="color:#fff;font-size:15px;font-weight:500">${esc(c.contact)}</span><span style="color:rgba(255,255,255,.3);font-size:11px">${c.messages?.length ? c.messages[c.messages.length - 1].time : ''}</span></div>
          <div style="color:rgba(255,255,255,.4);font-size:13px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.messages?.length ? c.messages[c.messages.length - 1].text : '')}</div>
        </div>
        ${c.unread ? `<div style="min-width:18px;height:18px;background:#ff3b30;color:#fff;font-size:10px;font-weight:700;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px">${c.unread}</div>` : ''}
      </div>`).join('');
    },
    renderDetail(data, index) {
      const chat = data?.chats?.[index]; if (!chat) return '';
      return `<div style="padding:12px 16px">
        <div style="text-align:center;color:rgba(255,255,255,.3);font-size:12px;margin-bottom:16px">${esc(chat.contact)}</div>
        ${(chat.messages || []).map(m => {
          const isChar = m.from !== 'User' && m.from !== 'user';
          return `<div style="display:flex;margin-bottom:10px;${isChar ? '' : 'flex-direction:row-reverse'}">
            <div style="max-width:70%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.4;${isChar ? 'background:rgba(255,255,255,.08);color:#fff;border-bottom-left-radius:4px' : 'background:rgba(255,255,255,.15);color:#fff;border-bottom-right-radius:4px'}">
              ${esc(m.text)}
              <div style="font-size:10px;opacity:.4;margin-top:4px;text-align:right">${m.time || ''}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }
  },
  gallery: {
    id: 'gallery',
    name: { en: 'Photos', zh: '相冊' },
    icon: 'photos',
    iconClass: 'pi-photos',
    prompt: `Generate this character's photo gallery data. Include:
- 6-10 recent photos
- Each photo has a text description of what it shows
- Include time and optional location
- Photos should reflect the character's life, hobbies, and recent activities

Return JSON:
{"photos":[{"desc":"what the photo shows","time":"YYYY-MM-DD HH:MM","location":"optional place"}]}`,
    getCount(data) { return data?.photos?.length || 0; },
    renderList(data) {
      if (!data?.photos?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No photos</div>';
      return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px">${data.photos.map((p, i) => `<div style="aspect-ratio:1;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:8px;font-size:11px;color:rgba(255,255,255,.4);text-align:center;line-height:1.3" onclick="openPhoneAppDetail('gallery',${i})">${esc((p.desc || '').slice(0, 30))}</div>`).join('')}</div>`;
    },
    renderDetail(data, index) {
      const p = data?.photos?.[index]; if (!p) return '';
      return `<div style="padding:20px;text-align:center">
        <div style="aspect-ratio:4/3;background:rgba(255,255,255,.06);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:20px;margin-bottom:16px">
          <div style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.5">${esc(p.desc)}</div>
        </div>
        <div style="color:rgba(255,255,255,.4);font-size:13px">${p.time || ''}</div>
        ${p.location ? `<div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:4px">📍 ${esc(p.location)}</div>` : ''}
      </div>`;
    }
  },
  wallet: {
    id: 'wallet',
    name: { en: 'Wallet', zh: '錢包' },
    icon: 'wallet',
    iconClass: 'pi-wallet',
    prompt: `Generate this character's wallet/payment app data. Include:
- Current balance
- 5-8 recent transactions
- Each transaction has merchant name, amount (negative for spending, positive for income), time, and category

Return JSON:
{"balance":"1234.56","transactions":[{"merchant":"Store name","amount":"-45.00","time":"YYYY-MM-DD HH:MM","category":"food/transport/shopping/entertainment/transfer"}]}`,
    getCount(data) { return data?.transactions?.length || 0; },
    renderList(data) {
      if (!data) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No data</div>';
      let h = `<div style="padding:24px;text-align:center"><div style="color:rgba(255,255,255,.4);font-size:12px">Balance</div><div style="color:#fff;font-size:32px;font-weight:200;margin-top:4px">¥${esc(data.balance || '0')}</div></div>`;
      h += (data.transactions || []).map((t, i) => `<div style="display:flex;align-items:center;padding:14px 16px;gap:12px;border-top:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('wallet',${i})">
        <div style="flex:1"><div style="color:#fff;font-size:14px">${esc(t.merchant)}</div><div style="color:rgba(255,255,255,.3);font-size:11px;margin-top:2px">${t.time || ''}</div></div>
        <div style="color:${String(t.amount).startsWith('-') ? '#ff6b6b' : '#51cf66'};font-size:15px;font-weight:600">${t.amount?.startsWith?.('-') ? '' : '+'} ¥${esc(String(t.amount).replace(/^[+-]/, ''))}</div>
      </div>`).join('');
      return h;
    },
    renderDetail(data, index) {
      const t = data?.transactions?.[index]; if (!t) return '';
      return `<div style="padding:30px;text-align:center">
        <div style="font-size:36px;font-weight:200;color:${String(t.amount).startsWith('-') ? '#ff6b6b' : '#51cf66'};margin-bottom:16px">¥${esc(String(t.amount).replace(/^[+-]/, ''))}</div>
        <div style="color:#fff;font-size:16px;font-weight:500">${esc(t.merchant)}</div>
        <div style="color:rgba(255,255,255,.4);font-size:13px;margin-top:8px">${t.time || ''}</div>
        <div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:4px">${esc(t.category || '')}</div>
      </div>`;
    }
  },
  notes: {
    id: 'notes',
    name: { en: 'Notes', zh: '備忘錄' },
    icon: 'notes',
    iconClass: 'pi-notes',
    prompt: `Generate this character's notes app data. Include:
- 3-5 notes
- Mix of to-do lists, personal thoughts, drafts, reminders
- Content should reflect the character's inner world and daily life

Return JSON:
{"notes":[{"title":"Note title","content":"Note content with \\n for newlines","time":"YYYY-MM-DD HH:MM"}]}`,
    getCount(data) { return data?.notes?.length || 0; },
    renderList(data) {
      if (!data?.notes?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No notes</div>';
      return data.notes.map((n, i) => `<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('notes',${i})">
        <div style="color:#fff;font-size:15px;font-weight:500">${esc(n.title)}</div>
        <div style="color:rgba(255,255,255,.35);font-size:12px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((n.content || '').replace(/\\n/g, ' ').slice(0, 50))}</div>
        <div style="color:rgba(255,255,255,.25);font-size:11px;margin-top:4px">${n.time || ''}</div>
      </div>`).join('');
    },
    renderDetail(data, index) {
      const n = data?.notes?.[index]; if (!n) return '';
      return `<div style="padding:20px"><div style="color:#fff;font-size:18px;font-weight:600;margin-bottom:12px">${esc(n.title)}</div><div style="color:rgba(255,255,255,.7);font-size:14px;line-height:1.6;white-space:pre-wrap">${esc((n.content || '').replace(/\\n/g, '\n'))}</div><div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:16px">${n.time || ''}</div></div>`;
    }
  },
  browser: {
    id: 'browser',
    name: { en: 'Browser', zh: '瀏覽器' },
    icon: 'browser',
    iconClass: 'pi-browser',
    prompt: `Generate this character's browser history. Include:
- 6-10 recent searches/visited pages
- Should reflect the character's interests, concerns, and recent activities
- Mix of searches and website visits

Return JSON:
{"history":[{"title":"Page title or search query","url":"example.com","time":"YYYY-MM-DD HH:MM","isSearch":true}]}`,
    getCount(data) { return data?.history?.length || 0; },
    renderList(data) {
      if (!data?.history?.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No history</div>';
      return data.history.map((h, i) => `<div style="display:flex;align-items:center;padding:12px 16px;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer" onclick="openPhoneAppDetail('browser',${i})">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px">${h.isSearch ? '🔍' : '🌐'}</div>
        <div style="flex:1;min-width:0">
          <div style="color:#fff;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.title)}</div>
          <div style="color:rgba(255,255,255,.25);font-size:11px;margin-top:2px">${esc(h.url || '')} · ${h.time || ''}</div>
        </div>
      </div>`).join('');
    },
    renderDetail(data, index) {
      const h = data?.history?.[index]; if (!h) return '';
      return `<div style="padding:20px;text-align:center"><div style="font-size:16px;color:#fff;margin-bottom:8px">${esc(h.title)}</div><div style="color:rgba(255,255,255,.3);font-size:13px">${esc(h.url || '')}</div><div style="color:rgba(255,255,255,.25);font-size:12px;margin-top:8px">${h.time || ''}</div></div>`;
    }
  }
};

// ========== PHONE ICON SVGs ==========
const PHONE_ICON_SVG = {
  msg:'<path d="M4 4h18a1 1 0 011 1v11a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>',
  phone:'<path d="M6 4c0 0-2 3-2 5s3 6 6 9 7 5 9 5 5-2 5-2l-3-4-3 2c-1 0-4-2-6-4s-4-5-4-6l2-3L6 4z"/>',
  contacts:'<circle cx="13" cy="9" r="4"/><path d="M5 22c0-4 3.5-7 8-7s8 3 8 7"/>',
  browser:'<circle cx="13" cy="13" r="10"/><path d="M3 13h20"/><path d="M13 3c-3 3-4 6-4 10s1 7 4 10"/><path d="M13 3c3 3 4 6 4 10s-1 7-4 10"/>',
  photos:'<rect x="3" y="5" width="20" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M3 18l5-5 3 3 5-6 7 8"/>',
  camera:'<path d="M4 8h3l2-3h8l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="13" cy="14" r="4"/>',
  music:'<path d="M9 20V6l12-3v14"/><circle cx="7" cy="20" r="3"/><circle cx="19" cy="17" r="3"/>',
  video:'<rect x="2" y="6" width="16" height="14" rx="2"/><path d="M18 10l6-3v12l-6-3"/>',
  notes:'<rect x="4" y="3" width="18" height="20" rx="2"/><path d="M8 8h10M8 12h10M8 16h6"/>',
  wallet:'<rect x="2" y="6" width="22" height="15" rx="2"/><path d="M2 11h22"/><circle cx="19" cy="16" r="1.5" fill="rgba(255,255,255,.6)" stroke="none"/>',
  shop:'<path d="M4 7l2-4h14l2 4"/><rect x="3" y="7" width="20" height="15" rx="1"/><path d="M10 7v3a3 3 0 006 0V7"/>',
  maps:'<path d="M13 3C9 3 6 6.5 6 10c0 5 7 13 7 13s7-8 7-13c0-3.5-3-7-7-7z"/><circle cx="13" cy="10" r="2.5"/>',
  travel:'<path d="M13 3v7l6 3-6 3v7l-10-10z"/><path d="M13 3v7l-6 3 6 3v7"/>',
  calendar:'<rect x="3" y="5" width="20" height="18" rx="2"/><path d="M3 10h20"/><path d="M8 3v4M18 3v4"/>',
  clock:'<circle cx="13" cy="13" r="10"/><path d="M13 7v6l4 3"/>',
  weather:'<circle cx="11" cy="9" r="4"/><path d="M11 3v1M11 15v1M5 9H4M18 9h-1"/>',
  files:'<path d="M4 4h7l2 2h9a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>',
  recorder:'<rect x="4" y="4" width="18" height="18" rx="4"/><circle cx="13" cy="13" r="5"/>',
  health:'<path d="M13 22C13 22 5 17 5 11a5 5 0 0110 0 5 5 0 0110 0c0 6-8 11-8 11h-4z"/>',
  settings:'<circle cx="13" cy="13" r="4"/><path d="M13 3v3M13 20v3M3 13h3M20 13h3M5.6 5.6l2.1 2.1M18.3 18.3l2.1 2.1M5.6 20.4l2.1-2.1M18.3 7.7l2.1-2.1"/>',
  social:'<circle cx="9" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M4 20c0-3 2-5 5-5 1.5 0 2.8.5 3.5 1.5.7-1 2-1.5 3.5-1.5 3 0 5 2 5 5"/>',
  game:'<rect x="3" y="8" width="20" height="13" rx="3"/><circle cx="9" cy="14" r="2"/><path d="M9 13v2M8 14h2"/>',
  book:'<path d="M4 4h8a4 4 0 014 4v14s-2-3-6-3H4V4z"/><path d="M22 4h-6a4 4 0 00-4 4v14s2-3 6-3h4V4z"/>',
  food:'<circle cx="13" cy="14" r="8"/><path d="M9 11c1-2 3-3 4-3s3 1 4 3"/><path d="M7 14h12"/>',
  fitness:'<path d="M5 13h3v-3h2v3h6v-3h2v3h3"/><path d="M5 13v3h3v-3M18 13v3h3v-3"/>'
};

const PHONE_ICON_CLASS_MAP = {
  msg:'pi-msg',phone:'pi-phone',contacts:'pi-contacts',browser:'pi-browser',
  photos:'pi-photos',camera:'pi-camera',music:'pi-music',video:'pi-video',
  notes:'pi-notes',wallet:'pi-wallet',shop:'pi-shop',maps:'pi-maps',
  travel:'pi-travel',calendar:'pi-calendar',clock:'pi-clock',weather:'pi-weather',
  files:'pi-files',recorder:'pi-recorder',health:'pi-health',settings:'pi-settings',
  social:'pi-contacts',game:'pi-travel',book:'pi-notes',food:'pi-shop',fitness:'pi-health'
};

// ========== PHONE ENGINE ==========
function buildPhoneRoleContext(charId, currentAppId) {
  const ch = state.characters.find(c => c.id === charId);
  if (!ch) return '';
  let ctx = '';
  ctx += `【Character】\nName: ${ch.name}\n`;
  if (ch.notes) ctx += `Background: ${ch.notes}\n`;
  if (ch.systemPrompt) ctx += `Personality:\n${ch.systemPrompt}\n`;

  const books = getActiveWorldBooks(ch, state.worldbooks);
  if (books.length) {
    ctx += '\n【World Setting】\n';
    books.forEach(wb => { ctx += `· ${wb.name}`; if (wb.content) ctx += `: ${wb.content}`; ctx += '\n'; });
  }

  const ltm = getCharMemoriesByType(charId, 'ltm');
  if (ltm.length) { ctx += '\n【Long-term Memories】\n'; ltm.slice(0, 5).forEach(m => { ctx += `- (${m.date}) ${m.content}\n`; }); }

  const stm = getCharMemoriesByType(charId, 'stm').filter(m => !m.consolidated);
  if (stm.length) { ctx += '\n【Recent Memories】\n'; stm.slice(0, 5).forEach(m => { ctx += `- (${m.date}) ${m.content}\n`; }); }

  const msgs = (state.chats[charId] || []).slice(-20);
  if (msgs.length) {
    ctx += '\n【Recent Chat】\n';
    msgs.forEach(m => {
      const who = m.role === 'user' ? 'User' : ch.name;
      let content = m.content || '';
      if (m.type === 'voice') content = '[Voice] ' + content;
      else if (m.type === 'sticker') content = '[Sticker]';
      else if (m.type === 'transfer') content = '[Transfer]';
      else if (m.type === 'image' || m.type === 'simImage') content = '[Image]';
      ctx += `${who}: ${content.slice(0, 100)}\n`;
    });
  }

  const charData = getPhoneData(charId);
  const otherApps = Object.keys(charData).filter(k => k !== currentAppId);
  if (otherApps.length) {
    ctx += '\n【Other App Data Snapshot】\n';
    otherApps.forEach(appId => {
      const d = charData[appId]; if (!d) return;
      ctx += `[${appId}]: ${JSON.stringify(d).slice(0, 300)}\n`;
    });
  }

  const now = new Date();
  ctx += `\n【Current Time】${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}\n`;
  return ctx;
}

const PHONE_GLOBAL_RULES = `
Global rules for ALL phone apps:
1. Content MUST match this character's personality and setting.
2. Reference long-term memories and recent chats.
3. User and the character are DIFFERENT people.
4. You may create reasonable daily details.
5. Do NOT create major dramatic events without basis.
6. Events already established in memories/chats must be respected.
7. Times should not exceed the current time.
8. Different apps should be consistent with each other.
9. Return ONLY valid JSON. No explanation, no markdown.
`;

function getPhoneData(charId) {
  if (!state.phoneData) state.phoneData = {};
  if (!state.phoneData[charId]) state.phoneData[charId] = {};
  return state.phoneData[charId];
}

function setPhoneAppData(charId, appId, data) {
  if (!state.phoneData) state.phoneData = {};
  if (!state.phoneData[charId]) state.phoneData[charId] = {};
  state.phoneData[charId][appId] = data;
  saveState();
}

async function generateSingleApp(charId, appId) {
  const appDef = PHONE_APPS[appId]; if (!appDef) return null;
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) { showErrorModal(T('configApi')); return null; }
  const ctx = buildPhoneRoleContext(charId, appId);
  const prompt = ctx + '\n' + PHONE_GLOBAL_RULES + '\n' + appDef.prompt;
  try {
    const reply = await sendChat(api, [
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate ${appDef.name.en || appDef.name} data for this character. Return ONLY JSON.` }
    ]);
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) { const data = JSON.parse(jsonMatch[0]); setPhoneAppData(charId, appId, data); return data; }
  } catch (e) { showErrorModal(friendlyError(e)); }
  return null;
}

async function generateAllApps(charId) {
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) { showErrorModal(T('configApi')); return false; }
  const appIds = Object.keys(PHONE_APPS);
  const ctx = buildPhoneRoleContext(charId, null);
  let appPrompts = '';
  appIds.forEach(id => { const app = PHONE_APPS[id]; appPrompts += `\n--- ${id} ---\n${app.prompt}\n`; });
  const prompt = ctx + '\n' + PHONE_GLOBAL_RULES + `\n\nGenerate data for these apps: ${appIds.join(', ')}\n\nReturn ONE JSON object with each app as a key:\n{\n${appIds.map(id => `    "${id}": { }`).join(',\n')}\n}\n\nIndividual app schemas:\n${appPrompts}`;
  try {
    const reply = await sendChat(api, [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate all phone apps now. Return ONLY the combined JSON.' }
    ]);
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) { const allData = JSON.parse(jsonMatch[0]); appIds.forEach(id => { if (allData[id]) setPhoneAppData(charId, id, allData[id]); }); return true; }
  } catch (e) { showErrorModal(friendlyError(e)); }
  return false;
}

function getAppName(appDef) {
  if (typeof appDef.name === 'object') return appDef.name[state.lang] || appDef.name.en;
  return appDef.name;
}

// ========== PHONE UI ==========
function enterPhoneScreen() {
  nav('screen-phone');
  if (phoneState.selectedCharId && state.characters.find(c => c.id === phoneState.selectedCharId)) showPhoneFrame();
  else showPhoneCharSelect();
}

function showPhoneCharSelect() {
  document.getElementById('phoneCharSelect').style.display = 'block';
  document.getElementById('phoneFrameWrap').style.display = 'none';
  document.getElementById('phoneNavRight').style.display = 'none';
  document.getElementById('phoneNavTitle').textContent = T('phone');
  phoneState.currentAppId = null;
  renderPhoneCharList();
}

function renderPhoneCharList() {
  const el = document.getElementById('phoneCharList');
  if (!state.characters.length) { el.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,.35);padding:30px;font-size:14px">${T('noCharForPhone')}</div>`; return; }
  el.innerHTML = '<div style="background:rgba(255,255,255,.04);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.06)">' +
    state.characters.map(ch =>
      `<div style="display:flex;align-items:center;padding:16px;gap:14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05)" onclick="selectPhoneChar('${ch.id}')">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.06);overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${ch.avatar ? `<img src="${ch.avatar}" style="width:100%;height:100%;object-fit:cover">` : '<svg viewBox="0 0 32 32" style="width:24px;height:24px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:1.5"><circle cx="16" cy="12" r="5"/><path d="M6 28c0-6 4-10 10-10s10 4 10 10"/></svg>'}
        </div>
        <div style="flex:1"><div style="color:#fff;font-size:16px;font-weight:600">${esc(ch.name)}</div><div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:3px">${T('tapToViewPhone')}</div></div>
        <svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:rgba(255,255,255,.3);fill:none;stroke-width:2"><path d="M6 3l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    ).join('') + '</div>';
}

async function selectPhoneChar(cid) {
  phoneState.selectedCharId = cid;
  showPhoneFrame();
  renderPhoneHome();
  const charData = getPhoneData(cid);
  if (Object.keys(charData).length === 0) {
    const grid = document.getElementById('phoneAppGrid');
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px 0"><div class="spin-ring" style="width:28px;height:28px;border-color:rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6)"></div><div style="color:rgba(255,255,255,.35);font-size:13px;margin-top:14px">${T('generatingPhone')}</div></div>`;
    await generateAllApps(cid);
    renderPhoneHome();
  }
}

function showPhoneFrame() {
  document.getElementById('phoneCharSelect').style.display = 'none';
  document.getElementById('phoneFrameWrap').style.display = 'block';
  document.getElementById('phoneNavRight').style.display = 'flex';
  const ch = state.characters.find(c => c.id === phoneState.selectedCharId);
  if (ch) {
    document.getElementById('phoneNavTitle').textContent = ch.name;
    document.getElementById('phoneOwnerName').textContent = ch.name + "'s Phone";
  }
  updatePhoneTime();
}

function renderPhoneHome() {
  const cid = phoneState.selectedCharId;
  const grid = document.getElementById('phoneAppGrid');
  const appIds = Object.keys(PHONE_APPS);
  const charData = getPhoneData(cid);
  grid.innerHTML = appIds.map(appId => {
    const app = PHONE_APPS[appId];
    const iconKey = app.icon || 'notes';
    const iconClass = app.iconClass || PHONE_ICON_CLASS_MAP[iconKey] || 'pi-notes';
    const svgInner = PHONE_ICON_SVG[iconKey] || PHONE_ICON_SVG.notes;
    const data = charData[appId];
    const badge = data ? (app.getCount(data) || 0) : 0;
    const name = getAppName(app);
    return `<div class="phone-app-item" onclick="openPhoneApp('${appId}')" style="cursor:pointer">
      <div class="phone-app-icon ${iconClass}">
        <svg viewBox="0 0 26 26">${svgInner}</svg>
        ${badge > 0 ? `<div class="phone-app-badge">${badge > 99 ? '99+' : badge}</div>` : ''}
      </div>
      <div class="phone-app-name">${esc(name.slice(0, 12))}</div>
    </div>`;
  }).join('');
}

function openPhoneApp(appId) {
  const appDef = PHONE_APPS[appId]; if (!appDef) return;
  phoneState.currentAppId = appId;
  const cid = phoneState.selectedCharId;
  const data = getPhoneData(cid)[appId];
  const frame = document.querySelector('.phone-frame');
  const name = getAppName(appDef);
  frame.innerHTML = `<div style="background:linear-gradient(165deg,#1a1a1e,#2c2c30);min-height:100%">
    <div style="display:flex;align-items:center;padding:14px 12px;gap:10px;position:sticky;top:0;background:rgba(26,26,30,.95);backdrop-filter:blur(10px);z-index:10">
      <button onclick="backToPhoneHome()" style="background:none;border:none;cursor:pointer;padding:4px"><svg viewBox="0 0 20 20" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2"><path d="M12 4l-6 6 6 6" stroke-linecap="round"/></svg></button>
      <span style="flex:1;color:#fff;font-size:17px;font-weight:600">${esc(name)}</span>
      <button onclick="refreshPhoneApp('${appId}')" style="background:none;border:none;cursor:pointer;padding:4px" id="phoneAppRefreshBtn"><svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:1.5"><path d="M14.5 3.5l1 3.5h-3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 16.5l-1-3.5h3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7a7 7 0 01-1 9.5M5 13a7 7 0 011-9.5" stroke-linecap="round"/></svg></button>
    </div>
    <div id="phoneAppContent">${data ? appDef.renderList(data, '') : '<div style="padding:40px;text-align:center;color:rgba(255,255,255,.3)">No data yet. Tap refresh.</div>'}</div>
  </div>`;
}

function openPhoneAppDetail(appId, index) {
  const appDef = PHONE_APPS[appId]; if (!appDef) return;
  const cid = phoneState.selectedCharId;
  const data = getPhoneData(cid)[appId];
  const name = getAppName(appDef);
  const frame = document.querySelector('.phone-frame');
  frame.innerHTML = `<div style="background:linear-gradient(165deg,#1a1a1e,#2c2c30);min-height:100%">
    <div style="display:flex;align-items:center;padding:14px 12px;gap:10px;position:sticky;top:0;background:rgba(26,26,30,.95);backdrop-filter:blur(10px);z-index:10">
      <button onclick="openPhoneApp('${appId}')" style="background:none;border:none;cursor:pointer;padding:4px"><svg viewBox="0 0 20 20" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2"><path d="M12 4l-6 6 6 6" stroke-linecap="round"/></svg></button>
      <span style="flex:1;color:#fff;font-size:17px;font-weight:600">${esc(name)}</span>
    </div>
    <div>${data ? appDef.renderDetail(data, index) : ''}</div>
  </div>`;
}

function backToPhoneHome() {
  phoneState.currentAppId = null;
  const frame = document.querySelector('.phone-frame');
  frame.innerHTML = buildPhoneFrameHTML();
  renderPhoneHome();
  updatePhoneTime();
}

function buildPhoneFrameHTML() {
  return `<div class="phone-statusbar"><div class="phone-statusbar-left"><svg viewBox="0 0 14 14"><path d="M1 10l3-6h6l3 6"/><path d="M3 10h8"/></svg><span>LTE</span></div><div class="phone-statusbar-right"><svg viewBox="0 0 14 14"><path d="M1 4h2v8H1zM5 2h2v10H5zM9 5h2v7H9zM13 7h0"/></svg><svg viewBox="0 0 14 14"><rect x="1" y="4" width="10" height="7" rx="1"/><path d="M12 6.5v2"/></svg><span>85%</span></div></div>
  <div class="phone-time-display"><div class="ptd-time" id="phoneTime">09:41</div><div class="ptd-date" id="phoneDate">Monday, January 1</div></div>
  <div style="text-align:center;padding:0 0 20px"><span style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,.06);border-radius:20px;color:rgba(255,255,255,.4);font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,.06)" id="phoneOwnerName"></span></div>
  <div class="phone-app-grid" id="phoneAppGrid"></div>
  <div class="phone-dock"><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4c0 0-2 3-2 5s3 6 6 9 7 5 9 5 5-2 5-2l-3-4-3 2c-1 0-4-2-6-4s-4-5-4-6l2-3L6 4z"/></svg></div><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h18a1 1 0 011 1v11a1 1 0 01-1 1h-8l-5 4v-4H4a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg></div><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="13" r="10"/><path d="M3 13h20"/><path d="M13 3c-3 3-4 6-4 10s1 7 4 10"/><path d="M13 3c3 3 4 6 4 10s-1 7-4 10"/></svg></div><div class="phone-app-icon"><svg viewBox="0 0 26 26" stroke="#fff" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20V6l12-3v14"/><circle cx="7" cy="20" r="3"/><circle cx="19" cy="17" r="3"/></svg></div></div>
  <div class="phone-home-bar"></div>`;
}

async function refreshPhoneApp(appId) {
  const btn = document.getElementById('phoneAppRefreshBtn');
  if (btn) btn.innerHTML = '<div class="spin-ring sm" style="border-color:rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6)"></div>';
  const data = await generateSingleApp(phoneState.selectedCharId, appId);
  if (data) {
    const appDef = PHONE_APPS[appId];
    const el = document.getElementById('phoneAppContent');
    if (el && appDef) el.innerHTML = appDef.renderList(data, '');
  }
  if (btn) btn.innerHTML = '<svg viewBox="0 0 20 20" style="width:18px;height:18px;stroke:rgba(255,255,255,.5);fill:none;stroke-width:1.5"><path d="M14.5 3.5l1 3.5h-3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 16.5l-1-3.5h3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7a7 7 0 01-1 9.5M5 13a7 7 0 011-9.5" stroke-linecap="round"/></svg>';
  showToast(T('regenerated'));
}

async function regeneratePhone() {
  if (!phoneState.selectedCharId) return;
  const grid = document.getElementById('phoneAppGrid');
  if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px 0"><div class="spin-ring" style="width:28px;height:28px;border-color:rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.6)"></div><div style="color:rgba(255,255,255,.35);font-size:13px;margin-top:14px">${T('generatingPhone')}</div></div>`;
  await generateAllApps(phoneState.selectedCharId);
  renderPhoneHome();
  showToast(T('regenerated'));
}
