/* Forge Apps — builds the app cards and fills shared bits on every page. No libraries needed. */
(function () {
  var F = window.FORGE || { apps: [] };
  var root = document.documentElement.getAttribute('data-root') || '';
  var STAGES = ['idea', 'build', 'test', 'live'];
  var STAGE_LABEL = { idea: 'Idea', build: 'Build', test: 'Test', live: 'Live' };
  var FILTER_LABEL = { live: 'On Google Play', test: 'In testing', build: 'Being built', idea: 'Ideas' };
  var url = function (p) { return /^(data:|https?:)/.test(p) ? p : root + p; };
  var shotSrc = function (x) { return typeof x === 'string' ? x : x.src; };
  var shotCap = function (x) { return typeof x === 'string' ? '' : (x.caption || ''); };
  var ytId = function (u) { var m = String(u).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : ''; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function tracker(app, compact) {
    var cur = STAGES.indexOf(app.stage);
    return '<div class="stage' + (compact ? ' compact' : '') + '" role="img" aria-label="Stage: ' + esc(STAGE_LABEL[app.stage] || app.stage) + '. ' + esc(app.stageNote || '') + '">' +
      '<ol aria-hidden="true">' + STAGES.map(function (s, i) {
        return '<li class="' + (i < cur ? 'done' : i === cur ? 'now' : '') + '"><span class="bar"></span>' + STAGE_LABEL[s] + '</li>';
      }).join('') + '</ol>' +
      (app.stageNote ? '<p class="stage-note">' + esc(app.stageNote) + '</p>' : '') + '</div>';
  }
  function vars(c) {
    c = c || {};
    return '--bg:' + (c.bg || '#1C1F26') + ';--bg2:' + (c.bg2 || '#111318') + ';--acc:' + (c.accent || '#FF6A2B') + ';--acc2:' + (c.accent2 || '#FFB547') +
      ';--soft:' + (c.soft || '#2A2E37') + ';--tx:' + (c.text || '#F5F3EF') + ';--btnbg:' + (c.btnBg || '#FF6A2B') + ';--btntx:' + (c.btnText || '#111318');
  }
  var STAGE_WORD = { idea: 'Idea', build: 'Being built', test: 'In testing', live: 'On Google Play' };
  function card(a, select) {
    var el = document.createElement(select ? 'button' : 'a');
    var cur = STAGES.indexOf(a.stage);
    el.className = 'mini';
    if (select) { el.type = 'button'; el.setAttribute('aria-pressed', 'false'); el.setAttribute('aria-controls', 'spotlight'); el.setAttribute('data-slug', a.slug); }
    else el.href = root + a.slug + '/';
    el.setAttribute('style', vars(a.colors));
    el.setAttribute('data-stage', a.stage);
    el.setAttribute('data-search', (a.name + ' ' + (a.kind || '') + ' ' + a.tagline).toLowerCase());
    el.innerHTML =
      '<span class="mini-icon"><img src="' + url(a.icon) + '" alt="" width="56" height="56"></span>' +
      '<span class="mini-main">' +
        '<span class="mini-name">' + esc(a.name) + '</span>' +
        '<span class="mini-tag">' + esc(a.tagline) + '</span>' +
        '<span class="mini-meta"><span class="mini-bar" aria-hidden="true">' + STAGES.map(function (s, k) { return '<i class="' + (k < cur ? 'd' : k === cur ? 'n' : '') + '"></i>'; }).join('') + '</span>' +
          '<span class="mini-stage">' + esc(STAGE_WORD[a.stage] || a.stage) + '</span></span>' +
      '</span>' +
      '<span class="mini-go" aria-hidden="true">' + (select ? '↓' : '→') + '</span>';
    return el;
  }

  // Opening the site straight from the computer (file://) doesn't load a folder's index.html by itself,
  // so links like "wealthon/" would show a folder. Point them at index.html when viewed locally.
  // On the live site (https://forgeapps.in) this does nothing.
  if (location.protocol === 'file:') {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#|data:)/.test(h)) return;
      var m = h.match(/^([^#?]*)([?#].*)?$/);
      var path = m[1], rest = m[2] || '';
      if (path === '' || path.slice(-1) === '/' || path === '.' || path === '..') {
        if (path === '.' || path === '..') path += '/';
        e.preventDefault();
        location.href = (path || './') + 'index.html' + rest;
      }
    }, true);
  }

  // ---------- Navigation: logo + menu button; the menu opens full screen ----------
  var header = document.querySelector('.site-header');
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  if (header && nav && toggle) {
    var bar = header.querySelector('.wrap');
    bar.classList.add('nav-bar');
    toggle.innerHTML = '<span class="burger" aria-hidden="true"><i></i><i></i><i></i></span>';
    bar.appendChild(toggle);
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    var panel = document.createElement('div');
    panel.className = 'fs-menu'; panel.id = 'fs-menu'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Menu');
    header.appendChild(panel);
    toggle.setAttribute('aria-controls', 'fs-menu');

    var here = location.pathname.replace(/index\.html$/, '');
    var build = function () {
      var items = [], seen = {};
      var add = function (href, label, current) { if (seen[label]) return; seen[label] = 1; items.push({ href: href, label: label, current: current }); };
      add(root || './', 'Home', !document.documentElement.getAttribute('data-app') && root === '');
      add(root + 'apps/', 'All apps', /\/apps\/$/.test(here));
      Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
        if (a.hidden) return;
        var h = a.getAttribute('href'), t = a.textContent.trim();
        if (/(^|\/)apps\/$/.test(h) || t === 'Home' || t === 'All apps') return;
        add(h, t, false);
      });
      var apps = F.apps.slice(0, 4).map(function (a) {
        return '<a class="fs-app" href="' + root + a.slug + '/" style="' + vars(a.colors) + '"><img src="' + url(a.icon) + '" alt="" width="52" height="52"><span>' + esc(a.name) + '</span></a>';
      }).join('');
      panel.innerHTML =
        '<div class="fs-inner">' +
          '<nav class="fs-links" aria-label="Pages">' + items.map(function (it, i) {
            return '<a href="' + it.href + '" style="--i:' + i + '"' + (it.current ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</a>';
          }).join('') + '</nav>' +
          (apps ? '<div class="fs-apps" style="--i:' + items.length + '">' + apps + '</div>' : '') +
          '<a class="fs-mail" style="--i:' + (items.length + 1) + '" href="mailto:' + esc(F.email) + '">' + esc(F.email) + '</a>' +
        '</div>';
    };
    var setOpen = function (open) {
      if (open) build();
      panel.hidden = !open; header.classList.toggle('menu-open', open);
      document.documentElement.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { var f = panel.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
    };
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a') || e.target === panel) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); } });
  }

  // Year, email, socials
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('[data-email]').forEach(function (el) {
    if (!el.hasAttribute('data-keep')) el.textContent = F.email;
    if (el.tagName === 'A') el.href = 'mailto:' + F.email;
  });
  ['youtube', 'instagram'].forEach(function (k) {
    document.querySelectorAll('[data-social="' + k + '"]').forEach(function (el) {
      if (F[k]) { el.href = F[k]; el.hidden = false; } else { el.hidden = true; }
    });
  });
  document.querySelectorAll('[data-app-count]').forEach(function (el) { el.textContent = F.apps.length; });

  // Home: the latest apps (first 4 in apps.js). Clicking one shows it in the spotlight below.
  var featured = document.getElementById('apps-featured');
  var spot = document.getElementById('spotlight');
  function spotlight(a) {
    if (!spot) return;
    var shots = a.screens || [];
    var base = root + a.slug + '/';
    var visual = shots.length
      ? '<div class="spot-strip-wrap"><div class="spot-strip" tabindex="0" aria-label="' + esc(a.name) + ' screens">' +
          shots.map(function (x, i) { return '<figure><img src="' + url(shotSrc(x)) + '" alt="' + esc(shotCap(x) || (a.name + ' screen ' + (i + 1))) + '" width="270" height="480" loading="lazy"></figure>'; }).join('') +
        '</div><div class="spot-nav"><button type="button" class="sn-btn" data-dir="-1" aria-label="Previous screens">←</button><button type="button" class="sn-btn" data-dir="1" aria-label="Next screens">→</button></div></div>'
      : '<div class="spot-visual" aria-hidden="true"><span class="sv-ring r1"></span><span class="sv-ring r2"></span><span class="sv-ring r3"></span><span class="sv-bit b1"></span><span class="sv-bit b2"></span><span class="sv-bit b3"></span><img src="' + url(a.icon) + '" alt="" width="150" height="150"><span class="sv-note">Screens coming soon</span></div>';
    spot.setAttribute('style', vars(a.colors));
    spot.classList.remove('swap'); void spot.offsetWidth; spot.classList.add('swap');
    spot.innerHTML =
      '<div class="spot-copy">' +
        '<p class="eyebrow">In the spotlight</p>' +
        '<div class="spot-id"><img src="' + url(a.icon) + '" alt="" width="64" height="64"><div><h2>' + esc(a.name) + '</h2><p>' + esc(a.kind || '') + ' · ' + esc(a.platform) + '</p></div></div>' +
        '<p class="spot-tag">' + esc(a.tagline) + '</p>' +
        (a.points ? '<ul class="spot-points">' + a.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
        tracker(a) +
        '<div class="spot-actions"><a class="btn spot-btn" href="' + base + '"><span>Explore ' + esc(a.name) + '</span><span aria-hidden="true">→</span></a></div>' +
      '</div>' + visual;
    var strip = spot.querySelector('.spot-strip');
    spot.querySelectorAll('.sn-btn').forEach(function (b) {
      b.addEventListener('click', function () { strip.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * strip.clientWidth * 0.8, behavior: 'smooth' }); });
    });
    if (featured) featured.querySelectorAll('.mini').forEach(function (c) { var on = c.getAttribute('data-slug') === a.slug; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
  }
  if (featured) {
    var limit = parseInt(featured.getAttribute('data-limit'), 10) || 4;
    var list = F.apps.slice(0, limit);
    list.forEach(function (a) { featured.appendChild(card(a, !!spot)); });
    if (spot && list.length) {
      featured.addEventListener('click', function (e) {
        var b = e.target.closest('.mini'); if (!b) return;
        var a = F.apps.filter(function (x) { return x.slug === b.getAttribute('data-slug'); })[0];
        if (a) { spotlight(a); if (innerWidth < 900) spot.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
      spotlight(list[0]);
    }
  }

  // Home: live counts for the About section
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var k = el.getAttribute('data-count');
    el.textContent = k === 'all' ? F.apps.length : F.apps.filter(function (a) { return a.stage === k; }).length;
  });

  // Home: latest updates
  var upd = document.getElementById('updates');
  if (upd && F.updates) {
    upd.innerHTML = F.updates.map(function (u) {
      var a = F.apps.filter(function (x) { return x.slug === u.app; })[0];
      return '<li style="' + vars(a && a.colors) + '">' + (a ? '<img src="' + root + a.icon + '" alt="" width="34" height="34">' : '<span class="u-dot"></span>') +
        '<div><span class="u-date">' + esc(u.date) + (a ? ' · ' + esc(a.name) : '') + '</span><p>' + esc(u.text) + '</p></div></li>';
    }).join('');
  }

  // All apps page: every app, with filter buttons for the stages that exist
  var all = document.getElementById('apps-all');
  if (all) {
    F.apps.forEach(function (a) { all.appendChild(card(a)); });
    var bar = document.getElementById('apps-filter');
    if (bar) {
      var present = STAGES.slice().reverse().filter(function (s) { return F.apps.some(function (a) { return a.stage === s; }); });
      var opts = [['all', 'All apps']].concat(present.map(function (s) { return [s, FILTER_LABEL[s]]; }));
      bar.innerHTML = opts.map(function (o, i) { return '<button type="button" class="chip' + (i === 0 ? ' on' : '') + '" data-f="' + o[0] + '" aria-pressed="' + (i === 0) + '">' + o[1] + '</button>'; }).join('');
      var filt = 'all', q = '', search = document.getElementById('apps-search'), empty = document.getElementById('apps-empty');
      var apply = function () {
        var shown = 0;
        all.querySelectorAll('.mini').forEach(function (c) {
          var ok = (filt === 'all' || c.getAttribute('data-stage') === filt) && (!q || c.getAttribute('data-search').indexOf(q) > -1);
          c.hidden = !ok; if (ok) shown++;
        });
        if (empty) empty.hidden = shown > 0;
        var cnt = document.getElementById('apps-shown'); if (cnt) cnt.textContent = shown + (shown === 1 ? ' app' : ' apps');
      };
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        bar.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        filt = b.getAttribute('data-f'); apply();
      });
      if (search) search.addEventListener('input', function () { q = search.value.trim().toLowerCase(); apply(); });
      apply();
    }
  }

  // App page: screenshots (with a viewer), videos and "about" from apps.js
  function appSections(app) {
    var need = { screens: !!(app.screens && app.screens.length), videos: !!(app.videos && app.videos.length), about: !!(app.about && app.about.length) };
    document.querySelectorAll('[data-needs]').forEach(function (el) { el.hidden = !need[el.getAttribute('data-needs')]; });
    var sh = document.getElementById('app-screens');
    if (sh && need.screens) {
      sh.innerHTML = app.screens.map(function (x, i) {
        return '<button type="button" class="shot" data-i="' + i + '" aria-label="Open screen ' + (i + 1) + (shotCap(x) ? ': ' + esc(shotCap(x)) : '') + '"><img src="' + url(shotSrc(x)) + '" alt="" width="270" height="480" loading="lazy">' +
          (shotCap(x) ? '<span>' + esc(shotCap(x)) + '</span>' : '') + '</button>';
      }).join('');
      // viewer
      var dlg = document.createElement('dialog'); dlg.className = 'viewer'; dlg.setAttribute('aria-label', app.name + ' screens');
      dlg.innerHTML = '<button type="button" class="v-close" aria-label="Close">×</button><button type="button" class="v-prev" aria-label="Previous">←</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="v-next" aria-label="Next">→</button>';
      document.body.appendChild(dlg);
      var cur = 0, img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption');
      var show = function (i) { cur = (i + app.screens.length) % app.screens.length; var x = app.screens[cur]; img.src = url(shotSrc(x)); img.alt = shotCap(x) || app.name + ' screen ' + (cur + 1); cap.textContent = (cur + 1) + ' / ' + app.screens.length + (shotCap(x) ? ' · ' + shotCap(x) : ''); };
      sh.addEventListener('click', function (e) { var b = e.target.closest('.shot'); if (!b) return; show(parseInt(b.getAttribute('data-i'), 10)); dlg.showModal(); });
      dlg.querySelector('.v-close').addEventListener('click', function () { dlg.close(); });
      dlg.querySelector('.v-prev').addEventListener('click', function () { show(cur - 1); });
      dlg.querySelector('.v-next').addEventListener('click', function () { show(cur + 1); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    var vd = document.getElementById('app-videos');
    if (vd && need.videos) {
      vd.innerHTML = app.videos.map(function (v) {
        var id = ytId(v.youtube || v.src || '');
        if (id) {
          var tall = v.vertical || /\/shorts\//.test(v.youtube || v.src || '');
          return '<figure class="vid yt' + (tall ? ' tall' : ' wide') + '"><button type="button" class="yt-play" data-yt="' + id + '" aria-label="Play video: ' + esc(v.title || '') + '">' +
            '<img src="https://i.ytimg.com/vi/' + id + '/' + (tall ? 'oar2' : 'hqdefault') + '.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg\'">' +
            '<span class="yt-btn" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></span></button>' +
            '<figcaption>' + esc(v.title || '') + '</figcaption></figure>';
        }
        return '<figure class="vid"><video controls playsinline preload="none" poster="' + url(v.poster || '') + '" src="' + url(v.src) + '"></video><figcaption>' + esc(v.title || '') + '</figcaption></figure>';
      }).join('');
      vd.addEventListener('click', function (e) {
        var b = e.target.closest('.yt-play'); if (!b) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&rel=0&playsinline=1';
        f.title = b.getAttribute('aria-label'); f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
        b.replaceWith(f);
      });
      vd.addEventListener('play', function (e) { vd.querySelectorAll('video').forEach(function (x) { if (x !== e.target) x.pause(); }); }, true);
    }
    var ab = document.getElementById('app-about');
    if (ab && need.about) {
      ab.innerHTML = '<div class="about-text">' + app.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
        (app.facts && app.facts.length ? '<dl class="facts">' + app.facts.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' : '');
    }
  }

  // App page: stage tracker, brand colours and Google Play button from apps.js
  var slug = document.documentElement.getAttribute('data-app');
  if (slug) {
    var app = F.apps.filter(function (a) { return a.slug === slug; })[0];
    if (app) {
      document.documentElement.setAttribute('style', vars(app.colors));
      appSections(app);
      document.querySelectorAll('[data-status]').forEach(function (el) {
        var d = document.createElement('div'); d.innerHTML = tracker(app); el.parentNode.parentNode.insertBefore(d.firstChild, el.parentNode.nextSibling); el.remove();
      });
      document.querySelectorAll('[data-play]').forEach(function (el) {
        var label = el.querySelector('span');
        if (app.playUrl) {
          el.href = app.playUrl; el.removeAttribute('aria-disabled'); el.target = '_blank'; el.rel = 'noopener';
          label.textContent = app.stage === 'live' ? 'Get it on Google Play' : 'Open on Google Play';
        } else { el.setAttribute('aria-disabled', 'true'); el.removeAttribute('href'); label.textContent = 'Coming soon to Google Play'; }
      });
      document.querySelectorAll('[data-play-note]').forEach(function (el) {
        if (app.stage === 'test') {
          el.hidden = false;
          el.innerHTML = 'In closed testing: only invited testers can install it for now.' + (app.testUrl ? ' <a href="' + esc(app.testUrl) + '" target="_blank" rel="noopener">Join the test</a>' : '');
        } else if (app.stage !== 'live' && !app.playUrl) { el.hidden = false; el.textContent = 'Not on Google Play yet. It will appear here at launch.'; }
      });
    }
  }
})();
