/*!
 * motion.js — motion layer for the portfolio (vanilla JS, no dependencies)
 *
 * Modules (each one is a no-op when its markup is missing):
 *   0. Intro loader       #intro (optional, skippable, <= 1.8s, once per session)
 *   a. Hero canvas        <canvas id="hero-canvas">  node graph + "test runs" with green checks
 *   b. Scroll reveal      [data-reveal] (+ data-reveal-delay="120" in ms) -> .is-visible
 *   c. Count-up           [data-count="67" data-suffix="%" data-prefix="" data-duration="1400"]
 *   d. Terminal typing    #hero-terminal[data-lines='["...","..."]'] (+ data-prompt="$")
 *   e. Pipeline           #pipeline .pipeline-step -> .is-active / .is-current, #pipeline-progress --p 0..1
 *   f. Magnetic hover     [data-magnetic] (value = strength, default 0.3) + [data-magnetic-inner]
 *   g. Extras             [data-spotlight] sets --mx/--my; [data-tabs] sliding .tabs-indicator
 *
 * Colours come from CSS custom properties: --fg, --accent (and optional --success for checks).
 * prefers-reduced-motion: everything renders in its final state, no loops, no typing.
 * Public API: window.PortfolioMotion.refresh() re-scans for [data-reveal]/[data-count] added later.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var win = window;

  /* ------------------------------------------------------------------ utils */
  var mqReduce = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var mqFine = win.matchMedia ? win.matchMedia('(hover: hover) and (pointer: fine)') : null;
  var hasIO = 'IntersectionObserver' in win;
  var raf = win.requestAnimationFrame ? win.requestAnimationFrame.bind(win) : function (cb) { return setTimeout(function () { cb(now()); }, 16); };
  var caf = win.cancelAnimationFrame ? win.cancelAnimationFrame.bind(win) : clearTimeout;

  function now() { return (win.performance && performance.now) ? performance.now() : Date.now(); }
  function reduced() { return !!(mqReduce && mqReduce.matches) || root.hasAttribute('data-reduce-motion'); }
  function qs(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function num(v, fallback) { var n = parseFloat(v); return isFinite(n) ? n : fallback; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function cssVar(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name);
    v = v && v.trim();
    return v || fallback;
  }
  function parseMs(v, fallback) {
    if (v == null || v === '') return fallback;
    var s = String(v).trim();
    var n = parseFloat(s);
    if (!isFinite(n)) return fallback;
    return /[^m]s$/.test(s) ? n * 1000 : n; // "0.2s" -> 200, "200" / "200ms" -> 200
  }
  function onMQChange(mq, fn) {
    if (!mq) return;
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }
  /** Calls cb(true|false) when element enters/leaves the viewport. Falls back to "always visible". */
  function watchVisibility(el, cb, opts) {
    if (!hasIO) { cb(true); return null; }
    var io = new IntersectionObserver(function (entries) {
      cb(entries[entries.length - 1].isIntersecting);
    }, opts || { threshold: 0 });
    io.observe(el);
    return io;
  }

  root.classList.add('js-motion');
  if (reduced()) root.classList.add('reduced-motion');

  /* ============================================================ 0. INTRO */
  // Markup (optional):
  // <div id="intro" aria-hidden="true"><span data-intro-count>0</span><span class="intro__bar"></span></div>
  // Timeline: 0–1100ms counter 0→100 + bar, 1100ms .is-leaving (curtain wipe 600ms), 1700ms removed.
  // Skip: click / key / wheel / touch -> leave immediately (350ms). Shown once per session.
  function initIntro(done) {
    var intro = doc.getElementById('intro');
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      root.classList.remove('is-intro');
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) { /* storage blocked */ }
      try { doc.dispatchEvent(new CustomEvent('motion:intro-done')); } catch (e) { /* old browser */ }
    }
    if (!intro) { done(); return; }

    var seen = false;
    try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (e) { /* ignore */ }
    if (reduced() || seen) { finish(); done(); return; }

    root.classList.add('is-intro');
    var counter = qs('[data-intro-count]', intro);
    var COUNT = 1100, LEAVE = 600, SKIP_LEAVE = 350;
    var start = now(), leaving = false, rafId = 0, released = false;
    var events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

    function release() { if (!released) { released = true; done(); } }
    function leave(skipped) {
      if (leaving) return;
      leaving = true;
      caf(rafId);
      if (counter) counter.textContent = '100';
      intro.style.setProperty('--intro-p', '1');
      intro.classList.add('is-leaving');
      if (skipped) intro.classList.add('is-skipped');
      events.forEach(function (ev) { win.removeEventListener(ev, onSkip, true); });
      release(); // hero content reveals underneath the wipe (overlap = feels faster)
      setTimeout(finish, skipped ? SKIP_LEAVE : LEAVE);
    }
    function onSkip() { leave(true); }
    function tick() {
      var t = clamp((now() - start) / COUNT, 0, 1);
      var e = easeOutCubic(t);
      if (counter) counter.textContent = String(Math.round(e * 100));
      intro.style.setProperty('--intro-p', e.toFixed(3));
      if (t < 1) rafId = raf(tick); else leave(false);
    }
    events.forEach(function (ev) { win.addEventListener(ev, onSkip, { capture: true, passive: true }); });
    rafId = raf(tick);
    setTimeout(function () { leave(true); }, 1800); // hard ceiling: never block longer than 1.8s
  }

  /* ======================================================= a. HERO CANVAS */
  function initHeroCanvas() {
    var canvas = doc.getElementById('hero-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.setAttribute('aria-hidden', 'true');

    var W = 0, H = 0, dpr = 1, LINK = 150;
    var nodes = [], edges = [], packets = [], checks = [];
    var colors = { fg: '#e9e9ee', accent: '#7cf29c', ok: '#7cf29c' };
    var running = false, inView = true, rafId = 0, last = 0, nextSpawn = 0;
    var pointer = { x: -1e4, y: -1e4 };
    var saveData = !!(navigator.connection && navigator.connection.saveData);

    function readColors() {
      colors.fg = cssVar(canvas, '--fg', colors.fg);
      colors.accent = cssVar(canvas, '--accent', colors.accent);
      colors.ok = cssVar(canvas, '--success', colors.accent);
    }

    function makeNode(x, y) {
      var a = rand(0, Math.PI * 2), s = rand(4, 12); // px per second — slow drift
      return { x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(1.2, 2.2), hub: Math.random() < 0.14, pulse: 0 };
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var nW = Math.max(1, rect.width), nH = Math.max(1, rect.height);
      dpr = Math.min(win.devicePixelRatio || 1, 2);
      canvas.width = Math.round(nW * dpr);
      canvas.height = Math.round(nH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // keep existing nodes, rescale positions (avoids a jump on mobile URL-bar resizes)
      if (W && H) {
        var sx = nW / W, sy = nH / H;
        nodes.forEach(function (n) { n.x *= sx; n.y *= sy; });
      }
      W = nW; H = nH;
      LINK = clamp(Math.min(W, H) * 0.3, 110, 190);
      var target = Math.round(clamp((W * H) / 15000, 16, saveData ? 30 : 64));
      while (nodes.length < target) nodes.push(makeNode(rand(0, W), rand(0, H)));
      if (nodes.length > target) nodes.length = target;
      packets = packets.filter(function (p) { return p.a < nodes.length && p.b < nodes.length; });
      checks = checks.filter(function (c) { return c.n < nodes.length; });
      if (!running) draw();
    }

    function buildEdges() {
      edges.length = 0;
      var L2 = LINK * LINK;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < L2) edges.push({ a: i, b: j, s: 1 - Math.sqrt(d2) / LINK });
        }
      }
    }

    function neighbours(i) {
      var out = [];
      for (var k = 0; k < edges.length; k++) {
        var e = edges[k];
        if (e.s < 0.25) continue;
        if (e.a === i) out.push(e.b); else if (e.b === i) out.push(e.a);
      }
      return out;
    }

    function spawnPacket() {
      if (!edges.length || packets.length >= 4) return;
      var strong = edges.filter(function (e) { return e.s > 0.35; });
      var e = (strong.length ? strong : edges)[(Math.random() * (strong.length || edges.length)) | 0];
      var flip = Math.random() < 0.5;
      packets.push({ a: flip ? e.b : e.a, b: flip ? e.a : e.b, t: 0, dur: rand(0.9, 1.5), hops: (Math.random() * 3) | 0 });
    }

    function update(dt) {
      var i, n;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        // soft pointer repulsion
        var dx = n.x - pointer.x, dy = n.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          var f = (1 - Math.sqrt(d2) / 140) * 40 * dt;
          n.x += (dx / Math.sqrt(d2)) * f;
          n.y += (dy / Math.sqrt(d2)) * f;
        }
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        if (n.pulse > 0) n.pulse = Math.max(0, n.pulse - dt * 0.9);
      }
      buildEdges();

      for (i = packets.length - 1; i >= 0; i--) {
        var p = packets[i];
        p.t += dt / p.dur;
        var A = nodes[p.a], B = nodes[p.b];
        var dist = Math.hypot(A.x - B.x, A.y - B.y);
        if (p.t >= 1 || dist > LINK * 1.15) {
          packets.splice(i, 1);
          if (p.t >= 1) {
            B.pulse = 1;
            checks.push({ n: p.b, life: 0 });
            // chain onward like a test pipeline hopping between stages
            if (p.hops > 0) {
              var nb = neighbours(p.b).filter(function (k) { return k !== p.a; });
              if (nb.length) packets.push({ a: p.b, b: nb[(Math.random() * nb.length) | 0], t: 0, dur: rand(0.8, 1.3), hops: p.hops - 1 });
            }
          }
        }
      }
      for (i = checks.length - 1; i >= 0; i--) {
        checks[i].life += dt / 1.6;
        if (checks[i].life >= 1) checks.splice(i, 1);
      }

      nextSpawn -= dt;
      if (nextSpawn <= 0) { spawnPacket(); nextSpawn = rand(0.7, 1.9); }
    }

    function drawCheck(x, y, life, alpha) {
      // life: 0..1  — draw-on 0–0.3, hold, fade-out 0.7–1, rises 6px
      var drawP = clamp(life / 0.3, 0, 1);
      var fade = life < 0.7 ? 1 : 1 - (life - 0.7) / 0.3;
      var a = alpha * fade;
      var cy = y - 12 - easeOutCubic(life) * 6;
      ctx.globalAlpha = a * 0.18;
      ctx.fillStyle = colors.ok;
      ctx.beginPath(); ctx.arc(x, cy, 9 + (1 - easeOutCubic(drawP)) * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a;
      ctx.strokeStyle = colors.ok;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // check path: (-4,0) -> (-1,3) -> (4.5,-3.5); segment lengths ~4.24 and ~8.6
      var p1 = { x: x - 4, y: cy }, p2 = { x: x - 1, y: cy + 3 }, p3 = { x: x + 4.5, y: cy - 3.5 };
      var l1 = 4.24, l2 = 8.6, len = (l1 + l2) * easeOutCubic(drawP);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
      if (len <= l1) {
        var k = len / l1; ctx.lineTo(p1.x + (p2.x - p1.x) * k, p1.y + (p2.y - p1.y) * k);
      } else {
        var k2 = (len - l1) / l2; ctx.lineTo(p2.x, p2.y); ctx.lineTo(p2.x + (p3.x - p2.x) * k2, p2.y + (p3.y - p2.y) * k2);
      }
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, e, A, B;

      // edges, bucketed by alpha to limit state changes
      ctx.strokeStyle = colors.fg;
      ctx.lineWidth = 1;
      var buckets = [[], [], [], []];
      for (i = 0; i < edges.length; i++) {
        e = edges[i];
        A = nodes[e.a]; B = nodes[e.b];
        var mx = (A.x + B.x) / 2 - pointer.x, my = (A.y + B.y) / 2 - pointer.y;
        var boost = mx * mx + my * my < 160 * 160 ? 0.35 : 0;
        buckets[Math.min(3, Math.floor((e.s + boost) * 4))].push(e);
      }
      for (var b = 0; b < 4; b++) {
        if (!buckets[b].length) continue;
        ctx.globalAlpha = 0.03 + b * 0.045;
        ctx.beginPath();
        for (i = 0; i < buckets[b].length; i++) {
          e = buckets[b][i]; A = nodes[e.a]; B = nodes[e.b];
          ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
        }
        ctx.stroke();
      }

      // nodes
      ctx.fillStyle = colors.fg;
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.hub) continue;
        ctx.moveTo(n.x + n.r, n.y); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      for (i = 0; i < nodes.length; i++) {
        if (!nodes[i].hub) continue;
        ctx.moveTo(nodes[i].x + 2.6, nodes[i].y); ctx.arc(nodes[i].x, nodes[i].y, 2.6, 0, Math.PI * 2);
      }
      ctx.fill();
      // pulse rings on nodes that just "passed"
      ctx.strokeStyle = colors.ok;
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        var pn = nodes[i];
        if (pn.pulse <= 0) continue;
        ctx.globalAlpha = pn.pulse * 0.6;
        ctx.beginPath(); ctx.arc(pn.x, pn.y, 3 + (1 - pn.pulse) * 14, 0, Math.PI * 2); ctx.stroke();
      }

      // packets with a short trail
      ctx.lineCap = 'round';
      for (i = 0; i < packets.length; i++) {
        var p = packets[i]; A = nodes[p.a]; B = nodes[p.b];
        var t = easeInOutCubic(clamp(p.t, 0, 1)), t0 = Math.max(0, t - 0.18);
        var x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(A.x + (B.x - A.x) * t0, A.y + (B.y - A.y) * t0); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.accent;
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
      }

      for (i = 0; i < checks.length; i++) {
        var cn = nodes[checks[i].n];
        drawCheck(cn.x, cn.y, checks[i].life, 0.95);
      }
      ctx.globalAlpha = 1;
    }

    function drawStatic() {
      // reduced motion: one composed frame, a few checks shown fully drawn
      packets.length = 0; checks.length = 0;
      buildEdges();
      for (var k = 0; k < Math.min(3, nodes.length); k++) checks.push({ n: (k * 7) % nodes.length, life: 0.5 });
      draw();
      checks.length = 0;
    }

    function frame(t) {
      if (!running) return;
      var dt = Math.min((t - last) / 1000, 0.05); // clamp after tab switches / jank
      last = t;
      update(dt);
      draw();
      rafId = raf(frame);
    }
    function start() {
      if (running || reduced() || doc.hidden || !inView) return;
      running = true;
      last = now();
      rafId = raf(frame);
    }
    function stop() { running = false; caf(rafId); }
    function sync() { if (reduced()) { stop(); drawStatic(); } else if (doc.hidden || !inView) stop(); else start(); }

    readColors();
    resize();
    buildEdges();

    if ('ResizeObserver' in win) new ResizeObserver(function () { resize(); if (reduced()) drawStatic(); }).observe(canvas);
    else win.addEventListener('resize', function () { resize(); if (reduced()) drawStatic(); });

    watchVisibility(canvas, function (v) { inView = v; sync(); });
    doc.addEventListener('visibilitychange', sync);
    onMQChange(mqReduce, sync);

    // theme switches (class / data-theme / inline style on <html> or <body>, or OS scheme)
    var recolor = function () { readColors(); if (!running) (reduced() ? drawStatic : draw)(); };
    if ('MutationObserver' in win) {
      var mo = new MutationObserver(recolor);
      mo.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
      if (doc.body) mo.observe(doc.body, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    }
    onMQChange(win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)'), recolor);

    if (mqFine && mqFine.matches) {
      win.addEventListener('pointermove', function (ev) {
        var r = canvas.getBoundingClientRect();
        pointer.x = ev.clientX - r.left; pointer.y = ev.clientY - r.top;
      }, { passive: true });
      doc.addEventListener('pointerleave', function () { pointer.x = pointer.y = -1e4; });
    }

    sync();
  }

  /* ======================================================= b. SCROLL REVEAL */
  var revealIO = null;
  var STAGGER = 70, STAGGER_MAX = 6; // ms between siblings entering in the same batch; cap at 6 steps

  function showReveal(el, delay) {
    if (delay) {
      el.style.setProperty('--reveal-delay', delay + 'ms');
      var clear = function (ev) {
        if (ev.target !== el) return;
        el.style.removeProperty('--reveal-delay'); // so later hover transitions aren't delayed
        el.removeEventListener('transitionend', clear);
      };
      el.addEventListener('transitionend', clear);
    }
    el.classList.add('is-visible');
  }

  function initReveal() {
    var els = qsa('[data-reveal]:not(.is-visible)');
    if (!els.length) return;
    if (reduced() || !hasIO) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
        batch.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; }); // DOM order
        batch.forEach(function (el, i) {
          var own = el.getAttribute('data-reveal-delay');
          var delay = own != null && own !== '' ? parseMs(own, 0) : Math.min(i, STAGGER_MAX) * STAGGER;
          showReveal(el, delay);
          revealIO.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }
    els.forEach(function (el) { revealIO.observe(el); });
  }

  /* =========================================================== c. COUNT-UP */
  function initCountUp() {
    var els = qsa('[data-count]:not([data-count-init])');
    els.forEach(function (el) {
      el.setAttribute('data-count-init', '');
      var raw = el.getAttribute('data-count');
      var target = num(raw, 0);
      var decimals = (raw.split('.')[1] || '').length;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = parseMs(el.getAttribute('data-duration'), 1400);
      var fmt = function (v) {
        return prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      };
      var finalText = fmt(target);
      if (reduced() || !hasIO) { el.textContent = finalText; return; }

      // tabular digits so the number doesn't wobble while counting
      el.style.fontVariantNumeric = 'tabular-nums';
      el.textContent = fmt(0);

      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var t0 = now();
        (function step() {
          var t = clamp((now() - t0) / dur, 0, 1);
          el.textContent = t < 1 ? fmt(target * easeOutExpo(t)) : finalText;
          if (t < 1) raf(step);
          else el.classList.add('is-counted');
        })();
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ===================================================== d. HERO TERMINAL */
  function initTerminal() {
    var el = doc.getElementById('hero-terminal');
    if (!el) return;
    var lines;
    try { lines = JSON.parse(el.getAttribute('data-lines') || '[]'); } catch (e) { lines = []; }
    lines = (Array.isArray(lines) ? lines : []).map(String).filter(Boolean);
    if (!lines.length) return;

    var promptChar = el.getAttribute('data-prompt');
    if (promptChar == null) promptChar = '$';
    var SPEED = num(el.getAttribute('data-type-speed'), 34); // ms per char (jittered)
    var HOLD = num(el.getAttribute('data-hold'), 1700);
    var DELETE = 14;

    // a11y: screen readers get all lines once; animated part is hidden from them
    el.textContent = '';
    var sr = doc.createElement('span');
    sr.className = 'motion-sr';
    sr.setAttribute('style', 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0');
    sr.textContent = lines.join('. ');
    var vis = doc.createElement('span');
    vis.className = 'term-line';
    vis.setAttribute('aria-hidden', 'true');
    if (promptChar) {
      var pr = doc.createElement('span'); pr.className = 'term-prompt'; pr.textContent = promptChar + ' ';
      vis.appendChild(pr);
    }
    var txt = doc.createElement('span'); txt.className = 'term-text';
    var caret = doc.createElement('span'); caret.className = 'term-caret';
    vis.appendChild(txt); vis.appendChild(caret);
    el.appendChild(sr); el.appendChild(vis);

    function setLine(s, i) {
      txt.textContent = s;
      // lines starting with ✓ / PASS / passed get a success tint via CSS
      el.classList.toggle('is-pass', /^(✓|✔|pass(ed)?\b)/i.test(lines[i] || ''));
    }

    if (reduced()) { setLine(lines[0], 0); el.classList.add('is-static'); return; }

    var idx = 0, pos = 0, phase = 'type', timer = 0, paused = false, inView = true;
    function schedule(ms) { clearTimeout(timer); if (!paused) timer = setTimeout(tick, ms); }
    function tick() {
      var line = lines[idx];
      if (phase === 'type') {
        el.classList.add('is-typing');
        pos++;
        setLine(line.slice(0, pos), idx);
        if (pos >= line.length) { phase = 'hold'; el.classList.remove('is-typing'); schedule(HOLD); return; }
        var ch = line.charAt(pos - 1);
        schedule(SPEED * rand(0.55, 1.45) + (/[.,:;→>]/.test(ch) ? 140 : 0));
      } else if (phase === 'hold') {
        if (lines.length === 1) return; // single line: type once, keep it
        phase = 'delete'; schedule(DELETE);
      } else {
        el.classList.add('is-typing');
        pos = Math.max(0, pos - 2);
        setLine(line.slice(0, pos), idx);
        if (pos === 0) { phase = 'type'; idx = (idx + 1) % lines.length; schedule(260); return; }
        schedule(DELETE);
      }
    }
    function sync() {
      var shouldPause = doc.hidden || !inView;
      if (shouldPause === paused) return;
      paused = shouldPause;
      if (paused) clearTimeout(timer); else schedule(120);
    }
    watchVisibility(el, function (v) { inView = v; sync(); });
    doc.addEventListener('visibilitychange', sync);
    schedule(400);
  }

  /* ============================================================ e. PIPELINE */
  // Timeline per cycle (defaults): n steps × 1100ms build-up → hold 2600ms (.is-complete) → reset 700ms (.is-resetting)
  // During a step window the step lights up at 0%, the progress line travels to the next step from 35%→100%.
  function initPipeline() {
    var wrap = doc.getElementById('pipeline');
    if (!wrap) return;
    var steps = qsa('.pipeline-step', wrap);
    var n = steps.length;
    if (!n) return;
    var bar = doc.getElementById('pipeline-progress');
    var STEP = parseMs(wrap.getAttribute('data-step-duration'), 1100);
    var HOLD = parseMs(wrap.getAttribute('data-hold'), 2600);
    var RESET = 700;
    var BUILD = n * STEP, TOTAL = BUILD + HOLD + RESET;
    var loop = wrap.getAttribute('data-loop') !== 'false';

    var elapsed = 0, last = 0, rafId = 0, running = false, inView = false, hovered = false, started = false;
    var lastActive = -1, lastCurrent = -2, lastPhase = '';

    function setP(p) {
      var v = p.toFixed(4);
      if (bar) bar.style.setProperty('--p', v);
      wrap.style.setProperty('--p', v);
    }
    function apply(active, current, phase, p) {
      setP(p);
      if (active !== lastActive || current !== lastCurrent) {
        for (var k = 0; k < n; k++) {
          steps[k].classList.toggle('is-active', k < active);
          steps[k].classList.toggle('is-current', k === current);
          steps[k].style.setProperty('--step-i', k);
        }
        lastActive = active; lastCurrent = current;
      }
      if (phase !== lastPhase) {
        wrap.classList.toggle('is-running', phase === 'run');
        wrap.classList.toggle('is-complete', phase === 'hold');
        wrap.classList.toggle('is-resetting', phase === 'reset');
        lastPhase = phase;
      }
    }
    function render(t) {
      var seg = n > 1 ? 1 / (n - 1) : 1;
      if (t < BUILD) {
        var f = t / STEP, i = Math.floor(f), local = f - i;
        var travel = easeInOutCubic(clamp((local - 0.35) / 0.65, 0, 1));
        apply(i + 1, i, 'run', n > 1 ? Math.min(1, (i + travel) * seg) : easeOutCubic(local));
      } else if (t < BUILD + HOLD) {
        apply(n, -1, 'hold', 1);
      } else {
        var r = clamp((t - BUILD - HOLD) / RESET, 0, 1);
        apply(0, -1, 'reset', 1 - easeInOutCubic(r));
      }
    }
    function frame(ts) {
      if (!running) return;
      elapsed += Math.min(ts - last, 64);
      last = ts;
      if (!loop && elapsed >= BUILD) { stop(); apply(n, -1, 'hold', 1); return; }
      render(elapsed % TOTAL);
      rafId = raf(frame);
    }
    function start() {
      if (running) return;
      running = true; started = true; last = now();
      rafId = raf(frame);
    }
    function stop() { running = false; caf(rafId); }
    function sync() {
      if (reduced()) { stop(); apply(n, -1, 'hold', 1); wrap.classList.add('is-static'); return; }
      wrap.classList.remove('is-static');
      if (inView && !doc.hidden && !hovered) start(); else stop();
    }

    // pause while the visitor is reading a step (hover / keyboard focus inside)
    wrap.addEventListener('pointerenter', function () { hovered = true; sync(); });
    wrap.addEventListener('pointerleave', function () { hovered = false; sync(); });
    wrap.addEventListener('focusin', function () { hovered = true; sync(); });
    wrap.addEventListener('focusout', function () { hovered = false; sync(); });

    apply(0, -1, 'idle', 0);
    watchVisibility(wrap, function (v) {
      inView = v;
      if (v && !started) elapsed = 0; // first entry starts from step 1
      sync();
    }, { threshold: 0.35 });
    doc.addEventListener('visibilitychange', sync);
    onMQChange(mqReduce, sync);
    if (reduced()) sync();
  }

  /* ============================================================ f. MAGNETIC */
  function initMagnetic() {
    if (reduced() || !(mqFine && mqFine.matches)) return;
    qsa('[data-magnetic]:not([data-magnetic-init])').forEach(function (el) {
      el.setAttribute('data-magnetic-init', '');
      var strength = num(el.getAttribute('data-magnetic'), 0.3) || 0.3;
      var max = num(el.getAttribute('data-magnetic-max'), 18);
      var inner = qs('[data-magnetic-inner]', el);
      var tx = 0, ty = 0, cx = 0, cy = 0, rafId = 0, rect = null;

      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        var settled = Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05;
        if (settled) { cx = tx; cy = ty; }
        el.style.transform = (cx || cy) ? 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)' : '';
        if (inner) inner.style.transform = (cx || cy) ? 'translate3d(' + (cx * 0.45).toFixed(2) + 'px,' + (cy * 0.45).toFixed(2) + 'px,0)' : '';
        rafId = settled ? 0 : raf(loop);
      }
      function kick() { if (!rafId) rafId = raf(loop); }

      el.addEventListener('pointerenter', function () { rect = el.getBoundingClientRect(); el.classList.add('is-magnetic'); });
      el.addEventListener('pointermove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        tx = clamp((e.clientX - (rect.left + rect.width / 2)) * strength, -max, max);
        ty = clamp((e.clientY - (rect.top + rect.height / 2)) * strength, -max, max);
        kick();
      });
      el.addEventListener('pointerleave', function () { tx = ty = 0; rect = null; el.classList.remove('is-magnetic'); kick(); });
    });
  }

  /* ============================================================== g. EXTRAS */
  // Cursor-following glow on cards: sets --mx / --my (px) on [data-spotlight]
  function initSpotlight() {
    if (!(mqFine && mqFine.matches)) return;
    qsa('[data-spotlight]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      }, { passive: true });
    });
  }

  // Sliding indicator for tabs. Markup: <div role="tablist" data-tabs> <button role="tab" aria-selected="true">…
  // The site's own tab script flips aria-selected / hidden; we only observe and move .tabs-indicator.
  function initTabs() {
    qsa('[data-tabs]').forEach(function (list) {
      var ind = qs('.tabs-indicator', list);
      if (!ind) { ind = doc.createElement('span'); ind.className = 'tabs-indicator'; ind.setAttribute('aria-hidden', 'true'); list.appendChild(ind); }
      if (getComputedStyle(list).position === 'static') list.style.position = 'relative';
      function place() {
        var tab = qs('[role="tab"][aria-selected="true"]', list);
        if (!tab) { ind.style.opacity = '0'; return; }
        ind.style.opacity = '1';
        ind.style.setProperty('--tab-x', tab.offsetLeft + 'px');
        ind.style.setProperty('--tab-y', tab.offsetTop + 'px');
        ind.style.setProperty('--tab-w', tab.offsetWidth + 'px');
        ind.style.setProperty('--tab-h', tab.offsetHeight + 'px');
      }
      place();
      // first placement without a slide
      ind.classList.add('is-ready');
      if ('MutationObserver' in win) new MutationObserver(place).observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
      if ('ResizeObserver' in win) new ResizeObserver(place).observe(list);
      else win.addEventListener('resize', place);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(place);
    });
  }

  /* ================================================================= boot */
  function boot() {
    initHeroCanvas();
    initMagnetic();
    initSpotlight();
    initTabs();
    initPipeline();
    initCountUp();
    initIntro(function () {
      // reveals + terminal start as the intro curtain lifts (or immediately when there is no intro)
      initReveal();
      initTerminal();
    });
  }

  // Reduced-motion toggled at runtime: snap everything to its final state
  onMQChange(mqReduce, function () {
    root.classList.toggle('reduced-motion', reduced());
    if (reduced()) {
      qsa('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); });
      qsa('[data-magnetic]').forEach(function (el) { el.style.transform = ''; });
    }
  });

  win.PortfolioMotion = {
    refresh: function () { initReveal(); initCountUp(); initMagnetic(); },
    reduced: reduced
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
