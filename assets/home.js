/* Home page sections built from apps.js: the on-the-bench column, app rows (desktop), rule book + timeline, and the questions help desk. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var F = window.FORGE || { apps: [] }, V = F.apps.filter(function (a) { return !a.hidden; });
  var src = function (p) { return /^(https?:|data:)/.test(p) ? p : p; };
  var shot = function (s) { return s ? (typeof s === 'string' ? s : s.src) : ''; };
  var WORD = { live: 'Available', test: 'Beta', build: 'Coming soon', idea: 'Coming soon' };
  var PCT = { idea: 20, build: 50, test: 75, live: 100 };
  var ORDER = { live: 0, test: 1, build: 2, idea: 3 };
  var apps = V;
  var root = document.documentElement;
  var go = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---- hero B: "On the bench" column ---- */
  var hero = $('.hero');
  if (hero) {
    var bench = document.createElement('aside'); bench.className = 'x-bench'; bench.setAttribute('aria-label', 'On the bench');
    bench.innerHTML = '<p class="x-k">On the bench</p>' + apps.map(function (a) {
      return '<a class="x-bc" href="' + esc(a.slug) + '/"><img src="' + esc(src(a.icon)) + '" alt=""><span><b>' + esc(a.name) + '</b><small>' + esc(WORD[a.stage]) + '</small><i style="--p:' + PCT[a.stage] + '%"></i></span></a>';
    }).join('') + '<a class="x-bc ghost" href="contact/?topic=launch"><span class="q">?</span><span><b>Next app</b><small>On the drawing board</small><i style="--p:10%"></i></span></a>';
    hero.appendChild(bench);
  }

  /* ---- apps B: side-by-side cards; C: spec rows ---- */
  var wg = $('#work-grid');
  if (wg) {
    var rows = document.createElement('div'); rows.className = 'x-rows';
    rows.innerHTML = apps.map(function (a, i) {
      var c = a.colors || {};
      return '<a class="x-row" href="' + esc(a.slug) + '/" style="--a:' + esc(c.bg || '#1E1C19') + '"><span class="x-n">' + ('0' + (i + 1)).slice(-2) + '</span>' +
        '<div class="x-l"><div class="x-id"><img src="' + esc(a.icon) + '" alt=""><div><b>' + esc(a.name) + '</b><small>' + esc(a.kind || '') + '</small></div></div><p>' + esc(a.tagline) + '</p>' +
        '<ul>' + (a.points || []).slice(0, 3).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="x-strip">' + (a.screens || []).slice(0, 3).map(function (s) { return '<img src="' + esc(shot(s)) + '" alt="">'; }).join('') + '</div>' +
        '<div class="x-r"><span class="x-tag ' + a.stage + '">' + esc(WORD[a.stage]) + '</span><span class="x-go">Explore ' + esc(a.name) + go + '</span></div></a>';
    }).join('');
    wg.parentNode.insertBefore(rows, wg.nextSibling);
  }

  /* ---- rules + steps ---- */
  var rules = $$('#approach .pcard').map(function (c) { return { h: $('h3', c).textContent, p: $('p', c).textContent, i: $('.ico', c).innerHTML }; });
  var steps = $$('#process .pstep').map(function (c) { return { n: $('.ps-num', c).textContent, h: $('h3', c).textContent, p: $('p', c).textContent, i: $('.ps-ico', c).innerHTML }; });
  var ap = $('#approach .grid4'), pp = $('#process .psteps');
  if (ap && pp) {
    // 2: rule book + timeline
    var book = document.createElement('div'); book.className = 'x-book';
    book.innerHTML = '<div class="x-book-h"><span>The rule book</span><span>Forge Apps · every app</span></div><ol>' + rules.map(function (r, i) { return '<li><span class="x-rn">Rule<b>0' + (i + 1) + '</b></span><div><h3>' + esc(r.h) + '</h3><p>' + esc(r.p) + '</p></div></li>'; }).join('') + '</ol>';
    ap.parentNode.appendChild(book);
    var tl = document.createElement('ol'); tl.className = 'x-tl';
    tl.innerHTML = steps.map(function (s) { return '<li><span class="x-dot">' + esc(s.n) + '</span><h3>' + esc(s.h) + '</h3><p>' + esc(s.p) + '</p></li>'; }).join('');
    pp.parentNode.appendChild(tl);
    ap.classList.add('x-hide'); pp.classList.add('x-hide');
  }

  /* ---- FAQ ---- */
  var fq = $('#faq');
  if (fq) {
    var qs = $$('#faq-list details').map(function (d) { return { q: $('summary', d).textContent, a: $('p', d).innerHTML }; });
    var desk = document.createElement('div'); desk.className = 'x-desk';
    desk.innerHTML = '<div class="x-dl"><h2 class="h2">Questions, answered.</h2><label class="search x-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" placeholder="Search questions" aria-label="Search questions"></label>' +
      '<div class="x-chips">' + [['Free?', /free|price|cost/i], ['My data', /data|collect|privacy/i], ['Testing', /tester|test/i], ['Delete data', /delete/i]].map(function (c) { var k = -1; qs.some(function (q, i) { if (c[1].test(q.q)) { k = i; return true; } return false; }); return k < 0 ? '' : '<button type="button" data-q="' + k + '">' + c[0] + '</button>'; }).join('') + '</div>' +
      '<div class="x-stuck"><b>Still stuck?</b><p>Write to me and I will reply myself.</p><a class="btn btn-accent" href="contact/">Ask a question</a></div></div>' +
      '<div class="x-dr">' + qs.map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + ' data-i="' + i + '"><summary>' + esc(q.q) + '</summary><p>' + q.a + '</p></details>'; }).join('') + '</div>';
    var w = $('.wrap', fq); w.appendChild(desk); w.classList.add('x-has-desk');
    var inp = $('input', desk);
    inp.addEventListener('input', function () { var v = inp.value.trim().toLowerCase(); $$('.x-dr details', desk).forEach(function (d) { d.hidden = v && d.textContent.toLowerCase().indexOf(v) === -1; }); });
    $$('.x-chips button', desk).forEach(function (b) { b.addEventListener('click', function () { var d = $('.x-dr details[data-i="' + b.getAttribute('data-q') + '"]', desk); if (d) { $$('.x-dr details', desk).forEach(function (x) { x.open = false; }); d.open = true; d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }); });
  }

})();

/* V2 home: privacy links, numbers (only real ones) and the latest updates as cards */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var F = window.FORGE || { apps: [], updates: [] }, V = F.apps.filter(function (a) { return !a.hidden; });
  var pols = $('#v2-pols');
  if (pols) pols.insertAdjacentHTML('afterbegin', V.map(function (a) { return '<a href="' + esc(a.slug) + '/privacy/"><img src="' + esc(a.icon) + '" alt="">' + esc(a.name) + ' privacy policy →</a>'; }).join(''));
  var st = $('#v2-stats');
  if (st) {
    var live = V.filter(function (a) { return a.stage === 'live'; }).length, work = V.length - live;
    var P = window.FORGE_PRICES && window.FORGE_PRICES.wealthon, n = P ? Object.keys(P).length : 0;
    var S = [[live, live === 1 ? 'App on Google Play' : 'Apps on Google Play'], [work, work === 1 ? 'App in the forge' : 'Apps in the forge'], [(F.updates || []).filter(function (u) { return !u.app || V.some(function (a) { return a.slug === u.app; }); }).length, 'Product updates']];
    if (n) S.push([n, 'Countries with local pricing']);
    if (F.stats) Object.keys(F.stats).forEach(function (k) { if (F.stats[k]) S.push([F.stats[k], k]); });
    st.innerHTML = S.map(function (s) { return '<div class="v2-stat"><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>'; }).join('');
  }
  var ul = $('#updates');
  if (ul && ul.parentNode) {
    var by = function (s) { return V.filter(function (a) { return a.slug === s; })[0]; };
    var title = function (u) { if (u.title) return u.title; var m = String(u.text).split(/[:;]|\.\s/)[0]; return m.length > 64 ? m.slice(0, 61) + '…' : m; };
    var up = (F.updates || []).filter(function (u) { return !u.app || by(u.app); }).slice(0, 3);
    var box = document.createElement('div'); box.className = 'v2-up';
    box.innerHTML = up.length ? up.map(function (u) { var a = by(u.app); return '<article class="v2-uc"><div class="v2-uc-h"><span class="mono">' + esc(u.date) + '</span>' + (a ? '<span class="v2-app"><img src="' + esc(a.icon) + '" alt="">' + esc(a.name) + '</span>' : '<span class="v2-app">Studio</span>') + '</div><h3>' + esc(title(u)) + '</h3><p>' + esc(u.text) + '</p><a href="updates/">Read more →</a></article>'; }).join('')
      : '<div class="v2-empty">Nothing new on the bench yet. Check back soon.</div>';
    ul.parentNode.replaceChild(box, ul);
  }
})();
