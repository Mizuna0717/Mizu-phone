// ========== 06-api.js ==========
// 依賴：04-i18n.js (T)

function normalizeUrl(r) {
  return (r || '').trim().replace(/\/+$/, '');
}

function getCandidates(raw) {
  const b = normalizeUrl(raw);
  return b.endsWith('/v1') ? [b] : [b + '/v1', b];
}

function friendlyError(e) {
  const m = e?.message || '';
  if (m.includes('Failed to fetch')) return T('errNetwork');
  if (m.includes('401') || m.includes('403')) return T('errAuth');
  if (m.includes('429')) return T('errRateLimit');
  return T('errUnknown') + ': ' + m.slice(0, 100);
}

async function fetchModelList(u, k) {
  const c = getCandidates(u);
  let l = null;
  for (const b of c) {
    try {
      const r = await fetch(b + '/models', { headers: { 'Authorization': 'Bearer ' + k } });
      if (!r.ok) { l = new Error('HTTP ' + r.status); continue; }
      const d = await r.json();
      const m = d.data || d.models || [];
      if (m.length > 0) { tmp.resolvedBase = b; return m; }
      l = new Error(T('errEmptyList'));
    } catch (e) { l = e; }
  }
  throw l || new Error(T('errUnknown'));
}

async function sendChat(cfg, msgs) {
  const c = cfg._resolvedBase ? [cfg._resolvedBase] : getCandidates(cfg.url);
  let l = null;
  for (const b of c) {
    try {
      const r = await fetch(b + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
        body: JSON.stringify({
          model: cfg.model || 'gpt-3.5-turbo',
          messages: msgs,
          temperature: cfg.temperature ?? 0.8,
          stream: false
        })
      });
      if (!r.ok) { l = new Error(r.status + ': ' + (await r.text().catch(() => '')).slice(0, 200)); continue; }
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return d.choices?.[0]?.message?.content ?? '';
    } catch (e) { l = e; }
  }
  throw l || new Error(T('errUnknown'));
}
