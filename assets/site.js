/* Forge Apps — fills every page from assets/apps.js. No libraries needed.
   Apps with "hidden": true in apps.js stay off the website until you untick it in the admin panel. */
(function () {
  // ?preview=1 (opened from the admin panel): show the changes that are not published yet
  if (/[?&]preview=1/.test(location.search)) { try { var PV = JSON.parse(localStorage.getItem('forge-preview') || 'null'); if (PV && PV.apps) window.FORGE = PV; } catch (e) {} }
  var F = window.FORGE || { apps: [] };
  var V = (F.apps || []).filter(function (a) { return !a.hidden; });          // apps shown on the site
  if (F.theme && F.theme !== 'soft') document.documentElement.setAttribute('data-theme', F.theme);   // site look, picked in the admin
  var root = document.documentElement.getAttribute('data-root') || '';
  var STAGES = ['idea', 'build', 'test', 'live'];
  var STAGE_LABEL = { idea: 'Idea', build: 'Build', test: 'Test', live: 'Live' };
  var STAGE_WORD = { idea: 'Idea', build: 'Being built', test: 'In testing', live: 'On Google Play' };
  var FILTER_LABEL = { live: 'On Google Play', test: 'In testing', build: 'Being built', idea: 'Ideas' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  // Prices: each visitor sees Google Play's price for their own country (assets/prices.js, found from the time zone).
  // When the country can't be told, no amount is shown: Google Play shows it in their currency.
  var PRO_PRICE = (function () {
    try { var P = window.FORGE_PRICES; if (!P) return null; var z = Intl.DateTimeFormat().resolvedOptions().timeZone; var c = P.zones[z]; return (c && P.wealthon[c]) || null; } catch (e) { return null; }
  })();
  var localPrice = function (t) { return String(t).replace(/\s*₹[\d,]+\s*/g, PRO_PRICE ? ' ' + PRO_PRICE + ' ' : ' ').replace(/\s{2,}/g, ' ').trim(); };
  var url = function (p) { return !p ? '' : /^(data:|https?:|\/)/.test(p) ? p : root + p; };
  var shotSrc = function (x) { return typeof x === 'string' ? x : x.src; };
  var shotCap = function (x) { return typeof x === 'string' ? '' : (x.caption || ''); };
  var ytId = function (u) { var m = String(u).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : ''; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var bySlug = function (s) { return (F.apps || []).filter(function (a) { return a.slug === s; })[0]; };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IC = {
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    play: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>'
  };

  function vars(c) {
    c = c || {};
    return '--app-bg:' + (c.bg || '#1C1F26') + ';--app-bg2:' + (c.bg2 || '#111318') + ';--app-acc:' + (c.accent || '#FF6A2B') +
      ';--app-soft:' + (c.soft || '#C9CCD3') + ';--app-tx:' + (c.text || '#FFFFFF') + ';--app-btnbg:' + (c.btnBg || '#FFFFFF') + ';--app-btntx:' + (c.btnText || '#111318');
  }
  function tracker(app) {
    var cur = STAGES.indexOf(app.stage);
    return '<div class="stage" role="img" aria-label="Stage: ' + esc(STAGE_LABEL[app.stage] || app.stage) + '. ' + esc(app.stageNote || '') + '"><ol aria-hidden="true">' +
      STAGES.map(function (s, i) {
        return '<li class="' + (i < cur ? 'done' : i === cur ? 'now' : '') + '"><span class="track"><span class="dotx"></span>' + (i < 3 ? '<span class="line"></span>' : '') + '</span>' + STAGE_LABEL[s] + '</li>';
      }).join('') + '</ol>' + (app.stageNote ? '<p class="stage-note">' + esc(app.stageNote) + '</p>' : '') + '</div>';
  }

  // Opening the files straight from the computer (file://): make folder links open their index.html.
  if (location.protocol === 'file:') {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#|data:)/.test(h)) return;
      var m = h.match(/^([^#?]*)([?#].*)?$/), path = m[1], rest = m[2] || '';
      if (path === '' || path.slice(-1) === '/' || path === '.' || path === '..') {
        if (path === '.' || path === '..') path += '/';
        e.preventDefault(); location.href = (path || './') + 'index.html' + rest;
      }
    }, true);
  }

  // ---------- top bar: the app link, and the full-screen menu on phones ----------
  var navApp = V[0];
  $$('[data-nav-app]').forEach(function (a) {
    if (!navApp) { a.hidden = true; return; }
    a.textContent = navApp.name; a.href = root + navApp.slug + '/';
    if (document.documentElement.getAttribute('data-app') === navApp.slug) a.setAttribute('aria-current', 'page');
  });
  var header = $('.topbar'), toggle = $('.menubtn');
  if (header && toggle) {
    toggle.innerHTML = '<span class="burger" aria-hidden="true"><i></i><i></i></span>';
    var panel = document.createElement('div');
    panel.className = 'fs-menu'; panel.id = 'fs-menu'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Menu');
    document.body.appendChild(panel);
    toggle.setAttribute('aria-controls', 'fs-menu');
    var page = document.documentElement.getAttribute('data-page') || '';
    var appNow = document.documentElement.getAttribute('data-app') || '';
    var build = function () {
      var items = [[root || './', 'Home', page === 'home'], [root + 'apps/', 'Apps', page === 'apps']];
      items.push([root + '#approach', 'Approach', false], [root + 'contact/', 'Contact', page === 'contact']);
      var soc = ['instagram', 'youtube', 'facebook'].filter(function (k) { return F[k]; }).map(function (k) { return '<a class="soc card" href="' + esc(F[k]) + '" target="_blank" rel="noopener" aria-label="' + k + '">' + SOC[k] + '</a>'; }).join('');
      panel.innerHTML = '<div class="wrap"><nav aria-label="Pages">' + items.map(function (it, i) {
        return '<a href="' + it[0] + '" style="--i:' + i + '"' + (it[2] ? ' aria-current="page"' : '') + '>' + esc(it[1]) + '<span>' + IC.arrow + '</span></a>';
      }).join('') + '</nav>' +
        '<a class="btn btn-accent" href="' + root + '#early" data-track="menu-tester">Become a tester ' + IC.arrow + '</a>' +
        '<div class="fs-foot"><a class="mail" href="mailto:' + esc(F.email) + '">' + esc(F.email) + '</a><div class="socials">' + soc + '</div></div></div>';
    };
    var closeT;
    var setOpen = function (open, instant) {
      clearTimeout(closeT); panel.classList.remove('closing');
      if (open) { build(); panel.hidden = false; }
      else if (instant || panel.hidden) panel.hidden = true;
      else { panel.classList.add('closing'); closeT = setTimeout(function () { panel.hidden = true; panel.classList.remove('closing'); }, 150); }
      header.classList.toggle('menu-open', open);
      document.documentElement.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { var f = panel.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
    };
    toggle.setAttribute('aria-label', 'Open menu'); toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false, true); toggle.focus(); } });
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 861px)');
      var onMq = function () { if (mq.matches && !panel.hidden) setOpen(false, true); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }
  }

  // ---------- year, email, socials ----------
  var SOC = {
    instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    youtube: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.8 15.1V8.9l5.7 3.1z"/></svg>',
    facebook: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3.1h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3.1h2.6V21z"/></svg>'
  };
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('[data-email]').forEach(function (el) {
    if (!F.email) return;
    if (!el.hasAttribute('data-keep')) el.textContent = F.email;
    if (el.tagName === 'A') el.href = 'mailto:' + F.email;
  });
  ['youtube', 'instagram', 'facebook'].forEach(function (k) {
    $$('[data-social="' + k + '"]').forEach(function (el) { if (F[k]) { el.href = F[k]; el.hidden = false; } else el.hidden = true; });
  });
  $$('[data-socials]').forEach(function (el) {
    el.innerHTML = ['instagram', 'youtube', 'facebook'].filter(function (k) { return F[k]; }).map(function (k) {
      var n = { instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook' }[k];
      return '<a class="soc card press" href="' + esc(F[k]) + '" target="_blank" rel="noopener" aria-label="Forge Apps on ' + n + '" title="' + n + '">' + SOC[k] + '</a>';
    }).join('');
  });
  $$('[data-count]').forEach(function (el) {
    var k = el.getAttribute('data-count');
    el.textContent = k === 'all' ? V.length : V.filter(function (a) { return a.stage === k; }).length;
  });

  // ---------- footer: the apps column ----------
  $$('[data-foot-apps]').forEach(function (el) {
    el.innerHTML = V.map(function (a) {
      return '<a href="' + root + a.slug + '/">' + esc(a.name) + (a.stage !== 'live' ? '<em>' + esc(STAGE_WORD[a.stage] || a.stage) + '</em>' : '') + '</a>';
    }).join('') + '<a href="' + root + 'apps/">All apps</a>' + (V.some(function (a) { return a.stage === 'test'; }) ? '<a href="' + root + '#early">Become a tester</a>' : '');
  });
  var pageApp = document.documentElement.getAttribute('data-app') || '';
  $$('[data-foot-legal]').forEach(function (el) {
    var a = pageApp && bySlug(pageApp), out = '<a href="' + root + 'privacy/">Website privacy</a>';
    var list = a ? [a] : V;
    list.forEach(function (x) {
      var b = root + x.slug + '/';
      out += '<a href="' + b + 'privacy/">' + esc(x.name) + ' privacy</a>' + (a ? '<a href="' + b + 'terms/">' + esc(x.name) + ' terms</a><a href="' + b + 'delete-account/">Delete ' + esc(x.name) + ' data</a>' : '');
    });
    el.innerHTML = out;
  });

  // ---------- home: one spotlight app + small tiles for the rest ----------
  // Spotlight = the app with "featured": true in apps.js, otherwise the most finished one (live, then testing, then build).
  var rank = { live: 0, test: 1, build: 2, idea: 3 };
  var spot = V.filter(function (a) { return a.featured; })[0] || V.slice().sort(function (a, b) { return (rank[a.stage] || 9) - (rank[b.stage] || 9); })[0];
  var stDot = function (st) { return '<span class="st st-' + esc(st) + '"><i></i>' + esc(STAGE_WORD[st] || st) + '</span>'; };
  var iconImg = function (a, n) { return '<img src="' + esc(url(a.icon)) + '" alt="" width="' + n + '" height="' + n + '" loading="lazy">'; };
  var ha = $('#hero-apps');
  if (ha && V.length) {
    var testing = V.filter(function (a) { return a.stage === 'test'; }).length, live = V.filter(function (a) { return a.stage === 'live'; }).length;
    ha.hidden = false;
    ha.innerHTML = '<span class="ha-icons">' + V.slice(0, 4).map(function (a) { return '<img src="' + esc(url(a.icon)) + '" alt="" width="34" height="34">'; }).join('') + '</span>' +
      '<span class="ha-text"><b>' + V.length + ' app' + (V.length > 1 ? 's' : '') + ' from the forge</b><span>' + [live ? live + ' live' : '', testing ? testing + ' in testing' : ''].filter(Boolean).join(' · ') + '<em> · Free on Android</em></span></span>' +
      '<span class="ha-arrow" aria-hidden="true">' + IC.arrow + '</span>';
  }
  var wg = $('#work-grid');
  if (wg && spot) {
    var sh = (spot.screens || [])[0], rest = V.filter(function (a) { return a !== spot; });
    wg.innerHTML = '<a class="wcard spotlight lift" data-zoom href="' + root + spot.slug + '/" data-slug="' + esc(spot.slug) + '" style="' + vars(spot.colors) + '">' +
        '<div class="wc-copy"><div class="wc-id">' + iconImg(spot, 56) + '<div><small>Spotlight · ' + esc(spot.kind || 'App') + '</small><h3>' + esc(spot.name) + '</h3></div></div>' +
        '<p>' + esc(spot.tagline) + '</p>' +
        (spot.points && spot.points.length ? '<ul class="pts">' + spot.points.slice(0, 3).map(function (p) { return '<li>' + IC.check + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="wc-foot"><span class="on-dark"><span class="live-dot' + (spot.stage === 'live' ? ' pulse' : '') + '"></span>' + esc(STAGE_WORD[spot.stage] || '') + '</span><span class="go">View app ' + IC.arrow + '</span></div></div>' +
        '<div class="wc-art">' + (sh ? '<img src="' + esc(url(shotSrc(sh))) + '" alt="' + esc(shotCap(sh) || spot.name + ' screen') + '" loading="lazy">' : '<img class="icon-big" src="' + esc(url(spot.icon)) + '" alt="">') + '</div></a>' +
      '<div class="tiles" data-stagger>' + [spot].concat(rest).map(function (a, i) {
        return '<a class="tile card lift' + (i === 0 ? ' tile-spot' : '') + '" href="' + root + a.slug + '/" data-slug="' + esc(a.slug) + '">' + iconImg(a, 52) +
          '<span class="t-body"><b>' + esc(a.name) + '</b><span class="t-line">' + esc(a.tagline) + '</span>' + stDot(a.stage) + '</span><span class="t-go" aria-hidden="true">' + IC.arrow + '</span></a>';
      }).join('') + '</div>' +
      '<a class="wnext card lift" href="' + root + 'contact/?topic=launch" data-track="next-app-notify"><span class="dash"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span><div><h3>More apps are in the forge</h3><p>Testers hear about new apps first. Get a note when the next one is ready.</p></div><span class="ul-link">Get notified</span></a>';
  }

  // ---------- home: top section, from "home.hero" in apps.js ----------
  var H = (F.home && F.home.hero) || null;
  var md = function (t) { return esc(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, a, h) { return '<a href="' + h + '"' + (/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '') + '>' + a + '</a>'; }); };
  if (H && $('.hero')) {
    var setT = function (k, v) { var el = $('[data-hero="' + k + '"]'); if (el && v) el.textContent = v; };
    setT('label', H.label); setT('text', H.text); setT('textPhone', H.textPhone || H.text);
    var lab = $('[data-hero="label"]'); if (lab && H.label === '') lab.hidden = true;
    var ht = $('[data-hero="title"]');
    if (ht && H.title) ht.innerHTML = esc(H.title).replace(/\*([^*]+)\*/g, '<span class="shine">$1</span>').replace(/\n/g, '<br>');
    ['btn1', 'btn2'].forEach(function (k) {
      var el = $('[data-hero="' + k + '"]'), b = H[k]; if (!el || !b) return;
      if (!b.text) { el.hidden = true; return; }
      $('span', el).textContent = b.text; if (b.href) el.setAttribute('href', b.href);
    });
    // blueprint phone: real app screens that swipe (by themselves, or by hand)
    var bp = $('#bp'), scr = (H.screens || []).filter(Boolean).map(function (x) { return typeof x === 'string' ? { src: x } : x; }).filter(function (x) { return x.src; }).slice(0, 8);
    if (bp && scr.length) {
      var who = function (x) { if (x.label) return x.label; var a = bySlug(String(x.src).split('/')[0]) || bySlug((String(x.src).match(/hero\/([a-z0-9-]+?)-/) || [])[1]); return a ? a.name + (a.kind ? ' · ' + a.kind : '') : ''; };
      var trk = $('.trk', bp), cp = $('.cp', bp), dots = $('.bp-dots', bp), cur = 0, n = scr.length, tmr = null;
      trk.innerHTML = scr.map(function (x) { return '<img src="' + esc(url(x.src)) + '" alt="' + esc(who(x) || 'App screen') + '" width="172" height="382" draggable="false">'; }).join('');
      dots.innerHTML = n > 1 ? scr.map(function (x, i) { return '<button type="button" aria-label="Screen ' + (i + 1) + '"></button>'; }).join('') : '';
      // desktop spec sheet beside the phone: the facts and a switch for each screen
      var spec = $('#x-spec'), sr = spec && $('.x-spec-r', spec), ssw = spec && $('.x-spec-sw', spec);
      var appOf = function (x) { return bySlug(x.app) || bySlug(String(x.src).split('/')[0]) || bySlug((String(x.src).match(/hero\/([a-z0-9-]+?)-/) || [])[1]); };
      var specRows = function (x) { return String(x.specs || '').split('\n').map(function (l) { var k = l.indexOf(':'); return k > 0 ? [l.slice(0, k).trim(), l.slice(k + 1).trim()] : null; }).filter(function (r) { return r && r[0] && r[1]; }); };
      if (spec && scr.some(function (x) { return specRows(x).length; })) {
        spec.hidden = false;
        ssw.innerHTML = n > 1 ? scr.map(function (x, i) { var a = appOf(x); return '<button type="button" data-i="' + i + '">' + (a ? '<img src="' + esc(url(a.icon)) + '" alt="">' + esc(a.name) : esc(x.label || 'Screen ' + (i + 1))) + '</button>'; }).join('') : '';
        ssw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { show(+b.getAttribute('data-i')); auto(); } });
      }
      var show = function (i) { cur = (i + n) % n; trk.style.transform = 'translateX(-' + cur * 100 + '%)'; cp.textContent = who(scr[cur]); $$('button', dots).forEach(function (d, j) { d.classList.toggle('on', j === cur); });
        if (spec && !spec.hidden) { var a = appOf(scr[cur]); sr.innerHTML = '<div><span>App</span><b>' + esc(a ? a.name : (scr[cur].label || '')) + '</b></div>' + specRows(scr[cur]).map(function (r) { return '<div><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>'; }).join(''); $$('button', ssw).forEach(function (d, j) { d.classList.toggle('on', j === cur); d.setAttribute('aria-pressed', j === cur); }); } };
      var auto = function () { clearInterval(tmr); if (n > 1 && !reduce) tmr = setInterval(function () { if (!document.hidden) show(cur + 1); }, 3600); };
      show(0); setTimeout(auto, 2600);
      dots.addEventListener('click', function (e) { var d = e.target.closest('button'); if (d) { show($$('button', dots).indexOf(d)); auto(); } });
      var sx = null, fill = $('.fill', bp);
      fill.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      fill.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 25) { show(cur + (dx < 0 ? 1 : -1)); auto(); } });
      fill.addEventListener('pointercancel', function () { sx = null; });
    }
    var stp = bp && $('.stamp', bp); if (stp) { if (H.stamp) stp.textContent = H.stamp; else stp.hidden = true; }
  }
  // ---------- home: section order and desktop/phone switches, from "home.sections" ----------
  var SECS = F.home && F.home.sections;
  if (SECS && $('[data-sec]')) {
    var first = $('[data-sec]'), parent = first.parentNode;
    SECS.forEach(function (s) {
      var el = $('[data-sec="' + s.id + '"]'); if (!el) return;
      parent.appendChild(el);
      el.classList.toggle('sec-off-d', s.desktop === false); el.classList.toggle('sec-off-p', s.phone === false);
      if (s.desktop === false && s.phone === false) el.hidden = true;
    });
  }
  // ---------- home: questions, from "faq" ----------
  var fqEl = $('#faq-list');
  if (fqEl && F.faq && F.faq.length) fqEl.innerHTML = F.faq.map(function (f, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + md(f.a) + '</p></details>'; }).join('');

  // ---------- phones: Get app button, bottom tab bar and the apps sheet ("phone" in apps.js) ----------
  var PH = F.phone || {};
  var isAndroid = /Android/i.test(navigator.userAgent);
  var liveApps = V.filter(function (a) { return a.stage === 'live' && a.playUrl; });
  var getTarget = (PH.getApp && PH.getApp !== 'auto' && bySlug(PH.getApp)) || null;
  if (getTarget && (getTarget.hidden || getTarget.stage !== 'live' || !getTarget.playUrl)) getTarget = null;
  var direct = isAndroid && (getTarget || (liveApps.length === 1 ? liveApps[0] : null));
  var TI = {
    home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
    apps: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
    approach: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
    about: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
    updates: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    contact: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>'
  };
  var bar = $('.topbar .bar');
  var sheet = null;
  var openSheet = function () {
    if (!sheet) {
      sheet = document.createElement('div'); sheet.className = 'asheet'; sheet.hidden = true;
      sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Apps');
      document.body.appendChild(sheet);
      sheet.addEventListener('click', function (e) { if (e.target.classList.contains('dim') || e.target.classList.contains('grab')) closeSheet(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet && !sheet.hidden) closeSheet(); });
    }
    var rows = V.map(function (a) {
      var href, em;
      if (a.stage === 'live' && a.playUrl) { href = isAndroid ? a.playUrl : root + a.slug + '/'; em = isAndroid ? '<em class="go">Get it</em>' : '<em class="off">Android</em>'; }
      else if (a.stage === 'test') { href = root + a.slug + '/#join'; em = '<em>Join test</em>'; }
      else { href = root + 'contact/?app=' + encodeURIComponent(a.slug) + '&topic=launch'; em = '<em>Notify me</em>'; }
      return '<a class="row" href="' + esc(href) + '" data-track="sheet-' + esc(a.slug) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '') + '><img src="' + esc(url(a.icon)) + '" alt=""><span><b>' + esc(a.name) + '</b><small>' + esc(a.tagline || '') + '</small></span>' + em + '</a>';
    }).join('');
    sheet.innerHTML = '<div class="dim"></div><div class="sh"><button type="button" class="grab" aria-label="Close"></button><p class="sh-t">Apps from the forge</p>' +
      (!isAndroid && liveApps.length ? '<div class="ios"><span aria-hidden="true">📱</span><span><b>Android only for now</b><br>Open this page on an Android phone to install.</span></div>' : '') + rows +
      '<a class="row ghost" href="' + root + 'contact/?topic=launch"><span class="q">?</span><span><b>Next app</b><small>Testers hear first.</small></span><em>Notify me</em></a>' +
      '<a class="all" href="' + root + 'apps/">See all apps →</a></div>';
    sheet.classList.remove('closing'); sheet.hidden = false; document.documentElement.classList.add('no-scroll');
    var g = $('.grab', sheet); if (g) g.focus({ preventScroll: true });
    window.forgeTrack && window.forgeTrack('apps-sheet');
  };
  var closeSheet = function () {
    if (!sheet || sheet.hidden) return;
    sheet.classList.add('closing'); document.documentElement.classList.remove('no-scroll');
    setTimeout(function () { sheet.hidden = true; sheet.classList.remove('closing'); }, 190);
  };
  if (bar) {
    var tr = PH.topRight || 'getapp', ga = null;
    if (tr === 'getapp' && V.length) {
      var ic = direct || getTarget || liveApps[0] || V[0];
      ga = document.createElement(direct ? 'a' : 'button');
      ga.className = 'getapp'; ga.setAttribute('data-track', 'nav-get-app');
      ga.innerHTML = '<img src="' + esc(url(ic.icon)) + '" alt="">Get app';
      if (direct) { ga.href = direct.playUrl; ga.target = '_blank'; ga.rel = 'noopener';
        ga.addEventListener('click', function () { var t = document.createElement('div'); t.className = 'go-toast'; t.innerHTML = '<img src="' + esc(url(direct.icon)) + '" alt=""><span><b>Opening ' + esc(direct.name) + '</b><small>in Google Play →</small></span><i></i>'; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3000); });
      } else { ga.type = 'button'; ga.addEventListener('click', openSheet); }
    } else if (tr === 'status' && V.length) {
      var nl = V.filter(function (a) { return a.stage === 'live'; }).length, nt = V.filter(function (a) { return a.stage === 'test'; }).length;
      ga = document.createElement('button'); ga.type = 'button'; ga.className = 'getapp'; ga.style.background = 'var(--paper)';
      ga.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#16A34A;margin-left:6px"></span>' + [nl ? nl + ' live' : '', nt ? nt + ' in test' : '', !nl && !nt ? V.length + ' apps' : ''].filter(Boolean).join(' · ');
      ga.addEventListener('click', openSheet);
    }
    if (ga) bar.appendChild(ga);
  }
  var tabs = (PH.tabs || [{ id: 'home' }, { id: 'apps' }, { id: 'about' }, { id: 'contact' }]).filter(function (t) { return t.on !== false && TI[t.id]; });
  if (bar && tabs.length) {
    var pg = document.documentElement.getAttribute('data-page') || '';
    var TL = { home: 'Home', apps: 'Apps', approach: 'Build', about: 'About', updates: 'Updates', contact: 'Contact' };
    var nav = document.createElement('nav'); nav.className = 'tabbar'; nav.setAttribute('aria-label', 'Main');
    nav.innerHTML = tabs.map(function (t) {
      if (t.id === 'apps') return '<button type="button" data-tab="apps"' + (pg === 'apps' ? ' class="on"' : '') + '>' + TI.apps + '<span>Apps</span></button>';
      var href = t.id === 'home' ? (root || './') : t.id === 'approach' ? (pg === 'home' ? '#how' : root + '#how') : t.id === 'about' ? root + 'about/' : t.id === 'updates' ? root + 'updates/' : root + 'contact/';
      return '<a href="' + href + '"' + ((t.id === 'home' && pg === 'home') || (t.id === 'contact' && pg === 'contact') || (t.id === 'about' && pg === 'about') || (t.id === 'updates' && pg === 'updates') ? ' aria-current="page"' : '') + '>' + TI[t.id] + '<span>' + TL[t.id] + '</span></a>';
    }).join('');
    document.body.appendChild(nav);
    var at = $('[data-tab="apps"]', nav); if (at) at.addEventListener('click', openSheet);
  }
  // under the hero buttons on phones: social accounts (or the apps chip, as on desktop)
  var ms = $('#msoc');
  if (ms && PH.under !== 'apps') {
    var sl = ['instagram', 'youtube', 'facebook'].filter(function (k) { return F[k]; });
    if (sl.length) {
      var SN = { instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook' };
      ms.innerHTML = '<span>Follow the forge</span><div>' + sl.map(function (k) { return '<a href="' + esc(F[k]) + '" target="_blank" rel="noopener" data-k="' + k + '" data-track="hero-' + k + '">' + SOC[k] + SN[k] + '</a>'; }).join('') + '</div>';
      document.body.classList.add('under-socials');
    }
  }

  // ---------- home: latest news ----------
  var upd = $('#updates');
  if (upd && F.updates) {
    var rows = F.updates.filter(function (u) { var a = u.app && bySlug(u.app); return !(a && a.hidden); }).slice(0, 3).map(function (u) {
      var a = u.app && bySlug(u.app);
      return '<li><span class="when">' + esc(u.date) + '</span><div class="what">' + (a ? '<img src="' + esc(url(a.icon)) + '" alt="">' : '') + '<div><b>' + esc(a ? a.name : 'Forge Apps') + '</b><p>' + esc(u.text) + '</p></div></div></li>';
    }).join('');
    upd.innerHTML = rows;
  }

  // ---------- all apps page ----------
  var all = $('#apps-all');
  if (all) {
    all.className = 'app-list2 card';
    all.innerHTML = V.map(function (a) {
      var cta = a.stage === 'test' && a.testUrl ? '<a class="btn btn-accent sm" href="' + root + '#early" data-track="apps-join-test">Join test</a>' : a.playUrl && a.stage === 'live' ? '<a class="btn btn-accent sm" href="' + esc(a.playUrl) + '" target="_blank" rel="noopener">Get it</a>' : '';
      return '<div class="lrow" data-slug="' + esc(a.slug) + '" data-stage="' + esc(a.stage) + '" data-search="' + esc((a.name + ' ' + (a.kind || '') + ' ' + a.tagline).toLowerCase()) + '">' +
        '<a class="lr-main" href="' + root + a.slug + '/"><img src="' + esc(url(a.icon)) + '" alt="" width="60" height="60" loading="lazy">' +
        '<span class="lr-body"><span class="lr-top"><b>' + esc(a.name) + '</b><span class="lr-kind">' + esc(a.kind || '') + '</span></span><span class="lr-line">' + esc(a.tagline) + '</span>' + stDot(a.stage) + '</span></a>' +
        '<span class="lr-act">' + cta + '<a class="btn btn-glass card sm" href="' + root + a.slug + '/">View</a></span></div>';
    }).join('');
    var bar = $('#apps-filter');
    if (bar) {
      var present = STAGES.slice().reverse().filter(function (s) { return V.some(function (a) { return a.stage === s; }); });
      var opts = [['all', 'All · ' + V.length]].concat(present.map(function (s) { return [s, FILTER_LABEL[s]]; }));
      bar.innerHTML = opts.map(function (o, i) { return '<button type="button" class="chip' + (i === 0 ? ' on' : '') + '" data-f="' + o[0] + '" aria-pressed="' + (i === 0) + '">' + o[1] + '</button>'; }).join('');
      var filt = 'all', q = '', search = $('#apps-search'), empty = $('#apps-empty');
      var apply = function () {
        var shown = 0;
        $$('.lrow', all).forEach(function (c) {
          var ok = (filt === 'all' || c.getAttribute('data-stage') === filt) && (!q || c.getAttribute('data-search').indexOf(q) > -1);
          c.hidden = !ok; if (ok) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      };
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        $$('button', bar).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        filt = b.getAttribute('data-f'); apply();
      });
      if (search) search.addEventListener('input', function () { q = search.value.trim().toLowerCase(); apply(); });
      apply();
    }
  }

  // ---------- app page ----------
  function appPage(app) {
    document.documentElement.setAttribute('style', vars(app.colors));
    var need = { screens: !!(app.screens && app.screens.length), videos: !!(app.videos && app.videos.length), about: !!(app.about && app.about.length) };
    $$('[data-needs]').forEach(function (el) { el.hidden = !need[el.getAttribute('data-needs')]; });
    // hero screenshots
    var hs = $('#ah-shots');
    if (hs) {
      var s3 = (app.screens || []).slice(0, 3);
      hs.innerHTML = s3.length >= 3 ? [s3[1], s3[0], s3[2]].map(function (x, i) { return '<img src="' + esc(url(shotSrc(x))) + '" alt="' + (i === 1 ? esc(shotCap(x) || app.name) : '') + '"' + (i === 1 ? ' fetchpriority="high"' : ' loading="lazy"') + '>'; }).join('')
        : '<img class="solo float" src="' + esc(url(app.icon)) + '" alt="">';
    }
    // facts bar
    var fx = $('#app-facts');
    if (fx) { if (app.facts && app.facts.length) fx.innerHTML = app.facts.slice(0, 5).map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(localPrice(f[1])) + '</dd></div>'; }).join(''); else fx.hidden = true; }
    // screenshots strip + viewer
    var sh = $('#app-screens');
    if (sh && need.screens) {
      sh.innerHTML = app.screens.map(function (x, i) {
        return '<button type="button" class="shot" data-i="' + i + '" aria-label="Open screen ' + (i + 1) + (shotCap(x) ? ': ' + esc(shotCap(x)) : '') + '"><img src="' + esc(url(shotSrc(x))) + '" alt="" width="236" height="420" loading="lazy">' + (shotCap(x) ? '<span>' + esc(shotCap(x)) + '</span>' : '') + '</button>';
      }).join('');
      var fitArrows = function () { $$('.arrows').forEach(function (ar) { ar.style.visibility = sh.scrollWidth > sh.clientWidth + 4 ? '' : 'hidden'; }); };
      fitArrows(); window.addEventListener('resize', fitArrows); window.addEventListener('load', fitArrows);
      $$('[data-shots-dir]').forEach(function (b) { b.addEventListener('click', function () { sh.scrollBy({ left: parseInt(b.getAttribute('data-shots-dir'), 10) * sh.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' }); }); });
      var dlg = document.createElement('dialog'); dlg.className = 'viewer'; dlg.setAttribute('aria-label', app.name + ' screens');
      dlg.innerHTML = '<button type="button" class="v-close" aria-label="Close">×</button><button type="button" class="v-prev" aria-label="Previous">←</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="v-next" aria-label="Next">→</button>';
      document.body.appendChild(dlg);
      var cur = 0, img = $('img', dlg), cap = $('figcaption', dlg);
      var show = function (i) { cur = (i + app.screens.length) % app.screens.length; var x = app.screens[cur]; img.src = url(shotSrc(x)); img.alt = shotCap(x) || app.name + ' screen ' + (cur + 1); cap.textContent = (cur + 1) + ' / ' + app.screens.length + (shotCap(x) ? ' · ' + shotCap(x) : ''); };
      sh.addEventListener('click', function (e) { var b = e.target.closest('.shot'); if (!b || !dlg.showModal) return; show(parseInt(b.getAttribute('data-i'), 10)); dlg.showModal(); });
      $('.v-close', dlg).addEventListener('click', function () { dlg.close(); });
      $('.v-prev', dlg).addEventListener('click', function () { show(cur - 1); });
      $('.v-next', dlg).addEventListener('click', function () { show(cur + 1); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    // videos (YouTube)
    var vd = $('#app-videos');
    if (vd && need.videos) {
      vd.innerHTML = app.videos.map(function (v) {
        var id = ytId(v.youtube || v.src || ''); if (!id) return '';
        var tall = v.vertical || /\/shorts\//.test(v.youtube || v.src || '');
        return '<figure class="vid ' + (tall ? 'tall' : 'wide') + '"><button type="button" class="yt-play" data-yt="' + id + '" aria-label="Play video: ' + esc(v.title || app.name) + '">' +
          '<img src="https://i.ytimg.com/vi/' + id + '/' + (tall ? 'oar2' : 'hqdefault') + '.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg\'">' +
          '<span class="yt-btn" aria-hidden="true">' + IC.play + '</span></button><figcaption>' + esc(v.title || '') + '</figcaption></figure>';
      }).join('');
      vd.addEventListener('click', function (e) {
        var b = e.target.closest('.yt-play'); if (!b) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0&playsinline=1';
        f.title = b.getAttribute('aria-label'); f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
        b.replaceWith(f);
      });
    }
    $$('[data-needs-video-link]').forEach(function (el) { el.hidden = !need.videos; });
    // about
    var ab = $('#app-about');
    if (ab && need.about) ab.innerHTML = app.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    // stage
    $$('[data-stage-tracker]').forEach(function (el) { el.innerHTML = tracker(app); });
    $$('[data-stage-word]').forEach(function (el) { el.textContent = STAGE_WORD[app.stage] || app.stage; var d = el.previousElementSibling; if (d && d.classList.contains('live-dot')) d.classList.toggle('pulse', app.stage === 'live'); });
    // Google Play buttons
    $$('[data-play]').forEach(function (el) {
      var label = $('span', el) || el;
      if (app.playUrl && app.stage === 'live') { el.href = app.playUrl; el.removeAttribute('aria-disabled'); el.target = '_blank'; el.rel = 'noopener'; label.textContent = 'Get it on Google Play'; }
      else if (app.stage === 'test' && app.testUrl) { el.href = '#join'; el.removeAttribute('aria-disabled'); el.removeAttribute('target'); label.textContent = 'Join the closed test'; }
      else if (app.playUrl) { el.href = app.playUrl; el.removeAttribute('aria-disabled'); el.target = '_blank'; el.rel = 'noopener'; label.textContent = 'Open on Google Play'; }
      else { el.setAttribute('aria-disabled', 'true'); el.removeAttribute('href'); label.textContent = 'Coming soon to Google Play'; }
    });
    $$('[data-play-note]').forEach(function (el) {
      if (app.stage === 'test') { el.hidden = false; el.innerHTML = 'Free · ' + esc(app.platform || 'Android') + ' · In closed testing' + (app.testUrl ? ' · <a href="' + esc(app.testUrl) + '" target="_blank" rel="noopener">Already a tester? Open the test</a>' : ''); }
      else if (app.stage !== 'live' && !app.playUrl) { el.hidden = false; el.textContent = 'Not on Google Play yet. It will appear here at launch.'; }
    });
    // pricing, from "pricing" in apps.js
    var pz = $('#pricing'), PR = app.pricing;
    if (!pz && PR && PR.show !== false) {
      pz = document.createElement('section'); pz.className = 'sec'; pz.id = 'pricing'; pz.setAttribute('aria-labelledby', 'pricing-title');
      pz.innerHTML = '<div class="wrap"><div class="center-head"><h2 class="h2" id="pricing-title"></h2><p class="lead" style="margin-top:16px"></p></div><div class="prices"></div></div>';
      var before = $('#join') || $('#support'); if (before) before.parentNode.insertBefore(pz, before); else pz = null;
    }
    if (pz && PR) {
      if (PR.show === false) pz.hidden = true;
      else {
        var tick = function (t, n) { return '<li class="tick">' + IC.check + '<span>' + esc(t) + (n ? ' <em class="fnote">' + esc(n) + '</em>' : '') + '</span></li>'; };
        var ttl = $('#pricing-title', pz); if (ttl && PR.title) ttl.textContent = PR.title;
        var ld2 = $('.center-head .lead', pz); if (ld2) { ld2.textContent = PR.lead || ''; ld2.hidden = !PR.lead; }
        var fr = PR.free || {}, pro = PR.pro;
        var ps = $('.prices', pz);
        if (ps) ps.innerHTML = '<div class="price card"><div class="top"><p class="name">' + esc(fr.name || 'Free') + '</p></div><p class="amt">' + esc(fr.amount || '0') + '</p><ul>' + (fr.items || []).map(function (t) { return tick(t); }).join('') + '</ul></div>' +
          (pro ? '<div class="price pro"><div class="top"><p class="name">' + esc(pro.name || 'Pro') + '</p>' + (pro.badge ? '<span class="badge">' + esc(pro.badge) + '</span>' : '') + '</div>' +
            '<p class="amt" data-price="{price} &lt;small&gt;' + esc(esc(pro.note || '')) + '&lt;/small&gt;">' + esc(pro.fallback || 'Pay once') + ' <small>in your currency</small></p>' +
            (pro.groups || []).map(function (g) { return '<div class="pgroup">' + (g.title ? '<h3>' + esc(g.title) + '</h3>' : '') + '<ul>' + (g.items || []).map(function (it) { return typeof it === 'string' ? tick(it) : tick(it.text, it.note); }).join('') + '</ul></div>'; }).join('') + '</div>' : '');
      }
    }
    $$('[data-feedback]').forEach(function (el) { el.href = root + 'contact/?app=' + encodeURIComponent(app.slug); });
    $$('[data-notify]').forEach(function (el) { el.href = root + 'contact/?app=' + encodeURIComponent(app.slug) + '&topic=launch'; el.hidden = app.stage === 'live'; });
    // details for search engines
    if (!$('#app-ld')) {
      var ld = { '@context': 'https://schema.org', '@type': 'MobileApplication', name: app.name, operatingSystem: app.platform || 'Android',
        applicationCategory: /financ/i.test(app.kind || '') ? 'FinanceApplication' : 'UtilitiesApplication', description: app.tagline,
        url: 'https://forgeapps.in/' + app.slug + '/', image: 'https://forgeapps.in/' + app.icon,
        author: { '@type': 'Organization', name: F.playName || 'Forge Apps', url: 'https://forgeapps.in/' }, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
      if (app.playUrl) ld.installUrl = app.playUrl;
      var sc = document.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'app-ld'; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
    }
  }
  if (pageApp) { var theApp = bySlug(pageApp); if (theApp) appPage(theApp); }

  if (PRO_PRICE) $$('[data-price]').forEach(function (el) { el.innerHTML = el.getAttribute('data-price').split('{price}').join(esc(PRO_PRICE)); });
  // No closed test open anywhere: "Early access" links ask for a launch email for the next app instead of jumping to a hidden section.
  if (!V.some(function (a) { return a.stage === 'test' && a.testUrl; })) {
    var nextApp = V.filter(function (a) { return a.stage === 'build' || a.stage === 'test'; })[0];
    $$('a[href$="#early"]').forEach(function (a) { a.href = root + 'contact/?' + (nextApp ? 'app=' + encodeURIComponent(nextApp.slug) + '&' : '') + 'topic=launch'; });
  }
  // ---------- early access: every app in closed testing (home), or just this app (app page) ----------
  var tb = $('#tester-band');
  if (tb) {
    var only = tb.getAttribute('data-only');
    var testing = V.filter(function (a) { return a.stage === 'test' && a.testUrl && (!only || a.slug === only); });
    if (only && !testing.length) { var oa = bySlug(only); if (oa && oa.hidden !== true && oa.stage === 'test') testing = [oa]; }
    var sec = tb.closest('[data-early]');
    if (!testing.length) {
      if (sec) sec.hidden = true;
    }
    else {
      if (sec) sec.hidden = false;
      var cnt = $('#early-count'); if (cnt) cnt.textContent = testing.length === 1 ? '1 app in testing' : testing.length + ' apps in testing';
      var tabs = $('#tester-tabs'), sent = {};
      var showBand = function (ta) {
        tb.className = 'tband'; tb.setAttribute('data-slug', ta.slug);
        tb.innerHTML =
          '<div class="tb-copy"><div class="tb-id"><img src="' + esc(url(ta.icon)) + '" alt="" width="48" height="48"><span>Closed test · Open to join</span></div>' +
            '<h3>' + (only ? 'Try ' + esc(ta.name) + ' before launch' : 'Join the ' + esc(ta.name) + ' closed test') + '</h3>' +
            '<p>' + (only ? 'Join the free closed test on Google Play and tell us what to improve. Every message gets a reply.' : esc(ta.tagline) + ' Try it before anyone else, tell us what to fix, and help it launch on Google Play.') + '</p>' +
            '<ul class="tb-points"><li>' + IC.check + 'Free</li><li>' + IC.check + esc(ta.platform || 'Android') + '</li><li>' + IC.check + 'Takes 2 minutes</li></ul>' +
            (only ? '' : '<a class="tb-more" href="' + root + ta.slug + '/">See ' + esc(ta.name) + ' →</a>') +
          '</div>' +
          '<div class="tb-box"><form class="tb-form" novalidate><label for="tb-email">Your Google Play email</label>' +
            '<div class="tb-row"><input id="tb-email" type="email" inputmode="email" autocomplete="email" placeholder="you@gmail.com" required><button class="btn btn-accent tb-btn" type="submit"><span>Request access</span></button></div>' +
            '<input type="checkbox" name="botcheck" class="cf-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="tb-err" hidden>Please enter the email you use on Google Play.</p>' +
            '<p class="tb-small">Use the Google account on your Android phone. We add it to the tester list and reply within a day.</p></form>' +
            '<div class="tb-done" hidden tabindex="-1"><div class="tb-tick" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/></svg></div>' +
              '<h3>You’re in the queue</h3><ol><li>We add <b class="tb-mail"></b> to the ' + esc(ta.name) + ' tester list and email you, usually within a day.</li><li>Then open the test link on your phone and tap <b>Become a tester</b>.</li><li>Install it from Google Play and keep it for 14 days.</li></ol></div>' +
            '<a class="tb-link" href="' + esc(ta.testUrl || '#') + '" target="_blank" rel="noopener">Already added? Open the test link →</a></div>';
        var tf = $('.tb-form', tb), ti = $('#tb-email', tb), te = $('.tb-err', tb), tbtn = $('.tb-btn', tb);
        var finish = function (em) { sent[ta.slug] = em; $('.tb-mail', tb).textContent = em; tf.hidden = true; $('.tb-done', tb).hidden = false; };
        if (sent[ta.slug]) finish(sent[ta.slug]);
        ti.addEventListener('input', function () { te.hidden = true; ti.classList.remove('bad'); });
        tf.addEventListener('submit', function (e) {
          e.preventDefault();
          var em = ti.value.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { te.hidden = false; te.textContent = 'Please enter the email you use on Google Play.'; ti.classList.add('bad'); ti.focus(); return; }
          if (tf.botcheck && tf.botcheck.checked) return;
          var done = function () { finish(em); $('.tb-done', tb).focus({ preventScroll: true }); window.forgeTrack('tester-request', { app: ta.slug }); };
          var subject = '[Forge Apps] Tester request · ' + ta.name;
          if (!F.formKey) { location.href = 'mailto:' + F.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent('Please add me to the ' + ta.name + ' closed test.\n\nGoogle Play email: ' + em); done(); return; }
          tbtn.disabled = true; $('span', tbtn).textContent = 'Sending…';
          fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ access_key: F.formKey, subject: subject, from_name: 'Forge Apps website', email: em, replyto: em, topic: 'Tester request', app: ta.name,
              message: 'Please add this Google account to the ' + ta.name + ' closed test: ' + em + '\n\nPlay Console → ' + ta.name + ' → Testing → Closed testing → Testers.', page: location.href, botcheck: false }) })
            .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw 0; }); })
            .then(done)
            .catch(function () { tbtn.disabled = false; $('span', tbtn).textContent = 'Request access'; te.hidden = false; te.innerHTML = 'Couldn’t send just now. Try again, or email <a href="mailto:' + esc(F.email) + '">' + esc(F.email) + '</a>.'; });
        });
      };
      if (tabs && testing.length > 1) {
        tabs.hidden = false;
        tabs.innerHTML = testing.map(function (a, i) { return '<button type="button" role="tab" class="tb-tab" data-slug="' + esc(a.slug) + '" aria-selected="' + (i === 0) + '"><img src="' + esc(url(a.icon)) + '" alt="" width="30" height="30"><span>' + esc(a.name) + '</span></button>'; }).join('');
        tabs.addEventListener('click', function (e) {
          var t = e.target.closest('.tb-tab'); if (!t || t.getAttribute('aria-selected') === 'true') return;
          $$('.tb-tab', tabs).forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
          var a = bySlug(t.getAttribute('data-slug')); showBand(a);
          tb.classList.remove('swap'); void tb.offsetWidth; tb.classList.add('swap');
          window.forgeTrack('early-access-tab', { app: a.slug });
        });
      }
      showBand(testing[0]);
    }
  }

  // ---------- legal pages: "On this page" list ----------
  var toc = $('#toc'), legal = $('.legal');
  if (toc && legal) {
    var hs2 = $$('h2', legal);
    if (hs2.length < 3) toc.hidden = true;
    else {
      toc.innerHTML = '<p>On this page</p>' + hs2.map(function (h, i) { if (!h.id) h.id = 's' + (i + 1) + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); return '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>'; }).join('');
      if ('IntersectionObserver' in window) {
        var links = $$('a', toc), seen = {};
        var io2 = new IntersectionObserver(function (en) {
          en.forEach(function (x) { seen[x.target.id] = x.isIntersecting; });
          var first = hs2.filter(function (h) { return seen[h.id]; })[0];
          if (first) links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + first.id); });
        }, { rootMargin: '-90px 0px -55% 0px' });
        hs2.forEach(function (h) { io2.observe(h); });
      }
    }
  }

  // ---------- scroll-linked motion (Apple-style): --p goes 0 → 1 as you scroll ----------
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  $$('[data-words]').forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) frag.appendChild(document.createTextNode(t));
            else { var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = t; frag.appendChild(sp); }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el); el._w = $$('.w', el); el._lit = -1;
  });
  var pItems = $$('[data-p]'), wItems = $$('[data-words]'), parItems = $$('[data-parallax]'), stories = $$('[data-story]').filter(function (x) { return x.getAttribute('data-story') !== 'tabs'; });
  var progress = function (el, mode, r, vh) {
    if (mode === 'out') return clamp(-r.top / Math.max(r.height * 0.9, 1));
    if (mode === 'grow') return clamp((vh - r.top) / (vh * 0.8));
    return clamp((vh * 0.88 - r.top) / (r.height + vh * 0.3));
  };
  var setStory = function (st, idx) {
    if (st._idx === idx) return; st._idx = idx;
    var steps = $$('.story-step,.tour-item', st), n = steps.length;
    steps.forEach(function (s, i) { s.classList.toggle('on', i === idx); s.classList.toggle('was', i < idx); if (s.tagName === 'BUTTON') s.setAttribute('aria-pressed', String(i === idx)); });
    $$('[data-si]', st).forEach(function (v) {
      var d = +v.getAttribute('data-si') - idx;
      v.classList.toggle('on', d === 0);
      if (v.classList.contains('sc')) { v.classList.remove('past', 'n1', 'n2', 'n3'); if (d < 0) v.classList.add('past'); else if (d > 0) v.classList.add('n' + Math.min(d, 3)); }
    });
    $$('.story-dots i', st).forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    st.style.setProperty('--sp', ((idx + 1) / n).toFixed(3));
  };
  stories.forEach(function (st) { setStory(st, 0); });
  // feature tour: tap a feature to see its screen; it also moves on by itself while in view
  $$('[data-story="tabs"]').forEach(function (st) {
    var items = $$('.tour-item', st), timer = null, visible = false, paused = false;
    setStory(st, 0);
    var go = function (i) { st._idx = -1; setStory(st, (i + items.length) % items.length); };
    var play = function () { clearInterval(timer); if (reduce || paused || !visible) return; timer = setInterval(function () { go(($$('.tour-item.on', st)[0] ? items.indexOf($$('.tour-item.on', st)[0]) : 0) + 1); }, 4500); };
    items.forEach(function (b, i) { b.addEventListener('click', function () { paused = true; st.classList.add('paused'); clearInterval(timer); go(i); }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; play(); }, { threshold: 0.35 }).observe(st);
  });
  var ticking = false, LERP = 0.12;
  var ease = function (el, key, target) {
    var cur = el[key] == null ? target : el[key];
    cur += (target - cur) * LERP;
    if (Math.abs(target - cur) < 0.0008) cur = target; else moving = true;
    el[key] = cur; return cur;
  };
  var moving = false;
  var frame = function () {
    ticking = false; moving = false;
    var vh = window.innerHeight;
    pItems.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return; el.style.setProperty('--p', ease(el, '_p', progress(el, el.getAttribute('data-p'), r, vh)).toFixed(4)); });
    wItems.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.28)), lit = Math.round(p * el._w.length);
      if (lit === el._lit) return; el._lit = lit;
      el._w.forEach(function (w, i) { w.classList.toggle('lit', i < lit); });
    });
    parItems.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      var f = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var target = (r.top + r.height / 2 - vh / 2) * -f;
      var cur = el._py == null ? target : el._py + (target - el._py) * LERP;
      if (Math.abs(target - cur) < 0.2) cur = target; else moving = true;
      el._py = cur; el.style.setProperty('--py', cur.toFixed(2) + 'px');
    });
    stories.forEach(function (st) {
      var steps = $$('.story-step', st), n = steps.length, r = st.getBoundingClientRect();
      var pr = clamp(-r.top / Math.max(r.height - vh, 1));
      setStory(st, Math.min(n - 1, Math.floor(pr * n)));
    });
    if (moving && !reduce) { ticking = true; requestAnimationFrame(frame); }
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  if (reduce) {
    pItems.forEach(function (el) { el.style.setProperty('--p', el.getAttribute('data-p') === 'out' ? '0' : '1'); });
    wItems.forEach(function (el) { el._w.forEach(function (w) { w.classList.add('lit'); }); });
    if (stories.length) { window.addEventListener('scroll', onScroll, { passive: true }); frame(); }
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  // ---------- numbers that count up ----------
  var countUp = function (el) {
    var to = parseFloat(el.getAttribute('data-to')), dec = (el.getAttribute('data-to').split('.')[1] || '').length, t0 = null, dur = 1400;
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  var nums = $$('[data-to]');
  if (nums.length) {
    if (!('IntersectionObserver' in window)) nums.forEach(countUp);
    else { var nio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); nio.unobserve(x.target); } }); }, { threshold: 0.6 }); nums.forEach(function (n) { n.textContent = '0'; nio.observe(n); }); }
  }

  // ---------- scroll reveals ----------
  $$('[data-stagger]').forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { if (!c.hasAttribute('data-zoom')) c.setAttribute('data-reveal', ''); c.style.setProperty('--d', (Math.min(i, 6) * 0.07) + 's'); }); });
  var els = $$('[data-reveal],[data-zoom]');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(function (e) { e.classList.add('shown'); });
  else {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('shown'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  // ---------- analytics (cookie-free). Turned on by the IDs in apps.js ----------
  var A = F.analytics || {};
  var live = /(^|\.)forgeapps\.in$/.test(location.hostname) && !/[?&]preview=1/.test(location.search);
  if (live && A.umami && !$('script[data-website-id]')) {
    var us = document.createElement('script'); us.defer = true; us.src = 'https://cloud.umami.is/script.js';
    us.setAttribute('data-website-id', A.umami); us.setAttribute('data-domains', 'forgeapps.in,www.forgeapps.in'); document.head.appendChild(us);
  }
  if (live && A.cloudflare && !$('script[data-cf-beacon]')) {
    var cs = document.createElement('script'); cs.defer = true; cs.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cs.setAttribute('data-cf-beacon', JSON.stringify({ token: A.cloudflare })); document.head.appendChild(cs);
  }
  // window.forgeTrack('event-name', { any: 'details' }) — safe to call any time
  window.forgeTrack = function (name, data) { try { if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data || {}); } catch (e) {} };
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button'); if (!el) return;
    var h = el.getAttribute('href') || '';
    var appOf = function () { var s = el.closest('[data-slug]'); return (s && s.getAttribute('data-slug')) || pageApp || ''; };
    if (el.hasAttribute('data-track')) window.forgeTrack(el.getAttribute('data-track'), { app: appOf() });
    else if (/play\.google\.com\/apps\/testing/.test(h)) window.forgeTrack('join-test', { app: appOf() });
    else if (/play\.google\.com\/store/.test(h)) window.forgeTrack('play-store-click', { app: appOf() });
    else if (/^mailto:/.test(h)) window.forgeTrack('email-click', { app: appOf(), page: location.pathname });
    else if (/youtube\.com|youtu\.be/.test(h)) window.forgeTrack('social-click', { network: 'youtube' });
    else if (/instagram\.com/.test(h)) window.forgeTrack('social-click', { network: 'instagram' });
    else if (/facebook\.com/.test(h)) window.forgeTrack('social-click', { network: 'facebook' });
    else if (el.id === 'featured') window.forgeTrack('explore-app', { app: appOf() });
    else if (el.classList.contains('yt-play')) window.forgeTrack('video-play', { app: pageApp });
    else if (el.classList.contains('shot')) window.forgeTrack('screenshot-open', { app: pageApp });
    else if (el.classList.contains('menubtn')) { if (el.getAttribute('aria-expanded') !== 'true') window.forgeTrack('menu-open'); }
  }, true);
})();

// Google Play links on Android: open the Play Store app directly. In-app browsers (Instagram, Facebook,
// WhatsApp) often can't hand a play.google.com page over to the store, so the link would just sit there.
(function () {
  if (!/Android/i.test(navigator.userAgent)) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="play.google.com/store/apps/details"]');
    if (!a) return;
    var m = /[?&]id=([\w.]+)/.exec(a.href);
    if (!m) return;
    e.preventDefault();
    location.href = 'intent://details?id=' + m[1] + '#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=' + encodeURIComponent(a.href) + ';end';
  });
})();
