/* Forge Apps admin panel.
   Edits assets/apps.js (apps, links, screens, videos, about, colours, updates) and publishes
   straight to the GitHub repo with a fine-grained token. Nothing here is sent anywhere except api.github.com. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var STAGES = [['idea', 'Idea'], ['build', 'Being built'], ['test', 'In testing'], ['live', 'Live on Google Play']];
  var DEFAULT_COLORS = { bg: '#1C1F26', bg2: '#111318', accent: '#FF6A2B', accent2: '#FFB547', soft: '#2A2E37', text: '#F5F3EF', btnBg: '#FF6A2B', btnText: '#111318' };
  var COLOR_LABELS = { bg: 'Panel background', bg2: 'Panel background 2', accent: 'Main colour', accent2: 'Second colour', soft: 'Soft tint', text: 'Text on panel', btnBg: 'Button', btnText: 'Button text' };

  var state = clone(window.FORGE || { email: '', youtube: '', instagram: '', updates: [], apps: [] });
  if (!state.updates) state.updates = [];
  if (!state.analytics) state.analytics = { umami: '', cloudflare: '' };
  var existingSlugs = state.apps.map(function (a) { return a.slug; });
  var pending = {};          // path -> { b64, url } images waiting to be uploaded
  var view = state.apps.length ? 'app:0' : 'site';
  var dirty = false;
  var gh = { repo: '', branch: 'main', token: '', ok: false };

  /* ---------------- helpers ---------------- */
  function toast(msg, kind) { var t = $('#toast'); t.textContent = msg; t.className = 'toast ' + (kind || ''); t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, kind === 'bad' ? 9000 : 4200); }
  function setDirty(v) { dirty = v; var s = $('#status'); s.textContent = v ? 'Unsaved changes' : (gh.ok ? 'Connected · up to date' : ''); s.className = 'status' + (v ? ' dirty' : ''); }
  function imgSrc(p) { if (!p) return ''; if (pending[p]) return pending[p].url; if (/^(https?:|data:|blob:)/.test(p)) return p; return '../' + p; }
  function ytId(u) { var m = String(u || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : ''; }
  function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'new-app'; }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function setPath(obj, path, val) { var ks = path.split('.'); var last = ks.pop(); var o = ks.reduce(function (o, k) { if (o[k] == null) o[k] = /^\d+$/.test(k) ? [] : {}; return o[k]; }, obj); o[last] = val; }
  var b64utf8 = function (s) { return btoa(unescape(encodeURIComponent(s))); };
  var utf8b64 = function (b) { return decodeURIComponent(escape(atob(String(b).replace(/\s/g, '')))); };

  function appsJs() {
    var data = clone(state);
    data.apps.forEach(function (a) {
      ['points', 'about', 'screens', 'videos', 'facts'].forEach(function (k) { if (Array.isArray(a[k]) && !a[k].length) delete a[k]; });
      ['testUrl', 'stageNote', 'playUrl'].forEach(function (k) { if (a[k] === '' && k === 'testUrl') delete a[k]; });
    });
    return '/*\n  Forge Apps — site settings and the list of apps.\n  Edit this with the admin panel (/admin/) or by hand.\n' +
      '  The first 4 apps show on the home page. stage: idea | build | test | live.\n*/\nwindow.FORGE = ' + JSON.stringify(data, null, 2) + ';\n';
  }

  /* ---------------- image resize ---------------- */
  function readImage(file, maxW, maxH, type) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, maxW / img.width, maxH / img.height);
        var w = Math.round(img.width * s), h = Math.round(img.height * s);
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var g = c.getContext('2d'); if (type === 'image/jpeg') { g.fillStyle = '#111318'; g.fillRect(0, 0, w, h); }
        g.drawImage(img, 0, 0, w, h);
        var data = c.toDataURL(type, 0.86); URL.revokeObjectURL(u);
        res({ b64: data.split(',')[1], url: data });
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error('Could not read that image')); };
      img.src = u;
    });
  }

  /* ---------------- GitHub ---------------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + gh.token, 'X-GitHub-Api-Version': '2022-11-28' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch('https://api.github.com' + path, { method: opts.method || 'GET', headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined }).then(function (r) {
      if (r.status === 404 && opts.allow404) return null;
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error((j && j.message) || ('GitHub error ' + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  var cpath = function (p) { return '/repos/' + gh.repo + '/contents/' + p.split('/').map(encodeURIComponent).join('/'); };
  function getFile(p) { return api(cpath(p) + '?ref=' + encodeURIComponent(gh.branch), { allow404: true }); }
  function putFile(p, b64, message) {
    return getFile(p).then(function (cur) {
      var body = { message: message, content: b64, branch: gh.branch };
      if (cur && cur.sha) body.sha = cur.sha;
      return api(cpath(p), { method: 'PUT', body: body });
    });
  }

  function connect() {
    gh.repo = $('#gh-repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    gh.branch = $('#gh-branch').value.trim() || 'main';
    gh.token = $('#gh-token').value.trim();
    var hint = $('#conn-hint');
    if (!gh.token) { hint.textContent = 'Paste an access token first.'; hint.className = 'hint bad'; return; }
    hint.textContent = 'Connecting…'; hint.className = 'hint';
    api('/repos/' + gh.repo).then(function (r) {
      if (r.permissions && !r.permissions.push) throw new Error('This token can read the repo but not write to it. Give it "Contents: Read and write".');
      return getFile('assets/apps.js');
    }).then(function (f) {
      if (!f) throw new Error('assets/apps.js was not found in ' + gh.repo + ' (' + gh.branch + ').');
      var w = {}; new Function('window', utf8b64(f.content))(w);
      if (!w.FORGE || !Array.isArray(w.FORGE.apps)) throw new Error('assets/apps.js in the repo could not be read.');
      if (dirty && !confirm('Load the latest version from GitHub? Your unsaved changes here will be replaced.')) { gh.ok = true; return; }
      state = w.FORGE; if (!state.updates) state.updates = [];
      existingSlugs = state.apps.map(function (a) { return a.slug; });
      pending = {}; gh.ok = true; setDirty(false); render();
    }).then(function () {
      gh.ok = true;
      hint.textContent = 'Connected to ' + gh.repo + '. Changes go live about a minute after you publish.'; hint.className = 'hint ok';
      $('#btn-publish').disabled = false; $('#btn-disconnect').hidden = false; $('#btn-connect').textContent = 'Reload from GitHub';
      try { if ($('#gh-remember').checked) localStorage.setItem('forge-admin', JSON.stringify({ repo: gh.repo, branch: gh.branch, token: gh.token })); else localStorage.removeItem('forge-admin'); } catch (e) {}
      setDirty(dirty);
    }).catch(function (e) {
      gh.ok = false; $('#btn-publish').disabled = true;
      hint.textContent = e.status === 401 ? 'That token was not accepted. Check it and try again.' : e.message; hint.className = 'hint bad';
    });
  }

  function publish() {
    if (!gh.ok) return;
    var btn = $('#btn-publish'); btn.disabled = true;
    var steps = [], newOnes = state.apps.filter(function (a) { return existingSlugs.indexOf(a.slug) === -1; });
    var say = function (t) { $('#status').textContent = t; };
    // 1. pages for brand-new apps, made from _template
    newOnes.forEach(function (a) {
      steps.push(function () {
        return getFile(a.slug + '/index.html').then(function (exists) {
          if (exists) return;
          say('Creating pages for ' + a.name + '…');
          var files = ['index.html', 'privacy/index.html', 'terms/index.html', 'delete-account/index.html'];
          return files.reduce(function (p, f) {
            return p.then(function () {
              return getFile('_template/' + f).then(function (t) {
                if (!t) return;
                var txt = utf8b64(t.content).replace(/\{\{NAME\}\}/g, a.name).replace(/\{\{SLUG\}\}/g, a.slug).replace(/\{\{TAGLINE\}\}/g, a.tagline || '');
                if (f === 'index.html' && !/\.svg$/.test(a.icon || '')) txt = txt.replace(/src="icon\.svg"/g, 'src="' + (/^(https?:)/.test(a.icon) ? a.icon : '../' + a.icon) + '"');
                return putFile(a.slug + '/' + f, b64utf8(txt), 'Add ' + a.name + ' pages');
              });
            });
          }, Promise.resolve()).then(function () {
            if (a.icon === a.slug + '/icon.svg') return getFile('_template/icon.svg').then(function (t) { if (t) return putFile(a.slug + '/icon.svg', t.content.replace(/\s/g, ''), 'Add ' + a.name + ' icon'); });
          });
        });
      });
    });
    // 2. images (only the ones still used)
    var used = JSON.stringify(state);
    Object.keys(pending).forEach(function (p) {
      if (used.indexOf('"' + p + '"') === -1) return;
      steps.push(function () { say('Uploading ' + p + '…'); return putFile(p, pending[p].b64, 'Add ' + p); });
    });
    // 3. the app list itself
    steps.push(function () { say('Saving apps.js…'); return putFile('assets/apps.js', b64utf8(appsJs()), 'Update apps from admin'); });

    steps.reduce(function (p, f) { return p.then(f); }, Promise.resolve()).then(function () {
      Object.keys(pending).forEach(function (p) { if (used.indexOf('"' + p + '"') > -1) delete pending[p]; });
      existingSlugs = state.apps.map(function (a) { return a.slug; });
      setDirty(false); render();
      toast('Published. The live site updates in about a minute.', 'ok');
    }).catch(function (e) {
      toast('Publishing stopped: ' + e.message + '\nNothing you changed here is lost; fix it and press Publish again.', 'bad');
      setDirty(true);
    }).then(function () { btn.disabled = !gh.ok; });
  }

  function download() {
    var blob = new Blob([appsJs()], { type: 'text/javascript' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'apps.js'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    var n = Object.keys(pending).length;
    toast('apps.js downloaded. Upload it to assets/ in the repo.' + (n ? '\nNote: ' + n + ' uploaded image(s) only go up with "Publish to GitHub". To do it by hand, use image links instead.' : ''));
  }

  /* ---------------- rendering ---------------- */
  function renderList() {
    $('#app-list').innerHTML = state.apps.map(function (a, i) {
      return '<button type="button" class="item' + (view === 'app:' + i ? ' on' : '') + '" data-view="app:' + i + '"><img src="' + esc(imgSrc(a.icon)) + '" alt=""><span class="nm">' + esc(a.name || 'Untitled') + '</span>' + (i < 4 ? '<span class="pos">Home</span>' : '') + '</button>';
    }).join('');
    $$('.list > .item').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-view') === view); });
  }
  var field = function (label, path, val, opts) {
    opts = opts || {};
    var attrs = ' data-bind="' + path + '"' + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + (opts.readonly ? ' readonly' : '');
    var inp = opts.textarea ? '<textarea' + attrs + '>' + esc(val) + '</textarea>' : '<input type="' + (opts.type || 'text') + '"' + attrs + ' value="' + esc(val) + '">';
    return '<label>' + label + inp + (opts.note ? '<span class="hint" style="margin:0">' + opts.note + '</span>' : '') + '</label>';
  };

  function renderSite() {
    $('#editor').innerHTML = '<div class="card"><h3>Site settings</h3><p class="hint">Shown across the whole site. Leave a social link empty to hide its button.</p>' +
      field('Support email', 'email', state.email) +
      field('YouTube channel link', 'youtube', state.youtube, { placeholder: 'https://www.youtube.com/@forgeapps', type: 'url' }) +
      field('Instagram link', 'instagram', state.instagram, { placeholder: 'https://www.instagram.com/forgeapps', type: 'url' }) + '</div>' +
      '<div class="card"><h3>Contact form &amp; analytics</h3><p class="hint">Leave empty to switch off. Messages from forgeapps.in/contact go to the email the Web3Forms key was made for.</p>' +
      field('Web3Forms access key', 'formKey', state.formKey || '', { placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', note: 'Free at web3forms.com: enter support@forgeapps.in and the key arrives by email.' }) +
      field('Umami website ID', 'analytics.umami', (state.analytics || {}).umami || '', { placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', note: 'From cloud.umami.is → Websites → forgeapps.in → Edit.' }) +
      field('Cloudflare Web Analytics token (optional)', 'analytics.cloudflare', (state.analytics || {}).cloudflare || '', { placeholder: 'token' }) + '</div>';
  }
  function renderUpdates() {
    var opts = function (v) { return '<option value="">(no app)</option>' + state.apps.map(function (a) { return '<option value="' + esc(a.slug) + '"' + (a.slug === v ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join(''); };
    $('#editor').innerHTML = '<div class="card"><h3>Latest updates</h3><p class="hint">Short news on the home page, newest first.</p><div class="rows">' +
      state.updates.map(function (u, i) {
        return '<div class="r"><input style="flex:0 0 120px" data-bind="updates.' + i + '.date" value="' + esc(u.date) + '" placeholder="Nov 2026"><select style="flex:0 0 150px" data-bind="updates.' + i + '.app">' + opts(u.app) + '</select><input data-bind="updates.' + i + '.text" value="' + esc(u.text) + '" placeholder="What happened"><button type="button" class="icon-btn" data-act="up" data-list="updates" data-i="' + i + '" aria-label="Move up">↑</button><button type="button" class="icon-btn x" data-act="del" data-list="updates" data-i="' + i + '" aria-label="Remove">×</button></div>';
      }).join('') + '</div><button type="button" class="btn" data-act="add-update">+ Add update</button></div>';
  }

  function renderApp(i) {
    var a = state.apps[i]; if (!a) { view = 'site'; return render(); }
    ['points', 'about', 'screens', 'videos', 'facts'].forEach(function (k) { if (!Array.isArray(a[k])) a[k] = []; });
    a.screens = a.screens.map(function (x) { return typeof x === 'string' ? { src: x, caption: '' } : x; });
    a.colors = Object.assign({}, DEFAULT_COLORS, a.colors || {});
    var P = 'apps.' + i + '.';
    var isNew = existingSlugs.indexOf(a.slug) === -1;
    var stageOpts = STAGES.map(function (s) { return '<option value="' + s[0] + '"' + (a.stage === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('');
    var screens = a.screens.map(function (s, k) {
      var src = typeof s === 'string' ? s : s.src, cap = typeof s === 'string' ? '' : (s.caption || '');
      return '<div class="m-item"><div class="thumb"><img src="' + esc(imgSrc(src)) + '" alt="">' + (pending[src] ? '<span class="tag new">New</span>' : /^https?:/.test(src) ? '<span class="tag">Link</span>' : '') + '</div>' +
        '<input data-bind="' + P + 'screens.' + k + '.caption" value="' + esc(cap) + '" placeholder="Caption">' +
        '<div class="row"><span><button type="button" class="icon-btn" data-act="up" data-list="' + P + 'screens" data-i="' + k + '" aria-label="Move left">←</button> <button type="button" class="icon-btn" data-act="down" data-list="' + P + 'screens" data-i="' + k + '" aria-label="Move right">→</button></span><button type="button" class="icon-btn x" data-act="del" data-list="' + P + 'screens" data-i="' + k + '" aria-label="Remove">×</button></div></div>';
    }).join('');
    var videos = a.videos.map(function (v, k) {
      var link = v.youtube || v.src || '', id = ytId(link);
      var thumb = id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : imgSrc(v.poster || '');
      return '<div class="m-item v"><div class="thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="">' : '') + '<span class="tag">' + (id ? 'YouTube' : 'File') + '</span></div>' +
        '<input data-bind="' + P + 'videos.' + k + '.title" value="' + esc(v.title || '') + '" placeholder="Title">' +
        '<input data-bind="' + P + 'videos.' + k + '.' + (v.youtube != null || !v.src ? 'youtube' : 'src') + '" value="' + esc(link) + '" placeholder="YouTube link">' +
        (id ? '<label class="check" style="margin:0"><input type="checkbox" data-bind="' + P + 'videos.' + k + '.vertical"' + (v.vertical || /\/shorts\//.test(link) ? ' checked' : '') + '> Vertical (Shorts)</label>' : '') +
        '<div class="row"><span><button type="button" class="icon-btn" data-act="up" data-list="' + P + 'videos" data-i="' + k + '" aria-label="Move left">←</button> <button type="button" class="icon-btn" data-act="down" data-list="' + P + 'videos" data-i="' + k + '" aria-label="Move right">→</button></span><button type="button" class="icon-btn x" data-act="del" data-list="' + P + 'videos" data-i="' + k + '" aria-label="Remove">×</button></div></div>';
    }).join('');
    var listRows = function (key, ph) {
      return '<div class="rows">' + a[key].map(function (t, k) {
        return '<div class="r"><input data-bind="' + P + key + '.' + k + '" value="' + esc(t) + '" placeholder="' + ph + '"><button type="button" class="icon-btn" data-act="up" data-list="' + P + key + '" data-i="' + k + '" aria-label="Move up">↑</button><button type="button" class="icon-btn x" data-act="del" data-list="' + P + key + '" data-i="' + k + '" aria-label="Remove">×</button></div>';
      }).join('') + '</div>';
    };
    var facts = '<div class="rows">' + a.facts.map(function (f, k) {
      return '<div class="r"><input style="flex:0 0 38%" data-bind="' + P + 'facts.' + k + '.0" value="' + esc(f[0]) + '" placeholder="Label"><input data-bind="' + P + 'facts.' + k + '.1" value="' + esc(f[1]) + '" placeholder="Value"><button type="button" class="icon-btn x" data-act="del" data-list="' + P + 'facts" data-i="' + k + '" aria-label="Remove">×</button></div>';
    }).join('') + '</div>';
    var colors = Object.keys(COLOR_LABELS).map(function (k) { return '<label>' + COLOR_LABELS[k] + '<input type="color" data-bind="' + P + 'colors.' + k + '" value="' + esc(a.colors[k]) + '"></label>'; }).join('');

    $('#editor').innerHTML =
      '<div class="ed-head"><img src="' + esc(imgSrc(a.icon)) + '" alt=""><div><h2>' + esc(a.name || 'Untitled') + '</h2><span class="hint">' + (isNew ? 'New app · its pages are created when you publish' : 'forgeapps.in/' + esc(a.slug) + '/') + '</span></div>' +
        '<div class="row"><button type="button" class="btn small" data-act="move-app" data-dir="-1">Move up</button><button type="button" class="btn small" data-act="move-app" data-dir="1">Move down</button><button type="button" class="btn small danger" data-act="del-app">Remove</button></div></div>' +

      '<div class="card"><h3>Basics</h3><div class="grid2">' +
        field('App name', P + 'name', a.name) +
        field('Page address', P + 'slug', a.slug, { readonly: !isNew, note: isNew ? 'forgeapps.in/<b>' + esc(a.slug) + '</b>/ · lowercase, no spaces' : 'Fixed once the app is published' }) +
        field('Kind', P + 'kind', a.kind, { placeholder: 'Personal finance' }) +
        field('Platform', P + 'platform', a.platform, { placeholder: 'Android' }) +
      '</div>' + field('One-line description', P + 'tagline', a.tagline) +
      '<div class="grid2"><label>Stage<select data-bind="' + P + 'stage">' + stageOpts + '</select></label>' + field('Stage note', P + 'stageNote', a.stageNote, { placeholder: 'In closed testing on Google Play' }) + '</div></div>' +

      '<div class="card"><h3>Google Play</h3><p class="hint">The store link shows as the "Google Play" button. While testing, the opt-in link shows as "Join the test".</p>' +
        field('Google Play link', P + 'playUrl', a.playUrl, { type: 'url', placeholder: 'https://play.google.com/store/apps/details?id=com.example.app' }) +
        field('Testing opt-in link', P + 'testUrl', a.testUrl || '', { type: 'url', placeholder: 'https://play.google.com/apps/testing/com.example.app' }) + '</div>' +

      '<div class="card"><h3>Icon</h3><div class="add-media"><input type="text" data-bind="' + P + 'icon" value="' + esc(a.icon) + '" placeholder="Path in the repo (wealthon/icon.png) or a link"><span class="btn file-btn">Upload icon<input type="file" accept="image/*" data-upload="icon"></span></div></div>' +

      '<div class="card"><h3>Screenshots</h3><p class="hint">Phone screenshots (portrait). Uploads are resized to 540×960 and saved in the repo when you publish.</p>' +
        '<div class="media">' + (screens || '<p class="empty">No screenshots yet.</p>') + '</div>' +
        '<div class="add-media"><span class="btn file-btn">Upload images<input type="file" accept="image/*" multiple data-upload="screens"></span><input type="url" id="add-shot-url" placeholder="…or paste an image link (https://…)"><button type="button" class="btn" data-act="add-shot-url">Add link</button></div></div>' +

      '<div class="card"><h3>Videos</h3><p class="hint">Paste a YouTube link: a normal video, a Short (youtube.com/shorts/…) or youtu.be/… It plays right on the app page.</p>' +
        '<div class="media">' + (videos || '<p class="empty">No videos yet.</p>') + '</div>' +
        '<div class="add-media"><input type="url" id="add-yt" placeholder="https://www.youtube.com/watch?v=… or /shorts/…"><input type="text" id="add-yt-title" placeholder="Title"><button type="button" class="btn" data-act="add-yt">Add video</button><span id="yt-check"></span></div></div>' +

      '<div class="card"><h3>About the app</h3><p class="hint">One paragraph per box.</p>' + listRows('about', 'Paragraph') + '<button type="button" class="btn small" data-act="add" data-list="' + P + 'about">+ Paragraph</button></div>' +

      '<div class="card"><h3>Highlights</h3><p class="hint">Short tags in the home spotlight, e.g. "Safe to spend".</p>' + listRows('points', 'Highlight') + '<button type="button" class="btn small" data-act="add" data-list="' + P + 'points">+ Highlight</button></div>' +

      '<div class="card"><h3>Details</h3><p class="hint">Label and value rows next to About (Price, Platform…).</p>' + facts + '<button type="button" class="btn small" data-act="add-fact">+ Row</button></div>' +

      '<div class="card"><h3>Brand colours</h3><p class="hint">Taken from the app\'s logo. Used for its cards, spotlight and page.</p><div class="colors">' + colors + '</div>' +
        '<div class="preview-chip" id="chip" style="background:linear-gradient(150deg,' + a.colors.bg + ',' + a.colors.bg2 + ');color:' + a.colors.text + '"><img src="' + esc(imgSrc(a.icon)) + '" alt="" width="36" height="36" style="border-radius:23%"><b>' + esc(a.name) + '</b><span style="background:' + a.colors.btnBg + ';color:' + a.colors.btnText + ';padding:6px 12px;border-radius:9px;font-weight:700;font-size:13px">Explore</span></div></div>';
  }

  function render() {
    renderList();
    if (view === 'site') renderSite();
    else if (view === 'updates') renderUpdates();
    else renderApp(parseInt(view.split(':')[1], 10));
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-view]');
    if (v) { view = v.getAttribute('data-view'); render(); window.scrollTo(0, 0); return; }
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act'), i = view.indexOf('app:') === 0 ? parseInt(view.split(':')[1], 10) : -1, a = state.apps[i];
    var list = b.getAttribute('data-list'), k = parseInt(b.getAttribute('data-i'), 10), arr = list ? getPath(state, list) : null;
    if (act === 'del' && arr) arr.splice(k, 1);
    else if (act === 'up' && arr && k > 0) arr.splice(k - 1, 0, arr.splice(k, 1)[0]);
    else if (act === 'down' && arr && k < arr.length - 1) arr.splice(k + 1, 0, arr.splice(k, 1)[0]);
    else if (act === 'add' && arr) arr.push('');
    else if (act === 'add-fact') a.facts.push(['', '']);
    else if (act === 'add-update') state.updates.unshift({ date: new Date().toLocaleString('en', { month: 'short', year: 'numeric' }), app: '', text: '' });
    else if (act === 'add-shot-url') {
      var u = $('#add-shot-url').value.trim(); if (!/^https?:\/\//.test(u)) return toast('Paste a full image link starting with https://', 'bad');
      a.screens.push({ src: u, caption: '' });
    } else if (act === 'add-yt') {
      var link = $('#add-yt').value.trim(), id = ytId(link);
      if (!id) return toast('That does not look like a YouTube link.', 'bad');
      a.videos.push({ youtube: link, title: $('#add-yt-title').value.trim() || 'Video', vertical: /\/shorts\//.test(link) || undefined });
    } else if (act === 'move-app') {
      var d = parseInt(b.getAttribute('data-dir'), 10), j = i + d; if (j < 0 || j >= state.apps.length) return;
      state.apps.splice(j, 0, state.apps.splice(i, 1)[0]); view = 'app:' + j;
    } else if (act === 'del-app') {
      if (!confirm('Remove ' + (a.name || 'this app') + ' from the site? Its pages stay in the repo but are no longer listed.')) return;
      state.apps.splice(i, 1); view = state.apps.length ? 'app:0' : 'site';
    } else return;
    setDirty(true); render();
  });

  document.addEventListener('input', function (e) {
    var el = e.target, path = el.getAttribute && el.getAttribute('data-bind'); if (!path) return;
    var val = el.type === 'checkbox' ? (el.checked || undefined) : el.value;
    if (/\.slug$/.test(path)) {
      val = slugify(val);
      var app = getPath(state, path.replace(/\.slug$/, '')), was = app.slug;
      if (app.icon && app.icon.indexOf(was + '/') === 0 && !pending[app.icon]) app.icon = val + app.icon.slice(was.length);
    }
    setPath(state, path, val); setDirty(true);
    if (/\.(name|icon)$/.test(path)) renderList();
    if (/\.colors\./.test(path) || /\.name$/.test(path)) {
      var a = state.apps[parseInt(view.split(':')[1], 10)], chip = $('#chip');
      if (a && chip) { chip.style.background = 'linear-gradient(150deg,' + a.colors.bg + ',' + a.colors.bg2 + ')'; chip.style.color = a.colors.text; var sp = chip.querySelector('span'); sp.style.background = a.colors.btnBg; sp.style.color = a.colors.btnText; chip.querySelector('b').textContent = a.name; }
    }
    if (el.id === 'add-yt') { var c = $('#yt-check'); c.textContent = !el.value ? '' : ytId(el.value) ? '✓ YouTube link' : 'Not a YouTube link'; c.className = ytId(el.value) ? 'yt-ok' : 'yt-bad'; }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, path = el.getAttribute && el.getAttribute('data-bind');
    if (path && (/\.slug$/.test(path) || el.tagName === 'SELECT' || el.type === 'checkbox')) render();
    var up = el.getAttribute && el.getAttribute('data-upload'); if (!up || !el.files.length) return;
    var a = state.apps[parseInt(view.split(':')[1], 10)], files = Array.prototype.slice.call(el.files);
    var job = up === 'icon'
      ? readImage(files[0], 512, 512, 'image/png').then(function (r) { var p = a.slug + '/icon.png'; pending[p] = r; a.icon = p; })
      : files.reduce(function (pr, f, n) {
          return pr.then(function () { return readImage(f, 540, 960, 'image/jpeg').then(function (r) { var p = a.slug + '/screens/' + Date.now().toString(36) + n + '.jpg'; pending[p] = r; a.screens.push({ src: p, caption: '' }); }); });
        }, Promise.resolve());
    job.then(function () { setDirty(true); render(); toast(gh.ok ? 'Added. Press "Publish to GitHub" to put it live.' : 'Added. Connect GitHub and publish to upload it.'); })
      .catch(function (err) { toast(err.message, 'bad'); });
  });

  $('#btn-new-app').addEventListener('click', function () {
    var n = 1, slug = 'new-app'; while (state.apps.some(function (a) { return a.slug === slug; })) slug = 'new-app-' + (++n);
    state.apps.unshift({ slug: slug, name: 'New app', kind: '', tagline: '', points: [], platform: 'Android', stage: 'build', stageNote: 'Being built right now', icon: slug + '/icon.svg', playUrl: '', colors: clone(DEFAULT_COLORS), about: [], screens: [], videos: [], facts: [] });
    view = 'app:0'; setDirty(true); render();
  });
  $('#btn-connect').addEventListener('click', connect);
  $('#btn-disconnect').addEventListener('click', function () {
    gh = { repo: gh.repo, branch: gh.branch, token: '', ok: false }; $('#gh-token').value = '';
    try { localStorage.removeItem('forge-admin'); } catch (e) {}
    $('#btn-publish').disabled = true; $('#btn-disconnect').hidden = true; $('#btn-connect').textContent = 'Connect';
    $('#conn-hint').textContent = 'Disconnected. The token was removed from this browser.'; $('#conn-hint').className = 'hint'; setDirty(dirty);
  });
  $('#btn-publish').addEventListener('click', publish);
  $('#btn-download').addEventListener('click', download);
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // restore a remembered connection
  try {
    var saved = JSON.parse(localStorage.getItem('forge-admin') || 'null');
    if (saved && saved.token) { $('#gh-repo').value = saved.repo; $('#gh-branch').value = saved.branch; $('#gh-token').value = saved.token; $('#gh-remember').checked = true; connect(); }
  } catch (e) {}
  setDirty(false); render();
})();
