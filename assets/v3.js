/* Forge Apps V3 — loaded after site.js on every page.
   - "Forge Apps Labs" (the Google Play developer name) on Play buttons and in the footer
   - reviews from Google Play (assets/reviews.json, filled daily by a GitHub Action): home strip, app pages, /reviews/
   - home: featured app strip and the numbers
   - small animations: stamp drop, number count-up, forge sparks, timeline fill, typewriter labels
   All settings live in apps.js and are edited in the admin panel. Only real reviews and real numbers are shown. */
(function () {
  var F = window.FORGE || { apps: [] };
  var V = (F.apps || []).filter(function (a) { return !a.hidden; });
  var root = document.documentElement.getAttribute('data-root') || '';
  var pageApp = document.documentElement.getAttribute('data-app');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var url = function (p) { return !p ? '' : /^(data:|https?:|\/)/.test(p) ? p : root + p; };
  var bySlug = function (s) { return V.filter(function (a) { return a.slug === s; })[0]; };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RC = F.reviews || {}, HIDE = RC.hide || [], PIN = RC.pin || [];
  var PN = F.playName || '', PD = F.playDevUrl || '';
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var when = function (d) { var t = new Date(d); return isNaN(t) ? '' : t.getDate() + ' ' + MON[t.getMonth()] + ' ' + t.getFullYear(); };
  var stars = function (n) { var r = Math.round(n); return '<span class="stars" role="img" aria-label="' + (Math.round(n * 10) / 10) + ' out of 5 stars">' + '★★★★★'.slice(0, r) + '<span class="off">' + '★★★★★'.slice(0, 5 - r) + '</span></span>'; };
  var fmt = function (n) { return (Math.round(n * 10) / 10).toFixed(1); };

  /* ---------- Play developer name ---------- */
  if (PN) {
    $$('.foot-bottom > span:first-child').forEach(function (el) { var y = $('[data-year]', el); el.innerHTML = '© ' + (y ? y.textContent : new Date().getFullYear()) + ' ' + esc(PN) + ' · Made in India, for users everywhere'; });
    var app0 = pageApp && bySlug(pageApp);
    if (app0 && app0.stage === 'live' && app0.playUrl) $$('[data-play]').forEach(function (el) {
      if (el.nextElementSibling && el.nextElementSibling.classList.contains('x-by')) return;
      el.insertAdjacentHTML('afterend', '<small class="x-by">by ' + (PD ? '<a href="' + esc(PD) + '" target="_blank" rel="noopener">' + esc(PN) + '</a>' : esc(PN)) + ' on Google Play</small>');
    });
  }
  var byLine = function () { return PN ? '<small class="x-by">by ' + (PD ? '<a href="' + esc(PD) + '" target="_blank" rel="noopener">' + esc(PN) + '</a>' : esc(PN)) + ' on Google Play</small>' : ''; };

  /* ---------- reviews ---------- */
  function norm(d) {
    var out = {};
    V.forEach(function (a) {
      var all = ((d && d.apps && d.apps[a.slug] && d.apps[a.slug].reviews) || []).filter(function (r) { return r && r.id && r.stars; });
      var list = all.filter(function (r) { return r.text && HIDE.indexOf(r.id) === -1; }).map(function (r) { r.app = a.slug; return r; });
      list.sort(function (x, y) { var px = PIN.indexOf(x.id), py = PIN.indexOf(y.id); if (px !== py) return (px === -1 ? 99 : px) - (py === -1 ? 99 : py); return String(y.date).localeCompare(String(x.date)); });
      var dist = [0, 0, 0, 0, 0]; all.forEach(function (r) { dist[5 - r.stars]++; });
      var man = (RC.rating || {})[a.slug], rating = null;
      if (man && +man.stars > 0) rating = { stars: +man.stars, count: +man.count || 0, manual: true };
      else if (all.length) rating = { stars: all.reduce(function (s, r) { return s + r.stars; }, 0) / all.length, count: all.length };
      out[a.slug] = { list: list, rating: rating, dist: all.length ? dist : null, total: all.length };
    });
    return out;
  }
  window.forgeReviews = (window.fetch ? fetch(root + 'assets/reviews.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }) : Promise.resolve({})).then(norm);

  var card = function (r, showApp) {
    var a = bySlug(r.app) || {}, who = r.author || 'A Google Play user';
    return '<article class="rvc"><div class="rvc-h"><span class="rvc-av" aria-hidden="true">' + esc(who.charAt(0).toUpperCase()) + '</span><span><b>' + esc(who) + '</b><small>' + stars(r.stars) + (r.date ? ' · ' + when(r.date) : '') + '</small></span></div>' +
      '<p>' + esc(r.text) + '</p>' + (r.reply && r.reply.text ? '<div class="rvc-rep"><b>Reply from Forge Apps</b>' + esc(r.reply.text) + '</div>' : '') +
      '<div class="rvc-f">' + (showApp ? '<a class="rvc-app" href="' + root + esc(a.slug) + '/"><img src="' + esc(url(a.icon)) + '" alt="">' + esc(a.name) + '</a>' : '') + '<span>Google Play</span></div></article>';
  };
  var summary = function (a, R) {
    if (!R.rating) return '';
    var bars = R.dist ? '<div class="rv-bars">' + R.dist.map(function (n, i) { var w = R.total ? Math.round(n / R.total * 100) : 0; return '<div><span>' + (5 - i) + '</span><i style="--w:' + w + '%"></i><span>' + n + '</span></div>'; }).join('') + '</div>' : '';
    return '<div class="rv-sum"><div><div class="rv-big">' + fmt(R.rating.stars) + '</div>' + stars(R.rating.stars) + '<p class="rv-cnt">' + (R.rating.manual ? (R.rating.count ? R.rating.count + ' ratings' : 'Rating') + ' on Google Play' : 'From ' + R.total + ' review' + (R.total === 1 ? '' : 's') + ' on Google Play') + '</p></div>' + bars + '</div>';
  };

  window.forgeReviews.then(function (RV) {
    /* home: moving strip */
    var hs = $('#reviews[data-sec]'), strip = $('#rv-strip');
    if (hs && strip && RC.home !== false) {
      var all = []; V.forEach(function (a) { if ((RC.apps || {})[a.slug] !== false) all = all.concat(RV[a.slug].list.slice(0, 8)); });
      all.sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); });
      all = all.slice(0, 12);
      if (all.length) {
        var html = all.map(function (r) { return card(r, true); }).join('');
        strip.innerHTML = '<div class="rv-track' + (all.length < 3 || reduce ? ' still' : '') + '" style="--dur:' + Math.max(24, all.length * 7) + 's">' + html + (all.length >= 3 && !reduce ? html.replace(/<article class="rvc"/g, '<article class="rvc" aria-hidden="true"') : '') + '</div>';
        if (!hs.classList.contains('sec-off-d') || !hs.classList.contains('sec-off-p')) hs.hidden = false;
      }
    }
    /* app page: summary + two rows of reviews */
    var app = pageApp && bySlug(pageApp);
    if (app && (RC.apps || {})[app.slug] !== false) {
      var R = RV[app.slug], n = R.list.length;
      if (n || app.stage === 'live') {
        var sec = document.createElement('section'); sec.className = 'sec'; sec.id = 'reviews'; sec.setAttribute('aria-labelledby', 'rv-title');
        var more = n > 6 ? '<a class="ul-link" href="' + root + 'reviews/?app=' + esc(app.slug) + '">All ' + n + ' reviews →</a>' : '';
        sec.innerHTML = '<div class="wrap"><div class="head-row"><div><p class="x-k">From Google Play</p><h2 class="h2" id="rv-title">What people say.</h2></div>' + more + '</div>' +
          (n ? summary(app, R) + '<div class="rv-grid">' + R.list.slice(0, 6).map(function (r) { return card(r, false); }).join('') + '</div>' + (n > 6 ? '<div class="rv-more"><a class="btn btn-glass card" href="' + root + 'reviews/?app=' + esc(app.slug) + '">See all ' + n + ' reviews</a></div>' : '')
            : (R.rating ? summary(app, R) : '') + '<div class="rv-empty"><b>No reviews yet.</b><p>Tried ' + esc(app.name) + '? A review on Google Play helps other people find it.</p>' + (app.playUrl ? '<a class="btn btn-accent" href="' + esc(app.playUrl) + '" target="_blank" rel="noopener">Write a review on Google Play</a>' : '') + '</div>') + '</div>';
        var before = $('#faq') || $('#support'); if (before) before.parentNode.insertBefore(sec, before);
      }
    }
    /* /reviews/ page */
    var pg = $('#rv-page');
    if (pg) {
      var withR = V.filter(function (a) { return (RC.apps || {})[a.slug] !== false && (RV[a.slug].list.length || RV[a.slug].rating); });
      var q = (location.search.match(/[?&]app=([a-z0-9-]+)/) || [])[1], cur = withR.some(function (a) { return a.slug === q; }) ? q : '', st = 0;
      var draw = function () {
        var apps = cur ? [bySlug(cur)] : withR, list = [];
        apps.forEach(function (a) { list = list.concat(RV[a.slug].list); });
        if (!cur) list.sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); });
        if (st) list = list.filter(function (r) { return st === 3 ? r.stars <= 3 : r.stars === st; });
        $('#rv-sums', pg).innerHTML = apps.map(function (a) { var R = RV[a.slug]; return R.rating ? '<div class="rv-app-sum"><a class="rvc-app lg" href="' + root + esc(a.slug) + '/"><img src="' + esc(url(a.icon)) + '" alt="">' + esc(a.name) + '</a>' + summary(a, R) + (a.playUrl ? '<a class="ul-link" href="' + esc(a.playUrl) + '" target="_blank" rel="noopener">Write a review →</a>' : '') + '</div>' : ''; }).join('');
        $('#rv-list', pg).innerHTML = list.length ? list.map(function (r) { return card(r, !cur); }).join('') : '<div class="rv-empty"><b>' + (withR.length ? 'No reviews match.' : 'No reviews yet.') + '</b><p>' + (withR.length ? 'Try another filter.' : 'Reviews from Google Play appear here as soon as people write them.') + '</p></div>';
        $$('[data-rapp]', pg).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-rapp') === cur); b.setAttribute('aria-pressed', b.getAttribute('data-rapp') === cur); });
        $$('[data-rst]', pg).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-rst') === st); b.setAttribute('aria-pressed', +b.getAttribute('data-rst') === st); });
      };
      $('#rv-apps', pg).innerHTML = withR.length > 1 ? '<button type="button" class="chip" data-rapp="">All apps</button>' + withR.map(function (a) { return '<button type="button" class="chip" data-rapp="' + esc(a.slug) + '"><img src="' + esc(url(a.icon)) + '" alt="">' + esc(a.name) + '</button>'; }).join('') : '';
      pg.addEventListener('click', function (e) {
        var b = e.target.closest('[data-rapp]'); if (b) { cur = b.getAttribute('data-rapp'); try { history.replaceState(null, '', cur ? '?app=' + cur : location.pathname); } catch (er) {} draw(); return; }
        b = e.target.closest('[data-rst]'); if (b) { st = +b.getAttribute('data-rst'); draw(); }
      });
      draw();
    }
    renderStats(RV); renderPitch(RV);
  });

  /* ---------- home: featured app strip ---------- */
  function renderPitch(RV) {
    var box = $('#x-pitch'), P = F.home && F.home.pitch; if (!box || !P) return;
    var a = bySlug(P.app); if (!a) return;
    var R = RV && RV[a.slug], live = a.stage === 'live' && a.playUrl;
    box.innerHTML = '<img class="x-pi" src="' + esc(url(a.icon)) + '" alt=""><div class="x-pt"><b>' + esc(P.title || a.name) + '</b><span>' + esc(P.text || a.tagline || '') + (R && R.rating ? ' <em class="x-pr">' + stars(R.rating.stars) + ' ' + fmt(R.rating.stars) + '</em>' : '') + '</span></div>' +
      '<div class="x-pb">' + (live ? '<a class="btn btn-accent" href="' + esc(a.playUrl) + '" target="_blank" rel="noopener" data-track="pitch-play">Get it on Google Play</a>' + byLine() : '<a class="btn btn-accent" href="' + root + esc(a.slug) + '/">See ' + esc(a.name) + '</a>') + '</div>';
    var sec = box.closest('[data-sec]'); if (sec && !(sec.classList.contains('sec-off-d') && sec.classList.contains('sec-off-p'))) sec.hidden = false;
  }
  renderPitch(null);

  /* ---------- home: numbers (only real ones; a tile with no value is left out) ---------- */
  function renderStats(RV) {
    var box = $('#v2-stats'); if (!box) return;
    var S = F.stats && F.stats.tiles ? F.stats : { tiles: ['rating', 'reviews', 'updates', 'apps'], custom: [] };
    var rated = RV ? V.filter(function (a) { return RV[a.slug] && RV[a.slug].rating; }) : [];
    var cnt = 0, sum = 0; rated.forEach(function (a) { var r = RV[a.slug].rating, c = r.count || 1; cnt += c; sum += r.stars * c; });
    var ups = (F.updates || []).filter(function (u) { return !u.app || bySlug(u.app); }).length;
    var live = V.filter(function (a) { return a.stage === 'live'; }).length, test = V.filter(function (a) { return a.stage === 'test'; }).length, rest = V.length - live - test;
    var T = {
      rating: rated.length ? [fmt(sum / cnt), '★', 'Play rating', rated.length === 1 ? rated[0].name + ' on Google Play' : 'Across ' + rated.length + ' apps'] : null,
      reviews: cnt ? [String(cnt), '', rated.some(function (a) { return RV[a.slug].rating.manual; }) ? 'Ratings on Google Play' : 'Reviews on Google Play', ''] : null,
      updates: ups ? [String(ups), '', 'Updates shipped', '<a href="' + root + 'updates/">See every update →</a>'] : null,
      apps: V.length ? [String(V.length), '', V.length === 1 ? 'App from the forge' : 'Apps from the forge', [live ? live + ' live' : '', test ? test + ' in testing' : '', rest ? rest + ' being built' : ''].filter(Boolean).join(' · ')] : null
    };
    var tiles = (S.tiles || []).map(function (k) { return T[k]; }).filter(Boolean).concat((S.custom || []).filter(function (c) { return c && c.value; }).map(function (c) { return [c.value, '', c.label || '', esc(c.sub || '')]; }));
    box.innerHTML = tiles.map(function (t) { var num = /^\d+(\.\d+)?$/.test(t[0]); return '<div class="v2-stat"><b><span' + (num ? ' data-n="' + t[0] + '"' : '') + '>' + esc(t[0]) + '</span>' + (t[1] ? '<small>' + t[1] + '</small>' : '') + '</b><span>' + esc(t[2]) + '</span>' + (t[3] ? '<em>' + t[3] + '</em>' : '') + '</div>'; }).join('');
    box.style.setProperty('--n', tiles.length);
    var sec = box.closest('[data-sec]'); if (sec && !tiles.length) sec.hidden = true;
    if (window.forgeMotion) window.forgeMotion(box);
  }
  renderStats(null);

  /* ---------- animations ---------- */
  if (reduce || !('IntersectionObserver' in window)) { window.forgeMotion = function () {}; return; }
  var de = document.documentElement; de.classList.add('mo');
  var countUp = function (el) {
    var to = parseFloat(el.getAttribute('data-n')), dec = (el.getAttribute('data-n').split('.')[1] || '').length, t0 = null;
    if (!(to > 0)) return;
    (function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1300), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = dec ? v.toFixed(dec) : Math.round(v); if (k < 1) requestAnimationFrame(f); })(performance.now());
  };
  var type = function (el) {
    var txt = el.getAttribute('data-txt'); if (!txt) return; var i = 0; el.classList.add('typing');
    (function f() { i++; el.textContent = txt.slice(0, i); if (i < txt.length) setTimeout(f, 38); else setTimeout(function () { el.classList.remove('typing'); }, 900); })();
  };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; var el = e.target; io.unobserve(el);
      if (el.hasAttribute('data-n')) countUp(el);
      else if (el.classList.contains('x-k')) type(el);
      else el.classList.add('m-in');
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
  var watch = function (scope) {
    $$('[data-n]', scope).forEach(function (el) { if (!el.__m) { el.__m = 1; el.textContent = '0'; io.observe(el); } });
    $$('.x-tag, .x-tl, .m-stamp', scope).forEach(function (el) { if (!el.__m) { el.__m = 1; el.classList.add('m-wait'); io.observe(el); } });
    $$('.x-k', scope).forEach(function (el) { if (!el.__m && el.textContent.trim()) { el.__m = 1; el.setAttribute('data-txt', el.textContent); el.style.minHeight = el.offsetHeight + 'px'; el.textContent = ''; io.observe(el); } });
  };
  window.forgeMotion = watch;
  watch(document);
  // anything added later (app rows, review cards) gets the same treatment
  setTimeout(function () { watch(document); }, 400);
  window.forgeReviews.then(function () { setTimeout(function () { watch(document); }, 50); });
  // safety net: never leave something invisible
  setTimeout(function () { $$('.m-wait').forEach(function (el) { el.classList.add('m-in'); }); $$('.x-k[data-txt]').forEach(function (el) { if (!el.textContent) el.textContent = el.getAttribute('data-txt'); }); }, 9000);

  /* forge sparks on the main buttons */
  var lastSp = 0;
  var sparks = function (x, y) {
    var now = Date.now(); if (now - lastSp < 220) return; lastSp = now;
    for (var i = 0; i < 11; i++) {
      var s = document.createElement('i'); s.className = 'spark';
      var a = Math.random() * Math.PI * 2, d = 26 + Math.random() * 42;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d - 12 + 'px');
      document.body.appendChild(s); setTimeout(function (n) { n.remove(); }, 700, s);
    }
  };
  document.addEventListener('pointerover', function (e) { if (e.pointerType !== 'mouse') return; var b = e.target.closest && e.target.closest('.btn-accent'); if (b && !b.contains(e.relatedTarget)) sparks(e.clientX, e.clientY); });
  document.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('.btn-accent'); if (b) sparks(e.clientX, e.clientY); });
})();
