// ========== char-import.js ==========
// 通用导入弹窗 — 角色 / 世界书
// 依赖（运行时）：sendChat (api.js), state (state.js), showToast (ui.js)

(function () {
  'use strict';

  var MAMMOTH_CDN = 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
  var MAX_FILE_SIZE = 1024 * 1024;   // 1 MB
  var MAX_TEXT_LEN  = 20000;         // 送给 AI 的文本上限

  var _ciFile = null;
  var _ciBusy = false;

  // ═══════════════════════════════════════
  //  通用入口
  // ═══════════════════════════════════════
  function _openImportModal(config) {
    var old = document.getElementById('ciImportModal');
    if (old) old.remove();

    _ciFile = null;
    _ciBusy = false;

    var isWb = config.mode === 'worldbook';

    var footerHtml;
    if (isWb) {
      footerHtml =
        '<button class="ci-btn ci-btn-ghost"     id="ciCancelBtn">取消</button>' +
        '<button class="ci-btn ci-btn-secondary" id="ciRawBtn"    disabled>直接导入</button>' +
        '<button class="ci-btn ci-btn-primary"   id="ciParseBtn"  disabled>解析</button>';
    } else {
      footerHtml =
        '<button class="ci-btn ci-btn-ghost"     id="ciCancelBtn">取消</button>' +
        '<button class="ci-btn ci-btn-secondary" id="ciParseBtn"    disabled>解析</button>' +
        '<button class="ci-btn ci-btn-primary"   id="ciCompleteBtn" disabled>解析并补全</button>';
    }

    var overlay = document.createElement('div');
    overlay.id = 'ciImportModal';
    overlay.className = 'ci-overlay';
    overlay.innerHTML =
      '<div class="ci-modal" role="dialog" aria-modal="true">' +
        '<div class="ci-modal-header">' +
          '<div class="ci-modal-title">' + config.title + '</div>' +
        '</div>' +

        '<div class="ci-modal-body">' +
          '<div class="ci-file-drop" id="ciFileDrop">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
              '<polyline points="17 8 12 3 7 8"/>' +
              '<line x1="12" y1="3" x2="12" y2="15"/>' +
            '</svg>' +
            '<div class="ci-file-drop-title">选择文件</div>' +
            '<div class="ci-file-drop-sub">支持 .txt 和 .docx</div>' +
          '</div>' +

          '<div class="ci-file-info" id="ciFileInfo" style="display:none">' +
            '<div class="ci-file-icon">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
                '<polyline points="14 2 14 8 20 8"/>' +
              '</svg>' +
            '</div>' +
            '<div class="ci-file-meta">' +
              '<div class="ci-file-name" id="ciFileName"></div>' +
              '<div class="ci-file-size" id="ciFileSize"></div>' +
            '</div>' +
            '<button class="ci-file-clear" id="ciFileClear" aria-label="清除">' +
              '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                '<path d="M3 3l8 8M11 3l-8 8"/>' +
              '</svg>' +
            '</button>' +
          '</div>' +

          '<div class="ci-status" id="ciStatus" style="display:none"></div>' +

          '<input type="file" id="ciFileInput" accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none">' +
        '</div>' +

        '<div class="ci-modal-footer">' + footerHtml + '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('active'); });

    _ciBindEvents(overlay, config);
  }

  function _ciBindEvents(overlay, config) {
    var isWb = config.mode === 'worldbook';

    var fileInput  = overlay.querySelector('#ciFileInput');
    var fileDrop   = overlay.querySelector('#ciFileDrop');
    var fileInfo   = overlay.querySelector('#ciFileInfo');
    var fileNameEl = overlay.querySelector('#ciFileName');
    var fileSizeEl = overlay.querySelector('#ciFileSize');
    var fileClear  = overlay.querySelector('#ciFileClear');
    var cancelBtn  = overlay.querySelector('#ciCancelBtn');
    var parseBtn   = overlay.querySelector('#ciParseBtn');
    var rawBtn     = overlay.querySelector('#ciRawBtn');
    var completeBtn= overlay.querySelector('#ciCompleteBtn');
    var statusEl   = overlay.querySelector('#ciStatus');

    function close() {
      if (_ciBusy) return;
      overlay.classList.remove('active');
      setTimeout(function () { overlay.remove(); }, 220);
    }

    function setStatus(msg, type) {
      if (!msg) { statusEl.style.display = 'none'; return; }
      statusEl.textContent = msg;
      statusEl.className = 'ci-status' + (type ? ' ci-status-' + type : '');
      statusEl.style.display = 'block';
    }

    // ★ 只控制「需要文件」的按钮，取消按钮永远启用
    function refreshButtons() {
      var hasFile = !!_ciFile;
      if (rawBtn)      rawBtn.disabled      = _ciBusy || !hasFile;
      if (parseBtn)    parseBtn.disabled    = _ciBusy || !hasFile;
      if (completeBtn) completeBtn.disabled = _ciBusy || !hasFile;
    }

    function setFile(f) {
      _ciFile = f || null;
      if (_ciFile) {
        fileDrop.style.display = 'none';
        fileInfo.style.display = 'flex';
        fileNameEl.textContent = _ciFile.name;
        fileSizeEl.textContent = _formatSize(_ciFile.size);
      } else {
        fileDrop.style.display = 'flex';
        fileInfo.style.display = 'none';
      }
      setStatus('');
      refreshButtons();
    }

    function setBusy(b) {
      _ciBusy = b;
      refreshButtons();
    }

    fileDrop.addEventListener('click', function () { fileInput.click(); });

    fileClear.addEventListener('click', function (e) {
      e.stopPropagation();
      fileInput.value = '';
      setFile(null);
    });

    fileInput.addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var lower = f.name.toLowerCase();
      if (lower.indexOf('.txt') === -1 && lower.indexOf('.docx') === -1) {
        setStatus('仅支持 .txt 或 .docx 文件', 'error');
        fileInput.value = '';
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setStatus('文件过大（最大 1 MB）', 'error');
        fileInput.value = '';
        return;
      }
      setFile(f);
    });

    cancelBtn.addEventListener('click', close);

    // ── 直接导入（仅 worldbook） ──
    if (rawBtn) {
      rawBtn.addEventListener('click', function () {
        if (!_ciFile) return;
        setBusy(true);
        setStatus('正在读取文件…');
        _readFile(_ciFile).then(function (text) {
          if (!text || !text.trim()) {
            setStatus('文件内容为空', 'error');
            setBusy(false);
            return;
          }
          config.onRawImport(text);
          setStatus('已导入', 'success');
          setTimeout(function () {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 220);
            if (typeof showToast === 'function') showToast('已导入内容');
          }, 350);
        }).catch(function (err) {
          setStatus((err && err.message) || String(err), 'error');
          setBusy(false);
        });
      });
    }

    // ── 解析 ──
    if (parseBtn) {
      parseBtn.addEventListener('click', function () {
        if (!_ciFile) return;
        if (isWb) {
          _showSubmenu(function (complete) {
            _ciRunParse(overlay, config, complete, setStatus, setBusy);
          });
        } else {
          _ciRunParse(overlay, config, false, setStatus, setBusy);
        }
      });
    }

    // ── 解析并补全（仅 character） ──
    if (completeBtn) {
      completeBtn.addEventListener('click', function () {
        if (!_ciFile) return;
        _ciRunParse(overlay, config, true, setStatus, setBusy);
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // ★ ESC 关闭
    function escHandler(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (document.body.contains(overlay)) close();
        document.removeEventListener('keydown', escHandler);
      }
    }
    document.addEventListener('keydown', escHandler);
  }

  // ──────────────────────────────────────
  //  二级菜单：仅解析 / 解析并补全 / 返回
  // ──────────────────────────────────────
  function _showSubmenu(onChoose) {
    var old = document.getElementById('ciSubmenu');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.id = 'ciSubmenu';
    wrap.className = 'ci-submenu-overlay';
    wrap.innerHTML =
      '<div class="ci-submenu">' +
        '<div class="ci-submenu-title">解析方式</div>' +
        '<button class="ci-submenu-item" data-mode="parse">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>' +
          '</svg>' +
          '<div class="ci-submenu-item-text">' +
            '<div class="ci-submenu-item-title">仅解析</div>' +
            '<div class="ci-submenu-item-sub">只提取文档中已有信息</div>' +
          '</div>' +
        '</button>' +
        '<button class="ci-submenu-item" data-mode="complete">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 3l2.1 4.9L19 9l-4.9 2.1L12 16l-2.1-4.9L5 9l4.9-2.1z"/>' +
            '<path d="M18 15l1 2.3L21 18l-2 1-1 2.3L17 19l-2-1 2-1z"/>' +
          '</svg>' +
          '<div class="ci-submenu-item-text">' +
            '<div class="ci-submenu-item-title">解析并补全</div>' +
            '<div class="ci-submenu-item-sub">提取并适当补充空缺内容</div>' +
          '</div>' +
        '</button>' +
        '<button class="ci-submenu-cancel" data-mode="cancel">返回</button>' +
      '</div>';

    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('active'); });

    function close() {
      wrap.classList.remove('active');
      setTimeout(function () { wrap.remove(); }, 200);
    }

    wrap.querySelectorAll('.ci-submenu-item, .ci-submenu-cancel').forEach(function (el) {
      el.addEventListener('click', function () {
        var mode = el.getAttribute('data-mode');
        close();
        if (mode === 'parse')    onChoose(false);
        if (mode === 'complete') onChoose(true);
      });
    });

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) close();
    });
  }

  // ──────────────────────────────────────
  //  读取文件（txt / docx）
  // ──────────────────────────────────────
  function _readFile(file) {
    return new Promise(function (resolve, reject) {
      var lower = file.name.toLowerCase();
      if (lower.indexOf('.txt') > -1) {
        var r = new FileReader();
        r.onload  = function (e) { resolve(e.target.result || ''); };
        r.onerror = function () { reject(new Error('文件读取失败')); };
        r.readAsText(file, 'UTF-8');
      } else if (lower.indexOf('.docx') > -1) {
        _loadMammoth().then(function (mammoth) {
          var r = new FileReader();
          r.onload = function (e) {
            mammoth.extractRawText({ arrayBuffer: e.target.result })
              .then(function (result) { resolve(result.value || ''); })
              .catch(function (err) { reject(new Error('DOCX 解析失败：' + (err.message || err))); });
          };
          r.onerror = function () { reject(new Error('文件读取失败')); };
          r.readAsArrayBuffer(file);
        }).catch(reject);
      } else {
        reject(new Error('不支持的文件类型'));
      }
    });
  }

  function _loadMammoth() {
    if (window.mammoth && window.mammoth.extractRawText) return Promise.resolve(window.mammoth);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = MAMMOTH_CDN;
      s.onload = function () {
        if (window.mammoth) resolve(window.mammoth);
        else reject(new Error('mammoth 加载失败'));
      };
      s.onerror = function () { reject(new Error('mammoth 加载失败（请检查网络）')); };
      document.head.appendChild(s);
    });
  }

  // ──────────────────────────────────────
  //  解析流程
  // ──────────────────────────────────────
  function _ciRunParse(overlay, config, complete, setStatus, setBusy) {
    if (!_ciFile) return;

    var api = (state && state.apis || []).filter(function (a) { return a.id === state.activeApiId; })[0];
    if (!api || !api.url || !api.model) {
      setStatus('请先在设置中配置 API', 'error');
      return;
    }

    setBusy(true);
    setStatus('正在读取文件…');

    _readFile(_ciFile).then(function (text) {
      if (!text || !text.trim()) {
        setStatus('文件内容为空', 'error');
        setBusy(false);
        return;
      }
      if (text.length > MAX_TEXT_LEN) {
        text = text.slice(0, MAX_TEXT_LEN) + '\n\n[内容过长，已截断]';
      }

      setStatus(complete ? '正在解析并补全…' : '正在解析…');

      var sysPrompt = config.getSystemPrompt(complete);

      return sendChat(api, [
        { role: 'system', content: sysPrompt },
        { role: 'user',   content: '以下是文档内容：\n\n' + text }
      ]).then(function (reply) {
        var data = _parseAIJson(reply, config);
        config.onParsed(data);

        setStatus('解析完成', 'success');
        setBusy(false);
        setTimeout(function () {
          overlay.classList.remove('active');
          setTimeout(function () { overlay.remove(); }, 220);
          if (typeof showToast === 'function') showToast('已导入内容');
        }, 350);
      });
    }).catch(function (err) {
      setStatus((err && err.message) || String(err), 'error');
      setBusy(false);
    });
  }

  function _parseAIJson(reply) {
    var jsonStr = (reply || '').trim();

    var fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    var start = jsonStr.indexOf('{');
    var end   = jsonStr.lastIndexOf('}');
    if (start < 0 || end < 0 || end <= start) {
      throw new Error('AI 返回内容无法识别为 JSON');
    }
    jsonStr = jsonStr.slice(start, end + 1);

    var data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.error('[import] JSON parse failed:', e, '\nRaw:', reply);
      throw new Error('AI 返回的 JSON 格式有误');
    }

    return data;
  }

  // ──────────────────────────────────────
  //  角色导入
  // ──────────────────────────────────────
  function openCharImportModal() {
    _openImportModal({
      mode: 'character',
      title: '导入角色',
      getSystemPrompt: function (complete) {
        if (complete) {
          return (
            '你是角色设定助手。用户会给你一份自由格式的文档，里面可能包含一个角色的部分信息（也可能很杂乱）。\n' +
            '请仔细阅读，提取出角色信息，并在信息缺失时**适当补充**，让角色人设更丰满、更有可玩性。\n\n' +
            '**补全原则**：\n' +
            '- 不要凭空添加完全无关的内容\n' +
            '- 在原文提到的基础上去扩展\n' +
            '- 保持角色性格一致，不要自相矛盾\n' +
            '- 如果原文信息已经很完整，就不要画蛇添足\n\n' +
            '**必须严格返回一个 JSON 对象，不要 markdown 代码块，不要任何解释**：\n' +
            '{\n' +
            '  "name": "角色名称（简洁，通常 2-6 个字或英文名）",\n' +
            '  "notes": "简短备注，比如别名、身份标签（没有就留空字符串）",\n' +
            '  "systemPrompt": "整理后的完整角色设定（身份、性格、外貌、背景、说话风格等）"\n' +
            '}'
          );
        }
        return (
          '你是角色设定提取助手。用户会给你一份自由格式的文档。\n' +
          '请**只提取文档中明确提到的信息**，不要自行补充或创作。\n\n' +
          '**必须严格返回一个 JSON 对象，不要 markdown 代码块，不要任何解释**：\n' +
          '{\n' +
          '  "name": "角色名称（如果文档中没有明确写出名字就留空字符串）",\n' +
          '  "notes": "简短备注（如果文档中没有明确提到就留空字符串）",\n' +
          '  "systemPrompt": "从文档中整理出的角色设定（保留原文信息，不要添加原文没有的内容）"\n' +
          '}'
        );
      },
      onParsed: function (data) {
        var nameEl   = document.getElementById('charName');
        var notesEl  = document.getElementById('charNotes');
        var promptEl = document.getElementById('charPromptArea');

        if (nameEl   && data.name)         nameEl.value   = String(data.name).trim();
        if (notesEl  && data.notes)        notesEl.value  = String(data.notes).trim();
        if (promptEl && data.systemPrompt) promptEl.value = String(data.systemPrompt).trim();
      }
    });
  }

  // ──────────────────────────────────────
  //  世界书导入
  // ──────────────────────────────────────
  function openWbImportModal() {
    _openImportModal({
      mode: 'worldbook',
      title: '导入世界书',

      onRawImport: function (text) {
        var contentEl = document.getElementById('wbContentArea');
        if (contentEl) contentEl.value = text.trim();
      },

      getSystemPrompt: function (complete) {
        var head;
        if (complete) {
          head =
            '你是世界书设定助手。用户会给你一份自由格式的文档，里面可能包含一个虚构世界/设定的部分信息（也可能很杂乱）。\n' +
            '请仔细阅读，提取出世界设定信息，并在信息缺失时**适当补充**，让世界观更完整、更自洽。\n\n' +
            '**补全原则**：\n' +
            '- 不要凭空添加完全无关的内容\n' +
            '- 在原文提到的基础上去扩展\n' +
            '- 保持设定一致性，不要自相矛盾\n' +
            '- 如果原文信息已经很完整，就不要画蛇添足\n\n';
        } else {
          head =
            '你是世界书设定提取助手。用户会给你一份自由格式的文档。\n' +
            '请**只提取文档中明确提到的信息**，不要自行补充或创作。\n\n';
        }

        return head +
          '**结构说明**：\n' +
          '- "content" 字段：整体世界观/背景设定（时代、地理、社会、势力、规则等大范围描述）\n' +
          '- "entries" 字段：具体的关键词条目（比如某个地点、角色、物品、概念），每条含 keyword（触发关键词）和 content（该条目的详细内容）\n' +
          '- 如果文档中没有明确区分"整体背景"和"具体条目"，请你自己判断：适合作为大范围背景的进 content，具体可拆分为关键词的进 entries\n\n' +
          '**必须严格返回一个 JSON 对象，不要 markdown 代码块，不要任何解释**：\n' +
          '{\n' +
          '  "name": "世界书名（如果文档中没有明确名称就留空字符串）",\n' +
          '  "content": "整体背景设定正文",\n' +
          '  "entries": [\n' +
          '    { "keyword": "关键词", "content": "条目内容" }\n' +
          '  ]\n' +
          '}';
      },

      onParsed: function (data) {
        var nameEl = document.getElementById('wbName');
        if (nameEl && data.name) nameEl.value = String(data.name).trim();

        var contentEl = document.getElementById('wbContentArea');
        if (contentEl && data.content) contentEl.value = String(data.content).trim();

        if (Array.isArray(data.entries)) {
          tmp.wbEntries = data.entries.map(function (e) {
            return {
              id: uid(),
              keyword: String((e && e.keyword) || '').trim(),
              content: String((e && e.content) || '').trim()
            };
          }).filter(function (e) { return e.keyword || e.content; });

          if (typeof renderWbEntries === 'function') renderWbEntries();
        }
      }
    });
  }

  // ──────────────────────────────────────
  //  工具
  // ──────────────────────────────────────
  function _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  window.openCharImportModal = openCharImportModal;
  window.openWbImportModal   = openWbImportModal;
})();