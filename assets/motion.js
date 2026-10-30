/* Forge Apps — light motion. Normal scrolling; only fade-ins, embers and the hero logo intro. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var tasks = [];
  function loop(t) { for (var i = 0; i < tasks.length; i++) tasks[i](t); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  // close the mobile menu after picking a link
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { var n = $('.nav'); if (n) n.classList.remove('open'); }); });

  /* ---------- background embers (subtle) ---------- */
  if (!reduce) {
    var cv = document.createElement('canvas'); cv.id = 'embers'; document.body.prepend(cv);
    var g = cv.getContext('2d'), W = 0, H = 0, embers = [];
    var size = function () { var d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(d, 0, 0, d, 0, 0); };
    size(); window.addEventListener('resize', size);
    var mk = function (any) { return { x: Math.random() * W, y: any ? Math.random() * H : H + 8, vy: -(0.12 + Math.random() * 0.35), r: 0.5 + Math.random() * 1.3, ph: Math.random() * 6.28, a: 0.12 + Math.random() * 0.35 }; };
    for (var i = 0; i < Math.min(40, Math.round(innerWidth / 30)); i++) embers.push(mk(true));
    tasks.push(function (t) {
      if (document.hidden) return;
      g.clearRect(0, 0, W, H);
      for (var i = 0; i < embers.length; i++) {
        var e = embers[i]; e.y += e.vy; e.x += Math.sin(t / 1800 + e.ph) * 0.15;
        if (e.y < -8) { embers[i] = mk(false); continue; }
        g.fillStyle = 'rgba(255,140,60,' + (e.a * Math.min(1, e.y / (H * 0.5))) + ')';
        g.beginPath(); g.arc(e.x, e.y, e.r, 0, 6.283); g.fill();
      }
    });
  }

  /* ---------- fade-ins ---------- */
  function reveals() {
    var els = $$('[data-reveal]:not(.in)');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    els.forEach(function (e) { io.observe(e); });
  }
  // stagger children of grids
  $$('[data-stagger]').forEach(function (grp) {
    Array.prototype.forEach.call(grp.children, function (c, i) { c.setAttribute('data-reveal', ''); c.style.setProperty('--d', (i * 0.07) + 's'); });
  });
  window.ForgeMotion = { refresh: function () {
    $$('[data-stagger]').forEach(function (grp) { Array.prototype.forEach.call(grp.children, function (c, i) { if (!c.hasAttribute('data-reveal')) { c.setAttribute('data-reveal', ''); c.style.setProperty('--d', (i * 0.07) + 's'); } }); });
    reveals();
  } };

  /* ---------- hero logo intro (home page only) ---------- */
  var mark = $('#heroMark');
  function heroIntro() {
    var hero = $('.hero');
    var A = function (el, k, o) { return (typeof el === 'string' ? $(el) : el).animate(k, Object.assign({ fill: 'both' }, o)); };
    if (reduce) {
      ['#hAnvil', '#hTile', '#hHammer', '#hSparks'].forEach(function (s) { $(s).style.opacity = 1; });
      $$('#hCells > *').forEach(function (c) { c.style.opacity = 1; });
      $$('.hero .wm .ch, .hero .eyebrow, .hero .lead, .hero-actions').forEach(function (e) { e.style.opacity = 1; });
      return;
    }
    var fx = document.createElement('canvas'); fx.id = 'heroFx'; hero.appendChild(fx);
    var c = fx.getContext('2d'), parts = [], fw = 0, fh = 0;
    var fsize = function () { var d = Math.min(devicePixelRatio || 1, 2); fw = hero.clientWidth; fh = hero.clientHeight; fx.width = fw * d; fx.height = fh * d; c.setTransform(d, 0, 0, d, 0, 0); };
    fsize(); window.addEventListener('resize', fsize);
    function burst(n, power) {
      var pt = mark.createSVGPoint(); pt.x = 50; pt.y = 38;
      var p = pt.matrixTransform(mark.getScreenCTM()), hr = hero.getBoundingClientRect();
      var ox = p.x - hr.left, oy = p.y - hr.top, s = mark.getBoundingClientRect().width / 100;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI * (0.05 + Math.random() * 0.9), sp = (2.2 + Math.random() * 5.5) * power * s * 0.5;
        parts.push({ x: ox + (Math.random() - 0.5) * 12, y: oy, vx: Math.cos(a) * sp * 1.3, vy: Math.sin(a) * sp, life: 0, max: 30 + Math.random() * 40, w: 0.8 + Math.random() * 1.6 });
      }
    }
    tasks.push(function () {
      if (!parts.length) return;
      c.clearRect(0, 0, fw, fh); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var q = parts[i], x0 = q.x, y0 = q.y;
        q.vy += 0.24; q.vx *= 0.985; q.x += q.vx; q.y += q.vy; q.life++;
        var k = 1 - q.life / q.max; if (k <= 0) continue;
        c.strokeStyle = 'rgba(' + (k > 0.6 ? '255,236,190' : k > 0.3 ? '255,181,71' : '255,106,43') + ',' + k + ')';
        c.lineWidth = q.w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(q.x, q.y); c.stroke();
      }
      parts = parts.filter(function (q) { return q.life < q.max; });
      c.globalCompositeOperation = 'source-over';
      if (!parts.length) c.clearRect(0, 0, fw, fh);
    });
    function impact(power) {
      A('#hRing', [{ opacity: 0.9, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(' + (4.5 * power) + ')' }], { duration: 600, easing: 'cubic-bezier(.1,.7,.3,1)' });
      A('#hEdge', [{ opacity: 1 }, { opacity: 0.2 }], { duration: 800, easing: 'ease-out' });
      burst(Math.round(36 * power), power);
    }
    A('#hAnvil', [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 100, easing: 'cubic-bezier(.2,.8,.2,1)' });
    A('#hBlob', [{ opacity: 0, transform: 'translateY(-34px) scale(.7,1.2)' }, { opacity: 1, transform: 'translateY(0) scale(.85,1.15)', offset: 0.75 }, { opacity: 1, transform: 'scale(1.15,.8)', offset: 0.88 }, { opacity: 1, transform: 'scale(1)' }], { duration: 400, delay: 550, easing: 'ease-in' });
    A('#hHammer', [{ opacity: 0, transform: 'rotate(80deg)' }, { opacity: 1, transform: 'rotate(32deg)' }], { duration: 420, delay: 800, easing: 'cubic-bezier(.2,.8,.2,1)' });
    A('#hHammer', [{ transform: 'rotate(32deg)' }, { transform: 'rotate(0deg)' }], { duration: 160, delay: 1200, easing: 'cubic-bezier(.6,0,1,.6)', fill: 'forwards' });
    setTimeout(function () {
      impact(1);
      A('#hBlob', [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.3,.6)' }], { duration: 160 });
      A('#hTile', [{ opacity: 0, transform: 'scale(1.35,.55)' }, { opacity: 1, transform: 'scale(.94,1.06)', offset: 0.55 }, { opacity: 1, transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
      A('#hSparks', [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    }, 1360);
    A('#hHammer', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(24deg)', offset: 0.62 }, { transform: 'rotate(0deg)' }], { duration: 560, delay: 1360, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(function () {
      impact(0.5);
      $$('#hCells > *').forEach(function (cel, i) { A(cel, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.2)', offset: 0.6 }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, delay: 140 + i * 80, easing: 'ease-out' }); });
    }, 1920);
    // name drops in letter by letter, then the line and button
    $$('.hero .wm .ch').forEach(function (s, i) {
      A(s, [{ opacity: 0, transform: 'translateY(.5em) rotate(8deg) scale(.75)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 520, delay: 2250 + i * 55, easing: 'cubic-bezier(.2,1.3,.4,1)' });
    });
    var show = function (sel, d) { var e = $(sel); if (e) A(e, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: d, easing: 'cubic-bezier(.2,.8,.2,1)' }); };
    show('.hero .eyebrow', 2100); show('.hero .lead', 2900); show('.hero-actions', 3050);
    // a light tap every few seconds while the hero is on screen
    setTimeout(function () {
      setInterval(function () {
        if (document.hidden || window.scrollY > innerHeight * 0.7) return;
        $('#hHammer').animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(14deg)', offset: 0.6 }, { transform: 'rotate(0deg)' }], { duration: 500, easing: 'ease-in-out' });
        setTimeout(function () { impact(0.3); }, 480);
      }, 7000);
    }, 4000);
  }


  /* ---------- app cards: tilt, glare and icon follow on hover ---------- */
  function cards() {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.sc-card').forEach(function (el) {
      var icon = $('.sc-iconwrap', el), st = { rx: 0, ry: 0, tx: 0, ty: 0, ix: 0, iy: 0, live: false };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        st.ty = (x - 0.5) * 8; st.tx = (0.5 - y) * 6; st.ix = x - 0.5; st.iy = y - 0.5; st.live = true;
        el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
      });
      el.addEventListener('pointerleave', function () { st.tx = st.ty = st.ix = st.iy = 0; });
      var cx = 0, cy = 0;
      tasks.push(function () {
        if (!st.live) return;
        st.rx += (st.tx - st.rx) * 0.1; st.ry += (st.ty - st.ry) * 0.1; cx += (st.ix - cx) * 0.1; cy += (st.iy - cy) * 0.1;
        el.style.transform = 'perspective(1000px) rotateX(' + st.rx.toFixed(2) + 'deg) rotateY(' + st.ry.toFixed(2) + 'deg)';
        if (icon) icon.style.transform = 'translate(-50%,-50%) perspective(700px) rotateY(' + (cx * 24).toFixed(2) + 'deg) rotateX(' + (-cy * 18).toFixed(2) + 'deg) translate3d(' + (cx * 14).toFixed(1) + 'px,' + (cy * 10).toFixed(1) + 'px,0)';
        if (!st.tx && !st.ty && Math.abs(st.rx) < 0.02 && Math.abs(st.ry) < 0.02 && Math.abs(cx) < 0.002) { el.style.transform = ''; if (icon) icon.style.transform = ''; st.live = false; }
      });
    });
  }

  function start() { if (mark) heroIntro(); cards(); reveals(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
