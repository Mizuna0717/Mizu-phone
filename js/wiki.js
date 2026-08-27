/* ==========================================================================
   Wiki Module — JavaScript
   ========================================================================== */

// ======================== 示例日程数据 ========================

const wikiScheduleData = [
	{
		id: 1,
		date: '2025-01-20',
		time: '10:00',
		title: '团队战略会议',
		characters: ['林夏', '陈远'],
		description: '在指挥室讨论下一阶段的行动计划与资源分配方案，重点评估西区形势。',
		status: 'completed'
	},
	{
		id: 2,
		date: '2025-01-20',
		time: '15:30',
		title: '情报交接',
		characters: ['苏晴'],
		description: '接收来自北区前哨站的最新侦查报告，整理关键线索。',
		status: 'completed'
	},
	{
		id: 3,
		date: '2025-01-21',
		time: '09:00',
		title: '体能训练',
		characters: ['林夏'],
		description: '在东区训练场进行战术机动与近战对抗专项训练。',
		status: 'pending'
	},
	{
		id: 4,
		date: '2025-01-21',
		time: '19:00',
		title: '私人晚餐',
		characters: ['苏晴', '陈远'],
		description: '城中心餐厅的非正式聚会，讨论近期个人事务与团队动态。',
		status: 'pending'
	},
	{
		id: 5,
		date: '2025-01-22',
		time: '11:00',
		title: '世界观设定审核',
		characters: ['赵明'],
		description: '审核并更新当前世界线的关键时间节点文档，校对设定一致性。',
		status: 'pending'
	}
];

// 当前过滤状态
let currentScheduleFilter = 'all';


// ======================== Tab 切换 ========================

function switchWikiTab(tabName) {
	// 1) 更新 Tab 按钮样式
	document.querySelectorAll('.wiki-tab').forEach(btn => {
		btn.classList.toggle('active', btn.dataset.tab === tabName);
	});

	// 2) 切换 Tab 内容面板
	document.querySelectorAll('.wiki-tab-content').forEach(panel => {
		panel.classList.remove('active');
	});
	const target = document.getElementById('wiki-tab-' + tabName);
	if (target) {
		// 小延迟确保 display:none → block 之后再触发动画
		requestAnimationFrame(() => {
			target.classList.add('active');
		});
	}

	// 3) 滚回顶部
	const body = document.querySelector('#screen-wiki .screen-body');
	if (body) body.scrollTop = 0;

	// 4) 首次进入日程表 Tab 时渲染
	if (tabName === 'schedule') {
		renderScheduleTimeline();
	}
}


// ======================== 导航栏 + 按钮（上下文感知）========================

function wikiNavAddAction() {
	const activeTab = document.querySelector('.wiki-tab.active');
	const tabName = activeTab ? activeTab.dataset.tab : 'characters';

	switch (tabName) {
		case 'schedule':
			openScheduleAddModal();
			break;
		case 'relationships':
			// TODO: 打开添加关系的交互
			console.log('[Wiki] Add Relationship — placeholder');
			break;
		case 'characters':
		default:
			// TODO: 打开添加角色的交互
			console.log('[Wiki] Add Character — placeholder');
			break;
	}
}


// ======================== 日程表渲染 ========================

function renderScheduleTimeline() {
	const container = document.getElementById('schedule-timeline');
	if (!container) return;

	// 过滤
	let data = wikiScheduleData;
	if (currentScheduleFilter !== 'all') {
		data = data.filter(item => item.status === currentScheduleFilter);
	}

	if (data.length === 0) {
		container.innerHTML = renderScheduleEmpty();
		return;
	}

	// 按日期排序 → 分组
	data.sort((a, b) => {
		if (a.date !== b.date) return a.date.localeCompare(b.date);
		return a.time.localeCompare(b.time);
	});

	const groups = {};
	data.forEach(item => {
		if (!groups[item.date]) groups[item.date] = [];
		groups[item.date].push(item);
	});

	let html = '';
	for (const [date, items] of Object.entries(groups)) {
		html += `<div class="schedule-date-group">`;
		html += `<div class="schedule-date-label">
			<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
			${formatScheduleDate(date)}
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
				<div class="schedule-item-status ${item.status}">
					${isCompleted ? '已完成' : '待进行'}
				</div>
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
		<p>暂无日程<br><span>点击右上角「添加」创建第一条日程</span></p>
	</div>`;
}


// ======================== 日期格式化 ========================

function formatScheduleDate(dateStr) {
	const date = new Date(dateStr + 'T00:00:00');
	const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const weekday = weekdays[date.getDay()];
	return month + '月' + day + '日 · ' + weekday;
}


// ======================== 过滤器 ========================

function filterSchedule(filterType) {
	currentScheduleFilter = filterType;

	document.querySelectorAll('.schedule-filter').forEach(btn => {
		btn.classList.toggle('active', btn.dataset.filter === filterType);
	});

	renderScheduleTimeline();
}


// ======================== 状态切换 ========================

function toggleScheduleStatus(id) {
	const item = wikiScheduleData.find(d => d.id === id);
	if (!item) return;
	item.status = item.status === 'completed' ? 'pending' : 'completed';
	renderScheduleTimeline();
}


// ======================== 添加日程弹窗 ========================

function openScheduleAddModal() {
	const modal = document.getElementById('schedule-add-modal');
	if (!modal) return;
	modal.classList.add('active');
}

function closeScheduleAddModal() {
	const modal = document.getElementById('schedule-add-modal');
	if (!modal) return;
	modal.classList.remove('active');
}


// ======================== 日程详情弹窗 ========================

function openScheduleDetail(id) {
	const item = wikiScheduleData.find(d => d.id === id);
	if (!item) return;

	const body = document.getElementById('schedule-detail-body');
	if (!body) return;

	const isCompleted = item.status === 'completed';

	body.innerHTML = `
		<div class="detail-status-badge ${item.status}">
			${isCompleted
				? '<svg viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5 6.5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 已完成'
				: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg> 待进行'}
		</div>
		<div class="detail-title">${item.title}</div>
		<div class="detail-info-card">
			<div class="detail-info-row">
				<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 1v3M11 1v3M2 7h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				<span class="detail-info-label">日期</span>
				<span class="detail-info-value">${formatScheduleDate(item.date)}</span>
			</div>
			<div class="detail-info-row">
				<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				<span class="detail-info-label">时间</span>
				<span class="detail-info-value">${item.time}</span>
			</div>
			<div class="detail-info-row">
				<svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
				<span class="detail-info-label">角色</span>
				<span class="detail-info-value">${item.characters.join(', ')}</span>
			</div>
		</div>
		<div class="detail-desc-title">描述</div>
		<div class="detail-desc-body">${item.description}</div>
		<button class="detail-toggle-btn" onclick="toggleScheduleStatus(${item.id}); openScheduleDetail(${item.id});">
			${isCompleted
				? '<svg viewBox="0 0 16 16"><path d="M4 8h8" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg> 标记为待进行'
				: '<svg viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5 6.5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> 标记为已完成'}
		</button>
	`;

	const modal = document.getElementById('schedule-detail-modal');
	if (modal) modal.classList.add('active');
}

function closeScheduleDetailModal() {
	const modal = document.getElementById('schedule-detail-modal');
	if (modal) modal.classList.remove('active');
	// 关闭详情后刷新列表（状态可能已变）
	renderScheduleTimeline();
}


// ======================== 初始化 ========================

document.addEventListener('DOMContentLoaded', () => {
	// 如果 Wiki 当前可见且在日程表 Tab，则渲染
	const activeTab = document.querySelector('.wiki-tab.active');
	if (activeTab && activeTab.dataset.tab === 'schedule') {
		renderScheduleTimeline();
	}
});
