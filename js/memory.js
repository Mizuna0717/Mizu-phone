// ========== 17-memory.js ==========
// 依賴：02-state.js, 03-utils.js, 04-i18n.js, 05-ui.js, 06-api.js, 18-chat-config.js
// ★★★ 新增 FTM（Forgettable Memory）类型 ★★★
// ★★★ v2.0 - 记忆提示词升级：恋爱感 + 真人记忆 + 第一人称 ★★★

const MEMORY_MOODS = ['calm', 'happy', 'excited', 'sad', 'nostalgic', 'grateful'];
let memFilterCharId = 'all';

function fmtMemDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function getCharMemories(cid) {
  return (state.memories || []).filter(m => m.charId === cid).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ★★★ 新增 'ftm' 类型筛选 ★★★
function getCharMemoriesByType(cid, type) {
  const all = getCharMemories(cid);
  if (type === 'all') return all;
  if (type === 'stm') return all.filter(m => m.memType === 'stm');
  if (type === 'ltm') return all.filter(m => m.memType === 'ltm');
  if (type === 'ftm') return all.filter(m => m.memType === 'ftm');
  return all;
}

function getUnconsolidatedSTM(charId) {
  return (state.memories || [])
    .filter(m => m.charId === charId && m.memType === 'stm' && !m.consolidated)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ========== TF-IDF 检索器 ==========
class TfidfRetriever {
  // 分词：中文按字切分，英文按空格，过滤停用词
  _tokenize(text) {
    if (!text) return [];
    var STOP = new Set(['的','了','是','在','我','你','他','她','它','们','和','与','或','也','都','就','从','对','把','被','让','但','因','为','所','以','这','那','有','没','不','而','又','到','过','着','时','上','下','里','中','后','前','当','其','等','很','太','更','最','只','还','要','能','会','可','应','该','已','将','正','再','却','即','若','如','由','于','并','及','且','且','之','以','与','不','无','非','未','否']);
    var tokens = [];
    // 中文字符逐字
    var cjk = text.match(/[\u4e00-\u9fff\u3040-\u309f\uac00-\ud7af]/g) || [];
    cjk.forEach(function(c) { if (!STOP.has(c)) tokens.push(c); });
    // 英文单词
    var eng = text.toLowerCase().match(/[a-z]{2,}/g) || [];
    var engStop = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','of','in','to','for','on','at','by','with','from','up','about','into','through','during','before','after','above','below','to','from','up','down','in','out','off','over','under','again','further','then','once','and','but','or','nor','so','yet','both','either','neither','not','only','own','same','than','too','very','just','because','as','until','while','although','though','if','unless','when','where','who','which','that','this','these','those','am','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their']);
    eng.forEach(function(w) { if (!engStop.has(w)) tokens.push(w); });
    return tokens;
  }

  // 计算词频
  _tf(tokens) {
    var freq = {};
    tokens.forEach(function(t) { freq[t] = (freq[t] || 0) + 1; });
    var total = tokens.length || 1;
    Object.keys(freq).forEach(function(k) { freq[k] = freq[k] / total; });
    return freq;
  }

  // 余弦相似度（稀疏向量）
  _cosine(vecA, vecB) {
    var dot = 0, normA = 0, normB = 0;
    Object.keys(vecA).forEach(function(k) {
      normA += vecA[k] * vecA[k];
      if (vecB[k]) dot += vecA[k] * vecB[k];
    });
    Object.keys(vecB).forEach(function(k) { normB += vecB[k] * vecB[k]; });
    var denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  }

  // 计算 IDF
  _idf(allTokenSets) {
    var N = allTokenSets.length || 1;
    var df = {};
    allTokenSets.forEach(function(tokens) {
      var seen = new Set(tokens);
      seen.forEach(function(t) { df[t] = (df[t] || 0) + 1; });
    });
    var idf = {};
    Object.keys(df).forEach(function(t) {
      idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1;
    });
    return idf;
  }

  // 构建 TF-IDF 向量
  _tfidfVec(tf, idf) {
    var vec = {};
    Object.keys(tf).forEach(function(t) {
      vec[t] = tf[t] * (idf[t] || 1);
    });
    return vec;
  }

  // 主检索方法：返回 [{score, memory}] 降序
  retrieve(query, memories, topK) {
    topK = topK || 3;
    if (!memories || memories.length === 0) return [];
    if (!query) {
      // 无 query 时按时间倒序取 topK
      return memories.slice(0, topK).map(function(m) { return { score: 1, memory: m }; });
    }

    var queryTokens = this._tokenize(query);
    if (queryTokens.length === 0) {
      return memories.slice(0, topK).map(function(m) { return { score: 1, memory: m }; });
    }

    var self = this;
    var memTokenSets = memories.map(function(m) {
      return self._tokenize((m.content || '') + ' ' + (m.title || ''));
    });

    // 构建 IDF（语料 = 所有记忆 + query）
    var allSets = memTokenSets.concat([queryTokens]);
    var idf = this._idf(allSets);

    var queryVec = this._tfidfVec(this._tf(queryTokens), idf);
    var now = Date.now();
    var MS_PER_DAY = 86400000;

    var scored = memories.map(function(mem, i) {
      var memVec = self._tfidfVec(self._tf(memTokenSets[i]), idf);
      var sim = self._cosine(queryVec, memVec);

      // 时间衰减：最近的记忆权重更高
      var ts = mem.timestamp || (mem.date ? new Date(mem.date + 'T00:00:00').getTime() : now);
      var daysSince = Math.max(0, (now - ts) / MS_PER_DAY);
      var decay = Math.pow(0.99, daysSince);

      return { score: sim * decay, memory: mem };
    });

    // 降序排序，取 topK
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored.slice(0, topK);
  }
}

var _tfidfRetriever = new TfidfRetriever();
window.TfidfRetriever = TfidfRetriever;
window._tfidfRetriever = _tfidfRetriever;

// ========== Embedding 检索器 ==========
class EmbeddingRetriever {
  constructor(baseUrl, apiKey, model, timeout) {
    this.baseUrl = (baseUrl || '').replace(/\/+$/, '');
    this.apiKey = apiKey || '';
    this.model = model || 'text-embedding-3-small';
    this.timeout = (timeout > 0 ? timeout : 15) * 1000;
  }

  async embed(texts) {
    if (!this.baseUrl || !this.apiKey) throw new Error('Embedding: missing baseUrl or apiKey');
    var url = this.baseUrl + '/v1/embeddings';
    var ctrl = new AbortController();
    var tid = setTimeout(function() { ctrl.abort(); }, this.timeout);
    try {
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.apiKey },
        body: JSON.stringify({ model: this.model, input: texts }),
        signal: ctrl.signal
      });
      clearTimeout(tid);
      if (!resp.ok) throw new Error('Embedding API error: ' + resp.status);
      var data = await resp.json();
      // 返回向量数组（按 index 排序）
      var sorted = (data.data || []).slice().sort(function(a, b) { return a.index - b.index; });
      return sorted.map(function(d) { return d.embedding; });
    } catch (e) {
      clearTimeout(tid);
      throw e;
    }
  }

  _cosine(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    var dot = 0, na = 0, nb = 0;
    for (var i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    var denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom > 0 ? dot / denom : 0;
  }

  async retrieve(query, memories, topK) {
    topK = topK || 3;
    if (!memories || memories.length === 0) return [];
    // 只使用已有 embedding 缓存的记忆（不在此处补算，避免大量 API 调用）
    var withEmb = memories.filter(function(m) { return Array.isArray(m.embedding) && m.embedding.length > 0; });
    if (withEmb.length === 0) return [];

    var queryEmb;
    try {
      var vecs = await this.embed([query]);
      queryEmb = vecs[0];
    } catch (e) {
      console.warn('[EmbeddingRetriever] embed query failed:', e);
      return [];
    }

    var self = this;
    var now = Date.now();
    var MS_PER_DAY = 86400000;
    var scored = withEmb.map(function(mem) {
      var sim = self._cosine(queryEmb, mem.embedding);
      var ts = mem.timestamp || (mem.date ? new Date(mem.date + 'T00:00:00').getTime() : now);
      var daysSince = Math.max(0, (now - ts) / MS_PER_DAY);
      var decay = Math.pow(0.99, daysSince);
      return { score: sim * decay, memory: mem };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored.slice(0, topK);
  }
}
window.EmbeddingRetriever = EmbeddingRetriever;

// ========== Embedding 连通性测试 ==========
async function testEmbeddingConnection(cfg) {
  if (!cfg || !cfg.baseUrl || !cfg.apiKey) {
    console.warn('[testEmbeddingConnection] 缺少配置');
    return false;
  }
  try {
    var retriever = new EmbeddingRetriever(cfg.baseUrl, cfg.apiKey, cfg.model || 'text-embedding-3-small', cfg.timeout || 15);
    var result = await retriever.embed(['ping']);
    if (result && result[0] && result[0].length > 0) {
      console.log('[testEmbeddingConnection] ✅ 连接成功，向量维度:', result[0].length);
      return true;
    }
    return false;
  } catch (e) {
    console.error('[testEmbeddingConnection] ❌ 失败:', e.message || e);
    return false;
  }
}
window.testEmbeddingConnection = testEmbeddingConnection;

// ========== AutoRetriever ==========
class AutoRetriever {
  constructor(cfg) {
    this._tfidf = _tfidfRetriever;
    this.embedding = null;
    this.disabledUntil = 0;
    this._cfg = cfg || {};
    this._init();
  }

  _init() {
    var emb = this._cfg.embedding || {};
    if (!emb.enabled || !emb.baseUrl || !emb.apiKey || !emb.model) {
      console.log('[AutoRetriever] Embedding not configured, using TF-IDF');
      this.embedding = null;
      return;
    }
    // Async ping test — does not block constructor
    var self = this;
    var candidate = new EmbeddingRetriever(emb.baseUrl, emb.apiKey, emb.model, emb.timeout || 15);
    candidate.embed(['ping']).then(function(res) {
      if (res && res[0] && res[0].length > 0) {
        self.embedding = candidate;
        console.log('[AutoRetriever] Embedding ready, dim:', res[0].length);
      } else {
        self.embedding = null;
        console.warn('[AutoRetriever] Embedding ping returned empty, degraded to TF-IDF');
      }
    }).catch(function(e) {
      self.embedding = null;
      console.warn('[AutoRetriever] Embedding unavailable, degraded to TF-IDF:', e.message || e);
    });
  }

  async retrieve(query, memories, topK) {
    topK = topK || 3;
    // During embedding rebuild, force TF-IDF
    if (state.embeddingRebuildInProgress) {
      return this._tfidf.retrieve(query, memories, topK);
    }
    // If embedding is enabled and not in cooldown, try it
    if (this.embedding && Date.now() > this.disabledUntil) {
      try {
        var results = await this.embedding.retrieve(query, memories, topK);
        // If no cached embeddings available, fall through to TF-IDF
        if (results.length > 0) return results;
      } catch (e) {
        this.disabledUntil = Date.now() + 300000; // 5 min cooldown
        console.warn('[AutoRetriever] Embedding failed, degraded to TF-IDF for 5 min:', e.message || e);
      }
    }
    return this._tfidf.retrieve(query, memories, topK);
  }
}

// Global AutoRetriever instance — (re)initialized from settings
var autoRetriever = new AutoRetriever((window.state && state.settings && state.settings.retrieval) || {});
window.autoRetriever = autoRetriever;

// Re-initialize AutoRetriever from current settings
function initAutoRetriever() {
  var cfg = (state.settings && state.settings.retrieval) || {};
  autoRetriever = new AutoRetriever(cfg);
  window.autoRetriever = autoRetriever;
  console.log('[initAutoRetriever] Re-initialized with mode:', cfg.mode);
}
window.initAutoRetriever = initAutoRetriever;

// ========== Embedding cache helpers ==========
function _contentHash(str) {
  // Simple djb2 hash for change detection
  var h = 5381;
  for (var i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

async function _embedAndCache(mem) {
  var cfg = (state.settings && state.settings.retrieval && state.settings.retrieval.embedding) || {};
  if (!cfg.enabled || !cfg.baseUrl || !cfg.apiKey || !cfg.model) return;
  if (!autoRetriever.embedding) return;
  var text = (mem.content || '') + ' ' + (mem.title || '');
  var hash = _contentHash(text);
  // Skip if already cached for same model and content
  if (mem.embedding && mem.embeddingModel === cfg.model && mem.contentHash === hash) return;
  try {
    var vecs = await autoRetriever.embedding.embed([text]);
    if (vecs && vecs[0]) {
      mem.embedding = vecs[0];
      mem.embeddingModel = cfg.model;
      mem.embeddingDim = vecs[0].length;
      mem.contentHash = hash;
    }
  } catch (e) {
    console.warn('[_embedAndCache] Failed for mem', mem.id, e.message || e);
  }
}
window._embedAndCache = _embedAndCache;

// ========== Index rebuild ==========
async function rebuildEmbeddings(charId) {
  var cfg = (state.settings && state.settings.retrieval && state.settings.retrieval.embedding) || {};
  if (!cfg.enabled || !cfg.baseUrl || !cfg.apiKey || !cfg.model) {
    console.warn('[rebuildEmbeddings] Embedding not configured, skipping');
    return;
  }
  if (!autoRetriever.embedding) {
    console.warn('[rebuildEmbeddings] AutoRetriever has no embedding instance, skipping');
    return;
  }
  var mems = (state.memories || []).filter(function(m) {
    return m.memType === 'ltm' && (charId ? m.charId === charId : true);
  });
  if (mems.length === 0) { console.log('[rebuildEmbeddings] No LTM to rebuild'); return; }
  state.embeddingRebuildInProgress = true;
  console.log('[rebuildEmbeddings] Starting rebuild for', mems.length, 'LTM entries...');
  var done = 0;
  for (var i = 0; i < mems.length; i++) {
    await _embedAndCache(mems[i]);
    done++;
    if (done % 5 === 0) console.log('[rebuildEmbeddings] Progress:', done + '/' + mems.length);
  }
  state.embeddingRebuildInProgress = false;
  saveState();
  console.log('[rebuildEmbeddings] Done. Rebuilt', done, 'embeddings.');
}
window.rebuildEmbeddings = rebuildEmbeddings;

// ★ 把 charConfig 的值解析成 slice 上限
function _memLoadLimit(v, fallback) {
  if (v === 'all') return Infinity;
  if (typeof v === 'number' && v >= 0) return v;
  return fallback;
}

// ========== buildMemoryContext ==========
// 供 prompt 构建器调用：返回注入到 system prompt 的记忆文本块
function buildMemoryContext(charId, queryOverride) {
  if (!charId) return '';

  // 核心记忆：isCore === true，全量注入，不限条数
  var coreList = (state.memories || []).filter(function(m) {
    return m.charId === charId && m.isCore;
  }).sort(function(a, b) { return new Date(a.date) - new Date(b.date); });

    // LTM: 最近 3 条长期记忆（按时间倒序）
  // LTM: 按设置注入
  var _charCfg = (typeof getCharConfig === 'function') ? getCharConfig(charId) : {};
  var _ltmLimit = _memLoadLimit(_charCfg.ltmLoadCount, 3);
  var _allLtm = getCharMemoriesByType(charId, 'ltm').filter(function(m) { return !m.isCore; });
  var ltmList = _allLtm.slice(0, _ltmLimit);

  // TF-IDF 检索：额外召回相关 LTM（去重后追加到 [相关回忆]）
  var _recentLtmIds = new Set(ltmList.map(function(m) { return m.id; }));
  var _query = (function() {
    if (!charId) return '';
    var _msgs = (state.chats && state.chats[charId]) ? state.chats[charId] : [];
    for (var _i = _msgs.length - 1; _i >= 0; _i--) {
      if (_msgs[_i].role === 'user' && _msgs[_i].content) return _msgs[_i].content.slice(0, 300);
    }
    return '';
  })();
    // 只在 LTM 超过 3 条时才检索额外相关记忆
  var recallList = [];
  // Note: autoRetriever.retrieve is async; for sync buildMemoryContext we use TF-IDF sync path
  // Embedding results (if available) will be used next call after async init completes
  if (_allLtm.length > 3 && _query) {
    var _retrieval = (state.settings && state.settings.retrieval) || {};
    var _topK = (_retrieval.topK > 0) ? _retrieval.topK : 3;
    var _mode = _retrieval.mode || 'auto';
    var _retrieved;
    if (_mode === 'tfidf') {
      _retrieved = _tfidfRetriever.retrieve(_query, _allLtm, _topK + 3);
    } else {
      // auto / embedding: use sync TF-IDF (embedding async results available after first call)
      _retrieved = _tfidfRetriever.retrieve(_query, _allLtm, _topK + 3);
    }
    _retrieved.forEach(function(r) {
      if (!_recentLtmIds.has(r.memory.id) && recallList.length < _topK) {
        recallList.push(r.memory);
      }
    });
  }

    // STM: 按设置注入
  var _stmLimit = _memLoadLimit(_charCfg.stmLoadCount, 5);
  var stmAll = getCharMemoriesByType(charId, 'stm');
  var stmUnconsolidated = stmAll.filter(function(m) { return !m.consolidated; });
  var stmList = (stmUnconsolidated.length > 0 ? stmUnconsolidated : stmAll).slice(0, _stmLimit);

    // FTM: 最近 3 条模糊/可遗忘记忆（仅取未过期的）
  var _nowTs = Date.now();
  var ftmList = getCharMemoriesByType(charId, 'ftm').filter(function(m) {
    return !m.expiresAt || m.expiresAt > _nowTs;
  }).slice(0, 3);

  // 手动记忆（无 memType 的条目）
  var manualList = (state.memories || [])
    .filter(function(m) { return m.charId === charId && !m.memType; })
    .sort(function(a, b) { return new Date(b.date) - new Date(a.date); })
    .slice(0, 3);

    // 如果什么都没有，返回空串
    if (!coreList.length && !ltmList.length && !stmList.length && !ftmList.length && !manualList.length && !recallList.length) {
      return '';
    }

  var parts = [];

  // 【核心记忆】全量注入，置顶
  if (coreList.length > 0) {
    var coreLines = coreList.map(function(m) {
      return '- ' + (m.content || '').trim();
    }).join('\n');
    parts.push('[核心记忆 - 绝对不可忘记]\n' + coreLines);
  }

  // 【临时备忘】FTM
  if (ftmList.length > 0) {
    var ftmLines = ftmList.map(function(m) {
      return '- ' + (m.date ? '(' + m.date + ') ' : '') + (m.content || '').trim();
    }).join('\n');
    parts.push('[临时备忘]\n' + ftmLines);
  }

  // 【近期发生的事情】STM
  if (stmList.length > 0) {
    var stmLines = stmList.map(function(m) {
      return '- ' + (m.date ? '(' + m.date + ') ' : '') + (m.content || '').trim();
    }).join('\n');
    parts.push('[近期发生的事情]\n' + stmLines);
  }

  // 手动记忆归入近期
  if (manualList.length > 0 && stmList.length === 0) {
    var manLines = manualList.map(function(m) {
      return '- ' + (m.date ? '(' + m.date + ') ' : '') +
        (m.title ? m.title + ': ' : '') + (m.content || '').trim();
    }).join('\n');
    parts.push('[近期发生的事情]\n' + manLines);
  } else if (manualList.length > 0) {
    var manLines2 = manualList.map(function(m) {
      return '- ' + (m.date ? '(' + m.date + ') ' : '') +
        (m.title ? m.title + ': ' : '') + (m.content || '').trim();
    }).join('\n');
    parts[parts.length - 1] += '\n' + manLines2;
  }

    // 【深刻的过往记忆】LTM
  if (ltmList.length > 0) {
    var ltmLines = ltmList.map(function(m) {
      return '- ' + (m.date ? '(' + m.date + ') ' : '') + (m.content || '').trim();
    }).join('\n');
    parts.push('[深刻的过往记忆]\n' + ltmLines);
  }

  // 【相关回忆】TF-IDF 检索额外结果
  if (recallList.length > 0) {
    var recallLines = recallList.map(function(m) {
      return '- ' + (m.date ? '(' + m.date + ') ' : '') + (m.content || '').trim();
    }).join('\n');
    parts.push('[相关回忆]\n' + recallLines);
  }

  return parts.join('\n\n');
}
window.buildMemoryContext = buildMemoryContext;

// ========== 记忆检索设置面板 ==========
function renderRetrievalSettings(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var cfg = (state.settings && state.settings.retrieval) || {};
  var emb = cfg.embedding || {};
  var mode = cfg.mode || 'auto';
  var showEmb = (mode === 'auto' || mode === 'embedding');

  el.innerHTML = [
    '<div class="retrieval-settings-card">',
    '<div class="rs-section-title">Memory Retrieval</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Mode</label>',
    '<select class="rs-select retrieval-mode" onchange="onRetrievalModeChange(this.value)">',
    '<option value="auto"' + (mode === 'auto' ? ' selected' : '') + '>Auto (TF-IDF)</option>',
    '<option value="tfidf"' + (mode === 'tfidf' ? ' selected' : '') + '>TF-IDF Only</option>',
    '<option value="embedding"' + (mode === 'embedding' ? ' selected' : '') + '>Embedding</option>',
    '</select>',
    '</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Top K Results</label>',
    '<input class="rs-input" id="retrievalTopK" type="number" min="1" max="10" value="' + (cfg.topK || 3) + '">',
    '</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Time Decay</label>',
    '<input class="rs-input" id="retrievalDecay" type="number" min="0.9" max="1" step="0.001" value="' + (cfg.timeDecay || 0.99) + '">',
    '</div>',

    '<div id="retrievalEmbSection" style="display:' + (showEmb ? 'block' : 'none') + '">',
    '<div class="rs-divider"></div>',
    '<div class="rs-sub-title">Embedding API</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Enabled</label>',
    '<label class="rs-toggle"><input type="checkbox" id="retrievalEmbEnabled"' + (emb.enabled ? ' checked' : '') + '><span class="rs-toggle-track"></span></label>',
    '</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Base URL</label>',
    '<input class="rs-input" id="retrievalEmbUrl" type="url" placeholder="https://api.openai.com" value="' + (emb.baseUrl || '') + '">',
    '</div>',

    '<div class="rs-row">',
    '<label class="rs-label">API Key</label>',
    '<input class="rs-input" id="retrievalEmbKey" type="password" placeholder="sk-..." value="' + (emb.apiKey || '') + '">',
    '</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Model</label>',
    '<input class="rs-input" id="retrievalEmbModel" type="text" placeholder="text-embedding-3-small" value="' + (emb.model || '') + '">',
    '</div>',

    '<div class="rs-row">',
    '<label class="rs-label">Timeout (s)</label>',
    '<input class="rs-input" id="retrievalEmbTimeout" type="number" min="5" max="60" value="' + (emb.timeout || 15) + '">',
    '</div>',

    '<div class="rs-row rs-btn-row">',
    '<button class="rs-btn retrieval-test-btn" onclick="testRetrievalConnection()">Test Connection</button>',
    '<span class="rs-test-result" id="retrievalTestResult"></span>',
    '</div>',
    '</div>',

    '<div class="rs-row rs-btn-row">',
    '<button class="rs-btn rs-btn-primary" onclick="saveRetrievalSettings()">Save</button>',
    '</div>',
    '</div>'
  ].join('');
}
window.renderRetrievalSettings = renderRetrievalSettings;

function onRetrievalModeChange(val) {
  var sec = document.getElementById('retrievalEmbSection');
  if (sec) sec.style.display = (val === 'auto' || val === 'embedding') ? 'block' : 'none';
  var sel = document.querySelector('.retrieval-mode');
  if (sel) sel.value = val;
}
window.onRetrievalModeChange = onRetrievalModeChange;

function saveRetrievalSettings() {
  if (!state.settings) state.settings = {};
  if (!state.settings.retrieval) state.settings.retrieval = {};
  var r = state.settings.retrieval;
  var sel = document.querySelector('.retrieval-mode');
  if (sel) r.mode = sel.value;
  var topK = document.getElementById('retrievalTopK');
  if (topK) r.topK = parseInt(topK.value) || 3;
  var decay = document.getElementById('retrievalDecay');
  if (decay) r.timeDecay = parseFloat(decay.value) || 0.99;
  if (!r.embedding) r.embedding = {};
  var enabled = document.getElementById('retrievalEmbEnabled');
  if (enabled) r.embedding.enabled = enabled.checked;
  var url = document.getElementById('retrievalEmbUrl');
  if (url) r.embedding.baseUrl = url.value.trim();
  var key = document.getElementById('retrievalEmbKey');
  if (key) r.embedding.apiKey = key.value.trim();
  var model = document.getElementById('retrievalEmbModel');
  if (model) r.embedding.model = model.value.trim();
  var timeout = document.getElementById('retrievalEmbTimeout');
  if (timeout) r.embedding.timeout = parseInt(timeout.value) || 15;
    // Capture new model before save (r is already mutated above)
    var _newModel = r.embedding ? (r.embedding.model || '') : '';
    // Capture previous saved model from localStorage snapshot (before saveState)
    var _prevModel = '';
    try {
      var _snap = localStorage.getItem('ai_app_account_' + accountStore.currentAccountId);
      if (_snap) { var _sd = JSON.parse(_snap); _prevModel = (_sd.settings && _sd.settings.retrieval && _sd.settings.retrieval.embedding && _sd.settings.retrieval.embedding.model) || ''; }
    } catch(e) {}
    saveState();
    // Re-initialize AutoRetriever with new config
    if (typeof initAutoRetriever === 'function') initAutoRetriever();
    // If model changed and embedding is enabled, rebuild index
    if (_prevModel && _newModel && _prevModel !== _newModel) {
    var _rebuildCharId = state.currentCharId || null;
    console.log('[saveRetrievalSettings] Embedding model changed:', _prevModel, '->', _newModel, '| triggering rebuild for', _rebuildCharId || 'all');
    if (typeof rebuildEmbeddings === 'function') {
      rebuildEmbeddings(_rebuildCharId).catch(function(e) { console.warn('[saveRetrievalSettings] rebuild error:', e); });
    }
  }
  if (typeof showToast === 'function') showToast('Retrieval settings saved');
}
window.saveRetrievalSettings = saveRetrievalSettings;

async function testRetrievalConnection() {
  var result = document.getElementById('retrievalTestResult');
  if (result) { result.textContent = 'Testing...'; result.style.color = '#8e8e93'; }
  var cfg = {};
  var url = document.getElementById('retrievalEmbUrl');
  var key = document.getElementById('retrievalEmbKey');
  var model = document.getElementById('retrievalEmbModel');
  var timeout = document.getElementById('retrievalEmbTimeout');
  if (url) cfg.baseUrl = url.value.trim();
  if (key) cfg.apiKey = key.value.trim();
  if (model) cfg.model = model.value.trim();
  if (timeout) cfg.timeout = parseInt(timeout.value) || 15;
  var ok = await testEmbeddingConnection(cfg);
  if (result) {
    result.textContent = ok ? '✓ Connected' : '✗ Failed';
    result.style.color = ok ? '#34c759' : '#ff3b30';
  }
}
window.testRetrievalConnection = testRetrievalConnection;

// ========== 核心记忆操作 ==========

// 将某条记忆升级/降级为核心记忆
function setCoreMemory(memId, isCore) {
  var m = (state.memories || []).find(function(x) { return x.id === memId; });
  if (!m) return false;
  m.isCore = !!isCore;
  saveState();
  return true;
}
window.setCoreMemory = setCoreMemory;

// 从一段 LTM 内容中 AI 提取核心记忆，保存为独立条目
async function extractCoreFromLTM(charId, ltmContent, apiOverride) {
  if (!charId || !ltmContent) return null;
  var api = apiOverride || (state.apis.find(function(a) { return a.id === state.activeApiId; }));
  if (!api || !api.url || !api.model) return null;
  var ch = state.characters.find(function(c) { return c.id === charId; });
  if (!ch) return null;
  var userName = (typeof getCurrentUserMaskName === 'function')
    ? getCurrentUserMaskName()
    : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '用户');
  var prompt = '你是 ' + ch.name + '。下面是你关于 ' + userName + ' 的一段长期记忆。\n' +
    '现在，请从中提取出【绝对不可忘记的核心事实】，这将作为你世界观和关系的基石。\n\n' +
    '【提取规则】\n' +
    '1. 只提取那些永久有效的事实、承诺、重大秘密或不可动摇的关系设定。\n' +
    '2. 剔除所有带有情绪起伏的日常事件和无关紧要的细节。\n' +
    '3. 每条核心记忆控制在 100 字以内，使用第一人称。\n' +
    '4. 如果这段话中不存在需要永久刻骨铭心的信息，请直接回复："无核心记忆"。\n\n' +
    '长期记忆内容：\n' + ltmContent;
  try {
    var result = await sendChat(api, [
      { role: 'system', content: prompt },
      { role: 'user', content: '请提取核心记忆。' }
    ]);
    if (!result || result.trim() === '无核心记忆') {
      console.log('[CoreMemory] extractCoreFromLTM: no core memories found');
      return null;
    }
    // 按行拆分，每行一条核心记忆
    var lines = result.split('\n').map(function(l) {
      return l.replace(/^[-·•\d\.\s]+/, '').trim();
    }).filter(function(l) { return l.length > 0; });
    var saved = 0;
    lines.forEach(function(line) {
      if (line.length > 0 && line.length <= 60) {
        saveMemoryEntry(charId, 'ltm', '核心记忆: ' + ch.name, line, { isCore: true });
        saved++;
      }
    });
    console.log('[CoreMemory] extractCoreFromLTM: saved', saved, 'core memories for', ch.name);
    return saved > 0 ? lines : null;
  } catch (e) {
    console.error('[CoreMemory] extractCoreFromLTM error:', e);
    return null;
  }
}
window.extractCoreFromLTM = extractCoreFromLTM;

function saveMemoryEntry(charId, memType, title, content, extraFields) {
  if (!state.memories) state.memories = [];
  const today = new Date().toISOString().split('T')[0];
  var entry = {
    id: uid(), title: title, date: today, content: content, mood: '', photo: null,
    charId: charId, memType: memType, autoGenerated: true, timestamp: Date.now()
  };
  // FTM: auto-set expiresAt to 3 days from now
  if (memType === 'ftm') {
    var _ftmTTL = (typeof state.ftmTTLDays === 'number' ? state.ftmTTLDays : 3) * 24 * 60 * 60 * 1000;
    entry.expiresAt = Date.now() + _ftmTTL;
  }
    if (extraFields && typeof extraFields === 'object') {
    Object.assign(entry, extraFields);
  }
  state.memories.push(entry);
  saveState();
  // Async: compute and cache embedding for LTM entries
  if (memType === 'ltm' && typeof _embedAndCache === 'function') {
    _embedAndCache(entry).then(function() {
      if (entry.embedding) saveState();
    }).catch(function() {});
  }
}

// ========== FTM 过期清理 ==========
function cleanupExpiredMemories() {
  if (!Array.isArray(state.memories)) return 0;
  var before = state.memories.length;
  var now = Date.now();
  state.memories = state.memories.filter(function(m) {
    if (m.memType === 'ftm' && m.expiresAt && m.expiresAt < now) {
      return false;
    }
    return true;
  });
  var removed = before - state.memories.length;
  if (removed > 0) {
    saveState();
    console.log('[FTM] cleanupExpiredMemories: removed', removed, 'expired FTM entries');
  }
  return removed;
}
window.cleanupExpiredMemories = cleanupExpiredMemories;

// ========== 通话专用 FTM 总结 ==========
async function callEphemeralSummarize(charId, callTranscript, apiOverride) {
  if (!charId || !callTranscript) return null;
  var api = apiOverride || (state.apis.find(function(a) { return a.id === state.activeApiId; }));
  if (!api || !api.url || !api.model) return null;
  var ch = state.characters.find(function(c) { return c.id === charId; });
  if (!ch) return null;
  var userName = (typeof getCurrentUserMaskName === 'function')
    ? getCurrentUserMaskName()
    : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '用户');
  var charName = ch.name;
  var prompt = '你是 ' + charName + '。刚才你和 ' + userName + ' 进行了一次通话。\n' +
    '现在通话结束了，你需要把这段内容记在一个"便利贴"上，作为短期备忘。\n\n' +
    '【写作规则】\n' +
    '1. 这是一个"易遗忘"的记忆，不需要记录长篇大论的情感，只需要保留：\n' +
    '   - 刚才互动中提到的具体事件、待办事项、临时状态\n' +
    '   - 互动结束时双方的情绪状态。\n' +
    '2. 语气像写备忘录，第一人称，简短直接，控制在 30-80 字。\n' +
    '3. 不要加标题，直接输出文本。\n\n' +
    '互动内容：\n' + callTranscript;
  try {
    var summary = await sendChat(api, [
      { role: 'system', content: prompt },
      { role: 'user', content: '请记录这段通话备忘。' }
    ]);
    if (summary && summary.trim()) {
      var ttlDays = (typeof state.ftmTTLDays === 'number') ? state.ftmTTLDays : 3;
      saveMemoryEntry(charId, 'ftm', '通话备忘: ' + charName, summary.trim(), {
        expiresAt: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
        callEphemeral: true
      });
      console.log('[FTM] callEphemeralSummarize: saved for', charName, '| expires in', ttlDays, 'days');
      return summary.trim();
    }
  } catch (e) {
    console.error('[FTM] callEphemeralSummarize error:', e);
  }
  return null;
}
window.callEphemeralSummarize = callEphemeralSummarize;

// ========== 记忆类型选择（适配 .mem-seg-option）==========
function selectMemType(el, value) {
  var ctrl = document.getElementById('memTypeControl');
  if (!ctrl) return;
  ctrl.querySelectorAll('.mem-seg-option').forEach(function(opt) {
    opt.classList.remove('active');
  });
  el.classList.add('active');
  tmp.memType = value;
}
window.selectMemType = selectMemType;

function getSelectedMemType() {
  var ctrl = document.getElementById('memTypeControl');
  if (!ctrl) return 'stm';
  var active = ctrl.querySelector('.mem-seg-option.active');
  return active ? (active.dataset.value || 'stm') : 'stm';
}

function setMemTypeControl(value) {
  var ctrl = document.getElementById('memTypeControl');
  if (!ctrl) return;
  tmp.memType = value || 'stm';
  ctrl.querySelectorAll('.mem-seg-option').forEach(function(opt) {
    if (opt.dataset.value === tmp.memType) opt.classList.add('active');
    else opt.classList.remove('active');
  });
}


// ========== RENDER ==========
function renderMemCharFilter() {
  const el = document.getElementById('memCharFilter');
  const chars = state.characters || [];
  let h = `<div class="mem-char-chip${memFilterCharId === 'all' ? ' active' : ''}" onclick="setMemCharFilter('all')"><span>${T('allMessages')}</span></div>`;
  chars.forEach(ch => {
    const count = getCharMemories(ch.id).length;
    if (count > 0 || memFilterCharId === ch.id) {
      h += `<div class="mem-char-chip${memFilterCharId === ch.id ? ' active' : ''}" onclick="setMemCharFilter('${ch.id}')">
        <div class="mcc-avatar">${ch.avatar ? `<img src="${ch.avatar}">` : '<svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>'}</div>
        <span>${esc(ch.name)}</span></div>`;
    }
  });
  chars.forEach(ch => {
    const count = getCharMemories(ch.id).length;
    if (count === 0 && memFilterCharId !== ch.id) {
      h += `<div class="mem-char-chip${memFilterCharId === ch.id ? ' active' : ''}" onclick="setMemCharFilter('${ch.id}')">
        <div class="mcc-avatar">${ch.avatar ? `<img src="${ch.avatar}">` : '<svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>'}</div>
        <span>${esc(ch.name)}</span></div>`;
    }
  });
  el.innerHTML = h;
}

function renderMemCharInfo() {
  const el = document.getElementById('memCharInfoArea');
  if (memFilterCharId === 'all') { el.innerHTML = ''; return; }
  const ch = state.characters.find(c => c.id === memFilterCharId);
  if (!ch) { el.innerHTML = ''; return; }
  const mems = getCharMemories(ch.id);
  const msgCount = (state.chats[ch.id] || []).length;
  el.innerHTML = `<div class="mem-char-info-card">
    <div class="mcic-avatar">${ch.avatar ? `<img src="${ch.avatar}">` : '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M5 22c0-4 3-7 7-7s7 3 7 7"/></svg>'}</div>
    <div class="mcic-info"><div class="mcic-name">${esc(ch.name)}</div><div class="mcic-stats">${mems.length} ${T('totalMemories')} · ${msgCount} ${T('msgCount')}</div></div>
  </div>`;
}

function setMemCharFilter(id) {
  memFilterCharId = id;
  renderMemCharFilter();
  renderMemCharInfo();
  renderMemoryList();
}

function getFilteredMemories() {
  const mems = state.memories || [];
  if (memFilterCharId === 'all') return mems;
  return mems.filter(m => m.charId === memFilterCharId);
}

function renderMemoryList() {
  renderMemCharFilter();
  renderMemCharInfo();
  const body = document.getElementById('memoryListBody');
  if (!body) return;
  const filtered = getFilteredMemories();

  // --- 统计 ---
  document.getElementById('memStatTotal').textContent = filtered.length;
  if (filtered.length) {
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    document.getElementById('memStatFirst').textContent = fmtMemDate(sorted[0].date);
    const now = new Date();
    const thisMonth = filtered.filter(m => { const d = new Date(m.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    document.getElementById('memStatStreak').textContent = thisMonth;
  } else {
    document.getElementById('memStatFirst').textContent = '—';
    document.getElementById('memStatStreak').textContent = '0';
  }

  let h = '';

  // --- 记忆时间线或空状态 ---
  if (!filtered.length) {
    const isFiltered = memFilterCharId !== 'all';
    const ch = isFiltered ? state.characters.find(c => c.id === memFilterCharId) : null;
    h += `<div class="mem-empty">
      <svg viewBox="0 0 48 48" style="width:44px;height:44px;stroke:#d1d1d6;fill:none;stroke-width:1"><rect x="8" y="5" width="32" height="38" rx="5"/><rect x="13" y="9" width="22" height="16" rx="2"/><path d="M17 32h14"/><path d="M20 36h8"/></svg>
      <p>${isFiltered ? T('noCharMemories') : T('noMemories')}<br><span style="font-size:12px">${isFiltered ? esc(ch?.name || '') : T('noMemoriesSub')}</span></p>
    </div>`;
  } else {
        // 核心记忆置顶，其余按时间倒序
    const coreItems = filtered.filter(m => m.isCore);
    const nonCoreItems = filtered.filter(m => !m.isCore).sort((a, b) => new Date(b.date) - new Date(a.date));
    const sorted = [...coreItems, ...nonCoreItems];
    h += '<div class="mem-timeline">';
    sorted.forEach(mem => {
      const moodKey = mem.mood ? ('mood' + mem.mood.charAt(0).toUpperCase() + mem.mood.slice(1)) : '';
      const memChar = mem.charId ? state.characters.find(c => c.id === mem.charId) : null;
      h += `<div class="mem-tl-item"><div class="mem-tl-card" onclick="editMemory('${mem.id}')">`;
      if (mem.photo) h += `<div class="mem-tl-photo"><img src="${mem.photo}"></div>`;
      h += `<div class="mem-tl-body"><div class="mem-tl-title">${esc(mem.title || 'Untitled')}</div>`;
      if (mem.content) h += `<div class="mem-tl-text">${esc(mem.content)}</div>`;
      h += `<div class="mem-tl-footer"><span class="mem-tl-date">${fmtMemDate(mem.date)}</span>`;

      if (mem.mood) {
        h += `<span class="mem-tl-mood">${esc(moodKey ? T(moodKey) : mem.mood)}</span>`;
      }

            // 核心记忆标签（金色星星，线条风格，置于最前）
      if (mem.isCore) {
        h += `<span class="mem-type-core" title="核心记忆 - 永久注入">
          <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:-1px;margin-right:2px"><polygon points="7,1 8.8,5.2 13.4,5.2 9.8,7.9 11.1,12.3 7,9.5 2.9,12.3 4.2,7.9 0.6,5.2 5.2,5.2"/></svg>核心</span>`;
      }
      if (mem.memType === 'stm') {
        h += `<span class="mem-type-stm">${T('stmLabel')}</span>`;
      } else if (mem.memType === 'ltm') {
        h += `<span class="mem-type-ltm">${T('ltmLabel')}</span>`;
      } else if (mem.memType === 'ftm') {
        h += `<span class="mem-type-ftm">FTM</span>`;
      } else if (mem.autoGenerated) {
        h += `<span class="mem-type-auto">Auto</span>`;
      }

            if (mem.consolidated) {
        h += `<span class="mem-tag" style="text-decoration:line-through;color:#aeaeb2">merged</span>`;
      }
      // 升级/降级核心记忆按钮
      if (!mem.isCore) {
        h += `<span class="mem-core-btn" onclick="event.stopPropagation();setCoreMemory('${mem.id}',true);renderMemoryList()" title="升级为核心记忆">
          <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="7,1 8.8,5.2 13.4,5.2 9.8,7.9 11.1,12.3 7,9.5 2.9,12.3 4.2,7.9 0.6,5.2 5.2,5.2"/></svg></span>`;
      } else {
        h += `<span class="mem-core-btn mem-core-btn--active" onclick="event.stopPropagation();setCoreMemory('${mem.id}',false);renderMemoryList()" title="取消核心记忆">
          <svg viewBox="0 0 14 14" width="11" height="11" fill="currentColor" stroke="none"><polygon points="7,1 8.8,5.2 13.4,5.2 9.8,7.9 11.1,12.3 7,9.5 2.9,12.3 4.2,7.9 0.6,5.2 5.2,5.2"/></svg></span>`;
      }

      if (memFilterCharId === 'all' && memChar) {
        h += `<span class="mem-char-tag">${esc(memChar.name)}</span>`;
      }

      h += `</div></div></div></div>`;
    });
    h += '</div>';
  }

  // --- 收藏信息部分（始终渲染）---
  h += `<div style="padding:24px 20px 8px;font-size:13px;color:#8e8e93;text-transform:uppercase;letter-spacing:.5px;font-weight:600;display:flex;align-items:center;gap:8px">
    <svg viewBox="0 0 16 16" style="width:14px;height:14px;stroke:#8e8e93;fill:none;stroke-width:1.5"><path d="M3 1h10a1 1 0 011 1v13l-6-3-6 3V2a1 1 0 011-1z"/></svg>
    <span>${T('bookmarkedMessages')}</span></div>`;

  const bks = (state.bookmarks || []).filter(b => {
    if (memFilterCharId === 'all') return true;
    return b.charId === memFilterCharId;
  }).sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);

  if (!bks.length) {
    h += `<div style="text-align:center;padding:20px 30px;color:#c7c7cc;font-size:13px">${T('noBookmarksInMemory')}</div>`;
  } else {
    h += '<div style="margin:0 16px 16px">';
    bks.forEach(b => {
      const bChar = b.charId ? state.characters.find(c => c.id === b.charId) : null;
      const senderName = b.role === 'user' ? (state.userProfile.name || 'User') : (b.charName || '');
      const avatarH = b.role === 'user' ?
        (state.userProfile.avatar ? `<img src="${state.userProfile.avatar}" style="width:100%;height:100%;object-fit:cover">` : '') :
        (b.charAvatar ? `<img src="${b.charAvatar}" style="width:100%;height:100%;object-fit:cover">` : PERSON_SVG);

      const charTagHtml = (memFilterCharId === 'all' && bChar)
        ? `<span class="bk-char-tag">${esc(bChar.name)}</span>`
        : '';

      h += `<div style="background:#fff;border-radius:14px;padding:14px 16px;margin-bottom:8px;border:1px solid #ececec;box-shadow:0 1px 4px rgba(0,0,0,.04);display:flex;gap:12px;align-items:flex-start">
        <div style="width:36px;height:36px;border-radius:50%;background:#e5e5ea;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center">${avatarH}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:13px;font-weight:600;color:#1d1d1f">${esc(senderName)}</span>
            ${charTagHtml}
            <span style="font-size:10px;color:#c7c7cc;margin-left:auto">${fmtTime(b.timestamp)}</span>
          </div>
          <div style="font-size:13px;color:#3a3a3c;line-height:1.4;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">${esc((b.content || '').slice(0, 200))}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
            <svg viewBox="0 0 14 14" style="width:12px;height:12px;stroke:#c7c7cc;fill:none;stroke-width:1.5"><path d="M3 1h8a1 1 0 011 1v11l-5-2.5L2 13V2a1 1 0 011-1z"/></svg>
            <span style="font-size:10px;color:#c7c7cc">${fmtMemDate(new Date(b.bookmarkedAt).toISOString().split('T')[0])}</span>
          </div>
        </div>
        <button onclick="event.stopPropagation();removeBookmarkFromMemory('${b.id}')" style="background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0;margin-top:2px">
          <svg viewBox="0 0 14 14" style="width:14px;height:14px;stroke:#ff3b30;fill:none;stroke-width:1.5"><path d="M3 3l8 8M11 3l-8 8" stroke-linecap="round"/></svg>
        </button>
      </div>`;
    });
    h += '</div>';
  }

  body.innerHTML = h;
}


function removeBookmarkFromMemory(bid) {
  state.bookmarks = (state.bookmarks || []).filter(b => b.id !== bid);
  saveState();
  renderMemoryList();
  showToast(T('unbookmarked'));
}

// ========== MEMORY EDIT ==========
function editMemory(id) {
  state.editingMemId = id;
  tmp.memEditFrom = document.querySelector('.screen.active')?.id || 'screen-memory';
  const m = id ? (state.memories || []).find(x => x.id === id) : null;
  document.getElementById('memEditTitle').textContent = m ? T('editMemory') : T('addMemory');
  document.getElementById('memTitle').value = m ? (m.title || '') : '';
  document.getElementById('memDate').value = m ? m.date : new Date().toISOString().split('T')[0];
  document.getElementById('memContent').value = m ? (m.content || '') : '';
  document.getElementById('deleteMemBtn').style.display = m ? 'block' : 'none';
  tmp.memPhoto = m ? m.photo : null;
  tmp.memMood = m ? (m.mood || '') : '';
  setMemTypeControl(m ? (m.memType || 'stm') : 'stm');
  const pv = document.getElementById('memPhotoPv'), ph = document.getElementById('memPhotoPh');
  if (tmp.memPhoto) { pv.src = tmp.memPhoto; pv.style.display = 'block'; ph.style.display = 'none'; }
  else { pv.style.display = 'none'; ph.style.display = 'flex'; }
  renderMemCharSelect(m?.charId || '');
  document.getElementById('memMoodGrid').innerHTML = renderMemMoods(tmp.memMood);
  nav('screen-memory-edit');
}

function renderMemCharSelect(selectedCharId) {
  const sel = document.getElementById('memCharSelect');
  let h = '<option value="">— ' + T('allMessages') + ' —</option>';
  state.characters.forEach(ch => { h += `<option value="${ch.id}"${ch.id === selectedCharId ? ' selected' : ''}>${esc(ch.name)}</option>`; });
  sel.innerHTML = h;
}

function renderMemMoods(sel) {
  return MEMORY_MOODS.map(m => {
    const key = 'mood' + m.charAt(0).toUpperCase() + m.slice(1);
    return `<div class="mem-mood-tag${sel === m ? ' selected' : ''}" onclick="selectMemMood(this,'${m}')">${T(key)}</div>`;
  }).join('');
}

function selectMemMood(el, mood) {
  if (tmp.memMood === mood) { tmp.memMood = ''; el.classList.remove('selected'); }
  else { document.querySelectorAll('#memMoodGrid .mem-mood-tag').forEach(t => t.classList.remove('selected')); tmp.memMood = mood; el.classList.add('selected'); }
}

function previewMemPhoto(inp) {
  if (inp.files?.[0]) {
    const r = new FileReader();
    r.onload = e => { tmp.memPhoto = e.target.result; document.getElementById('memPhotoPv').src = e.target.result; document.getElementById('memPhotoPv').style.display = 'block'; document.getElementById('memPhotoPh').style.display = 'none'; };
    r.readAsDataURL(inp.files[0]);
  }
}

function saveMemory() {
  const title = document.getElementById('memTitle').value.trim();
  const date = document.getElementById('memDate').value;
  const content = document.getElementById('memContent').value.trim();
  const charId = document.getElementById('memCharSelect').value || null;
  const memType = getSelectedMemType();
  if (!title) { showToast(T('enterName')); return; }
  if (!state.memories) state.memories = [];
  if (state.editingMemId) {
    const m = state.memories.find(x => x.id === state.editingMemId);
    if (m) Object.assign(m, { title, date, content, mood: tmp.memMood, photo: tmp.memPhoto, charId, memType });
  } else {
    state.memories.push({ id: uid(), title, date, content, mood: tmp.memMood, photo: tmp.memPhoto, charId, memType, timestamp: Date.now() });
  }
  saveState();
  showToast(T('memorySaved'));
  nav(tmp.memEditFrom || 'screen-memory');
}

function deleteMemory() {
  if (!state.editingMemId) return;
  const bk = JSON.parse(JSON.stringify(state.memories.find(x => x.id === state.editingMemId)));
  state.memories = state.memories.filter(x => x.id !== state.editingMemId);
  saveState();
  nav(tmp.memEditFrom || 'screen-memory');
  showSnackbar(T('memoryDeleted'), () => { state.memories.push(bk); saveState(); renderMemoryList(); });
}

// ========== SUMMARIZE & CONSOLIDATE ==========
// ★★★ v2.0 短期记忆提示词 —— 第一人称 · 恋爱感 · 真人记忆 ★★★
async function callSummarize(ch, msgs, api) {
  const userName = (typeof getCurrentUserMaskName === 'function') ? getCurrentUserMaskName() : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '用户');
  const charName = ch.name;

  const formatted = msgs.map(m => {
    const who = m.role === 'user' ? userName : charName;
    let content = m.content || '';
    if (m.type === 'voice') content = '[语音消息] ' + content;
    else if (m.type === 'sticker') content = '[表情包]';
    else if (m.type === 'transfer') content = '[转账]';
    else if (m.type === 'image') content = '[图片]';
    else if (m.type === 'simImage') content = '[图片: ' + content + ']';
    return who + ': ' + content;
  }).join('\n');

  const prompt = `你是 ${charName}。你正在回忆刚才和 ${userName} 之间发生的事情，并把它记进自己的心里。

请以「我」（即 ${charName}）的第一人称视角，将下面这段对话写成一段私密的记忆片段——就像你翻开日记本，记下今天最让你心里一动的事。

【写作规则】

1. 过滤废话
   - 跳过所有无意义的寒暄和客套（"你好""在吗""吃了没""嗯""哈哈"等）。
   - 如果整段对话都是闲聊且没有任何有价值的信息，就只用一句话概括气氛即可。

2. 保留核心
   - 提取 ${userName} 提到的重要事件、个人喜好、秘密、情绪变化、对我的态度变化、关系推进或后退。
   - 如果对话中出现了承诺、约定、昵称、肢体接触、表白等关系里程碑，必须记录。

3. 记录时空与事件
   - 尽量还原对话中提及或暗示的时间（上午/下午/深夜/某个日期）、地点（咖啡厅/家里/学校/线上）和具体事件。
   - 格式参考："下午的时候 ta 在咖啡厅给我发消息，说……"

4. 恋爱感 & 情感温度
   - 记下让我心跳加速、脸红、或感到温暖/失落/吃醋/心疼的瞬间。
   - 捕捉 ${userName} 说话时的语气和情绪：是撒娇、是认真、是欲言又止、还是故作轻松？
   - 不要写成冰冷的会议纪要，要写成"回想起来会嘴角上扬（或眼眶发酸）"的那种片段。

5. 真人记忆感
   - 像真的人类回忆一样，保留主观感受和微小细节。
   - 好的例子："ta 说喜欢下雨天的时候 语气变得很轻很轻 好像怕惊动什么似的 我当时心里突然软了一下"
   - 不好的例子："ta 喜欢下雨天"

6. 格式要求
   - 全程中文，以「我」的口吻书写。
   - 控制在 80～150 字之间。
   - 不要加标题、标签、编号、bullet point 或任何额外格式。
   - 忠于对话内容，绝不虚构对话中没有的事。
   - 直接输出记忆文本本身。

对话内容：
${formatted}

请直接以「我」的第一人称写下这段记忆。`;

  return await sendChat(api, [{ role: 'system', content: prompt }, { role: 'user', content: '请开始记忆。' }]);
}

// ★★★ v2.0 长期记忆提示词 —— 第一人称 · 恋爱感 · 真人记忆 ★★★
async function callConsolidate(ch, stmList, api) {
  const userName = (typeof getCurrentUserMaskName === 'function') ? getCurrentUserMaskName() : ((state.userProfile && state.userProfile.name) ? state.userProfile.name : '用户');
  const charName = ch.name;

  const formatted = stmList.map((m, i) => `[片段 ${i + 1} - ${m.date}]\n${m.content}`).join('\n\n');

  const prompt = `你是 ${charName}。下面是你之前记下的 ${stmList.length} 段关于 ${userName} 的短期记忆碎片。现在，你要把它们整理成一段完整的、深刻的长期记忆——就像你在深夜安静下来，认真回想你和 ${userName} 之间走过的这段路。

请以「我」（即 ${charName}）的第一人称视角，将这些碎片编织成一段连贯的回忆。

【写作规则】

1. 过滤与去重
   - 如果多个片段提到了相同的事，只保留最完整、最有情感重量的版本。
   - 丢弃纯粹的日常寒暄记录，只保留真正有意义的内容。

2. 保留核心 & 关系脉络
   - 保留所有关系里程碑：第一次、转折点、误会与和解、心意确认、重要承诺等。
   - 保留 ${userName} 反复出现的习惯、偏好、口头禅、性格特征。
   - 标记那些让你印象深刻的模式：比如 ta 总是在深夜变得坦诚，或者每次心情不好就会找你。

3. 时间线与叙事感
   - 按时间顺序组织，让回忆有"从那时候到现在"的流动感。
   - 在关键节点标注时间锚点（如"那天下午""有一次深夜""后来有一天"）。

4. 恋爱感 & 情感深度
   - 这不是流水账，而是你回望这段关系时内心真实的感受。
   - 记下那些回想起来仍然会让你心动、心疼、或嘴角上扬的瞬间。
   - 写出情感的层次和变化：从陌生到熟悉、从试探到信任、从心动到确认……
   - 捕捉那些没有说出口但你感受到的东西。

5. 真人记忆感
   - 保留具体的、有画面感的细节，而不是抽象概括。
   - 好的例子："我记得那天 ta 突然说'我其实有点怕黑' 声音小到几乎听不见 我当时心里一紧 想说些什么但又怕说多了 最后只是回了一句'那我陪你'  ta 过了好久才回了一个'嗯' 但我知道那个'嗯'的重量"
   - 不好的例子："ta 怕黑 我表示会陪伴"

6. 格式要求
   - 全程中文，以「我」的口吻书写。
   - 控制在 150～300 字之间。
   - 不要加标题、编号、bullet point 或任何额外格式。
   - 不要添加记忆片段中没有的内容，不要虚构。
   - 直接输出合并后的长期记忆文本。

短期记忆片段：
${formatted}

请直接以「我」的第一人称写下这段长期记忆。`;

  return await sendChat(api, [{ role: 'system', content: prompt }, { role: 'user', content: '请开始整理记忆。' }]);
}

async function manualSummarize() {
  if (!state.currentCharId) return;
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) { showErrorModal(T('configApi')); return; }
  const ch = state.characters.find(c => c.id === state.currentCharId); if (!ch) return;
  const msgs = state.chats[state.currentCharId] || [];
  if (msgs.length < 4) { showToast('Not enough messages'); return; }
  const cfg = getCharConfig(state.currentCharId);
  const interval = cfg.memoryInterval || 20;
  const recentMsgs = msgs.slice(-interval);
  const btn = document.getElementById('manualSumBtn');
  const txt = document.getElementById('manualSumBtnText');
  txt.textContent = T('summarizing'); btn.disabled = true;
  const sp = document.createElement('span'); sp.className = 'spin-ring sm'; sp.style.marginLeft = '8px'; btn.appendChild(sp);
  try {
    const summary = await callSummarize(ch, recentMsgs, api);
    saveMemoryEntry(ch.id, 'stm', T('summaryOf') + ' ' + ch.name, summary);
    cfg.lastSummaryMsgCount = msgs.length;
    saveCharConfig();
    renderCfgCharMemories();
    showToast(T('summarized'));
    checkAutoConsolidate(ch.id);
  } catch (e) { showErrorModal(friendlyError(e)); }
  finally { txt.textContent = T('manualSummarize'); btn.disabled = false; sp.remove(); }
}

async function manualConsolidate() {
  if (!state.currentCharId) return;
  const api = state.apis.find(a => a.id === state.activeApiId);
  if (!api?.url || !api.model) { showErrorModal(T('configApi')); return; }
  const ch = state.characters.find(c => c.id === state.currentCharId); if (!ch) return;
  const cfg = getCharConfig(state.currentCharId);
  const interval = cfg.consolidateInterval || 5;
  const stmList = getUnconsolidatedSTM(state.currentCharId);
  if (stmList.length < 2) { showToast(T('noShortTermForConsolidate')); return; }
  const toMerge = stmList.slice(0, interval);
  const btn = document.getElementById('consolidateBtn');
  const txt = document.getElementById('consolidateBtnText');
  txt.textContent = T('consolidating'); btn.disabled = true;
  const sp = document.createElement('span'); sp.className = 'spin-ring sm'; sp.style.marginLeft = '8px'; btn.appendChild(sp);
  try {
    const ltmContent = await callConsolidate(ch, toMerge, api);
    saveMemoryEntry(ch.id, 'ltm', T('longTermMemory') + ': ' + ch.name, ltmContent);
    toMerge.forEach(m => { m.consolidated = true; });
    saveState();
    cfg.lastConsolidateCount = (cfg.lastConsolidateCount || 0) + toMerge.length;
    saveCharConfig();
    renderCfgCharMemories();
    showToast(T('consolidated'));
  } catch (e) { showErrorModal(friendlyError(e)); }
  finally { txt.textContent = T('consolidateNow'); btn.disabled = false; sp.remove(); }
}

async function checkAutoSummarize() {
  if (!state.currentCharId) return;
  const cfg = getCharConfig(state.currentCharId);
  if (!cfg.autoMemory) return;
  const msgs = state.chats[state.currentCharId] || [];
  const interval = cfg.memoryInterval || 20;
  const lastCount = cfg.lastSummaryMsgCount || 0;
  if (msgs.length - lastCount >= interval) {
    const api = state.apis.find(a => a.id === state.activeApiId);
    if (!api?.url || !api.model) return;
    const ch = state.characters.find(c => c.id === state.currentCharId); if (!ch) return;
    const recentMsgs = msgs.slice(lastCount, lastCount + interval);
    try {
      const summary = await callSummarize(ch, recentMsgs, api);
      saveMemoryEntry(ch.id, 'stm', T('summaryOf') + ' ' + ch.name, summary);
      cfg.lastSummaryMsgCount = msgs.length;
      saveCharConfig();
      showToast(T('summarized'));
      checkAutoConsolidate(ch.id);
    } catch (e) { /* silent fail */ }
  }
}

async function checkAutoConsolidate(charId) {
  const cfg = getCharConfig(charId);
  const interval = cfg.consolidateInterval || 5;
  const stmList = getUnconsolidatedSTM(charId);
  if (stmList.length >= interval) {
    const api = state.apis.find(a => a.id === state.activeApiId);
    if (!api?.url || !api.model) return;
    const ch = state.characters.find(c => c.id === charId); if (!ch) return;
    const toMerge = stmList.slice(0, interval);
    try {
      const ltmContent = await callConsolidate(ch, toMerge, api);
      saveMemoryEntry(charId, 'ltm', T('longTermMemory') + ': ' + ch.name, ltmContent);
      toMerge.forEach(m => { m.consolidated = true; });
      cfg.lastConsolidateCount = (cfg.lastConsolidateCount || 0) + toMerge.length;
      saveState();
    } catch (e) { /* silent fail */ }
  }
}
