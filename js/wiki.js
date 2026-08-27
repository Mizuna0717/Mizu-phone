/* ==========================================================================
   Wiki Module — v6 with NPC System
   ========================================================================== */

const WIKI_PANEL_CLASS = 'wiki-panel-visible';

function wikiT(key) {
	const lang = window.currentLang || (typeof getLang === 'function' ? getLang() : 'en');
	if (typeof LANG !== 'undefined' && LANG && LANG[lang] && LANG[lang][key] !== undefined) return LANG[lang][key];
	if (typeof LANG !== 'undefined' && LANG && LANG.en && LANG.en[key] !== undefined) return LANG.en[key];
	return key;
}

function wikiEsc(s) {
	if (typeof esc === 'function') return esc(s);
	if (!s) return '';
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wikiApplyI18n() {
	const root = document.getElementById('screen-wiki');
	if (!root) return;
	root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = wikiT(el.getAttribute('data-i18n')); });
	root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = wikiT(el.getAttribute('data-i18n-ph')); });
}

function wikiUid() {
	if (typeof uid === 'function') return uid();
	return 'npc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}

// ====================== Data Source ======================
let wikiSelectedCharId = null;

function getWikiCharacters() {
	if (typeof getCharacters === 'function') return getCharacters();
	if (window.state && Array.isArray(window.state.characters)) return window.state.characters;
	return [];
}

function getNpcsForChar(charId) {
	if (!Array.isArray(state.npcs)) state.npcs = [];
	return state.npcs.filter(function(n) { return n.characterId === charId; });
}

// ====================== Schedule Data ======================
const _today = new Date();
const _fmt = d => d.toISOString().split('T')[0];
const _yesterday = new Date(_today); _yesterday.setDate(_today.getDate() - 1);
const _tomorrow  = new Date(_today); _tomorrow.setDate(_today.getDate() + 1);
const _dayAfter  = new Date(_today); _dayAfter.setDate(_today.getDate() + 2);

let wikiScheduleData = [];
let currentScheduleFilter = 'all';
let wikiScheduleNextId = 100;
let selectedScheduleChars = new Set();

// ====================== View Navigation ======================

function wikiNavBack() {
	if (wikiSelectedCharId !== null) wikiShowListView();
	else nav('screen-home');
}

function wikiShowListView() {
	wikiSelectedCharId = null;
	const listView   = document.getElementById('wiki-list-view');
	const detailView = document.getElementById('wiki-detail-view');
	if (detailView) detailView.classList.remove('wiki-view-active', 'wiki-view-back');
	if (listView) { listView.classList.remove('wiki-view-active'); listView.classList.add('wiki-view-active', 'wiki-view-back'); }
	const title = document.getElementById('wiki-nav-title');
	const largeTitle = document.getElementById('wiki-large-title');
	if (title) title.textContent = wikiT('wiki.title');
	if (largeTitle) { largeTitle.textContent = wikiT('wiki.title'); largeTitle.style.display = ''; }
	const addBtn = document.getElementById('wiki-nav-add-btn');
	if (addBtn) addBtn.style.display = '';
	renderWikiCharacterList();
}

function wikiShowDetailView(charId) {
	const chars = getWikiCharacters();
	const char  = chars.find(function(c) { return c.id === charId; });
	if (!char) { console.warn('[Wiki] Character not found:', charId); return; }
	wikiSelectedCharId = char.id;

	const avatarEl = document.getElementById('wiki-detail-avatar');
	if (avatarEl) {
		if (char.avatar) {
			avatarEl.innerHTML = '<img src="' + wikiEsc(char.avatar) + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>';
		} else {
			var letter = (char.name || '?').charAt(0).toUpperCase();
			avatarEl.innerHTML = '<span style="font-size:28px;font-weight:700;color:#8e8e93;">' + letter + '</span>';
		}
	}
	const nameEl = document.getElementById('wiki-detail-name');
	if (nameEl) nameEl.textContent = char.name || 'Unnamed';
	const title = document.getElementById('wiki-nav-title');
	if (title) title.textContent = char.name || 'Unnamed';
	const largeTitle = document.getElementById('wiki-large-title');
	if (largeTitle) largeTitle.style.display = 'none';

	const listView   = document.getElementById('wiki-list-view');
	const detailView = document.getElementById('wiki-detail-view');
	if (listView)   listView.classList.remove('wiki-view-active', 'wiki-view-back');
	if (detailView) { detailView.classList.remove('wiki-view-active', 'wiki-view-back'); detailView.classList.add('wiki-view-active'); }

	switchWikiDetailTab('npc');
}

// ====================== Character List ======================

function renderWikiCharacterList() {
	const grid  = document.getElementById('wiki-char-grid');
	const empty = document.getElementById('wiki-list-empty');
	if (!grid) return;
	const chars = getWikiCharacters();
	if (chars.length === 0) { grid.innerHTML = ''; if (empty) empty.style.display = ''; return; }
	if (empty) empty.style.display = 'none';
	grid.innerHTML = chars.map(function(c) {
		var av;
		if (c.avatar) av = '<img src="' + wikiEsc(c.avatar) + '" alt="' + wikiEsc(c.name) + '"/>';
		else av = '<span class="wiki-avatar-letter">' + (c.name || '?').charAt(0).toUpperCase() + '</span>';
		return '<div class="wiki-char-card" onclick="wikiShowDetailView(\'' + c.id + '\')">' +
			'<div class="wiki-char-card-avatar">' + av + '</div>' +
			'<div class="wiki-char-card-name">' + wikiEsc(c.name || 'Unnamed') + '</div></div>';
	}).join('');
}

function filterWikiCharacters(query) {
	const grid = document.getElementById('wiki-char-grid');
	if (!grid) return;
	const q = query.toLowerCase().trim();
	grid.querySelectorAll('.wiki-char-card').forEach(function(card) {
		const name = card.querySelector('.wiki-char-card-name');
		if (!name) return;
		card.style.display = name.textContent.toLowerCase().includes(q) || !q ? '' : 'none';
	});
}

// ====================== NPC List ======================

function renderNpcList() {
	const wrap = document.getElementById('npc-list-wrap');
	if (!wrap) return;
	const charId = wikiSelectedCharId;
	if (!charId) { wrap.innerHTML = ''; return; }

	const npcs = getNpcsForChar(charId);

	if (npcs.length === 0) {
		wrap.innerHTML =
			'<div class="npc-empty">' +
				'<svg viewBox="0 0 48 48">' +
					'<circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
					'<circle cx="32" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
					'<path d="M6 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
					'<path d="M22 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
				'</svg>' +
				'<p>No NPCs yet</p>' +
				'<span>Tap the Add button to create or generate NPCs</span>' +
			'</div>';
		return;
	}

	var html = '<div class="npc-list">';
	npcs.forEach(function(npc) {
		var letter = (npc.name || '?').charAt(0).toUpperCase();
		html +=
			'<div class="npc-card">' +
				'<div class="npc-card-top">' +
					'<div class="npc-card-avatar">' + letter + '</div>' +
					'<div class="npc-card-info">' +
						'<div class="npc-card-name">' + wikiEsc(npc.name) + '</div>' +
						(npc.relationship ? '<div class="npc-card-rel"><svg viewBox="0 0 16 16"><path d="M2 8h3l2-3 3 6 2-3h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' + wikiEsc(npc.relationship) + '</div>' : '') +
					'</div>' +
					'<button class="npc-card-del" onclick="event.stopPropagation(); deleteNpc(\'' + npc.id + '\')">' +
						'<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>' +
					'</button>' +
				'</div>' +
				(npc.personality ? '<div class="npc-card-personality">' + wikiEsc(npc.personality) + '</div>' : '') +
			'</div>';
	});
	html += '</div>';
	wrap.innerHTML = html;
}

// ====================== NPC Action Sheet ======================

function openNpcActionSheet() {
	var modal = document.getElementById('npc-action-sheet');
	if (modal) modal.classList.add('active');
}

function closeNpcActionSheet() {
	var modal = document.getElementById('npc-action-sheet');
	if (modal) modal.classList.remove('active');
}

// ====================== NPC Manual Add ======================

function openNpcManualModal() {
	var modal = document.getElementById('npc-manual-modal');
	if (!modal) return;
	var n = document.getElementById('npc-manual-name');
	var p = document.getElementById('npc-manual-personality');
	var r = document.getElementById('npc-manual-relationship');
	if (n) n.value = '';
	if (p) p.value = '';
	if (r) r.value = '';
	modal.classList.add('active');
}

function closeNpcManualModal() {
	var modal = document.getElementById('npc-manual-modal');
	if (modal) modal.classList.remove('active');
}

function saveManualNpc() {
	var name = (document.getElementById('npc-manual-name') || {}).value || '';
	name = name.trim();
	var personality = (document.getElementById('npc-manual-personality') || {}).value || '';
	personality = personality.trim();
	var relationship = (document.getElementById('npc-manual-relationship') || {}).value || '';
	relationship = relationship.trim();

	if (!name) { var el = document.getElementById('npc-manual-name'); if (el) el.focus(); if (typeof showToast === 'function') showToast('Please enter a name'); return; }
	if (!personality) { var el2 = document.getElementById('npc-manual-personality'); if (el2) el2.focus(); if (typeof showToast === 'function') showToast('Please enter personality'); return; }
	if (!relationship) { var el3 = document.getElementById('npc-manual-relationship'); if (el3) el3.focus(); if (typeof showToast === 'function') showToast('Please enter relationship'); return; }

	if (!Array.isArray(state.npcs)) state.npcs = [];

	state.npcs.push({
		id: wikiUid(),
		name: name,
		personality: personality,
		relationship: relationship,
		characterId: wikiSelectedCharId
	});

	saveState();
	closeNpcManualModal();
	renderNpcList();
	if (typeof showToast === 'function') showToast('NPC added: ' + name);
	console.log('[Wiki NPC] Manual add:', name, '| total npcs:', state.npcs.length);
}

// ====================== NPC Auto Generate ======================

function openNpcAutoGenModal() {
	var modal = document.getElementById('npc-auto-gen-modal');
	if (!modal) return;
	var countEl = document.getElementById('npc-gen-count');
	if (countEl) countEl.value = '1';
	var btn = document.getElementById('npc-gen-confirm-btn');
	if (btn) { btn.textContent = 'Generate NPC'; btn.disabled = false; }
	modal.classList.add('active');
}

function closeNpcAutoGenModal() {
	var modal = document.getElementById('npc-auto-gen-modal');
	if (modal) modal.classList.remove('active');
}

async function triggerNpcAutoGen() {
	var countEl = document.getElementById('npc-gen-count');
	var btn     = document.getElementById('npc-gen-confirm-btn');
	var count   = Math.max(1, Math.min(10, parseInt((countEl || {}).value) || 1));

	var api = (state.apis || []).find(function(a) { return a.id === state.activeApiId; });
	if (!api || !api.url || !api.model) {
		if (typeof showToast === 'function') showToast('No active API configured');
		return;
	}

	var chars = getWikiCharacters();
	var char  = chars.find(function(c) { return c.id === wikiSelectedCharId; });
	if (!char) {
		if (typeof showToast === 'function') showToast('No character selected');
		return;
	}

	if (btn) { btn.textContent = 'Generating...'; btn.disabled = true; }

	try {
		var context = {
			name: char.name || '',
			personality: char.personality || '',
			background: char.backstory || char.background || char.notes || '',
			systemPrompt: char.systemPrompt || '',
			worldbookIds: char.worldbookIds || [],
			characterId: wikiSelectedCharId
		};

		var results = await generateNPCs(count, context);

		if (!results || results.length === 0) {
			throw new Error('No NPCs generated');
		}

		if (!Array.isArray(state.npcs)) state.npcs = [];

		results.forEach(function(npc) {
			state.npcs.push({
				id: wikiUid(),
				name: npc.name,
				personality: npc.personality,
				relationship: npc.relationship,
				characterId: wikiSelectedCharId
			});
		});

		saveState();
		closeNpcAutoGenModal();
		renderNpcList();

		if (typeof showToast === 'function') showToast(results.length + ' NPC(s) generated');
		console.log('[Wiki NPC] Auto generated:', results.length, '| total npcs:', state.npcs.length);

	} catch (e) {
		console.error('[Wiki NPC] Generation failed:', e);
		var msg = e.message || 'Generation failed';
		if (typeof friendlyError === 'function' && msg.includes('fetch')) msg = friendlyError(e);
		if (typeof showToast === 'function') showToast(msg);
		if (btn) { btn.textContent = 'Generate NPC'; btn.disabled = false; }
	}
}

// ====================== NPC Delete ======================

function deleteNpc(npcId) {
	if (!Array.isArray(state.npcs)) return;
	var npc = state.npcs.find(function(n) { return n.id === npcId; });
	state.npcs = state.npcs.filter(function(n) { return n.id !== npcId; });
	saveState();
	renderNpcList();
	if (typeof showToast === 'function') showToast('NPC deleted' + (npc ? ': ' + npc.name : ''));
	console.log('[Wiki NPC] Deleted:', npcId, '| remaining:', state.npcs.length);
}

// ====================== Relationships ======================

function renderRelationships(char) {
	var container = document.getElementById('wiki-rel-content');
	if (!container) return;
	var rels = char.relationships || [];
	if (!rels.length) {
		container.innerHTML =
			'<svg viewBox="0 0 60 40" class="wiki-rel-icon"><circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="45" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="30" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="1"/><path d="M22 18l5 11M38 18l-5 11M23 15h14" stroke="currentColor" fill="none" stroke-width="1" stroke-dasharray="2 2"/></svg>' +
			'<p>' + wikiT('wiki.relationships.empty') + '</p><span>' + wikiT('wiki.relationships.emptySub') + '</span>';
		return;
	}
	var html = '<div class="wiki-rel-list">';
	rels.forEach(function(r) {
		var target = getWikiCharacters().find(function(c) { return c.id === r.targetId; });
		var name   = target ? target.name : (r.targetName || 'Unknown');
		html += '<div class="wiki-rel-row"><div class="wiki-rel-name">' + wikiEsc(name) + '</div><div class="wiki-rel-type">' + wikiEsc(r.type || r.relation || '') + '</div></div>';
	});
	html += '</div>';
	container.innerHTML = html;
}

// ====================== Tab Switching ======================

function switchWikiDetailTab(tabName) {
	var wikiRoot = document.getElementById('screen-wiki');
	if (!wikiRoot) return;
	wikiRoot.querySelectorAll('.wiki-detail-tab').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.dtab === tabName); });
	wikiRoot.querySelectorAll('.wiki-detail-panel').forEach(function(panel) { panel.classList.remove(WIKI_PANEL_CLASS); });
	var target = document.getElementById('wiki-detail-' + tabName);
	if (target) target.classList.add(WIKI_PANEL_CLASS);
	var body = wikiRoot.querySelector('#wiki-detail-view .screen-body');
	if (body) body.scrollTop = 0;

	if (tabName === 'npc') renderNpcList();
	if (tabName === 'schedule') renderScheduleTimeline();
	if (tabName === 'relationships') {
		var chars = getWikiCharacters();
		var char  = chars.find(function(c) { return c.id === wikiSelectedCharId; });
		if (char) renderRelationships(char);
	}
}

// ====================== Nav Add Button ======================

function wikiNavAddAction() {
	if (wikiSelectedCharId !== null) {
		var activeTab = document.querySelector('#screen-wiki .wiki-detail-tab.active');
		var tabName = activeTab ? activeTab.dataset.dtab : 'npc';
		if (tabName === 'npc') openNpcActionSheet();
		else if (tabName === 'schedule') openScheduleAddModal();
		else console.log('[Wiki] Add action for tab:', tabName);
	} else {
		if (typeof createNewChar === 'function') { state.charEditFrom = 'screen-wiki'; createNewChar(); }
	}
}

// ====================== Schedule ======================

function renderScheduleTimeline() {
	var container = document.getElementById('schedule-timeline');
	if (!container) return;
	var data = wikiScheduleData.slice();
	if (wikiSelectedCharId) {
		var chars = getWikiCharacters();
		var sel = chars.find(function(c) { return c.id === wikiSelectedCharId; });
		if (sel) data = data.filter(function(item) { return item.characters.some(function(n) { return n.toLowerCase() === sel.name.toLowerCase(); }); });
	}
	if (currentScheduleFilter !== 'all') data = data.filter(function(item) { return item.status === currentScheduleFilter; });
	if (data.length === 0) { container.innerHTML = renderScheduleEmpty(); return; }
	data.sort(function(a, b) { return a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time); });
	var groups = {};
	data.forEach(function(item) { var label = getDateGroupLabel(item.date); if (!groups[label]) groups[label] = []; groups[label].push(item); });
	var order = ['Yesterday', 'Today'];
	var sortedKeys = Object.keys(groups).sort(function(a, b) { var ai = order.indexOf(a), bi = order.indexOf(b); if (ai !== -1 && bi !== -1) return ai - bi; if (ai !== -1) return -1; if (bi !== -1) return 1; return a.localeCompare(b); });
	var html = '';
	sortedKeys.forEach(function(label) {
		var items = groups[label];
		html += '<div class="schedule-date-group"><div class="schedule-date-label"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' + label + '</div><div class="schedule-items">';
		items.forEach(function(item) {
			var ic = item.status === 'completed';
			html += '<div class="schedule-item ' + (ic ? 'is-completed' : '') + '" onclick="openScheduleDetail(' + item.id + ')"><div class="schedule-item-indicator"><div class="schedule-dot ' + item.status + '" onclick="event.stopPropagation(); toggleScheduleStatus(' + item.id + ')"></div><div class="schedule-item-line"></div></div><div class="schedule-item-body"><div class="schedule-item-time"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' + item.time + '</div><div class="schedule-item-title">' + wikiEsc(item.title) + '</div><div class="schedule-item-characters"><svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' + wikiEsc(item.characters.join(', ')) + '</div><div class="schedule-item-desc">' + wikiEsc(item.description) + '</div></div><button class="schedule-item-more" onclick="event.stopPropagation(); openScheduleDetail(' + item.id + ')"><svg viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/></svg></button></div>';
		});
		html += '</div></div>';
	});
	container.innerHTML = html;
}

function renderScheduleEmpty() {
	return '<div class="schedule-empty"><svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16 6v6M32 6v6M8 18h32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M18 26h12M18 32h8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/></svg><p>' + wikiT('wiki.schedule.empty') + '</p><span>' + wikiT('wiki.schedule.emptySub') + '</span><br/><button class="schedule-empty-add" onclick="openScheduleAddModal()"><svg viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>' + wikiT('wiki.schedule.add') + '</button></div>';
}

function getDateGroupLabel(dateStr) {
	var today = new Date(); today.setHours(0,0,0,0);
	var yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
	var target = new Date(dateStr + 'T00:00:00'); target.setHours(0,0,0,0);
	if (target.getTime() === today.getTime()) return wikiT('wiki.schedule.today');
	if (target.getTime() === yesterday.getTime()) return wikiT('wiki.schedule.yesterday');
	return formatScheduleDate(dateStr);
}

function formatScheduleDate(dateStr) {
	var date = new Date(dateStr + 'T00:00:00');
	var lang = window.currentLang || 'en';
	if (lang === 'zh') { var wd = ['周日','周一','周二','周三','周四','周五','周六']; return (date.getMonth()+1) + '月' + date.getDate() + '日 · ' + wd[date.getDay()]; }
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate();
}

function filterSchedule(filterType) {
	currentScheduleFilter = filterType;
	document.querySelectorAll('#screen-wiki .schedule-filter').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.filter === filterType); });
	renderScheduleTimeline();
}

function toggleScheduleStatus(id) {
	var item = wikiScheduleData.find(function(d) { return d.id === id; });
	if (!item) return;
	item.status = item.status === 'completed' ? 'pending' : 'completed';
	renderScheduleTimeline();
}

function openScheduleAddModal() {
	var modal = document.getElementById('schedule-add-modal');
	if (!modal) return;
	var ti = document.getElementById('sched-add-title'); if (ti) ti.value = '';
	var di = document.getElementById('sched-add-date'); if (di) di.value = _fmt(new Date());
	var tmi = document.getElementById('sched-add-time'); if (tmi) tmi.value = '12:00';
	var dsc = document.getElementById('sched-add-desc'); if (dsc) dsc.value = '';
	selectedScheduleChars.clear();
	if (wikiSelectedCharId) { var c = getWikiCharacters().find(function(c) { return c.id === wikiSelectedCharId; }); if (c) selectedScheduleChars.add(c.name); }
	renderScheduleCharTags();
	modal.classList.add('active');
}

function closeScheduleAddModal() { var m = document.getElementById('schedule-add-modal'); if (m) m.classList.remove('active'); }

function renderScheduleCharTags() {
	var container = document.getElementById('sched-add-chars');
	if (!container) return;
	var chars = getWikiCharacters();
	if (!chars.length) { container.innerHTML = '<div class="modal-tag-empty">No characters available</div>'; return; }
	container.innerHTML = chars.map(function(c) { return '<span class="modal-tag ' + (selectedScheduleChars.has(c.name) ? 'selected' : '') + '" onclick="toggleScheduleCharTag(this, \'' + wikiEsc(c.name) + '\')">' + wikiEsc(c.name) + '</span>'; }).join('');
}

function toggleScheduleCharTag(el, name) {
	if (selectedScheduleChars.has(name)) { selectedScheduleChars.delete(name); el.classList.remove('selected'); }
	else { selectedScheduleChars.add(name); el.classList.add('selected'); }
}

function saveScheduleEvent() {
	var titleEl = document.getElementById('sched-add-title');
	var title = titleEl ? titleEl.value.trim() : '';
	if (!title) { if (titleEl) titleEl.focus(); return; }
	var dateEl = document.getElementById('sched-add-date');
	var timeEl = document.getElementById('sched-add-time');
	var descEl = document.getElementById('sched-add-desc');
	wikiScheduleData.push({ id: ++wikiScheduleNextId, date: dateEl ? dateEl.value : _fmt(new Date()), time: timeEl ? timeEl.value : '12:00', title: title, characters: Array.from(selectedScheduleChars), description: descEl ? descEl.value.trim() : '', status: 'pending' });
	closeScheduleAddModal();
	renderScheduleTimeline();
}

function openScheduleDetail(id) {
	var item = wikiScheduleData.find(function(d) { return d.id === id; });
	if (!item) return;
	var body = document.getElementById('schedule-detail-body');
	var footer = document.getElementById('schedule-detail-footer');
	if (!body) return;
	var ic = item.status === 'completed';
	body.innerHTML = '<div class="detail-status-badge ' + item.status + '">' + (ic ? '<svg viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5 6.5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ' + wikiT('wiki.schedule.completed') : '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg> ' + wikiT('wiki.schedule.pending')) + '</div><div class="detail-title">' + wikiEsc(item.title) + '</div><div class="detail-info-card"><div class="detail-info-row"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span class="detail-info-label">Date</span><span class="detail-info-value">' + formatScheduleDate(item.date) + '</span></div><div class="detail-info-row"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span class="detail-info-label">Time</span><span class="detail-info-value">' + item.time + '</span></div><div class="detail-info-row"><svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span class="detail-info-label">Characters</span><span class="detail-info-value">' + (item.characters.length ? wikiEsc(item.characters.join(', ')) : '—') + '</span></div></div>' + (item.description ? '<div class="detail-desc-title">Description</div><div class="detail-desc-body">' + wikiEsc(item.description) + '</div>' : '');
	if (footer) footer.innerHTML = '<button class="wiki-modal-btn-outline" onclick="deleteScheduleEvent(' + item.id + ')">Delete</button><button class="wiki-modal-btn-outline primary" onclick="toggleScheduleStatus(' + item.id + '); openScheduleDetail(' + item.id + ');">' + (ic ? 'Mark Pending' : 'Mark Completed') + '</button>';
	var modal = document.getElementById('schedule-detail-modal');
	if (modal) modal.classList.add('active');
}

function closeScheduleDetailModal() { var m = document.getElementById('schedule-detail-modal'); if (m) m.classList.remove('active'); renderScheduleTimeline(); }
function deleteScheduleEvent(id) { wikiScheduleData = wikiScheduleData.filter(function(d) { return d.id !== id; }); closeScheduleDetailModal(); }

// ====================== Init ======================

function initWikiModule() {
	wikiApplyI18n();
	renderWikiCharacterList();
	wikiShowListView();
}

window.renderWikiCharacterList = renderWikiCharacterList;
window.initWikiModule          = initWikiModule;
window.getWikiCharacters       = getWikiCharacters;
window.getNpcsForChar          = getNpcsForChar;
window.renderNpcList           = renderNpcList;
window.wikiShowDetailView      = wikiShowDetailView;
window.wikiShowListView        = wikiShowListView;
window.wikiNavBack             = wikiNavBack;
window.wikiNavAddAction        = wikiNavAddAction;
window.switchWikiDetailTab     = switchWikiDetailTab;
window.filterWikiCharacters    = filterWikiCharacters;
window.openNpcActionSheet      = openNpcActionSheet;
window.closeNpcActionSheet     = closeNpcActionSheet;
window.openNpcAutoGenModal     = openNpcAutoGenModal;
window.closeNpcAutoGenModal    = closeNpcAutoGenModal;
window.triggerNpcAutoGen       = triggerNpcAutoGen;
window.openNpcManualModal      = openNpcManualModal;
window.closeNpcManualModal     = closeNpcManualModal;
window.saveManualNpc           = saveManualNpc;
window.deleteNpc               = deleteNpc;
window.filterSchedule          = filterSchedule;
window.toggleScheduleStatus    = toggleScheduleStatus;
window.openScheduleAddModal    = openScheduleAddModal;
window.closeScheduleAddModal   = closeScheduleAddModal;
window.saveScheduleEvent       = saveScheduleEvent;
window.openScheduleDetail      = openScheduleDetail;
window.closeScheduleDetailModal = closeScheduleDetailModal;
window.deleteScheduleEvent     = deleteScheduleEvent;
window.toggleScheduleCharTag   = toggleScheduleCharTag;
window.renderScheduleCharTags  = renderScheduleCharTags;

document.addEventListener('DOMContentLoaded', function() { initWikiModule(); });
