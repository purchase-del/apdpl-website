/*!
 * APDPL Administrator Login — LOCAL PROTOTYPE (stage 1)
 *
 * NOT SECURE. Everything in this file is visible to anyone who views the
 * page source. This only demonstrates the hidden trigger, login modal and
 * dashboard UI. Do not use it to protect real content or data.
 *
 * Structure:
 *   1. PrototypeAuth  — the ONLY place that knows about credentials/sessions.
 *                       Replace this block with real authentication later.
 *   2. UI             — trigger, login modal, dashboard. Talks to the auth
 *                       layer only through login(), logout(), isAuthenticated().
 */
(function () {
  'use strict';

  /* ==================================================================
   * 1. TEMPORARY AUTH LAYER — PROTOTYPE ONLY, REPLACE WITH REAL AUTH
   * ------------------------------------------------------------------
   * Contract the UI relies on (keep this shape when replacing):
   *   username                       -> display name shown in the form
   *   login(user, pass)  -> Promise<{ ok: boolean, message?: string }>
   *   logout()           -> Promise<void>
   *   isAuthenticated()  -> boolean
   * The session lives in memory only: a page refresh signs out.
   * ================================================================== */
  var PrototypeAuth = (function () {
    var USERNAME = 'APDPL';
    var SALT = 'apdpl-proto-v1:';
    // Salted SHA-256 of the temporary password. This is obfuscation, not
    // protection: the hash and salt are public and the password is weak.
    var PASSWORD_HASH = 'bfef6b23b56705b2bff2db482c2f44e5faff245912a9202196ae7524ed22a887';
    var signedIn = false;

    function sha256Hex(text) {
      if (!(window.crypto && window.crypto.subtle)) {
        return Promise.reject(new Error('nocrypto'));
      }
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      });
    }

    return {
      username: USERNAME,
      isAuthenticated: function () { return signedIn; },
      login: function (user, pass) {
        return sha256Hex(SALT + pass).then(function (hash) {
          var ok = String(user).trim() === USERNAME && hash === PASSWORD_HASH;
          signedIn = ok;
          return ok ? { ok: true } : { ok: false, message: 'Incorrect username or password.' };
        }, function () {
          return { ok: false, message: 'This browser context cannot run the prototype check. Open the site via http://localhost.' };
        });
      },
      logout: function () { signedIn = false; return Promise.resolve(); }
    };
  })();

  /* ==================================================================
   * 2. UI
   * ================================================================== */
  var doc = document;
  var html = doc.documentElement;
  var CLICKS_NEEDED = 5;
  var WINDOW_MS = 3000;

  // Load admin stylesheet (kept separate so the public page CSS is untouched).
  (function loadCss() {
    var src = (doc.currentScript && doc.currentScript.src) || '';
    var href = src ? src.replace(/admin-prototype\.js(\?.*)?$/, 'admin-prototype.css') : 'assets/admin/admin-prototype.css';
    var link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    doc.head.appendChild(link);
  })();

  function el(tag, attrs, children) {
    var n = doc.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  var lastFocus = null;
  var modal = null;
  var dash = null;

  function lockScroll(on) { html.classList.toggle('apx-lock', on); }

  /* ---------- Login modal ---------- */
  function openLogin() {
    if (PrototypeAuth.isAuthenticated()) { openDashboard(); return; }
    if (modal) return;
    lastFocus = doc.activeElement;

    var userInput = el('input', { type: 'text', id: 'apxUser', autocomplete: 'username', spellcheck: 'false', required: '' });
    userInput.value = PrototypeAuth.username;
    var passInput = el('input', { type: 'password', id: 'apxPass', autocomplete: 'current-password', required: '' });
    var eye = el('button', { type: 'button', class: 'apx-eye', 'aria-label': 'Show password', text: 'Show' });
    var err = el('div', { class: 'apx-error', role: 'alert', 'aria-live': 'assertive' });
    var submit = el('button', { type: 'submit', class: 'apx-btn apx-btn-primary', text: 'Sign in' });
    var cancel = el('button', { type: 'button', class: 'apx-btn apx-btn-ghost', text: 'Cancel' });

    var form = el('form', { class: 'apx-form', novalidate: '' }, [
      el('div', { class: 'apx-field' }, [el('label', { for: 'apxUser', text: 'Username' }), userInput]),
      el('div', { class: 'apx-field' }, [
        el('label', { for: 'apxPass', text: 'Password' }),
        el('div', { class: 'apx-pw' }, [passInput, eye])
      ]),
      err,
      el('div', { class: 'apx-actions' }, [cancel, submit]),
      el('p', { class: 'apx-proto-note', text: 'Local prototype only — not a secure login.' })
    ]);

    var card = el('div', { class: 'apx-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'apxTitle' }, [
      el('span', { class: 'apx-eyebrow', text: 'ADMINISTRATOR' }),
      el('h2', { id: 'apxTitle', text: 'Sign in' }),
      el('p', { class: 'apx-sub', text: 'Aushad Pharma Distributors — administration area.' }),
      form
    ]);

    modal = el('div', { class: 'apx-overlay apx-modal', 'data-apx': '' }, [card]);
    doc.body.appendChild(modal);
    lockScroll(true);
    requestAnimationFrame(function () { modal.classList.add('apx-in'); passInput.focus(); });

    eye.addEventListener('click', function () {
      var show = passInput.type === 'password';
      passInput.type = show ? 'text' : 'password';
      eye.textContent = show ? 'Hide' : 'Show';
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    cancel.addEventListener('click', closeLogin);
    modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeLogin(); });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeLogin(); return; }
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = card.querySelectorAll('input, button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      if (!userInput.value.trim() || !passInput.value) { err.textContent = 'Enter your username and password.'; return; }
      submit.disabled = true; submit.textContent = 'Checking…';
      PrototypeAuth.login(userInput.value, passInput.value).then(function (res) {
        if (res.ok) {
          closeLogin(true);
          openDashboard();
        } else {
          submit.disabled = false; submit.textContent = 'Sign in';
          err.textContent = res.message || 'Sign-in failed.';
          passInput.value = ''; passInput.focus();
          card.classList.remove('apx-shake'); void card.offsetWidth; card.classList.add('apx-shake');
        }
      });
    });
  }

  function closeLogin(keepLock) {
    if (!modal) return;
    var m = modal; modal = null;
    m.classList.remove('apx-in');
    setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 250);
    if (!keepLock) { lockScroll(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  }

  /* ---------- Dashboard ---------- */
  function openDashboard() {
    if (dash) return;
    lockScroll(true);

    var sectionCount = doc.querySelectorAll('main section[id]').length;
    var logoutBtn = el('button', { type: 'button', class: 'apx-btn apx-btn-logout', text: 'Logout' });

    function navItem(label, active, soon) {
      var b = el('button', { type: 'button', class: 'apx-nav-item' + (active ? ' is-active' : ''), text: label });
      if (soon) { b.setAttribute('disabled', ''); b.appendChild(el('em', { text: 'Soon' })); }
      else if (active) b.setAttribute('aria-current', 'page');
      return b;
    }

    function stat(label, value, note) {
      return el('div', { class: 'apx-stat' }, [
        el('small', { text: label }),
        el('strong', { text: value }),
        el('span', { text: note })
      ]);
    }

    function task(title, text) {
      return el('div', { class: 'apx-task' }, [
        el('div', {}, [el('h4', { text: title }), el('p', { text: text })]),
        el('span', { class: 'apx-pill', text: 'COMING NEXT' })
      ]);
    }

    var sidebar = el('aside', { class: 'apx-side' }, [
      el('div', { class: 'apx-side-brand' }, [el('span', { class: 'apx-mark', text: 'A' }), el('div', {}, [el('b', { text: 'Aushad' }), el('small', { text: 'Admin Console' })])]),
      el('nav', { class: 'apx-nav', 'aria-label': 'Admin sections' }, [
        navItem('Overview', true), navItem('Website Content', false, true), navItem('Contact Details', false, true), navItem('Settings', false, true)
      ]),
      el('p', { class: 'apx-side-note', text: 'Prototype build — navigation items marked Soon are not active yet.' })
    ]);

    var main = el('main', { class: 'apx-main' }, [
      el('div', { class: 'apx-banner', role: 'note', text: 'Local prototype. This sign-in is a temporary demo and is not secure authentication.' }),
      el('h1', { text: 'Welcome, ' + PrototypeAuth.username }),
      el('p', { class: 'apx-lead', text: 'This is the administration dashboard. Content editing will be added in the next stage.' }),
      el('div', { class: 'apx-stats' }, [
        stat('Website sections', String(sectionCount), 'Read from the live page'),
        stat('Editable content', '0', 'Editor not built yet'),
        stat('Session', 'Active', 'Ends on logout or page refresh')
      ]),
      el('h3', { class: 'apx-h3', text: 'Planned tools' }),
      el('div', { class: 'apx-tasks' }, [
        task('Edit headings & paragraphs', 'Update website wording without touching HTML.'),
        task('About, Vision & Mission', 'Manage company story sections.'),
        task('Services & contact details', 'Keep services, address, phone and email current.'),
        task('Preview before publishing', 'Review changes, then Save or Cancel.')
      ])
    ]);

    var top = el('header', { class: 'apx-top' }, [
      el('div', { class: 'apx-top-title' }, [el('span', { class: 'apx-mark', text: 'A' }), el('b', { text: 'Admin Console' })]),
      el('div', { class: 'apx-top-right' }, [el('span', { class: 'apx-user', text: PrototypeAuth.username }), logoutBtn])
    ]);

    dash = el('div', { class: 'apx-overlay apx-dash', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Administrator dashboard', 'data-apx': '' }, [
      top, el('div', { class: 'apx-body' }, [sidebar, main])
    ]);
    doc.body.appendChild(dash);
    requestAnimationFrame(function () { dash.classList.add('apx-in'); logoutBtn.focus(); });

    logoutBtn.addEventListener('click', function () {
      PrototypeAuth.logout().then(closeDashboard);
    });
    dash.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { // trap focus inside the dashboard
        var f = dash.querySelectorAll('button:not([disabled])');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function closeDashboard() {
    if (!dash) return;
    var d = dash; dash = null;
    d.classList.remove('apx-in');
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 250);
    lockScroll(false);
    window.scrollTo(0, 0);
    var logo = doc.querySelector('.brand');
    if (logo && logo.focus) logo.focus({ preventScroll: true });
  }

  /* ---------- Hidden trigger: 5 clicks on the header logo within 3 s ---------- */
  var brand = doc.querySelector('header .brand');
  var stamps = [];
  if (brand) {
    brand.addEventListener('click', function (e) {
      var now = Date.now();
      stamps.push(now);
      stamps = stamps.filter(function (t) { return now - t <= WINDOW_MS; });
      if (stamps.length >= CLICKS_NEEDED) {
        stamps = [];
        e.preventDefault(); // the 5th click opens the login instead of jumping to #top
        openLogin();
      }
    });
  }
})();
