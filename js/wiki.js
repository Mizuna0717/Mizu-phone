/* ==========================================================================
   Wiki Module — Connected to state.characters (v5)
   Two-level navigation: Character List → Character Detail (NPC / Rel / Sched)
   Data source: state.characters via getCharacters()
   ========================================================================== */

// ====================== Constants ======================
const WIKI_PANEL_CLASS = 'wiki-panel-visible';

// ====================== Utility Helpers ======================

function wikiT(key) {
	const lang = window.currentLang || (typeof getLang === 'function' ? getLang() : 'en');
	if (typeof LANG !== 'undefined' && LANG && LANG[lang] && LANG[lang][key] !== undefined) return LANG[lang][key];
	if (typeof LANG !== 'undefined' && LANG && LANG.en && LANG.en[key] !== undefined) return LANG.en[key];
	return key;
}

/** HTML escape — delegates to global esc() if available */
function wikiEsc(s) {
	if (typeof esc === 'function') return esc(s);
	if (!s) return '';
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Re-apply all data-i18n / data-i18n-ph in #screen-wiki */
function wikiApplyI18n() {
	const root = document.getElementById('screen-wiki');
	if (!root) return;
	root.querySelectorAll('[data-i18n]').forEach(el => {
		el.textContent = wikiT(el.getAttribute('data-i18n'));
	});
	root.querySelectorAll('[data-i18n-ph]').forEach(el => {
		el.placeholder = wikiT(el.getAttribute('data-i18n-ph'));
	});
}

/**
 * Render a character avatar — image, first-letter, or default icon.
 * Uses global charAvatarImg() when available for consistency with iMessage list.
 */
function wikiAvatarHtml(ch) {
	if (typeof charAvatarImg === 'function') {
		return charAvatarImg(ch);
	}
	if (ch && ch.avatar) {
		return '<img src="' + wikiEsc(ch.avatar) + '" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;" />';
	}
	var letter = (ch && ch.name) ? ch.name.charAt(0).toUpperCase() : '?';
	return '<span class="wiki-avatar-letter">' + letter + '</span>';
}

// ====================== Data Source ======================
let wikiSelectedCharId = null;

/**
 * ★ Core data function — reads directly from state.characters
 * via getCharacters() exposed by characters.js
 */
function getWikiCharacters() {
	// Primary: use getCharacters() from characters.js
	if (typeof getCharacters === 'function') {
		return getCharacters();
	}
	// Fallback: direct state access
	if (window.state && Array.isArray(window.state.characters)) {
		return window.state.characters;
	}
	return [];
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
	if (wikiSelectedCharId !== null) {
		wikiShowListView();
	} else {
		nav('screen-home');
	}
}

function wikiShowListView() {
	wikiSelectedCharId = null;
	const listView   = document.getElementById('wiki-list-view');
	const detailView = document.getElementById('wiki-detail-view');
	if (detailView) detailView.classList.remove('wiki-view-active', 'wiki-view-back');
	if (listView) {
		listView.classList.remove('wiki-view-active');
		listView.classList.add('wiki-view-active', 'wiki-view-back');
	}
	const title = document.getElementById('wiki-nav-title');
	const largeTitle = document.getElementById('wiki-large-title');
	if (title) title.textContent = wikiT('wiki.title');
	if (largeTitle) { largeTitle.textContent = wikiT('wiki.title'); largeTitle.style.display = ''; }

	const addBtn = document.getElementById('wiki-nav-add-btn');
	if (addBtn) addBtn.style.display = '';

	// ★ Always re-render from state.characters so list is fresh
	renderWikiCharacterList();
}

function wikiShowDetailView(charId) {
	const chars = getWikiCharacters();
	const char  = chars.find(c => c.id === charId);
	if (!char) {
		console.warn('[Wiki] Character not found:', charId);
		return;
	}

	wikiSelectedCharId = char.id;

	// ── Detail header: avatar ──
	const avatarEl = document.getElementById('wiki-detail-avatar');
	if (avatarEl) {
		if (char.avatar) {
			avatarEl.innerHTML = `<img src="${wikiEsc(char.avatar)}" alt="${wikiEsc(char.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>`;
		} else {
			var letter = (char.name || '?').charAt(0).toUpperCase();
			avatarEl.innerHTML = `<span class="wiki-avatar-letter" style="font-size:28px;font-weight:700;color:#8e8e93;">${letter}</span>`;
		}
	}

	// ── Detail header: name ──
	const nameEl = document.getElementById('wiki-detail-name');
	if (nameEl) nameEl.textContent = char.name || 'Unnamed';

	// ── Nav ──
	const title = document.getElementById('wiki-nav-title');
	if (title) title.textContent = char.name || 'Unnamed';
	const largeTitle = document.getElementById('wiki-large-title');
	if (largeTitle) largeTitle.style.display = 'none';

	// ── Fill NPC tab ──
	renderNpcProfile(char);

	// ── Fill Relationships tab ──
	renderRelationships(char);

	// ── Switch view ──
	const listView   = document.getElementById('wiki-list-view');
	const detailView = document.getElementById('wiki-detail-view');
	if (listView)   listView.classList.remove('wiki-view-active', 'wiki-view-back');
	if (detailView) {
		detailView.classList.remove('wiki-view-active', 'wiki-view-back');
		detailView.classList.add('wiki-view-active');
	}

	// Reset to NPC tab
	switchWikiDetailTab('npc');
}

// ====================== Character List ======================

function renderWikiCharacterList() {
	const grid  = document.getElementById('wiki-char-grid');
	const empty = document.getElementById('wiki-list-empty');
	if (!grid) return;

	const chars = getWikiCharacters();

	if (chars.length === 0) {
		grid.innerHTML = '';
		if (empty) empty.style.display = '';
		return;
	}

	if (empty) empty.style.display = 'none';

	grid.innerHTML = chars.map(c => {
		let avatarContent;
		if (c.avatar) {
			avatarContent = `<img src="${wikiEsc(c.avatar)}" alt="${wikiEsc(c.name)}"/>`;
		} else {
			const letter = (c.name || '?').charAt(0).toUpperCase();
			avatarContent = `<span class="wiki-avatar-letter">${letter}</span>`;
		}
		return `
			<div class="wiki-char-card" onclick="wikiShowDetailView('${c.id}')">
				<div class="wiki-char-card-avatar">${avatarContent}</div>
				<div class="wiki-char-card-name">${wikiEsc(c.name || 'Unnamed')}</div>
			</div>`;
	}).join('');
}

function filterWikiCharacters(query) {
	const grid = document.getElementById('wiki-char-grid');
	if (!grid) return;
	const q = query.toLowerCase().trim();
	grid.querySelectorAll('.wiki-char-card').forEach(card => {
		const name = card.querySelector('.wiki-char-card-name');
		if (!name) return;
		card.style.display = name.textContent.toLowerCase().includes(q) || !q ? '' : 'none';
	});
}

// ====================== NPC Profile ======================

function renderNpcProfile(char) {
	const container = document.getElementById('wiki-npc-content');
	if (!container) return;

	// ── Build field list dynamically from all known attributes ──
	const fields = [
		{
			label: 'Name', key: 'wiki.npc.name',
			icon: '<circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/>',
			value: char.name || ''
		},
		{
			label: 'Age', key: 'wiki.npc.age',
			icon: '<rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
			value: char.age || ''
		},
		{
			label: 'Identity', key: 'wiki.npc.identity',
			icon: '<path d="M2 4h12M2 8h8M2 12h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
			value: char.identity || char.role || ''
		},
		{
			label: 'Personality', key: 'wiki.npc.personality',
			icon: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 10c.8 1.2 1.8 2 3 2s2.2-.8 3-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="6" cy="6.5" r=".8" fill="currentColor"/><circle cx="10" cy="6.5" r=".8" fill="currentColor"/>',
			value: char.personality || ''
		},
		{
			label: 'Background', key: 'wiki.npc.backstory',
			icon: '<rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 5h6M5 8h4M5 11h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
			value: char.backstory || char.background || ''
		},
		{
			label: 'Notes', key: 'wiki.npc.notes',
			icon: '<path d="M2 3h12M2 7h9M2 11h11M2 15h6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
			value: char.notes || ''
		},
		{
			label: 'System Prompt', key: 'wiki.npc.systemPrompt',
			icon: '<rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 6l2 2-2 2M8 10h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
			value: char.systemPrompt || ''
		}
	];

	const visible = fields.filter(f => f.value);

	if (visible.length === 0) {
		container.innerHTML = `<div class="wiki-npc-empty">${wikiT('wiki.npc.noInfo')}</div>`;
		return;
	}

	container.innerHTML = visible.map(f => {
		// Use i18n label if available, otherwise fall back to English label
		let displayLabel = wikiT(f.key);
		if (displayLabel === f.key) displayLabel = f.label;

		// For long values (system prompt), add a special class
		const isLong = f.value.length > 200;
		const valueClass = isLong ? 'wiki-npc-value wiki-npc-value-long' : 'wiki-npc-value';

		return `
			<div class="wiki-npc-row">
				<div class="wiki-npc-label">
					<svg viewBox="0 0 16 16" style="width:14px;height:14px">${f.icon}</svg>
					${displayLabel}
				</div>
				<div class="${valueClass}">${wikiEsc(f.value)}</div>
			</div>`;
	}).join('');
}

// ====================== Relationships ======================

function renderRelationships(char) {
	const container = document.getElementById('wiki-rel-content');
	if (!container) return;

	// Check if the character has relationship data
	const rels = char.relationships || [];

	if (!rels.length) {
		container.innerHTML = `
			<svg viewBox="0 0 60 40" class="wiki-rel-icon">
				<circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1"/>
				<circle cx="45" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="1"/>
				<circle cx="30" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
				<path d="M22 18l5 11M38 18l-5 11M23 15h14" stroke="currentColor" fill="none" stroke-width="1" stroke-dasharray="2 2"/>
			</svg>
			<p>${wikiT('wiki.relationships.empty')}</p>
			<span>${wikiT('wiki.relationships.emptySub')}</span>`;
		return;
	}

	// Render relationship list
	let html = '<div class="wiki-rel-list">';
	rels.forEach(r => {
		const targetChar = getWikiCharacters().find(c => c.id === r.targetId);
		const targetName = targetChar ? targetChar.name : (r.targetName || 'Unknown');
		html += `
			<div class="wiki-rel-row">
				<div class="wiki-rel-avatar">${targetChar ? wikiAvatarHtml(targetChar) : '<span class="wiki-avatar-letter">?</span>'}</div>
				<div class="wiki-rel-info">
					<div class="wiki-rel-name">${wikiEsc(targetName)}</div>
					<div class="wiki-rel-type">${wikiEsc(r.type || r.relation || '')}</div>
				</div>
			</div>`;
	});
	html += '</div>';
	container.innerHTML = html;
}

// ====================== Detail Tab Switching ======================

function switchWikiDetailTab(tabName) {
	const wikiRoot = document.getElementById('screen-wiki');
	if (!wikiRoot) return;

	wikiRoot.querySelectorAll('.wiki-detail-tab').forEach(btn => {
		btn.classList.toggle('active', btn.dataset.dtab === tabName);
	});

	wikiRoot.querySelectorAll('.wiki-detail-panel').forEach(panel => {
		panel.classList.remove(WIKI_PANEL_CLASS);
	});

	const target = document.getElementById('wiki-detail-' + tabName);
	if (target) target.classList.add(WIKI_PANEL_CLASS);

	const body = wikiRoot.querySelector('#wiki-detail-view .screen-body');
	if (body) body.scrollTop = 0;

	if (tabName === 'schedule') renderScheduleTimeline();
}

// ====================== Nav Add Button ======================

function wikiNavAddAction() {
	if (wikiSelectedCharId !== null) {
		const activeTab = document.querySelector('#screen-wiki .wiki-detail-tab.active');
		const tabName = activeTab ? activeTab.dataset.dtab : 'npc';
		if (tabName === 'schedule') {
			openScheduleAddModal();
		} else {
			console.log('[Wiki] Add action for tab:', tabName);
		}
	} else {
		// Navigate to character creation
		if (typeof createNewChar === 'function') {
			state.charEditFrom = 'screen-wiki';
			createNewChar();
		} else {
			console.log('[Wiki] createNewChar not available');
		}
	}
}

// ====================== Schedule Rendering ======================

function renderScheduleTimeline() {
	const container = document.getElementById('schedule-timeline');
	if (!container) return;

	let data = wikiScheduleData.slice();

	// ★ Filter by selected character name when in detail view
	if (wikiSelectedCharId) {
		const chars = getWikiCharacters();
		const selectedChar = chars.find(c => c.id === wikiSelectedCharId);
		if (selectedChar) {
			data = data.filter(item =>
				item.characters.some(name =>
					name.toLowerCase() === selectedChar.name.toLowerCase()
				)
			);
		}
	}

	// Apply status filter
	if (currentScheduleFilter !== 'all') {
		data = data.filter(item => item.status === currentScheduleFilter);
	}

	if (data.length === 0) {
		container.innerHTML = renderScheduleEmpty();
		return;
	}

	data.sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.time.localeCompare(b.time));

	const groups = {};
	data.forEach(item => {
		const label = getDateGroupLabel(item.date);
		if (!groups[label]) groups[label] = [];
		groups[label].push(item);
	});

	const order = ['Yesterday', 'Today'];
	const sortedKeys = Object.keys(groups).sort((a, b) => {
		const ai = order.indexOf(a), bi = order.indexOf(b);
		if (ai !== -1 && bi !== -1) return ai - bi;
		if (ai !== -1) return -1;
		if (bi !== -1) return 1;
		return a.localeCompare(b);
	});

	let html = '';
	for (const label of sortedKeys) {
		const items = groups[label];
		html += `<div class="schedule-date-group">`;
		html += `<div class="schedule-date-label">
			<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
			${label}
		</div>`;
		html += `<div class="schedule-items">`;

		items.forEach(item => {
			const isCompleted = item.status === 'completed';
			html += `
			<div class="schedule-item ${isCompleted ? 'is-completed' : ''}" onclick="openScheduleDetail(${item.id})">
				<div class="schedule-item-indicator">
					<div class="schedule-dot ${item.status}" onclick="event.stopPropagation(); toggleScheduleStatus(${item.id})"></div>
					<div class="schedule-item-line"></div>
				</div>
				<div class="schedule-item-body">
					<div class="schedule-item-time">
						<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
						${item.time}
					</div>
					<div class="schedule-item-title">${wikiEsc(item.title)}</div>
					<div class="schedule-item-characters">
						<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
						${wikiEsc(item.characters.join(', '))}
					</div>
					<div class="schedule-item-desc">${wikiEsc(item.description)}</div>
				</div>
				<button class="schedule-item-more" onclick="event.stopPropagation(); openScheduleDetail(${item.id})">
					<svg viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/></svg>
				</button>
			</div>`;
		});

		html += `</div></div>`;
	}
	container.innerHTML = html;
}

function renderScheduleEmpty() {
	return `
	<div class="schedule-empty">
		<svg viewBox="0 0 48 48">
			<rect x="8" y="10" width="32" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
			<path d="M16 6v6M32 6v6M8 18h32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			<path d="M18 26h12M18 32h8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
		</svg>
		<p>${wikiT('wiki.schedule.empty')}</p>
		<span>${wikiT('wiki.schedule.emptySub')}</span>
		<br/>
		<button class="schedule-empty-add" onclick="openScheduleAddModal()">
			<svg viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>
			${wikiT('wiki.schedule.add')}
		</button>
	</div>`;
}

// ====================== Date Helpers ======================

function getDateGroupLabel(dateStr) {
	const today = new Date(); today.setHours(0,0,0,0);
	const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
	const target = new Date(dateStr + 'T00:00:00'); target.setHours(0,0,0,0);

	if (target.getTime() === today.getTime()) return wikiT('wiki.schedule.today');
	if (target.getTime() === yesterday.getTime()) return wikiT('wiki.schedule.yesterday');

	return formatScheduleDate(dateStr);
}

function formatScheduleDate(dateStr) {
	const date = new Date(dateStr + 'T00:00:00');
	const lang = window.currentLang || 'en';
	if (lang === 'zh') {
		const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
		return (date.getMonth()+1) + '月' + date.getDate() + '日 · ' + weekdays[date.getDay()];
	}
	const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate();
}

// ====================== Filters ======================

function filterSchedule(filterType) {
	currentScheduleFilter = filterType;
	document.querySelectorAll('#screen-wiki .schedule-filter').forEach(btn => {
		btn.classList.toggle('active', btn.dataset.filter === filterType);
	});
	renderScheduleTimeline();
}

// ====================== Status Toggle ======================

function toggleScheduleStatus(id) {
	const item = wikiScheduleData.find(d => d.id === id);
	if (!item) return;
	item.status = item.status === 'completed' ? 'pending' : 'completed';
	renderScheduleTimeline();
}

// ====================== Add Schedule Modal ======================

function openScheduleAddModal() {
	const modal = document.getElementById('schedule-add-modal');
	if (!modal) return;

	const titleInput = document.getElementById('sched-add-title');
	const dateInput  = document.getElementById('sched-add-date');
	const timeInput  = document.getElementById('sched-add-time');
	const descInput  = document.getElementById('sched-add-desc');
	if (titleInput) titleInput.value = '';
	if (dateInput)  dateInput.value = _fmt(new Date());
	if (timeInput)  timeInput.value = '12:00';
	if (descInput)  descInput.value = '';

	selectedScheduleChars.clear();

	// ★ If we are inside a character detail view, pre-select that character
	if (wikiSelectedCharId) {
		const chars = getWikiCharacters();
		const sel   = chars.find(c => c.id === wikiSelectedCharId);
		if (sel) selectedScheduleChars.add(sel.name);
	}

	renderScheduleCharTags();
	modal.classList.add('active');
}

function closeScheduleAddModal() {
	const modal = document.getElementById('schedule-add-modal');
	if (modal) modal.classList.remove('active');
}

function renderScheduleCharTags() {
	const container = document.getElementById('sched-add-chars');
	if (!container) return;

	const chars = getWikiCharacters();
	if (chars.length === 0) {
		container.innerHTML = `<div class="modal-tag-empty">${wikiT('wiki.schedule.noCharsAvailable')}</div>`;
		return;
	}

	container.innerHTML = chars.map(c => {
		const sel = selectedScheduleChars.has(c.name) ? 'selected' : '';
		return `<span class="modal-tag ${sel}" onclick="toggleScheduleCharTag(this, '${wikiEsc(c.name)}')">${wikiEsc(c.name)}</span>`;
	}).join('');
}

function toggleScheduleCharTag(el, name) {
	if (selectedScheduleChars.has(name)) {
		selectedScheduleChars.delete(name);
		el.classList.remove('selected');
	} else {
		selectedScheduleChars.add(name);
		el.classList.add('selected');
	}
}

function saveScheduleEvent() {
	const title = document.getElementById('sched-add-title')?.value.trim();
	const date  = document.getElementById('sched-add-date')?.value;
	const time  = document.getElementById('sched-add-time')?.value;
	const desc  = document.getElementById('sched-add-desc')?.value.trim();

	if (!title) {
		document.getElementById('sched-add-title')?.focus();
		return;
	}

	wikiScheduleData.push({
		id: ++wikiScheduleNextId,
		date: date || _fmt(new Date()),
		time: time || '12:00',
		title: title,
		characters: Array.from(selectedScheduleChars),
		description: desc || '',
		status: 'pending'
	});

	closeScheduleAddModal();
	renderScheduleTimeline();
}

// ====================== Schedule Detail Modal ======================

function openScheduleDetail(id) {
	const item = wikiScheduleData.find(d => d.id === id);
	if (!item) return;

	const body   = document.getElementById('schedule-detail-body');
	const footer = document.getElementById('schedule-detail-footer');
	if (!body) return;

	const isCompleted = item.status === 'completed';

	body.innerHTML = `
		<div class="detail-status-badge ${item.status}">
			${isCompleted
				? `<svg viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5 6.5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ${wikiT('wiki.schedule.completed')}`
				: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg> ${wikiT('wiki.schedule.pending')}`}
		</div>
		<div class="detail-title">${wikiEsc(item.title)}</div>
		<div class="detail-info-card">
			<div class="detail-info-row">
				<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				<span class="detail-info-label">${wikiT('wiki.schedule.date')}</span>
				<span class="detail-info-value">${formatScheduleDate(item.date)}</span>
			</div>
			<div class="detail-info-row">
				<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				<span class="detail-info-label">${wikiT('wiki.schedule.time')}</span>
				<span class="detail-info-value">${item.time}</span>
			</div>
			<div class="detail-info-row">
				<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
				<span class="detail-info-label">${wikiT('wiki.schedule.characters')}</span>
				<span class="detail-info-value">${item.characters.length ? wikiEsc(item.characters.join(', ')) : '—'}</span>
			</div>
		</div>
		${item.description ? `
			<div class="detail-desc-title">${wikiT('wiki.schedule.description')}</div>
			<div class="detail-desc-body">${wikiEsc(item.description)}</div>
		` : ''}
	`;

	if (footer) {
		footer.innerHTML = `
			<button class="wiki-modal-btn-outline" onclick="deleteScheduleEvent(${item.id})">
				${wikiT('wiki.schedule.delete')}
			</button>
			<button class="wiki-modal-btn-outline primary" onclick="toggleScheduleStatus(${item.id}); openScheduleDetail(${item.id});">
				${isCompleted ? wikiT('wiki.schedule.markPending') : wikiT('wiki.schedule.markCompleted')}
			</button>
		`;
	}

	const modal = document.getElementById('schedule-detail-modal');
	if (modal) modal.classList.add('active');
}

function closeScheduleDetailModal() {
	const modal = document.getElementById('schedule-detail-modal');
	if (modal) modal.classList.remove('active');
	renderScheduleTimeline();
}

function deleteScheduleEvent(id) {
	wikiScheduleData = wikiScheduleData.filter(d => d.id !== id);
	closeScheduleDetailModal();
}

// ====================== Init ======================

function initWikiModule() {
	wikiApplyI18n();
	renderWikiCharacterList();
	wikiShowListView();
}

// ★ Export for external calls (data sync)
window.renderWikiCharacterList = renderWikiCharacterList;
window.initWikiModule          = initWikiModule;
window.getWikiCharacters       = getWikiCharacters;
window.wikiShowDetailView      = wikiShowDetailView;
window.wikiShowListView        = wikiShowListView;
window.wikiNavBack             = wikiNavBack;
window.wikiNavAddAction        = wikiNavAddAction;
window.switchWikiDetailTab     = switchWikiDetailTab;
window.filterWikiCharacters    = filterWikiCharacters;
window.filterSchedule          = filterSchedule;
window.toggleScheduleStatus    = toggleScheduleStatus;
window.openScheduleAddModal    = openScheduleAddModal;
window.closeScheduleAddModal   = closeScheduleAddModal;
window.saveScheduleEvent       = saveScheduleEvent;
window.openScheduleDetail      = openScheduleDetail;
window.closeScheduleDetailModal = closeScheduleDetailModal;
window.deleteScheduleEvent     = deleteScheduleEvent;
window.toggleScheduleCharTag   = toggleScheduleCharTag;

document.addEventListener('DOMContentLoaded', () => {
	initWikiModule();
});
