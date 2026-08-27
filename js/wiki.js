/* ==========================================================================
   Wiki Module — Restructured (v4)
   Two-level navigation: Character List → Character Detail (NPC / Rel / Sched)
   Full i18n via wikiT() helper
   ========================================================================== */

// ====================== Constants ======================
const WIKI_PANEL_CLASS = 'wiki-panel-visible';

// ====================== i18n Helper ======================
function wikiT(key) {
	const lang = window.currentLang || (typeof getLang === 'function' ? getLang() : 'en');
	if (LANG && LANG[lang] && LANG[lang][key] !== undefined) return LANG[lang][key];
	if (LANG && LANG.en && LANG.en[key] !== undefined) return LANG.en[key];
	return key;
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

// ====================== Character Data ======================
let wikiSelectedCharId = null;

function getWikiCharacters() {
	// Attempt to read from global app state
	if (window.characters && Array.isArray(window.characters)) {
		return window.characters.map((c, i) => ({
			id: c.id || 'char-' + i,
			name: c.name || c.charName || 'Unnamed',
			avatar: c.avatar || c.image || null,
			age: c.age || '',
			identity: c.identity || c.role || '',
			personality: c.personality || '',
			backstory: c.backstory || c.background || c.notes || '',
			prompt: c.prompt || ''
		}));
	}
	// Try localStorage
	try {
		const stored = localStorage.getItem('mizu_characters') || localStorage.getItem('characters');
		if (stored) {
			const arr = JSON.parse(stored);
			if (Array.isArray(arr) && arr.length) {
				return arr.map((c, i) => ({
					id: c.id || 'char-' + i,
					name: c.name || c.charName || 'Unnamed',
					avatar: c.avatar || c.image || null,
					age: c.age || '',
					identity: c.identity || c.role || '',
					personality: c.personality || '',
					backstory: c.backstory || c.background || c.notes || '',
					prompt: c.prompt || ''
				}));
			}
		}
	} catch (e) { /* ignore */ }
	return [];
}

// ====================== Schedule Data ======================
const _today = new Date();
const _fmt = d => d.toISOString().split('T')[0];
const _yesterday = new Date(_today); _yesterday.setDate(_today.getDate() - 1);
const _tomorrow = new Date(_today); _tomorrow.setDate(_today.getDate() + 1);
const _dayAfter = new Date(_today); _dayAfter.setDate(_today.getDate() + 2);

let wikiScheduleData = [
	{ id: 1, date: _fmt(_yesterday), time: '10:00', title: 'Strategy Meeting', characters: ['Lin Xia', 'Chen Yuan'], description: 'Discuss next-phase action plans and resource allocation in the command room.', status: 'completed' },
	{ id: 2, date: _fmt(_yesterday), time: '15:30', title: 'Intel Handover', characters: ['Su Qing'], description: 'Receive latest reconnaissance reports from the northern outpost.', status: 'completed' },
	{ id: 3, date: _fmt(_today), time: '09:00', title: 'Physical Training', characters: ['Lin Xia'], description: 'Tactical mobility and close-quarters combat drills at the eastern training ground.', status: 'pending' },
	{ id: 4, date: _fmt(_today), time: '19:00', title: 'Private Dinner', characters: ['Su Qing', 'Chen Yuan'], description: 'Informal gathering at the downtown restaurant to discuss personal matters.', status: 'pending' },
	{ id: 5, date: _fmt(_tomorrow), time: '11:00', title: 'Lore Review', characters: ['Zhao Ming'], description: 'Review and update key timeline documents for the current world setting.', status: 'pending' },
	{ id: 6, date: _fmt(_dayAfter), time: '14:00', title: 'Equipment Check', characters: ['Lin Xia', 'Zhao Ming'], description: 'Inspect and catalog gear in preparation for the upcoming field operation.', status: 'pending' }
];

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
	const listView = document.getElementById('wiki-list-view');
	const detailView = document.getElementById('wiki-detail-view');
	if (detailView) detailView.classList.remove('wiki-view-active', 'wiki-view-back');
	if (listView) {
		listView.classList.remove('wiki-view-active');
		listView.classList.add('wiki-view-active', 'wiki-view-back');
	}
	// Update nav
	const title = document.getElementById('wiki-nav-title');
	const largeTitle = document.getElementById('wiki-large-title');
	if (title) title.textContent = wikiT('wiki.title');
	if (largeTitle) { largeTitle.textContent = wikiT('wiki.title'); largeTitle.style.display = ''; }
	// Show add button (for adding characters)
	const addBtn = document.getElementById('wiki-nav-add-btn');
	if (addBtn) addBtn.style.display = '';
}

function wikiShowDetailView(charId) {
	const chars = getWikiCharacters();
	const char = chars.find(c => c.id === charId);
	if (!char && chars.length === 0) return;
	const target = char || chars[0];

	wikiSelectedCharId = target.id;

	// Fill detail header
	const avatarEl = document.getElementById('wiki-detail-avatar');
	if (avatarEl) {
		if (target.avatar) {
			avatarEl.innerHTML = `<img src="${target.avatar}" alt="${target.name}"/>`;
		} else {
			avatarEl.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 22c0-4.5 3.5-8 8-8s8 3.5 8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
		}
	}
	const nameEl = document.getElementById('wiki-detail-name');
	if (nameEl) nameEl.textContent = target.name;

	// Update nav
	const title = document.getElementById('wiki-nav-title');
	if (title) title.textContent = target.name;
	const largeTitle = document.getElementById('wiki-large-title');
	if (largeTitle) largeTitle.style.display = 'none';

	// Fill NPC tab
	renderNpcProfile(target);

	// Switch view
	const listView = document.getElementById('wiki-list-view');
	const detailView = document.getElementById('wiki-detail-view');
	if (listView) listView.classList.remove('wiki-view-active', 'wiki-view-back');
	if (detailView) {
		detailView.classList.remove('wiki-view-active', 'wiki-view-back');
		detailView.classList.add('wiki-view-active');
	}

	// Reset to NPC tab
	switchWikiDetailTab('npc');
}

// ====================== Character List ======================

function renderWikiCharacterList() {
	const grid = document.getElementById('wiki-char-grid');
	const empty = document.getElementById('wiki-list-empty');
	if (!grid) return;

	const chars = getWikiCharacters();

	if (chars.length === 0) {
		grid.innerHTML = '';
		if (empty) empty.style.display = '';
		return;
	}

	if (empty) empty.style.display = 'none';

	grid.innerHTML = chars.map(c => `
		<div class="wiki-char-card" onclick="wikiShowDetailView('${c.id}')">
			<div class="wiki-char-card-avatar">
				${c.avatar
					? `<img src="${c.avatar}" alt="${c.name}"/>`
					: `<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 22c0-4.5 3.5-8 8-8s8 3.5 8 8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`
				}
			</div>
			<div class="wiki-char-card-name">${c.name}</div>
		</div>
	`).join('');
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

	const fields = [
		{ key: 'wiki.npc.name', icon: '<circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/>', value: char.name },
		{ key: 'wiki.npc.age', icon: '<rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>', value: char.age },
		{ key: 'wiki.npc.identity', icon: '<path d="M2 4h12M2 8h8M2 12h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>', value: char.identity },
		{ key: 'wiki.npc.personality', icon: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 10c.8 1.2 1.8 2 3 2s2.2-.8 3-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="6" cy="6.5" r=".8" fill="currentColor"/><circle cx="10" cy="6.5" r=".8" fill="currentColor"/>', value: char.personality },
		{ key: 'wiki.npc.backstory', icon: '<rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 5h6M5 8h4M5 11h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>', value: char.backstory }
	];

	const hasData = fields.some(f => f.value);
	if (!hasData) {
		container.innerHTML = `<div class="wiki-npc-empty">${wikiT('wiki.npc.noInfo')}</div>`;
		return;
	}

	container.innerHTML = fields
		.filter(f => f.value)
		.map(f => `
			<div class="wiki-npc-row">
				<div class="wiki-npc-label">
					<svg viewBox="0 0 16 16" style="width:14px;height:14px">${f.icon}</svg>
					${wikiT(f.key)}
				</div>
				<div class="wiki-npc-value">${f.value}</div>
			</div>
		`).join('');
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
		// Inside detail view
		const activeTab = document.querySelector('#screen-wiki .wiki-detail-tab.active');
		const tabName = activeTab ? activeTab.dataset.dtab : 'npc';
		if (tabName === 'schedule') {
			openScheduleAddModal();
		} else {
			console.log('[Wiki] Add action for tab:', tabName);
		}
	} else {
		console.log('[Wiki] Add Character — placeholder');
	}
}

// ====================== Schedule Rendering ======================

function renderScheduleTimeline() {
	const container = document.getElementById('schedule-timeline');
	if (!container) return;

	let data = wikiScheduleData.slice();
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

	// Sort groups: Yesterday → Today → Upcoming dates
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
					<div class="schedule-item-title">${item.title}</div>
					<div class="schedule-item-characters">
						<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
						${item.characters.join(', ')}
					</div>
					<div class="schedule-item-desc">${item.description}</div>
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

	// Format as readable date
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
	const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
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

	// Reset form
	const titleInput = document.getElementById('sched-add-title');
	const dateInput = document.getElementById('sched-add-date');
	const timeInput = document.getElementById('sched-add-time');
	const descInput = document.getElementById('sched-add-desc');
	if (titleInput) titleInput.value = '';
	if (dateInput) dateInput.value = _fmt(new Date());
	if (timeInput) timeInput.value = '12:00';
	if (descInput) descInput.value = '';

	// Populate character tags
	selectedScheduleChars.clear();
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
		return `<span class="modal-tag ${sel}" onclick="toggleScheduleCharTag(this, '${c.name}')">${c.name}</span>`;
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
	const date = document.getElementById('sched-add-date')?.value;
	const time = document.getElementById('sched-add-time')?.value;
	const desc = document.getElementById('sched-add-desc')?.value.trim();

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

	const body = document.getElementById('schedule-detail-body');
	const footer = document.getElementById('schedule-detail-footer');
	if (!body) return;

	const isCompleted = item.status === 'completed';

	body.innerHTML = `
		<div class="detail-status-badge ${item.status}">
			${isCompleted
				? `<svg viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5 6.5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ${wikiT('wiki.schedule.completed')}`
				: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg> ${wikiT('wiki.schedule.pending')}`}
		</div>
		<div class="detail-title">${item.title}</div>
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
				<span class="detail-info-value">${item.characters.length ? item.characters.join(', ') : '—'}</span>
			</div>
		</div>
		${item.description ? `
			<div class="detail-desc-title">${wikiT('wiki.schedule.description')}</div>
			<div class="detail-desc-body">${item.description}</div>
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

document.addEventListener('DOMContentLoaded', () => {
	initWikiModule();
});
