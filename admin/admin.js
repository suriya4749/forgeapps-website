/* Forge Apps admin panel.
   Edits assets/apps.js (home page, phone view, apps, prices, news, questions, settings) and assets/prices.js,
   and publishes them straight to the GitHub repo with a fine-grained token.
   The token is kept in this browser only, encrypted with your passcode (AES-GCM, key from PBKDF2).
   Nothing here is sent anywhere except api.github.com. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var clone = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
  var J = function (o) { return JSON.stringify(o == null ? null : o); };
  var getPath = function (obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); };
  var setPath = function (obj, path, val) { var ks = path.split('.'), last = ks.pop(); var o = ks.reduce(function (o, k, n) { if (o[k] == null) o[k] = /^\d+$/.test(ks[n + 1] || last) ? [] : {}; return o[k]; }, obj); o[last] = val; };
  var b64utf8 = function (s) { return btoa(unescape(encodeURIComponent(s))); };
  var utf8b64 = function (b) { return decodeURIComponent(escape(atob(String(b).replace(/\s/g, '')))); };
  var slugify = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'new-app'; };
  var ytId = function (u) { var m = String(u || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : ''; };
  var bufB64 = function (b) { return btoa(String.fromCharCode.apply(null, new Uint8Array(b))); };
  var b64Buf = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };

  var STAGES = [['idea', 'Idea'], ['build', 'Build'], ['test', 'Test'], ['live', 'Live']];
  var DEFAULT_COLORS = { bg: '#1C1F26', bg2: '#111318', accent: '#FF6A2B', accent2: '#FFB547', soft: '#2A2E37', text: '#F5F3EF', btnBg: '#FF6A2B', btnText: '#111318' };
  var COLOR_LABELS = { bg: 'Panel background', bg2: 'Panel background 2', accent: 'Main colour', accent2: 'Second colour', soft: 'Soft tint', text: 'Text on panel', btnBg: 'Button', btnText: 'Button text' };
  var SEC = {
    values: ['Technology should make everyday life simpler', 'Studio values · rule book'], work: ['Meet our applications', 'App rows on desktop, app list on phones'],
    why: ['Small studio. Serious attention to detail', 'Spec sheet'], how: ['How we build', 'Four-step timeline'],
    trust: ['Your trust matters more than your data', 'Privacy points and policy links'], stats: ['Numbers', 'Only real numbers from your apps and updates'],
    founder: ['Built independently. Improved together', 'Founder photo and story'], early: ['Try apps before they launch', 'Tester sign-up · only shows while an app is in testing'],
    news: ['From the workshop', 'Latest 3 updates'], faq: ['Questions, answered', 'Help desk with search'], contact: ['Have an idea worth building?', 'Closing box']
  };
  var TABS = { home: 'Home', apps: 'Apps (opens the apps sheet)', about: 'About', updates: 'Updates', approach: 'How we build', contact: 'Contact' };
  var LINKS = ['#work', '#approach', '#process', '#promises', '#early', '#news', '#faq', '#contact', 'apps/', 'contact/', 'contact/?topic=idea', 'contact/?topic=launch'];
  var I = {
    grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12.5h2M3 9h18"/>', doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>', tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  var ico = function (n, s) { return '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; };
  var LOGO = '<svg width="30" height="30" viewBox="10 22 80 72" aria-hidden="true"><g transform="translate(0,3)"><path transform="translate(0,14)" d="M16 42 H80 a4 4 0 0 1 4 4 V50 a4 4 0 0 1 -4 4 H66 L60 64 H68 V74 H32 V64 H40 L34 54 H30 C22 54 16 49 16 42 Z" fill="#111318"/><rect x="40" y="36" width="20" height="20" rx="5" fill="#FF6A2B"/><g fill="#FFFFFF"><rect x="43.5" y="39.5" width="5.5" height="5.5" rx="1.4"/><rect x="51" y="39.5" width="5.5" height="5.5" rx="1.4"/><rect x="43.5" y="47" width="5.5" height="5.5" rx="1.4"/><rect x="51" y="49" width="5.5" height="1.6" rx=".8"/><rect x="52.95" y="47.05" width="1.6" height="5.5" rx=".8"/></g><g transform="translate(50,29.5) rotate(-25 0 6)" fill="#111318"><rect x="5" y="-6" width="31" height="5" rx="2.5"/><rect x="-6" y="-12" width="12" height="18" rx="2"/></g></g></svg>';
  var GRIP = '<span class="grip" title="Drag to reorder"><i></i><i></i><i></i><i></i><i></i><i></i></span>';

  /* ---------------- state ---------------- */
  var state, orig, prices, origPrices, pending = {}, existingSlugs = [];
  var view = 'layout', appTab = 'details', pricingApp = null, pvMode = 'ph';
  var gh = { repo: 'suriya4749/forgeapps-website', branch: 'main', token: '', ok: false, expires: '' };

  function withDefaults(F) {
    F = clone(F || {}); F.apps = F.apps || []; F.updates = F.updates || [];
    F.analytics = F.analytics || { umami: '', cloudflare: '' };
    F.faq = F.faq || [];
    F.home = F.home || {};
    F.home.hero = F.home.hero || { label: '', title: 'Useful apps,\nhammered into *shape.*', text: '', textPhone: '', btn1: { text: 'See our apps', href: '#work' }, btn2: { text: 'Get early access', href: '#early' }, screens: [], stamp: '' };
    var have = (F.home.sections || []).map(function (s) { return s.id; });
    F.home.sections = (F.home.sections || []).filter(function (s) { return SEC[s.id]; });
    Object.keys(SEC).forEach(function (k) { if (have.indexOf(k) === -1) F.home.sections.push({ id: k, desktop: true, phone: true }); });
    F.phone = F.phone || {};
    F.phone.topRight = F.phone.topRight || 'getapp'; F.phone.getApp = F.phone.getApp || 'auto'; F.phone.under = F.phone.under || 'socials';
    var ht = (F.phone.tabs || []).map(function (t) { return t.id; });
    F.phone.tabs = (F.phone.tabs || []).filter(function (t) { return TABS[t.id]; });
    Object.keys(TABS).forEach(function (k) { if (ht.indexOf(k) === -1) F.phone.tabs.push({ id: k, on: true }); });
    return F;
  }
  function load(F, P) {
    state = withDefaults(F); orig = clone(state);
    prices = clone(P || null); origPrices = clone(prices);
    existingSlugs = state.apps.map(function (a) { return a.slug; });
    pending = {};
  }
  load(window.FORGE, window.FORGE_PRICES);

  /* ---------------- helpers ---------------- */
  function toast(msg, kind) { var t = $('#toast'); t.textContent = msg; t.className = 'toast ' + (kind || ''); t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, kind === 'bad' ? 9000 : 4000); }
  function imgSrc(p) { if (!p) return ''; if (pending[p]) return pending[p].url; if (/^(https?:|data:|blob:)/.test(p)) return p; return '../' + p; }
  function appBySlug(s) { return state.apps.filter(function (a) { return a.slug === s; })[0]; }

  function changes() {
    var out = [];
    var add = function (icon, text, file) { out.push([icon, text, file]); };
    if (J(state.home.sections) !== J(orig.home.sections)) add('✎', 'Home page: sections and order', 'apps.js');
    if (J(state.home.hero) !== J(orig.home.hero)) add('✎', 'Home page: top section', 'apps.js');
    if (J(state.phone) !== J(orig.phone)) add('✎', 'Phone view', 'apps.js');
    if (J(state.faq) !== J(orig.faq)) add('✎', 'Questions', 'apps.js');
    if (J(state.updates) !== J(orig.updates)) add('✎', 'Latest news', 'apps.js');
    if (['email', 'youtube', 'instagram', 'facebook', 'formKey', 'analytics'].some(function (k) { return J(state[k]) !== J(orig[k]); })) add('✎', 'Site settings', 'apps.js');
    var os = orig.apps.map(function (a) { return a.slug; }), ns = state.apps.map(function (a) { return a.slug; });
    if (J(os.filter(function (s) { return ns.indexOf(s) > -1; })) !== J(ns.filter(function (s) { return os.indexOf(s) > -1; }))) add('↕', 'App order', 'apps.js');
    state.apps.forEach(function (a) {
      var o = orig.apps.filter(function (x) { return x.slug === a.slug; })[0];
      if (!o) { add('＋', 'New app: ' + (a.name || a.slug), a.slug + '/'); return; }
      var a2 = normApp(a), o2 = normApp(o); var p1 = a2.pricing, p2 = o2.pricing; delete a2.pricing; delete o2.pricing;
      if (J(a2) !== J(o2)) add('✎', a.name + ': details and media', 'apps.js');
      if (J(p1) !== J(p2)) add('✎', a.name + ': prices and plans', 'apps.js');
    });
    orig.apps.forEach(function (o) { if (ns.indexOf(o.slug) === -1) add('－', 'Removed from the list: ' + o.name, 'apps.js'); });
    if (J(prices) !== J(origPrices)) add('✎', 'Country prices', 'prices.js');
    var used = J(state);
    Object.keys(pending).forEach(function (p) { if (used.indexOf('"' + p + '"') > -1) add('↑', 'New image', p); });
    return out;
  }
  // compare apps without the empty lists and default colours the editor fills in
  function normApp(a) {
    a = clone(a);
    ['points', 'about', 'screens', 'videos', 'facts'].forEach(function (k) { if (Array.isArray(a[k]) && !a[k].length) delete a[k]; });
    if (a.screens) a.screens = a.screens.map(function (x) { return typeof x === 'string' ? { src: x, caption: '' } : { src: x.src, caption: x.caption || '' }; });
    a.colors = Object.assign({}, DEFAULT_COLORS, a.colors || {});
    ['hidden', 'featured', 'testUrl'].forEach(function (k) { if (!a[k]) delete a[k]; });
    Object.keys(a).forEach(function (k) { if (a[k] === undefined) delete a[k]; });
    return JSON.parse(J(a));
  }
  function dirty() { return changes().length > 0; }
  function updateStatus() {
    var n = changes().length, c = $('#chg');
    if (c) { c.className = 'chg' + (n ? ' on' : ''); c.innerHTML = '<i></i><span>' + (n ? n + ' change' + (n > 1 ? 's' : '') + ' not published' : 'Everything is published') + '</span>'; }
    var pb = $('#btn-publish'); if (pb) pb.disabled = !n;
  }
  function touched() { updateStatus(); schedulePreview(); }

  /* ---------------- preview (the real site, with your unsaved changes) ---------------- */
  function previewData() {
    var s = J(state);
    Object.keys(pending).forEach(function (p) { s = s.split('"' + p + '"').join(J(pending[p].url)); });
    return s;
  }
  function writePreview() { try { localStorage.setItem('forge-preview', previewData()); return true; } catch (e) { return false; } }
  var pvT;
  function schedulePreview() {
    clearTimeout(pvT);
    pvT = setTimeout(function () { var f = $('#pv-frame'); if (f && writePreview()) { try { var y = f.contentWindow.scrollY; f.onload = function () { try { f.contentWindow.scrollTo(0, y); } catch (e) {} }; f.contentWindow.location.reload(); } catch (e) { f.src = f.src; } } }, 700);
  }

  /* ---------------- image resize ---------------- */
  function readImage(file, maxW, maxH, type) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, maxW / img.width, maxH / img.height), w = Math.round(img.width * s), h = Math.round(img.height * s);
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
    return fetch('https://api.github.com' + path, { method: opts.method || 'GET', headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined, cache: 'no-store' }).then(function (r) {
      var ex = r.headers.get('github-authentication-token-expiration'); if (ex) gh.expires = ex;
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
  function checkRepo() {
    return api('/repos/' + gh.repo).then(function (r) {
      if (r.permissions && !r.permissions.push) throw new Error('This token can read the repo but not change it. Give it "Contents: Read and write".');
      return r;
    });
  }
  // Load the newest apps.js and prices.js from GitHub, so you never edit an old copy.
  function pull() {
    return Promise.all([getFile('assets/apps.js'), getFile('assets/prices.js')]).then(function (fs) {
      if (!fs[0]) throw new Error('assets/apps.js was not found in ' + gh.repo + '.');
      var w = {}; new Function('window', utf8b64(fs[0].content))(w);
      if (!w.FORGE || !Array.isArray(w.FORGE.apps)) throw new Error('assets/apps.js in the repo could not be read.');
      var p = {}; if (fs[1]) { try { new Function('window', utf8b64(fs[1].content))(p); } catch (e) {} }
      load(w.FORGE, p.FORGE_PRICES || null);
    });
  }
  function appsJs() {
    var data = clone(state);
    data.apps.forEach(function (a) {
      if (Array.isArray(a.videos)) a.videos = a.videos.filter(function (v) { return v && (v.youtube || v.src); }).map(function (v) { if (v.youtube) { delete v.src; delete v.poster; } if (!v.vertical) delete v.vertical; return v; });
      ['points', 'about', 'screens', 'videos', 'facts'].forEach(function (k) { if (Array.isArray(a[k]) && !a[k].length) delete a[k]; });
      if (a.testUrl === '') delete a.testUrl;
      if (!a.hidden) delete a.hidden;
      if (!a.featured) delete a.featured;
    });
    return '/*\n  Forge Apps — site settings and the list of apps.\n  Edit this with the admin panel (/admin/) or by hand.\n' +
      '  The first 4 apps show on the home page. stage: idea | build | test | live.\n*/\nwindow.FORGE = ' + JSON.stringify(data, null, 2) + ';\n';
  }
  function pricesJs() {
    var today = new Date().toISOString().slice(0, 10);
    return '/*\n  Pro price in each country, copied from Google Play Console (updated ' + today + ' in the admin panel).\n' +
      '  The page shows the visitor\'s own price, found from their time zone. When a price changes in Play, update it here.\n' +
      '  Generated: country code -> price, and time zone -> country code.\n*/\nwindow.FORGE_PRICES = ' + JSON.stringify(prices) + ';\n';
  }

  /* ---------------- passcode lock ---------------- */
  var LS = 'forge-admin-v2';
  var saved = function () { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { return null; } };
  var save = function (o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };
  function keyFrom(pin, salt) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function seal(token, pin) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return keyFrom(pin, salt).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(token)); })
      .then(function (ct) { return { salt: bufB64(salt), iv: bufB64(iv), ct: bufB64(ct) }; });
  }
  function unseal(rec, pin) {
    return keyFrom(pin, b64Buf(rec.salt)).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64Buf(rec.iv) }, k, b64Buf(rec.ct)); })
      .then(function (pt) { return new TextDecoder().decode(pt); });
  }
  var lastAct = Date.now(), locked = true;
  ['pointerdown', 'keydown', 'scroll'].forEach(function (ev) { window.addEventListener(ev, function () { lastAct = Date.now(); }, { passive: true }); });
  setInterval(function () {
    var rec = saved(); var mins = (rec && rec.idle) || 30;
    if (!locked && Date.now() - lastAct > mins * 60000) lock('Locked after ' + mins + ' minutes without use.');
  }, 20000);
  function lock(msg) { locked = true; gh.token = ''; gh.ok = false; showLogin(msg); }

  function pinBoxes(id) {
    var h = '<div class="pin" id="' + id + '">';
    for (var i = 0; i < 6; i++) h += '<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off" aria-label="Digit ' + (i + 1) + '">';
    return h + '</div>';
  }
  function wirePin(id, done) {
    var ins = $$('#' + id + ' input');
    ins.forEach(function (inp, i) {
      inp.addEventListener('input', function () {
        inp.value = inp.value.replace(/\D/g, '').slice(-1); inp.classList.toggle('f', !!inp.value);
        if (inp.value && ins[i + 1]) ins[i + 1].focus();
        var v = ins.map(function (x) { return x.value; }).join('');
        if (v.length === 6 && done) done(v);
      });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) { ins[i - 1].focus(); ins[i - 1].value = ''; ins[i - 1].classList.remove('f'); } });
      inp.addEventListener('paste', function (e) { var t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault(); ins.forEach(function (x, k) { x.value = t[k] || ''; x.classList.toggle('f', !!x.value); }); if (t.length === 6 && done) done(t); });
    });
    return { val: function () { return ins.map(function (x) { return x.value; }).join(''); }, clear: function () { ins.forEach(function (x) { x.value = ''; x.classList.remove('f'); }); ins[0].focus(); }, focus: function () { ins[0].focus(); } };
  }
  var head = function () { return '<div class="logo-row">' + LOGO + 'Forge Apps <em>Admin</em></div>'; };

  function showLogin(msg) {
    var rec = saved();
    if (!rec) return showSetup();
    $('#app').innerHTML = '<div class="center">' + head() + '<div class="box lg"><h1>Welcome back</h1><p>Enter your 6-digit passcode to unlock the admin on this device.</p>' +
      pinBoxes('pin') + '<p class="err" id="err">' + esc(msg || '') + '</p><button class="b pri" id="unlock" type="button">Unlock</button>' +
      '<div class="row" style="justify-content:space-between;font-size:12.5px;color:var(--mut)"><span>' + ico('lock', 14) + ' Locks after ' + (rec.idle || 30) + ' minutes without use</span><a href="#" id="forgot">Forgot passcode?</a></div></div>' +
      '<span class="mono sm-l">' + esc(rec.repo) + ' · ' + esc(rec.branch) + '</span></div>';
    var busy = false;
    var go = function (pin) {
      if (busy) return; if (!pin || pin.length < 6) { $('#err').textContent = 'Enter all 6 digits.'; return; }
      busy = true; $('#unlock').textContent = 'Unlocking…'; $('#err').textContent = '';
      unseal(rec, pin).then(function (token) {
        rec.tries = 0; save(rec);
        gh.repo = rec.repo; gh.branch = rec.branch; gh.token = token;
        var wasDirty = state && dirty();
        return checkRepo().then(function () { return wasDirty ? null : pull(); }).then(function () { gh.ok = true; locked = false; lastAct = Date.now(); render(); });
      }, function () {
        rec.tries = (rec.tries || 0) + 1;
        if (rec.tries >= 10) { localStorage.removeItem(LS); showSetup('10 wrong passcodes, so the saved token was wiped. Connect GitHub again.'); return; }
        save(rec); busy = false; $('#unlock').textContent = 'Unlock'; $('#err').textContent = 'Wrong passcode. ' + (10 - rec.tries) + ' tries left before the saved token is wiped.'; pinCtl.clear();
      }).catch(function (e) {
        busy = false; $('#unlock').textContent = 'Unlock';
        $('#err').textContent = e.status === 401 ? 'GitHub no longer accepts the saved token (it may have expired). Use "Forgot passcode?" to connect a new one.' : e.message;
      });
    };
    var pinCtl = wirePin('pin', go); pinCtl.focus();
    $('#unlock').addEventListener('click', function () { go(pinCtl.val()); });
    $('#forgot').addEventListener('click', function (e) { e.preventDefault(); if (confirm('Forget the saved token on this device? You will connect GitHub again and choose a new passcode.')) { localStorage.removeItem(LS); showSetup(); } });
  }

  function showSetup(msg) {
    var old = null; try { old = JSON.parse(localStorage.getItem('forge-admin') || 'null'); } catch (e) {}
    var stepView = function (n) { return '<div class="steps"><span class="' + (n > 1 ? 'd' : 'n') + '"><i>' + (n > 1 ? '✓' : '1') + '</i>GitHub</span>—<span class="' + (n === 2 ? 'n' : '') + '"><i>2</i>Passcode</span>—<span><i>3</i>Done</span></div>'; };
    $('#app').innerHTML = '<div class="center">' + head() + '<div id="steps">' + stepView(1) + '</div><div class="box lg" style="width:min(540px,100%)"><h1>Set up this device</h1>' +
      '<p class="err">' + esc(msg || '') + '</p>' +
      '<div id="s1"><label class="f"><span>Repository</span><input id="gh-repo" value="' + esc((old && old.repo) || gh.repo) + '" autocomplete="off"></label>' +
      '<label class="f"><span>Branch</span><input id="gh-branch" value="' + esc((old && old.branch) || gh.branch) + '" autocomplete="off"></label>' +
      '<label class="f"><span>GitHub access token</span><input id="gh-token" type="password" placeholder="github_pat_…" autocomplete="off" value="' + esc((old && old.token) || '') + '"></label>' +
      '<details class="help"><summary>How to get a token</summary><ol><li>GitHub → Settings → Developer settings → <b>Fine-grained tokens</b> → Generate new token.</li><li>Repository access: <b>Only select repositories</b> → forgeapps-website.</li><li>Permissions → Repository → <b>Contents: Read and write</b>.</li><li>Generate, copy and paste it here. It only works for this one repo.</li></ol></details>' +
      '<p class="err" id="err1"></p><button class="b pri" id="check" type="button">Connect</button></div>' +
      '<div id="s2" hidden><div class="f"><span>Choose a 6-digit passcode</span>' + pinBoxes('p1') + '</div><div class="f"><span>Type it again</span>' + pinBoxes('p2') + '</div>' +
      '<p class="note">' + ico('lock', 14) + ' The token is saved on this device, locked with your passcode. Without the passcode nobody can publish, even on this computer. Ten wrong tries wipe it.</p>' +
      '<p class="err" id="err2"></p><button class="b pri" id="finish" type="button">Save and open admin</button></div></div></div>';
    var p1, p2;
    $('#check').addEventListener('click', function () {
      gh.repo = $('#gh-repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      gh.branch = $('#gh-branch').value.trim() || 'main'; gh.token = $('#gh-token').value.trim();
      if (!gh.token) { $('#err1').textContent = 'Paste a token first.'; return; }
      $('#check').textContent = 'Connecting…'; $('#err1').textContent = '';
      checkRepo().then(pull).then(function () {
        $('#s1').hidden = true; $('#s2').hidden = false; $('#steps').innerHTML = stepView(2);
        p1 = wirePin('p1', function () { p2.focus(); }); p2 = wirePin('p2'); p1.focus();
      }).catch(function (e) { $('#check').textContent = 'Connect'; $('#err1').textContent = e.status === 401 ? 'That token was not accepted. Check it and try again.' : e.message; });
    });
    $('#finish').addEventListener('click', function () {
      var a = p1.val(), b = p2.val();
      if (a.length < 6) { $('#err2').textContent = 'Enter all 6 digits.'; return; }
      if (a !== b) { $('#err2').textContent = 'The two passcodes are different. Try again.'; p2.clear(); return; }
      seal(gh.token, a).then(function (rec) {
        rec.repo = gh.repo; rec.branch = gh.branch; rec.idle = 30; rec.tries = 0; rec.device = navigator.platform || ''; save(rec);
        try { localStorage.removeItem('forge-admin'); } catch (e) {}
        gh.ok = true; locked = false; lastAct = Date.now(); render(); toast('All set. This device is ready.', 'ok');
      });
    });
  }

  /* ---------------- shell ---------------- */
  function shell(inner, withPreview) {
    var side = [['Home page'], ['layout', 'Sections & order', ico('grid')], ['hero', 'Top section', ico('spark')], ['phone', 'Phone view', ico('phone')],
      ['Apps'], ['apps', 'All apps & order', ico('list')]].concat(state.apps.map(function (a, i) {
        return ['app:' + i, '<img src="' + esc(imgSrc(a.icon)) + '" alt="">' + esc(a.name || 'Untitled') + '<span class="tag">' + (a.hidden ? 'Hidden' : a.stage) + '</span>', ''];
      })).concat([['pricing', 'Prices & plans', ico('wallet')], ['Site'], ['news', 'Latest news', ico('doc')], ['faq', 'Questions', ico('chat')], ['settings', 'Socials, email, analytics', ico('tool')], ['security', 'Connection & security', ico('lock')]]);
    var nav = side.map(function (s) {
      if (s.length === 1) return '<span class="g">' + s[0] + '</span>';
      var on = view === s[0] || (s[0].indexOf('app:') === 0 && view === s[0]);
      return '<button type="button" data-view="' + s[0] + '" class="' + (on ? 'on' : '') + '">' + s[2] + (s[2] ? '<span>' + s[1] + '</span>' : s[1]) + '</button>';
    }).join('');
    var pv = withPreview ? '<aside class="pvw"><div class="seg" style="align-self:flex-start"><button type="button" data-pv="ph" class="' + (pvMode === 'ph' ? 'on' : '') + '">Phone</button><button type="button" data-pv="dt" class="' + (pvMode === 'dt' ? 'on' : '') + '">Desktop</button></div>' +
      '<div class="frame ' + pvMode + '"><iframe id="pv-frame" title="Preview" src="../?preview=1' + (pvMode === 'dt' ? '' : '') + '"></iframe></div><p class="note">' + ico('eye', 16) + '<span>Your live site with the changes you have not published yet. It updates as you edit.</span></p></aside>' : '';
    $('#app').innerHTML = '<header class="top"><a class="br" href="../" target="_blank" rel="noopener">' + LOGO + '<span>Forge Apps</span><em>Admin</em></a><span class="sp"></span>' +
      '<span class="chg" id="chg"></span><button type="button" class="b pvbtn" id="btn-preview">' + ico('eye', 16) + ' Preview</button><button type="button" class="b pri" id="btn-publish">Publish to site</button></header>' +
      '<div class="lay' + (withPreview ? ' pv' : '') + '"><nav class="side" aria-label="Sections">' + nav + '</nav><main id="main">' + inner + '</main>' + pv + '</div>';
    if (withPreview) writePreview();
    updateStatus();
  }
  var H = function (k, t, p, right) { return '<div class="h"><div><span class="k">' + k + '</span><h1>' + t + '</h1>' + (p ? '<p>' + p + '</p>' : '') + '</div>' + (right || '') + '</div>'; };
  var fld = function (label, path, val, o) {
    o = o || {};
    var attrs = ' data-bind="' + path + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.ro ? ' readonly' : '') + (o.max ? ' data-max="' + o.max + '"' : '') + (o.list ? ' list="' + o.list + '"' : '') + (o.cls ? ' class="' + o.cls + '"' : '');
    var inp = o.ta ? '<textarea' + attrs + '>' + esc(val) + '</textarea>' : '<input type="' + (o.type || 'text') + '"' + attrs + ' value="' + esc(val) + '">';
    return '<label class="f"><span>' + label + '</span>' + inp + (o.max ? '<span class="cnt">' + String(val || '').length + ' / ' + o.max + '</span>' : '') + (o.note ? '<span class="note">' + o.note + '</span>' : '') + '</label>';
  };
  var tg = function (path, on, invert) { return '<button type="button" class="tg' + (on ? ' on' : '') + '" data-toggle="' + path + '"' + (invert ? ' data-invert="1"' : '') + ' aria-pressed="' + !!on + '"></button>'; };
  var moveBtns = function (list, i) { return '<button type="button" class="ib" data-act="up" data-list="' + list + '" data-i="' + i + '" aria-label="Move up">↑</button><button type="button" class="ib" data-act="down" data-list="' + list + '" data-i="' + i + '" aria-label="Move down">↓</button>'; };
  var delBtn = function (list, i) { return '<button type="button" class="ib x" data-act="del" data-list="' + list + '" data-i="' + i + '" aria-label="Remove">✕</button>'; };
  var dragRow = function (list, i, cls) { return '<div class="rw ' + (cls || '') + '" draggable="true" data-dlist="' + list + '" data-di="' + i + '">'; };

  /* ---------------- views ---------------- */
  function vLayout() {
    var rows = '<div class="rw hd"><span style="width:58px"></span><span class="grow">Section</span><span class="c">Desktop</span><span class="c">Phone</span><span style="width:70px"></span></div>' +
      '<div class="rw"><span class="lock">Fixed</span><span class="num">01</span><span class="grow"><b>Top section</b><small>Blueprint phone, heading and buttons · always first</small></span><span class="c">' + tg('', true) .replace('data-toggle=""', 'disabled') + '</span><span class="c">' + tg('', true).replace('data-toggle=""', 'disabled') + '</span><span style="width:70px"><button type="button" class="b sm" data-view="hero">Edit</button></span></div>' +
      state.home.sections.map(function (s, i) {
        var p = 'home.sections.' + i;
        return dragRow('home.sections', i, s.desktop === false && s.phone === false ? 'off' : '') + GRIP + '<span class="num">' + ('0' + (i + 2)).slice(-2) + '</span><span class="grow"><b>' + esc(SEC[s.id][0]) + '</b><small>' + esc(SEC[s.id][1]) + '</small></span>' +
          '<span class="c">' + tg(p + '.desktop', s.desktop !== false) + '</span><span class="c">' + tg(p + '.phone', s.phone !== false) + '</span><span style="width:70px;display:flex;gap:4px">' + moveBtns('home.sections', i) + '</span></div>';
      }).join('');
    shell(H('Home page', 'Sections &amp; order', 'Drag to reorder. Switch a section off for desktop, phone, or both. The preview on the right shows the result.', '<button type="button" class="b sm" data-act="reset-sections">Reset to default</button>') +
      '<div class="box rows">' + rows + '</div>', true);
  }

  function vHero() {
    var h = state.home.hero, P = 'home.hero.';
    var all = [];
    state.apps.forEach(function (a) { (a.screens || []).forEach(function (s) { var src = typeof s === 'string' ? s : s.src; all.push([src, a.name]); }); });
    var picks = all.map(function (x) { var k = (h.screens || []).indexOf(x[0]); return '<div class="shot pick' + (k > -1 ? ' on' : '') + '" data-pick="' + esc(x[0]) + '"><div class="im"><img src="' + esc(imgSrc(x[0])) + '" alt="" loading="lazy">' + (k > -1 ? '<span class="bd">' + (k + 1) + '</span>' : '') + '</div><small>' + esc(x[1]) + '</small></div>'; }).join('');
    var dl = '<datalist id="links">' + LINKS.map(function (l) { return '<option value="' + l + '">'; }).join('') + '</datalist>';
    shell(H('Home page', 'Top section', 'The first thing people see. Phones get their own shorter text.') +
      '<div class="box pad">' + fld('Small label above the heading · desktop only · leave empty to hide', P + 'label', h.label) +
      fld('Heading · new line = line break · put *stars* around the word you want in orange', P + 'title', h.title, { ta: true, cls: '' }) +
      '<div class="cols">' + fld('Text · desktop', P + 'text', h.text, { ta: true, max: 140 }) + fld('Text · phone (shorter)', P + 'textPhone', h.textPhone, { ta: true, max: 90 }) + '</div>' +
      '<div class="cols">' + fld('Main button text', P + 'btn1.text', (h.btn1 || {}).text) + fld('Main button goes to', P + 'btn1.href', (h.btn1 || {}).href, { list: 'links' }) + '</div>' +
      '<div class="cols">' + fld('Second button text · empty hides it', P + 'btn2.text', (h.btn2 || {}).text) + fld('Second button goes to', P + 'btn2.href', (h.btn2 || {}).href, { list: 'links' }) + '</div>' + dl +
      fld('Stamp on the blueprint · empty hides it', P + 'stamp', h.stamp) + '</div>' +
      '<div class="box pad"><h3>Blueprint phone shows</h3><p class="hint">Pick one or two screenshots. With two, the phone switches between them. Add screenshots in each app’s Media tab.</p><div class="shots">' + (picks || '<p class="empty">No screenshots yet.</p>') + '</div></div>', true);
  }

  function vPhone() {
    var ph = state.phone;
    var radio = function (name, val, title, sub) { return '<label class="' + (ph[name] === val ? 'on' : '') + '"><input type="radio" name="' + name + '" data-radio="phone.' + name + '" value="' + val + '"' + (ph[name] === val ? ' checked' : '') + '><span><b>' + title + '</b><small>' + sub + '</small></span></label>'; };
    var live = state.apps.filter(function (a) { return !a.hidden && a.stage === 'live' && a.playUrl; });
    var chips = '<button type="button" class="chip t' + (ph.getApp === 'auto' ? ' on' : '') + '" data-set="phone.getApp" data-val="auto">Automatic</button>' +
      live.map(function (a) { return '<button type="button" class="chip' + (ph.getApp === a.slug ? ' on' : '') + '" data-set="phone.getApp" data-val="' + esc(a.slug) + '"><img src="' + esc(imgSrc(a.icon)) + '" alt="">' + esc(a.name) + '</button>'; }).join('');
    var tabs = ph.tabs.map(function (t, i) { return dragRow('phone.tabs', i) + GRIP + '<span class="grow"><b style="font-size:14px">' + esc(TABS[t.id]) + '</b></span>' + tg('phone.tabs.' + i + '.on', t.on !== false) + moveBtns('phone.tabs', i) + '</div>'; }).join('');
    shell(H('Home page', 'Phone view', 'Things that only exist on phones.') +
      '<div class="cols"><div class="box pad"><h3>Top bar · right side</h3><div class="radio" style="margin-top:10px">' +
      radio('topRight', 'getapp', 'Get app', 'Android: opens Google Play straight away when one app is live. iPhone, or two or more live apps: opens the apps sheet.') +
      radio('topRight', 'status', 'Status chip', '“1 live · 1 in test” · opens the apps sheet') + radio('topRight', 'none', 'Nothing', 'Just the logo') + '</div>' +
      '<div class="f" style="margin-top:16px"><span>Get app points to</span><div class="chips">' + chips + '</div><span class="note">Automatic = the only live app, or the apps sheet when there are more.</span></div></div>' +
      '<div class="box pad"><h3>Bottom tab bar</h3><p class="hint">Drag to reorder, switch off to hide.</p><div class="inner rows">' + tabs + '</div>' +
      '<h3 style="margin-top:16px">Under the buttons</h3><div class="radio" style="margin-top:10px">' + radio('under', 'socials', 'Social accounts', 'Instagram, YouTube, Facebook from Site settings') + radio('under', 'apps', '“2 apps from the forge”', 'Same as desktop') + '</div></div></div>', true);
  }

  function vApps() {
    var rows = '<div class="rw hd"><span style="width:24px"></span><span style="width:46px"></span><span class="grow">App</span><span style="width:250px">Stage</span><span class="c">On site</span><span class="c">Spotlight</span><span style="width:110px"></span></div>' +
      state.apps.map(function (a, i) {
        var seg = '<span class="seg">' + STAGES.map(function (s) { return '<button type="button" data-set="apps.' + i + '.stage" data-val="' + s[0] + '" class="' + (a.stage === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</span>';
        return dragRow('apps', i, a.hidden ? 'off' : '') + GRIP + '<img src="' + esc(imgSrc(a.icon)) + '" alt="" style="width:42px;height:42px;border-radius:11px;border:2px solid var(--ink)"><span class="grow"><b>' + esc(a.name) + '</b><small>' + esc(a.kind || '') + '</small></span>' +
          '<span style="width:250px">' + seg + '</span><span class="c">' + tg('apps.' + i + '.hidden', !a.hidden, true) + '</span><span class="c"><input type="radio" name="spot" data-spot="' + i + '"' + (a.featured ? ' checked' : '') + ' style="width:20px;height:20px;accent-color:var(--acc)" aria-label="Spotlight"></span>' +
          '<span style="width:110px;display:flex;gap:4px">' + moveBtns('apps', i) + '<button type="button" class="ib" data-view="app:' + i + '" aria-label="Edit">›</button></span></div>';
      }).join('');
    shell(H('Apps', 'All apps &amp; order', 'Drag to set the order everywhere on the site. The stage changes the badge and the buttons: Live gets “Get it on Google Play”, Test gets “Join the test”, Build and Idea get “Notify me”.', '<button type="button" class="b dk" data-act="new-app">+ New app</button>') +
      '<div class="box rows">' + rows + '</div><div class="cols"><div class="box pad"><h3>Spotlight</h3><p class="hint" style="margin:0">The spotlight app gets the big card on the home page. Only one can be the spotlight. With none picked, the site chooses one.</p></div><div class="box pad"><h3>On site</h3><p class="hint" style="margin:0">Switched off = hidden from every list. Its pages stay, so links from Google Play keep working.</p></div></div>');
  }

  function vApp(i) {
    var a = state.apps[i]; if (!a) { view = 'apps'; return render(); }
    ['points', 'about', 'screens', 'videos', 'facts'].forEach(function (k) { if (!Array.isArray(a[k])) a[k] = []; });
    a.screens = a.screens.map(function (x) { return typeof x === 'string' ? { src: x, caption: '' } : x; });
    a.colors = Object.assign({}, DEFAULT_COLORS, a.colors || {});
    var P = 'apps.' + i + '.', isNew = existingSlugs.indexOf(a.slug) === -1, body = '';
    var listRows = function (key, ph) { return '<div class="inner rows">' + (a[key].map(function (t, k) { return dragRow(P + key, k) + GRIP + '<input class="grow" data-bind="' + P + key + '.' + k + '" value="' + esc(t) + '" placeholder="' + ph + '">' + delBtn(P + key, k) + '</div>'; }).join('') || '<p class="empty" style="padding:10px">Nothing yet.</p>') + '</div>'; };
    if (appTab === 'details') {
      var stageOpts = [['idea', 'Idea'], ['build', 'Being built'], ['test', 'In testing'], ['live', 'Live on Google Play']].map(function (s) { return '<option value="' + s[0] + '"' + (a.stage === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('');
      body = '<div class="box pad"><h3>Basics</h3><div class="cols">' + fld('App name', P + 'name', a.name) + fld('Page address', P + 'slug', a.slug, { ro: !isNew, note: isNew ? 'forgeapps.in/<b>' + esc(a.slug) + '</b>/ · lowercase, no spaces' : 'Fixed once the app is published' }) +
        fld('Kind', P + 'kind', a.kind, { ph: 'Personal finance' }) + fld('Platform', P + 'platform', a.platform, { ph: 'Android' }) + '</div>' + fld('One-line description', P + 'tagline', a.tagline) +
        '<div class="cols"><label class="f"><span>Stage</span><select data-bind="' + P + 'stage">' + stageOpts + '</select></label>' + fld('Stage note', P + 'stageNote', a.stageNote, { ph: 'In closed testing on Google Play' }) + '</div>' +
        '<label class="chk"><input type="checkbox" data-bind="' + P + 'hidden"' + (a.hidden ? ' checked' : '') + '> Hide from the website for now (its pages stay, but it isn’t listed anywhere)</label></div>' +
        '<div class="box pad"><h3>Google Play</h3><p class="hint">The store link becomes the “Get it on Google Play” button. While testing, the opt-in link becomes “Join the test”.</p>' +
        fld('Google Play link', P + 'playUrl', a.playUrl, { type: 'url', ph: 'https://play.google.com/store/apps/details?id=com.example.app' }) + fld('Testing opt-in link', P + 'testUrl', a.testUrl || '', { type: 'url', ph: 'https://play.google.com/apps/testing/com.example.app' }) + '</div>' +
        '<div class="box pad"><h3>About the app</h3><p class="hint">One paragraph per line.</p>' + listRows('about', 'Paragraph') + '<button type="button" class="b sm" data-act="add" data-list="' + P + 'about">+ Paragraph</button></div>' +
        '<div class="box pad"><h3>Highlights</h3><p class="hint">Short lines in the home spotlight, e.g. “Safe to spend”.</p>' + listRows('points', 'Highlight') + '<button type="button" class="b sm" data-act="add" data-list="' + P + 'points">+ Highlight</button></div>' +
        '<div class="box pad"><h3>Details</h3><p class="hint">Label and value rows next to About (Price, Platform…).</p><div class="inner rows">' + (a.facts.map(function (f, k) { return dragRow(P + 'facts', k) + GRIP + '<input style="flex:0 0 34%" data-bind="' + P + 'facts.' + k + '.0" value="' + esc(f[0]) + '" placeholder="Label"><input class="grow" data-bind="' + P + 'facts.' + k + '.1" value="' + esc(f[1]) + '" placeholder="Value">' + delBtn(P + 'facts', k) + '</div>'; }).join('') || '<p class="empty" style="padding:10px">Nothing yet.</p>') + '</div><button type="button" class="b sm" data-act="add-fact">+ Row</button></div>' +
        '<div class="box pad"><h3>Remove</h3><p class="hint">Takes the app off the list. Its pages stay in the repo.</p><button type="button" class="b sm danger" data-act="del-app">Remove ' + esc(a.name) + '</button></div>';
    } else if (appTab === 'media') {
      var shots = a.screens.map(function (s, k) {
        return '<div class="shot" draggable="true" data-dlist="' + P + 'screens" data-di="' + k + '"><div class="im"><img src="' + esc(imgSrc(s.src)) + '" alt="">' + (pending[s.src] ? '<span class="bd">New</span>' : /^https?:/.test(s.src) ? '<span class="bd l">Link</span>' : '') + '</div>' +
          '<input data-bind="' + P + 'screens.' + k + '.caption" value="' + esc(s.caption || '') + '" placeholder="Caption"><div class="tools"><span><button type="button" class="ib" data-act="up" data-list="' + P + 'screens" data-i="' + k + '" aria-label="Move left">←</button> <button type="button" class="ib" data-act="down" data-list="' + P + 'screens" data-i="' + k + '" aria-label="Move right">→</button></span>' + delBtn(P + 'screens', k) + '</div></div>';
      }).join('');
      var vids = a.videos.map(function (v, k) {
        var id = ytId(v.youtube), tall = v.vertical || /\/shorts\//.test(v.youtube || '');
        return '<div class="vid" draggable="true" data-dlist="' + P + 'videos" data-di="' + k + '">' + GRIP + '<span class="th' + (tall ? ' v' : '') + '" style="' + (id ? 'background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)' : '') + '"></span><span class="grow"><input data-bind="' + P + 'videos.' + k + '.title" value="' + esc(v.title || '') + '" placeholder="Title"><input type="url" data-bind="' + P + 'videos.' + k + '.youtube" value="' + esc(v.youtube || '') + '" placeholder="YouTube link"></span>' +
          '<label class="chk"><input type="checkbox" data-bind="' + P + 'videos.' + k + '.vertical"' + (tall ? ' checked' : '') + '> Vertical</label>' + delBtn(P + 'videos', k) + '</div>';
      }).join('');
      body = '<div class="cols" style="grid-template-columns:240px 1fr"><div class="box pad"><h3>App icon</h3><img class="icon-big" src="' + esc(imgSrc(a.icon)) + '" alt=""><span class="b sm file">Replace icon<input type="file" accept="image/*" data-upload="icon"></span><p class="note" style="margin-top:10px">Saved as a 512×512 PNG.</p>' + fld('Or a path / link', P + 'icon', a.icon) + '</div>' +
        '<div class="box pad"><h3>Screenshots</h3><p class="hint">Drag to reorder. The first one is the cover. New ones are uploaded to GitHub when you publish.</p><div class="shots">' + (shots || '<p class="empty">No screenshots yet.</p>') + '</div>' +
        '<div class="drop" id="drop"><span class="grow"><b>Drop screenshots here</b><br><span class="note">Resized to 540×960. Or paste an image link.</span></span><span class="b sm file">Choose files<input type="file" accept="image/*" multiple data-upload="screens"></span></div>' +
        '<div class="row" style="margin-top:10px"><input class="in" style="flex:1" type="url" id="add-shot-url" placeholder="https://… image link"><button type="button" class="b sm" data-act="add-shot-url">Add link</button></div></div></div>' +
        '<div class="box"><div class="pad" style="padding-bottom:6px"><h3>Videos</h3><p class="hint">YouTube only. Upload to your channel, then paste the link: a normal video, a Short or youtu.be/…</p></div><div>' + (vids || '<p class="empty" style="padding:0 22px 12px">No videos yet.</p>') + '</div>' +
        '<div class="pad row" style="padding-top:10px"><input class="in" style="flex:2;min-width:220px" type="url" id="add-yt" placeholder="https://www.youtube.com/watch?v=… or /shorts/…"><input class="in" style="flex:1;min-width:140px" id="add-yt-title" placeholder="Title"><button type="button" class="b sm" data-act="add-yt">+ Add video</button></div></div>';
    } else {
      var colors = Object.keys(COLOR_LABELS).map(function (k) { return '<label class="f"><span>' + COLOR_LABELS[k] + '</span><input type="color" data-bind="' + P + 'colors.' + k + '" value="' + esc(a.colors[k]) + '"></label>'; }).join('');
      body = '<div class="box pad"><h3>Brand colours</h3><p class="hint">Taken from the app’s logo. Used for its cards, spotlight and page.</p><div class="colors">' + colors + '</div>' +
        '<div class="chip-prev" id="chipprev" style="background:linear-gradient(150deg,' + a.colors.bg + ',' + a.colors.bg2 + ');color:' + a.colors.text + '"><img src="' + esc(imgSrc(a.icon)) + '" alt="" width="40" height="40" style="border-radius:10px"><b style="flex:1">' + esc(a.name) + '</b><span style="background:' + a.colors.btnBg + ';color:' + a.colors.btnText + ';padding:7px 14px;border-radius:9px;font-weight:700;font-size:13px">View app</span></div></div>';
    }
    var tabs = '<div class="tabs">' + [['details', 'Details'], ['media', 'Media'], ['colours', 'Colours']].map(function (t) { return '<button type="button" data-apptab="' + t[0] + '" class="' + (appTab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '<button type="button" data-view="pricing" data-papp="' + esc(a.slug) + '">Prices</button></div>';
    shell(H(esc(a.name || 'Untitled'), appTab === 'details' ? 'Details' : appTab === 'media' ? 'Media' : 'Colours', isNew ? 'New app · its pages are made when you publish.' : '<a href="../' + esc(a.slug) + '/" target="_blank" rel="noopener">forgeapps.in/' + esc(a.slug) + '/</a>', tabs) + body);
  }

  function vPricing() {
    var vis = state.apps;
    if (!pricingApp || !appBySlug(pricingApp)) pricingApp = (vis.filter(function (a) { return a.pricing; })[0] || vis[0] || {}).slug;
    var a = appBySlug(pricingApp); if (!a) return shell(H('Apps', 'Prices &amp; plans', 'Add an app first.'));
    var i = state.apps.indexOf(a), P = 'apps.' + i + '.pricing.';
    var chips = '<div class="chips">' + vis.map(function (x) { return '<button type="button" class="chip' + (x.slug === pricingApp ? ' on' : '') + '" data-papp="' + esc(x.slug) + '"><img src="' + esc(imgSrc(x.icon)) + '" alt="">' + esc(x.name) + '</button>'; }).join('') + '</div>';
    if (!a.pricing) {
      return shell(H('Apps', 'Prices &amp; plans', 'What the pricing section on the app page shows.', chips) +
        '<div class="box pad"><h3>' + esc(a.name) + ' has no pricing section</h3><p class="hint">Add one to show Free and Pro plans on its page.</p><button type="button" class="b pri" data-act="add-pricing">+ Add a pricing section</button></div>');
    }
    var pr = a.pricing; pr.free = pr.free || { name: 'Free', amount: '₹0', items: [] }; pr.free.items = pr.free.items || [];
    var pro = pr.pro;
    var freeRows = '<div class="inner rows">' + (pr.free.items.map(function (t, k) { return dragRow(P + 'free.items', k) + GRIP + '<input class="grow" data-bind="' + P + 'free.items.' + k + '" value="' + esc(t) + '">' + delBtn(P + 'free.items', k) + '</div>'; }).join('') || '<p class="empty" style="padding:10px">Nothing yet.</p>') + '</div>';
    var groups = pro ? (pro.groups || []).map(function (g, gi) {
      var GP = P + 'pro.groups.' + gi;
      return '<div style="margin-top:12px"><div class="row"><input class="in" style="flex:1;font-weight:700" data-bind="' + GP + '.title" value="' + esc(g.title) + '" placeholder="Group name">' + moveBtns(P + 'pro.groups', gi) + delBtn(P + 'pro.groups', gi) + '</div><div class="inner rows">' +
        ((g.items || []).map(function (it, k) { return dragRow(GP + '.items', k) + GRIP + '<input class="grow" data-bind="' + GP + '.items.' + k + '.text" value="' + esc(it.text) + '" placeholder="Feature"><input style="flex:0 0 32%" data-bind="' + GP + '.items.' + k + '.note" value="' + esc(it.note || '') + '" placeholder="free: … (optional)">' + delBtn(GP + '.items', k) + '</div>'; }).join('') || '<p class="empty" style="padding:10px">Nothing yet.</p>') +
        '</div><button type="button" class="b sm" data-act="add-item" data-list="' + GP + '.items">+ Line</button></div>';
    }).join('') : '';
    var table = '';
    var map = prices && prices[a.slug];
    if (map) {
      var dn; try { dn = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { dn = null; }
      var codes = Object.keys(map).sort(function (x, y) { return x === 'IN' ? -1 : y === 'IN' ? 1 : ((dn ? dn.of(x) : x) < (dn ? dn.of(y) : y) ? -1 : 1); });
      table = '<div class="box pad"><div class="row" style="justify-content:space-between"><h3>Pro price by country</h3><span class="mono sm-l">' + codes.length + ' countries</span></div><p class="hint">Visitors see their own country’s price. The price people actually pay is set in Google Play Console; keep these the same.</p>' +
        '<input class="in" id="pfilter" placeholder="Search a country…" style="margin-bottom:10px"><div class="inner rows ptable" id="ptable">' + codes.map(function (c) { return '<div class="rw" data-cn="' + esc(((dn ? dn.of(c) : c) + ' ' + c).toLowerCase()) + '"><span class="cc">' + c + '</span><span class="grow">' + esc(dn ? dn.of(c) : c) + '</span><input data-price="' + c + '" value="' + esc(map[c]) + '"' + (c === 'IN' ? ' class="hl"' : '') + '></div>'; }).join('') + '</div>' +
        '<details class="help" style="margin-top:12px"><summary>Paste from Play Console</summary><p class="note" style="margin:8px 0">In Play Console open the product, copy the price list (country and price per line) and paste it below. Lines like “India  INR 199.00”, “IN,INR,199” or “United States  $2.09” all work.</p><textarea class="in" id="paste" rows="6" placeholder="Paste here"></textarea><div class="row" style="margin-top:8px"><button type="button" class="b sm" data-act="paste-prices">Read prices</button><span class="note" id="paste-out"></span></div></details></div>';
    }
    shell(H(esc(a.name), 'Prices &amp; plans', 'What the pricing section on the ' + esc(a.name) + ' page shows.', chips) +
      '<div class="box pad"><label class="chk"><input type="checkbox" data-bind="' + P + 'show"' + (pr.show !== false ? ' checked' : '') + '> Show the pricing section on the page</label><div class="cols" style="margin-top:12px">' + fld('Heading', P + 'title', pr.title) + fld('Line under it', P + 'lead', pr.lead) + '</div></div>' +
      '<div class="cols"><div class="box pad"><h3>Free</h3><div class="cols">' + fld('Name', P + 'free.name', pr.free.name) + fld('Amount', P + 'free.amount', pr.free.amount) + '</div><span class="mono sm-l">What’s included · drag to reorder</span>' + freeRows + '<button type="button" class="b sm" data-act="add-item" data-list="' + P + 'free.items">+ Line</button></div>' +
      '<div class="box pad"><h3>Pro</h3>' + (pro ? '<div class="cols">' + fld('Name', P + 'pro.name', pro.name) + fld('Badge', P + 'pro.badge', pro.badge) + '</div>' + fld('Small text after the price', P + 'pro.note', pro.note || '', { ph: 'pay once, keep it' }) +
        '<span class="mono sm-l">Feature groups</span>' + groups + '<div class="row" style="margin-top:14px"><button type="button" class="b sm" data-act="add-group">+ Group</button><button type="button" class="b sm danger" data-act="del-pro">Remove Pro</button></div>'
        : '<p class="hint">No paid plan.</p><button type="button" class="b sm" data-act="add-pro">+ Add a Pro plan</button>') + '</div></div>' + table);
  }

  function vNews() {
    var opts = function (v) { return '<option value="">Forge Apps</option>' + state.apps.map(function (a) { return '<option value="' + esc(a.slug) + '"' + (a.slug === v ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join(''); };
    shell(H('Site', 'Latest news', 'News for the home page (latest 3) and the Updates page (all of them), newest first.', '<button type="button" class="b dk" data-act="add-update">+ Add news</button>') +
      '<div class="box rows">' + (state.updates.map(function (u, i) {
        var CT = [['', 'Type: automatic'], ['release', 'Release'], ['beta', 'Beta'], ['feature', 'New feature'], ['fix', 'Fix'], ['studio', 'Studio']].map(function (c) { return '<option value="' + c[0] + '"' + ((u.cat || '') === c[0] ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('');
        return dragRow('updates', i) + GRIP + '<div class="grow" style="display:flex;flex-direction:column;gap:6px"><div class="row"><input style="flex:0 0 110px" data-bind="updates.' + i + '.date" value="' + esc(u.date) + '" placeholder="Nov 2026"><select style="flex:0 0 150px" data-bind="updates.' + i + '.app">' + opts(u.app) + '</select><select style="flex:0 0 160px" data-bind="updates.' + i + '.cat">' + CT + '</select><input style="flex:1;min-width:160px" data-bind="updates.' + i + '.title" value="' + esc(u.title || '') + '" placeholder="Title (optional)"></div><input data-bind="updates.' + i + '.text" value="' + esc(u.text) + '" placeholder="What happened"><input data-bind="updates.' + i + '.more" value="' + esc(u.more || '') + '" placeholder="More details for the Updates page (optional)"></div>' + moveBtns('updates', i) + delBtn('updates', i) + '</div>';
      }).join('') || '<p class="empty pad">No news yet.</p>') + '</div>');
  }
  function vFaq() {
    shell(H('Site', 'Questions', 'The “Questions, answered” list on the home page. Links: write [text](contact/) or [text](https://…).', '<button type="button" class="b dk" data-act="add-faq">+ Add question</button>') +
      (state.faq.map(function (f, i) {
        return '<div class="box pad" draggable="true" data-dlist="faq" data-di="' + i + '"><div class="row" style="margin-bottom:8px">' + GRIP + '<span class="num">' + ('0' + (i + 1)).slice(-2) + '</span><span style="flex:1"></span>' + moveBtns('faq', i) + delBtn('faq', i) + '</div>' +
          fld('Question', 'faq.' + i + '.q', f.q) + fld('Answer', 'faq.' + i + '.a', f.a, { ta: true }) + '</div>';
      }).join('') || '<div class="box pad"><p class="empty">No questions yet. The page keeps its built-in list.</p></div>'));
  }
  function vSettings() {
    shell(H('Site', 'Socials, email, analytics', 'Shown across the whole site. Leave a social link empty to hide its button.') +
      '<div class="cols"><div class="box pad"><h3>Contact and socials</h3>' + fld('Support email', 'email', state.email) + fld('Instagram link', 'instagram', state.instagram, { type: 'url' }) + fld('YouTube channel link', 'youtube', state.youtube, { type: 'url' }) + fld('Facebook Page link', 'facebook', state.facebook || '', { type: 'url' }) + '</div>' +
      '<div class="box pad"><h3>Contact form and analytics</h3>' + fld('Web3Forms access key', 'formKey', state.formKey || '', { note: 'Messages from the contact page go to the email this key was made for.' }) +
      fld('Umami website ID', 'analytics.umami', state.analytics.umami || '', { note: 'From cloud.umami.is → Websites → forgeapps.in → Edit.' }) + fld('Cloudflare Web Analytics token (optional)', 'analytics.cloudflare', state.analytics.cloudflare || '') + '</div></div>');
  }
  function vSecurity() {
    var rec = saved() || {};
    var exp = gh.expires ? new Date(gh.expires.replace(' UTC', 'Z').replace(' ', 'T')) : null;
    var days = exp && !isNaN(exp) ? Math.round((exp - Date.now()) / 864e5) : null;
    var line = function (k, v) { return '<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px dashed rgba(30,28,25,.2)"><span>' + k + '</span><b>' + v + '</b></div>'; };
    shell(H('Site', 'Connection &amp; security') +
      '<div class="cols"><div class="box pad"><h3>GitHub</h3>' + line('Repository', esc(gh.repo)) + line('Branch', esc(gh.branch)) + line('Status', gh.ok ? '<span class="ok">● Connected · can publish</span>' : 'Not connected') +
      line('Token expires', exp && !isNaN(exp) ? exp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + (days != null ? ' <span class="mono" style="font-size:10px;color:' + (days < 14 ? 'var(--red)' : 'var(--mut)') + '">in ' + days + ' days</span>' : '') : 'Never, or unknown') +
      '<div class="row" style="margin-top:14px"><button type="button" class="b sm" data-act="reload">Reload from GitHub</button><button type="button" class="b sm" data-act="replace-token">Replace token</button></div></div>' +
      '<div class="box pad"><h3>Login</h3>' + line('Passcode', '<button type="button" class="b sm" data-act="change-pin">Change</button>') +
      line('Lock after no use', '<select class="in" style="width:auto;padding:6px 8px" id="idle">' + [10, 30, 60, 240].map(function (m) { return '<option value="' + m + '"' + ((rec.idle || 30) === m ? ' selected' : '') + '>' + (m < 60 ? m + ' minutes' : m / 60 + ' hour' + (m > 60 ? 's' : '')) + '</option>'; }).join('') + '</select>') +
      line('Wrong tries before wipe', '10') +
      '<div class="row" style="margin-top:14px"><button type="button" class="b sm" data-act="lock">Lock now</button><button type="button" class="b sm danger" data-act="forget">Forget this device</button></div></div></div>');
  }

  function render() {
    if (locked) return;
    var y = window.scrollY;
    if (view === 'layout') vLayout(); else if (view === 'hero') vHero(); else if (view === 'phone') vPhone();
    else if (view === 'apps') vApps(); else if (view === 'pricing') vPricing(); else if (view === 'news') vNews();
    else if (view === 'faq') vFaq(); else if (view === 'settings') vSettings(); else if (view === 'security') vSecurity();
    else if (view.indexOf('app:') === 0) vApp(parseInt(view.split(':')[1], 10));
    else { view = 'layout'; vLayout(); }
    window.scrollTo(0, render.keep ? y : 0); render.keep = false;
  }
  var rerender = function () { render.keep = true; render(); };

  /* ---------------- publish ---------------- */
  function publishDialog() {
    var list = changes(); if (!list.length) return;
    var ov = document.createElement('div'); ov.className = 'ov';
    ov.innerHTML = '<div class="box dlg" role="dialog" aria-modal="true" aria-label="Publish"><div class="row" style="justify-content:space-between"><h2>Publish to site</h2><span class="mono sm-l">GitHub · ' + esc(gh.branch) + '</span></div>' +
      '<div class="chl">' + list.map(function (c) { return '<div><span>' + c[0] + '</span><span>' + esc(c[1]) + '</span><span class="mono">' + esc(c[2]) + '</span></div>'; }).join('') + '</div>' +
      '<label class="f" style="margin:0"><span>Note for this update (optional)</span><input id="pub-note" placeholder="What changed"></label>' +
      '<div class="bar2" hidden><i></i></div><ul class="plist" id="plist"></ul><div class="row end"><button type="button" class="b" id="pub-cancel">Cancel</button><button type="button" class="b pri" id="pub-go">Publish</button></div></div>';
    document.body.appendChild(ov);
    $('#pub-cancel', ov).addEventListener('click', function () { ov.remove(); });
    $('#pub-go', ov).addEventListener('click', function () { if (ov.getAttribute('data-done')) ov.remove(); else publish(ov); });
  }
  function publish(ov) {
    var note = $('#pub-note', ov).value.trim(), go = $('#pub-go', ov), cancel = $('#pub-cancel', ov), pl = $('#plist', ov), bar = $('.bar2', ov);
    go.disabled = true; cancel.disabled = true; go.textContent = 'Publishing…'; bar.hidden = false;
    var steps = [], newOnes = state.apps.filter(function (a) { return existingSlugs.indexOf(a.slug) === -1; });
    var msg = function (m) { return note ? m + ': ' + note : m; };
    newOnes.forEach(function (a) {
      steps.push(['Making pages for ' + a.name, function () {
        return getFile(a.slug + '/index.html').then(function (exists) {
          if (exists) return;
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
      }]);
    });
    var used = J(state);
    Object.keys(pending).forEach(function (p) { if (used.indexOf('"' + p + '"') > -1) steps.push(['Uploading ' + p, function () { return putFile(p, pending[p].b64, msg('Add ' + p)); }]); });
    if (J(prices) !== J(origPrices)) steps.push(['Saving prices.js', function () { return putFile('assets/prices.js', b64utf8(pricesJs()), msg('Update prices from admin')); }]);
    steps.push(['Saving apps.js', function () { return putFile('assets/apps.js', b64utf8(appsJs()), msg('Update site from admin')); }]);
    pl.innerHTML = steps.map(function (s, k) { return '<li id="ps' + k + '" style="color:var(--mut)">○ ' + esc(s[0]) + '</li>'; }).join('') + '<li style="color:var(--mut)">○ Live on forgeapps.in about a minute later</li>';
    var k = 0;
    steps.reduce(function (p, s, n) {
      return p.then(function () { $('#ps' + n, ov).innerHTML = '<b style="color:var(--red)">●</b> ' + esc(s[0]) + '…'; $('#ps' + n, ov).style.color = ''; return s[1](); })
        .then(function () { k++; $('#ps' + n, ov).innerHTML = '<span class="ok">✓</span> ' + esc(s[0]); $('i', bar).style.width = Math.round(k / steps.length * 100) + '%'; });
    }, Promise.resolve()).then(function () {
      Object.keys(pending).forEach(function (p) { if (used.indexOf('"' + p + '"') > -1) delete pending[p]; });
      orig = clone(state); origPrices = clone(prices); existingSlugs = state.apps.map(function (a) { return a.slug; });
      go.textContent = 'Done'; go.disabled = false; ov.setAttribute('data-done', '1'); cancel.disabled = false; cancel.textContent = 'Close';
      pl.lastChild.innerHTML = '<span class="ok">✓</span> Published. The live site updates in about a minute.';
      updateStatus(); rerender(); document.body.appendChild(ov);
    }).catch(function (e) {
      go.disabled = false; go.textContent = 'Try again'; cancel.disabled = false;
      pl.insertAdjacentHTML('beforeend', '<li style="color:var(--red)">Stopped: ' + esc(e.message) + '. Nothing you changed here is lost.</li>');
    });
  }

  /* ---------------- prices paste ---------------- */
  function parsePrices(text) {
    var dn; try { dn = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) {}
    var names = {};
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (dn) for (var x = 0; x < 26; x++) for (var y = 0; y < 26; y++) { var c = A[x] + A[y]; try { var n = dn.of(c); if (n && n !== c) names[n.toLowerCase()] = c; } catch (e) {} }
    var out = {}, bad = 0;
    text.split(/\r?\n/).forEach(function (line) {
      line = line.trim(); if (!line) return;
      var parts = line.split(/\t|,(?=\S)|;|\s{2,}/).map(function (p) { return p.trim().replace(/^"|"$/g, ''); }).filter(Boolean);
      var code = null, rest = [];
      parts.forEach(function (p) {
        if (!code && /^[A-Z]{2}$/.test(p) && (!dn || names[(dn.of(p) || '').toLowerCase()] === p)) code = p;
        else if (!code && names[p.toLowerCase()]) code = names[p.toLowerCase()];
        else rest.push(p);
      });
      if (!code) { bad++; return; }
      var price = null, cur = rest.filter(function (p) { return /^[A-Z]{3}$/.test(p); })[0], num = rest.filter(function (p) { return /\d/.test(p); })[0];
      if (!num) { bad++; return; }
      var m = num.match(/^([A-Z]{3})\s*([\d.,]+)$/); if (m) { cur = m[1]; num = m[2]; }
      if (cur && /^[\d.,]+$/.test(num)) {
        var v = parseFloat(num.replace(/,(?=\d{3}\b)/g, '').replace(',', '.'));
        try { price = new Intl.NumberFormat('en', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).format(v).replace(/\.00$/, ''); } catch (e) { price = cur + ' ' + num; }
        if (/^[A-Z]{3}/.test(price) === false && /^[^\d]{1}\d/.test(price) === false && price.indexOf(cur) === -1 && cur !== 'USD' && cur !== 'EUR' && cur !== 'GBP' && cur !== 'INR' && cur !== 'JPY') { /* keep symbol */ }
      } else price = num;
      out[code] = price;
    });
    return { map: out, bad: bad };
  }

  /* ---------------- events ---------------- */
  var moveIn = function (arr, from, to) { if (to < 0 || to >= arr.length || from === to) return false; arr.splice(to, 0, arr.splice(from, 1)[0]); return true; };
  document.addEventListener('click', function (e) {
    if (locked) return;
    var t;
    if ((t = e.target.closest('[data-view]')) && !e.target.closest('.ov')) {
      view = t.getAttribute('data-view'); if (t.hasAttribute('data-papp')) pricingApp = t.getAttribute('data-papp');
      if (view.indexOf('app:') === 0 && t.closest('.side')) appTab = 'details';
      render(); return;
    }
    if ((t = e.target.closest('[data-apptab]'))) { appTab = t.getAttribute('data-apptab'); render(); return; }
    if ((t = e.target.closest('[data-papp]'))) { pricingApp = t.getAttribute('data-papp'); render(); return; }
    if ((t = e.target.closest('[data-pv]'))) { pvMode = t.getAttribute('data-pv'); rerender(); return; }
    if ((t = e.target.closest('#btn-publish'))) { publishDialog(); return; }
    if ((t = e.target.closest('#btn-preview'))) { if (writePreview()) window.open('../?preview=1', '_blank'); else toast('The preview is too big for this browser. Publish to see it.', 'bad'); return; }
    if ((t = e.target.closest('[data-toggle]'))) {
      var p = t.getAttribute('data-toggle'); if (!p) return;
      var inv = t.hasAttribute('data-invert'), cur = getPath(state, p);
      if (inv) setPath(state, p, cur ? undefined : true); else setPath(state, p, cur === false ? true : false);
      touched(); rerender(); return;
    }
    if ((t = e.target.closest('[data-set]'))) { setPath(state, t.getAttribute('data-set'), t.getAttribute('data-val')); touched(); rerender(); return; }
    if ((t = e.target.closest('[data-pick]'))) {
      var s = t.getAttribute('data-pick'), arr = state.home.hero.screens = state.home.hero.screens || [], k = arr.indexOf(s);
      if (k > -1) arr.splice(k, 1); else { arr.push(s); if (arr.length > 2) arr.shift(); }
      touched(); rerender(); return;
    }
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act'), i = view.indexOf('app:') === 0 ? parseInt(view.split(':')[1], 10) : -1, a = state.apps[i];
    var list = b.getAttribute('data-list'), n = parseInt(b.getAttribute('data-i'), 10), lst = list ? getPath(state, list) : null;
    if (act === 'del' && lst) lst.splice(n, 1);
    else if (act === 'up' && lst) { if (!moveIn(lst, n, n - 1)) return; if (list === 'apps') view = 'apps'; }
    else if (act === 'down' && lst) { if (!moveIn(lst, n, n + 1)) return; }
    else if (act === 'add' && lst) lst.push('');
    else if (act === 'add-item' && lst) lst.push(/free\.items$/.test(list) ? '' : { text: '', note: '' });
    else if (act === 'add-fact') a.facts.push(['', '']);
    else if (act === 'add-update') state.updates.unshift({ date: new Date().toLocaleString('en', { month: 'short', year: 'numeric' }), app: '', text: '' });
    else if (act === 'add-faq') state.faq.push({ q: '', a: '' });
    else if (act === 'reset-sections') { state.home.sections = Object.keys(SEC).map(function (k) { return { id: k, desktop: true, phone: true }; }); }
    else if (act === 'add-shot-url') { var u = $('#add-shot-url').value.trim(); if (!/^https?:\/\//.test(u)) return toast('Paste a full image link starting with https://', 'bad'); a.screens.push({ src: u, caption: '' }); }
    else if (act === 'add-yt') { var link = $('#add-yt').value.trim(); if (!ytId(link)) return toast('That does not look like a YouTube link.', 'bad'); var v = { youtube: link, title: $('#add-yt-title').value.trim() || 'Video' }; if (/\/shorts\//.test(link)) v.vertical = true; a.videos.push(v); }
    else if (act === 'new-app') {
      var nn = 1, slug = 'new-app'; while (appBySlug(slug)) slug = 'new-app-' + (++nn);
      state.apps.unshift({ slug: slug, name: 'New app', kind: '', tagline: '', points: [], platform: 'Android', stage: 'build', stageNote: 'Being built right now', icon: slug + '/icon.svg', playUrl: '', colors: clone(DEFAULT_COLORS), about: [], screens: [], videos: [], facts: [] });
      view = 'app:0'; appTab = 'details'; touched(); render(); return;
    }
    else if (act === 'del-app') { if (!confirm('Remove ' + (a.name || 'this app') + ' from the site? Its pages stay in the repo but are no longer listed.')) return; state.apps.splice(i, 1); view = 'apps'; touched(); render(); return; }
    else if (act === 'add-pricing') { var pa = appBySlug(pricingApp); pa.pricing = { show: true, title: 'Free to use', lead: '', free: { name: 'Free', amount: '₹0', items: [] } }; }
    else if (act === 'add-pro') { var pa2 = appBySlug(pricingApp); pa2.pricing.pro = { name: pa2.name + ' Pro', badge: 'One payment', note: 'pay once, keep it', groups: [{ title: '', items: [] }] }; }
    else if (act === 'del-pro') { if (!confirm('Remove the Pro plan from this page?')) return; delete appBySlug(pricingApp).pricing.pro; }
    else if (act === 'add-group') { appBySlug(pricingApp).pricing.pro.groups.push({ title: '', items: [] }); }
    else if (act === 'paste-prices') {
      var r = parsePrices($('#paste').value), cnt = Object.keys(r.map).length;
      if (!cnt) { $('#paste-out').textContent = 'No prices found in that text.'; return; }
      if (!confirm('Update ' + cnt + ' countr' + (cnt > 1 ? 'ies' : 'y') + (r.bad ? ' (' + r.bad + ' lines not understood)' : '') + '?')) return;
      Object.keys(r.map).forEach(function (c) { prices[pricingApp][c] = r.map[c]; });
      toast(cnt + ' prices updated.', 'ok');
    }
    else if (act === 'reload') { if (dirty() && !confirm('Load the newest version from GitHub? Changes you have not published will be lost.')) return; pull().then(function () { render(); toast('Loaded the newest version.', 'ok'); }).catch(function (er) { toast(er.message, 'bad'); }); return; }
    else if (act === 'replace-token') { if (confirm('Connect a new token? You will choose a passcode again.')) { localStorage.removeItem(LS); locked = true; showSetup(); } return; }
    else if (act === 'change-pin') { var rec = saved(); if (!rec) return; changePin(rec); return; }
    else if (act === 'lock') { lock(); return; }
    else if (act === 'forget') { if (confirm('Forget this device? The saved token is deleted from this browser.')) { localStorage.removeItem(LS); try { localStorage.removeItem('forge-preview'); } catch (er) {} locked = true; showSetup(); } return; }
    else return;
    touched(); rerender();
  });
  function changePin(rec) {
    var ov = document.createElement('div'); ov.className = 'ov';
    ov.innerHTML = '<div class="box dlg" style="width:min(460px,100%)"><h2>New passcode</h2><div class="f"><span>New 6-digit passcode</span>' + pinBoxes('n1') + '</div><div class="f"><span>Type it again</span>' + pinBoxes('n2') + '</div><p class="err" id="nerr"></p><div class="row end"><button type="button" class="b" id="n-cancel">Cancel</button><button type="button" class="b pri" id="n-save">Save</button></div></div>';
    document.body.appendChild(ov);
    var a1 = wirePin('n1', function () { a2.focus(); }), a2 = wirePin('n2'); a1.focus();
    $('#n-cancel', ov).addEventListener('click', function () { ov.remove(); });
    $('#n-save', ov).addEventListener('click', function () {
      if (a1.val().length < 6 || a1.val() !== a2.val()) { $('#nerr', ov).textContent = 'Enter the same 6 digits twice.'; return; }
      seal(gh.token, a1.val()).then(function (r) { r.repo = rec.repo; r.branch = rec.branch; r.idle = rec.idle; r.tries = 0; save(r); ov.remove(); toast('Passcode changed.', 'ok'); });
    });
  }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'pfilter') { var q = el.value.trim().toLowerCase(); $$('#ptable .rw').forEach(function (r) { r.hidden = q && r.getAttribute('data-cn').indexOf(q) === -1; }); return; }
    if (el.hasAttribute && el.hasAttribute('data-price')) { prices[pricingApp][el.getAttribute('data-price')] = el.value; updateStatus(); return; }
    var path = el.getAttribute && el.getAttribute('data-bind'); if (!path) return;
    var val = el.type === 'checkbox' ? (el.checked || (/\.show$/.test(path) ? false : undefined)) : el.value;
    if (/\.slug$/.test(path)) {
      val = slugify(val);
      var app = getPath(state, path.replace(/\.slug$/, '')), was = app.slug;
      if (app.icon && app.icon.indexOf(was + '/') === 0 && !pending[app.icon]) app.icon = val + app.icon.slice(was.length);
    }
    setPath(state, path, val);
    var mx = el.getAttribute('data-max'); if (mx) { var c = el.parentNode.querySelector('.cnt'); if (c) { c.textContent = el.value.length + ' / ' + mx; c.classList.toggle('over', el.value.length > +mx); } }
    if (/\.colors\./.test(path)) { var a = state.apps[parseInt(view.split(':')[1], 10)], ch = $('#chipprev'); if (a && ch) { ch.style.background = 'linear-gradient(150deg,' + a.colors.bg + ',' + a.colors.bg2 + ')'; ch.style.color = a.colors.text; var sp = ch.querySelector('span'); sp.style.background = a.colors.btnBg; sp.style.color = a.colors.btnText; } }
    touched();
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.id === 'idle') { var rec = saved(); if (rec) { rec.idle = parseInt(el.value, 10); save(rec); toast('Saved.', 'ok'); } return; }
    if (el.hasAttribute && el.hasAttribute('data-radio')) { setPath(state, el.getAttribute('data-radio'), el.value); touched(); rerender(); return; }
    if (el.hasAttribute && el.hasAttribute('data-spot')) { var k = parseInt(el.getAttribute('data-spot'), 10); state.apps.forEach(function (a, n) { if (n === k) a.featured = true; else delete a.featured; }); touched(); rerender(); return; }
    var path = el.getAttribute && el.getAttribute('data-bind');
    if (path && (/\.(slug|name|stage|hidden|vertical|show)$/.test(path) || el.tagName === 'SELECT')) rerender();
    var up = el.getAttribute && el.getAttribute('data-upload'); if (up && el.files.length) addFiles(up, Array.prototype.slice.call(el.files));
  });
  function addFiles(kind, files) {
    var a = state.apps[parseInt(view.split(':')[1], 10)]; if (!a) return;
    files = files.filter(function (f) { return /^image\//.test(f.type); }); if (!files.length) return;
    var job = kind === 'icon'
      ? readImage(files[0], 512, 512, 'image/png').then(function (r) { var p = a.slug + '/icon.png'; pending[p] = r; a.icon = p; })
      : files.reduce(function (pr, f, n) { return pr.then(function () { return readImage(f, 540, 960, 'image/jpeg').then(function (r) { var p = a.slug + '/screens/' + Date.now().toString(36) + n + '.jpg'; pending[p] = r; a.screens.push({ src: p, caption: '' }); }); }); }, Promise.resolve());
    job.then(function () { touched(); rerender(); toast('Added. It goes up to GitHub when you publish.'); }).catch(function (err) { toast(err.message, 'bad'); });
  }
  // drag and drop: reorder rows, and drop image files on the Media tab
  var drag = null;
  document.addEventListener('dragstart', function (e) { var r = e.target.closest && e.target.closest('[data-dlist]'); if (!r) return; drag = { list: r.getAttribute('data-dlist'), i: +r.getAttribute('data-di') }; r.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ''); } catch (er) {} });
  document.addEventListener('dragend', function () { drag = null; $$('.dragging,.drag-over').forEach(function (x) { x.classList.remove('dragging', 'drag-over'); }); });
  document.addEventListener('dragover', function (e) {
    var d = e.target.closest && e.target.closest('#drop'); if (d && !drag) { e.preventDefault(); d.classList.add('over'); return; }
    var r = e.target.closest && e.target.closest('[data-dlist]'); if (!drag || !r || r.getAttribute('data-dlist') !== drag.list) return;
    e.preventDefault(); $$('.drag-over').forEach(function (x) { x.classList.remove('drag-over'); }); r.classList.add('drag-over');
  });
  document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) d.classList.remove('over'); });
  document.addEventListener('drop', function (e) {
    var d = e.target.closest && e.target.closest('#drop');
    if (d && !drag) { e.preventDefault(); d.classList.remove('over'); addFiles('screens', Array.prototype.slice.call(e.dataTransfer.files || [])); return; }
    var r = e.target.closest && e.target.closest('[data-dlist]'); if (!drag || !r || r.getAttribute('data-dlist') !== drag.list) return;
    e.preventDefault();
    var lst = getPath(state, drag.list); if (moveIn(lst, drag.i, +r.getAttribute('data-di'))) { touched(); rerender(); }
  });
  window.addEventListener('beforeunload', function (e) { if (!locked && dirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------- start ---------------- */
  if (!window.crypto || !crypto.subtle) { $('#app').innerHTML = '<p class="boot">This browser can’t lock the admin safely. Open forgeapps.in/admin in Chrome, Safari or Firefox.</p>'; return; }
  if (saved()) showLogin(); else showSetup();
})();
