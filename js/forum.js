// ========== js/forum.js ==========
// 论坛模块 — 纯前端 mock，功能留待后续接入

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  Mock 数据
  // ═══════════════════════════════════════════
  var _mockPosts = [
    {
      id: 'p1',
      authorName: 'Anonymous',
      authorAvatar: null,
      category: 'Tips',
      title: 'Best practices for character prompts?',
      content: 'Looking for tips on writing more engaging character prompts. How do you make them feel more alive and consistent over time? Any specific structure you use?',
      createdAt: Date.now() - 2 * 3600 * 1000,
      likeCount: 24,
      commentCount: 2,
      isLiked: false
    },
    {
      id: 'p2',
      authorName: 'Anonymous',
      authorAvatar: null,
      category: 'Character Share',
      title: 'Sharing my OC — Yuki, the quiet artist',
      content: "Created a character who's a shy art student. Spent a lot of time on the worldbook and personality. Let me know what you think!",
      createdAt: Date.now() - 5 * 3600 * 1000,
      likeCount: 42,
      commentCount: 0,
      isLiked: true
    },
    {
      id: 'p3',
      authorName: 'Anonymous',
      authorAvatar: null,
      category: 'Help',
      title: 'How to use worldbooks effectively?',
      content: 'I have trouble understanding when to use global vs local worldbooks. Any advice would be appreciated.',
      createdAt: Date.now() - 24 * 3600 * 1000,
      likeCount: 18,
      commentCount: 0,
      isLiked: false
    },
    {
      id: 'p4',
      authorName: 'You',
      authorAvatar: null,
      category: 'Off-Topic',
      title: 'Anyone else find late night chats more immersive?',
      content: "There's something about chatting at 2am that just hits different. The responses feel more... natural?",
      createdAt: Date.now() - 3 * 24 * 3600 * 1000,
      likeCount: 12,
      commentCount: 0,
      isLiked: false
    }
  ];

  var _mockComments = {
    p1: [
      {
        id: 'c1',
        authorName: 'Momo',
        authorAvatar: null,
        content: 'I usually focus on 3-4 core traits and build everything else around them. Keeps it consistent.',
        createdAt: Date.now() - 1 * 3600 * 1000
      },
      {
        id: 'c2',
        authorName: 'Kai',
        authorAvatar: null,
        content: 'Avoid over-specifying. Leave room for the AI to improvise in the moment.',
        createdAt: Date.now() - 30 * 60 * 1000
      }
    ],
    p2: [],
    p3: [],
    p4: []
  };

  // ═══════════════════════════════════════════
  //  状态
  // ═══════════════════════════════════════════
  var _state = {
    currentCat: 'all',
    newPostCat: 'Character Share',
    currentPostId: null
  };

  // ═══════════════════════════════════════════
  //  工具
  // ═══════════════════════════════════════════
  function _esc(s) {
    if (typeof esc === 'function') return esc(s);
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function _timeAgo(ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'now';
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 86400 * 30) return Math.floor(s / 86400) + 'd';
    return Math.floor(s / (86400 * 30)) + 'mo';
  }

  function _avatarHtml(avatar, size) {
    size = size || 32;
    var inner = avatar
      ? '<img src="' + _esc(avatar) + '">'
      : '<svg viewBox="0 0 16 16" fill="none" stroke="#8e8e93" stroke-width="1.5"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>';
    return '<div class="forum-author-avatar" style="width:' + size + 'px;height:' + size + 'px">' + inner + '</div>';
  }

  function _svgHeart() {
    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 12C7 12 2 9 2 6a3 3 0 016 0 3 3 0 016 0c0 3-5 6-5 6z"/></svg>';
  }

  function _svgComment() {
    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 2V10H2a1 1 0 01-1-1V3a1 1 0 011-1z"/></svg>';
  }

  // ═══════════════════════════════════════════
  //  渲染列表
  // ═══════════════════════════════════════════
  function _renderPostCard(post) {
    var cat = post.category ? '<span class="forum-cat-tag">' + _esc(post.category) + '</span>' : '';
    return '' +
      '<div class="forum-list-item" onclick="openForumPost(\'' + post.id + '\')">' +
        '<div class="forum-post-head">' +
          _avatarHtml(post.authorAvatar, 32) +
          '<span class="forum-author-name">' + _esc(post.authorName) + '</span>' +
          cat +
          '<span class="forum-time">' + _timeAgo(post.createdAt) + '</span>' +
        '</div>' +
        '<div class="forum-post-title">' + _esc(post.title) + '</div>' +
        '<div class="forum-post-snippet">' + _esc(post.content) + '</div>' +
        '<div class="forum-post-meta">' +
          '<span class="' + (post.isLiked ? 'liked' : '') + '">' + _svgHeart() + ' ' + post.likeCount + '</span>' +
          '<span>' + _svgComment() + ' ' + post.commentCount + '</span>' +
        '</div>' +
      '</div>';
  }

  function _renderList(container, posts) {
    if (!container) return;
    if (!posts.length) {
      container.innerHTML = '' +
        '<div class="forum-empty">' +
          '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="4"/><path d="M6 18h36"/><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none"/></svg>' +
          '<div>暂无帖子</div>' +
        '</div>';
      return;
    }
    container.innerHTML = posts.map(_renderPostCard).join('');
  }

  // ═══════════════════════════════════════════
  //  首页 / 论坛 / 我的
  // ═══════════════════════════════════════════
  function renderForumHome() {
    _renderList(document.getElementById('forumHomeList'), _mockPosts);
  }

  function renderForumAll() {
    var posts = _mockPosts;
    if (_state.currentCat && _state.currentCat !== 'all') {
      posts = posts.filter(function (p) { return p.category === _state.currentCat; });
    }
    _renderList(document.getElementById('forumAllList'), posts);
  }

  function renderForumMe() {
    var myPosts = _mockPosts.filter(function (p) { return p.authorName === 'You'; });
    _renderList(document.getElementById('forumMeList'), myPosts);

    var statPosts = document.getElementById('forumStatPosts');
    if (statPosts) statPosts.textContent = String(myPosts.length);

    // 用户名 / Bio 从 userProfile 同步
    var nameEl = document.getElementById('forumMeName');
    var bioEl  = document.getElementById('forumMeBio');
    var avEl   = document.getElementById('forumMeAvatar');
    if (nameEl && state.userProfile) {
      nameEl.textContent = state.userProfile.name || 'You';
    }
    if (bioEl && state.userProfile && state.userProfile.bio) {
      bioEl.textContent = state.userProfile.bio;
    }
    if (avEl && state.userProfile && state.userProfile.avatar) {
      avEl.innerHTML = '<img src="' + _esc(state.userProfile.avatar) + '" style="width:100%;height:100%;object-fit:cover">';
    }
  }

  // ═══════════════════════════════════════════
  //  Tab 切换
  // ═══════════════════════════════════════════
  function navForumTab(tab) {
    _updateTabBarActive(tab);
    if (tab === 'home')  { renderForumHome(); nav('screen-forum-home'); }
    if (tab === 'forum') { renderForumAll();  nav('screen-forum'); }
    if (tab === 'me')    { renderForumMe();   nav('screen-forum-me'); }
  }

  function _updateTabBarActive(tab) {
    document.querySelectorAll('.forum-tab').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-tab') === tab);
    });
  }

  // ═══════════════════════════════════════════
  //  分类 chips（论坛页）
  // ═══════════════════════════════════════════
  function setForumCat(cat) {
    _state.currentCat = cat;
    document.querySelectorAll('#forumCatBar .forum-cat').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-cat') === cat);
    });
    renderForumAll();
  }

  // ═══════════════════════════════════════════
  //  帖子详情
  // ═══════════════════════════════════════════
  function openForumPost(postId) {
    _state.currentPostId = postId;
    _renderPostDetail();
    nav('screen-forum-post');
  }

  function closeForumPost() {
    // 回上一级：优先回论坛列表
    nav('screen-forum');
  }

  function _renderPostDetail() {
    var body = document.getElementById('forumPostBody');
    if (!body) return;
    var post = _mockPosts.find(function (p) { return p.id === _state.currentPostId; });
    if (!post) {
      body.innerHTML = '<div class="forum-empty">帖子不存在</div>';
      return;
    }
    var comments = _mockComments[post.id] || [];

    var commentsHtml = '';
    if (!comments.length) {
      commentsHtml = '<div style="text-align:center;padding:32px 20px;color:#c7c7cc;font-size:13px">还没有评论</div>';
    } else {
      commentsHtml = comments.map(function (c) {
        return '' +
          '<div class="forum-comment-item">' +
            _avatarHtml(c.authorAvatar, 30) +
            '<div class="forum-comment-body">' +
              '<div class="forum-comment-head">' +
                '<span class="forum-comment-author">' + _esc(c.authorName) + '</span>' +
                '<span class="forum-comment-time">' + _timeAgo(c.createdAt) + '</span>' +
              '</div>' +
              '<div class="forum-comment-text">' + _esc(c.content) + '</div>' +
            '</div>' +
          '</div>';
      }).join('');
    }

    body.innerHTML = '' +
      '<div class="forum-post-main">' +
        '<div class="forum-post-head">' +
          _avatarHtml(post.authorAvatar, 32) +
          '<span class="forum-author-name">' + _esc(post.authorName) + '</span>' +
          (post.category ? '<span class="forum-cat-tag">' + _esc(post.category) + '</span>' : '') +
          '<span class="forum-time">' + _timeAgo(post.createdAt) + '</span>' +
        '</div>' +
        '<div class="forum-post-title">' + _esc(post.title) + '</div>' +
        '<div class="forum-post-body">' + _esc(post.content) + '</div>' +
        '<div class="forum-post-meta">' +
          '<span class="' + (post.isLiked ? 'liked' : '') + '">' + _svgHeart() + ' ' + post.likeCount + '</span>' +
          '<span>' + _svgComment() + ' ' + post.commentCount + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="forum-section-title">评论 · ' + comments.length + '</div>' +
      '<div class="forum-comment-list">' + commentsHtml + '</div>' +
      '<div style="height:24px"></div>';
  }

  function submitForumComment() {
    var input = document.getElementById('forumCommentInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    var post = _mockPosts.find(function (p) { return p.id === _state.currentPostId; });
    if (!post) return;
    if (!_mockComments[post.id]) _mockComments[post.id] = [];

    _mockComments[post.id].push({
      id: 'c_' + Date.now(),
      authorName: 'You',
      authorAvatar: null,
      content: text,
      createdAt: Date.now()
    });
    post.commentCount = _mockComments[post.id].length;

    input.value = '';
    _renderPostDetail();
    if (typeof showToast === 'function') showToast('评论已发布');
  }

  // ═══════════════════════════════════════════
  //  发帖
  // ═══════════════════════════════════════════
  function setNewPostCat(cat) {
    _state.newPostCat = cat;
    document.querySelectorAll('#forumNewCatBar .forum-cat').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-cat') === cat);
    });
  }

  function onForumNewInput() {
    var t = document.getElementById('forumNewTitle');
    var c = document.getElementById('forumNewContent');
    var btn = document.getElementById('forumPostSubmitBtn');
    if (!t || !c || !btn) return;
    var ok = t.value.trim().length > 0 && c.value.trim().length > 0;
    btn.disabled = !ok;
    var span = btn.querySelector('span');
    if (span) {
      span.style.color = ok ? '#1d1d1f' : '#8e8e93';
    }
  }

  function cancelForumNew() {
    var t = document.getElementById('forumNewTitle');
    var c = document.getElementById('forumNewContent');
    if (t) t.value = '';
    if (c) c.value = '';
    onForumNewInput();
    nav('screen-forum');
  }

  function submitForumPost() {
    var t = document.getElementById('forumNewTitle');
    var c = document.getElementById('forumNewContent');
    if (!t || !c) return;
    var title = t.value.trim();
    var content = c.value.trim();
    if (!title || !content) return;

    var newPost = {
      id: 'p_' + Date.now(),
      authorName: 'You',
      authorAvatar: null,
      category: _state.newPostCat,
      title: title,
      content: content,
      createdAt: Date.now(),
      likeCount: 0,
      commentCount: 0,
      isLiked: false
    };
    _mockPosts.unshift(newPost);
    _mockComments[newPost.id] = [];

    t.value = '';
    c.value = '';
    onForumNewInput();

    if (typeof showToast === 'function') showToast('发布成功');
    renderForumHome();
    renderForumAll();
    renderForumMe();
    nav('screen-forum');
  }

  // ═══════════════════════════════════════════
  //  搜索
  // ═══════════════════════════════════════════
  function openForumSearch() {
    var existing = document.getElementById('forumSearchOverlay');
    if (existing) { existing.remove(); return; }

    var overlay = document.createElement('div');
    overlay.id = 'forumSearchOverlay';
    overlay.className = 'forum-search-overlay';
    overlay.innerHTML =
      '<div class="forum-search-box">' +
        '<svg viewBox="0 0 20 20" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5l3.5 3.5"/></svg>' +
        '<input type="text" id="forumSearchInput" placeholder="搜索帖子…" autocomplete="off">' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('active'); });

    setTimeout(function () {
      var inp = document.getElementById('forumSearchInput');
      if (inp) inp.focus();
    }, 60);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        setTimeout(function () { overlay.remove(); }, 200);
      }
    });
  }

  // ═══════════════════════════════════════════
  //  我的主页设置（预留）
  // ═══════════════════════════════════════════
  function openForumMeSettings() {
    if (typeof showToast === 'function') showToast('设置功能开发中');
  }

  // ═══════════════════════════════════════════
  //  初始化
  // ═══════════════════════════════════════════
  function _bootForum() {
    if (!document.getElementById('screen-forum-home')) return false;
    try { renderForumHome(); } catch (e) { console.warn(e); }
    try { renderForumAll();  } catch (e) { console.warn(e); }
    try { renderForumMe();   } catch (e) { console.warn(e); }
    console.log('[Forum] init OK');
    return true;
  }

  // screen-loader 异步加载 HTML，所以轮询等 DOM
  var _tries = 0;
  var _timer = setInterval(function () {
    _tries++;
    if (_bootForum()) {
      clearInterval(_timer);
      _timer = null;
    } else if (_tries > 100) {
      clearInterval(_timer);
      _timer = null;
      console.warn('[Forum] 100 次重试后仍未找到 #screen-forum-home');
    }
  }, 100);

  // ═══════════════════════════════════════════
  //  全局导出
  // ═══════════════════════════════════════════
  window.navForumTab            = navForumTab;
  window.setForumCat            = setForumCat;
  window.openForumPost          = openForumPost;
  window.closeForumPost         = closeForumPost;
  window.submitForumComment     = submitForumComment;
  window.setNewPostCat          = setNewPostCat;
  window.onForumNewInput        = onForumNewInput;
  window.submitForumPost        = submitForumPost;
  window.cancelForumNew         = cancelForumNew;
  window.openForumSearch        = openForumSearch;
  window.openForumMeSettings    = openForumMeSettings;
  window.renderForumHome        = renderForumHome;
  window.renderForumAll         = renderForumAll;
  window.renderForumMe          = renderForumMe;
})();