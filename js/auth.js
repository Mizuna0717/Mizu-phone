// ========== auth.js v2.1 ==========
// Mizu Phone — Supabase Authentication Module
// ★ v2.1: 增强登录调试日志，确保 qqToEmail 在所有路径被调用
(function () {
  'use strict';

  var AUTH_VERSION = '2.1';   // ★ 版本标记，用于确认浏览器加载了最新版

  // ═══════════════════════════════════════════════
  //  常量
  // ═══════════════════════════════════════════════
  var SUPABASE_URL      = 'https://rnhsuityufzkllaxflgw.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHN1aXR5dWZ6a2xsYXhmbGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NzA1NTIsImV4cCI6MjEwMzU0NjU1Mn0.sRHOHePQxhGT4ho8lzQTPukbTTxtLIskyGZKizDFALc';
  var SUPABASE_REF      = 'rnhsuityufzkllaxflgw';
  var EMAIL_SUFFIX      = '@qq.com';

  // ═══════════════════════════════════════════════
  //  1. 初始化 Supabase Client
  // ═══════════════════════════════════════════════
  var supabaseClient = null;
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('[auth v' + AUTH_VERSION + '] Supabase client initialized');
    } else {
      console.error('[auth] supabase SDK not loaded');
    }
  } catch (e) {
    console.error('[auth] Failed to init Supabase:', e);
  }
  window.__supabase = supabaseClient;

  // ═══════════════════════════════════════════════
  //  2. 同步 Session 检测
  // ═══════════════════════════════════════════════
  var hasLocalSession = false;
  try {
    var raw = localStorage.getItem('sb-' + SUPABASE_REF + '-auth-token');
    if (raw) {
      var parsed = JSON.parse(raw);
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

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ═══════════════════════════════════════════════
  //  4. QQ 号 ↔ Email 转换
  // ═══════════════════════════════════════════════

  /** QQ 号 → 邮箱（传给 Supabase）
   *  ★ 核心函数：确保纯数字 QQ 号变成合法 email
   *  '123456789' → '123456789@qq.com'
   */
  function qqToEmail(qq) {
    // 安全检查：如果已经包含 @ 就不再拼接
    if (qq.indexOf('@') > -1) {
      console.warn('[auth] qqToEmail: input already contains @, returning as-is:', qq);
      return qq;
    }
    var result = qq + EMAIL_SUFFIX;
    console.log('[auth] qqToEmail:', qq, '→', result);
    return result;
  }

  /** 邮箱 → QQ 号 */
  function emailToQQ(email) {
    if (!email) return '';
    return email.replace(/@qq\.com$/i, '')
                .replace(/@qq\.mizu\.phone$/i, '');
  }

  // ═══════════════════════════════════════════════
  //  5. 用户数据管理
  // ═══════════════════════════════════════════════
  function setUserFromSession(session) {
    if (!session || !session.user) return;
    var u    = session.user;
    var meta = u.user_metadata || {};
    var info = {
      id:     u.id,
      email:  u.email,
      qq:     meta.qq || emailToQQ(u.email),
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
  //  6. 表单 UI 控制
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
      if (tt) tt.textContent = '\u767B\u5F55';
    } else {
      if (lf) lf.style.display = 'none';
      if (rf) rf.style.display = 'block';
      if (tt) tt.textContent = '\u6CE8\u518C';
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
  //  7. 注册 / 登录 / 退出
  // ═══════════════════════════════════════════════

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
    if (qq.length < 5 || qq.length > 12) { showAuthError('QQ 号长度应为 5~12 位'); return; }
    if (!name)                { showAuthError('请输入用户名');         return; }
    if (name.length > 20)     { showAuthError('用户名不超过 20 个字符'); return; }
    if (!pwd)                 { showAuthError('请输入密码');           return; }
    if (pwd.length < 6)       { showAuthError('密码至少 6 位');       return; }
    if (pwd !== pwd2)         { showAuthError('两次密码不一致');      return; }
    if (!supabaseClient)      { showAuthError('认证服务未初始化');     return; }

    setAuthLoading(true);

    try {
      var email = qqToEmail(qq);
      console.log('[auth][register] QQ:', qq, '| email:', email, '| name:', name);

      var res = await supabaseClient.auth.signUp({
        email: email,
        password: pwd,
        options: {
          data: {
            user_name: name,
            qq: qq
          }
        }
      });

      if (res.error) {
        var m = res.error.message || '';
        console.error('[auth][register] Error:', m);
        if (m.indexOf('already') > -1 || m.indexOf('already_exists') > -1) {
          showAuthError('该 QQ 号已注册，请直接登录');
        } else if (m.indexOf('valid email') > -1 || m.indexOf('invalid') > -1) {
          showAuthError('QQ 号格式不正确，请输入纯数字');
        } else if (m.indexOf('password') > -1) {
          showAuthError('密码不符合要求（至少 6 位）');
        } else {
          showAuthError('注册失败: ' + m);
        }
        setAuthLoading(false);
        return;
      }

      console.log('[auth][register] signUp OK | session:', !!res.data.session);

      if (res.data.session) {
        setUserFromSession(res.data.session);
        onAuthSuccess();
        return;
      }

      console.log('[auth][register] No session, trying signIn...');
      var si = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: pwd
      });

      if (si.error) {
        showAuthError('注册成功，但需要在 Supabase 后台关闭邮箱确认（Confirm email）才能登录');
        switchAuthMode('login');
      } else {
        setUserFromSession(si.data.session);
        onAuthSuccess();
      }
    } catch (e) {
      console.error('[auth][register] Exception:', e);
      showAuthError('注册失败: ' + (e.message || '网络错误'));
    } finally {
      setAuthLoading(false);
    }
  }

  /** ─── 登录 ─── */
  async function handleLogin() {
    clearAuthError();

    var qqInput  = document.getElementById('loginQQ');
    var pwdInput = document.getElementById('loginPassword');

    var qq  = qqInput  ? qqInput.value  : '';
    var pwd = pwdInput ? pwdInput.value : '';

    qq = qq.trim();

    // ★ 调试：打印原始输入
    console.log('[auth][login] RAW input | qq:', JSON.stringify(qq), '| pwd length:', pwd.length);

    // ── 前端校验 ──
    if (!qq)                { showAuthError('请输入 QQ 号');       return; }
    if (!/^\d+$/.test(qq))  { showAuthError('QQ 号必须为纯数字');  return; }
    if (!pwd)               { showAuthError('请输入密码');         return; }
    if (!supabaseClient)    { showAuthError('认证服务未初始化');    return; }

    setAuthLoading(true);

    try {
      // ★★★ 核心修复点：QQ 号 → email ★★★
      var email = qqToEmail(qq);

      // ★ 二次验证：确保 email 包含 @
      if (email.indexOf('@') === -1) {
        console.error('[auth][login] FATAL: qqToEmail failed! email:', email);
        showAuthError('系统错误：邮箱转换失败，请刷新重试');
        setAuthLoading(false);
        return;
      }

      console.log('[auth][login] QQ:', qq, '→ email:', email);

      var res = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: pwd
      });

      console.log('[auth][login] Supabase response | error:', res.error ? res.error.message : 'none', '| session:', !!res.data.session);

      if (res.error) {
        var m = res.error.message || '';
        if (m.indexOf('Invalid login') > -1 || m.indexOf('invalid') > -1) {
          showAuthError('QQ 号或密码错误');
        } else if (m.indexOf('Email not confirmed') > -1) {
          showAuthError('账号未激活，请在 Supabase 后台关闭邮箱确认');
        } else if (m.indexOf('too many') > -1 || m.indexOf('rate') > -1) {
          showAuthError('登录尝试过于频繁，请稍后再试');
        } else {
          showAuthError('登录失败: ' + m);
        }
        setAuthLoading(false);
        return;
      }

      console.log('[auth][login] SUCCESS | user:', res.data.user.email);
      setUserFromSession(res.data.session);
      onAuthSuccess();
    } catch (e) {
      console.error('[auth][login] Exception:', e);
      showAuthError('登录失败: ' + (e.message || '网络错误'));
    } finally {
      setAuthLoading(false);
    }
  }

  /** ─── 退出 ─── */
  async function handleSignOut() {
    if (!supabaseClient) return;
    try {
      await supabaseClient.auth.signOut();
      console.log('[auth] Signed out');
    } catch (e) {
      console.error('[auth] signOut error:', e);
    }
    clearUser();
    showAuthScreen();
    ['loginQQ','loginPassword','regQQ','regName','regPassword','regPasswordConfirm']
      .forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
  }

  // ═══════════════════════════════════════════════
  //  8. 认证成功后回调
  // ═══════════════════════════════════════════════
  function onAuthSuccess() {
    window.__authRequired = false;
    hideAuthScreen();
    showApp();

    if (typeof window.__runAppInit === 'function') {
      try {
        window.__runAppInit();
        console.log('[auth] App initialized in-place');
        return;
      } catch (e) {
        console.warn('[auth] In-place init failed, reloading:', e);
      }
    }
    location.reload();
  }

  // ═══════════════════════════════════════════════
  //  9. onAuthStateChange 监听
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

    supabaseClient.auth.getSession().then(function (r) {
      if (r.data.session) {
        setUserFromSession(r.data.session);
        window.__authRequired = false;
        console.log('[auth] Session verified OK');
      } else if (hasLocalSession) {
        console.warn('[auth] Cached session invalid');
        window.__authRequired = true;
        whenReady(showAuthScreen);
      }
    }).catch(function (e) {
      console.error('[auth] getSession error:', e);
    });
  } else {
    window.__authRequired = true;
    whenReady(function () {
      showAuthScreen();
      showAuthError('认证服务加载失败，请刷新页面重试');
    });
  }

  // ═══════════════════════════════════════════════
  //  10. DOM 事件绑定
  // ═══════════════════════════════════════════════
  function bindAuthEvents() {
    var regBtn = document.getElementById('authRegisterBtn');
    if (regBtn) regBtn.addEventListener('click', function (e) { e.preventDefault(); handleRegister(); });

    var loginBtn = document.getElementById('authLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', function (e) { e.preventDefault(); handleLogin(); });

    var toReg = document.getElementById('switchToRegister');
    if (toReg) toReg.addEventListener('click', function (e) { e.preventDefault(); switchAuthMode('register'); });

    var toLogin = document.getElementById('switchToLogin');
    if (toLogin) toLogin.addEventListener('click', function (e) { e.preventDefault(); switchAuthMode('login'); });

    // Enter 快捷键
    var lq = document.getElementById('loginQQ');
    if (lq) lq.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); handleLogin(); } });

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

    console.log('[auth v' + AUTH_VERSION + '] Events bound | loginBtn:', !!loginBtn, '| regBtn:', !!regBtn);
  }

  whenReady(bindAuthEvents);

  // ═══════════════════════════════════════════════
  //  11. 设置页退出登录区块渲染
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
  //  12. 全局导出
  // ═══════════════════════════════════════════════
  window.mizuAuth = {
    version:               AUTH_VERSION,
    signOut:               handleSignOut,
    getUser:               function () { return window.__user; },
    isAuthenticated:       function () { return !!window.__user; },
    switchMode:            switchAuthMode,
    renderSettingsSection: renderAuthSettingsSection,
    client:                supabaseClient,
    // ★ 暴露转换函数供调试
    qqToEmail:             qqToEmail,
    emailToQQ:             emailToQQ
  };

  // ═══════════════════════════════════════════════
  //  13. 一键测试工具
  // ═══════════════════════════════════════════════
  window.__mizuAuthTest = function () {
    console.group('===== Mizu Auth Diagnostics (v' + AUTH_VERSION + ') =====');

    console.log('1. Auth version     :', AUTH_VERSION);
    console.log('2. EMAIL_SUFFIX     :', EMAIL_SUFFIX);
    console.log('3. Supabase Client  :', supabaseClient ? 'OK' : 'FAILED');
    console.log('4. window.__user    :', window.__user || '(not logged in)');
    console.log('5. __authRequired   :', window.__authRequired);

    // ★ 测试 qqToEmail 转换
    var testQQ = '123456789';
    var testEmail = qqToEmail(testQQ);
    var convertOK = testEmail === '123456789@qq.com';
    console.log('6. qqToEmail test   :', testQQ, '→', testEmail, convertOK ? 'OK' : 'BROKEN!');

    var sk  = 'sb-' + SUPABASE_REF + '-auth-token';
    var sd  = localStorage.getItem(sk);
    console.log('7. localStorage key :', sk);
    console.log('   value            :', sd ? 'YES (' + sd.length + ' bytes)' : 'NO');
    console.log('8. state.user       :', (typeof state !== 'undefined' && state.user) ? state.user : '(empty)');

    if (supabaseClient) {
      supabaseClient.auth.getSession().then(function (r) {
        var s = r.data.session;
        console.log('9. Active session   :', s ? 'YES — ' + s.user.email : 'NO');
        if (s) {
          console.log('   expires_at       :', new Date(s.expires_at * 1000).toLocaleString());
          console.log('   user_metadata    :', JSON.stringify(s.user.user_metadata, null, 2));
        }
        console.groupEnd();
      });
    } else {
      console.log('9. (cannot check — no client)');
      console.groupEnd();
    }

    return {
      register: function (qq, name, pwd) {
        if (!supabaseClient) return Promise.reject('No client');
        var email = qqToEmail(qq);
        console.log('[test] Registering | QQ:', qq, '→ email:', email, '| name:', name);
        return supabaseClient.auth.signUp({
          email: email,
          password: pwd,
          options: { data: { user_name: name, qq: qq } }
        }).then(function (r) {
          if (r.error) {
            console.error('[test] Register FAILED:', r.error.message);
          } else {
            console.log('[test] Register OK');
            console.log('  user_id:', r.data.user ? r.data.user.id : 'N/A');
            console.log('  session:', r.data.session ? 'YES' : 'NO (需关闭邮箱确认)');
            if (r.data.user && r.data.user.user_metadata) {
              console.log('  user_metadata:', JSON.stringify(r.data.user.user_metadata, null, 2));
            }
          }
          return r;
        });
      },
      login: function (qq, pwd) {
        if (!supabaseClient) return Promise.reject('No client');
        var email = qqToEmail(qq);
        console.log('[test] Login | QQ:', qq, '→ email:', email);
        return supabaseClient.auth.signInWithPassword({
          email: email,
          password: pwd
        }).then(function (r) {
          if (r.error) {
            console.error('[test] Login FAILED:', r.error.message);
            console.log('[test] Sent email was:', email);
          } else {
            console.log('[test] Login OK');
            console.log('  user_id:', r.data.user.id);
            console.log('  email:', r.data.user.email);
            console.log('  user_metadata:', JSON.stringify(r.data.user.user_metadata, null, 2));
          }
          return r;
        });
      },
      logout: function () { return handleSignOut(); }
    };
  };

  console.log('[auth.js] v' + AUTH_VERSION + ' loaded | EMAIL_SUFFIX:', EMAIL_SUFFIX, '| hasLocalSession:', hasLocalSession, '| __authRequired:', window.__authRequired);
})();
