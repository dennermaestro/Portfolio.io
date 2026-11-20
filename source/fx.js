/* fx.js — the playful layer: keyword statement per company, lanyard badge,
   robot cursor and the bug hunt. Everything here is optional: the page reads fine without it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lang() { return root.getAttribute('data-lang') === 'pt' ? 'pt' : 'en'; }

  /* ---------- keyword statement ---------- */
  var kin = $('#kinetic');
  if (kin) {
    var sets = $$('.k-set', kin);
    var nav = $('.k-nav');
    var dots = $$('.k-dot', nav);
    var pause = $('.k-pause', nav);
    var open = $('.k-open', nav);
    var badge = $('#badge');
    var card = badge ? $('.card', badge) : null;
    var cur = 0;

    /* size the type so the widest line of the current language fills the column;
       on narrow screens fall back to a fixed size and let the lines wrap */
    var fitRaf = 0;
    var fit = function () {
      fitRaf = 0;
      var avail = kin.clientWidth;
      if (!avail) return;
      kin.classList.add('nowrap');
      kin.style.fontSize = '100px';
      var max = 0;
      $$('.k-line', kin).forEach(function (l) { var w = l.getBoundingClientRect().width; if (w > max) max = w; });
      if (!max) { kin.style.fontSize = ''; return; }
      var size = Math.floor(avail / max * 100 * 0.985);
      /* keep the three lines and the company buttons inside the first screen when there is room */
      var top = kin.getBoundingClientRect().top + window.scrollY;
      var room = (window.innerHeight - top - 124) / 2.8;
      size = Math.min(size, 190, Math.max(84, Math.round(room)));
      if (size < 46) {
        kin.classList.remove('nowrap');
        size = Math.round(clamp(avail * 0.155, 44, 72));
      }
      kin.style.fontSize = size + 'px';
    };
    var askFit = function () { if (!fitRaf) fitRaf = requestAnimationFrame(fit); };
    fit();
    window.addEventListener('resize', askFit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('load', fit);
    $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(fit, 0); }); });

    var restart = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

    var show = function (n) {
      n = (n + sets.length) % sets.length;
      if (n === cur) return;
      var prev = sets[cur], next = sets[n], co = next.getAttribute('data-co');
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      prev.setAttribute('aria-hidden', 'true');
      clearTimeout(prev._t);
      prev._t = setTimeout(function () { prev.classList.remove('is-leaving'); }, 700);
      clearTimeout(next._t);
      next.classList.remove('is-leaving');
      void next.offsetWidth;
      next.classList.add('is-active');
      next.removeAttribute('aria-hidden');
      cur = n;
      kin.setAttribute('data-co', co);
      dots.forEach(function (d, i) { d.setAttribute('aria-pressed', String(i === n)); });
      if (open) { open.setAttribute('href', '#' + co); open.setAttribute('data-tab-target', co); }
      if (badge) {
        restart(badge, 'swing');
        if (card) restart(card, 'flip');
        clearTimeout(badge._t);
        badge._t = setTimeout(function () { badge.setAttribute('data-co', co); }, 250);
      }
    };

    requestAnimationFrame(function () { requestAnimationFrame(function () { sets[0].classList.add('is-active'); }); });

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { show(i); });
      var bar = $('.bar', d);
      if (bar) bar.addEventListener('animationend', function () { if (i === cur) show(cur + 1); });
    });
    if (badge) badge.addEventListener('click', function () { show(cur + 1); });
    if (pause) pause.addEventListener('click', function () {
      var p = pause.getAttribute('aria-pressed') !== 'true';
      pause.setAttribute('aria-pressed', String(p));
      nav.classList.toggle('is-paused', p);
    });
    if (nav) {
      var hold = function (v) { return function () { nav.classList.toggle('is-held', v); }; };
      nav.addEventListener('pointerenter', hold(true));
      nav.addEventListener('pointerleave', hold(false));
      nav.addEventListener('focusin', hold(true));
      nav.addEventListener('focusout', hold(false));
      if (badge) { badge.addEventListener('pointerenter', hold(true)); badge.addEventListener('pointerleave', hold(false)); }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { nav.classList.toggle('is-off', !es[0].isIntersecting); }, { threshold: 0.25 }).observe(kin);
      }
      document.addEventListener('visibilitychange', function () { nav.classList.toggle('is-hidden-tab', document.hidden); });
    }
  }

  /* ---------- robot cursor (mouse or trackpad only) ---------- */
  var robot = $('#robot'), rtoggle = $('#robot-toggle');
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (robot && fine) {
    var inner = $('.robot-in', robot);
    var on = store('ds-robot') !== 'off';
    var apply = function () {
      root.classList.toggle('robot-on', on);
      if (rtoggle) rtoggle.setAttribute('aria-pressed', String(on));
    };
    apply();
    if (rtoggle) {
      rtoggle.hidden = false;
      rtoggle.addEventListener('click', function () { on = !on; store('ds-robot', on ? 'on' : 'off'); apply(); });
    }
    var x = 0, y = 0, lx = 0, ly = 0, raf = 0, hot = false, rest = 0, first = true;
    var HOT = 'a, button, [role="tab"], summary, label, input, select, textarea';
    var draw = function () {
      raf = 0;
      var dx = first ? 0 : x - lx, dy = first ? 0 : y - ly;
      first = false; lx = x; ly = y;
      robot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      robot.classList.add('is-on');
      robot.classList.toggle('is-hot', hot);
      inner.style.transform = 'rotate(' + clamp(dx * 0.8, -16, 16).toFixed(1) + 'deg)';
      robot.style.setProperty('--ex', clamp(dx * 0.2, -2.2, 2.2).toFixed(1) + 'px');
      robot.style.setProperty('--ey', clamp(dy * 0.2, -2.2, 2.2).toFixed(1) + 'px');
      clearTimeout(rest);
      rest = setTimeout(function () {
        inner.style.transform = '';
        robot.style.setProperty('--ex', '0px');
        robot.style.setProperty('--ey', '0px');
      }, 110);
    };
    window.addEventListener('pointermove', function (e) {
      if (!on || e.pointerType === 'touch') return;
      x = e.clientX; y = e.clientY;
      hot = !!(e.target && e.target.closest && e.target.closest(HOT));
      if (!raf) raf = requestAnimationFrame(draw);
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'touch') robot.classList.add('is-down'); }, { passive: true });
    window.addEventListener('pointerup', function () { robot.classList.remove('is-down'); }, { passive: true });
    var hide = function () { robot.classList.remove('is-on'); first = true; };
    root.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
  }

  /* ---------- bug hunt ---------- */
  var bugs = $$('.bug'), counts = $$('.bug-count'), toast = $('#toast');
  if (bugs.length) {
    var total = bugs.length, caught = 0, tt = 0;
    var fill = function (s, n) { return s.replace('{n}', n).replace('{t}', total); };
    var say = function (n) {
      if (!toast) return;
      var all = n === total, k = all ? '-all' : '';
      var html = '<span class="l-en">' + fill(toast.getAttribute('data-en' + k), n) + '</span>' +
                 '<span class="l-pt" lang="pt-BR">' + fill(toast.getAttribute('data-pt' + k), n) + '</span>';
      if (all) html += '<a href="#contact"><span class="l-en">' + toast.getAttribute('data-en-cta') + '</span><span class="l-pt" lang="pt-BR">' + toast.getAttribute('data-pt-cta') + '</span></a>';
      toast.innerHTML = html;
      toast.hidden = true; void toast.offsetWidth; toast.hidden = false;
      clearTimeout(tt);
      tt = setTimeout(function () { toast.hidden = true; }, all ? 9000 : 3200);
    };
    if (toast) toast.addEventListener('click', function () { toast.hidden = true; });
    counts.forEach(function (c) { c.textContent = '0/' + total; });
    bugs.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('is-caught')) return;
        b.classList.add('is-caught');
        b.setAttribute('data-label-en', 'Bug caught');
        b.setAttribute('data-label-pt', 'Bug capturado');
        b.setAttribute('aria-label', b.getAttribute('data-label-' + lang()));
        caught += 1;
        counts.forEach(function (c) { c.textContent = caught + '/' + total; });
        say(caught);
      });
    });
  }
})();
