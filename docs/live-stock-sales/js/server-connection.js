(function () {
  'use strict';
  var root = document.querySelector('[data-server-url]');
  if (!root) return;
  var url = root.getAttribute('data-server-url');
  var name = root.getAttribute('data-server-name');
  var $ = function (id) { return document.getElementById(id); };
  var bar = $('sc-bar'), progress = $('sc-progress'), stageEl = $('sc-stage'), statusEl = $('sc-status'),
      fail = $('sc-fail'), failMsg = $('sc-fail-msg'), dots = $('sc-dots'), pips = document.querySelectorAll('.sc-steps li');
  var STAGES = [
    { t: 'Initialising connection', s: 'Setting up your request for ' + name + '.' },
    { t: 'Preparing server access', s: 'Running a preliminary check. This is informational only.' },
    { t: 'Opening distribution portal', s: 'Preparing to open the Live Stock & Sales portal.' },
    { t: 'Redirecting', s: 'Handing you over to ' + name + '. Server availability is not verified by this page.' }
  ];
  var STEP_MS = 700, SLOW_MS = 10000;
  var running = false, redirected = false, token = 0, slowTimer = null;

  function setStage(i) {
    stageEl.firstChild.textContent = STAGES[i].t;
    statusEl.textContent = STAGES[i].s;
    var pct = Math.round(((i + 1) / STAGES.length) * 100);
    bar.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', pct);
    pips.forEach(function (p, k) { p.classList.toggle('on', k <= i); });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Opaque no-cors probe. Success only means *some* response arrived;
  // failure is NOT treated as "offline" (mixed content / CORS / network can all cause it).
  function probe() {
    if (!window.fetch) return Promise.resolve(false);
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
    return fetch(url, { mode: 'no-cors', cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function () { return true; }, function () { return false; })
      .then(function (ok) { clearTimeout(t); return ok; });
  }

  function showFailure(msg) {
    running = false;
    clearTimeout(slowTimer);
    dots.hidden = true;
    stageEl.firstChild.textContent = 'Connection not completed';
    statusEl.textContent = 'Use one of the options below.';
    failMsg.textContent = msg;
    fail.hidden = false;
    var first = fail.querySelector('button,a');
    if (first) first.focus();
  }

  function start() {
    if (running || redirected) return;   // no duplicate runs / redirects
    running = true;
    var my = ++token;
    fail.hidden = true; dots.hidden = false;
    setStage(0);
    var probed = null;
    wait(STEP_MS).then(function () {
      if (my !== token) return;
      setStage(1); probed = probe();
      return wait(STEP_MS);
    }).then(function () {
      if (my !== token) return;
      setStage(2);
      return Promise.all([wait(STEP_MS), probed]);
    }).then(function (res) {
      if (my !== token) return;
      setStage(3);
      if (res && res[1]) statusEl.textContent = 'A preliminary request received a response. Redirecting to ' + name + '.';
      redirected = true;
      // replace(): this page leaves history, so Back returns to server selection — no loop.
      location.replace(url);
      // If we are still here, the browser has not navigated yet.
      slowTimer = setTimeout(function () {
        redirected = false;
        showFailure('The portal has not opened yet. The server may be slow, unreachable, or blocked by your network or browser.');
      }, SLOW_MS);
    });
  }

  $('sc-retry').addEventListener('click', function () { redirected = false; start(); });
  window.addEventListener('pageshow', function (e) {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (e.persisted || (nav && nav.type === 'back_forward')) {
      // Returned via history: never auto-redirect again.
      redirected = false; token++;
      showFailure('You returned to this page. Choose how to continue.');
    } else if (!running && !redirected) { start(); }
  });
})();
