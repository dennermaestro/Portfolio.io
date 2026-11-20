/* main.js — site behaviour: theme, language, header, scroll-spy, mobile menu,
   featured-experience tabs, skills filter, copy email. Motion lives in motion.js. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- theme ---------- */
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  $$('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('ds-theme', next);
    });
  });

  /* ---------- language ---------- */
  var META = window.__META__ || {};
  function setLang(l) {
    l = l === 'pt' ? 'pt' : 'en';
    root.setAttribute('data-lang', l);
    root.lang = l === 'pt' ? 'pt-BR' : 'en';
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l)); });
    if (META[l]) {
      document.title = META[l].title;
      var d = $('meta[name="description"]'); if (d) d.setAttribute('content', META[l].description);
    }
    $$('[data-label-en]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-label-' + l)); });
    store('ds-lang', l);
  }
  var q = /[?&]lang=(pt|en)/.exec(location.search);
  var saved = store('ds-lang');
  var nav = (navigator.language || '').toLowerCase();
  setLang(q ? q[1] : saved || (nav.indexOf('pt') === 0 ? 'pt' : 'en'));
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); }); });

  /* ---------- header ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- scroll-spy ---------- */
  var links = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var a = map[e.target.id]; if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = $('.menu-btn'), menu = $('#mobile-menu');
  function closeMenu() { if (!menu) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (open) { var f = $('a', menu); if (f) f.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) closeMenu(); });
  }

  /* ---------- featured experience tabs ---------- */
  var tabs = $$('.xp-tab');
  var panels = $$('.xp-panel');
  var ids = tabs.map(function (t) { return t.getAttribute('data-id'); });
  function select(id, opts) {
    opts = opts || {};
    if (ids.indexOf(id) < 0) return;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-id') === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && opts.focus) t.focus();
      if (on && opts.scrollTab && t.scrollIntoView && window.innerWidth < 1024) t.parentNode.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' });
    });
    panels.forEach(function (p) {
      var on = p.getAttribute('data-id') === id;
      var wasHidden = p.hidden;
      p.hidden = !on;
      if (on && wasHidden) {
        p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering');
        if (window.PortfolioMotion) window.PortfolioMotion.refresh();
      }
    });
    if (opts.hash) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
  }
  if (tabs.length) {
    var initial = location.hash.slice(1);
    select(ids.indexOf(initial) >= 0 ? initial : ids[0]);
    if (ids.indexOf(initial) >= 0) { var ex = document.getElementById('work'); if (ex) setTimeout(function () { ex.scrollIntoView(); }, 50); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.getAttribute('data-id'), { hash: true, scrollTab: true }); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0; else if (k === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault();
        select(ids[n], { focus: true, hash: true, scrollTab: true });
      });
    });
    window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (ids.indexOf(h) >= 0) { select(h); var ex = document.getElementById('work'); if (ex) ex.scrollIntoView({ behavior: 'smooth' }); } });
    $$('[data-tab-target]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        select(b.getAttribute('data-tab-target'), { hash: true, scrollTab: true });
        var tl = $('.chapters'); if (tl) tl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- skills filter ---------- */
  var fbtns = $$('.skills-filter button');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.sk').forEach(function (g) {
        var cats = (g.getAttribute('data-cat') || '').split(' ');
        g.classList.toggle('is-dim', f !== 'all' && cats.indexOf(f) < 0);
      });
    });
  });

  /* ---------- copy email ---------- */
  $$('.copy-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      function done(ok) {
        b.classList.toggle('is-done', ok);
        $$('.st', b).forEach(function (s) { s.hidden = true; });
        var tgt = $(ok ? '.st-ok' : '.st-sel', b);
        $$(ok ? '.st-ok' : '.st-sel', b).forEach(function (s) { s.hidden = false; });
        setTimeout(function () { b.classList.remove('is-done'); $$('.st', b).forEach(function (s) { s.hidden = !s.classList.contains('st-idle'); }); }, 2200);
        if (!ok) { var el = document.getElementById(b.getAttribute('aria-controls')); if (el) { var r = document.createRange(); r.selectNodeContents(el); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } }
        return tgt;
      }
      try { navigator.clipboard.writeText(v).then(function () { done(true); }, function () { done(false); }); }
      catch (e) { done(false); }
    });
  });

  var y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
})();
