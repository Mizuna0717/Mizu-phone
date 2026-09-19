// ==========================================================
//  PHONE SOCIAL APP
//  模块 3：骰子 + AI 一次性生成
// ==========================================================

;(function() {
  'use strict';

  // ══════════════════════════════════════════════
  //  1. 从 messageChats 拉联系人
  // ══════════════════════════════════════════════
  function _psocPullContacts(ownerCharId) {
    if (!ownerCharId || !Array.isArray(state.messageChats)) return [];
    var map = {};
    state.messageChats.forEach(function(c) {
      if (!c || c.isUser) return;
      if (c.ownerCharId !== ownerCharId) return;
      var name = (c.npcName || '').trim();
      if (!name) return;
      var key = name.toLowerCase();
      if (map[key]) { map[key].msgCount += (c.messages || []).length; return; }
      map[key] = {
        name: name,
        nickname: c.displayName || '',
        msgCount: (c.messages || []).length
      };
    });
    return Object.keys(map).map(function(k) {
      var c = map[k];
      var fam;
      if (c.msgCount >= 12) fam = 'close';
      else if (c.msgCount >= 8) fam = 'friend';
      else if (c.msgCount >= 5) fam = 'acquaintance';
      else fam = 'stranger';
      return { name: c.name, nickname: c.nickname, familiarity: fam };
    });
  }

  // ══════════════════════════════════════════════
  //  2. 时间格式化
  // ══════════════════════════════════════════════
  function _psocFormatTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    var min = 60000, hour = 3600000, day = 86400000;
    if (diff < min) return 'now';
    if (diff < hour) return Math.floor(diff/min) + 'm';
    if (diff < day) return Math.floor(diff/hour) + 'h';
    if (diff < 7 * day) return Math.floor(diff/day) + 'd';
    if (diff < 30 * day) return Math.floor(diff/(7*day)) + 'w';
    return (d.getMonth()+1) + '/' + d.getDate();
  }

  // ══════════════════════════════════════════════
  //  3. HTML 转义
  // ══════════════════════════════════════════════
  function _psocEscape(s) {
    if (typeof esc === 'function') return esc(s);
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ══════════════════════════════════════════════
  //  4. 头像颜色
  // ══════════════════════════════════════════════
  function _psocAvatarColor(name) {
    var palette = ['#4a4f5a','#5a4a5a','#4a5a55','#5a554a','#5a4a4f','#4a5a4a','#4a4a5a','#55555a'];
    var sum = 0;
    name = String(name || '?');
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return palette[sum % palette.length];
  }

  // ══════════════════════════════════════════════
  //  5. SVG 图标
  // ══════════════════════════════════════════════
  var _psocIconHeart = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M10 17S3 13 3 8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 5-7 9-7 9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  var _psocIconHeartFilled = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M10 17S3 13 3 8a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 5-7 9-7 9z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  var _psocIconComment = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 3v-3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  var _psocIconImage = '<svg viewBox="0 0 32 32" width="36" height="36" fill="none"><rect x="3" y="5" width="26" height="22" rx="3" stroke="currentColor" stroke-width="1.4"/><path d="M3 20l7-6 4 3 5-5 10 8" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="22" cy="11" r="2" stroke="currentColor" stroke-width="1.4"/></svg>';

  // ══════════════════════════════════════════════
  //  6. 单条帖子 HTML
  // ══════════════════════════════════════════════
  function _psocBuildPostHTML(post) {
    var avatarColor = _psocAvatarColor(post.author);
    var initial = String(post.author || '?').trim().charAt(0).toUpperCase();

    var h = '<div class="psoc-post" data-post-id="' + _psocEscape(post.id) + '" ' +
            'onclick="openPostDetail(\'' + _psocEscape(post.id) + '\')" ' +
            'style="cursor:pointer;-webkit-tap-highlight-color:transparent">';

    h += '<div class="psoc-header">';
    h += '<div class="psoc-avatar" style="background:' + avatarColor + '">' + _psocEscape(initial) + '</div>';
    h += '<div class="psoc-author">';
    h += '<div class="psoc-author-name">' + _psocEscape(post.author) + '</div>';
    h += '<div class="psoc-author-handle">' + _psocEscape(post.authorHandle) + '</div>';
    h += '</div>';
    h += '<div class="psoc-time">' + _psocFormatTime(post.timestamp) + '</div>';
    h += '</div>';

    h += '<div class="psoc-text">' + _psocEscape(post.text) + '</div>';

    if (post.hasImage) {
      h += '<div class="psoc-image" ' +
           'onclick="event.stopPropagation();psocToggleImage(this);" ' +
           'data-has-desc="' + (post.imageDescription ? '1' : '0') + '">';
      h += '<div class="psoc-image-svg">' + _psocIconImage + '</div>';
      if (post.imageDescription) {
        h += '<div class="psoc-image-desc">' + _psocEscape(post.imageDescription) + '</div>';
      }
      h += '</div>';
    }

    h += '<div class="psoc-actions">';
    var heartIcon = (post.ownerReaction && post.ownerReaction.type === 'liked')
      ? _psocIconHeartFilled : _psocIconHeart;
    var heartCls = (post.ownerReaction && post.ownerReaction.type === 'liked')
      ? ' psoc-action-liked' : '';
    h += '<div class="psoc-action' + heartCls + '">' + heartIcon + '<span>' + (post.likes || 0) + '</span></div>';
    h += '<div class="psoc-action">' + _psocIconComment + '<span>' + (post.commentsCount || 0) + '</span></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  // ══════════════════════════════════════════════
  //  7. 列表 HTML
  // ══════════════════════════════════════════════
  function _psocBuildListHTML(ownerCharId) {
    var posts = (state.socialData || []).filter(function(p){
      return p && p.ownerCharId === ownerCharId;
    }).sort(function(a, b){ return b.timestamp - a.timestamp; });

    if (posts.length === 0) {
      return '<div style="padding:60px 20px;text-align:center">' +
        '<svg viewBox="0 0 48 48" width="56" height="56" stroke="rgba(255,255,255,.3)" fill="none" stroke-width="1.2" style="margin-bottom:12px">' +
          '<circle cx="16" cy="14" r="4"/><circle cx="36" cy="14" r="4"/><circle cx="16" cy="34" r="4"/><circle cx="36" cy="34" r="4"/>' +
          '<path d="M20 14h12M16 18v12M32 18v12M20 34h12"/>' +
        '</svg>' +
        '<div style="color:rgba(255,255,255,.5);font-size:15px">No posts yet</div>' +
        '<div style="color:rgba(255,255,255,.3);font-size:13px;margin-top:6px">Tap the dice icon to generate</div>' +
      '</div>';
    }

    var h = '';
    posts.forEach(function(p) {
      h += _psocBuildPostHTML(p);
    });
    return h;
  }

  // ══════════════════════════════════════════════
  //  8. 骰子按钮
  // ══════════════════════════════════════════════
  function _psocInjectDiceBtn() {
    var hr = document.querySelector('#phoneAppPage .papp-header-right');
    if (!hr) return;
    hr.innerHTML =
      '<button class="pmsg-dice-btn" onclick="rollSocialData()" title="Generate Posts">' +
        '<svg viewBox="0 0 20 20" width="20" height="20" stroke="#0a84ff" fill="none" ' +
        'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="2.5" y="2.5" width="15" height="15" rx="2.5"/>' +
          '<circle cx="7" cy="7" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="10" cy="10" r="1.3" fill="#0a84ff" stroke="none"/>' +
          '<circle cx="13" cy="13" r="1.3" fill="#0a84ff" stroke="none"/>' +
        '</svg>' +
      '</button>';
  }

  // ══════════════════════════════════════════════
  //  9. 主渲染
  // ══════════════════════════════════════════════
  function _psocPageRenderer(charName) {
    setTimeout(_psocInjectDiceBtn, 0);
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    return _psocBuildListHTML(ownerCharId);
  }

    // ══════════════════════════════════════════════
  //  9.5 详情页（模块 4）
  // ══════════════════════════════════════════════

  function _psocFindById(postId) {
    var arr = state.socialData || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === postId) return arr[i];
    }
    return null;
  }

  function _psocFormatFullTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    var time = ('' + d.getHours()).padStart(2,'0') + ':' + ('' + d.getMinutes()).padStart(2,'0');
    if (diff < 86400000) return 'Today ' + time;
    if (diff < 172800000) return 'Yesterday ' + time;
    return months[d.getMonth()] + ' ' + d.getDate() + ' ' + time;
  }

  function _psocBuildDetailHTML(post) {
    var avatarColor = _psocAvatarColor(post.author);
    var initial = String(post.author || '?').trim().charAt(0).toUpperCase();

    var h = '<div class="psoc-detail-page">';

    // ── 顶栏 ──
    h += '<div class="psoc-detail-header">' +
      '<button class="psoc-detail-back" onclick="backToSocialList()">' +
        '<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><path d="M12 4l-6 6 6 6" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="psoc-detail-title">Post</div>' +
      '<div class="psoc-detail-header-right"></div>' +
    '</div>';

    // ── 可滚动内容 ──
    h += '<div class="psoc-detail-scroll">';

    // 作者区
    h += '<div class="psoc-detail-author">';
    h += '<div class="psoc-detail-avatar" style="background:' + avatarColor + '">' + _psocEscape(initial) + '</div>';
    h += '<div class="psoc-detail-author-info">';
    h += '<div class="psoc-detail-author-name">' + _psocEscape(post.author) + '</div>';
    if (post.authorHandle) {
      h += '<div class="psoc-detail-author-handle">' + _psocEscape(post.authorHandle) + '</div>';
    }
    h += '</div>';
    h += '<div class="psoc-detail-time">' + _psocFormatFullTime(post.timestamp) + '</div>';
    h += '</div>';

    // 正文
    h += '<div class="psoc-detail-text">' + _psocEscape(post.text) + '</div>';

    // 图片
    if (post.hasImage) {
      h += '<div class="psoc-detail-image" ' +
           'onclick="event.stopPropagation();psocToggleImage(this);" ' +
           'data-post-id="' + _psocEscape(post.id) + '">';
      h += '<div class="psoc-image-svg">' + _psocIconImage + '</div>';
      if (post.imageDescription) {
        h += '<div class="psoc-image-desc">' + _psocEscape(post.imageDescription) + '</div>';
      }
      h += '</div>';
    }

    // 互动栏
    h += '<div class="psoc-detail-actions">';
    var heartIcon = (post.ownerReaction && post.ownerReaction.type === 'liked')
      ? _psocIconHeartFilled : _psocIconHeart;
    var heartCls = (post.ownerReaction && post.ownerReaction.type === 'liked')
      ? ' psoc-action-liked' : '';
    h += '<div class="psoc-action' + heartCls + '">' + heartIcon + '<span>' + (post.likes || 0) + '</span></div>';
    h += '<div class="psoc-action">' + _psocIconComment + '<span>' + (post.commentsCount || 0) + '</span></div>';
    h += '</div>';

    // ── 评论区 ──
    if (post.comments && post.comments.length > 0) {
      h += '<div class="psoc-comments-section">';
      h += '<div class="psoc-comments-header">评论 (' + post.comments.length + ')</div>';
      post.comments.forEach(function(c) {
        var cAvatarColor = _psocAvatarColor(c.author);
        var cInitial = String(c.author || '?').trim().charAt(0).toUpperCase();
        var ownerCls = c.isOwnerReply ? ' psoc-comment-owner-reply' : '';
        h += '<div class="psoc-comment' + ownerCls + '">';
        h += '<div class="psoc-comment-avatar" style="background:' + cAvatarColor + '">' + _psocEscape(cInitial) + '</div>';
        h += '<div class="psoc-comment-body">';
        h += '<div class="psoc-comment-meta">';
        h += '<span class="psoc-comment-author">' + _psocEscape(c.author) + '</span>';
        if (c.authorHandle) {
          h += '<span class="psoc-comment-handle">' + _psocEscape(c.authorHandle) + '</span>';
        }
        if (c.isOwnerReply) {
          h += '<span class="psoc-comment-owner-badge">作者</span>';
        }
        h += '</div>';
        h += '<div class="psoc-comment-text">' + _psocEscape(c.text) + '</div>';
        h += '</div>';
        h += '</div>';
      });
    }

    // ── 角色反应区 ──
    if (post.ownerReaction) {
      var r = post.ownerReaction;
      h += '<div class="psoc-reaction-section">';

      // 反应标记
      var tagLabel = '';
      var tagCls = '';
      if (r.type === 'liked') { tagLabel = '已点赞'; tagCls = 'psoc-tag-liked'; }
      else if (r.type === 'commented') { tagLabel = '已评论'; tagCls = 'psoc-tag-commented'; }
      else if (r.type === 'saw') { tagLabel = '已看过'; tagCls = 'psoc-tag-saw'; }
      else if (r.type === 'ignored') { tagLabel = '已忽略'; tagCls = 'psoc-tag-ignored'; }

      if (tagLabel) {
        h += '<div class="psoc-reaction-tag ' + tagCls + '">' + tagLabel + '</div>';
      }

      // 角色自己的评论
      if (r.type === 'commented' && r.commentText) {
        h += '<div class="psoc-owner-comment-card">';
        h += '<div class="psoc-owner-comment-header">角色的评论</div>';
        h += '<div class="psoc-owner-comment-body">' + _psocEscape(r.commentText) + '</div>';
        h += '</div>';
      }

      // 想法
      if (r.thoughts) {
        h += '<div class="psoc-thoughts-block">';
        h += '<div class="psoc-thoughts-label">内心想法</div>';
        h += '<div class="psoc-thoughts-text">' + _psocEscape(r.thoughts) + '</div>';
        h += '</div>';
      }

      h += '</div>';
    }

    h += '</div>'; // /scroll
    h += '</div>'; // /detail-page

    return h;
  }

  window.openPostDetail = function(postId) {
    var post = _psocFindById(postId);
    if (!post) { showToast('Post not found'); return; }

    var pageEl = document.getElementById('phoneAppPage');
    if (!pageEl) return;

    pageEl.innerHTML = _psocBuildDetailHTML(post);
    pageEl.scrollTop = 0;

    var scrollEl = pageEl.querySelector('.psoc-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;

    console.log('[openPostDetail]', post.author, '| likes:', post.likes);
  };

  window.backToSocialList = function() {
    if (typeof openPhoneApp === 'function') openPhoneApp('social');
  };

    // 点击图片切换 SVG ↔ 文字描述
  window.psocToggleImage = function(el) {
    if (!el) return;
    el.classList.toggle('psoc-image-show-desc');
  };


  // ══════════════════════════════════════════════
  //  10. Prompt 构建
  // ══════════════════════════════════════════════
    function _psocBuildPrompt(ownerInfo, contacts, historyBlock, worldbookBlk) {
    var ownerName = ownerInfo.name;
    var ownerBlock = ownerInfo.block;

    var contactsText = contacts.length > 0
      ? contacts.map(function(c, i){
          var nick = (c.nickname && c.nickname !== c.name) ? ' (备注: ' + c.nickname + ')' : '';
          return (i + 1) + '. ' + c.name + nick + ' [familiarity: ' + c.familiarity + ']';
        }).join('\n')
      : '(none — invent plausible personal contacts too)';

    var prompt =
      'You are generating a realistic social media FEED for a fictional phone owner.\n' +
      'The phone owner is "' + ownerName + '".\n\n' +

      '=== PHONE OWNER ===\n' + ownerBlock + '\n' +

      (worldbookBlk ? '=== WORLD SETTING ===\n' + worldbookBlk + '\n\n' : '') +

      historyBlock +

      '=== CONTACTS (from their Messages app) ===\n' +
      contactsText + '\n\n' +

            '=== STEP 1: PERSONA ANALYSIS (do this silently first) ===\n' +
      'Before generating ANY content, analyze the phone owner\'s persona above and determine:\n' +
      '  - Age / gender / occupation / social status\n' +
      '  - Interests / hobbies / values / aesthetic\n' +
      '  - Speech style (casual / formal / poetic / blunt / playful / melancholic / etc.)\n' +
      '  - Emotional register (warm / cold / aloof / dramatic / understated)\n' +
      '  - Cultural background / language(s) / era\n' +
      '  - What content they would FOLLOW, LIKE, or INTERACT with\n' +
      '  - What they themselves would WRITE when posting\n' +
      '  - Which brands / news sources / personalities fit their world\n' +
      '  - Which brands / accounts are OUT OF THEIR WORLD\n\n' +

      '=== STEP 2: FEED WORLD-BUILDING (CRITICAL) ===\n' +
      'The ENTIRE feed reflects the owner\'s perspective — every post is something\n' +
      'the owner would actually SEE in their feed, because they follow that account,\n' +
      'or it matches their interests / demographics / culture.\n\n' +
      'STRICT RULES:\n' +
      '  ✗ A 60-year-old Japanese traditional businessman\'s feed does NOT contain\n' +
      '    K-pop idol posts or TikTok dance trends.\n' +
      '  ✗ A young Korean fashion student\'s feed does NOT contain Nikkei financial news.\n' +
      '  ✗ A Russian poet\'s feed does NOT contain Chinese e-commerce ads (unless they live there).\n' +
      '  ✗ A shy bookworm\'s feed does NOT contain wild party / club photos.\n\n' +
      '  ✓ Public accounts / brands / news MUST fit the owner\'s: culture, era, language,\n' +
      '    social class, occupation, and interests.\n' +
      '  ✓ Posts by contacts MUST reflect what those specific people would plausibly post.\n\n' +

      '=== STEP 3: OWNER\'S OWN POSTS (isSelf: true) — VOICE FIDELITY ===\n' +
      'When the owner posts themselves, the text MUST reflect:\n' +
      '  - Their EXACT vocabulary and speech style from the persona\n' +
      '  - Topics they genuinely care about (from interests / background)\n' +
      '  - Their emotional register matching personality\n' +
      '  - Their aesthetic (minimal / flowery / ironic / raw / etc.)\n\n' +
      'Examples of voice differentiation:\n' +
      '  - Cold / aloof → short, detached, no emoji, no exclamation\n' +
      '  - Warm / outgoing → longer, casual, emojis, exclamations\n' +
      '  - Poetic → imagery, metaphors, sensory language\n' +
      '  - Blunt → direct statements, no filler\n' +
      '  - Formal / aristocratic → polished, restrained, dignified\n' +
      '  - Youthful / trendy → slang, memes, abbreviations\n\n' +
      'NEVER write generic filler that could belong to ANYONE.\n' +
      'The owner\'s own posts must be RECOGNIZABLE as written by THIS character.\n\n' +

      '=== TASK ===\n' +
      'Generate a complete social feed WITH posts, comments, replies, AND owner reactions.\n\n' +

      '=== CRITICAL RULE — CONTENT BOUNDARY ===\n' +
      'These are PUBLIC social media posts. They are NOT private messages.\n' +
      'The owner may share LIFE (hobbies, opinions, food, travel, moods) but MUST NOT\n' +
      'reveal PRIVATE life details (romantic feelings toward a specific person,\n' +
      'intimate moments, secrets, personal struggles, relationships issues).\n\n' +
      'GOOD examples:\n' +
      '  - "Coffee at my favorite café. Perfect morning."\n' +
      '  - "Just landed in Tokyo. The city never gets old."\n' +
      '  - "New album on repeat all week."\n\n' +
      'BAD examples (DO NOT WRITE):\n' +
      '  - "Waiting for you. I\'m coming to you." (too intimate)\n' +
      '  - "Can\'t stop thinking about her." (private feelings)\n' +
      '  - "I miss you so much." (romantic / personal)\n\n' +
      'The tone should be what a person is COMFORTABLE SHARING publicly.\n\n' +

      '=== TOTAL POSTS ===\n' +
      '  10-15 posts total.\n\n' +

      '=== AUTHOR DISTRIBUTION ===\n' +
      'STEP 1 — Determine if the phone owner is a PUBLIC FIGURE\n' +
      '  (celebrity / idol / influencer / politician / frequently posts / has fans).\n' +
      'STEP 2 — Distribute:\n' +
      '  IF PUBLIC FIGURE:\n' +
      '    - 30-40% posts BY the phone owner\n' +
      '    - 20-30% posts BY contacts\n' +
      '    - 30-40% posts BY public accounts / brands / strangers\n' +
      '  IF ORDINARY:\n' +
      '    - 20-25% posts BY the phone owner\n' +
      '    - 30-40% posts BY contacts\n' +
      '    - 35-45% posts BY public accounts / strangers\n\n' +

      '=== PER POST ===\n' +
      '  - "author"        : display name\n' +
      '  - "authorHandle"  : @handle (plausible)\n' +
      '  - "isSelf"        : true if owner\'s own post\n' +
      '  - "isPublic"      : true if brand / news / celebrity / stranger\n' +
      '  - "hoursAgo"      : MUST cover all 4 time buckets:\n' +
      '                        * at least 2 posts: 0.1 ~ 3 hours ago\n' +
      '                        * at least 2 posts: 3 ~ 24 hours ago\n' +
      '                        * at least 2 posts: 24 ~ 168 hours ago\n' +
      '                        * at least 2 posts: 168 ~ 1440 hours ago\n' +
      '  - "text"          : post body (30-200 chars), PUBLIC tone\n' +
      '  - "hasImage"      : true for EXACTLY 35-45% of posts (not more)\n' +
      '  - "imageDescription" : if hasImage, describe image (20-80 chars)\n' +
      '  - "likes"         : 10-500 (ordinary self) / 500-50000 (public figure self)\n' +
      '                      / 20-300 (contacts) / 500-50000 (public accounts)\n' +
      '  - "comments"      : array (see below)\n' +
      '  - "ownerReaction" : object (see below)\n\n' +

      '=== COMMENTS (IMPORTANT — must be RICH) ===\n' +
      'Total comments across ALL posts MUST be at least 1.5x the number of posts.\n' +
      'e.g., if 12 posts → at least 18 comments total.\n' +
      'At least 70% of posts MUST have 2 or more comments.\n' +
      'Popular posts (public accounts) can have 5-10 comments.\n\n' +

      'Each comment:\n' +
      '  - "author"       : commenter name\n' +
      '  - "authorHandle" : @handle\n' +
      '  - "text"         : comment body (5-80 chars)\n' +
      '  - "language"     : ISO code\n' +
      '  - "isOwnerReply" : true ONLY IF this comment is the phone owner\'s reply\n' +
      '                     to someone else\'s comment ON THE OWNER\'S OWN POST\n\n' +

      '=== OWNER REPLIES (NEW) ===\n' +
      'If a post is by the phone owner themselves (isSelf: true), the owner may\n' +
      'reply to 0-2 of the comments under it, matching their personality:\n' +
      '  - Warm/outgoing owner → more replies, longer\n' +
      '  - Cold/aloof owner → fewer replies, shorter or none\n' +
      '  - Replies MUST be written in the owner\'s voice and language\n' +
      '  - Set isOwnerReply: true and author: owner\'s display name\n\n' +

      '=== OWNER REACTION (per post) ===\n' +
      '  - "type"       : MUST be one of:\n' +
      '                     * "liked"     (owner liked) — aim 30-40% of posts\n' +
      '                     * "commented" (owner left a comment) — aim 15-25%\n' +
      '                     * "saw"       (owner just saw) — aim 25-40%\n' +
      '                     * "ignored"   (owner ignored) — aim 5-15%\n' +
      '  - "commentText": ONLY if type=commented, owner\'s own comment on someone else\'s post\n' +
      '  - "thoughts"   : 1-2 sentences in owner\'s inner voice, owner\'s language\n\n' +

      '=== MULTILINGUAL STRATEGY ===\n' +
      'Each post AND comment is in the AUTHOR\'S NATIVE LANGUAGE.\n' +
      'Comments under the same post should typically include at least 2 different languages\n' +
      '(mixing local friends, foreign friends, brands, strangers).\n' +
      'The owner is multilingual → comments mix Japanese / English / Chinese / Korean / etc.\n\n' +

      '=== TRANSLATION RULE ===\n' +
      'For every non-Chinese text (post text, comment text, reply, thoughts, commentText):\n' +
      '  → native language FIRST, Chinese translation in parentheses on SAME line.\n' +
      '  Format: "こんにちは (你好)" / "Hello (你好)"\n' +
      'Pure Chinese needs no translation.\n\n' +

      '=== OUTPUT — ONLY valid JSON array ===\n' +
      '[\n' +
      '  {\n' +
      '    "author": "Alex Chen",\n' +
      '    "authorHandle": "@alex_w",\n' +
      '    "isSelf": false,\n' +
      '    "isPublic": false,\n' +
      '    "hoursAgo": 2,\n' +
      '    "text": "Beautiful sunset today.",\n' +
      '    "hasImage": true,\n' +
      '    "imageDescription": "Orange sunset over the ocean...",\n' +
      '    "likes": 89,\n' +
      '    "comments": [\n' +
      '      { "author": "Mom", "authorHandle": "@mom_luv", "text": "So pretty!", "language": "en" },\n' +
      '      { "author": "Tomo", "authorHandle": "@tomo_jp", "text": "きれい (真美)", "language": "ja" }\n' +
      '    ],\n' +
      '    "ownerReaction": { "type": "liked", "thoughts": "Pretty." }\n' +
      '  },\n' +
      '  {\n' +
      '    "author": "Naoya",\n' +
      '    "authorHandle": "@naoya_z",\n' +
      '    "isSelf": true,\n' +
      '    "isPublic": false,\n' +
      '    "hoursAgo": 5,\n' +
      '    "text": "Coffee at my favorite café.",\n' +
      '    "hasImage": false,\n' +
      '    "imageDescription": "",\n' +
      '    "likes": 45,\n' +
      '    "comments": [\n' +
      '      { "author": "Yuki", "authorHandle": "@yuki_k", "text": "Looks nice!", "language": "en" },\n' +
      '      { "author": "Naoya", "authorHandle": "@naoya_z", "text": "It is. (是的。)", "language": "en", "isOwnerReply": true }\n' +
      '    ],\n' +
      '    "ownerReaction": { "type": "saw", "thoughts": "..." }\n' +
      '  }\n' +
      ']\n';

    return prompt;
  }

  // ══════════════════════════════════════════════
  //  11. AI 调用 + 解析
  // ══════════════════════════════════════════════
  async function _psocGenerateAll(ownerCharId) {
    var ownerChar = (typeof _pmsgResolveOwnerCharacter === 'function') ? _pmsgResolveOwnerCharacter() : null;
    if (!ownerChar) { console.warn('[rollSocialData] 无手机主人'); return null; }

    var ownerInfo = (typeof _pmsgBuildOwnerBlock === 'function')
      ? _pmsgBuildOwnerBlock(ownerChar)
      : { name: ownerChar.name || 'Unknown', lang: 'zh', block: '' };

    var contacts = _psocPullContacts(ownerCharId);

    var api = state.apis && state.apis.find(function(a){ return a.id === state.activeApiId; });
    if (!api || !api.url) { showToast('Please configure API first'); return null; }

    var worldbookBlk = (typeof _pmsgBuildWorldbookBlock === 'function') ? _pmsgBuildWorldbookBlock() : '';
    var recentHistory = (typeof _pmsgPullOwnerChatHistory === 'function') ? _pmsgPullOwnerChatHistory(ownerCharId, 15) : [];
    var historyBlock = '';
    if (recentHistory.length > 0) {
      historyBlock = '=== RECENT iMESSAGE (owner ↔ user) ===\n';
      recentHistory.forEach(function(m){ historyBlock += '  [' + m.sender + '] ' + m.content + '\n'; });
      historyBlock += '\n';
    }

    var prompt = _psocBuildPrompt(ownerInfo, contacts, historyBlock, worldbookBlk);
    console.log('[rollSocialData] prompt 长度:', prompt.length, '| 联系人数:', contacts.length);

    var rawReply;
    try { rawReply = await sendChat(api, [{ role: 'user', content: prompt }]); }
    catch(e) { console.error('[rollSocialData] API error:', e); showToast('Error: ' + (e.message || String(e))); return null; }

    console.log('[rollSocialData] raw reply 长度:', rawReply.length);

    // 完整解析
    var arr = null;
    var jm = rawReply.match(/\[[\s\S]*\]/);
    if (jm) { try { arr = JSON.parse(jm[0]); } catch(e) { console.warn('[rollSocialData] 完整解析失败:', e.message); } }

    // 截断补救
    if (!arr) {
      console.warn('[rollSocialData] 尝试截断补救...');
      var startIdx = rawReply.indexOf('[');
      if (startIdx >= 0) {
        var body = rawReply.slice(startIdx + 1);
        var lastBrace = body.lastIndexOf('}');
        if (lastBrace >= 0) {
          var truncated = '[' + body.slice(0, lastBrace + 1) + ']';
          try { arr = JSON.parse(truncated); console.log('[rollSocialData] 截断补救成功:', arr.length, '条'); }
          catch(e) { console.error('[rollSocialData] 截断补救失败:', e); }
        }
      }
    }

    if (!Array.isArray(arr)) { console.warn('[rollSocialData] 无法解析 JSON'); return null; }
    console.log('[rollSocialData] AI 返回条数:', arr.length);

    // 归一化
    var now = Date.now();
    var HOUR = 3600000;
    var out = [];

    arr.forEach(function(item, i){
      if (!item || !item.author) return;

      var hoursAgo = parseFloat(item.hoursAgo);
      if (!isFinite(hoursAgo) || hoursAgo < 0) hoursAgo = Math.random() * 72 + 1;
      if (hoursAgo > 1440) hoursAgo = 1440;

            // 归一化 comments
      var comments = [];
      if (Array.isArray(item.comments)) {
        item.comments.forEach(function(c){
          if (!c || !c.author) return;
          comments.push({
            author: String(c.author).trim(),
            authorHandle: (c.authorHandle != null) ? String(c.authorHandle).trim() : '',
            text: (c.text != null) ? String(c.text).trim() : '',
            language: (c.language != null) ? String(c.language).trim().toLowerCase() : ''
          });
        });
      }

      // 归一化 ownerReaction
      var reaction = null;
      var r = item.ownerReaction;
      if (r && typeof r === 'object') {
        var type = String(r.type || '').toLowerCase();
        var validTypes = ['liked', 'commented', 'saw', 'ignored'];
        if (validTypes.indexOf(type) < 0) type = 'saw';
        reaction = {
          type: type,
          thoughts: (r.thoughts != null) ? String(r.thoughts).trim() : ''
        };
        if (type === 'commented') {
          reaction.commentText = (r.commentText != null) ? String(r.commentText).trim() : '';
        }
      }

      out.push({
        id: 'post_' + ownerCharId + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2,4),
        ownerCharId: ownerCharId,
        author: String(item.author).trim(),
        authorHandle: (item.authorHandle != null) ? String(item.authorHandle).trim() : '',
        authorAvatar: null,
        isSelf: !!item.isSelf,
        isPublic: !!item.isPublic,
        timestamp: now - hoursAgo * HOUR,
        text: (item.text != null) ? String(item.text) : '',
        language: (item.language != null) ? String(item.language).trim().toLowerCase() : '',
        hasImage: !!item.hasImage,
        imageDescription: (item.imageDescription != null) ? String(item.imageDescription).trim() : '',
        likes: Math.max(0, parseInt(item.likes, 10) || 0),
        commentsCount: comments.length,
        comments: comments,
        ownerReaction: reaction
      });
    });

    out.sort(function(a, b){ return b.timestamp - a.timestamp; });
    var withImage = out.filter(function(p){ return p.hasImage; }).length;
    var withComments = out.filter(function(p){ return p.comments.length > 0; }).length;
    console.log('[rollSocialData] 生成完成:', out.length, '条 | 带图:', withImage, '| 有评论:', withComments);
    return out;
  }

  // ══════════════════════════════════════════════
  //  12. 骰子主入口
  // ══════════════════════════════════════════════
  window.rollSocialData = async function() {
    var ownerCharId = (typeof _pmsgOwnerCharId === 'function') ? _pmsgOwnerCharId() : '__no_owner__';
    console.log('[rollSocialData] ownerCharId =', ownerCharId);
    if (ownerCharId === '__no_owner__') { showToast('No character selected'); return; }

    var bodyEl = document.querySelector('#phoneAppPage .papp-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<div class="pmsg-loading"><div class="pmsg-loading-dots"><span></span><span></span><span></span></div><p style="font-size:14px">Generating feed...</p></div>';
    }

    var before = (state.socialData || []).length;
    state.socialData = (state.socialData || []).filter(function(p){ return p.ownerCharId !== ownerCharId; });
    console.log('[rollSocialData] 清空旧数据:', before, '→', state.socialData.length);

    var posts = await _psocGenerateAll(ownerCharId);
    if (!posts || posts.length === 0) { showToast('Generation failed'); openPhoneApp('social'); return; }

    posts.forEach(function(p){ state.socialData.push(p); });
    saveState();
    openPhoneApp('social');
    showToast('Generated ' + posts.length + ' posts');
  };

  // ══════════════════════════════════════════════
  //  13. 注册 renderer
  // ══════════════════════════════════════════════
  if (typeof PHONE_APP_RENDERERS !== 'undefined') {
    PHONE_APP_RENDERERS.social = _psocPageRenderer;
  } else {
    console.warn('[phone-social.js] PHONE_APP_RENDERERS 未定义');
  }

  // ══════════════════════════════════════════════
  //  14. 测试挂载
  // ══════════════════════════════════════════════
  window.__psocTest = {
    pullContacts: _psocPullContacts,
    buildListHTML: _psocBuildListHTML,
    buildPrompt: _psocBuildPrompt,
    generateAll: _psocGenerateAll,
    renderer: _psocPageRenderer
  };

  console.log('[phone-social.js] 已加载（模块 3）');
})();