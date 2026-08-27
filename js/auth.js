// ========== auth.js ==========
// Mizu Phone — Supabase Authentication Module
(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  //  常量
  // ═══════════════════════════════════════════════
  var SUPABASE_URL      = 'https://rnhsuityufzkllaxflgw.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHN1aXR5dWZ6a2xsYXhmbGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NzA1NTIsImV4cCI6MjEwMzU0NjU1Mn0.sRHOHePQxhGT4ho8lzQTPukbTTxtLIskyGZKizDFALc';
  var SUPABASE_REF      = 'rnhsuityufzkllaxflgw';
  var EMAIL_SUFFIX      = '@qq.mizu.phone';

  // ═══════════════════════════════════════════════
  //  1. 初始化 Supabase Client
  // ═══════════════════════════════════════════════
  var supabaseClient = null;
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('[auth] Supabase client initialized');
    } else {
      console.error('[auth] supabase SDK not loaded');
    }
  } catch (e) {
    console.error('[auth] Failed to init Supabase:', e);
  }
  window.__supabase = supabaseClient;

  // ═══════════════════════════════════════════════
  //  2. 同步 Session 检测（localStorage，阻塞式）
  //     → 在 screen-loader / init.js 运行前就决定是否需要认证
  // ═══════════════════════════════════════════════
  var hasLocalSession = false;
  try {
    var raw = localStorage.getItem('sb-' + SUPABASE_REF + '-auth-token');
    if (raw) {
      var parsed = JSON.parse(raw);
      // Supabase v2 存储格式
      if (parsed && (parsed.access_token ||
          (parsed.currentSession && parsed.currentSession.access_token))) {
        hasLocalSession = true;
      }
    }
  } catch (e) { /* 静默 */ }

  window.__authRequired = !hasLocalSession;

  // ═══════════════════════════════════════════════
  //  3. DOM 辅助
  // ═══════════════════════════════════════════════
  function _esc(s) {
    if (typeof esc === 'function') return esc(s);
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function showAuthScreen() {
    var authEl    = document.getElementById('authScreen');
    var appEl     = document.getElementById('app');
    var loadingEl = document.getElementById('loadingIndicator');

    if (authEl) authEl.style.display = 'flex';
    if (appEl) { appEl.style.visibility = 'hidden'; appEl.style.opacity = '0'; }
    if (loadingEl && loadingEl.style.display !== 'none') {
      loadingEl.classList.add('mizu-fadeout');
      setTimeout(function () { loadingEl.style.display = 'none'; }, 1200);
    }
    window.__authRequired = true;
  }

  function hideAuthScreen() {
    var authEl = document.getElementById('authScreen');
    if (authEl) authEl.style.display = 'none';
    window.__authRequired = false;
  }

  function showApp() {
    var appEl = document.getElementById('app');
    if (appEl) { appEl.style.display = ''; appEl.style.visibility = 'visible'; appEl.style.opacity = '1'; }
  }

  /** DOM 就绪后执行 */
  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ═══════════════════════════════════════════════
  //  4. 用户数据管理
  // ═══════════════════════════════════════════════
  function setUserFromSession(session) {
    if (!session || !session.user) return;
    var u    = session.user;
    var meta = u.user_metadata || {};
    var info = {
      id:     u.id,
      email:  u.email,
      qq:     meta.qq || (u.email || '').replace(EMAIL_SUFFIX, ''),
      name:   meta.user_name || 'User',
      avatar: meta.avatar || null
    };
    window.__user = info;
    if (typeof state !== 'undefined') state.user = info;
    console.log('[auth] User set:', info.qq, info.name);
  }

  function clearUser() {
    window.__user = null;
    if (typeof state !== 'undefined') state.user = null;
  }

  // ═══════════════════════════════════════════════
  //  5. 表单 UI 控制
  // ═══════════════════════════════════════════════
  var currentMode = 'login';

  function switchAuthMode(mode) {
    currentMode = mode;
    var lf = document.getElementById('authLoginForm');
    var rf = document.getElementById('authRegisterForm');
    var tt = document.getElementById('authTitle');
    if (mode === 'login') {
      if (lf) lf.style.display = 'block';
      if (rf) rf.style.display = 'none';
      if (tt) tt.textContent = '\u767B\u5F55';         // 登录
    } else {
      if (lf) lf.style.display = 'none';
      if (rf) rf.style.display = 'block';
      if (tt) tt.textContent = '\u6CE8\u518C';         // 注册
    }
    clearAuthError();
  }

  function showAuthError(msg) {
    var el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function clearAuthError() {
    var el = document.getElementById('authError');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  }

  function setAuthLoading(on) {
    ['authLoginBtn', 'authRegisterBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.disabled = on;
      if (on) {
        btn.dataset.origText = btn.textContent;
        btn.innerHTML = '<span class="auth-spinner"></span>';
      } else {
        btn.textContent = btn.dataset.origText || btn.textContent;
      }
    });
  }

  // ═══════════════════════════════════════════════
  //  6. 注册 / 登录 / 退出
  // ═══════════════════════════════════════════════
  function qqToEmail(qq) { return qq + EMAIL_SUFFIX; }

  /** ─── 注册 ─── */
  async function handleRegister() {
    clearAuthError();
    var qq   = (document.getElementById('regQQ')              || {}).value || '';
    var name = (document.getElementById('regName')            || {}).value || '';
    var pwd  = (document.getElementById('regPassword')        || {}).value || '';
    var pwd2 = (document.getElementById('regPasswordConfirm') || {}).value || '';

    qq   = qq.trim();
    name = name.trim();

    if (!qq)                  { showAuthError('请输入 QQ 号');         return; }
    if (!/^\d+$/.test(qq))    { showAuthError('QQ 号必须为纯数字');    return; }
    if (!name)                { showAuthError('请输入用户名');         return; }
    if (!pwd)                 { showAuthError('请输入密码');           return; }
    if (pwd.length < 6)       { showAuthError('密码至少 6 位');       return; }
    if (pwd !== pwd2)         { showAuthError('两次密码不一致');      return; }
    if (!supabaseClient)      { showAuthError('认证服务未初始化');     return; }

    setAuthLoading(true);
    try {
      var email = qqToEmail(qq);
      var res   = await supabaseClient.auth.signUp({
        email: email,
        password: pwd,
        options: { data: { user_name: name, qq: qq } }
      });

      if (res.error) {
        var m = res.error.message || '';
        showAuthError(
          m.indexOf('already') > -1 ? '该 QQ 号已注册，请直接登录' : m
        );
        setAuthLoading(false);
        return;
      }

      // autoconfirm 开启时直接返回 session
      if (res.data.session) {
        setUserFromSession(res.data.session);
        onAuthSuccess();
        return;
      }

      // 否则尝试直接登录
      var si = await supabaseClient.auth.signInWithPassword({ email: email, password: pwd });
      if (si.error) {
        showAuthError('注册成功！请在 Supabase 后台关闭邮箱确认后重试登录');
        switchAuthMode('login');
      } else {
        setUserFromSession(si.data.session);
        onAuthSuccess();
      }
    } catch (e) {
      showAuthError('注册失败: ' + (e.message || '未知错误'));
    } finally {
      setAuthLoading(false);
    }
  }

  /** ─── 登录 ─── */
  async function handleLogin() {
    clearAuthError();
    var qq  = (document.getElementById('loginQQ')       || {}).value || '';
    var pwd = (document.getElementById('loginPassword') || {}).value || '';
    qq = qq.trim();

    if (!qq)                { showAuthError('请输入 QQ 号');       return; }
    if (!/^\d+$/.test(qq))  { showAuthError('QQ 号必须为纯数字');  return; }
    if (!pwd)               { showAuthError('请输入密码');         return; }
    if (!supabaseClient)    { showAuthError('认证服务未初始化');    return; }

    setAuthLoading(true);
    try {
      var res = await supabaseClient.auth.signInWithPassword({
        email: qqToEmail(qq),
        password: pwd
      });
      if (res.error) {
        var m = res.error.message || '';
        showAuthError(m.indexOf('Invalid') > -1 ? 'QQ 号或密码错误' : m);
        setAuthLoading(false);
        return;
      }
      setUserFromSession(res.data.session);
      onAuthSuccess();
    } catch (e) {
      showAuthError('登录失败: ' + (e.message || '未知错误'));
    } finally {
      setAuthLoading(false);
    }
  }

  /** ─── 退出 ─── */
  async function handleSignOut() {
    if (!supabaseClient) return;
    try { await supabaseClient.auth.signOut(); } catch (e) { console.error('[auth] signOut:', e); }
    clearUser();
    showAuthScreen();
    // 清空表单
    ['loginQQ','loginPassword','regQQ','regName','regPassword','regPasswordConfirm']
      .forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
  }

  // ═══════════════════════════════════════════════
  //  7. 认证成功后回调
  // ═══════════════════════════════════════════════
  function onAuthSuccess() {
    window.__authRequired = false;
    hideAuthScreen();
    showApp();

    // 尝试在原地初始化应用（避免 reload）
    if (typeof window.__runAppInit === 'function') {
      try {
        window.__runAppInit();
        console.log('[auth] App initialized in-place');
        return;
      } catch (e) {
        console.warn('[auth] In-place init failed, reloading:', e);
      }
    }
    // 兜底：刷新页面
    location.reload();
  }

  // ═══════════════════════════════════════════════
  //  8. onAuthStateChange 监听
  // ═══════════════════════════════════════════════
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(function (event, session) {
      console.log('[auth] onAuthStateChange:', event);

      switch (event) {
        case 'INITIAL_SESSION':
          if (session) {
            setUserFromSession(session);
            window.__authRequired = false;
          } else {
            window.__authRequired = true;
            whenReady(showAuthScreen);
          }
          break;
        case 'SIGNED_IN':
          if (session) setUserFromSession(session);
          break;
        case 'SIGNED_OUT':
          clearUser();
          whenReady(showAuthScreen);
          break;
        case 'TOKEN_REFRESHED':
          if (session) setUserFromSession(session);
          break;
      }
    });

    // 额外异步校验（处理 localStorage 残留但 token 已过期的边缘情况）
    supabaseClient.auth.getSession().then(function (r) {
      if (r.data.session) {
        setUserFromSession(r.data.session);
        window.__authRequired = false;
        console.log('[auth] Session verified OK');
      } else if (hasLocalSession) {
        // localStorage 有缓存但 token 无效
        console.warn('[auth] Cached session invalid');
        window.__authRequired = true;
        whenReady(showAuthScreen);
      }
    }).catch(function (e) {
      console.error('[auth] getSession error:', e);
    });
  } else {
    // SDK 加载失败时也要显示认证界面（带错误提示）
    window.__authRequired = true;
    whenReady(function () {
      showAuthScreen();
      showAuthError('认证服务加载失败，请刷新页面重试');
    });
  }

  // ═══════════════════════════════════════════════
  //  9. DOM 事件绑定
  // ═══════════════════════════════════════════════
  function bindAuthEvents() {
    // 注册
    var regBtn = document.getElementById('authRegisterBtn');
    if (regBtn) regBtn.addEventListener('click', function (e) { e.preventDefault(); handleRegister(); });

    // 登录
    var loginBtn = document.getElementById('authLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', function (e) { e.preventDefault(); handleLogin(); });

    // 切换模式
    var toReg = document.getElementById('switchToRegister');
    if (toReg) toReg.addEventListener('click', function (e) { e.preventDefault(); switchAuthMode('register'); });

    var toLogin = document.getElementById('switchToLogin');
    if (toLogin) toLogin.addEventListener('click', function (e) { e.preventDefault(); switchAuthMode('login'); });

    // Enter 快捷键
    var lp = document.getElementById('loginPassword');
    if (lp) lp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); handleLogin(); } });

    var rpc = document.getElementById('regPasswordConfirm');
    if (rpc) rpc.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); handleRegister(); } });

    // 密码可见切换
    document.querySelectorAll('.auth-pwd-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tid   = this.dataset.target;
        var input = document.getElementById(tid);
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        this.querySelector('.pwd-icon-show').style.display = show ? 'none'  : 'block';
        this.querySelector('.pwd-icon-hide').style.display = show ? 'block' : 'none';
      });
    });
  }

  whenReady(bindAuthEvents);

  // ═══════════════════════════════════════════════
  //  10. 设置页退出登录区块渲染（供 settings.js 调用）
  // ═══════════════════════════════════════════════
  function renderAuthSettingsSection() {
    var screen = document.getElementById('screen-settings');
    if (!screen) return;
    var body = screen.querySelector('.screen-body') || screen;

    var section = document.getElementById('settingsAuthSection');
    if (!section) {
      section = document.createElement('div');
      section.id = 'settingsAuthSection';
      body.appendChild(section);
    }

    var user = window.__user;
    if (!user) { section.innerHTML = ''; return; }

    section.innerHTML =
      '<div class="auth-settings-card">' +
        '<div class="auth-settings-user">' +
          '<div class="auth-settings-avatar">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="8" r="4"/>' +
              '<path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/>' +
            '</svg>' +
          '</div>' +
          '<div class="auth-settings-info">' +
            '<div class="auth-settings-name">' + _esc(user.name) + '</div>' +
            '<div class="auth-settings-qq">QQ ' + _esc(user.qq) + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="auth-logout-btn" onclick="mizuAuth.signOut()">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>' +
            '<polyline points="16 17 21 12 16 7"/>' +
            '<line x1="21" y1="12" x2="9" y2="12"/>' +
          '</svg>' +
          '<span>\u9000\u51FA\u767B\u5F55</span>' +
        '</button>' +
      '</div>';
  }

  // ═══════════════════════════════════════════════
  //  11. 全局导出
  // ═══════════════════════════════════════════════
  window.mizuAuth = {
    signOut:               handleSignOut,
    getUser:               function () { return window.__user; },
    isAuthenticated:       function () { return !!window.__user; },
    switchMode:            switchAuthMode,
    renderSettingsSection: renderAuthSettingsSection,
    client:                supabaseClient
  };

  // ═══════════════════════════════════════════════
  //  12. 一键测试工具  window.__mizuAuthTest()
  // ═══════════════════════════════════════════════
  window.__mizuAuthTest = function () {
    console.group('===== Mizu Auth Diagnostics =====');

    // 1) Client
    console.log('1. Supabase Client  :', supabaseClient ? 'OK' : 'FAILED');

    // 2) User
    console.log('2. window.__user    :', window.__user || '(not logged in)');

    // 3) Flag
    console.log('3. __authRequired   :', window.__authRequired);

    // 4) localStorage session
    var sk  = 'sb-' + SUPABASE_REF + '-auth-token';
    var sd  = localStorage.getItem(sk);
    console.log('4. localStorage key :', sk);
    console.log('   value            :', sd ? 'YES (' + sd.length + ' bytes)' : 'NO');

    // 5) state.user
    console.log('5. state.user       :', (typeof state !== 'undefined' && state.user) ? state.user : '(empty)');

    // 6) Async session
    if (supabaseClient) {
      supabaseClient.auth.getSession().then(function (r) {
        var s = r.data.session;
        console.log('6. Active session   :', s ? 'YES — ' + s.user.email : 'NO');
        if (s) {
          console.log('   expires_at       :', new Date(s.expires_at * 1000).toLocaleString());
          console.log('   user_metadata    :', s.user.user_metadata);
        }
        console.groupEnd();
      });
    } else {
      console.log('6. (cannot check — no client)');
      console.groupEnd();
    }

    // 返回手动测试函数
    return {
      /** 手动注册：__mizuAuthTest().register('123456','TestUser','password123') */
      register: function (qq, name, pwd) {
        if (!supabaseClient) return Promise.reject('No client');
        return supabaseClient.auth.signUp({
          email: qqToEmail(qq), password: pwd,
          options: { data: { user_name: name, qq: qq } }
        }).then(function (r) { console.log('Register result:', r.error ? r.error.message : 'OK', r); return r; });
      },
      /** 手动登录：__mizuAuthTest().login('123456','password123') */
      login: function (qq, pwd) {
        if (!supabaseClient) return Promise.reject('No client');
        return supabaseClient.auth.signInWithPassword({ email: qqToEmail(qq), password: pwd })
          .then(function (r) { console.log('Login result:', r.error ? r.error.message : 'OK', r); return r; });
      },
      /** 手动退出 */
      logout: function () { return handleSignOut(); }
    };
  };

  console.log('[auth.js] loaded | hasLocalSession:', hasLocalSession, '| __authRequired:', window.__authRequired);
})();
