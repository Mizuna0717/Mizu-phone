// ========== 04-i18n.js ==========
// 依賴：01-config.js (LANG), 02-state.js (state)

function T(k) {
  return LANG[state.lang]?.[k] || LANG.en[k] || k;
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = T(el.dataset.i18n);
    else el.textContent = T(el.dataset.i18n);
  });
  document.querySelectorAll('.seg-option').forEach(el =>
    el.classList.toggle('active', el.dataset.lang === state.lang)
  );
  renderHelpAccordion();
  const a = document.querySelector('.screen.active');
  if (a?.id === 'screen-settings') renderSettings();
  if (a?.id === 'screen-imessage') { renderCharList(); renderMaskList(); renderProfileInfo(); renderProfileStickers(); }
  if (a?.id === 'screen-worldbook') renderWbList();
  if (a?.id === 'screen-chat') renderChat();
}

function setLang(l) {
  state.lang = l;
  saveState();
  applyLang();
}

function renderHelpAccordion() {
  document.getElementById('helpAccordion').innerHTML = [1, 2, 3, 4].map(i =>
    `<div class="accordion-item"><div class="accordion-head" onclick="toggleAcc(this)"><span>${T('helpQ' + i)}</span><span class="chev">⌄</span></div><div class="accordion-body"><div class="accordion-inner">${T('helpA' + i)}</div></div></div>`
  ).join('');
}
