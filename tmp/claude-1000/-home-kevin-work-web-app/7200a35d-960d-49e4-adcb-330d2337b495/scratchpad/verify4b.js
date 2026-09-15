const fs = require('fs');
const m = fs.readFileSync('js/memory.js', 'utf8');
const s = fs.readFileSync('js/state.js', 'utf8');
const css = fs.readFileSync('css/memory.css', 'utf8');

const checks = [
  ['1. TfidfRetriever class', m.includes('class TfidfRetriever')],
  ['2. EmbeddingRetriever class', m.includes('class EmbeddingRetriever')],
  ['3. testEmbeddingConnection', m.includes('async function testEmbeddingConnection')],
  ['4. recallList in buildMemoryContext', m.includes('recallList')],
  ['5. [相关回忆] section', m.includes('[相关回忆]')],
  ['6. renderRetrievalSettings', m.includes('function renderRetrievalSettings')],
  ['7. saveRetrievalSettings', m.includes('function saveRetrievalSettings')],
  ['8. testRetrievalConnection', m.includes('function testRetrievalConnection')],
  ['9. state.settings in defaults', s.includes("settings: {")],
  ['10. settings in SAVE_KEYS', s.includes("'settings'")],
  ['11. _validateState retrieval init', s.includes('settings.retrieval')],
  ['12. retrieval-settings-card CSS', css.includes('.retrieval-settings-card')],
  ['13. rs-toggle CSS', css.includes('.rs-toggle')],
];

checks.forEach(([name, ok]) => console.log(ok ? '✅' : '❌', name));