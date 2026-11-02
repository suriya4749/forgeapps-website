/* Forge Apps — contact form.
   Sends through Web3Forms to the inbox its key belongs to (support@forgeapps.in).
   No key yet → opens the visitor's email app with everything filled in.
   After sending, the message is "forged": it drops on the anvil, the hammer strikes twice and it turns into a tick. */
(function () {
  var F = window.FORGE || { apps: [] };
  var root = document.documentElement.getAttribute('data-root') || '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var form = $('#cform'); if (!form) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var track = function (n, d) { if (window.forgeTrack) window.forgeTrack(n, d); };
  var TOPIC = { feedback: 'Feedback', bug: 'Bug report', idea: 'Idea', question: 'Question', launch: 'Launch alert' };

  // ---- app picker: "Forge Apps" + every app from apps.js ----
  var apps = [{ slug: 'general', name: 'Forge Apps', icon: 'assets/favicon.svg', note: 'In general' }].concat(F.apps.map(function (a) {
    return { slug: a.slug, name: a.name, icon: a.icon, note: a.stage === 'live' ? 'On Google Play' : a.stage === 'test' ? 'In testing' : a.stage === 'build' ? 'Being built' : 'Idea', stage: a.stage };
  }));
  var sel = $('#cf-app'), ico = $('#cf-app-icon');
  sel.innerHTML = apps.map(function (a) {
    return '<option value="' + esc(a.slug) + '">' + esc(a.slug === 'general' ? 'Forge Apps (general)' : a.name + ' \u00b7 ' + a.note) + '</option>';
  }).join('');
  var syncIcon = function () { var a = apps.filter(function (x) { return x.slug === sel.value; })[0] || apps[0]; ico.src = root + a.icon; };
  sel.addEventListener('change', syncIcon);
  var side = $('#cs-apps');
  if (side) side.innerHTML = F.apps.map(function (a) {
    var b = root + a.slug + '/';
    return '<div class="cs-app"><img src="' + esc(root + a.icon) + '" alt="" width="28" height="28"><b>' + esc(a.name) + '</b><a href="' + b + 'privacy/">Privacy</a><a href="' + b + 'delete-account/">Delete data</a></div>';
  }).join('');

  // ---- preselect from the link (?app=wealthon&topic=bug) ----
  var q = new URLSearchParams(location.search);
  var pick = function (name, val) {
    if (name === 'app') { if (apps.some(function (a) { return a.slug === val; })) { sel.value = val; syncIcon(); } return; }
    var el = form.querySelector('input[name="' + name + '"][value="' + val + '"]'); if (el) el.checked = true;
  };
  if (q.get('app')) pick('app', q.get('app'));
  if (q.get('topic')) pick('topic', q.get('topic'));

  var val = function (n) { var el = form.elements[n]; if (!el) return ''; if (el.length && !el.tagName) { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ''; } return String(el.value || '').trim(); };
  var appName = function () { var s = val('app'); var a = apps.filter(function (x) { return x.slug === s; })[0]; return a ? a.name : 'Forge Apps'; };

  // ---- topic changes the message wording ----
  var msg = form.elements.message, label = $('#msg-label');
  function onTopic() {
    var t = val('topic');
    var ph = { feedback: 'What do you like, and what would make it better?', bug: 'What did you tap, what happened, and what did you expect?', idea: 'What should we build or add?', question: 'Ask anything.', launch: 'Anything you would like it to do? (optional)' };
    msg.placeholder = ph[t] || '';
    msg.required = t !== 'launch';
    label.innerHTML = t === 'launch' ? 'Message <i>optional</i>' : 'Message';
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'topic') onTopic(); });
  onTopic();

  // ---- character count ----
  var count = $('.cf-count b');
  msg.addEventListener('input', function () { count.textContent = msg.value.length; });

  // ---- validation ----
  var showErr = function (name, on) { var f = form.elements[name].closest('.cf-field'); f.classList.toggle('bad', on); };
  form.elements.email.addEventListener('input', function () { showErr('email', false); });
  msg.addEventListener('input', function () { showErr('message', false); });
  function valid() {
    var ok = true, first = null;
    var em = val('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { showErr('email', true); ok = false; first = first || form.elements.email; }
    if (msg.required && val('message').length < 3) { showErr('message', true); ok = false; first = first || msg; }
    if (first) first.focus();
    return ok;
  }

  var status = $('#cf-status'), btn = $('.cf-send'), btnLabel = btn.querySelector('span');
  function busy(on) { btn.disabled = on; btn.classList.toggle('busy', on); btnLabel.textContent = on ? 'Forging…' : 'Send to the forge'; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.hidden = true;
    if (!valid()) return;
    if (form.elements.botcheck.checked) return;               // a bot filled the hidden box
    var t = val('topic'), name = val('name'), email = val('email');
    var subject = '[Forge Apps] ' + TOPIC[t] + ' · ' + appName() + (name ? ' · from ' + name : '');
    var device = navigator.userAgent.replace(/\s*\([^)]*\)\s*/, ' ').slice(0, 160);
    var body = {
      access_key: F.formKey, subject: subject, from_name: 'Forge Apps website',
      name: name || '(no name)', email: email, replyto: email,
      topic: TOPIC[t], app: appName(), message: val('message') || '(no message)',
      page: location.href, device: navigator.userAgent.slice(0, 300), botcheck: false
    };
    if (!F.formKey) {                                          // no key yet: hand over to the email app
      var text = (val('message') || '') + '\n\n—\nTopic: ' + TOPIC[t] + '\nApp: ' + appName() + (name ? '\nName: ' + name : '') + '\nDevice: ' + device;
      location.href = 'mailto:' + F.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      track('feedback-mailto', { topic: t, app: val('app') });
      done('mail', t, name, email);
      return;
    }
    busy(true);
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw new Error(j.message || 'failed'); }); })
      .then(function () { busy(false); track('feedback-sent', { topic: t, app: val('app') }); done('sent', t, name, email); })
      .catch(function () {
        busy(false); track('feedback-error', { topic: t });
        status.hidden = false;
        status.innerHTML = 'Couldn’t send just now. Check your connection and try again, or email <a href="mailto:' + esc(F.email) + '">' + esc(F.email) + '</a>.';
      });
  });

  // ---- after sending ----
  var doneBox = $('#cf-done');
  function done(mode, topic, name, email) {
    var first = name ? name.split(/\s+/)[0] : '';
    var t = $('#cf-title'), p = $('#cf-text'), k = $('#cf-kicker');
    if (mode === 'mail') {
      k.textContent = 'Ready to send';
      t.textContent = 'Almost there';
      p.innerHTML = 'Your email app opened with the message ready. Press <b>Send</b> there and it reaches the forge.';
    } else if (topic === 'launch') {
      k.textContent = 'You’re on the list';
      t.textContent = first ? 'Thanks, ' + first + '!' : 'Thanks!';
      p.innerHTML = 'We’ll email <b>' + esc(email) + '</b> the day ' + esc(appName()) + ' launches. One email, nothing else.';
    } else {
      k.textContent = 'Hammered into shape';
      t.textContent = 'Message forged and sent';
      p.innerHTML = (first ? 'Thanks, ' + esc(first) + '. ' : 'Thanks. ') + 'It’s on its way to the forge. We’ll reply to <b>' + esc(email) + '</b>, usually within 1–2 days.';
    }
    var card = form.parentNode;
    card.style.minHeight = card.offsetHeight + 'px';
    var show = function () { form.hidden = true; doneBox.hidden = false; doneBox.focus({ preventScroll: true }); play(); };
    if (reduce) show();
    else { form.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.98)' }], { duration: 180, easing: 'ease-out', fill: 'forwards' }).onfinish = show; }
    var top = card.getBoundingClientRect().top;
    if (top < 96) window.scrollTo({ top: Math.max(0, window.scrollY + top - 96), behavior: reduce ? 'auto' : 'smooth' });
  }
  $('#cf-again').addEventListener('click', function () {
    doneBox.hidden = true; form.hidden = false; form.getAnimations().forEach(function (a) { a.cancel(); });
    form.reset(); onTopic(); count.textContent = '0'; form.parentNode.style.minHeight = '';
    var a = q.get('app'); if (a) pick('app', a); syncIcon();
    form.elements.email.focus();
  });

  // ---- the forge animation ----
  var S = {
    anvil: $('#cf-anvil'), tile: $('#cf-tile'), env: $('#cf-env'), check: $('#cf-check'),
    hammer: $('#cf-hammer'), rays: $('#cf-rays'), glow: $('#cf-glow'), svg: $('#cf-svg'), text: doneBox.querySelectorAll('.cf-kicker,#cf-title,#cf-text,.cf-again')
  };
  var cl = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var p = function (t, a, d) { return cl((t - a) / d); };
  var eo = function (x) { return 1 - Math.pow(1 - x, 3); };
  var ei = function (x) { return x * x * x; };
  var lerp = function (a, b, x) { return a + (b - a) * x; };
  var cv = $('#cf-sparks'), g = cv.getContext('2d'), parts = [], raf = 0;
  function burst(n, power) {
    var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0);
    var cx = r.width * 0.5, cy = r.height * 0.36, u = r.width / 100;
    for (var i = 0; i < n; i++) {
      var a = -Math.PI * (0.06 + Math.random() * 0.88), sp = (1.5 + Math.random() * 5) * power * u * 0.5;
      parts.push({ x: cx + (Math.random() - 0.5) * u * 8, y: cy, vx: Math.cos(a) * sp * 1.3, vy: Math.sin(a) * sp, life: 0, max: 28 + Math.random() * 34, w: (0.5 + Math.random()) * u * 0.32, u: u });
    }
  }
  function drawSparks() {
    var r = cv.getBoundingClientRect();
    g.clearRect(0, 0, r.width, r.height); g.globalCompositeOperation = 'lighter';
    parts.forEach(function (q) {
      q.vy += 0.22 * q.u * 0.1; q.vx *= 0.985; q.x += q.vx; q.y += q.vy; q.life++;
      var k = 1 - q.life / q.max; if (k <= 0) return;
      g.strokeStyle = 'rgba(' + (k > 0.6 ? '255,236,190' : k > 0.3 ? '255,181,71' : '255,106,43') + ',' + k + ')';
      g.lineWidth = q.w; g.lineCap = 'round'; g.beginPath(); g.moveTo(q.x - q.vx * 2, q.y - q.vy * 2); g.lineTo(q.x, q.y); g.stroke();
    });
    parts = parts.filter(function (q) { return q.life < q.max; });
    g.globalCompositeOperation = 'source-over';
  }
  S.hammer.style.transformBox = 'view-box'; S.hammer.style.transformOrigin = '77px 8px';
  S.tile.style.transformBox = 'fill-box'; S.tile.style.transformOrigin = '50% 100%';
  function frame(t) {
    // anvil rises in
    var a = eo(p(t, 0, 320)); S.anvil.style.opacity = a; S.anvil.style.transform = 'translateY(' + (1 - a) * 6 + 'px)';
    // the message tile falls onto the anvil and squashes
    var f = p(t, 120, 360), land = p(t, 480, 220);
    var sx = 1, sy = 1, ty = lerp(-46, 0, ei(f));
    if (t >= 480) { var k = Math.sin(Math.PI * land); sx = 1 + 0.14 * k; sy = 1 - 0.18 * k; }
    var hit = function (at, amt) { var x = p(t, at, 240); if (x > 0 && x < 1) { var k2 = Math.sin(Math.PI * x); sx = 1 + amt * k2; sy = 1 - amt * 1.4 * k2; } };
    hit(820, 0.1); hit(1300, 0.08);
    S.tile.style.opacity = f > 0 ? 1 : 0;
    S.tile.style.transform = 'translateY(' + ty + 'px) scale(' + sx + ',' + sy + ')';
    // hammer: wind up, strike, bounce, strike again, rest
    var ho = eo(p(t, 420, 240)), ang = lerp(80, 38, eo(p(t, 420, 320)));
    if (t > 700) ang = lerp(38, 0, ei(p(t, 700, 120)));
    if (t > 820) ang = Math.sin(Math.PI * p(t, 820, 300)) * 20;
    if (t > 1120) ang = lerp(0, 34, eo(p(t, 1120, 120)));
    if (t > 1200) ang = lerp(34, 0, ei(p(t, 1200, 100)));
    if (t > 1300) ang = lerp(0, 16, eo(p(t, 1300, 360)));
    S.hammer.style.opacity = ho; S.hammer.style.transform = 'rotate(' + ang + 'deg)';
    // strike flashes
    var fl = Math.max(1 - p(t, 820, 260), 0) * (t >= 820 ? 1 : 0), fl2 = Math.max(1 - p(t, 1300, 300), 0) * (t >= 1300 ? 1 : 0);
    S.rays.style.opacity = Math.max(fl, fl2, t > 1300 ? 0.85 : 0);
    S.glow.setAttribute('opacity', (0.5 * Math.max(fl, fl2) + (t > 1300 ? 0.18 : 0)).toFixed(3));
    // envelope becomes a tick on the second strike
    var c = p(t, 1310, 340);
    S.env.style.opacity = 1 - p(t, 1300, 120);
    S.check.setAttribute('stroke-dashoffset', (1 - eo(c)).toFixed(3));
    // a small shake on each strike
    var sh = 0; [[820, 5], [1300, 3]].forEach(function (z) { var x = p(t, z[0], 260); if (x > 0 && x < 1) sh = z[1] * (1 - x); });
    S.svg.style.transform = sh ? 'translate(' + (Math.sin(t * 0.12) * sh * 0.6) + 'px,' + (Math.cos(t * 0.15) * sh * 0.4) + 'px)' : 'none';
    // words arrive after the second strike
    S.text.forEach(function (el, i) { var x = eo(p(t, 1420 + i * 70, 320)); el.style.opacity = x; el.style.transform = 'translateY(' + (1 - x) * 8 + 'px)'; });
  }
  function play() {
    cancelAnimationFrame(raf); parts = [];
    if (reduce) { frame(4000); return; }
    var start = performance.now(), fired = {};
    var loop = function (now) {
      var t = now - start;
      if (t >= 820 && !fired.a) { fired.a = 1; burst(46, 1); }
      if (t >= 1300 && !fired.b) { fired.b = 1; burst(30, 0.75); }
      frame(t); drawSparks();
      if (t < 2600 || parts.length) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
})();
